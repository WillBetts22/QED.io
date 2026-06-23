import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import { evaluateProof } from "@/lib/claude";

const submitSchema = z.object({
  problemId: z.string().min(1),
  proof: z.string().min(1).max(50000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { problemId, proof } = parsed.data;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const problemDoc = await adminDb.collection("problems").doc(problemId).get();
  if (!problemDoc.exists) {
    return NextResponse.json({ error: "Problem not found" }, { status: 404 });
  }
  const problem = problemDoc.data()!;

  let feedback;
  try {
    feedback = await evaluateProof(problem.statement, proof);
  } catch {
    return NextResponse.json({ error: "Grading failed — please try again" }, { status: 502 });
  }

  const id = randomUUID();
  const submittedAt = new Date();
  await adminDb.collection("submissions").doc(id).set({
    id,
    userId: session.user.id,
    problemId,
    proof,
    verdict: feedback.verdict,
    feedback,
    submittedAt,
  });

  return NextResponse.json({
    id,
    verdict: feedback.verdict,
    feedback,
    submittedAt: submittedAt.toISOString(),
  });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const problemId = searchParams.get("problemId");

  // Filter by userId only (single-field index, always available), then filter
  // problemId in memory. This avoids depending on a Firestore composite index.
  const snap = await adminDb
    .collection("submissions")
    .where("userId", "==", session.user.id)
    .get();
  const submissions = snap.docs
    .map((doc) => doc.data())
    .filter((d) => !problemId || d.problemId === problemId)
    .map((d) => {
      return {
        id: d.id,
        verdict: d.verdict,
        feedback: d.feedback,
        proof: d.proof,
        problemId: d.problemId,
        submittedAt: d.submittedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };
    })
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  return NextResponse.json(submissions);
}
