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
  /** Honest, non-sensitive note. No addresses or balances IN the note —
   *  pointing at the live layer that shows them is the norm (2026-07-30). */
  note: string;
}

/** Page-level honesty preamble for the contract memory surface. */
export const contractMemoryIntro =
  "The protocol economy in two honest layers: a live view of what the protocol holds today — balances with their explorer verify-links — and canon memory of the contracts behind it: roles and structure, never a member record.";

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
  // AUD-TRUTH-3 (founder catch, 2026-07-16): FOUR sale engines exist on-chain
  // — V1 · V2a · V2b · V3 (all four scanned gaplessly by the backbone; seats
  // #3–#5 born on V2a, #6–#8 on V2b). The public inventory listed only three,
  // and its "V2" card was really the V2b engine. The missing card + the
  // precise label enter here; internal contract KEYS never change (DB rows).
  {
    id: "membership-sale-v2a",
    label: "Membership Sale V2a",
    role: "Superseded membership sale",
    category: "membership",
    domain: "MEMBERSHIP_SEAT_RECEIPT",
    lifecycle: "HISTORICAL_PROOF",
    note: "The second-generation engine that preceded V2b — seats #3 to #5 were born here. Sealed; its full purchase history is indexed and served on the live record.",
  },
  {
    id: "membership-sale-v2",
    label: "Membership Sale V2b",
    role: "Superseded membership sale",
    category: "membership",
    domain: "MEMBERSHIP_SEAT_RECEIPT",
    lifecycle: "HISTORICAL_PROOF",
    note: "The third-generation engine — seats #6 to #8 were born here. Kept as a historical source for member continuity; sealed, indexed, not transactable.",
  },
  {
    id: "membership-sale-v3",
    label: "Membership Sale V3",
    role: "Active membership sale",
    category: "membership",
    domain: "MEMBERSHIP_SEAT_RECEIPT",
    lifecycle: "READ_ONLY_PROOF",
    note: "The active membership-sale engine in canon. Its lifecycle flags and public figures — available SYN, gross USDC received, and receipt count — are surfaced on /status; no purchase, wallet, or transaction surface exists here.",
  },
  // --- Source attribution --------------------------------------------------
  {
    id: "source-registry-v1",
    label: "Source Registry V1",
    role: "Source-attribution registry",
    category: "source",
    domain: "SOURCE_VERIFIED_INTRODUCTION",
    // AUD-TRUTH (2026-07-16): the dead-registry claim DIED — the registry is
    // live behind the paying referral program (the era-drift P1 class).
    lifecycle: "READ_ONLY_PROOF",
    note: "The deployed source-policy registry behind the live referral program: founder-signed sources are checked here at purchase time, and an eligible attributed purchase pays its bounded commission inside the buyer's own transaction.",
  },
  // DELETED 2026-07-25 (founder caught it on the live page). This card carried
  // TWO falsehoods side by side with the Source Registry card above: it denied
  // that any commission is paid — while eligible referrers ARE paid, on-chain,
  // inside the buyer's own purchase transaction (proven: seat #13) — and it
  // published an INTERNAL, never-announced plan as a public promise, which the
  // founder's engraved rule forbids ("an internal plan never becomes a public
  // promise"). The identical denial had already been killed once on /status and
  // once on the home page; it survived here. The live truth is fully carried by
  // the Source Registry V1 card directly above — no replacement is needed.
  // --- Archive -------------------------------------------------------------
  {
    id: "archive-1155",
    label: "Syndicate Archive",
    role: "Multi-artifact archive (ERC-1155)",
    category: "archive",
    domain: "ARCHIVE_NFT_MEMORY",
    lifecycle: "READ_ONLY_PROOF",
    // AUD-ROUTE (2026-07-17): "counts and prices are read live" DIED here —
    // the pages rendering this note perform no live reads; the honest truth
    // is that every mint lands on the indexed public record.
    note: "Archive contract live on-chain; some artifact classes are open, others gated. Every mint lands as a public line on the indexed record.",
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
    // Footer audit 2026-07-30: the "No address or balance is shown" family
    // DIED on this page — ProtocolAssetsCard prints the live balances with
    // explorer links two scrolls up. The memory card points at the live
    // layer instead of denying it (the 2026-07-25 address model).
    note: "The treasury wallet role in canon. Its live balances and explorer link are shown in Protocol assets above.",
  },
  {
    id: "liquidity-wallet",
    label: "Liquidity",
    role: "Liquidity provisioning wallet",
    category: "treasury",
    domain: "TRANSPARENCY_ECONOMY_ROUTING",
    lifecycle: "READ_ONLY_PROOF",
    note: "Wallet role for protocol liquidity. The pool's live reserves and the protocol's own LP share are read in Protocol assets above.",
  },
  {
    id: "operations-wallet",
    label: "Operations",
    role: "Operations wallet",
    category: "treasury",
    domain: "TRANSPARENCY_ECONOMY_ROUTING",
    lifecycle: "READ_ONLY_PROOF",
    note: "Wallet role funding protocol operations. Its live USDC balance and explorer link are shown in Protocol assets above.",
  },
  {
    id: "founder-wallet",
    label: "Founder (vested)",
    role: "Vested founder allocation",
    category: "treasury",
    domain: "TRANSPARENCY_ECONOMY_ROUTING",
    lifecycle: "READ_ONLY_PROOF",
    note: "The vested founder allocation role in canon. The wallet is public — its live SYN balance is read on Tokenomics, beside the published vesting commitment.",
  },
  {
    id: "liquidity-pair",
    label: "Liquidity Pair",
    role: "On-chain liquidity pair",
    category: "treasury",
    domain: "TRANSPARENCY_ECONOMY_ROUTING",
    lifecycle: "READ_ONLY_PROOF",
    note: "The SYN/USDC pair in canon. Its live reserves and the protocol's LP share are read in Protocol assets above; this memory card carries role and structure only.",
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
    // AUD-TRUTH (2026-07-16): the numbered burn record went live with the
    // event backbone — the pending claim was a fossil.
    lifecycle: "READ_ONLY_PROOF",
    note: "The numbered Proof of Burn record is live: every burn is a line with its transaction on the Fire Ledger, and the retired total is read live from the chain.",
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
