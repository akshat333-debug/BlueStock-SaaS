# Bluestock SaaS — All India Villages API

> A production-grade SaaS platform providing a comprehensive REST API for India's complete village-level geographical data. Built for B2B clients who need reliable, standardized address data for drop-down menus and form autocomplete.

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Admin Panel   │  │ B2B Portal   │  │ Demo Client  │      │
│  │ :5173         │  │ :5174        │  │ :5175        │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼─────────────────┼─────────────────┼──────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌────────────────────────────────────────────────────────────┐
│               EXPRESS API GATEWAY (:3000)                   │
│  • JWT Auth    • API Key+Secret   • Rate Limiting (Redis)  │
│  • requestId   • Burst Limiter    • Helmet Security        │
│  • API Logger  • CORS             • Swagger Docs           │
├────────────────────────────────────────────────────────────┤
│            /api/v1/*    /api/auth/*    /api-docs            │
└────────────────────────────────────────────────────────────┘
          │                         │
          ▼                         ▼
┌───────────────────┐    ┌───────────────────┐
│  NeonDB PostgreSQL │    │  Upstash Redis    │
│  • 9 tables (3NF)  │    │  • Rate limits    │
│  • 570k+ villages  │    │  • Key cache      │
│  • pg_trgm index   │    │  • Session data   │
└───────────────────┘    └───────────────────┘
```

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express 5 |
| Database | PostgreSQL 17 (NeonDB) |
| ORM | Prisma 5 |
| Cache | Upstash Redis via ioredis |
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS v4, Lucide Icons |
| Charts | Recharts (6 chart types) |
| State | Zustand + React Query |
| Auth | JWT (24h) + bcrypt API secrets |
| Docs | Swagger/OpenAPI 3.0 |
| CI/CD | GitHub Actions |
| Data Pipeline | Python 3 (pandas, psycopg2) |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | B2B self-registration |
| `POST` | `/api/auth/login` | JWT login (24h token) |
| `GET` | `/api/auth/me` | Current user profile |

### Geography (requires `X-API-Key`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/states` | List all states/UTs |
| `GET` | `/api/v1/states/:id/districts` | Districts by state |
| `GET` | `/api/v1/districts/:id/subdistricts` | Sub-districts by district |
| `GET` | `/api/v1/subdistricts/:id/villages` | Villages by sub-district |

### Search (requires `X-API-Key`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/search` | Full-text village search |
| `GET` | `/api/v1/autocomplete` | Typeahead suggestions |

### API Key Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/keys` | List keys |
| `POST` | `/api/v1/keys` | Generate key pair |
| `PATCH` | `/api/v1/keys/:id/revoke` | Revoke a key |
| `POST` | `/api/v1/keys/:id/regenerate` | Regenerate secret |

## Response Format

```json
{
  "success": true,
  "count": 25,
  "data": [...],
  "meta": {
    "requestId": "req_a1b2c3d4e5f67890",
    "responseTime": 47,
    "rateLimit": {
      "remaining": 4850,
      "limit": 5000,
      "reset": "2024-01-15T23:59:59.999Z"
    }
  }
}
```

## Rate Limits

| Plan | Daily | Burst/min | Price |
|------|-------|-----------|-------|
| Free | 5,000 | 100 | $0 |
| Premium | 50,000 | 500 | $49/mo |
| Pro | 300,000 | 2,000 | $199/mo |
| Unlimited | 1,000,000 | 5,000 | $499/mo |

## Security

- **Helmet** security headers on all responses
- **bcrypt** hashed API secrets (never stored plaintext)
- **JWT** authentication with 24-hour expiry
- **Per-key rate limiting** via Redis (daily + burst)
- **State access control** per user subscription plan
- **CORS** restricted to allowed origins in production

## Data Coverage

- **36** States and Union Territories
- **700+** Districts
- **6,000+** Sub-Districts
- **570,385** Villages
- Source: Government of India MDDS database

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or NeonDB account)
- Redis (or Upstash account)

### Setup

```bash
# 1. Clone and install
git clone https://github.com/akshat333-debug/BlueStock-SaaS.git
cd BlueStock-SaaS
npm install

# 2. Configure environment
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, JWT_SECRET

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run database migrations
npm run prisma:migrate

# 5. Import village data (optional — requires dataset files)
python3 scripts/import_data.py
```

### Development

```bash
# Terminal 1: Backend API (Port 3000)
npm run dev

# Terminal 2: Admin Dashboard (Port 5173)
cd admin-dashboard && npm run dev

# Terminal 3: B2B Developer Portal (Port 5174)
cd b2b-portal && npm run dev

# Terminal 4: Demo Client App (Port 5175)
cd demo-client && npm run dev
```

### Testing

```bash
npm test          # Run all backend tests
```

### API Documentation

Once the server is running, visit:
- **Swagger UI**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/api/health

## Project Structure

```
├── api/                     # Express.js backend
│   ├── config/              # Database & Redis config
│   ├── docs/                # Swagger YAML
│   ├── middleware/           # Auth, rate limiter, logger
│   ├── routes/              # API route handlers
│   │   ├── auth.js          # JWT register/login
│   │   ├── keys.js          # API key CRUD
│   │   └── v1/              # Geography & search routes
│   └── utils/               # Response formatter
├── admin-dashboard/         # React admin panel
├── b2b-portal/              # React developer portal
├── demo-client/             # Contact form demo app
├── prisma/                  # Database schema & migrations
├── scripts/                 # Python data import
├── .github/workflows/       # CI/CD pipeline
└── vercel.json              # Deployment config
```

## Contributing

See `AGENTS.md` for architectural boundaries and the GSD operational framework.

## License

Proprietary — Bluestock Fintech © 2024
