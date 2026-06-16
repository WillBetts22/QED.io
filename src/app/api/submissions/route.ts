import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateProof } from "@/lib/claude";

const submitSchema = z.object({
  problemId: z.string().cuid(),
  proof: z.string().min(1).max(50000),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { problemId, proof } = parsed.data;

  const problem = await prisma.problem.findUnique({ where: { id: problemId } });
  if (!problem) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }

  const feedback = await evaluateProof(problem.statement, proof);

  const submission = await prisma.submission.create({
    data: {
      userId: session.user.id,
      problemId,
      proof,
      verdict: feedback.verdict,
      feedback,
    },
  });

  return NextResponse.json({
    id: submission.id,
    verdict: submission.verdict,
    feedback: submission.feedback,
    submittedAt: submission.submittedAt.toISOString(),
  });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const problemId = searchParams.get("problemId");

  const submissions = await prisma.submission.findMany({
    where: {
      userId: session.user.id,
      ...(problemId ? { problemId } : {}),
    },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      verdict: true,
      feedback: true,
      submittedAt: true,
      proof: true,
      problemId: true,
    },
  });

  return NextResponse.json(
    submissions.map((s) => ({ ...s, submittedAt: s.submittedAt.toISOString() }))
  );
}
