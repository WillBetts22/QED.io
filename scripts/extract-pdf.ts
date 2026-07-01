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

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-sonnet-4-6";

function loadPrompt(name: string): string {
  return fs.readFileSync(path.join(process.cwd(), "prompts", `${name}.txt`), "utf-8");
}

function repairJsonEscapes(raw: string): string {
  // Walk the string character by character, fixing invalid escape sequences inside JSON strings.
  // This correctly handles LaTeX backslash commands (\omega, \nabla, \frac, etc.) that the
  // model sometimes writes without doubling the backslash.
  let result = '';
  let i = 0;
  let inString = false;

  while (i < raw.length) {
    const ch = raw[i];
    if (!inString) {
      result += ch;
      if (ch === '"') inString = true;
      i++;
    } else if (ch === '\\') {
      const next = raw[i + 1] ?? '';
      if (next === '"' || next === '\\' || next === '/' ||
          next === 'b' || next === 'f' || next === 'n' || next === 'r' || next === 't') {
        // Valid single-char JSON escape — pass through
        result += ch + next;
        i += 2;
      } else if (next === 'u' && /^[0-9a-fA-F]{4}$/.test(raw.slice(i + 2, i + 6))) {
        // Valid \uXXXX Unicode escape — pass through
        result += raw.slice(i, i + 6);
        i += 6;
      } else {
        // Invalid escape (LaTeX command like \omega, \frac, \in, etc.) — double the backslash
        result += '\\\\';
        i++;
      }
    } else if (ch === '"') {
      result += ch;
      inString = false;
      i++;
    } else if (ch.charCodeAt(0) < 0x20) {
      // Raw control character inside string — escape it
      result += `\\u${ch.charCodeAt(0).toString(16).padStart(4, '0')}`;
      i++;
    } else {
      result += ch;
      i++;
    }
  }
  return result;
}

