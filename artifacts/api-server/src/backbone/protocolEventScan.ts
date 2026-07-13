/**
 * Event Backbone — PROTOCOL-EVENT SCAN LANE (M4-c, founder GO).
 * --------------------------------------------------------------
 * The backbone's second lane: SYN burns (Proof of Burn) + Source Registry
 * lifecycle, scanned unattended with the origin scanner's doctrine ported
 * onto the backbone's discipline:
 *
 *   - INCREMENTAL CURSOR from the pinned canon block, never a lookback window
 *     (Proof of Burn #001 sits at block 87,703,847, far behind the head — a
 *     window would age it out; the cursor never does).
 *   - REORG OVERLAP: every resume re-scans the last 50 blocks (origin P4a);
 *     inserts are idempotent, so the overlap can never duplicate.
 *   - GAPLESS BY CONSTRUCTION: the cursor advances only past fully persisted
 *     chunks; a failed chunk aborts the stream WITHOUT advancing, so the
 *     persisted history can never contain a hole. Proof-of-Burn numbering is
 *     therefore always valid on persisted rows — the origin's PARTIAL state
 *     is structurally impossible server-side.
 *   - TOPIC-FILTERED getLogs: burns are `Transfer(_, burnAddress, _)` filtered
 *     server-side by topics, so the scan is sparse (no adaptive splitter
 *     needed — the proven sale engine stays untouched).
 *   - FAIL-CLOSED DECODE: a malformed log throws; nothing is guessed.
 *
 * Signatures transcribed VERBATIM from today's repo (the studio feed spine,
 * itself transcribed from the deployed .sol) and SELF-CHECKED at module load:
 * toEventSelector(signature) must equal the pinned topic0 or the module throws.
 */

import { toEventSelector } from "viem";
import type { RpcTransport } from "../lib/protocol/rpcTransport";
import { EXPECTED_CHAIN_ID } from "../lib/protocol/rpcTransport";
import { ethGetLogs, type RawLogEntry } from "../lib/protocol/evmRead";
import {
  PROTOCOL_EVENT_SCAN_TARGETS,
  FINANCIAL_TARGETS,
} from "../data/protocolTargets";
import {
  getProtocolCursor,
  insertProtocolEvents,
  upsertProtocolCursor,
} from "./backboneDb";

// ── Event pins (verbatim; self-checked below) ────────────────────────────────
const TRANSFER_SIGNATURE = "Transfer(address,address,uint256)";
const TRANSFER_TOPIC0 =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const LIFECYCLE_SIGNATURES: Record<string, string> = {
  SourceCreated:
    "SourceCreated(bytes32,address,uint8,uint16,uint8,uint8,address,bytes32)",
  SourceTermsUpdated:
    "SourceTermsUpdated(bytes32,address,uint8,uint16,uint8,uint64,uint64,uint256,uint256,bool,address,bytes32)",
  SourceStatusChanged: "SourceStatusChanged(bytes32,uint8,uint8)",
};

// SELF-CHECK: the transcribed Transfer signature must reproduce the pinned
// topic0 — a drifted transcription throws at load, never scans wrong events.
if (toEventSelector(TRANSFER_SIGNATURE) !== TRANSFER_TOPIC0) {
  throw new Error(
    "protocolEventScan: Transfer signature drifted from the pinned topic0",
  );
}
const LIFECYCLE_TOPIC0: Record<string, string> = Object.fromEntries(
  Object.entries(LIFECYCLE_SIGNATURES).map(([name, sig]) => [
    name,
    toEventSelector(sig as `${string}(${string})`),
  ]),
);
const LIFECYCLE_NAME_BY_TOPIC0: Record<string, string> = Object.fromEntries(
  Object.entries(LIFECYCLE_TOPIC0).map(([name, t0]) => [t0, name]),
);

/** Fixed chunk (topic-filtered streams are sparse) + origin reorg overlap. */
export const PROTOCOL_SCAN_CHUNK = 2000;
export const PROTOCOL_REORG_OVERLAP = 50;

// ── Shapes shared with backboneDb / the read-model ──────────────────────────
export interface ProtocolCursorState {
  fromBlock: number;
  lastScannedBlock: number;
  status: string;
  lastError: string | null;
}

export interface ProtocolEventRecord {
  chainId: number;
  streamKey: string;
  eventName: string;
  blockNumber: number;
  blockHash: string | null;
  transactionHash: string;
  logIndex: number;
  topic0: string;
  /** SERVER-ONLY decoded fields (burn rows carry the sender). Never emitted. */
  decodedJson: Record<string, unknown>;
}

