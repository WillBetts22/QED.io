import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProblemCard from "@/components/ProblemCard";
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
  const session = await getServerSession(authOptions);

  const [books, tags, problems] = await Promise.all([
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

  const problemsWithStatus: ProblemSummary[] = problems.map((p) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Problems</h1>
        <span className="text-sm text-slate-500">{problems.length} problems</span>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3" method="GET">
        <select
          name="book"
          defaultValue={params.book ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All books</option>
          {books.map((b) => (
            <option key={b.slug} value={b.slug}>
              {b.title}
            </option>
          ))}
        </select>

        <select
          name="difficulty"
          defaultValue={params.difficulty ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">Any difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select
          name="tag"
          defaultValue={params.tag ?? ""}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="">All topics</option>
          {tags.map((t) => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          Filter
        </button>

        {(params.book || params.difficulty || params.tag) && (
          <a
            href="/problems"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Clear
          </a>
        )}
      </form>

      {/* Grid */}
      {problemsWithStatus.length === 0 ? (
        <div className="py-16 text-center text-slate-500 text-sm">
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
