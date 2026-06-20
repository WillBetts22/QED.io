"use client";

import LatexRenderer from "@/components/LatexRenderer";
import HintPanel from "@/components/HintPanel";
import ProofEditor from "@/components/ProofEditor";
import type { ProblemDetail, SubmissionResult } from "@/types";

const difficultyText: Record<string, string> = {
  EASY: "var(--chalk-green)",
  MEDIUM: "var(--chalk-yellow)",
  HARD: "var(--chalk-rose)",
};

interface ProblemWorkspaceProps {
  problem: ProblemDetail;
  isAuthenticated: boolean;
  pastSubmissions: SubmissionResult[];
}

export default function ProblemWorkspace({
  problem,
  isAuthenticated,
  pastSubmissions,
}: ProblemWorkspaceProps) {
  const initialProof = pastSubmissions[0]?.proof ?? "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: problem */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm" style={{ color: "var(--chalk-faint)" }}>
              {problem.chapter.book.title} · Ch. {problem.chapter.number} ·{" "}
              {problem.chapter.title}
            </span>
            <span
              className="chalk-chip rounded-full px-2 py-0.5 text-xs"
              style={{ color: difficultyText[problem.difficulty] }}
            >
              {problem.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {problem.tags.map(({ tag }) => (
              <span key={tag.id} className="chalk-chip px-2 py-0.5 text-xs">
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="chalk-panel p-6">
          <h2
            className="text-xs uppercase tracking-wider mb-4"
            style={{ color: "var(--chalk-faint)" }}
          >
            Problem {problem.number}
          </h2>
          <LatexRenderer content={problem.statement} className="leading-loose" />
          {problem.sourcePageRef && (
            <p className="mt-4 text-xs" style={{ color: "var(--chalk-faint)" }}>
              {problem.sourcePageRef}
            </p>
          )}
        </div>

        <HintPanel hints={problem.hints} />
      </div>

      {/* Right: editor */}
      <div className="space-y-4">
        <h2 className="text-sm" style={{ color: "var(--chalk-dim)" }}>Your proof</h2>
        <ProofEditor
          problemId={problem.id}
          isAuthenticated={isAuthenticated}
          initialProof={initialProof}
          pastSubmissions={pastSubmissions}
        />
      </div>
    </div>
  );
}
