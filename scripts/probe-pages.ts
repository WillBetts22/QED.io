/**
 * Diagnostic: describe what's on a range of PDF pages (for finding exercise locations).
 * Usage: npx tsx scripts/probe-pages.ts 236-241
 */
import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";
import { PDFDocument } from "pdf-lib";

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

async function extractPages(pdfPath: string, start: number, end: number): Promise<string> {
  const pdfBytes = fs.readFileSync(pdfPath);
  const src = await PDFDocument.load(pdfBytes);
  const sub = await PDFDocument.create();
  const idxs = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i)
    .filter(i => i >= 0 && i < src.getPageCount());
  const copied = await sub.copyPages(src, idxs);
  copied.forEach(p => sub.addPage(p));
  return Buffer.from(await sub.save()).toString("base64");
}

async function main() {
  const rangeArg = process.argv[2] ?? "236-241";
  const pdfArg = process.argv[3] ?? "Principles_of_Mathematical_Analysis-Rudin.pdf";
  const [start, end] = rangeArg.split("-").map(Number);

  console.log(`Probing PDF pages ${start}-${end} of ${pdfArg}…`);
  const b64 = await extractPages(pdfArg, start, end);

  const res = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } } as Anthropic.DocumentBlockParam,
        {
          type: "text",
          text: "Examine these PDF pages carefully. Tell me: (1) What chapter/section is on each page? (2) Are there any numbered exercises (labeled 1, 2, 3…)? If yes, list their numbers and the page each appears on. If no exercises, describe what content IS on the pages (theorems, proofs, definitions, etc.)."
        }
      ]
    }]
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  console.log(`\n${text}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
