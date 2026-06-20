import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProblemCard from "@/components/ProblemCard";
import type { ProblemSummary, ProblemStatus, Difficulty } from "@/types";

interface SearchParams {
  status?: string;
  book?: string;
  difficulty?: string;
  tag?: string;
}

export const metadata = { title: "Dashboard | QED.io" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const params = await searchParams;
  const userId = session.user.id;

  const [books, tags, allProblems] = await Promise.all([
    prisma.book.findMany({ select: { slug: true, title: true } }),
    prisma.tag.findMany({ select: { name: true }, orderBy: { name: "asc" } }),
    prisma.problem.findMany({
      where: {
        ...(params.difficulty ? { difficulty: params.difficulty as Difficulty } : {}),
        chapter: {
          book: { ...(params.book ? { slug: params.book } : {}) },
        },
        ...(params.tag ? { tags: { some: { tag: { name: params.tag } } } } : {}),
      },
      include: {
        chapter: { include: { book: true } },
        tags: { include: { tag: true } },
        submissions: {
          where: { userId },
          orderBy: { submittedAt: "desc" },
          take: 1,
          select: { verdict: true },
        },
      },
      orderBy: [
        { chapter: { book: { title: "asc" } } },
        { chapter: { number: "asc" } },
        { number: "asc" },
      ],
    }),
  ]);

  const problemsWithStatus: (ProblemSummary & { status: ProblemStatus })[] = allProblems.map(
    (p) => {
      const subs = p.submissions;
      let status: ProblemStatus;
      if (subs.some((s) => s.verdict === "CORRECT")) status = "SOLVED";
      else if (subs.length > 0) status = "IN_PROGRESS";
      else status = "NOT_STARTED";

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
    }
  );

  const solved = problemsWithStatus.filter((p) => p.status === "SOLVED").length;
  const inProgress = problemsWithStatus.filter((p) => p.status === "IN_PROGRESS").length;
  const notStarted = problemsWithStatus.filter((p) => p.status === "NOT_STARTED").length;

  const filtered =
    params.status
      ? problemsWithStatus.filter((p) => p.status === params.status)
      : problemsWithStatus;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl" style={{ color: "var(--chalk)" }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--chalk-faint)" }}>
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Solved", count: solved, status: "SOLVED", color: "var(--chalk-green)" },
          { label: "In progress", count: inProgress, status: "IN_PROGRESS", color: "var(--chalk-yellow)" },
          { label: "Not started", count: notStarted, status: "NOT_STARTED", color: "var(--chalk-faint)" },
        ].map(({ label, count, status, color }) => (
          <Link
            key={status}
            href={`/dashboard?status=${status}${params.book ? `&book=${params.book}` : ""}${params.difficulty ? `&difficulty=${params.difficulty}` : ""}${params.tag ? `&tag=${params.tag}` : ""}`}
            className="chalk-panel p-5 text-center transition-all hover:brightness-110"
            style={params.status === status ? { borderColor: "var(--chalk-dim)" } : undefined}
          >
            <div className="text-3xl" style={{ color }}>{count}</div>
            <div className="text-sm mt-1" style={{ color: "var(--chalk-faint)" }}>{label}</div>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3" method="GET">
        {params.status && (
          <input type="hidden" name="status" value={params.status} />
        )}

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

        {(params.book || params.difficulty || params.tag || params.status) && (
          <a href="/dashboard" className="chalk-btn px-3 py-1.5 text-sm">
            Clear
          </a>
        )}
      </form>

      {/* Problems */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--chalk-faint)" }}>
          No problems match these filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  );
}
