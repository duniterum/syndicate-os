# CAPABILITY HARVEST AND REUSE MAP

**Slice:** Source Availability Audit + Capability Harvest / Reuse Map (inspection-only)
**Correction pass:** Capability Doctrine Correction (2026-07-02) — business mechanics are preserved; only unsafe framing/patterns are rejected. See "Business Mechanics vs Unsafe Financial Framing".
**Date:** 2026-07-02
**Baseline:** private GitHub checkpoint `protocol-organism-spine-founder-visibility-v1` = `duniterum/syndicate-os@e3404ab851502de2e0962642117ff707976fe51d` (tag object `a45ce5fc45…`); workspace HEAD `40580c30`.
**Checkpoint status of this doc:** `docs/` is deliberately EXCLUDED from the curated private-GitHub publish set. This document is **workspace-only** until the founder approves a future checkpoint that includes it.
**Hard boundaries honored:** no publish, no deploy, no new feature, no new route/API/UI, no code integration, no push. This slice created/updated documentation only.

---

## 1. Source Availability Manifest (proof of what was and was not inspectable)

Classification legend: (1) PRESENT+SEARCHED, nothing relevant · (2) PRESENT+SEARCHED, assets found · (3) MISSING/NOT MOUNTED — cannot conclude · (4) SOURCE NAME UNKNOWN — founder input needed · (5) EXISTS ELSEWHERE — founder must provide.

| Source / path / repo | Exists? | Searched how | Relevant assets found | Class |
|---|---|---|---|---|
| Workspace root `/home/runner/workspace` | yes | `ls -a` full listing | monorepo + docs + attachments + exports | 2 |
| `artifacts/studio` | yes | dir listing, component/route knowledge from prior audits | full public+operator app, TruthLabel system, seo-route-registry, operator gate, os-map, hero system | 2 |
| `artifacts/api-server` | yes | dir listing + route grep (3 GET, 0 write) | reality spine, guards, canon (vendored `src/canon/the-syndicate`), read-only chain scripts | 2 |
| `artifacts/mockup-sandbox` | yes | dir listing (`src/components/mockups`) | `syndicate-hero` prototype only | 2 |
| `lib/` (5 pkgs incl `os-contracts`) | yes | dir listing | api-client-react, api-spec, api-zod, db, os-contracts (type-only OS vocab) | 2 |
| `scripts/src` | yes | dir listing | `hello.ts` only — no legacy tooling | 1 |
| `docs/` (architecture, audits, strategy, handoff, phase1 ledgers) | yes | full tree listing + content distillation of 7 harvest/prior-art docs | 2.20E Duniterum atlas, 2.20F TheSyndicate principal audit, 2.21A organism strategy, 2.19D prior-art reconciliation, 2.18I/B/C GitHub harvest series | 2 |
| `the-syndicate-master-operating-map.md` (root) | yes | file present, 253 lines | master operating map | 2 |
| `attached_assets/` (206 files) | yes | name scan + type classification | founder directives (Pasted-*), 10 hero/header code zips (already integrated into hero work), images; 1 paste naming the freeze trio (instructions, NOT data) | 2 |
| `exports/` | yes | dir listing | self-generated hero bundles/specs (outbound, not prior art) | 1 |
| `screenshots/` | yes | dir listing | audit captures only | 1 |
| Old/legacy/backup/archive/admin/widget folders in workspace | **no** | keyword dir scan over root/artifacts/lib/scripts/docs (25 keywords: admin, dashboard, widgets, auth, roles, referral, gamification, legacy, prototype, backup, old, import, …) | only match = `mockup-sandbox` | 1 — **Not found in current workspace; cannot rule out existence elsewhere** |
| Workspace git remotes | yes | `git remote -v` | only Replit-internal `gitsafe` backup; GitHub is reached via connector, not a mounted remote | 2 |
| GitHub `duniterum/syndicate-os` (private) | yes | REST (auth as `duniterum`), branch/tag/content probes | the just-pushed checkpoint | 2 |
| GitHub `duniterum/TheSyndicate` (public) | yes | REST list; deep-audited in 2.20F | direct product ancestor — richest safe pattern source | 2 |
| GitHub `duniterum/Supa-Exchange` | yes | REST list; deep-audited in 2.20E | operator/member machinery + canon-guard ancestor | 2 |
| GitHub `duniterum/entity-chain` | yes | REST list; audited in 2.20E | architecture concepts under unsafe framing | 2 |
| GitHub `duniterum/navi-portfolio-agent` | yes | REST list; audited in 2.20E | read-model provider abstraction only | 2 |
| GitHub `duniterum/auditclaw-site` | yes | REST list; audited in 2.20E | proof-honesty language patterns | 2 |
| GitHub `duniterum/cesium` | yes (visible) | REST list | EXCLUDED — upstream Duniter/Cesium fork (2016), not Duniterum prior art | 1 |
| Freeze trio (`v3-historical-members.freeze-88496414.json`, root output, generator) + `v3-historical-members` module | **no** (as files) | filename search across artifacts/lib/scripts/docs/attachments/exports | ABSENT by design (PII). **Data itself already founder-gated-imported** into server-only DB (`historical_member` ×8, `historical_member_freeze` ×1); `freezeGate.ts` VERIFIED | 5 (files) / already-imported (data) |
| 4 identity doctrine docs (IDENTITY_ATTRIBUTION_CONSTITUTION, HOLDER_INDEX_ARCHITECTURE, NFT_ARCHIVE_METADATA_PHILOSOPHY, DOCUMENTATION_AUTHORITY_MAP) | **no** | filename search, all mounts | ABSENT — Not found in current workspace; cannot rule out existence elsewhere | 5 |
| Other old repos beyond the 7 visible to `duniterum` | unknown | REST `/user/repos` returns exactly 7 | none visible | 4 — founder must name any repos under other accounts/orgs |

