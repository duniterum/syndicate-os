// ─────────────────────────────────────────────────────────────────────────────
  // Vendored from duniterum/TheSyndicate main @ cf4ca34c74599de1324e77052f1a81dd15cb1cc0
  // source path: src/lib/syndicate-config.ts
  // Read-only canon asset. Do not edit logic.
  // NOTE: This directory is excluded from the api-server TypeScript program and is
  // not yet imported by active app code. It exists as pinned local canon so future
  // status/contracts/proof/archive/token/sale wiring reads real files, not memory.
  // A future wiring slice owns any strict-mode / server-runtime adaptation.
  // ─────────────────────────────────────────────────────────────────────────────

  // The Syndicate — central configuration.
// Central protocol constants. Public UI must label non-live values as PENDING.

export const SYNDICATE_CONFIG = {
  PROJECT_NAME: "The Syndicate",
  TOKEN_SYMBOL: "SYN",
  TOTAL_SUPPLY: "1,000,000,000",
  TREASURY_NAME: "The Vault",

  // Live SYN token + public allocation wallets (Avalanche C-Chain).
  TOKEN_CONTRACT_ADDRESS:  "0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
  TREASURY_WALLET_ADDRESS: "0x205DdC8921A4C60106930eE35e1F395c8D13f464", // Vault Reserve
  FOUNDER_WALLET_ADDRESS:  "0x88EC79AF0d5A2F3b83022A1770c645506803Dd73",
  LIQUIDITY_WALLET_ADDRESS:"0xa9b072db8DcDbb470235204B69D37275d74a2e25",
  COMMUNITY_WALLET_ADDRESS:"0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8", // Membership Distribution

  // Pending contracts (not yet deployed).
  NFT_CONTRACT_ADDRESS: "PENDING",
  LP_POOL_ADDRESS: "PENDING",

  // External links — SYN token on Avascan (primary explorer).
  EXPLORER_LINK: "https://avascan.info/blockchain/c/token/0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
  // Both pending; null = render "Pending" instead of a dead link.
  DEX_LINK: null as string | null,
  SNAPSHOT_LINK: null as string | null,

  // Chain
  CHAIN_ID: 43114,
  TOKEN_DECIMALS: 18,

  // Economic placeholders (V1 = USDC only)
  PAYMENT_TOKEN: "USDC",
  CURRENT_EPISODE: "001",
} as const;

// Helper to build "Verify onchain" links — points at SYN on Avascan by default.
export const verifyOnchain = (_kind: string) => SYNDICATE_CONFIG.EXPLORER_LINK;

// ─── Canonical "Member" definition (single source of truth) ───────────
// Member = a wallet that has PURCHASED through the Membership Sale, counted
// from TokensPurchased events and de-duplicated by buyer — distinct from a
// "Holder" (any wallet holding SYN, e.g. via transfer/DEX). Both
// protocol-truth.ts and data-verification-registry.ts read these strings, so
// the public definition can never drift between surfaces.
export const MEMBER_DEFINITION = {
  label: "Members",
  description:
    "Distinct wallets that have purchased through the Membership Sale — counted from TokensPurchased events, de-duplicated by buyer. A member is not the same as a token holder.",
  source:
    "Avalanche C-Chain RPC · TokensPurchased(buyer, usdcIn, synOut) events on the Membership Sale contract, de-duplicated by buyer (via the holder index).",
  formula: "count(distinct buyer) over all TokensPurchased events",
} as const;

export const VAULT_ALLOCATION = {
  vaultAssets: 0.7,
  liquidityReinforcement: 0.2,
  operationsCommunity: 0.1,
};

// ─── Unified Rank Ladder (V1 — single source of truth) ─────────────────
// Current Era I quote: 100 SYN per 1 USDC. Bigger amounts unlock visible
// membership rank — never bonus tokens, cheaper SYN, or private terms.
export const ACCESS_RATE_USDC_PER_SYN = 0.01;
export const ACCESS_RATE_LABEL = "1 SYN = $0.01 USDC";

// Core token spec — Avalanche C-Chain, fixed supply, no admin powers.
export const TOKEN_SPEC = {
  name: "The Syndicate",
  symbol: "SYN",
  totalSupply: 1_000_000_000,
  decimals: 18,
  chain: "Avalanche C-Chain",
  fixedSupply: true,
  futureMint: false,
  tax: 0,
  blacklist: false,
  transferRestrictions: false,
  admin: false,
} as const;

// Tokenomics allocation — 1,000,000,000 SYN total.
export type AllocationSlice = { label: string; pct: number; syn: number; description: string };
export const TOKENOMICS_ALLOCATION: AllocationSlice[] = [
  { label: "Membership Distribution", pct: 35, syn: 350_000_000, description: "Pool used for website membership purchases, small entries, and custom member purchases." },
  { label: "Vault Reserve",            pct: 25, syn: 250_000_000, description: "Long-term Vault reserve. Any future movement must be public and verifiable before it is reflected here." },
  { label: "Founder",                                pct: 12, syn: 120_000_000, description: "12-month cliff, then 36-month monthly vesting. Public wallet, no hidden unlocks." },
  { label: "Liquidity",                              pct: 10, syn: 100_000_000, description: "Reserved for DEX liquidity provisioning and depth reinforcement." },
  { label: "Partnerships",                           pct: 8,  syn:  80_000_000, description: "Future ecosystem partners. No release is counted until public and verifiable." },
  { label: "Contributors",                           pct: 5,  syn:  50_000_000, description: "Builders, designers, operators, and contributors who help ship The Syndicate." },
  { label: "Future Ecosystem",                       pct: 5,  syn:  50_000_000, description: "Reserved for unannounced ecosystem expansion. May be partially burned by vote." },
];

