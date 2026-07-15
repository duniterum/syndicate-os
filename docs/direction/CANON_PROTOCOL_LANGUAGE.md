# CANON — THE PROTOCOL LANGUAGE CONSTITUTION (TIER-0)

**Founder-decided 2026-07-14 · Binding on every agent, every surface, every session.**
INVARIANTS ONLY (per `CANON_INVARIANT_VS_STATE.md`): this document states rules about
*how the protocol speaks*, never what exists today — so it never rots. No figures, no
addresses, no state lines. The guards (`guard-forbidden-copy.ts`, `guard-surface-naming`,
the safe-source-terminology guard) are this document's **enforcement arm**: the doc is
the source of authority, the guards hold surfaces to it. Where a guard's literals
diverge from this doc, the divergence is FLAGGED in place (§5) — fixes ride their own
future slices per `CANON_LOI_ANTIBLOCAGE.md`, never this doc.

**Application rule (founder-decided):** this constitution BINDS all *new* writing from
its commit forward. The APPLICATION pass over existing surfaces — especially the
CONVERSION register (§7) — deliberately rides the M1/M2/M3 slices (hero · sharebility ·
collectible). No copy rewrite happens in this slice.

Origin lineage: the vocabulary-contract pattern (APPROVED_CONCEPTS / FORBIDDEN_LANGUAGE
/ one validator) is harvested from the origin's `TheSyndicate/src/lib/protocol-language.ts`
— adapted, never copied raw. Its approved concepts are carried in §3 and §8.

---

## §1 — THE IDENTITY PARAGRAPH

The single paragraph. Every surface that must say *what The Syndicate is* says this —
adapted in length, never in substance. (AMENDED by the founder 2026-07-14, W2: the
original carried the dead read-only-era claim — the protocol has been LIVE PRODUCTION
since seat #13 was bought with real money — and predated the Human-First Law (§3-bis).
The prior wording survives only in git history; no surface may quote it.)

> **The Syndicate is a members club that lives on-chain — on Avalanche — and it is
> open today.** You join by taking a seat: you buy SYN, the club's token, and your
> seat is written to the chain — permanent, numbered, impossible to fake. A seat is a
> membership, not an investment. Bring someone in, and your share is paid automatically
> inside their own transaction, the moment they join. Every figure on this site is read
> live from the chain. If something can't be read, we say so — we never invent a
> figure. And you never take our word for anything: every claim carries a verify link.

---

## §2 — THE SIX-BEAT PAGE SEQUENCE (founder-decided)

Every public page answers six questions, in this order. This is the review grid for
every future page — a page that cannot answer a beat says so honestly rather than
skipping it.

1. **What this is** — the object of the page, in the identity voice (§1 adapted).
2. **What is live** — the figures and capabilities that are real now, each labelled.
3. **What is pending** — what is honestly not built/served yet, named with its reason.
4. **What proof exists** — the verify paths: chain reads, receipts, explorer links.
5. **What you can do now** — the real actions available from this page today.
6. **What we will never promise** — the standing refusals (no yield, no fake-live,
   no invented figures) as they apply to this page's subject.

---

## §3 — THE VOICE

**One personality: a calm operator in a control tower.** Premium, precise, unhurried.
It never begs, never shouts, never manufactures urgency, never hypes. It states,
labels, and proves. Confidence comes from verifiability, not adjectives.

- One personality, **three declared registers** (§7) — tone varies by surface, the
  personality never does.
- **The Guide exception stands** (per `GUIDE_SUPPORT_ASSISTANT_DOCTRINE.md`): the
  support assistant keeps its granted warmth — it is a help surface, never a truth
  surface, and never speaks a figure the spine did not serve.
- The approved concept vocabulary (origin harvest, carried forward): **Enter · Take
  your seat · Rise · Seal · Verify · Leave a trace · Be remembered · Protocol memory ·
  Public record · Recognition.** These are the verbs and nouns of belonging; surfaces
  reach for these before inventing new ones.

---

## §3-bis — THE HUMAN-FIRST LAW (founder, 2026-07-14 — this AMENDED form supersedes every draft)

