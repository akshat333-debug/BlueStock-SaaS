# Rate Limiting Strategy

## Summary
Per-API-key daily limits enforced via Redis, with burst rate per minute. Tiered by subscription plan. Automated alerting at 80%/95%/100% thresholds. Rate limit metadata included in every API response header.

## Details

### Per-Key Limits
| Plan | Daily Requests | Burst/minute |
|------|---------------|--------------|
| Free | 5,000 | 100 |
| Premium | 50,000 | 500 |
| Pro | 300,000 | 2,000 |
| Unlimited | 1,000,000 | 5,000 |

### Implementation
- `express-rate-limit` middleware + Redis backend (Upstash)
- Distributed across Vercel edge regions via shared Redis state
- Rate limit headers in every response:
  ```
  X-RateLimit-Limit: 5000
  X-RateLimit-Remaining: 4850
  X-RateLimit-Reset: 1705276800
  ```

### Alerting System
- **80%** — email notification to user
- **95%** — email + dashboard banner
- **100%** — email + temporary block (HTTP 429)
- **Admin alerts** — unusual usage patterns, approaching system capacity

### Admin Overrides
- Manual upgrade/downgrade any user
- Temporary limit increases (e.g., holiday season)
- Custom limits for enterprise clients
- Auto-suspend configurable

## Connections
- [[Auth Strategy — JWT + API Keys]]
- [[B2B SaaS Model]]
- [[API Design]]
- [[System Architecture Overview]]

## Source
- Graphify: Bridge between Community 0 (Infrastructure) and Community 4 (API)
- Phase_2.md §11.1–11.3