// Membership Distribution Pool — sale-progress state for the homepage.
// distributed = 0 until live purchase events are indexed. Real-time amounts
// come from the Membership Sale contract (totalSynSold).
export const MEMBERSHIP_POOL = {
  allocated: 350_000_000,
  distributed: 0,
  get remaining() { return this.allocated - this.distributed; },
  get progressPct() { return (this.distributed / this.allocated) * 100; },
  saleLive: true as boolean,
};

export type RankTier = {
  name: string;
  usdc: number;       // entry USDC amount
  syn: number;        // SYN shown at the current Era I quote
  group: "Open Entry" | "Active Members" | "Deep Supporters" | "High-Conviction";
  badge: string;
  benefits: string[];
};

export const RANKS_V2: RankTier[] = [
  { name: "Citizen",           usdc: 5,      syn: 500,       group: "Open Entry",       badge: "Citizen badge",           benefits: ["Citizen badge", "Public on-chain member entry", "Permanent archive record"] },
  { name: "Scout",             usdc: 10,     syn: 1_000,     group: "Open Entry",       badge: "Scout badge",             benefits: ["Scout badge", "Permanent archive record", "Public wallet page"] },
  { name: "Operator",          usdc: 25,     syn: 2_500,     group: "Open Entry",       badge: "Operator badge",          benefits: ["Operator badge", "Public wallet page", "Activity visibility"] },
  { name: "Builder",           usdc: 50,     syn: 5_000,     group: "Active Members",   badge: "Builder badge",           benefits: ["Builder badge", "Higher profile visibility", "Permanent archive record"] },
  { name: "Strategist",        usdc: 75,     syn: 7_500,     group: "Active Members",   badge: "Strategist badge",        benefits: ["Strategist badge", "Higher profile visibility", "Visible member profile"] },
  { name: "Vanguard",          usdc: 100,    syn: 10_000,    group: "Active Members",   badge: "Vanguard badge",          benefits: ["Vanguard badge", "Stronger archive recognition", "Public member number"] },
  { name: "Architect",         usdc: 250,    syn: 25_000,    group: "Deep Supporters",  badge: "Architect badge",         benefits: ["Architect badge", "Higher visibility", "Permanent archive recognition"] },
  { name: "Steward",           usdc: 500,    syn: 50_000,    group: "Deep Supporters",  badge: "Steward badge",           benefits: ["Steward badge", "Recognition placement", "Permanent archive recognition"] },
  { name: "Custodian",         usdc: 1_000,  syn: 100_000,   group: "Deep Supporters",  badge: "Custodian badge",         benefits: ["Custodian badge", "Public recognition", "Permanent archive recognition"] },
  { name: "Keystone",          usdc: 2_500,  syn: 250_000,   group: "High-Conviction",  badge: "Keystone badge",       benefits: ["Keystone badge", "High-conviction recognition", "Self-service wallet checkout"] },
  { name: "Inner Circle",      usdc: 5_000,  syn: 500_000,   group: "High-Conviction",  badge: "Inner Circle badge",   benefits: ["Inner Circle badge", "High-conviction recognition", "Self-service wallet checkout"] },
  { name: "Cornerstone",       usdc: 10_000, syn: 1_000_000, group: "High-Conviction",  badge: "Cornerstone badge", benefits: ["Cornerstone badge", "Deepest archive recognition", "Self-service wallet checkout"] },
];

export function rankForUsdc(usdc: number): { current: RankTier | null; next: RankTier | null } {
  if (usdc < RANKS_V2[0].usdc) return { current: null, next: RANKS_V2[0] };
  let current: RankTier = RANKS_V2[0];
  let next: RankTier | null = RANKS_V2[1] ?? null;
  for (let i = 0; i < RANKS_V2.length; i++) {
    if (usdc >= RANKS_V2[i].usdc) {
      current = RANKS_V2[i];
      next = RANKS_V2[i + 1] ?? null;
    }
  }
  return { current, next };
}

export function rankForSyn(syn: number) {
  return rankForUsdc(syn * ACCESS_RATE_USDC_PER_SYN);
}

export function vaultFlow(usdc: number) {
  return {
    vault: usdc * VAULT_ALLOCATION.vaultAssets,
    lp: usdc * VAULT_ALLOCATION.liquidityReinforcement,
    ops: usdc * VAULT_ALLOCATION.operationsCommunity,
  };
}

// Single legal-safe disclaimer reused everywhere.
export const LEGAL_DISCLAIMER =
  "SYN is an experimental utility membership token. It is not equity, debt, Vault ownership, a dividend instrument, or a promise of profit. Participation may result in total loss. All routing, balances, and contract activity are public and verifiable on Avalanche C-Chain.";

// ─── Smart Contract Configuration (V1 — addresses pending deployment) ───
// SYN ERC20 stays minimal: fixed supply, no tax, no admin, no mint, no pause,
// no blacklist, no transfer restrictions. The 70/20/10 USDC split lives in a
// separate Membership Sale contract — never inside the token itself.

