---
name: firestore-schema-and-indexes
description: QED.io Firestore collection layout, query patterns, and the deliberate no-composite-index policy
metadata:
  type: project
---

QED.io migrated from Prisma/Supabase to Firestore. All data access goes through the **Admin SDK** (`src/lib/firebase-admin.ts`, exports `adminDb`) in server components, API routes, and scripts. The client SDK (`src/lib/firebase.ts`, exports `db`) is initialized but **not imported anywhere** as of 2026-06-22 — all reads/writes flow through API routes / server components using `adminDb`. Because nothing uses the client SDK, Firestore security rules are not currently load-bearing (Admin SDK bypasses them). If client-side `db` reads/writes are ever added, security rules become mandatory.

Collections:
- `books/{slug}`
- `problems/{slug-chN-num}` — denormalized (bookSlug, bookTitle, bookAuthor, chapterNumber, chapterTitle, tags: string[], hints: [{order, content}])
- `submissions/{uuid}` — userId, problemId, proof, verdict, feedback, submittedAt (Timestamp)
- `users/{id}` — email, name, image, passwordHash?, provider?, createdAt. GitHub users get id `gh_<githubId>`; credential users get a randomUUID.

**No-composite-index policy (decided 2026-06-22):** submission queries filter by `userId` only (a single-field auto-index, always available) and then filter `problemId` and sort by `submittedAt` **in memory**. We deliberately do NOT issue compound `where(userId==).where(problemId==)` queries or server-side `orderBy`, so no composite index in `firestore.indexes.json` / console is required. Rationale: keeps deploys self-contained (no console step) and a user's submission count is small. If submission volume per user ever grows large, revisit — at that point add a composite index and push filtering/ordering back to Firestore.

**Why:** the original compound queries (equality+equality) would actually have worked without a composite index via Firestore's index merging, but the explicit in-memory approach is zero-risk and matches the team's preference to fix in code rather than manage console indexes.
**How to apply:** when adding any query that combines an equality filter with a different-field range/orderBy, prefer filtering in memory after a single-field query unless per-user row counts are large; never instruct the user to create indexes in the Firebase console.
