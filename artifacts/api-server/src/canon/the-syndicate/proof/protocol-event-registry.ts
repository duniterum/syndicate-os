// ─────────────────────────────────────────────────────────────────────────────
  // Vendored from duniterum/TheSyndicate main @ cf4ca34c74599de1324e77052f1a81dd15cb1cc0
  // source path: src/lib/protocol-event-registry.ts
  // Read-only canon asset. Do not edit logic.
  // NOTE: This directory is excluded from the api-server TypeScript program and is
  // not yet imported by active app code. It exists as pinned local canon so future
  // status/contracts/proof/archive/token/sale wiring reads real files, not memory.
  // A future wiring slice owns any strict-mode / server-runtime adaptation.
  // ─────────────────────────────────────────────────────────────────────────────

  // ─── Protocol Event Registry ───────────────────────────────────────────────
// The single classification table for the canonical Protocol Event Pipeline.
//
//   raw event → normalized ProtocolEvent → metric effects → Activity →
//   Chronicle candidate → reports → dashboards → future modules
//
// The Protocol Metrics Registry solved metric drift (one definition per
// number). This registry solves EVENT drift: each event KIND is classified
// ONCE here — its category, the metrics it affects, whether it can become a
// Chronicle candidate, and where it should surface — then reused everywhere.
//
// This is a pure-data leaf: it declares the `kind` union and the maps over it.
// `protocol-events.ts` owns the live ProtocolEvent shape and re-exports these
// types, so existing consumers keep importing `ProtocolEventKind` unchanged.
//
// metricEffects values are canonical metric ids from
// `protocol-metrics-registry.ts`. They are kept as plain strings here (no
// import) and cross-checked by `protocol-event-registry.test.ts`, which fails
// if any referenced id is not a real registered metric.

/**
 * Granular, on-chain-or-protocol-recognized event type. This is the
 * discriminant the whole pipeline switches on (the spec's "type").
 */
export type ProtocolEventKind =
  | "purchase"
  | "swap-buy"
  | "swap-sell"
  | "lp-add"
  | "lp-remove"
  | "vault-in"
  | "vault-out"
  | "new-member"
  | "rank-reached"
  | "nft-mint-first-signal"
  | "nft-mint-patron-seal"
  | "nft-mint-other"
  | "burn-founder"
  | "burn-community";

/**
 * High-level bucket an event belongs to. Mirrors the spec's seven on-chain
 * event families. `syn-transfer` is reserved for general SYN movements; today
 * its only indexed manifestation is a transfer to the burn address (classified
 * under `burn`), so no live kind maps to it yet — it stays documented.
 */
export type ProtocolEventCategory =
  | "membership-sale"
  | "syn-transfer"
  | "burn"
  | "archive"
  | "lp"
  | "protocol-wallet";

/** Each kind's high-level family. Exhaustive over ProtocolEventKind. */
export const CATEGORY_FOR_KIND: Record<ProtocolEventKind, ProtocolEventCategory> = {
  purchase: "membership-sale",
  "new-member": "membership-sale",
  "rank-reached": "membership-sale",
  "swap-buy": "lp",
  "swap-sell": "lp",
  "lp-add": "lp",
  "lp-remove": "lp",
  "vault-in": "protocol-wallet",
  "vault-out": "protocol-wallet",
  "nft-mint-first-signal": "archive",
  "nft-mint-patron-seal": "archive",
  "nft-mint-other": "archive",
  "burn-founder": "burn",
  "burn-community": "burn",
};

/**
 * Which registered metrics each event kind moves. Values are canonical metric
 * ids (see protocol-metrics-registry.ts); the integrity test guarantees every
 * id here exists. Used by the pipeline and the /labs/protocol-events workbench
 * to show "this event affects these numbers" without re-deriving anything.
 */
export const EVENT_METRIC_EFFECTS: Record<ProtocolEventKind, readonly string[]> = {
  purchase: [
    "members",
    "synSold",
    "usdcRouted",
    "vaultWalletUsdc",
    "liquidityWalletUsdc",
    "operationsWalletUsdc",
    "protocolWalletsTotal",
    "rankDistribution",
    "chapterProgress",
    "nextMember",
    "purchaseCount",
    "lastBuy",
    "lastBuyBuyer",
  ],
  "new-member": ["members", "nextMember", "chapterProgress"],
  "rank-reached": ["rankDistribution"],
  "swap-buy": ["synSpotPrice", "lpTvl"],
  "swap-sell": ["synSpotPrice", "lpTvl"],
  "lp-add": ["lpTvl", "synSpotPrice"],
  "lp-remove": ["lpTvl", "synSpotPrice"],
  "vault-in": ["vaultWalletUsdc", "protocolWalletsTotal"],
  "vault-out": ["vaultWalletUsdc", "protocolWalletsTotal", "classifiedSpend"],
  "nft-mint-first-signal": ["artifactsTotal", "firstSignalMinted"],
  "nft-mint-patron-seal": ["artifactsTotal", "patronSealMinted"],
  "nft-mint-other": ["artifactsTotal"],
  "burn-founder": ["burnedSupply", "circulatingSupply", "proofOfBurnCount", "latestBurn"],
  "burn-community": ["burnedSupply", "circulatingSupply", "proofOfBurnCount", "latestBurn"],
};

