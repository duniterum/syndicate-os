/**
 * Curated protocol read targets (SERVER-SIDE ONLY) — Slice 2.23A.
 * -------------------------------------------------------------
 * The full 0x contract addresses live HERE and ONLY here, on the server. They
 * are NEVER placed into any payload (the protocol-reality envelope keys every
 * item by a safe internal name; a discipline guard rejects any address that
 * leaks into output).
 *
 * `src/canon` is excluded from the api-server TypeScript program, so this served
 * module cannot import canon and instead hardcodes the curated subset. A
 * reconcile guard (under scripts/, which MAY import canon) verifies every
 * address/role/expectation here still matches the vendored canon registries.
 *
 * Only LIVE/DEPLOYED *contract* roles are listed (wallets/EOAs and PENDING
 * entries are excluded — they have no contract code to read).
 */

import type { ProtocolContractRole } from "../lib/protocol/realityEnvelope";

export type ContractTarget = {
  /** Safe internal key — never an address. */
  key: string;
  /** Human label for the surface (never an address). */
  label: string;
  role: ProtocolContractRole;
  address: string;
};

export type TokenTarget = {
  key: "SYN" | "USDC";
  label: string;
  role: Extract<ProtocolContractRole, "token" | "stablecoin">;
  address: string;
  /** Canon metadata expectation, present ONLY where canon defines one (SYN). */
  expect?: { symbol?: string; decimals?: number };
};

/** A public uint256 sale view surfaced as an exact raw-base-unit string. */
export type SaleNumericRead = {
  /** Id suffix (never an address), e.g. "availableSyn". */
  idSuffix: string;
  /** Human label for the read (never an address). */
  label: string;
  /** Which canon view function to read (maps to a selector in saleDecoders). */
  view: "availableSyn" | "totalGrossUsdc" | "receiptCount";
  /** Token base-unit decimals for interpretation only (18 SYN / 6 USDC / null count). */
  decimals: number | null;
  /** Honest note: exact raw units + explicit app write-boundary. */
  unitNote: string;
};

export type SaleTarget = {
  /** Safe internal key — never an address (matches CONTRACT_TARGETS + canon). */
  key: string;
  /** Human label for the surface (never an address). */
  label: string;
  role: Extract<ProtocolContractRole, "sale">;
  address: string;
  /** Canon ABI fact: V2/V3 expose isConcluded(); V1 does not. */
  hasIsConcluded: boolean;
  /** Founder-scoped numeric reads (Sprint 2: V3 only; V1/V2 empty). */
  numericReads: readonly SaleNumericRead[];
};

export type ArchiveTarget = { key: string; label: string; address: string };

export type ArchiveArtifactTarget = {
  id: number;
  label: string;
  /** Canon's design intent: whether this id is configured on-chain. */
  configuredOnChain: boolean;
};

