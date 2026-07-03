# The Syndicate Studio OS

First read for agents/operators: THE_SYNDICATE_OS_COMPASS.md — meta-canon router; source docs win on conflict.

A premium, proof-first web foundation for The Syndicate — a membership/recognition protocol. The app is deliberately a **read-only foundation**: a real public homepage plus an operator console ("Studio OS / Proof OS"), where every value that is not wired to a real source is visibly truth-labelled. The only wired reality is a server-side, **read-only Protocol Reality Spine** that reconciles live Avalanche C-Chain reads (chain identity, contract-code presence, ERC-20 metadata, archive posture, and read-only membership-sale state — lifecycle flags plus the active V3 engine's public figures, surfaced as EXACT raw base-unit strings) against vendored canon and surfaces them as truth-labelled envelopes. No writes, wallet, purchase, referral, receipts, or activity are wired; the only economic values present are these read-only public sale figures (available SYN, gross USDC received, receipt count), and no purchase/referral surface exists in the app.

## Run & Operate

- `pnpm --filter @workspace/studio run dev` — run the web app (uses workflow-injected `PORT`/`BASE_PATH`; prefer the `artifacts/studio: web` workflow)
- `pnpm --filter @workspace/studio run typecheck` — typecheck the web app (verify with this, not `build`, from a shell)
- `pnpm --filter @workspace/api-server run dev` — run the API server (`/api`, `GET /api/healthz`)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React + Vite, wouter (routing), Tailwind v4, shadcn/ui, framer-motion, lucide-react
- API: Express 5 — health check plus a read-only Protocol Reality Spine (`GET /api/protocol/reality`, `GET /api/source-status`); no write endpoints
- DB: PostgreSQL + Drizzle ORM — sale-event raw index (Part A), server-only Part B tables `historical_member_freeze` / `historical_member` (verified historical-member freeze; wallet PII, never exposed via any UI/API), and `block_timestamp` (Protocol Time: chain-verified timestamp cache for indexed blocks; written only by the founder-gated `protocol-time:enrich` script, never read by served code)

## Where things live

- `artifacts/studio` — the web app (public homepage + Studio OS console)
  - `src/App.tsx` — route table; `/` uses `PublicLayout`, console routes use `Shell`
  - `src/components/layout/PublicLayout.tsx` — public marketing chrome (header/nav/footer)
  - `src/components/layout/Shell.tsx` — console sidebar shell + `DataStatusNote`
  - `src/pages/PublicHome.tsx` — public homepage at `/`
  - `src/pages/Home.tsx` — console overview at `/studio`
  - `src/components/TruthLabel.tsx` — the truth-label chip system (source of truth for honesty labels)
  - `src/components/ThemeProvider.tsx` / `ThemeToggle.tsx` — light/dark theming (default dark, persisted to `localStorage`)
  - `src/index.css` — theme tokens: `:root` = light, `.dark` = dark
- `artifacts/api-server` — Express API (`/api`)
- `artifacts/mockup-sandbox` — design sandbox (`/__mockup`), unrelated to the product

## Routes

`/` public homepage · `/studio` console overview · `/proof` · `/proof-studio` · `/member` · `/founder` · `/source` · `/os-map` (internal founder preview: full-protocol OS map; the 4 Chain Reality Spine nodes are live-bound read-only to `GET /api/protocol/reality` via `src/operator/protocolRealityEvidence.ts` + `LiveEvidencePanel.tsx` — fail-closed "LIVE PROOF UNAVAILABLE" on fetch failure, every node carries a data-exposure classification chip, payload `archive` group deliberately unbound) · `/recognition` · `/learning` · `/status` (honesty hub). API: `GET /api/healthz` · `GET /api/protocol/reality` (live read-only chain + sale-engine reality) · `GET /api/source-status` (static posture ledger).

## Architecture decisions

- Two layouts, one app: a public marketing experience at `/` (normal scroll, header/footer) and a denser operator console (sidebar `Shell`) under `/studio` and its sub-routes.
- Radical honesty is the product: every non-real value renders a `TruthLabel`; there is no fake protocol data anywhere.
- Served backend is read-only: no write endpoints, no runtime DB writes. DB rows exist only via founder-gated one-time scripts (Part A raw sale-event index, Part B historical-member freeze import); served code never writes. Part B member data (wallets, first transactions, leaves, proofs) is server-only PII with no public UI/API/projection; `freezeGate.ts` is a static served module (no runtime DB read) reconciled by `freeze-gate:status`, which fails closed. The core backend reality is an Avalanche read-only reconciliation spine (live `eth_chainId` / `eth_getCode` / `eth_call`) that never issues state-changing calls, never connects a wallet, keeps contract addresses server-side, and fails closed (canon mismatch → `null`, never a normalized/invented value). Contracts, ABIs, and addresses live as vendored canon in `artifacts/api-server/src/canon/` (tsconfig-excluded).
- Read-only sale group: the spine surfaces membership-sale state as a `sale` group — paused/concluded lifecycle flags for V1/V2/V3 and, for the **active** V3 engine only, three public figures (available SYN @18dec, gross USDC received @6dec, receipt count) as EXACT raw base-unit **strings** (never humanized; no `bigint`→`number` precision loss). Each signal fails closed independently (wrong-chain/no-code/decode-fail → `null` + reason). V3 must never be labelled pending/inactive — the contract is live and readable; the app boundary (no wallet/purchase/referral UI) and the source/referral wiring (a later sprint) are separate concerns.

## Homepage Governance

Rules for `/` (`PublicHome.tsx`) to keep it a curated front door, not an ever-growing dump:

1. `/` is a curated public **front door**, not the archive of everything.
2. The homepage stays capped at the current fixed section model: **Hero · Promoted Strip · How-It-Works · Real-vs-Pending Summary · Studio Teaser · Expectations**.
3. The Promoted Strip stays capped at **4 cards**. Adding one requires removing/replacing one.
4. New modules do **not** automatically get a homepage section.
5. Module depth belongs on module routes (`/proof`, `/source`, `/recognition`, `/learning`, `/studio`, `/status`, etc.) — `/` summarizes and links out.
6. `/status` is the authoritative wiring/status ledger (every module's truth status lives there).
7. Homepage copy should come from `syndicateFacts.ts` / `brand.ts` where practical, not inline strings.
8. Homepage truth labels/statuses should be bound to `surfaceStatus` / `truthStatus` where practical — no new inline status literals.
9. Live values never appear on `/` without a `TruthLabel`.
10. If future homepage expansion is needed, inspect first and propose whether to extend `syndicateFacts.ts` before adding new files like `homepageSections.ts`.

> Deferred (not done yet): the optional binding cleanup (bind hero `badge`/`coreStatus` to `surfaceStatus`; move stray inline strings/status literals in `PublicHome.tsx` into config). Do this the next time homepage code is edited, not as a standalone change.

## Product

Public front door explains membership + public proof + "take your seat", with honest "what's real vs awaiting source" surfaces. The Studio OS console is the operator-facing proof shell, ready for future source wiring (Phase 2).

## User preferences

- Strict multi-phase, founder-controlled workflow. Do not jump ahead phases or wire real data/contracts without explicit approval and a verified real source.
- Visual direction: premium, institutional, calm, proof-first (deep navy/black + cyan/blue accent in dark; clean institutional light). Not casino/DeFi/meme.

## Gotchas

- **Forbidden product copy** (must never appear in UI): profit, yield, return (financial), payout, passive income, guaranteed benefit, earn/claim rewards, reward pool, farming, liquidity mining, airdrop farming, jackpot, win big, betting, wager. Never frame SYN as investment upside.
- **Recognition vocabulary (founder-locked):** prefer "Top Recognized Member / Member Standing / Protocol Recognition / Syndicate Rank / Recognition Index"; avoid "contributor(s)" and ambiguous "contribution" phrasing that implies unpaid labor/charity/open-source. Recognition = member-status logic. Business mechanics (membership acquisition, treasury routing, referral-as-verified-introduction, analytics) are preserved — only unsafe financial framing/patterns are rejected (doctrine: `docs/architecture/CAPABILITY_HARVEST_AND_REUSE_MAP.md`).
- Verify the web app with `pnpm --filter @workspace/studio run typecheck`, not `build` (build needs workflow-injected `PORT`/`BASE_PATH`).
- Theme: `main.tsx` no longer force-adds `.dark`; `ThemeProvider` owns the class (default dark). Keep `TruthLabel` variants dual-mode (light + `dark:`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
