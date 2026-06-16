import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const problem = await prisma.problem.findUnique({
    where: { id },
    include: {
      chapter: { include: { book: true } },
      hints: { orderBy: { order: "asc" } },
      tags: { include: { tag: true } },
    },
  });

  if (!problem) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(problem);
}
