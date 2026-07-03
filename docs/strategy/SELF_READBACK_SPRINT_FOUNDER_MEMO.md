# Founder Memo — Holder Index Self-Readback / Member Cockpit Foundation (Decision 5a, DELIVERED)

Date: 2026-07-03
Status: COMPLETE — narrow scope shipped exactly as approved. NOT published; production is untouched until you Publish.
Scope authority: your Decision 5a (self-readback only) from `HOLDER_INDEX_SPRINT_FOUNDER_DECISION_MEMO.md`.
On conflict, canon documents win; this memo records what was built and proves the boundaries held.

---

## What exists now (one sentence)

A signed SIWE wallet can read ONLY its own member standing: the session's server-side
bound account → live `memberNumberOf` eth_call on the active V3 engine → era mapping
against the static hash-pinned Holder Index snapshot — rendered as a "Your member
standing" card inside the `/member` wallet session panel.

## Exact API shape

`GET /api/auth/member-standing` — session cookie is the ONLY input. No query params,
no body, no path params; POST answers 404. Deliberately NOT in `openapi.yaml`
(same contract-external posture as `member-self`). Production-dark unless
`SYNDICATE_AUTH_ENABLED="true"` (unchanged gate).

```json
{
  "state": "S1 | S4",
  "chainVerified": true,
  "recognized": true,
  "memberNumber": "7",
  "era": "PART_B_FREEZE_ROOT",
  "authority": "PART_B_FREEZE_ROOT",
  "authorityLabel": "historical freeze / on-chain root",
  "continuityStatus": "VERIFIED_IN_SNAPSHOT",
  "proofPosture": { "snapshotStatus": "VERIFIED", "snapshotHash": "sha256:9cf8…211a" },
  "failureReason": null
}
```

Fail-closed semantics (never invented, never guessed):
- No session → `state:"S1"`, everything else null (HTTP 200 — honest, not an error).
- Engine sentinel `"0"` → `recognized:false`, all standing fields null (clean not-recognized).
- Live figure beyond snapshot range → `recognized:null` + failureReason "live engine
  figure is outside the verified snapshot range; standing unavailable until the snapshot
  is rebuilt (fail closed)" — we never claim recognition without a verifiable era, and
  never claim non-recognition when the engine did recognize.
- Snapshot not VERIFIED / ambiguous era → `recognized:null` + a specific static
  fail-closed failureReason literal (no interpolation anywhere).
- `proofPosture` present ONLY on a MAPPED standing.

## UI surface

`/member` → WalletSessionPanel → evolved StandingSection ("Your member standing"):
seat number, era chip, verbatim numbering-authority label, continuity + truncated
snapshot hash pin, explicit self-readback-only honesty copy, and fail-closed branches
(read unavailable → retry; sentinel → honest "not recognized"; stale/unreconciled →
labelled unavailable). No new route; no directory or lookup UI exists anywhere.

## Files (all changes)

Server (`artifacts/api-server`):
- `src/auth/engineReadback.ts` — NEW: shared `readEngineMemberNumber` (verbatim
  extraction of the member-self live-read; both readback routes now share it).
- `src/lib/protocol/holderIndexStanding.ts` — NEW: pure era mapping
  (`MAPPED | STALE | AMBIGUOUS | UNRECONCILED | OUT_OF_RANGE`, BigInt compare,
  authority/label mirrored verbatim from the snapshot, no I/O).
- `src/auth/router.ts` — `GET /member-standing` route (hoisted payload const,
  discipline gate + boundary-aware 40-hex gate before `res.json`, shared throttle);
  member-self refactored onto `engineReadback` with byte-identical behavior.
- `scripts/holder-index-core.ts` — boundaries[3] amended (the old "no member
  self-readback of this index" claim was stale after your Decision 5a; now states
  session-bound OWN-ROW readback only).
- Snapshot re-pinned by the founder-gated armed rebuild (boundary text is part of
  the hash): **new pin `sha256:9cf82d908d7079a207a54b57877b0e87ba45a0a388ee08456dd46192421c211a`**;
  `holder-index:reconcile` exact-match OK; `holder-index:dry-run` UP_TO_DATE.

