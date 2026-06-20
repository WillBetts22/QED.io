import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { z } from "zod";
import type { GraderFeedback } from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-6";

function loadPrompt(name: string): string {
  return fs.readFileSync(path.join(process.cwd(), "prompts", `${name}.txt`), "utf-8");
}

const feedbackSchema = z.object({
  verdict: z.enum(["CORRECT", "FLAWED", "INCOMPLETE"]),
  summary: z.string(),
  issues: z.array(
    z.object({
      type: z.enum(["gap", "unjustified", "circular", "incorrect", "incomplete"]),
      location: z.string(),
      explanation: z.string(),
    })
  ),
});

// Claude is told to return bare JSON, but models occasionally wrap it in ```json
// fences or add a stray sentence. Strip fences, then grab the outermost {...}.
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("Grader returned no JSON object");
  }
  return body.slice(start, end + 1);
}

export async function evaluateProof(
  statement: string,
  proof: string
): Promise<GraderFeedback> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: loadPrompt("grader"),
    messages: [
      {
        role: "user",
        content: `Problem:\n${statement}\n\nProof:\n${proof}`,
      },
    ],
  });

  const text = response.content[0]?.type === "text" ? response.content[0].text : "";
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJson(text));
  } catch {
    throw new Error("Grader returned unparseable output");
  }
  return feedbackSchema.parse(parsed);
}
