// config/liquidityPool.ts — the /liquidity surface's copy + VERIFIED links.
// ---------------------------------------------------------------------------
// Origin harvest (TheSyndicate liquidity.tsx + LiquidityActionRail +
// WhyLpMatters + LpStatus — ADAPTED to our tokens/chassis, never copied raw).
//
// LINK VERIFICATION (2026-07-14, this slice — a dead URL is reported, never
// wired blind):
//   · DexScreener pair page: FOUNDER-VERIFIED IN BROWSER (loads the SYN/USDC
//     chart). NOTE, honestly reported: DexScreener's public API returns
//     pairs:null for this pair (micro-liquidity pairs are not API-indexed);
//     the WEB page is the verified artifact, the API cross-check could not
//     confirm. EXTERNAL posture either way.
//   · Trade + Add Liquidity (traderjoexyz.com, the origin's URLs): both
//     HTTP 200 this session (curl with browser UA; the 403 on HEAD is bot
//     filtering, not a dead link).
//   · Verify Pair: the server's verify-links lpPair entry (never hardcoded
//     client-side — resolved at render).
//
// THE FLOW-SEPARATION LAW (origin, kept verbatim in spirit): Membership
// (USDC → SYN via the sale) is NEVER on this rail — the two flows must never
// be confused. No Join CTA lives on this page's rail.
//
// Dependency-free → Node-loadable for guards.

export const LP_PAIR_ADDRESS = "0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389";

export const LIQUIDITY_LINKS = {
  /** Founder-verified in browser 2026-07-14 (chart loads). */
  dexscreenerUrl: `https://dexscreener.com/avalanche/${LP_PAIR_ADDRESS}`,
  /** Origin LP_POOL.traderJoeUrl — HTTP 200 verified 2026-07-14. */
  tradeUrl:
    "https://traderjoexyz.com/avalanche/pool/v1/0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  /** Origin LP_POOL.addLiquidityUrl — HTTP 200 verified 2026-07-14. */
  addLiquidityUrl:
    "https://traderjoexyz.com/avalanche/pool/v1/0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E/add",
} as const;

/** WhyLpMatters — the origin's three cards, framing KEPT ("small on purpose ·
 * early LPs shape the pool" — the honest answer to a low-liquidity banner). */
export const WHY_LP_CARDS = [
  {
    title: "LP makes SYN tradable",
    body: "Without a liquidity pool, SYN can only be bought through the Membership Sale. The pool lets anyone trade SYN against USDC, any time, with no permission.",
  },
  {
    title: "Deeper pool, steadier price",
    body: "Every USDC added to the pool reduces slippage for the next trade. The deeper the pool, the more predictable price discovery becomes for the whole protocol.",
  },
  {
    title: "Early LPs shape the pool",
    body: "The pool below is small on purpose. Early liquidity providers shape how SYN trades for everyone who comes after — no guarantees, no entitlement.",
  },
] as const;

/** The verbatim protective line (origin rail, adapted to our banned-word set —
 * every clause an honest negative). Rendered under the rail AND in the notice. */
export const LP_NO_ENTITLEMENT_LINE =
  "Nothing is live or promised to liquidity providers: no rewards, no NFT eligibility, no governance rights, no entitlement of any kind. Providing liquidity is a market act, not a membership act.";

/** The LP Risk Notice — plain words, each row a real risk. */
export const LP_RISKS = [
  {
    title: "Impermanent loss",
    body: "If the SYN/USDC price moves, the value of your position in the pool can end up lower than simply holding the two tokens. This is structural to AMMs, not a defect.",
  },
  {
    title: "A small pool moves hard",
    body: "Low liquidity means single trades can move the price sharply — in both directions. The market is free; it may decide otherwise.",
  },
  {
    title: "Total loss is possible",
    body: "Smart-contract risk, market risk, and the possibility of losing everything you deposit are all real. Deposit only what you can afford to lose entirely.",
  },
  {
    title: "Withdrawals are yours alone",
    body: "The Syndicate does not custody, manage, or guarantee LP positions. You deposit and withdraw directly on the DEX, from your own wallet.",
  },
] as const;
