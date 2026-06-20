---
name: project-build-state
description: "QED.io was nearly feature-complete despite the misleading 'skeleton' commit; what was real, what was dead scaffolding, the chalkboard restyle"
metadata:
  type: project
---

Despite the git history ("skeleton", "tried a demo thing"), the QED.io backend was ~95% complete and working as of the 2026-06 chalkboard-restyle session. Auth, signup, problem list/filter, problem detail, submissions+grading, hints, dashboard, demo mode, and the full extract-pdf→ingest pipeline were all implemented.

**Why:** The commit messages undersell the state — don't assume "early stage" from git log alone. Read the source.

**How to apply:** Before "finishing" anything here, grep for callers. Pages query Prisma directly (server components); they do NOT fetch internal API routes.

**Dead scaffolding removed this session:** `src/app/api/problems/route.ts`, `.../problems/[id]/route.ts`, `.../problems/[id]/hints/route.ts` — all three were GET routes with zero callers (the pages render server-side from Prisma; HintPanel takes hints as props). If they reappear, they're still unused unless a client component starts fetching them.

**Live API routes (keep):** `/api/auth/[...nextauth]` (NextAuth), `/api/auth/signup`, `/api/submissions` (ProofEditor POSTs here).

**Pre-existing build bug fixed:** `/auth/signin` used `useSearchParams()` without a `<Suspense>` boundary — broke `next build` (prerender error) before any of my changes. Now wrapped: `SignInPage` is a thin Suspense wrapper around `SignInForm`. If you add `useSearchParams`/`usePathname` to other client pages, wrap them the same way.

**Chalkboard restyle:** theme is centralized in `src/app/globals.css` as CSS vars (`--board`, `--chalk`, `--chalk-dim`, `--chalk-faint`, `--chalk-yellow/blue/rose/green`) plus reusable classes (`.chalk-panel`, `.chalk-btn`, `.chalk-btn-solid`, `.chalk-input`, `.chalk-chip`, `.chalk-link`). Components reference vars via inline `style`, not raw hex. Latin Modern font loaded via `<link>` in layout.tsx (NOT CSS `@import` — conflicts with Tailwind's expansion order). CodeMirror uses `theme="dark"` + `.cm-editor` overrides. Don't reintroduce slate/indigo Tailwind color classes.

**Model:** grading + extraction use `claude-sonnet-4-6` (in `src/lib/claude.ts` and `scripts/extract-pdf.ts`) — a deliberate user choice, left as-is. The default-model guidance says opus-4-8, but swapping wasn't requested.
