/**
 * extract-pdf: Extract and tag exercises from a scanned textbook PDF.
 *
 * Usage:
 *   npm run extract-pdf -- --manifest books/rudin-pma-3e.manifest.json [--chapters 1,2,3]
 *
 * Output: books/<slug>.json — review and edit this before running `npm run ingest`.
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { PDFDocument } from "pdf-lib";

interface Manifest {
  slug: string;
  title: string;
  author: string;
  edition?: number;
  year?: number;
  pdfPath: string;
  chapters: {
    number: number;
    title: string;
    exerciseStartPage: number;
    exerciseEndPage: number;
  }[];
}

interface ExtractedProblem {
  number: string;
  statement: string;
  sourcePageRef: string;
}

interface TaggerHint {
  order: number;
  content: string;
}

interface TaggerProblem {
  number: string;
  tags: string[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hints: TaggerHint[];
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

function loadPrompt(name: string): string {
  return fs.readFileSync(path.join(process.cwd(), "prompts", `${name}.txt`), "utf-8");
}

function parseArgs() {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
      result[args[i].slice(2)] = args[i + 1] ?? "true";
      i++;
    }
  }
  return result;
}

async function extractPagesAsPdf(
  fullPdfBytes: Uint8Array,
  startPage: number,
  endPage: number
): Promise<string> {
  const sourcePdf = await PDFDocument.load(fullPdfBytes);
  const subDoc = await PDFDocument.create();

  // PDF pages are 0-indexed; manifest uses 1-indexed book page numbers.
  // The PDF may have an offset (front matter). We use the page numbers as-is
  // and document that the manifest should use PDF page indices (1-based).
  const indices = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage - 1 + i // convert to 0-based
  ).filter((i) => i >= 0 && i < sourcePdf.getPageCount());

  if (indices.length === 0) {
    throw new Error(`Page range ${startPage}–${endPage} is out of bounds (PDF has ${sourcePdf.getPageCount()} pages)`);
  }

  const copiedPages = await subDoc.copyPages(sourcePdf, indices);
  copiedPages.forEach((p) => subDoc.addPage(p));

  const bytes = await subDoc.save();
  return Buffer.from(bytes).toString("base64");
}

async function extractChapterProblems(
  pdfBase64: string,
  chapterNumber: number,
  chapterTitle: string
): Promise<ExtractedProblem[]> {
  const prompt = loadPrompt("extractor");

  console.log(`  Extracting problems from PDF pages…`);
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
          } as Anthropic.DocumentBlockParam,
          {
            type: "text",
            text: `${prompt}\n\nThis is Chapter ${chapterNumber}: "${chapterTitle}". Extract all numbered exercises.`,
          },
        ],
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(text) as { chapter: { problems: ExtractedProblem[] } };
  return parsed.chapter.problems;
}

async function tagChapterProblems(
  chapterNumber: number,
  chapterTitle: string,
  problems: ExtractedProblem[]
): Promise<TaggerProblem[]> {
  const systemPrompt = loadPrompt("tagger");

  const problemsList = problems
    .map((p) => `Problem ${p.number}:\n${p.statement}`)
    .join("\n\n---\n\n");

  console.log(`  Tagging ${problems.length} problems…`);
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Chapter ${chapterNumber}: ${chapterTitle}\n\n${problemsList}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = JSON.parse(text) as { problems: TaggerProblem[] };
  return parsed.problems;
}

async function main() {
  const args = parseArgs();
  const manifestPath = args.manifest;
  if (!manifestPath) {
    console.error("Usage: npm run extract-pdf -- --manifest books/<slug>.manifest.json [--chapters 1,2]");
    process.exit(1);
  }

  const manifest: Manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const pdfPath = path.resolve(manifest.pdfPath);

  if (!fs.existsSync(pdfPath)) {
    console.error(`PDF not found: ${pdfPath}`);
    process.exit(1);
  }

  const chaptersFilter = args.chapters
    ? new Set(args.chapters.split(",").map(Number))
    : null;

  const chapters = chaptersFilter
    ? manifest.chapters.filter((c) => chaptersFilter.has(c.number))
    : manifest.chapters;

  console.log(`\nExtracting from: ${manifest.title}\n`);

  const pdfBytes = fs.readFileSync(pdfPath);
  const outputChapters = [];

  for (const chapter of chapters) {
    console.log(`Chapter ${chapter.number}: ${chapter.title}`);
    console.log(`  Pages ${chapter.exerciseStartPage}–${chapter.exerciseEndPage}`);

    const pdfBase64 = await extractPagesAsPdf(
      pdfBytes,
      chapter.exerciseStartPage,
      chapter.exerciseEndPage
    );

    const extracted = await extractChapterProblems(
      pdfBase64,
      chapter.number,
      chapter.title
    );

    const tagged = await tagChapterProblems(chapter.number, chapter.title, extracted);

    // Merge extraction + tagging
    const mergedProblems = extracted.map((ep) => {
      const meta = tagged.find((t) => t.number === ep.number);
      return {
        number: ep.number,
        statement: ep.statement,
        sourcePageRef: ep.sourcePageRef,
        tags: meta?.tags ?? [],
        difficulty: meta?.difficulty ?? "MEDIUM",
        hints: meta?.hints ?? [],
      };
    });

    outputChapters.push({
      number: chapter.number,
      title: chapter.title,
      problems: mergedProblems,
    });

    console.log(`  Done — ${extracted.length} problems extracted.\n`);
  }

  const outputPath = path.join("books", `${manifest.slug}.json`);
  const output = {
    slug: manifest.slug,
    title: manifest.title,
    author: manifest.author,
    edition: manifest.edition,
    year: manifest.year,
    chapters: outputChapters,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nOutput written to: ${outputPath}`);
  console.log("Review and edit this file, then run: npm run ingest -- --book", outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
