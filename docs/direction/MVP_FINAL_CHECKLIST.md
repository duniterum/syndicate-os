# MVP-FINAL CHECKLIST — content-bound work, fires ONLY on the founder's explicit word

*DIRECTION doc. Pointed to from `OPEN_QUEUE.md` (the single index of in-flight items).
This file is the AUTHORITY for the items below — the queue references them, never restates
their detail, so there is no parallel/contradictory truth.*

---

## ⚠ THE FIRING MECHANISM — read this first (founder, 2026-07-17)

**This checklist does NOT auto-fire. There is NO trigger. Nothing in the repo self-executes
at "MVP."** There is no date, no cron, no code path, no guard that runs any item here. The
items are inert memory until a human acts.

**How it fires:** the day the founder says, in plain words — *"MVP final, run the
checklist"* (or the equivalent) — Claude Code opens THIS file and executes each item
**manually, one at a time, each through the normal gate** (report → founder GO → commit →
deploy verdict). Until that sentence is spoken, this file changes nothing and ships nothing.

**Why these wait (founder decision, 2026-07-17):** the founder's content will still move
before MVP. Work that **self-adapts** to content changes (build-time compression, the
favicon) shipped NOW — done once, alive forever. Work that is **content-bound** would be
redone if the content moves, so it waits here to be done exactly once, at the end, against
the final content.

---

## Item 1 — Q32 · the 23 over-budget meta-descriptions wave

**What:** 23 SEO descriptions in `artifacts/studio/src/lib/seo-route-registry.ts` exceed the
~160-char SERP budget (worst: `/activity` at 273 chars; the protective "Not a security; no
promise of gain" tails sit past the cut on `/faq`, `/docs`, `/tokenomics`, so the safety line
is invisible in search results).

**Execution at MVP-final (all in ONE slice):**
1. Add the guard length-ceiling FIRST (a studio guard asserting every registry description
   ≤ the SERP budget). **Ceiling before rewrites = the red gate** — the ceiling must be able
   to fail before the rewrites make it pass.
2. Rewrite ALL 23 descriptions to fit the budget while keeping the safety framing visible.
   **Every rewrite is read ON SCREEN by the founder** before commit (standing content rule)
   — public copy, founder decides the words.
3. SEO layer rides the slice: the rewrite updates each route's registry entry in the same
   commit; `seo:check` + `surface:audit` must stay green.

**Why content-bound:** the descriptions describe pages whose copy may still move; rewriting
them now would be redone. Wait for final content.

---

## Item 2 — llms.txt · final revision + placement

**What:** a static, truth-first `llms.txt` at the site root that guides AI readers to the
real surfaces. **The founder chose to WAIT rather than post-and-patch** — so the full drafted
text lives HERE, ready, not yet shipped.

**Execution at MVP-final:**
1. Re-read the text below ON SCREEN against the then-current content (routes/copy/channels
   may have moved) — this is the **final revision**, founder-approved on screen.
2. Place the approved text at `artifacts/studio/public/llms.txt`. Vite copies `public/` →
   `dist/public/`, so it serves at `/llms.txt` (same mechanism as `robots.txt`,
   `sitemap.xml`, `referral-program-terms-v1.txt`).
3. **Verified at draft time (2026-07-17): NO registry / sitemap / artifact.toml-rewrite /
   guard change is needed** — it is a root static file, not a route; no guard enumerates
   `public/` or `dist/`. Re-verify at execution in case the guards changed.

**Verified truth constraints (hold at execution):** list only real INDEX routes; keep
`/archive` and `/recognition` OUT (PENDING/noindex); `/source-attribution` canonicalizes to
`/referral`; state NO figures (all "read live on-chain"); contact links are the official ones
in `brand.ts` (X `@TheSyndicateOne`, Telegram `TheSyndicateOfficial` + `TheSyndicateMoney`);
verify links come only from `GET /api/protocol/verify-links` (infra addresses only, never
member wallets); print no contract addresses.

### The drafted llms.txt (READY — re-review on screen at execution)