**No source was silently treated as empty.** Every "nothing found" row above names the search method and scope.

## 2. Capability Reuse Map (consolidated from 2.20E/2.20F/2.21A/2.19D/2.18I + this slice's verification)

Status legend: WORKING / PARTIAL / CONCEPT / OLD-CANON / UNSAFE / INTEGRATED. Decision legend: REUSE AS-IS / ADAPT / REBUILD-IDEA-ONLY / DEFER / REJECT / NEED SOURCE.

### Already INTEGRATED into syndicate-os (safe, live)
| Capability | Origin lineage | Notes |
|---|---|---|
| Canon registry spine + `verify:canon` integrity guards | TheSyndicate / Supa-Exchange ancestor | load-bearing inheritance; fail-closed |
| Truth/posture infra (7-state SourcePosture, TruthLabel, posture badges) | in-house continuation of honesty doctrine | the product itself |
| SEO route registry (single route truth) | 2.18 series | never fork a parallel registry |
| Public + Studio dual-shell (React/Vite/wouter) | in-house | visitor vs operator surfaces |
| Read-only Avalanche verification scripts + Protocol Reality Spine | 2.18I harvest → rebuilt | 3 GET endpoints, 0 writes |
| Source-status API (contract-first OpenAPI) | 2.20C/D | posture-only |
| Operator preview hard gate + os-map live proof binding | this phase | build-level only — no runtime auth yet |
| Part A raw sale-event index + Part B freeze (server-only) + Protocol Time | this phase | PII never served |

