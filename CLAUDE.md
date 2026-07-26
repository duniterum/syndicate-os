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
**DEPLOY**: local rig running (studio + api against the real chain), the exact localhost URL
handed to the Founder, he reviews the REAL rendered page in his own browser, desktop AND
mobile width. **Only approval of what he SEES unlocks the deploy.**
**A COMMIT IS A SAVE POINT, NOT A PUBLICATION** (founder ruling 2026-07-26): work ships to
`main` in readable slices as it goes green — typecheck, guards, build — because nothing
reaches thesyndicate.money until he triggers the deploy. Committing early is what makes a
rejection CHEAP: `git revert` on one slice instead of untangling it from seventeen others.
(The rule was set after one session let 1,230 lines accumulate uncommitted across 18 files
while waiting for a screen it never needed to wait for.)
A rejection still costs nothing — revert the slice, record the verdict, **prod never moved.**
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

**THE WORK-FIRST PAGE LAW (founder, permanent, 2026-07-18 — the dashboard-scroll lesson).**
Grade-AAA composition on EVERY page, admin AND front end, applied at build time — never
after the founder complains page by page:
① The page opens on THE WORK — the actions, decisions, and figures its user came for.
② Diagnostic/verification/reference material is shown ONLY if necessary; otherwise it
lives in a COLLAPSED expander (retractable section, chevron, closed by default) at the
BOTTOM — one click away, never in the way. The user NEVER scrolls past reference
material to reach a button.
③ If information serves nobody on that page, it is not shown at all.
This is senior judgment owed on the FIRST build of every surface.

