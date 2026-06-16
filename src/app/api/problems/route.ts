import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bookSlug = searchParams.get("book");
  const chapterNumber = searchParams.get("chapter");
  const tag = searchParams.get("tag");
  const difficulty = searchParams.get("difficulty");

  const problems = await prisma.problem.findMany({
    where: {
      ...(difficulty ? { difficulty: difficulty as "EASY" | "MEDIUM" | "HARD" } : {}),
      chapter: {
        ...(chapterNumber ? { number: parseInt(chapterNumber) } : {}),
        book: {
          ...(bookSlug ? { slug: bookSlug } : {}),
        },
      },
      ...(tag
        ? { tags: { some: { tag: { name: tag } } } }
        : {}),
    },
    include: {
      chapter: { include: { book: true } },
      tags: { include: { tag: true } },
    },
    orderBy: [
      { chapter: { book: { title: "asc" } } },
      { chapter: { number: "asc" } },
      { number: "asc" },
    ],
  });

  return NextResponse.json(problems);
}
