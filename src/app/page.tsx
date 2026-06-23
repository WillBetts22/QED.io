import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  const [problemsSnap, booksSnap] = await Promise.all([
    adminDb.collection("problems").count().get(),
    adminDb.collection("books").count().get(),
  ]);

  const problemCount = problemsSnap.data().count;
  const bookCount = booksSnap.data().count;

  return (
    <div className="py-20 max-w-2xl mx-auto space-y-12">
      <div className="space-y-5">
        <h1 className="text-5xl tracking-tight" style={{ color: "var(--chalk)" }}>QED.io</h1>
        <p className="text-lg leading-relaxed" style={{ color: "var(--chalk-dim)" }}>
          A personal proof log. Pick up a math textbook, work through its exercises,
          and watch your progress accumulate — chapter by chapter, problem by problem.
        </p>
        <p className="text-base leading-relaxed" style={{ color: "var(--chalk-faint)" }}>
          Each problem is a place to write a real proof in LaTeX. Submit it and get
          detailed feedback: whether your argument is complete, where the gaps are,
          which steps need justification. Your history stays with you so you can
          see exactly how far you&apos;ve gotten and what&apos;s still left.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-3">
          {session ? (
            <Link href="/dashboard" className="chalk-btn-solid px-5 py-2.5 text-sm">
              My progress
            </Link>
          ) : (
            <Link href="/auth/signup" className="chalk-btn-solid px-5 py-2.5 text-sm">
              Get started
            </Link>
          )}
          <Link href="/books" className="chalk-btn px-5 py-2.5 text-sm">
            Browse books
          </Link>
        </div>
        <p className="text-xs" style={{ color: "var(--chalk-faint)" }}>
          {problemCount} problems across {bookCount} {bookCount === 1 ? "book" : "books"}
        </p>
      </div>

      <div className="space-y-3 pt-4 border-t" style={{ borderColor: "var(--chalk-faint)", opacity: 0.4 }} />

      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-medium mb-1" style={{ color: "var(--chalk)" }}>The idea</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--chalk-dim)" }}>
            Working through a math book is one of the best ways to learn mathematics,
            but it&apos;s easy to fool yourself — to skim a problem, write something vague,
            and move on. QED.io is a place to be honest with yourself about which problems
            you&apos;ve actually solved and which ones you haven&apos;t touched.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium mb-1" style={{ color: "var(--chalk)" }}>How it works</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--chalk-dim)" }}>
            Open a problem, write your proof in the editor, and submit. An AI grader reads
            your argument and tells you whether it&apos;s complete and correct, flawed, or
            incomplete — and why. Problems you&apos;ve solved stay green. Ones you&apos;ve attempted
            but not yet finished stay yellow. Your dashboard gives you the full picture.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-medium mb-1" style={{ color: "var(--chalk)" }}>Right now</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--chalk-dim)" }}>
            Every exercise from Rudin&apos;s <em>Principles of Mathematical Analysis</em> (3rd ed.)
            is here — all {problemCount} of them, organized by chapter. More books will follow.
          </p>
        </div>
      </div>
    </div>
  );
}
