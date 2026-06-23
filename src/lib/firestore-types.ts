export interface FSProblem {
  id: string;
  number: string;
  statement: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourcePageRef: string | null;
  bookSlug: string;
  bookTitle: string;
  bookAuthor: string;
  chapterNumber: number;
  chapterTitle: string;
  tags: string[];
  hints: { order: number; content: string }[];
}

export interface FSSubmission {
  id: string;
  userId: string;
  problemId: string;
  proof: string;
  verdict: "CORRECT" | "FLAWED" | "INCOMPLETE";
  feedback: Record<string, unknown>;
  submittedAt: { toDate(): Date };
}

export interface FSBook {
  slug: string;
  title: string;
  author: string;
  edition?: number;
  year?: number;
}

export interface FSUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  passwordHash?: string;
  provider?: string;
  createdAt: Date;
}
