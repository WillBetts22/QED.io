import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProblemCard from "@/components/ProblemCard";
import { DEMO_MODE, getDemoProblems, DEMO_BOOKS, DEMO_TAGS } from "@/lib/demo-data";
import type { ProblemSummary, ProblemStatus, Difficulty } from "@/types";

interface SearchParams {
  book?: string;
  chapter?: string;
  tag?: string;
  difficulty?: string;
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  let books: { slug: string; title: string }[];
  let tags: { name: string }[];
  let problemsWithStatus: ProblemSummary[];

  if (DEMO_MODE) {
    books = DEMO_BOOKS;
    tags = DEMO_TAGS;
    problemsWithStatus = getDemoProblems({
      book: params.book,
      difficulty: params.difficulty,
      tag: params.tag,
    });
  } else {
    const session = await getServerSession(authOptions);

    const [booksData, tagsData, problems] = await Promise.all([
      prisma.book.findMany({ select: { slug: true, title: true } }),
      prisma.tag.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
      prisma.problem.findMany({
        where: {
          ...(params.difficulty
            ? { difficulty: params.difficulty as Difficulty }
            : {}),
          chapter: {
            ...(params.chapter ? { number: parseInt(params.chapter) } : {}),
            book: { ...(params.book ? { slug: params.book } : {}) },
          },
          ...(params.tag ? { tags: { some: { tag: { name: params.tag } } } } : {}),
        },
        include: {
          chapter: { include: { book: true } },
          tags: { include: { tag: true } },
          ...(session?.user?.id
            ? {
                submissions: {
                  where: { userId: session.user.id },
                  orderBy: { submittedAt: "desc" },
                  take: 1,
                  select: { verdict: true },
                },
              }
            : {}),
        },
        orderBy: [
          { chapter: { book: { title: "asc" } } },
          { chapter: { number: "asc" } },
          { number: "asc" },
        ],
      }),
    ]);

    books = booksData;
    tags = tagsData;
    problemsWithStatus = problems.map((p) => {
      const subs = (p as { submissions?: { verdict: string }[] }).submissions ?? [];
      let status: ProblemStatus | undefined;
      if (session?.user) {
        if (subs.some((s) => s.verdict === "CORRECT")) status = "SOLVED";
        else if (subs.length > 0) status = "IN_PROGRESS";
        else status = "NOT_STARTED";
      }
      return {
        id: p.id,
        number: p.number,
        statement: p.statement,
        difficulty: p.difficulty as Difficulty,
        sourcePageRef: p.sourcePageRef,
        chapter: p.chapter,
        tags: p.tags,
        status,
      };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl" style={{ color: "var(--chalk)" }}>Problems</h1>
        <span className="text-sm" style={{ color: "var(--chalk-faint)" }}>
          {problemsWithStatus.length} problems
        </span>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3" method="GET">
        <select name="book" defaultValue={params.book ?? ""} className="chalk-input px-3 py-1.5 text-sm">
          <option value="">All books</option>
          {books.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.title}
            </option>
          ))}
        </select>

        <select name="difficulty" defaultValue={params.difficulty ?? ""} className="chalk-input px-3 py-1.5 text-sm">
          <option value="">Any difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select name="tag" defaultValue={params.tag ?? ""} className="chalk-input px-3 py-1.5 text-sm">
          <option value="">All topics</option>
          {tags.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        <button type="submit" className="chalk-btn-solid px-3 py-1.5 text-sm">
          Filter
        </button>

        {(params.book || params.difficulty || params.tag) && (
          <a href="/problems" className="chalk-btn px-3 py-1.5 text-sm">
            Clear
          </a>
        )}
      </form>

      {/* Grid */}
      {problemsWithStatus.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--chalk-faint)" }}>
          No problems match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {problemsWithStatus.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  );
}
