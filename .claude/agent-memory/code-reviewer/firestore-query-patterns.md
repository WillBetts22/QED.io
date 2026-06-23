---
name: firestore-query-patterns
description: Recurring Firestore query gotchas in QED.io — composite indexes, in-memory filtering, count aggregates
metadata:
  type: project
---

Firestore query patterns and gotchas seen in QED.io:

- **Composite index requirement:** any query chaining two `.where()` on different fields needs a composite
  index or Firestore throws `FAILED_PRECONDITION` at runtime. The query
  `submissions.where("userId","==",x).where("problemId","==",y)` appears in
  `src/app/problems/[id]/page.tsx` and `src/app/api/submissions/route.ts` (GET with `problemId`).
  An index config was added at repo root `firestore.indexes.json` (userId ASC + problemId ASC). It must be
  deployed (`firebase deploy --only firestore:indexes`) for those queries to work in prod.
- The codebase deliberately fetches whole collections (`problems`, `books`) and filters/sorts in memory
  (problems/page.tsx, dashboard/page.tsx). Fine at current small scale; flag as a SUGGESTION (no pagination,
  unbounded `.get()`) only — not a bug yet.
- Home page uses `.count().get()` aggregate — correct, cheap.
- Firestore errors are NOT caught around `.get()` in server components; an unreachable Firestore throws and
  Next.js renders the error boundary. There is no `error.tsx` boundary in the reviewed scope — worth a WARNING.

See [[auth-stack-facts]].
