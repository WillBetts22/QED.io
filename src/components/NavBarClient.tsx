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
          className="text-sm transition-colors"
          style={{ color: "var(--chalk-dim)" }}
        >
          Sign in
        </Link>
        <Link href="/auth/signup" className="chalk-btn-solid px-3 py-1.5 text-sm">
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm" style={{ color: "var(--chalk-dim)" }}>
        {session.user?.name ?? session.user?.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-sm transition-colors"
        style={{ color: "var(--chalk-dim)" }}
      >
        Sign out
      </button>
    </div>
  );
}
