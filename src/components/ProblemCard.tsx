import Link from "next/link";
import LatexRenderer from "./LatexRenderer";
import type { ProblemSummary, ProblemStatus } from "@/types";

const difficultyColors: Record<string, string> = {
  EASY: "bg-emerald-100 text-emerald-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HARD: "bg-red-100 text-red-700",
};

const statusColors: Record<ProblemStatus, string> = {
  SOLVED: "bg-emerald-500",
  IN_PROGRESS: "bg-amber-400",
  NOT_STARTED: "bg-slate-200",
};

const statusLabels: Record<ProblemStatus, string> = {
  SOLVED: "Solved",
  IN_PROGRESS: "In progress",
  NOT_STARTED: "Not started",
};

interface ProblemCardProps {
  problem: ProblemSummary;
}

export default function ProblemCard({ problem }: ProblemCardProps) {
  const status = problem.status ?? "NOT_STARTED";

  return (
    <Link
      href={`/problems/${problem.id}`}
      className="block rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="text-xs text-slate-500 font-medium">
          {problem.chapter.book.title} · Ch. {problem.chapter.number} #{problem.number}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {problem.status !== undefined && (
            <span
              className={`inline-block h-2 w-2 rounded-full ${statusColors[status]}`}
              title={statusLabels[status]}
            />
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${difficultyColors[problem.difficulty]}`}
          >
            {problem.difficulty}
          </span>
        </div>
      </div>

      <div className="text-sm text-slate-800 line-clamp-3 mb-3">
        <LatexRenderer content={problem.statement} />
      </div>

      <div className="flex flex-wrap gap-1">
        {problem.tags.slice(0, 3).map(({ tag }) => (
          <span
            key={tag.id}
            className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
          >
            {tag.name}
          </span>
        ))}
        {problem.tags.length > 3 && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            +{problem.tags.length - 3}
          </span>
        )}
      </div>
    </Link>
  );
}
