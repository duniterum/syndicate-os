// joinAmounts.ts — the featured membership amounts on /join.
//
// AMOUNTS ONLY. No names, no badges, no tiers, no bands, no ranks. The seat is
// BINARY — $5 and $10,000 buy THE SAME seat; a named ladder would assert member
// categories that do not exist (settled naming law; see the SESSION_STATE
// poisoned-canon flag on RANKS_V2). The visitor reads a price and clicks.
//
// The numbers mirror the canon PURCHASE_PRESETS_USDC; $5 is exactly the on-chain
// era-1 minimum (MembershipSaleV3 _eraParams era 1 = min 5_000_000 = $5).
// Hardcoded for this slice — an admin surface to edit them was priced, not built
// (Q9). STATE (today): these amounts are hardcoded; a later slice may make them
// founder-editable via the existing operator write pattern.
export const JOIN_AMOUNTS_USDC: readonly number[] = [
  5, 10, 25, 50, 75, 100, 250, 500, 1000,
];
