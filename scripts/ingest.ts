/**
 * ingest: Upsert a reviewed book JSON into Firestore.
 *
 * Usage:
 *   npm run ingest -- --book books/rudin-pma-3e.json [--dry-run]
 *
 * Idempotent: re-running is safe. Problems are keyed by <slug>-ch<N>-<number>.
 */

import fs from "fs";
import path from "path";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { BookJson } from "../src/types";

// Load .env.local manually (tsx doesn't auto-load it)
function loadEnv() {
  const envPath = path.resolve(".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });

const db = getFirestore(app);

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        result[args[i].slice(2)] = next;
        i++;
      } else {
        result[args[i].slice(2)] = true;
      }
    }
  }
  return result;
}

async function main() {
  const args = parseArgs();
  const bookPath = args.book as string | undefined;
  const dryRun = args["dry-run"] === true;

  if (!bookPath) {
    console.error("Usage: npm run ingest -- --book books/<slug>.json [--dry-run]");
    process.exit(1);
  }

  const absPath = path.resolve(bookPath);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  const book: BookJson = JSON.parse(fs.readFileSync(absPath, "utf-8"));

  if (!book.slug || !book.title || !book.author || !book.chapters?.length) {
    console.error("Invalid book JSON: missing slug, title, author, or chapters");
    process.exit(1);
  }

  const totalProblems = book.chapters.reduce((n, c) => n + c.problems.length, 0);
  console.log(`\nIngesting: ${book.title} (${book.author})`);
  console.log(`  ${book.chapters.length} chapters, ${totalProblems} problems`);
  if (dryRun) console.log("  [DRY RUN — no Firestore writes]\n");

  if (dryRun) {
    for (const chapter of book.chapters) {
      console.log(`  Chapter ${chapter.number}: ${chapter.title} (${chapter.problems.length} problems)`);
      for (const problem of chapter.problems) {
        console.log(`    #${problem.number} [${problem.difficulty}] tags: ${problem.tags.join(", ")}`);
      }
    }
    return;
  }

  // Upsert book document
  await db.collection("books").doc(book.slug).set(
    {
      slug: book.slug,
      title: book.title,
      author: book.author,
      ...(book.edition != null ? { edition: book.edition } : {}),
      ...(book.year != null ? { year: book.year } : {}),
    },
    { merge: true }
  );
  console.log(`\nBook: ${book.title} (id: ${book.slug})`);

  for (const chapter of book.chapters) {
    process.stdout.write(`  Chapter ${chapter.number}: ${chapter.title}…`);

    const batch = db.batch();
    for (const problem of chapter.problems) {
      const docId = `${book.slug}-ch${chapter.number}-${problem.number}`;
      const ref = db.collection("problems").doc(docId);
      batch.set(
        ref,
        {
          id: docId,
          number: problem.number,
          statement: problem.statement,
          difficulty: problem.difficulty,
          sourcePageRef: problem.sourcePageRef ?? null,
          bookSlug: book.slug,
          bookTitle: book.title,
          bookAuthor: book.author,
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
          tags: problem.tags,
          hints: problem.hints,
        },
        { merge: true }
      );
    }
    await batch.commit();
    console.log(` ${chapter.problems.length} problems`);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