Studio (`artifacts/studio`):
- `src/wallet/walletSession.ts` — `fetchMemberStanding()` (strict shape parse, null on
  any failure) + `shortHashPin`; superseded `fetchMemberSelf` client removed (the
  server `member-self` endpoint itself is untouched and still test-pinned).
- `src/wallet/WalletSessionPanel.tsx` — StandingSection evolved as above.

Guards/tests:
- `scripts/guard-auth-zone.ts` — new section 8: `req.query`/`req.params` banned across
  `src/auth`; member-standing route must exist; era mapping ONLY via
  `holderIndexStanding` (raw snapshot import banned in the router); both readback
  routes must share `readEngineMemberNumber`.
- `scripts/holder-index.guard.ts` — snapshot-importer allow-list (route + standing
  module only) + NEW executed pure-mapping assertions: MAPPED at all four era
  boundaries, STALE beyond range, sentinel/malformed rejection, synthetic
  UNRECONCILED/AMBIGUOUS — the mapping's happy path now has real executed coverage
  (the auth fixture wallet is never a member, so route tests alone can't reach it).
- `scripts/auth-skeleton-test.ts` — 4 new cases: S4 sentinel all-null, response leak
  scan, query-param byte-identical probe, anonymous S1.

## No-wallet-leak proof

1. Only input is the session cookie — guard-enforced: zero `req.query`/`req.params`
   reads exist anywhere in `src/auth` (static scan, 441-check suite).
2. Bound account never enters the payload object; response carries no address-shaped
   material — runtime discipline gate + boundary-aware 40-hex regex run on the
   serialized payload before every `res.json` (64-hex snapshot hash passes; any
   40-hex address would hard-fail the request).
3. Live probes: `?account=0x…` returns the byte-identical own-row response (test-pinned);
   anonymous → S1 nulls; POST → 404.
4. Logs carry only event name + coarse outcome code; failureReasons are static literals.
5. Architect review (independent): PASS — "no leak vectors found", STALE semantics
   confirmed correct, vocabulary clean, guards verified non-vacuous.

## Commands

- `pnpm --filter @workspace/api-server run auth-zone:guard` — 441 checks PASS
- `pnpm --filter @workspace/api-server run holder-index:guard` — 60 checks PASS (incl. executed mapping assertions)
- `pnpm --filter @workspace/api-server run auth-skeleton:test` — 46/46 PASS (rerun ≥60s apart; needs the dev API workflow)
- `pnpm --filter @workspace/api-server run holder-index:dry-run` — UP_TO_DATE against the new pin
- Full battery green: member-continuity 91 + schema 23, protocol-time 38, protocol-reality 65,
  protocol-targets 130, sale-index 64, sale-scan 81, sale-semantics 67, activity 110,
  live-read 43, archive-posture 69, token-metadata 62, freeze-gate VERIFIED,
  studio suite (incl. operator-gate 1363, access-state 319) — plus full workspace typecheck.

## What was deliberately NOT built (boundary held)

No directory, roster, or per-seat register; no lookup of any wallet other than the
session's own bound account; no writes, purchases, referral execution; no runtime DB
reads from served code; no OpenAPI exposure; no publish.

## Next decision for you — Member Economy

The cockpit foundation is in place: a member can now prove control and see their own
recognized standing. The natural next sprint is the **Member Economy surface** — what a
recognized member may DO from that cockpit. That requires your decisions on, at minimum:
1. Whether any member-initiated on-chain action (purchase/renewal via the live V3
   engine) may ever be wired from this UI — this would be the first WRITE-capable
   surface and a doctrine amendment on the scale of the served-read decision.
2. Whether source/introduction linkage (referral-as-verified-introduction) gets a
   member-facing readiness surface before any execution exists.
3. Whether the Holder Index gains member-facing history (era transitions) — which
   re-opens the aggregates-vs-per-seat exposure question from Decision 1.

Nothing proceeds on a recommendation alone; a decision memo can be prepared on request.