// ── Contract code-presence targets (8 LIVE/DEPLOYED contract roles) ───────────
export const CONTRACT_TARGETS: readonly ContractTarget[] = [
  { key: "SYN_TOKEN", label: "SYN token", role: "token", address: "0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170" },
  { key: "USDC", label: "USDC (Avalanche)", role: "stablecoin", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" },
  { key: "MEMBERSHIP_SALE", label: "Membership Sale (V1)", role: "sale", address: "0x0020Df30C127306f0F5B44E6a6E4368D2855842d" },
  // AUD-TRUTH-3 (2026-07-16): the LABEL says V2b — this address IS the V2b
  // engine (block 88,193,183); V2a (0x0b883F…2b48) lives in the scan targets.
  // The internal KEY never changes (it keys DB cursor/raw rows).
  { key: "MEMBERSHIP_SALE_V2", label: "Membership Sale V2b", role: "sale", address: "0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b" },
  { key: "MEMBERSHIP_SALE_V3", label: "Membership Sale V3", role: "sale", address: "0x2A6cFc76906e758B934209AFf5A163c9bC20132E" },
  { key: "SOURCE_REGISTRY_V1", label: "Source Registry V1", role: "source-registry", address: "0x780013bB358be6be95b401901264FC7c22a595a6" },
  { key: "ARCHIVE_1155", label: "Archive 1155", role: "archive1155", address: "0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d" },
  { key: "LP_PAIR", label: "SYN/USDC LP pair", role: "lp-pair", address: "0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389" },
];

// ── Sale lifecycle targets (paused on all; isConcluded on V2/V3 only). ────────
// Addresses mirror the sale entries in CONTRACT_TARGETS; a reconcile guard
// verifies each against canon and cross-checks hasIsConcluded to the canon ABI.
export const SALE_TARGETS: readonly SaleTarget[] = [
  {
    key: "MEMBERSHIP_SALE",
    label: "Membership Sale (V1)",
    role: "sale",
    address: "0x0020Df30C127306f0F5B44E6a6E4368D2855842d",
    hasIsConcluded: false,
    numericReads: [],
  },
  {
    key: "MEMBERSHIP_SALE_V2",
    label: "Membership Sale V2",
    role: "sale",
    address: "0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b",
    hasIsConcluded: true,
    numericReads: [],
  },
  {
    // V3 is the deployed, funded, active direct-buy engine. The app enables no
    // wallet/write surface; these are read-only protocol facts, not a downgrade.
    key: "MEMBERSHIP_SALE_V3",
    label: "Membership Sale V3",
    role: "sale",
    address: "0x2A6cFc76906e758B934209AFf5A163c9bC20132E",
    hasIsConcluded: true,
    numericReads: [
      {
        idSuffix: "availableSyn",
        label: "V3 available SYN (raw base units)",
        view: "availableSyn",
        decimals: 18,
        unitNote:
          "Exact on-chain uint256 in 18-decimal SYN base units, read live from the active V3 engine. A read-only spine figure — the join transaction is signed from the visitor's own wallet, never by this server.",
      },
      {
        idSuffix: "totalGrossUsdc",
        label: "V3 total gross USDC (raw base units)",
        view: "totalGrossUsdc",
        decimals: 6,
        unitNote:
          "Exact on-chain uint256 in 6-decimal USDC base units, read live from the active V3 engine. A read-only cumulative spine figure — the join transaction is signed from the visitor's own wallet, never by this server.",
      },
      {
        idSuffix: "receiptCount",
        label: "V3 receipt count",
        view: "receiptCount",
        decimals: null,
        unitNote:
          "Exact on-chain receipt tally read live from the active V3 engine. A read-only spine figure — the join transaction is signed from the visitor's own wallet, never by this server.",
      },
    ],
  },
];

// ── ERC-20 metadata targets (symbol/decimals). SYN has a canon expectation. ───
export const TOKEN_TARGETS: readonly TokenTarget[] = [
  {
    key: "SYN",
    label: "SYN token",
    role: "token",
    address: "0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
    expect: { symbol: "SYN", decimals: 18 },
  },
  {
    key: "USDC",
    label: "USDC (Avalanche)",
    role: "stablecoin",
    address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  },
];

// ── Source linkage target (registry + the active engine that must point at it).
// Read-only Verified Introduction surface: the spine verifies the ACTIVE V3
// engine's SOURCE_REGISTRY() view resolves to the canon registry address
// (compared SERVER-SIDE only; never emitted). Source creation/activation is an
// owner-only on-chain action — no self-service creation surface exists here.
export type SourceLinkageTarget = {
  /** Safe internal key — never an address. */
  key: "SOURCE_REGISTRY_V1";
  label: string;
  /** SERVER-ONLY registry address; never emitted. */
  registryAddress: string;
  /** The active sale engine whose SOURCE_REGISTRY() must match the registry. */
  saleKey: "MEMBERSHIP_SALE_V3";
  /** SERVER-ONLY sale engine address; never emitted. */
  saleAddress: string;
};

export const SOURCE_LINKAGE_TARGET: SourceLinkageTarget = {
  key: "SOURCE_REGISTRY_V1",
  label: "Source Registry V1",
  registryAddress: "0x780013bB358be6be95b401901264FC7c22a595a6",
  saleKey: "MEMBERSHIP_SALE_V3",
  saleAddress: "0x2A6cFc76906e758B934209AFf5A163c9bC20132E",
};

// ── Archive1155 read target + the configured-on-chain artifact ids surfaced. ──
export const ARCHIVE_TARGET: ArchiveTarget = {
  key: "ARCHIVE_1155",
  label: "Archive 1155",
  address: "0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d",
};

export const ARCHIVE_ARTIFACTS: readonly ArchiveArtifactTarget[] = [
  { id: 1, label: "The First Signal", configuredOnChain: true },
  { id: 3, label: "Patron Seal", configuredOnChain: true },
];

// ─────────────────────────────────────────────────────────────────────────────
// Raw sale-event SCAN targets (SERVER-ONLY) — Sprint 2B-Part A.
// -----------------------------------------------------------------------------
// The read-only event indexer scans these contracts' historical logs via
// eth_getLogs. This is a SCAN-ONLY, read-only surface: no entry here is ever a
// buy/quote/approve/write target, and no address here is ever emitted.
//
// V2a (MEMBERSHIP_SALE_V2A) is a SUPERSEDED / SEALED earlier same-source deploy
// retained ONLY as a historical scan source (its `Purchased`/`Routed` history
// carries members absent from V1 and V2b). It is HISTORICAL_SEALED and MUST NEVER
// appear as an active sale target (it is intentionally NOT in SALE_TARGETS /
// CONTRACT_TARGETS). V3 is the ACTIVE engine; scanOnly is still true — the app
// enables no wallet/write surface anywhere.
//
// V1 doctrine (recorded, not acted on this sprint): V1 `TokensPurchased` has NO
// memberNumber in its payload. V1 members #1–#2 are canonically assigned by the
// historical-member freeze/root process using first-seen ordering. That freeze/
// root source is ABSENT from this workspace, so member-number assignment is
// BLOCKED (see freezeGate.ts) and is NOT inferred from raw events here.
// ─────────────────────────────────────────────────────────────────────────────

export type SaleGeneration = "V1" | "V2A" | "V2B" | "V3";

export type SaleScanTarget = {
  /** Safe internal key — never an address. */
  key: string;
  /** Human label for the surface (never an address). */
  label: string;
  generation: SaleGeneration;
  role: Extract<ProtocolContractRole, "sale">;
  /** SERVER-ONLY address; never emitted. */
  address: string;
  /** Pinned canon deployment block — the earliest block to scan from. */
  fromBlock: number;
  /**
   * HISTORICAL_SEALED = superseded/sealed engine, scan-only for continuity.
   * ACTIVE = current engine (V3). Neither implies any write/buy surface.
   */
  status: "HISTORICAL_SEALED" | "ACTIVE";
  /** Always true: this indexer only ever reads logs. Never a write/buy target. */
  scanOnly: true;
  /** Canon event names scanned on this contract. */
  events: readonly string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Aggregate FINANCIAL read targets (SERVER-ONLY) — Slice N1.
// -----------------------------------------------------------------------------
// Admin-side aggregate on-chain financial reads. Every figure is a LIVE chain
// read (eth_call), NEVER a canon constant — canon supplies only the ADDRESSES
// to read, and a reconcile guard proves each address still matches canon. No
// per-wallet data is ever read; no address here is ever emitted in a payload.
// ─────────────────────────────────────────────────────────────────────────────

export type FinancialInflowTarget = {
  /** Safe internal key — never an address (matches canon registry keys). */
  key:
    | "MEMBERSHIP_SALE"
    | "MEMBERSHIP_SALE_V2A"
    | "MEMBERSHIP_SALE_V2"
    | "MEMBERSHIP_SALE_V3";
  /** Human label for the surface (never an address). */
  label: string;
  /** SERVER-ONLY address; never emitted. */
  address: string;
  /** Which cumulative-USDC view this engine exposes (canon ABI fact). */
  view: "totalUsdcRaised" | "totalGrossUsdc";
};

export type FinancialTargets = {
  /**
   * Per-engine cumulative gross USDC inflow views, in deployment order
   * (V1 sealed → V2a superseded/sealed → V2b sealed → V3 active). V1 was
   * EXCLUDED by the original N1 scope; the reconciliation slice (founder-
   * approved scope change, July 2026) widened the aggregate to ALL FOUR
   * engines so the figure reconciles against the full on-chain history.
   * PROVENANCE DOCTRINE: the aggregate includes founder test transactions
   * made during protocol buildout — it is cumulative on-chain inflow, and
   * must NEVER be framed as external customer revenue.
   */
  inflows: readonly FinancialInflowTarget[];
  /** SERVER-ONLY vault reserve wallet (EOA) — the balanceOf() argument. */
  vaultWallet: string;
  /**
   * SERVER-ONLY liquidity wallet (EOA) — the 20% routing recipient. Provenance is
   * the deployed MembershipSaleV3.LIQUIDITY() immutable (reconciled by
   * sale-routing:reconcile). Emitted as an infra verify-link only, never a member.
   */
  liquidityWallet: string;
  /**
   * SERVER-ONLY operations wallet (EOA) — the balanceOf() argument for the
   * routed-split reconciliation read (engines route USDC 70/20/10 to
   * vault / liquidity / operations; the vault's CURRENT balance alone is
   * therefore never the cumulative inflow).
   */
  operationsWallet: string;
  /** SERVER-ONLY canonical burn address — the balanceOf() argument. */
  synBurnAddress: string;
  /** SERVER-ONLY token contract addresses (the balanceOf() call targets). */
  usdcTokenAddress: string;
  synTokenAddress: string;
  /** SERVER-ONLY AMM pair address (getReserves/token0 call target). */
  lpPair: string;
  /** The pair's IMMUTABLE token0 (canon pin, chain-verified 2026-07-15). */
  lpPairToken0: "USDC" | "SYN";
  /** The ACTIVE engine whose memberCount() is the live aggregate member tally. */
  memberCountEngine: { key: "MEMBERSHIP_SALE_V3"; address: string };
  /**
   * SERVER-ONLY — the founder's PRIVATE wallet (his own naming: "Founder
   * Private Wallet"; founder decision AW-1, 2026-07-22). Provenance: the
   * address was chain-recovered from the Archive1155 mint log at block
   * 87,350,581 (TransferSingle operator/to topics) and matches the canon
   * short form 0x2445…9C721 (historical member #1, duniter.eth). Joins the
   * backbone's founder label set so his public acts from this wallet
   * (7 historical archive mints, future burns/LP) say "Founder" — the
   * founder-voice rule. Never emitted; label decisions only.
   */
  founderPrivateWallet: string;
  /**
   * Public SYN allocation wallets (the initial-mint tokenomics distribution) —
   * SERVER-ONLY balanceOf(SYN) call targets. Keyed by a safe internal name; the
   * address is never emitted. Reconciled against canon ALLOCATION_WALLETS by the
   * targets guard. Each wallet's CURRENT balance is a LIVE figure and legitimately
   * differs from the mint-time design allocation as SYN sells / vests / moves.
   */
  allocationWallets: readonly { key: string; label: string; address: string }[];
};

export const FINANCIAL_TARGETS: FinancialTargets = {
  inflows: [
    {
      key: "MEMBERSHIP_SALE",
      label: "Membership Sale V1 (sealed)",
      address: "0x0020Df30C127306f0F5B44E6a6E4368D2855842d",
      view: "totalUsdcRaised",
    },
    {
      key: "MEMBERSHIP_SALE_V2A",
      label: "Membership Sale V2a (superseded/sealed)",
      address: "0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48",
      view: "totalUsdcRaised",
    },
    {
      key: "MEMBERSHIP_SALE_V2",
      label: "Membership Sale V2b (sealed)",
      address: "0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b",
      view: "totalUsdcRaised",
    },
    {
      key: "MEMBERSHIP_SALE_V3",
      label: "Membership Sale V3 (active)",
      address: "0x2A6cFc76906e758B934209AFf5A163c9bC20132E",
      view: "totalGrossUsdc",
    },
  ],
  vaultWallet: "0x205DdC8921A4C60106930eE35e1F395c8D13f464",
  // The 20% routing recipient. Provenance = the DEPLOYED MembershipSaleV3.LIQUIDITY()
  // immutable, reconciled equal to this value on 2026-07-12 (sale-routing:reconcile).
  // The chain is the authority; this served constant is asserted against it.
  liquidityWallet: "0xa9b072db8DcDbb470235204B69D37275d74a2e25",
  operationsWallet: "0x5cb57937D1cEa51014e7ed8baaa05ccA3F72BE80",
  synBurnAddress: "0x000000000000000000000000000000000000dEaD",
  usdcTokenAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  synTokenAddress: "0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
  lpPair: "0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389",
  /**
   * The pair's IMMUTABLE token0 (H1a-fix, chain-verified 2026-07-15): token0
   * is USDC, token1 is SYN — proven in prod by the reality spine's oriented
   * reserves (~2,678 SYN / ~55 USDC) and the founder's LP-add tx
   * (amount0 ≈ 39.85 USDC / amount1 ≈ 1,913.6 SYN). A UniV2-style pair can
   * never change token0, so this is canon, not state. The reality spine keeps
   * its own DYNAMIC token0() orientation for reserves (mismatch → null); the
   * backbone read-model orients its persisted amount0/amount1 rows with this
   * pin.
   */
  lpPairToken0: "USDC",
  memberCountEngine: {
    key: "MEMBERSHIP_SALE_V3",
    address: "0x2A6cFc76906e758B934209AFf5A163c9bC20132E",
  },
  // AW-1 (founder, 2026-07-22): "Founder Private Wallet" — chain-recovered
  // from the block-87,350,581 archive-mint log; see the type doc above.
  founderPrivateWallet: "0x244531C571966F90F4849E03a507543D90f9C721",
  allocationWallets: [
    { key: "MEMBERSHIP_DISTRIBUTION", label: "Membership Distribution", address: "0x975a4360FA808aC5D2Edb3c3412B2AeB9F5ECec8" },
    { key: "VAULT_RESERVE", label: "Vault Reserve", address: "0x205DdC8921A4C60106930eE35e1F395c8D13f464" },
    { key: "FOUNDER", label: "Founder", address: "0x88EC79AF0d5A2F3b83022A1770c645506803Dd73" },
    { key: "LIQUIDITY", label: "Liquidity", address: "0xa9b072db8DcDbb470235204B69D37275d74a2e25" },
    { key: "PARTNERSHIPS", label: "Partnerships", address: "0xf5BEdEEfe48f746d96C1847a5595318579bBcaCf" },
    { key: "CONTRIBUTORS", label: "Contributors", address: "0xa55132346C70e63d0c4E0Fb15F35075760dDEF7a" },
    { key: "FUTURE_ECOSYSTEM", label: "Future Ecosystem", address: "0x2530393881820AFe789f1c5D83817B70e46d2963" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Referral attribution activity SCAN target (SERVER-ONLY, scripts-side only).
// -----------------------------------------------------------------------------
// The SourceRegistryV1 contract exposes NO on-chain count view — attribution
// activity is only observable as lifecycle events. The RPC provider caps
// eth_getLogs at a 10,000-block range, so a per-request live count is
// impossible; instead the founder-gated referral-attribution:build script
// performs a chunked read-only scan and writes a static, hash-pinned snapshot
// (freezeGate / holder-index pattern). Served code imports ONLY the snapshot.
// The count is an ACTIVITY COUNT — never a USDC or commission figure. No
// commission has ever been paid on-chain; CommissionRouterV1 is not deployed.
// ─────────────────────────────────────────────────────────────────────────────

export type ReferralAttributionScanTarget = {
  /** Safe internal key — never an address (matches the canon registry key). */
  key: "SOURCE_REGISTRY_V1";
  /** Human label for the surface (never an address). */
  label: string;
  /** SERVER-ONLY address; never emitted. */
  address: string;
  /**
   * Pinned canon lower scan bound: the V1 sale deployment block — the earliest
   * protocol block on canon record, safely BEFORE the registry deployment (an
   * empty range prefix returns zero logs; nothing can be missed).
   */
  fromBlock: number;
  /** Always true: this target is only ever read via eth_getLogs in a script. */
  scanOnly: true;
};

export const REFERRAL_ATTRIBUTION_SCAN_TARGET: ReferralAttributionScanTarget = {
  key: "SOURCE_REGISTRY_V1",
  label: "Source Registry V1 — attribution activity scan",
  address: "0x780013bB358be6be95b401901264FC7c22a595a6",
  fromBlock: 87_157_852,
  scanOnly: true,
};

export const SALE_SCAN_TARGETS: readonly SaleScanTarget[] = [
  {
    key: "MEMBERSHIP_SALE",
    label: "Membership Sale (V1) — historical scan",
    generation: "V1",
    role: "sale",
    address: "0x0020Df30C127306f0F5B44E6a6E4368D2855842d",
    fromBlock: 87_157_852,
    status: "HISTORICAL_SEALED",
    scanOnly: true,
    events: ["TokensPurchased"],
  },
  {
    key: "MEMBERSHIP_SALE_V2A",
    label: "Membership Sale V2a (superseded/sealed) — historical scan",
    generation: "V2A",
    role: "sale",
    address: "0x0b883Ff08fE78146E4d81237dD7aE8A2a6502b48",
    fromBlock: 88_095_827,
    status: "HISTORICAL_SEALED",
    scanOnly: true,
    events: ["Purchased", "Routed"],
  },
  {
    key: "MEMBERSHIP_SALE_V2",
    label: "Membership Sale V2b (sealed) — historical scan",
    generation: "V2B",
    role: "sale",
    address: "0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b",
    fromBlock: 88_193_183,
    status: "HISTORICAL_SEALED",
    scanOnly: true,
    events: ["Purchased", "Routed"],
  },
  {
    key: "MEMBERSHIP_SALE_V3",
    label: "Membership Sale V3 (active) — event scan",
    generation: "V3",
    role: "sale",
    address: "0x2A6cFc76906e758B934209AFf5A163c9bC20132E",
    fromBlock: 88_505_301,
    status: "ACTIVE",
    scanOnly: true,
    events: ["MembershipPurchasedV3"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Protocol-event SCAN targets — Slice M4-c (SERVER-ONLY, backbone lane 2).
// -----------------------------------------------------------------------------
// The backbone's generic protocol-event streams: SYN burns (ERC20 Transfer to
// the dead address — topic-filtered server-side, so the scan is sparse) and
// the Source Registry lifecycle events. Both scan from the canonical earliest
// protocol block (the V1 sale deployment — safely BEFORE the first burn at
// block 87,703,847 and before the registry deployment; an empty range prefix
// returns zero logs, nothing can be missed). Addresses reuse the values
// already pinned above (FINANCIAL_TARGETS / REFERRAL_ATTRIBUTION_SCAN_TARGET)
// — one address, one source of truth, guard-reconciled.
// ─────────────────────────────────────────────────────────────────────────────

export type ProtocolEventScanTarget = {
  /** Safe internal stream key — never an address. */
  streamKey:
    | "SYN_BURN"
    | "SOURCE_LIFECYCLE"
    | "LP_LIQUIDITY"
    | "LP_TOKEN_MINT"
    | "ARCHIVE_MINT"
    | "ARCHIVE_PAUSE"
    // H2-⑦ — treasury movements (in/out per token; see the targets note).
    | "TREASURY_USDC_IN"
    | "TREASURY_USDC_OUT"
    | "TREASURY_SYN_IN"
    | "TREASURY_SYN_OUT";
  /** Human label for status surfaces (never an address). */
  label: string;
  /** SERVER-ONLY address; never emitted. */
  address: string;
  /** Pinned canon lower scan bound (the earliest protocol block on record). */
  fromBlock: number;
  /** Event names this stream persists (decoders are pinned in the lane). */
  events: readonly string[];
  scanOnly: true;
};

/**
 * H1a (THE COMPLETE HEARTBEAT ARC, founder-approved table 2026-07-15): the
 * Archive 1155 contract address, mirrored from CONTRACT_TARGETS (canon-
 * reconciled by the targets guard). SERVER-ONLY, never emitted.
 */
const ARCHIVE_1155_ADDRESS = "0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d";

export const PROTOCOL_EVENT_SCAN_TARGETS: readonly ProtocolEventScanTarget[] = [
  {
    streamKey: "SYN_BURN",
    label: "SYN burns (Proof of Burn) — transfer-to-dead scan",
    address: FINANCIAL_TARGETS.synTokenAddress,
    fromBlock: 87_157_852,
    events: ["Transfer"],
    scanOnly: true,
  },
  {
    streamKey: "SOURCE_LIFECYCLE",
    label: "Source Registry lifecycle — event scan",
    address: REFERRAL_ATTRIBUTION_SCAN_TARGET.address,
    fromBlock: 87_157_852,
    events: [
      "SourceCreated",
      "SourceTermsUpdated",
      "SourceStatusChanged",
      // H1a (⑯): wallet rotations join the lifecycle lane — public
      // administrative acts; "there are no silent edits."
      "SourceWalletUpdated",
      "SourcePayoutWalletUpdated",
    ],
    scanOnly: true,
  },
  // ── H1a — THE COMPLETE HEARTBEAT ARC (founder-approved table) ────────────
  {
    // ⑤⑥ liquidity added/removed — the pool's own Mint/Burn events.
    streamKey: "LP_LIQUIDITY",
    label: "LP pair liquidity events (add/remove)",
    address: FINANCIAL_TARGETS.lpPair,
    fromBlock: 87_157_852,
    events: ["Mint", "Burn"],
    scanOnly: true,
  },
  {
    // The pair's LP-token mint Transfer (from 0x0 → depositor): identifies
    // WHO deposited, for the Founder/Community label (the burns precedent —
    // the address enters the read-model and leaves only as a label).
    streamKey: "LP_TOKEN_MINT",
    label: "LP token mints (depositor identification for the label)",
    address: FINANCIAL_TARGETS.lpPair,
    fromBlock: 87_157_852,
    events: ["Transfer"],
    scanOnly: true,
  },
  {
    // ⑪ artifact mints — ERC-1155 TransferSingle with from = 0x0.
    streamKey: "ARCHIVE_MINT",
    label: "Archive artifact mints (TransferSingle from zero)",
    address: ARCHIVE_1155_ADDRESS,
    fromBlock: 87_157_852,
    events: ["TransferSingle"],
    scanOnly: true,
  },
  {
    // ⑨ ceremonial pause/unpause on the archive contract.
    streamKey: "ARCHIVE_PAUSE",
    label: "Archive pause/unpause (ceremonial founder acts)",
    address: ARCHIVE_1155_ADDRESS,
    fromBlock: 87_157_852,
    events: ["Paused", "Unpaused"],
    scanOnly: true,
  },
  // ── H2-⑦ — TREASURY MOVEMENTS (founder GO A, 2026-07-15): the three
  // routing organs (vault / liquidity / operations), USDC + SYN transfers.
  // eth_getLogs cannot OR across topic positions, so each token needs an IN
  // pass (to ∈ organs) and an OUT pass (from ∈ organs) — four streams. An
  // internal organ→organ transfer matches both passes and dedupes at the raw
  // table's (chain, tx, logIndex) unique key; direction is NEVER trusted from
  // the stream — the read-model derives it from the organ set. ORDER MATTERS:
  // these scan AFTER SYN_BURN so a burn's row always wins the unique key (and
  // the treasury SYN decoder additionally yields burn-address logs entirely —
  // the numbered Proof of Burn record stays sovereign).
  {
    streamKey: "TREASURY_USDC_IN",
    label: "Treasury USDC inflows (to ∈ routing organs)",
    address: FINANCIAL_TARGETS.usdcTokenAddress,
    fromBlock: 87_157_852,
    events: ["Transfer"],
    scanOnly: true,
  },
  {
    streamKey: "TREASURY_USDC_OUT",
    label: "Treasury USDC outflows (from ∈ routing organs)",
    address: FINANCIAL_TARGETS.usdcTokenAddress,
    fromBlock: 87_157_852,
    events: ["Transfer"],
    scanOnly: true,
  },
  {
    streamKey: "TREASURY_SYN_IN",
    label: "Treasury SYN inflows (to ∈ routing organs)",
    address: FINANCIAL_TARGETS.synTokenAddress,
    fromBlock: 87_157_852,
    events: ["Transfer"],
    scanOnly: true,
  },
  {
    streamKey: "TREASURY_SYN_OUT",
    label: "Treasury SYN outflows (from ∈ routing organs)",
    address: FINANCIAL_TARGETS.synTokenAddress,
    fromBlock: 87_157_852,
    events: ["Transfer"],
    scanOnly: true,
  },
];