> THE HUMAN-FIRST LAW (founder, 2026-07-14). The Syndicate speaks to BOTH audiences at
> once: the crypto-native and the newcomer. Every user-facing text must be
> understandable on first read by a person with zero crypto background — but never by
> dumbing down: standard crypto vocabulary natives expect (on-chain, wallet,
> transaction, mint, burn, verify) stays natural where context carries it. What the law
> kills is INTERNAL jargon — our machinery words (Holder Index, freeze root,
> self-readback, fail-closed, read-model) — never user-facing unless a verifier
> genuinely needs them, and then only AFTER the human words, in parentheses or a
> following clause. Test: a newcomer understands the sentence; a native doesn't feel
> talked down to. Both must be true, always.

(Founder-authored verbatim. Binds every register in §7 — PROOF included: institutional
never means internal-jargon-first. The §1 identity paragraph is written under this law.)

**Standing note (founder, 2026-07-14): `/learning` is THE one education page.** Never
create a `/learn` route or any parallel education surface; Learn & Earn (Phase 5) lands
as a layer ON `/learning` per `SEASONS_ENGINE_ON_SYNDICATE_OS.md` §7.5.

---

## §4 — WORD ROLES (all founder-settled — captured here, never re-decided)

| Role | The rule |
|---|---|
| **"Referral"** | The PUBLIC word — everywhere a user reads. Program page, links, labels, body copy. |
| **"Source"** | The PROTOCOL word — proof, registry, operator, and contract contexts only ("powered by Source Attribution"). |
| **Buyer-side money label** | **"Paid to referrer"** (rendered today as "Paid to your referrer" on the checkout line and "Paid to referrer instantly" in the program proof strip). NEVER "commission" as the buyer-facing label. |
| **"Commission"** | The referrer's OWN surfaces (their dashboard, their terms, their receipts) — it is their pay, named plainly there. |
| **The money-flow formula** | Everywhere the flow is explained, it is this and only this: **Gross purchase → referrer/source payment, if eligible → net protocol contribution → 70/20/10.** |
| **The doctrinal sentence** | Verbatim, never rephrased (lives in `sourceAttributionTerminology.ts` and the published terms doc): **"The referrer is not paid from Syndicate revenue after the fact. The referrer is paid from the purchase transaction before the net protocol contribution is routed."** |
| **Human words first** | Public copy speaks human words, with the contract term in parentheses where a verifier needs it — e.g. "referral records (the protocol calls them sources)". |
| **"acquisitionCost"** | A BYTECODE word only. It tells a false story (that the protocol collects then reimburses); the edge translation (`checkoutVocabulary.ts`) renames it ONCE (→ source payment) and no UI ever surfaces it. Same rule for "protocolContribution" (→ net). The English term "acquisition cost" is RESERVED for its true business meaning — future real customer-acquisition marketing costs (ads, CPA reporting) — never the referrer payment. When a marketing-costs surface exists one day, THAT is where the term lives. (Source: the 2026-07-13 vocabulary law, `docs/handoff/new-session-handoff-2026-07-13-referral-live-and-vocabulary.md` §2.) |
| **Surface names** | Per `surfaceNaming.ts` (the canon that never drifted): a page is named after the object the user owns — a member owns a SEAT. "Member Home" · "Your Seat" · "Membership" · "Console". Metaphors and brand terms are banned (§5). |

---

## §5 — THE BANNED VOCABULARY (one list; the guards enforce it)

This section is the consolidated authority. Sources: `guard-forbidden-copy.ts`
(PHRASES + WORDS, negation-aware — honest disclaimers like "not passive income" always
pass), `surfaceNaming.ts` (banned surface names), `CONNECTOR_LADDER_POLICY.md` §2
(banned rung names), and the standing doctrine bans (Compass / MVP brief §6).

**Financial-upside framing (banned in all public copy, positive sense):**
invest / investment / investor (all forms) · yield · APY · APR · ROI · dividend(s) ·
passive income · guaranteed return / guaranteed benefit / financial return · profit ·
payout* · equity · donation(s) · pump · 100x · moon* · FDV / market cap / fully diluted ·
jackpot / wager / betting · airdrop / farming / liquidity mining / yield farming /
high yield · win big · reward pool / earn rewards / claim rewards · governance weight ·
raised* / fundraising · downline* · distributed / pooled (claim-sense) · "your share" /
"your vault" / "the community's funds" / "shared funds" / "common pot" · trust-us
framing (a claim with no verify path) · fake-live (a static figure dressed as live).

