import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NavBarClient from "./NavBarClient";

export default async function NavBar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
              QED.io
            </Link>
            <Link
              href="/problems"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Problems
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>
          <NavBarClient session={session} />
        </div>
      </div>
    </nav>
  );
}
