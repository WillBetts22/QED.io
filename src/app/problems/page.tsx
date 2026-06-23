import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import ProblemCard from "@/components/ProblemCard";
import type { ProblemSummary, ProblemStatus, Difficulty } from "@/types";
import type { FSProblem } from "@/lib/firestore-types";

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

  const [problemsSnap, booksSnap] = await Promise.all([
    adminDb.collection("problems").get(),
    adminDb.collection("books").get(),
  ]);

  const allProblems = problemsSnap.docs.map((doc) => doc.data() as FSProblem);

  const tagSet = new Set<string>();
  for (const p of allProblems) {
    for (const t of p.tags ?? []) tagSet.add(t);
  }
  const tags = Array.from(tagSet).sort();
  const books = booksSnap.docs.map((doc) => ({ slug: doc.id, title: (doc.data() as { title: string }).title }));

  const filtered = allProblems
    .filter((p) => !params.book || p.bookSlug === params.book)
    .filter((p) => !params.chapter || String(p.chapterNumber) === params.chapter)
    .filter((p) => !params.difficulty || p.difficulty === params.difficulty)
    .filter((p) => !params.tag || p.tags.includes(params.tag))
    .sort((a, b) => {
      const bt = a.bookTitle.localeCompare(b.bookTitle);
      if (bt !== 0) return bt;
      if (a.chapterNumber !== b.chapterNumber) return a.chapterNumber - b.chapterNumber;
      return a.number.localeCompare(b.number, undefined, { numeric: true });
    });

  const verdictMap = new Map<string, string>();
  if (session?.user?.id) {
    const subSnap = await adminDb
      .collection("submissions")
      .where("userId", "==", session.user.id)
      .get();
    for (const doc of subSnap.docs) {
      const d = doc.data();
      if (!verdictMap.has(d.problemId) || d.verdict === "CORRECT") {
        verdictMap.set(d.problemId, d.verdict);
      }
    }
  }

  const problemsWithStatus: ProblemSummary[] = filtered.map((p) => {
    let status: ProblemStatus | undefined;
    if (session?.user) {
      const v = verdictMap.get(p.id);
      status = v === "CORRECT" ? "SOLVED" : v ? "IN_PROGRESS" : "NOT_STARTED";
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl" style={{ color: "var(--chalk)" }}>Problems</h1>
        <span className="text-sm" style={{ color: "var(--chalk-faint)" }}>
          {problemsWithStatus.length} problems
        </span>
      </div>

      <form className="flex flex-wrap gap-3" method="GET">
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

        {(params.book || params.difficulty || params.tag) && (
          <a href="/problems" className="chalk-btn px-3 py-1.5 text-sm">Clear</a>
        )}
      </form>

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
