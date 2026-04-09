---
type: community
cohesion: 0.22
members: 10
---

# Geographical Data Schema

**Cohesion:** 0.22 - loosely connected
**Members:** 10 nodes

## Members
- [[Country Table]] - document - Phase_1.md
- [[District Table]] - document - Phase_1.md
- [[State Access Management]] - document - Phase_2.md
- [[State Table]] - document - Phase_1.md
- [[SubDistrict Table]] - document - Phase_1.md
- [[Third Normal Form (3NF) Design]] - document - Phase_1.md
- [[Trigram Index (Village Name Search)]] - document - Phase_1.md
- [[UserStateAccess Table]] - document - Phase_1.md
- [[Village Master List (Data Browser)]] - document - Phase_2.md
- [[Village Table]] - document - Phase_1.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/Geographical_Data_Schema
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_User & API Key Management]]
- 1 edge to [[_COMMUNITY_Backend & Data Pipeline]]
- 1 edge to [[_COMMUNITY_API & B2B Integration]]

## Top bridge nodes
- [[Village Table]] - degree 6, connects to 2 communities
- [[UserStateAccess Table]] - degree 3, connects to 1 community
- [[Village Master List (Data Browser)]] - degree 2, connects to 1 community