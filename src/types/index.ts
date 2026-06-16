export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type Verdict = "CORRECT" | "FLAWED" | "INCOMPLETE";
export type ProblemStatus = "NOT_STARTED" | "IN_PROGRESS" | "SOLVED";

export type IssueType = "gap" | "unjustified" | "circular" | "incorrect" | "incomplete";

export interface GraderIssue {
  type: IssueType;
  location: string;
  explanation: string;
}

export interface GraderFeedback {
  verdict: Verdict;
  summary: string;
  issues: GraderIssue[];
}

export interface HintData {
  id: string;
  order: number;
  content: string;
}

export interface TagData {
  tag: { id: string; name: string };
}

export interface ProblemSummary {
  id: string;
  number: string;
  statement: string;
  difficulty: Difficulty;
  sourcePageRef: string | null;
  chapter: {
    id: string;
    number: number;
    title: string;
    book: { id: string; title: string; author: string; slug: string };
  };
  tags: TagData[];
  status?: ProblemStatus;
}

export interface ProblemDetail extends ProblemSummary {
  hints: HintData[];
}

export interface SubmissionResult {
  id: string;
  verdict: Verdict;
  feedback: GraderFeedback;
  submittedAt: string;
  proof?: string;
}

// ── Ingestion types ───────────────────────────────────────────────────────────

export interface BookHint {
  order: number;
  content: string;
}

export interface BookProblem {
  number: string;
  statement: string;
  sourcePageRef?: string;
  tags: string[];
  difficulty: Difficulty;
  hints: BookHint[];
}

export interface BookChapter {
  number: number;
  title: string;
  problems: BookProblem[];
}

export interface BookJson {
  slug: string;
  title: string;
  author: string;
  edition?: number;
  year?: number;
  chapters: BookChapter[];
}
