# REFERRER KIT — THE SYSTEM-FIRST INVENTORY (2026-07-20)

**Provenance.** Founder order 2026-07-20 (post-5.1-seal, emphatic): pull the Referrer Kit
forward — "give ALL to the referrer so his work becomes very very easy" + the admin
management axis + the connected-no-seat promoter picture. Built by the 6-agent workflow
`wf_bec78d41-5f8` (origin quarry · engraved canon · live reality + admin axis · crypto
benchmark · mainstream benchmark · completeness critic). **Durable — never re-search**
(RESEARCH LEDGER discipline). The six lens reports are appended VERBATIM below the
synthesis; the founder's scope pick at the gate governs what builds.

**THE MIRROR RULE APPLIES.** The origin lenses are a QUARRY, never a LAW: the origin's
leaderboards, Builder Score, referral quests/XP, 5-tier commission-from-Operations ladder,
per-visitor localStorage capture, and alias-as-identity NEVER ride back in with the
harvest — the engraved anti-MLM rejects and today's canon outrank every quarry pattern.

**Settled by existing canon (never re-asked):** one wallet · one link · forever (no custom
codes/aliases; campaigns = the `&via=` layer only) · the artifact's copy is FIXED and
verifiable-facts-only (the member's own post text around it is theirs — the "editable copy"
benchmark tension dissolves there) · no invitee discount ever (the red line) · no
personalized name/face landing (address ≠ identity; short-form only) · milestone nudges
("1 away", counters-to-next) stay banned · sources are founder-signed on-chain acts — the
SIGNATURE is security canon; only the friction AROUND it may die.

**Verify-first items folded into the build slices (from the critic):** ① the contract's
truth for a no-SYN introducer at pay time (read the .sol — skip vs escrow) and whether
createSource for a no-seat wallet is contract-legal; ② the MAX_MEMBER_INTRO_BPS constant
vs the ladder doc's Summit row; ③ the notification whitelist's `/member#referral-dashboard`
fossil (fix before any kit deep link ships); ④ third-party benchmark figures are
directional, not verified facts.

---
# ORIGIN QUARRY INVENTORY — Referrer Kit / Protocol Promotion (complete system picture)

Two origin repos searched exhaustively (filenames + content). The origin had **three generations** of this system: the labs/prototype generation (main `src/` of TheSyndicate), the **Product OS Studio** generation (`apps/product-os-studio` — a full Share Center + Press Kit + Referral suite), and the **Supa-Exchange** generation (a fully LIVE referral engine with admin intelligence).

---

## A. TheSyndicate — SHARE / PROOF-CARD MACHINERY (shipped, working)

