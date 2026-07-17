import type { SourcePosture } from "@workspace/os-contracts";

export type TruthStatus =
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

// User-facing badge text — plain language. The precise reason lives in the
// enum KEY and the posture projection; these strings only need to tell a normal
// person, honestly, that a value is not live yet (never faked).
export const truthStatusText: Record<TruthStatus, string> = {
  NOT_LIVE: "Not live yet",
  DESIGN_PREVIEW: "Preview",
  FUTURE_MODULE: "Coming later",
  EVENT_ADAPTER_NOT_WIRED: "Not live yet",
  SOURCE_INDEXER_NOT_WIRED: "Not live yet",
  ARCHIVE_READS_NOT_WIRED: "Not live yet",
  AWAITING_CHAIN_INDEX: "Not live yet",
  SYNDICATE_INDEXER_NOT_WIRED: "Not live yet",
  AWAITING_FOUNDER_APPROVAL: "Not switched on yet",
  LIVE_SOURCE_MISSING: "Not live yet",
};

export type SurfaceId =
  | "membership"
  | "proofOfFire"
  | "sourceAttribution"
  | "archive"
  | "recognition"
  | "proofEventParser"
  | "founderControls"
  | "publicDashboard"
  | "coreApiRpc"
  | "contractState";

// ⚠️ S7 TRUTH SWEEP (2026-07-16) — READ BEFORE CONSUMING THIS MAP.
// The Slice-2.7-era "… NOT_WIRED" photographs below are HISTORY for four
// keys: membership (Holder Index + standing readback LIVE), proofOfFire
// (the event backbone serves the complete heartbeat), sourceAttribution
// (program ACTIVE + R5 introduction indexer LIVE), archive (minting is
// OPEN and every mint rides the indexed record — the /archive PAGE itself
// still renders static memory; AUD-ROUTE 2026-07-17 truthed this line).
// Every consumer that rendered those four as "Not live yet" was retired
// in the sweep — a LIVE surface renders NO TruthLabel (the /join
// precedent). The keys stay for type totality only; do NOT wire a
// new consumer to them without re-deriving today's truth first.
// Still honestly not-live: recognition (the standing model — the capital
// axis lives on /activity, the full model doesn't), coreApiRpc,
// contractState, proofEventParser (operator parser console).
// TRUTH SWEEP 2026-07-17 (founder order, live production mode): the /os-map
// consumer of the four retired keys was the missed survivor — its nodes now
// bind honest lifecycles directly. founderControls dropped its
// "Not switched on yet" fossil: founder auth is LIVE (server-confirmed
// founder_root); the dedicated Founder OS page is honestly a DESIGN_PREVIEW.
export const surfaceStatus: Record<SurfaceId, TruthStatus> = {
  membership: "SYNDICATE_INDEXER_NOT_WIRED", // RETIRED FROM RENDER — live since 2026-07-11
  proofOfFire: "EVENT_ADAPTER_NOT_WIRED", // RETIRED FROM RENDER — heartbeat live
  sourceAttribution: "SOURCE_INDEXER_NOT_WIRED", // RETIRED FROM RENDER — R5 live
  archive: "ARCHIVE_READS_NOT_WIRED", // RETIRED FROM RENDER — minting open, mints ride the indexed record
  recognition: "FUTURE_MODULE",
  proofEventParser: "EVENT_ADAPTER_NOT_WIRED",
  founderControls: "DESIGN_PREVIEW", // founder auth LIVE; the dedicated surface is the preview
  publicDashboard: "DESIGN_PREVIEW", // RETIRED FROM RENDER — the public surfaces are live production
  coreApiRpc: "NOT_LIVE",
  contractState: "LIVE_SOURCE_MISSING",
};

// Homepage-only statuses that do not map 1:1 to a single protocol surface.
// heroCore stays AWAITING_CHAIN_INDEX: a general "live chain indexing is not
// running yet" signal for the protocol core — it implies no missing canon.
export const homepageStatus = {
  heroBadge: "NOT_LIVE",
  heroCore: "AWAITING_CHAIN_INDEX",
} satisfies Record<string, TruthStatus>;

