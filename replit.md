# The Syndicate Studio OS

A premium, proof-first web foundation for The Syndicate — a membership/recognition protocol. The app is deliberately a **read-only foundation**: a real public homepage plus an operator console ("Studio OS / Proof OS"), where every value that is not wired to a real source is visibly truth-labelled. No protocol data, contracts, chain, or backend are wired yet.

## Run & Operate

- `pnpm --filter @workspace/studio run dev` — run the web app (uses workflow-injected `PORT`/`BASE_PATH`; prefer the `artifacts/studio: web` workflow)
- `pnpm --filter @workspace/studio run typecheck` — typecheck the web app (verify with this, not `build`, from a shell)
- `pnpm --filter @workspace/api-server run dev` — run the API server (`/api`, `GET /api/healthz`)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Web: React + Vite, wouter (routing), Tailwind v4, shadcn/ui, framer-motion, lucide-react
- API: Express 5 (only a health check is real)
- DB: PostgreSQL + Drizzle ORM (schema empty — not used yet)

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

`/` public homepage · `/studio` console overview · `/proof` · `/proof-studio` · `/member` · `/founder` · `/source` · `/recognition` · `/learning` · `/status` (honesty hub). API: `GET /api/healthz`.

## Architecture decisions

- Two layouts, one app: a public marketing experience at `/` (normal scroll, header/footer) and a denser operator console (sidebar `Shell`) under `/studio` and its sub-routes.
- Radical honesty is the product: every non-real value renders a `TruthLabel`; there is no fake protocol data anywhere.
- Strictly front-end so far — no backend writes, no DB schema, no chain/RPC, no contracts.

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
- Verify the web app with `pnpm --filter @workspace/studio run typecheck`, not `build` (build needs workflow-injected `PORT`/`BASE_PATH`).
- Theme: `main.tsx` no longer force-adds `.dark`; `ThemeProvider` owns the class (default dark). Keep `TruthLabel` variants dual-mode (light + `dark:`).

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
