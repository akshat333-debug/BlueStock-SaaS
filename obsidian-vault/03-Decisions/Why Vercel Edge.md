# Why Vercel Edge

## Summary
Chosen for automatic deployments, edge network with global CDN, and native serverless function support that aligns with the Node.js + Prisma backend. Enables preview deployments per PR and staging environments without additional infra.

## Details

### Why Vercel (over AWS/Railway/Render)
- **Edge network** — serverless functions run close to users, critical for sub-100ms API target
- **Auto-deploy pipeline** — PR → preview URL, develop → staging, main → production
- **Native React hosting** — first-class Vite/React support for the three SPAs
- **Zero config** — `vercel.json` handles routing, no Nginx/Docker needed

### Deployment Environments
| Environment | URL | Trigger |
|-------------|-----|---------|
| Preview | `{pr-number}.vercel.app` | PR creation |
| Staging | `staging.villageapi.com` | Merge to develop |
| Production | `api.villageapi.com` | Merge to main |

### Project Structure for Vercel
```
project-root/
├── api/              # Serverless functions (backend)
├── frontend/         # React dashboard (frontend)
├── prisma/           # Database schema
└── vercel.json       # Deployment configuration
```

### Trade-offs
- Vendor lock-in to Vercel's serverless model
- Function timeout limits (may affect large data import operations — handled via separate Python scripts)

## Connections
- [[System Architecture Overview]]
- [[Why NeonDB PostgreSQL]]
- [[Frontend Architecture]]

## Source
- Graphify: Community 0 (Platform Infrastructure & Security)
- Phase_2.md §12.1–12.3 Deployment Strategy
