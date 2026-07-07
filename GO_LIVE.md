# GO LIVE — turning on real on-chain data

**QuickNode is not a package to install.** It is an RPC endpoint (a URL). The read machinery is already in the
repo. Going live = (1) set the RPC secret, (2) make sure the api-server actually runs, (3) verify.

## Step 1 — set the RPC as a Secret (server-side only)
In Replit: **Tools → Secrets**, add:
```
AVALANCHE_RPC_URL           = <your QuickNode Avalanche C-Chain HTTPS endpoint>
AVALANCHE_RPC_URL_FALLBACK  = https://api.avax.network/ext/bc/C/rpc
AVALANCHE_RPC_TIMEOUT_MS    = 8000
```
- **Never** put the QuickNode URL in `VITE_AVALANCHE_RPC_URL` — `VITE_`-prefixed vars are bundled into the public
  site and would expose your token. Keep the secret one server-side (`AVALANCHE_RPC_URL`) for the api-server.
- For **client-side** public reads (token supply, LP reserves), you may set `VITE_AVALANCHE_RPC_URL` to a *public*
  endpoint only (e.g. the Avalanche public RPC) — never the secret QuickNode URL.
- Rotate the QuickNode token if it has ever been shared in plain text.

## Step 2 — make sure the api-server RUNS (production disposition)
The api-server (`@workspace/api-server`) is an Express server. In production it must run as a **server deployment**
(Replit **Reserved VM** or **Autoscale**), not a static site — a static deploy can't run Express, and then `/api/*`
returns nothing. Ensure both are up: the studio (frontend) and the api-server (backend), with the frontend calling
the backend's `/api/*`.

## Step 3 — verify the chain is live
```
pnpm --filter @workspace/api-server run live-read:check
```
This calls your RPC, checks `chainId === 43114`, and confirms each canon contract is deployed. It is fail-closed:
a bad RPC returns an explicit "unavailable", never a fake success. Paste the output to confirm.

Optionally build the real read-models:
```
pnpm --filter @workspace/api-server run holder-index:build
pnpm --filter @workspace/api-server run sale-index
```

## What becomes LIVE immediately (once the RPC + api-server are up)
- **Protocol reality** (`/api/protocol/reality`): chain, contracts, tokens, sale, source posture — read on-chain.
- **Source validation** (`/api/source-validate`): validates a source ID against SourceRegistryV1, live.
- **Token/sale/holder reads** via the indexers.
- The "paused / active" posture on these surfaces becomes **chain-derived truth**, not a hardcoded label.

## What stays SAMPLE or PAUSED (honest — needs more than the RPC)
- **Referral member stats / history / share-card figures:** still `*Sample` until the referral **read-model
  adapters** are wired (they need active source records on-chain + an indexer). The RPC alone doesn't fill them.
- **All admin WRITE controls** (Save, Invite, Approve, Send, toggles): stay preview until **Phase 3** (auth + DB).
- **The public referral program itself:** stays **paused** until you (founder) choose to activate it — that's a
  business decision, deliberately separate from whether the chain is technically live.

## The doctrine that keeps "live mode" honest
Where a value is live → show it. Where it isn't yet → it stays **truth-labelled** ("Not live yet" / "Sample"),
never faked. That is exactly what lets you run in production without lying. Keep the guards green.
