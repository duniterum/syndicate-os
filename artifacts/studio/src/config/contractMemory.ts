// config/contractMemory.ts
//
// Read-only "contract & economy memory" for the /contracts surface.
//
// SAFETY (non-negotiable):
//  - NO addresses, transaction hashes, balances, member rows, prices, or any
//    invented numbers. Roles and routing STRUCTURE only.
//  - Nothing renders as "Live". Each entry carries a `DisplayLifecycle` that
//    projects onto the canonical SourcePosture (never LIVE_ACTION).
//  - This is canon REFERENCE, not a live read. The app reads no chain here.
//  - No commission/reward/return is implied anywhere.
//
// `domain` reuses the canonical `SyndicateProofDomain`; `lifecycle` reuses the
// studio `DisplayLifecycle`. Both are type-only imports → Node-loadable.

import type { SyndicateProofDomain } from "@workspace/os-contracts";
import type { DisplayLifecycle } from "./truthStatus";

export type ContractMemoryCategory =
  | "token"
  | "membership"
  | "source"
  | "archive"
  | "identity"
  | "treasury"
  | "chain"
  | "proof";

export const contractMemoryCategoryText: Record<ContractMemoryCategory, string> = {
  token: "Tokens",
  membership: "Membership",
  source: "Source attribution",
  archive: "Archive",
  identity: "Identity",
  treasury: "Treasury & economy",
  chain: "Chain",
  proof: "Proof",
};

export interface ContractMemoryEntry {
  id: string;
  label: string;
  role: string;
  category: ContractMemoryCategory;
  domain: SyndicateProofDomain;
  lifecycle: DisplayLifecycle;
  /** Honest, non-sensitive note. No addresses, balances, or live claims. */
  note: string;
}

/** Page-level honesty preamble for the contract memory surface. */
export const contractMemoryIntro =
  "The protocol economy in two honest layers: a live, read-only view of what the protocol holds today, and canon memory of the contracts behind it — roles and structure only, with no addresses or member records ever shown.";

