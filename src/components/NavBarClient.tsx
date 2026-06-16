"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import type { Session } from "next-auth";

interface NavBarClientProps {
  session: Session | null;
}

export default function NavBarClient({ session }: NavBarClientProps) {
  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/auth/signin"
          className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700 transition-colors"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-slate-600">{session.user?.name ?? session.user?.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
