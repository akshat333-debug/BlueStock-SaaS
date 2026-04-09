# Frontend Architecture

## Summary
React 18+ with TypeScript, built on Vite. Uses Tailwind CSS for styling, Zustand for lightweight state, React Query for data fetching with caching, and Recharts for all dashboard visualizations.

## Details

### Stack
| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 18+ TypeScript | Type safety, ecosystem |
| Build | Vite | Faster than CRA |
| Styling | Tailwind CSS | Utility-first, rapid prototyping |
| State | Zustand | Lightweight Redux alternative |
| Data fetching | React Query | Built-in caching, optimistic updates |
| Charts | Recharts | React-native, declarative |

### Three SPAs
1. **Admin Dashboard** — sidebar nav, data tables (sortable/filterable/exportable), 6 chart types (bar/line/pie/area/stacked/heatmap), user management CRUD
2. **B2B Portal** — self-registration, API key management, usage charts, Swagger docs
3. **Demo Client** — simple contact form with village autocomplete showcasing the API

### Performance Targets
- Initial load: < 2 seconds
- Chart rendering: < 500ms
- Table pagination: < 300ms
- Optimistic UI updates for all actions

## Connections
- [[System Architecture Overview]]
- [[API Design]]
- [[B2B SaaS Model]]

## Source
- Graphify: Community 5 (Frontend Tech Stack) — highest cohesion (0.29)
- Phase_2.md §7.1–7.3 Frontend Dashboard Requirements
