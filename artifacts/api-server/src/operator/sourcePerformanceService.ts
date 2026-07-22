// operator/sourcePerformanceService.ts — K3.c (mockup Face 5, founder-
// approved "GO and GO-Live"): the per-source performance read.
//
// ADMIN SEES, PUBLIC NEVER (the engraved order): one founder-only projection
// joining what the machine already knows — the introduction read-model's
// per-source stats (backbone-refreshed, snapshot fallback), the ownership
// edges (masked wallet of record), the CLOSED activation requests (so a
// member-requested source with ZERO purchases appears the day it activates —
// the recorded zero-purchase blind spot, closed), and ONE live registry
// status word per row (batched; null = didn't run, rendered honestly).
//
// Same fail-closed shape as every sibling: env-gated before any DB touch,
// lazy @workspace/db, every read audited (§8: access is logged), masked
// wallets only, any error → "unavailable".

import { randomUUID } from "node:crypto";
import { AUTH_EXPOSURE_FLAG } from "../auth/authExposure";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { ethCall, probeChain } from "../lib/protocol/evmRead";
import { callData } from "../lib/protocol/archiveDecoders";
import { bytes32Word } from "../lib/protocol/sourceDecoders";
import { SOURCE_LINKAGE_TARGET } from "../data/protocolTargets";
import { keccak256, toHex } from "viem";
import { sourceKeyOf } from "../lib/protocol/introductionReadmodel";
import { getLiveIntroductionModel } from "../lib/protocol/introductionLiveModel";
import { INTRODUCTION_SNAPSHOT } from "../lib/protocol/introductionSnapshot";
import { getAllOwnershipEdges } from "../lib/protocol/sourceOwnershipIndex";
import { canonicalSourceIdHex } from "../auth/activationEligibility";

/** keccak("sourceConfig(bytes32)")[0..4] — computed, never hand-typed. */
const SELECTOR_SOURCE_CONFIG = keccak256(toHex("sourceConfig(bytes32)")).slice(
  0,
  10,
) as `0x${string}`;

/** The vendored ABI's tuple order: commissionBps word 2, status word 3. */
const BPS_WORD_INDEX = 2;
const STATUS_WORD_INDEX = 3;
/** Shared wall-clock budget for the status fan-out — once exceeded, the
 * remaining rows serve null statuses instantly (honest, never a hang). */
const STATUS_BUDGET_MS = 20_000;
const STATUS_WORDS: Record<number, string> = {
  1: "ACTIVE",
  2: "PAUSED",
  3: "REVOKED",
};

const ROW_CAP = 100;
const STATUS_BATCH = 5;
const CLOSED_REQUEST_CAP = 200;

function gateOpen(): boolean {
  return (
    process.env[AUTH_EXPOSURE_FLAG] === "true" &&
    process.env.DATABASE_URL != null &&
    process.env.DATABASE_URL.length > 0
  );
}

function mask(wallet: string): string {
  return wallet.length >= 10
    ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
    : "0x…";
}

export interface SourcePerformanceRow {
  /** 64-hex source id (passes the boundary-aware address gate). */
  sourceIdHex: string;
  /** Masked 0x1234…abcd — the house list form; never the full wallet. */
  ownerShort: string;
  /** ACTIVE | PAUSED | REVOKED — or null when the live read didn't run. */
  status: string | null;
  attributedPurchases: number;
  introducedMembers: number;
  durableIntroductions: number;
  commissionPaidRaw: string;
  escrowOwedRaw: string;
  /** The live-at-index registry rate (bps), or null (no indexed row). */
  currentBps: number | null;
  promotionDue: boolean;
  /** Latest attributed-purchase block, or null (no purchase yet). */
  lastBlock: number | null;
}

export type SourcePerformanceResult =
  | {
      ok: true;
      payload: {
        rows: SourcePerformanceRow[];
        asOfBlock: number;
        /** false = the registry status reads were skipped (probe failed). */
        statusReadOk: boolean;
        /** true = the ownership index has never built this process lifetime
         * (post-boot warm-up) — purchase-backed rows are missing and the
         * client SAYS so, never a silently partial table. */
        indexWarming: boolean;
        /** All sources known before the row cap — a drop is stated. */
        totalKnown: number;
      };
    }
  | { ok: false; reason: string };

