# Why NeonDB PostgreSQL

## Summary
Chosen for serverless PostgreSQL with automatic scaling, trigram extension support for village name search, and strong foreign key enforcement needed for the 5-level geographical hierarchy.

## Details

### Why PostgreSQL (over MySQL/MongoDB)
- **Trigram indexing** (`pg_trgm`) — critical for fuzzy village name search across 600K records
- **Strong FK constraints** — enforces hierarchical integrity (Country → State → District → SubDistrict → Village)
- **3NF normalization** — PostgreSQL's query planner handles complex multi-join queries efficiently
- **JSON support** — future flexibility for metadata without schema migration

### Why NeonDB (over Supabase/RDS)
- **Serverless** — scales to zero during low traffic, auto-scales during spikes
- **Vercel integration** — native edge function support, same deployment platform
- **Branching** — database branching for staging/preview environments
- **Cost** — generous free tier for development, predictable pricing for production

### Trade-offs Accepted
- Cold start latency (~200ms) on first query after idle — mitigated by Redis cache warmup
- Less control than self-hosted — acceptable for SaaS scale

## Connections
- [[Data Model & Hierarchy]]
- [[System Architecture Overview]]
- [[Data Import Pipeline]]
- [[Why Vercel Edge]]

## Source
- Graphify: God node — NeonDB PostgreSQL (6 edges, bridges Community 0 ↔ Community 3)
- Phase_1.md §3.1 Technology Stack Decision Matrix
