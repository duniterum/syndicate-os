// Wallet Session Gate — PUBLIC (founder-approved Public Online Integration
// MVP, July 2026).
// ---------------------------------------------------------------------------
// The S2 wallet session shell (SIWE sign-in) is now part of the public
// product surface: it ships in every build, including production-default
// builds. The auth-zone guard's studio dist-grep now REQUIRES the wallet
// chunk's strings in a production dist (the flip of the old expectation).
//
// What this gate is NOT:
//   - Not authentication. A session proves wallet control right now — never
//     membership, never authority (S4 is the ceiling; S1 is the fail-closed
//     boot default).
//   - Not a server exposure switch. The api-server auth zone has its own
//     server-side production gate (a founder-gated act, deliberately never
//     named in frontend code). If the server zone is dark, the UI fails
//     closed to S1 with honest copy — it never invents a session.
//
// The constant remains so call sites keep a single import point; it now
// folds to `true` everywhere and the module is always included.

export const WALLET_SESSION_PREVIEW_ENABLED: boolean = true;
