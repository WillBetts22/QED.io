"use client";

import type { GraderFeedback, Verdict } from "@/types";

const verdictConfig: Record<
  Verdict,
  { label: string; bg: string; border: string; text: string; badge: string }
> = {
  CORRECT: {
    label: "Correct",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    badge: "bg-emerald-100 text-emerald-700",
  },
  INCOMPLETE: {
    label: "Incomplete",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    badge: "bg-amber-100 text-amber-700",
  },
  FLAWED: {
    label: "Flawed",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-800",
    badge: "bg-red-100 text-red-700",
  },
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
    <div className={`rounded-lg border ${config.border} ${config.bg} p-5 space-y-4`}>
      <div className="flex items-center gap-3">
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${config.badge}`}>
          {config.label}
        </span>
        <p className={`text-sm ${config.text}`}>{feedback.summary}</p>
      </div>

      {feedback.issues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Issues ({feedback.issues.length})
          </h4>
          {feedback.issues.map((issue, i) => (
            <div key={i} className="rounded-md bg-white border border-slate-200 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {issueTypeLabels[issue.type] ?? issue.type}
                </span>
                <code className="text-xs text-slate-500 italic truncate max-w-xs">
                  &ldquo;{issue.location}&rdquo;
                </code>
              </div>
              <p className="text-sm text-slate-700">{issue.explanation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