export async function listSourcePerformance(actor: {
  wallet: string;
  role: string;
}): Promise<SourcePerformanceResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };
  try {
    const { db, activationRequest, auditLog } = await import("@workspace/db");
    const { eq, desc } = await import("drizzle-orm");

    // The read-model (live preferred, committed snapshot as the honest floor
    // — the sourceStandingRead freshness rule).
    const liveModel = getLiveIntroductionModel();
    const active =
      liveModel !== null &&
      liveModel.model.asOfBlock >= INTRODUCTION_SNAPSHOT.model.asOfBlock
        ? liveModel.model
        : INTRODUCTION_SNAPSHOT.model;

    // Universe 1: every ownership edge (purchase-backed sources). NULL =
    // the in-memory index has never built this process lifetime (post-boot
    // warm-up) — the payload SAYS so (adversarial verify 2026-07-22: the
    // module's own null-contract is "the caller says warming, never a
    // silently partial table").
    const allEdges = getAllOwnershipEdges();
    const indexWarming = allEdges === null;
    const edges = allEdges ?? [];
    // Universe 2: CLOSED activation requests — the zero-purchase sources a
    // member asked for and the founder activated (visible from day one).
    const closed = await db
      .select({
        sourceIdHex: activationRequest.sourceIdHex,
        memberWallet: activationRequest.memberWallet,
      })
      .from(activationRequest)
      .where(eq(activationRequest.status, "CLOSED"))
      .orderBy(desc(activationRequest.decidedAt))
      .limit(CLOSED_REQUEST_CAP);

    const byId = new Map<string, { ownerWallet: string; lastBlock: number | null }>();
    for (const e of edges) {
      byId.set(e.sourceId.toLowerCase(), {
        ownerWallet: e.wallet,
        lastBlock: e.lastBlock,
      });
    }
    for (const c of closed) {
      // The D2 grain (adversarial verify 2026-07-22): the K3.b close may
      // have verified the wallet's CANONICAL derivation while the ask
      // recorded an older founder-signed id — surface BOTH, so the source
      // that actually activated appears the day it activates.
      const candidates = [c.sourceIdHex.toLowerCase()];
      const canonical = canonicalSourceIdHex(c.memberWallet);
      if (canonical !== null && !candidates.includes(canonical)) {
        candidates.push(canonical);
      }
      for (const id of candidates) {
        if (!byId.has(id)) {
          byId.set(id, { ownerWallet: c.memberWallet, lastBlock: null });
        }
      }
    }

    // One chain probe; per-row status reads in bounded batches; a probe
    // failure serves null statuses instantly (rendered honestly), never a
    // row-by-row timeout crawl.
    const timeoutMs =
      readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
    const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
    const probe = await probeChain(transport);
    const statusReadOk = probe.chainIdOk;

    // Latest-activity FIRST, then the cap — a truncation must drop the
    // stalest rows, never an arbitrary insertion-order subset, and the
    // payload states the drop (no silent caps — adversarial verify).
    const totalKnown = byId.size;
    const ids = [...byId.entries()]
      .sort((a, b) => (b[1].lastBlock ?? 0) - (a[1].lastBlock ?? 0))
      .map(([id]) => id)
      .slice(0, ROW_CAP);
    const statusById = new Map<string, string | null>();
    const liveBpsById = new Map<string, number | null>();
    if (statusReadOk) {
      const startedAt = Date.now();
      for (let i = 0; i < ids.length; i += STATUS_BATCH) {
        if (Date.now() - startedAt > STATUS_BUDGET_MS) break; // honest nulls beat a hang
        const batch = ids.slice(i, i + STATUS_BATCH);
        await Promise.all(
          batch.map(async (id) => {
            try {
              const data = await ethCall(
                transport,
                SOURCE_LINKAGE_TARGET.registryAddress,
                callData(SELECTOR_SOURCE_CONFIG, [bytes32Word(id)]),
              );
              if (typeof data !== "string" || data.length < 2 + 14 * 64) {
                statusById.set(id, null);
                return;
              }
              const word = data.slice(
                2 + STATUS_WORD_INDEX * 64,
                2 + (STATUS_WORD_INDEX + 1) * 64,
              );
              const code = Number.parseInt(word, 16);
              statusById.set(id, STATUS_WORDS[code] ?? null);
              // Word 2 of the SAME response: the registry's configured bps —
              // fills the Rate column for day-one zero-purchase rows (the
              // read-model's live-at-index value still wins when present).
              const bpsWord = data.slice(
                2 + BPS_WORD_INDEX * 64,
                2 + (BPS_WORD_INDEX + 1) * 64,
              );
              const bps = Number.parseInt(bpsWord, 16);
              liveBpsById.set(id, Number.isFinite(bps) && bps <= 65535 ? bps : null);
            } catch {
              statusById.set(id, null);
            }
          }),
        );
      }
    }

    const rows: SourcePerformanceRow[] = ids.map((id) => {
      const meta = byId.get(id);
      const stats = active.bySource[sourceKeyOf(id)] ?? null;
      return {
        sourceIdHex: id,
        ownerShort: mask(meta?.ownerWallet ?? ""),
        status: statusById.get(id) ?? null,
        attributedPurchases: stats?.attributedPurchases ?? 0,
        introducedMembers: stats?.introducedMembers ?? 0,
        durableIntroductions: stats?.durableIntroductions ?? 0,
        commissionPaidRaw: stats?.commissionPaidRaw ?? "0",
        escrowOwedRaw: stats?.escrowOwedRaw ?? "0",
        currentBps: stats?.currentBps ?? liveBpsById.get(id) ?? null,
        promotionDue: stats?.promotionDue ?? false,
        lastBlock: stats?.lastBlock ?? meta?.lastBlock ?? null,
      };
    });
    // Latest activity first; never a leaderboard framing (the anti-MLM law).
    rows.sort((a, b) => (b.lastBlock ?? 0) - (a.lastBlock ?? 0));

    // §8 — access is logged (row counts only, never row content).
    await db.insert(auditLog).values({
      id: randomUUID(),
      actorWallet: actor.wallet,
      actorRole: actor.role,
      action: "source-performance.read",
      target: null,
      detail: { rows: rows.length },
      stepUpSigned: false,
    });

    return {
      ok: true,
      payload: {
        rows,
        asOfBlock: active.asOfBlock,
        statusReadOk,
        indexWarming,
        totalKnown,
      },
    };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
