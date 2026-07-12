# Handoff — C5: the GO-LIVE flip (founder GO already given 2026-07-13)

**Read after `docs/SESSION_STATE.md`.** The founder said GO to C5. The flip was NOT rushed at
end-of-context (the C1.3 lesson: a money gate is never rushed) — this handoff carries the COMPLETE
discovered checklist so the next session executes it fresh, in ONE atomic commit.

## What already exists (do not rebuild)
- **C2 approve→buy is BUILT and pushed OFF** (`c7ad5c7`): `wallet/JoinCheckout.tsx` behind
  `config/checkoutGate.ts` `CHECKOUT_ENABLED: boolean = false` (literal; proven folded out of the
  default bundle). The four laws are implemented + the C1.3 gate is re-consulted inside the flow.
- Two founder acts remain AFTER the C5 commit: **Replit publish** + **the founder's own $5 real
  test**. Nothing reaches third parties before both.

## THE C5 COMMIT — one atomic change (the page must never lie anywhere)

1. **Flip** `CHECKOUT_ENABLED = true` (`config/checkoutGate.ts`).
2. **A new DisplayLifecycle for a transactional surface** — none exists (deliberately: none of the
   current values reads as affirmative "live"). Add e.g. `LIVE_ACTION` to `config/truthStatus.ts`
   (`displayLifecycleText`: honest wording like "Live — real on-chain purchase from your own
   wallet") + `LifecycleBadge` tone map + EVERY guard that enumerates lifecycles
   (`guard-lifecycle-labels`, `guard-posture-map` 80, `guard-surface-coverage` 173) + check
   `guard-no-fake-live` rules (it bans HARDCODED live labels — route the new label through the
   taxonomy, never a bare string).
3. **/join page** (`pages/JoinProtocol.tsx`): lead rewrite (currently "Read-only: nothing is signed
   or sent from this page" — FALSE after the flip); badge → the new lifecycle; the boundary card
   auto-removes (already `CHECKOUT_ENABLED ? null : …`).
4. **SEO**: the /join registry entry title is "Join The Syndicate — Exact Read-Only Quote" →
   rewrite title + description; regen (`seo:generate`, prerender runs in build; `seo:check`).
5. **Module registry + modules**: `moduleRegistry.ts` `membership-join.notes` is a STATE line that
   SAYS the checkout slice rewrites it in the same commit — rewrite it. `modules.ts:185` join
   description ("read-only; no transaction is sent from this app") — rewrite.
6. **Sitewide read-only claims sweep** (each becomes FALSE at the flip):
   - `config/brand.ts:8` `foundationNote: "Read-only foundation shell."` (footer, every page)
   - `config/brand.ts` headerChips zone — PublicLayout chip says "the public surface is currently
     read-only" (title attrs in `PublicLayout.tsx` too: ChainPill/LiveChip)
   - `config/learningModules.ts:29` "This site is a read-only foundation…"
   - `pages/Whitepaper.tsx` §05: "no transaction is sent from this app"
   - FAQ corpus (`content/faq-content.ts`): grep `read-only` + "no transaction" + "never
     initiates" — rewrite the join-related answers honestly (39 Q&A; only the join-claims change)
   - `config/contractMemory.ts:101` "no purchase, wallet, or transaction surface exists here"
   - `config/syndicateFacts.ts` (~:275) membership-join fact line
   - The Guide corpus reuses the FAQ content — verify no stale claim remains (`SyndicateGuide`)
7. **surfaceClassification** for /join — check the class still holds (guard:coverage will fail
   loudly if not).
8. **Docs same-commit**: SESSION_STATE (C5 SEALED line + "go-live done" state), OPEN_QUEUE group A,
   DESIGN_ROADMAP /join line, this handoff ticked.

## Q21 — verify before the flip
The auth zone ALREADY looks live in prod (the header shows "Member sign-in"; SIWE worked 2026-07-11).
Confirm Q21 is genuinely done (single-instance/Reserved-VM on Replit) or complete it with Replit —
the checkout itself needs only wallet CONNECT (works with auth dark), but the member recognition of
the new buyer's seat needs the auth zone.

## After the commit — the two founder acts
1. **Replit publish** ("pull main, deploy, report" — no migrations).
2. **The founder's $5 real test** (era-1 minimum): two SEPARATE signatures (approve exact $5 →
   sign the join), seat read from the receipt event on-screen. Expected: **seat #13**.
   Then verify live: memberCount flips 12→13 EVERYWHERE by itself (it is a live read), and the
   honest readback recomputes to **13 seats / 12 distinct wallets** automatically (derived §5b) —
   the first real proof the whole truth-spine works under a real purchase.
3. Rollback if anything is wrong: flip the literal back — one commit, one deploy.

## Verification limits (say them honestly)
The approve→buy path CANNOT be exercised by any test harness — no test wallet exists and none
should. The founder's $5 test IS the verification. Everything around it (gate, reads, quote,
folding) is already guard-covered and live-verified.
