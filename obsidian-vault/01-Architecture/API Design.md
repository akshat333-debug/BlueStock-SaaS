# API Design

## Summary
RESTful API with 6 core endpoints designed for drop-down menu integration. Dual authentication (API key header + optional secret for writes). Standardized response format with rate limit metadata in every response.

## Details

### Base URLs
- Production: `https://api.villageapi.com/v1/`
- Staging: `https://staging-api.villageapi.com/v1/`
- Local: `http://localhost:3000/v1/`

### Core Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search` | Search villages (q, state, district, subDistrict, limit) |
| GET | `/states` | List all states |
| GET | `/states/{id}/districts` | Districts by state |
| GET | `/districts/{id}/subdistricts` | Sub-districts by district |
| GET | `/subdistricts/{id}/villages` | Villages by sub-district (paged) |
| GET | `/autocomplete` | Typeahead suggestions (q, hierarchyLevel) |

### Response Format for Drop-Downs
The primary value — responses are structured for direct DOM insertion:
```json
{
  "value": "village_id_525002",
  "label": "Manibeli",
  "fullAddress": "Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India",
  "hierarchy": { "village": "...", "subDistrict": "...", "district": "...", "state": "...", "country": "India" }
}
```

### Authentication
- Header: `X-API-Key: ak_[32hex]`
- Header: `X-API-Secret: as_[32hex]` (write operations only)
- Secrets hashed with bcrypt, never stored plaintext

### Error Codes
| Code | Meaning |
|------|---------|
| 400 | Invalid query |
| 401 | Invalid API key |
| 403 | Access denied (unauthorized for state) |
| 404 | Resource not found |
| 429 | Rate limited — daily quota exceeded |
| 500 | Internal error |

## Connections
- [[System Architecture Overview]]
- [[Data Model & Hierarchy]]
- [[Auth Strategy — JWT + API Keys]]
- [[Rate Limiting Strategy]]
- [[B2B SaaS Model]]

## Source
- Graphify: Community 4 (API & B2B Integration)
- Phase_2.md §6.1–6.6 API Development Specifications
