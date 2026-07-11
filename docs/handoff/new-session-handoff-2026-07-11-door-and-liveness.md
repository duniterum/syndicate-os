# SESSION HANDOFF — 2026-07-11 · liveness, the door, and anti-entropy canon
*Resume point for a fresh session. Written from the repo + this session's real history (commit
hashes below), never from memory. A new session can boot on `docs/SESSION_STATE.md` → this doc →
`docs/direction/OPEN_QUEUE.md` and continue with zero amnesia. If this disagrees with a source file,
the file wins (Compass §1); fix the pointer.*

**First message next session can simply be: "continue."** The EXACT next step is §8.

---

## 1. What shipped today (prod), newest first — every commit
All on `main`, Replit-deployed + live-verified where noted. `git log e829106..HEAD`:

| Commit | What |
|---|---|
| `92809f9` | **Q11 header "Member" affordance** (first version — a static link; SUPERSEDED same session by Q11-v2, see §4). |
| `4fe9dcb` | Close Q19; **correct Q12** — V3 `buy` HAS `minSynOut` (earlier note read the V1 ABI). |
| `9f8c4ae` | **Compass repoints** to GRAND_RECONCILIATION (carte-blanche): §5 BUILD≠GO-LIVE, §8 stale line, `/join` note→Q20. |
| `b55127c` | Seal ⓪ (Q2). |
| `bc6102a` | **⓪ LIVENESS FIX** — member figure = LIVE continuous `memberCount()` (12), dual-provenance, fail-closed reconciliation. **Live-verified.** |
| `206c103` | Ledger append + evidence-reconstructed `OPEN_QUEUE` (TIER-0). |
| `c69c0ef` | **`ORIGIN_RECLAMATION_LEDGER.md`** created (TIER-0). |
| `e86fe01` | Track `.claude/launch.json`. |
| `140d33e`,`6c55574` | **2.4 `/docs`** shipped + sealed. |
| `56bc165`,`cb10560` | **Support Guide** (floating deterministic Guide) shipped + sealed. |
| `1c6a07d`,`8bc3f1e`,`9601042`,`7c7f124`,`a4a1c8c` | **2.3 `/faq`** shipped + link-fix + sealed + direction docs. |

**New TIER-0 canon this session:** `docs/direction/ORIGIN_RECLAMATION_LEDGER.md` (the origin-vs-us audit +
9-mechanism KEEP/RECLAIM/REFUSE + the reconcile-never-infer worked examples + APPROVE≠PAYMENT §13) ·
`docs/direction/OPEN_QUEUE.md` (the living decision queue — single source for "what's next").

## 2. ⓪ liveness fix — the headline correction (LIVE, `bc6102a`)
The public member figure was a **stale served snapshot (10, builtAt 2026-07-03)** rendered under the LIVE
"read live from Avalanche" signature. Fixed: it is now the **LIVE continuous `memberCount()`** read from
the V3 engine (currently **12**). The spine reads `GENESIS_OFFSET`(8) + `nextSeatNumber`(13) and
**reconciles server-side, fail-closed** (anchor `GENESIS_OFFSET==8` AND `nextSeatNumber==memberCount+1`);
if either fails, BOTH figures go null (never an unproven number). `nextSeatNumber` is invariant-only,
never emitted. `MembersProvenance` renders the dual authority (**8 freeze/root + 4 live V3-emitted, never
collapsed**) + the STALE divergence line ("snapshot 10 as of 2026-07-03 · live runs ahead"). New BLOCKING
`guard-freshness`. `/docs` lost its decorative `LivingSignature`. **12 is 12** — real on-chain purchases,
no test-seat category, ever.

