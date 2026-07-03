// Wallet Session Preview Hard Gate — build-time flag for the S2 wallet
// session shell (dev-only SIWE session UI).
// ---------------------------------------------------------------------------
// Production is a static SPA build (no server), and the auth zone is
// production-dark by default (server-side exposure gate on the api-server;
// that flag is server posture and is deliberately never named in frontend
// code). Shipping wallet-session UI in the public bundle would therefore be
// dishonest: it would render controls that can never work. The only honest
// gate is a BUILD-TIME one: when this constant folds to `false`, the wallet
// session module is dead-code-eliminated by Rollup — no wallet UI, no auth
// URL strings, no SIWE code in the production bundle at all. The auth-zone
// guard's studio dist-grep is the regression net.
//
// Posture:
//   - Workspace/dev server (`vite dev`): `import.meta.env.DEV` is true →
//     wallet session preview ENABLED (SIWE end-to-end against the dev api).
//   - Production build (default): DISABLED and code-excluded. Safe by default.
//   - Explicit founder-enabled build: set `VITE_WALLET_SESSION_PREVIEW=true`
//     in the BUILD environment (a founder-gated act, paired with the server's
//     own exposure gate — flipping either side alone is not enough).
//
// This is a visibility gate, not authentication. A session proves wallet
// control right now — never membership, never authority (S4 is the ceiling).

export const WALLET_SESSION_PREVIEW_ENABLED: boolean =
  import.meta.env.DEV || __WALLET_SESSION_PREVIEW__;
