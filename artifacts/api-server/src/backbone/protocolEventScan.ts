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
  // H1a (⑯) — transcribed VERBATIM from SourceRegistryV1.sol: wallet
  // rotations are public administrative acts; there are no silent edits.
  SourceWalletUpdated: "SourceWalletUpdated(bytes32,address,address)",
  SourcePayoutWalletUpdated: "SourcePayoutWalletUpdated(bytes32,address,address)",
};

// ── H1a — THE COMPLETE HEARTBEAT ARC event pins (verbatim; self-checked) ─────
// LP pair (TraderJoe V1, a UniswapV2 fork — standard pair events):
const LP_MINT_SIGNATURE = "Mint(address,uint256,uint256)";
const LP_BURN_SIGNATURE = "Burn(address,uint256,uint256,address)";
// ERC-1155 (Archive): a mint is a TransferSingle whose `from` is the zero
// address (topic-filtered — holder-to-holder transfers never enter the lane).
const ERC1155_TRANSFER_SINGLE_SIGNATURE =
  "TransferSingle(address,address,address,uint256,uint256)";
// OpenZeppelin Pausable (Archive): ceremonial founder acts.
const PAUSED_SIGNATURE = "Paused(address)";
const UNPAUSED_SIGNATURE = "Unpaused(address)";

const LP_MINT_TOPIC0 = toEventSelector(LP_MINT_SIGNATURE);
const LP_BURN_TOPIC0 = toEventSelector(LP_BURN_SIGNATURE);
const ERC1155_TRANSFER_SINGLE_TOPIC0 = toEventSelector(
  ERC1155_TRANSFER_SINGLE_SIGNATURE,
);
const PAUSED_TOPIC0 = toEventSelector(PAUSED_SIGNATURE);
const UNPAUSED_TOPIC0 = toEventSelector(UNPAUSED_SIGNATURE);
const ZERO_ADDRESS_TOPIC = "0x" + "0".repeat(64);

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
  /** H1a (⑧): the new rate on SourceTermsUpdated rows (a bps, never an address). */
  commissionBps?: number | null;
}

// ── H1a — narrow row projections for the new lanes (loader → read-model) ────
export interface RawLpLiquidityRowInput {
  eventName: "Mint" | "Burn";
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
  /** token0 = SYN, exact raw 18-decimal base units. */
  amount0Raw: string;
  /** token1 = USDC, exact raw 6-decimal base units. */
  amount1Raw: string;
  /** SERVER-ONLY (Burn rows): translated to Founder/Community, never emitted. */
  withdrawer?: string | null;
}

export interface RawLpTokenMintRowInput {
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
  /** SERVER-ONLY: the depositor behind a same-tx pool Mint (label source). */
  depositor: string;
}

export interface RawArchiveMintRowInput {
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
  artifactId: number;
  quantityRaw: string;
}

export interface RawArchivePauseRowInput {
  eventName: "Paused" | "Unpaused";
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
}

