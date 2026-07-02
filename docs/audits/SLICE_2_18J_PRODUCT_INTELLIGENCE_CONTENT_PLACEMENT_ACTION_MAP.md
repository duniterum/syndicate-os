# Slice 2.18J — Product Intelligence, Content Placement & Action Map

**Status:** READ-ONLY / REPORT-ONLY. No code implemented; no homepage rewrite;
no GitHub repository created or pushed; no changes to routes, UI, API, SEO,
contracts, assets, domain, deployment, config, feature flags, package files,
memory files, or internal index files. Nothing published or committed by this
slice.

**Doctrine honored throughout:** all contracts/wallets/source-records/members
referred to **by name only** — no `0x` addresses, no transaction hashes, no
member identifiers, no PII. Reference repos are **pattern sources, not truth
sources** for The Syndicate's live state. Nothing here authorizes wiring real
data, contracts, chain reads, or payments; every such step remains gated behind
explicit founder approval and a verified real source.

**Operating rule:** *"Protect truth and money. Keep product architecture
flexible until MVP lock."*

**Inputs synthesized:**
- `docs/audits/SLICE_2_18I_GITHUB_CAPABILITY_HARVEST_FLEXIBLE_MVP_ADAPTATION_MAP.md`
- `docs/audits/SLICE_2_18I_B_EXTERNAL_GITHUB_AUTHORITY_HARVEST_ADDENDUM.md`
- `docs/audits/SLICE_2_18I_C_REMAINING_REFERENCE_GITHUB_PATTERN_HARVEST.md`
- The live local config spine (`artifacts/studio/src/config/{modules,truthStatus,
  navigation,featureFlags,brand,syndicateFacts}.ts`) and route table
  (`artifacts/studio/src/App.tsx`).

> **Two-axis honesty (used everywhere below).** *Canon/upstream status* = what
> the external authority asserts about the real business. *Here status* = what is
> actually wired in **this** workspace. In this workspace the chain is **not**
> wired: only UI/foundation surfaces and the truth/status spine are live; every
> chain/receipt/economy/member value is `NOT_WIRED` / `FUTURE`.

---

## 1. Executive Verdict

- **Are we ready to design the NEW Syndicate OS product map?** **Yes.** The
  source universe is complete and evidence-grounded: local foundation + the
  canonical external authority (same locked commit the local canon trusts) +
  four reference repos for engineering/conversion/private-intelligence patterns.
  This document *is* that map.
- **What the NEW OS is (one paragraph).** The Syndicate OS is a proof-first
  membership/recognition protocol surface: a calm, institutional public front
  door that explains membership and lets a visitor *take a seat*, backed by an
  operator console ("Studio / Proof OS") and a read model derived from one
  canonical on-chain membership receipt. Every value is either verifiably real or
  explicitly truth-labelled as not-yet-wired. It recognizes members (identity,
  standing, era/chapter), proves protocol activity, preserves institutional
  memory (Archive + Chronicle), and shows honest economy/transparency — **without
  any financial-upside, yield, reward, or speculation framing**. It is bigger
  than the current thin app and bigger than the old app, but it stays orderly:
  each concept lives on the correct surface for the correct actor at the correct
  time.
- **Smallest stable MVP organism.** Public front door (`/`) → **Take a Seat**
  (honest join explanation + real sale truth) → **Seat receipt/identity** (member
  can see their own seat derived from the membership receipt) → **Activity/proof**
  (the seat shows up as verifiable protocol history) → **Status** (the honesty
  ledger). A member who joins must land in a cockpit that already shows their
  seat, their receipt, and where they sit in the protocol — never a dead end.
- **What must stay simple on the public surface.** The homepage: one 10-second
  message, 3–5 sections, a single primary CTA ("Take your seat"), a small
  proof/real-vs-pending strip, and links *out* to module depth. No module dump,
  no private/operator concepts, no future modules shown as live.