export interface RawBurnRowInput {
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
  /** SERVER-ONLY — translated to a Founder/Community label by the read-model. */
  fromAddress: string;
  /** Exact raw 18-decimal base units, decimal string. */
  valueRaw: string;
}

export interface RawLifecycleRowInput {
  eventName: string;
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
}

export interface ProtocolScanStreamSummary {
  streamKey: string;
  scannedFrom: number | null;
  scannedTo: number | null;
  chunksScanned: number;
  logsSeen: number;
  rowsInserted: number;
  status: "ok" | "error";
}

// ── Fail-closed log field parsing ────────────────────────────────────────────
function parseHexNumber(value: unknown, label: string): number {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]+$/.test(value)) {
    throw new Error(`${label}: not a hex quantity`);
  }
  const n = Number.parseInt(value, 16);
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new Error(`${label}: not a safe non-negative integer`);
  }
  return n;
}

function parseTxHash(value: unknown): string {
  if (typeof value !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(value)) {
    throw new Error("log.transactionHash: not transaction-shaped");
  }
  return value.toLowerCase();
}

/** topic → the 20-byte address it right-pads (fail-closed). */
function topicToAddress(topic: unknown): string {
  if (
    typeof topic !== "string" ||
    !/^0x0{24}[0-9a-fA-F]{40}$/.test(topic)
  ) {
    throw new Error("topic: not an address-carrying topic");
  }
  return ("0x" + topic.slice(26)).toLowerCase();
}

/** Left-pad an address into a 32-byte topic filter value. */
export function addressToTopic(address: string): string {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error("addressToTopic: not a 20-byte address");
  }
  return "0x" + "0".repeat(24) + address.slice(2).toLowerCase();
}

/** data → exact uint256 decimal string (fail-closed). */
function dataToUint256Decimal(data: unknown): string {
  if (typeof data !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(data)) {
    throw new Error("log.data: not a single uint256 word");
  }
  return BigInt(data).toString(10);
}

// ── Decoders (fail-closed; skip-never-guess is NOT allowed here — a stream
//    scans exactly its own filtered events, so an undecodable log is a fault). ──
function decodeBurnLog(log: RawLogEntry, burnAddress: string): ProtocolEventRecord {
  const topics = Array.isArray(log.topics) ? log.topics : [];
  if (topics.length !== 3 || topics[0] !== TRANSFER_TOPIC0) {
    throw new Error("burn log: unexpected topics shape");
  }
  const to = topicToAddress(topics[2]);
  if (to !== burnAddress.toLowerCase()) {
    throw new Error("burn log: recipient is not the burn address");
  }
  const from = topicToAddress(topics[1]);
  return {
    chainId: EXPECTED_CHAIN_ID,
    streamKey: "SYN_BURN",
    eventName: "Transfer",
    blockNumber: parseHexNumber(log.blockNumber, "log.blockNumber"),
    blockHash: typeof log.blockHash === "string" ? log.blockHash.toLowerCase() : null,
    transactionHash: parseTxHash(log.transactionHash),
    logIndex: parseHexNumber(log.logIndex, "log.logIndex"),
    topic0: TRANSFER_TOPIC0,
    decodedJson: { from, valueRaw: dataToUint256Decimal(log.data) },
  };
}

function decodeLifecycleLog(log: RawLogEntry): ProtocolEventRecord {
  const topics = Array.isArray(log.topics) ? log.topics : [];
  const t0 = typeof topics[0] === "string" ? topics[0] : "";
  const eventName = LIFECYCLE_NAME_BY_TOPIC0[t0];
  if (!eventName) {
    throw new Error("lifecycle log: unknown topic0");
  }
  return {
    chainId: EXPECTED_CHAIN_ID,
    streamKey: "SOURCE_LIFECYCLE",
    eventName,
    blockNumber: parseHexNumber(log.blockNumber, "log.blockNumber"),
    blockHash: typeof log.blockHash === "string" ? log.blockHash.toLowerCase() : null,
    transactionHash: parseTxHash(log.transactionHash),
    logIndex: parseHexNumber(log.logIndex, "log.logIndex"),
    topic0: t0,
    decodedJson: {},
  };
}

// ── The scan ─────────────────────────────────────────────────────────────────
/**
 * Scan both protocol-event streams incrementally through `head`. Cursor
 * discipline: each chunk is persisted before the cursor advances past it; a
 * failure aborts the stream with its cursor at the last good block and the
 * cycle fails closed (the runner records it; the next cycle resumes).
 */
