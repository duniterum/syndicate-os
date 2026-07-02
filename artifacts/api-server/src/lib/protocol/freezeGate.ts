/**
 * Historical Freeze Gate (SERVED, canon-free) — Sprint 2B-Part B.
 * ---------------------------------------------------------------
 * A STATUS module, not an importer. Part B (historical-member continuity) is
 * now VERIFIED: the canonical freeze artifact passed the full fail-closed
 * import gate and was imported — once — into the server-only database
 * (1 freeze row + 8 member rows).
 *
 * FLIP SEMANTICS (founder-approved): this served module is STATIC. It performs
 * NO runtime DB read — served code never imports @workspace/db. The VERIFIED
 * value below was derived by the gated import run and is re-reconciled against
 * the database by the scripts-side reconciler (`freeze-gate:status`), which
 * FAILS CLOSED: if the DB ever stops supporting VERIFIED, that script exits
 * non-zero and this constant must be flipped back to BLOCKED.
 *
 * Corrected V1 doctrine (still true, now satisfied by the import): the V1
 * `TokensPurchased` event has NO memberNumber field. V1 seats #1–#2 were
 * assigned by the freeze/root process via first-seen ordering — they were
 * IMPORTED from the verified canonical artifact, never inferred from raw events.
 *
 * PRIVACY BOUNDARY (unchanged): the imported member data (wallets, first
 * transactions, leaves, proofs) is SERVER-ONLY PII. This module contains NO
 * addresses, NO member data, and emits nothing to any public payload. No
 * public member/seat/proof surface exists or is implied — that would require
 * a separate founder publish decision.
 */

export type FreezeGateStatus = "BLOCKED" | "VERIFIED";

export type FreezeGate = {
  status: FreezeGateStatus;
  /** One-line honest summary safe to log. */
  summary: string;
  /** The corrected V1 member-numbering doctrine (see file header). */
  v1Doctrine: string;
  /** What VERIFIED rests on (address-free, aggregate facts only). */
  verifiedBasis: readonly string[];
  /** How this static value stays honest without a runtime DB read. */
  reconciliation: string;
  /** Hard boundaries that remain in force after the import. */
  boundaries: readonly string[];
};

export const HISTORICAL_FREEZE_GATE: FreezeGate = {
  status: "VERIFIED",
  summary:
    "Historical-member continuity (Part B) is VERIFIED: the canonical freeze artifact (8 members, freeze block 88496414) passed the fail-closed import gate — live on-chain V1_MEMBER_ROOT match, full Merkle recompute, raw-index reconciliation — and was imported once into the server-only database.",
  v1Doctrine:
    "V1 TokensPurchased carries NO memberNumber. V1 seats #1–#2 were assigned by the historical-member freeze/root process via first-seen ordering — imported from the verified canonical artifact, never derived from raw V1 events.",
  verifiedBasis: [
    "Artifact pinned to its authoring commit in the canonical public repo (never mutable main), fetched in-memory only.",
    "Root triple-match: artifact root == independent full Merkle recompute == LIVE on-chain V1_MEMBER_ROOT() on the active V3 engine (read-only eth_call, chain probe first).",
    "All 8 leaves recomputed and all 8 Merkle proofs verified; strict EIP-55 checksum policy; first-seen ordering doctrine checked.",
    "Raw Part A reconciliation: V1 2 distinct buyers, V2A {3,4,5}, V2B {6,7,8} (sentinel memberNumber=0 excluded), V3 {9,10} post-freeze corroboration; every member's first transaction exists in the raw index.",
    "Single-transaction import: 1 freeze row (validation_status VERIFIED, enforced by CHECK) + 8 member rows (member_number 1..8, CHECK >= 1, unique lower(wallet)); replay is exact-match no-op or hard fail.",
  ],
  reconciliation:
    "Served code performs NO runtime DB read. The scripts-side reconciler (freeze-gate:status) re-derives the gate from the database and FAILS CLOSED (non-zero exit) if the DB no longer supports VERIFIED; on such failure this static value must revert to BLOCKED.",
  boundaries: [
    "Imported member data (wallets, transactions, leaves, proofs) is SERVER-ONLY PII — no public UI/API/projection of members, seats, or proofs.",
    "No member_continuity table, no holder index, no identity attribution — separate founder-gated phases.",
    "Never regenerate or renumber the member list; the imported artifact + on-chain root remain the only authority.",
  ],
};