// ── H2-⑦ — treasury-movement row (loader → read-model) ──────────────────────
export interface RawTreasuryRowInput {
  /** Which token contract emitted the Transfer (derived from the streamKey). */
  token: "USDC" | "SYN";
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
  /** SERVER-ONLY — the read-model translates organ addresses to LABELS and
   *  an external counterparty to "external"; no address ever leaves. */
  fromAddress: string;
  toAddress: string;
  /** Exact raw base units (USDC 6-dec / SYN 18-dec), decimal string. */
  valueRaw: string;
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

/** data → fixed 32-byte words (fail-closed on shape). */
function dataToWords(data: unknown, minWords: number, label: string): string[] {
  if (typeof data !== "string" || !/^0x([0-9a-fA-F]{64})+$/.test(data)) {
    throw new Error(`${label}: data is not whole 32-byte words`);
  }
  const words: string[] = [];
  for (let i = 2; i < data.length; i += 64) words.push("0x" + data.slice(i, i + 64));
  if (words.length < minWords) {
    throw new Error(`${label}: fewer data words than the event requires`);
  }
  return words;
}

function decodeLifecycleLog(log: RawLogEntry): ProtocolEventRecord {
  const topics = Array.isArray(log.topics) ? log.topics : [];
  const t0 = typeof topics[0] === "string" ? topics[0] : "";
  const eventName = LIFECYCLE_NAME_BY_TOPIC0[t0];
  if (!eventName) {
    throw new Error("lifecycle log: unknown topic0");
  }
  // H1a (⑧): SourceTermsUpdated's FIRST data word is the new commissionBps —
  // the ladder-promotion fact (a rate, never an address). Stored so the
  // read-model can speak "a source rose to {rung}" (§8 RESERVED, authorized).
  const decodedJson: Record<string, unknown> =
    eventName === "SourceTermsUpdated"
      ? { commissionBps: Number(BigInt(dataToWords(log.data, 1, "SourceTermsUpdated")[0])) }
      : {};
  return {
    chainId: EXPECTED_CHAIN_ID,
    streamKey: "SOURCE_LIFECYCLE",
    eventName,
    blockNumber: parseHexNumber(log.blockNumber, "log.blockNumber"),
    blockHash: typeof log.blockHash === "string" ? log.blockHash.toLowerCase() : null,
    transactionHash: parseTxHash(log.transactionHash),
    logIndex: parseHexNumber(log.logIndex, "log.logIndex"),
    topic0: t0,
    decodedJson,
  };
}

// ── H1a decoders (fail-closed, address discipline per stream) ────────────────
function decodeLpLiquidityLog(log: RawLogEntry): ProtocolEventRecord {
  const topics = Array.isArray(log.topics) ? log.topics : [];
  const t0 = typeof topics[0] === "string" ? topics[0] : "";
  const isMint = t0 === LP_MINT_TOPIC0;
  const isBurn = t0 === LP_BURN_TOPIC0;
  if (!isMint && !isBurn) throw new Error("lp log: unknown topic0");
  const words = dataToWords(log.data, 2, "lp liquidity");
  const decodedJson: Record<string, unknown> = {
    // NEUTRAL amounts, in the pair's own token0/token1 order — orientation
    // (which is SYN) is decided at the read-model from the pinned canon fact
    // (H1a-fix: the real pair's token0 is USDC; never assume an order here).
    amount0Raw: BigInt(words[0]).toString(10),
    amount1Raw: BigInt(words[1]).toString(10),
  };
  if (isBurn) {
    // Burn(sender, amount0, amount1, to indexed): `to` is the WITHDRAWER —
    // SERVER-ONLY; the read-model translates it to Founder/Community.
    decodedJson.withdrawer = topicToAddress(topics[2]);
  }
  return {
    chainId: EXPECTED_CHAIN_ID,
    streamKey: "LP_LIQUIDITY",
    eventName: isMint ? "Mint" : "Burn",
    blockNumber: parseHexNumber(log.blockNumber, "log.blockNumber"),
    blockHash: typeof log.blockHash === "string" ? log.blockHash.toLowerCase() : null,
    transactionHash: parseTxHash(log.transactionHash),
    logIndex: parseHexNumber(log.logIndex, "log.logIndex"),
    topic0: t0,
    decodedJson,
  };
}

function decodeLpTokenMintLog(log: RawLogEntry): ProtocolEventRecord {
  const topics = Array.isArray(log.topics) ? log.topics : [];
  if (topics.length !== 3 || topics[0] !== TRANSFER_TOPIC0) {
    throw new Error("lp token mint log: unexpected topics shape");
  }
  if (topics[1] !== ZERO_ADDRESS_TOPIC) {
    throw new Error("lp token mint log: from is not the zero address");
  }
  return {
    chainId: EXPECTED_CHAIN_ID,
    streamKey: "LP_TOKEN_MINT",
    eventName: "Transfer",
    blockNumber: parseHexNumber(log.blockNumber, "log.blockNumber"),
    blockHash: typeof log.blockHash === "string" ? log.blockHash.toLowerCase() : null,
    transactionHash: parseTxHash(log.transactionHash),
    logIndex: parseHexNumber(log.logIndex, "log.logIndex"),
    topic0: TRANSFER_TOPIC0,
    // SERVER-ONLY: the depositor behind a same-tx pool Mint — the label's
    // source, translated Founder/Community by the read-model, never emitted.
    decodedJson: { depositor: topicToAddress(topics[2]) },
  };
}

function decodeArchiveMintLog(log: RawLogEntry): ProtocolEventRecord {
  const topics = Array.isArray(log.topics) ? log.topics : [];
  if (topics.length !== 4 || topics[0] !== ERC1155_TRANSFER_SINGLE_TOPIC0) {
    throw new Error("archive mint log: unexpected topics shape");
  }
  if (topics[2] !== ZERO_ADDRESS_TOPIC) {
    throw new Error("archive mint log: from is not the zero address");
  }
  const words = dataToWords(log.data, 2, "archive mint");
  const artifactId = Number(BigInt(words[0]));
  if (!Number.isSafeInteger(artifactId) || artifactId < 0) {
    throw new Error("archive mint log: artifact id is not a safe integer");
  }
  // The minter (topics[3]) is a MEMBER wallet — deliberately NOT stored:
  // the line needs no label, so the address never even enters the row.
  return {
    chainId: EXPECTED_CHAIN_ID,
    streamKey: "ARCHIVE_MINT",
    eventName: "TransferSingle",
    blockNumber: parseHexNumber(log.blockNumber, "log.blockNumber"),
    blockHash: typeof log.blockHash === "string" ? log.blockHash.toLowerCase() : null,
    transactionHash: parseTxHash(log.transactionHash),
    logIndex: parseHexNumber(log.logIndex, "log.logIndex"),
    topic0: ERC1155_TRANSFER_SINGLE_TOPIC0,
    decodedJson: { artifactId, quantityRaw: BigInt(words[1]).toString(10) },
  };
}

// H2-⑦ — treasury Transfer decoder. Returns null (a DELIBERATE yield, not a
// skip of an undecodable log) for exactly one boundary: a SYN transfer whose
// recipient is the canonical burn address belongs to the SYN_BURN lane — the
// numbered Proof of Burn record stays sovereign over the (chain, tx, logIndex)
// unique key, and the Fold Law would fold the treasury view anyway (the burn
// line narrates that transaction). Everything else decodes fail-closed.
function decodeTreasuryLog(
  log: RawLogEntry,
  streamKey: string,
  synBurnAddress: string,
): ProtocolEventRecord | null {
  const topics = Array.isArray(log.topics) ? log.topics : [];
  if (topics.length !== 3 || topics[0] !== TRANSFER_TOPIC0) {
    throw new Error("treasury log: unexpected topics shape");
  }
  const from = topicToAddress(topics[1]);
  const to = topicToAddress(topics[2]);
  if (streamKey.startsWith("TREASURY_SYN") && to === synBurnAddress.toLowerCase()) {
    return null; // the burn lane owns this log — yield, never displace
  }
  return {
    chainId: EXPECTED_CHAIN_ID,
    streamKey,
    eventName: "Transfer",
    blockNumber: parseHexNumber(log.blockNumber, "log.blockNumber"),
    blockHash: typeof log.blockHash === "string" ? log.blockHash.toLowerCase() : null,
    transactionHash: parseTxHash(log.transactionHash),
    logIndex: parseHexNumber(log.logIndex, "log.logIndex"),
    topic0: TRANSFER_TOPIC0,
    // SERVER-ONLY: organ membership + labels are decided in the read-model.
    decodedJson: { from, to, valueRaw: dataToUint256Decimal(log.data) },
  };
}

function decodeArchivePauseLog(log: RawLogEntry): ProtocolEventRecord {
  const topics = Array.isArray(log.topics) ? log.topics : [];
  const t0 = typeof topics[0] === "string" ? topics[0] : "";
  if (t0 !== PAUSED_TOPIC0 && t0 !== UNPAUSED_TOPIC0) {
    throw new Error("archive pause log: unknown topic0");
  }
  return {
    chainId: EXPECTED_CHAIN_ID,
    streamKey: "ARCHIVE_PAUSE",
    eventName: t0 === PAUSED_TOPIC0 ? "Paused" : "Unpaused",
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

    // Per-stream topic filter + fail-closed decoder (H1a: the map replaced
    // the two-stream ternary; every stream stays a single getLogs pass).
    // H2-⑦: the three routing organs as topic-filter values (OR within one
    // topic position — eth_getLogs array semantics; server-only addresses).
    const organTopics = [
      addressToTopic(FINANCIAL_TARGETS.vaultWallet),
      addressToTopic(FINANCIAL_TARGETS.liquidityWallet),
      addressToTopic(FINANCIAL_TARGETS.operationsWallet),
    ];
    const STREAM_CONFIG: Record<
      string,
      {
        topics: readonly (string | readonly string[] | null)[];
        /** null = a deliberate, documented yield to another lane. */
        decode: (log: RawLogEntry) => ProtocolEventRecord | null;
      }
    > = {
      SYN_BURN: {
        topics: [TRANSFER_TOPIC0, null, addressToTopic(burnAddress)],
        decode: (log: RawLogEntry) => decodeBurnLog(log, burnAddress),
      },
      SOURCE_LIFECYCLE: {
        topics: [Object.values(LIFECYCLE_TOPIC0)],
        decode: decodeLifecycleLog,
      },
      LP_LIQUIDITY: {
        topics: [[LP_MINT_TOPIC0, LP_BURN_TOPIC0]],
        decode: decodeLpLiquidityLog,
      },
      LP_TOKEN_MINT: {
        topics: [TRANSFER_TOPIC0, ZERO_ADDRESS_TOPIC],
        decode: decodeLpTokenMintLog,
      },
      ARCHIVE_MINT: {
        topics: [ERC1155_TRANSFER_SINGLE_TOPIC0, null, ZERO_ADDRESS_TOPIC],
        decode: decodeArchiveMintLog,
      },
      ARCHIVE_PAUSE: {
        topics: [[PAUSED_TOPIC0, UNPAUSED_TOPIC0]],
        decode: decodeArchivePauseLog,
      },
      // H2-⑦ — treasury movements (scan AFTER SYN_BURN by target order; the
      // burn row always wins the unique key, and the SYN decoders yield
      // burn-address logs entirely).
      TREASURY_USDC_IN: {
        topics: [TRANSFER_TOPIC0, null, organTopics],
        decode: (log: RawLogEntry) =>
          decodeTreasuryLog(log, "TREASURY_USDC_IN", burnAddress),
      },
      TREASURY_USDC_OUT: {
        topics: [TRANSFER_TOPIC0, organTopics],
        decode: (log: RawLogEntry) =>
          decodeTreasuryLog(log, "TREASURY_USDC_OUT", burnAddress),
      },
      TREASURY_SYN_IN: {
        topics: [TRANSFER_TOPIC0, null, organTopics],
        decode: (log: RawLogEntry) =>
          decodeTreasuryLog(log, "TREASURY_SYN_IN", burnAddress),
      },
      TREASURY_SYN_OUT: {
        topics: [TRANSFER_TOPIC0, organTopics],
        decode: (log: RawLogEntry) =>
          decodeTreasuryLog(log, "TREASURY_SYN_OUT", burnAddress),
      },
    };
    const config = STREAM_CONFIG[target.streamKey];
    if (!config) {
      summary.status = "error";
      summary.error = `no stream config for ${target.streamKey} (fail closed)`;
      continue;
    }
    const topics = config.topics;
    const decode = config.decode;

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
          // A null decode is a DELIBERATE yield to another lane (H2-⑦: the
          // burn lane owns SYN transfers to the burn address) — filtered,
          // never persisted from this stream. Undecodable logs still throw.
          const records = logs
            .map(decode)
            .filter((r): r is ProtocolEventRecord => r !== null);
          if (records.length > 0) {
            summary.rowsInserted += await insertProtocolEvents(records);
          }
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
