import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { adminDb } from "./firebase-admin";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        if (!credentials?.email || !credentials?.password) return null;
        const snap = await adminDb
          .collection("users")
          .where("email", "==", credentials.email)
          .limit(1)
          .get();
        if (snap.empty) return null;
        const doc = snap.docs[0];
        const data = doc.data();
        if (!data.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, data.passwordHash);
        if (!valid) return null;
        return { id: doc.id, email: data.email, name: data.name ?? null, image: data.image ?? null };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github") {
        const docId = `gh_${user.id}`;
        const ref = adminDb.collection("users").doc(docId);
        const doc = await ref.get();
        if (!doc.exists) {
          await ref.set({
            id: docId,
            email: user.email ?? null,
            name: user.name ?? null,
            image: user.image ?? null,
            provider: "github",
            createdAt: new Date(),
          });
        } else {
          await ref.update({ name: user.name ?? null, image: user.image ?? null });
        }
        user.id = docId;
      }
      return true;
    },
    jwt({ token, user }: { token: JWT; user?: { id: string } }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
