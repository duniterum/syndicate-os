/**
 * Event Backbone — the ONE lazy-DB zone of the backbone (M4-a, founder GO).
 * --------------------------------------------------------------------------
 * Every database touch of the unattended event backbone lives in THIS file,
 * so the served-server DB discipline stays auditable at a glance:
 *
 *   - @workspace/db is imported LAZILY (dynamic import only), mirroring the
 *     founder-approved lazy-DB exceptions (operatorContext / memberRoster /
 *     operator services). The read-only server still boots with no DB.
 *   - NOTHING here ever calls pool.end(): the pool is shared with the auth
 *     and operator zones. Lifecycle belongs to the process, not the backbone.
 *   - Writes are exactly the ones the founder-gated scripts already perform:
 *     saleEventRaw INSERT (idempotent, onConflictDoNothing), indexerCursor
 *     UPSERT (the engine's fail-closed cursor discipline), blockTimestamp
 *     INSERT (onConflictDoNothing). No update elsewhere, no delete, ever.
 *   - decodedJson access is whitelisted to exactly {firstSeat, memberNumber};
 *     gated economics (referral/source fields) are never read.
 */

import type {
  CursorKey,
  CursorState,
  CursorUpsert,
  Persistence,
  RawEventRecord,
} from "../lib/protocol/saleEventIndexer";
import type {
  ActivityBuildInput,
  BlockTimestampInput,
  RawSaleEventInput,
} from "./activityHeartbeatReadmodel";
import type {
  ProtocolCursorState,
  ProtocolEventRecord,
  RawBurnRowInput,
  RawLifecycleRowInput,
  RawLpLiquidityRowInput,
  RawLpTokenMintRowInput,
  RawArchiveMintRowInput,
  RawArchivePauseRowInput,
} from "./protocolEventScan";

/** Avalanche C-Chain — same expected chain the reality spine reconciles. */
export const BACKBONE_EXPECTED_CHAIN_ID = 43114;

function requireDatabaseUrl(): void {
  if (
    process.env["DATABASE_URL"] == null ||
    process.env["DATABASE_URL"].length === 0
  ) {
    throw new Error("backbone: DATABASE_URL is not provisioned");
  }
}

// ---------------------------------------------------------------------------
// Sale-event scan persistence (the engine's injected adapter).
// ---------------------------------------------------------------------------

/**
 * Drizzle-backed persistence adapter for `runSaleEventScan`. Extracted from
 * scripts/sale-event-index.ts (slice M4-a) so the founder-gated CLI and the
 * unattended backbone drive the SAME adapter — one source, no drift.
 * Deliberately does NOT own or close the shared pool.
 */
export async function makeSaleEventPersistence(): Promise<Persistence> {
  requireDatabaseUrl();
  const { db, indexerCursor, saleEventRaw } = await import("@workspace/db");
  const { and, eq } = await import("drizzle-orm");

  return {
    async getCursor(key: CursorKey): Promise<CursorState | null> {
      const rows = await db
        .select()
        .from(indexerCursor)
        .where(
          and(
            eq(indexerCursor.chainId, key.chainId),
            eq(indexerCursor.contractKey, key.contractKey),
            eq(indexerCursor.eventName, key.eventName),
          ),
        );
      const r = rows[0];
      return r
        ? {
            fromBlock: r.fromBlock,
            lastScannedBlock: r.lastScannedBlock,
            status: r.status,
            lastError: r.lastError,
          }
        : null;
    },
    async upsertCursor(input: CursorUpsert): Promise<void> {
      const { db: dbi, indexerCursor: cursorTable } = await import(
        "@workspace/db"
      );
      await dbi
        .insert(cursorTable)
        .values({
          chainId: input.key.chainId,
          contractKey: input.key.contractKey,
          eventName: input.key.eventName,
          generation: input.generation,
          fromBlock: input.fromBlock,
          lastScannedBlock: input.lastScannedBlock,
          lastLogIndex: input.lastLogIndex,
          status: input.status,
          lastError: input.lastError,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            cursorTable.chainId,
            cursorTable.contractKey,
            cursorTable.eventName,
          ],
          set: {
            generation: input.generation,
            fromBlock: input.fromBlock,
            lastScannedBlock: input.lastScannedBlock,
            lastLogIndex: input.lastLogIndex,
            status: input.status,
            lastError: input.lastError,
            updatedAt: new Date(),
          },
        });
    },
    async insertEvents(recs: readonly RawEventRecord[]): Promise<number> {
      if (recs.length === 0) return 0;
      const inserted = await db
        .insert(saleEventRaw)
        .values(
          recs.map((r) => ({
            chainId: r.chainId,
            contractKey: r.contractKey,
            generation: r.generation,
            eventName: r.eventName,
            blockNumber: r.blockNumber,
            blockHash: r.blockHash,
            transactionHash: r.transactionHash,
            logIndex: r.logIndex,
            topic0: r.topic0,
            decodedJson: r.decodedJson,
            rawJson: r.rawJson,
          })),
        )
        .onConflictDoNothing({
          target: [
            saleEventRaw.chainId,
            saleEventRaw.transactionHash,
            saleEventRaw.logIndex,
          ],
        })
        .returning({ id: saleEventRaw.id });
      return inserted.length;
    },
  };
}

