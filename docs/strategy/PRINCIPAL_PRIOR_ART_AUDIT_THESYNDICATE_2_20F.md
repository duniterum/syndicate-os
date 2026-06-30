# Slice 2.20F — Principal Prior-Art Audit: TheSyndicate

> **Mode:** READ-ONLY / REPORT-ONLY. No code copied, no features implemented, no
> live wiring. This document is the only substantive change in this slice (plus
> one README pointer). It audits the **principal ancestor** of `syndicate-os` —
> the public repo `duniterum/TheSyndicate` — across dimensions A–L and classifies
> every finding **PRESERVE / ADAPT / REWRITE / DEFER / REJECT**.
>
> 2.20E found the forest (cross-repo capability harvest). 2.20F audits the
> principal tree.

---

## 1. Executive Verdict

**Was TheSyndicate a strong principal ancestor?** Yes — emphatically. It is a
mature, internally-coherent, *proof-first* organism, not a prototype. It is the
genuine source of the product's soul: the doctrine, the route vocabulary, the
canon registries, the recognition model, the protocol memory, and the
"don't-trust-verify" posture that `syndicate-os` is rebuilding cleanly.

**Strongest value.** A single, enforced source of truth. Every public claim is
bound to an on-chain read or explicitly labelled `PENDING`; every address lives
once in `src/lib/contract-registry.ts`; every metric has one definition; and a
fleet of ~20 `scripts/check-*.mjs` guard scripts mechanically refuse to ship
drift, stale copy, or forbidden financial framing. Crucially, **TheSyndicate is
itself anti-financialization**: `docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md`
and `src/lib/protocol-language.ts` encode a binding "recognition ≠ return" rule.
The high counts of words like "yield/profit/payout" in the repo are
*defensive* ("no yield, no dividends, not guaranteed"), not promotional.

**What was unsafe / stale.** Three things. (1) The `src/routes/labs.*` suite is
internal protocol-intelligence reachable **unauthenticated** (hidden only by
`noindex`/robots/no-nav — security by obscurity). (2) The live experience depends
on direct client-side wagmi RPC reads (`holder-index.ts`, `use-global-identity.ts`),
which is a *live* posture `syndicate-os` is deliberately not in yet. (3) The whole
runtime shell (TanStack Start SSR + Foundry + `bun`) is incompatible with the
`syndicate-os` pnpm/Node-24/Vite/wouter monorepo, so the *app* must be rewritten,
never copied.

**What `syndicate-os` must preserve.** The doctrine and the *data*: the canon
registries (chain/contract/event/archive/sale/token — **already vendored**), the
not-yet-vendored protocol memory (chronicle, institutional register, recognition,
learning, source attribution), the ~70-route information architecture, and the
soul ("a society, not a security").

**What `syndicate-os` must reject.** Live wagmi reads as a default posture; the
unauthenticated labs pattern; importing full addresses into public payloads; test
fixtures/mnemonics; the bun/TanStack/Foundry shell; and any financial-return
framing (already covered by the existing forbidden-copy guard).

**Senior summary.** TheSyndicate is a rich, honest, slightly sprawling protocol
organism whose *essence is safe to inherit and whose risk is almost entirely in
its runtime, not its meaning*. The clean rebuild has already absorbed the
load-bearing canon; the remaining work is to harvest **protocol memory and route
breadth as posture-classified DATA + doctrine**, behind the source-boundary gate,
without ever importing the old live machinery. New repo does not mean amnesia;
old repo does not mean obedience.

---

## 2. Repo Identity & Method

- **Target repo (future authority):** `duniterum/syndicate-os` — private. Verified
  `private: true`, default branch `main`, HEAD `16d494b` (the approved current
  main, = the 2.20E capability-harvest commit).
- **Prior-art repo (principal ancestor):** `duniterum/TheSyndicate` — public.
  Verified `private: false`, default branch `main`, HEAD `cf4ca34` (pushed
  2026-06-29), package name `tanstack_start_ts`.
- **Clone method:** fresh read-only clones into `/tmp` (`syndicate-os-220f` full,
  `thesyndicate-220f` shallow `--depth 1`). The `syndicate-os` clone remote was
  immediately scrubbed to a tokenless URL.
- **Safety boundaries:** structure survey + targeted reads + ripgrep search.
  Sensitive values (addresses, tx hashes, emails, mnemonics) were **counted by
  path/category only and never printed or transcribed** into this report.
- **No-copy confirmation:** no file, address, value, ABI, or snippet from
  TheSyndicate was copied into `syndicate-os` in this slice. The only writes are
  this report and one README pointer line.