// Slice 2.20B — bind the studio's granular `TruthStatus` reason codes to the
// canonical @workspace/os-contracts `SourcePosture`. Pure lookup, no fetching,
// no data. None map to LIVE_ACTION (no reason code implies a write):
//   - surfaces whose ABI/registry canon is vendored but whose live
//     adapter/indexer is the remaining gap -> VERIFIED_SOURCE_PENDING_ADAPTER;
//   - genuine future product surfaces -> FUTURE;
//   - everything else (not wired / awaiting / design-preview / missing source)
//     -> NOT_WIRED.
export const truthStatusToPosture: Record<TruthStatus, SourcePosture> = {
  NOT_LIVE: "NOT_WIRED",
  DESIGN_PREVIEW: "NOT_WIRED",
  FUTURE_MODULE: "FUTURE",
  EVENT_ADAPTER_NOT_WIRED: "VERIFIED_SOURCE_PENDING_ADAPTER",
  SOURCE_INDEXER_NOT_WIRED: "VERIFIED_SOURCE_PENDING_ADAPTER",
  ARCHIVE_READS_NOT_WIRED: "VERIFIED_SOURCE_PENDING_ADAPTER",
  AWAITING_CHAIN_INDEX: "NOT_WIRED",
  SYNDICATE_INDEXER_NOT_WIRED: "VERIFIED_SOURCE_PENDING_ADAPTER",
  AWAITING_FOUNDER_APPROVAL: "NOT_WIRED",
  LIVE_SOURCE_MISSING: "NOT_WIRED",
};

// ---------------------------------------------------------------------------
// Slice 2.21A — Display lifecycle vocabulary.
//
// The new visible OS surfaces (contract/economy memory, member preview,
// operator preview, source-attribution vision, archive/chronicle, recognition)
// need a richer HUMAN vocabulary than the wiring-only `TruthStatus` reason
// codes — words like "Paused by precaution" or "Historical proof". This is NOT
// a competing canon: every `DisplayLifecycle` PROJECTS onto the canonical
// `SourcePosture` via `displayLifecycleToPosture` below, exactly like
// `truthStatusToPosture`.
//
// C5 GO-LIVE AMENDMENT (founder, 2026-07-13): the foundation is no longer
// all-read-only. EXACTLY ONE lifecycle — LIVE_ACTION — maps to the canonical
// LIVE_ACTION posture: the /join checkout, a real gated write signed from the
// visitor's OWN wallet (this server/app still holds and moves nothing). Every
// other lifecycle keeps the original rule: never a live write, never "Live".
// ---------------------------------------------------------------------------

export type DisplayLifecycle =
  | "READ_ONLY_PROOF"
  | "HISTORICAL_PROOF"
  | "PAUSED_BY_PRECAUTION"
  | "PENDING_ADAPTER"
  | "NOT_ACTIVE"
  | "FOUNDER_GATED"
  | "AUTH_REQUIRED"
  | "PREVIEW"
  | "DESIGN_CONCEPT"
  | "FUTURE"
  | "LIVE_ACTION";

export const displayLifecycleText: Record<DisplayLifecycle, string> = {
  READ_ONLY_PROOF: "Verified — view only",
  HISTORICAL_PROOF: "Verified history",
  PAUSED_BY_PRECAUTION: "Paused for safety",
  PENDING_ADAPTER: "Not live yet",
  NOT_ACTIVE: "Not active",
  FOUNDER_GATED: "Founder only",
  AUTH_REQUIRED: "Sign in required",
  PREVIEW: "Preview",
  DESIGN_CONCEPT: "Concept",
  FUTURE: "Coming later",
  LIVE_ACTION: "Live — signed from your wallet",
};

// Projection onto the canonical posture. A paused/historical real system keeps
// a verified source (VERIFIED_SOURCE_PENDING_ADAPTER / READ_ONLY_PROOF); a
// gated surface maps to its privilege posture; concepts/previews are FUTURE.
export const displayLifecycleToPosture: Record<DisplayLifecycle, SourcePosture> = {
  READ_ONLY_PROOF: "READ_ONLY_PROOF",
  HISTORICAL_PROOF: "READ_ONLY_PROOF",
  PAUSED_BY_PRECAUTION: "VERIFIED_SOURCE_PENDING_ADAPTER",
  PENDING_ADAPTER: "VERIFIED_SOURCE_PENDING_ADAPTER",
  NOT_ACTIVE: "NOT_WIRED",
  FOUNDER_GATED: "ADMIN_ONLY",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  PREVIEW: "FUTURE",
  DESIGN_CONCEPT: "FUTURE",
  FUTURE: "FUTURE",
  // The ONE live write (C5 go-live, founder 2026-07-13): the /join checkout.
  LIVE_ACTION: "LIVE_ACTION",
};