**THE DONE-IS-DONE LAW (founder, permanent, 2026-07-19 — "on avance de quelques pas
et tu nous fais reculer d'un pas ; 50 jours comme ça, insoutenable").**
A capability that SHIPPED must never be re-presented as future, re-planned, or
rebuilt — on any surface, in any doc, by any session. The named fossil: /member
Settings said "Notifications — Coming later" a day after notifications sealed live.
Mechanism (structural, never memorial):
① `artifacts/studio/src/config/featureStatus.ts` is the ONE live-vs-future truth,
in CODE. A slice that makes a capability live flips its key IN THE SAME COMMIT.
② `guard-feature-truth` (BLOCKING, in the guards chain) pins every user-visible
"coming" claim to a registry key: a claim on a live key = RED BUILD; an
unregistered new claim = RED; hardcoded "Coming later" outside the badge atom =
RED. The gate — not memory, not the founder — catches the fossil class forever.
③ Sessions: before writing ANY "coming/future/arrives" copy or re-opening ANY
capability, read featureStatus.ts. A "live" key is ANSWERED FOREVER (the
settled-law rule applies): build on it, never re-propose it.
④ End of every session: the SESSION_STATE boot block's WHERE-WE-ARE names, in
this order, (a) what went LIVE (with the registry flips), (b) what is IN FLIGHT
with its exact next step, (c) the founder's pending decisions — so the next
session resumes in one read, never re-derives.

**THE SETTLED-LAW SILENCE RULE (founder, permanent, 2026-07-19 — "j'en ai marre de
t'expliquer à chaque session ; règle-moi ça une bonne fois pour toutes").**
Two classes of SETTLED law kept resurfacing in founder-visible text. That stops here:
① **PII / addresses are settled LAW, never a discussion.** ADR-003 + `CANON_VISIBILITY_LAW`
+ the A1 honesty contract (locked again 2026-07-19 in OPEN_QUEUE): address ≠ identity —
chain-emitted addresses render short-form, we hide NOTHING on-chain; the red line is
name/alias/email; own-row, no directory. The GUARDS enforce it (boundary-aware scans,
auth-zone, forbidden-copy). Claude Code verifies through the guards SILENTLY and NEVER
shows the founder "leak/PII" as an open question, a review headline, a lens name, or a
risk to re-decide. Green guard = nothing to say; red guard = a bug report in human words.
**AND the word "PII" NEVER appears on any SURFACE a user or the founder READS** (founder
ruling 2026-07-25 — the red "SERVER-ONLY PII BOUNDARY" badge that resurfaced for weeks and
"m'a posé plus de problèmes que de services"): never a badge, label, tooltip, chip, or line
of copy — the human words are "personal data" / "account", and if the note serves nobody on
that surface it is not shown at all (WORK-FIRST §3). `guard-forbidden-copy` now BANS the word
"pii" (the internal `SERVER_ONLY_PII` risk-class TOKEN is word-boundary-safe and survives in
code; only a rendered or commented bare "PII" turns the build RED). The PII architecture is
stated ONCE in code/docs, never preached on a screen. No session re-introduces PII jargon on
any surface — ANSWERED FOREVER.
**THE ADDRESS MODEL — settled with legal backing (founder + deep online research 2026-07-25).**
A wallet ADDRESS is PUBLIC: shown, ranked, celebrated (the season board is the pride/vanity
feature). Display everywhere (public AND the founder admin) = SHORT-FORM `0x205D…f464` + an
explorer (Snowtrace) link on every row — the grade-AAA pattern (Hyperliquid · Etherscan ·
DeBank · Blast · Optimism gov): readability + independent verifiability. An address is NEVER
hidden or masked-as-security. Legal basis (general info, not legal advice; sources cited in the
2026-07-25 research task): a bare address is PSEUDONYMOUS, not "personal data" UNLESS linked to a
real identity — EDPB Guidelines 02/2025 on blockchain, CJEU *EDPS v SRB* (C-413/23 P, 2025), the
CCPA "reasonably linked" test; even OFAC and Etherscan publish addresses openly. The only
regulated artifact is the internal name↔address MAPPING — kept server-side, never queryable in
either direction (that IS the "never leaves the server" rule) — NOT the address. So the guards/
scanners protect the RED LINE (name/alias/email) + forbid a PUBLIC name↔address directory; they
must NOT block addresses or explorer links. **Any code that masks or fail-closes on an address as
if it were a secret is a BUG against this law** (the friend.tech lesson: the harm was a scraped
name↔identity directory, never the public addresses).
② **The word law extends to CHAT.** Everything the founder READS — reports, gates,
previews, review verdicts — speaks HUMAN words only. Bytecode/ABI vocabulary
("acquisitionCost"/"acquisition cost" — ruling 2026-07-13, the word is "commission" —
field names, protocol jargon) lives in code and technical docs ONLY. A banned word
surfacing in a chat report is the same defect class the copy guard kills on public
surfaces. These laws are ANSWERED FOREVER (the 2026-07-17 standing rule applies):
no agent re-opens, re-explains, or re-asks them — in any form, on any surface.

**THE HEARTBEAT COMPLETENESS INVARIANT (founder, permanent, 2026-07-15 — STEP 4 of the
complete-heartbeat order).** Any future contract or protocol wallet joins the heartbeat
inventory (scan targets + read-model + §8 sentence + /activity) **in the same slice that
introduces it** — the feed's completeness is an invariant, never a backlog.

**STANDING RULE — the SEO layer rides the slice (founder, permanent, 2026-07-14 — Invariant-vs-State
applied to metadata).** A slice that changes a page's REALITY updates that page's
meta/OG/JSON-LD/title AND its source-status/posture entries **in the SAME commit**. A page
whose reality moved while its served head stood still is a truth bug (the read-only-era
pattern: every pre-C5 page kept announcing the dead era to Google). Enforcement:
`guard-era-drift` (studio) + `source-status-truth:guard` (api) go red on the vocabulary
class; the rule covers what no pattern can name.

**THE PRE-HANDOFF GATE (founder, permanent, 2026-07-22 — the /activity triple-failure
lesson: type drift off the approved mockup · a hotfix page-cap violating the engraved
full-screen law · a truth-doc arithmetic slip; "90% de mon temps et mon argent à te
corriger — inadmissible").**
① Before ANYTHING founder-visible — previews, deploy prompts, AND hotfixes made under
founder correction — Claude Code diffs the built surface against the approved mockup
ELEMENT BY ELEMENT (font face + size per element · width behavior · meta-to-text
proximity) AND runs the change against the engraved-law list (full-screen S7-d: never
a page cap on an app surface, multiply columns · readability floor · WORK-FIRST ·
one primary CTA · Visibility Law · the two business red lines). **A hotfix is never
exempt — that is exactly where the page-cap fault was born.**
② A founder-caught defect is fixed FROM the governing law — name it, quote it, design
the fix from it — never from the complaint's surface symptom.
③ Every figure written into any doc is RECOUNTED from its own list before commit.
④ CONTEXT ECONOMY (the founder's context and credits are his money): bulk reading goes
to subagents that return synthesis; targeted reads over whole-file reads; ONE
consolidated docs update per slice; aim right the first time — a correction cycle
costs real dollars and the weekly quota.

⑤ **THE VERIFICATION PROTOCOL — measure the THING, never a proxy** (founder, 2026-07-26:
*"apprends de tes erreurs car ça nous coûte cher, des omissions qui sont simplement
évitables"*). Three sloppy verifications in ONE day, same shape each time — a proxy measured
and reported as the thing, or a category invented on top of a fact that was itself correct:
counted HTML **tags** and called a **visual** mockup "structure perfect" (its bars rendered
as giant blobs); quoted WCAG 1.4.8's 80-character line as a **legal** ceiling when it is
level **AAA**, a recommendation (legal baselines are AA, silent on line length); queried
`0x…dEaD` — Avalanche's **universal** burn address — and read the result as **our** burns
(200 rows of SPORE/BAMBOO from 2021; filtered on our token: **9 burns, one sender**).
**THE THREE CHECKS, before any claim reaches the founder:**
① **The thing, not a proxy.** A VISUAL claim needs pixels/geometry (`getBoundingClientRect`,
overlap + escape checks, `img.decode()` then `naturalWidth` — a fixed sleep is not a decode).
Never DOM-text presence, never tag counts.
② **Never upgrade a fact's category.** State the level with the fact: AAA ≠ AA ≠ law;
recommendation ≠ obligation. The number can be right while the frame is invented — and the
frame is what he acts on.
③ **Pin a query's SCOPE before reading its result.** A shared address, symbol or name means
the answer is probably someone else's. Ask "what would this return if my filter were
missing?" BEFORE looking, not after.
**AND THE REPORT SHAPE that prevents it:** say WHAT was measured, AT WHAT SCOPE, and WHAT IT
DOES NOT COVER — the discipline every guard header already carries. A clean-looking result is
exactly the moment to ask whether the question was well posed.

⑥ **A preview handed to the founder must be VISUALLY COMPLETE** (founder, 2026-07-14):
every asset loading (DOM-level check — each visible `img` has `naturalWidth > 0`), both
themes, desktop AND mobile — verified by Claude Code BEFORE handing the URL. A broken
preview costs founder trust and money. (Origin of the rule: the S3 preview shipped with
a broken throne image — a Git Bash `BASE_PATH=/` → `C:/Program Files/Git/` env
conversion had silently rebased the dev rig; launch the rig with
`MSYS2_ENV_CONV_EXCL="BASE_PATH"` and always run the image check.)