**Banned surface names** (per `surfaceNaming.ts`): "my syndicate" (possessive-network =
downline connotation — founder-killed) · cockpit · member os · member access (as prose) ·
lobby / user lobby / connected lobby · control tower (as a NAME — the §3 voice metaphor
is internal doctrine, never user-facing copy) · operating surface · trust surface ·
proof surface · member path. "dashboard" = common noun only, never a page name.

**Banned as ladder rung titles** (per `CONNECTOR_LADDER_POLICY.md`): Cornerstone ·
Operator · Builder · Steward · Custodian · Scout — they are roles, axes, or on-chain
classes, never rungs. The only ladder is **Emerging → Active → Trusted → Established →
Durable → Foundational → Summit**, with **Partner = a negotiated class, never a rung**.

**Flagged divergences (doc ↔ guard; FLAG ONLY — fixes ride future slices):**
- `*payout` — banned as a WORD in the guard, yet "payoutWallet" is the contract field
  and referrer-side surfaces legitimately explain payouts; guard passes today because
  those uses live in allowed contexts. Watch at every new referrer surface.
- `*moon` — doctrine-banned; DELIBERATELY absent from the guard (the lucide `<Moon/>`
  theme icon would false-positive). Enforced by review, not the guard.
- `*raised` — doctrine-banned; DELIBERATELY absent from the guard (documented in the
  guard: an existing "Raised class" referral-tier name is legitimate copy). The
  approved concept "Rise" (§3) must never trip a future "raised" ban (origin solved
  this with word boundaries).
- `*downline` — doctrine-banned; NOT in the guard's lists today (it appears in live
  copy only inside negated disclaimers, which the guard's negation-awareness would
  exempt anyway). A future guard slice may add it.