// ---------------------------------------------------------------------------
// Protocol Time incremental enrichment reads/writes.
// ---------------------------------------------------------------------------

export interface UncachedRawBlock {
  chainId: number;
  blockNumber: number;
  /** Raw-index witness hash (nullable on old rows); lowercased when present. */
  witnessHash: string | null;
}

/**
 * DISTINCT (chainId, blockNumber, witness block_hash) present in EITHER raw
 * lane (sale_event_raw OR protocol_event_raw, M4-c) but MISSING from the
 * block_timestamp cache. The incremental complement of the founder-gated
 * full-replay script: the unattended path only ever fetches blocks it has
 * never verified; the full re-verification replay stays `protocol-time:enrich`.
 */
export async function loadUncachedRawBlocks(): Promise<UncachedRawBlock[]> {
  requireDatabaseUrl();
  const { pool } = await import("@workspace/db");
  const res = await pool.query(
    `with raw_blocks as (
       select chain_id, block_number, block_hash from sale_event_raw
       union all
       select chain_id, block_number, block_hash from protocol_event_raw
     )
     select r.chain_id, r.block_number,
            count(distinct r.block_hash) filter (where r.block_hash is not null)::int as hash_variants,
            min(lower(r.block_hash)) as witness_hash
       from raw_blocks r
       left join block_timestamp t
         on t.chain_id = r.chain_id and t.block_number = r.block_number
      where t.block_number is null
      group by r.chain_id, r.block_number
      order by r.chain_id, r.block_number`,
  );
  return res.rows.map((r: Record<string, unknown>) => {
    const variants = Number(r["hash_variants"]);
    if (variants > 1) {
      throw new Error(
        `raw index inconsistency: block ${String(r["block_number"])} carries ${variants} distinct block hashes`,
      );
    }
    return {
      chainId: Number(r["chain_id"]),
      blockNumber: Number(r["block_number"]),
      witnessHash: r["witness_hash"] == null ? null : String(r["witness_hash"]),
    };
  });
}

/** Insert one verified block timestamp (idempotent). Returns rows inserted. */
export async function insertBlockTimestampRow(row: {
  chainId: number;
  blockNumber: number;
  blockTimestampSec: number;
  blockHash: string;
}): Promise<number> {
  requireDatabaseUrl();
  const { db, blockTimestamp } = await import("@workspace/db");
  const res = await db
    .insert(blockTimestamp)
    .values(row)
    .onConflictDoNothing({
      target: [blockTimestamp.chainId, blockTimestamp.blockNumber],
    })
    .returning({ blockNumber: blockTimestamp.blockNumber });
  return res.length;
}

// ---------------------------------------------------------------------------
// Protocol-event lane (M4-c): cursor + raw-row persistence + read-only loads.
// ---------------------------------------------------------------------------

export async function getProtocolCursor(
  chainId: number,
  streamKey: string,
  eventName: string,
): Promise<ProtocolCursorState | null> {
  requireDatabaseUrl();
  const { db, protocolEventCursor } = await import("@workspace/db");
  const { and, eq } = await import("drizzle-orm");
  const rows = await db
    .select()
    .from(protocolEventCursor)
    .where(
      and(
        eq(protocolEventCursor.chainId, chainId),
        eq(protocolEventCursor.streamKey, streamKey),
        eq(protocolEventCursor.eventName, eventName),
      ),
    );
  const r = rows[0];
  return r
    ? {
        fromBlock: r.fromBlock,
        lastScannedBlock: r.lastScannedBlock,
        status: r.status,
        lastError: r.lastError,
      }
    : null;
}

