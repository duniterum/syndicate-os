/**
 * Event Backbone — PROTOCOL-EVENT SCAN LANE (M4-c; convergence fix after the
 * first prod run's measured 403 rate-limit — Replit diagnosis, founder relay).
 * ---------------------------------------------------------------------------
 * The backbone's second lane: SYN burns (Proof of Burn) + Source Registry
 * lifecycle, scanned unattended with the origin scanner's doctrine ported
 * onto the backbone's discipline:
 *
 *   - INCREMENTAL CURSOR from the pinned canon block, never a lookback window
 *     (Proof of Burn #001 sits at block 87,703,847, far behind the head — a
 *     window would age it out; the cursor never does).
 *   - PER-CHUNK CURSOR PERSISTENCE (the convergence law, same as the sale
 *     lane): the cursor advances after EVERY persisted chunk, so a mid-scan
 *     rate-limit cut resumes exactly where it stopped — the lane converges
 *     across cycles even when the provider throttles it.
 *   - BLOCK BUDGET PER CYCLE: at most PROTOCOL_SCAN_MAX_BLOCKS_PER_CYCLE
 *     blocks advance per stream per cycle, with a small inter-chunk delay —
 *     the catch-up is paced instead of hammering the RPC into a 403.
 *   - REORG OVERLAP: every resume re-scans the last 50 blocks (origin P4a);
 *     inserts are idempotent, so the overlap can never duplicate.
 *   - GAPLESS BY CONSTRUCTION: the cursor only ever advances past persisted
 *     chunks and the scan is strictly sequential from the pinned block, so
 *     the persisted history can never contain a hole. Proof-of-Burn
 *     numbering is therefore always valid on persisted rows — up to the
 *     cursor, which the projections state honestly as the lane's coverage.
 *   - ONE LIFECYCLE PASS: the three registry events scan as a single
 *     topic0 OR-list pass (eth_getLogs array semantics) — a third of the
 *     calls the first version made.
 *   - FAIL-CLOSED DECODE: a malformed log throws; nothing is guessed.
 *   - NEVER THROWS ACROSS STREAMS: one stream's failure is recorded in its
 *     summary + cursor and must not kill the other stream or the cycle's
 *     serving state (the runner isolates the lane).
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
/**
 * Catch-up pacing (the convergence budget): at most this many blocks advance
 * per stream per cycle (~200 getLogs at CHUNK=2000), with a small delay
 * between calls. The ~3.1M-block cold catch-up converges in ~8 cycles
 * (~40 min at the 5-min cadence) instead of 403-looping forever.
 */
export const PROTOCOL_SCAN_MAX_BLOCKS_PER_CYCLE = 400_000;
export const PROTOCOL_SCAN_CHUNK_DELAY_MS = 150;

// ── Shapes shared with backboneDb / the read-model / the runner ─────────────
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
  /** The cursor after this cycle — the lane's honest coverage bound. */
  cursorBlock: number | null;
  /** True when the cursor reached the cycle's head (the lane is caught up). */
  caughtUp: boolean;
  chunksScanned: number;
  logsSeen: number;
  rowsInserted: number;
  status: "ok" | "error";
  /** Redaction happens at the runner before this ever reaches status output. */
  error: string | null;
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
  if (typeof topic !== "string" || !/^0x0{24}[0-9a-fA-F]{40}$/.test(topic)) {
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

// ── Decoders (fail-closed; a stream scans exactly its own filtered events,
//    so an undecodable log is a fault, never a skip). ────────────────────────
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    const t = setTimeout(resolve, ms);
    if (typeof t.unref === "function") t.unref();
  });
}

// ── The scan ─────────────────────────────────────────────────────────────────
/**
 * Advance both protocol-event streams toward `head`, within this cycle's
 * block budget. NEVER throws: each stream's outcome (including a mid-scan
 * rate-limit cut) is recorded in its summary and its cursor — the persisted
 * prefix is always gapless and the next cycle resumes from the exact cut.
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
      cursorBlock: null,
      caughtUp: false,
      chunksScanned: 0,
      logsSeen: 0,
      rowsInserted: 0,
      status: "ok",
      error: null,
    };
    summaries.push(summary);

    // One cursor per stream (eventName "*" — the topics filter IS the event
    // selection; the lifecycle events share one OR-list pass).
    const cursor = await getProtocolCursor(
      EXPECTED_CHAIN_ID,
      target.streamKey,
      "*",
    ).catch(() => null);
    const resumeFrom =
      cursor === null
        ? target.fromBlock
        : Math.max(
            target.fromBlock,
            cursor.lastScannedBlock + 1 - PROTOCOL_REORG_OVERLAP,
          );
    summary.scannedFrom = resumeFrom;
    summary.cursorBlock = cursor?.lastScannedBlock ?? null;

    // This cycle's budget: converge in paced steps, never hammer the RPC.
    const budgetEnd = Math.min(
      head,
      resumeFrom + PROTOCOL_SCAN_MAX_BLOCKS_PER_CYCLE - 1,
    );

    const topics: readonly (string | readonly string[] | null)[] =
      target.streamKey === "SYN_BURN"
        ? [TRANSFER_TOPIC0, null, addressToTopic(burnAddress)]
        : [Object.values(LIFECYCLE_TOPIC0)];
    const decode =
      target.streamKey === "SYN_BURN"
        ? (log: RawLogEntry) => decodeBurnLog(log, burnAddress)
        : decodeLifecycleLog;

    try {
      for (
        let start = Math.min(resumeFrom, budgetEnd);
        start <= budgetEnd;
        start += PROTOCOL_SCAN_CHUNK
      ) {
        const end = Math.min(start + PROTOCOL_SCAN_CHUNK - 1, budgetEnd);
        const logs = await ethGetLogs(transport, {
          address: target.address,
          fromBlock: start,
          toBlock: end,
          topic0: typeof topics[0] === "string" ? topics[0] : "",
          topics,
        });
        summary.chunksScanned += 1;
        summary.logsSeen += logs.length;
        if (logs.length > 0) {
          summary.rowsInserted += await insertProtocolEvents(logs.map(decode));
        }
        // THE CONVERGENCE LAW: persist the cursor after EVERY chunk — a cut
        // (rate limit, restart) resumes exactly here; the prefix is gapless.
        await upsertProtocolCursor({
          chainId: EXPECTED_CHAIN_ID,
          streamKey: target.streamKey,
          eventName: "*",
          fromBlock: target.fromBlock,
          lastScannedBlock: end,
          status: end >= head ? "complete" : "catching-up",
          lastError: null,
        });
        summary.cursorBlock = end;
        if (end < budgetEnd) await sleep(PROTOCOL_SCAN_CHUNK_DELAY_MS);
      }
      summary.caughtUp = summary.cursorBlock !== null && summary.cursorBlock >= head;
    } catch (err) {
      // The cursor already sits at the last PERSISTED chunk — record the
      // fault and move on to the next stream; the runner isolates the lane.
      summary.status = "error";
      summary.error = err instanceof Error ? err.message : String(err);
      await upsertProtocolCursor({
        chainId: EXPECTED_CHAIN_ID,
        streamKey: target.streamKey,
        eventName: "*",
        fromBlock: target.fromBlock,
        lastScannedBlock: summary.cursorBlock ?? target.fromBlock - 1,
        status: "error",
        lastError: summary.error.slice(0, 200),
      }).catch(() => {
        /* cursor bookkeeping failure never masks the scan error */
      });
    }
  }

  return summaries;
}