export const CONTRACTS = {
  SYN_CONTRACT_ADDRESS: "0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
  USDC_CONTRACT_ADDRESS: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  MEMBERSHIP_SALE_CONTRACT_ADDRESS: "0x0020Df30C127306f0F5B44E6a6E4368D2855842d",
  MEMBERSHIP_SYN_WALLET: "0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8",
  VAULT_WALLET: "0x205DdC8921A4C60106930eE35e1F395c8D13f464",
  LIQUIDITY_WALLET: "0xa9b072db8DcDbb470235204B69D37275d74a2e25",
  OPERATIONS_WALLET: "0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80",
  // Trader Joe v1 SYN/USDC pair (Avalanche C-Chain) — live LP pool.
  LP_PAIR_ADDRESS: "0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389",
  // SyndicateArchive1155 — deployed on Avalanche C-Chain 2026-06-06.
  // ID 1 is public-open. ID 3 is active but wallet/read-gated by live reads.
  // SeatRecord721 is a separate future identity contract.
  ARCHIVE_NFT_CONTRACT_ADDRESS: "0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d",
} as const;

// Read-only constant alias for the deployed Archive contract.
// See docs/DEPLOYMENT_STATE_V1.md and docs/CONTRACT_INTEGRATION_STATUS.md.
export const ARCHIVE_NFT_CONTRACT_ADDRESS =
  CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS;

// Explorer links for the deployed Archive contract.
export const ARCHIVE_NFT_EXPLORERS = {
  avascan:   `https://avascan.info/blockchain/c/address/${CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS}`,
  snowtrace: `https://snowtrace.io/address/${CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS}`,
  routescan: `https://routescan.io/address/${CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS}/contract/43114/code`,
  sourcify:  `https://repo.sourcify.dev/43114/${CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS}`,
} as const;

// Deployment status — drives the read-only Contract Integration Status widget.
// Update these as validation/activation progresses; do not enable mint UI.
export const ARCHIVE_CONTRACT_STATE = {
  address: CONTRACTS.ARCHIVE_NFT_CONTRACT_ADDRESS,
  network: "Avalanche C-Chain",
  chainId: 43114,
  deployment: "DEPLOYED" as const,
  validation: "IN_PROGRESS" as const,
  sourceVerified: "PENDING" as const, // flip to "VERIFIED" once Avascan/Snowtrace confirm
  publicDropsActivated: 2,
  deployedAt: "2026-06-06",
  artifacts: [
    {
      id: 1,
      label: "The First Signal",
      configured: "DEPLOYED_CONFIGURED" as const,
      active: true,
      note: "Genesis Chapter Artifact. Public mint OPEN at 0.50 USDC (wallet limit 5).",
    },
    {
      id: 2,
      label: "Reserved Seat Record Reference",
      configured: "RESERVED_DISABLED" as const,
      active: false,
      note: "Disabled in Archive1155 V1. Future ERC-721 SyndicateSeatRecord721.",
    },
    {
      id: 3,
      label: "Patron Seal",
      configured: "DEPLOYED_CONFIGURED" as const,
      active: true,
      note: "Active at 5.00 USDC (wallet limit 5, supply 10,000); wallet mintability is shown only from live Archive1155 reads.",
    },
  ],
} as const;

// SyndicateMembershipSale deployment block from Avalanche C-Chain creation tx:
// 0x30e1378a66dc1037d49cb7557a162635f37a90ffde80e973bd9750d39927bdb6
export const SALE_DEPLOYMENT_BLOCK = 87_157_852n;

// External DEX metadata for the live LP pool.
export const LP_POOL = {
  pairAddress: "0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389",
  creationTx: "0x60f04521171a3f878f8b801c66a9e8c49f4931b9cb949b6c563b7ba47e9cbe05",
  dex: "Trader Joe",
  dexVersion: "v1",
  poolType: "AMM / JLP",
  pair: "SYN / USDC",
  baseSymbol: "SYN",
  quoteSymbol: "USDC",
  initialSyn: 200,
  initialUsdc: 2,
  initialPriceUsd: 0.01,
  traderJoeUrl:
    "https://traderjoexyz.com/avalanche/pool/v1/0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  addLiquidityUrl:
    "https://traderjoexyz.com/avalanche/pool/v1/0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E/add",
} as const;

// USDC routing split — single source of truth for labels everywhere.
export const USDC_ROUTING = [
  { label: "Vault Wallet",      pct: 70, key: "VAULT_WALLET"      as const, tone: "gold"  as const },
  { label: "Liquidity Wallet",  pct: 20, key: "LIQUIDITY_WALLET"  as const, tone: "navy"  as const },
  { label: "Operations Wallet", pct: 10, key: "OPERATIONS_WALLET" as const, tone: "amber" as const },
] as const;

// Public allocation wallets (SYN holding wallets, Avalanche C-Chain).
export const ALLOCATION_WALLETS: Record<string, string> = {
  "Membership Distribution": "0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8",
  "Vault Reserve":                          "0x205DdC8921A4C60106930eE35e1F395c8D13f464",
  "Founder":                                "0x88EC79AF0d5A2F3b83022A1770c645506803Dd73",
  "Liquidity":                              "0xa9b072db8DcDbb470235204B69D37275d74a2e25",
  "Partnerships":                           "0xf5BEdEEfe48f746d96C1847a5595318579bBcaCf",
  "Contributors":                           "0xa55132346C70e63d0c4E0Fb15F35075760dDEF7a",
  "Future Ecosystem":                       "0x2530393881820AFe789f1c5D83817B70e46d2963",
};

// Standard "dead" address. SYN permanently sent here is removed from
// circulation — it cannot be recovered. The protocol runs NO automated burn:
// any burn is a manual, verifiable transfer to this address. Recognition only,
// never a buyback or a promise of price/scarcity value.
export const SYN_BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;
export const SYN_BURN_ADDRESS_LABEL = "Proof of Burn / Burn Address";