export async function upsertProtocolCursor(input: {
  chainId: number;
  streamKey: string;
  eventName: string;
  fromBlock: number;
  lastScannedBlock: number;
  status: string;
  lastError: string | null;
}): Promise<void> {
  requireDatabaseUrl();
  const { db, protocolEventCursor } = await import("@workspace/db");
  await db
    .insert(protocolEventCursor)
    .values({ ...input, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [
        protocolEventCursor.chainId,
        protocolEventCursor.streamKey,
        protocolEventCursor.eventName,
      ],
      set: {
        fromBlock: input.fromBlock,
        lastScannedBlock: input.lastScannedBlock,
        status: input.status,
        lastError: input.lastError,
        updatedAt: new Date(),
      },
    });
}

/** Insert protocol-event rows (idempotent). Returns rows actually inserted. */
export async function insertProtocolEvents(
  recs: readonly ProtocolEventRecord[],
): Promise<number> {
  if (recs.length === 0) return 0;
  requireDatabaseUrl();
  const { db, protocolEventRaw } = await import("@workspace/db");
  const inserted = await db
    .insert(protocolEventRaw)
    .values(
      recs.map((r) => ({
        chainId: r.chainId,
        streamKey: r.streamKey,
        eventName: r.eventName,
        blockNumber: r.blockNumber,
        blockHash: r.blockHash,
        transactionHash: r.transactionHash,
        logIndex: r.logIndex,
        topic0: r.topic0,
        decodedJson: r.decodedJson,
      })),
    )
    .onConflictDoNothing({
      target: [
        protocolEventRaw.chainId,
        protocolEventRaw.transactionHash,
        protocolEventRaw.logIndex,
      ],
    })
    .returning({ id: protocolEventRaw.id });
  return inserted.length;
}

export interface ProtocolEventLoad {
  burns: RawBurnRowInput[];
  lifecycle: RawLifecycleRowInput[];
  lpLiquidity: RawLpLiquidityRowInput[];
  lpTokenMints: RawLpTokenMintRowInput[];
  archiveMints: RawArchiveMintRowInput[];
  archivePauses: RawArchivePauseRowInput[];
}

/**
 * Read-only load of the protocol-event lane for the read-model. decodedJson
 * access is whitelisted to exactly {from, valueRaw} on BURN rows (the burn
 * loader's `b.` accessor — pinned by backbone.guard); lifecycle rows read NO
 * decoded fields at all. The sender address stays inside the zone: the
 * read-model translates it to a Founder/Community LABEL and the address never
 * reaches any projection.
 */
