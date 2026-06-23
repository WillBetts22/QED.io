---
name: auth-stack-facts
description: Auth and stack realities for QED.io after the Firebase migration — NextAuth v4 JWT, no DB adapter
metadata:
  type: project
---

Post-migration (Prisma/Supabase -> Firebase Firestore) auth/stack facts:

- NextAuth is **v4** (`next-auth@^4.24.11`), not v5. Server-side session is read with
  `getServerSession(authOptions)` from `next-auth` — this is correct for v4. Do NOT flag
  `getServerSession` as wrong; `auth()` is the v5 API and is not applicable here.
- Session strategy is **stateless JWT with no database adapter**. `session.user.id` comes from the
  JWT `token.id`, set in the `jwt` callback from `user.id`.
- **Stale-JWT tradeoff:** the `signIn` callback (which writes/looks up the Firestore user) only runs at
  login. After a user doc is deleted, their JWT still authorizes until expiry because nothing re-checks
  existence on each request. This is a known/accepted tradeoff (per-request Firestore read adds latency).
  Flag as WARNING, do not silently add a per-request DB read.
- GitHub OAuth: `signIn` callback rewrites `user.id` to `gh_<githubId>` and upserts the user doc. The id
  the JWT carries is therefore the Firestore doc id, so `session.user.id` correctly matches doc ids used
  in submissions. No impersonation vector found in reviewed code (id is server-derived from the token,
  never taken from the request body).
- `src/lib/firebase.ts` (browser Firestore client, exports `db`) is **dead code** — no imports anywhere
  in `src/`. All data access is server-side via `adminDb`.
- Secrets: `ANTHROPIC_API_KEY`, `NEXTAUTH_SECRET`, `FIREBASE_PRIVATE_KEY/CLIENT_EMAIL/PROJECT_ID` are all
  server-only. `NEXT_PUBLIC_FIREBASE_*` are public by design (only used by the dead browser client).

See [[firestore-query-patterns]] and [[confirmed-clean]].
