# Scope Memo — Member Economy Read-Only Expansion (/member cockpit, slice 2)

Date: 2026-07-03
Status: AWAITING FOUNDER APPROVAL — nothing in this memo is built. Scope only.
Prerequisite delivered: member-standing self-readback (Decision 5a) — see
`SELF_READBACK_SPRINT_FOUNDER_MEMO.md`.
On conflict, canon documents win.

---

## Founder-locked boundaries (restated, binding on every line below)

Own-row + aggregate only · no public per-seat detail · no wallet echo · no
lookup/directory · no writes · no new contracts · no reward/claim/airdrop
vocabulary · no season pool activation · no support-intake write surface.

## Headline safety property

**Zero new API endpoints. Zero server code changes.** Every value in this slice
is already served today by public read-only endpoints:

| Data | Already served by |
|---|---|
| Own standing (seat, era, authority, snapshot pin) | `GET /api/auth/member-standing` (frozen shape, test-pinned) |
| Sale lifecycle + V3 figures (paused/concluded, availableSyn, grossUsdc, receiptCount) | `GET /api/protocol/reality` `sale` group |
| Source/introduction readiness booleans | `GET /api/protocol/reality` `source` group |
| Recognition aggregates (memberTotal, per-era counts, hash pins) | `GET /api/holder-index` |

The cockpit fetches exactly THREE endpoints: `/api/auth/member-standing`,
`/api/protocol/reality`, `/api/holder-index`. It deliberately does NOT fetch
`/api/join/quote` (the quote needs a grossUsdc input; the cockpit links out to
`/join` instead) or `/api/source/validate` (validation needs a source input;
the cockpit shows the reality `source` readiness booleans and links out to
`/source`). Keeping the fetch set minimal is itself a guard property — an
allow-list wider than actual use weakens enforcement.

The slice is pure UI composition over these. The member-standing response shape
is NOT touched (it is pinned by auth-skeleton-test and stays frozen).

---

## Proposed surfaces (exact)

### 1. Member Readiness Card — `/member`, above the tabs
New `MemberReadinessCard` beside/below WalletSessionPanel. Three honest states:
- **No session (S1):** a readiness checklist (wallet detected → session signed →
  standing readable), each row truth-labelled; no simulated values.
- **Session, not recognized (sentinel):** honest "this wallet holds no seat"
  plus the read-only acquisition context (surface 2) as the next-step frame.
- **Session + MAPPED standing:** seat #, era chip, verbatim authority label,
  snapshot pin — same data the StandingSection shows, reframed as a compact
  always-visible readiness summary. Fail-closed branches identical to
  StandingSection (stale/unreconciled → labelled unavailable, never invented).

### 2. Acquisition Context strip — `/member` Overview tab
Read-only "Membership acquisition context" band: V3 lifecycle flags
(open/paused/concluded), availableSyn + receiptCount (raw base-unit strings
source of truth, derived display labelled, fail-closed to raw-only — the exact
`/map` figures-band pattern), and a link out to `/join` for the live quote.
No purchase UI, no amount input, no CTA vocabulary beyond "view join quote"
(the copy must never read as a purchase funnel). Vocabulary trap pinned:
the quote's `protocolContributionRaw` field is NEVER rendered in the cockpit —
"contribution" phrasing is founder-flagged; linking out avoids it entirely.

### 3. Seat & Receipt tab upgrade (seat half only)
The seat facet (already READ_ONLY_PROOF) gains the live own-standing binding
when a session exists: seat provenance = era + numbering authority + snapshot
pin. The **receipt half stays PENDING_ADAPTER** — receipts need the
normalization bridge, which is not in this slice.

### 4. Recognition tab upgrade
Binds the already-public Holder Index **aggregates** (memberTotal, era counts,
era boundaries as ranges, truncated hash pins — same card family as `/status`)
plus recognition framing copy from `syndicateFacts.ts` (Member Standing /
Recognition Index vocabulary, founder-locked terms only). With a session +
MAPPED standing: "your era" highlighted within the aggregate view — own-row
only; no other seat is ever resolvable from this UI.

### 5. Source tab upgrade — readiness only
Shows the reality `source` group readiness booleans (registry code present?,
linkage verified?) as a "verified-introduction readiness" panel plus a link to
`/source` for the link builder. **No `/api/source/validate` fetch from the
cockpit** (validation needs a source input; none exists here). **No execution,
no attribution claims, no member-to-source binding** (that linkage is
normalization-bridge work, founder-gated).

### 6. Lifecycle-labelled placeholders (no data, ever, in this slice)
- **Activity** tab: stays PENDING_ADAPTER (chronicle needs the event adapter).
- **Archive** tab: stays PENDING_ADAPTER (archive reads deliberately unbound).
- **Season** row (new, inside Recognition tab): labelled **FOUNDER_GATED** —
  explicitly "not activated"; no pool figures, no dates, no accrual framing.
