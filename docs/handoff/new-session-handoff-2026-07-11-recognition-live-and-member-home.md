# SESSION HANDOFF — 2026-07-11 (later) · recognition LIVE + Member Home plan

*Boot doc for a fresh session. Written from the repo + this session's real history. A new session
boots on `docs/SESSION_STATE.md` → THIS doc → `docs/direction/OPEN_QUEUE.md` and continues with ZERO
amnesia. If this disagrees with a source file, the file wins (Compass §1); fix the pointer.*
**The founder must never re-explain anything below. It is all settled.**

---

## 1. What shipped this session (prod), newest first — all on `main`, live-verified by Replit

| Commit | What | State |
|---|---|---|
| `8150d72` | **Option A — member's own on-chain receipt** (ADR-003 §3). `member-standing` returns own-row `receipt{transaction,block,explorerUrl}` (canonical `txUrl()`); cockpit shows it + "Share my proof". | LIVE |
| `e594b01` | Removed the contradictory `S4 · SIGNED — UNVERIFIED` chip from the public header. | LIVE |
| `3fa72de` | Clean member era label (gold "Genesis" badge; no raw `V3_EMITTED`). | LIVE |
| `e4f07ba` | **ADR-003 — Identity & privacy, anti-doxx by design** (TIER-0 canon). | on main |
| `ffd8428` | `member-continuity.guard` — scope `verifyLinks.ts` (infra-only) into the route surface. | LIVE |
| `50db814` | `partBImportGate` — V3 corroboration tolerant of the live seat count (contiguous run from #9). | LIVE |
| `87f7a1d` | **Q26 Fix C — recognize EVERY member** (live V3 for #9+ · frozen genesis roster #1–#8). | LIVE |
| `3277ded` | SIWE signs for canonical `thesyndicate.money`. | LIVE |
| `00676d4` | Q25 member identity menu (Disconnect, verify, copy). | LIVE |

**The whole member-recognition arc is LIVE in production**: auth on, SIWE signs for the canonical
domain, member identity menu, and every member recognized — genesis #1–#8 (frozen roster, reconciled
on-chain vs `V1_MEMBER_ROOT`) AND V3 #9–#12 (live `memberNumberOf`). The **prod DB roster is populated
and verified** (12 = 8 + 4 VERIFIED); the prod-write barrier was restored (secret deleted).

## 2. THE EXACT NEXT STEP (strict order — do not jump)

**DONE (on `main`):** ✅ green main = 7 stale-guard fixes (`a83d812`, 16/16 Linux-verified) · ✅ Q28
`surfaceNaming.ts` + BLOCKING `guard-surface-naming` + the 52-site sweep, all "cockpit"/"Member OS"/
"control tower" leaks cleared (`c1d6700`) · ✅ the wire widened: `WIRABLE_ACCESS_STATES = ["S1","S4","S7","S11"]`,
elevation resolved SERVER-side in `walletSession.resolveWiredAccessState` (S4→S7 member→S11 operator,
fail-closed to S1, never a client claim), `guard-access-state` updated (688), the false "no wired source"
comment rewritten in `accessState.ts` + `AccessStateProvider` (this commit). **The app now KNOWS you are a
member — the prerequisite for Member Home is in place.**

**NEXT →** **Member Home** (§4 spec). Then: the action registry → the member's other doors, one page at a
time → `/join` real purchase path (**APPROVE ≠ PAYMENT**, §3). Two shells + no-twin-pages (§3) govern it.

## 3. FOUNDER DECISIONS — settled, NEVER re-litigate

### NAMING CANON
- `/member` → **"Member Home"**. The identity block inside it → **"Your Seat"**. The header link to it →
  **"Membership"** (the concept, not the page). `/studio` `/admin` `/founder` → **"Console"**. The member's
  introduction network → **"My Syndicate"**. **"dashboard"** = common noun ONLY, never a page name, H1, or
  nav label.
- **BANNED** as screen names and in prose: `cockpit`, `member os`, `member access`, `lobby`, `user lobby`,
  `connected lobby`, `control tower`, `operating surface`, `trust surface`, `proof surface`, `member path`.
  (Existing FILE names like `MemberAccess.tsx` are fine — this governs what the USER reads + what agents
  write in prose.)
- **WHY:** grounded in what Coinbase (Portfolio), Revolut, Kraken, Binance (Wallet), Interactive Brokers,
  Stripe, Shopify, AWS actually do, plus NN/g: a page is named after **THE OBJECT THE USER OWNS**, never a
  metaphor, never a brand term. A Syndicate member owns a **SEAT** (canonical in the contract, the receipt,
  the doctrine). **"cockpit" dies** because it is the SAME pilot-seat metaphor as "console" for the OPPOSITE
  audience — that collision is the bug.
- **WHY A GUARD:** the only vocabulary that NEVER drifted in six months is the source vocabulary — because
  it has a config + a guard. Surface naming had no guard → it reached ELEVEN names for three things. A guard
  cannot catch a lie it has no word for.

### NAMING GUARD SCOPE (Q28) — APPROVED keep-vs-rename decision (canon; do NOT silently widen)
**Finding: not 11 names — `52 sites`** (30 "cockpit" · 7 "member os" · 8 "control tower" · 7 "proof surface").
That scale IS the proof the guard is necessary. `config/surfaceNaming.ts` is COMMITTED (the canon the guard
imports: `surfaceNames`, `bannedSurfaceNames`, `commonNounOnly`). The BLOCKING `guard-surface-naming` (built
NEXT session, step one) scans studio source with these EXACT, founder-approved rules — word-boundary,
case-insensitive; the config + guard files self-exempt (must name the terms to ban them):
- **Rendered labels the user reads → RENAME** to `surfaceNames` canon.
- **Agent prose / comments → REWORD.**
- **Internal id-key values** (e.g. `registryId:"member-cockpit"`, `id:"public-cockpit"`) → **KEEP** — not
  user-read; renaming breaks lookups for nothing.
- **`config/routeMemory.ts` → KEEP + EXEMPT the whole file** — recording old names is literally its job; a
  guard that flags the rename ledger is a stupid guard.
- **File names + import paths → OUT OF SCOPE** (`MemberAccess.tsx` is fine; "member access" as prose is not).
Step one next session: the guard + the 52-site sweep, every keep-vs-rename call deliberate, landing GREEN.

### TWO SHELLS — the PAGE chooses, not the person
Not signed in → nothing changes. Public pages (whitepaper, tokenomics, docs, faq…) → ALWAYS the public
shell, even for a signed-in member (he browses normally, not trapped in a bubble). Member Home and its
pages → the member shell (left sidebar, his doors). Side benefit: Google is always an anonymous visitor →
always the public version → the 2.0 prerender is untouched.

### NO TWIN PAGES
The origin prototype built ELEVEN twins (activity + public-activity, chronicle + public-chronicle…). Two
files for one truth always diverge. We build **zero**. **One truth = one page = one URL, DEEPER when signed
in:** public = the protocol, member = the protocol + YOU — and "you" means **YOUR OWN ROW ONLY**, never a
directory (ADR-003).

### THE WIRE (authorized widening)
`WIRABLE_ACCESS_STATES = ["S1","S4"]` with the comment "member (S7+)… have no wired source" — that comment
is **FALSE now**: `/api/auth/member-standing` and `/api/auth/operator-context` were built after it and both
run in production. **The app does not know you are a member — only the panel does.** S7/S11 are NOT to be
built, they are to be **LET THROUGH**. Founder AUTHORIZED the widening. Rules: server-answer-only, never a
client claim; any failure → S1; frontend state stays visibility/UX, never permission; rewrite the false
comment (do not leave a lie in the file).

### APPROVE ≠ PAYMENT (cost six versions)
An allowance is NOT a payment. The seat is confirmed ONLY by a successful purchase RECEIPT, with the number
read from the **EMITTED EVENT** (`MembershipPurchasedV3.memberNumber`). Approve the EXACT amount, never
unlimited. (ORIGIN_RECLAMATION_LEDGER §13.)

## 4. MEMBER HOME — the spec, block by block (do NOT bury the conversion)

1. **Identity strip = "Your Seat"** (one row): Sigil · wallet · **Member #N** · **SEAT STATUS as the headline**
   (green "Seat Held" / amber "No Seat Yet") · Chapter.
2. **Empty state if no seat:** "Your wallet is connected, but no seat is anchored to it." → **Take your seat →
   `/join`**. This is the conversion moment. Do not bury it.
3. **Quick actions, role-filtered.** LOCKED ACTIONS STAY VISIBLE with a plain reason ("Sign in with your
   wallet to use this" / "Requires a seat") — the visitor SEES what a seat unlocks. But **locked ≠ hidden:
   operator categories are REMOVED ENTIRELY for non-operators** (a visitor must not even learn they exist).
4. **Live figures — everything readable is read (LIVE-PRODUCTION RULE: never a placeholder for something
   already readable).** ✅ wallet (session, in-memory) · ✅ Member #N (member-standing) · ✅ Seat Held/No Seat
   (same) · ✅ era + authority (same) · ✅ the receipt + explorer link + "Share my proof" (**MOVE the existing
   one from `WalletSessionPanel`, do NOT rebuild — commit `8150d72`**) · ✅ SYN balance (`balanceOf` on the
   SYN token — nothing blocks it, rendered nowhere today, render it) · ✅ Sigil (derived from wallet, free) ·
   ✅ Chapter (canonical constant). ⏳ honest posture labels for: USDC routed by this member (receipt adapter),
   activity feed (event adapter), recognition standing (future). **VERIFY EACH against the repo — repo wins
   over the advisor's list.**
5. **Navigation — the member's doors.**

TRUTH LABELS: reuse the EXISTING `LifecycleBadge`/StatusBadge — NEVER a second badge system. If the 3
postures are too coarse to tell the truth without looking empty, **PROPOSE** widening them (ADAPTER_REQUIRED
/ NOT_WIRED / FUTURE) — propose, do not do it silently.

## 5. HARVEST SOURCE — read to LEARN intention/structure, COPY NOTHING
(mock data, wrong stack, wrong names, and it gates pages that are PUBLIC in our product)
`C:\Users\kemal\OneDrive\Documents\GitHub\TheSyndicate\apps\product-os-studio\src\`
`pages/member-home.tsx` (structure) · `lib/navigation.ts` (20 doors, 5 groups) · `lib/actions.ts`
(23 actions + `canAccessAction()` + `actionLockReason()`) · `lib/data-posture.ts` (10 truth postures; we
have 3) · `components/member-sigil.tsx` · `action-card.tsx` · `role-gate.tsx`.

## 6. The 7 stale-guard fixes (this commit) — all STALE, none code drift
Each verified by reading the target; two adversarially verified before push.
1–3. **protocol-reality** — `financial.members.genesisOffset` (sealed ⓪ liveness / Q2) not in fixtures: bumped
   count 21→22, added the id + a value check, added the reconciliation mocks (`GENESIS_OFFSET()`=8=freeze,
   `nextSeatNumber()`=memberCount+1). **Adversarially proven the guard still guards**: setting offset≠freeze
   makes it go RED (memberCount+genesisOffset fail closed). `MEMBER_COUNT_FIX=27` is a pre-existing synthetic
   fixture (not the real 12 — deliberate, so the test proves the code READS the value).
4. **protocol-time** — `verifyLinks.ts` added to its route-surface allow-list (pure list check).
5. **holder-index** — `memberRoster.ts` added to the DB-lazy allow-list (Q26 founder-approved bridge).
6. **holder-index** — `realityService.ts` added to the snapshot-importer allow-list. **Proven aggregate-only**:
   its ONLY snapshot use is `realityService.ts:85` (freeze-root `.count`); the snapshot type has NO addresses
   (`holderIndexSnapshot.ts:14-15`) → cannot expose a member row.
7. **holder-index** — normalized Windows `\` paths in the snapshot check (was a Windows-only false-fail).
Result on Replit/Linux: **16/16 green** (local shows partB-canon-reconcile red only on missing DATABASE_URL).

## 7. Canon file map (exact paths — do not invent)
- Access-state vocab (S1–S14) + the wire: `artifacts/studio/src/config/accessState.ts` (WIRABLE line 42;
  false comment line 40; "cockpit" leak line 178).
- Member readbacks: `artifacts/studio/src/wallet/walletSession.ts` (`fetchMemberStanding`/`fetchOperatorContext`).
- Member menu (has "Open member cockpit" leak to rename): `wallet/MemberHeaderAffordance.tsx`.
- Cockpit panel (holds the receipt to MOVE): `wallet/WalletSessionPanel.tsx`.
- Auth zone: `api-server/src/auth/router.ts` (member-standing) · `memberRoster.ts` (genesis bridge + receipt)
  · `operatorContext.ts` · `engineReadback.ts` (live V3 memberNumberOf).
- Reality spine: `api-server/src/lib/protocol/realityService.ts` · own-standing map: `holderIndexStanding.ts`.
- Guards fixed this commit: `api-server/scripts/{protocol-reality-check,protocol-time,holder-index}.guard.ts`.
- ADR-003 (anti-doxx): `docs/adr/ADR-003-identite-et-confidentialite-anti-doxx.md`.
- Source-vocab pattern to mirror for the naming guard: `studio/src/config/sourceAttributionTerminology.ts`.

## 8. Standing rules (binding every agent)
REPO WINS OVER PROSE · SEMANTICS RECONCILED NEVER INFERRED · NO SNAPSHOT FOR A LIVE FIGURE · **NO PUSH
WITHOUT FOUNDER APPROVAL (diff → approval → publish, one step at a time)** · a guard must be able to go RED
(adversarially verify a repaint) · enforcement is bounded by VOCABULARY (add the word, then the guard) ·
APPROVE ≠ PAYMENT · BUILD ≠ GO-LIVE (real-money/auth/prod-writes are explicit founder acts).
