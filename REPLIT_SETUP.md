# REPLIT SETUP — The Syndicate OS with Claude

This is a **pnpm monorepo** (packageManager `pnpm@10.26.1`). Two apps:
- `artifacts/studio` (`@workspace/studio`) — React + Vite public app + operator console. **This is the site to publish.**
- `artifacts/api-server` (`@workspace/api-server`) — Express backend, read-only, fail-closed.
- `lib/*` — shared packages (os-contracts, db, api-spec, api-zod, api-client-react).

Read `docs/SYNDICATE_OS_BUILD_INVENTORY_AND_VOCABULARY.md` and `THE_SYNDICATE_OS_COMPASS.md` first — they explain the whole system in one canonical vocabulary.

---

## 1. Import (human, ~3 min)
1. Go to **replit.com/import** → select **ZIP** → upload this `.zip`.
2. Name the workspace **The Syndicate OS with Claude**.
3. Add secrets when asked (see §4). You can skip them for a first boot — the app runs read-only without them.
4. Select **Import**.

## 2. Paste this to the Replit Agent
> This is an existing pnpm monorepo (`pnpm@10.26.1`) named "The Syndicate OS with Claude". Do NOT scaffold a new app.
> Steps: (1) run `pnpm install` at the repo root. (2) Verify integrity: `pnpm --filter @workspace/studio run guards` and `pnpm --filter @workspace/studio run typecheck`, plus `pnpm --filter @workspace/api-server run verify:canon` — all must pass. (3) Run the studio dev server: `pnpm --filter @workspace/studio dev` (Vite, host 0.0.0.0). (4) Run the backend: `pnpm --filter @workspace/api-server dev`. (5) For publishing, build the studio (`pnpm --filter @workspace/studio build`) and deploy it as a static web app so it's visible online.
> Rules you MUST follow: this is a read-only, truth-labelled foundation. Do NOT fabricate live data, do NOT remove any guard script or truth label, do NOT weaken `pnpm-workspace.yaml` `minimumReleaseAge`, and do NOT print or commit secrets. The referral and admin features are intentionally in "preview / paused" state — leave them paused. If a guard fails, fix the cause, never the guard.

## 3. Commands (reference)
```bash
pnpm install                                   # root, installs all workspaces
pnpm --filter @workspace/studio dev            # public app (Vite, 0.0.0.0)
pnpm --filter @workspace/studio build          # production build → publish this
pnpm --filter @workspace/studio run guards     # 9 truth/safety guards (must pass)
pnpm --filter @workspace/studio typecheck      # tsc --noEmit
pnpm --filter @workspace/api-server dev         # backend (build + start)
pnpm --filter @workspace/api-server run verify:canon
```

## 4. Secrets / env (server-side only — never VITE_-prefixed, never committed)
Only needed to turn on **live chain reads** (Phase 4); the app runs read-only without them.
```
AVALANCHE_RPC_URL=<your Avalanche C-Chain HTTPS RPC endpoint>
AVALANCHE_RPC_URL_FALLBACK=https://api.avax.network/ext/bc/C/rpc
AVALANCHE_RPC_TIMEOUT_MS=8000
```
Then verify the chain: `pnpm --filter @workspace/api-server run live-read:check`.

## 5. Publish to GitHub (under duniterum)
In Replit: **Version Control** tab (branch icon) → connect GitHub → **Publish to GitHub** → repo name (e.g. `syndicate-os`) under the **duniterum** account → Publish. For later changes: write a commit message → **Commit & Push**.

## 6. Non-negotiables (the product spine)
No fake-live data · no public PII (wallet↔member number never exposed) · no yield/APY/ROI/passive-income/casino framing · single canon each (routes, events, postures) · Cesium excluded · referral commission is a transparent acquisition payment, never passive income/yield/downline/profit promise. The guards enforce all of this — keep them green.