export async function loadProtocolEventRows(): Promise<ProtocolEventLoad> {
  requireDatabaseUrl();
  const db = await import("@workspace/db");
  const { asc, eq } = await import("drizzle-orm");

  const rows = await db.db
    .select({
      streamKey: db.protocolEventRaw.streamKey,
      eventName: db.protocolEventRaw.eventName,
      blockNumber: db.protocolEventRaw.blockNumber,
      logIndex: db.protocolEventRaw.logIndex,
      transactionHash: db.protocolEventRaw.transactionHash,
      decodedJson: db.protocolEventRaw.decodedJson,
    })
    .from(db.protocolEventRaw)
    .where(eq(db.protocolEventRaw.chainId, BACKBONE_EXPECTED_CHAIN_ID))
    .orderBy(
      asc(db.protocolEventRaw.blockNumber),
      asc(db.protocolEventRaw.logIndex),
    );

  const burns: RawBurnRowInput[] = [];
  const lifecycle: RawLifecycleRowInput[] = [];
  const lpLiquidity: RawLpLiquidityRowInput[] = [];
  const lpTokenMints: RawLpTokenMintRowInput[] = [];
  const archiveMints: RawArchiveMintRowInput[] = [];
  const archivePauses: RawArchivePauseRowInput[] = [];
  for (const r of rows) {
    if (r.streamKey === "SYN_BURN") {
      // decodedJson WHITELIST (burn rows): exactly {from, valueRaw}.
      const b = r.decodedJson as Record<string, unknown>;
      if (typeof b.from !== "string" || typeof b.valueRaw !== "string") {
        throw new Error("burn row decoded shape invalid — refusing to derive");
      }
      burns.push({
        blockNumber: r.blockNumber,
        logIndex: r.logIndex,
        transactionHash: r.transactionHash,
        fromAddress: b.from,
        valueRaw: b.valueRaw,
      });
    } else if (r.streamKey === "SOURCE_LIFECYCLE") {
      // decodedJson WHITELIST (lifecycle rows): at most {commissionBps} — a
      // rate on SourceTermsUpdated rows (H1a ⑧), never an address.
      const l = r.decodedJson as Record<string, unknown>;
      lifecycle.push({
        eventName: r.eventName,
        blockNumber: r.blockNumber,
        logIndex: r.logIndex,
        transactionHash: r.transactionHash,
        commissionBps:
          typeof l.commissionBps === "number" && Number.isSafeInteger(l.commissionBps)
            ? l.commissionBps
            : null,
      });
    } else if (r.streamKey === "LP_LIQUIDITY") {
      // decodedJson WHITELIST (lp rows): {amount0Raw, amount1Raw, withdrawer?}.
      const p = r.decodedJson as Record<string, unknown>;
      if (
        (r.eventName !== "Mint" && r.eventName !== "Burn") ||
        typeof p.amount0Raw !== "string" ||
        typeof p.amount1Raw !== "string"
      ) {
        throw new Error("lp row decoded shape invalid — refusing to derive");
      }
      lpLiquidity.push({
        eventName: r.eventName,
        blockNumber: r.blockNumber,
        logIndex: r.logIndex,
        transactionHash: r.transactionHash,
        amount0Raw: p.amount0Raw,
        amount1Raw: p.amount1Raw,
        withdrawer: typeof p.withdrawer === "string" ? p.withdrawer : null,
      });
    } else if (r.streamKey === "LP_TOKEN_MINT") {
      // decodedJson WHITELIST: exactly {depositor} (label source, never emitted).
      const t = r.decodedJson as Record<string, unknown>;
      if (typeof t.depositor !== "string") {
        throw new Error("lp token mint row decoded shape invalid — refusing to derive");
      }
      lpTokenMints.push({
        blockNumber: r.blockNumber,
        logIndex: r.logIndex,
        transactionHash: r.transactionHash,
        depositor: t.depositor,
      });
    } else if (r.streamKey === "ARCHIVE_MINT") {
      // decodedJson WHITELIST: exactly {artifactId, quantityRaw} — no minter.
      const a = r.decodedJson as Record<string, unknown>;
      if (typeof a.artifactId !== "number" || typeof a.quantityRaw !== "string") {
        throw new Error("archive mint row decoded shape invalid — refusing to derive");
      }
      archiveMints.push({
        blockNumber: r.blockNumber,
        logIndex: r.logIndex,
        transactionHash: r.transactionHash,
        artifactId: a.artifactId,
        quantityRaw: a.quantityRaw,
      });
    } else if (r.streamKey === "ARCHIVE_PAUSE") {
      if (r.eventName !== "Paused" && r.eventName !== "Unpaused") {
        throw new Error("archive pause row shape invalid — refusing to derive");
      }
      archivePauses.push({
        eventName: r.eventName,
        blockNumber: r.blockNumber,
        logIndex: r.logIndex,
        transactionHash: r.transactionHash,
      });
    } else {
      throw new Error(
        `unknown protocol-event stream "${r.streamKey}" — refusing to derive`,
      );
    }
  }
  return { burns, lifecycle, lpLiquidity, lpTokenMints, archiveMints, archivePauses };
}

// ---------------------------------------------------------------------------
// Activity heartbeat input (read-only selects; whitelist + divergence check).
// ---------------------------------------------------------------------------

function toInt(value: unknown, label: string): number {
  const n = typeof value === "string" ? Number(value) : (value as number);
  if (typeof n !== "number" || !Number.isFinite(n) || !Number.isInteger(n)) {
    throw new Error(`expected integer for ${label}`);
  }
  return n;
}

function toBool(value: unknown, label: string): boolean {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`expected boolean for ${label}`);
}

export interface ActivityHeartbeatLoad {
  input: ActivityBuildInput;
  /** Divergence-witness cross-check evidence (hashes never leave the zone). */
  rowsWithBothHashes: number;
}

