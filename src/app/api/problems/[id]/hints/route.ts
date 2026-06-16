import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const hints = await prisma.hint.findMany({
    where: { problemId: id },
    orderBy: { order: "asc" },
    select: { id: true, order: true, content: true },
  });

  return NextResponse.json(hints);
}
