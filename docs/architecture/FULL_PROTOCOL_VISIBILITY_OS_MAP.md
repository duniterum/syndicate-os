# Full Protocol Visibility — OS Map (Internal Founder Preview)

**Route:** `/os-map` (console `Shell`, sidebar "OS Map")
**Status:** INTERNAL FOUNDER PREVIEW — not a live product surface. Registered `INTERNAL`/noindex in the SEO route registry; classified `OPERATOR_PREVIEW` / `PRIVATE_OPERATOR_ADMIN` / `console`.

## What it is

One page mapping the FULL protocol organism — every subsystem the OS knows about, each carrying its honest status. It is a walking skeleton for Full Protocol Visibility: the structure is real and lockstepped into every route registry; the statuses are bound, not invented.

## Vocabulary discipline (no new canon)

The map mints **zero** new status vocabulary. Every node binds to one of the two existing systems in `src/config/truthStatus.ts`:

- `{ kind: "surface", surfaceId }` → renders `TruthLabel` from `surfaceStatus[surfaceId]` (the one cross-page `TruthStatus` map).
- `{ kind: "lifecycle", lifecycle }` → renders `displayLifecycleText[lifecycle]` (the existing `DisplayLifecycle` vocabulary, which projects onto canonical `SourcePosture`).

Plus one boolean: `notPublic` — marks server-only subsystems (Part A raw index, Protocol Time cache, Part B freeze, member continuity) that have **no public UI/API surface and must not get one without founder approval**. Rendered as a "SERVER-ONLY — NO PUBLIC SURFACE" chip.

## Data discipline

- The page is config-driven copy (`src/config/protocolOsMap.ts`). Since the founder-approved live-proof-binding slice (2026-07-02), the **4 Chain Reality Spine nodes only** additionally render live read-only signals from the existing public `GET /api/protocol/reality` endpoint via a pure operator-gated adapter (`src/operator/protocolRealityEvidence.ts` + `LiveEvidencePanel.tsx`) — fail-closed ("LIVE PROOF UNAVAILABLE — static doctrine retained" on fetch failure), endpoint payload unchanged, every node carries a data-exposure classification chip, and the payload `archive` group is deliberately unbound (founder-deferred). All other nodes remain static/status-only.
- `asOf` strings are operator-script-reported figures: counts and dates ONLY (never wallets, hashes, addresses). They state their own provenance and date, so they cannot masquerade as live reads.
- No wallet, decodedJson/rawJson, address, or hash material appears anywhere in the config or page.

## Route lockstep (5 files)

Adding `/os-map` touched the full lockstep set, keeping every registry in agreement:

1. `src/App.tsx` — route under console `Shell`
2. `src/lib/seo-route-registry.ts` — `INTERNAL` entry (noindex, no sitemap)
3. `src/config/surfaceClassification.ts` — `OPERATOR_PREVIEW` / `console` entry
4. `src/config/modules.ts` — `os-map` module (zone `studio`, sidebar nav, `DESIGN_PREVIEW`)
5. `src/pages/OsMap.tsx` — the page

All eight studio guards (`lifecycle`, `copy`, `source`, `coverage`, `drift`, `posture`, `live`, `opgate`) must pass with the new route; the coverage guard forces console layout → `OPERATOR_PREVIEW` audience.

## Later (not this slice)

~~Binding nodes to live spine reads~~ (completed 2026-07-02 as a separate founder-approved slice — see Data discipline above). Per-node drill-down routes, binding the payload `archive` group, and any member/public projection of the map remain separate founder-gated decisions.
