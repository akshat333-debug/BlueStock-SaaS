---
type: community
cohesion: 0.20
members: 11
---

# User & API Key Management

**Cohesion:** 0.20 - loosely connected
**Members:** 11 nodes

## Members
- [[API Key Format (ak_as_ prefix)]] - document - Phase_2.md
- [[API Key Management (CreateRevokeRotate)]] - document - Phase_2.md
- [[API Logs Viewer]] - document - Phase_2.md
- [[Admin Dashboard Analytics]] - document - Phase_2.md
- [[Admin Panel]] - document - Project_Overview.md
- [[ApiKey Table]] - document - Phase_1.md
- [[ApiLog Table]] - document - Phase_1.md
- [[Self-Registration Process]] - document - Phase_2.md
- [[User Approval Workflow]] - document - Phase_2.md
- [[User Management Features]] - document - Phase_2.md
- [[User Table]] - document - Phase_1.md

## Live Query (requires Dataview plugin)

```dataview
TABLE source_file, type FROM #community/User_&_API_Key_Management
SORT file.name ASC
```

## Connections to other communities
- 2 edges to [[_COMMUNITY_Geographical Data Schema]]
- 2 edges to [[_COMMUNITY_API & B2B Integration]]
- 1 edge to [[_COMMUNITY_Frontend Tech Stack]]

## Top bridge nodes
- [[Admin Dashboard Analytics]] - degree 4, connects to 2 communities
- [[User Table]] - degree 3, connects to 1 community
- [[Self-Registration Process]] - degree 2, connects to 1 community
- [[API Key Management (CreateRevokeRotate)]] - degree 2, connects to 1 community