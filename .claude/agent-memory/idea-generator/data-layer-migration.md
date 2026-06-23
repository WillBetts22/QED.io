---
name: data-layer-migration
description: QED.io migrated to Firestore — submission API runs on adminDb; key collections and what's derived vs stored
metadata:
  type: project
---

As of 2026-06-22 the Firestore migration is substantially done. The submission API (`src/app/api/submissions/route.ts`) runs entirely on `adminDb` (Firebase Admin), and the Prisma schema appears gone (no `prisma/schema.prisma` models found). Auth (`src/lib/auth.ts`) uses the Firestore `users` collection. Types live in `src/lib/firestore-types.ts` (FSProblem, FSSubmission, FSBook, FSUser).

Collections in play: `users`, `problems`, `submissions`, `books`.

Key facts that shape idea schema-impact:
- **Progress (SOLVED/IN_PROGRESS/NOT_STARTED) is DERIVED from `submissions`, not stored.**
- **Hints are EMBEDDED on the problem doc** (`hints: {order, content}[]` on FSProblem). No separate hints collection, and no hint-generation Claude call exists yet — HintPanel serves static authored hints.
- **`feedback.issues[]` includes a `location` field currently unused in the UI** — cheap to cash in (idea #2 in [[ideas-proposed-2026-06]]).
- Grading: `evaluateProof(statement, proof)` in `src/lib/claude.ts`, model `claude-sonnet-4-6`, validated by zod `feedbackSchema`. Prompts are files in `prompts/` (grader.txt, tagger.txt, extractor.txt).

**Why:** Earlier the codebase had both Prisma and Firebase; now Firestore is the live store. Schema suggestions should be Firestore collections.
**How to apply:** Firestore has NO full-text search and NO joins — flag this for search/similarity/related-problems ideas (pushes toward client-side scan at current scale, or Algolia/Typesense/vector store later). Describe new models as Firestore collections.
