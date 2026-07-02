/**
 * Sale-event SEMANTIC BRIDGE (SERVED, canon-mirrored) — Sprint 2B (Option C).
 * -------------------------------------------------------------------------
 * A tiny, type-safe binding from the RAW sale-event layer (exact ABI event
 * names + generation — see `saleEventDecoders.ts`, `data/protocolTargets.ts`,
 * and `lib/db/schema/indexer.ts`) to the EXISTING normalized Syndicate taxonomy
 * (vendored canon `protocol-event-registry.ts`: `ProtocolEventKind` /
 * `ProtocolEventCategory`).
 *
 * WHY THIS EXISTS
 *   The raw indexer is intentionally raw-only: `sale_event_raw` stores the exact
 *   ABI event name + generation and NEVER a normalized kind. The normalized
 *   taxonomy already exists ONCE, in canon. This module is the single, explicit
 *   place that says "raw (generation, eventName) means canon kind/category X",
 *   so any future normalization/projection imports ONE authoritative mapping
 *   instead of inventing a second, drifting taxonomy.
 *
 * WHAT THIS IS NOT
 *   - NOT a schema change. `sale_event_raw` stays raw-only; nothing here is a
 *     column. Later projections replay from raw rows. A future additive
 *     `blockTimestamp` column is a separate concern (Activity/Chronicle need it).
 *   - NOT a projection builder, Activity feed, Holder Index, or Part B import.
 *   - NOT a public surface. No value here is rendered. Product labels are the
 *     human strings below — NEVER the raw ABI names.
 *
 * CANON MIRRORING
 *   The api-server tsconfig excludes `src/canon`, so this served module cannot
 *   import the registry. It MIRRORS the two literals it needs (kind `purchase`,
 *   category `membership-sale`). The sibling guard
 *   `scripts/sale-event-semantics-reconcile.guard.ts` (tsx, MAY import canon)
 *   proves these literals + the kind→category binding still match
 *   `CATEGORY_FOR_KIND`, that `Routed` has no standalone kind, and that
 *   source/referral maps only to the PENDING future namespaces.
 */

import type { SaleGeneration } from "../../data/protocolTargets";

/**
 * Canon-mirrored `ProtocolEventKind` subset used by the membership sale. Every
 * sale action normalizes to the single `purchase` kind — canon folds routing
 * (vault / liquidity / operations / usdcRouted) INTO purchase's metric effects,
 * so `Routed` is NOT a standalone kind. Mirrors canon; verified by the guard.
 */
export type SaleSemanticKind = "purchase";

/** Canon-mirrored `ProtocolEventCategory` for the sale. Mirrors canon. */
export type SaleSemanticCategory = "membership-sale";

/** Public product label for a sale action. NEVER a raw ABI name. */
export const PUBLIC_SALE_LABEL = "Membership purchase" as const;

/** Engine posture. Neither value implies any write/buy surface. */
export type SaleGenerationPosture = "ACTIVE" | "HISTORICAL_SEALED";

/**
 * Per-generation semantic overlay on the raw layer. `generation` uses the CODE
 * enum values (`V1 | V2A | V2B | V3`, matching `SaleGeneration` /
 * `saleGenerationEnum`); `publicLabel` carries the human/canon label (e.g.
 * "V2a"). `contractKey` is the safe internal scan key and is DELIBERATELY NOT
 * the generation string (e.g. generation `V2B` uses contractKey
 * `MEMBERSHIP_SALE_V2`) — never conflate the two.
 */
export type SaleEventSemantics = {
  readonly generation: SaleGeneration;
  readonly publicLabel: string;
  readonly contractKey: string;
  readonly posture: SaleGenerationPosture;
  /** Exact raw ABI event name(s) — unchanged at the raw layer. */
  readonly rawEvents: readonly string[];
  readonly kind: SaleSemanticKind;
  readonly category: SaleSemanticCategory;
  /** Proof-object concept this generation produces (the OS bridge). */
  readonly receiptConcept: string;
  /** How member number is (or is not) obtained. */
  readonly memberNumberRule: string;
  /**
   * When two raw events form ONE purchase, how they pair. `null` = single-event
   * generation (no pairing).
   */
  readonly pairing: string | null;
  /**
   * SERVER-ONLY decoded fields that must NEVER reach a public payload or
   * diagnostic (buyer / recipient / source / referral). Gated until a
   * founder-approved release exists.
   */
  readonly gatedServerOnlyFields: readonly string[];
  /** Fail-closed anomaly rules a future projection must honor. */
  readonly anomalyRules: readonly string[];
};

