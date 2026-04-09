# Data Import Pipeline

## Summary
Python-based ETL pipeline that ingests MDDS Excel files (30 state-level files, ~600K village records) into NeonDB PostgreSQL. Uses incremental insertion with deduplication, batch processing, and error logging.

## Details

### Source Data
30 Excel files in `dataset/` directory — one per Indian state/UT. Each contains columns:
- MDDS STC (state code), STATE NAME
- MDDS DTC (district code), DISTRICT NAME
- MDDS Sub_DT (sub-district code), SUB-DISTRICT NAME
- MDDS PLCN (village code), Area Name

### Pipeline Phases
1. **Environment Setup** — NeonDB instance, Python deps (pandas, psycopg2, openpyxl)
2. **Validation** — verify headers, check nulls, find duplicates, validate code formats
3. **Incremental Import** — upsert hierarchy top-down:
   - Country (India) → States (dedupe by code) → Districts → SubDistricts → Villages (batch 5,000)
4. **Verification** — count queries, spot-check random villages, verify no orphans

### Error Handling
- Log failed rows with reason codes
- Continue on non-fatal errors
- Generate summary report
- Manual review queue for ambiguous records

### Data Volume
~600K total rows: 36 states, 700+ districts, 6,000+ sub-districts, 600,000+ villages

## Connections
- [[Data Model & Hierarchy]]
- [[Address Hierarchy]]
- [[Why NeonDB PostgreSQL]]

## Source
- Graphify: Community 3 (Backend & Data Pipeline) — god node: Data Import Pipeline (4 edges)
- Phase_1.md §5.1–5.4
