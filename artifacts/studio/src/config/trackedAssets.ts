// config/trackedAssets.ts — THE RESERVES REGISTRY (founder-approved 2026-07-25).
// ---------------------------------------------------------------------------
// The "Protocol Reserves" band is driven by THIS LIST, never hand-written per
// coin. One entry decides the row's order, its logo, its decimals, which live
// reality item carries the balance, and which one carries the price. The total,
// the composition bar and the share bars all derive from it.
//
// THE FOUNDER'S ASK (verbatim intent): "le jour où j'achète disons chainlink il
// l'ajoute à ce tableau". On the CLIENT that is exactly one entry below — the
// LINK line is written and commented out, ready. Be honest about the other half:
// the SERVER must also read that token's balance + price feed (two reads in
// buildFinancialGroup + two target addresses). Unifying both sides behind one
// shared registry is a named next step; until then, adding an asset is one entry
// HERE plus that server pair — not one line total.
//
// LOGOS are vendored locally in public/coins/<logo>.svg (MIT icon set, see the
// LICENSE note there). No external host is ever called for an image: the page
// works offline and no third party learns who visits us. A missing file falls
// back to a lettered disc — never a broken image.

export interface TrackedAsset {
  /** Display symbol — what the row is called. */
  readonly symbol: string;
  /** Human name under the symbol. */
  readonly name: string;
  /** Local logo slug → public/coins/<logo>.svg. */
  readonly logo: string;
  /** The reality item id carrying the raw balance. */
  readonly balanceId: string;
  /** Base-unit decimals for that balance. */
  readonly decimals: number;
  /** Display precision for the token amount. */
  readonly dp: number;
  /**
   * The reality item id carrying the USD price (8-decimal Chainlink answer),
   * or "PEGGED_USD" for a dollar stablecoin counted at one dollar.
   */
  readonly priceId: string | "PEGGED_USD";
  /** Token colour for the share bar + composition band (design token name). */
  readonly tone: string;
  /** Explorer link id served by /api/protocol/verify-links. */
  readonly verify: string;
}

export const TRACKED_ASSETS: readonly TrackedAsset[] = [
  {
    symbol: "AVAX",
    name: "Avalanche",
    logo: "avax",
    balanceId: "financial.vault.avaxBalance",
    decimals: 18,
    dp: 4,
    priceId: "financial.price.avaxUsd",
    tone: "viz-5",
    verify: "vaultWallet",
  },
  {
    symbol: "BTC",
    name: "Bitcoin · bridged",
    logo: "btc",
    balanceId: "financial.vault.btcbBalance",
    decimals: 8,
    dp: 8,
    priceId: "financial.price.btcUsd",
    tone: "viz-2",
    verify: "vaultWallet",
  },
  {
    symbol: "ETH",
    name: "Ether · bridged",
    logo: "eth",
    balanceId: "financial.vault.wethBalance",
    decimals: 18,
    dp: 6,
    priceId: "financial.price.ethUsd",
    tone: "viz-3",
    verify: "vaultWallet",
  },
  {
    symbol: "USDC",
    name: "Dollar stablecoin",
    logo: "usdc",
    balanceId: "financial.vault.usdcBalance",
    decimals: 6,
    dp: 2,
    priceId: "PEGGED_USD",
    tone: "viz-1",
    verify: "vaultWallet",
  },

  // ── The day the founder buys LINK, uncomment this and add the server pair. ──
  // {
  //   symbol: "LINK",
  //   name: "Chainlink",
  //   logo: "link",                                   // already vendored
  //   balanceId: "financial.vault.linkBalance",       // server: balanceOf(LINK.e)
  //   decimals: 18,
  //   dp: 4,
  //   priceId: "financial.price.linkUsd",             // server: the Chainlink LINK/USD feed
  //   tone: "viz-6",
  //   verify: "vaultWallet",
  // },
];

/** The stablecoins the protocol holds outside the vault, counted at one dollar. */
export const RESERVE_EXTRAS: readonly {
  readonly symbol: string;
  readonly name: string;
  readonly logo: string;
  readonly balanceId: string;
  readonly decimals: number;
  readonly tone: string;
  readonly verify: string;
}[] = [
  {
    symbol: "USDC",
    name: "Operations",
    logo: "usdc",
    balanceId: "financial.ops.usdcBalance",
    decimals: 6,
    tone: "viz-1",
    verify: "operationsWallet",
  },
  {
    symbol: "USDC",
    name: "From NFT sales",
    logo: "usdc",
    balanceId: "financial.nftSale.walletUsdcBalance",
    decimals: 6,
    tone: "viz-1",
    verify: "nftArchive",
  },
];
