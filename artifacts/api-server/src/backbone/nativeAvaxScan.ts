/**
 * THE NATIVE-AVAX TREASURY LANE — the movements `eth_getLogs` can never see.
 * ---------------------------------------------------------------------------
 * WHY THIS MODULE EXISTS, stated plainly so nobody re-derives it. AVAX is the
 * chain's NATIVE coin. It has no token contract, so a movement of AVAX emits NO
 * event and appears in NO log. Every other treasury lane is an `eth_getLogs`
 * pass over a `Transfer` topic on a pinned contract; that primitive is
 * structurally blind here. The vault's AVAX BALANCE was already read live
 * (`eth_getBalance`), so the holding was visible while every movement that
 * produced it was invisible — a balance with no history.
 *
 * WHAT WAS TRIED AND REJECTED, so it is not tried again:
 *  · The LFJ router's `SwapExactIn` log, which carries a whole swap in one
 *    record and was the DESIGN ON THE BOOKS. Measured against the protocol's
 *    actual AVAX purchase (tx 0x7accfd17…, block 90,460,319): that receipt
 *    carries NO LFJ log at all — it routes through Uniswap-V3-style pools and
 *    ends in a WAVAX unwrap. The planned lane would have shipped and shown
 *    nothing. A design verified against one venue is not a design.
 *  · The WAVAX `Withdrawal` event. In that same receipt the unwrapper is the
 *    aggregator, not the vault, so a vault-keyed filter finds nothing. It is
 *    reliable only when the unwrapping party IS the party we track.
 *  · Balance deltas (`eth_getBalance` at two heights). Refused on doctrine: it
 *    yields a number with no transaction behind it, and this feed publishes
 *    receipt-backed lines only.
 *
 * WHAT WORKS, and why it keeps the honesty contract: the explorer's
 * etherscan-compatible account API returns the wallet's native movements —
 * `txlistinternal` for the internal calls (a swap's AVAX leg arrives this way)
 * and `txlist` for plain value transfers — EACH WITH ITS TRANSACTION HASH. So
 * every line this lane produces still anchors to a transaction anyone can open
 * on Snowtrace. Nothing is inferred, nothing is summed.
 *
 * THE DEPENDENCY IS NEW AND IS TREATED AS SUCH. Until now the api-server made
 * exactly one kind of outbound call: JSON-RPC to the node. This lane adds an
 * HTTP read of an explorer API, so it FAILS CLOSED in every direction — a bad
 * status, a non-"1" body, a malformed row, an out-of-range block, an
 * unparseable amount all THROW. The runner isolates the lane, its cursor stays
 * where it was, and the feed serves what it already had. A lane that cannot
 * read invents nothing.
 *
 * BACKFILL MODE: index — native AVAX emits no log at all, so eth_getLogs is
 * structurally blind to it and only an account API can see internal value
 * transfers. (CHAIN_READING_DOCTRINE §4.)
 */

import type { ProtocolEventRecord } from "./protocolEventScan";
import { EXPLORER_ACCOUNT_API, EXPLORER_PAGE_SIZE } from "./explorerIndex";
import { PROTOCOL_SCAN_FLOOR_BLOCK } from "../data/protocolTargets";

/** Chain 43114 — the C-Chain, the only chain this protocol reads. */
const EXPECTED_CHAIN_ID = 43114;

/**
 * THE SYNTHETIC INDEX BASE, and it is a correctness fix, not a formality.
 * ---------------------------------------------------------------------------
 * `insertProtocolEvents` de-duplicates on `(chainId, transactionHash,
 * logIndex)` — the STREAM KEY IS NOT IN THAT KEY. A native movement has no log
 * index, so this lane must synthesise one; and a naive ordinal (0, 1, 2…) would
 * land on the SAME (tx, index) pair as a real log of the same transaction. The
 * insert is `onConflictDoNothing`, so the loser is dropped IN SILENCE — a money
 * row vanishing from a public feed with nothing anywhere saying it did. The
 * protocol's own AVAX purchase is the live example: 23 real logs in the very
 * transaction whose internal transfer we must record.
 *
 * So the synthetic space starts ABOVE anything a real receipt can reach. A log
 * index is per BLOCK, and an Avalanche C-Chain block cannot hold 10^6 logs: at
 * the 375-gas floor per LOG opcode, a 15M-gas block tops out near 40,000. One
 * million leaves a 25× margin and stays far inside a 32-bit integer.
 */