- **Scope note:** Cesium was **not** inspected (it is an upstream Duniter/Cesium
  fork, not Duniterum prior art). The full multi-repo harvest was not re-run;
  2.20E is used only as context.

---

## 3. High-Level Architecture Map

**What kind of organism:** a **mixed organism** — part marketing/cockpit front
door, part on-chain protocol explorer, part membership tool — unified by a
"don't trust, verify" doctrine where the UI leads with live data and demotes prose.

**Stack:** TanStack Start (React 19, SSR) + Vite + Tailwind v4 + Radix/shadcn +
wagmi (Avalanche C-Chain, chainId 43114) + a `bun` toolchain (`bun.lock`,
`bunfig.toml`) + a Foundry contracts project. ~2,400 tracked files (497 `.tsx`,
366 `.sol`, 316 `.md`, 310 `.ts`).

**Layout:**
- `src/routes/` — file-based routes: page components (`.tsx`) **and** server API
  handlers (`.ts`, e.g. `api.chat.ts`, `api/public/protocol-health.ts`,
  `api/public/og/*`, `sitemap[.]xml.ts`).
- `src/lib/` — the protocol "brain": one-source registries
  (`contract-registry.ts`, `chain-registry.ts`, `protocol-event-registry.ts`,
  `archive-id-registry.ts`, `syndicate-config.ts`), identity/read machinery
  (`wallet-session.ts`, `use-global-identity.ts`, `holder-index.ts`), and a large
  protocol-memory family (`chronicle-*`, `institutional-register-*`, `source-*`,
  `recognition-candidates.ts`, `signal-registry.ts`, `report-registry.ts`,
  `protocol-health-registry.ts`, `protocol-language.ts`).
- `src/components/syndicate/` (+ `cockpit/`, `metrics/`, `preview/`) — the cockpit
  and proof UI; `src/labs/` — internal inspection workbenches.
- `contracts/` — Foundry project. Own contracts: `MembershipSaleV3.sol`,
  `SourceRegistryV1.sol`, `CommissionRouterV1.sol`, `SyndicateSaleV2.sol`
  (+ `script/Deploy.s.sol`, fork/mocks tests, vendored OpenZeppelin & forge-std).
- `scripts/` — ~20 `check-*.mjs` guard scripts + `live-content-rules.json` +
  `post-merge.sh`.
- `docs/` — very deep: `docs/canon/00-09` (authority map, founder intent,
  source-of-truth table, glossary, doc-sync, foundation freeze, financial-trace
  guardrails, founder principle, operating principle, knowledge map), plus
  `docs/audits/*`, `docs/brand/*`, and dozens of architecture/spec docs.

**Strengths:** extreme coherence (one definition per metric/address); enforced
proof discipline (`PENDING` labels, `address: null` guards on undeployed
contracts); guardrail automation; clean separation of *raw* Activity vs *curated*
Chronicle.

**Fragilities:** heavy live-RPC dependence for the cockpit; "feature-latent"
reserved surfaces (e.g. `/referral`, `/ai`) that exist in code before they
function; large surface area; a toolchain (`bun` + TanStack Start SSR + Foundry)
that is orthogonal to the `syndicate-os` monorepo.

---

## 4. Public Surface Audit

**Homepage (`src/routes/index.tsx`):** a protocol cockpit — `ProtocolIntelligenceBar`
(live ticker), `ProtocolHero`, `HomeActivityTape`. Primary CTAs → `/join`,
`/transparency`, `/registry`. Header/footer/nav defined in `src/routes/__root.tsx`.

**Route map (≈70 routes), grouped:**
- *Membership / sale:* `/join` (MembershipSaleV3), `/institutional-register`,
  `/members`, `/member.$number`, `/my-syndicate` (Member OS cockpit).
- *Token / economy:* `/token`, `/tokenomics` (1B SYN, seven public allocations,
  live balances), `/transparency` (70/20/10 USDC routing), `/vault`, `/liquidity`,
  `/risk` (legal notice), `/protocol-health`.
- *Proof / explorer:* `/registry` (canonical contract/wallet list, LIVE/PENDING),
  `/wallet.$address`, `/x.tx.$hash`, `/milestone.$id`, `/activity`.
- *Memory / history:* `/archive` + `/nft`/`/nfts` (Archive1155 museum),
  `/chronicle`, `/chapters` + `/chapters.$slug`, `/episodes` (→ `/chapters`),
  `/evolution`, `/roadmap`.
- *Recognition / literacy:* `/ranks` (12 ranks / 4 groups, recognition-only),
  `/whitepaper`, `/docs`, `/faq`, `/knowledge-map`, `/founders`.
