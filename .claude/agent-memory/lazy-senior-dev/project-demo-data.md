---
name: project-demo-data
description: How demo-data.ts is structured — TAGS lookup, derived DEMO_TAGS, no seed file exists
metadata:
  type: project
---

`src/lib/demo-data.ts` is the demo-mode problem source (DEMO_MODE=true). It hard-codes Rudin PMA exercises matching the `ProblemDetail`/`ProblemSummary` types in `src/types/index.ts`.

Structure decisions (so future-you doesn't re-flatten them):
- Tags live in a single `TAGS` object built via a one-line `T(id, name)` helper, then referenced by key on each problem (e.g. `TAGS.continuity`). This dedups ~60+ `{ tag: { id, name } }` literals. Don't re-inline them.
- `DEMO_TAGS` is **derived** from `TAGS` via `Object.values(...).map(...)` — not hand-maintained. Add a problem tag → it auto-appears. Don't reintroduce a manual list.
- All 7 core chapters (1-7) are defined in `CHAPTERS`.

**Why:** User asked to populate ~30-40 genuine Baby Rudin problems (had only 3 demos). 35 added spanning Ch 1-7.
**How to apply:** When adding problems, reuse `TAGS` keys or add a new one there; leave `DEMO_TAGS` alone. There is **no Prisma seed file** — `prisma/` contains only `schema.prisma`, so demo-data.ts is the only place to edit for demo content.
