import { z } from "zod";
import type { SourcePosture } from "@workspace/os-contracts";

/**
 * Phase 1 Slice 1 — /api/source-status posture-only static canon registry.
 *
 * This module is a STATIC, POSTURE-ONLY truth spine. It carries NO live values:
 * no balances, amounts, prices, member data, full wallet addresses, or RPC reads.
 * Every category's `value` is `null`. The Zod schema below restricts `posture` to
 * the canonical public-display subset of `@workspace/os-contracts` `SourcePosture`
 * (READ_ONLY_PROOF, NOT_WIRED, VERIFIED_SOURCE_PENDING_ADAPTER, FUTURE). The
 * forbidden LIVE_READ / PROTOTYPE / SIMULATED and the retired prior-art dialect
 * (ADAPTER_REQUIRED / NOT_LIVE / EXTERNAL) are not part of the enum, so they can
 * never be emitted; `value` is pinned to `null`, so any drift throws at startup.
 */

export const Posture = z.enum([
  "READ_ONLY_PROOF",
  "NOT_WIRED",
  "VERIFIED_SOURCE_PENDING_ADAPTER",
  "FUTURE",
]);

export const PublicClass = z.enum([
  "SAFE_PUBLIC",
  "INSTITUTIONAL_PUBLIC_SALE_SAFE",
  "PUBLIC_MEMORY_SAFE",
  "ECONOMIC_DASHBOARD_SAFE",
  "MEMBER_ONLY",
  "FOUNDER_OPERATOR_ONLY",
  "INTERNAL_ONLY",
  "FOUNDER_DECISION",
  "BLOCKED_PUBLIC",
]);

export const Confidence = z.enum(["high", "medium", "low"]);

export const SourceStatusItem = z.object({
  key: z.string(),
  label: z.string(),
  category: z.string(),
  posture: Posture,
  publicClass: PublicClass,
  statusBadge: z.string(),
  sourceRef: z.string(),
  confidence: Confidence,
  note: z.string(),
  surface: z.string(),
  value: z.null(),
});

export const SourceStatusResponse = z.object({
  asOf: z.string(),
  generatedBy: z.literal("static-canon"),
  mode: z.literal("POSTURE_ONLY"),
  expectedChainId: z.literal(43114),
  categories: z.record(z.string(), SourceStatusItem),
});

export type SourceStatusResponse = z.infer<typeof SourceStatusResponse>;

type Posture = z.infer<typeof Posture>;

/**
 * Compile-time conformance: every runtime `Posture` is a canonical `SourcePosture`.
 * This registry emits a fail-closed public-display subset of the canon — it never
 * defines a competing posture vocabulary. If the enum ever drifts off-canon this
 * assignment stops type-checking.
 */
const _postureConformsToSourcePosture: Posture extends SourcePosture ? true : never = true;
void _postureConformsToSourcePosture;

const STATUS_BADGE: Record<Posture, string> = {
  READ_ONLY_PROOF: "Read-only proof",
  NOT_WIRED: "Not wired",
  VERIFIED_SOURCE_PENDING_ADAPTER: "Verified source pending adapter",
  FUTURE: "Future",
};

/**
 * Canon-lock timestamp for this static registry. Fixed (not request-time) so the
 * posture-only payload is deterministic and never implies a live read.
 */
const CANON_AS_OF = "2026-06-29T00:00:00.000Z";

type CanonEntry = {
  key: string;
  label: string;
  posture: Posture;
  publicClass: z.infer<typeof PublicClass>;
  sourceRef: string;
  confidence: z.infer<typeof Confidence>;
  note: string;
  surface: string;
};

