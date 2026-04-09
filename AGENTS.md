# Bluestock SaaS — Agent Operating System

## System Hierarchy (STRICT ORDER)
1. **GSD** → controls WHAT to build, HOW, task decomposition
2. **Graphify** → codebase understanding via knowledge graph
3. **Antigravity** → executes tasks
4. **Obsidian** → stores refined insights only (never raw data)

---

## graphify

This project has a graphify knowledge graph at `graphify-out/`.

Rules:
- Before answering architecture or codebase questions, read `graphify-out/GRAPH_REPORT.md` for god nodes and community structure
- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files
- After modifying code files, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
- **NEVER scan full codebase if graph exists** — use `graphify query` first

---

## GSD (Get Shit Done) Workflow

### Mode Selection
- **STRUCTURED MODE** (default) → features, architecture, multi-step tasks
- **QUICK MODE** → small fixes, debugging, trivial changes (no architectural impact)

### Structured Mode Steps
```
STEP 0: Read graphify-out/GRAPH_REPORT.md → understand system
STEP 1: Read GSD/current_phase.md → understand current state
STEP 2: Plan → create/update phase plan in GSD/phases/
STEP 3: Execute → follow plan, commit atomically
STEP 4: Verify → run tests, check output
STEP 5: Capture → store insights in obsidian-vault/ (ONLY if meaningful)
```

### GSD State Tracking
- Active phase: `GSD/current_phase.md`
- Phase plans: `GSD/phases/phase_N.md`
- Task log: `GSD/task_log.md`

### Before ANY Execution
Ask: (1) Do I need GSD? (2) Can Graphify answer this? (3) Is this worth storing in Obsidian?

---

## Obsidian Vault

Location: `obsidian-vault/`

**ONLY write when:**
- ✔ New architectural insight discovered
- ✔ Non-trivial bug solved
- ✔ Design decision made
- ✔ Reusable concept identified

**NEVER write:**
- ✖ Raw logs, code dumps, temporary outputs
- ✖ Duplicate notes (update existing instead)
- ✖ Trivial information

Note format: Summary → Details → Connections → Source

---

## Core Rules (NON-NEGOTIABLE)
1. NEVER execute large tasks without GSD planning
2. NEVER scan full codebase if Graphify graph exists
3. NEVER dump raw outputs into Obsidian
4. ALWAYS prefer structured workflows over ad-hoc actions
5. ALWAYS commit changes atomically
6. ALWAYS use fresh context per task
