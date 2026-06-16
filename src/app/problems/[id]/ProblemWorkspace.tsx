"use client";

import LatexRenderer from "@/components/LatexRenderer";
import HintPanel from "@/components/HintPanel";
import ProofEditor from "@/components/ProofEditor";
import type { ProblemDetail, SubmissionResult } from "@/types";

const difficultyColors: Record<string, string> = {
  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-red-100 text-red-700",
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
            <span className="text-sm text-slate-500">
              {problem.chapter.book.title} · Ch. {problem.chapter.number} ·{" "}
              {problem.chapter.title}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[problem.difficulty]}`}
            >
              {problem.difficulty}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {problem.tags.map(({ tag }) => (
              <span
                key={tag.id}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Problem {problem.number}
          </h2>
          <LatexRenderer content={problem.statement} className="text-slate-800 leading-loose" />
          {problem.sourcePageRef && (
            <p className="mt-4 text-xs text-slate-400">{problem.sourcePageRef}</p>
          )}
        </div>

        <HintPanel hints={problem.hints} />
      </div>

      {/* Right: editor */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">Your proof</h2>
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
