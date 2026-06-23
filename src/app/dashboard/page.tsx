import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import ProblemCard from "@/components/ProblemCard";
import type { ProblemSummary, ProblemStatus, Difficulty } from "@/types";
import type { FSProblem } from "@/lib/firestore-types";

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

  const [problemsSnap, booksSnap, subSnap] = await Promise.all([
    adminDb.collection("problems").get(),
    adminDb.collection("books").get(),
    adminDb.collection("submissions").where("userId", "==", userId).get(),
  ]);

  const allProblems = problemsSnap.docs.map((doc) => doc.data() as FSProblem);
  const books = booksSnap.docs.map((doc) => ({ slug: doc.id, title: (doc.data() as { title: string }).title }));

  const tagSet = new Set<string>();
  for (const p of allProblems) {
    for (const t of p.tags ?? []) tagSet.add(t);
  }
  const tags = Array.from(tagSet).sort();

  const verdictMap = new Map<string, string>();
  for (const doc of subSnap.docs) {
    const d = doc.data();
    if (!verdictMap.has(d.problemId) || d.verdict === "CORRECT") {
      verdictMap.set(d.problemId, d.verdict);
    }
  }

  const problemsWithStatus: (ProblemSummary & { status: ProblemStatus })[] = allProblems
    .filter((p) => !params.book || p.bookSlug === params.book)
    .filter((p) => !params.difficulty || p.difficulty === params.difficulty)
    .filter((p) => !params.tag || p.tags.includes(params.tag))
    .sort((a, b) => {
      const bt = a.bookTitle.localeCompare(b.bookTitle);
      if (bt !== 0) return bt;
      if (a.chapterNumber !== b.chapterNumber) return a.chapterNumber - b.chapterNumber;
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    })
    .map((p) => {
      const v = verdictMap.get(p.id);
      const status: ProblemStatus = v === "CORRECT" ? "SOLVED" : v ? "IN_PROGRESS" : "NOT_STARTED";
      return {
        id: p.id,
        number: p.number,
        statement: p.statement,
        difficulty: p.difficulty as Difficulty,
        sourcePageRef: p.sourcePageRef,
        chapter: {
          id: `${p.bookSlug}-${p.chapterNumber}`,
          number: p.chapterNumber,
          title: p.chapterTitle,
          book: { id: p.bookSlug, title: p.bookTitle, author: p.bookAuthor, slug: p.bookSlug },
        },
        tags: p.tags.map((name) => ({ tag: { id: name, name } })),
        status,
      };
    });

  const solved = problemsWithStatus.filter((p) => p.status === "SOLVED").length;
  const inProgress = problemsWithStatus.filter((p) => p.status === "IN_PROGRESS").length;
  const notStarted = problemsWithStatus.filter((p) => p.status === "NOT_STARTED").length;

  const filtered = params.status
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

      <form className="flex flex-wrap gap-3" method="GET">
        {params.status && <input type="hidden" name="status" value={params.status} />}

        <select name="book" defaultValue={params.book ?? ""} className="chalk-input px-3 py-1.5 text-sm">
          <option value="">All books</option>
          {books.map((b) => (
            <option key={b.slug} value={b.slug}>{b.title}</option>
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
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <button type="submit" className="chalk-btn-solid px-3 py-1.5 text-sm">Filter</button>

        {(params.book || params.difficulty || params.tag || params.status) && (
          <a href="/dashboard" className="chalk-btn px-3 py-1.5 text-sm">Clear</a>
        )}
      </form>

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