1. **`C:/Users/kemal/OneDrive/Documents/GitHub/TheSyndicate/src/components/syndicate/MemberShareCard.tsx`** (352 lines)
   The production "share your seat" artifact: fixed 640×360 identity card (member #, chapter, rank, SYN received, short wallet, "Verified on Avalanche C-Chain" badge, "Don't trust · verify" footer), exported to PNG via html-to-image. `MemberShareBlock` = card + share bar in one drop-in, with a `variant="offscreen"` mode (render off-viewport for export only). Distinguishes `cardUrl` (clean, printed on card) from `shareUrl` (carries `?ref` attribution). Used on `/my-syndicate` (cockpit) and `/wallet/$address` and `/member/$number`.

2. **`.../src/components/syndicate/ShareActions.tsx`** — the canonical share-action bar contract: "Download PNG · Share to X · Share to Telegram · Copy text · Copy link". Every shareable artifact must render this same bar. Truth-preserving by contract ("callers assemble shareText from verifiable values only").

3. **`.../src/labs/components/ShareableCards.tsx`** (585 lines) — the labs generation: `MemberCard` + `ProtocolSnapshots` — one-shot PNG proof cards **per metric** (revenue, treasury assets, liquidity, members, milestone), all values read live from chain, "PENDING values render as PENDING — cards never fabricate numbers."

4. **`.../src/labs/components/HomeShareCTA.tsx`** — homepage share module, 3 ready-made share targets with fixed copy: "Share protocol snapshot" / "Share latest milestone" / "Copy verification link", each with X + Telegram intents + copy. Copy examples: *"The Syndicate — a transparent on-chain protocol on Avalanche. Membership Sale routes every USDC 70 / 20 / 10 on-chain. Verify everything."*

5. **`.../.agents/memory/share-card-export-pattern.md`** — the engraved PNG-export recipe (inline styles, explicit dimensions, no external fonts/images, off-screen wrapper pattern, `toPng({pixelRatio: 2, cacheBust: true})`, oklch works).

6. **`.../scripts/og-metadata-test.mjs`** — CI check of OG/meta tags on the four "canonical shareable routes" (Home, Transparency, Wallet, Milestone).

## B. TheSyndicate — PRODUCT OS STUDIO: the full "kit" vision (`apps/product-os-studio`)

1. **`.../apps/product-os-studio/src/pages/share.tsx`** — **"Proof & Share Center"** page. 9 proof-card families, each with data source, live/simulated label, disclosure line, deep link, and a full share payload with prewritten post copy: Membership Proof, Receipt Proof ("150 USDC routed... 70% Vault / 20% Liquidity / 10% Operations"), Chapter Progress, Protocol Routing, Archive Memory, Evolution Episode, Verified Introduction status, Proof of Fire, Syndicate Toolkit. Header defines a **share loop**: `Share → Witness → Invite → Return`. Ends with a Press Kit bridge card.

2. **`.../apps/product-os-studio/src/pages/press.tsx`** — **full Press/Media/Brand Kit page**, 8 sections: Descriptions (one-line/short/long with copy-buttons), Brand system (mark/wordmark/palette/typography/status labels), Product previews (asset gallery), Social/OG previews, Official channels ("the only official channels; treat any other as unofficial"), Protocol facts (live vs not-live lists), **Approved & banned language** (approved: membership/seat/receipt/proof/routing…; banned: yield/ROI/passive income/MLM/downline-upline/guaranteed return/investment), Media usage & disclaimers + press contact.

3. **`.../apps/product-os-studio/src/lib/brand.ts`** — single source of truth feeding Press Kit + Share Center + share dialog: descriptions, palette (Signal Orange mark vs Protocol Blue accent, documented honestly), typography roles, channels (site / @TheSyndicateOne / t.me/TheSyndicateMoney), protocol facts, approvedLanguage/bannedLanguage arrays, mediaUsage rules, and **6 planned dynamic OG cards** (`ogPreviews`: home / member seat / receipt / chapter / episode / archive — "CONCEPT ONLY... would require a backend image service").

4. **`.../apps/product-os-studio/src/components/share-dialog.tsx`** — reusable share dialog: branded proof-card preview, X + Telegram intent buttons, Copy text, **Image export button** (concept-labeled: "OG card generation is not built in this prototype yet"), official-channels follow chips.

5. **`.../apps/product-os-studio/src/pages/referral.tsx`** — the **ambition ceiling of the referrer dashboard**: two-tab "Approved Introducer View / Buyer View". Introducer view: Source Identity card (address, approved class, ACTIVE/PAUSED/REVOKED), Candidate Parameters (5% USDC rate, direct payout, escrow fallback), **Generated Introduction Link card with QR-code placeholder + copy button** (`/join?source=0x…`), disabled "Claim Escrowed Payouts", **Referred Buyers table** (wallet/date/volume/candidate share), blurred-out **Conversion Analytics** chart ("planned for V2"), Compliance & Disclosure panel ("must not be promoted as a financial offering… misrepresentation will result in immediate source revocation"). Buyer view: simulated source-attributed buy with gross → commission → net-routed breakdown + "Clear Source (Use ZERO_SOURCE_ID)". Sidebar: **V1 scope** (invite-only, SaleV3 only, buyer-visible + buyer-clearable, direct-payout-first, escrow fallback) and **V2 scope** (Source Dashboard & Analytics, ENS/custom aliases, **Custom Campaign Pages**, Claim UI, **B2B/Partner Campaign Tooling**, On-chain Source Reputation).

6. **`.../apps/product-os-studio/src/pages/public-referral-status.tsx`** — public "Verified Introduction" status page (V1 candidate, honest not-live banner, doctrine & compliance card).

7. **`.../apps/product-os-studio/src/lib/actions.ts`** — the toolkit action registry includes a "Proof & Share" category, a `referral` category ("Verified Introduction — Source attribution, a V1 candidate"), share actions (`act-share-proof` "Make a share card" → /share, `act-share-fire`), and `share`-type actions carrying SharePayloads. `public-footer.tsx` links "Press Kit" site-wide.

## C. TheSyndicate — BRAND / BANNER / MARKETING ASSETS (real files on disk)

1. **`.../public/brand-v2-syndicate-interlock/`** — 48 files, the APPROVED v2 set: marks (gold/ink/ivory), icon tiles, favicon, avatar, **gold + silver SYN coins**, CoinGecko-200 and DexScreener-256 listing logos, 4 lockups (light/dark/obsidian/stacked), **`syn-og` 1200×630 OG card**, **`syn-listing` 920×200 listing badge**, **`exchange-preview` 800×800**, **`syn-splash` 1170×2532 mobile splash**, **`syn-press-hero` 2400×1260 press-kit hero banner** — all SVG+PNG.
2. **`.../scripts/brand/gen-interlock.mjs`** (+ `gen-v2-mark.mjs`) — the **generator** that programmatically produces the whole set above from the canonical monogram geometry (real vector text, ImageMagick rasterization). The origin could regenerate its entire banner/press asset pack from one script.
3. **`.../public/brand-v1-node/`** and **`.../public/brand-v2-syndicate-mark/`** — two earlier full brand sets (og-brand.png, social avatars, coins, logos light/dark).
4. **`.../public/og/`** — `og-protocol-default.png`, `og-transparency.png`; `.../public/hero/` — throne + cervin hero images.
5. **`.../src/components/syndicate/BrandBoard.tsx`** (430 lines) — in-app brand review board displaying the full asset set including the press hero.
6. **`.../docs/brand/BRAND_GUIDELINES.md`** — usage rules: canonical rounded interconnected emblem, color-role law (Gold=identity/seat/token, Cyan=live/verify…), fixed brand gold #E3A92B.
7. **Ambition docs**: `docs/handoffs/FOUNDER_REVIEW_PACK_2026-06-17.md` — "Sprint 0 — Brand/press kit… Press kit: Logo pack AI/EPS/SVG/PNG, light + dark, usage rules — PENDING"; `attached_assets/Pasted-APPROVED-SPRINT-0A…0B` spec listing the 10-item brand deliverable set incl. "Press-kit asset area" and "Exchange listing preview assets".

## D. TheSyndicate — INVITE / ATTRIBUTION FLOW (shipped)

1. **`.../src/lib/referral-attribution.ts`** — `?ref=<memberNumber>` capture system: `REF_PARAM`, localStorage first-touch record (`syn:ref-attribution`), strict parse (positive int only), `buildReferralShareUrl(baseUrl, memberNumber)` appends `?ref=` to every member share link. "Attribution ONLY: no reward, no commission, no payout, no contract."
2. **`.../src/components/syndicate/ReferralCapture.tsx`** — mounted at root, records first-touch ref.
3. **`.../src/components/syndicate/ReferralAttributionNote.tsx`** — renders "Brought by Member #N" ONLY when the ref resolves to a real member in the holder index; self-referral suppressed; legal note always shown.
4. **`.../src/lib/future-referral.ts`** — the reserved attribution event model; `FUTURE_REFERRAL_NOTE` legal copy ("Attribution only — a verified growth contribution and member recognition. No commission is implied or paid…"); reward status permanently PENDING.
5. **`.../src/lib/preview/referral.ts`** — the SIMULATED ambition model: **5-tier referral ladder** (Signal/Advocate/Connector/Catalyst/Ambassador, thresholds 0/5/20/50/100 referred members, commission 30–80% **of the 10% Operations slice**, retention requirements 60–80%), **Builder Score formula** (retention×0.40 + durability×0.30 + age×0.20 + reach×0.10; gross USDC tiebreaker only), simulated referrer leaderboard, referral event feed, treasury ledger rows with `OPERATIONS_TO_REFERRER` movement tag. Quarantined: preview-display only. Rendered by `.../src/components/preview/ReferralPreview.tsx` + `ReputationLeaderboardPreview.tsx` + `SplitVisualizer.tsx` on `/v3-preview`.

## E. TheSyndicate — REFERRAL ADMIN MACHINERY (how sources were created/approved/managed)

1. **On-chain**: `SourceRegistryV1` deployed (Avalanche mainnet), 1 record `INTERNAL_PROTOCOL_TEST_SOURCE_001`, validated in one controlled source-attributed buy, returned to PAUSED; public buys use `ZERO_SOURCE_ID`. Events model in **`.../src/lib/source-registry-lifecycle.ts`**: `SourceCreated / SourceTermsUpdated / SourceStatusChanged / SourceWalletUpdated / SourcePayoutWalletUpdated`.
2. **`.../src/lib/source-policy-observability.ts`** — the source record model: **7 source classes** (`MEMBER_INTRODUCTION, BUILDER_SOURCE, AFFILIATE, BD_NETWORK, WHITELABEL, SPONSORSHIP, TREASURY_DEAL`), **5 scopes** (`FIRST_PURCHASE, WINDOWED, CAPPED, LIFETIME, CUSTOM`), statuses NONE/ACTIVE/PAUSED/REVOKED, live snapshot with registry/record/active/paused counts (rendered on `/referral`).
3. **`.../src/routes/labs.source-attribution-test.tsx`** + **`SourceAwareLocalTestHarness.tsx`** — the "**Source Attribution Operator Console**": gated wagmi write-path harness that walked the founder through a real source-attributed buy ceremony (stage machine in `source-test-operator-ceremony.ts`, terms match check vs `source-real-condition-test.ts`).
4. **`.../src/routes/labs.verified-introduction-review.tsx`** — token-gated founder review surface rendering the entire V1 decision stack.
5. **The Verified Introduction V1 governance suite** (`.../src/lib/verified-introduction-v1-*.ts` + tests): `launch-packet` (launch gates), `disclosure` (buyer-must-understand items, required copy, forbidden-copy rules, accounting labels), `anti-abuse` (eligibility rules, abuse states with trigger/control/operator action/buyer outcome, fail-closed behavior), `buyer-experience` (**16 buyer scenarios**: NO_SOURCE_PRESENT, SOURCE_PAUSED/REVOKED/EXPIRED/NOT_YET_ACTIVE, CAP_EXCEEDED, BUYER_ALREADY_SEATED, BUYER_EQUALS_SOURCE_WALLET, WRONG_CHAIN, STALE_READBACK, BUYER_CLEARED_SOURCE…), `execution` (phase plan), `release-qa` (latest-reads + live QA checks), `founder-launch-decision` (decision packet with 4 options: approve/approve-with-revisions/defer/reject). Naming trinity locked in `source-public-product-framework.ts`: user-facing "**Verified Introduction**", protocol "Source Attribution", accounting "Acquisition Source", "publicNameToAvoidAsPrimary: Referral"; access model `INVITE_ONLY_MANUAL_APPROVAL`.
6. **Docs (22+ files in `.../docs/`)**: `SOURCE_CREATION_CEREMONY_RUNBOOK.md`, `SOURCE_RECORD_PACKET_TEMPLATE.md` (required pre-approval artifact per source), `SOURCE_PACKETS/` (the real INTERNAL_TEST_001 draft, founder inputs, frozen metadata JSONs), `SOURCE_ACTIVATION_READINESS_PACKET.md`, `SOURCE_ACTIVE_CEREMONY_PREFLIGHT.md`, `SOURCE_REAL_CONDITION_*` (test plan, ceremony guide, readback), `LEGAL_DISCLOSURE_REFERRAL.md`, `REFERRAL_INFRASTRUCTURE_PLATFORM_AUDIT.md` (infrastructure blueprint), `REFERRAL_SOURCE_ATTRIBUTION_STRATEGIC_RESEARCH.md`, `VERIFIED_INTRODUCTION_V1_*` (launch packet draft, execution bridge, founder decision packet), `SOURCE_PUBLIC_PRODUCT_DECISION_*`.
7. **Member-facing pending shells**: `.../src/routes/referral.tsx` (public /referral explainer: policy snapshot, activation gates, lifecycle event model, future receipt proof fields, touchpoint map) and `.../src/components/syndicate/MyReferralCard.tsx` (+ `MyReputationConceptCard`) on the cockpit. `SourceAttributionProofCard.tsx` renders source-attributed receipt proof.

## F. Supa-Exchange — the LIVE referral engine (secondary origin)

1. **Schema** (`C:/Users/kemal/OneDrive/Documents/GitHub/Supa-Exchange/shared/schema.ts`): `referrals` table (referrerId, referredId, code, status pending→active, pointsAwarded, xpAwarded, activatedAt; unique — each user referred once) + `referralConfigs` table (admin-tunable `referrerReward {points,xp}`, `refereeReward`, `activationCondition {minVolumeUSD | firstSwap}`). Notification kinds `referral_joined` / `referral_bonus`; badge condition `referral_count`; quest metrics `referrals` and `referrals_season`.
2. **Server** (`server/routes.ts` ~3816–4000, `server/storage.ts` 1398–2107): `GET /api/user/referral` (deterministic code + stats), rate-limited `POST /api/user/referral/apply` with guardrails (auth required, one-referral-per-user-ever, no self-referral, code validation), `checkAndActivateReferral()` — **activation-on-real-activity**: fires when referred user's volume crosses the configured threshold; race-safe activation, XP+points to both sides, notifications to both, quest progress, seasonal quest metric (`coreSocialReferralQuestMetricsService.ts`), badge triggers (`badgeService.checkReferralBadges` — cumulative thresholds).
3. **Referral HUB** (spec: `attached_assets/Pasted-CONTEXT-We-are-finalizing-Phase-3-3-Referral-HUB…txt`; implemented in `client/src/pages/Leaderboard.tsx` above the leaderboard): hero "Invite friends. Earn together.", referral-link card (copy + **X/Telegram/WhatsApp** share buttons), 3-step "How it works", stats (Invited Friends / Active Referrals / XP / Points), anonymized **Referral Activity Preview** (Joined/Pending/Activated avatars — "No names. No wallet addresses."), trust micro-copy ("Only active referrals are rewarded. Quality matters more than quantity.").
4. **Missions page** (`client/src/pages/Missions.tsx`): `ReferralCard` + `ReferralSection` (link `?ref=CODE`, copy, 3-platform share with prewritten message), "Invite Active Friends" earning card; seeded referral quests (`server/seeds/gamification-seed.ts`): first_referral 200XP, refer_3 400XP, refer_10 1000XP, weekly_referral, referral_season_starter/hero; "Master Recruiter" badge at 10 referrals.
5. **Referral ADMIN**: **`client/src/pages/admin/AdminAmbassadors.tsx`** — ambassador analytics console (per-user **ambassadorScore**, activatedReferrals, totalReferredXpAwarded, socialQuestXp; timeframe filter 7d/30d/all; sortable; CSV **Download**; copy wallet) backed by `GET /api/admin/insights/ambassadors` (admin-role gated) + `storage.getAmbassadorsAnalytics`. Sibling `AdminPowerUsers.tsx` per "PHASE 8-0 ADMIN INTELLIGENCE LAYER (POWER USERS / AMBASSAD…)" spec in attached_assets.

## G. Cross-cutting origin doctrine attached to this system
- Referral speaks "Verified Introduction", never "Referral" as primary public name; invite-only manual approval; no MLM/downline/upline ever; commission comes only from the Operations slice; buyer always sees and can clear the source; every claim carries live/not-live status; approved/banned language lists enforced in the press kit itself; share copy is fixed and verifiable-facts-only.

Key paths for the rebuild gate: the Studio share/press/referral trio (`apps/product-os-studio/src/pages/{share,press,referral}.tsx` + `lib/brand.ts` + `components/share-dialog.tsx`), the production share-card stack (`src/components/syndicate/{MemberShareCard,ShareActions}.tsx`), the asset generator (`scripts/brand/gen-interlock.mjs` → `public/brand-v2-syndicate-interlock/`), the attribution libs (`src/lib/{referral-attribution,future-referral,preview/referral}.ts`), the source-admin governance suite (`src/lib/verified-introduction-v1-*.ts`, `docs/SOURCE_*`), and Supa's live engine (`shared/schema.ts` referrals/referralConfigs, `server/routes.ts` referral block, `client/src/pages/admin/AdminAmbassadors.tsx`, Leaderboard/Missions referral hubs).

---

# ENGRAVED CANON — REFERRAL / SHARE / KIT SYSTEM (inventory of what is already decided)

## (a) ENGRAVED DECISIONS touching the referrer kit / OG cards / share assets / conversion surfaces

**The Referrer Kit definition (master brief piece 7)** — `docs/direction/MVP_FINAL_MASTER_BRIEF.md` §4 piece 7:
> "**THE REFERRER KIT** — better than web2 banners: a GENERATED OG CARD carrying on-chain data (seat, chapter, verified introductions, standing) — provable, shareable in seconds, zero writing. One click → living card + link + QR. The card can only show what the chain proves (seed: `shareCardSample` — 'Proof, not claims'). **Pieces 2+3+7 interlock: vanity becomes the acquisition tool.**"

**Its slice shape (M2)** — same file, §8 map row M2:
> "One click on the dashboard → the member's LIVING CARD: client-generated image (canvas, own-row data: seat · chapter · verified/durable introductions · standing) + link + QR; share menus wherever a link matters. Card shows ONLY chain-proven figures." Deliberately waits: "Server-rendered per-seat OG images for social unfurls (v2 — real infra); any figure the chain can't prove."

**The founder's post-seal order pulling it forward (2026-07-20)** — `docs/direction/OPEN_QUEUE.md` (top entry):
> "POST-SEAL founder order (2026-07-20, emphatic): pull the REFERRER KIT forward — 'give ALL to the referrer so his work becomes very very easy' + the ADMIN management axis (source confirmation without manual friction) + the connected-no-seat promoter picture. SYSTEM-FIRST inventory in flight (origin harvest + external AAA benchmark + today's reality + admin axis); the founder picks scope from the full picture. NEXT after that: recognition/season (slice 6)."

**REFERRAL-SHOWCASE remaining half** — `OPEN_QUEUE.md`:
> "⏳ REFERRAL-SHOWCASE — /referral HALF DONE (arc slice 2, sealed prod `5d9cb58` 2026-07-19): the four §7 flagship lines live VERBATIM + VerifyOnChain in the Overview 'Your unique claim' hero. REMAINING (still queued): the /join referral card + the Referrer Kit / OG card (rides M2/M3)." Rationale recorded: "the instant in-transaction referrer payment is the protocol's UNIQUE claim AND sits inside the 30-day proof metric (≥5 seats via referral links) — it must never dissolve into M1/M2/M3, which do not cover these surfaces."

**The link hero law (exactly once)** — `docs/reference/REFERRAL_PAGE_DESIGN.md`:
> "THE LINK HERO (`ReferralLinkHero.tsx`): the ONE canonical link block — full URL + Copy + QR + Share + the two-state honesty — ABOVE the tabs, visible on EVERY tab, **exactly ONCE on the whole page** ('nothing scrolls between a new member and the link'). NO surface may repeat the bare link: the Channels composer shows only the TAGGED variant." Also: "one single place in the whole app that builds a referral link" is guard-pinned (`RECEIPT_AND_SHARE_SYSTEM_INVENTORY.md` §1, the 83 pins) and R-BIND-2 §2: "exactly ONE `join?source=` construction site, `referralLink` passed down never rebuilt, card mounts only with a resolved link."

**The share machinery already built** — `docs/reference/RECEIPT_AND_SHARE_SYSTEM_INVENTORY.md` §2:
> Receipt share card = "a generated **1200×630 image** (the cross-platform share standard)… on the right a large **QR of the member's OWN introduction link** — 'SCAN TO JOIN / through my introduction'. The receipt doubles as the member's recruitment artifact. It stays under 300KB (WhatsApp-safe), is guard-pinned… **This is the only card-to-image generator we have — and it's proven.**" Plus the share menu (X, Facebook, WhatsApp, Telegram, LinkedIn, Email + copy link), the QR block with PNG/SVG download, the link hero. The "verified introducer" card is "Built but currently unmounted… one import away from returning." The mockup's Channels tab button "Referrer kit (PNG / OG)" "exists only in the mockup. Nothing implements it."

**Sealed since that inventory (Q44 order, all prod-sealed 2026-07-20, `featureStatus.ts` keys live — DONE-IS-DONE, never re-propose):** `receiptPublicPage` (/receipt/{txHash}, noindex,follow per founder "non"), `paintedPreviewCards` ("the api paints every receipt its own 1200×630 picture (<300KB… 4 faces: THE SEAT · WHERE YOUR MONEY WENT · THE STORY · THE PROOF…) · THE ROTATION lives in the LINK: each share act hands the next face (?f=2..4, wrap)"), `commissionRegister` (5.1 + its SHARE DOOR: "each document shares its PERMANENT public page /receipt/{tx}"). Share-intent contract engraved (R-CARDS rider): "text never contains the link; x/telegram get url-free text, whatsapp/email keep it inline with an empty url."

**Dual-share verdicts (R-BIND-2, durable)** — `docs/reference/RBIND2_HERO_SHARE_DIRECTION.md` §2: Copy link first with confirmed "Copied"; network order "X → WhatsApp → Telegram → LinkedIn → Facebook → Email"; native trigger labeled **"Share with other apps"**, full-width, last, feature-detected ("never a dead button"); "**No network intent can attach an image.** The picture travels two ways only: the native sheet (the PNG file) and the link's preview card"; "Instagram stays omitted — no web intent exists"; "No share counters, no prefilled hype." Rotation answer engraved: "the rotation lives in the LINK, not the preview."

**Channel composer verdicts (wf_b01f310a, canon)** — `REFERRAL_PAGE_DESIGN.md`: "stateless composer, chips + live full-URL + copy-per-row table; REJECT shorteners / saved link objects / localStorage / per-visitor tags / QR-in-composer." And SPEC §④: "⚠️ NE JAMAIS CRÉER UN `sourceId` PAR CANAL."

**Anti-MLM / benchmark reject list (binding on every referral surface)** — `REFERRAL_PAGE_DESIGN.md`:
> "**NO MLM.** No downline tree, no 'recruit N more', no leaderboard of other members, no multi-tier override commissions. One completed introduction, one bounded commission." Rejects: "downline/'who you introduced' roster · leaderboards/'top referrers' · earnings projections / 'earn up to X' / EPC calculators · countdowns/FOMO/'1 invite away' · recruit-more / multi-tier overrides · confetti/number-go-up · vague-reward/hidden-rules · asserted unverifiable balances."

**Conversion-surface stage laws** — `docs/direction/CANON_CONVERSION_SURFACE.md` (TIER-0, binding on every public page): the 5-second test; "emotion → figure → verify"; ONE primary CTA; hero 60–100% desktop / 50–70% mobile; full-bleed scenes + constrained text; LCP < 2.5s, images < 500KB WebP/AVIF; touch targets ≥ 44px; trust = "verify links and honest live figures — never logos-of-strangers, never testimonials we cannot prove, never invented urgency."

**Commission receipts extension path** — `docs/reference/COMMISSION_RECEIPTS_DESIGN_DIRECTION.md` §7: "**Share card per receipt**: the document's zones map 1:1 onto the existing `ReceiptShareCard` grammar… the share artifact is the factual receipt only, self-verifying via QR/hash… **No aggregate 'I earned $X' flex cards, ever.**"

**Origin quarry (harvest, mirror rule)** — `RECEIPT_AND_SHARE_SYSTEM_INVENTORY.md` §3: the 640×360 member identity card, the ONE canonical share bar, the labs generator (member card + 5 protocol proof cards), and the OG machine — "*'a pasted Syndicate URL renders an empty grey card'* as **the single biggest leak in the entire system**"; "the deferral is not design law; the generator is the harvest"; old per-request chain scanning stays out (we have an indexer).

**Ladder truth for any standing card** — `docs/direction/CONNECTOR_LADDER_POLICY.md` (supersedes SPEC §⑤'s 5/7/9/10.5/12 table): Emerging 5% (0) · Active 5% (3, title only) · Trusted 6% (10) · Established 7% (25) · Durable 8% (60) · Foundational 10% (150) · Summit 12% (300 = `MAX_MEMBER_INTRO_BPS`). "A rate never decreases, never retroactive"; "Partner is not a rung… negotiated separate CLASS (up to 30%)"; counting unit = "An introduced member **still holding their seat**"; UI: "The progress bar is **never empty**… **Visible progress everywhere**… the ladder carries the acquired (the past — it never demotes)… **The summit stays rare**." No new smart contract ~6 months (issuer, promotion contract, Router V4 at the pro-firm horizon).

**Display truth on any card/promo** — `docs/direction/SPEC_REFERRAL_SYSTEM.md` §⑧: "**LE TAUX VIENT DU DEVIS… JAMAIS de `commissionBps`**"; "**L'ADRESSE VIENT DE `sourceConfig(sourceId).payoutWallet`**"; fail-closed ("On ne montre RIEN plutôt que du faux"); sourceId = `keccak256("SYN.SOURCE.V1", wallet)`, never an alias ("L'alias est une COMMODITÉ. Jamais une IDENTITÉ."); §④ `source` ≠ `via` (who is paid on-chain vs which channel off-chain).

## (b) The four §7 flagship conversion lines — verbatim (`docs/direction/CANON_PROTOCOL_LANGUAGE.md` §7; live verbatim in the /referral Overview hero since slice 2)

1. "You don't wait to get paid. The contract pays you inside your referral's own transaction — before we ever see the money. One signature. Two recipients. Verify the hash yourself."
2. "Nothing to claim. It's already in your wallet when the block confirms."
3. "A referral payment can never break a sale — and can never be lost."
4. The one-liner: "The referral program where the payout is part of the purchase." (register-exempt use of "payout" — the referrer-side showcase names the referrer's pay plainly, §4)

Each under the register's one law: "Every bold claim must be provable and must carry (or sit next to) its verify path… bold claim + verify link. Legal verbatim lines (§6) never move, never soften, never migrate below the fold of the claim they govern."

## (c) WHO can hold a referral link (`docs/direction/CANON_ACCESS_MODEL.md`)

- **Referral STANDING** (figures, rows, commissions) = a **member-account surface** → sign-in wall; visitor sees "teaser + one 'Connect + sign in' CTA · zero personal figures"; signed-no-seat sees the **conversion** view, "never a fake member dashboard."
- **The referral LINK itself is tool-open, NOT seat-gated.** Matrix, Public row: "only the deterministic referral-**link** hash derives from a connected address — **tool-open, NOT gated**." §D: "Keep the referral-**link** generation **tool-open** (public non-sensitive hash — do NOT session-gate it; critic)." So a **connected-no-seat** wallet can already derive its deterministic sourceId/link.
- BUT the chain pays only a seated, SYN-holding introducer for MEMBER_INTRODUCTION: SPEC §⑥ "**Doit détenir du SYN ? OUI**" (`ReferrerNotSeated` — which actually checks `balanceOf`, not the seat: "Les noms mentent. Lis le `.sol`"); §⑧ honest copy: "You must hold a seat and hold SYN to introduce others. You cannot recommend what you have left." Selling all SYN → commissions to zero, source stays ACTIVE — "À DIRE." Anonymous visitors: /referral is public (program page, SEO fork to SourceAttribution) but derive no link. Affiliates (AFFILIATE/BD_NETWORK classes, up to 30%, founder-opened, signed agreement) need no seat — a different class, not the member program. The founder's 2026-07-20 order explicitly adds "the connected-no-seat promoter picture" to the in-flight inventory — that picture is OPEN, not yet decided.

## (d) What the scope menu already reserves (`RECEIPT_AND_SHARE_SYSTEM_INVENTORY.md` §5 + OPEN_QUEUE 5.1 closure)

A (commission receipt ticket) and B (its share card) **LANDED** in slice 5.1 ("scope B (share card) LANDED as the share door on the permanent-page link (the painted cards already dress it)"). Reserved LATER, stacking "without rework":
- **C — The Referrer Kit v1 (the queued M2 slice)**: "The one-click **member standing card**: seat · chapter · verified introductions · standing, generated as a living image + link + QR, mounted on /referral (the mockup's unimplemented 'Referrer kit' button, made real; the unmounted introducer card retired or absorbed)… chain-proven figures only. *Adds*: the card design (wireframe required), the one-click flow, guard pins."
- **D — The receipt binder + the public receipt page**: since sealed in substance (R-BIND, /receipt/{txHash}); only the PDF engine remains "its own rider."
- **E — Living link previews**: per-RECEIPT painting is done; the per-PAGE / per-SEAT site-wide previews remain future ("today every page of the site unfurls with the same one static image (1280×720, from July 10)… format mismatch: the site image is 1280×720 while our own house share standard is 1200×630").
- Ordering note engraved: "They stack — nothing in A/B is thrown away by C, D, or E."

## (e) Legal / vocabulary constraints binding promo material

- **The pinned legal line** (`REFERRAL_PAGE_DESIGN.md`): "A referral commission is a bounded, one-time payment for a completed introduction — not token yield, not passive income, not equity, not a guarantee of appreciation."
- **The red line** (SPEC ⓪): "GAGNER POUR UN ACTE = rémunération. GAGNER POUR UNE DÉTENTION = rendement. INTERDIT." A rung may unlock recognition/status/access, NEVER "un meilleur PRIX sur le SYN."
- **Banned public vocabulary** (`CANON_PROTOCOL_LANGUAGE.md` §5, guard-enforced, negation-aware): invest/investment/investor · yield · APY · APR · ROI · dividend(s) · passive income · guaranteed return/benefit/financial return · profit · payout* · equity · donation(s) · pump · 100x · moon* · FDV/market cap · jackpot/wager/betting · airdrop/farming/liquidity mining/yield farming/high yield · win big · reward pool/earn rewards/claim rewards · governance weight · raised*/fundraising · downline* · "your share"/"your vault"/"the community's funds"/"shared funds"/"common pot" · trust-us framing · fake-live. (`*payout` flagged: watch at every new referrer surface — allowed only in the referrer-side showcase context per §7.)
- **Money-flow formula, verbatim doctrine**: "Gross purchase → referrer/source payment, if eligible → net protocol contribution → 70/20/10" and "The referrer is not paid from Syndicate revenue after the fact. The referrer is paid from the purchase transaction before the net protocol contribution is routed."
- **Chat/report word law** (CLAUDE.md settled-law): "commission", never "acquisition cost" ("acquisition commission" killed in slice 3.3, ban engraved into guard-forbidden-copy); banned rung names Cornerstone/Operator/Builder/Steward/Custodian/Scout.
- **CHARTS POLICY**: "No 'your commissions going up' line; a chart plots a dated, verifiable record, framed as a statement."
- **Anti-financialization glyphs** (memory canon `mechanism-decides-not-symbol`): gain-promise glyphs banned (rocket/moon/chart-up/diamond-pump/raining-money/dice), honest function symbols fine (vault, gift, trophy, receipt).
- **No selling on a receipt** (`RECEIPT_AND_SHARE_SYSTEM_INVENTORY.md`): "No discounts, urgency, rewards vocabulary — a ticket proves a purchase, it never sells" (83 guard pins). Historical FOMO only, "never financial" (MVP brief piece 3).
- **Visibility Law**: amounts SHOWN on cards ("the amount is already public in the linked transaction, hiding it would be theatre"); red line = name/alias/email, never the short-form address; own-row, no directory (ADR-003).

Key source files (all absolute): `C:/Users/kemal/OneDrive/Documents/GitHub/syndicate-os/docs/reference/RECEIPT_AND_SHARE_SYSTEM_INVENTORY.md` · `docs/reference/REFERRAL_PAGE_DESIGN.md` · `docs/reference/RBIND2_HERO_SHARE_DIRECTION.md` · `docs/reference/COMMISSION_RECEIPTS_DESIGN_DIRECTION.md` · `docs/direction/SPEC_REFERRAL_SYSTEM.md` · `docs/direction/CONNECTOR_LADDER_POLICY.md` · `docs/direction/CANON_ACCESS_MODEL.md` · `docs/direction/CANON_CONVERSION_SURFACE.md` · `docs/direction/CANON_PROTOCOL_LANGUAGE.md` (§5/§7) · `docs/direction/MVP_FINAL_MASTER_BRIEF.md` · `docs/direction/OPEN_QUEUE.md` · `artifacts/studio/src/config/featureStatus.ts`.

---

TODAY'S DEPLOYED REALITY — the live referral + share machinery (inventory, exact paths, all under `C:/Users/kemal/OneDrive/Documents/GitHub/syndicate-os/`)

=== 1. LIVE REFERRER-FACING SURFACES ===

**The surface fork** — `artifacts/studio/src/pages/ReferralSurface.tsx`: `/referral` forks on `useSignedIn()` (S4 wallet session). Connected → `MemberReferralDashboard` inside `MemberShell`; not signed (incl. Google prerender) → the public program page `pages/SourceAttribution.tsx`. Registered live in `config/featureStatus.ts`: `referralTabs` (live 2026-07-19), `channelAnalytics`, `introductionRows`, `commissionRegister` (live 2026-07-20), `receiptPublicPage` + `paintedPreviewCards` (live 2026-07-20).

**The link hero** — `artifacts/studio/src/components/referral/ReferralLinkHero.tsx`: THE one canonical link block, above the tabs, on every tab, exactly once (founder structure order 2026-07-19). Link = `https://thesyndicate.money/join?source=${sourceId}` where `sourceId = payingSourceId(readback?.sourceIdHex, address)` (`lib/sourceIdentity.ts` — Ruling ① 2026-07-16: advertise the source that PAYS the wallet; fallback = canonical `keccak256("SYN.SOURCE.V1", wallet)`). Live registry active-state pill ("Source active"), copy button, QR (`QrCodeBlock.tsx`), `ShareMenu`. Key copy: *"Your link is permanent — derived from your wallet, it never changes. The commission activates when your source is founder-signed."*

**The 5 tabs** — `components/referral/MemberReferralDashboard.tsx`: deep-linkable sub-routes `/referral` (Overview) · `/referral/introductions` · `/referral/commissions` · `/referral/ladder` · `/referral/link` (label "Channels"). Four figures ALWAYS above the tabs (Introductions · Durable introductions · Commission paid · Held in escrow, with own-wallet explorer "verify ↗"). One shared standing read: `referralStanding.ts` `useOwnSourceStanding()` → `GET /api/auth/source-standing`. Panels: `ReferralOverviewPanel.tsx` (where-you-stand + §7 conversion claim), `ReferralIntroductionsPanel.tsx` (per-introduction rows: date, ADR-003 short-form wallet, durable flag, commission, verify anchor — `GET /api/auth/introduction-rows`), `ReferralCommissionsPanel.tsx` (commission receipts register, slice 5.1), `ReferralLadderPanel.tsx` (horizontal Connector rail + promotion-due box), `ReferralLinkPanel.tsx` (Channels).

**The channel composer + `&via=` analytics** — `ReferralLinkPanel.tsx`: 6 preset chips (x, telegram, whatsapp, discord, youtube, instagram) + Custom (normalized `[a-z0-9][a-z0-9_-]{0,23}`, max 24); shows ONLY the tagged variant (`${baseLink}&via=${tag}`), never the bare link; "Never shortened" by design. Aggregate table per tag (clicks / verified joins) via `GET /api/auth/channel-standing` (`walletSession.ts` `fetchChannelBreakdown`). Server side: `artifacts/api-server/src/channel/router.ts` — the anonymous channel zone, `POST /api/channel/click` and `POST /api/channel/conversion`, always 204, throttled, source must exist on the live registry (`sourceExistence.ts`), a conversion records only after `txVerify.ts` verifies the purchase event on-chain names that source; aggregate daily counters only, no IP/UA/identity. Client beacons: `studio/src/lib/channelPing.ts`; click fired from `pages/JoinProtocol.tsx` (~line 638), conversion from `wallet/JoinCheckout.tsx` (~line 510, using the EVENT's own sourceId).

**Share doors:**
- **Receipts binder dual share** — binder `wallet/ReceiptsBinderPanel.tsx` (/receipts) opens tickets; the ticket `wallet/ReceiptTicket.tsx` holds the dual share surface (R-BIND-2): Copy link first → six intents via THE `lib/shareTargets.ts` module → "Share with other apps" (OS sheet, the one channel that carries the rasterized 1200×630 PNG from `wallet/ReceiptShareCard.tsx` — WhatsApp-safe under 300KB, real figures + QR of the member's OWN introduction link passed as a prop from the ticket's one resolver site).
- **Commission register share row** — `ReferralCommissionsPanel.tsx` `ShareRow`: each commission document shares its permanent public page `https://thesyndicate.money/receipt/{txHash}?f=N`; the face rotation lives in the LINK (`?f` advances 1→2→3→4→1 per share act, stateless); shareTargets contract honored per family (url-param intents get URL-free text; whatsapp/email carry it inline — the R-CARDS rider).
- **Public receipt page** — route `/receipt/:txHash` (`App.tsx` line 251) → `components/receipt/PublicReceiptPanel.tsx` (public fetch, honest states, ticket mounted from `wallet/PublicReceiptTicket.tsx`). Per `lib/seo-route-registry.ts` (line ~329): serve.mjs serves the receipt shell for shape-valid hashes only, substituting each URL's own og:url + painted card image at serve time.

**Painted preview cards API** — `artifacts/api-server/src/routes/receiptCard.ts`: `GET /api/receipt-card/{64-hex}.png?f=1..4`, throttled, tx-keyed projection → `receiptcard/cardFacts.ts` → `receiptcard/painter.ts` (satori + resvg, embedded fonts) → PNG; fail-closed 302 to the generic `opengraph.jpg`. Faces in `receiptcard/faces.ts`: `faceSeat`, `faceMoney`, `faceStory`, `faceProof` (`FACE_COUNT = 4`), fixed dark ink (command-room near-black + gold), QR injected post-satori.

**/source and /join attribution** — `pages/SourceLinkBuilder.tsx` (public `/source`): anyone pastes a sourceId, validated read-only against the registry via `GET /api/source/validate` (`api-server/src/routes/sourceValidate.ts`); active → shareable `/join?source=<id>` link; *"Only the protocol owner can register one — nothing can be created from this page."* `pages/JoinProtocol.tsx`: reads `?source=` (format-checked) + `&via=`; `wallet/JoinCheckout.tsx`: passes sourceId into the quote and into `buy()` only when the quote confirms `sourceProvided && sourceValid` (source reverts translated: SourceAlreadyLinked, SourceNotEligible); commission is paid inside the buyer's own transaction (V3 event), then the conversion beacon fires.

=== 2. THE ADMIN AXIS — how a source is born today ===

**Surface** — `/admin/sources` (`App.tsx` line 289) → `pages/admin/sections.tsx` `AdminSourcesSection`, stacking (in order): `ProposeSourcePromotion` (lazy wallet module) · `ProposeSourceCreate` (lazy) · `AdminReferralPanel` · `AdminReferralCrud` · `SourceReviewQueue` · `AdminSourcesPanel`.

**Birth (founder-signed chain act)** — `artifacts/studio/src/wallet/ProposeSourceCreate.tsx` (Constitution §④ Form 2, "Propose, founder signs"):
1. Admin enters the member wallet (sourceWallet = payoutWallet). Screen derives `sourceId = keccak256("SYN.SOURCE.V1", wallet)` and shows it.
2. Screen fetches the served terms document (`/referral-program-terms-v1.txt` via `lib/termsDocument.ts`) and computes keccak256 over its raw bytes → `metadataHash`. No file → no create button.
3. Registry address is server-sourced from verify-links (never hardcoded); `owner()` read LIVE — the connected wallet must BE the owner, on Avalanche 43114, or no enabled button (fail-closed `signingReady` gate at line 233 — every read proven, right chain, right signer, record state known).
4. Founder signs `createSource` with the fixed SPEC §② terms: class MEMBER_INTRODUCTION (0), 500 bps ("Emerging Connector, the starting rung"), scope LIFETIME (3), no caps, repeat purchases true, `payoutWallet = sourceWallet`, metadataHash = terms hash. **Every source is born PAUSED** (contract line 165).
5. **[RE-TRUED K3.b 2026-07-22 — the manual check DIED]** The fail-closed proof between the two signatures is now a CODE GATE: the screen itself asks the live `/api/join/quote` whether it REFUSES the source while paused (`lib/joinQuoteProbe.ts`) — activation stays blocked until the refusal is proven (a probe that didn't answer BLOCKS, re-runnable). The metadataHash match remains its sibling code gate. No by-eye /join step exists anymore.
6. Founder signs the SECOND act `setSourceStatus(ACTIVE)` — the link goes live. When the session was opened from the review queue's Approve, the activation receipt AUTO-CLOSES the request and rings the member's bell (server re-verifies the source is live on the registry first — never on the client's word). K3.b also added the LIFECYCLE DOORS: pause (two-step inline, reversible) and revoke (consequence-naming dialog, permanent) on the same screen — all `setSourceStatus` proposals, founder-signed. REVOKED sources get no proposed act; sources are never deletable.

**Promotion** — `wallet/ProposeSourcePromotion.tsx`: persistent due-promotion reminder (announces the due count until every promotion is signed); the founder enters the member's wallet, the screen derives the canonical sourceId and only proceeds when it MATCHES the due row (the served snapshot is opaque — no directory); signs `updateSourceTerms` with ONLY commissionBps changed, every other term resubmitted verbatim from the live record (contract reverts on wallet drift). No gap compensation — rate applies at on-chain recording.

**Registry reads on the console** — `components/referral/AdminReferralPanel.tsx`: truth-swept (2026-07-17 — all sample KPIs dead); shows "Live · paying on-chain" + `ProtocolRealityPanel groups=["source"]` live reads. `pages/admin/panels.tsx` `AdminSourcesPanel` (line 468): source-registry + link-generation posture rows (`GET /api/source/status`, `GET /api/protocol/reality`).

**What the operator console CAN do about sources/referrers today**: propose + build both chain transactions for the founder's wallet; see live registry posture; save referral term values (`AdminReferralCrud.tsx` → `lib/operatorClient.ts` `saveReferralTerm` → `api-server/src/operator/referralTermsService.ts`: founder-gated DB write, allow-listed keys `commissionBps/capBps/attributionWindowDays/minPurchaseUsdc/programStatus`, server-side 30% hard cap = 3000 bps, every write transactional with an audit_log row); read the member ledger (`pages/admin/memberLedger.tsx`, founder-only, masked wallets, audit-logged, now with Chapter column + Open receipts); message one member per seat; broadcast.
**What it CANNOT do**: create/activate/pause/revoke a source server-side (owner-only on-chain acts — only the registry owner's signature moves anything; the console PROPOSES all four, K3.b); the program kill-switch toggle in `AdminReferralCrud` is a labelled preview ("Save never activates or pauses the program: program state is an on-chain fact"); no lookup surface for arbitrary wallets' standing; no directory. **[RE-TRUED K3.a 2026-07-22]** `SourceReviewQueue` is LIVE (real intake rows + live server preflight + founder verdicts + the audited signing-material read — prod-sealed `89057bb`; the K3.a arc proved itself end to end on Seat #3's real ask the same day).

=== 3. WHO CAN HOLD A LINK TODAY ===

**A connected-no-seat wallet gets the canonical link.** No seat check exists anywhere on the path:
- `ReferralSurface.tsx` gates only on `useSignedIn()` (`lib/useSignedIn.ts` — S4 = SIWE wallet session, NOT seat/membership; matches the access-model canon: member-account surfaces are a sign-in wall, tools open to connected-no-seat).
- `ReferralLinkHero.tsx` renders the link whenever `payingSourceId(readback?.sourceIdHex, address)` resolves — which the pure fallback `deriveSourceId(wallet)` guarantees for ANY valid connected address. Not connected → *"Connect and sign in with your wallet to derive your permanent referral link. It exists before anyone signs anything — one wallet, one link, forever."*
- Server enforcement: `api-server/src/auth/router.ts` `GET /source-standing` (line 557) requires only the session cookie; `lib/protocol/sourceStandingRead.ts` derives the canonical id for the bound account, live-reads existence/active, and D2-falls-back to any founder-signed source whose registry wallet of record is this account. A wallet with no source gets an honest zero standing + *"no on-chain referral source exists for this wallet yet — a new source is a founder-signed on-chain act"* — but the LINK itself renders regardless; only the COMMISSION requires the founder-signed createSource + activation.
- Wider still: public `/source` lets even an anonymous visitor build the join link for any EXISTING active sourceId.

=== 4. WHAT NOTIFICATIONS + ADMIN BROADCAST COULD CONTRIBUTE ===

- **Contact ONE referrer**: `POST /api/operator/notifications/member` (`operator/router.ts` line 305; `operator/notificationService.ts`) — founder_root role only, seat-number addressing (seat→wallet resolved server-side on the continuity spine; wallet never in a client request), title ≤ 120 / body ≤ 2000, raw-address refusal, icon palette + internal link whitelist, audited. Console door: `pages/admin/memberLedger.tsx` `MessageMemberDialog` ("Message this member" on every ledger row). **Constraint worth noting for the plan: addressing is BY SEAT — a connected-no-seat referrer (who legally holds a link today, per §3) has no seat number and is unreachable by this channel.**
- **Announce to all**: `POST /api/operator/notifications/broadcast` — founder_root, one audience=ALL row; console door `/admin/broadcast` → `AdminOperatorSurfaces.tsx` `BroadcastPanel` (live composer + sent history + NOTIF-2b delete). Copy: *"delivered on each member's next visit — no email or push exists"* (the no-email canon).
- **Delivery**: own-row member inbox `api-server/src/auth/memberInbox.ts` → bell + `/notifications` (two-tier seen/read, unseen badge; in-app is the ONLY trusted channel — anti-phishing stance).
- **Referral-relevant vocabulary already in place** (`lib/os-contracts/src/notifications.ts`): icons `user-plus`, `users`, `handshake`, `trophy`, `award`, `receipt`, `megaphone` (gain-promise glyphs permanently banned); link whitelist INCLUDES `/referral` ("Referral program (public explainer)"), `/source` ("Build your referral link"), and `/member#referral-dashboard` ("Referral dashboard — your introductions & ladder") — note that last one is a pre-tabs fossil path: the dashboard now lives at `/referral`, so a deep link to the member dashboard would ride the old anchor. A v2 category taxonomy already reserves `"commission"`, `"recognition"`, `"network"` (`NOTIFICATION_CATEGORIES`) for the future protocol-event auto-generator — nothing generates automatically today; every send is a founder act. So today the machinery can already: announce a program change to all members, congratulate/nudge a specific seated referrer with a whitelisted deep link toward their referral surfaces — and nothing more (no automation, no email, no per-event triggers, no non-seat reach).

---

# REFERRER-KIT BENCHMARK — how world-class crypto/protocol products equip referrers

## PART 1 — PER-PRODUCT INVENTORY

### 1. Binance (CEX gold standard, referral center)
- **Assets handed to the referrer:** unique referral code + link + auto-generated QR code; on mobile Futures, a Share icon produces a ready-made IMAGE with embedded QR that friends scan to sign up; official banner templates ("Create your own Binance Referral banners using these templates"); separate referral offers hub with per-campaign links.
- **Share flow:** Profile > Referral > "Invite Now" > Copy Referral Link (one click). Mobile: Futures > Share icon > receive QR-poster image > native share sheet. Referrer can also set the commission SPLIT (kickback: give part of your rebate to the invitee) at link-creation time.
- **What makes it effortless:** the poster is GENERATED, not designed — one tap yields a finished shareable image with code baked in; a "Your Referral Stats" panel shows earnings + friends' volume so the referrer never wonders whether it worked.
- URLs: https://www.binance.com/en/activity/referral · https://www.binance.com/en/support/faq/how-to-use-the-binance-futures-referral-program-12af5d15dcc34aa9bf281dbffa8b7b04

### 2. Bybit (affiliate portal + Trade Summary Card)
- **Assets:** affiliate portal "Resources" page with banners in multiple sizes, landing-page links, videos, email templates, localized content packs, seasonal campaign kits; consumer side: "Invite Now" generates link or QR; a "Trade Summary Card" generator (templates/overlays/backgrounds) that doubles as a share asset.
- **Share flow:** dashboard > copy tracking link, or app > Invite Now > link/QR > share sheet. Dashboard shows real-time clicks, signups, commissions, conversion rates; dedicated account manager at higher tiers.
- **Effortless because:** the referrer never makes an asset from scratch — every format (web banner, social image, email) is pre-built and pre-tagged with their link.
- URLs: https://www.bybit.com/en/help-center/article/Bybit-Affiliate-Program-General-FAQ · https://www.bybit.com/en/help-center/article/How-to-Generate-your-Trade-Summary-Card

### 3. OKX (CEX + Web3/DEX referral dashboard — the most protocol-native CEX)
- **Assets:** customizable alphanumeric codes (up to 100 per wallet), downloadable QR-code poster for social sharing, deep-link composability — append `?ref=CODE` to ANY supported OKX Web3 URL so any page becomes a referral surface.
- **Share flow:** Referral dashboard > copy default code/link from the top area, or Codes tab > per-code link with editable parameters. Rewards rebated automatically on-chain to the referrer's wallet; dashboard shows per-transaction commission detail, per-invitee contribution, and links every line to the block explorer.
- **Effortless because:** deep-link-everything + hourly/automatic on-chain settlement + explorer-verifiable earnings (provability as a feature).
- URLs: https://web3.okx.com/referral · https://web3.okx.com/help/whats-dex-referral-program

### 4. KuCoin / Gate (affiliate kits)
- **Assets:** KuCoin — dashboard-generated tracking links, banners, text links, email templates, video materials. Gate — multi-product commission surface (spot/futures/Web3) with standard kit. Nothing distinctive beyond the Bybit pattern.
- URLs: https://www.kucoin.com/affiliate

### 5. Coinbase (the consumer-UX benchmark)
- **Assets:** just a link — but the PANEL is the craft: an inline, dismissible invite panel at the top of the dashboard; email-invite field with disabled-until-valid button; Share button opening exactly three color-coded social options; one-click Copy with confirmation feedback.
- **Effortless because:** it meets the user where they already are, gives explicit state feedback at every step, and is non-coercive (dismissible). Two-sided reward, plainly stated.
- URLs: https://goodux.appcues.com/blog/coinbase-user-invite-reward · https://help.coinbase.com/en/coinbase/other-topics/coinbase-one/referral-program

### 6. Kraken (the sober compliant benchmark)
- **Assets:** invite link + code in account settings; both sides earn a bounded, plainly-worded reward; strict caps stated upfront (up to $1,500 total) — no infinite-earnings framing.
- URLs: https://www.kraken.com/referrals · https://support.kraken.com/articles/kraken-app-referral-program

### 7. GMX (the protocol-native pattern — closest to our chain-truth doctrine)
- **Assets:** referral code registered ON-CHAIN (a transaction creates it); link format `https://app.gmx.io/#/trade/?ref=code`; no posters/banners at all.
- **Share flow:** paste link anywhere > trader clicks > code stored in browser > written to the CONTRACT on their first trade > discount applies automatically, rebate accrues automatically; "Claimable rebates" card on the same page; weekly ETH distribution; public stats page (stats.gmx.io/referrals) — anyone can audit any code's volume.
- **Effortless because:** zero ongoing work — the contract does the attribution, the discount is automatic for the invitee (both sides win, honestly), earnings are provable on-chain.
- URL: https://docs.gmx.io/docs/referrals/

### 8. dYdX (on-chain settlement as the headline)
- **Assets:** "Invite Friends" button > unique affiliate link; dashboard with real-time referral/earnings tracking.
- **Mechanics:** commissions in USDC settled ON-CHAIN instantly, every block, by the protocol itself — transparency is the selling point; anti-abuse gate ($10k lifetime volume before a link is issued).
- URLs: https://www.dydx.xyz/affiliate-program · https://help.dydx.trade/en/articles/240523-how-to-get-started-with-the-affiliate-program

### 9. Galxe / Layer3 (quest-style share moments)
- **Pattern:** completion of a verifiable act mints a credential (Galxe OAT, Layer3 CUBE — ERC-721); the claim screen offers a share moment; the shared object is PROOF of something done, not a promise of gains. "Celebrating brand advocacy" via a permanent on-chain record.
- URLs: https://help.galxe.com/en/articles/9645630-create-quest-rewards · https://app.layer3.xyz/blog/collect-cubes-claim-rewards

### 10. friend.tech (viral mechanics — study, mostly reject)
- **Pattern:** invite-only with 3 single-use codes per user > scarcity-driven virality; codes traded/shared publicly on X/Reddit; identity bound to X account; bonding-curve key prices.
- **Lesson:** scarcity of invites converted every holder into a promoter — but the engine was speculation on people.
- URL: https://privy.io/blog/friendtech-case-study

### 11. Uniswap
- No interface referral program exists (Labs charges no interface fee as of late 2025); nothing to harvest. https://support.uniswap.org/hc/en-us/articles/20131678274957-What-are-Uniswap-Labs-fees

---

## PART 2 — ADVERSARIAL FILTER: ADOPT / REJECT LEDGER

### ADOPT (the craft)

| # | Craft | Seen at | What to build |
|---|---|---|---|
| A1 | **One-tap generated poster with QR + code baked in** — the referrer never opens a design tool | Binance Futures share image; OKX QR poster; Bybit summary card | Server-painted share card (we already have the satori painter) with the member's code, QR to their link, both themes |
| A2 | **One-click copy with confirmation + native share sheet** — link, code, and image each one action | Coinbase panel; Binance "Invite Now"; Kraken settings | Copy-link / copy-code / download-image / share-sheet row, state feedback on every button |
| A3 | **Multi-format self-serve kit** — banners in standard sizes, text snippets, all pre-tagged with the member's link | Bybit/KuCoin Resources page | Small downloadable kit page: 2-3 banner sizes + ready copy lines, each embedding the member's link |
| A4 | **Deep-link composability** — `?ref=CODE` on any page, so every surface can carry attribution | OKX Web3; GMX link format | Ref parameter honored site-wide, not only on one landing page |
| A5 | **On-chain attribution + provable earnings** — code in the contract, dashboard lines linking to the explorer | GMX (code written to contract, public stats); dYdX (USDC settled every block); OKX (explorer links per line) | Our strongest lane: receipts-grade referral ledger, every credit verifiable on-chain — nobody else's kit is MORE provable than ours can be |
| A6 | **Both-sides-win, stated plainly** — invitee gets a real, honest benefit, not just the referrer | GMX trader discount; Coinbase/Kraken two-sided bonus | The invitee's benefit named in one plain sentence on the share card itself |
| A7 | **Referrer dashboard: did it work?** — signups, per-invitee contribution, earnings, real time | Bybit, OKX, Binance stats, dYdX | A simple "your invitations" view: clicked / joined / credited, nothing more |
| A8 | **Share the PROOF, not the promise** — the shared object is a credential of something done | Galxe OAT / Layer3 CUBE claim moments | Share cards built on receipts/recognition (a sealed act), never on projected gains |
| A9 | **Dismissible inline invite panel with state feedback** | Coinbase | The kit lives where the member already works; closable; never a popup ambush |
| A10 | **Anti-abuse gates named openly** | dYdX volume gate; GMX tier rules vs self-referral | State plainly who qualifies and why — trust through disclosure |

### REJECT (the dark patterns — named, with where they live)

| # | Dark pattern | Seen at | Why rejected here |
|---|---|---|---|
| R1 | **Gain-promise imagery** — rockets, green candles, "$100 bonus!!" hero numbers on share posters | Binance/Bybit/OKX referral-code SEO pages and much of the banner inventory | Anti-financialization canon: no gain-promise glyphs; our cards carry function symbols and proof, never projected money |
| R2 | **APY / earnings flexing on the shared asset** — "earn up to 50%", "up to $1,500", PnL-bragging screenshot culture (fake PnL generators exist as a whole industry around these cards) | Bybit commission headlines; PnL-card ecosystem | The share card must never be a brag about money made; the PnL-mockup-generator industry proves that pattern breeds fabrication |
| R3 | **Countdown / invented urgency** — "offer ends", limited-time deposit windows ("complete within 15 days") | Kraken bonus terms; seasonal CEX campaigns | No manufactured deadlines on an invitation between friends |
| R4 | **Downline / MLM framing** — multi-level trees, "build your network", sub-affiliate percentage stacks | Parts of CEX affiliate tiering as marketed by third-party "affiliate monkey" sites | One level, one human inviting another; never a recruitment pyramid |
| R5 | **Scarcity-coded invites as hype fuel** — 3 codes, FOMO hunts on X | friend.tech | Scarcity theater manufactures pressure; membership is a considered act, not a drop |
| R6 | **Speculation on people / bonding-curve identity** | friend.tech keys | Directly opposed to our anti-financialization doctrine |
| R7 | **Commission-split-as-bait complexity** — referrer chooses how much "kickback" to dangle | Binance kickback selector; OKX per-code discount tuning | Turns the referrer into a discount negotiator; our split, if any, is fixed and honest |
| R8 | **Volume-gated tier ladders as status treadmill** — weekly volume quotas to keep a tier | GMX Tier 2/3 quotas, OKX Level 1-6 | Pressure to generate trading volume is the exact behavior we refuse to incentivize |
| R9 | **Bounty-bait SEO sprawl** — armies of third-party "referral code" pages spamming codes for the bonus | nftevening/coinwire/rushradar pages for every exchange | A design consequence: cash sign-up bounties breed a parasite ecosystem; recognition-based rewards don't |

### SYNTHESIS LINE (for the founder's inventory)
The winning kit = GMX's on-chain attribution and provability + Binance/OKX's one-tap QR poster generation + Coinbase's calm one-click share panel + Galxe/Layer3's share-the-proof card grammar — with every reward surface speaking recognition and receipts, never projected money.

Sources: [Binance referral](https://www.binance.com/en/activity/referral) · [Binance Futures referral FAQ](https://www.binance.com/en/support/faq/how-to-use-the-binance-futures-referral-program-12af5d15dcc34aa9bf281dbffa8b7b04) · [Bybit affiliate FAQ](https://www.bybit.com/en/help-center/article/Bybit-Affiliate-Program-General-FAQ) · [Bybit trade summary card](https://www.bybit.com/en/help-center/article/How-to-Generate-your-Trade-Summary-Card) · [OKX DEX referral](https://web3.okx.com/help/whats-dex-referral-program) · [OKX Web3 referral dashboard](https://web3.okx.com/referral) · [KuCoin affiliate](https://www.kucoin.com/affiliate) · [Coinbase invite panel UX](https://goodux.appcues.com/blog/coinbase-user-invite-reward) · [Kraken referrals](https://www.kraken.com/referrals) · [GMX referrals docs](https://docs.gmx.io/docs/referrals/) · [dYdX affiliate program](https://www.dydx.xyz/affiliate-program) · [dYdX getting started](https://help.dydx.trade/en/articles/240523-how-to-get-started-with-the-affiliate-program) · [Galxe quest rewards](https://help.galxe.com/en/articles/9645630-create-quest-rewards) · [Layer3 CUBEs](https://app.layer3.xyz/blog/collect-cubes-claim-rewards) · [friend.tech case study](https://privy.io/blog/friendtech-case-study) · [Uniswap fees](https://support.uniswap.org/hc/en-us/articles/20131678274957-What-are-Uniswap-Labs-fees)

---

Research complete. Ledger below.

# REFERRER / ADVOCATE KIT — AAA MAINSTREAM BENCHMARK (2026-07-20)

## A. Per-product findings

**1. Wise — standard invite program** (https://wise.com/gb/about/referral · https://wise.com/help/articles/1uFefNcZjE1ri1wNPczJdo/how-do-i-invite-friends)
- Kit: a single unique invite link from a dedicated invite page (`wise.com/invite/#/`); no banner pack — the LINK is the whole kit. Invitee gets a sign-up gift (free transfer / card); referrer paid per batch: "every 3 friends who qualify" (~£75 when 3 invitees each move ≥£200).
- Personalization: unique per-user link; qualification threshold shown on the referrer's own invite page (per-user program variants: standard / fee-credit / free-transfer / partnership / influencer — tiered ladder of programs, not one flat program).
- Management side: Wise assigns users to program variants by region/profile; an invite-only Influencer tier sits above the consumer one.
- Recognition: batch counter ("3 friends" progress); reward expires if unclaimed within a year.

**2. Revolut** (https://help.revolut.com/en-US/help/referrals/more-help-with-referrals/referrals-new/missed-steps/requirements-to-get-the-referral-reward/ · https://viral-loops.com/revolut-referral-marketing-case-study)
- Kit: in-app Refer a Friend generates a pre-drafted, editable invite message with the unique link; share to social/email/text.
- Invitee landing: "You were invited to Revolut" — invited-to-a-club framing, social proof (15M+ users), signup starts with phone number only.
- Management side: per-campaign caps (rewards for max ~5 invitees per campaign), personalized offer amounts per user (admin dials reward per segment/period), qualifying-action gates (KYC + top-up + card + real purchases; gambling/gift cards excluded) as anti-abuse.
- Reject note: Revolut historically ran countdown/limited-time reward boosts — fake-urgency territory.

**3. Morning Brew — the classic milestone kit** (https://referralrock.com/blog/morning-brew-referral-program/ · https://growsurf.com/blog/how-morning-brew-grew-its-subscribers/)
- Kit: personal Referral Hub page with (a) visual reward tracker showing earned/unearned tiers + count-to-next-milestone, (b) one-click copy of the unique link, (c) share buttons + email form, (d) pre-filled editable message, (e) network view of invited/pending people.
- Milestones: stickers (1) → tote/notebook (2-3) → mystery box (3) → t-shirt (5) → joggers/crewneck → hoodie (~25) → VIP access (~100) → full WFH setup (1,000). Physical, identity-flex merch, never cash.
- Embedded distribution: "Share the Brew" block in every newsletter, position rotated; behavioral nudge emails (1-away-from-reward, inactivity).
- Fraud/admin: double opt-in verification (2019) to kill fake referrals; rewards curated/rotated by the team over the years; CAC ~$0.25 vs $4-5 paid.
- Reject note: used CloudSponge contact-importer for recipient lists (https://www.cloudsponge.com/customers/morning-brew/) — spam-your-address-book class.

**4. Dropbox** (https://help.dropbox.com/storage-space/earn-space-referring-friends · https://help.dropbox.com/storage-space/how-much-free-space)
- Kit: copy invite link + in-product email invites. Reward is product currency (storage), two-sided: 500 MB/referral capped 16 GB (Basic), 1 GB capped 32 GB (paid plans); invitee gets 500 MB.
- Qualification = real activation (install desktop app + sign in + verify email), not mere signup.
- Reject note: mobile contact-picker invite flow (Android) — contact-mining class.

**5. Notion affiliates** (https://www.notion.com/affiliates)
- Kit: Resource Center with banners, logos, swipe copy, guides, demo videos, translated assets (6+ languages); multiple personalized tracking links per affiliate via PartnerStack.
- Money: up to $50/activated signup + 20% of year-one revenue; 180-day window, last-click.
- Management side: application + review (accepted archetypes listed; program currently CLOSED to new applicants — curation by capacity), FTC disclosure required, self-referral banned, clawbacks on refunds within 2 months.

**6. Figma** (https://market.partnerstack.com/page/figma)
- PartnerStack-run: $3–$54 per qualifying signup/upgrade; assets + tracking live in the partner dashboard, not scattered.

**7. Stripe Partner Ecosystem** (https://docs.stripe.com/partners · https://stripe.com/partners/become-a-partner)
- Kit: messaging frameworks, templated blogs/emails/social content partners customize; downloadable Partner and Premier Partner BADGES from the partner portal (tiered identity artifacts); MDF co-marketing funds for Premier tier; verified-partner level with its own badge + directory listing boost.
- The badge model: the company issues a verifiable identity asset the partner is proud to display — recognition as the artifact.

**8. Framer** (https://www.framer.com/help/articles/how-affiliate-links-work/)
- Kit: permanent short links managed in a Links tab (Dub-powered): custom slugs per campaign, live stats (clicks, signups, subscriptions, earnings); 50% recurring 12 months; payouts via Stripe.
- Management side: three curated entry doors — manual approval, published Community product, or Framer Expert status; paid-ads-on-affiliate-links banned.

**9. Webflow** (https://help.webflow.com/hc/en-us/articles/33961372613011-Webflow-s-affiliate-program-overview · https://webflow.com/solutions/affiliates)
- 50% rev-share 12 months, Pro tier +10% on renewals (performance ladder); PartnerStack dashboard hosts links, stats, and promotional assets; human application review (1–2 weeks); affiliate vs partner program cleanly separated by audience type.

**10. Airbnb host referrals + Superhost Ambassadors** (https://www.airbnb.com/help/article/3405 · https://airbnb.com/help/article/2700/how-does-the-ambassador-programme-work)
- Kit: /refer dashboard with unique link + per-referral STATUS PIPELINE (started listing → published → verified → first booking) — the referrer watches each invitee progress.
- Personalization: Ambassador links land the invitee on a page customized with the ambassador's NAME AND PROFILE PICTURE.
- Two-tier curation: anyone can refer (cap 25); curated Superhost Ambassadors get mentoring tools, exclusive resources, and a 2,000-referral cap — earned status unlocks a bigger kit.
- Anti-abuse: qualifying booking minimums ($100/$50), 180-day window, prior-hosts ineligible.

## B. ADOPT LEDGER (craft to take)

| # | Pattern | Best exemplar | Concrete detail |
|---|---------|---------------|-----------------|
| A1 | One personal link is the kit's spine; everything else decorates it | Wise, Framer | Unique permanent link; Framer adds custom slugs per campaign + per-link stats (clicks→signups→conversions) |
| A2 | Personalized invitee landing — referrer's name/face baked into the artifact | Airbnb Ambassadors | Invitee lands on a page with the ambassador's name + profile picture; Revolut's "You were invited" framing |
| A3 | Milestone ladder with physical/identity rewards, progress-to-next visible | Morning Brew | Tracker shows earned/unearned tiers + exact count to next; merch as identity flex, never cash-flex |
| A4 | Pre-written, EDITABLE share copy — effortless copy-paste, user keeps voice | Revolut, Morning Brew | Draft message pre-filled with link, user may customize before sending |
| A5 | Referral status pipeline the referrer can watch | Airbnb | Per-invitee stages: started → published → verified → first booking |
| A6 | Curated asset center: banners, logos, swipe copy, templates, translated packs, in ONE dashboard | Notion, Stripe, Webflow | Notion Resource Center; Stripe messaging frameworks + templated blog/email/social; PartnerStack-hosted pre-approved assets |
| A7 | Tiered badges as company-issued recognition artifacts | Stripe | Partner / Premier / Verified badges downloaded from the portal; directory listing boost |
| A8 | Earned-status tiers unlock bigger kits | Airbnb, Webflow, Wise | Ambassador (25→2,000 cap + tools); Webflow Pro (+10%); Wise influencer tier |
| A9 | Qualification = real activation, not signup | Dropbox, Wise, Airbnb | Desktop install + verified email; ≥£200 moved; ≥$100 completed booking |
| A10 | Admin curation gates: application review, capacity-closed enrollment, clawbacks, self-referral ban, disclosure rules | Notion, Framer | Human review; program closes when full; refund clawbacks; three curated entry doors |
| A11 | Reward in product currency, two-sided | Dropbox | Both sides get storage; invitee always gets a gift even if referrer's batch isn't complete (Wise) |
| A12 | Distribution embedded in the product's own rhythm + behavior-triggered nudges | Morning Brew | Share block in every issue, rotated; "1-away-from-reward" nudge |
| A13 | Fraud wall as invariant | Morning Brew, Revolut | Double opt-in; excluded transaction classes; per-campaign caps |

## C. REJECT LEDGER (dark patterns filtered out)

| # | Pattern | Seen at | Why rejected |
|---|---------|---------|--------------|
| R1 | Contact-book import / address-book blast | Morning Brew (CloudSponge), Dropbox Android contact picker | Spam-your-contacts; harvests third-party PII the contact never consented to |
| R2 | Countdown / limited-time reward boosts | Revolut campaigns | Fake scarcity pressure on a relationship act |
| R3 | Cash-flex sharing ("I earned $X — you can too") | Referral-code aggregator ecosystem (refer.codes, invitation.codes) | Gain-promise framing; breeds mercenary link-farming, not advocacy |
| R4 | Uncapped cash-per-head bounties | generic affiliate mills | Incentivizes spam volume; every AAA program caps (Airbnb 25, Revolut 5/campaign) or batches (Wise groups of 3) |
| R5 | Reward on raw signup with no activation gate | low-grade programs | Fraud magnet; all AAA programs gate on a real completed action |
| R6 | Paid ads / brand-keyword bidding on referral links | banned by Framer & Notion explicitly | Turns advocates into arbitrageurs; adopt the ban itself |
| R7 | Silent reward expiry buried in terms | Wise (1-year claim expiry) | Take the ladder, not the expiring-reward gotcha — or surface expiry loudly if ever used |
| R8 | Uneditable forced share copy | — | Copy must be pre-written but editable (A4); forced wording reads as astroturf |

## D. Synthesis for our build (one line each)
- The kit = personal link + personalized landing artifact (name/face) + pre-filled editable copy + print-ready QR — Airbnb's personalization fused with Framer's link management.
- Recognition = Morning Brew's visible milestone ladder + Stripe's issued-badge model — for us, on-chain-provable recognition artifacts beat both.
- Management = Notion/Webflow model: application review, one curated asset center of admin-approved assets, activation-gated qualification, caps + clawbacks, earned tiers unlocking bigger kits.

Sources: [Wise referral](https://wise.com/gb/about/referral) · [Wise invite help](https://wise.com/help/articles/1uFefNcZjE1ri1wNPczJdo/how-do-i-invite-friends) · [Revolut requirements](https://help.revolut.com/en-US/help/referrals/more-help-with-referrals/referrals-new/missed-steps/requirements-to-get-the-referral-reward/) · [Revolut case study](https://viral-loops.com/revolut-referral-marketing-case-study) · [Morning Brew breakdown](https://referralrock.com/blog/morning-brew-referral-program/) · [Morning Brew growth](https://growsurf.com/blog/how-morning-brew-grew-its-subscribers/) · [CloudSponge/Morning Brew](https://www.cloudsponge.com/customers/morning-brew/) · [Dropbox referrals](https://help.dropbox.com/storage-space/earn-space-referring-friends) · [Dropbox caps](https://help.dropbox.com/storage-space/how-much-free-space) · [Notion affiliates](https://www.notion.com/affiliates) · [Figma on PartnerStack](https://market.partnerstack.com/page/figma) · [Stripe partners](https://docs.stripe.com/partners) · [Become a Stripe partner](https://stripe.com/partners/become-a-partner) · [Framer affiliate links](https://www.framer.com/help/articles/how-affiliate-links-work/) · [Webflow affiliate overview](https://help.webflow.com/hc/en-us/articles/33961372613011-Webflow-s-affiliate-program-overview) · [Webflow affiliates](https://webflow.com/solutions/affiliates) · [Airbnb host referrals](https://www.airbnb.com/help/article/3405) · [Airbnb Ambassadors](https://airbnb.com/help/article/2700/how-does-the-ambassador-programme-work) · [Airbnb referral terms](https://www.airbnb.com/help/article/3857)

---

## THE COMPLETENESS CRITIC (gaps the five lenses missed)

**(a) Capability classes NO report covered**

1. Print/offline modality — printable QR poster, flyer, table card. All three benchmark "poster" items are digital-only; nobody ran print.
2. Vertical/story formats — painted cards are 1200×630 only; 1080×1920 (WhatsApp status, IG/TikTok stories) and square variants appear in no report.
3. Email-signature banner + embeddable web badge for a referrer's own site/blog — zero coverage.
4. Video/motion assets — named only as list items (Bybit/KuCoin "videos"), never analyzed or mapped to us.
5. Localized copy packs — Notion's translated assets noted but never mapped; the kit's language(s) (FR/EN) undecided, uninventoried.
6. Crypto-native distribution rails — Farcaster frames/mini-apps, Lens, wallet in-app share sheets; absent from the crypto benchmark despite being 2026's native share modality.
7. The INVITEE's side of the shared link — what /join?source= unfurls as (per-source OG) and whether the landing shows "introduced by" (origin's ReferralAttributionNote harvest is unmapped to today's JoinProtocol). The kit's single most-shared URL has no inventory of its receiving end.
8. Referrer education — a "how to promote" playbook and the approved/banned-language lists handed TO the referrer (origin press kit served them; no live surface does).
9. The AFFILIATE/BD_NETWORK class kit end-to-end (agreement, terms doc, admin flow, payout) — benchmarks covered affiliate portals, but nobody inventoried OUR non-member class, which overlaps the founder's "connected-no-seat promoter" order.

**(b) Contradictions between reports**

10. Mainstream A2 (invitee landing with referrer's name + photo) vs ADR-003 settled law: name/alias/email is the red line; "alias is never an identity." Canon-illegal as written.
11. Mainstream A3/A12 (count-to-next-milestone tracker, "1-away-from-reward" nudge, Wise batch-of-3 counter) vs the engraved reject list: "recruit N more", "1 invite away", countdowns are named banned patterns.
12. Mainstream A4/R8 (pre-written but EDITABLE copy; forced copy = astroturf) vs engraved fixed-copy doctrine ("share copy is fixed and verifiable-facts-only" + the R-CARDS text/url contract). Needs a ruling.
13. Crypto A6 / mainstream A11 (both-sides-win, invitee benefit) vs the red line "a rung may NEVER unlock un meilleur PRIX sur le SYN" and no-selling-on-receipts. Invitee-side benefit is undecided canon; adopt items presume it.
14. OKX 100-codes/custom-slugs and Framer per-campaign slugs vs "one wallet, one link, forever", sourceId-never-an-alias, "NE JAMAIS un sourceId PAR CANAL." Only the `&via=` layer is legal; code customization is not.
15. Crypto A4 (ref param honored site-wide) + origin's first-touch localStorage ReferralCapture vs the engraved single `join?source=` construction site and composer verdicts rejecting localStorage/per-visitor tags. Mirror-rule risk: harvest must not carry this back.
16. The engraved M2 shape ("client-generated canvas; server-rendered OG images = v2 — real infra") is a fossil: the server painter (satori, live 2026-07-20) IS that infra. Presenting M2 as client-canvas contradicts today's reality and the DONE-IS-DONE spirit.
17. Origin ambition (5-tier ladder w/ leaderboard, Builder Score; Supa quests/XP/badges/referral leaderboard hub) vs engraved anti-MLM rejects (leaderboards, recruit-more) and the two-layer gamification canon. The gate must brand these quarry-not-law explicitly.

**(c) Admin-axis gaps nobody inventoried**

18. ✅ CLOSED (K3.a 2026-07-22, prod-sealed: the intake door lives on /referral; the queue has its feed). ORIGINAL: No intake door: no surface where a member (or no-seat promoter) REQUESTS source activation — the Q42 review queue has no feed. "Confirmation without manual friction" starts with a request mechanism no report proposes.
19. ✅ ADDRESSED (K3.b 2026-07-22: the manual /join check DIED — the quote-refusal is a server-verified CODE gate). ORIGINAL: No friction map of today's actual flow (wallet obtained out-of-band → two founder signatures → MANUAL /join PAUSED check) — and no proposal to automate that fail-closed preflight server-side.
20. ✅ CLOSED (K3.b 2026-07-22, prod-sealed: pause/revoke doors + the stacked signing session). ORIGINAL: Lifecycle doors missing: console proposes create/activate/promotion only — no propose-pause/propose-revoke door, no batch/multi-source signing session.
21. ◐ 2 OF 3 CLOSED (K3.c 2026-07-22, prod-sealed: the per-source performance table + the screen-exact CSV live on /admin/sources · Performance). REMAINS OPEN: the arbitrary-wallet standing lookup. ORIGINAL: No admin referrer intelligence: arbitrary-wallet standing lookup, per-source performance table, aggregate commission export for accounting/legal — all absent, unproposed.
22. Kit-asset governance: where admin-approved banners/copy live, versioning/retirement (the admin half of Notion's resource center) — plus terms-doc versioning (metadataHash pins terms v1; the re-hash/updateSourceTerms process when terms change is uninventoried).
23. Reaching no-seat referrers: notification addressing is seat-only; no mechanism exists or was proposed for the promoter class the founder just ordered into the picture.

**(d) Verify before the founder sees**

24. Every mainstream reward figure/cap traces to third-party marketing blogs (referralrock, viral-loops, growsurf, appcues) — Wise £75/3, Airbnb 25/2,000 caps, Notion "closed", Webflow +10% — re-verify against official pages with dates.
25. Contract truth for a no-SYN referrer at pay time: skip vs escrow ("can never be lost" §7 vs "commissions to zero, source stays ACTIVE") — and whether createSource for a no-seat wallet is contract-legal. Read the .sol before scoping the no-seat picture.
26. "Summit 12% (300 = MAX_MEMBER_INTRO_BPS)" conflates a member-count threshold with a bps constant (12% = 1200 bps) — check the policy doc and the contract constant.
27. Code-check the reality report's flagged micro-claims: the `/member#referral-dashboard` whitelist fossil (fix before any kit deep link ships), ReferralLinkHero copy omitting the SYN-holding condition (engraved "À DIRE"), absence of any "introduced by" display on /join, and which registry address is live (origin's SourceRegistryV1 mainnet record ≠ today's server-sourced registry — never conflate in the gate).