### Reusable next (prior art WORKING, adaptation required)
| Capability | Source | Status | Decision | Prerequisites | Key risks | Future slice |
|---|---|---|---|---|---|---|
| Admin broadcast center | Supa-Exchange `client/admin/AdminBroadcast.tsx` | WORKING | ADAPT | runtime auth + roles, operator gate | PII in templates | operator/admin lane, after auth |
| Admin audit log | Supa-Exchange `client/admin/AdminAudit.tsx` | WORKING | ADAPT | runtime auth | low | operator/admin lane, after auth |
| Support/ticket intake | Supa-Exchange `pages/Feedback.tsx` | WORKING | ADAPT (spec exists: 2.20F path) | operator auth for review queue; public intake needs privacy guard | PII in ticket bodies | HARVEST-01 |
| Notification center | Supa-Exchange `pages/Notifications.tsx` | WORKING | ADAPT | member auth + read model | unauthenticated history leak | member-auth lane |
| Honesty banners (stale/pending) | TheSyndicate `StaleBuildBanner.tsx` | WORKING | ADAPT | posture enum (present) | UI noise | guard/utilities lane — early candidate |
| Protocol health no-PII endpoint | TheSyndicate `api/public/protocol-health.ts` | WORKING | ADAPT | status registry (present) | PII creep into payload | public dashboard lane |
| Protocol events feed (Activity) | TheSyndicate `ProtocolEventsFeed.tsx` | WORKING | ADAPT — **public surface forbidden this phase** | normalized event bridge + founder gate | fake-live; wallet leak | Activity/Chronicle lane |
| FAQ / glossary / literacy | TheSyndicate `faq.tsx`, Supa `Learn.tsx` | WORKING | ADAPT + REWRITE copy — education/orientation/progression mechanics are preserved | canon-pinned content | reject only "learn & earn" free-money bait framing | public dashboard lane |
| Data adapter seams (type-only) | TheSyndicate `lib/adapters.ts` | PROVEN | ADAPT | none (type-only, fits `lib/os-contracts`) | type/runtime drift | guard/utilities lane — early candidate |
| Feature flags / kill-switches | Supa-Exchange `systemFlagsService.ts` | WORKING | ADAPT | backend write path (currently forbidden) → DEFER until write doctrine changes | flag sprawl | operator/admin lane, late |
| Member cockpit ("My Syndicate") | TheSyndicate `my-syndicate.tsx` | WORKING | DEFER (spec only now) | wallet auth, read models, founder PII gates | memberNumber↔wallet leak | HARVEST-04, member-auth lane |
| Referral/source attribution | TheSyndicate `lib/referral-attribution.ts` | CONCEPT/PARTIAL | ADAPT UNDER SYNDICATE DOCTRINE — "verified introduction" / growth-contribution recognition; the attribution mechanic is a preserved business capability | source indexer (V2 referralAmount stays gated), founder framing approval | reject only affiliate/commission/payout framing | referral/source lane |
| Recognition / member standing ("Proof of Fire" ancestor) | TheSyndicate `ranks.tsx` | WORKING | REBUILD USING IDEA ONLY — member-status/protocol-standing logic under Syndicate vocabulary | participation data, auth | reject only speculative wealth-ranking + charity-"contributor" ambiguity | recognition lane |
| Archive museum (1155 artifacts) | TheSyndicate `archive.tsx` | WORKING | ADAPT | archive indexer; ID 2 stays RESERVED_DISABLED | "financial rights" framing | Activity/Chronicle lane |
| Chronicle (curated history) | TheSyndicate `lib/chronicle-*` | PARTIAL | DEFER — implementation forbidden this phase | admission rules spec | routine noise as "history" | Activity/Chronicle lane |
| Transparency (70/20/10 routing docs) | TheSyndicate `transparency.tsx` | WORKING | ADAPT copy-first — treasury-routing transparency is a core preserved business mechanic | treasury read model | profit/APR framing | public dashboard lane |
| Membership acquisition / seat-purchase → receipt → proof journey | TheSyndicate purchase flow + Supa-Exchange commerce surfaces (mechanics only) | WORKING (old impl) | REBUILD USING IDEA ONLY — the acquisition journey is core business; never copy payment/funnel code | founder go-live decision, doctrine/security review, verified sale wiring | copied funnel code REJECT; profit-promise copy REJECT | membership/commerce lane (new), far side of founder gates |
| Operator revenue/admin visibility + business analytics | Supa-Exchange admin surfaces; entity-chain dashboard concepts | WORKING/CONCEPT | ADAPT UNDER SYNDICATE DOCTRINE — analytics without profit promises; operator-only | runtime operator auth, read models | fake-live data; public exposure of operator metrics | operator/admin lane, after auth |
| Cohort & activity dashboards (member/ops) | Supa-Exchange + TheSyndicate feed surfaces | PARTIAL | ADAPT UNDER SYNDICATE DOCTRINE (operator-side first) | normalized event bridge, auth | wallet leak; fake-live | operator/admin → Activity lane |
| Member progression / status surfaces | Supa `xpService`/missions (mechanics), TheSyndicate standing | WORKING (old impl) | REBUILD USING IDEA ONLY — progression as Member Standing / Recognition Index, never points-as-money | member auth, participation read model | reward-pool/farming framing REJECT | recognition + member-auth lanes |
| SIWE + roles/permissions patterns | Supa-Exchange `server/security.ts` (160+ guards) | WORKING | REBUILD-IDEA-ONLY (never copy auth code) | founder auth-design decision | session drift; permission weakness | **operator-auth design slice (recommended next)** |
| AI support/triage worker seam | TheSyndicate `api.chat.ts`, entity-chain agents | CONCEPT | DEFER | HARVEST-01 + managed key | financial-advice output | operator/admin lane, late |
| DAO/governance shell | entity-chain `DAO.tsx` | CONCEPT | DEFER | auth + real voting | simulated voting power | far future |
| Block-explorer UI ideas | entity-chain `Explorer.tsx` | CONCEPT | REBUILD-IDEA-ONLY | verified indexer | simulated data REJECT | public dashboard lane |
| Multi-provider read-model abstraction | navi-portfolio-agent | PARTIAL | REBUILD-IDEA-ONLY | none | trading framing REJECT | guard/utilities lane |
| Evidence/verdict/provenance language | auditclaw-site | WORKING (language) | REUSE AS-IS (copy doctrine only) | none | none | copy/doctrine work anytime |