- **Swap / Bridge / Liquidity proof** row (new, inside Overview): labelled
  **FUTURE** — named as future proof surfaces only; no rates, routes, balances,
  or venue names.
All placeholders render through the existing `FacetPanel`/`LifecycleBadge`
pattern using `DisplayLifecycle` enum values — no new inline status literals
(homepage-governance rule 8 extended to /member).

---

## Files to touch

**Server: none.** (`artifacts/api-server` unchanged; member-standing frozen.)

Studio (`artifacts/studio/src`):
- `components/member/MemberReadinessCard.tsx` — NEW (surface 1)
- `components/member/AcquisitionContext.tsx` — NEW (surface 2; reuses the /map
  figures-band raw-first pattern)
- `components/member/RecognitionAggregates.tsx` — NEW (surface 4; reuses the
  /status holder-index card family)
- `pages/MemberAccess.tsx` — mount card, evolve Seat/Recognition/Source facets,
  add the two placeholder rows
- `wallet/walletSession.ts` — no shape changes; `fetchMemberStanding` reused
  as-is. **REQUIRED (not optional): ONE shared standing fetch/state lifted into
  `MemberAccess`**, consumed by both MemberReadinessCard and StandingSection —
  two independent fetches could show divergent states after a partial failure,
  and a single fetch also stays far under the 30/min auth-zone throttle
- `config/syndicateFacts.ts` — new copy blocks (readiness checklist, acquisition
  context, recognition framing, placeholder blurbs) — copy lives here, not inline
- `config/moduleRegistry.ts` — NO new registry id (`member-cockpit` already
  covers /member; blurb text update only if needed)

## Guard additions

- **NEW studio guard: `guard:member`** (or a section in `guard:live`) — stated
  as enforceable static checks, not transitive analysis:
  1. Module-import allow-list: `components/member/**` contains ZERO direct
     `fetch(` calls; data may arrive only via allow-listed imports
     (`wallet/walletSession`, the generated api-client hooks).
  2. Literal-URL discipline: every `/api/auth` occurrence in studio src is a
     literal string containing no `?` and no template-literal construction
     (own-row discipline mirrored client-side; walletSession.ts already
     complies — all four fetches are literal).
  3. No 40-hex address literals anywhere under `components/member/`.
  4. Executed label pins (not prose): the season row carries exactly
     FOUNDER_GATED and swap/bridge/liquidity exactly FUTURE, via the
     `DisplayLifecycle` enum — no inline status strings anywhere in the new
     components; both rows also fall under the existing lifecycle-labels
     coverage guard.
- **`guard:copy` extension:** add "season pool", "pool share", "accrual" to the
  banned list alongside the existing reward/claim/airdrop family; assert the
  forbidden family stays banned even in negated sentences (existing rule).
- **Existing guards re-run unchanged:** guard-auth-zone 441 (server untouched —
  any drift is a regression), holder-index:guard 60, auth-skeleton:test 46
  (member-standing byte-stability is the pin).

## Validation commands

- `pnpm run typecheck` — full workspace
- `pnpm --filter @workspace/studio run guards` — full suite incl. new checks
- `pnpm --filter @workspace/api-server run auth-zone:guard` — must stay 441 (no server drift)
- `pnpm --filter @workspace/api-server run holder-index:guard` — must stay 60
- `pnpm --filter @workspace/api-server run auth-skeleton:test` — must stay 46/46 (≥60s apart)
- Prod dist rebuild + dist-grep (wallet chunk required, server/fixture strings forbidden)
- Live probes: `/member` anonymous (S1 fail-closed), with fixture session (sentinel
  honest state), query-param probe on member-standing (byte-identical)
- Architect review with git diff before delivery

## Deliberately NOT built (this slice)

- No writes of any kind; no purchase/renewal/referral execution UI
- No new API endpoints, no server changes, no contracts, no canon changes
- No package pricing/tiers (nothing is served; `packages-advertising` stays a
  future concept — no invented figures)
- No per-seat detail public or private beyond the session's own row
- No wallet echo, lookup, directory, or roster anywhere
- No season pool activation, figures, or timing
- No swap/bridge/liquidity data — names as labelled future surfaces only
- No support/signal intake (separate future decision memo: write-doctrine
  amendment + PII policy)
- No new Module Registry id, no new homepage section (governance caps hold)

## Founder decisions requested (3, small)

1. **Recognition aggregates in the cockpit** — bind the public holder-index
   aggregates into the Recognition tab (recommended: yes — data already public
   on `/status`; own-era highlight is own-row only).
2. **Source readiness panel** — reuse the public source validation surfaces in
   the cockpit Source tab (recommended: yes — read-only, no member↔source
   linkage claimed).
3. **Placeholder labels** — season = FOUNDER_GATED, swap/bridge/liquidity =
   FUTURE (recommended as stated; alternatives: NOT_ACTIVE for both).

Nothing proceeds on a recommendation alone.
