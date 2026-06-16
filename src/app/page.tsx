import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const [problemCount, bookCount] = await Promise.all([
    prisma.problem.count(),
    prisma.book.count(),
  ]);

  return (
    <div className="py-16 text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">QED.io</h1>
        <p className="text-xl text-slate-500 max-w-xl mx-auto">
          Practice writing rigorous proofs. Get instant AI feedback on logical soundness, gaps, and
          unjustified steps.
        </p>
      </div>

      <div className="flex justify-center gap-8 text-sm text-slate-500">
        <div>
          <span className="block text-2xl font-bold text-slate-900">{problemCount}</span>
          problems
        </div>
        <div>
          <span className="block text-2xl font-bold text-slate-900">{bookCount}</span>
          {bookCount === 1 ? "book" : "books"}
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Link
          href="/problems"
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
        >
          Browse problems
        </Link>
        {!session && (
          <Link
            href="/auth/signup"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Create account
          </Link>
        )}
        {session && (
          <Link
            href="/dashboard"
            className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
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
          <div
            key={title}
            className="rounded-lg border border-slate-200 bg-white p-5 text-left shadow-sm"
          >
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
