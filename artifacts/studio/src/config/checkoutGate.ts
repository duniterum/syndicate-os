// The founder's GO-LIVE switch for the REAL purchase path (C2 approve→buy).
// ---------------------------------------------------------------------------
// BUILD ≠ GO-LIVE (Compass / carte-blanche doctrine): building the checkout is
// authorized; PUBLISHING it is a founder act. The approve→buy flow is fully
// built and ships OFF. Flipping this literal to `true` — its own commit, its
// own deploy, decided by the founder — is what turns the real-money path on.
//
// A literal (never an env read, never a runtime signal) so the bundler folds
// the dead branch out of default builds: while false, JoinProtocol never even
// references the checkout chunk.
export const CHECKOUT_ENABLED: boolean = false;