- **What must exist underneath (so users don't hit emptiness).** A
  receipt-driven read model (the single biggest gap), a member cockpit that
  derives identity from the receipt, an activity read model, and honest
  status/proof surfaces — even if initially `NOT_WIRED`, the *surfaces and
  interfaces* must exist and be labelled, so the experience is coherent the day
  real sources are approved.
- **What must NOT be built or shown as live yet.** Any chain read presented as
  live without a verified source; live swap/marketplace/exchange utility;
  claim/reward/referral *payments*; automated burn/buyback; governance/DAO as
  binding; member PII; and anything carrying yield/APY/passive-income/profit
  framing. All remain `NOT_WIRED` / `FUTURE` / `BLOCKED` with truth labels.

---

## 2. Source Universe Summary

| Source | Strongest contribution | What to adapt | What to ignore / block | Where it should influence the NEW OS |
| --- | --- | --- | --- | --- |
| **Local workspace** (config spine + vendored canon + this app) | The honesty engine: `truthStatus`/`surfaceStatus`, module inventory, posture-only `/api/source-status`, the read-only Studio vessel, homepage governance, SEO/wayfinding already shipped. | Extend the truth spine; keep the dual-layout (public + console); keep posture-only API until reads verified. | Don't fork the status spine; don't big-bang rewrite the Studio; don't invent new status literals. | The backbone every other surface binds to (truth status layer + the live UI foundation). |
| **External TheSyndicate** (authority, commit `cf4ca34…`) | The real product model: `MembershipPurchasedV3` receipt → Holder Index → Activity → My Syndicate; Register/Transparency; Archive1155; SourceRegistryV1; Chronicle; Proof-of-Fire; the engine/Seat object model; organism graph + module manifest + intake standard. | The receipt-driven read-model architecture, the Seat object + engine vocabulary, the module manifest/intake discipline, the must-not-imply non-edges, the adapter-seam plan for Studio. | The two named audit files as *findings* (they're question prompts); any reward/booster/commission speculation in them; addresses/tx/PII. | The product spine across member, activity, proof, archive, source, economy, and future-extension layers. |
| **Supa-Exchange** (engineering reference) | The missing backend/auth/indexer scaffolding: provider registry, `IStorage` seam, schema discipline, SIWE+2FA+role admin, `requireAdmin` guard, tx-status lifecycle, scan/snapshot read-model, feature flags, health/logging. | Architecture/patterns only, with truth labels and no live data. | Gamification (XP/levels/missions/badges/leaderboards/seasons), yield explorer/recs, referral economics, merkle airdrop claims, DCA "recurring investment", alpha, live swap activation. **Never a Syndicate data source.** | Backend/auth/control layer + activity/proof/indexer layer (architecture only). |
| **entity-chain** (caution + IA reference) | Module-separation IA, block-explorer presentation structure, transparency-page structure, one real on-chain USDC-transfer verification pattern (future reference). | IA/route-separation reference; future approved on-chain receipt-verify pattern (by reference). | **Everything product:** simulated chain/rewards data, 18.5% APY, "14 passive income streams", buyback-&-burn, airdrops/faucet/launchpad, referral commissions, paid founder badges, L1/native-coin/DAO-equity claims. | Future-extension layer (IA reference) + a *cautionary* example of the posture to never resemble. |
| **auditclaw-site** (visitor/funnel reference) | The cleanest evidence-first conversion funnel: proof-sample section, clear CTA hierarchy, lean fast static front-door. | Evidence-first proof section pattern, CTA hierarchy, single calm value statement, low-friction contact. | Affiliate referral link, dollar-offering framing, off-platform manual payment instructions. | Visitor/conversion layer (homepage + Take-a-Seat). |
| **navi-portfolio-agent** (private intelligence reference) | A small read-only portfolio/holdings aggregation loop (balances + price + totals). | Read-only aggregation/monitoring mechanics — **private operator layer only**. | Financial-advisor/alpha/yield language, autonomous trading/rebalancing, client-side key/mnemonic generation. | Private operating/control layer only (never public). |
| ~~Cesium~~ | **EXCLUDED** — too old / irrelevant. Not part of this map. | — | — | — |
| ~~Paperclip~~ | **EXCLUDED** from this GitHub/source map — separate private/localhost control-plane reference; must not be mixed in or exposed publicly. | — | — | — |

---

## 3. User / Actor Map

| Actor | Understand in 10s | Action they can take | Proof they need | Must NOT be shown yet | Owning route/surface |
| --- | --- | --- | --- | --- | --- |
| First-time visitor | What The Syndicate is + "take your seat" | Read; click primary CTA | Plain "what's real vs pending" signal | Operator/admin, future modules as live, PII | Homepage `/` |
| Serious visitor / verifier | That claims are verifiable, not hype | Open proof/status; inspect contract *names* + statuses | Real-vs-pending ledger; contract status by name | Fake/placeholder addresses; unverified "LIVE" | `/status`, `/proof` |
| Wallet-connected visitor | Their wallet is read-only here; nothing auto-happens | (Future) read-only connect to view eligibility/seat | Read-only reality; no write path | Any write/sign path before real auth; key handling | Wallet/account state (FUTURE) |
| New member | "I have a seat — here's my receipt and where I sit" | View own seat/receipt/standing | Their `MembershipPurchasedV3`-derived identity | Other members' PII; reward/payout framing | `/member` (My Syndicate) |
| Returning member | What changed since last visit | Re-check seat, activity, archive, chronicle | Fresh, honestly-dated read model | Stale data shown as live | `/member`, `/proof`, Activity |
| Source / introduction participant | Verified introduction ≠ affiliate income | (Future) review introduction status | Source policy status (paused/pending) | "Affiliate income"/commission payment framing | `/source` (Verified Introduction) |
| Founder / admin / operator | The control plane + approvals | (Private) review posture, approve activation | Real roles/auth; audit log | Anything before real auth; localStorage roles | `/founder` (private) |
| Future partner / institutional viewer | The protocol is durable, transparent, lawful | Read transparency/register (aggregate) | Tx-anchored economy; aggregate register | Member PII; speculative economics | Transparency / Register (FOUNDATION/FUTURE) |
| Public community observer | The protocol's heartbeat + memory | Read Activity, Archive, Chronicle | Verifiable events; admitted history | Auto-published/embellished history | Activity, Archive, Chronicle |

---

## 4. Surface Ownership Map

> Truth-status values use the live local enum (`truthStatus.ts`). "Here status"
> is the honest local posture; upstream may be richer.

| Surface / route | Primary audience | Primary job | Content it owns | Action it owns | Proof / source of truth | Truth status required (here) | Must NOT appear | CTA priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Homepage `/`** | First-time + serious visitor | Orient + convert | Hero, promoted strip (≤4), how-it-works, real-vs-pending summary, studio teaser, expectations | Click primary CTA | `syndicateFacts.ts` / `brand.ts` / `surfaceStatus` | Live (UI) + bound labels | Module dump, operator concepts, future-as-live, PII | **Primary:** Take a Seat |
| **Join / Take a Seat** | Visitor ready to join | Honest join explanation + real sale truth | Seat meaning, sale state, routing summary, expectations | (Future) buy via sale | MembershipSaleV3 (by name) + receipt | `SYNDICATE_INDEXER_NOT_WIRED` / FUTURE | Upside/ROI/FOMO framing | **Primary** |
| **My Syndicate / member cockpit `/member`** | New + returning member | Show *their* seat, receipt, standing | Seat identity, receipt summary, contribution depth, pending modules (as pending) | View own data | Holder Index derived from receipt | `AWAITING_FOUNDER_APPROVAL` → NOT_WIRED | Other members' PII; reward framing | Secondary |
| **Activity / heartbeat** | Members + observers | Show verifiable protocol events | Event feed, metrics, chronicle candidates | Read | Protocol event taxonomy + receipt scans | `EVENT_ADAPTER_NOT_WIRED` | Fabricated/simulated events | Secondary |
| **Registry / proof `/proof`** | Verifier | Prove membership + protocol actions | Verifiable truth surface, contract statuses by name | Read/verify | Contract registry (names) + read model | `DESIGN_PREVIEW` → NOT_WIRED | Placeholder addresses; unverified LIVE | Secondary |
| **Transparency / Economy** | Institutional viewer | Honest funds/economy | 70/20/10 routing, revenue registry, treasury/LP reads | Read | Treasury doctrine + contract registry (tx-anchored) | NOT_WIRED (FOUNDATION) | Yield/APR/profit; untethered numbers | Tertiary |
| **Archive / NFT memory** | Observer + member | Protocol memory artifacts | Archive1155 IDs (memory objects, not seats) | (Future) view/mint memory | Archive1155 ABI + 9-ID registry | `ARCHIVE_READS_NOT_WIRED` | "mint for gains"; seat-equivalence | Tertiary |
| **Chronicle / institutional memory** | Observer | Curated institutional history | Locked curated entries + drafts | Read | Chronicle admission rules (never auto-publish) | FUTURE (PARTIAL upstream) | Auto-published/embellished history | Tertiary |
| **Source / Verified Introduction `/source`** | Source participant | Show introduction policy/status | Source policy, status (paused/pending) | (Future) review introduction | SourceRegistryV1 (by name) | `SOURCE_INDEXER_NOT_WIRED` | Affiliate-income/commission payment framing | Tertiary |
| **Wallet / account state** | Wallet visitor | Read-only reality layer | Connection state, read-only eligibility | (Future) read-only connect | Chain registry read helpers (no keys) | NOT_WIRED (FUTURE) | Write/sign paths; server-side keys | Contextual |
| **Founder / Admin private surface `/founder`** | Founder/operator | Control plane + approvals | Posture mgmt, approvals, audit log | (Private) approve/activate | Real roles/auth (future) | `AWAITING_FOUNDER_APPROVAL` | Any public exposure; localStorage roles | Private only |
| **Future modules / What's building** | Visitor + member | Show ambition honestly | Clearly-labelled future modules | Read | `modules.ts` (phase:future) | `FUTURE_MODULE` | Future-as-live | Low |
| **Docs / whitepaper / explanation `/learning`** | Verifier + visitor | Explain protocol + claims | Canon-derived explanation, claim/source/disclaimer | Read | Canon layers + whitepaper extraction map | `FUTURE_MODULE` | Legal-risk claims; forbidden copy | Low |

**Homepage rule (binding):** the homepage *orients and converts*. It is **not**
a dumping ground for every module, future system, intelligence report, or private
operating layer. Depth lives on module routes; `/` summarizes and links out.

---

## 5. Content Placement Map

| Concept | Canonical meaning | Public / Private / Future | Owner surface | Secondary surfaces | Proof source | CTA (if any) | Forbidden copy | MVP status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Membership / seat | A seat in the protocol (identity + standing) | Public | Take a Seat | Homepage, `/member` | MembershipSaleV3 receipt (by name) | Take a Seat | "investment", "shares", upside | **MUST WORK** |
| SYN token | Fixed-supply ERC-20 (no mint/tax) — utility, not security | Public (factual) | Docs/Economy | Transparency | Contract registry (by name) | — | yield/APY/profit/ROI | FOUNDATION ONLY |
| Sale / join | Acquire a seat (SYN via USDC) | Public | Take a Seat | Homepage | MembershipSaleV3 (by name) | Take a Seat | FOMO/"buy before price rises" | **MUST WORK** |
| 70/20/10 routing | Vault/Liquidity/Operations split of acquisition funds | Public (tx-anchored) | Transparency / Economy | Take a Seat (summary) | Treasury doctrine + wallets (by role) | — | "returns", "payout to members" | FOUNDATION ONLY |
| DEX / secondary market | Where SYN trades (factual existence only) | Public (factual) / Future (product) | Economy (factual) | — | Trader Joe LP pair (by name) | — | "swap to earn", liquidity-mining/APR | V2 (product) |
| Member identity | Member number/chapter/rank/seat derived from receipt | Public (own) / Private (others' PII) | `/member` | Activity | Holder Index (derived) | — | exposing others' PII | **MUST WORK** (own only) |
| Rank / recognition | Standing earned by participation (recognition-only) | Public (aggregate) / Future (formula) | Recognition / `/member` | — | Recognition canon (future) | — | "rewards"/"earnings"/leaderboard speculation | FOUNDATION ONLY |
| Era / chapter | Time/cohort framing of seats | Public | `/member` | Take a Seat, Activity | Receipt fields (era/chapter) | — | — | FOUNDATION ONLY |
| Source / verified introduction | Policy-gated attribution of who introduced whom | Public (status) / Future (live) | `/source` | `/member` | SourceRegistryV1 (by name) | — | "affiliate income"/commission payouts | FOUNDATION ONLY |
| Referral language | (Reframed) "verified introduction", anonymized | Future (gated) | `/source` | — | Source policy | — | referral economics / payment promises | FOUNDATION ONLY |
| Archive / NFT memory | Archive1155 memory objects (not seats, not commissionable) | Public (reads) / Future (mint UX) | Archive | Activity | Archive1155 + ID registry | (Future) view | "mint for gains"; seat-equivalence | FOUNDATION ONLY |
| Chronicle | Curated institutional history, admitted not auto-published | Public | Chronicle | Activity | Chronicle admission rules | — | embellishment; "routine accounting as history" | FOUNDATION ONLY |
| Activity | Classified verifiable protocol events | Public | Activity | `/proof`, `/member` | Event taxonomy + receipt scans | — | fabricated/simulated events | **MUST WORK** (read-only) |
| Treasury / economy | Honest, tx-anchored funds view | Public | Transparency / Economy | Homepage (summary) | Contract registry + treasury doctrine | — | APR/yield/profit projections | FOUNDATION ONLY |
| Burn / Proof of Fire | One-off, manual, verifiable SYN burn (memory/transparency) | Public | Transparency / Proof | Chronicle | Named burn proof event | — | "burn = price up"/buyback-yield | FOUNDATION ONLY |
| Future marketplace | Buying/selling protocol products | Future | Future modules | — | — (not built) | — | "earn"/speculation | V2 |
| Future SwapRail / exchange-like utility | Protocol-native swap/bridge | Future | Future modules | — | — (not built) | — | exchange activation/yield | V2 |
| Future governance / DAO | Recognition-only governance (per engine model) | Future | Future modules | — | Engine model (recognition-only) | — | binding "vote = equity/returns" | V2 |
| Future SeatRecord721 | ERC-721 seat identity (pending) | Future | `/member` (future) | — | Contract registry (pending, by name) | — | "tradeable seat for profit" | V2 |
| Private founder/admin/control layer | Operator control plane | Private | `/founder` | — | Real roles/auth (future) | — | any public exposure | PRIVATE ONLY |
| AI / operator intelligence | Read-only private monitoring/aggregation | Private | Founder/operator | — | Private read model (navi pattern) | — | financial advice/alpha (public) | PRIVATE ONLY |
| Reference-repo-derived backend/indexer/admin patterns | Architecture scaffolding (Supa patterns) | Private (architecture) | Backend/control layer | — | N/A (pattern only) | — | importing Supa product claims/rewards | FOUNDATION ONLY (architecture) |

---

## 6. Action Map

> **Honesty rule applied:** nothing is marked LIVE unless it is actually live in
> **this** target workspace. In this workspace no chain/wallet/economy action is
> live; reading the honesty/status surfaces is the only genuinely working "read".

| Action | Actor | Surface | Status (here) | Required proof/source before live | Result / receipt | Follow-up surface | Risk | MVP class |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Connect wallet | Visitor | Wallet/account | **NOT_WIRED** | Read-only EIP-1193 path; never hold keys | Read-only connection state | `/member`, `/proof` | Key exposure, write path | FOUNDATION ONLY |
| Switch network | Visitor | Wallet/account | **NOT_WIRED** | Chain registry config | Correct chain context | Wallet | Wrong-chain confusion | FOUNDATION ONLY |
| Join / buy membership | Visitor | Take a Seat | **NOT_WIRED / FUTURE** | MembershipSaleV3 address + RPC + verified state | `MembershipPurchasedV3` receipt | `/member` | Fake price/inventory; FOMO copy | **MUST WORK** |
| View receipt | Member | `/member` | **NOT_WIRED** | Receipt scan/read model | Rendered receipt summary | Activity | Showing unverified as real | **MUST WORK** |
| View member identity | Member | `/member` | **NOT_WIRED** (`AWAITING_FOUNDER_APPROVAL`) | Holder Index + real auth | Seat/standing view | Activity | Other-member PII leak | **MUST WORK** (own only) |
| View Activity | Member/observer | Activity | **NOT_WIRED** (`EVENT_ADAPTER_NOT_WIRED`) | Indexer (net-new) + event taxonomy | Event feed/metrics | `/proof`, Chronicle | Fabricated events | **MUST WORK** (read-only) |
| Verify contract / address / status | Verifier | `/status`, `/proof` | **READ-ONLY** (status labels) / NOT_WIRED (on-chain state) | RPC + per-address verify for live state | Honest posture + (future) verified state | `/proof` | Placeholder address; false LIVE | **MUST WORK** (posture) |
| View routing / economy | Institutional viewer | Transparency/Economy | **NOT_WIRED** | RPC + indexer; tx-anchored only | Tx-anchored economy view | Chronicle | Yield/APR framing | FOUNDATION ONLY |
| View Archive / mint memory | Observer/member | Archive | **NOT_WIRED** (`ARCHIVE_READS_NOT_WIRED`) | Verified Archive read path | Archive view / (future) mint | Activity | "mint for gains" | FOUNDATION ONLY |
| Read Chronicle | Observer | Chronicle | **FUTURE** | Admission rules + curation | Curated history | Activity | Embellishment | FOUNDATION ONLY |
| Source / verified-introduction review | Source participant | `/source` | **NOT_WIRED** (`SOURCE_INDEXER_NOT_WIRED`) | Source indexer + anonymization | Introduction status | `/member` | Affiliate-income framing | FOUNDATION ONLY |
| Share proof / card | Member | `/member`, `/proof` | **NOT_WIRED / FUTURE** | Verified seat/receipt | Shareable proof card | Homepage | Sharing unverified/PII | V2 |
| Import token (if safe) | Visitor | Wallet/account | **NOT_WIRED / FUTURE** | Token registry (by name) | Token added to wallet | Economy | Wrong token/address | V2 |
| Admin / operator review | Founder | `/founder` | **PRIVATE** (`AWAITING_FOUNDER_APPROVAL`) | Real roles/auth + audit log | Approval/activation record | Founder cockpit | Pre-auth exposure | PRIVATE ONLY |
| Future swap / exchange-like utility | Visitor | Future | **FUTURE / BLOCKED** | Real product + approval + legal | — | — | Exchange activation/yield | V2 |
| Future marketplace / product purchase | Visitor | Future | **FUTURE** | Real product + approval | Product receipt | — | "earn"/speculation | V2 |
| Future claim / reward / referral payment | Member/source | Future | **BLOCKED** | Verified source + explicit approval + legal | — | — | Unverified payments — hard block | V2 |
| Future governance / DAO | Member | Future | **FUTURE** | Recognition-only model + approval | Recognition signal | — | "vote = equity/returns" | V2 |

---

## 7. Proof / Data / Adapter Map

> This is where **Supa-Exchange patterns influence architecture only** — provider
> registry, `IStorage`/repository seam, schema discipline, admin auth,
> transaction/status lifecycle, scan/snapshot read-model, health/logging, feature
> flags. **No** Supa product claims, rewards, yield, gamification, or exchange
> activation are imported.

| Data / proof need | Source of truth | Current availability | Adapter? | Indexer/read-model? | Backend/API? | Storage/schema? | Security/auth? | Public/Private | MVP priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Membership receipts | `MembershipPurchasedV3` (by name) | Vendored ABI; not wired | **Yes** (MembershipSale adapter) | **Yes** (receipt scan → holder index) | Yes (read API) | Yes (receipt/seat schema) | Read public; write gated | Public (own detail gated) | **P0** |
| Wallet / member identity | Holder Index (derived from receipts) | Concept only; not wired | Yes (MemberIndex adapter) | Yes | Yes | Yes (member/seat) | Real auth for own-data | Public (aggregate) / Private (PII) | **P0** |
| Activity events | Protocol event taxonomy + sale ABIs | Taxonomy vendored; indexer net-new | Yes (Activity adapter) | **Yes** (net-new indexer) | Yes | Yes (events) | Read public | Public | **P0** |
| Routing / economy balances | Treasury doctrine + contract registry | Doctrine + names; not wired | Yes (Transparency adapter) | Yes (snapshot read-model) | Yes | Yes (economy snapshots) | Read public | Public (tx-anchored) | P1 |
| Archive events | Archive1155 + 9-ID registry | ABI + registry vendored; reads not wired | Yes (Archive adapter) | Yes (mint/scan read-model) | Yes | Yes (archive) | Read public | Public | P1 |
| Source / introduction status | SourceRegistryV1 (by name) | ABI vendored; indexer not wired | Yes (SourcePolicy adapter) | Yes (source indexer + anonymize) | Yes | Yes (source, anonymized) | Read public; policy gated | Public (status) / Private (PII) | P1 |
| Burn events (Proof of Fire) | Named burn proof event | One-off, manual; not wired | Yes (BurnProof adapter) | Light (event read) | Yes | Yes (burn proof) | Read public | Public | P2 |
| Admin / operator audit events | Real roles/auth + audit log | Not built | Yes (admin) | Light | Yes | Yes (audit log) | **Strong** (SIWE+2FA+roles) | Private (founder) | P1 (private) |
| Dashboard health | Internal CLIs + health endpoint | `/api/healthz` live; CLIs internal | Yes (health adapter) | Light | Yes (`/api/healthz` exists) | Optional | Read (gated detail) | Public (basic) / Private (detail) | P1 |
| Future marketplace/swap/payment events | Not built | Not built | Future | Future | Future | Future | Strong (future) | Future | V2 |

**Adapter-seam set (interfaces awaiting real sources, rendered NOT_WIRED):**
WalletAdapter · MembershipSale · MemberIndex · Activity · SourcePolicy · Archive
· BurnProof · Transparency. Each is a typed interface with a truth-label, **no
live data**, until a founder-approved real source exists.

---

## 8. MVP Organism Classification

> The MVP is **not a thin demo** — it is the smallest *stable growth organism*.
> A user who joins must not feel "I joined, now what?"

| Module | Class | Why | Dependency | Minimum acceptable MVP behavior | Test / release gate | Legal / truth guardrail |
| --- | --- | --- | --- | --- | --- | --- |
| Homepage `/` | **MUST WORK** | The front door + conversion | Config spine | Clear 10s message, primary CTA, real-vs-pending strip, links out | Truth labels bound; no forbidden copy; lighthouse/SEO pass | No upside framing; future ≠ live |
| Take a Seat (join) | **MUST WORK** | Core protocol action | MembershipSaleV3 addr + RPC + verified state | Honest seat explanation + real sale truth (or labelled NOT_WIRED) | Sale state verified against chain before any "live" claim | No FOMO/ROI; real price/inventory only |
| Seat receipt + identity | **MUST WORK** | "I joined, here's my seat" | Receipt read model + auth | Member sees own seat/receipt/standing derived from receipt | Own-data-only verified; no cross-member leak | PII gated; own data only |
| Activity (read-only) | **MUST WORK** | Proof the seat is real history | Net-new indexer + taxonomy | Verifiable event feed with honest freshness | No fabricated events; freshness dated | No simulated data |
| Status / honesty ledger | **MUST WORK** | The doctrine's spine | Config spine (live) | Authoritative real-vs-pending ledger | Every module's status accurate | Must match reality exactly |
| Proof / registry | **FOUNDATION ONLY** | Verifiable truth surface | Read model + contract names | Contract statuses by name; (future) verified reads | No placeholder addresses | Names only until verified |
| Transparency / Economy | **FOUNDATION ONLY** | Honest funds view | RPC + indexer | 70/20/10 + revenue registry (tx-anchored or NOT_WIRED) | Tx-anchored only | No yield/APR/profit |
| Archive / memory | **FOUNDATION ONLY** | Protocol memory | Archive read path | Read Archive IDs as memory objects | Verified reads before "live" | Not seats; not commissionable |
| Chronicle | **FOUNDATION ONLY** | Institutional history | Admission rules | Curated entries; drafts never auto-publish | Admission rules enforced | No embellishment |
| Source / Verified Introduction | **FOUNDATION ONLY** | Attribution policy | Source indexer + anonymization | Show policy/status; no payments | Anonymized; launch gated | No affiliate-income framing |
| Wallet / account | **FOUNDATION ONLY** | Read-only reality | Chain registry helpers | Read-only connect + eligibility view | No write/sign; no keys | Never hold keys |
| Founder / operator cockpit | **PRIVATE ONLY** | Control plane | Real roles/auth | Posture mgmt + approvals (private) | Real auth before any access | No public exposure |
| Recognition / rank | **V2** | Standing formula undecided | Recognition canon | (Aggregate) recognition-only framing | Founder formula decision | No rewards/earnings framing |
| Future marketplace / SwapRail / SeatRecord721 / governance | **V2** | Net-new products | Approval + legal | Listed as future, never live | Founder + legal gate | No speculation/yield/equity |
| AI / private operator intelligence | **PRIVATE ONLY** | Operator monitoring | Private read model | Read-only aggregation (navi pattern) | Private only | No public financial advice/alpha |
| Simulated chain / rewards / yield / gamification / referral economics | **DISCARD / BLOCK** | Doctrine violation | — | Never built/shown | N/A | Hard-blocked |

---

## 9. Homepage Governance

- **10-second visitor message:** "The Syndicate is a proof-first membership
  protocol — take your seat; everything here is either verifiable or honestly
  labelled as not-yet-wired."
- **3–5 homepage sections (max), per the fixed model:** Hero · Promoted Strip
  (≤4 cards) · How-It-Works · Real-vs-Pending Summary · Studio Teaser ·
  Expectations. (Adding a promoted card requires removing one.)
- **CTA hierarchy:** **Primary** = "Take your seat" (join). **Secondary** =
  "See the proof / status" (verifier path). **Tertiary** = "Explore the Studio
  OS". No more than one primary.
- **Proof on homepage:** a small real-vs-pending strip bound to `surfaceStatus` —
  what's real, what's awaiting source — plus one calm proof signal (e.g. the
  honesty ledger link). Nothing requiring live chain reads.
- **Proof linked deeper (not on `/`):** full contract/registry detail, activity
  feed, transparency/economy numbers, archive, chronicle, source policy — all on
  their module routes.
- **Future modules that must stay off the homepage:** member cockpit internals,
  source/introduction, archive depth, chronicle, recognition formula, future
  marketplace/swap/governance, and anything `phase:future` beyond a single
  "what's building" teaser link.
- **Private/admin concepts that must never appear:** founder/operator cockpit,
  private operator intelligence, reference-repo harvest reports, AI/control
  layers, backend/indexer health detail, any PII.
- **How to show ambition without dumping the OS:** one honest "what's building"
  teaser that *links out*, plus the real-vs-pending strip — ambition is shown by
  *honesty and clarity*, not by surfacing every module.

**Allowed homepage concepts:** membership/seat, the join CTA, factual SYN/routing
*summary* (no economics), how-it-works, real-vs-pending strip, studio teaser,
expectations, single "what's building" link.

**Forbidden homepage concepts:** live chain numbers without a verified source;
yield/APY/profit/ROI/reward/passive-income framing; operator/admin/private
surfaces; PII; future modules shown as live; module-depth dumps; placeholder
addresses.

**Homepage CTA hierarchy:** Primary "Take your seat" → Secondary "See the proof"
→ Tertiary "Explore the Studio OS".

**Homepage proof-strip requirements:** bound to `surfaceStatus`/`truthStatus`
(no inline status literals); shows real-vs-pending honestly; no value that
requires a live chain read; links to `/status` as the authoritative ledger.

---

## 10. Public vs Private Boundary

| Concept / surface | Public-safe? | Private-only? | Founder/admin-only? | Future (public later)? | Reason | Required gate before public |
| --- | --- | --- | --- | --- | --- | --- |
| Founder/admin cockpit | No | Yes | Yes | No | Control plane | Real roles/auth; never public |
| Private operator intelligence (navi-style) | No | Yes | Yes | No | Internal monitoring | Stays private |
| Reference-repo harvest reports (`docs/audits/SLICE_2_18I*`) | No (default) | Yes | Yes | Founder decision | Internal planning incl. repo names/patterns | Founder review before any publish |
| AI / control layers | No | Yes | Yes | No | Control plane | Stays private |
| Source / referral economics | No (economics) | Partly | Partly | Status later | "Verified introduction" only; economics unverified | Anonymization + indexer + approval |
| Backend / indexer health (detail) | Basic only | Detail private | Detail | Basic later | Ops detail is sensitive | Gate detail behind auth |
| User / member PII | No | Yes | Yes | Aggregate later | Privacy/legal | Explicit founder privacy policy |
| Legal / CFO / LP / economic strategy | No | Yes | Yes | No | Confidential business | Never public |
| Paperclip / private control-plane ideas | No | Yes | Yes | No | Out of scope; private | Never mixed into public map/repo |
| Replit / Hermes / internal workflow refs | No | Yes | Yes | No | Internal tooling | Never exposed publicly |
| Contract addresses / tx hashes | No (raw) | Server-side canon | Yes | Names public | Doctrine: names only publicly | Addresses stay server-side; verify before any exposure |

> **Hard rule:** do not expose private Dave/Hermes/Replit/control-tower details
> publicly. The reference harvest reports, the private operator intelligence, and
> any control-plane references stay internal by default; publishing any of them is
> an explicit, separate founder decision.

---

## 11. Reference Repo Influence Map

> **Hard rule:** reference repos are **pattern sources, not truth sources** for
> The Syndicate's live state.

| Repo / source | Allowed influence | Forbidden influence | Target OS layer | Confidence |
| --- | --- | --- | --- | --- |
| **TheSyndicate** (authority) | Receipt-driven read-model architecture, Seat/engine vocabulary, module manifest + intake standard, organism-graph + must-not-imply non-edges, adapter-seam plan, canon/whitepaper claim discipline, status vocabulary | Treating it as *this* workspace's live state; copying addresses/tx/PII; lifting audit-prompt language as findings or product copy | Product spine (member/activity/proof/archive/source/economy/future) | **High** (same locked commit the local canon trusts) |
| **Supa-Exchange** | Provider registry, `IStorage` seam, schema discipline, SIWE+2FA+role admin, `requireAdmin` guard, tx-status lifecycle, scan/snapshot read-model, feature flags, health/logging | Gamification, yield, referral economics, seasons/airdrops/DCA/alpha, live swap activation; **using it as a Syndicate data source** | Backend/auth/control + activity/indexer (architecture only) | **High** (engineering); **Zero** (product) |
| **entity-chain** | Module-separation IA reference; block-explorer presentation structure; future approved on-chain receipt-verify pattern (by reference) | Simulated chain/rewards data; 18.5% APY; 14 passive income streams; buyback-burn; airdrops/faucet/launchpad; referral commissions; paid founder badges; L1/coin/DAO-equity claims | Future-extension (IA reference) + cautionary example | **Low–Medium** (structure only) |
| **auditclaw-site** | Evidence-first proof section, CTA hierarchy, lean static front-door, single calm value statement, low-friction contact | Affiliate referral link; dollar-offering framing; off-platform manual payment instructions | Visitor/conversion (homepage + Take a Seat) | **Medium** |
| **navi-portfolio-agent** | Read-only portfolio/holdings aggregation loop (private) | Financial-advisor/alpha/yield language; autonomous trading/rebalancing; client-side key/mnemonic generation | Private operating/control layer only | **Low** (private only) |

---

## 12. New Repository Readiness Implications

*(Discussion / planning only. Do not create a repo. Do not run `gh repo create`.
Do not push.)*

The founder intends that **after** Product Intelligence, a new GitHub repository
may be created under `duniterum` so the codebase becomes inspectable and aligned.

- **What a clean NEW Syndicate OS repo should contain:** the current pnpm
  monorepo as-is — `artifacts/studio` (public + console foundation),
  `artifacts/api-server` (posture-only `/api`), `lib/*` shared libs, `scripts/`,
  the config spine, the vendored canon **(names/ABIs/registries only — no
  addresses/PII)**, `pnpm-workspace.yaml`, `tsconfig.*`, `replit.md`, and a
  curated `docs/` (canon-derived explanation + the truth doctrine).
- **What should be excluded:** secrets/`.env`; any contract **addresses**, tx
  hashes, or member **PII**; the member roster / origin freeze (already
  deliberately not vendored); `/tmp` reference clones; node_modules /
  build artifacts / `.tsbuildinfo`; private operator-intelligence code; Paperclip
  / Hermes / Replit / control-tower internal references.
- **Public-safe:** the read-only foundation, the truth-label/status spine, the
  posture-only API, contract registry **by name/role/status**, canon-derived
  docs.
- **Private / outside the repo (or private repo only):** the
  `docs/audits/SLICE_2_18I*` harvest reports (reference-repo names + internal
  strategy), founder/operator cockpit internals, private intelligence, any
  addresses/PII, and the legal/CFO/LP strategy. (Founder decides whether the
  harvest audits ship in a private repo or stay out entirely.)
- **Suggested repo name options:** `syndicate-os`, `the-syndicate-os`,
  `syndicate-studio-os`, `syndicate-proof-os`. (Recommendation: `syndicate-os` —
  short, product-accurate, room to grow.)
- **Recommended initial folder structure:** mirror the current monorepo —
  `artifacts/{studio,api-server}/`, `lib/`, `scripts/`, `docs/`,
  `pnpm-workspace.yaml`, `tsconfig.base.json`, `tsconfig.json`, `package.json`,
  `replit.md`, `.gitignore`.
- **First-commit contents:** the clean read-only foundation + truth spine +
  posture-only API + name-only canon + curated docs + this map (founder's
  call on whether the audits are included). No live wiring, no addresses, no PII.
- **Minimum `.gitignore` / secret boundary:** `node_modules`, build output,
  `.tsbuildinfo`, `.env*` and all secret files, any local data, `/tmp`
  references; plus a pre-push scan that **fails closed** on `0x`-address
  patterns, tx-hash patterns, and known PII before any commit is pushed.
- **What must be verified before pushing:** (1) zero addresses/tx/PII anywhere
  (automated scan + manual review); (2) no secrets/`.env`; (3) no forbidden
  financial copy; (4) the harvest-audit inclusion decision is made explicitly;
  (5) `pnpm run typecheck` passes; (6) the repo's honesty posture matches reality
  (no surface claims LIVE that isn't).

---

## 13. Implementation Sequence After This Map

| Next slice | Goal | Why | Allowed changes | No-touch boundaries | Deliverable |
| --- | --- | --- | --- | --- | --- |
| **2.18K — New Repo / Source-of-Truth Foundation Plan** (report-only) | Define exactly what the clean repo contains + the secret/PII boundary + the pre-push verification gate | Makes repo creation safe and unambiguous before any push | Write one planning report | No repo creation, no push, no code, no wiring | `docs/audits/SLICE_2_18K_*` repo-foundation + secret-boundary plan |
| **2.18L — Create new GitHub repo + initial clean push** (action, **after founder approval only**) | Create `duniterum/<name>`, push the verified clean foundation | Inspectable, aligned codebase | `gh repo create` + first push *after* the 2.18K verification gate passes | No addresses/PII/secrets; no live wiring | New repo + verified first commit |
| **2.19 — First implementation slice (safe architecture)** | Adopt the module-manifest standard + adapter-seam **interfaces** (NOT_WIRED, typed, truth-labelled) + bind the deferred homepage labels (`hero badge`/`coreStatus` → `surfaceStatus`) | Builds the skeleton the read model will plug into, with zero live data | Add typed interfaces + label bindings + manifest; UI structure | No live chain reads; no real data; no contracts/payments | First implementation PR (architecture only) |

**Honest note on sequence.** The founder's stated order (2.18K → 2.18L → 2.19) is
sound, **with one inserted gate:** the **secret/PII pre-push verification** must
be a hard, automated gate inside 2.18K and re-run at 2.18L — repo creation must
not precede it. Everything that touches live chain data (the receipt-driven read
model, the biggest capability gap) stays *after* 2.19 and behind a verified real
source + founder approval; it is intentionally **not** the first implementation.

---

## 14. Final Readiness Verdict

- **Ready to create the Product Intelligence map?** **Yes — this report is the
  map.**
- **Ready to implement?** **Not yet.** Implementation should begin only after the
  repo foundation plan (2.18K) and explicit founder approval; the first safe
  implementation (2.19) is architecture-only (interfaces + manifest + label
  bindings), never live data.
- **Ready to create the new GitHub repo?** **After founder approval** — and only
  once the 2.18K secret/PII/address pre-push verification gate passes.
- **Single highest-leverage next action:** authorize **Slice 2.18K** — lock the
  clean-repo contents + the secret/PII boundary + the pre-push verification gate.
  It unblocks the founder's near-term intent (an inspectable repo) *and* forces
  the explicit decision on what is public-safe versus private, which everything
  downstream depends on.

---

*End of report. No further action taken: no implementation, no homepage rewrite,
no repo created, no push, no commit, no publish, and no edits to product, config,
memory, or index files. Reference material remains read-only; all contracts/
wallets referred to by name only; nothing marked LIVE that is not live in this
workspace.*
