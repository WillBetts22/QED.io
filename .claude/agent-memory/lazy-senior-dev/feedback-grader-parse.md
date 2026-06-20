---
name: feedback-grader-parse
description: "Claude grader JSON output is a trust boundary — strip fences, extract outermost braces, Zod-validate before use; never raw JSON.parse"
metadata:
  type: feedback
---

`evaluateProof()` in `src/lib/claude.ts` must defensively parse Claude's output: strip ```` ```json ```` fences, slice the outermost `{...}`, then validate against a Zod schema (`zod` is already a dependency — don't add a parser). The original code did a bare `JSON.parse(response.content[0].text)`.

**Why:** LLM output is an external/untrusted input at a trust boundary, and grading sits on the submission *write* path. A stray sentence or markdown fence from the model would throw an unhandled error and 500 the request. The prompt says "return bare JSON," but that's not a guarantee.

**How to apply:** Both call sites in `/api/submissions` wrap `evaluateProof` in try/catch and return 502 "Grading failed" — and the real path grades BEFORE the DB write, so a failure creates no orphaned submission. Keep that ordering. Any future LLM-output parsing here follows the same pattern (see `extractJson` + its check at `src/lib/extractJson.check.mjs`). This is the project's one "never lazy about" hot spot.