- *Reserved / pending:* `/referral` (attribution recognition-only, no payout),
  `/ai` (PENDING), `/v3-preview`.
- *Server/API:* `/api/chat`, `/api/public/protocol-health(.csv)`,
  `/api/public/indexer/health`, `/api/public/og/{milestone,wallet}`,
  `/api/og/health`, `/sitemap.xml`.

**SEO / shareability:** strong. TanStack `head()` per route with canonical links
and JSON-LD breadcrumbs (see `ranks.tsx`); dynamic OG image generation for
milestones and wallets; sitemap; canonical-URL guard scripts
(`check-explorer-canonical.mjs`, `check-explorer-urls.mjs`).

**Assessment.** Public UX is *richer* than current `syndicate-os` in breadth,
density, transparency, and verifiability. It is *weaker* in that several routes
are noindex placeholders, and the cockpit hard-depends on RPC liveness.
- **What must not be forgotten:** the route taxonomy itself (membership / token /
  proof / memory / recognition / literacy) and the redirect/canonical discipline.
- **PRESERVE/ADAPT:** route IA, canonical+OG+sitemap discipline, the
  "lead-with-proof, demote-prose" home model.
- **REJECT/DEFER:** live-RPC home cockpit (defer to adapter era); shipping
  feature-latent routes before they function (`syndicate-os` instead uses explicit
  `TruthLabel`/posture placeholders).

---

## 5. Proof / Registry / Explorer / Canon Audit

**Real, useful canon (in TheSyndicate `src/lib/`):**
- `contract-registry.ts` — single source for every contract/wallet with
  `LIVE | DEPLOYED | PENDING` status and `address: null` guards.
- `chain-registry.ts` — Avalanche C-Chain (43114) facts.
- `protocol-event-registry.ts` — event taxonomy → metric-effect mapping, plus the
  `REFERRAL_FORBIDDEN` vocabulary list.
- `archive-id-registry.ts` (+ `archive-nft-abi.ts`) — Archive1155 artifact IDs.
- `syndicate-config.ts` — SYN constants, allocation wallets, explorer helpers.
- `protocol-health-registry.ts` — system "worst-level" status rollup.
- `docs/canon/00-09` — the authority/intent/source-of-truth/glossary/guardrail
  canon (the human doctrine layer).

**Already vendored into `syndicate-os` @ `cf4ca34`** (per
`artifacts/api-server/src/data/sourceStatus.ts` sourceRefs): six source files —
chain registry, contract registry, protocol-event registry, sale ABI, SYN/token
config, and archive ID registry (+ archive NFT ABI). **A vendored file is not
automatically posture-promoted**, which is the load-bearing nuance: the canon
guard (`verify:canon`, 33/33) classifies `chain`, `contracts`, `token`, `archive`,
and `guardrails` as `READ_ONLY_PROOF`; `sale` as `VERIFIED_SOURCE_PENDING_ADAPTER`
(ABI vendored, no adapter); and `proof` (the protocol-event registry) as **still
`NOT_WIRED`** despite being vendored — it cannot become read-only proof until an
indexer exists. Across all categories: `READ_ONLY_PROOF` ×5, `NOT_WIRED` ×7,
`FUTURE` ×7, `VERIFIED_SOURCE_PENDING_ADAPTER` ×1. In every case, full addresses
stay server-side and are never emitted in the posture payload.

**Not yet vendored but valuable (DEFER → vendor as DATA):** the `chronicle-*`
family (curated protocol memory), `institutional-register-*`, `recognition-candidates.ts`,
the `source-*` / `referral-attribution.ts` attribution model, the learning/literacy
canon (`docs/canon/09`, `03_GLOSSARY.md`, `whitepaper.tsx` content),
`signal-registry.ts`, `report-registry.ts`, `data-verification-registry.ts`,
`chronology-*`/`eras.ts`. `sourceStatus.ts` already flags chronicle & learning as
`NOT_WIRED` "exists in TheSyndicate main but not yet vendored — promotes to
read-only proof once vendored."

**Server-side-only risks:** full contract/wallet addresses, the sale ABI, and any
holder/wallet index must remain server-side; they must never be inlined into a
public posture payload (the existing `assertPayloadDiscipline` guard already
fail-closes on a full `0x…40` address).

**Future `READ_ONLY_PROOF` candidates:** `archive` is *already* `READ_ONLY_PROOF`
(vendored); `chronicle` and `learning` become read-only proof *once vendored and
pinned* (today `NOT_WIRED`); `recognition` stays `FUTURE` (founder/formula-gated);
and live tokenomics allocation *balances* stay deferred. In every case, static
canon may be promoted to read-only proof, but **live** values never appear until an
adapter/indexer exists and is founder-approved.

