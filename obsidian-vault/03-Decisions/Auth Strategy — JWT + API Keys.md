# Auth Strategy — JWT + API Keys

## Summary
Dual authentication design: JWT tokens (24h expiry) for human dashboard access, API key + secret pairs for programmatic B2B access. Secrets bcrypt-hashed, never stored plaintext. Each user can have up to 5 active keys.

## Details

### Three Authentication Layers
| Layer | Method | Purpose |
|-------|--------|---------|
| User Login | JWT (24h expiry) | Dashboard access |
| API Access | API Key + Secret | Programmatic access |
| Admin Actions | JWT + 2FA (optional) | Sensitive operations |

### API Key Design
- Format: `ak_[32 hex chars]` (key) + `as_[32 hex chars]` (secret)
- Secret shown ONLY once at creation (with warning)
- Bcrypt hashed in DB — no plaintext secret recovery
- Keys can have expiration dates
- Instant revocation capability

### Why Dual Auth (not just JWT or just API keys)
- **JWT alone** — expires, needs refresh flow, impractical for server-to-server calls
- **API keys alone** — no session management for dashboard UIs
- **Both** — JWT for interactive sessions, API keys for integration. Clean separation.

### Security Headers (all responses)
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

## Connections
- [[System Architecture Overview]]
- [[API Design]]
- [[Rate Limiting Strategy]]
- [[B2B SaaS Model]]

## Source
- Graphify: Hyperedge "Authentication & Security Pipeline" (5 nodes, 0.90 confidence)
- Phase_2.md §10.1–10.4
