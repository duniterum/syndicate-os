# Slice 2.17 — Full OS + Language Constitution Recovery

> **Slice type:** READ-ONLY / REPORT-ONLY. This document changes no product behavior,
> no routes, no UI, no API, no contracts, no source registries, no guards, no config,
> no package files. It adds exactly one file (this report). It does not recreate
> `.agents/` or `attached_assets/`. It activates no source/referral/claim/public
> source-aware path and does not change `/api/source-status`.
>
> **Date:** 2026-06-29 · **Base commit:** `488bebd` (2.16B hygiene) · **Repo:** `artifacts/*` monorepo (slug `studio` at `/`, `api-server` at `/api`).
>
> **Authoring discipline:** This is a *recovery, reconciliation, and staging* document.
> Where the founder's expected doctrine file does not exist in this repo, it is recorded
> verbatim as **"not present in this repo slice"** and nothing is invented in its place.
> Code/on-chain truth outranks docs; this slice does **not** repair code. Every
> "recommended wording" below is **provisional and non-binding until the founder ratifies
> it** in a later slice — this report is not new canon.

---

## 1. Executive Verdict

**Is the repo ready to proceed after 2.16B?** **Yes — for doctrine reconciliation only, not for product implementation.** The base is clean: working tree clean and `/api/source-status` intact at POSTURE_ONLY. The guards and typechecks were last verified **green in the 2.16B closeout / ledger**; they were **not re-run in this report-only slice** (no code changed). There is no technical blocker to *planning*.

**Is the next action implementation or doctrine reconciliation?** **Doctrine reconciliation.** The single largest discovery of this slice is that **the doctrine corpus the founder remembers does not exist in this repository.** Of the ~70 doctrine documents enumerated in the Slice 2.17 brief (VISION, NORTH_STAR_SYSTEM, INFORMATION_HIERARCHY, the entire `docs/canon/00–09` set, TERMINOLOGY_GLOSSARY, BRAND_GUIDELINES, STORY_ENGINE family, the economy set, the source/introduction set, the chronicle/sprint set, the NFT_ARCHIVE set), **none are present.** `docs/` contains only **6 files**, all Phase 1 slice reports plus the ledger. The actual, authoritative doctrine of this rebuild is **code-and-config-resident**, not document-resident.