// Exported: the read-model recognises a native row STRUCTURALLY by this
// sentinel (never by its symbol, which an impostor token can claim) to give
// same-transaction swap legs their causal order (2026-07-30).
export const NATIVE_INDEX_BASE = 1_000_000;

/** An etherscan-compatible account-API row, as it arrives (all fields strings). */
interface ExplorerAccountRow {
  readonly blockNumber?: unknown;
  readonly hash?: unknown;
  readonly from?: unknown;
  readonly to?: unknown;
  readonly value?: unknown;
  readonly isError?: unknown;
  readonly traceId?: unknown;
}

export interface NativeAvaxScanInput {
  /** The protocol wallets whose native movements are the protocol's history. */
  readonly organWallets: readonly string[];
  /** Plain value-carrying transactions (`txlist`). */
  readonly plainRows: readonly ExplorerAccountRow[];
  /** Internal calls (`txlistinternal`) — a swap's AVAX leg arrives here. */
  readonly internalRows: readonly ExplorerAccountRow[];
  /** Inclusive scan bounds; a row outside them is a bug in the query, not data. */
  readonly fromBlock: number;
  readonly toBlock: number;
}

function requireString(v: unknown, what: string): string {
  if (typeof v !== "string" || v.length === 0) {
    throw new Error(`native-avax row: ${what} is not a non-empty string`);
  }
  return v;
}

function requireAddress(v: unknown, what: string): string {
  const s = requireString(v, what);
  if (!/^0x[0-9a-fA-F]{40}$/.test(s)) {
    throw new Error(`native-avax row: ${what} is not an address`);
  }
  return s.toLowerCase();
}

function requireTxHash(v: unknown): string {
  const s = requireString(v, "hash");
  if (!/^0x[0-9a-fA-F]{64}$/.test(s)) {
    throw new Error("native-avax row: hash is not a transaction hash");
  }
  return s.toLowerCase();
}

/** Decimal wei, exact. Never a Number — 4.5 AVAX already exceeds 2^53 in wei. */
function requireWei(v: unknown): string {
  const s = requireString(v, "value");
  if (!/^[0-9]+$/.test(s)) {
    throw new Error("native-avax row: value is not decimal base units");
  }
  return s;
}

function requireBlockNumber(v: unknown, fromBlock: number, toBlock: number): number {
  const s = requireString(v, "blockNumber");
  if (!/^[0-9]+$/.test(s)) {
    throw new Error("native-avax row: blockNumber is not decimal");
  }
  const n = Number(s);
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new Error("native-avax row: blockNumber is not a safe integer");
  }
  // The query asked for a window; an answer outside it means the request and
  // the response disagree, and a lane that accepts that has no idea what it
  // covers. Fail rather than widen the cursor's meaning.
  if (n < fromBlock || n > toBlock) {
    throw new Error(
      `native-avax row: block ${n} is outside the requested window ${fromBlock}..${toBlock}`,
    );
  }
  return n;
}

/**
 * Turn the explorer's account rows into treasury records — PURE, so the whole
 * derivation is pinned by fixtures rather than by a live network call.
 *
 * WHAT IS KEPT: a movement whose counterparty side touches one of our organ
 * wallets, with a strictly positive amount, that did not revert. Everything
 * else is dropped — quietly, because it is not ours, and that is not a defect.
 *
 * WHAT IS NEVER DONE: a zero-value row is not a movement (a contract call
 * carrying no AVAX is not treasury history); a reverted internal call moved
 * nothing; and a row is NEVER identified by a symbol or a name from the API
 * response — only by ADDRESS. (An address-poisoning counterfeit already sits in
 * this vault's history; a token or coin is its contract/native identity, never
 * a label a stranger controls.)
 */
