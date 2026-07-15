/**
 * CLI: archive minter backfill (H2-P, founder-gated) — THE ONE deliberate
 * exception to the protocol-event lane's insert-only discipline.
 * ---------------------------------------------------------------------------
 * WHY IT EXISTS (recorded, never silent): THE PRIDE OF THE PUBLIC RECORD
 * (founder amendment 2026-07-15, ADR-003) restores the origin voice —
 * "0x123…abcd archived First Signal" — but the ARCHIVE_MINT rows persisted
 * before the amendment deliberately dropped the minter. This script restores
 * the field FROM THE CHAIN'S OWN LOGS: nothing is invented, nothing else is
 * touched, and every write is cross-checked against the row it lands on.
 *
 * Discipline:
 *   - DRY-RUN BY DEFAULT: without --write it only reports what it would do.
 *   - Chain-derived: each row's log is re-fetched (block-exact eth_getLogs)
 *     and must match the row's transactionHash + logIndex EXACTLY.
 *   - Cross-checked: the re-decoded artifactId + quantityRaw must equal the
 *     persisted values, else the whole run ABORTS (fail-closed) — a backfill
 *     never lands on a row it cannot re-prove.
 *   - Scoped: UPDATEs ONLY protocol_event_raw.decoded_json on ARCHIVE_MINT
 *     rows missing the minter — one transaction, all-or-nothing.
 *   - Address discipline: full addresses go into the SERVER-ONLY decodedJson
 *     column (where the burn sender already lives); the console report
 *     prints SHORT FORMS only.
 *
 * Usage:  pnpm --filter @workspace/api-server run archive:minter-backfill
 *         pnpm --filter @workspace/api-server run archive:minter-backfill -- --write
 */

import { toEventSelector } from "viem";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../src/lib/protocol/rpcTransport";
import { ethGetLogs } from "../src/lib/protocol/evmRead";
import { PROTOCOL_EVENT_SCAN_TARGETS } from "../src/data/protocolTargets";

const EXPECTED_CHAIN_ID = 43114;
const ERC1155_TRANSFER_SINGLE_TOPIC0 = toEventSelector(
  "TransferSingle(address,address,address,uint256,uint256)",
);
const ZERO_ADDRESS_TOPIC = "0x" + "0".repeat(64);

function topicToAddress(topic: unknown): string {
  if (typeof topic !== "string" || !/^0x0{24}[0-9a-fA-F]{40}$/.test(topic)) {
    throw new Error("topic: not an address-carrying topic");
  }
  return ("0x" + topic.slice(26)).toLowerCase();
}

function short(address: string): string {
  return `0x${address.slice(2, 5)}…${address.slice(-4)}`;
}

async function main(): Promise<void> {
  const write = process.argv.includes("--write");
  if (!process.env["DATABASE_URL"]) {
    console.error("DATABASE_URL is required (the backfill reads/writes the raw lane).");
    process.exit(1);
  }
  const target = PROTOCOL_EVENT_SCAN_TARGETS.find(
    (t) => t.streamKey === "ARCHIVE_MINT",
  );
  if (!target) throw new Error("ARCHIVE_MINT scan target missing from canon");

  const { pool } = await import("@workspace/db");
  const timeoutMs =
    readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);

  // ① The rows missing their minter (the pre-amendment persistence).
  const res = await pool.query(
    `select id, block_number, transaction_hash, log_index, decoded_json
       from protocol_event_raw
      where chain_id = $1
        and stream_key = 'ARCHIVE_MINT'
        and not (decoded_json ? 'minter')
      order by block_number, log_index`,
    [EXPECTED_CHAIN_ID],
  );
  console.log(`ARCHIVE_MINT rows missing minter: ${res.rows.length}`);
  if (res.rows.length === 0) {
    console.log("Nothing to backfill — the record is already complete.");
    await pool.end();
    return;
  }

  // ② Chain re-read + fail-closed cross-check per row.
  const updates: { id: number; minter: string }[] = [];
  for (const row of res.rows as {
    id: number;
    block_number: string | number;
    transaction_hash: string;
    log_index: number;
    decoded_json: { artifactId?: unknown; quantityRaw?: unknown };
  }[]) {
    const blockNumber = Number(row.block_number);
    const logs = await ethGetLogs(transport, {
      address: target.address,
      fromBlock: blockNumber,
      toBlock: blockNumber,
      topic0: ERC1155_TRANSFER_SINGLE_TOPIC0,
      topics: [ERC1155_TRANSFER_SINGLE_TOPIC0, null, ZERO_ADDRESS_TOPIC],
    });
    const match = logs.find(
      (l) =>
        typeof l.transactionHash === "string" &&
        l.transactionHash.toLowerCase() === row.transaction_hash.toLowerCase() &&
        Number.parseInt(String(l.logIndex), 16) === row.log_index,
    );
    if (!match) {
      throw new Error(
        `row id=${row.id} block=${blockNumber}: the chain log was not found — ABORTING (nothing written)`,
      );
    }
    const topics = Array.isArray(match.topics) ? match.topics : [];
    const data = typeof match.data === "string" ? match.data.slice(2) : "";
    if (topics.length !== 4 || data.length < 128) {
      throw new Error(`row id=${row.id}: log shape mismatch — ABORTING`);
    }
    const artifactId = Number(BigInt("0x" + data.slice(0, 64)));
    const quantityRaw = BigInt("0x" + data.slice(64, 128)).toString(10);
    if (
      artifactId !== row.decoded_json.artifactId ||
      quantityRaw !== row.decoded_json.quantityRaw
    ) {
      throw new Error(
        `row id=${row.id}: re-decoded artifactId/quantity disagree with the persisted row — ABORTING`,
      );
    }
    const minter = topicToAddress(topics[3]);
    updates.push({ id: row.id, minter });
    console.log(
      `  row id=${row.id} · block ${blockNumber} · artifact #${artifactId} → minter ${short(minter)}`,
    );
  }

  // ③ One transaction, all-or-nothing; decoded_json only, nothing else.
  if (!write) {
    console.log(
      `DRY RUN — ${updates.length} row(s) would gain their minter. Re-run with --write to apply.`,
    );
    await pool.end();
    return;
  }
  const client = await pool.connect();
  try {
    await client.query("begin");
    for (const u of updates) {
      const upd = await client.query(
        `update protocol_event_raw
            set decoded_json = decoded_json || jsonb_build_object('minter', $2::text)
          where id = $1
            and stream_key = 'ARCHIVE_MINT'
            and not (decoded_json ? 'minter')`,
        [u.id, u.minter],
      );
      if (upd.rowCount !== 1) {
        throw new Error(`row id=${u.id}: update affected ${upd.rowCount} rows — ROLLING BACK`);
      }
    }
    const remaining = await client.query(
      `select count(*)::int as n from protocol_event_raw
        where chain_id = $1 and stream_key = 'ARCHIVE_MINT'
          and not (decoded_json ? 'minter')`,
      [EXPECTED_CHAIN_ID],
    );
    if (remaining.rows[0].n !== 0) {
      throw new Error(
        `post-write verification failed: ${remaining.rows[0].n} row(s) still missing minter — ROLLING BACK`,
      );
    }
    await client.query("commit");
    console.log(
      `BACKFILL COMPLETE — ${updates.length} row(s) restored from the chain's own logs; the archive record speaks whole.`,
    );
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
