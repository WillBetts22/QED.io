/**
 * End-to-end Firestore test using the Admin SDK.
 *
 * Exercises the real read/write paths the app depends on:
 *   1. Create a test user (users collection)
 *   2. Read it back and verify fields
 *   3. Create a test submission (submissions collection)
 *   4. Read it back and verify the userId-only query path used by the app
 *   5. Clean up all test documents
 *
 * Usage:
 *   node --env-file=.env.local node_modules/.bin/tsx scripts/test-firebase.ts
 */
import { randomUUID } from "crypto";
import { adminDb } from "../src/lib/firebase-admin";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`Assertion failed: ${msg}`);
}

async function main() {
  const userId = `test_${randomUUID()}`;
  const submissionId = `test_${randomUUID()}`;
  const problemId = `test-problem-${randomUUID()}`;

  const userRef = adminDb.collection("users").doc(userId);
  const subRef = adminDb.collection("submissions").doc(submissionId);

  try {
    // 1. Create a test user
    console.log("1. Creating test user...");
    await userRef.set({
      id: userId,
      email: `${userId}@test.qed.io`,
      name: "Test User",
      image: null,
      createdAt: new Date(),
    });

    // 2. Read it back
    console.log("2. Reading test user back...");
    const userSnap = await userRef.get();
    assert(userSnap.exists, "user document should exist after write");
    const userData = userSnap.data()!;
    assert(userData.email === `${userId}@test.qed.io`, "user email should round-trip");
    assert(userData.name === "Test User", "user name should round-trip");
    console.log("   user read OK");

    // 3. Create a test submission
    console.log("3. Creating test submission...");
    await subRef.set({
      id: submissionId,
      userId,
      problemId,
      proof: "QED.",
      verdict: "CORRECT",
      feedback: { verdict: "CORRECT", summary: "test" },
      submittedAt: new Date(),
    });

    // 4. Read it back via the same query path the app uses (userId-only filter)
    console.log("4. Reading submission via userId query...");
    const subSnap = await adminDb
      .collection("submissions")
      .where("userId", "==", userId)
      .get();
    const found = subSnap.docs
      .map((d) => d.data())
      .filter((d) => d.problemId === problemId);
    assert(found.length === 1, `expected exactly 1 submission, got ${found.length}`);
    assert(found[0].verdict === "CORRECT", "submission verdict should round-trip");
    assert(found[0].proof === "QED.", "submission proof should round-trip");
    console.log("   submission read OK");

    console.log("\nAll checks passed.");
  } finally {
    // 5. Clean up — runs even if an assertion above fails
    console.log("5. Cleaning up test documents...");
    await Promise.allSettled([userRef.delete(), subRef.delete()]);

    const [u, s] = await Promise.all([userRef.get(), subRef.get()]);
    if (u.exists || s.exists) {
      console.warn("   WARNING: cleanup left documents behind", {
        user: u.exists ? userId : null,
        submission: s.exists ? submissionId : null,
      });
    } else {
      console.log("   cleanup OK");
    }
  }
}

main().catch((err) => {
  console.error("Test failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
