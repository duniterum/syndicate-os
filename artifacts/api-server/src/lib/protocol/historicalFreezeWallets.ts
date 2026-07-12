/**
 * The 8 historical-member freeze wallets — SERVER-ONLY input for the honest
 * distinct-wallet readback. NEVER EMITTED.
 * ---------------------------------------------------------------------------
 * WHY THE SERVER HOLDS THIS: the public member figure must tell the WHOLE
 * truth — memberCount() counts SEATS, not people. One wallet already holds two
 * seats (historical #7 bought on V3 before the claim gate existed and was
 * minted seat #11, irreversibly). Founder decision: SHOW BOTH — "N seats
 * issued · M distinct wallets · K wallet(s) hold two seats" — derived live,
 * never a typed literal, never silently "fixed".
 *
 * HOW IT IS USED (realityService §5b): for each wallet below the spine reads
 * the live engine's memberNumberOf(wallet). A value ABOVE GENESIS_OFFSET means
 * that historical wallet bought a V3 seat instead of claiming — one overlap.
 * distinctWallets = memberCount − overlap. Exactly 8 reads, constant forever.
 *
 * ADDRESS-EMISSION DISCIPLINE (ADR-003 + CANON_VISIBILITY_LAW): this mapping
 * is memberNumber→wallet material and stays SERVER-ONLY — only derived COUNTS
 * enter the served envelope; no wallet below may ever appear in a served
 * payload (the envelope's no-address-leak checks stand guard). The wallets
 * themselves are public chain data (emitted by V1/V2 purchase events, frozen
 * behind the on-chain V1_MEMBER_ROOT), so holding them is lawful — emitting
 * them from the server is what stays forbidden.
 *
 * PROVENANCE: freeze block 88496414, chain 43114 — the same artifact behind
 * PART_B_EXPECTATIONS.expectedRoot (0x6d81a7…3329 == the live V3
 * V1_MEMBER_ROOT(), triple-match-verified 2026-07-02) and behind the studio
 * C1.3 gate (artifacts/studio/src/lib/historicalMembers.ts), which re-folds
 * the full Merkle proofs to the LIVE root on every gate verdict. A frozen set
 * is not a stale snapshot: the root is an immutable constructor constant.
 */

export interface HistoricalFreezeWallet {
  /** Historical member number (1..8) committed by the on-chain root. */
  readonly memberNumber: number;
  /** The wallet — SERVER-ONLY; never emitted, only derived counts leave. */
  readonly wallet: string;
}

export const HISTORICAL_FREEZE_WALLETS: readonly HistoricalFreezeWallet[] = [
  { memberNumber: 1, wallet: "0x244531C571966f90f4849e03a507543d90f9C721" },
  { memberNumber: 2, wallet: "0x3488857b003104e2B08A1D198f8a23BFF28B0045" },
  { memberNumber: 3, wallet: "0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0" },
  { memberNumber: 4, wallet: "0x3b1396B1ff61b79C742751CfB6f0f04eAc25Ec6a" },
  { memberNumber: 5, wallet: "0x5734C19D1907857d1e54F95D12300e2fc7B0C2cD" },
  { memberNumber: 6, wallet: "0x8DeB56b4db62f48A6E1bC226220E24845B592Cb9" },
  // #7 — the known production overlap: bought on V3 without claiming and also
  // holds seat #11 (memberNumberOf = 11 live). The derivation COUNTS this; it
  // never names it in any served payload.
  { memberNumber: 7, wallet: "0x3FF01A0c3e70101bFb1dBb3742e135E7eD9e894F" },
  { memberNumber: 8, wallet: "0xAb87e74Ff69Ee0B6C1A73B884a80b737988DE081" },
] as const;