// Proof of Burn #001 — the first verified SYN burn. A manual Founder Burn:
// 1,000 SYN sent from the Founder allocation wallet to the standard dead
// address. Verified on-chain (block 87,703,847). This is a recognition record,
// not a financial instrument — no price impact, ROI, yield, or scarcity claim.
export const PROOF_OF_FIRE_001 = {
  id: "001",
  label: "Proof of Burn #001",
  category: "Founder Burn",
  amountSyn: 1_000,
  from: ALLOCATION_WALLETS["Founder"],
  to: SYN_BURN_ADDRESS,
  txHash: "0x2db110b1406bdee0bb98a0ad9a8c941052fbe02049d99b30a3b09934d6a12d47",
  blockNumber: 87_703_847n,
} as const;

// Multi-explorer links for the live SYN token on Avalanche C-Chain.
export const SYN_EXPLORERS = {
  avascan:   "https://avascan.info/blockchain/c/token/0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
  sourcify:  "https://repo.sourcify.dev/43114/0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
  routescan: "https://routescan.io/address/0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170/contract/43114/code",
  snowtrace: "https://snowtrace.io/token/0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
} as const;

// Explorer bases.
// Address pages use Avascan C-Chain; transaction pages use Routescan because
// its tx hash route is stable across Avalanche C-Chain transaction types.
export const AVASCAN_C_CHAIN_BASE_URL = "https://avascan.info/blockchain/c";
export const ROUTESCAN_BASE_URL = "https://routescan.io";
export const SNOWTRACE_BASE_URL = "https://snowtrace.io";
export const EXPLORER_BASE_URL = AVASCAN_C_CHAIN_BASE_URL;

export type ContractKey = keyof typeof CONTRACTS;

const EXPLORER_KIND: Record<ContractKey, "token" | "address"> = {
  SYN_CONTRACT_ADDRESS: "token",
  USDC_CONTRACT_ADDRESS: "token",
  MEMBERSHIP_SALE_CONTRACT_ADDRESS: "address",
  MEMBERSHIP_SYN_WALLET: "address",
  VAULT_WALLET: "address",
  LIQUIDITY_WALLET: "address",
  OPERATIONS_WALLET: "address",
  LP_PAIR_ADDRESS: "address",
  ARCHIVE_NFT_CONTRACT_ADDRESS: "address",
};

export const isLiveAddress = (v: string) =>
  v !== "PENDING" && /^0x[a-fA-F0-9]{40}$/.test(v);

// ── Sale V2b — PAUSED historical sale on Avalanche mainnet ────────────────
// V2b (below) was the funded self-service sale and is now paused on-chain after
// the V3 funding/cutover ceremony. It remains a historical scan source and
// recovery boundary. It SUPERSEDES V2a (an earlier same-source deploy, now
// PAUSED/SEALED), which is retained ONLY as a historical scan source for member
// continuity — see MEMBERSHIP_SALE_V2A_* below. V1 is also sealed.
// NOTE: the V2 contract is UNAUDITED — describe it as live-but-unaudited / early,
// never as audited. No placeholder strings, no inferred address (truth doctrine).
// Kept OUTSIDE `CONTRACTS` so the `as const` map / ContractKey / EXPLORER_KIND
// stay uniform; mirrors how SALE_DEPLOYMENT_BLOCK lives as a standalone export.
export const MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS: string | null =
  "0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b";
export const SALE_V2_DEPLOYMENT_BLOCK: bigint | null = 88193183n;

// ── Sale V2a (SUPERSEDED / SEALED) — historical scan source ONLY ──────────
// V2a was an earlier same-source V2 deploy, now PAUSED (paused at block
// 88,190,780) and replaced by V2b above. It is NEVER the active buy/quote/
// approve target. It is retained solely so the Holder Index scanner can read
// its `Purchased`/`Routed` history: 3 members first appeared on V2a (seats
// #3–#5) and are absent from both V1 and V2b, so dropping V2a would erase them
// from member identity. Same event ABI as V2b (same-source), so the existing
// V2 scanner reads it verbatim.
export const MEMBERSHIP_SALE_V2A_CONTRACT_ADDRESS: string | null =
  "0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48";
export const SALE_V2A_DEPLOYMENT_BLOCK: bigint | null = 88095827n;

/** True only when BOTH the V2 address and its deploy block are known. */
export const SALE_V2_LIVE: boolean =
  MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS !== null &&
  isLiveAddress(MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS) &&
  SALE_V2_DEPLOYMENT_BLOCK !== null;

// V3 sale engine — deployed, owner-accepted, funded, and selected as the public
// buy target after the V2b pause. Source records/referral/claim UI remain
// inactive; normal member buys pass bytes32(0) as sourceId.
export const SOURCE_REGISTRY_V1_CONTRACT_ADDRESS: string | null =
  "0x780013bB358be6be95b401901264FC7c22a595a6";
export const MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS: string | null =
  "0x2A6cFc76906e758B934209AFf5A163c9bC20132E";
// SourceRegistryV1 latest-authority readback after the first completed
// internal source-attribution ceremony. The source was returned to PAUSED;
// referral/source UI and claim UI remain inactive; normal member buys still
// pass bytes32(0) as sourceId.
export const SOURCE_REGISTRY_V1_READBACK_BLOCK: bigint | null = 88808111n;
export const SALE_V3_DEPLOYMENT_BLOCK: bigint | null = 88505301n;
export const SALE_V3_FRONTEND_BUY_TARGET: boolean =
  MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS !== null &&
  isLiveAddress(MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS) &&
  SALE_V3_DEPLOYMENT_BLOCK !== null;

