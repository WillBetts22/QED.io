---
name: confirmed-clean
description: QED.io areas audited and found correct as of 2026-06-22 — skip re-auditing unless changed
metadata:
  type: project
---

Reviewed 2026-06-22 (post-Firebase-migration) and found correct:

- `src/lib/claude.ts` — `extractJson` + `JSON.parse` is wrapped in try/catch and validated with a zod
  `feedbackSchema.parse`. Malformed model output throws a clean Error, caught by the submissions POST
  (returns 502). Solid. The outermost `{`..`}` slice is correct for a single JSON object.
- `src/app/api/auth/signup/route.ts` — zod validation, duplicate-email check, bcrypt cost 12, server-derived
  uuid. Correct. (Minor: dup-check + create is not transactional, tiny race window — SUGGESTION only.)
- `src/app/api/submissions/route.ts` POST — auth checked before write, userId taken from session not body,
  proof length-capped at 50000, grading failure handled (502). No impersonation vector.
- `src/lib/firebase-admin.ts` — `getApps().length > 0` singleton guard is correct for Node runtime and safe
  under parallel server-component rendering (idempotent init). Note: this is Node-only (firebase-admin is not
  Edge-compatible); fine as long as routes/pages stay on the Node runtime.
- `scripts/ingest.ts` — JSON.parse of book file validates required fields after; idempotent keyed upserts via
  batch; hints written as array (no unique-constraint concern since Firestore has none). Fine.

Do not re-audit these unless the files change.
