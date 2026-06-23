# QED.io — Feature Ideas

_Last updated 2026-06-22. Grounded in the current codebase: Next.js 15 App Router, Firestore (`adminDb`, collections `users` / `problems` / `submissions` / `books`), NextAuth (email/password + GitHub), Claude grading via `src/lib/claude.ts` (`claude-sonnet-4-6`, prompts in `prompts/grader.txt`, `prompts/tagger.txt`, `prompts/extractor.txt`)._

**Data-layer notes that shape every idea below:**
- The platform is mid-migration to Firestore. The submission API (`src/app/api/submissions/route.ts`) already runs on `adminDb`; Prisma appears removed. New "collections" below are Firestore collections.
- **Progress (SOLVED / IN_PROGRESS / NOT_STARTED) is derived, not stored** — it's computed from the `submissions` collection. Several ideas exploit this.
- **Hints are embedded** on each problem document (`hints: { order, content }[]`, see `firestore-types.ts` / `FSProblem`) — there is no separate hints collection and no hint-generation Claude call yet. `HintPanel` serves static, pre-authored hints.
- **Firestore has no full-text search and no joins.** Any search / similarity / "related problems" idea must denormalize, scan-and-filter in the app, or add an external index (Algolia / Typesense / a vector store). Called out per-idea.
- Grading returns `GraderFeedback` (`verdict`, `summary`, `issues[]` with `type` ∈ gap/unjustified/circular/incorrect/incomplete + `location` + `explanation`). The `location` field already exists but is unused in the UI — several ideas cash it in.

---

## Quick wins (Small: 1–2 days, high value)

### 1. Draft autosave per problem
- **What:** Persist the in-progress proof so a refresh or accidental navigation doesn't wipe a half-written argument.
- **Who:** Anyone who tabs away to check a definition and returns to an empty editor — a brutal loss on a long analysis proof.
- **How:** Debounced write from `ProofEditor` to `localStorage` keyed by `problemId` (zero backend), or to a `drafts` subcollection under the user for cross-device. Rehydrate on `ProblemWorkspace` mount.
- **Effort:** Small (localStorage version is hours).
- **Risk:** localStorage is per-device; cross-device needs the subcollection plus a write per debounce tick (trivial cost at this scale).

### 2. Surface `issue.location` as inline annotations
- **What:** Highlight the exact spot in the submitted proof each grader issue refers to, instead of a separate list in `FeedbackPanel`.
- **Who:** Students who get "gap at the triangle-inequality step" and have to hunt for which line that was.
- **How:** The grader already returns `location`. Instruct `prompts/grader.txt` to quote verbatim, then in `FeedbackPanel` string-match the quote against the rendered proof and wrap it in a span colored by `issue.type`. No schema change.
- **Effort:** Small.
- **Risk:** Matching is brittle if Claude paraphrases; require verbatim quotes and fall back to the current list view when no match is found.

### 3. Flag a bad problem / dispute a grade
- **What:** A "report" button on the feedback panel and the problem page.
- **Who:** Students who hit a wrong grade (a CORRECT proof marked FLAWED) or a malformed statement — currently a dead end that erodes trust.
- **How:** New `reports` collection `{ id, userId, problemId, submissionId?, kind: "grader" | "problem", note, status: "open" | "resolved", createdAt }`. Small form component; admin triage view can come later.
- **Effort:** Small.
- **Risk:** Needs a triage path or reports rot. Start with a Firestore query you check manually.

### 4. Submission history on the problem page
- **What:** A collapsible list of this user's prior attempts on the current problem, with verdict badges and timestamps; click one to reload its proof.
- **Who:** Returning students who want to see what they tried before retrying.
- **How:** The data exists — `GET /api/submissions?problemId=` already returns it. Add an "Attempts" panel in `ProblemWorkspace` that renders verdict + date and loads a selected proof into the editor.
- **Effort:** Small (API is done).
- **Risk:** Minimal — almost pure UI on existing data.

### 5. Keyboard submit + LaTeX snippet palette
- **What:** Cmd/Ctrl+Enter to submit, plus an autocomplete menu for common LaTeX (`\varepsilon`, `\forall`, `\implies`, `\mathbb{R}`, cases env).
- **Who:** Power users grinding a chapter who don't want to hand-type `\varepsilon` 40 times.
- **How:** CodeMirror keymap + a curated completion source in `ProofEditor`. No backend.
- **Effort:** Small.
- **Risk:** Low. Keep the snippet list scoped to analysis notation so it isn't noise.

