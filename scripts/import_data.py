#!/usr/bin/env python3
"""
Bluestock SaaS — MDDS Data Import Pipeline
==========================================
Imports village-level geographical data from MDDS Excel files into NeonDB PostgreSQL.

Usage:
    python scripts/import_data.py                  # Import all states
    python scripts/import_data.py --state "MAHARASHTRA"  # Import single state
    python scripts/import_data.py --dry-run        # Validate without importing

Requires: DATABASE_URL in .env
"""

import os
import sys
import glob
import time
import argparse
import logging
from pathlib import Path

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)
log = logging.getLogger(__name__)

# ============================================
# DATABASE CONNECTION
# ============================================

def get_connection():
    """Create PostgreSQL connection from DATABASE_URL."""
    url = os.getenv('DATABASE_URL')
    if not url:
        log.error("DATABASE_URL not set. Copy .env.example to .env and fill in your NeonDB URL.")
        sys.exit(1)
    
    try:
        conn = psycopg2.connect(url)
        conn.autocommit = False
        log.info("Connected to database")
        return conn
    except Exception as e:
        log.error(f"Database connection failed: {e}")
        sys.exit(1)


# ============================================
# DATA READING
# ============================================

def read_excel_file(filepath):
    """Read an MDDS Excel file and normalize column names."""
    ext = Path(filepath).suffix.lower()
    
    try:
        if ext == '.ods':
            df = pd.read_excel(filepath, engine='odf')
        elif ext == '.xls':
            df = pd.read_excel(filepath, engine='xlrd')
        else:
            df = pd.read_excel(filepath, engine='openpyxl')
    except Exception as e:
        log.error(f"Failed to read {filepath}: {e}")
        return None
    
    # Normalize column names — handle various MDDS formats
    col_mapping = {}
    for col in df.columns:
        col_lower = str(col).strip().lower().replace(' ', '_').replace('-', '_')
        
        if 'stc' in col_lower or col_lower == 'mdds_stc':
            col_mapping[col] = 'state_code'
        elif 'state' in col_lower and 'name' in col_lower:
            col_mapping[col] = 'state_name'
        elif 'dtc' in col_lower or col_lower == 'mdds_dtc':
            col_mapping[col] = 'district_code'
        elif 'sub_dt' in col_lower or 'sub_dist' in col_lower or 'subdistrict' in col_lower:
            if 'name' in col_lower:
                col_mapping[col] = 'subdistrict_name'
            else:
                col_mapping[col] = 'subdistrict_code'
        elif 'district' in col_lower and 'name' in col_lower:
            col_mapping[col] = 'district_name'
        elif 'plcn' in col_lower or col_lower == 'mdds_plcn':
            col_mapping[col] = 'village_code'
        elif 'area' in col_lower and 'name' in col_lower:
            col_mapping[col] = 'village_name'
    
    df = df.rename(columns=col_mapping)
    
    # Validate required columns exist
    required = ['state_code', 'state_name', 'district_code', 'district_name', 
                'subdistrict_code', 'subdistrict_name', 'village_code', 'village_name']
    
    missing = [c for c in required if c not in df.columns]
    if missing:
        log.warning(f"Missing columns in {filepath}: {missing}")
        log.info(f"Available columns: {list(df.columns)}")
        return None
    
    # Clean data
    for col in required:
        df[col] = df[col].astype(str).str.strip()
    
    # Remove rows where village_name is empty/nan
    df = df[df['village_name'].notna() & (df['village_name'] != '') & (df['village_name'] != 'nan')]
    
    return df


# ============================================
# IMPORT LOGIC
# ============================================

def ensure_country(cursor):
    """Create India record if not exists. Returns country_id."""
    cursor.execute("""
        INSERT INTO countries (name, code, "createdAt", "updatedAt")
        VALUES ('India', 'IN', NOW(), NOW())
        ON CONFLICT (code) DO UPDATE SET "updatedAt" = NOW()
        RETURNING id
    """)
    return cursor.fetchone()[0]