### Business Mechanics vs Unsafe Financial Framing (founder-corrected doctrine)

> The Syndicate preserves serious business, membership, commerce, recognition, and operational
> mechanics. The forbidden part is not business logic. The forbidden part is fake yield,
> passive-income promises, simulated wealth, casino framing, unsafe payment/auth patterns, and
> public claims not backed by protocol truth. Never classify a valuable business mechanic as
> "REJECT forever" merely because its old implementation or old language was unsafe.

**A. Hard-rejected forever (framing/patterns, regardless of source):**
- passive-income / APY / yield / profit-promise language; casino/free-money energy; trading-as-game
- speculative wealth ranking (leaderboards by holdings/capital footprint, e.g. `capitalFootprintUsdc` ranking)
- fake-live / simulated balances, simulated voting power, any invented data presented as real
- "learn & earn" as farming/free-money bait
- client-side wallet generation (navi `generateWallet`)
- copied payment-funnel or auth code without doctrine/security review (Supa commerce code, auditclaw ACP funnel code)
- any public claim not backed by protocol truth
- cesium (excluded entirely — upstream fork, not prior art)

**B. Valuable business mechanics preserved for rebuild/adaptation under Syndicate doctrine:**
- membership acquisition flow; seat purchase → receipt → proof journey
- treasury routing transparency (70/20/10)
- source/referral attribution as "verified introduction" (growth-contribution recognition, never commission)
- recognition / patronage / participation standing (member-status logic, never wealth ranking)
- member education / protocol literacy / orientation; member progression
- operator revenue/admin visibility; cohort & activity dashboards; business analytics without profit promises
- member status surfaces; professional recognition mechanics

**Recognition vocabulary (founder-locked):**
- Prefer: **Top Recognized Member · Recognized Members · Member Standing · Protocol Recognition · Syndicate Rank · Seat Recognition · Recognition Index**
- Avoid: "contributor" / "top recognized contributors" and any "contribution" phrasing that implies unpaid labor, charity, or open-source-style contribution. Recognition is member-status / protocol-standing logic, not charity-contribution logic.
- Existing app copy already anchors "growth contribution — NOT compensation" (`sourceAttributionTerminology.ts`); a future copy-review slice should sweep remaining ambiguous "contribution" phrasings in UI copy toward the member/standing vocabulary (not done in this documentation-only pass).