const CANON: CanonEntry[] = [
  {
    key: "chain",
    label: "Chain",
    posture: "READ_ONLY_PROOF",
    publicClass: "SAFE_PUBLIC",
    sourceRef: "vendored:the-syndicate/chain/chain-registry.ts@cf4ca34",
    confidence: "high",
    note: "Avalanche C-Chain expected (chainId 43114), now backed by the vendored chain registry canon pinned in this repo. Verified static fact, not a live RPC read.",
    surface: "/contracts",
  },
  {
    key: "contracts",
    label: "Contracts",
    posture: "READ_ONLY_PROOF",
    publicClass: "SAFE_PUBLIC",
    sourceRef: "vendored:the-syndicate/contracts/contract-registry.ts@cf4ca34",
    confidence: "high",
    note: "Contract registry and ABIs are vendored and pinned from TheSyndicate main canon; full addresses are held server-side only and never exposed in this payload. Live contract reads are not wired.",
    surface: "/contracts",
  },
  {
    key: "proof",
    label: "Proof",
    posture: "NOT_WIRED",
    publicClass: "SAFE_PUBLIC",
    sourceRef: "vendored:the-syndicate/proof/protocol-event-registry.ts@cf4ca34",
    confidence: "medium",
    note: "Protocol event registry (event taxonomy) is vendored and pinned; live event/proof data still requires an indexer/adapter before it can be wired.",
    surface: "/proof",
  },
  {
    key: "action",
    label: "Action",
    posture: "FUTURE",
    publicClass: "SAFE_PUBLIC",
    sourceRef: "reference:boost-action-pattern",
    confidence: "low",
    note: "Verifiable action model reserved; not active in this slice.",
    surface: "/proof",
  },
  {
    key: "receipt",
    label: "Receipt",
    posture: "FUTURE",
    publicClass: "PUBLIC_MEMORY_SAFE",
    sourceRef: "canon:source-attributed-receipts",
    confidence: "low",
    note: "Attestation/receipt model reserved; not active in this slice.",
    surface: "/proof",
  },
  {
    key: "source",
    label: "Source Attribution",
    posture: "NOT_WIRED",
    publicClass: "SAFE_PUBLIC",
    sourceRef: "canon:referral-attribution",
    confidence: "medium",
    note: "Introduction/source attribution is not wired; surfaced anonymized only once wired.",
    surface: "/source",
  },
  {
    key: "recognition",
    label: "Recognition",
    posture: "FUTURE",
    publicClass: "PUBLIC_MEMORY_SAFE",
    sourceRef: "canon:recognition-candidates",
    confidence: "low",
    note: "Standing model reserved; recognition formula pending founder decision.",
    surface: "/recognition",
  },
  {
    key: "membership",
    label: "Membership",
    posture: "NOT_WIRED",
    publicClass: "FOUNDER_DECISION",
    sourceRef: "canon:institutional-register-registry",
    confidence: "medium",
    note: "Membership posture only. No public PII, no full wallets, no personal member data; aggregate/history-safe only.",
    surface: "/member",
  },
  {
    key: "sale",
    label: "Sale",
    posture: "VERIFIED_SOURCE_PENDING_ADAPTER",
    publicClass: "INSTITUTIONAL_PUBLIC_SALE_SAFE",
    sourceRef: "vendored:the-syndicate/contracts/abi/sale-abi.ts@cf4ca34",
    confidence: "medium",
    note: "Institutional sale surface has a verified, vendored sale ABI in local canon, but no live sale adapter/indexer is wired yet. No amounts and no calls-to-action are exposed here.",
    surface: "/join",
  },
  {
    key: "token",
    label: "Token",
    posture: "READ_ONLY_PROOF",
    publicClass: "ECONOMIC_DASHBOARD_SAFE",
    sourceRef: "vendored:the-syndicate/contracts/syndicate-config.ts@cf4ca34",
    confidence: "high",
    note: "Token constants (SYN symbol, 18 decimals, USDC payment token, token and contract addresses) are vendored and pinned in the canon config; addresses are server-side only and never exposed. No price, supply, or balances are wired or exposed.",
    surface: "/token",
  },
  {
    key: "treasury",
    label: "Treasury",
    posture: "NOT_WIRED",
    publicClass: "ECONOMIC_DASHBOARD_SAFE",
    sourceRef: "canon:treasury-ledger-doctrine",
    confidence: "medium",
    note: "Treasury transparency requires an indexer with transaction anchoring; not wired.",
    surface: "/treasury",
  },
  {
    key: "routing",
    label: "Routing",
    posture: "NOT_WIRED",
    publicClass: "ECONOMIC_DASHBOARD_SAFE",
    sourceRef: "canon:treasury-ledger-doctrine",
    confidence: "medium",
    note: "USDC routing flow requires an indexer; not wired.",
    surface: "/treasury",
  },
  {
    key: "economy",
    label: "Economy",
    posture: "FUTURE",
    publicClass: "ECONOMIC_DASHBOARD_SAFE",
    sourceRef: "canon:protocol-economy-observatory-design",
    confidence: "low",
    note: "Economic dashboard reserved; not active in this slice.",
    surface: "/economy",
  },
  {
    key: "archive",
    label: "Archive",
    posture: "READ_ONLY_PROOF",
    publicClass: "PUBLIC_MEMORY_SAFE",
    sourceRef: "vendored:the-syndicate/archive/archive-id-registry.ts@cf4ca34",
    confidence: "high",
    note: "Archive ID registry (static artifact IDs) and the Archive NFT ABI are vendored and pinned; live archive reads are not wired.",
    surface: "/archive",
  },
  {
    key: "chronicle",
    label: "Chronicle",
    posture: "NOT_WIRED",
    publicClass: "PUBLIC_MEMORY_SAFE",
    sourceRef: "canon:chronicle-registry",
    confidence: "medium",
    note: "Protocol memory exists in TheSyndicate main canon but is not yet vendored or pinned in this rebuild. Promotes to read-only proof once vendored.",
    surface: "/chronicle",
  },
  {
    key: "learning",
    label: "Learning",
    posture: "NOT_WIRED",
    publicClass: "SAFE_PUBLIC",
    sourceRef: "canon:learning-canon",
    confidence: "medium",
    note: "Canon and education content exists in TheSyndicate main but is not yet vendored or pinned in this rebuild. Promotes to read-only proof once vendored.",
    surface: "/learning",
  },
  {
    key: "entities",
    label: "Entities",
    posture: "FUTURE",
    publicClass: "INTERNAL_ONLY",
    sourceRef: "reference:entity-registry-concept",
    confidence: "low",
    note: "Entity meta-registry reserved; concept only in this slice.",
    surface: "/entities",
  },
  {
    key: "indexer",
    label: "Indexer",
    posture: "FUTURE",
    publicClass: "INTERNAL_ONLY",
    sourceRef: "internal:indexer-design",
    confidence: "low",
    note: "Data-health/indexer reserved; design pending.",
    surface: "/indexer",
  },
  {
    key: "operator",
    label: "Operator",
    posture: "FUTURE",
    publicClass: "FOUNDER_OPERATOR_ONLY",
    sourceRef: "canon:founder-review",
    confidence: "low",
    note: "Operator/founder controls reserved; authentication deferred.",
    surface: "/founder",
  },
  {
    key: "guardrails",
    label: "Guardrails",
    posture: "READ_ONLY_PROOF",
    publicClass: "INTERNAL_ONLY",
    sourceRef: "canon:live-content-rules",
    confidence: "high",
    note: "Doctrine and copy guardrails are static canon, present in this repo and enforced at runtime by the endpoint guard.",
    surface: "/guardrails",
  },
];

