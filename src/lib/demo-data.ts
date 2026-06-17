import type { ProblemDetail, ProblemSummary } from "@/types";

export const DEMO_MODE = process.env.DEMO_MODE === "true";

const BOOK = {
  id: "demo-book-1",
  title: "Principles of Mathematical Analysis",
  author: "Walter Rudin",
  slug: "rudin-pma",
};

const CHAPTERS = {
  ch1: { id: "demo-ch-1", number: 1, title: "The Real and Complex Number Systems", book: BOOK },
  ch3: { id: "demo-ch-3", number: 3, title: "Numerical Sequences and Series", book: BOOK },
};

export const DEMO_PROBLEMS: ProblemDetail[] = [
  {
    id: "demo-1",
    number: "1",
    statement:
      "If $r$ is rational ($r \\neq 0$) and $x$ is irrational, prove that $r + x$ and $rx$ are irrational.",
    difficulty: "EASY",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 2",
    chapter: CHAPTERS.ch1,
    tags: [{ tag: { id: "t-ordered-fields", name: "ordered fields" } }],
    hints: [
      {
        id: "h1-1",
        order: 1,
        content: "Suppose for contradiction that $r + x$ is rational.",
      },
      {
        id: "h1-2",
        order: 2,
        content:
          "Since $r$ is rational and (by assumption) $r + x$ is rational, what can you say about $(r + x) - r$?",
      },
      {
        id: "h1-3",
        order: 3,
        content:
          "For the $rx$ case: since $r \\neq 0$, the rational $1/r$ exists. If $rx$ were rational, then $(rx)(1/r) = x$ would be rational — contradiction.",
      },
    ],
  },
  {
    id: "demo-2",
    number: "2",
    statement: "Prove that there is no rational number $p$ such that $p^2 = 12$.",
    difficulty: "EASY",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 2",
    chapter: CHAPTERS.ch1,
    tags: [{ tag: { id: "t-ordered-fields", name: "ordered fields" } }],
    hints: [
      {
        id: "h2-1",
        order: 1,
        content:
          "Write $p = m/n$ where $m, n \\in \\mathbb{Z}$, $n > 0$, and $\\gcd(m, n) = 1$.",
      },
      {
        id: "h2-2",
        order: 2,
        content:
          "From $m^2 = 12n^2 = 4 \\cdot 3n^2$, conclude $4 \\mid m^2$, hence $2 \\mid m$. Write $m = 2k$.",
      },
      {
        id: "h2-3",
        order: 3,
        content:
          "Substitute $m = 2k$: you get $k^2 = 3n^2$, so $3 \\mid k$. Write $k = 3j$ and derive a contradiction with $\\gcd(m, n) = 1$.",
      },
    ],
  },
  {
    id: "demo-3",
    number: "1",
    statement:
      "Suppose $\\{s_n\\}$ is a sequence of nonnegative real numbers and $\\lim_{n \\to \\infty} s_n = s$. Prove that $\\lim_{n \\to \\infty} \\sqrt{s_n} = \\sqrt{s}$.",
    difficulty: "MEDIUM",
    sourcePageRef: "Rudin PMA, 3rd ed., p. 78",
    chapter: CHAPTERS.ch3,
    tags: [
      { tag: { id: "t-sequences", name: "sequences" } },
      { tag: { id: "t-limits", name: "limits" } },
    ],
    hints: [
      {
        id: "h3-1",
        order: 1,
        content:
          "Handle $s = 0$ separately: given $\\varepsilon > 0$, choose $N$ so that $s_n < \\varepsilon^2$ for all $n \\geq N$, giving $\\sqrt{s_n} < \\varepsilon$.",
      },
      {
        id: "h3-2",
        order: 2,
        content:
          "For $s > 0$, rationalize: $|\\sqrt{s_n} - \\sqrt{s}| = \\dfrac{|s_n - s|}{\\sqrt{s_n} + \\sqrt{s}}$.",
      },
      {
        id: "h3-3",
        order: 3,
        content:
          "Choose $N_1$ large enough that $s_n > s/2$ for all $n \\geq N_1$. Then $\\sqrt{s_n} + \\sqrt{s} > \\sqrt{s/2}$, bounding the denominator away from 0 so you can control the full expression.",
      },
    ],
  },
];

export const DEMO_BOOKS = [
  { slug: "rudin-pma", title: "Principles of Mathematical Analysis" },
];

export const DEMO_TAGS = [
  { name: "limits" },
  { name: "ordered fields" },
  { name: "sequences" },
];

export function getDemoProblem(id: string): ProblemDetail | undefined {
  return DEMO_PROBLEMS.find((p) => p.id === id);
}

export function getDemoProblems(): ProblemSummary[] {
  return DEMO_PROBLEMS.map(({ hints: _hints, ...rest }) => rest);
}
