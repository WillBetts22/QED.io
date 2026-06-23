import Link from "next/link";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NavBarClient from "./NavBarClient";

export default async function NavBar() {
  await cookies(); // forces dynamic render so Next 15 doesn't freeze the session
  const session = await getServerSession(authOptions);

  return (
    <nav className="border-b" style={{ borderColor: "var(--board-edge)" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg tracking-tight" style={{ color: "var(--chalk)" }}>
              QED.io
            </Link>
            <Link
              href="/problems"
              className="text-sm transition-colors"
              style={{ color: "var(--chalk-dim)" }}
            >
              Problems
            </Link>
            {session && (
              <Link
                href="/account"
                className="text-sm transition-colors"
                style={{ color: "var(--chalk-dim)" }}
              >
                Account
              </Link>
            )}
          </div>
          <NavBarClient session={session} />
        </div>
      </div>
    </nav>
  );
}