export function buildNativeAvaxRecords(
  input: NativeAvaxScanInput,
): ProtocolEventRecord[] {
  const organs = new Set(input.organWallets.map((w) => w.toLowerCase()));
  if (organs.size === 0) {
    throw new Error("native-avax scan: the organ wallet set is empty — refusing to scan");
  }
  if (!Number.isSafeInteger(input.fromBlock) || !Number.isSafeInteger(input.toBlock)) {
    throw new Error("native-avax scan: the block window is not integral");
  }

  const out: ProtocolEventRecord[] = [];

  const touchesUs = (from: string, to: string): boolean =>
    organs.has(from) || organs.has(to);

  // ── plain value transfers (`txlist`) ──────────────────────────────────────
  // One per transaction by construction: a transaction has exactly one top-level
  // value. Index = base + 0, so it can never meet an internal row of the same tx.
  for (const row of input.plainRows) {
    // A contract creation has no `to`; it is not a treasury movement.
    if (typeof row.to !== "string" || row.to.length === 0) continue;
    const value = requireWei(row.value);
    if (value === "0") continue;
    if (row.isError === "1") continue;
    const from = requireAddress(row.from, "from");
    const to = requireAddress(row.to, "to");
    if (!touchesUs(from, to)) continue;
    out.push({
      chainId: EXPECTED_CHAIN_ID,
      streamKey: "TREASURY_AVAX",
      eventName: "NativeTransfer",
      blockNumber: requireBlockNumber(row.blockNumber, input.fromBlock, input.toBlock),
      blockHash: null,
      transactionHash: requireTxHash(row.hash),
      logIndex: NATIVE_INDEX_BASE,
      // The native coin has no event, so there is no topic. An empty string
      // states that honestly; inventing a topic0 would fake a log that the
      // chain never emitted.
      topic0: "",
      // The exact whitelist the loader accepts for a treasury row.
      decodedJson: { from, to, valueRaw: value },
    });
  }

  // ── internal calls (`txlistinternal`) ─────────────────────────────────────
  // A transaction can hold several. The ordinal comes from the trace path
  // SORTED, never from the array's arrival order: the explorer is free to
  // reorder its rows between calls, and an ordinal that moved would produce a
  // second, duplicate row for a movement already recorded — a doubled figure on
  // a public feed. Sorting makes the index a function of the data alone.
  const mine = input.internalRows.filter((row) => {
    if (typeof row.to !== "string" || row.to.length === 0) return false;
    if (row.isError === "1") return false;
    if (requireWei(row.value) === "0") return false;
    return touchesUs(
      requireAddress(row.from, "from"),
      requireAddress(row.to, "to"),
    );
  });
  const byTx = new Map<string, ExplorerAccountRow[]>();
  for (const row of mine) {
    const hash = requireTxHash(row.hash);
    const bucket = byTx.get(hash);
    if (bucket === undefined) byTx.set(hash, [row]);
    else bucket.push(row);
  }
  for (const [hash, rows] of byTx) {
    const ordered = [...rows].sort((a, b) =>
      String(a.traceId ?? "").localeCompare(String(b.traceId ?? "")),
    );
    ordered.forEach((row, ordinal) => {
      out.push({
        chainId: EXPECTED_CHAIN_ID,
        streamKey: "TREASURY_AVAX",
        eventName: "NativeInternalTransfer",
        blockNumber: requireBlockNumber(row.blockNumber, input.fromBlock, input.toBlock),
        blockHash: null,
        transactionHash: hash,
        // +1 keeps the plain row's slot free, so both kinds can coexist in one
        // transaction without ever colliding.
        logIndex: NATIVE_INDEX_BASE + 1 + ordinal,
        topic0: "",
        decodedJson: {
          from: requireAddress(row.from, "from"),
          to: requireAddress(row.to, "to"),
          valueRaw: requireWei(row.value),
        },
      });
    });
  }

  return out;
}


