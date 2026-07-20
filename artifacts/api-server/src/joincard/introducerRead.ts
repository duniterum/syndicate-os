/**
 * The introducer of a source — cached public-registry read (K2, 2026-07-20).
 * ---------------------------------------------------------------------------
 * sourceId → the source's wallet of record, ADR-003 SHORT FORM ONLY. The
 * registry record is public chain data (SourceRegistryV1.sourceConfig); the
 * full address never leaves this module — the short form is derived here,
 * server-side, and that is all any caller ever sees.
 *
 * Read discipline = the channel zone's (sourceExistence.ts): chain identity
 * probed first, fail-closed to null on any doubt, positives cached with a
 * TTL (a source's wallet CAN change — SourceWalletUpdated exists), negatives
 * cached briefly so crawler spam cannot drive upstream RPC.
 */

import { getAddress, keccak256, toHex } from "viem";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { ethCall, probeChain } from "../lib/protocol/evmRead";
import { callData, decodeBool } from "../lib/protocol/archiveDecoders";
import {
  SELECTOR_SOURCE_IS_ACTIVE,
  bytes32Word,
} from "../lib/protocol/sourceDecoders";
import { SOURCE_LINKAGE_TARGET } from "../data/protocolTargets";

/** keccak("sourceConfig(bytes32)")[0..4] — computed, never hand-typed. */
const SELECTOR_SOURCE_CONFIG = keccak256(
  toHex("sourceConfig(bytes32)"),
).slice(0, 10) as `0x${string}`;

const POSITIVE_TTL_MS = 10 * 60 * 1000;
const NEGATIVE_TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 5_000;

interface CacheEntry {
  shortWallet: string | null;
  at: number;
}
const cache = new Map<string, CacheEntry>();

/** Decode sourceConfig's tuple word 0 (sourceWallet) into the short form. */
function decodeShortWallet(data: string): string | null {
  if (!/^0x[0-9a-fA-F]{64,}$/.test(data)) return null;
  const word0 = data.slice(2, 2 + 64);
  // A real address word is 12 zero bytes then 20 address bytes — anything
  // else is not an address and never becomes a "wallet" (the house
  // decodeAddressWord discipline).
  if (!/^0{24}/.test(word0)) return null;
  const addrHex = `0x${word0.slice(24)}`;
  try {
    const a = getAddress(addrHex);
    // The zero address = no record (fail closed, never a "0x0000…0000" card).
    if (/^0x0{40}$/i.test(addrHex)) return null;
    return `${a.slice(0, 6)}…${a.slice(-4)}`;
  } catch {
    return null;
  }
}

/** The source's introducer, short form — or null (fail closed, cached). */
export async function introducerShortWallet(
  sourceIdHex: string,
): Promise<string | null> {
  const key = sourceIdHex.toLowerCase();
  const hit = cache.get(key);
  if (hit !== undefined) {
    const ttl = hit.shortWallet !== null ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;
    if (Date.now() - hit.at < ttl) return hit.shortWallet;
    cache.delete(key);
  }

  let short: string | null = null;
  try {
    const timeoutMs =
      readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
    const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
    const probe = await probeChain(transport);
    if (probe.chainIdOk) {
      // THE STATUS GATE (adversarial verify 2026-07-21): a PAUSED/REVOKED
      // source must never unfurl an attribution claim the /join page
      // itself denies — the registry's own isActive() decides, exactly as
      // the validation surface does. Inactive → null → the generic image.
      const activeData = await ethCall(
        transport,
        SOURCE_LINKAGE_TARGET.registryAddress,
        callData(SELECTOR_SOURCE_IS_ACTIVE, [bytes32Word(key)]),
      );
      if (decodeBool(activeData) === true) {
        const data = await ethCall(
          transport,
          SOURCE_LINKAGE_TARGET.registryAddress,
          callData(SELECTOR_SOURCE_CONFIG, [bytes32Word(key)]),
        );
        short = typeof data === "string" ? decodeShortWallet(data) : null;
      }
    }
  } catch {
    short = null; // fail closed — the card falls back to the generic image
  }

  if (cache.size >= MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, e] of cache) {
      const ttl = e.shortWallet !== null ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;
      if (now - e.at >= ttl) cache.delete(k);
    }
    if (cache.size >= MAX_ENTRIES) return short; // refuse to grow; throttle bounds the rate
  }
  cache.set(key, { shortWallet: short, at: Date.now() });
  return short;
}
