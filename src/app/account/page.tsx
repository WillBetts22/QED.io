import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import type { FSProblem, FSSubmission } from "@/lib/firestore-types";

export const metadata = { title: "Account | QED.io" };

const VERDICT_COLOR: Record<string, string> = {
  CORRECT: "var(--chalk-green)",
  FLAWED: "var(--chalk-rose)",
  INCOMPLETE: "var(--chalk-yellow)",
};

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const userId = session.user.id;

  const [problemsSnap, subSnap] = await Promise.all([
    adminDb.collection("problems").get(),
    adminDb.collection("submissions").where("userId", "==", userId).get(),
  ]);

  const allProblems = problemsSnap.docs.map((doc) => doc.data() as FSProblem);

  // Best verdict per problem: CORRECT wins over any other.
  const verdictMap = new Map<string, string>();
  for (const doc of subSnap.docs) {
    const d = doc.data() as FSSubmission;
    if (!verdictMap.has(d.problemId) || d.verdict === "CORRECT") {
      verdictMap.set(d.problemId, d.verdict);
    }
  }

  const statusOf = (id: string) => {
    const v = verdictMap.get(id);
    return v === "CORRECT" ? "SOLVED" : v ? "IN_PROGRESS" : "NOT_STARTED";
  };

  const solved = allProblems.filter((p) => statusOf(p.id) === "SOLVED").length;
  const inProgress = allProblems.filter((p) => statusOf(p.id) === "IN_PROGRESS").length;
  const notStarted = allProblems.filter((p) => statusOf(p.id) === "NOT_STARTED").length;

  // Chapter breakdown: only chapters with >=1 attempted problem.
  const chapters = new Map<string, { title: string; solved: number; total: number; attempted: number }>();
  for (const p of allProblems) {
    const key = `${p.bookSlug}-${p.chapterNumber}`;
    const c = chapters.get(key) ?? { title: `${p.bookTitle} — Ch ${p.chapterNumber}: ${p.chapterTitle}`, solved: 0, total: 0, attempted: 0 };
    c.total += 1;
    const s = statusOf(p.id);
    if (s === "SOLVED") c.solved += 1;
    if (s !== "NOT_STARTED") c.attempted += 1;
    chapters.set(key, c);
  }
  const chapterRows = [...chapters.values()].filter((c) => c.attempted > 0).sort((a, b) => a.title.localeCompare(b.title));

  // Tag breakdown: top 5 tags by solved count.
  const tagSolved = new Map<string, number>();
  for (const p of allProblems) {
    if (statusOf(p.id) !== "SOLVED") continue;
    for (const t of p.tags ?? []) tagSolved.set(t, (tagSolved.get(t) ?? 0) + 1);
  }
  const topTags = [...tagSolved.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Recent activity: last 5 submissions by submittedAt desc.
  const problemNumber = new Map(allProblems.map((p) => [p.id, p.number]));
  const recent = subSnap.docs
    .map((doc) => doc.data() as FSSubmission)
    .sort((a, b) => b.submittedAt.toDate().getTime() - a.submittedAt.toDate().getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl" style={{ color: "var(--chalk)" }}>Account</h1>
        <p className="text-sm mt-1" style={{ color: "var(--chalk-faint)" }}>
          {session.user.name ?? "—"}
          {session.user.email ? ` · ${session.user.email}` : ""}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Solved", count: solved, color: "var(--chalk-green)" },
          { label: "In progress", count: inProgress, color: "var(--chalk-yellow)" },
          { label: "Not started", count: notStarted, color: "var(--chalk-faint)" },
        ].map(({ label, count, color }) => (
          <div key={label} className="chalk-panel p-5 text-center">
            <div className="text-3xl" style={{ color }}>{count}</div>
            <div className="text-sm mt-1" style={{ color: "var(--chalk-faint)" }}>{label}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg" style={{ color: "var(--chalk)" }}>Chapter breakdown</h2>
        {chapterRows.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--chalk-faint)" }}>No attempted chapters yet.</p>
        ) : (
          <table className="chalk-panel w-full text-sm">
            <tbody>
              {chapterRows.map((c) => (
                <tr key={c.title} className="border-t" style={{ borderColor: "var(--board-edge)" }}>
                  <td className="px-4 py-2" style={{ color: "var(--chalk-dim)" }}>{c.title}</td>
                  <td className="px-4 py-2 text-right whitespace-nowrap" style={{ color: "var(--chalk)" }}>
                    {c.solved} / {c.total} solved
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg" style={{ color: "var(--chalk)" }}>Top topics</h2>
        {topTags.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--chalk-faint)" }}>Solve a problem to see your top topics.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span key={tag} className="chalk-chip">
                {tag} · {count}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg" style={{ color: "var(--chalk)" }}>Recent activity</h2>
        {recent.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--chalk-faint)" }}>No submissions yet.</p>
        ) : (
          <ul className="chalk-panel divide-y" style={{ borderColor: "var(--board-edge)" }}>
            {recent.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-3 px-4 py-2 text-sm border-t first:border-t-0"
                style={{ borderColor: "var(--board-edge)" }}
              >
                <span style={{ color: "var(--chalk-dim)" }}>
                  Problem {problemNumber.get(s.problemId) ?? s.problemId}
                </span>
                <span className="flex items-center gap-3">
                  <span className="chalk-chip" style={{ color: VERDICT_COLOR[s.verdict] ?? "var(--chalk-dim)" }}>
                    {s.verdict}
                  </span>
                  <span style={{ color: "var(--chalk-faint)" }}>
                    {s.submittedAt.toDate().toISOString().slice(0, 10)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
