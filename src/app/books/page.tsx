import Link from "next/link";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase-admin";
import type { FSBook, FSProblem } from "@/lib/firestore-types";

export default async function BooksPage() {
  await cookies();

  const [booksSnap, problemsSnap] = await Promise.all([
    adminDb.collection("books").get(),
    adminDb.collection("problems").get(),
  ]);

  const books = booksSnap.docs.map((doc) => ({ ...(doc.data() as FSBook), slug: doc.id }));

  const countBySlug = new Map<string, number>();
  for (const doc of problemsSnap.docs) {
    const { bookSlug } = doc.data() as FSProblem;
    countBySlug.set(bookSlug, (countBySlug.get(bookSlug) ?? 0) + 1);
  }

  books.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl" style={{ color: "var(--chalk)" }}>Books</h1>

      {books.length === 0 ? (
        <div className="py-16 text-center text-sm" style={{ color: "var(--chalk-faint)" }}>
          No books yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((b) => (
            <Link
              key={b.slug}
              href={`/books/${b.slug}`}
              className="chalk-panel block p-5 transition-all hover:brightness-110"
            >
              <div className="text-lg mb-1" style={{ color: "var(--chalk)" }}>{b.title}</div>
              <div className="text-sm mb-3" style={{ color: "var(--chalk-dim)" }}>
                {b.author}{b.edition ? ` · ${b.edition} ed.` : ""}{b.year ? ` · ${b.year}` : ""}
              </div>
              <div className="text-xs" style={{ color: "var(--chalk-faint)" }}>
                {countBySlug.get(b.slug) ?? 0} problems
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
