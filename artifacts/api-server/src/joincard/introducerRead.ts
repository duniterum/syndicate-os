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
 *
 * M2-v2 (founder « go dans l'ordre », 2026-08-03): the read now ALSO derives
 * the introducer's LIVING SEAT LINE ("Seat #3 · Chapter I") via the
 * continuity spine + the ONE chapter table. wallet↔seat is PUBLIC chain data
 * (the /registry precedent — the address law), and the full address STILL
 * never leaves this module. No spine row / no DB / any doubt → seatLine
 * null → the card degrades to the plain short-wallet face (fail closed,
 * never an invented seat).
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
import { chapterForSeat } from "../lib/protocol/chapters";

/** keccak("sourceConfig(bytes32)")[0..4] — computed, never hand-typed. */
const SELECTOR_SOURCE_CONFIG = keccak256(
  toHex("sourceConfig(bytes32)"),
).slice(0, 10) as `0x${string}`;

const POSITIVE_TTL_MS = 10 * 60 * 1000;
const NEGATIVE_TTL_MS = 5 * 60 * 1000;
const MAX_ENTRIES = 5_000;

export interface IntroducerFacts {
  /** ADR-003 short form — all any caller ever sees of the address. */
  shortWallet: string;
  /** M2-v2: "Seat #3 · Chapter I", or null (no spine row / no DB / doubt). */
  seatLine: string | null;
}

interface CacheEntry {
  facts: IntroducerFacts | null;
  at: number;
}
const cache = new Map<string, CacheEntry>();

/** Decode sourceConfig's tuple word 0 (sourceWallet). The FULL lowercase
 * address stays in-module (the seat lookup key); callers get the short form. */
function decodeWallet(data: string): { short: string; fullLower: string } | null {
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
    return { short: `${a.slice(0, 6)}…${a.slice(-4)}`, fullLower: addrHex.toLowerCase() };
  } catch {
    return null;
  }
}

/** The living seat line via the continuity spine (whole-table read — the
 * ledger-service pattern; tiny, and the 10-min cache bounds the rate). Any
 * failure → null: the card degrades, never an invented seat. */
async function seatLineFor(fullLower: string): Promise<string | null> {
  try {
    if (process.env.DATABASE_URL == null || process.env.DATABASE_URL.length === 0) return null;
    const { db, memberContinuityRecord } = await import("@workspace/db");
    const spine = await db
      .select({
        memberNumber: memberContinuityRecord.memberNumber,
        entryWallet: memberContinuityRecord.entryWallet,
      })
      .from(memberContinuityRecord);
    const rec = spine.find((r) => (r.entryWallet ?? "").toLowerCase() === fullLower);
    const seat = rec?.memberNumber;
    if (typeof seat !== "number" || seat < 1) return null;
    const chapter = chapterForSeat(seat);
    if (chapter === null) return null;
    return `Seat #${seat} · Chapter ${chapter.roman}`;
  } catch {
    return null; // fail closed — the plain card
  }
}

/** The source's introducer facts (short form + living seat line) — or null
 * (fail closed, cached). */
export async function introducerFacts(
  sourceIdHex: string,
): Promise<IntroducerFacts | null> {
  const key = sourceIdHex.toLowerCase();
  const hit = cache.get(key);
  if (hit !== undefined) {
    const ttl = hit.facts !== null ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;
    if (Date.now() - hit.at < ttl) return hit.facts;
    cache.delete(key);
  }

  let facts: IntroducerFacts | null = null;
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
        const wallet = typeof data === "string" ? decodeWallet(data) : null;
        if (wallet !== null) {
          facts = {
            shortWallet: wallet.short,
            seatLine: await seatLineFor(wallet.fullLower),
          };
        }
      }
    }
  } catch {
    facts = null; // fail closed — the card falls back to the generic image
  }

  if (cache.size >= MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, e] of cache) {
      const ttl = e.facts !== null ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;
      if (now - e.at >= ttl) cache.delete(k);
    }
    if (cache.size >= MAX_ENTRIES) return facts; // refuse to grow; throttle bounds the rate
  }
  cache.set(key, { facts, at: Date.now() });
  return facts;
}

/** The source's introducer, short form — or null (fail closed, cached).
 * Compat wrapper over introducerFacts (the /source/introducer strip). */
export async function introducerShortWallet(
  sourceIdHex: string,
): Promise<string | null> {
  return (await introducerFacts(sourceIdHex))?.shortWallet ?? null;
}
