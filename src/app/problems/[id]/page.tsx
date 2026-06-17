import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEMO_MODE, getDemoProblem } from "@/lib/demo-data";
import ProblemWorkspace from "./ProblemWorkspace";
import type { ProblemDetail, SubmissionResult, GraderFeedback } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (DEMO_MODE) {
    const p = getDemoProblem(id);
    if (!p) return {};
    return { title: `Problem ${p.number} — ${p.chapter.book.title} | QED.io` };
  }

  const problem = await prisma.problem.findUnique({
    where: { id },
    include: { chapter: { include: { book: true } } },
  });
  if (!problem) return {};
  return {
    title: `Problem ${problem.number} — ${problem.chapter.book.title} | QED.io`,
  };
}

export default async function ProblemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let problemDetail: ProblemDetail;
  let pastSubmissions: SubmissionResult[] = [];
  let isAuthenticated: boolean;

  if (DEMO_MODE) {
    const demoProblem = getDemoProblem(id);
    if (!demoProblem) notFound();
    problemDetail = demoProblem;
    isAuthenticated = true;
  } else {
    const session = await getServerSession(authOptions);

    const [problem, rawSubmissions] = await Promise.all([
      prisma.problem.findUnique({
        where: { id },
        include: {
          chapter: { include: { book: true } },
          hints: { orderBy: { order: "asc" } },
          tags: { include: { tag: true } },
        },
      }),
      session?.user?.id
        ? prisma.submission.findMany({
            where: { problemId: id, userId: session.user.id },
            orderBy: { submittedAt: "desc" },
            select: { id: true, verdict: true, feedback: true, submittedAt: true, proof: true },
          })
        : Promise.resolve([]),
    ]);

    if (!problem) notFound();

    problemDetail = {
      id: problem.id,
      number: problem.number,
      statement: problem.statement,
      difficulty: problem.difficulty as "EASY" | "MEDIUM" | "HARD",
      sourcePageRef: problem.sourcePageRef,
      chapter: problem.chapter,
      tags: problem.tags,
      hints: problem.hints,
    };

    pastSubmissions = rawSubmissions.map((s) => ({
      id: s.id,
      verdict: s.verdict as "CORRECT" | "FLAWED" | "INCOMPLETE",
      feedback: s.feedback as unknown as GraderFeedback,
      submittedAt: s.submittedAt.toISOString(),
      proof: s.proof,
    }));

    isAuthenticated = !!session?.user;
  }

  return (
    <div>
      <ProblemWorkspace
        problem={problemDetail}
        isAuthenticated={isAuthenticated}
        pastSubmissions={pastSubmissions}
      />
    </div>
  );
}
