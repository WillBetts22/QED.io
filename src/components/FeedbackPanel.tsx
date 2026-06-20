"use client";

import type { GraderFeedback, Verdict } from "@/types";

const verdictConfig: Record<Verdict, { label: string; accent: string }> = {
  CORRECT: { label: "Correct ∎", accent: "var(--chalk-green)" },
  INCOMPLETE: { label: "Incomplete", accent: "var(--chalk-yellow)" },
  FLAWED: { label: "Flawed", accent: "var(--chalk-rose)" },
};

const issueTypeLabels: Record<string, string> = {
  gap: "Gap",
  unjustified: "Unjustified step",
  circular: "Circular reasoning",
  incorrect: "Incorrect",
  incomplete: "Incomplete",
};

interface FeedbackPanelProps {
  feedback: GraderFeedback;
}

export default function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  const config = verdictConfig[feedback.verdict];

  return (
    <div
      className="chalk-panel p-5 space-y-4"
      style={{ borderColor: config.accent }}
    >
      <div className="flex items-center gap-3">
        <span
          className="rounded-full border px-3 py-1 text-sm"
          style={{ color: config.accent, borderColor: config.accent }}
        >
          {config.label}
        </span>
        <p className="text-sm" style={{ color: "var(--chalk)" }}>
          {feedback.summary}
        </p>
      </div>

      {feedback.issues.length > 0 && (
        <div className="space-y-3">
          <h4
            className="text-xs uppercase tracking-wider"
            style={{ color: "var(--chalk-faint)" }}
          >
            Issues ({feedback.issues.length})
          </h4>
          {feedback.issues.map((issue, i) => (
            <div
              key={i}
              className="rounded p-4 space-y-2"
              style={{
                backgroundColor: "var(--board)",
                border: "1px solid var(--board-edge)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="chalk-chip px-2 py-0.5 text-xs">
                  {issueTypeLabels[issue.type] ?? issue.type}
                </span>
                <code
                  className="text-xs italic truncate max-w-xs"
                  style={{ color: "var(--chalk-faint)" }}
                >
                  &ldquo;{issue.location}&rdquo;
                </code>
              </div>
              <p className="text-sm" style={{ color: "var(--chalk-dim)" }}>
                {issue.explanation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
