/**
 * @workspace/os-contracts — Source Boundary type contracts
 *
 * TYPE-ONLY. Compile-time contracts that encode the reconciled posture /
 * surface / proof-domain / adapter vocabulary from the Source Boundary Manifest
 * (the current authority) and the 2.19D Prior-Art Reconciliation.
 *
 * Hard rules (why this file contains no runtime code, no data, no examples):
 *  - These contracts are NOT evidence that any data, source, adapter, or live
 *    wiring exists. They describe shape and vocabulary only.
 *  - Reference repositories (e.g. the old public TheSyndicate) are PATTERN
 *    SOURCES ONLY — never authority, never a data source.
 *  - Old LIVE / LIVE_READ *read* semantics map to READ_ONLY_PROOF.
 *  - LIVE_ACTION is reserved exclusively for gated, real actions / writes.
 *  - Posture, source authority, and confidence are THREE SEPARATE AXES; never
 *    infer one from another (confidence is never proof of live status).
 *  - Existing verified sales / member / receipt data must be modelled as
 *    VERIFIED_SOURCE_PENDING_ADAPTER or AUTH_REQUIRED until adapters / auth
 *    exist — never invented, never SIMULATED, never prematurely public.
 *  - Rejected prior-art postures SIMULATED / PROTOTYPE / DEMO_PREVIEW are NOT
 *    part of this vocabulary and must never be added as accepted values.
 */

// ---------------------------------------------------------------------------
// 1. SourcePosture — the manifest's 7-state posture lifecycle (capability /
//    security axis). This is the primary canon.
// ---------------------------------------------------------------------------

/**
 * The honest capability/security posture of a proof domain on a given surface.
 *
 * - NOT_WIRED ........................ no source/adapter; renders as a
 *   truth-labelled placeholder only.
 * - READ_ONLY_PROOF ................. verified, read-only display of locally
 *   present / pinned canon (NOT a permanent product freeze, just no writes).
 * - VERIFIED_SOURCE_PENDING_ADAPTER . a real source is identified/verified but
 *   no adapter reads it yet (old prior-art "ADAPTER_REQUIRED").
 * - AUTH_REQUIRED ................... data exists but is gated behind member
 *   authentication.
 * - ADMIN_ONLY ..................... data/capability gated behind operator/admin
 *   privilege.
 * - LIVE_ACTION ................... real execution / write; requires the full
 *   PostureUpgradeGate. The ONLY write posture.
 * - FUTURE ....................... a genuinely future product surface.
 */
export type SourcePosture =
  | "NOT_WIRED"
  | "READ_ONLY_PROOF"
  | "VERIFIED_SOURCE_PENDING_ADAPTER"
  | "AUTH_REQUIRED"
  | "ADMIN_ONLY"
  | "LIVE_ACTION"
  | "FUTURE";

/** Postures that never represent a live write / execution. */
export type NonLivePosture = Exclude<SourcePosture, "LIVE_ACTION">;

/** Postures whose data is gated behind authentication / privilege. */
export type PrivatePosture = Extract<SourcePosture, "AUTH_REQUIRED" | "ADMIN_ONLY">;

/**
 * Postures whose (non-PII, truth-labelled) state may render on public surfaces.
 * Includes placeholder/pending/future states and verified read-only proof.
 */
export type PublicDisplayPosture = Extract<
  SourcePosture,
  "NOT_WIRED" | "READ_ONLY_PROOF" | "VERIFIED_SOURCE_PENDING_ADAPTER" | "FUTURE"
>;

/** Postures that may perform a real, gated action / write. */
export type ActionPosture = Extract<SourcePosture, "LIVE_ACTION">;

// ---------------------------------------------------------------------------
// 2. SourceAuthority / SourceConfidence — the two axes kept SEPARATE from
//    posture (2.19D: posture, source, and confidence must not collapse).
// ---------------------------------------------------------------------------

/**
 * Where a value's authority comes from. Independent of posture: a value can be
 * SERVER_SIDE_CANON yet still NOT_WIRED on a given surface.
 */
export type SourceAuthority =
  | "LIVE_CHAIN_EVENT"
  | "SERVER_SIDE_CANON"
  | "API_READ_MODEL"
  | "TRUTH_STATUS_CONFIG"
  | "PUBLIC_UI_LABEL"
  | "REFERENCE_PATTERN_ONLY";

/**
 * How sure we are of a value as shown. NEVER use confidence as proof of live
 * status — a HIGH-confidence value can still be NOT_WIRED.
 */
