# Address Hierarchy

## Summary
The core data abstraction of the platform. India's geographical data is organized in a strict 5-level hierarchy: Country → State (36) → District (700+) → SubDistrict (6,000+) → Village (600,000+). Every API response returns the complete chain as a standardized address string.

## Details

### Standardized Format
Every village resolves to: `{Village}, {SubDistrict}, {District}, {State}, India`

Example: `Manibeli, Akkalkuwa, Nandurbar, Maharashtra, India`

### Why This Matters
B2B clients use this for drop-down menus and form autocomplete. The hierarchy ensures:
- No ambiguity (two villages with same name in different districts are distinguishable)
- Complete address auto-fill (select village → all other fields populate)
- Consistent formatting across all 600K+ villages

### MDDS Codes
Each level has a unique MDDS (Ministry of Drinking Water and Sanitation) code:
- State: numeric (e.g., 27 = Maharashtra)
- District: numeric/string (e.g., 497 = Nandurbar)
- SubDistrict: padded (e.g., 03950 = Akkalkuwa)
- Village: unique 6-digit (e.g., 525002 = Manibeli)

## Connections
- [[Data Model & Hierarchy]]
- [[API Design]]
- [[Data Import Pipeline]]
- [[B2B SaaS Model]]

## Source
- Graphify: Bridge node between Community 2 (Geographical Data Schema) and Community 4 (API & B2B Integration)
- Phase_1.md §4.4, Phase_2.md §6.5
