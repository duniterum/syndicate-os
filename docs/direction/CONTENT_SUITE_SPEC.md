# CONTENT SUITE SPEC — all public "learn & verify" pages (build plan for Claude Code)

**Read this WITH `WHITEPAPER_PLAN.md`.** This spec is DIRECTION, not dictation: the real
`syndicate-os` repo always wins. Before building, Claude Code reads the repo, confirms the
true current state, and ADAPTS. Origin/mockups are inspiration only — never copied raw.

---

## Non-negotiable rules (apply to every page)
- **Truth-derived.** Every fact traces to chain / config / canon. **Every figure is read
  LIVE from the chain — never hardcoded.** Written once → stays current by itself.
- **Our terms.** Use the terms ALREADY LIVE in `syndicate-os` (read them from the repo — not
  the origin, not the mockup). **Banned public words:** invest · raised · donation ·
  contribution · profit · return · yield · APY · dividend · passive income · guaranteed ·
  100x · moon · pump · **package** · governance weight · equity · trust-us · fake-live.
- **Status labels everywhere:** VERIFIED / PENDING / FUTURE / PAUSED / FOUNDER-GATED. Never
  present a pending/future thing as live.
- **Legal framing** (not a security · no promise of profit · total loss possible) appears
  wherever SYN is described.
- **Positioning:** business selling **access + recognition + services**; recognition works
  like a **loyalty program** (Cumulus / airline miles); SYN is a fixed-supply token that
  trades on a market — price can move, **protocol promises nothing.**
- **Modular / plugin-style.** A page for a not-yet-live module renders "à venir" from the
  status registry — no rewrite when a module activates.
- **Grade-AAA.** Built on the design system (Prose atom + tokens), accessible, responsive,
  both light/dark modes.

---

## The pages (each: path · purpose · contains · status)
1. **Whitepaper** `/whitepaper` — the anchor. 15 sections per `WHITEPAPER_PLAN.md`. Ships
   WITH the Prose atom.
2. **Tokenomics** `/tokenomics` — SYN supply (1B fixed), full distribution (the 7 buckets),
   burn, the 70/20/10 split, no-yield boundaries; a supply/distribution visual. All figures
   live from chain, verified against allocation wallets.
3. **SYN token** `/token` (if not merged into tokenomics) — what SYN is / is not, the
   contract, how to acquire, the two independent prices (access vs market).
4. **Docs** `/docs` — how it works · how to join · how to verify · the contracts hub.
5. **FAQ** `/faq` — plain-language answers, each derived from a protocol truth.
6. **Knowledge base** `/knowledge` — deeper, organized by domain: Membership · Routing · SYN ·
   Archive · Source/Referral · Proof · Risk.
7. **Risk** `/risk` — risks + legal boundaries, clearly stated.
8. **Glossary** `/glossary` — our approved vocabulary, defined (seat, receipt, readback,
   vault, chronicle, register, archive, chapter, era, recognition…).
9. **Roadmap** `/roadmap` — future modules with status labels (driven by the registry).
10. **Protocol facts** `/protocol-facts` — dry, factual, for AI/search/verifiers: official
    name, chain, contracts, module statuses, routing model, official links, verify links.
11. **Brand facts** `/brand-facts` — approved one-liner + descriptions, approved/forbidden
    vocabulary, official links (X, Telegram, site), visual tone.

*(Check the repo: a Status/Proof ledger, Learn, Activity/Chronicle, Register, Archive,
Economy/GDP may already exist — link to them, don't duplicate.)*

---

## Information architecture — the FOOTER (grade-AAA)
Adapt to the footer/nav already in the repo; the target grouping:
- **Protocol:** Home · Join · Activity · Members · Archive · Economy
- **Learn:** Whitepaper · Docs · Knowledge base · FAQ · Glossary
- **Token:** Tokenomics · SYN token · Contracts (verify)
- **Transparency:** Status / Proof · Protocol facts · Verify on-chain
- **About:** Roadmap · Risk · Brand facts · Official links (X, Telegram)
- **Bottom line, always:** "Every contract, wallet, and balance is public — verify any
  number on-chain."

Only pages with real content are INDEXED + in the sitemap; PENDING pages are noindex.

---

## Build order (do it ONCE, complete, grade-AAA — then it self-maintains)
Prose atom (with Whitepaper) → Whitepaper → Tokenomics (+SYN token) → FAQ → Docs →
Knowledge base → Risk → Glossary → Roadmap → Protocol facts → Brand facts.
Each page = one slice: read the real repo first → adapt → figures live from chain → our terms
+ status labels → add to footer + SEO → add truth-first guards → tick `DESIGN_ROADMAP` →
deploy verdict.

## Guards to add (structural truth-first)
- FAIL the build if public copy uses a banned word.
- FAIL if a page claims LIVE/ACTIVE without a verified on-chain source.
- FAIL if internal/operator docs leak into the sitemap.
- Only INDEX pages that have real content; PENDING = noindex, follow.

---

## Harvest sources (inspiration only — adapt, never copy raw; the repo wins)
- **Whitepaper/tokenomics/docs/FAQ/glossary/knowledge structure** → origin `TheSyndicate`
  (`WHITEPAPER_EXTRACTION_MAP`, canon glossary) — truth-first shapes.
- **Join/ranks/"Take your seat" design** → origin `TheSyndicate` (stats "verify" bar, 3-step
  join, compose panel + live quote, 5-step flow, "Where do I fit?" ranks) — build better.
- Numbers: **always from the live chain/config**, never from any doc.
