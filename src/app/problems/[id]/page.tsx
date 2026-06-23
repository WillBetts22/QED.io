import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import ProblemWorkspace from "./ProblemWorkspace";
import type { ProblemDetail, SubmissionResult, GraderFeedback, Difficulty } from "@/types";
import type { FSProblem } from "@/lib/firestore-types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await adminDb.collection("problems").doc(id).get();
  if (!doc.exists) return {};
  const p = doc.data() as FSProblem;
  return { title: `Problem ${p.number} — ${p.bookTitle} | QED.io` };
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const problemDoc = await adminDb.collection("problems").doc(id).get();
  if (!problemDoc.exists) notFound();
  const p = problemDoc.data() as FSProblem;

  const problemDetail: ProblemDetail = {
    id,
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
    hints: (p.hints ?? []).map((h) => ({ id: String(h.order), order: h.order, content: h.content })),
  };

  let pastSubmissions: SubmissionResult[] = [];
  if (session?.user?.id) {
    // Filter by userId only (single-field index, always available), then filter
    // problemId in memory. This avoids depending on a Firestore composite index.
    const subSnap = await adminDb
      .collection("submissions")
      .where("userId", "==", session.user.id)
      .get();
    pastSubmissions = subSnap.docs
      .map((doc) => doc.data())
      .filter((d) => d.problemId === id)
      .map((d) => {
        return {
          id: d.id as string,
          verdict: d.verdict as "CORRECT" | "FLAWED" | "INCOMPLETE",
          feedback: d.feedback as GraderFeedback,
          submittedAt: d.submittedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          proof: d.proof as string,
        };
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  return (
    <div>
      <ProblemWorkspace
        problem={problemDetail}
        isAuthenticated={!!session?.user}
        pastSubmissions={pastSubmissions}
      />
    </div>
  );
}