export const ACTIVE_MEMBERSHIP_SALE_VERSION = SALE_V3_FRONTEND_BUY_TARGET
  ? "v3"
  : SALE_V2_LIVE
    ? "v2"
    : "v1";

export const ACTIVE_MEMBERSHIP_SALE_CONTRACT_ADDRESS =
  ACTIVE_MEMBERSHIP_SALE_VERSION === "v3"
    ? MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS
    : ACTIVE_MEMBERSHIP_SALE_VERSION === "v2"
      ? MEMBERSHIP_SALE_V2_CONTRACT_ADDRESS
      : CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS;

export function explorerUrlFor(key: ContractKey): string | null {
  const addr = CONTRACTS[key];
  if (!isLiveAddress(addr)) return null;
  if (key === "SYN_CONTRACT_ADDRESS") return SYN_EXPLORERS.avascan;
  return `${EXPLORER_BASE_URL}/${EXPLORER_KIND[key]}/${addr}`;
}

export function explorerUrlForAddress(addr: string): string | null {
  if (!isLiveAddress(addr)) return null;
  return `${EXPLORER_BASE_URL}/address/${addr}`;
}

export const isTxHash = (v: string | undefined | null): v is `0x${string}` =>
  typeof v === "string" && /^0x[a-fA-F0-9]{64}$/.test(v);

// Canonical transaction explorer URL for Avalanche C-Chain.
//
// We standardize on Snowtrace because:
//   • `https://snowtrace.io/tx/<hash>` resolves reliably for every
//     Avalanche C-Chain transaction type (legacy, EIP-1559, internal,
//     contract creation, ERC-20/721/1155 token transfers).
//   • Avascan requires `/blockchain/c/tx/<hash>` — the bare
//     `https://avascan.info/tx/<hash>` form returns 404.
//   • Routescan works but its canonical path is chain-prefixed
//     (`/43114/...`) and not user-friendly.
//
// All UI surfaces must call this helper. Never hand-build a tx URL.
export function txExplorerUrl(hash: string): string {
  return `${SNOWTRACE_BASE_URL}/tx/${hash}`;
}

export function avascanTxExplorerUrl(hash: string): string {
  return `${AVASCAN_C_CHAIN_BASE_URL}/tx/${hash}`;
}

export function snowtraceTxExplorerUrl(hash: string): string {
  return `${SNOWTRACE_BASE_URL}/tx/${hash}`;
}

export function routescanTxExplorerUrl(hash: string): string {
  return `${ROUTESCAN_BASE_URL}/tx/${hash}`;
}

export function txExplorerUrls(hash: string): Array<{ label: string; href: string }> {
  if (!isTxHash(hash)) return [];
  return [
    { label: "Snowtrace", href: snowtraceTxExplorerUrl(hash) },
    { label: "Avascan", href: avascanTxExplorerUrl(hash) },
    { label: "Routescan", href: routescanTxExplorerUrl(hash) },
  ];
}

/** Extra verification chips for a given onchain address (DexScreener, Trader Joe, Sourcify, SnowScan…). */
export function extrasForAddress(addr: string): Array<{ label: string; href: string }> {
  if (!isLiveAddress(addr)) return [];
  const lower = addr.toLowerCase();
  if (lower === CONTRACTS.SYN_CONTRACT_ADDRESS.toLowerCase()) {
    return [
      { label: "Sourcify", href: SYN_EXPLORERS.sourcify },
      { label: "Routescan", href: SYN_EXPLORERS.routescan },
      { label: "SnowTrace", href: SYN_EXPLORERS.snowtrace },
      { label: "Trader Joe", href: LP_POOL.traderJoeUrl },
    ];
  }
  if (lower === LP_POOL.pairAddress.toLowerCase()) {
    return [
      { label: "DexScreener", href: `https://dexscreener.com/avalanche/${LP_POOL.pairAddress}` },
      { label: "Trader Joe", href: LP_POOL.traderJoeUrl },
    ];
  }
  if (lower === CONTRACTS.USDC_CONTRACT_ADDRESS.toLowerCase()) {
    return [
      { label: "SnowTrace", href: `https://snowtrace.io/token/${CONTRACTS.USDC_CONTRACT_ADDRESS}` },
    ];
  }
  if (lower === CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS.toLowerCase()) {
    return [
      { label: "Routescan", href: `https://routescan.io/address/${CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS}/contract/43114/code` },
    ];
  }
  return [];
}

// Membership Sale + USDC are now LIVE. DEMO_MODE remains as a flow flag.
export const DEMO_MODE = !(
  isLiveAddress(CONTRACTS.MEMBERSHIP_SALE_CONTRACT_ADDRESS) &&
  isLiveAddress(CONTRACTS.USDC_CONTRACT_ADDRESS)
);
export const DEMO_MODE_LABEL = "Membership Sale live · purchase enabled when SYN inventory is funded";
export const SALE_STATUS_LABEL = "Membership Sale live on Avalanche";
export const SALE_CTA_LABEL = "Buy SYN with USDC";
export const SALE_MIN_USDC = 5;