/**
 * Load the pure builder's input from Part A + the Protocol Time cache.
 * Shared by the unattended backbone AND the founder-gated derive runner —
 * one loader, one whitelist, no drift. Read-only. Fail-closed on stray
 * chains and on any raw↔cache block-hash divergence.
 */
export async function loadActivityHeartbeatInput(): Promise<ActivityHeartbeatLoad> {
  requireDatabaseUrl();
  const db = await import("@workspace/db");
  const { asc, eq } = await import("drizzle-orm");

  // --- Part A: raw sale-event rows (read-only; whitelisted decoded fields) ---
  const rawRows = await db.db
    .select({
      chainId: db.saleEventRaw.chainId,
      generation: db.saleEventRaw.generation,
      eventName: db.saleEventRaw.eventName,
      blockNumber: db.saleEventRaw.blockNumber,
      logIndex: db.saleEventRaw.logIndex,
      blockHash: db.saleEventRaw.blockHash,
      transactionHash: db.saleEventRaw.transactionHash,
      decodedJson: db.saleEventRaw.decodedJson,
    })
    .from(db.saleEventRaw)
    .where(eq(db.saleEventRaw.chainId, BACKBONE_EXPECTED_CHAIN_ID))
    .orderBy(asc(db.saleEventRaw.blockNumber), asc(db.saleEventRaw.logIndex));

  const strayChainCount = (
    await db.db
      .select({ chainId: db.saleEventRaw.chainId })
      .from(db.saleEventRaw)
  ).filter((r) => r.chainId !== BACKBONE_EXPECTED_CHAIN_ID).length;
  if (strayChainCount > 0) {
    throw new Error(
      `sale_event_raw contains ${strayChainCount} row(s) on an unexpected chain — refusing to derive`,
    );
  }

  const rawEvents: RawSaleEventInput[] = rawRows.map((r) => {
    // decodedJson WHITELIST: exactly {firstSeat, memberNumber}. Nothing else
    // is read; gated economics never enter this model.
    const d = r.decodedJson as Record<string, unknown>;
    return {
      chainId: r.chainId,
      generation: r.generation,
      eventName: r.eventName,
      blockNumber: r.blockNumber,
      logIndex: r.logIndex,
      transactionHash: r.transactionHash,
      firstSeat:
        "firstSeat" in d ? toBool(d.firstSeat, "decoded firstSeat") : null,
      memberNumber:
        "memberNumber" in d
          ? toInt(d.memberNumber, "decoded memberNumber")
          : null,
    };
  });

  // --- Protocol Time: verified block timestamps (read-only) ---
  const tsRows = await db.db
    .select({
      chainId: db.blockTimestamp.chainId,
      blockNumber: db.blockTimestamp.blockNumber,
      blockTimestampSec: db.blockTimestamp.blockTimestampSec,
      blockHash: db.blockTimestamp.blockHash,
    })
    .from(db.blockTimestamp)
    .where(eq(db.blockTimestamp.chainId, BACKBONE_EXPECTED_CHAIN_ID))
    .orderBy(asc(db.blockTimestamp.blockNumber));

  const blockTimestamps: BlockTimestampInput[] = tsRows.map((t) => ({
    chainId: t.chainId,
    blockNumber: t.blockNumber,
    blockTimestampSec: t.blockTimestampSec,
  }));

  // --- Divergence-witness cross-check: raw block_hash ↔ cache block_hash ---
  const cacheHashByBlock = new Map<number, string>();
  for (const t of tsRows) {
    if (t.blockHash) cacheHashByBlock.set(t.blockNumber, t.blockHash);
  }
  let rowsWithBothHashes = 0;
  let divergedRows = 0;
  for (const r of rawRows) {
    const cacheHash = cacheHashByBlock.get(r.blockNumber);
    if (r.blockHash && cacheHash) {
      rowsWithBothHashes += 1;
      if (r.blockHash !== cacheHash) divergedRows += 1;
    }
  }
  if (divergedRows > 0) {
    throw new Error(
      `block-hash divergence between sale_event_raw and the Protocol Time cache on ${divergedRows} row(s) (hashes withheld) — refusing to derive`,
    );
  }

  return {
    input: {
      expectedChainId: BACKBONE_EXPECTED_CHAIN_ID,
      rawEvents,
      blockTimestamps,
    },
    rowsWithBothHashes,
  };
}
