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

export const truthStatusText: Record<TruthStatus, string> = {
  NOT_LIVE: "Not Live",
  DESIGN_PREVIEW: "Design Preview",
  FUTURE_MODULE: "Future Module",
  EVENT_ADAPTER_NOT_WIRED: "Event Adapter Not Wired",
  SOURCE_INDEXER_NOT_WIRED: "Source Indexer Not Wired",
  ARCHIVE_READS_NOT_WIRED: "Archive Reads Not Wired",
  AWAITING_CHAIN_INDEX: "Awaiting Chain Index",
  SYNDICATE_INDEXER_NOT_WIRED: "Indexer Not Wired",
  AWAITING_FOUNDER_APPROVAL: "Awaiting Founder Approval",
  LIVE_SOURCE_MISSING: "Live Source Missing",
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

// Post-vendoring (Slice 2.7) truth posture for each protocol surface.
// Doctrine: a surface whose ABI / registry / taxonomy canon is now vendored must
// NOT claim it is "awaiting" that canon. The remaining honest gap is the LIVE
// wiring (event adapter, indexer, RPC), labelled "… Not Wired".
//   - proofOfFire / proofEventParser: protocol event taxonomy + ABIs are
//     vendored → the live event adapter is the gap (EVENT_ADAPTER_NOT_WIRED),
//     not a missing ABI.
//   - sourceAttribution: SourceRegistryV1 ABI is vendored → the source indexer
//     is the gap (SOURCE_INDEXER_NOT_WIRED), not a missing canon index.
//   - archive: Archive1155 ABI + archive ID registry are vendored → canon
//     exists; the gap is live archive reads (ARCHIVE_READS_NOT_WIRED), not
//     "future".
//   - membership: contract registers are vendored (member records are NOT) →
//     the live membership indexer is the gap (SYNDICATE_INDEXER_NOT_WIRED).
//     (founder-confirmed correct)
//   - recognition: no dedicated recognition canon vendored → genuine future
//     product surface (FUTURE_MODULE).
export const surfaceStatus: Record<SurfaceId, TruthStatus> = {
  membership: "SYNDICATE_INDEXER_NOT_WIRED",
  proofOfFire: "EVENT_ADAPTER_NOT_WIRED",
  sourceAttribution: "SOURCE_INDEXER_NOT_WIRED",
  archive: "ARCHIVE_READS_NOT_WIRED",
  recognition: "FUTURE_MODULE",
  proofEventParser: "EVENT_ADAPTER_NOT_WIRED",
  founderControls: "AWAITING_FOUNDER_APPROVAL",
  publicDashboard: "DESIGN_PREVIEW",
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
