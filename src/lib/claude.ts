import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import type { GraderFeedback } from "@/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const MODEL = "claude-sonnet-4-6";

function loadPrompt(name: string): string {
  return fs.readFileSync(path.join(process.cwd(), "prompts", `${name}.txt`), "utf-8");
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

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  return JSON.parse(text) as GraderFeedback;
}