---

## 6. Member / Wallet / Identity Audit

**Findings.** Real but *read-only* wallet identity. `src/lib/wallet-session.ts`
(wagmi wrapper, lowercased-address normalization, chain enforcement),
`src/lib/use-global-identity.ts` (derives `isMember` by cross-referencing the
connected wallet against the holder index), `src/lib/holder-index.ts` (scans sale
events to verify membership), `src/routes/my-syndicate.tsx` (the "Member OS"
cockpit — Seat Passport / Memory / Proof).

**Safe patterns:** membership is *derived from on-chain ownership*, not a password
account; the "neutral fallback" doctrine prevents wrong-CTA flicker during
hydration; member/wallet pages are public, read-only explorer surfaces.

**Unsafe / stale patterns:** there is **no server session/JWT/auth** — identity is
purely client wagmi state; tight coupling to `window.ethereum` events (mitigated
by a root synchronizer, but still brittle).

**Future spec implications.** This is the reference for a *future* `syndicate-os`
member surface, but `syndicate-os` is deliberately pre-wallet today. Model it as
`AUTH_REQUIRED` / `VERIFIED_SOURCE_PENDING_ADAPTER` in the source boundary and
defer wiring. **Do not copy** the live wagmi reads or `window.ethereum` coupling.

---

## 7. Admin / Operator / Internal Control Audit

**Findings.** No real admin console and **no mutation capability anywhere** — all
"control" surfaces are the `src/labs/*` + `src/routes/labs.*.tsx` "Foundation
Workbenches": read-only deterministic projections (chronicle-admission,
chronicle-candidates, chronicle-promotion, memory-candidates,
verified-introduction-review, protocol-intelligence, invariants, signals,
design-museum, component-index, etc.). The whole `labs` subtree sets
`noindex, nofollow` (`src/routes/labs.tsx`) and is excluded from nav/robots.

**Safe patterns:** strictly read-only; buttons only touch `localStorage`/local
state; clean separation of inspection from production UI.

**Unsafe patterns:** the labs are **reachable unauthenticated** by anyone who
knows the URL — security by obscurity, exposing internal protocol intelligence.
This is the single clearest "do not inherit" pattern.

**Future operator-console implications.** The *concept* (an operator inspection
shell) is valuable and maps to `syndicate-os`'s existing `/founder` /
`FOUNDER_OPERATOR_ONLY` posture — but any such surface must be `ADMIN_ONLY` behind
**real authentication**, never noindex-only. (Matches the Source Boundary
Manifest's `AdminCapabilityStatus` = `SPEC_ONLY` until auth exists.)

---

## 8. Support / Help / Community Audit

**Findings.** Minimal. Only a static, searchable FAQ (`src/routes/faq.tsx`,
`FaqRebuilt`). No live chat, contact form, ticketing, feedback loop, or
notification/announcement inbox. Community/referral affordances in
`my-syndicate.tsx` are explicitly `RESERVED`/`PENDING`.

**Reusable ideas:** the FAQ-as-static-canon pattern; the PENDING-labelling of
not-yet-built community features.

**Missing systems:** support intake, member feedback, announcement/notification
center — exactly the gap 2.20E's HARVEST backlog flagged (Supa-Exchange is the
richer prior art there).

**Future support-intake implications.** Greenfield for `syndicate-os`: spec a
read-only-first support intake / feedback surface (posture `NOT_WIRED` →
`AUTH_REQUIRED`) rather than porting anything from TheSyndicate.

---

## 9. Gamification / Retention Audit

**Findings.** Engagement is recognition-based and de-financialized by design.
`/ranks` (`src/routes/ranks.tsx`, `RankHub`) = 12 ranks across 4 groups, **derived
live from on-chain purchase events**, "recognition, not entitlement," aggregate
distribution with **no leaderboards**. The Patron **Seal** and Steward tier are
recognition artifacts, not perks. Seats use opaque ordinal letters to avoid wealth
hierarchy.

**Safe engagement patterns (PRESERVE/ADAPT):** rank/standing as *structural
recognition of participation depth*; "member number permanence"; chapters/eras as
shared-time cohorts; chronicle as earned, curated memory.

**Rejected mechanics (REJECT):** any reward/payout/commission framed as a return;
leaderboards ranked by wealth; "earn now / passive income / ROI / yield /
guaranteed reward" — explicitly blocked by the `REFERRAL_FORBIDDEN` list in
`protocol-event-registry.ts` and `FORBIDDEN_LANGUAGE` in `protocol-language.ts`.

