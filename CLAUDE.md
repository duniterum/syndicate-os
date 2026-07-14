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
- **🚀 DEPLOY — BATCHABLE (founder rule, 2026-07-14: each deploy costs ~10 min + $3-5)** —
  a deployable slice that breaks nothing while undeployed (client-only, fail-closed,
  additive; prod simply stays on the previous build) SAYS SO and rides the NEXT deploy
  instead of forcing its own. Claude Code keeps a one-line "deploy backlog" in
  SESSION_STATE listing every committed-not-yet-deployed slice; the next 🚀 DEPLOY
  carries them all, and Replit's verification covers the whole batch. Fixes to broken
  prod, schema/env changes, and anything the founder wants live NOW never batch.

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

**STANDING RULE — content decisions are read ON SCREEN (founder, permanent, 2026-07-14).**
Whenever CONTENT awaits the founder's decision — chronicle candidates, public copy, terms
wording, any words he must approve — the report pastes the FULL text INLINE in the chat
message. The founder decides on screen; he never opens repo files to read. File paths
alone are not a report.

**THE VISUAL CHANGE LAW (founder, permanent, 2026-07-14 — the W-HOME rejection's lesson).**
The founder is visual.
① Any change to a page's LAYOUT or COMPOSITION starts from a **founder-approved
wireframe** — before any code.
② Every slice that changes what a page looks like ends at the **PREVIEW GATE** before any
commit: local rig running (studio + api against the real chain), the exact localhost URL
handed to the founder, he reviews the REAL rendered page in his own browser, desktop AND
mobile width. **Only approval of what he SEES unlocks commit.** A rejection costs nothing —
revert clean, record the verdict, prod never moved.
③ Copy/truth-only changes need no wireframe but the full final text on screen (the
standing rule above).
**THE SYSTEM-FIRST LAW (founder, 2026-07-14, permanent — the gold-mine lesson).**
Before ANY slice that builds "a part of X" (an activity feed, a settings page, an admin
screen, notifications, milestones…), the gate MUST first present the COMPLETE inventory of
what X contains — in the origin repos AND in today's deployed reality — the whole system
on screen; the founder picks the scope FROM the full picture. Building 3 lanes when the
system has 15 classes is the named failure mode. HARVEST-BEFORE-BUILD applies at SYSTEM
scale, not slice scale. AND THE MIRROR RULE: the origin is a QUARRY, never a LAW — harvest
its completeness and ambition (it had far more machine than we've rebuilt), but its old
constraints, vocabulary, read-only reflexes and blockers NEVER ride back in with the
harvest. Today's system is MORE advanced; we take what the origin had MORE of, never what
held it back.

**STANDING RULE — the SEO layer rides the slice (founder, permanent, 2026-07-14 — Invariant-vs-State
applied to metadata).** A slice that changes a page's REALITY updates that page's
meta/OG/JSON-LD/title AND its source-status/posture entries **in the SAME commit**. A page
whose reality moved while its served head stood still is a truth bug (the read-only-era
pattern: every pre-C5 page kept announcing the dead era to Google). Enforcement:
`guard-era-drift` (studio) + `source-status-truth:guard` (api) go red on the vocabulary
class; the rule covers what no pattern can name.

④ **A preview handed to the founder must be VISUALLY COMPLETE** (founder, 2026-07-14):
every asset loading (DOM-level check — each visible `img` has `naturalWidth > 0`), both
themes, desktop AND mobile — verified by Claude Code BEFORE handing the URL. A broken
preview costs founder trust and money. (Origin of the rule: the S3 preview shipped with
a broken throne image — a Git Bash `BASE_PATH=/` → `C:/Program Files/Git/` env
conversion had silently rebased the dev rig; launch the rig with
`MSYS2_ENV_CONV_EXCL="BASE_PATH"` and always run the image check.)