### NEED SOURCE
- 4 identity doctrine docs (class 5) — blocked for holder-index/identity-attribution design work.
- Freeze trio raw files (class 5) — NOT needed for current DB layer (already imported & verified); only needed if founder wants the raw artifacts vendored (privacy decision).
- Any repos outside the 7 visible to `duniterum` (class 4).

## 3. Integration lanes (future, all founder-gated)

| Lane | First safe reuse | Must wait | Prerequisites | Guards |
|---|---|---|---|---|
| **Guard/utilities** | data-adapter type seams into `lib/os-contracts`; honesty-banner pattern | — | none (type/UI only) | typecheck, forbidden-copy guard |
| **Operator/admin** | auth + roles/permissions **design spec** (from Supa patterns, idea-only) | broadcast, audit log, flags, AI worker | runtime operator auth (gate is build-level only) | fail-closed auth, audit trail, no PII |
| **Member-auth** | member cockpit **spec** | cockpit build, notifications | wallet-signature auth design + founder PII gates | never expose memberNumber↔wallet |
| **Referral/source** | "verified introduction" framing spec | any indexer wiring (V2 referralAmount gated) | founder framing approval + source indexer | forbidden-copy list, no payout language |
| **Recognition/gamification** | Member Standing / Recognition Index spec (Syndicate-safe vocabulary) | any build | participation read model | wealth-ranking ban; no charity-"contributor" framing |
| **Membership/commerce (new)** | acquisition-journey spec (idea-only; no code copy) | ALL purchase/wallet wiring (founder go-live gates) | doctrine/security review, verified sale wiring | forbidden-copy list; no funnel code copy |
| **Public dashboard** | protocol-health no-PII read model; FAQ/literacy copy | new public routes (forbidden now) | founder public-surface approval, fresh leak scan | TruthLabel on every value |
| **Activity/Chronicle** | normalization bridge design (raw→registry taxonomy) | ALL public activity surfaces (forbidden) | founder gate; block-timestamp enrichment | no wallet leak, no fake-live |
| **Design/components** | mockup-sandbox variant exploration continues | — | none | canvas-only until approved |

## 4. Private GitHub docs checkpoint policy (recommended, NOT executed)

Architecture/strategy/audit docs should become **private GitHub truth**. Evidence and plan:

- **Leak posture verified (2026-07-02):** `docs/` contains **zero** 40-hex addresses, **zero** 64-hex hashes, **zero** email-like strings. Files that mention `historical_member`/`memberNumber` discuss schema/design only — no wallet values, no member↔wallet pairings, no proofs.
- **Include (after founder approval):** `docs/architecture/`, `docs/strategy/`, `docs/audits/`, `docs/handoff/`, `docs/phase1-*.md`, plus root `the-syndicate-master-operating-map.md`. Commit to **`main`** as a docs-only commit — no separate docs branch (one branch = one truth; the repo is private).
- **Remain excluded:** `attached_assets/` (founder directives + raw uploads), `exports/` (generated bundles), `screenshots/`, `artifacts/mockup-sandbox` (design scratch), `.agents/`, `.local/`, and any raw freeze/privacy-sensitive files (none exist in the workspace).
- **Pre-checkpoint gate (same discipline as code pushes):** fresh clone, overlay, `git status` review confirming only `docs/**` + the root map file staged; Tier A scan over staged docs (hex/JWT/key/email/PII patterns + freeze/identity filename screen); repo-private re-verification; founder sees the staged file list before push.

## 5. Recommended next step
**A. Founder approves private docs checkpoint** — the corrected doctrine and the reuse map are now the operating brain of the next phases; making them durable in the private repo (a 5-minute, leak-scanned, docs-only commit) should precede new design work. **B (operator auth / roles-permissions design) remains the recommended slice immediately after.**