### 6. Difficulty + status badges on `ProblemCard` and the problems grid
- **What:** Show each problem's difficulty and the user's derived status as colored chips.
- **Who:** Students scanning a chapter to pick their next problem.
- **How:** `ProblemSummary` already carries `difficulty` and `status`. Pure UI in `ProblemCard` / `src/app/problems/page.tsx`.
- **Effort:** Small.
- **Risk:** None.

### 7. "Solved" share card
- **What:** After a CORRECT verdict, generate a clean image/text card ("Solved Rudin Ch. 3 #7").
- **Who:** Students wanting a low-friction brag for a study-group chat — free top-of-funnel.
- **How:** Client-side canvas render from verdict + problem metadata. No schema change.
- **Effort:** Small.
- **Risk:** Marketing value scales with user count; cheap enough to ship anyway.

---

## Core depth (Medium: ~1 week, deepen the proof-writing loop)

### 8. Versioned attempts with a side-by-side diff
- **What:** Treat each submission as a version and let the user diff attempt N against N-1.
- **Who:** A student iterating on a FLAWED proof who wants to confirm they fixed the flagged gap without regressing elsewhere.
- **How:** Submissions are already immutable rows — no schema change strictly needed; add `attemptNumber` (count existing user+problem submissions at write time) for clean labels. New diff view in `ProblemWorkspace` over the two `proof` strings, with verdict deltas alongside.
- **Effort:** Medium.
- **Risk:** Write-time counting races under concurrent submits (rare for one user); use a transaction if it matters.

### 9. Targeted re-grade ("did I fix the gap?")
- **What:** On retry, pass the previous attempt's `issues[]` to the grader and ask it to report whether each prior issue is resolved.
- **Who:** The iterating student — turns "re-graded from scratch" into "here's the status of each thing you were told to fix."
- **How:** `evaluateProofWithPriorIssues(statement, proof, priorIssues)` in `claude.ts` with a variant prompt; response gains per-prior-issue `resolved: boolean`. The submit API passes the most recent submission's issues when one exists.
- **Effort:** Medium.
- **Risk:** Grader may anchor on prior issues and miss new ones — instruct it to do a fresh pass first, then map.

### 10. Proof scaffold / outline mode
- **What:** Optional pre-fill of a skeleton (Assume… / WTS… / by cases / contradiction setup) into the editor.
- **Who:** Students who freeze on a blank editor and don't know how to begin a proof of a given form.
- **How:** A small set of static templates selectable in `ProofEditor`; optionally a Claude call that proposes *structure only* from the statement. Static version has no backend.
- **Effort:** Medium (static is Small; AI structuring pushes it to Medium).
- **Risk:** Templates can encourage rote structure; keep them clearly optional and never content-bearing.

### 11. Definition & theorem reference layer
- **What:** A clickable glossary of the definitions/theorems a problem depends on ("open cover," "Cauchy sequence"), in a side panel.
- **Who:** Students who'd otherwise leave the app to look something up mid-proof.
- **How:** New `references` collection `{ id, bookSlug, term, statement(LaTeX), chapterNumber }`; add `referenceIds: string[]` to problem docs (extend `prompts/tagger.txt` to emit referenced terms). Side panel in `ProblemWorkspace` via `LatexRenderer`.
- **Effort:** Medium.
- **Risk:** Curation cost; auto-extracted references need a review pass.

