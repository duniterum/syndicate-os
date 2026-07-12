// The founder's GO-LIVE switch for the REAL purchase path (C2 approve→buy).
// ---------------------------------------------------------------------------
// BUILD ≠ GO-LIVE (Compass / carte-blanche doctrine): building the checkout is
// authorized; PUBLISHING it is a founder act. The approve→buy flow is fully
// built and ships OFF. Flipping this literal to `true` — its own commit, its
// own deploy, decided by the founder — is what turns the real-money path on.
//
// A literal (never an env read, never a runtime signal) so the bundler folds
// the dead branch out of default builds while false.
//
// STATE: FLIPPED TO TRUE — the C5 GO-LIVE, ordered by the founder 2026-07-13
// after the full pre-flip audit (Group A fixed + Groups B/C triaged). The same
// commit rewrites every read-only claim (the C5 MUST-CHANGE table). Rollback =
// flip back to false, one commit, one deploy.
export const CHECKOUT_ENABLED: boolean = true;
