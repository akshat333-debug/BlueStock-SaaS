# System Architecture Overview

## Summary
Three-tier architecture: Client Layer (React SPAs) → API Gateway (Vercel Edge + Node.js serverless) → Data Layer (NeonDB PostgreSQL + Upstash Redis). Designed for sub-100ms responses at 1M+ daily requests.

## Details

### Client Layer
Three separate React SPAs serving different user personas:
- **Admin Dashboard** — user management, analytics, data browser
- **B2B Portal** — self-registration, API key management, usage monitoring
- **Demo Client** — contact form showcasing API integration for sales

### API Gateway Layer
Runs on [[Vercel Edge Deployment]] as serverless functions:
- Rate limiting via [[Redis Caching (Upstash)]] — distributed across edge regions
- JWT validation for dashboard access
- API key + secret validation for programmatic access
- CORS handling
- Routes: `/api/v1/*`, `/api/admin/*`, `/api/b2b/*`, `/api/auth/*`

### Data Layer
- **Primary Store**: [[NeonDB PostgreSQL]] — serverless PostgreSQL with automatic scaling
- **Cache**: [[Redis Caching (Upstash)]] — API keys, rate limits, session data, query cache
- **ORM**: [[Prisma ORM]] — type-safe queries, schema migrations

### Request Flow
1. Client sends request with `X-API-Key` header
2. Edge gateway validates key format
3. Rate limiter checks Redis for daily usage
4. Auth middleware validates key + secret
5. Handler executes DB query (cached if available)
6. Response formatted with standardized address
7. API log async-recorded
8. Response returned

## Connections
- [[Data Model & Hierarchy]]
- [[API Design]]
- [[Auth Strategy — JWT + API Keys]]
- [[Why Vercel Edge]]
- [[Rate Limiting Strategy]]

## Source
- Graphify: Community 0 (Platform Infrastructure & Security)
- Phase_1.md §3.2 System Architecture Diagram
- Phase_1.md §3.3 Data Flow Patterns
