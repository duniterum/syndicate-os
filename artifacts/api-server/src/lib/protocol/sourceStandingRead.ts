// sourceStandingRead.ts — R5 own-row source-standing resolution (spine helper).
// ---------------------------------------------------------------------------
// Called ONLY by the auth zone's GET /source-standing with the session's own
// bound account (the engineReadback pattern: the registry-ish material lives
// here in the read-only spine, the auth zone stays registry-less). It:
//   1. derives the account's canonical sourceId (keccak256("SYN.SOURCE.V1",
//      account) — SPEC §③; the emitter will compute the same on-chain),
//   2. live-reads registry existence + active state (fail closed to null),
//   3. resolves the source's OWN counters from the generated R5 snapshot via
//      the opaque sourceKey (an honest SERVED SNAPSHOT, labeled asOfBlock).
// The account and the sourceId never leave this module's return value.

import { keccak256, encodePacked, getAddress } from "viem";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "./rpcTransport";
import { ethCall, probeChain } from "./evmRead";
import { callData, decodeBool } from "./archiveDecoders";
import {
  SELECTOR_SOURCE_EXISTS,
  SELECTOR_SOURCE_IS_ACTIVE,
  bytes32Word,
} from "./sourceDecoders";
import { SOURCE_LINKAGE_TARGET } from "../../data/protocolTargets";
import { sourceKeyOf } from "./introductionReadmodel";
import { INTRODUCTION_SNAPSHOT } from "./introductionSnapshot";

export interface OwnSourceStanding {
  chainVerified: boolean;
  /** true/false = live registry answer; null = read unavailable (fail closed). */
  sourceOnChain: boolean | null;
  sourceActive: boolean | null;
  standing: {
    attributedPurchases: number;
    introducedMembers: number;
    durableIntroductions: number;
    commissionPaidRaw: string;
    escrowOwedRaw: string;
    asOfBlock: number;
    durableTest: string;
    snapshotHash: string;
    // Ladder facts (LADDER-PROMOTION-SCREEN; founder simple-transparency rule).
    /** Live-at-index registry rate; null for a source the index has no row for. */
    currentBps: number | null;
    entitledBps: number;
    entitledTitle: string;
    promotionDue: boolean;
    crossedAtBlock: number | null;
    crossedAtDateUtc: string | null;
  } | null;
  failureReason: string | null;
}

export async function readOwnSourceStanding(
  boundAccount: string,
): Promise<OwnSourceStanding> {
  const out: OwnSourceStanding = {
    chainVerified: false,
    sourceOnChain: null,
    sourceActive: null,
    standing: null,
    failureReason: null,
  };

  const sourceId = keccak256(
    encodePacked(["string", "address"], ["SYN.SOURCE.V1", getAddress(boundAccount)]),
  );
  const timeoutMs =
    readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
  const probe = await probeChain(transport);
  out.chainVerified = probe.chainIdOk;
  if (!out.chainVerified) {
    out.failureReason = probe.rpcReachable
      ? "chain identity unverified; live read skipped (fail closed)"
      : "RPC unreachable; live read skipped (fail closed)";
    return out;
  }

  const word = bytes32Word(sourceId);
  try {
    out.sourceOnChain = decodeBool(
      await ethCall(
        transport,
        SOURCE_LINKAGE_TARGET.registryAddress,
        callData(SELECTOR_SOURCE_EXISTS, [word]),
      ),
    );
  } catch {
    out.sourceOnChain = null;
  }
  if (out.sourceOnChain === null) {
    out.failureReason = "source existence read failed (reported as unavailable)";
    return out;
  }
  if (!out.sourceOnChain) {
    out.sourceActive = false;
    out.failureReason =
      "no on-chain referral source exists for this wallet yet — a new source is a founder-signed on-chain act";
    return out;
  }

  try {
    out.sourceActive = decodeBool(
      await ethCall(
        transport,
        SOURCE_LINKAGE_TARGET.registryAddress,
        callData(SELECTOR_SOURCE_IS_ACTIVE, [word]),
      ),
    );
  } catch {
    out.sourceActive = null;
  }

  // The counters: the source's own row in the R5 snapshot. A source with no
  // attributed purchase yet honestly reads zeros as of the same block.
  const row = INTRODUCTION_SNAPSHOT.model.bySource[sourceKeyOf(sourceId)] ?? null;
  out.standing = {
    attributedPurchases: row?.attributedPurchases ?? 0,
    introducedMembers: row?.introducedMembers ?? 0,
    durableIntroductions: row?.durableIntroductions ?? 0,
    commissionPaidRaw: row?.commissionPaidRaw ?? "0",
    escrowOwedRaw: row?.escrowOwedRaw ?? "0",
    asOfBlock: INTRODUCTION_SNAPSHOT.model.asOfBlock,
    durableTest: INTRODUCTION_SNAPSHOT.model.durableTest,
    snapshotHash: INTRODUCTION_SNAPSHOT.snapshotHash,
    // Row-less source (no attributed purchase yet): base rung, nothing due.
    currentBps: row?.currentBps ?? null,
    entitledBps: row?.entitledBps ?? 500,
    entitledTitle: row?.entitledTitle ?? "Emerging",
    promotionDue: row?.promotionDue ?? false,
    crossedAtBlock: row?.crossedAtBlock ?? null,
    crossedAtDateUtc: row?.crossedAtDateUtc ?? null,
  };
  return out;
}