def upsert_state(cursor, country_id, code, name):
    """Upsert state and return its id."""
    cursor.execute("""
        INSERT INTO states (code, name, "countryId", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, NOW(), NOW())
        ON CONFLICT (code, "countryId") DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()
        RETURNING id
    """, (code, name, country_id))
    return cursor.fetchone()[0]


def upsert_district(cursor, state_id, code, name):
    """Upsert district and return its id."""
    cursor.execute("""
        INSERT INTO districts (code, name, "stateId", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, NOW(), NOW())
        ON CONFLICT (code, "stateId") DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()
        RETURNING id
    """, (code, name, state_id))
    return cursor.fetchone()[0]


def upsert_subdistrict(cursor, district_id, code, name):
    """Upsert sub-district and return its id."""
    cursor.execute("""
        INSERT INTO sub_districts (code, name, "districtId", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, NOW(), NOW())
        ON CONFLICT (code, "districtId") DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()
        RETURNING id
    """, (code, name, district_id))
    return cursor.fetchone()[0]


def batch_insert_villages(cursor, villages, batch_size=5000):
    """Batch upsert villages for performance."""
    if not villages:
        return 0
    
    inserted = 0
    for i in range(0, len(villages), batch_size):
        batch = villages[i:i + batch_size]
        
        # Deduplicate within batch by subDistrictId and code
        seen = set()
        deduped = []
        for v in batch:
            k = (v['subdistrict_id'], v['code'])
            if k not in seen:
                seen.add(k)
                deduped.append(v)
        
        execute_values(cursor, """
            INSERT INTO villages (code, name, "subDistrictId", "createdAt", "updatedAt")
            VALUES %s
            ON CONFLICT (code, "subDistrictId") DO UPDATE SET name = EXCLUDED.name, "updatedAt" = NOW()
        """, [(v['code'], v['name'], v['subdistrict_id']) for v in deduped],
        template="(%s, %s, %s, NOW(), NOW())")
        
        inserted += len(batch)
    
    return inserted


def import_file(conn, filepath, country_id, dry_run=False):
    """Import a single MDDS Excel file. Returns stats dict."""
    filename = Path(filepath).name
    log.info(f"Processing: {filename}")
    
    df = read_excel_file(filepath)
    if df is None:
        return {'file': filename, 'status': 'SKIPPED', 'reason': 'Failed to read or missing columns'}
    
    stats = {
        'file': filename,
        'total_rows': len(df),
        'states': 0, 'districts': 0, 'subdistricts': 0, 'villages': 0,
        'errors': 0, 'status': 'OK'
    }
    
    if dry_run:
        stats['status'] = 'DRY_RUN'
        log.info(f"  [DRY RUN] {len(df)} rows, state: {df['state_name'].iloc[0] if len(df) > 0 else 'N/A'}")
        return stats
    
    cursor = conn.cursor()
    
    try:
        # Cache for deduplication within file
        state_cache = {}    # {code: id}
        district_cache = {} # {(state_id, code): id}
        subdist_cache = {}  # {(district_id, code): id}
        village_buffer = [] # Batch insert buffer
        
        for idx, row in df.iterrows():
            try:
                # State
                state_code = str(row['state_code']).strip()
                state_name = str(row['state_name']).strip().title()
                
                if state_code not in state_cache:
                    state_id = upsert_state(cursor, country_id, state_code, state_name)
                    state_cache[state_code] = state_id
                    stats['states'] += 1
                state_id = state_cache[state_code]
                
                # District
                dist_code = str(row['district_code']).strip()
                dist_name = str(row['district_name']).strip().title()
                dist_key = (state_id, dist_code)
                
                if dist_key not in district_cache:
                    dist_id = upsert_district(cursor, state_id, dist_code, dist_name)
                    district_cache[dist_key] = dist_id
                    stats['districts'] += 1
                dist_id = district_cache[dist_key]
                
                # SubDistrict
                subdist_code = str(row['subdistrict_code']).strip()
                subdist_name = str(row['subdistrict_name']).strip().title()
                subdist_key = (dist_id, subdist_code)
                
                if subdist_key not in subdist_cache:
                    subdist_id = upsert_subdistrict(cursor, dist_id, subdist_code, subdist_name)
                    subdist_cache[subdist_key] = subdist_id
                    stats['subdistricts'] += 1
                subdist_id = subdist_cache[subdist_key]
                
                # Village — buffer for batch insert
                village_code = str(row['village_code']).strip()
                village_name = str(row['village_name']).strip()
                
                if village_name and village_name != 'nan':
                    village_buffer.append({
                        'code': village_code,
                        'name': village_name,
                        'subdistrict_id': subdist_id,
                    })
                
                # Flush batch every 5000
                if len(village_buffer) >= 5000:
                    inserted = batch_insert_villages(cursor, village_buffer)
                    stats['villages'] += inserted
                    village_buffer = []
                    
            except Exception as e:
                stats['errors'] += 1
                if stats['errors'] <= 5:
                    log.warning(f"  Row {idx} error: {e}")
        
        # Flush remaining villages
        if village_buffer:
            inserted = batch_insert_villages(cursor, village_buffer)
            stats['villages'] += inserted
        
        conn.commit()
        log.info(f"  ✓ {stats['villages']} villages, {stats['districts']} districts, {stats['subdistricts']} sub-districts ({stats['errors']} errors)")
        
    except Exception as e:
        conn.rollback()
        stats['status'] = 'FAILED'
        stats['reason'] = str(e)
        log.error(f"  ✗ Failed: {e}")
    
    finally:
        cursor.close()
    
    return stats


