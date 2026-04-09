# B2B SaaS Model

## Summary
Revenue model based on tiered API access. Clients self-register → admin approves → client generates API keys → client integrates and pays based on usage tier. Four plans from Free (5K/day) to Unlimited (1M/day, $499/mo).

## Details

### Subscription Tiers
| Plan | Price | Daily Requests | Burst/min | Target |
|------|-------|---------------|-----------|--------|
| Free | $0 | 5,000 | 100 | Dev/testing |
| Premium | $49/mo | 50,000 | 500 | Small business |
| Pro | $199/mo | 300,000 | 2,000 | Mid-enterprise |
| Unlimited | $499/mo | 1,000,000 | 5,000 | Large enterprise |

### Client Lifecycle
1. **Register** — business email required (no free providers), includes GST number
2. **Pending** — admin reviews and approves/rejects
3. **Active** — client generates API keys (up to 5), gets state-level access grants
4. **Usage** — rate limits enforced per-key, alerts at 80%/95%/100%
5. **Upgrade** — admin can manually upgrade or set custom limits

### State Access Control
Clients don't get all-India access by default:
- Free: single state
- Premium: up to 5 states
- Pro/Unlimited: all states
- Admin can grant by region (North/South/East/West) or individually

## Connections
- [[API Design]]
- [[Rate Limiting Strategy]]
- [[Auth Strategy — JWT + API Keys]]
- [[System Architecture Overview]]

## Source
- Graphify: Community 4 (API & B2B Integration)
- Phase_2.md §9.1–9.4, §11.1–11.3
