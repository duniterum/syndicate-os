/**
 * Protocol Time core — pure verification helpers (SERVER-ONLY).
 * --------------------------------------------------------------
 * Pure parsing/verification primitives for chain-derived block timestamps.
 * Moved from scripts/protocol-time-core.ts in slice M4-a so the served
 * backbone zone (unattended enrichment) and the founder-gated scripts share
 * ONE source of truth. This module is deliberately:
 *   - DB-free (no @workspace/db import)
 *   - network-free (no transport import)
 *   - canon-free (no src/canon import — canon is tsconfig-excluded)
 *
 * Truth rules enforced here:
 *   - A block timestamp is ONLY ever parsed from an eth_getBlockByNumber
 *     response. Wall-clock time is used solely as an upper-bound sanity check
 *     (a chain timestamp cannot be meaningfully in the future) — it is never
 *     a timestamp source.
 *   - The returned block number MUST equal the requested block number.
 *   - Divergence between a fetched header and any previously recorded witness
 *     (raw-index block hash or cached row) is a HARD FAIL — the caller never
 *     silently "corrects" chain history.
 */

/**
 * Public lower bound for plausible Avalanche C-Chain timestamps (epoch secs).
 * ~2020-09-13. The C-Chain did not exist before this era, so any earlier
 * timestamp is implausible. Public constant — NOT canon, NOT an address.
 */
export const AVALANCHE_CCHAIN_ERA_MIN_SEC = 1_600_000_000;

/** Max tolerated future skew (seconds) for the wall-clock sanity upper bound. */
export const MAX_FUTURE_SKEW_SEC = 900;

/** Parse a 0x-prefixed hex quantity into a safe non-negative integer. */
export function parseHexQuantity(value: unknown, label: string): number {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]+$/.test(value)) {
    throw new Error(`${label}: not a 0x hex quantity`);
  }
  const parsed = Number.parseInt(value, 16);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`${label}: not a safe non-negative integer`);
  }
  return parsed;
}

/** Parse a 32-byte block hash (0x + 64 hex chars). */
export function parseBlockHash(value: unknown, label: string): string {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error(`${label}: not a 32-byte block hash`);
  }
  return value.toLowerCase();
}

export interface ParsedBlockHeader {
  blockNumber: number;
  blockHash: string;
  timestampSec: number;
}

/**
 * Parse + verify an eth_getBlockByNumber header against the REQUESTED block.
 * Fail closed on: number mismatch, unparseable hash, unparseable or zero
 * timestamp. Never invents or normalizes a value.
 */
export function parseBlockHeader(
  raw: { number?: unknown; hash?: unknown; timestamp?: unknown },
  requestedBlockNumber: number,
): ParsedBlockHeader {
  const blockNumber = parseHexQuantity(raw.number, "block.number");
  if (blockNumber !== requestedBlockNumber) {
    throw new Error(
      `block number mismatch: requested=${requestedBlockNumber} returned=${blockNumber}`,
    );
  }
  const blockHash = parseBlockHash(raw.hash, "block.hash");
  const timestampSec = parseHexQuantity(raw.timestamp, "block.timestamp");
  if (timestampSec === 0) {
    throw new Error("block.timestamp: zero timestamp is implausible");
  }
  return { blockNumber, blockHash, timestampSec };
}

/**
 * Plausibility: chain timestamp must be inside the C-Chain era and not
 * meaningfully in the future (nowSec is a SANITY BOUND, never a source).
 */
export function checkPlausibility(
  timestampSec: number,
  nowSec: number,
): { pass: boolean; reason: string | null } {
  if (timestampSec < AVALANCHE_CCHAIN_ERA_MIN_SEC) {
    return { pass: false, reason: "timestamp precedes the C-Chain era" };
  }
  if (timestampSec > nowSec + MAX_FUTURE_SKEW_SEC) {
    return { pass: false, reason: "timestamp is in the future beyond skew" };
  }
  return { pass: true, reason: null };
}

/**
 * Monotonicity: timestamps ordered by block number must be NON-DECREASING
 * (equal timestamps in adjacent blocks are chain-legal; strict ordering is a
 * false-failure trap).
 */
export function checkMonotonicNonDecreasing(
  rows: readonly { blockNumber: number; timestampSec: number }[],
): { pass: boolean; detail: string } {
  const sorted = [...rows].sort((a, b) => a.blockNumber - b.blockNumber);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    if (cur.timestampSec < prev.timestampSec) {
      return {
        pass: false,
        detail: `non-monotonic at blockNumber=${cur.blockNumber} (prevBlock=${prev.blockNumber})`,
      };
    }
  }
  return { pass: true, detail: `rows=${rows.length} nonDecreasing=true` };
}

/**
 * Witness comparison: a fetched header must agree with every previously
 * recorded witness for the same block. Divergence is a hard fail.
 */
export function checkWitness(
  fetched: { blockHash: string; timestampSec: number },
  witness: { blockHash?: string | null; timestampSec?: number | null },
  witnessLabel: string,
): void {
  if (
    witness.blockHash != null &&
    witness.blockHash.toLowerCase() !== fetched.blockHash
  ) {
    throw new Error(`divergence vs ${witnessLabel}: block hash mismatch`);
  }
  if (
    witness.timestampSec != null &&
    witness.timestampSec !== fetched.timestampSec
  ) {
    throw new Error(`divergence vs ${witnessLabel}: timestamp mismatch`);
  }
}

/**
 * Fail-closed output gate: the serialized report must never contain an RPC
 * URL, a 20-byte address, or any 32-byte hash (block hashes and tx hashes are
 * server-side context, never output). Throws WITHOUT echoing the match.
 */
export function assertTimeSafeOutput(serialized: string): void {
  if (/https?:\/\//i.test(serialized)) {
    throw new Error("output gate: URL detected in report output");
  }
  if (/0x[0-9a-fA-F]{40}/.test(serialized)) {
    throw new Error("output gate: hex material (>=20 bytes) detected in report output");
  }
  if (/\b[0-9a-fA-F]{64}\b/.test(serialized)) {
    throw new Error("output gate: bare 32-byte hex detected in report output");
  }
}

/** Redact URLs and long hex from an error message so it is safe to print. */
export function redactError(message: string): string {
  return message
    .replace(/https?:\/\/\S+/gi, "[endpoint-redacted]")
    .replace(/0x[0-9a-fA-F]{40,}/g, "[hex-redacted]")
    .replace(/\b[0-9a-fA-F]{64}\b/g, "[hex-redacted]");
}

/** Format epoch seconds as a safe ISO-8601 UTC string (date-level truth). */
export function toIsoUtc(timestampSec: number): string {
  return new Date(timestampSec * 1000).toISOString();
}
