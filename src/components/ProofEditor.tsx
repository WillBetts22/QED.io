"use client";

import { useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
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
      <div className="chalk-panel p-8 text-center">
        <p className="text-sm" style={{ color: "var(--chalk-dim)" }}>
          <a href="/auth/signin" className="chalk-link">
            Sign in
          </a>{" "}
          to write and submit proofs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="chalk-panel overflow-hidden">
        <CodeMirror
          value={proof}
          onChange={setProof}
          extensions={[markdown(), EditorView.lineWrapping]}
          theme="dark"
          className="text-sm"
          style={{ minHeight: "180px" }}
          basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false }}
          placeholder="Write your proof here using LaTeX…&#10;&#10;Inline math: $x \in \mathbb{R}$&#10;Display math: $$\lim_{n \to \infty} a_n = L$$"
        />
        <div className="border-t p-4" style={{ borderColor: "var(--board-edge)" }}>
          <div className="text-xs mb-2" style={{ color: "var(--chalk-faint)" }}>Preview</div>
          {proof.trim() ? (
            <LatexRenderer content={proof} className="text-sm" />
          ) : (
            <p className="text-sm italic" style={{ color: "var(--chalk-faint)" }}>
              Your proof will appear here…
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !proof.trim()}
          className="chalk-btn-solid px-4 py-2 text-sm"
        >
          {isSubmitting ? "Evaluating…" : "Submit Proof"}
        </button>
        {isSubmitting && (
          <span className="text-xs" style={{ color: "var(--chalk-faint)" }}>
            Claude is grading your proof…
          </span>
        )}
      </div>

      {error && (
        <div
          className="rounded px-4 py-3 text-sm"
          style={{
            color: "var(--chalk-rose)",
            border: "1px solid var(--chalk-rose)",
            backgroundColor: "rgba(233, 184, 176, 0.06)",
          }}
        >
          {error}
        </div>
      )}

      {/* Latest feedback */}
      {latestFeedback && (
        <div>
          <h3 className="text-sm mb-2" style={{ color: "var(--chalk-dim)" }}>Feedback</h3>
          <FeedbackPanel feedback={latestFeedback} />
        </div>
      )}

      {/* Past submissions */}
      {pastSubmissions.length > 0 && !latestFeedback && (
        <details className="group">
          <summary className="cursor-pointer text-sm select-none chalk-link">
            Past submissions ({pastSubmissions.length})
          </summary>
          <div className="mt-3 space-y-3">
            {pastSubmissions.map((sub) => (
              <div key={sub.id} className="space-y-2">
                <div className="text-xs" style={{ color: "var(--chalk-faint)" }}>
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
