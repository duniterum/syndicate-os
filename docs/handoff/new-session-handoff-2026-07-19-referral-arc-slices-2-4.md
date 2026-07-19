# HANDOFF — 2026-07-19 · The referral arc, slices 2 → 4 (one session)

**Boot order unchanged:** CANON_ACCESS_MODEL → MEMBER_HOME_FINISH_ORDER → BACKLOG.html →
OPEN_QUEUE → SESSION_STATE (this handoff is the session's narrative; those stay the authority).

## WHERE THE ARC STANDS (all founder-GO'd, in one day)
| Slice | State |
|---|---|
| ① elevation | ✅ PROD `d29765d` |
| ② the 5 tabs (real sub-routes) | ✅ PROD `5d9cb58` (Replit 7/7) |
| ③ `&via` channels (SPEC R3 whole: 3rd write zone `src/channel/`, 2-table MIGRATION, Privacy V2 + Terms §7, own-row breakdown) | ✅ PROD `a65df77` (migration cycle green; neondb tables confirmed) |
| 3.1 polish + channel composer | ✅ PROD `2893611` |
| 3.2 THE LINK HERO page structure (canon) | ✅ PROD `1aff636` |
| 3.3 vocabulary+rail fixes | ✅ repo `e975daa` — **🚀 BATCHED, undeployed** |
| ④ per-introduction rows (server+client) | ✅ repo [the 2026-07-19 final commit] — **🚀 REAL CYCLE READY, carries 3.3** |

**DEPLOY BACKLOG: 3.3 + ④ ride ONE Replit cycle — the block is at the bottom of this file.**

## WHAT ④ BUILT (no migration)
API: `introductionRowsModel.ts` (in-memory holder; SERVER-ONLY sourceId keys; rows =
isoDayUtc · block/logIndex · 64-hex tx · `who` ADR-003 short-form · commissionRaw · durable)
· `introductionRefresh` extended (tx-hash COLUMN in the select; decodedJson whitelist
UNCHANGED — introductions:guard 45/45 held; zero extra reads; leak-scanned; published with
the aggregate) · `GET /api/auth/introduction-rows` (D3 discipline verbatim).
Studio: `fetchOwnIntroductions` + shared `useOwnIntroductions` → Introductions rows table +
Commissions dated record; both PENDING_ADAPTER shells replaced.

## RECORDED GAPS / OPEN THREADS (do not re-discover)
- **Rate-raise history** stays a shell: SourceTermsUpdated indexed WITHOUT sourceId
  (topics not persisted) → needs decodeLifecycleLog+topics[1]+SOURCE_LIFECYCLE rescan.
- **Malformed-JSON → 400** on /api/channel/* = Express transport layer (same as auth zone);
  candidate one-line 204 swallow, never urgent.
- **Q34** ConnectModal setState-in-render dev warning — pre-existing, its own session.
- Founder's live channel test: use the FOUNDER-SIGNED link from the hero (his canonical
  source doesn't exist on-registry — a click on it is correctly dropped by the existence gate).
- NEXT slices: ⑤ commission anatomy (receipt-backed) · ⑥ recognition/season (Phase-5).

## RESEARCH LEDGER → `REFERRAL_PAGE_DESIGN.md` (5 workflows logged — NEVER re-search:
composer UX `wf_b01f310a` · page structure `wf_317c67c8` · rows map `wf_21cebd15` ·
&via invariants `wf_9fabf210` · the original benchmark pair). Mockups in docs/design are
STAMPED SUPERSEDED — the built canon outranks them.

## LESSONS ENGRAVED (memory + repo)
1. **The mockup gives pieces, never the order** — WORK-FIRST orders every member surface:
   the TOOL opens (the link), the pitch closes; never an empty opening; the link exactly
   ONCE page-wide (3.2's "mixed" duplication = the named failure mode).
2. **No offset focus-ring on tabs** (click-focus + any keypress lights :focus-visible → a
   floating rectangle); tint instead. **No -mb-px underline inside an overflow container**
   (1px overflow → Windows mini-scrollbar).
3. **Find the recorded ruling before wording money**: "acquisition cost/commission" was
   banned 2026-07-13 — now enforced IN guard-forbidden-copy (phrase bans) so it can't recur.
4. Hidden-pane: computed styles freeze under transitions — disable inline before reading.
5. The three-zone write-amendment grammar (constitution → named zone → guard section →
   COMPASS/replit.md one-liners → Privacy/Terms in the SAME commit) is now proven twice.

## THE REPLIT BLOCK (④ + the 3.3 batch — one cycle, NO migration)
```
Pull main (latest commit on 2026-07-19), build, deploy. Server + client —
NO DB migration, no env change. This cycle CARRIES the batched 3.3 commit
(e975daa) too; verify the whole batch:
1. /referral + 4 sub-routes → 200; anon program page unchanged (SEO intact).
2. Served entry contains: "Per-introduction record", "recognition title"
   (3.3), and NO "acquisition commission" anywhere.
3. After the first backbone cycle (~5 min): GET /api/auth/introduction-rows
   without a session → 200 {"state":"S1","rows":null,"asOfBlock":null,
   "failureReason":"no active wallet session; ..."}.
4. The wall holds (/admin /studio /os-map → 404) · /api/healthz ok · engine
   healthy (self-heal pattern known) · feed = reference.
5. Byte-identity: served entry JS == local build.
Report each point. The founder then signs in on /referral/introductions —
his 2 real rows (short-form wallets, Durable pills, $0.25 each, verify
links) are the living seal.
```
