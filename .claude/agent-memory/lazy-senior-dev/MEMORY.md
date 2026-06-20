# Memory Index

- [Project: QED.io build state](project-build-state.md) — backend was ~complete despite "skeleton" commit; what existed, what was dead, the chalkboard restyle
- [Grader trust boundary](feedback-grader-parse.md) — LLM JSON output must be fence-stripped + Zod-validated before use
- [Don't build over live dev server](feedback-dev-server-build.md) — `next build` clobbers .next and 500s the running dev server; chunk-URL 404s in dev are not real evidence
- [Demo data structure](project-demo-data.md) — demo-data.ts: TAGS lookup + derived DEMO_TAGS, no Prisma seed file exists
