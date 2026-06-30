// ─────────────────────────────────────────────────────────────────────────────
  // Vendored from duniterum/TheSyndicate main @ cf4ca34c74599de1324e77052f1a81dd15cb1cc0
  // source path: src/lib/archive-id-registry.ts
  // Read-only canon asset. Do not edit logic.
  // NOTE: This directory is excluded from the api-server TypeScript program and is
  // not yet imported by active app code. It exists as pinned local canon so future
  // status/contracts/proof/archive/token/sale wiring reads real files, not memory.
  // A future wiring slice owns any strict-mode / server-runtime adaptation.
  // ─────────────────────────────────────────────────────────────────────────────

  /**
 * Archive1155 ID Registry — single source of truth for every artifact id.
 *
 * Each entry declares activation truth: configured / active / public-mint
 * eligibility / price / wallet-limit / supply / category. UI gates MUST
 * source from this registry. Future IDs MUST add an entry here BEFORE any
 * UI surface can call them configured or active.
 *
 * Past failures this registry prevents:
 *   • ID 2 / 4–8 / 9 leaking a public-mint CTA
 *   • ID 9 claiming to be configured on-chain
 *   • Price / wallet-limit / supply drift between UI and contract
 *   • New IDs activated in the contract but stuck "NOT ACTIVE YET" in UI
 *
 * Live `active` flags are still read from the contract via wagmi/viem.
 * This registry encodes the design intent — when an id is publicMint-
 * eligible vs ownerOnly vs not-configured-on-chain.
 */

export type ArchiveIdActivation =
  | "LIVE_PUBLIC_MINT"     // configured + active + public
  | "RESERVED_DISABLED"    // configured slot, never public-mintable here
  | "OWNER_ONLY"           // configured for protocol/owner minting only
  | "NOT_CONFIGURED";      // not configured on-chain — roadmap only

export type ArchiveIdEntry = {
  id: number;
  name: string;
  category: string;
  activation: ArchiveIdActivation;
  /** true if the contract has been told this id exists. */
  configuredOnChain: boolean;
  /** true if the design allows a public CTA when active=true on-chain. */
  publicMintAllowed: boolean;
  /** USDC price, or null for no public price. */
  priceUsdc: number | null;
  /** Per-wallet limit, or null when not applicable. */
  walletLimit: number | null;
  /** Hard cap, or null when not applicable. */
  maxSupply: number | null;
  /** Whether definition is frozen on-chain. */
  frozen: boolean;
  notes: string;
};

export const ARCHIVE_ID_REGISTRY: ArchiveIdEntry[] = [
  {
    id: 1,
    name: "The First Signal",
    category: "Genesis Chapter Artifact",
    activation: "LIVE_PUBLIC_MINT",
    configuredOnChain: true,
    publicMintAllowed: true,
    priceUsdc: 0.5,
    walletLimit: 5,
    maxSupply: 10_000,
    frozen: true,
    notes: "Chapter I (Genesis Signal · Members #1 – #333). Public mint OPEN. Hard cap 10,000 (on-chain maxSupply) — a fixed edition, NOT uncapped.",
  },
  {
    id: 2,
    name: "Reserved Seat Record Reference",
    category: "SeatRecord721 identity (reserved)",
    activation: "RESERVED_DISABLED",
    configuredOnChain: true,
    publicMintAllowed: false,
    priceUsdc: null,
    walletLimit: null,
    maxSupply: null,
    frozen: true,
    notes: "Reserved slot only. SeatRecord721 identity records live in the future ERC-721 SyndicateSeatRecord721 contract (PENDING).",
  },
  {
    id: 3,
    name: "Patron Seal",
    category: "Patron",
    activation: "LIVE_PUBLIC_MINT",
    configuredOnChain: true,
    publicMintAllowed: true,
    priceUsdc: 5,
    walletLimit: 5,
    maxSupply: 10_000,
    frozen: true,
    notes: "Flat support artifact. Active at 5.00 USDC; wallet mintability is shown only from live Archive1155 reads.",
  },
  {
    id: 4,
    name: "Protocol Memory Artifact IV",
    category: "Protocol Memory (owner-only)",
    activation: "OWNER_ONLY",
    configuredOnChain: true,
    publicMintAllowed: false,
    priceUsdc: null,
    walletLimit: null,
    maxSupply: null,
    frozen: true,
    notes: "Owner-mint only. Never exposes a public CTA in this contract.",
  },
  {
    id: 5,
    name: "Protocol Memory Artifact V",
    category: "Protocol Memory (owner-only)",
    activation: "OWNER_ONLY",
    configuredOnChain: true,
    publicMintAllowed: false,
    priceUsdc: null,
    walletLimit: null,
    maxSupply: null,
    frozen: true,
    notes: "Owner-mint only.",
  },
  {
    id: 6,
    name: "Protocol Memory Artifact VI",
    category: "Protocol Memory (owner-only)",
    activation: "OWNER_ONLY",
    configuredOnChain: true,
    publicMintAllowed: false,
    priceUsdc: null,
    walletLimit: null,
    maxSupply: null,
    frozen: true,
    notes: "Owner-mint only.",
  },
  {
    id: 7,
    name: "Protocol Memory Artifact VII",
    category: "Protocol Memory (owner-only)",
    activation: "OWNER_ONLY",
    configuredOnChain: true,
    publicMintAllowed: false,
    priceUsdc: null,
    walletLimit: null,
    maxSupply: null,
    frozen: true,
    notes: "Owner-mint only.",
  },
  {
    id: 8,
    name: "Protocol Memory Artifact VIII",
    category: "Protocol Memory (owner-only)",
    activation: "OWNER_ONLY",
    configuredOnChain: true,
    publicMintAllowed: false,
    priceUsdc: null,
    walletLimit: null,
    maxSupply: null,
    frozen: true,
    notes: "Owner-mint only.",
  },
  {
    id: 9,
    name: "Protocol Chronicle",
    category: "Roadmap (not configured)",
    activation: "NOT_CONFIGURED",
    configuredOnChain: false,
    publicMintAllowed: false,
    priceUsdc: null,
    walletLimit: null,
    maxSupply: null,
    frozen: false,
    notes: "Roadmap only. NOT configured on-chain. UI MUST NOT claim configured or active.",
  },
];

export function archiveIdEntry(id: number): ArchiveIdEntry | undefined {
  return ARCHIVE_ID_REGISTRY.find((e) => e.id === id);
}

export function isPublicMintEligible(id: number): boolean {
  const e = archiveIdEntry(id);
  return !!e && e.publicMintAllowed && e.activation === "LIVE_PUBLIC_MINT";
}

export function publicMintIds(): number[] {
  return ARCHIVE_ID_REGISTRY.filter((e) => isPublicMintEligible(e.id)).map((e) => e.id);
}