export type SourceConfidence = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

// ---------------------------------------------------------------------------
// 3. SyndicateSurface — the consumer/context a payload is destined for.
// ---------------------------------------------------------------------------

export type SyndicateSurface =
  | "PUBLIC_VISITOR"
  | "AUTHENTICATED_MEMBER"
  | "PRIVATE_OPERATOR_ADMIN"
  | "API_READ_MODEL"
  | "SERVER_SIDE_CANON"
  | "FUTURE_AUTOMATION_INDEXER";

// ---------------------------------------------------------------------------
// 4. SyndicateProofDomain — the proof areas of the product.
// ---------------------------------------------------------------------------

export type SyndicateProofDomain =
  | "MEMBERSHIP_SEAT_RECEIPT"
  | "WALLET_MEMBER_IDENTITY"
  | "ACTIVITY_HEARTBEAT"
  | "CONTRACT_REGISTRY_STATUS"
  | "SOURCE_VERIFIED_INTRODUCTION"
  | "ARCHIVE_NFT_MEMORY"
  | "CHRONICLE_INSTITUTIONAL_MEMORY"
  | "TRANSPARENCY_ECONOMY_ROUTING"
  | "PROOF_OF_FIRE_BURN_EVENTS"
  | "DASHBOARD_SYSTEM_HEALTH"
  | "ADMIN_OPERATOR_AUDIT_EVENTS"
  | "FUTURE_MARKETPLACE_PAYMENT_EVENTS"
  | "FUTURE_SWAP_EXCHANGE_UTILITY"
  | "FUTURE_GOVERNANCE_DAO";

// ---------------------------------------------------------------------------
// 5. SyndicateAdapterKind — the kind of adapter that WOULD read a domain once
//    wired. Naming a kind here is not a claim that the adapter exists.
// ---------------------------------------------------------------------------

export type SyndicateAdapterKind =
  | "CANON_ADAPTER"
  | "CHAIN_EVENT_ADAPTER"
  | "RECEIPT_READ_MODEL_ADAPTER"
  | "ACTIVITY_INDEX_ADAPTER"
  | "ECONOMY_SNAPSHOT_ADAPTER"
  | "ARCHIVE_MEMORY_ADAPTER"
  | "SOURCE_ATTRIBUTION_ADAPTER"
  | "HEALTH_STATUS_ADAPTER"
  | "ADMIN_AUDIT_ADAPTER";

// ---------------------------------------------------------------------------
// 6. SourceBoundaryPayload — the generic envelope a future adapter/read model
//    would return. Type-only; carries NO sample data, addresses, tx hashes,
//    wallet examples, or member data.
// ---------------------------------------------------------------------------

export interface SourceBoundaryPayload<TData = unknown> {
  /** Which proof area this payload describes. */
  domain: SyndicateProofDomain;
  /** The honest capability/security posture of this payload. */
  posture: SourcePosture;
  /** The surface/context this payload is destined for. */
  surface: SyndicateSurface;
  /** Where the authority for this payload comes from (separate axis). */
  sourceAuthority: SourceAuthority;
  /** How sure we are of the value as shown (separate axis; not live-proof). */
  confidence: SourceConfidence;
  /** The adapter kind that produced (or would produce) this payload, if any. */
  adapterKind?: SyndicateAdapterKind;
  /**
   * The payload body. Optional and `unknown` by default: a payload can exist as
   * a posture/label-only envelope with no data (e.g. NOT_WIRED / FUTURE).
   */
  data?: TData;
  /** Human-readable, non-sensitive provenance label for the truth surface. */
  sourceLabel: string;
  /** ISO-8601 timestamp of verification, when applicable. */
  verifiedAt?: string;
  /** Non-sensitive honesty warnings to surface alongside the value. */
  warnings?: readonly string[];
}

// ---------------------------------------------------------------------------
// 7. PostureUpgradeGate — the checklist that MUST be satisfied to advance a
//    domain to a higher-capability posture (especially toward LIVE_ACTION).
//    Type-only contract; enforcement lives in future gated work.
// ---------------------------------------------------------------------------

export interface PostureUpgradeGate {
  domain: SyndicateProofDomain;
  from: SourcePosture;
  to: SourcePosture;
  sourceIdentified: boolean;
  adapterImplemented: boolean;
  testsPassing: boolean;
  apiPayloadReviewed: boolean;
  publicPrivateBoundaryReviewed: boolean;
  noSecretsOrPiiExposure: boolean;
  authPrivacyReviewed: boolean;
  founderApproved: boolean;
  rollbackOrFailClosedDefined: boolean;
  publicCopyReviewed: boolean;
}

