#!/usr/bin/env python3
"""
Bluestock SaaS — Post-Import Verification
==========================================
Validates the imported data for completeness and integrity.

Usage:
    python scripts/verify_import.py
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    url = os.getenv('DATABASE_URL')
    if not url:
        print("ERROR: DATABASE_URL not set")
        sys.exit(1)
    return psycopg2.connect(url)


def verify():
    conn = get_connection()
    cursor = conn.cursor()
    
    print("=" * 55)
    print("  BLUESTOCK SaaS — Data Verification Report")
    print("=" * 55)
    
    # 1. Record counts
    print("\n📊 Record Counts:")
    tables = [
        ('countries', 'Countries'),
        ('states', 'States'),
        ('districts', 'Districts'),
        ('sub_districts', 'Sub-Districts'),
        ('villages', 'Villages'),
        ('users', 'Users'),
        ('api_keys', 'API Keys'),
    ]
    
    counts = {}
    for table, label in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        counts[table] = count
        status = "✓" if count > 0 or table in ('users', 'api_keys') else "✗"
        print(f"  {status} {label:20s} {count:>10,}")
    
    # 2. Hierarchy integrity — check for orphaned records
    print("\n🔗 Hierarchy Integrity:")
    
    checks = [
        ("States without Country", 
         "SELECT COUNT(*) FROM states s LEFT JOIN countries c ON s.\"countryId\" = c.id WHERE c.id IS NULL"),
        ("Districts without State", 
         "SELECT COUNT(*) FROM districts d LEFT JOIN states s ON d.\"stateId\" = s.id WHERE s.id IS NULL"),
        ("SubDistricts without District", 
         "SELECT COUNT(*) FROM sub_districts sd LEFT JOIN districts d ON sd.\"districtId\" = d.id WHERE d.id IS NULL"),
        ("Villages without SubDistrict", 
         "SELECT COUNT(*) FROM villages v LEFT JOIN sub_districts sd ON v.\"subDistrictId\" = sd.id WHERE sd.id IS NULL"),
    ]
    
    all_ok = True
    for label, query in checks:
        cursor.execute(query)
        orphans = cursor.fetchone()[0]
        status = "✓" if orphans == 0 else "✗"
        if orphans > 0:
            all_ok = False
        print(f"  {status} {label}: {orphans} orphaned records")
    
    # 3. Spot-check — Maharashtra hierarchy
    print("\n🔍 Spot Check (Maharashtra → Nandurbar → Akkalkuwa):")
    
    cursor.execute("""
        SELECT v.name, sd.name, d.name, s.name
        FROM villages v
        JOIN sub_districts sd ON v."subDistrictId" = sd.id
        JOIN districts d ON sd."districtId" = d.id
        JOIN states s ON d."stateId" = s.id
        WHERE LOWER(s.name) LIKE '%maharashtra%'
          AND LOWER(d.name) LIKE '%nandurbar%'
        LIMIT 5
    """)
    
    rows = cursor.fetchall()
    if rows:
        for village, subdist, district, state in rows:
            print(f"  ✓ {village}, {subdist}, {district}, {state}")
    else:
        print("  ⚠ No records found for Maharashtra/Nandurbar (may not be imported yet)")
    
    # 4. Top states by village count
    print("\n📈 Top 10 States by Village Count:")
    cursor.execute("""
        SELECT s.name, COUNT(v.id) as village_count
        FROM states s
        JOIN districts d ON d."stateId" = s.id
        JOIN sub_districts sd ON sd."districtId" = d.id
        JOIN villages v ON v."subDistrictId" = sd.id
        GROUP BY s.id, s.name
        ORDER BY village_count DESC
        LIMIT 10
    """)
    
    for name, count in cursor.fetchall():
        print(f"  {name:30s} {count:>8,} villages")
    
    # 5. Summary
    print("\n" + "=" * 55)
    total_geo = counts.get('countries', 0) + counts.get('states', 0) + counts.get('districts', 0) + counts.get('sub_districts', 0) + counts.get('villages', 0)
    print(f"  Total geographical records: {total_geo:,}")
    print(f"  Hierarchy integrity: {'PASS ✓' if all_ok else 'FAIL ✗'}")
    print("=" * 55)
    
    cursor.close()
    conn.close()


if __name__ == '__main__':
    verify()
