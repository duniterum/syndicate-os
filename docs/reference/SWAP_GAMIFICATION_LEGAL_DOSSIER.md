# SWAP · GAMIFICATION · LEGAL — master research dossier

> **Provenance:** Reference material, not a repo spec. Same status as the
> `jumper-lifi` dossier. Written by Claude-advisor, 2026-07-18, from real repos on
> disk + live web research (Switzerland + world), not from memory or prior docs.
> Saved to the repo on the founder's instruction so future sessions consult it at
> the relevant slice. The founder is a crypto veteran and polymath — this dossier
> is material for his own judgement and his counsel conversation, **not an
> instruction and not legal advice.**

## PART 1 — SWAP / BRIDGE: the market benchmark (completes the jumper dossier)

The `_research/jumper-lifi` dossier already read the Jumper code line-by-line (the 7 patterns, the wallet hook, the destination-lock, the theme injection, the `no-raw-color` trap, the fee model). What it lacked was the market benchmark: is LI.FI (Jumper's engine) actually the best choice in 2026? Researched answer: yes, for this use case.

The comparison (2026 data, $1,000 USDC ETH→Arbitrum benchmark):

* LI.FI quoted ~$0.94 total cost via Across, 22s finality; Socket $1.10 via Across, 31s. LI.FI cheaper AND faster on the same route.
* LI.FI: 30+ chains (EVM, Solana, Bitcoin). Socket/Bungee: 20+ (EVM in prod, Solana beta) — its strength is breadth of integration (it's inside Coinbase Wallet & MetaMask Bridge), not lowest cost.
* Squid: strong cross-VM (Solana, Sui, Bitcoin, Cosmos via Axelar GMP), but its CORAL intent engine makes users deposit BEFORE solvers fill, rather than quoting before signature — worse for a "see the quote, then sign" ramp.
* deBridge: narrower chain count, solver-auction model; Eco: native atomic stablecoin, fewer chains; Across: fast intents but limited corridors.

Why LI.FI specifically: it's one of the most complete cross-chain infra layers in 2026 — its edge is orchestration (route discovery, token abstraction, execution logic, status tracking, monetization hooks), and it's actively building around Composer, intents, OpenAPI, llms.txt, and MCP agent access — it ages well.

Monetization (the "best earning rates" question): the LI.FI widget has an integrator `fee` parameter — a float, e.g. `0.02` = 2% of transaction volume, max < 100%, with your integrator string so fees route to your wallet. On EVM chains fees are forwarded DIRECTLY to your fee wallet at execution, arriving as soon as the user's tx confirms — no contract to write. Integration is free; LI.FI takes its own default 25 bps (0.25%) and a share of your collected fees by use case/volume. → This IS Option A from the jumper dossier (announced service fee = pay for an ACT = commerce), the founder's own settled line.

⚠️ Security note the jumper dossier didn't carry: LI.FI disclosed a 2024-07-16 exploit affecting wallets with infinite approvals on a newly deployed facet (~$11.6M est. losses). Doesn't disqualify LI.FI (all aggregators inherit underlying-bridge risk), but imposes a rule: never default to infinite approval in the widget config, and the standing law holds — a successful swap makes no one a member; the seat comes only from the purchase receipt.

thirdweb: the founder used it; and Supa's season distribution is already built on thirdweb Airdrop v2 (contract verified on Avalanche, see Part 2) — so thirdweb is the existing distribution path if a payout is ever wired.

Open founder decisions (swap): (1) framing — ramp-to-the-seat on `/join` vs a wider "Swap" surface; (2) fee — Option A (announced service fee, company revenue) vs Option B (free ramp, acquisition cost). Both are the founder's calls.

## PART 2 — GAMIFICATION: what Supa-Exchange actually contains (harvest inventory)

`Supa-Exchange` on disk holds a COMPLETE, real gamification engine. Read from the code:

* XP (`xpService.ts`): lifetime-XP level formula (Level = floor(totalXp/1000)+1), single source of truth, XP events table, tier derivation, leaderboard, next-tier progress, badge-on-tier-up, notifications.
* Tiers (`tiers.ts`): user tiers (explorer→navigator→pathfinder→trailblazer→ legend) + reward tiers (bronze→diamond) + rarities (common→mythic) with full style maps.
* Seasons (`seasonService.ts`, `seasonDistributionService.ts`): seasonal XP, level-in-season, and a Merkle claim distribution (thirdweb Airdrop v2 compatible, contract `0x9E20…5630` on Avalanche) — "AAA Reward Policy: 30/30/40 XP-proportional, Top 200", claimed on-chain via `claimERC20`.
* Badges (`badgeService.ts`), quests (`questService.ts`, `questMetrics`), gamification seed, admin exports.

The interconnection the founder wants (badges ↔ ranking ↔ activity ↔ chronicle ↔ XP ↔ season) already exists in skeleton — the event/award architecture is there. Harvest = adapt the engine to the Syndicate's reality spine (on-chain reads), not the Supa DB assumptions. The badge/tier/rarity/season SHELL is directly reusable for Recognition; the payout mechanism is the part the doctrine governs (Part 3).

The tie to current work: a completed season is itself a "first" (first season) → it flows into the FIRSTS registry and can promote a Chronicle entry; a badge can carry a witness line; the activity feed feeds detection. Coherent — provided the reward is framed per the legal line below.

## PART 3 — THE LEGAL RESEARCH (US + Switzerland + world), and the doctrine change

The founder's decision (stated): the season pot IS a real payout — his marketing budget redistributed to members for activity, so money circulates inside the protocol instead of going to Google/Facebook. This is a legitimate business logic. The doctrine changes to ALLOW it — within the legal line below. This section grounds that change on real 2026 law so it is never re-litigated.

### 3.1 US — securities (Howey) and the rewards line (2026)

* The touchstone stays Howey: (i) investment of money, (ii) common enterprise, (iii) reasonable expectation of profit, (iv) from the efforts of others. The March 17, 2026 SEC-CFTC joint interpretive release (the "Taxonomy", under Chair Atkins) is the authoritative current framework and supersedes the 2019 guidance.
* Airdrops of non-security crypto assets generally are NOT securities transactions — they fail Howey's first prong (no investment of money).
* The 2026 CLARITY-Act compromise (Section 404) protects rewards tied to real usage: flat APY on an idle held balance is the target; activity-based reward programs are expected to continue and may expand. The SAME stablecoin reward "can look lawful or risky depending on whether it is framed as interest, a perk, a rebate, or a loyalty benefit."
* Coinbase USDC Rewards is described as a loyalty program funded by Coinbase, which Coinbase may change or discontinue — the model to emulate: discretionary, company-funded, adjustable, framed as loyalty/usage.
* a16z's safe-harbor proposal pushes exactly toward incentive-based reward programs that don't engender Section-5 risks — the regulatory wind favors this model.

Where the season pot sits: it rewards ACTIVITY (an act), not SYN holding — the right side of Howey. The founder's engraved line "earn for an ACT ✅ / for HOLDING ❌" is precisely the legal boundary. Keep that line; it is the Howey shield.

### 3.2 US — the REAL red line: lottery vs contest

The concrete risk for a payout isn't Howey, it's gambling/lottery law:

* Legal formula: Prize + Chance − Consideration = legal sweepstakes. A lottery = prize + chance + consideration, and is illegal for a private business without a state license.
* The US line: sweepstakes (chance — never require purchase, "No Purchase Necessary") vs contest (skill/merit — the winner is judged on performance, generally EXEMPT from gaming law).
* The subtle trap: significant time/effort, or measurable value to the sponsor, can count as consideration even without payment. So "free to enter" alone is NOT the shield if the outcome is random.

The shield for the season pot: KILL CHANCE. The Supa distribution is XP-proportional and deterministic (30/30/40, top 200) — that is merit-based, a CONTEST, not a random draw. Deterministic-by-measured-contribution = exempt from gaming law. The instant any randomness enters ("a lucky member wins"), it becomes a lottery. Never introduce chance into who gets what.

### 3.3 SWITZERLAND — FINMA token classification (the founder's target jurisdiction)

* Switzerland uses a functional, technology-neutral model: there is no "crypto license" — a company gets the status of whatever financial-intermediary type its business model matches. FINMA's three token categories:
   * Payment token — a means of payment; not treated as a security by FINMA; "pure cryptocurrencies" give no claim against an issuer.
   * Utility token — grants access to a platform/service (a digital key); may attract oversight only if it has investment-like features.
   * Asset token — equity/security-like (tokenized shares, financial instruments) → treated as a security under FinSA/FinIA.
* 2026 reality: founders fail less because crypto is banned and more because they misclassify custody economics, stablecoin redemption rights, or EU-facing marketing (MiCA cross-border). Analysis turns on rights attached, transferability, redemption mechanics, reserve assets.
* AML (2026): AMLO-FINMA was tightened (April–May 2026), and MRK-style crypto transaction reporting through MROS took effect 1 January 2026 — so a Swiss entity has real AML/KYC + reporting obligations as a financial intermediary, independent of token class.

Where SYN likely sits (for counsel to confirm, not decided here): a membership-access + means-of-payment token with no claim on treasury, no redemption right, no profit promise reads as utility/payment-leaning, NOT an asset/security token — consistent with the founder's "operator money, members have no claim" doctrine. The rights attached are what decide it.

### 3.4 SWITZERLAND — the Money Gaming Act (the season-pot red line, Swiss version)

* The Federal Act on Money Games (Geldspielgesetz / AMG), in force 1 Jan 2019, governs all games — of chance AND of skill — that involve BOTH consideration AND a prize.
* Two doors out, both usable:
   1. No consideration → outside the Act. "Free gaming features do not require a licence." If entry costs nothing of qualifying value, it's not a money game.
   2. Skill, organised the right way → skill games need a licence only if run online, automatically, OR inter-cantonally. And crucially: "Under strict conditions, media publishers and shops may organise lotteries and games of skill without a licence."
* Regulators: Gespa (lotteries, betting, skill games) and ESBK (casinos). Only Swisslos and Loterie Romande get lottery/betting licences; foreign providers are DNS-blocked — i.e. you do NOT want to be classified as a lottery.

The Swiss shield is the SAME as the US one, plus one: (a) no chance — keep it merit/skill, deterministic by measured contribution; and (b) watch "consideration" — the cleaner the entry is of any required stake/effort-as-value, the further from the Act. A merit-based, activity-recognizing distribution funded by the company's marketing budget, with no random element and no required stake to qualify, is the safe structure. Counsel confirms the skill-game licensing trigger (online/automatic/inter-cantonal) for the exact mechanics.

### 3.5 WORLD — the classification varies, so it's a per-jurisdiction check

Skill-vs-chance classification differs sharply by country (e.g. "rush-and-win" is chance under Italian law but skill in Belgium/Portugal; the US splits state by state; Australia is strict anti-gambling). So the model must hold in every jurisdiction the members sit in, not just Switzerland. The universal safe structure that travels best: merit-based (no chance) + framed as company-funded loyalty/recognition of activity + no required stake + discretionary/adjustable.

## PART 4 — THE DOCTRINE CHANGE (engraved; do not re-litigate; no more "ask a lawyer" deflection)

Old doctrine: Recognition is multi-axis, NEVER a financial payout; season pot was flagged as forbidden/tension.

New doctrine (founder decision, 2026-07-18): the season pot MAY pay real value to members — it is the founder's marketing budget redistributed for activity, company money circulating inside the protocol. This is permitted, bounded by the legal line below. The advisor must NOT re-raise the season-pot payout as a doctrinal impossibility, and must NOT deflect the Swiss/legal question with "that's for your lawyer" — the research is done and lives here; counsel confirms mechanics, it is not a blocker to designing.

**THE LEGAL LINE (the permanent guardrail, both the US and Swiss shield):**

1. **MERIT, NEVER CHANCE.** Distribution is deterministic by measured contribution (XP-proportional / ranked), never a random draw. Any randomness = lottery = forbidden. This is the single most important rule.
2. **REWARD FOR AN ACT, NEVER FOR HOLDING.** The pot rewards activity, never SYN holding — the Howey shield and the founder's original line, unchanged.
3. **COMPANY-FUNDED LOYALTY FRAMING.** It's operator/company marketing money, discretionary and adjustable (Coinbase-model), never "yield", never "return", never a claim on treasury, never presented as investment income.
4. **NO REQUIRED STAKE TO QUALIFY.** Keep entry clean of qualifying "consideration" (Swiss AMG + US sweepstakes) — activity in the ordinary use of the product, not a paid ticket.
5. **PER-JURISDICTION VALIDITY.** The merit/no-chance structure must hold in every member's jurisdiction; counsel confirms the Swiss skill-game licensing trigger (online/automatic/inter-cantonal) and any high-exposure country.
6. **AML/KYC + reporting** apply to the Swiss entity as a financial intermediary (AMLO-FINMA 2026, MROS/MRK reporting from 1 Jan 2026) independent of all the above.

Vocabulary: the pot is a season recognition of activity / community reward / loyalty distribution — never "yield/APY/return/dividend/passive income". The banned-vocabulary law still governs every surface.

Harvest path: adapt Supa's XP/tier/badge/season engine + its thirdweb Airdrop v2 Merkle distribution (already Avalanche-verified) to the Syndicate reality spine. The distribution stays deterministic-by-contribution; the framing stays loyalty/recognition; the chance element is never introduced.

## PART 5 — OPEN FOUNDER DECISIONS (nothing pre-decided)

1. Swap framing — ramp-to-seat on `/join` vs wider surface; fee — Option A (announced service fee) vs Option B (free ramp).
2. Season pot size & cadence — what share of marketing budget, how often, top-N depth.
3. Distribution curve — keep Supa's 30/30/40 top-200, or a different merit curve (still deterministic).
4. When the gamification harvest enters the acted order (it's a large surface).
5. Counsel scope — hand this dossier to Swiss counsel to confirm: token class (utility/payment vs asset), skill-game licensing trigger for the exact mechanics, AML/KYC setup, and MiCA/EU cross-border marketing exposure.

These are the founder's calls. This dossier lays the complete, researched field — US, Switzerland, and world — so the season-pot question is never re-opened as a doctrinal impossibility, and never deflected to "ask a lawyer" again.