// RPC + chain (Avalanche C-Chain).
// Defaults: Avalanche public RPC (primary) + Ankr public RPC (fallback).
// VITE_AVALANCHE_RPC_URL is the preferred primary override for a dedicated
// provider such as QuickNode. With no env set, behaviour remains public-only.
//
// ── VITE_ env vars are PUBLIC (browser-exposed) ──────────────────────────────
// Vite inlines any VITE_-prefixed value into the client bundle, so whatever URL
// is set here is visible to anyone who loads the site. Only point these at
// endpoints that are safe to expose (e.g. origin/domain-allowlisted). NEVER put
// a secret/keyed RPC URL here unless the provider restricts that key by origin.
//   VITE_AVALANCHE_RPC_URL      — preferred custom primary (e.g. QuickNode)
//   VITE_AVALANCHE_RPC_PRIMARY  — legacy alias for custom primary
//   VITE_AVALANCHE_RPC_FALLBACK — optional custom secondary (defaults to Ankr)
//
// Used by wagmi via viem's `fallback` transport (see src/lib/wagmi.ts) and by
// the lightweight RPC health probe (see src/lib/archive-rpc-health.ts).
const DEFAULT_AVALANCHE_RPC_URL = "https://api.avax.network/ext/bc/C/rpc";
const DEFAULT_AVALANCHE_RPC_URL_FALLBACK = "https://rpc.ankr.com/avalanche";

