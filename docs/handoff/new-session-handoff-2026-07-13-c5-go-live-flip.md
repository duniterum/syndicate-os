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
6. **THE COMPLETE MUST-CHANGE TABLE (from the 2026-07-13 full audit — supersedes the old 8-item
   list; every row becomes FALSE at the flip and must be rewritten in the SAME commit):**

   STUDIO (user-visible):
   - `pages/JoinProtocol.tsx:620` — page lead "Read-only: nothing is signed or sent from this page."
   - `pages/JoinProtocol.tsx:621` — `<LifecycleBadge lifecycle="READ_ONLY_PROOF" />` on /join
   - `config/syndicateFacts.ts:271` — "Real surfaces, read-only by design" (homepage section title)
   - `config/syndicateFacts.ts:273` — "Nothing on this site sends a transaction — …" (promoted strip)
   - `config/syndicateFacts.ts:308` — "no transaction is ever initiated, signed, or submitted here"
   - `config/syndicateFacts.ts:337` — "No buy flow is wired in this app; receipts are read, never minted here."
   - `config/modules.ts:185` — join module card "read-only; no transaction is sent from this app."
   - `config/moduleRegistry.ts:134` — membership-join STATE note (self-declares it must be rewritten)
   - `config/surfaceClassification.ts:213` — /join summary "…exact read-only quote. No transaction path."
   - `lib/seo-route-registry.ts:162` — /join SEO title "…Exact Read-Only Quote"
   - `lib/seo-route-registry.ts:164` — /join SEO description "Read-only: no transaction is initiated…"
   - `content/guide-content.ts:25` — /join guide blurb "…Nothing is signed here."
   - `content/docs-content.ts:76` — /join docs purpose "…read-only entry quote before anything is signed."
   - `content/faq-content.ts:98,106,114` — the three join answers were RECONCILED to read-only on
     2026-07-13 (Group A fix); at the flip they must be rewritten AGAIN to the live-buy truth.
   - `pages/Whitepaper.tsx:166` — §05 "…no transaction is sent from this app."
   - `config/routeMemory.ts:66` — "No buy flow or transaction is wired" (ledger, guard-exempt — accuracy only)

   API-SERVER (served strings — rendered on /status, /map, /join via /api/protocol/reality):
   - `src/data/sourceStatus.ts:185` — "No transaction path is exposed anywhere."
   - `src/data/sourceStatus.ts:335` — buyReadiness note "Transaction sending is deliberately not enabled…"
   - `src/data/protocolTargets.ts:121,129,137` — "Read-only; no wallet or write surface is enabled in this app."
   - `scripts/verify-canon-integrity.ts:316-318` — guard pins `buyReadiness === "NOT_WIRED"`: update in
     LOCKSTEP (else it lies, or blocks the flip build).

   SELF-HEALING (verify only): `pages/JoinProtocol.tsx:709,712` — the "Not enabled here" card is
   inside `CHECKOUT_ENABLED ? null : (…)` and vanishes at the flip.

   STAYS TRUE (verified — do NOT change): /member "read-only self-readback" claims, /map, homepage
   simulated previews (`syndicateFacts.ts:597,464,504`, `HeroLedger.tsx:262`), source link-builder,
   `chainReads.ts` "never signs" (the read client genuinely never signs), api-server route comments.
7. **surfaceClassification** for /join — check the class still holds (guard:coverage will fail
   loudly if not).
8. **Docs same-commit**: SESSION_STATE (C5 SEALED line + "go-live done" state), OPEN_QUEUE group A,
   DESIGN_ROADMAP /join line, this handoff ticked.

## Infra notes for the founder / Replit (from the 2026-07-13 audit fixes)
- **Instance pinning (sessions/nonces are in-process memory):** `.replit [deployment]` has NO
  in-repo key for autoscale instance count — it is a DASHBOARD setting. The founder must set
  **max instances = 1** in the Replit deployment settings (Q21's Reserved-VM/single-instance
  remains the durable fix).
- **Anti-framing for PAGES:** `frame-ancestors` is ignored in a meta CSP by spec. The pages'
  CSP ships as prerendered meta (done); X-Frame-Options/frame-ancestors for the static pages
  must be added at the REPLIT SERVING LAYER (Replit states what its static host supports; the
  API already sends X-Frame-Options: DENY server-side).
- **CSP watch item at first publish:** the pages' CSP is strict on scripts (`script-src 'self'`)
  and deliberately scheme-wide on connections (`connect-src 'self' https: wss:`) so wallet
  connect cannot silently break. After publish, verify in the browser console: zero CSP
  violations on home, /join quote flow, and a wallet CONNECT attempt.

## Q21 — verify before the flip
The auth zone ALREADY looks live in prod (the header shows "Member sign-in"; SIWE worked 2026-07-11).
Confirm Q21 is genuinely done (single-instance/Reserved-VM on Replit) or complete it with Replit —
the checkout itself needs only wallet CONNECT (works with auth dark), but the member recognition of
the new buyer's seat needs the auth zone.

## After the commit — the two founder acts
1. **Replit publish** ("pull main, deploy, report" — no migrations).
2. **The founder's $5 real test — THROUGH THE REFERRAL LINK (founder decision 2026-07-13; active
   referral IS MVP):** buy via
   `/join?source=0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620`
   (the ACTIVE BUILDER_SOURCE, 5% LIFETIME). Two proofs in ONE tx: the checkout (two SEPARATE
   signatures, seat from the receipt event — expected **seat #13**) AND the real on-chain
   introduction payment ($0.25 pushed to the payoutWallet in the same tx, explorer-verifiable;
   net $4.75 split 70/20/10). **Test-wallet conditions (contract rules):** NOT the
   payoutWallet/sourceWallet (`0x2445…9C721` — self-referral would silently drop the source line);
   NOT an unclaimed historical wallet (the C1.3 gate would BLOCK the buy — correct behavior, wrong
   test); holds $5 USDC + AVAX for gas. Then verify live: memberCount 12→13 everywhere by itself,
   the honest readback recomputes to **13 seats / 12 distinct wallets**, and the referrer line
   matches the on-chain payment.
3. Rollback if anything is wrong: flip the literal back — one commit, one deploy.
4. **Then the post-C5 queue (OPEN_QUEUE): the REFERRAL PUBLIC ACTIVATION slice** (founder-gated) —
   `programLifecycle` switch + copy + member cards + the `guard-safe-source` adaptation proposed IN
   the slice (anti-blocking law).

## Verification limits (say them honestly)
The approve→buy path CANNOT be exercised by any test harness — no test wallet exists and none
should. The founder's $5 test IS the verification. Everything around it (gate, reads, quote,
folding) is already guard-covered and live-verified.