/** The exact, approved category set for Phase 1. The registry must match this — no more, no less. */
const EXPECTED_KEYS = [
  "chain",
  "contracts",
  "proof",
  "action",
  "receipt",
  "source",
  "recognition",
  "membership",
  "sale",
  "token",
  "treasury",
  "routing",
  "economy",
  "archive",
  "chronicle",
  "learning",
  "entities",
  "indexer",
  "operator",
  "guardrails",
] as const;

/**
 * Forbidden substrings that must never appear anywhere in the serialized payload.
 * Covers the forbidden first-slice posture literals, financial/casino framing,
 * and "Supa-as-source" wording (Supa-Exchange is reference memory, never a
 * Syndicate data source). Lowercased; matched as substrings.
 */
const FORBIDDEN_SUBSTRINGS: string[] = [
  // forbidden first-slice posture literals
  "live_read",
  "prototype",
  "simulated",
  // forbidden financial / casino framing
  "guaranteed profit",
  "guaranteed return",
  "passive income",
  "payout",
  "jackpot",
  "betting",
  "wager",
  "reward farming",
  "liquidity mining",
  "buy for upside",
  "casino",
  "fake live",
  "airdrop",
  // Supa must never be cited as a Syndicate source
  "supa",
];

/**
 * Forbidden tokens that need word-boundary matching to avoid both false
 * negatives (`ROI`, `(ROI)`, `Yield`) and false positives inside larger words.
 */
