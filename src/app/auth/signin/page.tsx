"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  // useSearchParams must be inside a Suspense boundary for static prerender.
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl" style={{ color: "var(--chalk)" }}>Sign in</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--chalk-faint)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="chalk-link">
              Sign up
            </Link>
          </p>
        </div>

        {/* GitHub */}
        <button
          onClick={() => signIn("github", { callbackUrl })}
          className="chalk-btn w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm"
        >
          <GitHubIcon />
          Continue with GitHub
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "var(--board-edge)" }} />
          </div>
          <div className="relative flex justify-center text-xs" style={{ color: "var(--chalk-faint)" }}>
            <span className="px-2" style={{ backgroundColor: "var(--board)" }}>or</span>
          </div>
        </div>

        {/* Credentials */}
        <form onSubmit={handleCredentials} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--chalk-dim)" }} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="chalk-input w-full px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--chalk-dim)" }} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="chalk-input w-full px-3 py-2 text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--chalk-rose)" }}>{error}</p>
          )}

          <button type="submit" disabled={loading} className="chalk-btn-solid w-full px-4 py-2.5 text-sm">
            {loading ? "Signing in…" : "Sign in with email"}
          </button>
        </form>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
