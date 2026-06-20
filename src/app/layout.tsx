import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "QED.io — Math Proof Practice",
  description: "Practice writing rigorous proofs. Get AI feedback on logical soundness.",
};

const DEMO_MODE = process.env.DEMO_MODE === "true";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Latin Modern — Computer Modern clone for the textbook/chalkboard feel */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/lm-webfont@1.0.0/style.css"
        />
      </head>
      <body>
        <SessionProvider>
          {DEMO_MODE && (
            <div
              className="border-b px-4 py-2 text-center text-xs"
              style={{
                borderColor: "var(--board-edge)",
                color: "var(--chalk-yellow)",
                backgroundColor: "rgba(242, 233, 200, 0.06)",
              }}
            >
              Demo mode — 3 sample problems, submissions graded by Claude but not saved.
            </div>
          )}
          <NavBar />
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
