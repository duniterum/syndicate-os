/**
 * Protocol-reality envelope types + item factory (SERVED, canon-free) — 2.23A.
 * --------------------------------------------------------------------------
 * The ONE normalized envelope shape for read-only protocol observability. These
 * runtime types mirror the authoritative generated zod schema
 * (GetProtocolRealityResponse in @workspace/api-zod); the route re-validates the
 * built object with that schema before responding, so this file and the schema
 * must stay in lockstep.
 *
 * Honesty axes are kept separate (per the Source Boundary doctrine):
 *   - sourceType  — where a value's authority comes from.
 *   - confidence  — how sure we are of the value as shown (never live-proof).
 *   - lifecycle   — the honest capability/security posture of the value.
 * A compile-time map projects each lifecycle onto a NonLivePosture: NO protocol
 * lifecycle may ever map to LIVE_ACTION (this layer is strictly read-only).
 */

import type { NonLivePosture } from "@workspace/os-contracts";

export type ProtocolSourceType =
  | "SERVER_SIDE_CANON"
  | "LIVE_CHAIN_RPC"
  | "CANON_RECONCILED_RPC";

export type ProtocolConfidence = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type ProtocolContractRole =
  | "token"
  | "stablecoin"
  | "sale"
  | "source-registry"
  | "archive1155"
  | "lp-pair";

export type ProtocolValueType = "null" | "boolean" | "string" | "number";

export type ProtocolLifecycle =
  | "READ_ONLY_PROOF"
  | "PENDING_ADAPTER"
  | "NOT_ACTIVE"
  | "AUTH_REQUIRED"
  | "FOUNDER_GATED"
  | "FUTURE"
  | "PAUSED_BY_PRECAUTION";

/**
 * Compile-time projection of every protocol lifecycle onto a NON-LIVE posture.
 * Typing the value as `NonLivePosture` makes it a build error to ever map a
 * lifecycle to LIVE_ACTION — this read-only layer can never imply a write.
 * Mirrors the studio's displayLifecycleToPosture for the shared members.
 */
export const protocolLifecycleToPosture: Record<ProtocolLifecycle, NonLivePosture> = {
  READ_ONLY_PROOF: "READ_ONLY_PROOF",
  PENDING_ADAPTER: "VERIFIED_SOURCE_PENDING_ADAPTER",
  NOT_ACTIVE: "NOT_WIRED",
  AUTH_REQUIRED: "AUTH_REQUIRED",
  FOUNDER_GATED: "ADMIN_ONLY",
  FUTURE: "FUTURE",
  PAUSED_BY_PRECAUTION: "VERIFIED_SOURCE_PENDING_ADAPTER",
};

export type ProtocolRealityItem = {
  id: string;
  label: string;
  value: boolean | number | string | null;
  valueType: ProtocolValueType;
  sourceType: ProtocolSourceType;
  sourceRef: string;
  chainId: number | null;
  contractRole: ProtocolContractRole | null;
  asOf: string;
  confidence: ProtocolConfidence;
  lifecycle: ProtocolLifecycle;
  publicSafe: boolean;
  note: string;
  failureReason: string | null;
};

export type ProtocolRealityGroups = {
  chain: ProtocolRealityItem[];
  contracts: ProtocolRealityItem[];
  tokens: ProtocolRealityItem[];
  archive: ProtocolRealityItem[];
  sale: ProtocolRealityItem[];
};

export type ProtocolRealityEnvelope = {
  mode: "READ_ONLY_PROTOCOL_REALITY";
  expectedChainId: 43114;
  asOf: string;
  cached: boolean;
  /** Served cache TTL in milliseconds — freshness metadata (bounded-age, not a live-tick feed). */
  cacheTtlMs: number;
  groups: ProtocolRealityGroups;
};

/** Derive the discriminant valueType from a value (kept in sync by construction). */
export function valueTypeOf(value: ProtocolRealityItem["value"]): ProtocolValueType {
  if (value === null) return "null";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  return "string";
}

/** Assemble an item, deriving valueType from value and defaulting publicSafe true. */
export function buildItem(input: Omit<ProtocolRealityItem, "valueType" | "publicSafe"> & {
  publicSafe?: boolean;
}): ProtocolRealityItem {
  return {
    ...input,
    valueType: valueTypeOf(input.value),
    publicSafe: input.publicSafe ?? true,
  };
}
