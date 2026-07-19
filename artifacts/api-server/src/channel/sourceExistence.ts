/**
 * Cached on-chain source existence — the channel zone's row-growth bound.
 * ----------------------------------------------------------------------
 * A click is counted ONLY for a source id that exists on the live
 * SourceRegistryV1 (SELECTOR_SOURCE_EXISTS eth_call, chain identity probed
 * first — the spine's fail-closed read discipline). Positives are cached
 * for the process lifetime (a created source never un-exists); negatives
 * and RPC failures are cached briefly so spam cannot drive upstream RPC.
 * Fail-closed: any doubt → false → the click is dropped, nothing invented.
 */

import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { ethCall, probeChain } from "../lib/protocol/evmRead";
import { callData, decodeBool } from "../lib/protocol/archiveDecoders";
import {
  SELECTOR_SOURCE_EXISTS,
  bytes32Word,
} from "../lib/protocol/sourceDecoders";
import { SOURCE_LINKAGE_TARGET } from "../data/protocolTargets";

const NEGATIVE_TTL_MS = 10 * 60 * 1000;
const MAX_NEGATIVE_ENTRIES = 10_000;

const knownExisting = new Set<string>();
const recentNegative = new Map<string, number>();

/** True only when the registry confirms the source exists (cached). */
export async function sourceExistsCached(sourceIdHex: string): Promise<boolean> {
  const key = sourceIdHex.toLowerCase();
  if (knownExisting.has(key)) return true;

  const negativeAt = recentNegative.get(key);
  if (negativeAt !== undefined) {
    if (Date.now() - negativeAt < NEGATIVE_TTL_MS) return false;
    recentNegative.delete(key);
  }

  let exists = false;
  try {
    const timeoutMs = readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
    const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
    const probe = await probeChain(transport);
    if (probe.chainIdOk) {
      const decoded = decodeBool(
        await ethCall(
          transport,
          SOURCE_LINKAGE_TARGET.registryAddress,
          callData(SELECTOR_SOURCE_EXISTS, [bytes32Word(key)]),
        ),
      );
      exists = decoded === true; // null (undecodable) fails closed
    }
  } catch {
    exists = false; // fail closed — the click is dropped, never guessed
  }

  if (exists) {
    knownExisting.add(key);
  } else {
    if (recentNegative.size >= MAX_NEGATIVE_ENTRIES) {
      const now = Date.now();
      for (const [k, at] of recentNegative) {
        if (now - at >= NEGATIVE_TTL_MS) recentNegative.delete(k);
      }
      // Still full → refuse to grow; the throttle already bounds the rate.
      if (recentNegative.size >= MAX_NEGATIVE_ENTRIES) return false;
    }
    recentNegative.set(key, Date.now());
  }
  return exists;
}