const FORBIDDEN_PATTERNS: RegExp[] = [/\broi\b/i, /\byield/i, /\bprofit\b/i];

const WALLET_ADDRESS = /0x[a-fA-F0-9]{40}/;

/**
 * Posture-only discipline guard. Runs over the fully-built, schema-validated
 * payload and throws if any drift slips in: forbidden wording, a full wallet
 * address, a non-null value, or a category whose `category` field drifts from
 * its key. This is the runtime "guard pass" — the endpoint refuses to start if
 * the canon ever violates doctrine.
 */
function assertPayloadDiscipline(payload: SourceStatusResponse): void {
  const serialized = JSON.stringify(payload);
  const haystack = serialized.toLowerCase();
  for (const needle of FORBIDDEN_SUBSTRINGS) {
    if (haystack.includes(needle)) {
      throw new Error(`source-status forbidden content detected: "${needle.trim()}"`);
    }
  }
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error(`source-status forbidden content detected: ${pattern}`);
    }
  }
  if (WALLET_ADDRESS.test(serialized)) {
    throw new Error("source-status forbidden content detected: full wallet address");
  }
  for (const [key, item] of Object.entries(payload.categories)) {
    if (item.category !== key) {
      throw new Error(`source-status category/key mismatch: ${key} vs ${item.category}`);
    }
    if (item.value !== null) {
      throw new Error(`source-status non-null value for category: ${key}`);
    }
  }
}

function build(): SourceStatusResponse {
  const actualKeys = CANON.map((entry) => entry.key);
  const missing = EXPECTED_KEYS.filter((key) => !actualKeys.includes(key));
  const unexpected = actualKeys.filter(
    (key) => !(EXPECTED_KEYS as readonly string[]).includes(key),
  );
  if (missing.length || unexpected.length || actualKeys.length !== EXPECTED_KEYS.length) {
    throw new Error(
      `source-status canon mismatch: missing=[${missing.join(",")}] unexpected=[${unexpected.join(",")}] count=${actualKeys.length}`,
    );
  }

  const categories: Record<string, z.infer<typeof SourceStatusItem>> = {};
  for (const entry of CANON) {
    categories[entry.key] = {
      key: entry.key,
      label: entry.label,
      category: entry.key,
      posture: entry.posture,
      publicClass: entry.publicClass,
      statusBadge: STATUS_BADGE[entry.posture],
      sourceRef: entry.sourceRef,
      confidence: entry.confidence,
      note: entry.note,
      surface: entry.surface,
      value: null,
    };
  }

  const payload = SourceStatusResponse.parse({
    asOf: CANON_AS_OF,
    generatedBy: "static-canon",
    mode: "POSTURE_ONLY",
    expectedChainId: 43114,
    categories,
  });
  assertPayloadDiscipline(payload);
  return payload;
}

/** Validated once at module load; any forbidden posture or non-null value throws here. */
export const sourceStatusResponse: SourceStatusResponse = Object.freeze(build());
