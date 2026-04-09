---
type: community
cohesion: 0.28
members: 9
---

# API & B2B Integration

**Cohesion:** 0.28 - loosely connected
**Members:** 9 nodes

## Members
- [[API Endpoints (search, states, autocomplete)]] - document - Phase_2.md
- [[Address Hierarchy (Country→State→District→SubDistrict→Village)]] - document - Project_Overview.md
- [[B2B Clients]] - document - Project_Overview.md
- [[B2B User Portal]] - document - Phase_2.md
- [[Demo Client Project]] - document - Phase_2.md
- [[Drop-Down Response Format]] - document - Phase_2.md
- [[Error Codes (400401403404429500)]] - document - Phase_2.md
- [[REST API for Village Data]] - document - Project_Overview.md
- [[SwaggerOpenAPI Documentation]] - document - Phase_2.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/API_&_B2B_Integration
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_User & API Key Management]]
- 1 edge to [[_COMMUNITY_Platform Infrastructure & Security]]
- 1 edge to [[_COMMUNITY_Geographical Data Schema]]

## Top bridge nodes
- [[API Endpoints (search, states, autocomplete)]] - degree 5, connects to 1 community
- [[REST API for Village Data]] - degree 4, connects to 1 community
- [[B2B User Portal]] - degree 4, connects to 1 community