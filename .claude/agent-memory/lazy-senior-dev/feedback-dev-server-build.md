---
name: feedback-dev-server-build
description: Don't run `next build` while the dev server is live; it clobbers .next and 500s the running server
metadata:
  type: feedback
---

Do NOT run `npx next build` against this repo while the dev server (port 3000, started separately) is running.

**Why:** `next build` overwrites `.next/` with a production build. The live dev server then serves a broken/partial cache and returns 500s on routes until it recompiles each on demand. During a bug-hunt this manufactured a fake "/problems 500" that looked like a real bug but was self-inflicted.

**How to apply:** To surface hidden compile/boundary errors, prefer `tsc --noEmit` (already clean-or-not signal) and reading the code. If a hard production-build check is truly needed, do it in a throwaway worktree, not the working dir whose dev server is live. Also: out-of-band `curl` of `/_next/static/chunks/*.js` URLs is unreliable in dev (hashed/turbopack paths 404 even when the app works) — don't treat those 404s as evidence of broken client JS.
