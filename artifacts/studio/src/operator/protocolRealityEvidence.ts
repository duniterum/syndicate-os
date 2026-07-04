// Live proof binding adapter — protocolReality -> osMapEvidence.
// ---------------------------------------------------------------------------
// Maps the Chain Reality Spine node ids on /os-map to groups of the EXISTING
// public read-only GET /api/protocol/reality payload, and assigns every
// /os-map node a data-exposure classification. Operator-gated code: imported
// only from the OsMap page inside the OperatorConsole graph (enforced by
// guard-operator-gate.ts).
//
// This module is PURE: no fetching, no state, no clocks, and no new status
// vocabulary — live signals keep the lifecycle the endpoint assigned them,
// and the classification below is a data-EXPOSURE axis (where a node's
// displayed data comes from), never a liveness/status claim.

import type {
  ProtocolRealityItem,
  ProtocolRealityResponse,
} from "@workspace/api-client-react";

export type RealityGroupKey = keyof ProtocolRealityResponse["groups"];

/**
 * Founder-mandated data-exposure classification for /os-map nodes.
 *   OPERATOR_VIEW_PUBLIC — live-bound: an operator-only presentation of data
 *     the endpoint already serves publicly (also rendered on /status and
 *     /contracts). No new exposure surface.
 *   STATIC_DOCTRINE — curated static copy only; nothing live behind it.
 *   SERVER_ONLY_STATUS — server-only subsystem; the card shows counts/dates
 *     reported by founder-gated operator scripts, never a live read.
 *   BLOCKED_FUTURE — no safe live source exists yet; live binding would
 *     require a future endpoint/read-model slice.
 */
export type OsMapEvidenceClass =
  | "OPERATOR_VIEW_PUBLIC"
  | "STATIC_DOCTRINE"
  | "SERVER_ONLY_STATUS"
  | "BLOCKED_FUTURE";

export const evidenceClassText: Record<OsMapEvidenceClass, string> = {
  OPERATOR_VIEW_PUBLIC: "OPERATOR VIEW · PUBLIC DATA",
  STATIC_DOCTRINE: "STATIC DOCTRINE",
  SERVER_ONLY_STATUS: "SERVER-ONLY STATUS",
  BLOCKED_FUTURE: "BLOCKED · FUTURE SOURCE",
};

// Spine node -> payload group. The payload's `archive` group is deliberately
// NOT bound: the founder-approved spine list did not include it, and an
// "archive posture" spine node would collide confusingly with the
// pending-wiring `archive` node (product archive reads). Deferred — reported
// as an explicit open item, not silently added.
export const spineNodeGroup: Record<string, RealityGroupKey> = {
  "chain-identity": "chain",
  "contract-code": "contracts",
  "erc20-metadata": "tokens",
  "sale-engines": "sale",
};

/**
 * Every /os-map node id -> its data-exposure classification.
 * Completeness against config/protocolOsMap.ts is reconciled by
 * guard-operator-gate.ts; the UI renders nothing (never a guessed class)
 * for an unknown id.
 */
export const osMapNodeClass: Record<string, OsMapEvidenceClass> = {
  "chain-identity": "OPERATOR_VIEW_PUBLIC",
  "contract-code": "OPERATOR_VIEW_PUBLIC",
  "erc20-metadata": "OPERATOR_VIEW_PUBLIC",
  "sale-engines": "OPERATOR_VIEW_PUBLIC",
  "sale-event-raw": "SERVER_ONLY_STATUS",
  "protocol-time": "SERVER_ONLY_STATUS",
  "member-freeze": "SERVER_ONLY_STATUS",
  "member-continuity": "SERVER_ONLY_STATUS",
  "activity-heartbeat": "SERVER_ONLY_STATUS",
  "proof-of-fire": "BLOCKED_FUTURE",
  "membership-index": "BLOCKED_FUTURE",
  "source-attribution": "BLOCKED_FUTURE",
  archive: "BLOCKED_FUTURE",
  "public-dashboard": "STATIC_DOCTRINE",
  "member-cockpit": "STATIC_DOCTRINE",
  recognition: "STATIC_DOCTRINE",
  "founder-controls": "STATIC_DOCTRINE",
  // Future & Governance Concepts (config/protocolOsMap.ts) — labelled concepts
  // only; each card renders curated static copy, nothing live behind it.
  "notice-os": "STATIC_DOCTRINE",
  "knowledge-os": "STATIC_DOCTRINE",
  acknowledgement: "STATIC_DOCTRINE",
  "admin-audit": "STATIC_DOCTRINE",
  "link-registry": "STATIC_DOCTRINE",
  "admin-gates": "STATIC_DOCTRINE",
};

/**
 * Pure selector: the live signals for a spine node, or null when the node is
 * not live-bound. Fail-closed per node: a missing/empty group yields null,
 * and the UI then shows the unavailable state — never a fabricated value.
 */
export function selectNodeEvidence(
  data: ProtocolRealityResponse,
  nodeId: string,
): ProtocolRealityItem[] | null {
  const group = spineNodeGroup[nodeId];
  if (!group) return null;
  const items = data.groups[group];
  if (!items || items.length === 0) return null;
  return items;
}