### 12. Verdict-aware next-step CTAs
- **What:** After grading, a contextual action: CORRECT → "next in chapter" / "harder related"; FLAWED → "retry against these issues"; INCOMPLETE → "show next hint."
- **Who:** Students who finish and don't know what to do next — cuts post-grade drop-off.
- **How:** Logic in `FeedbackPanel` keyed off `verdict`. "Next in chapter" needs an ordered query (cheap by `chapterNumber` + `number`). Ties into #15 and #25.
- **Effort:** Medium.
- **Risk:** "Harder related" depends on related-problems infra (#16); ship within-chapter first.

---

## Social & discovery

### 13. Community solutions gallery (solve-gated)
- **What:** Once you get a CORRECT verdict on a problem, you can read others' accepted proofs and opt your own in.
- **Who:** Students who solved it one way and want a slicker approach — the highest-value social feature for serious students, with no spoiler risk because it's gated behind solving.
- **How:** Add `sharedToGallery: boolean` to submissions (opt-in). A `/problems/[id]/solutions` route queries CORRECT + shared submissions. Gate server-side: only render if the requester has their own CORRECT submission. Reuse #3 for reporting low-quality shares.
- **Effort:** Medium.
- **Risk:** Needs critical mass per problem to feel alive; degrades to an empty state gracefully until then.

### 14. Within-book search / jump-to-problem
- **What:** A command-palette search over problem statements and tags.
- **Who:** Students who remember "the compactness one with the open cover" but not the number.
- **How:** Firestore can't full-text search. Cheapest: load the ~300 problems client-side and fuzzy-match in-browser. At scale, add Algolia/Typesense indexed on problem write.
- **Effort:** Medium (client-side); Large with an external index.
- **Risk:** Client scan is fine at 300 problems but won't scale past a few thousand once more books land — note the cutover.

### 15. Instructor problem sets
- **What:** Let an instructor assemble an ordered subset of existing problems into a named, shareable set with a link.
- **Who:** A TA/professor assigning "these 8 from Rudin Ch. 2–3" who wants a URL to hand out.
- **How:** New `problemSets` collection `{ id, ownerId, title, problemIds[], visibility }`; a `/sets/[id]` route reusing existing problem rendering. Roster/grades are a later add (#24).
- **Effort:** Medium.
- **Risk:** Without roster + completion tracking it's just a curated list; institutional payoff needs #24.

### 16. Related-problems rail
- **What:** "Problems like this" suggestions on the problem page; also powers the "harder related" CTA in #12.
- **Who:** A student who wants more reps on the same concept.
- **How:** v1: tag-overlap (Jaccard on the `tags` array), computed in-app, no new infra. v2: embedding similarity (embed statements, store vectors, nearest-neighbor) for concept matches that survive tag inconsistency.
- **Effort:** Medium (v1); Large (v2, needs a vector store).
- **Risk:** v1 quality tracks tag quality (#20). Ship v1, measure click-through before investing in embeddings.

---

## AI & intelligence (better grading, hints, personalization)

### 17. Socratic adaptive hints (generated, not static)
- **What:** Instead of revealing the next pre-authored hint, generate a nudge tailored to the user's *current* stuck attempt.
- **Who:** A student whose specific wrong turn isn't covered by the generic embedded hints.
- **How:** New `generateHint(statement, currentProof, hintsRevealedSoFar)` in `claude.ts` + a new prompt that nudges, never solves. `HintPanel` calls a new `/api/hints` route. Keep static embedded hints as the first rung / fallback.
- **Effort:** Medium.
- **Risk:** Cost per request and solution-leak risk; constrain hard ("one step, never state the conclusion") and rate-limit.

### 18. Grader confidence + self-consistency
- **What:** Have the grader emit a confidence; on low confidence run a second pass; surface uncertainty in the UI.
- **Who:** Students burned by a wrong verdict (the trust problem behind #3) — and you, when triaging disputes.
- **How:** Add `confidence: number` to `feedbackSchema` and the prompt. Below threshold → re-grade and reconcile, or flag for review. Store confidence on the submission.
- **Effort:** Medium.
- **Risk:** Doubles grading cost on the uncertain fraction; tune the threshold and don't over-show uncertainty.

### 19. Personalized weakness queue
- **What:** A dashboard widget recommending problems that target the user's most common issue type or weakest tags.
- **Who:** A student between sessions who wants the app to tell them what to practice.
- **How:** Aggregate the user's `submissions` by `feedback.issues[].type` and by tags of failed problems; recommend NOT_STARTED problems whose tags correlate with failures. From existing submission data; optionally cache the aggregate on the user doc.
- **Effort:** Medium.
- **Risk:** Cold start — useless until several graded attempts exist; default to chapter progression until then.

### 20. Empirical difficulty + tag QA from real outcomes
- **What:** Replace author-assigned difficulty with empirical difficulty from solve rates, and flag low-quality tags.
- **Who:** Everyone picking problems by difficulty — EASY/MEDIUM/HARD is currently a guess. Also improves #16 and #19.
- **How:** Scheduled job aggregates per-problem solve rate / attempts-to-solve from `submissions`, writes `empiricalDifficulty` onto problem docs. Tags that never predict failure get flagged for a tagger re-run.
- **Effort:** Medium.
- **Risk:** Needs volume per problem; keep author difficulty as a prior and blend until sample size suffices.

### 21. Non-AI pre-submit linter
- **What:** Instant, free client-side checks before a real grading call: unbalanced LaTeX delimiters, empty proof, one-line "proof," symbols used before introduction (heuristic).
- **Who:** Students about to waste a grading call on a `$` typo or an obviously unfinished proof.
- **How:** Pure client-side function in `ProofEditor`; inline warnings. Zero AI cost.
- **Effort:** Small–Medium.
- **Risk:** Heuristics false-positive — make every warning dismissible, never block submission.

### 22. Grader rubric transparency
- **What:** Show *what the grader checked* — a short rubric/checklist per verdict, not just the issue list.
- **Who:** Students who want to understand the standard they're held to and trust the grade.
- **How:** Extend the grader prompt to emit `checks: { item, passed }[]`; render a checklist in `FeedbackPanel`. Schema add to `feedbackSchema`.
- **Effort:** Medium.
- **Risk:** More output tokens; keep the checklist short and problem-agnostic.

---

## Business & growth (monetization, retention)

### 23. Freemium gated on graded submissions
- **What:** Free tier gets N AI gradings per period; paid tier is unlimited + generated hints (#17) + community solutions (#13).
- **Who:** The business. Grading is the real marginal cost (Claude calls), so it's the natural meter.
- **How:** Counter on the user doc, reset by a scheduled job; gate in the submit API. Viewing problems, the editor, and static hints stay free.
- **Effort:** Medium (plus a Stripe integration as its own chunk).
- **Risk:** Pick the free quota carefully — too stingy kills the student funnel, too generous removes the upgrade reason.

### 24. Instructor dashboard + roster (builds on #15)
- **What:** A course owner sees, per assigned set, which students solved what and where they're stuck.
- **Who:** The institutional buyer — the path to seat-based revenue beyond individual subscriptions.
- **How:** Add `enrollments` `{ setId, userId, role }`; surface per-student progress (derived from `submissions` filtered to the set's problems + enrolled users). Aggregate issue types to show "the class is struggling with compactness."
- **Effort:** Large.
- **Risk:** Sales-led, longer cycle, student-data privacy. High value but only after #15 proves instructor pull.

### 25. Spaced-repetition review of solved proofs
- **What:** Periodically resurface solved problems for a re-prove, scheduled by an SRS algorithm.
- **Who:** Students prepping for quals/exams who need durable recall, not one-and-done solves.
- **How:** New `reviews` collection `{ userId, problemId, dueDate, interval, ease }` updated on each re-solve (SM-2-style). A "Due for review" dashboard section reusing the solve/grade loop.
- **Effort:** Medium.
- **Risk:** Re-proving is heavier than flashcard review; offer a lighter "recall the key idea" mode alongside full re-proof.

### 26. Second book via the existing ingestion pipeline
- **What:** Add Spivak's _Calculus_ or Axler's _Linear Algebra Done Right_ via the extractor → tagger → ingest pipeline already in `prompts/`.
- **Who:** The roughly-as-large population doing intro analysis (Spivak) or proof-based linear algebra (Axler) who bounce because only Rudin exists.
- **How:** Run `prompts/extractor.txt` + `prompts/tagger.txt` on the PDF (the `book-scanner` agent exists for exactly this). Problems flow into the same `problems` collection keyed by `bookSlug`; book filtering already works.
- **Effort:** Medium (pipeline exists; extraction quality-review is the real cost).
- **Risk:** Extraction quality varies by PDF — budget a human review pass per chapter. This is the single biggest lever on total addressable users.

---

## Suggested sequencing

1. **Trust + loop polish first (Small):** #4, #1, #2, #6, #3 — near-pure UI on data that already exists, directly improving the core loop and trust.
2. **Deepen the loop (Medium):** #8, #9, #12 — make iteration feel intelligent.
3. **Grow the catalog (Medium):** #26 — the biggest user-count lever, gated only by extraction review.
4. **Pick a strategic bet:** community (#13), AI hints (#17), or institutional (#15 → #24), depending on whether you're optimizing for engagement, depth, or revenue.