const readEnvUrl = (v: unknown): string | undefined => {
  if (typeof v !== "string") return undefined;
  const value = v.trim();
  if (!value) return undefined;
  try {
    const u = new URL(value);
    return u.protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
};

// CONVERSION (Phase 1 Slice 2.11 — server-runtime adaptation): `import.meta.env`
// is a Vite-only construct and is `undefined` under Node (the server-side live-read
// scripts that read this canon for contract selection). Reading `.VITE_*` off it
// directly throws in Node. Access it through a guarded accessor so this file loads in
// BOTH Vite and Node with identical behavior: when the env object is absent (Node),
// no override is found and the public defaults win — exactly as if no VITE_ var were
// set. No endpoint values, exported names, shapes, or selection logic changed.
const VITE_ENV: Record<string, unknown> =
  (typeof import.meta !== "undefined" &&
    (import.meta as { env?: Record<string, unknown> }).env) ||
  {};
const ENV_AVALANCHE_RPC_PRIMARY =
  readEnvUrl(VITE_ENV.VITE_AVALANCHE_RPC_URL) ??
  readEnvUrl(VITE_ENV.VITE_AVALANCHE_RPC_PRIMARY);
const ENV_AVALANCHE_RPC_FALLBACK = readEnvUrl(VITE_ENV.VITE_AVALANCHE_RPC_FALLBACK);

// Effective endpoints — env override wins; public endpoints are the defaults.
// Setting only VITE_AVALANCHE_RPC_URL keeps the public Ankr fallback active;
// VITE_AVALANCHE_RPC_FALLBACK, if set, replaces that secondary endpoint.
// Exported names and shapes are unchanged so every consumer keeps working.
export const AVALANCHE_RPC_URL = ENV_AVALANCHE_RPC_PRIMARY ?? DEFAULT_AVALANCHE_RPC_URL;
export const AVALANCHE_RPC_URL_FALLBACK =
  ENV_AVALANCHE_RPC_FALLBACK ?? DEFAULT_AVALANCHE_RPC_URL_FALLBACK;
export const AVALANCHE_RPC_ENDPOINTS = [
  {
    label: ENV_AVALANCHE_RPC_PRIMARY ? "Configured primary RPC (env)" : "Avalanche public RPC",
    url: AVALANCHE_RPC_URL,
  },
  {
    label: ENV_AVALANCHE_RPC_FALLBACK ? "Configured fallback RPC (env)" : "Ankr public RPC",
    url: AVALANCHE_RPC_URL_FALLBACK,
  },
] as const;
export const AVALANCHE_CHAIN_ID = 43114;
export const USDC_DECIMALS = 6;
export const SYN_DECIMALS = 18;

// Purchase preset amounts (USDC) shown in the simulator widget.
export const PURCHASE_PRESETS_USDC = [5, 10, 25, 50, 75, 100, 250, 500, 1_000] as const;

// Smart contract readiness checklist — flips to true as each piece deploys.
export type ReadinessItem = { label: string; ready: boolean };
export const CONTRACT_READINESS: ReadinessItem[] = [
  { label: "SYN token deployed (Avalanche C-Chain)", ready: isLiveAddress(CONTRACTS.SYN_CONTRACT_ADDRESS) },
  { label: "Membership SYN wallet funded",           ready: isLiveAddress(CONTRACTS.MEMBERSHIP_SYN_WALLET) },
  { label: "Membership Sale V3 contract deployed and funded", ready: SALE_V3_FRONTEND_BUY_TARGET },
  { label: "USDC accepted",                          ready: isLiveAddress(CONTRACTS.USDC_CONTRACT_ADDRESS) },
  { label: "Vault USDC wallet connected",            ready: isLiveAddress(CONTRACTS.VAULT_WALLET) },
  { label: "Liquidity USDC wallet connected",        ready: isLiveAddress(CONTRACTS.LIQUIDITY_WALLET) },
  { label: "Operations USDC wallet connected",       ready: isLiveAddress(CONTRACTS.OPERATIONS_WALLET) },
];



// ─── Transparency Center: live / partial / pending at a glance ───
export type TransparencyStatus = "live" | "partial" | "pending";
export type TransparencyItem = {
  label: string;
  status: TransparencyStatus;
  detail: string;
  href?: string;
};

export const TRANSPARENCY_ITEMS: TransparencyItem[] = [
  { label: "SYN Token",            status: "live",    detail: "ERC20 deployed on Avalanche C-Chain · fixed 1,000,000,000 supply", href: SYN_EXPLORERS.avascan },
  { label: "Allocation Integrity", status: "live",    detail: "7 public allocation wallets · initial mint confirmed",            href: "/registry" },
  { label: "Source Verification",  status: "live",    detail: "Source verified on Sourcify and Routescan",                       href: SYN_EXPLORERS.sourcify },
  { label: "Membership Sale V3",  status: "live",    detail: "Current live buy target. Accepts USDC, delivers SYN, and routes net USDC 70/20/10. Source records remain inactive.", href: explorerUrlForAddress(MEMBERSHIP_SALE_V3_CONTRACT_ADDRESS ?? "") ?? undefined },
  { label: "USDC Routing",         status: "live",    detail: "70% Vault · 20% Liquidity · 10% Operations — enforced onchain",   href: "/registry" },
  { label: "Operations Wallet",    status: "live",    detail: "Receives 10% of every USDC purchase",                              href: explorerUrlFor("OPERATIONS_WALLET") ?? undefined },
  { label: "LP Pool",              status: "live",    detail: "Trader Joe v1 SYN/USDC pair live on Avalanche — reserves read onchain", href: explorerUrlFor("LP_PAIR_ADDRESS") ?? undefined },
  { label: "Purchase Event Stream", status: "partial", detail: "TokensPurchased stream is live; if no purchases exist, the feed shows 0 purchases — awaiting first purchase.", href: "/activity" },
  { label: "Member Total",         status: "partial", detail: "Derived from holder index / sale events. If zero, it shows 0 members recorded — awaiting first member.", href: "/members" },
  { label: "Member Number / Founder Recognition", status: "partial", detail: "Derived from holder index purchase order; no separate contract exists for this recognition layer.", href: "/members" },
  { label: "Member Registry",      status: "partial", detail: "Derived from indexed purchase events; registry coverage is partial until indexing is complete.", href: "/members" },
  { label: "Vault Contract",       status: "pending", detail: "Programmatic Vault contract not deployed — Vault is currently a public wallet." },
  { label: "Archive Contract (SyndicateArchive1155)", status: "live",    detail: "Deployed on Avalanche · The First Signal (ID 1) public mint OPEN at 0.50 USDC, wallet limit 5. Patron Seal (ID 3) is active but wallet/read-gated. Other IDs are sealed, reserved, or future-contract surfaces.", href: ARCHIVE_NFT_EXPLORERS.avascan },
  { label: "SeatRecord721 (future ERC-721)", status: "pending", detail: "Future identity contract — not deployed. Separate from the live Archive1155 memory contract." },
  { label: "Governance",           status: "pending", detail: "No governance rights are live or promised." },
  { label: "AI Layer",             status: "pending", detail: "No AI module is live." },
];

// ─── Protocol Status (hero + registry source of truth) ───
export type ProtocolStatusKey = "live" | "pending";
export type ProtocolStatusItem = {
  key: string;
  label: string;
  status: ProtocolStatusKey;
  summary: string;
  href: string;
};
export const PROTOCOL_STATUS: ProtocolStatusItem[] = [
  { key: "syn",        label: "SYN Token",           status: "live",    summary: "ERC20 deployed and verified on Avalanche C-Chain.", href: "/token" },
  { key: "sale",       label: "Membership Sale V3", status: "live",    summary: "Current live buy path. USDC to SYN with transparent V3 receipt routing.", href: "/join" },
  { key: "allocation", label: "Initial Allocation",  status: "live",    summary: "7 public allocation wallets · initial mint confirmed.", href: "/registry" },
  { key: "verify",     label: "Source Verification", status: "live",    summary: "Verified on Sourcify and Routescan.", href: "/transparency" },
  { key: "vault",      label: "Vault Contract",      status: "pending", summary: "Vault is currently a public wallet — programmatic contract not deployed.", href: "/vault" },
  { key: "archive",    label: "Archive Contract",    status: "live",    summary: "SyndicateArchive1155 deployed on Avalanche · First Signal is public-open; Patron Seal is wallet/read-gated.", href: "/nft" },
  { key: "seatRecord", label: "SeatRecord721",       status: "pending", summary: "Future ERC-721 identity record — separate from the live Archive1155 memory contract.", href: "/registry" },
  { key: "lp",         label: "LP Pool",             status: "live",    summary: "Trader Joe v1 SYN/USDC pair live on Avalanche — reserves & price read onchain.", href: "/liquidity" },
  { key: "gov",        label: "Governance",          status: "pending", summary: "Snapshot / onchain governance — not deployed yet.", href: "/registry" },
  { key: "ai",         label: "AI Layer",            status: "pending", summary: "No AI module is live.", href: "/ai" },
];


// What is live / partial / pending right now — used by Hero + Transparency Center.
export const WHATS_LIVE = {
  live: [
    "SYN ERC20 token (Avalanche C-Chain)",
    "1,000,000,000 fixed supply",
    "7 public allocation wallets",
    "Initial mint transfers",
    "Source verified (Sourcify, Routescan)",
    "Membership Sale V3 contract",
    "USDC routing 70/20/10",
    "Vault / Liquidity / Operations wallets",
    "Trader Joe SYN/USDC LP pool",
    "Archive1155 contract deployed on Avalanche",
    "The First Signal (ID 1) public mint open",
  ],
  partial: [
    "Purchase event stream — 0 purchases until the first TokensPurchased event",
    "Member total — derived from holder index / sale events",
    "Member number / Founder recognition — derived from holder index purchase order",
    "Member registry — partial until purchase indexing completes",
    "Vault asset dashboard — balances live where price sources are verified",
  ],
  pending: [
    "SeatRecord721 not deployed; Archive1155 ID 1 is public-open and ID 3 is wallet/read-gated",
    "Programmatic Vault contract not deployed",
    "Governance — no governance rights are live or promised",
    "AI Layer — no AI module is live",
    "LP liquidity locker",
  ],
} as const;

// Expected initial-mint balances per allocation (confirmed onchain).
export const ALLOCATION_EXPECTED_SYN: Record<string, number> = {
  "Membership Distribution": 350_000_000,
  "Vault Reserve":                          250_000_000,
  "Founder":                                120_000_000,
  "Liquidity":                              100_000_000,
  "Partnerships":                            80_000_000,
  "Contributors":                            50_000_000,
  "Future Ecosystem":                        50_000_000,
};

// ─── Homepage Rank Ladder (12 canonical tiers, $5 → $10,000) ───
// Mirrors RANKS_V2 exactly. Single source of truth for ladder UI.
export type HomeRank = { name: string; usdc: number; syn: number; group: "open" | "active" | "deep" | "keystone" };
export const HOME_RANK_LADDER: HomeRank[] = [
  { name: "Citizen",           usdc: 5,      syn: 500,       group: "open" },
  { name: "Scout",             usdc: 10,     syn: 1_000,     group: "open" },
  { name: "Operator",          usdc: 25,     syn: 2_500,     group: "open" },
  { name: "Builder",           usdc: 50,     syn: 5_000,     group: "active" },
  { name: "Strategist",        usdc: 75,     syn: 7_500,     group: "active" },
  { name: "Vanguard",          usdc: 100,    syn: 10_000,    group: "active" },
  { name: "Architect",         usdc: 250,    syn: 25_000,    group: "deep" },
  { name: "Steward",           usdc: 500,    syn: 50_000,    group: "deep" },
  { name: "Custodian",         usdc: 1_000,  syn: 100_000,   group: "deep" },
  { name: "Keystone",          usdc: 2_500,  syn: 250_000,   group: "keystone" },
  { name: "Inner Circle",      usdc: 5_000,  syn: 500_000,   group: "keystone" },
  { name: "Cornerstone",       usdc: 10_000, syn: 1_000_000, group: "keystone" },
];

// ─── Membership Journey (7 steps) ───
export type JourneyStep = { key: string; label: string; status: "live" | "next" | "pending"; detail: string };
export const JOURNEY_STEPS: JourneyStep[] = [
  { key: "buy",       label: "Buy SYN",         status: "live",    detail: "USDC → SYN at $0.01, on Avalanche." },
  { key: "rank",      label: "Reflect Rank",    status: "live",    detail: "Your purchases map to a public rank — recognition only." },
  { key: "registry",  label: "Join Registry",   status: "live",    detail: "Wallet recorded onchain in the sale contract." },
  { key: "archive",   label: "Access Archive",  status: "next",    detail: "Member archive + episode access (rolling)." },
  { key: "participate", label: "Participate",   status: "next",    detail: "Verified activity and contributor paths." },
  { key: "govern",    label: "Governance",      status: "pending", detail: "Snapshot / onchain governance — pending." },
  { key: "vault",     label: "Future Vault",    status: "pending", detail: "Programmatic Vault contract — pending." },
];

// ─── Protocol Snapshot (compact hero strip) ───
// Single source for the under-CTA facts row.
export const PROTOCOL_SNAPSHOT = [
  { label: "Chain",         value: "Avalanche" },
  { label: "Supply",        value: "1,000,000,000 SYN" },
  { label: "Min Entry",     value: `$${SALE_MIN_USDC} USDC` },
  { label: "Access Rate",   value: ACCESS_RATE_LABEL },
  { label: "Sale",          value: "LIVE" },
  { label: "Routing",       value: "70 Vault / 20 LP / 10 Ops" },
] as const;

// ─── Homepage Metrics declaration ───
// `source` decides how the metric renders:
//   live    → number comes from a wagmi hook in <HomeMetricsStrip>
//   pending → no number, PENDING pill
//   demo    → deprecated; do not expose on public routes
export type HomeMetricSource = "live" | "pending" | "demo";
export type HomeMetric = {
  key: string;
  label: string;
  source: HomeMetricSource;
  hint?: string;
};
export const HOMEPAGE_METRICS: HomeMetric[] = [
  { key: "usdcRaised",     label: "Sale volume (USDC)", source: "live",    hint: "Membership Sale contract · USDC routed 70/20/10" },
  { key: "synDistributed", label: "SYN distributed",    source: "live",    hint: "Sold to members" },
  { key: "buyers",         label: "Unique buyers",      source: "live",    hint: "Distinct wallets" },
  { key: "purchases",      label: "Purchases",          source: "live",    hint: "Onchain transactions" },
  { key: "lpDepth",        label: "LP depth",           source: "live",    hint: "Trader Joe SYN/USDC reserves" },
  { key: "seatRecord721",  label: "SeatRecord721",       source: "pending", hint: "Future ERC-721 identity record; Archive1155 memory artifacts are separate" },
  { key: "vaultValue",     label: "Vault value",        source: "pending", hint: "Vault contract not deployed" },
  { key: "governance",     label: "Governance proposals", source: "pending", hint: "Module not deployed" },
];