function parseJsonRobust(text: string, label: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error(`${label}: no JSON object in response`);
  const raw = text.slice(start, end + 1);

  try { return JSON.parse(raw); } catch { /* fall through */ }

  const repaired = repairJsonEscapes(raw);
  try { return JSON.parse(repaired); } catch (e2) {
    console.error(`  Raw response (first 300 chars):\n${text.slice(0, 300)}`);
    throw new Error(`${label}: ${String(e2)}`);
  }
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

async function withRetry<T>(fn: () => Promise<T>, retries = 3, label = ""): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isTransient = String(err).includes("ECONNRESET") || String(err).includes("Connection error") || String(err).includes("ETIMEDOUT");
      if (!isTransient || attempt === retries) throw err;
      const wait = attempt * 5000;
      console.warn(`  ${label} transient error, retrying in ${wait / 1000}s… (attempt ${attempt}/${retries})`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
  throw new Error("unreachable");
}

async function extractChapterProblems(
  pdfBase64: string,
  chapterNumber: number,
  chapterTitle: string
): Promise<ExtractedProblem[]> {
  const prompt = loadPrompt("extractor");

  console.log(`  Extracting problems from PDF pages…`);
  const response = await withRetry(() => anthropic.messages.create({
    model: MODEL,
    max_tokens: 16000,
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
  }), 3, `Ch${chapterNumber} extract`);

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = parseJsonRobust(text, `Chapter ${chapterNumber} extractor`) as { chapter: { problems: ExtractedProblem[] } };
  return parsed.chapter.problems;
}

async function tagBatch(
  chapterNumber: number,
  chapterTitle: string,
  problems: ExtractedProblem[],
  systemPrompt: string
): Promise<TaggerProblem[]> {
  const problemsList = problems
    .map((p) => `Problem ${p.number}:\n${p.statement}`)
    .join("\n\n---\n\n");

  const response = await withRetry(() => anthropic.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Chapter ${chapterNumber}: ${chapterTitle}\n\n${problemsList}`,
      },
    ],
  }), 3, `Ch${chapterNumber} tag`);

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const parsed = parseJsonRobust(text, `Chapter ${chapterNumber} tagger`) as { problems: TaggerProblem[] };
  return parsed.problems;
}

async function tagChapterProblems(
  chapterNumber: number,
  chapterTitle: string,
  problems: ExtractedProblem[]
): Promise<TaggerProblem[]> {
  const systemPrompt = loadPrompt("tagger");
  const BATCH_SIZE = 20;

  if (problems.length <= BATCH_SIZE) {
    console.log(`  Tagging ${problems.length} problems…`);
    return tagBatch(chapterNumber, chapterTitle, problems, systemPrompt);
  }

  // Split into batches for large chapters
  const results: TaggerProblem[] = [];
  for (let i = 0; i < problems.length; i += BATCH_SIZE) {
    const batch = problems.slice(i, i + BATCH_SIZE);
    console.log(`  Tagging problems ${i + 1}–${i + batch.length} of ${problems.length}…`);
    const tagged = await tagBatch(chapterNumber, chapterTitle, batch, systemPrompt);
    results.push(...tagged);
  }
  return results;
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

  // Load existing output file so we can merge instead of overwrite
  const outputPath = path.join("books", `${manifest.slug}.json`);
  const existingOutput = fs.existsSync(outputPath)
    ? (JSON.parse(fs.readFileSync(outputPath, "utf-8")) as { slug: string; title: string; author: string; edition?: number; year?: number; chapters: { number: number; title: string; problems: unknown[] }[] })
    : null;

  const chapterMap = new Map(
    (existingOutput?.chapters ?? []).map((c) => [c.number, c])
  );

  for (const chapter of chapters) {
    console.log(`Chapter ${chapter.number}: ${chapter.title}`);
    console.log(`  Pages ${chapter.exerciseStartPage}–${chapter.exerciseEndPage}`);

    // Recursively split page ranges until each chunk is ≤7 pages (handles wide-range books like Spivak)
    async function extractRange(start: number, end: number): Promise<ExtractedProblem[]> {
      const count = end - start + 1;
      if (count <= 4) {
        const b64 = await extractPagesAsPdf(pdfBytes, start, end);
        return extractChapterProblems(b64, chapter.number, chapter.title);
      }
      const mid = Math.floor((start + end) / 2);
      console.log(`    Splitting ${start}–${end} → ${start}–${mid} | ${mid + 1}–${end}`);
      const part1 = await extractRange(start, mid);
      const part2 = await extractRange(mid + 1, end);
      return [...part1, ...part2];
    }

    console.log(`  Pages ${chapter.exerciseStartPage}–${chapter.exerciseEndPage}`);
    const rawExtracted = await extractRange(chapter.exerciseStartPage, chapter.exerciseEndPage);
    // Deduplicate by problem number (splits can overlap at boundaries)
    const seen = new Set<string>();
    const extracted = rawExtracted.filter((p) => {
      if (seen.has(p.number)) return false;
      seen.add(p.number);
      return true;
    });

    if (extracted.length === 0) {
      console.warn(`  WARNING: No problems extracted — skipping chapter ${chapter.number}.\n`);
      continue;
    }

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

    chapterMap.set(chapter.number, {
      number: chapter.number,
      title: chapter.title,
      problems: mergedProblems,
    });

    // Save incrementally after each chapter so progress isn't lost on failure
    const merged = {
      slug: manifest.slug,
      title: manifest.title,
      author: manifest.author,
      edition: manifest.edition,
      year: manifest.year,
      chapters: Array.from(chapterMap.values()).sort((a, b) => a.number - b.number),
    };
    fs.writeFileSync(outputPath, JSON.stringify(merged, null, 2));
    console.log(`  Done — ${extracted.length} problems extracted. (saved)\n`);
  }

  console.log(`\nOutput written to: ${outputPath}`);
  console.log("Review and edit this file, then run: npm run ingest -- --book", outputPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
