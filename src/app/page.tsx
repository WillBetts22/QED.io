import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEMO_MODE, DEMO_PROBLEMS } from "@/lib/demo-data";

export default async function HomePage() {
  const session = DEMO_MODE ? null : await getServerSession(authOptions);

  let problemCount: number;
  let bookCount: number;

  if (DEMO_MODE) {
    problemCount = DEMO_PROBLEMS.length;
    bookCount = 1;
  } else {
    [problemCount, bookCount] = await Promise.all([
      prisma.problem.count(),
      prisma.book.count(),
    ]);
  }

  return (
    <div className="py-16 text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-5xl tracking-tight" style={{ color: "var(--chalk)" }}>QED.io</h1>
        <p className="text-xl max-w-xl mx-auto" style={{ color: "var(--chalk-dim)" }}>
          Practice writing rigorous proofs. Get instant AI feedback on logical soundness, gaps, and
          unjustified steps.
        </p>
      </div>

      <div className="flex justify-center gap-8 text-sm" style={{ color: "var(--chalk-faint)" }}>
        <div>
          <span className="block text-2xl" style={{ color: "var(--chalk)" }}>{problemCount}</span>
          problems
        </div>
        <div>
          <span className="block text-2xl" style={{ color: "var(--chalk)" }}>{bookCount}</span>
          {bookCount === 1 ? "book" : "books"}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Link href="/problems" className="chalk-btn-solid px-5 py-2.5 text-sm">
          Browse problems
        </Link>
        {!session && !DEMO_MODE && (
          <Link href="/auth/signup" className="chalk-btn px-5 py-2.5 text-sm">
            Create account
          </Link>
        )}
        {session && (
          <Link href="/dashboard" className="chalk-btn px-5 py-2.5 text-sm">
            My progress
          </Link>
        )}
      </div>

      <div className="mx-auto max-w-2xl pt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        {[
          {
            title: "Write in LaTeX",
            body: "A live LaTeX editor with instant preview. Write proofs the way mathematicians do.",
          },
          {
            title: "AI grading",
            body: "Claude acts as a rigorous grader: it finds logical gaps, unjustified steps, and circular arguments.",
          },
          {
            title: "Track progress",
            body: "Filter by book, chapter, topic, and difficulty. See exactly where you need more work.",
          },
        ].map(({ title, body }) => (
          <div key={title} className="chalk-panel p-5 text-left">
            <h3 className="mb-1" style={{ color: "var(--chalk)" }}>{title}</h3>
            <p className="text-sm" style={{ color: "var(--chalk-dim)" }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
