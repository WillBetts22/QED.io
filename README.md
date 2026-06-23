# QED.io

LeetCode for pure math. Pick a problem from a real textbook, write a proof in LaTeX, and get instant AI feedback on logical soundness.

[qed-io.vercel.app](https://qed-io.vercel.app)

## Deploy

1. Fork this repo and import it at [vercel.com/new](https://vercel.com/new)
2. In Vercel project settings → Environment Variables, add every variable from `.env.example`
3. Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g. `https://your-app.vercel.app`)
4. Set up GitHub OAuth at github.com/settings/developers — use `https://your-app.vercel.app/api/auth/callback/github` as the callback URL
5. Deploy — Vercel auto-deploys on every push to main