## 3. The auth finding (why `/member` is a dead end — and the tiny fix)
`/api/auth` **is mounted** (`app.ts:108`) behind `authExposureGate` → **dark in production unless
`SYNDICATE_AUTH_ENABLED="true"`** (`authExposure.ts:26-31`). It is **not** a missing DB/provider/secret:
the SIWE zone is registry-less, **in-memory** (`authConfig.ts`, `sessionStore.ts` `new Map`), ids are
`randomBytes`. The **one-button connect+SIWE flow already exists** (`MemberAccess.tsx:159-174` +
`WalletSessionPanel.tsx`), just switched off — while dark, `/member` shows `WalletAuthComingSoon`.
**Turning it on = one env flag.** The only correctness dep: `REPLIT_DOMAINS` must include
`thesyndicate.money` (SIWE is domain-bound, `authConfig.ts:61-71`). What breaks if live as-is: sessions
lost on restart (re-sign; in-memory) + multi-instance flapping — **durability, not function** (Q14/
Reserved-VM). S4 = proves wallet control ONLY (no membership verify, no operator, no GATED surface, no PII).

## 4. The Q11 mistake and its fix (own it)
Q11 v1 (`92809f9`) shipped a header "Member" **link → /member**, gated on `RainbowKitRoot` ("connect
works") **without reading `MemberAccess.tsx`**, which gates the whole connect+standing flow behind
`authLive` → the link pointed at the "coming soon" dead end. **Two files, one wrong conclusion.**
**Q11-v2** (built this session, green, at the head of `git log` — push per §8): a header
`MemberHeaderAffordance` (in `@/wallet`, lazy-imported by `PublicLayout`, **auth-gated** on
`useAuthAvailability()==="live"` so it's hidden while dark and auto-appears when the flag flips) that
reuses the **admin one-modal pattern** (`OperatorSignInAction`/`OperatorBadge`): `openConnectModal()` =
connect + SIWE in one modal, then resolves IN PLACE via `SESSION_CHANGED_EVENT` reading
`fetchMemberStanding()` — states: visitor→"Member sign-in" · S4+seat→"Member · seat #N" · S4+no-seat→
"Signed in · no seat yet". Server is truth. Plus `/member` emphasis: a real **verify-it-yourself** link
on the standing — `VerifyOnChain ids={["membershipSaleV3"]}` (server-resolved, address-safe) — "open the
engine, call `memberNumberOf(your address)`" (the seat is an `eth_call`, no tx to link → link the engine).

## 5. Standing rules — binding on every agent (Replit · Claude Code · advisor)
1. **REPO WINS OVER PROSE** — read the file on disk before claiming anything about it; cite it; no file cited, no claim.
2. **SEMANTICS ARE RECONCILED, NEVER INFERRED FROM ABI NAMES** — proven twice this session (`GENESIS_OFFSET`; `sale-abi.ts:33` V1 vs V3 `buy`).
3. **NO SNAPSHOT FOR A LIVE-READABLE FIGURE** — if it's live-readable, a served snapshot may not stand in (guard-freshness).
4. **NO PUSH WITHOUT FOUNDER APPROVAL** — including docs-only. Show diff → approve → push.
5. **EVERY GATE RESTATES THE FULL OPEN QUEUE** — not just the new ask; nothing closes until the founder closes it.
6. **ENFORCEMENT IS BOUNDED BY VOCABULARY** — a guard can't catch a fake it has no word for; add the word, then the guard.
7. **APPROVE ≠ PAYMENT** — `approve` is a token allowance, not payment; membership is confirmed ONLY by the purchase receipt; seat read from the emitted event; approve the exact amount, never unlimited. (Ledger §13.)
Plus: **BUILD ≠ GO-LIVE** — GR authorizes building Phases 1–10; real-money/auth-flip stays a founder go-live.

## 6. Canon file map — exact paths (do not invent)
- Route/SEO registry (purity leaf): `artifacts/studio/src/lib/seo-route-registry.ts`
- Surface↔audience↔layout: `artifacts/studio/src/config/surfaceClassification.ts`
- Operator OS map (server-only; never import public): `artifacts/studio/src/config/protocolOsMap.ts`
- Holder-index snapshot (served, aggregate-only): `artifacts/api-server/src/lib/protocol/holderIndexSnapshot.ts`
- Own-row era resolution (dual authority/STALE): `artifacts/api-server/src/lib/protocol/holderIndexStanding.ts`
- Chain decoders + selectors: `artifacts/api-server/src/lib/protocol/financialDecoders.ts`
- Reality spine builder: `artifacts/api-server/src/lib/protocol/realityService.ts`
- V3 sale ABI (buy/quote/memberCount/GENESIS_OFFSET): `artifacts/api-server/src/canon/the-syndicate/contracts/abi/sale-abi.ts`
- Auth zone: `artifacts/api-server/src/app.ts` (mount) · `src/auth/authExposure.ts` (flag) · `authConfig.ts` · `sessionStore.ts` · `router.ts`
- Member self-readback UI: `artifacts/studio/src/wallet/WalletSessionPanel.tsx` · header: `wallet/MemberHeaderAffordance.tsx`
- Admin pattern reused: `wallet/OperatorSignInAction.tsx` · `wallet/OperatorBadge.tsx`
- Studio guards: `artifacts/studio/scripts/guard-*.ts` + `guards/no-raw-color.mjs` · api guards: `artifacts/api-server/scripts/*.guard.ts`
- Prerender: `artifacts/studio/scripts/prerender-routes.ts` · serving rewrites (generated): `artifacts/studio/.replit-artifact/artifact.toml`

## 7. Build order + door work
**Frozen Phase-2 content list (canonical order, unchanged):** 2.0✅ · 2.1✅ · 2.2✅ · 2.3 FAQ✅ · Support✅ ·
2.4 Docs✅ · **2.5 Knowledge (NEXT)** · 2.6 Risk · 2.7 Glossary · 2.8 Roadmap · 2.9 Protocol-facts ·
2.10 Brand-facts · 2.11 Join/entry-tiers UI · Footer/SEO guards. ("go dans l'ordre" = do NOT jump checkout
ahead.) Full sequence + Phase 3–6 later block: `SESSION_STATE.md`.
**Door work (GR 2026-07-06 authorizes BUILDING Phases 1–10; GOING LIVE with real money stays a founder act):**
auth go-live (§8, Replit) · Q11-v2 header sign-in (built) · checkout Q12/Q20 (V3 `buy` has `minSynOut`;
held for its ordered slot + founder go-live).

## 8. Replit's pending action + THE EXACT NEXT STEP
**Replit (auth go-live, founder-decided YES):** confirm `REPLIT_DOMAINS` includes `thesyndicate.money`;
set **`SYNDICATE_AUTH_ENABLED="true"`**; restart; **e2e-verify once** on `/member`: connect → sign → S4 →
standing shows a seat → logout. Report raw session + standing.

**EXACT next step for Claude Code:** the Q11-v2 diff + this handoff are shown to the founder and **await the
push GO** (rule 4). On GO: push. Then the next slice in order is **2.5 Knowledge (Q3 2.5a)** — but it needs
two founder inputs still open: **Q5** (`/knowledge` route name — rec `/knowledge`) and **Q6** (permanence
declared-vs-derived — rec declared). Gate 2.5a once those land.

## 9. DECIDED vs still-founder's-call
**DECIDED:** ⓪ live · 12 is 12 · Q11 auth-gated · reuse admin pattern · carte-blanche is canon (BUILD≠GO-LIVE) ·
auth go-live YES · checkout does NOT jump the order · verify-link = the engine (real, not ornament).
**FOUNDER'S CALL (open):** Q5 route name · Q6 permanence · Q8 doc-drift · Q9 server-only-homes wording ·
Q10 protocolOsMap repoint · Q13 checkout ordering/2-step · Q14 Reserved-VM · Q18 snapshot rebuild cadence ·
plus every real-money/auth GO-LIVE. Full queue with owners: `docs/direction/OPEN_QUEUE.md`.
