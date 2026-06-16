/**
 * ingest: Upsert a reviewed book JSON into the database.
 *
 * Usage:
 *   npm run ingest -- --book books/rudin-pma-3e.json [--dry-run]
 *
 * Idempotent: re-running is safe. Problems are upserted by (chapterId, number).
 * Tags are upserted by name; hints are replaced per problem on each run.
 */

import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import type { BookJson } from "../src/types";

const prisma = new PrismaClient();

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

  // Validate required fields
  if (!book.slug || !book.title || !book.author || !book.chapters?.length) {
    console.error("Invalid book JSON: missing slug, title, author, or chapters");
    process.exit(1);
  }

  const totalProblems = book.chapters.reduce((n, c) => n + c.problems.length, 0);
  console.log(`\nIngesting: ${book.title} (${book.author})`);
  console.log(`  ${book.chapters.length} chapters, ${totalProblems} problems`);
  if (dryRun) console.log("  [DRY RUN — no database writes]\n");

  if (dryRun) {
    for (const chapter of book.chapters) {
      console.log(`  Chapter ${chapter.number}: ${chapter.title} (${chapter.problems.length} problems)`);
      for (const problem of chapter.problems) {
        console.log(`    #${problem.number} [${problem.difficulty}] tags: ${problem.tags.join(", ")}`);
      }
    }
    return;
  }

  // Upsert book
  const dbBook = await prisma.book.upsert({
    where: { slug: book.slug },
    update: { title: book.title, author: book.author, edition: book.edition, year: book.year },
    create: { slug: book.slug, title: book.title, author: book.author, edition: book.edition, year: book.year },
  });
  console.log(`\nBook: ${dbBook.title} (id: ${dbBook.id})`);

  for (const chapter of book.chapters) {
    process.stdout.write(`  Chapter ${chapter.number}: ${chapter.title}…`);

    const dbChapter = await prisma.chapter.upsert({
      where: { bookId_number: { bookId: dbBook.id, number: chapter.number } },
      update: { title: chapter.title },
      create: { bookId: dbBook.id, number: chapter.number, title: chapter.title },
    });

    for (const problem of chapter.problems) {
      // Upsert problem
      const dbProblem = await prisma.problem.upsert({
        where: { chapterId_number: { chapterId: dbChapter.id, number: problem.number } },
        update: {
          statement: problem.statement,
          difficulty: problem.difficulty,
          sourcePageRef: problem.sourcePageRef ?? null,
        },
        create: {
          chapterId: dbChapter.id,
          number: problem.number,
          statement: problem.statement,
          difficulty: problem.difficulty,
          sourcePageRef: problem.sourcePageRef ?? null,
        },
      });

      // Upsert tags and connect
      if (problem.tags.length > 0) {
        // Remove existing tags for this problem
        await prisma.problemTag.deleteMany({ where: { problemId: dbProblem.id } });

        for (const tagName of problem.tags) {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName },
          });
          await prisma.problemTag.create({
            data: { problemId: dbProblem.id, tagId: tag.id },
          });
        }
      }

      // Replace hints
      await prisma.hint.deleteMany({ where: { problemId: dbProblem.id } });
      if (problem.hints.length > 0) {
        await prisma.hint.createMany({
          data: problem.hints.map((h) => ({
            problemId: dbProblem.id,
            order: h.order,
            content: h.content,
          })),
        });
      }
    }

    console.log(` ${chapter.problems.length} problems`);
  }

  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