# ============================================
# MAIN
# ============================================

def main():
    parser = argparse.ArgumentParser(description='Import MDDS village data into PostgreSQL')
    parser.add_argument('--state', type=str, help='Import only this state (filename contains this string)')
    parser.add_argument('--dry-run', action='store_true', help='Validate files without importing')
    parser.add_argument('--dataset-dir', type=str, default='dataset', help='Path to dataset directory')
    args = parser.parse_args()
    
    dataset_dir = Path(args.dataset_dir)
    if not dataset_dir.exists():
        log.error(f"Dataset directory not found: {dataset_dir}")
        sys.exit(1)
    
    # Find all Excel files
    files = sorted(glob.glob(str(dataset_dir / 'Rdir_*')))
    if not files:
        log.error(f"No MDDS files found in {dataset_dir}")
        sys.exit(1)
    
    # Filter by state if specified
    if args.state:
        files = [f for f in files if args.state.upper() in Path(f).name.upper()]
        if not files:
            log.error(f"No files found matching state: {args.state}")
            sys.exit(1)
    
    log.info(f"Found {len(files)} file(s) to import")
    
    # Connect
    conn = get_connection()
    cursor = conn.cursor()
    
    # Ensure country exists
    country_id = ensure_country(cursor)
    conn.commit()
    cursor.close()
    log.info(f"Country: India (id={country_id})")
    
    # Import each file
    start_time = time.time()
    all_stats = []
    
    for filepath in files:
        stats = import_file(conn, filepath, country_id, dry_run=args.dry_run)
        all_stats.append(stats)
    
    elapsed = time.time() - start_time
    
    # Summary
    total_villages = sum(s.get('villages', 0) for s in all_stats)
    total_errors = sum(s.get('errors', 0) for s in all_stats)
    failed = [s for s in all_stats if s.get('status') == 'FAILED']
    
    log.info("=" * 50)
    log.info(f"IMPORT COMPLETE in {elapsed:.1f}s")
    log.info(f"  Files processed: {len(all_stats)}")
    log.info(f"  Total villages:  {total_villages:,}")
    log.info(f"  Total errors:    {total_errors}")
    log.info(f"  Failed files:    {len(failed)}")
    
    if failed:
        log.warning("Failed files:")
        for s in failed:
            log.warning(f"  - {s['file']}: {s.get('reason', 'Unknown')}")
    
    conn.close()


if __name__ == '__main__':
    main()
