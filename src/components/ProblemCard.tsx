import Link from "next/link";
import LatexRenderer from "./LatexRenderer";
import type { ProblemSummary, ProblemStatus } from "@/types";

const difficultyColors: Record<string, string> = {
  EASY: "chalk-chip",
  MEDIUM: "chalk-chip",
  HARD: "chalk-chip",
};

const difficultyText: Record<string, string> = {
  EASY: "var(--chalk-green)",
  MEDIUM: "var(--chalk-yellow)",
  HARD: "var(--chalk-rose)",
};

const statusColors: Record<ProblemStatus, string> = {
  SOLVED: "var(--chalk-green)",
  IN_PROGRESS: "var(--chalk-yellow)",
  NOT_STARTED: "var(--chalk-faint)",
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
      className="chalk-panel block p-5 transition-all hover:brightness-110"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="text-xs" style={{ color: "var(--chalk-faint)" }}>
          {problem.chapter.book.title} · Ch. {problem.chapter.number} #{problem.number}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {problem.status !== undefined && (
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: statusColors[status] }}
              title={statusLabels[status]}
            />
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${difficultyColors[problem.difficulty]}`}
            style={{ color: difficultyText[problem.difficulty] }}
          >
            {problem.difficulty}
          </span>
        </div>
      </div>

      <div className="text-sm line-clamp-3 mb-3" style={{ color: "var(--chalk)" }}>
        <LatexRenderer content={problem.statement} />
      </div>

      <div className="flex flex-wrap gap-1">
        {problem.tags.slice(0, 3).map(({ tag }) => (
          <span key={tag.id} className="chalk-chip px-2 py-0.5 text-xs">
            {tag.name}
          </span>
        ))}
        {problem.tags.length > 3 && (
          <span className="chalk-chip px-2 py-0.5 text-xs">
            +{problem.tags.length - 3}
          </span>
        )}
      </div>
    </Link>
  );
}