**The single most important risk if we build now:** **Memory-loss / re-invention drift.** Because the constitutional documents are *not present in this repo* (and **must be recovered externally** — e.g. from the founder's own records and/or the upstream `duniterum/TheSyndicate` source repo; this report does not assert where they currently live), any implementation slice that proceeds before this report is ratified will re-derive language and product decisions from a partial in-repo glossary — guaranteeing terminology drift, source/referral framing drift, and Supa/tool framing drift exactly where the founder is most exposed legally. **The correct next move is to lock this recovery report and turn it into a route-by-route map (Slice 2.18), not to write product code.**

---

## 2. Current Clean Base

- **`git status --short`:** clean (no pending changes) at the start of this slice. The only change this slice introduces is this report.
- **2.16B auto-checkpoint:** **landed.** `HEAD` is `488bebd` — *"Remove internal agent and attached asset files from the repository."* The 2.16B forward deletions are committed; there are **no** leftover pending non-report changes to mix in.
- **`.agents/`:** **absent** on disk, **0 tracked files**, **gitignored** (`.gitignore` → `.agents/`).
- **`attached_assets/`:** **present on disk but gitignored and 0 tracked files** (`git check-ignore` → `.gitignore:53:attached_assets/`). It reappeared **only** because the platform stores the newly-pasted Slice 2.17 brief files there. This is **not** a recreation of tracked context — it is ignored scratch space and does not enter the product repo. Hygiene from 2.16B holds.
- **This slice changed only the report:** confirmed in §Verification at the end of this document.

---

## 3. Source Authority Map

Ranked highest → lowest. For each: what it governs and what it cannot override.

| # | Authority | Where it lives (real) | Governs | Cannot override |
|---|---|---|---|---|
| 1 | **On-chain / live contract truth + current code canon** | `artifacts/api-server/src/canon/the-syndicate/*` (chain, contracts, archive, proof registries + ABIs), pinned from upstream `duniterum/TheSyndicate@cf4ca34` | Chain id (43114), contract addresses, ABIs, archive IDs, token facts, routing math | Cannot be overridden by any doc or copy; but this slice does **not** repair or wire it |
| 2 | **Current API / source-status invariants** | `artifacts/api-server/src/data/sourceStatus.ts` + `routes/sourceStatus.ts` + the four guards | The public posture contract: POSTURE_ONLY, 20 categories all-null, no 0x, no forbidden framing | Cannot invent data; cannot be relaxed by docs or copy |
| 3 | **`replit.md` core doctrine** | repo root | Product posture (read-only foundation), forbidden-copy list, visual direction, phase discipline, homepage governance | Cannot override code/chain truth (#1) or the live posture (#2) |
| 4 | **Constitutional docs** (VISION, NORTH_STAR_SYSTEM, INFORMATION_HIERARCHY, CONSTITUTION_SUMMARY, PRODUCT_DECISION_FRAMEWORK, MVP_ECOSYSTEM_ROADMAP) | **NOT PRESENT in this repo slice** | *(Would govern north-star intent / hierarchy)* | N/A — must be recovered externally; cannot be cited as in-repo truth |
| 5 | **Canon docs** (`docs/canon/00–09`) | **NOT PRESENT in this repo slice** | *(Would govern authority map, glossary, source-of-truth table, freeze)* | N/A — the *code* canon (#1) currently carries this role |
| 6 | **Story / language / brand docs** (TERMINOLOGY_GLOSSARY, BRAND_GUIDELINES, STORY_ENGINE family, cohesion/harmonization audits) | **NOT PRESENT in this repo slice** | *(Would govern voice + terminology)* | N/A — partial language currently lives in `studio/src/config/brand.ts` + `syndicateFacts.ts` |
| 7 | **Source / introduction docs** (referral/source attribution research, ceremony runbooks, verified-introduction packets) | **NOT PRESENT in this repo slice** | *(Would govern source-attribution launch)* | N/A — current safe doctrine lives in `sourceStatus.ts` + the 6 phase1 docs |
| 8 | **Product-memory docs** (PRODUCT_MEMORY_AND_FUTURE_LOOPS, organism graph, execution control, handoffs) | **NOT PRESENT in this repo slice** | *(Would govern not-yet-shipped memory)* | N/A — see §10 for what survives in the 6 phase1 docs |
| 9 | **In-repo Phase 1 reports (the only doctrine docs that DO exist)** | `docs/phase1-slice-2.10…2.16` + `docs/phase1-ledger-2.10-to-2.16.md` | Reconciliation history, posture rationale, deferral ledger | Cannot override #1/#2; are *audits*, not constitution |
| 10 | **Dormant / labs / studio reference** (Supa-Exchange, entity-chain/x402, Boost Protocol) | Referenced only inside guards + the 6 phase1 docs | Pattern reference for future shape | **Reference only — never live truth, never a Syndicate source/canon** |

**Studio config** (`studio/src/config/*`: `brand.ts`, `syndicateFacts.ts`, `truthStatus.ts`, `modules.ts`, `navigation.ts`, `featureFlags.ts`) sits *below* code canon and the live posture: it is the **temporary, replaceable config spine** for the front-end, not a competing canon.

---

## 4. The Full TheSyndicate OS

Synthesized from code canon + the 6 phase1 docs + studio config. Each engine is mapped to the real `/api/source-status` categories and studio modules. Status legend: **NOW** (live read-only foundation surface) · **NEXT** (internal verification / reconciliation, no public change) · **LATER** (future phase wiring) · **PENDING** (founder decision / gated) · **DO-NOT-BUILD-YET** (reference-only).

### Story Engine — **PENDING**
- **Answers:** *Why this protocol matters; the emotional arc of taking a seat and being witnessed.*
- **Live data sources:** none (narrative, not data).
- **Current surfaces:** partial — hero copy on `/` (`syndicateFacts.ts` / `brand.ts`).
- **Missing surface:** the full narrative/episodic layer (chronicle voice, chapter belonging).
- **Forbidden drift:** hype, casino, financial-upside framing; treating story as a yield pitch.
- **Later slice:** language locked in 2.19–2.20; pipeline in 2.21.

### Identity Engine — **LATER** (public) / **PENDING** (founder-gated)
- **Answers:** *Who holds a seat; member number / seat identity.*
- **Live data sources:** Membership Sale V3 (`0x2A6cFc…`, active) + SYN token; member list **deliberately not vendored** (PII).
- **Current surfaces:** `/member` (placeholder, `AWAITING_FOUNDER_APPROVAL`).
- **Missing surface:** "My Syndicate" cockpit, seat identity ribbon, receipts.
- **Forbidden drift:** exposing member PII / full wallets; "holder = investor."
- **Later slice:** 2.22 (Member OS reconciliation, plan-first).

### Wallet Engine — **LATER**
- **Answers:** *Where protocol-controlled assets sit and how value routes.*
- **Live data sources:** Vault / Liquidity / Operations / Founder / Membership-Distribution wallets (pinned server-side in canon).
- **Current surfaces:** none public.
- **Missing surface:** any wallet-scoped public surface (intentionally absent).
- **Forbidden drift:** emitting raw `0x` addresses publicly; framing wallets as payout pools.
- **Later slice:** 2.26 (Registry↔Chain technical reconciliation) and beyond.

### Collector Engine (Archive / 1155) — **NOW** (posture) / **LATER** (media)
- **Answers:** *What artifacts memorialize protocol moments.*
- **Live data sources:** SyndicateArchive1155 (`0xB2AE1e…`); archive IDs 1–9 with posture (1 & 3 LIVE_PUBLIC_MINT, 2 RESERVED, 4–8 OWNER_ONLY, 9 NOT_CONFIGURED).
- **Current surfaces:** registry/posture only (no public mint surface); `uri()` raw value **never emitted** — only a `uriStatus` enum.
- **Missing surface:** artifact media pipeline (URI unreadable on-chain today → gated).
- **Forbidden drift:** "buy NFT for upside"; exposing price/minted in public payload.
- **Later slice:** 2.21 (Archive pipeline reconciliation).

### Investor / Transparency Engine — **NOW** (preview) / **LATER** (wired)
- **Answers:** *What is verifiably real on-chain vs awaiting source.*
- **Live data sources:** proof/economy/treasury/routing categories (all `null` today); 70/20/10 routing math is the **only non-simulated number**.
- **Current surfaces:** `/proof` (DESIGN_PREVIEW), `/status` (authoritative wiring ledger), `/` real-vs-pending summary.
- **Missing surface:** actual indexed proof/economy data.
- **Forbidden drift:** ROI / yield / profit / dividend / passive-income framing of any real number.
- **Later slice:** economy language locked in 2.20; data later phases.

### Community Engine — **LATER**
- **Answers:** *Who belongs and how the collective is recognized.*
- **Live data sources:** recognition / chronicle categories (null).
- **Current surfaces:** `/recognition` (placeholder, FUTURE_MODULE).
- **Missing surface:** co-witnessing, chapter belonging.
- **Forbidden drift:** leaderboard-as-competition / "win" framing.
- **Later slice:** 2.21–2.22.

### Source / Introduction / Growth Engine — **PENDING** (gated; see §9)
- **Answers:** *Who introduced whom, recorded as a source attribution — never a payout.*
- **Live data sources:** SourceRegistryV1 (`0x780013…`, **deployed, NOT wired**); public V3 buys default **ZERO_SOURCE_ID**.
- **Current surfaces:** `/source` (placeholder, `SOURCE_INDEXER_NOT_WIRED`); internal test source `INTERNAL_PROTOCOL_TEST_SOURCE_001` **PAUSED — observability only**.
- **Missing surface:** any public source-aware buy path, claim UI, or source dashboard (**must not exist** without a separate founder ceremony).
- **Forbidden drift:** MLM / downline / commission / earn / referral-reward framing.
- **Later slice:** 2.23 (boundary review; no activation without ceremony).

### Progression Engine — **LATER**
- **Answers:** *Standing / rank / how membership deepens over time.*
- **Live data sources:** recognition category (null); ranks not wired.
- **Current surfaces:** none (no ranks route).
- **Missing surface:** ranks/tiers display.
- **Forbidden drift:** "tier = financial multiplier"; gambling-style progression.
- **Later slice:** post-2.22.

### Reputation Engine — **PENDING (founder decision)**
- **Answers:** *How recognition/standing is computed.*
- **Live data sources:** none; **recognition formula = founder decision** (explicitly deferred).
- **Current surfaces:** none.
- **Forbidden drift:** publishing a reputation formula before founder ratifies it.
- **Later slice:** undetermined; after language lock.

### Governance Engine — **DO-NOT-BUILD-YET**
- **Answers:** *How protocol decisions are made on-chain.*
- **Live data sources:** reserved namespaces only (`governance`, `burn-governance` in `protocol-event-registry.ts`).
- **Current surfaces:** none.
- **Forbidden drift:** implying live governance / voting rights.
- **Later slice:** far horizon; not in the current ledger.

---

## 5. Language Constitution

> **Status:** provisional unified doctrine recovered from `brand.ts`, `syndicateFacts.ts`, `replit.md`, the guards, and the 6 phase1 docs. **Non-binding until ratified (Slice 2.19–2.20).**

### Universal voice
Institutional, calm, deterministic, proof-first. "Radical honesty is the product." Premium and understated — deep-navy/cyan institutional, **never** casino / DeFi-degen / meme. Every non-real value is truth-labelled. We describe **what is verifiable**, and we visibly label what is **awaiting source**.

### Approved verbs
verify, prove, record, route, witness, recognize, archive, attest, observe, preserve, disclose, audit, hold (a seat), take (a seat), introduce (a source).

### Banned verbs
earn, claim (rewards), farm, mine, yield, win, payout, cash out, stake-for-return, profit, multiply (money), guarantee (gain).

### Approved nouns
seat, member, membership, proof, record, receipt, routing record, source attribution, verified introduction, archive, artifact, chronicle, register, recognition, posture, protocol, vault/liquidity/operations wallet (as protocol-controlled assets), SYN (membership token / the seat).

### Banned nouns
profit, yield, return (financial), ROI, dividend, payout, passive income, reward pool, jackpot, downline, commission, airdrop (as farming), bet/wager, liquidity-mining reward.

### Contextual terms (allowed with care)
- **"referral"** — only as a *legacy/public simplified* synonym for *source attribution* if already in use; never with MLM/earn/downline framing. Prefer **"verified introduction" / "source attribution."**
- **"transparency" / "on-chain business data"** — allowed; cumulative USDC routed, gross sale volume, and routing are legal public facts (see §8).
- **"recognition"** — allowed for standing/memory; never "rewards."

### Public vs internal vs deep-lore registers
- **Public copy:** plainest, most defensible wording; truth-labelled; no formulas, no unratified claims.
- **Internal/operator (Studio OS):** denser, posture-aware, may name categories/registries; still no PII, no raw addresses in UI.
- **Deep-lore (Story Engine):** narrative/emotional; lives on module routes (chronicle/recognition), **never** as a financial pitch.

### Telegram / social / share-card style
Short, factual, proof-anchored ("a verifiable seat, recorded on-chain"). Shareable public proof cards state *what is real*. No hype, no price talk, no "get in early."

### Institutional vs hype style
Institutional: "An experimental membership protocol with on-chain, auditable records." Hype (**forbidden**): "Buy SYN for upside / guaranteed access / passive rewards."

### How to speak about money legally but strongly
State **public on-chain business facts** plainly and proudly — cumulative USDC routed, gross membership sale volume, 70/20/10 routing — as evidence of a real, transparent operation. **Never** convert those facts into a *promise to the buyer*: no profit rights, yield, ROI, dividends, claims, equity, or passive income. (Full rules in §8.)

### Mandated key distinctions (founder-locked semantics)
- **Activity = heartbeat / raw ledger** (real-time event stream; privacy-sensitive).
- **Chronicle = canon / curated history** (`PUBLIC_MEMORY_SAFE`).
- **Register = institutional truth / durable record** (the institutional membership record).
- **Archive = carried memory / artifact layer** (1155 artifacts).
- **SYN = the seat** (membership token), not an investment instrument.
- **Purchases create receipts and routing records, not ownership claims.**

---

## 6. Terminology Collision Map

For each: conflicting meanings → highest-authority current ruling → recommended public wording → recommended internal wording → later adjustment slice.

| Term | Conflicting meanings | Highest-authority ruling | Recommended public | Recommended internal | Slice |
|---|---|---|---|---|---|
| **Activity vs Chronicle** | Both used for "history" | Code/posture: Activity = raw event ledger (privacy landmine); Chronicle = curated `PUBLIC_MEMORY_SAFE` canon | "Chronicle" for curated story; avoid raw "Activity" publicly until anonymized | Activity = indexer feed (internal); Chronicle = published canon | 2.21 |
| **Archive vs NFT vs Artifact** | "NFT" implies trade-for-upside | Canon: Archive1155 = artifact memory, posture-only | "Archive" / "artifact" (carried memory) | Archive1155 / artifact ID | 2.21 |
| **Referral vs Source vs Verified Introduction** | "Referral" implies MLM/commission | Code: source attribution, ZERO_SOURCE_ID default, no payouts | "Verified introduction" / "source attribution" (referral only if legacy) | source attribution / SourceRegistryV1 | 2.23 |
| **Reward vs recognition vs acquisition cost** | "Reward" implies yield | replit.md forbidden-copy + guards | "recognition" (standing); "acquisition cost" (what a seat costs) | recognition record; acquisition cost | 2.20 |
| **Member vs Holder** | "Holder" implies investor | Doctrine: member = seat-holder, not investor | "Member" (holds a seat) | member / seat record | 2.22 |
| **Vault vs Treasury vs PCA** | Three names for protocol assets | Canon: distinct wallets (Vault/Liquidity/Operations) | "protocol-controlled assets" (aggregate); name specific wallet only with on-chain fact | Vault Wallet / Liquidity Wallet / Operations Wallet | 2.20 |
| **Contribution vs purchase/routing/receipt** | "Contribution" can imply donation/return | Mandated: purchases = receipts + routing records | "purchase → receipt + routing record" | sale event → receipt; 70/20/10 routing | 2.20 |
| **Rank vs tier vs leaderboard** | "Leaderboard" implies competition/win | Progression not wired; founder decision | avoid until ratified; "standing" if needed | rank/tier (internal, unwired) | post-2.22 |
| **Seat vs SeatRecord721** | Concept vs (future) token | Reserved namespace `seat-record-721` (no contract) | "seat" (the membership) | SeatRecord721 (future, reserved) | 2.22 |
| **SYN as token vs SYN as seat** | ERC-20 vs membership | Canon: SYN is the membership token = the seat | "SYN = your seat" (membership), experimental utility token | SYN ERC-20 (`0xC1Cf19…`), fixed 1B supply | 2.20 |
| **Protocol revenue vs USDC routed vs capital raised** | Conflated money terms | §8 rules + guards | "cumulative USDC routed" / "gross membership sale volume" (facts) — never "revenue to you" | net routed / gross volume / acquisition cost | 2.20 |
| **Supa / tool / exchange / marketplace** | External product vocabulary | Canon: **Supa = reference memory, never a Syndicate source/canon**; marketplace = reserved namespace, no contract | do not use "Supa/exchange/marketplace" publicly | reference-only; provisional translation in §11 | 2.24 |

---

## 7. Surface-by-Surface Language Map

**Routes that exist today** (studio slug `studio`, served at `/`):

| Surface (route) | Should say | Must never say | Owning engine | State | Inspect/fix later |
|---|---|---|---|---|---|
| **Home `/`** | "Verifiable truth for the next era of membership"; read-only foundation; real-vs-pending summary | profit/yield/ROI/guaranteed access | Transparency + Story | live (NOT_LIVE labels) | Bind hero badge/coreStatus to `surfaceStatus` (deferred per replit.md) |
| **Studio OS `/studio`** | operator console overview; posture-aware | fake live data | (cross-engine) | live | 2.18 map |
| **Proof `/proof`** | "Public Proof Dashboard — verifiable truth surface" | "returns"/"earnings" | Transparency | DESIGN_PREVIEW | wire after indexer |
| **Proof Studio `/proof-studio`** | internal proof tooling preview | public claims | Transparency | draft (DESIGN_PREVIEW) | 2.18 |
| **Member `/member`** | "Request a Seat — founder-gated, not live yet" | "buy in"/"investor" | Identity | AWAITING_FOUNDER_APPROVAL | 2.22 |
| **Founder `/founder`** | operator/founder console (placeholder) | — | Governance/Operator | placeholder | later |
| **Source `/source`** | source attribution posture; PAUSED | "earn"/"commission"/"downline" | Source | SOURCE_INDEXER_NOT_WIRED | 2.23 |
| **Recognition `/recognition`** | recognition/standing (placeholder) | "rewards" | Community/Reputation | FUTURE_MODULE | later |
| **Learning `/learning`** | protocol learning (placeholder) | financial advice | Story | FUTURE_MODULE | later |
| **Status `/status`** | authoritative wiring/posture ledger | — | Transparency | live (dynamic from `/api/source-status`) | keep as source of truth |

**Surfaces named in the brief that are NOT PRESENT** (future, not yet routes): **Join, Activity, Chronicle, Institutional Register, Archive/NFT (public), Registry (public), Transparency (as standalone), Vault, Liquidity, Token, Tokenomics, Ranks, Members, Wallet page, My Syndicate, Referral/Source (public), Docs, FAQ, Whitepaper, Risk, Roadmap, Knowledge Map, Labs.** Each must be designed against §5 before it becomes a route. None may ship copy that converts on-chain facts into buyer financial promises.

---

## 8. Economy / Accounting Language

How to speak about each (all values are **null/posture-only** in `/api/source-status` today; the numbers below are *allowed framings for when real data is wired*, not current claims):

- **Cumulative USDC routed** — allowed public fact ("X USDC routed through the protocol, on-chain, auditable").
- **Gross membership sale volume** — allowed public fact.
- **Acquisition cost** — what a seat costs the buyer; neutral, allowed.
- **Protocol contribution / net routed** — allowed as an operations fact, not a buyer entitlement.
- **70/20/10 routing** — the **only non-simulated number**; describe as deterministic routing math (allocation across Vault/Liquidity/Operations), never as a "return split."
- **Vault Wallet / Liquidity Wallet / Operations Wallet** — name as **protocol-controlled assets**; aggregate-only; **never emit raw `0x` addresses** in public surfaces.
- **Future revenue sources / future products/services** — describe as roadmap posture only; no projected numbers, no APY/sim figures.
- **Marketplace / commerce** — reserved namespace, **no contract deployed**; do not describe as live.

**Explicitly preserved (allowed):**
- Legal promotion of the protocol is allowed.
- Public on-chain business data is allowed.
- Cumulative USDC / sales / routing / "protocol revenue" as an **operations fact** is allowed.

**Forbidden (always):** framing any of those numbers as **profit rights, yield, ROI, dividends, claims, equity, or passive income** to the holder. SYN is never framed as investment upside.

---

## 9. Verified Introduction / Source Attribution Doctrine

Safe **current** doctrine (matches code + posture):

- **Public V3 buys remain `ZERO_SOURCE_ID`.** No source is attributed to a public purchase today.
- **`SourceRegistryV1` (`0x780013…`) is deployed/policy infrastructure — NOT wired** to the public payload.
- **One internal source test (`INTERNAL_PROTOCOL_TEST_SOURCE_001`) is PAUSED — observability only, no payouts.** This is current truth.
- **No public source-aware buy path** exists.

**Hard boundaries (must remain true):**
- No claim UI · no source dashboard · no public link · **no activation without a separate founder ceremony.**
- Preferred language: **verified introduction / source attribution / source record.**
- "Referral" only as a legacy/public simplified term *if already used* — **never MLM / earn / downline / commission framing.**

**Staging:**
- *Product direction allowed now:* documenting the doctrine; designing (on paper) what a safe, anonymized source-attribution record could look like.
- *Blocked now:* any wiring, any public source-aware path, any claim/dashboard.
- *Later slice:* **2.23** (boundary review of the introduction launch packet — recover externally first).
- *Cannot be implied in public copy:* that introductions earn money, that a downline exists, or that attribution is live.

---

## 10. Product Memory Recovery

Best not-yet-shipped values worth preserving (recovered from the 6 phase1 docs + config + canon; **not implemented**). Note: the rich source docs are **not present in this repo** — these are reconstructed from what survives in-repo and must be cross-checked against external memory.

| Memory | Original in-repo source | Why it matters | Why not now | Later slice |
|---|---|---|---|---|
| Episodic protocol ("what changed since your last visit") | phase1 docs (chronicle/recognition discussion) | Drives return + belonging | needs indexer + identity | 2.22 |
| Member number / seat identity | canon (membership/SYN); `/member` | Core identity ribbon | member list not vendored (PII) | 2.22 |
| Chapter belonging / co-witnessing | Story Engine doctrine (partial) | Emotional OS | narrative layer not built | 2.21 |
| Archive artifacts as memory | `archive-id-registry.ts` | Carried memory layer | media pipeline gated (URI unreadable) | 2.21 |
| Protocol pulse / heartbeat | Activity doctrine | Live proof-of-life | Activity = PII landmine | 2.21 |
| Far horizon (governance, B2B intelligence) | reserved namespaces | Long-term north star | reserved, no contract | far horizon |
| Shareability / public proof cards | brand/proof surfaces | Growth without hype | proof data not wired | 2.20–2.21 |
| Supa / tools / commerce | reference memory only (see §11) | Possible future utility shape | **not present in repo** | 2.24 |
| Marketplace / services / future packages | `marketplace` reserved namespace | Future artifact marketplace | no contract deployed | 2.24 |

---

## 11. Supa / Tools / Marketplace Translation Layer

**Repo search result (verbatim finding):** **Supa / Supa-Exchange product/tool source material is NOT present in this repo slice.** The only in-repo references to "supa" are **ban-list entries** inside the guards and `sourceStatus.ts` enforcing that *"Supa-Exchange is reference memory, never a Syndicate source/canon,"* plus mentions in the 6 phase1 docs treating Supa/entity-chain(x402)/Boost as **pattern reference, do-not-build**. `marketplace` exists only as a **reserved event namespace with no contract deployed**. `commerce`, `SwapRail`, `ProductSaleRouter` have **no source matches**.

> **Supa/tool source material must be recovered from the external repo/material before any implementation.** Do not invent its product surface.

**Provisional translation framework** (non-binding scaffolding for Slice 2.24):

| Generic exchange/tool concept | Syndicate-compatible wording | Legal/brand boundary |
|---|---|---|
| "exchange / swap" | (avoid) — at most "protocol utility," reserved | no trading-for-upside framing |
| "marketplace" | "artifact archive" (if ever) — reserved namespace | no "invest in artifacts" |
| "tool / product / package / service" | "protocol utility" / "membership utility" | no yield/seasons/quests/casino framing |
| "boost" | (avoid) — "recognition" if standing-related | no payout/incentive modules |
| "entity-chain / x402" | reference pattern only | reject APY/sim numbers |

**Later recovery step:** Slice 2.24 — recover external Supa/tool/product/service language, then decide adopt / adapt / transform under §5 and §8 rules.

---

## 12. Forgotten / Not Done / Deferred Ledger *(mandatory)*

| Item | Why it matters | Why not now | Risk if forgotten | Proposed slice | Blocking prerequisites |
|---|---|---|---|---|---|
| Route-by-route + action-by-action migration map | Turns this report into executable plan | Needs this report ratified | drift / re-invention | **2.18** | §1–§11 accepted |
| Copy migration guardrails + lint/scan plan | Prevents mass-edit regressions | Need exact replacements first | forbidden copy slips in | **2.19** | 2.18 |
| Controlled public copy harmonization | Align live copy to constitution | Need guardrails first | inconsistent voice | **2.20** | 2.19 |
| Activity/Chronicle/Register/Archive pipeline reconciliation | Four history layers must not collide | Language must lock first | history-layer confusion + PII | **2.21** | 2.20 |
| My Syndicate / Member OS reconciliation | Identity ribbon, receipts, "what changed" | Plan-first; identity/PII sensitive | PII exposure | **2.22** | 2.20–2.21 |
| Verified Introduction / Source boundary review | Source attribution legal exposure | No activation w/o ceremony | MLM/earn drift | **2.23** | external source docs recovered |
| Supa / Tools / Marketplace external memory recovery | External product memory missing | Material not in repo | lost product memory | **2.24** | external Supa material |
| Optional repo config cleanup (dangling `@assets` alias) | Hygiene only | Unused; out of current scope | minor confusion | **2.25** | confirm still unused |
| Registry↔Chain technical reconciliation | Real wiring of read-model | Only after doctrine locked | wiring against wrong doctrine | **2.26** | 2.18–2.24 |
| Recover the missing constitutional/canon/story/economy/source/chronicle/NFT doc corpus (§3 rows 4–8) | Entire remembered doctrine is **out of repo** | This slice only records the gap | **catastrophic memory loss** | **2.18 prework / 2.24** | external repo + founder memory |
| Recognition formula | Reputation engine core | founder decision | premature formula | TBD | founder ruling |
| Event indexer + anonymization | Activity/proof data source | highest effort + PII landmine | privacy incident | Phase 4–5 | privacy policy |
| Auth / DB schema | Member OS persistence | founder decision | premature backend | Phase 3 | founder ruling |
| A5 drift correction (see §13) | Wrong "next step" in old docs | recorded, not acted | building highest-PII first | 2.26 | doctrine lock |
| SPA 404-shape cosmetic (unknown client paths return 200) | API-shape consistency | cosmetic | minor | 2.25/2.26 | — |

---

## 13. Conflicts / Open Founder Decisions

Decisions the founder must make later (options + safe default; **not decided here**):

1. **The missing doctrine corpus.** Options: (a) recover from `duniterum/TheSyndicate` + founder memory into `docs/` as ratified canon; (b) declare the in-code canon + this report the new canon and retire the old docs; (c) hybrid. **Recommended default:** (c) — treat code canon as truth, recover the *language/story/source* docs externally in 2.18 prework / 2.24. **Most important open decision.**
2. **"Referral" vs "Verified introduction" public term.** Options: keep "referral" as legacy public synonym vs replace entirely. **Default:** replace with "verified introduction / source attribution"; allow "referral" only where already shipped.
3. **A5 sequencing drift.** Old 2.10/2.12 recommended "MemberIndex + Activity first"; later flagged WRONG (highest-PII/effort). Current authoritative next technical step is **Registry↔Chain reconciliation**. **Default:** honor the corrected order (registry/chain before member/activity). Founder to confirm.
4. **Recognition/reputation formula.** Options: publish a formula vs keep recognition qualitative. **Default:** qualitative until founder ratifies a formula.
5. **Source activation ceremony.** When (if ever) to wire SourceRegistryV1 to a public path. **Default:** remain PAUSED / ZERO_SOURCE_ID; no activation without a dedicated ceremony slice.
6. **Supa/tools/marketplace adoption.** Adopt / adapt / transform / drop. **Default:** keep reference-only until external material is recovered (2.24).
7. **Archive media pipeline.** When to surface artifact media (URI unreadable on-chain today). **Default:** posture-only until a media-pipeline gate is approved.
8. **Dangling `@assets` Vite alias.** Remove vs keep. **Default:** remove in 2.25 only if still unused (it currently is).

---

## 14. Final Recommended Next Step

- **Proceed to 2.18?** **Yes — but as a documentation/mapping slice, not implementation.**
- **Exact recommended scope for 2.18 ("Master Product Map + Page/Action/Language Reconciliation"):**
  1. Take this report as input and produce a **route-by-route, action-by-action map** binding each existing surface (§7) to its engine (§4), its mandated language (§5), and its truth/posture status.
  2. Include a **prework note** that the constitutional/canon/story/economy/source/chronicle/NFT doc corpus is **out of repo** and must be recovered (carry §3 rows 4–8 + §12 row "recover doc corpus" forward).
  3. Output **docs only** (a new audit/plan file); **no** product/route/UI/API/contract/config/source-status changes.
- **What must NOT be touched yet:** routes, UI copy, `/api/source-status`, contracts/canon, source registries/SourceRegistryV1, guards, `vite.config.ts`, package files, `.agents/`, `attached_assets/`. No source/referral/claim/public source-aware path. No live data wiring. No recognition formula. No Member OS / identity implementation.

---

## Verification (run for this slice)

- `git status --short` → only `docs/audits/SLICE_2_17_FULL_OS_LANGUAGE_CONSTITUTION_RECOVERY.md` added (plus this slice created the `docs/audits/` directory to hold it). No other tracked changes.
- `git diff --stat` → single new report file.
- No product-altering commands run. No source/API/UI/contracts changes. `.agents/` and `attached_assets/` not recreated as tracked content (`attached_assets/` remains gitignored scratch for the pasted brief).
