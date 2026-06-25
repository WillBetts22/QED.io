---
name: firestore-index-pattern
description: Submission queries filter verdict in memory off the userId-only index; don't add composite indexes
metadata:
  type: project
---

When querying the `submissions` collection by user, use a single-field `where("userId", "==", id)` query and filter `verdict` (e.g. `=== "CORRECT"`) in memory. Do NOT add a `userId + verdict` composite query.

**Why:** `firestore.indexes.json` only defines a `submissions` composite on `userId + problemId`. A `where userId == X && where verdict == Y` query needs a separate composite index that isn't deployed and would throw a runtime "index required" error. The dashboard (`src/app/dashboard/page.tsx`) and problems page (`src/app/problems/page.tsx`) both already use the userId-only + in-memory-filter pattern.

**How to apply:** Reuse the verdictMap pattern (latest verdict per problemId, CORRECT always wins) when computing solved/in-progress status anywhere. Only add a composite index if a query genuinely can't be done client-side and you update `firestore.indexes.json`.
