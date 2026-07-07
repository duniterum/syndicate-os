# WORKFLOW — how Claude, Replit & GitHub work together

**Hard constraint:** Claude has **no direct connection** to GitHub or Replit. Claude cannot push, pull, access a
repo, or run on the server. Claude can only edit files in its own sandbox and run the dependency-free guards.
**The bridge is always the human (or the Replit Agent).**

## Source of truth
The **GitHub repo (under `duniterum`)**, connected to the Replit workspace via **Version Control**. That is the
durable state. Replit runs, typechecks, deploys, and provisions the database. Claude writes code + precise
instructions.

## The loop (every work session)
1. **Sync-in (human → Claude).** Give Claude the *current* repo: in Replit **⋮ → Download as zip** (or GitHub →
   Download ZIP), upload it to the chat. Now Claude edits the real current state — this prevents drift.
2. **Slices (Claude).** Claude makes small changes and runs the guards it can, then hands off **either** the
   changed files **or** a precise Replit-Agent prompt (exact paths + contents).
3. **Apply + validate (Replit).** Drop the files into the workspace (or give the Agent the prompt), then
   `pnpm install` (if a new dependency), `pnpm --filter @workspace/studio run guards`, `… typecheck`, run, deploy.
4. **Report (Replit → human → Claude).** Paste Replit's output back; Claude interprets and fixes.
5. **Commit + backup (Replit).** When green: **Version Control → Commit & Push** to GitHub. GitHub is the backup
   and the thing handed to Claude at the next sync-in.

## Which hand-off to use
- **Small slice (1–5 files):** changed files, or an Agent prompt.
- **Big / consolidation:** a single consolidated zip.

## Things only Replit can do (ask it)
`pnpm install` / `typecheck` / build / run / deploy · provision PostgreSQL (`DATABASE_URL`) · set Secrets
(`AVALANCHE_RPC_URL`, server-side only) · push/pull GitHub · anything needing the network or credentials.

## The one habit that keeps it smooth
**Sync-in first.** Human → Claude: the current zip at the start. Without it Claude guesses; with it, everything
lines up.
