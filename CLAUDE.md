# CLAUDE.md — how we work (read first, every session)

**Read `docs/00_START_HERE.md` first** — the whole-protocol entry point (what the OS is,
locked doctrine, the layers, the ORDER to grade-AAA, roles). Then this file for how we work.

**Canon.** Read `docs/00_CANON_INDEX.md`, then the TIER 0/1 docs it lists —
especially `THE_SYNDICATE_OS_COMPASS.md` (constitution), `docs/adr/ADR-001-design-system-et-methodologie.md`,
`docs/adr/ADR-002-protocole-anti-derive.md` (anti-drift protocol + the gate),
`docs/FOUNDATION_SPEC.md`, `docs/DESIGN_ROADMAP.md`. Follow ADR-002: boot → 4-line
handshake → gate before every proposal → slice by slice → ask before commit/push.

**Roles.**
- **Claude Code = the only code author.** Edit, run build + guards locally, show the diff
  for approval, commit, push to `main`. Never bypass the gate.
- **Replit = deploy + runtime only** (env vars, DB, live API, thesyndicate.money). It does
  NOT edit code. It pulls `main`, deploys, runs DB migrations, and reports.
- **GitHub `main` = single source of truth.** Only Claude Code edits code; Replit only
  pulls + deploys. Never let both edit (git divergence).

**Deploy verdict — MANDATORY at the end of every slice.**
The founder is non-technical and must NEVER have to judge whether a slice needs deploying.
So at the end of each slice, Claude Code states, in ONE clear line, a verdict:
- **🚀 DEPLOY** — if the slice changes anything visible on thesyndicate.money, or touches
  DB schema/migrations, env/config, or server/runtime behavior. Then give the exact
  instruction to hand Replit: *"pull main, deploy, run migrations, report."*
- **✅ NO DEPLOY** — if it's a pure internal/code change fully verified by local
  build + guards (e.g. an atom not yet wired to a visible surface). Safe to continue.

When a deploy is done, the founder pastes Replit's report back here; Claude Code then acts
on the real runtime truth (render, DB, errors) and fixes anything server-specific.

**Design roadmap — the single source of truth for the design workstream.**
`docs/DESIGN_ROADMAP.md` is canon: everyone (founder, Claude Code, Claude-advice, Replit)
works from that one map — nobody goes off on their own. STANDING RULE: at the END of every
design slice, Claude Code ticks the boxes for what landed and updates the color-sprawl count
in `DESIGN_ROADMAP.md`, **in the same commit as the slice**. Never keep design status "in
your head."

**Founder-facing communication.** The founder can't follow deep technical detail. Keep it
simple: state the gate (4 lines), the diff to approve, and the deploy verdict. Decide the
technical choices yourself (grade-AAA best practices) — don't ask him to judge them.