```
# The Syndicate

> A proof-first, on-chain membership protocol on the Avalanche C-Chain. Your seat is permanent, numbered, and verifiable — and it is open today. Every public figure on the site is read live from the chain, never hardcoded. Tagline: "A Living Protocol." Ethos: "Don't trust — verify."

The Syndicate is a members club that lives on-chain. This file guides AI readers to the real, canonical surfaces. Every quantity below (supply, prices, burn totals, seats sold, pool reserves, commissions) is READ LIVE ON-CHAIN at request time — this file states no figures, and none should be inferred or invented from it. Canonical origin: https://thesyndicate.money

## Start here
- [Whitepaper](https://thesyndicate.money/whitepaper): What The Syndicate is and how a seat and revenue routing work; prose written once, every figure a live chain read.
- [FAQ](https://thesyndicate.money/faq): Honest answers about the seat, the sale, treasury routing, liquidity, the archive, and risk. Number-free; every live number is one click away on-chain.
- [Learn](https://thesyndicate.money/learning): Plain-language lessons on wallets, transactions, and how membership works here.
- [Docs](https://thesyndicate.money/docs): The operating manual — read the protocol in the order a member lives it; each entry links its real surface.

## Economy & tokenomics
- [Tokenomics](https://thesyndicate.money/tokenomics): SYN's fixed supply, the distribution across allocation wallets, the two independent prices, and burn — every figure read live from Avalanche, never hardcoded. Not a security; no promise of gain.
- [Liquidity](https://thesyndicate.money/liquidity): Why the SYN/USDC pool exists and its live pair reserves, read from the chain. No rewards or entitlement are live or promised to liquidity providers.
- [Fire Ledger](https://thesyndicate.money/fire-ledger): Every SYN burn, numbered — the live total retired to the burn address and the complete Proof of Burn record, served by the protocol's own indexer.

## Proof & transparency (read live on-chain)
- [Status](https://thesyndicate.money/status): The honest ledger of what is live versus pending across the protocol.
- [Proof](https://thesyndicate.money/proof): Verify membership receipts, treasury routing, numbered burns, and referral payments — each with its own on-chain verify link.
- [Protocol Map](https://thesyndicate.money/map): Chain identity, contract code, token metadata, sale lifecycle and referral-registry posture, reconciled against pinned canon and read live.
- [Activity](https://thesyndicate.money/activity): The public heartbeat — the complete indexed history (seats written, burns, referral events, liquidity, archive mints, treasury movements, milestones), each line receipt-backed with its own verify link.
- [Chronicle](https://thesyndicate.money/chronicle): The institutional record — founder-promoted turning points, each verifiable on-chain; the register grows only by founder-signed commits.

## Join & membership
- [Join](https://thesyndicate.money/join): Read your exact live quote — what you pay, the SYN you receive, where every dollar routes — then join with two signatures from your own wallet on Avalanche C-Chain.
- [Referral Program](https://thesyndicate.money/referral): How an eligible completed introduction pays a bounded commission to the introducer's wallet inside the buyer's own transaction — on-chain, shown by receipt. Membership is not an investment.
- [Build a Referral Link](https://thesyndicate.money/source): Validate a referral code against the on-chain registry and build a shareable join link. Checking is free and writes nothing.
- [Member Home](https://thesyndicate.money/member): Sign in with your wallet to see only your own standing — your seat, the people you brought in, and what you've been paid, read live. There is no directory of members.
- [Wallet](https://thesyndicate.money/wallet): Your own SYN, USDC and Archive artifact balances and your own approvals — own-row only.
- [Toolkit](https://thesyndicate.money/toolkit): Every member action in one place; locked actions stay visible with their plain reason.

## How to verify anything
Verify links are served only by the read-only endpoint GET /api/protocol/verify-links, and only for protocol infrastructure — the contracts, treasury wallets, the LP pair, and the burn address. Member wallets are never emitted. Links open on the Avascan Avalanche C-Chain explorer (https://avascan.info/blockchain/c). The chain is Avalanche C-Chain (chainId 43114). Membership and purchase receipts each carry their own on-chain transaction anchor and a canonical explorer URL.

## Legal
- [Terms of Use](https://thesyndicate.money/terms)
- [Privacy Policy](https://thesyndicate.money/privacy): No accounts, no identity checks, no third-party analytics; the one first-party record (the referral channel counter — counts, never people) said plainly.
- [Risk Disclosure](https://thesyndicate.money/risk): The price of SYN can fall to zero; smart contracts can have flaws; your keys are your only access; blockchain transactions are final.

## Contact & channels
- X (Twitter): https://x.com/TheSyndicateOne
- Telegram (Announcements): https://t.me/TheSyndicateOfficial
- Telegram (Community): https://t.me/TheSyndicateMoney
- [Support](https://thesyndicate.money/support): The on-site Guide and official channels. A full ticket system is not built yet.

## Notes for machine readers
- Not a security; no promise of gain. Membership is not an investment.
- This file contains no live figures by design — supply, prices, burn totals, seat counts and pool reserves must be read live on-chain, never quoted from cached copies of this document.
- Some surfaces are still being built and are intentionally not listed here as live (e.g. the full Archive museum surface and the Recognition model); they are noindex until their reads are wired.
```

---

## Item 3 — goal-3 SSR (full-body prerender) — NO_ACTION for now

**Finding (2026-07-17, read-only):** the prerendered shells are **head-only**. Every route's
`<body>` is an empty `<div id="root">`; all visible prose (the seat doctrine, the on-page
verify UI, headings, CTAs, every chain figure) is **JS-injected** after hydration. This is
deliberate, documented architecture — the app is `wagmi ssr:false`, and full React SSR would
break it.

**Why NO_ACTION is correct today:** the two things that must reach crawlers and social
previews WITHOUT running the SPA — the **seat framing** and the **verify promise** — are
already baked into every route's `<head>` (title / description / OpenGraph / Twitter):
home *"Your seat is permanent, numbered, and verifiable … Every figure … read live from the
chain. Check it yourself."*; join title *"Take Your Seat On-Chain"*; whitepaper *"read live
from Avalanche — never hardcoded."* So Google snippets and link previews already render them.

**Available IF the founder ever wants it:** making the seat/verify **body prose** visible to
a fully JS-disabled reader (or a non-executing crawler) in the page BODY requires real SSR /
static body prerender — a larger architecture change, its own slice, a founder decision. Not
queued as work; recorded here as the standing option.

---

## Not in this checklist (handled elsewhere — noted so nothing looks forgotten)

- **Compression (SEO goal 1)** — being handled NOW, not content-bound. Measured 2026-07-17:
  the live host serves assets RAW (no `Content-Encoding`/`Vary`). Next step is a Replit host
  answer (enable host compression, or confirm pre-compressed sibling serving); then either a
  build-emit slice or the deferred Express-front topology slice. Tracked in `OPEN_QUEUE.md`.
- **Favicon (Q31)** — being handled NOW (the founder chose the gold `syn-mark-gold` mark).
  Not content-bound. In the current gate.
- **www→apex 301** — deferred to the domain transfer (~Sept 2026); Replit-host capability.
  In `OPEN_QUEUE.md`.
- **Reduce-unused-JS / code-splitting** — sensitive (affects how MetaMask + chain libs load);
  its own slice later. In `OPEN_QUEUE.md`.
