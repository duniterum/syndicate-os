// sourceStandingRead.ts — R5 own-row source-standing resolution (spine helper).
// ---------------------------------------------------------------------------
// Called ONLY by the auth zone's GET /source-standing with the session's own
// bound account (the engineReadback pattern: the registry-ish material lives
// here in the read-only spine, the auth zone stays registry-less). It:
//   1. derives the account's canonical sourceId (keccak256("SYN.SOURCE.V1",
//      account) — SPEC §③; the emitter will compute the same on-chain),
//   2. live-reads registry existence + active state (fail closed to null),
//   3. D-TRUTH D2 (founder GO 2026-07-16): when NO canonical source exists,
//      falls back to any INDEXED source whose registry wallet of record is
//      this same bound account (sourceOwnershipIndex — the founder-signed
//      BUILDER class; sourceOrigin says which path answered), so a member
//      is never told "no source exists" while their own source pays them,
//   4. resolves the source's OWN counters from the generated R5 snapshot via
//      the opaque sourceKey (an honest SERVED SNAPSHOT, labeled asOfBlock).
// The account never leaves this module's return value. AMENDED 2026-07-16
// (founder Ruling ①, dated): the RESOLVED source id is served OWN-ROW as
// sourceIdHex — the link card must advertise the source that actually PAYS
// the wallet (the member's own material, session-bound; 64-hex passes the
// address gates; the public snapshot stays raw-sourceId-free, unchanged).

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
import { getLiveIntroductionModel } from "./introductionLiveModel";
import { getOwnedSources } from "./sourceOwnershipIndex";

export interface OwnSourceStanding {
  chainVerified: boolean;
  /** true/false = live registry answer; null = read unavailable (fail closed). */
  sourceOnChain: boolean | null;
  sourceActive: boolean | null;
  /**
   * D2 — which resolution answered: "canonical" (the wallet's own derived
   * id) or "founder-signed" (an indexed source whose registry wallet of
   * record is this account). Null when no source resolved.
   */
  sourceOrigin: "canonical" | "founder-signed" | null;
  /** Ruling ① (2026-07-16): the RESOLVED source's bytes32 id, own-row only —
   * the link the member should share is the source that pays them. */
  sourceIdHex: string | null;
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
    sourceOrigin: null,
    sourceIdHex: null,
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

  const existsOnChain = async (id: string): Promise<boolean | null> =>
    decodeBool(
      await ethCall(
        transport,
        SOURCE_LINKAGE_TARGET.registryAddress,
        callData(SELECTOR_SOURCE_EXISTS, [bytes32Word(id)]),
      ),
    );

  let resolvedId: string = sourceId;
  try {
    out.sourceOnChain = await existsOnChain(sourceId);
  } catch {
    out.sourceOnChain = null;
  }
  if (out.sourceOnChain === null) {
    out.failureReason = "source existence read failed (reported as unavailable)";
    return out;
  }
  if (out.sourceOnChain) {
    out.sourceOrigin = "canonical";
  } else {
    // D2 — the wallet's canonical id does not exist: fall back to any INDEXED
    // source whose registry wallet of record is this same bound account (the
    // founder-signed class). The account is only ever a lookup key here.
    const owned = getOwnedSources(boundAccount.toLowerCase());
    if (owned === null) {
      // The index has never built this process lifetime — resolution is
      // UNAVAILABLE, never a definitive "no source exists".
      out.sourceOnChain = null;
      out.failureReason =
        "the source index is still warming after a restart — your standing returns shortly; nothing is assumed";
      return out;
    }
    const canonicalLower = sourceId.toLowerCase();
    for (const cand of owned) {
      if (cand.sourceId === canonicalLower) continue; // already answered false
      let exists: boolean | null;
      try {
        exists = await existsOnChain(cand.sourceId);
      } catch {
        exists = null;
      }
      if (exists === null) {
        out.sourceOnChain = null;
        out.failureReason =
          "source existence read failed (reported as unavailable)";
        return out;
      }
      if (exists) {
        resolvedId = cand.sourceId;
        out.sourceOnChain = true;
        out.sourceOrigin = "founder-signed";
        break;
      }
    }
    if (out.sourceOnChain !== true) {
      out.sourceOnChain = false;
      out.sourceActive = false;
      out.failureReason =
        "no on-chain referral source exists for this wallet yet — a new source is a founder-signed on-chain act";
      return out;
    }
  }

  try {
    out.sourceActive = decodeBool(
      await ethCall(
        transport,
        SOURCE_LINKAGE_TARGET.registryAddress,
        callData(SELECTOR_SOURCE_IS_ACTIVE, [bytes32Word(resolvedId)]),
      ),
    );
  } catch {
    out.sourceActive = null;
  }

  // The counters: the source's own row in the R5 read-model. M0: PREFER the
  // backbone's live-refreshed model when it is at least as fresh; the
  // committed snapshot stays the boot fallback (the server is never worse
  // than the last founder-gated build). asOfBlock stays honest either way.
  const liveModel = getLiveIntroductionModel();
  const active =
    liveModel !== null &&
    liveModel.model.asOfBlock >= INTRODUCTION_SNAPSHOT.model.asOfBlock
      ? { model: liveModel.model, hash: liveModel.modelHash }
      : { model: INTRODUCTION_SNAPSHOT.model, hash: INTRODUCTION_SNAPSHOT.snapshotHash };
  // Ruling ① (2026-07-16): the resolved id travels own-row so the client
  // advertises the PAYING source's link (canonical or founder-signed alike).
  out.sourceIdHex = resolvedId.toLowerCase();
  const row = active.model.bySource[sourceKeyOf(resolvedId)] ?? null;
  out.standing = {
    attributedPurchases: row?.attributedPurchases ?? 0,
    introducedMembers: row?.introducedMembers ?? 0,
    durableIntroductions: row?.durableIntroductions ?? 0,
    commissionPaidRaw: row?.commissionPaidRaw ?? "0",
    escrowOwedRaw: row?.escrowOwedRaw ?? "0",
    asOfBlock: active.model.asOfBlock,
    durableTest: active.model.durableTest,
    snapshotHash: active.hash,
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
