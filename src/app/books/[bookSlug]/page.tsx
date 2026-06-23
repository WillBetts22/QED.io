import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import type { FSBook, FSProblem } from "@/lib/firestore-types";

export default async function BookPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  await cookies();
  const { bookSlug } = await params;
  const session = await getServerSession(authOptions);

  const bookDoc = await adminDb.collection("books").doc(bookSlug).get();
  if (!bookDoc.exists) notFound();
  const book = bookDoc.data() as FSBook;

  const problemsSnap = await adminDb
    .collection("problems")
    .where("bookSlug", "==", bookSlug)
    .get();
  const problems = problemsSnap.docs.map((doc) => doc.data() as FSProblem);

  // Solved problem ids for this user (CORRECT verdict on any submission).
  // Filter verdict in memory to reuse the userId-only index the rest of the app uses.
  const solvedIds = new Set<string>();
  if (session?.user?.id) {
    const subSnap = await adminDb
      .collection("submissions")
      .where("userId", "==", session.user.id)
      .get();
    for (const doc of subSnap.docs) {
      if (doc.data().verdict === "CORRECT") solvedIds.add(doc.data().problemId);
    }
  }

  // Group problems into chapters.
  const chapters = new Map<number, { title: string; total: number; solved: number }>();
  for (const p of problems) {
    const c = chapters.get(p.chapterNumber) ?? { title: p.chapterTitle, total: 0, solved: 0 };
    c.total += 1;
    if (solvedIds.has(p.id)) c.solved += 1;
    chapters.set(p.chapterNumber, c);
  }
  const sortedChapters = [...chapters.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <div className="space-y-6">
      <div className="text-sm" style={{ color: "var(--chalk-faint)" }}>
        <Link href="/books" className="chalk-link">Books</Link> / {book.title}
      </div>

      <div>
        <h1 className="text-2xl" style={{ color: "var(--chalk)" }}>{book.title}</h1>
        <p className="text-sm" style={{ color: "var(--chalk-dim)" }}>{book.author}</p>
      </div>

      {sortedChapters.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--chalk-faint)" }}>
          No problems in this book yet.
        </div>
      ) : (
        <div className="space-y-3">
          {sortedChapters.map(([number, c]) => (
            <Link
              key={number}
              href={`/books/${bookSlug}/chapters/${number}`}
              className="chalk-panel flex items-center justify-between p-5 transition-all hover:brightness-110"
            >
              <div>
                <div className="text-xs" style={{ color: "var(--chalk-faint)" }}>Chapter {number}</div>
                <div className="text-base" style={{ color: "var(--chalk)" }}>{c.title}</div>
              </div>
              <div className="text-sm shrink-0" style={{ color: "var(--chalk-dim)" }}>
                {session?.user ? `${c.solved} / ${c.total} solved` : `${c.total} problems`}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
