"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import LatexRenderer from "./LatexRenderer";
import FeedbackPanel from "./FeedbackPanel";
import type { GraderFeedback, SubmissionResult } from "@/types";

interface ProofEditorProps {
  problemId: string;
  isAuthenticated: boolean;
  initialProof?: string;
  pastSubmissions?: SubmissionResult[];
}

export default function ProofEditor({
  problemId,
  isAuthenticated,
  initialProof = "",
  pastSubmissions = [],
}: ProofEditorProps) {
  const [proof, setProof] = useState(initialProof);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState<GraderFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");

  const handleSubmit = async () => {
    if (!proof.trim()) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId, proof }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Submission failed");
      }
      const result: SubmissionResult = await res.json();
      setLatestFeedback(result.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-sm text-slate-600">
          <a href="/auth/signin" className="text-indigo-600 hover:underline font-medium">
            Sign in
          </a>{" "}
          to write and submit proofs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            onClick={() => setTab("write")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "write"
                ? "bg-white border-b-2 border-indigo-500 text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Write
          </button>
          <button
            onClick={() => setTab("preview")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              tab === "preview"
                ? "bg-white border-b-2 border-indigo-500 text-indigo-600"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Preview
          </button>
          <div className="ml-auto px-3 py-2 text-xs text-slate-400 self-center">LaTeX</div>
        </div>

        {/* Editor / Preview */}
        <div className="min-h-64">
          {tab === "write" ? (
            <CodeMirror
              value={proof}
              onChange={setProof}
              extensions={[markdown()]}
              className="text-sm"
              basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false }}
              placeholder="Write your proof here using LaTeX…&#10;&#10;Inline math: $x \in \mathbb{R}$&#10;Display math: $$\lim_{n \to \infty} a_n = L$$"
            />
          ) : (
            <div className="p-4 min-h-64">
              {proof.trim() ? (
                <LatexRenderer content={proof} className="text-sm text-slate-800" />
              ) : (
                <p className="text-sm text-slate-400 italic">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !proof.trim()}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Evaluating…" : "Submit Proof"}
        </button>
        {isSubmitting && (
          <span className="text-xs text-slate-500">
            Claude is grading your proof…
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Latest feedback */}
      {latestFeedback && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Feedback</h3>
          <FeedbackPanel feedback={latestFeedback} />
        </div>
      )}

      {/* Past submissions */}
      {pastSubmissions.length > 0 && !latestFeedback && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700 select-none">
            Past submissions ({pastSubmissions.length})
          </summary>
          <div className="mt-3 space-y-3">
            {pastSubmissions.map((sub) => (
              <div key={sub.id} className="space-y-2">
                <div className="text-xs text-slate-400">
                  {new Date(sub.submittedAt).toLocaleString()}
                </div>
                <FeedbackPanel feedback={sub.feedback} />
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
