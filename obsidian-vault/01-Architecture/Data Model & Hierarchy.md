# Data Model & Hierarchy

## Summary
Third Normal Form (3NF) database design with 8 core tables following a strict geographical hierarchy: Country → State → District → SubDistrict → Village. Supports ~600K village records with sub-100ms query performance via trigram indexing.

## Details

### Geographical Hierarchy (5 tables)
```
Country (India)
  └── State (36 including UTs)
       └── District (700+)
            └── SubDistrict (6,000+)
                 └── Village (600,000+)
```

Each level links to its parent via foreign key. The [[Country Table]] enables future international expansion.

### User & Access Tables (4 tables)
- **User** — B2B client accounts (email, planType)
- **ApiKey** — credentials (key, secretHash) → FK to User
- **UserStateAccess** — granular state-level access control → FK to User + State
- **ApiLog** — usage tracking (endpoint, responseTime) → FK to ApiKey + User

### Indexing Strategy
| Table | Indexed Column | Purpose |
|-------|---------------|---------|
| Village | name (trigram) | Fast text search for autocomplete |
| Village | subDistrictId | Hierarchical queries |
| SubDistrict | districtId | Join performance |
| District | stateId | Join performance |
| ApiLog | createdAt, userId | Time-series analytics |
| ApiKey | key | Authentication lookups |

### Key Design Principle
The [[Trigram Index (Village Name Search)]] on `Village.name` is critical — it powers the autocomplete endpoint that is the primary value prop for B2B clients.

## Connections
- [[System Architecture Overview]]
- [[Address Hierarchy]]
- [[Data Import Pipeline]]
- [[API Design]]
- [[Why NeonDB PostgreSQL]]

## Source
- Graphify: Community 2 (Geographical Data Schema) — highest betweenness: Village Table (0.461)
- Phase_1.md §4.1–4.5 Database Design