export const SALE_EVENT_SEMANTICS: readonly SaleEventSemantics[] = [
  {
    generation: "V1",
    publicLabel: "V1",
    contractKey: "MEMBERSHIP_SALE",
    posture: "HISTORICAL_SEALED",
    rawEvents: ["TokensPurchased"],
    kind: "purchase",
    category: "membership-sale",
    receiptConcept:
      "Membership purchase → seat receipt candidate. No native receiptId; a receipt is synthesized from tx identity (chainId, txHash, logIndex).",
    memberNumberRule:
      "NEVER from the raw event — TokensPurchased carries no memberNumber. Member numbers are Part B (historical freeze/root, first-seen ordering), gated by freezeGate; never inferred here.",
    pairing: null,
    gatedServerOnlyFields: ["buyer"],
    anomalyRules: [
      "A TokensPurchased whose data/topics fail the pinned decode layout is fail-closed — never a partial or guessed row.",
    ],
  },
  {
    generation: "V2A",
    publicLabel: "V2a (superseded, sealed)",
    contractKey: "MEMBERSHIP_SALE_V2A",
    posture: "HISTORICAL_SEALED",
    rawEvents: ["Purchased", "Routed"],
    kind: "purchase",
    category: "membership-sale",
    receiptConcept:
      "Membership purchase → seat receipt candidate. One purchase per paired Purchased+Routed.",
    memberNumberRule:
      "memberNumber is an indexed topic on both Purchased and Routed; it identifies the purchase but does NOT itself assign a canonical seat (that remains Part B).",
    pairing:
      "Purchased + Routed pair into ONE purchase by (transactionHash, memberNumber).",
    gatedServerOnlyFields: ["buyer", "referralAmount"],
    anomalyRules: [
      "A Purchased with no matching Routed (same tx + memberNumber), or a Routed with no matching Purchased, is an anomaly — flag it; NEVER invent the missing routing split.",
      "Routed is NOT a standalone public kind; it only contributes routing amounts to the paired purchase.",
    ],
  },
  {
    generation: "V2B",
    publicLabel: "V2b (sealed)",
    contractKey: "MEMBERSHIP_SALE_V2",
    posture: "HISTORICAL_SEALED",
    rawEvents: ["Purchased", "Routed"],
    kind: "purchase",
    category: "membership-sale",
    receiptConcept:
      "Membership purchase → seat receipt candidate. One purchase per paired Purchased+Routed.",
    memberNumberRule:
      "Same as V2a: memberNumber identifies the purchase; canonical seat assignment remains Part B.",
    pairing:
      "Purchased + Routed pair into ONE purchase by (transactionHash, memberNumber).",
    gatedServerOnlyFields: ["buyer", "referralAmount"],
    anomalyRules: [
      "Unpaired Purchased/Routed (by tx + memberNumber) is an anomaly — flag it; NEVER invent the missing split.",
      "Routed is NOT a standalone public kind.",
      "contractKey 'MEMBERSHIP_SALE_V2' is NOT the generation 'V2B' — do not conflate them.",
    ],
  },
  {
    generation: "V3",
    publicLabel: "V3 (active)",
    contractKey: "MEMBERSHIP_SALE_V3",
    posture: "ACTIVE",
    rawEvents: ["MembershipPurchasedV3"],
    kind: "purchase",
    category: "membership-sale",
    receiptConcept:
      "Membership purchase with a NATIVE on-chain receipt (receiptId / receiptVersion) — the strongest seat receipt candidate.",
    memberNumberRule:
      "memberNumber is in the event payload and identifies the purchase; canonical seat assignment still flows through the Holder Index / Part B, never invented here.",
    pairing: null,
    gatedServerOnlyFields: [
      "buyer",
      "recipient",
      "sourceId",
      "sourceClass",
      "sourceWallet",
      "commissionBps",
      "attributionScope",
      "attributionWindowEndsAt",
      "sourceGrossRemaining",
      "buyerGrossRemaining",
      "acquisitionCost",
      "protocolContribution",
    ],
    anomalyRules: [
      "Source/referral fields are SERVER-ONLY and gated — no public source/referral release.",
      "A MembershipPurchasedV3 that fails the pinned decode layout is fail-closed.",
    ],
  },
];

/** Lookup by code-enum generation. */
export const SALE_EVENT_SEMANTICS_BY_GENERATION = Object.fromEntries(
  SALE_EVENT_SEMANTICS.map((s) => [s.generation, s] as const),
) as Readonly<Record<SaleGeneration, SaleEventSemantics>>;

/**
 * OS memory tiers — the vocabulary the receipt/proof object bridges into. These
 * are DISTINCT tiers, never collapsed into one raw feed. Documented here so a
 * future projection speaks one consistent language.
 */
export const OS_MEMORY_TIERS = {
  activity: "Live, verifiable heartbeat of confirmed protocol events.",
  chronicle: "Curated, permanent memory of protocol-level milestones.",
  register: "Institutional record.",
  archive: "Memory / artifact (Archive1155).",
  receipt:
    "The proof object — a confirmed sale receipt is the bridge from a raw event into the bigger Syndicate OS.",
} as const;

/**
 * Routing (`Routed` / the vault/liquidity/operations split) is folded INTO the
 * single `purchase` kind by canon — it is never its own public kind. Kept as a
 * named constant so future code reads the decision instead of re-deriving it.
 */
export const ROUTED_IS_STANDALONE_PUBLIC_KIND = false as const;
