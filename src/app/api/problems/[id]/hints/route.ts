import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEMO_MODE, getDemoProblem } from "@/lib/demo-data";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (DEMO_MODE) {
    const problem = getDemoProblem(id);
    return NextResponse.json(problem?.hints ?? []);
  }

  const hints = await prisma.hint.findMany({
    where: { problemId: id },
    orderBy: { order: "asc" },
    select: { id: true, order: true, content: true },
  });

  return NextResponse.json(hints);
}
