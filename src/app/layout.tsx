import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "QED.io — Math Proof Practice",
  description: "Practice writing rigorous proofs. Get AI feedback on logical soundness.",
};

const DEMO_MODE = process.env.DEMO_MODE === "true";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          {DEMO_MODE && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800">
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
