# Graph Report - .  (2026-04-09)

## Corpus Check
- Corpus is ~2,703 words - fits in a single context window. You may not need a graph.

## Summary
- 61 nodes · 70 edges · 6 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Bluestock SaaS Platform` - 7 edges
2. `NeonDB PostgreSQL` - 6 edges
3. `Village Table` - 6 edges
4. `API Endpoints (/search, /states, /autocomplete)` - 5 edges
5. `REST API for Village Data` - 4 edges
6. `Data Import Pipeline (Python)` - 4 edges
7. `Admin Dashboard Analytics` - 4 edges
8. `B2B User Portal` - 4 edges
9. `React 18+ with TypeScript Frontend` - 4 edges
10. `Redis Caching (Upstash)` - 3 edges

## Surprising Connections (you probably didn't know these)
- `SQL & Database Design Skill` --conceptually_related_to--> `NeonDB PostgreSQL`  [INFERRED]
  project_objectives.md → Project_Overview.md
- `API Endpoints (/search, /states, /autocomplete)` --references--> `Village Table`  [INFERRED]
  Phase_2.md → Phase_1.md
- `Capstone Project - All India Villages API` --references--> `Bluestock SaaS Platform`  [EXTRACTED]
  project_objectives.md → Project_Overview.md
- `Admin Panel` --conceptually_related_to--> `User Management Features`  [INFERRED]
  Project_Overview.md → Phase_2.md
- `Security Headers` --conceptually_related_to--> `JWT Authentication`  [INFERRED]
  Phase_2.md → Project_Overview.md

## Hyperedges (group relationships)
- **Geographical Data Hierarchy** — phase1_country_table, phase1_state_table, phase1_district_table, phase1_subdistrict_table, phase1_village_table [EXTRACTED 1.00]
- **Authentication & Security Pipeline** — project_overview_jwt_auth, phase2_api_key_format, phase2_security_headers, phase1_rate_limiting, phase2_rate_limit_tiers [EXTRACTED 0.90]
- **Admin Management Suite** — phase2_admin_dashboard, phase2_user_management, phase2_state_access_mgmt, phase2_village_browser, phase2_api_logs_viewer [EXTRACTED 0.85]

## Communities

### Community 0 - "Platform Infrastructure & Security"
Cohesion: 0.14
Nodes (15): Capstone Project - All India Villages API, Skill Mastery Phase, API Gateway Layer, Client Layer (Admin/B2B/Demo SPAs), Rate Limiting (express-rate-limit + Redis), Serverless Functions (Node.js), Rate Limiting Tiers (5K/50K/300K/1M), Security Headers (+7 more)

### Community 1 - "User & API Key Management"
Cohesion: 0.2
Nodes (11): ApiKey Table, ApiLog Table, User Table, Admin Dashboard Analytics, API Key Format (ak_/as_ prefix), API Logs Viewer, User Approval Workflow, API Key Management (Create/Revoke/Rotate) (+3 more)

### Community 2 - "Geographical Data Schema"
Cohesion: 0.22
Nodes (10): Third Normal Form (3NF) Design, Country Table, District Table, State Table, SubDistrict Table, Trigram Index (Village Name Search), UserStateAccess Table, Village Table (+2 more)

### Community 3 - "Backend & Data Pipeline"
Cohesion: 0.22
Nodes (9): API Development Skill (Node.js), Data Cleaning & Processing (Python), SQL & Database Design Skill, Data Import Pipeline (Python), MDDS Dataset (Ministry Source), Node.js + Express.js Backend, Prisma ORM, Prisma Migration Strategy (+1 more)

### Community 4 - "API & B2B Integration"
Cohesion: 0.28
Nodes (9): API Endpoints (/search, /states, /autocomplete), B2B User Portal, Demo Client Project, Drop-Down Response Format, Error Codes (400/401/403/404/429/500), Swagger/OpenAPI Documentation, Address Hierarchy (Country→State→District→SubDistrict→Village), B2B Clients (+1 more)

### Community 5 - "Frontend Tech Stack"
Cohesion: 0.29
Nodes (7): React.js Frontend Skill, React.js + Vite Frontend, Recharts Charting Library, React Query Data Fetching, React 18+ with TypeScript Frontend, Tailwind CSS Styling, Zustand State Management

## Knowledge Gaps
- **17 isolated node(s):** `Skill Mastery Phase`, `SQL & Database Design Skill`, `API Development Skill (Node.js)`, `React.js Frontend Skill`, `Data Cleaning & Processing (Python)` (+12 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Village Table` connect `Geographical Data Schema` to `Backend & Data Pipeline`, `API & B2B Integration`?**
  _High betweenness centrality (0.461) - this node is a cross-community bridge._
- **Why does `Bluestock SaaS Platform` connect `Platform Infrastructure & Security` to `Backend & Data Pipeline`, `API & B2B Integration`?**
  _High betweenness centrality (0.372) - this node is a cross-community bridge._
- **Why does `NeonDB PostgreSQL` connect `Backend & Data Pipeline` to `Platform Infrastructure & Security`?**
  _High betweenness centrality (0.321) - this node is a cross-community bridge._
- **What connects `Skill Mastery Phase`, `SQL & Database Design Skill`, `API Development Skill (Node.js)` to the rest of the system?**
  _17 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Platform Infrastructure & Security` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._