**Soul to preserve.** From `docs/canon/01_FOUNDER_INTENT_MAP.md`: *"The Syndicate
is a society, not a security… meaning precedes mechanics,"* and the non-negotiables
"No financial rights / Recognition ≠ return / Code outranks docs / Cohort > rank."
This is the emotional core that must survive the rebuild.

---

## 10. Learning / Protocol Literacy Audit

**Findings.** Rich literacy content, mostly as routes + canon docs:
`src/routes/whitepaper.tsx`, `docs.tsx`, `faq.tsx`, `knowledge-map.tsx`,
`evolution.tsx`, `chapters.tsx` / `chapters.$slug.tsx`, `episodes.tsx`, plus
`docs/canon/09_PROTOCOL_KNOWLEDGE_MAP.md` and `03_GLOSSARY.md`.

**Reusable education patterns (ADAPT):** glossary-as-canon; the 70/20/10 routing
doctrine as the flagship teachable concept; "Activity (raw) vs Chronicle
(curated)" as a literacy frame; chapter/episode storytelling of protocol history.

**Future learning-module implications.** `syndicate-os` already reserves a
`/learning` surface (`NOT_WIRED`, "exists in TheSyndicate main but not yet
vendored"). Spec a `/learning` module that vendors the glossary + knowledge-map +
whitepaper content as static `READ_ONLY_PROOF` canon — Syndicate-specific, not
generic blockchain 101.

---

## 11. Token / Sale / Economy / Treasury Audit

- **PRESERVE:** the SYN canon — fixed 1,000,000,000 supply, "no admin, no mint,"
  seven public allocation wallets, USDC as payment token, and the 70/20/10 routing
  doctrine (`docs/canon/06_FINANCIAL_TRACE_AND_GUARDRAILS.md`,
  `src/routes/tokenomics.tsx`, `transparency.tsx`). Posture precision:
  the **token constants/config** are vendored `@cf4ca34` and classified
  `token = READ_ONLY_PROOF` (`publicClass ECONOMIC_DASHBOARD_SAFE`); the
  **70/20/10 routing and treasury doctrine** is preserved as *reference/doctrine
  only* — `treasury` and `routing` remain `NOT_WIRED`, and `sale` is
  `VERIFIED_SOURCE_PENDING_ADAPTER`. Live allocation balances / routed amounts are
  not wired and not exposed.
- **ADAPT:** the safe institutional vocabulary — "deterministic routing math"
  (never "return split"), "fixed-supply utility token," "verified introduction,"
  "economic *memory*, not economic *reward*."
- **DEFER:** live allocation balances, `totalUsdcRaised`, member count, burned
  supply, treasury/LP movement — read-only-proof *candidates* but only once an
  adapter/indexer exists and is approved (today `NOT_WIRED`/`VERIFIED_SOURCE_PENDING_ADAPTER`).
- **REJECT:** any yield/APY/ROI/profit/dividend/passive-income/guaranteed-return
  framing; "Vault" framed as ownership/claim/dividend; LP framed as member yield;
  burn framed as price-pump/buyback (all already forbidden in TheSyndicate's own
  guardrails and in `syndicate-os`'s `assertPayloadDiscipline`).
- **Public/private boundary:** sale execution (`buy`), commission routing logic,
  and full addresses stay server-side; only posture/aggregate/labelled values are
  public, and never with a full wallet address inline.

---

## 12. AI / Automation Audit

**Findings.** A real, server-side AI gateway exists: `src/routes/api.chat.ts`
(server POST, Vercel AI SDK) and `src/lib/ai-gateway.server.ts`
(`@ai-sdk/openai-compatible`, default `gpt-4.1-mini`), scoped by system prompt to
protocol/membership Q&A. The public `src/routes/ai.tsx` is `PENDING` ("not live
today"). `src/lib/ai.functions.ts` holds server functions.

**Future operator/support-worker implications.** This is a clean pattern for a
*future* `syndicate-os` support/operator assistant — but it requires a server-side
provider credential. In `syndicate-os` that should go through the Replit AI
integration (managed key), not a copied gateway. Treat as `FUTURE` until a
support-intake spec exists; keep AI server-side and scoped, never an unbounded
public chat.

---

## 13. Code Quality / Maintainability Audit

**Strengths:** single-source registries; mechanical guard scripts as CI-like
gates; strong typing; canonical route/SEO enforcement; clean raw-vs-curated data
separation; explicit `PENDING`/`address: null` discipline.

**Weaknesses / debt:** large surface area; feature-latent reserved routes; heavy
live-RPC coupling; vendored OpenZeppelin/forge-std inflate file and
sensitive-pattern counts; a `bun` + TanStack Start SSR + Foundry toolchain that is
orthogonal to `syndicate-os`.

**Rewrite-vs-copy guidance.** **Copy/vendor:** canon *data* (registries, ABIs,
config, glossary, chronicle/recognition content) — classified through the posture
enum, addresses server-side. **Rewrite (never copy):** the entire app shell
(routing, SSR, wagmi reads, OG generation, bun scripts, Foundry project). The
guard-script *philosophy* should be re-expressed via `syndicate-os`'s own
`verify:canon` + check scripts, not by importing the `.mjs` files.

---

## 14. Safety / Privacy / Framing Audit

*All counts are path/category only; no values were printed or transcribed.*

**Sensitive categories (whole repo):**
- `0x…{40}` addresses — **162 files / 906 matches.** Distribution: `docs/` (37),
  `src/lib/__tests__/` (28), `src/lib/` (12), `attached_assets/` (8),
  `docs/proposals/` (7), `contracts/` (OpenZeppelin lib + `test` + `script`),
  `src/routes/` (4), `scripts/` (4), `docs/SOURCE_PACKETS/` (4). Nature: a mix of
  *public-by-design* protocol addresses in registries, **OpenZeppelin
  example/test addresses**, doc references, and test fixtures.
- `0x…{64}` tx hashes — **103 files / 451 matches** (largely fork-test fixtures,
  audits, docs).
- emails — **7 files / 9 matches.**
- mnemonic / seed-phrase mentions — **13 files** (standard Foundry/forge-std and
  doc test mnemonics, not personal secrets).
- private-key blocks — **0.** token-like secrets (`sk-…`/`ghp_…`/`AKIA…`) — **0.**

**Unsafe framing categories:** raw counts for yield/profit/payout/ROI/guaranteed
are high, but **context is defensive**: e.g. "no yield, no dividends," "not a
yield-bearing instrument," "no profit promise," and the explicit forbidden lists
(`protocol-language.ts` `FORBIDDEN_LANGUAGE`, `protocol-event-registry.ts`
`REFERRAL_FORBIDDEN`, `docs/canon/06`). `jackpot` src = 0, `liquidity mining` = 0.
**No promotional financial-return framing was found in public copy.**

**Classification:**
- Public protocol addresses → **PRESERVE** as server-side canon; **REJECT** any
  public-payload inlining (existing guard fail-closes on this).
- OZ/forge-std fixtures, test mnemonics, fork-test tx hashes → **REWRITE/IGNORE**
  (never vendor tests or third-party libs).
- Defensive financial copy + forbidden lists → **PRESERVE** (this is the
  doctrine).

---

## 15. Old vs New Comparison Matrix

| Area | TheSyndicate status | syndicate-os status | Better in old? | Better in new? | Action | Suggested future slice |
|---|---|---|---|---|---|---|
| Runtime/stack | TanStack Start SSR + bun + Foundry, live | pnpm/Node-24 + Vite + wouter, read-only | — | ✔ (clean, safe) | REWRITE (never copy shell) | n/a |
| Source-boundary posture | Implicit (LIVE/PENDING) | Explicit 7-state enum, fail-closed | — | ✔ | PRESERVE (new) | n/a |
| Contract/chain/event/archive/sale/token canon | Authoritative source | 6 files vendored @cf4ca34 (postures vary: chain/contracts/token/archive=`READ_ONLY_PROOF`, sale=pending-adapter, proof=still `NOT_WIRED`) | — | ✔ (pinned, guarded) | PRESERVE | maintenance |
| Route IA (~70 routes) | Rich, complete | ~10 routes | ✔ | — | ADAPT | 2.20G route preservation map |
| Protocol memory (chronicle) | Full registries | `NOT_WIRED`, not vendored | ✔ | — | DEFER→vendor | 2.20H chronicle/archive vendoring |
| Recognition / ranks | Live, recognition-only | reserved `/recognition` | ✔ | — | ADAPT (read-only) | 2.20I recognition spec |
| Learning / literacy | Rich content | reserved `/learning` `NOT_WIRED` | ✔ | — | ADAPT (static canon) | 2.20J learning module |
| Token/economy dashboard | Live balances | posture-only canon | ✔ (depth) | ✔ (safety) | DEFER (adapter) | 2.20K economy read-model |
| Member / wallet identity | Live wagmi read | none (pre-wallet) | ✔ (capability) | ✔ (safety) | DEFER `AUTH_REQUIRED` | 2.20L member identity spec |
| Operator / admin | Unauthenticated labs | `/founder` `FOUNDER_OPERATOR_ONLY` posture | — | ✔ (no leak) | REWRITE (`ADMIN_ONLY`+auth) | 2.20M operator+support spec |
| Support / community | FAQ only | none | — | — (both thin) | DEFER (greenfield) | 2.20M operator+support spec |
| AI | Real gateway, PENDING UI | none | ✔ (pattern) | — | DEFER (`FUTURE`) | after support spec |
| Financial-framing guardrails | Forbidden lists + canon | `assertPayloadDiscipline` + forbidden copy | ≈ | ≈ | PRESERVE both | maintenance |
| Honesty labelling | PENDING labels | `TruthLabel`/posture system | — | ✔ | PRESERVE (new) | n/a |

**Needs founder decision:** how many of the ~70 routes the public `/` front door
should surface vs defer; whether/when to wire any live read (gated, not next).

---

## 16. Principal Preservation Backlog

> Each item: **ID · title · source evidence · target surface · action · priority ·
> dependencies · no-touch boundaries · acceptance.** No-touch applies to *all*:
> no live reads, no wallet/auth wiring, no contract calls, no addresses in public
> payloads, no financial-return framing, no copied app shell.

- **PA-01 · Public route & navigation preservation map**
  Evidence: TheSyndicate `src/routes/*` (~70) vs `syndicate-os` route table.
  Target: `seo-route-registry.ts` + a docs map. Action: ADAPT. Priority: **P0**.
  Deps: none. Acceptance: every TheSyndicate route is classified
  preserve/merge/defer/reject with a target `syndicate-os` surface; no route quietly lost.

- **PA-02 · Proof/registry/canon continuation**
  Evidence: already-vendored registries + `sourceStatus.ts`. Target: api-server
  canon. Action: PRESERVE + maintenance. Priority: **P0**. Deps: none.
  Acceptance: vendored refs stay pinned to `cf4ca34`; `verify:canon` green.

- **PA-03 · Chronicle / institutional-register protocol-memory vendoring (spec→data)**
  Evidence: `src/lib/chronicle-*`, `institutional-register-*`. Target:
  `/chronicle`, `/member` as `READ_ONLY_PROOF`. Action: DEFER→vendor as DATA.
  Priority: **P1**. Deps: PA-01. Acceptance: chronicle promoted from `NOT_WIRED`
  only after vendored+pinned; no PII, aggregate/history-safe only.

- **PA-04 · Archive / history / chronicle continuation**
  Evidence: `archive-id-registry.ts`, `/archive`+`/nft`, `chapters`/`episodes`.
  Target: `/archive` read-only proof. Action: ADAPT. Priority: **P1**. Deps: PA-03.
  Acceptance: archive IDs render as labelled read-only proof, no live mint reads.

- **PA-05 · Recognition / ranks read-only model**
  Evidence: `/ranks`, `RankHub`, `recognition-candidates.ts`,
  `01_FOUNDER_INTENT_MAP.md`. Target: `/recognition`. Action: ADAPT.
  Priority: **P1**. Deps: PA-01. Acceptance: aggregate, recognition-only, **no
  leaderboard**, no entitlement language.

- **PA-06 · Learning / protocol literacy module**
  Evidence: `whitepaper.tsx`, `knowledge-map.tsx`, `docs/canon/09`, `03_GLOSSARY.md`.
  Target: `/learning`. Action: ADAPT (static canon). Priority: **P2**. Deps: PA-01.
  Acceptance: Syndicate-specific literacy as `READ_ONLY_PROOF`; no generic 101 filler.

- **PA-07 · Token / economy read-model dashboard (spec)**
  Evidence: `tokenomics.tsx`, `transparency.tsx`, `06_FINANCIAL_TRACE…md`. Target:
  `/token` `/treasury` `/economy`. Action: DEFER (adapter-gated). Priority: **P2**.
  Deps: PA-02. Acceptance: spec only; live values stay `NOT_WIRED` until adapter+approval.

- **PA-08 · Member / wallet identity lessons (spec)**
  Evidence: `wallet-session.ts`, `use-global-identity.ts`, `holder-index.ts`.
  Target: future member surface. Action: DEFER `AUTH_REQUIRED`. Priority: **P3**.
  Deps: PA-01. Acceptance: documented spec; **no** wallet wiring; neutral-fallback
  doctrine captured; `window.ethereum` coupling explicitly excluded.

- **PA-09 · Operator console + support intake (spec, auth-gated)**
  Evidence: `labs.*` (unauth anti-pattern), `faq.tsx`. Target: `/founder`,
  support. Action: REWRITE `ADMIN_ONLY`. Priority: **P2**. Deps: PA-01.
  Acceptance: spec mandates real auth; the unauthenticated-by-obscurity pattern is
  documented as rejected.

- **PA-10 · Guard-script philosophy port**
  Evidence: `scripts/check-*.mjs`, `live-content-rules.json`. Target:
  `syndicate-os` `verify:canon` + checks. Action: ADAPT (re-express, don't copy).
  Priority: **P3**. Deps: none. Acceptance: equivalent guards exist natively; no
  `.mjs` copied.

- **PA-11 · Code-quality rewrite guidance**
  Evidence: §13. Target: all future slices. Action: REWRITE. Priority: **P3**.
  Acceptance: every harvest vendors DATA/doctrine only; app shell rewritten.

---

## 17. Recommended Sequence

Spec-first, founder-gated. **Live reads / indexers / `LIVE_ACTION` are NOT the
next slice** — evidence does not justify it (no adapter, no approval).

1. **2.20G — Public Route & Navigation Preservation Map** (PA-01, docs-only):
   reconcile ~70 prior-art routes against `syndicate-os`; classify each
   preserve/merge/defer/reject; extend `seo-route-registry.ts` plan. *Highest
   leverage, unblocks the rest.*
2. **2.20H — Chronicle + Archive Protocol-Memory Vendoring** (PA-03/PA-04):
   spec then vendor chronicle/archive registries as `READ_ONLY_PROOF` DATA.
3. **2.20I — Recognition / Ranks Read-Only Model** (PA-05): aggregate,
   recognition-only canon.
4. **2.20J — Learning / Protocol-Literacy Module** (PA-06): vendor glossary +
   knowledge-map + whitepaper as static canon at `/learning`.
5. **2.20K — Token / Economy Read-Model Dashboard Spec** (PA-07): adapter seam
   only; values stay `NOT_WIRED`.
6. **2.20L — Member / Wallet Identity Spec** (PA-08): `AUTH_REQUIRED` doctrine,
   no wiring.
7. **2.20M — Operator Console + Support Intake Spec** (PA-09): `ADMIN_ONLY`,
   fixes the labs anti-pattern; folds in 2.20E's support/comms backlog.
8. **(later) Adapter/Indexer Enablement** — only after sources pinned, posture
   gate satisfied, and founder approval.

This dovetails with the 2.20E multi-repo backlog (Supa-Exchange remains the richer
prior art for support/admin machinery, fed in at 2.20M).

---

## 18. Architect's Readback

**What the founder should STOP worrying about.**
- The soul is recoverable and *safe to inherit*: TheSyndicate was already
  proof-first and anti-financialization, with binding "recognition ≠ return"
  canon.
- The load-bearing canon (chain/contract/event/archive/sale/token) is **already
  vendored and pinned** at `cf4ca34`, behind a fail-closed posture guard.
- No secrets, private keys, or token credentials leaked from the prior art
  (0 key blocks, 0 token secrets); addresses present are public-by-design or
  third-party fixtures.

**What the founder should STILL worry about.**
- **Protocol memory is the real "don't lose the soul" risk**: chronicle,
  recognition, learning, institutional-register, and source attribution are
  **not yet vendored**. Capture them as DATA before the prior-art context fades.
- **Do not inherit the unauthenticated `labs` pattern** — any operator surface
  must be `ADMIN_ONLY` behind real auth.
- **Toolchain mismatch is a trap**: copying the TanStack/bun/Foundry shell or live
  wagmi reads would re-import the exact risk the rebuild removed. Harvest DATA +
  doctrine only.
- Live reads/wallet/sale stay deferred behind the posture upgrade gate.

**The essence that MUST survive.** "A society, not a security." Member-number
permanence; chapters/eras; recognition (not return); chronicle as curated memory
distinct from raw activity; the 70/20/10 routing doctrine; "don't trust, verify";
explicit `PENDING`/posture labelling.

**What must NEVER be imported.** Live wagmi RPC reads as a default posture; the
bun/TanStack Start/Foundry shell; full addresses in public payloads; test
fixtures/mnemonics; the unauthenticated labs; any financial-return framing.

**What Replit should keep in mind going forward.** Every harvest is DATA +
doctrine + UX intelligence, **classified through the source-boundary posture
enum**, addresses server-side, fail-closed. Spec before build. Vendor with pinned
`@cf4ca34` refs and bump them in lockstep. Founder-gated, one slice at a time —
new repo ≠ amnesia, old repo ≠ obedience.

---

## 19. Final Verdict

TheSyndicate is a strong, honest, proof-first principal ancestor whose *meaning*
is safe to inherit and whose *risk lives almost entirely in its runtime* — so the
immediate next slice should be **2.20G: the Public Route & Navigation Preservation
Map** (docs-only), which preserves the ~70-route information architecture and
unblocks the chronicle / recognition / learning vendoring that follows.