async function fetchAccountRows(
  action: "txlist" | "txlistinternal",
  address: string,
  fromBlock: number,
  toBlock: number,
  timeoutMs: number,
): Promise<ExplorerAccountRow[]> {
  // THE DEFAULT PAGE IS 25 ROWS, AND IT IS SILENT (senior review, 2026-07-27;
  // measured live the same day — a bare query for a wallet with 37 rows
  // returned exactly 25, with status "1" and no indication of truncation).
  // Without an explicit page size the lane would read a prefix of the window,
  // advance its cursor to head, and declare the rest covered: a permanent,
  // invisible hole in a money record. The explicit size plus the check below
  // turn a silent truncation into a loud one.
  const url =
    `${EXPLORER_ACCOUNT_API}?module=account&action=${action}` +
    `&address=${address}&startblock=${fromBlock}&endblock=${toBlock}&sort=asc` +
    `&page=1&offset=${EXPLORER_PAGE_SIZE}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`native-avax ${action}: HTTP ${res.status}`);
    }
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) {
      throw new Error(`native-avax ${action}: body is not an object`);
    }
    const envelope = body as { status?: unknown; message?: unknown; result?: unknown };
    // "No transactions found" answers status "0" with an EMPTY result, and that
    // is a legitimate empty window — not a failure. Any other non-"1" status is.
    if (envelope.status === "0" && Array.isArray(envelope.result) && envelope.result.length === 0) {
      return [];
    }
    if (envelope.status !== "1") {
      throw new Error(
        `native-avax ${action}: explorer status ${String(envelope.status)} (${String(envelope.message)})`,
      );
    }
    if (!Array.isArray(envelope.result)) {
      throw new Error(`native-avax ${action}: result is not an array`);
    }
    // A full page means there may be a SECOND one, and this lane does not page.
    // Failing loudly is the only honest answer: the cursor then stays put and
    // the window is retried, rather than advancing over rows never read.
    if (envelope.result.length >= EXPLORER_PAGE_SIZE) {
      throw new Error(
        `native-avax ${action}: ${envelope.result.length} rows fills the page — the window may be truncated, refusing to advance`,
      );
    }
    return envelope.result as ExplorerAccountRow[];
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Read every organ wallet's native movements in one window. Throws on the first
 * fault so the runner keeps the lane's cursor where it was — a partial answer
 * would leave a hole the cursor would then declare covered, and the gapless
 * guarantee the other lanes hold by construction would be quietly false here.
 */
export async function fetchNativeAvaxRecords(args: {
  readonly organWallets: readonly string[];
  readonly fromBlock: number;
  readonly toBlock: number;
  readonly timeoutMs?: number;
}): Promise<ProtocolEventRecord[]> {
  const timeoutMs = args.timeoutMs ?? 15_000;
  const plainRows: ExplorerAccountRow[] = [];
  const internalRows: ExplorerAccountRow[] = [];
  // AN ORGAN→ORGAN MOVEMENT ANSWERS BOTH WALLETS' QUERIES (senior review,
  // 2026-07-27) — once as the sender's row, once as the recipient's. Left
  // unmerged, the internal-call ordinal (a position within the fetched set)
  // gave the two copies DIFFERENT synthetic indices, so the final
  // `${hash}:${logIndex}` de-duplication could never collapse them and the
  // movement was written TWICE — a doubled figure on a public feed. Merging on
  // the movement's OWN identity, here, is what makes the ordinal deterministic.
  const identity = (r: ExplorerAccountRow): string =>
    [r.hash, r.traceId ?? "", r.from ?? "", r.to ?? "", r.value ?? ""]
      .map((v) => String(v).toLowerCase())
      .join("|");
  const seenPlain = new Set<string>();
  const seenInternal = new Set<string>();
  for (const wallet of args.organWallets) {
    for (const row of await fetchAccountRows("txlist", wallet, args.fromBlock, args.toBlock, timeoutMs)) {
      const k = identity(row);
      if (seenPlain.has(k)) continue;
      seenPlain.add(k);
      plainRows.push(row);
    }
    for (const row of await fetchAccountRows("txlistinternal", wallet, args.fromBlock, args.toBlock, timeoutMs)) {
      const k = identity(row);
      if (seenInternal.has(k)) continue;
      seenInternal.add(k);
      internalRows.push(row);
    }
  }
  // Two organ wallets on both sides of one movement would yield it twice, once
  // per wallet's query. The record set is de-duplicated on the same key the
  // insert uses, HERE, where a duplicate is still visible — rather than letting
  // `onConflictDoNothing` swallow it and report a row count that lies.
  const records = buildNativeAvaxRecords({
    organWallets: args.organWallets,
    plainRows,
    internalRows,
    fromBlock: args.fromBlock,
    toBlock: args.toBlock,
  });
  const seen = new Set<string>();
  return records.filter((r) => {
    const key = `${r.transactionHash}:${r.logIndex}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * The lane's own cycle: resume from its cursor, read the window, persist, and
 * advance — the same convergence law every other lane holds (the cursor only
 * ever moves past PERSISTED rows, so the covered prefix can never contain a
 * hole). NEVER THROWS: a fault is returned in the summary and the cursor stays
 * put, exactly like a log stream's, so one unreachable explorer cannot darken
 * the seat lane or the serving state.
 */
export async function runNativeAvaxScan(args: {
  readonly organWallets: readonly string[];
  readonly head: number;
  readonly deps: {
    getCursor: (streamKey: string) => Promise<{ lastScannedBlock: number } | null>;
    upsertCursor: (input: {
      streamKey: string;
      fromBlock: number;
      lastScannedBlock: number;
      status: string;
      lastError: string | null;
    }) => Promise<unknown>;
    insert: (recs: readonly ProtocolEventRecord[]) => Promise<number>;
    fetchRecords?: typeof fetchNativeAvaxRecords;
  };
}): Promise<{
  streamKey: string;
  rowsInserted: number;
  scannedTo: number;
  status: "ok" | "error";
  error: string | null;
}> {
  const streamKey = "TREASURY_AVAX";
  const summary = {
    streamKey,
    rowsInserted: 0,
    scannedTo: NATIVE_AVAX_FROM_BLOCK,
    status: "ok" as "ok" | "error",
    error: null as string | null,
  };
  try {
    const cursor = await args.deps.getCursor(streamKey).catch(() => null);
    // The same reorg overlap the log lanes use: re-reading a settled window is
    // free because the insert is idempotent on (tx, index), and the synthetic
    // index is a function of the data — so an overlap can never duplicate.
    const resumeFrom =
      cursor === null
        ? NATIVE_AVAX_FROM_BLOCK
        : Math.max(NATIVE_AVAX_FROM_BLOCK, cursor.lastScannedBlock + 1 - NATIVE_AVAX_REORG_OVERLAP);
    // THE CURSOR MAY NOT CERTIFY WHAT THE EXPLORER HAS NOT INDEXED (senior
    // review, 2026-07-27). `head` is the NODE's latest block, but these rows
    // come from an INDEX — a different system with its own lag. Advancing the
    // cursor to the node's head declares covered a range the explorer may not
    // have read yet, and the 50-block overlap (~100 s) is the only thing that
    // ever looks back. Anything the index was still missing beyond that window
    // is never queried again: an AVAX movement lost forever, in silence.
    // So the lane stops short of the head by a margin larger than any observed
    // indexer lag, and simply picks the rest up next cycle. Being a few blocks
    // behind is a stated coverage bound; a hole is a lie.
    const safeHead = args.head - EXPLORER_LAG_MARGIN_BLOCKS;
    if (resumeFrom > safeHead) {
      // Nothing safely readable yet — keep the cursor where it is rather than
      // moving it over blocks nobody has confirmed are indexed.
      return summary;
    }
    const fetchRecords = args.deps.fetchRecords ?? fetchNativeAvaxRecords;
    const records = await fetchRecords({
      organWallets: args.organWallets,
      fromBlock: resumeFrom,
      toBlock: safeHead,
    });
    if (records.length > 0) {
      summary.rowsInserted = await args.deps.insert(records);
    }
    summary.scannedTo = safeHead;
    await args.deps.upsertCursor({
      streamKey,
      fromBlock: NATIVE_AVAX_FROM_BLOCK,
      lastScannedBlock: safeHead,
      status: "ok",
      lastError: null,
    });
  } catch (err) {
    // The cursor is deliberately NOT advanced here: whatever was inserted
    // before the fault will simply be re-read next cycle and de-duplicate.
    summary.status = "error";
    summary.error = err instanceof Error ? err.message : String(err);
  }
  return summary;
}

/**
 * The lane's floor — the SAME pinned block every other treasury lane starts
 * from, so "what the treasury feed covers" is one answer and not five.
 */
export const NATIVE_AVAX_FROM_BLOCK = PROTOCOL_SCAN_FLOOR_BLOCK;
const NATIVE_AVAX_REORG_OVERLAP = 50;

/**
 * HOW FAR BEHIND THE NODE'S HEAD THIS LANE IS WILLING TO CERTIFY (senior review,
 * 2026-07-27). The rows come from an INDEX, the head comes from the NODE, and
 * the two are different systems: advancing the cursor to the node's head
 * declares covered a range the explorer may not have read yet, and only the
 * 50-block overlap (~100 s) ever looks back. A movement the index was still
 * missing beyond that is never queried again — lost, silently, on a money
 * record. Measured indexer lag on this endpoint was ~6 blocks; 200 (~7 minutes
 * on the C-Chain) is a wide margin, and the engine's own cycle is 300 s, so the
 * newest movements simply arrive on the next pass. A stated coverage bound is
 * honest; a hole is not.
 */
const EXPLORER_LAG_MARGIN_BLOCKS = 200;

export const NATIVE_AVAX_INTERNALS_FOR_GUARD = {
  NATIVE_INDEX_BASE,
  EXPLORER_ACCOUNT_API,
  NATIVE_AVAX_FROM_BLOCK,
} as const;
