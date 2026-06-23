import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import { randomUUID } from "crypto";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).max(100).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  const existing = await adminDb
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();
  if (!existing.empty) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const id = randomUUID();
  await adminDb.collection("users").doc(id).set({
    id,
    email,
    name: name ?? null,
    image: null,
    passwordHash,
    createdAt: new Date(),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