- `contribution` / `package` — doctrine-listed; DELIBERATELY NOT guard-banned (the
  guard documents why: "protocolContribution" is the contract field, "routed
  contribution" and admin "package" copy are live legitimate uses). Buyer-facing copy
  writes "net" via the edge translation. Revisit when those surfaces migrate.

---

## §6 — THE CANONICAL VERBATIM LINES (never rephrased; harvested exact from the repo)

| Line (exact) | Lives in |
|---|---|
| "Don't trust — verify." | `components/VerifyOnChain.tsx` (`VERIFY_SLOGAN`) |
| "The market is free. It may decide otherwise." | `pages/JoinProtocol.tsx` (money surface; variants "The market is free; it may decide otherwise." in `config/liquidityPool.ts` and prose in `wallet/MemberWalletPanel.tsx`) |
| "Capital opens one axis. The other ten, you earn." | `pages/JoinProtocol.tsx` |
| "Not equity. Not yield. Not passive income." | `pages/JoinProtocol.tsx` |
| The permanent /join risk line: "The Syndicate is a recognition and attribution protocol — not an investment. Membership isn't a security or financial product, and it promises no money or financial gain." + "Joining can result in total loss." | `config/sharedCopy.ts` (`safetyCopy.notInvestment`) + `pages/JoinProtocol.tsx` (rendered UNCONDITIONALLY — survives the fail-closed no-prices path) |
| The no-entitlement LP line: "Nothing is live or promised to liquidity providers: no rewards, no NFT eligibility, no governance rights, no entitlement of any kind. Providing liquidity is a market act, not a membership act." | `config/liquidityPool.ts` |
| "Session ≠ membership." | `config/moduleRegistry.ts` · `config/surfaceClassification.ts` · `lib/seo-route-registry.ts` |
| "SYN is the seat, NFTs are the memory" | `pages/Whitepaper.tsx` §8 title. **FLAG:** the founder brief phrased it "SYN is the seat. Artifacts are the memory." — the repo's live wording (NFTs) is captured here per repo-wins; if the founder wants "Artifacts", that is a copy slice. |
| The coverage honesty line: "What appears here happened and is verifiable; what does not appear is simply outside the stated coverage — never evidence of absence." | `components/activity/LiveActivityFeed.tsx` (banner); the served-feed variant "…Between cycles this is a snapshot — never evidence of absence…" in `src/backbone/feedProjection.ts` |
| The referral doctrinal sentence (§4) | `config/sourceAttributionTerminology.ts` (`boundaries[0]`) + `public/referral-program-terms-v1.txt` §1 |
| The referral disclaimer: "Referral commissions are transparent payments for eligible completed member introductions — not passive income, not token yield, not downline, and not a profit promise. Membership is not an investment." | `config/sourceAttributionTerminology.ts` (`sourceDisclaimer`, guard-asserted present) |

---

## §7 — THE THREE REGISTERS (founder-decided)

One personality (§3), three declared tones, assigned per route family.

**PROOF** — whitepaper · tokenomics · status · proof · terms · docs · risk.
Institutional, zero adjectives. Today's law, unchanged. Figures speak; words label.

**CONVERSION** — home · /join · /referral · /toolkit · share/OG cards · future
campaigns. **Intelligent marketing is AUTHORIZED**: benefit-first, strong verbs,
historical FOMO (never financial FOMO) — under ONE law:

> **Every bold claim must be provable and must carry (or sit next to) its verify
> path.** The signature format of the register: **bold claim + verify link.**
> Legal verbatim lines (§6) never move, never soften, never migrate below the fold
> of the claim they govern.

The flagship CONVERSION examples for the referral showcase — all literally true in the
deployed V3 direct-payment model (the referrer is paid inside the buyer's transaction,
BEFORE the protocol routes anything; do NOT import the old router tier names — that
model sits at the pro-firm horizon per `CONNECTOR_LADDER_POLICY.md` §5):

- "You don't wait to get paid. The contract pays you inside your referral's own
  transaction — before we ever see the money. One signature. Two recipients. Verify
  the hash yourself."
- "Nothing to claim. It's already in your wallet when the block confirms."
- "A referral payment can never break a sale — and can never be lost." — grounded in
  the bytecode escrow: the origin source `TheSyndicate/contracts/src/MembershipSaleV3.sol`
  carries `pushSourcePayout` (the self-call payment wrapper, line ~305, invoked
  `try this.pushSourcePayout(...)` so a failed transfer can never revert the sale) and
  `claimSourceEscrow` (line ~290); the published terms doc §3 states the mechanism
  publicly ("if the direct payment fails, the amount is held in escrow on-chain and can
  be released… while the source is ACTIVE"). **FLAG:** these two functions are absent
  from the vendored ABI extract (`api-server/src/canon/.../sale-abi.ts`) — the extract
  is partial; a future slice may vendor the full ABI before any surface calls them.
- The one-liner: **"The referral program where the payout is part of the purchase."**
  (Register-exempt use of "payout": this is the referrer-side showcase, where the
  referrer's pay is named plainly — §4.)

**MEMBER** — member home · wallet · guide · notifications · "since you were away".
Warm, belonging, recognition. The member is recognized, never sold to. Historical
facts ("you were here before X% of the story") are welcome; financial framing never.

---

## §8 — THE EVENT LEXICON (the protocol's spoken heartbeat)

**The law: one event kind = ONE canonical sentence.** Single source of truth; every
surface — Activity, Chronicle candidates, future notifications, "since you were away"
— pulls its sentence from this lexicon and never reinvents it. Tone: **solemn-alive**
— the PROOF register carrying the narrative breath of the approved concepts (§3:
leave a trace, be remembered).

**Render rules (every entry; H2-P amended — THE PRIDE OF THE PUBLIC RECORD, founder
override 2026-07-15, recorded in ADR-003):** always WITH the sentence — block number,
chain-verified date (block time, never a wall clock), and the transaction verify link.
Member identity renders as the EVENT'S OWN facts in SHORT FORM ("0x123…abcd" — the origin
voice); a FULL wallet address never serializes anywhere (the output scanners stay armed);
no enrichment beyond what one event carries; the founder voice rule stands (founder acts
SAY the founder — no short form). Amounts follow each surface's own policy (the burn line
names its amount because the amount IS the record; seat lines never carry money).

### LIVE sentences (captured from the shipped M5 surfaces — the baseline)

| Event | The canonical sentence | Variants |
|---|---|---|
| Seat written (served feed, identity-blind voice) | "A seat was written on-chain." | first-seat: append " — a first seat." (only when the contract emitted the flag; never inferred) |
| Seat written (client window voice, public seat number) | "Seat #N was written on-chain." | first-seat suffix as above. The window's richer sentence WINS on overlap (M5 merge law). |
| SYN burn | "{amount} SYN was retired to the burn address — gone for everyone, forever." | — |
| Referral source created | "A referral source was created — a founder-signed on-chain act." | — |
| Source terms updated | "A source's terms were updated — a public event; there are no silent edits." | — |
| Source status changed | "A source's status changed — a public event; there are no silent edits." | — |

All six live in `lib/activityFeed.ts` / `src/backbone/feedProjection.ts` consumers;
the memory-anchor flag (receipt-thread doctrine) renders on Chronicle-grade kinds.

### LIVE sentences added by H1a (the complete-heartbeat arc, founder-approved table + corrections, 2026-07-15)

Two corrections govern every entry here and forward: **THE FOUNDER VOICE RULE** (when the
act is the founder committing his own stake or signing with his own hand, the sentence
SAYS the founder — identity-blindness protects MEMBERS, never hides founder acts) and
**THE VISIBILITY RULE** (lines carry what the chain publishes — amounts included; the one
discipline stands: the server never emits a MEMBER's wallet address).

| Event | The canonical sentence | Variants |
|---|---|---|
| Repeat purchase (② upgraded) | "A member expanded their footprint — recorded on-chain." | bucket "unknown" keeps the plain seat line — never a claim |
| Liquidity added (⑤) | "Liquidity was added to the public pool — the founder deepened the market." | Community actor: "— the market deepened." Amounts render as line facts. |
| Liquidity removed (⑥) | "Liquidity was withdrawn from the public pool — a founder-signed public act." | Community actor: "— a public act." |
| Ladder promotion (⑧, RESERVED → LIVE) | "A source rose to {rung} — recorded on-chain." | fires when a terms update lands exactly on a rate-raising rung above base |
| Archive pause/unpause (⑨) | "The archive was paused — a founder-signed public act." | resumed: "The archive resumed — a founder-signed public act." |
| Artifact mint (⑪) | "A {artifact} was minted — protocol memory, written to the chain." | {artifact} ∈ canon labels (First Signal · Patron Seal · Artifact #N); minter never named |
| Source wallet rotation (⑯) | "A source's payment wallet was rotated — a public act; there are no silent edits." | covers both wallet and payment-wallet rotations |

### LIVE sentences added by H2-⑦ (treasury movements, founder GO A, 2026-07-15)

Treasury lines obey **THE FOLD LAW** (the anti-duplicate design, founder-required): a
transfer whose transaction already carries a first-class heartbeat line (a purchase, an
LP add/remove, a burn, an archive mint…) is that line's ROUTING DETAIL — folded, never a
second line. Scope: the three routing organs (the vault · the liquidity wallet · the
operations wallet), USDC + SYN. Organs render as LABELS; external counterparties are
never named; native AVAX movements emit no event and honestly cannot have a line.

| Event | The canonical sentence | Variants |
|---|---|---|
| Treasury outflow | "{amount} {token} moved out of {organ} — a founder-signed treasury act; there are no silent moves." | — |
| Treasury inflow (non-purchase) | "{amount} {token} entered {organ} — recorded on-chain." | — |
| Internal rebalance | "{amount} {token} moved from {organ} to {organ} — an internal treasury rebalance, publicly recorded." | one line per transfer (the two direction scans dedupe at the raw key) |

### LIVE sentences added by H2-⑬ (the milestone layer, founder-approved table, 2026-07-15)

Milestone crossings are DERIVED lines: each anchors to the exact transaction where the
chain crossed a canonical threshold (seat ordinal · cumulative USDC routed · first-of-kind
mint). Vocabulary law: always **"routed"**, never "raised" (the routing register — the
fundraising register never enters); always **seats**. The 11 canon defs live in
`src/backbone/milestoneReadmodel.ts`; the seat milestones ARE the chapter boundaries.

| Event | The canonical sentence | Variants |
|---|---|---|
| First seat (milestone) | "The protocol's first seat was sealed on Avalanche." | — |
| First Signal first mint | "The Archive's first First Signal was minted." | — |
| First Patron Seal first mint | "The Archive's first Patron Seal was minted." | — |
| USDC threshold crossed | "The protocol crossed {N} USDC routed through the sale — 70/20/10, on-chain." | {N} ∈ canon thresholds (100 · 1,000 · 10,000) |
| Seat-cohort threshold crossed | "Seat #{N} was sealed — a protocol milestone." | the cohort's canon label (e.g. "Genesis Signal sealed (#1–#333)") renders as the line's FACT |

### LIVE-armed sentence added by H2-⑫ (era transitions, founder GO 2026-07-15)

The RESERVED era sentence graduated VERBATIM. Derivation = the WITNESS PATTERN: the first
purchase carrying era n within one engine's gapless history anchors the transition line.
**LINE-ON-CROSSING ONLY** (founder-confirmed at the gate): no "approaching era n" meter,
countdown, or progress display exists anywhere — era bounds are bytecode, never framed as
scarcity pressure (the seat-not-security shield). All three engines sit in era 1 as of
2026-07-15 (chain-read at the gate): the class is armed, its history honestly empty.

| Event | The canonical sentence | Variants |
|---|---|---|
| Era transition (⑫) | "The protocol entered era {n} — the rate table turned a page, on schedule, on-chain." | the engine (V2A/V2B/V3) renders as the line's FACT — detail, never hierarchy |

### LIVE sentences amended by H2-P (THE PRIDE OF THE PUBLIC RECORD, founder override 2026-07-15)

The origin voice recovered from the archive, restored verbatim. Identity facts are the
EVENT'S OWN (number + short-form address); lines whose rows predate the amendment keep the
H1a voice (an honest gap, never a guess). The who-brought-whom renders NAMED (founder
override A, same day — the referrer is the proud party; sourceWallet lives in the SAME
purchase event: one event republished, no join); the veiled wording survives only as the
honest degrade when the event's wallet field is malformed. When the alias layer arrives
(M2/M3), the alias replaces the address on this same line.

| Event | The canonical sentence (pride voice) | Variants |
|---|---|---|
| Seat entered (first/unknown) | "Member #15 · 0x123…abcd entered the public registry." | no number (V1): "0x123…abcd entered the public registry." · referred (V3, override A): append " — brought by 0x3f2…0a91" (degrade: " — brought by a verified referral") |
| Repeat purchase | "Member #15 · 0x123…abcd expanded their footprint — recorded on-chain." | — |
| Artifact mint | "0x123…abcd archived First Signal · token ID 1." | pre-backfill rows keep "A {artifact} was minted — protocol memory, written to the chain." |
| Burn / LP facts row | the Community actor's short form joins the facts ("Proof of Burn #N · 0x123…abcd") | Founder lines carry no short form — the founder voice rule |
| Client window (seat) | same registry voice as the served feed — one lexicon, one register | — |

### LIVE sentence added by H2-⑭ (Chronicle promotions, founder GO + chip decision A, 2026-07-15)

Register-derived (CHR-1: a promotion is a founder COMMIT, not a chain event) — the line is
built client-side from the committed register, wears the PROMOTION date (`promotedUtc`,
structural field), carries NO invented anchor, and links INTO the record ("read the
record →" /chronicle#id) where the entry's own verifyNote teaches chain verification.
Chip decision A (founder): the lifecycle chip is labeled **"Referral registry"** — it
filters the registry's own administrative acts; member referrals live inside seat lines.

| Event | The canonical sentence | Variants |
|---|---|---|
| Chronicle promotion (⑭) | "“{title}” entered the Chronicle — promoted by the founder, recorded forever." | an entry without a title keeps the RESERVED untitled form |

### RESERVED sentences (authored now; their surfaces are not built — labels, not locks)

| Event | The canonical sentence (RESERVED) | Notes |
|---|---|---|
| Source activated | "A referral source went active — introductions now pay inside the buyer's own transaction." | lifecycle detail of the status-change event |
| Source paused | "A referral source was paused — a public event; nothing is erased." | pause never erases; the terms doc governs escrow wording |
| Ladder promotion | "A source rose to {rung} — recorded on-chain." | {rung} ∈ the §5 ladder only; "rose" honors the approved concept "Rise"; a rate never decreases, so the sentence never has a downward twin |

**Variant axes (all entries):** first-seat (where emitted) · generation V1/V2A/V2B/V3
(rendered as detail, never as hierarchy) · memory-anchor (Chronicle-grade kinds carry
the anchor flag).

---

*Enforcement note: this doc's §5 list and the guards' literals are reconciled as of
this commit, divergences flagged above. A future guard may assert the §6/§8 sentences
verbatim (the origin's validator pattern) — that hardening belongs to Phase 6 per the
anti-blocking law, not to this document.*
