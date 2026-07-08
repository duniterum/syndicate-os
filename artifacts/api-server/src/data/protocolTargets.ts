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
  { key: "MEMBERSHIP_SALE_V2", label: "Membership Sale V2", role: "sale", address: "0x507E9c9C365a865F2A2b94DA9E12ccCC2bBeB88b" },
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
          "Exact on-chain uint256 in 18-decimal SYN base units, read live from the active V3 engine. Read-only; no wallet or write surface is enabled in this app.",
      },
      {
        idSuffix: "totalGrossUsdc",
        label: "V3 total gross USDC (raw base units)",
        view: "totalGrossUsdc",
        decimals: 6,
        unitNote:
          "Exact on-chain uint256 in 6-decimal USDC base units, read live from the active V3 engine. Read-only cumulative figure; no wallet or write surface is enabled in this app.",
      },
      {
        idSuffix: "receiptCount",
        label: "V3 receipt count",
        view: "receiptCount",
        decimals: null,
        unitNote:
          "Exact on-chain receipt tally read live from the active V3 engine. Read-only; no wallet or write surface is enabled in this app.",
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
  key: "MEMBERSHIP_SALE_V2A" | "MEMBERSHIP_SALE_V2" | "MEMBERSHIP_SALE_V3";
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
   * (V2a superseded/sealed → V2b sealed → V3 active). V1 is EXCLUDED by
   * founder-approved N1 scope ("V2 + V2A + V3"), even though its canon ABI
   * also exposes totalUsdcRaised() — widening to V1 is a deliberate future
   * scope change, never a silent addition.
   */
  inflows: readonly FinancialInflowTarget[];
  /** SERVER-ONLY vault reserve wallet (EOA) — the balanceOf() argument. */
  vaultWallet: string;
  /** SERVER-ONLY canonical burn address — the balanceOf() argument. */
  synBurnAddress: string;
  /** SERVER-ONLY token contract addresses (the balanceOf() call targets). */
  usdcTokenAddress: string;
  synTokenAddress: string;
  /** SERVER-ONLY AMM pair address (getReserves/token0 call target). */
  lpPair: string;
  /** The ACTIVE engine whose memberCount() is the live aggregate member tally. */
  memberCountEngine: { key: "MEMBERSHIP_SALE_V3"; address: string };
};

export const FINANCIAL_TARGETS: FinancialTargets = {
  inflows: [
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
  synBurnAddress: "0x000000000000000000000000000000000000dEaD",
  usdcTokenAddress: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  synTokenAddress: "0xC1Cf19a52603c1F71C057BDE71d723CFa2fB0170",
  lpPair: "0xe12491b79c9cfc6a07db8cd7fc8b3da0bb019389",
  memberCountEngine: {
    key: "MEMBERSHIP_SALE_V3",
    address: "0x2A6cFc76906e758B934209AFf5A163c9bC20132E",
  },
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