// ---------------------------------------------------------------------------
// 8. Member / Admin safety types.
// ---------------------------------------------------------------------------

/** Visibility class for a member-scoped field on public/auth/admin surfaces. */
export type MemberDataVisibility = "PUBLIC_SAFE" | "AUTH_REQUIRED" | "ADMIN_ONLY";

/** Lifecycle status of an admin/operator capability. */
export type AdminCapabilityStatus =
  | "SPEC_ONLY"
  | "AUTH_REQUIRED"
  | "FOUNDER_APPROVED"
  | "BLOCKED";

// ---------------------------------------------------------------------------
// 9. TruthStatus → SourcePosture mapping (TYPE-ONLY).
//
// The studio already ships a granular reason-code union, `TruthStatus`, in
// artifacts/studio/src/config/truthStatus.ts. 2.19D requires reconciling that
// layer via a TruthStatus → Posture map rather than inventing a fourth enum.
//
// This package is a `lib/*` package: libraries MUST NOT import from
// `artifacts/*` (wrong dependency direction; would create a lib→app cycle). So
// we mirror the studio union here as a compatibility type, and define ONLY the
// map's *type*. The concrete runtime object belongs in the studio (which can
// import `SourcePosture` from this package and use its own `TruthStatus`); it is
// intentionally DEFERRED out of this type-only slice.
// ---------------------------------------------------------------------------

/**
 * Compatibility mirror of the studio's runtime `TruthStatus` reason-code union
 * (artifacts/studio/src/config/truthStatus.ts). Keep in sync: if the studio
 * union changes, update this mirror in the same change. It is intentionally a
 * small, stable list.
 */
export type StudioTruthStatusCompat =
  | "NOT_LIVE"
  | "DESIGN_PREVIEW"
  | "FUTURE_MODULE"
  | "EVENT_ADAPTER_NOT_WIRED"
  | "SOURCE_INDEXER_NOT_WIRED"
  | "ARCHIVE_READS_NOT_WIRED"
  | "AWAITING_CHAIN_INDEX"
  | "SYNDICATE_INDEXER_NOT_WIRED"
  | "AWAITING_FOUNDER_APPROVAL"
  | "LIVE_SOURCE_MISSING";

/**
 * Type-only contract for the eventual reason-code → posture projection.
 *
 * Recommended target mapping (to implement as a runtime `Record` in the studio,
 * NOT here) — none map to LIVE_ACTION, since no reason code implies a write:
 *   NOT_LIVE                     -> NOT_WIRED
 *   DESIGN_PREVIEW               -> NOT_WIRED
 *   FUTURE_MODULE                -> FUTURE
 *   EVENT_ADAPTER_NOT_WIRED      -> VERIFIED_SOURCE_PENDING_ADAPTER
 *   SOURCE_INDEXER_NOT_WIRED     -> VERIFIED_SOURCE_PENDING_ADAPTER
 *   ARCHIVE_READS_NOT_WIRED      -> VERIFIED_SOURCE_PENDING_ADAPTER
 *   AWAITING_CHAIN_INDEX         -> NOT_WIRED
 *   SYNDICATE_INDEXER_NOT_WIRED  -> VERIFIED_SOURCE_PENDING_ADAPTER
 *   AWAITING_FOUNDER_APPROVAL    -> NOT_WIRED
 *   LIVE_SOURCE_MISSING          -> NOT_WIRED
 */
export type TruthStatusPostureMap = Record<StudioTruthStatusCompat, SourcePosture>;

// ---------------------------------------------------------------------------
// 10. Compatibility / deprecated prior-art aliases.
//
// Document old prior-art posture names as the single new value they map to.
// Rejected prior-art postures SIMULATED / PROTOTYPE / DEMO_PREVIEW are
// deliberately NOT represented as accepted values anywhere in this package.
// ---------------------------------------------------------------------------

/**
 * @deprecated Prior-art alias only. Old `ADAPTER_REQUIRED` is the new
 * VERIFIED_SOURCE_PENDING_ADAPTER.
 */
export type AdapterRequiredPostureAlias = "VERIFIED_SOURCE_PENDING_ADAPTER";

/**
 * @deprecated Prior-art alias only. Old `LIVE` / `LIVE_READ` (read semantics)
 * is the new READ_ONLY_PROOF — never LIVE_ACTION.
 */
export type LiveReadPostureAlias = "READ_ONLY_PROOF";