/**
 * Whether a kind may be considered a Chronicle CANDIDATE (advisory only — the
 * six-part selection gate in chronicle-entries.ts + manual curation is the real
 * filter; nothing here auto-feeds the Chronicle).
 *
 * Person-subject rows (purchase / new-member / rank-reached) are NEVER eligible
 * — Chronicle clause 6 forbids wallet/member subjects. Routine LP trades and
 * treasury flows are excluded as non-milestones. Burns, structural liquidity
 * changes, and artifact mints are protocol-level milestones and qualify.
 */
const CHRONICLE_ELIGIBLE_KINDS: ReadonlySet<ProtocolEventKind> = new Set<ProtocolEventKind>([
  "burn-founder",
  "burn-community",
  "lp-add",
  "lp-remove",
  "nft-mint-first-signal",
  "nft-mint-patron-seal",
  "nft-mint-other",
]);

export function chronicleEligibleForKind(kind: ProtocolEventKind): boolean {
  return CHRONICLE_ELIGIBLE_KINDS.has(kind);
}

/** Recommended reuse surfaces per category (advisory — not enforced). */
export const RECOMMENDED_SURFACES_FOR_CATEGORY: Record<ProtocolEventCategory, readonly string[]> = {
  "membership-sale": [
    "Activity feed",
    "Protocol Intelligence Bar",
    "Tokenomics",
    "Transparency",
    "/labs/protocol-intelligence",
    "Reports (future)",
  ],
  "syn-transfer": ["Activity feed", "Transparency", "/labs/protocol-events"],
  burn: [
    "Activity feed",
    "Chronicle (candidate)",
    "Protocol Intelligence Bar",
    "Tokenomics",
    "Supply line",
    "/labs/protocol-intelligence",
  ],
  archive: [
    "Activity feed",
    "Chronicle (candidate)",
    "Archive (/nft)",
    "/labs/protocol-intelligence",
  ],
  lp: ["Activity feed", "Liquidity (/liquidity)", "Protocol Intelligence Bar", "Transparency"],
  "protocol-wallet": [
    "Activity feed",
    "Transparency (Use of Funds)",
    "Protocol Intelligence Bar",
  ],
};

// ─── Future event namespaces (RESERVED — not implemented) ────────────────────
// Clean namespaces reserved so future modules have a home without re-opening
// event drift. NONE are scanned, emitted, or wired. All are PENDING. They are
// intentionally kept OUT of ProtocolEventKind so no consumer must handle them.

export type FutureEventNamespaceId =
  | "referral-attribution"
  | "referral-reward"
  | "seat-record-721"
  | "governance"
  | "burn-governance"
  | "protocol-intelligence-b2b"
  | "marketplace";

export type FutureEventNamespace = {
  id: FutureEventNamespaceId;
  label: string;
  status: "PENDING";
  description: string;
  /** Vocabulary forbidden for this namespace until a real contract exists. */
  forbiddenVocab?: readonly string[];
};

const REFERRAL_FORBIDDEN = [
  "earn now",
  "passive income",
  "ROI",
  "yield",
  "guaranteed reward",
] as const;

export const FUTURE_EVENT_NAMESPACES: readonly FutureEventNamespace[] = [
  {
    id: "referral-attribution",
    label: "Referral attribution",
    status: "PENDING",
    description:
      "Records who brought whom into The Syndicate (e.g. Member #27 brought Member #456): buyer/member number, USDC routed, SYN sold. Attribution only — a verified growth contribution and member recognition. No commission is implied or paid until verified source records are created, read back, legally approved, and wired live.",
    forbiddenVocab: REFERRAL_FORBIDDEN,
  },
  {
    id: "referral-reward",
    label: "Referral commission settlement",
    status: "PENDING",
    description:
      "Future source commission settlement for verified source-attributed purchases. Commission status stays PENDING and pays nothing until verified source records are created, read back, legally approved, and wired live.",
    forbiddenVocab: REFERRAL_FORBIDDEN,
  },
  {
    id: "seat-record-721",
    label: "SeatRecord721",
    status: "PENDING",
    description:
      "Reserved namespace for a future non-transferable identity record derived from SYN seat truth and the Holder Index. No contract deployed.",
  },
  {
    id: "governance",
    label: "Governance",
    status: "PENDING",
    description:
      "Reserved namespace for future protocol governance signals. No contract deployed; rank confers no voting rights.",
  },
  {
    id: "burn-governance",
    label: "Burn governance",
    status: "PENDING",
    description:
      "Reserved namespace for future community-directed burn decisions. No contract deployed; the protocol runs no automated burn.",
  },
  {
    id: "protocol-intelligence-b2b",
    label: "Protocol intelligence / B2B",
    status: "PENDING",
    description:
      "Reserved namespace for future B2B protocol-intelligence data products. No implementation.",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    status: "PENDING",
    description:
      "Reserved namespace for a future artifact marketplace. No contract deployed.",
  },
];
