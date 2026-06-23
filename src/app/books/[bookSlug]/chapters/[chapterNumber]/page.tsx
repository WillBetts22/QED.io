import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import ProblemCard from "@/components/ProblemCard";
import LatexRenderer from "@/components/LatexRenderer";
import type { FSBook, FSProblem, FSChapter } from "@/lib/firestore-types";
import type { ProblemSummary, ProblemStatus, Difficulty } from "@/types";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ bookSlug: string; chapterNumber: string }>;
}) {
  await cookies();
  const { bookSlug, chapterNumber } = await params;
  const chapterNum = Number(chapterNumber);
  if (!Number.isInteger(chapterNum)) notFound();

  const session = await getServerSession(authOptions);

  const [bookDoc, chapterDoc, problemsSnap] = await Promise.all([
    adminDb.collection("books").doc(bookSlug).get(),
    adminDb.collection("chapters").doc(`${bookSlug}-${chapterNum}`).get(),
    adminDb
      .collection("problems")
      .where("bookSlug", "==", bookSlug)
      .where("chapterNumber", "==", chapterNum)
      .get(),
  ]);

  if (!bookDoc.exists) notFound();
  const book = bookDoc.data() as FSBook;
  const chapter = chapterDoc.exists ? (chapterDoc.data() as FSChapter) : null;

  const problems = problemsSnap.docs
    .map((doc) => doc.data() as FSProblem)
    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));

  if (problems.length === 0 && !chapter) notFound();

  const chapterTitle = chapter?.chapterTitle ?? problems[0]?.chapterTitle ?? "";

  // Latest verdict per problem; a CORRECT verdict always wins.
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

  const summaries: ProblemSummary[] = problems.map((p) => {
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
      <div className="text-sm" style={{ color: "var(--chalk-faint)" }}>
        <Link href="/books" className="chalk-link">Books</Link> /{" "}
        <Link href={`/books/${bookSlug}`} className="chalk-link">{book.title}</Link> / Chapter {chapterNum}
      </div>

      <div>
        <div className="text-xs" style={{ color: "var(--chalk-faint)" }}>Chapter {chapterNum}</div>
        <h1 className="text-2xl" style={{ color: "var(--chalk)" }}>{chapterTitle}</h1>
      </div>

      {chapter?.overview && (
        <div className="chalk-panel p-5">
          <LatexRenderer content={chapter.overview} />
        </div>
      )}

      {summaries.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--chalk-faint)" }}>
          No problems in this chapter yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {summaries.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  );
}
