# QED.io

A LeetCode-style practice platform for pure mathematics. Write proofs in LaTeX, get AI feedback on logical soundness, track progress.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Prisma** + PostgreSQL
- **NextAuth v4** (GitHub OAuth + email/password)
- **Anthropic SDK** — grading and ingestion
- **CodeMirror 6** — LaTeX editor
- **KaTeX** — live math rendering
- **Tailwind v4**

---

## Local setup

### 1. Prerequisites

- Node.js 20+
- PostgreSQL running locally (or a connection string to a remote DB)

### 2. Install

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/qedio"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# GitHub OAuth app — create at https://github.com/settings/developers
# Callback URL: http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

ANTHROPIC_API_KEY="..."
```

### 4. Create the database

```bash
npm run db:push       # push schema to DB (dev / first-time)
# or
npm run db:migrate    # generate and apply a migration (recommended for production)
```

### 5. Run

```bash
npm run dev
```

---

## Ingesting a textbook

Book ingestion is a two-step process: **extract** problems from the PDF using Claude, then **commit** the reviewed JSON to the database.

### Step 1: Write (or update) the manifest

Each book needs a manifest in `books/<slug>.manifest.json` that tells the extractor which PDF pages contain exercises for each chapter. See `books/rudin-pma-3e.manifest.json` for the Rudin example.

> **Important:** `exerciseStartPage` and `exerciseEndPage` are **PDF page numbers** (1-indexed), not book page numbers. They may differ from the printed page numbers due to front matter.

### Step 2: Extract + tag

```bash
npm run extract-pdf -- --manifest books/rudin-pma-3e.manifest.json
```

This uses Claude to:
1. Extract each exercise statement from the PDF pages (OCR)
2. Assign topic tags, difficulty, and 3-step hints per problem

Output is written to `books/rudin-pma-3e.json`. **Review and edit this file** — correct any OCR errors or metadata you disagree with before proceeding.

To process only specific chapters:

```bash
npm run extract-pdf -- --manifest books/rudin-pma-3e.manifest.json --chapters 1,2,3
```

### Step 3: Commit to database

```bash
# Preview what will be written (no DB writes)
npm run ingest -- --book books/rudin-pma-3e.json --dry-run

# Commit
npm run ingest -- --book books/rudin-pma-3e.json
```

The ingest command is **idempotent** — re-running it is safe. Problems are upserted by `(chapterId, number)`, so you can re-ingest after editing the JSON.

### Adding a new book

1. Add the PDF to the repo root (or adjust `pdfPath` in the manifest)
2. Create `books/<new-slug>.manifest.json` with chapter page ranges
3. Run `extract-pdf` and `ingest`

No code changes required — the schema supports multiple books natively.

---

## Project structure

```
.
├── books/                  # Manifests (.manifest.json) and extracted data (.json)
├── prisma/schema.prisma    # Database schema
├── prompts/
│   ├── grader.txt          # Claude system prompt for proof grading
│   ├── tagger.txt          # Claude system prompt for auto-tagging
│   └── extractor.txt       # Claude prompt for PDF problem extraction
├── scripts/
│   ├── extract-pdf.ts      # PDF → reviewed JSON
│   └── ingest.ts           # JSON → database (idempotent)
└── src/
    ├── app/                # Next.js App Router pages and API routes
    ├── components/         # React components
    ├── lib/
    │   ├── auth.ts         # NextAuth config
    │   ├── claude.ts       # Anthropic SDK helpers
    │   └── prisma.ts       # Prisma client singleton
    └── types/              # Shared TypeScript types
```

---

## Prompt files

The grader and tagger prompts live in `prompts/` as plain text files. Edit them to tune the grading behavior without touching application code.

- **`grader.txt`** — system prompt for proof evaluation. Controls strictness, what counts as CORRECT vs FLAWED vs INCOMPLETE, and the JSON output shape.
- **`tagger.txt`** — system prompt for auto-tagging. Controls the tag vocabulary, difficulty rubric, and hint style.
- **`extractor.txt`** — prompt for extracting problems from scanned PDF pages.