export async function runProtocolEventScan(
  transport: RpcTransport,
  head: number,
): Promise<ProtocolScanStreamSummary[]> {
  const burnAddress = FINANCIAL_TARGETS.synBurnAddress;
  const summaries: ProtocolScanStreamSummary[] = [];

  for (const target of PROTOCOL_EVENT_SCAN_TARGETS) {
    const summary: ProtocolScanStreamSummary = {
      streamKey: target.streamKey,
      scannedFrom: null,
      scannedTo: null,
      chunksScanned: 0,
      logsSeen: 0,
      rowsInserted: 0,
      status: "ok",
    };
    summaries.push(summary);

    // One cursor per stream (eventName "*" — the stream's topics filter is
    // the event selection; per-event cursors would triple the burn scan).
    const cursor = await getProtocolCursor(
      EXPECTED_CHAIN_ID,
      target.streamKey,
      "*",
    );
    const resumeFrom =
      cursor === null
        ? target.fromBlock
        : Math.max(
            target.fromBlock,
            cursor.lastScannedBlock + 1 - PROTOCOL_REORG_OVERLAP,
          );
    summary.scannedFrom = resumeFrom;

    try {
      if (target.streamKey === "SYN_BURN") {
        // Topic-filtered to the burn recipient server-side: sparse by design.
        const burnTopics = [TRANSFER_TOPIC0, null, addressToTopic(burnAddress)];
        await scanStream(transport, target.address, burnTopics, resumeFrom, head, summary, (log) =>
          decodeBurnLog(log, burnAddress),
        );
      } else {
        // Lifecycle: three sparse per-event passes over the same range share
        // ONE stream cursor (advanced only after all three pass per chunk —
        // implemented as sequential whole-range passes, then one cursor write).
        let inserted = 0;
        let seen = 0;
        for (const name of target.events) {
          const t0 = LIFECYCLE_TOPIC0[name];
          if (!t0) throw new Error(`no pinned topic0 for "${name}"`);
          const passSummary: ProtocolScanStreamSummary = { ...summary, chunksScanned: 0, logsSeen: 0, rowsInserted: 0 };
          await scanStream(transport, target.address, [t0], resumeFrom, head, passSummary, decodeLifecycleLog);
          inserted += passSummary.rowsInserted;
          seen += passSummary.logsSeen;
          summary.chunksScanned += passSummary.chunksScanned;
        }
        summary.logsSeen = seen;
        summary.rowsInserted = inserted;
      }
      summary.scannedTo = head;
      await upsertProtocolCursor({
        chainId: EXPECTED_CHAIN_ID,
        streamKey: target.streamKey,
        eventName: "*",
        fromBlock: target.fromBlock,
        lastScannedBlock: head,
        status: "ok",
        lastError: null,
      });
    } catch (err) {
      summary.status = "error";
      const message = err instanceof Error ? err.message : String(err);
      await upsertProtocolCursor({
        chainId: EXPECTED_CHAIN_ID,
        streamKey: target.streamKey,
        eventName: "*",
        fromBlock: target.fromBlock,
        lastScannedBlock: cursor?.lastScannedBlock ?? target.fromBlock - 1,
        status: "error",
        lastError: message.slice(0, 200),
      }).catch(() => {
        /* cursor bookkeeping failure never masks the scan error */
      });
      throw new Error(
        `protocol-event stream ${target.streamKey} failed: ${message}`,
      );
    }
  }

  return summaries;
}

async function scanStream(
  transport: RpcTransport,
  address: string,
  topics: readonly (string | null)[],
  fromBlock: number,
  head: number,
  summary: ProtocolScanStreamSummary,
  decode: (log: RawLogEntry) => ProtocolEventRecord,
): Promise<void> {
  for (let start = Math.min(fromBlock, head); start <= head; start += PROTOCOL_SCAN_CHUNK) {
    const end = Math.min(start + PROTOCOL_SCAN_CHUNK - 1, head);
    const logs = await ethGetLogs(transport, {
      address,
      fromBlock: start,
      toBlock: end,
      topic0: typeof topics[0] === "string" ? topics[0] : "",
      topics,
    });
    summary.chunksScanned += 1;
    summary.logsSeen += logs.length;
    if (logs.length > 0) {
      const records = logs.map(decode);
      summary.rowsInserted += await insertProtocolEvents(records);
    }
  }
}