export const contractMemory: ContractMemoryEntry[] = [
  // --- Tokens --------------------------------------------------------------
  {
    id: "syn-token",
    label: "SYN Token",
    role: "Protocol token (ERC-20)",
    category: "token",
    domain: "CONTRACT_REGISTRY_STATUS",
    lifecycle: "READ_ONLY_PROOF",
    note: "Fixed-supply protocol token named in canon. No balance, supply figure, or price is read here.",
  },
  {
    id: "usdc",
    label: "USDC",
    role: "Settlement stablecoin",
    category: "token",
    domain: "CONTRACT_REGISTRY_STATUS",
    lifecycle: "READ_ONLY_PROOF",
    note: "Stablecoin named in canon for membership settlement. Reference only — no amounts are read.",
  },
  // --- Membership sales ----------------------------------------------------
  {
    id: "membership-sale-v1",
    label: "Membership Sale (v1)",
    role: "Earliest membership sale",
    category: "membership",
    domain: "MEMBERSHIP_SEAT_RECEIPT",
    lifecycle: "HISTORICAL_PROOF",
    note: "Earliest sale contract, retained as protocol history. No buy flow exists here.",
  },
  {
    id: "membership-sale-v2",
    label: "Membership Sale V2",
    role: "Superseded membership sale",
    category: "membership",
    domain: "MEMBERSHIP_SEAT_RECEIPT",
    lifecycle: "HISTORICAL_PROOF",
    note: "A later sale contract kept as a historical source for member continuity. Not transactable here.",
  },
  {
    id: "membership-sale-v3",
    label: "Membership Sale V3",
    role: "Active membership sale",
    category: "membership",
    domain: "MEMBERSHIP_SEAT_RECEIPT",
    lifecycle: "READ_ONLY_PROOF",
    note: "The active membership-sale engine in canon. Its lifecycle flags and public figures — available SYN, gross USDC received, and receipt count — are surfaced read-only on /status; no purchase, wallet, or transaction surface exists here.",
  },
  // --- Source attribution --------------------------------------------------
  {
    id: "source-registry-v1",
    label: "Source Registry V1",
    role: "Source-attribution registry",
    category: "source",
    domain: "SOURCE_VERIFIED_INTRODUCTION",
    lifecycle: "PAUSED_BY_PRECAUTION",
    note: "A deployed source-policy registry, intentionally inactive. No attribution is read or written here.",
  },
  {
    id: "commission-router-candidate",
    label: "Attribution Router (candidate)",
    role: "Future attribution routing",
    category: "source",
    domain: "SOURCE_VERIFIED_INTRODUCTION",
    lifecycle: "FUTURE",
    note: "A future candidate for routing verified introductions. Not deployed or wired. No commission or financial benefit is implied or paid.",
  },
  // --- Archive -------------------------------------------------------------
  {
    id: "archive-1155",
    label: "Syndicate Archive",
    role: "Multi-artifact archive (ERC-1155)",
    category: "archive",
    domain: "ARCHIVE_NFT_MEMORY",
    lifecycle: "READ_ONLY_PROOF",
    note: "Archive contract named in canon; some artifact classes are open, others gated. Reads are not wired and nothing is minted here.",
  },
  // --- Identity ------------------------------------------------------------
  {
    id: "seat-record-721",
    label: "Seat Record (candidate)",
    role: "Future seat identity record",
    category: "identity",
    domain: "WALLET_MEMBER_IDENTITY",
    lifecycle: "FUTURE",
    note: "A future identity record derived from verified seat truth. Not deployed.",
  },
  // --- Treasury & economy --------------------------------------------------
  {
    id: "treasury-routing",
    label: "Treasury Routing",
    role: "Fixed proceeds split",
    category: "treasury",
    domain: "TRANSPARENCY_ECONOMY_ROUTING",
    lifecycle: "READ_ONLY_PROOF",
    note: "Membership proceeds follow a fixed on-chain split — 70% protocol vault, 20% liquidity, 10% operations. Recorded canon, not a live read; this implies no financial benefit to members.",
  },
  {
    id: "vault-wallet",
    label: "Protocol Vault",
    role: "Primary treasury wallet",
    category: "treasury",
    domain: "TRANSPARENCY_ECONOMY_ROUTING",
    lifecycle: "READ_ONLY_PROOF",
    note: "The treasury wallet role in canon. No address or balance is shown.",
  },
  {
    id: "liquidity-wallet",
    label: "Liquidity",
    role: "Liquidity provisioning wallet",
    category: "treasury",
    domain: "TRANSPARENCY_ECONOMY_ROUTING",
    lifecycle: "READ_ONLY_PROOF",
    note: "Wallet role for protocol liquidity. Structure only — no address, balance, or price.",
  },
  {
    id: "operations-wallet",
    label: "Operations",
    role: "Operations wallet",
    category: "treasury",
    domain: "TRANSPARENCY_ECONOMY_ROUTING",
    lifecycle: "READ_ONLY_PROOF",
    note: "Wallet role funding protocol operations. No address or balance is shown.",
  },
  {
    id: "founder-wallet",
    label: "Founder (vested)",
    role: "Vested founder allocation",
    category: "treasury",
    domain: "TRANSPARENCY_ECONOMY_ROUTING",
    lifecycle: "READ_ONLY_PROOF",
    note: "The vested founder allocation role in canon. No address, schedule figure, or balance is shown.",
  },
  {
    id: "liquidity-pair",
    label: "Liquidity Pair",
    role: "On-chain liquidity pair",
    category: "treasury",
    domain: "TRANSPARENCY_ECONOMY_ROUTING",
    lifecycle: "READ_ONLY_PROOF",
    note: "A liquidity pair named in canon. No live price, reserve, or quote is read in this foundation.",
  },
  // --- Chain ---------------------------------------------------------------
  {
    id: "settlement-chain",
    label: "Settlement Chain",
    role: "Expected settlement network",
    category: "chain",
    domain: "CONTRACT_REGISTRY_STATUS",
    lifecycle: "READ_ONLY_PROOF",
    note: "The expected settlement network named in canon. The live chain id is surfaced on /status from the source registry, not hardcoded here.",
  },
  // --- Proof ---------------------------------------------------------------
  {
    id: "proof-of-fire",
    label: "Proof of Fire",
    role: "Burn / contribution proof",
    category: "proof",
    domain: "PROOF_OF_FIRE_BURN_EVENTS",
    lifecycle: "PENDING_ADAPTER",
    note: "Burn-based proof identifiers exist in canon but require event read-model wiring before any event can be shown.",
  },
];

export const getContractsByCategory = (
  category: ContractMemoryCategory,
): ContractMemoryEntry[] => contractMemory.filter((c) => c.category === category);

/** Categories that actually have entries, in display order. */
export const contractMemoryCategories: ContractMemoryCategory[] = [
  "token",
  "membership",
  "source",
  "archive",
  "identity",
  "treasury",
  "chain",
  "proof",
];
