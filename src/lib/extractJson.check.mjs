// check: node src/lib/extractJson.check.mjs
// Mirrors extractJson() in claude.ts (kept in sync by hand — it's 8 lines).
import assert from "node:assert";

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) throw new Error("no JSON");
  return body.slice(start, end + 1);
}

assert.strictEqual(extractJson('{"verdict":"CORRECT"}'), '{"verdict":"CORRECT"}', "bare json");
assert.strictEqual(
  extractJson('```json\n{"verdict":"FLAWED"}\n```'),
  '{"verdict":"FLAWED"}',
  "fenced json"
);
assert.strictEqual(
  extractJson('Here is my assessment:\n{"verdict":"INCOMPLETE"}\nDone.'),
  '{"verdict":"INCOMPLETE"}',
  "prose-wrapped"
);
assert.strictEqual(
  extractJson('{"issues":[{"type":"gap"}]}'),
  '{"issues":[{"type":"gap"}]}',
  "nested braces — lastIndexOf finds outer close"
);
assert.throws(() => extractJson("I cannot grade this."), "no json present");
assert.throws(() => extractJson(""), "empty");

console.log("extractJson: all checks passed");
