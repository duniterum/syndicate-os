/**
 * THE TOKEN DISCOVERY LANE — any asset the protocol buys, with no list to edit.
 * ---------------------------------------------------------------------------
 * THE FOUNDER'S RULE (2026-07-27), and it is the one that makes this safe
 * without a human step: an asset the protocol BOUGHT arrives in a transaction
 * SIGNED BY ONE OF ITS OWN WALLETS. Nobody can forge that signature — it needs
 * our private key. A poisoning airdrop, by construction, is signed by whoever
 * sent it. So the filter is not "which token is this" (a question about a name
 * anyone may claim) but "did we sign for it" (a question the chain answers).
 *
 * Verified on BOTH real purchases before this was written:
 *   · AVAX  tx 0x7accfd17… — from = 0x205ddc…f464, the vault
 *   · LINK.e tx 0xe2d63403… — from = 0x205ddc…f464, the vault
 * The counterfeit "AVAX" already sitting in the vault's history is excluded by
 * the same rule, with nothing to configure.
 *
 * WHY IT IS A SEPARATE LANE FROM THE CURATED ONES. Every other treasury lane
 * pins ONE contract address and scans its `Transfer` topic. This one inverts
 * the filter: it pins OUR WALLETS in the recipient position and leaves the
 * contract open, so a token nobody has ever registered still produces a log we
 * see. The curated contracts are then EXCLUDED here — they have their own
 * lanes, with curated names and curated precision, and a row must never be
 * produced twice.
 *
 * WHAT IT READS OFF THE CHAIN, and why both. `decimals()` because a figure at
 * the wrong scale is worse than no figure — it is the difference between 1 LINK
 * and 1,000,000,000,000 LINK on a public page. `symbol()` because a row needs a
 * name; but a symbol is TEXT ITS AUTHOR CHOSE, so it travels BESIDE the
 * contract address rather than replacing it, and the browser refuses to render
 * a symbol that claims a name already ours.
 */

import type { ProtocolEventRecord } from "./protocolEventScan";
import type { RpcTransport } from "../lib/protocol/rpcTransport";

const EXPECTED_CHAIN_ID = 43114;

/** keccak256("Transfer(address,address,uint256)") — the same pin the curated
 *  lanes use; self-checked there against the signature string. */
const TRANSFER_TOPIC0 =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

/** `symbol()` and `decimals()` — the two reads that make a row renderable. */
const SELECTOR_SYMBOL = "0x95d89b41";
const SELECTOR_DECIMALS = "0x313ce567";

export const TOKEN_DISCOVERY_STREAM_KEY = "TREASURY_DISCOVERED";

/**
 * THE ONE AUTHORITY for what this lane must NOT re-narrate. Every contract here
 * is already covered by a dedicated lane, so discovering it a second time would
 * put the SAME act on the public feed twice — a truth defect, not a cosmetic
 * one. Kept beside the lane and imported by the runner, because a list the
 * runner assembles privately is a list a guard cannot check.
 *
 * The LP pair earned its place the hard way (founder catch, 2026-07-27): the
 * liquidity wallet has held JLP since block 87,163,331, and pool acts already
 * run through LP_LIQUIDITY + LP_TOKEN_MINT.
 */
export function curatedContractsFor(targets: {
  usdcTokenAddress: string;
  synTokenAddress: string;
  btcbTokenAddress: string;
  wethTokenAddress: string;
  lpPair: string;
}): string[] {
  return [
    targets.usdcTokenAddress,
    targets.synTokenAddress,
    targets.btcbTokenAddress,
    targets.wethTokenAddress,
    targets.lpPair,
  ].map((a) => a.toLowerCase());
}

export interface DiscoveredTransferCandidate {
  readonly contract: string;
  readonly from: string;
  readonly to: string;
  readonly valueRaw: string;
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
}

export interface TokenMeta {
  readonly symbol: string;
  readonly decimals: number;
}

function hexToLowerAddress(topic: string, what: string): string {
  // A topic is 32 bytes; an address is its low 20.
  if (typeof topic !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(topic)) {
    throw new Error(`discovery: ${what} is not a 32-byte topic`);
  }
  return `0x${topic.slice(26).toLowerCase()}`;
}

function hexToDecimalString(hex: unknown, what: string): string {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]*$/.test(hex)) {
    throw new Error(`discovery: ${what} is not hex`);
  }
  const body = hex.slice(2);
  if (body.length === 0) throw new Error(`discovery: ${what} is empty`);
  // BigInt, never Number: a token amount at 18 decimals passes 2^53 instantly.
  return BigInt(`0x${body}`).toString(10);
}

function hexToSafeInt(hex: unknown, what: string): number {
  const n = Number(BigInt(hexToDecimalString(hex, what)));
  if (!Number.isSafeInteger(n) || n < 0) {
    throw new Error(`discovery: ${what} is not a safe non-negative integer`);
  }
  return n;
}

/**
 * A `Transfer` log → a candidate. FAIL-CLOSED on every shape surprise: this
 * lane has no contract filter, so it meets contracts nobody vetted, and a
 * decoder that guesses would be guessing about someone's money.
 */
export function decodeDiscoveredTransferLog(log: {
  address?: unknown;
  topics?: unknown;
  data?: unknown;
  blockNumber?: unknown;
  logIndex?: unknown;
  transactionHash?: unknown;
}): DiscoveredTransferCandidate {
  const topics = Array.isArray(log.topics) ? log.topics : [];
  if (typeof topics[0] !== "string" || topics[0].toLowerCase() !== TRANSFER_TOPIC0) {
    throw new Error("discovery: log topic0 is not Transfer");
  }
  // A 3-topic Transfer is the ERC-20 shape. An ERC-721 Transfer has the SAME
  // topic0 but indexes the tokenId as a THIRD topic and carries no data — its
  // "value" is an identifier, not an amount, and summing it would be nonsense.
  // Refusing here is what keeps an NFT out of a treasury figure.
  if (topics.length !== 3) {
    throw new Error("discovery: Transfer log is not the 3-topic ERC-20 shape");
  }
  if (typeof log.address !== "string" || !/^0x[0-9a-fA-F]{40}$/.test(log.address)) {
    throw new Error("discovery: log address is not a contract address");
  }
  if (typeof log.transactionHash !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(log.transactionHash)) {
    throw new Error("discovery: log transactionHash is malformed");
  }
  return {
    contract: log.address.toLowerCase(),
    from: hexToLowerAddress(topics[1] as string, "Transfer.from"),
    to: hexToLowerAddress(topics[2] as string, "Transfer.to"),
    valueRaw: hexToDecimalString(log.data, "Transfer.value"),
    blockNumber: hexToSafeInt(log.blockNumber, "log.blockNumber"),
    logIndex: hexToSafeInt(log.logIndex, "log.logIndex"),
    transactionHash: log.transactionHash.toLowerCase(),
  };
}

/**
 * `symbol()` returns either an ABI string (offset/length/bytes) or, on older
 * tokens, a raw bytes32. Both are decoded; anything else fails closed. The
 * result is NOT sanitised here — the browser owns that gate, because it is the
 * side that renders. What matters here is that it is real bytes off the chain.
 */
export function decodeSymbolReturn(hex: unknown): string {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]*$/.test(hex)) {
    throw new Error("discovery: symbol() answer is not hex");
  }
  const body = hex.slice(2);
  const bytes = (h: string): string => {
    let out = "";
    for (let i = 0; i + 1 < h.length; i += 2) {
      const code = parseInt(h.slice(i, i + 2), 16);
      if (code === 0) continue; // bytes32 right-padding
      out += String.fromCharCode(code);
    }
    return out;
  };
  if (body.length === 64) return bytes(body).trim(); // legacy bytes32
  if (body.length >= 128) {
    const len = Number(BigInt(`0x${body.slice(64, 128)}`));
    if (!Number.isSafeInteger(len) || len < 0 || len > 256) {
      throw new Error("discovery: symbol() length is implausible");
    }
    return bytes(body.slice(128, 128 + len * 2)).trim();
  }
  throw new Error("discovery: symbol() answer has no decodable shape");
}

export function decodeDecimalsReturn(hex: unknown): number {
  const n = hexToSafeInt(hex, "decimals()");
  // 36 is far above any real token (18 is the norm). A contract answering
  // something absurd is refused rather than used to scale a public figure.
  if (n > 36) throw new Error("discovery: decimals() is out of range");
  return n;
}

export interface BuildDiscoveredInput {
  readonly candidates: readonly DiscoveredTransferCandidate[];
  /** Our organ wallets — a movement must touch one to be ours at all. */
  readonly organWallets: readonly string[];
  /** The wallets whose SIGNATURE authorises an asset (organs + founder). */
  readonly signerWallets: readonly string[];
  /** Curated token contracts — they have their own lanes; never duplicated. */
  readonly pinnedContracts: readonly string[];
  /** transaction hash → its signer (`tx.from`), lowercase. */
  readonly signerByTx: ReadonlyMap<string, string>;
  /** token contract → its on-chain symbol + decimals. */
  readonly metaByContract: ReadonlyMap<string, TokenMeta>;
}

/**
 * The whole decision, PURE — so every rule below is pinned by fixtures rather
 * than by a live chain.
 */
export function buildDiscoveredRecords(
  input: BuildDiscoveredInput,
): ProtocolEventRecord[] {
  const organs = new Set(input.organWallets.map((w) => w.toLowerCase()));
  const signers = new Set(input.signerWallets.map((w) => w.toLowerCase()));
  const pinned = new Set(input.pinnedContracts.map((c) => c.toLowerCase()));
  if (organs.size === 0 || signers.size === 0) {
    throw new Error("discovery: the organ or signer set is empty — refusing to scan");
  }

  const out: ProtocolEventRecord[] = [];
  for (const c of input.candidates) {
    // Curated assets have their own lanes, with curated names and precision.
    if (pinned.has(c.contract)) continue;
    // Not ours at all.
    if (!organs.has(c.to) && !organs.has(c.from)) continue;
    // A zero-value transfer is not a movement. Poisoning campaigns lean on
    // these precisely because they are cheap.
    if (c.valueRaw === "0") continue;
    // ── THE SIGNER RULE ──────────────────────────────────────────────────
    // The transaction must have been signed by one of OUR keys. This is what
    // replaces a human approval queue, and it is stronger than one: an
    // operator can be tricked into approving a convincing-looking token, and
    // nobody can be tricked into producing our signature. A transaction whose
    // signer we could not read is NOT assumed ours — unknown is not consent.
    const signer = input.signerByTx.get(c.transactionHash);
    if (signer === undefined || !signers.has(signer.toLowerCase())) continue;
    // Without symbol AND decimals the row cannot be rendered honestly, so it
    // is not produced at all — a line with an unscalable figure is worse than
    // a line that does not exist yet. It will be picked up on a later cycle if
    // the reads succeed then; the reorg overlap makes that free.
    const meta = input.metaByContract.get(c.contract);
    if (meta === undefined) continue;

    out.push({
      chainId: EXPECTED_CHAIN_ID,
      streamKey: TOKEN_DISCOVERY_STREAM_KEY,
      eventName: "Transfer",
      blockNumber: c.blockNumber,
      // These are REAL logs, so the real log index applies — none of the
      // synthetic-index care the native lane needs.
      logIndex: c.logIndex,
      blockHash: null,
      transactionHash: c.transactionHash,
      topic0: TRANSFER_TOPIC0,
      decodedJson: {
        from: c.from,
        to: c.to,
        valueRaw: c.valueRaw,
        contract: c.contract,
        symbol: meta.symbol,
        decimals: meta.decimals,
      },
    });
  }
  return out;
}

/** address → a 32-byte topic, for the recipient/sender filter positions. */
function addressToTopic(address: string): string {
  return `0x${"0".repeat(24)}${address.replace(/^0x/, "").toLowerCase()}`;
}

/**
 * Read one window: every ERC-20 `Transfer` into OR out of an organ wallet, from
 * any contract. Two `eth_getLogs` passes (recipient position, then sender
 * position) — the topic filter cannot express "either side" in one call.
 */
export async function fetchDiscoveryCandidates(
  transport: RpcTransport,
  organWallets: readonly string[],
  fromBlock: number,
  toBlock: number,
): Promise<DiscoveredTransferCandidate[]> {
  const organTopics = organWallets.map(addressToTopic);
  const passes: unknown[][] = [
    [TRANSFER_TOPIC0, null, organTopics], // money IN
    [TRANSFER_TOPIC0, organTopics, null], // money OUT
  ];
  const seen = new Set<string>();
  const out: DiscoveredTransferCandidate[] = [];
  for (const topics of passes) {
    const logs = await transport("eth_getLogs", [
      {
        fromBlock: `0x${fromBlock.toString(16)}`,
        toBlock: `0x${toBlock.toString(16)}`,
        topics,
      },
    ]);
    if (!Array.isArray(logs)) {
      throw new Error("discovery: eth_getLogs did not return an array");
    }
    for (const log of logs) {
      const c = decodeDiscoveredTransferLog(log as Record<string, unknown>);
      // An organ→organ transfer matches BOTH passes; keyed dedupe, here, where
      // a duplicate is still visible rather than swallowed by the insert.
      const key = `${c.transactionHash}:${c.logIndex}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
  }
  return out;
}

/** `tx.from` for each transaction — the signature the whole rule rests on. */
export async function fetchSigners(
  transport: RpcTransport,
  txHashes: readonly string[],
): Promise<Map<string, string>> {
  const byTx = new Map<string, string>();
  for (const hash of txHashes) {
    const tx = await transport("eth_getTransactionByHash", [hash]);
    if (typeof tx !== "object" || tx === null) continue; // unknown ≠ ours
    const from = (tx as { from?: unknown }).from;
    if (typeof from === "string" && /^0x[0-9a-fA-F]{40}$/.test(from)) {
      byTx.set(hash.toLowerCase(), from.toLowerCase());
    }
  }
  return byTx;
}

/**
 * THE LANE'S FLOOR — MEASURED, not copied from the other lanes (founder,
 * 2026-07-27: *"on sait quand les transactions sont faites, pourquoi scanner
 * comme des cons 4,2 millions de blocs ?"*).
 * ---------------------------------------------------------------------------
 * The first version started at the protocol floor 87,157,852 like every curated
 * lane, which meant ~4.18M blocks of backfill — ~4,180 `eth_getLogs` calls — to
 * find, provably, nothing. THE COMPLETE ERC-20 HISTORY OF ALL FOUR ORGAN
 * WALLETS WAS THEN MEASURED (explorer account API, 2026-07-27; 37 + 33 + 26 + 17
 * rows, so nothing was truncated):
 *
 *   vault      87,149,157 SYN · 87,158,947 USDC · 90,460,152 counterfeit "AVAX"
 *              · 90,460,591 BTC.b · 90,460,622 WETH.e · 91,336,828 LINK.e
 *   liquidity  87,163,331 JLP (the SYN/USDC pair token — EXCLUDED, see below)
 *   operations USDC only
 *   NFT sale   USDC only
 *
 * So the earliest event this lane can legitimately see is 90,460,152, and every
 * block below it is provably empty FOR THIS LANE. The floor sits at 90,000,000 —
 * a 460,000-block margin under the earliest known event — and cuts the backfill
 * by 68% (4.18M → 1.34M blocks). `backbone.guard` pins the floor BELOW that
 * earliest event, so raising it past real history turns the build red.
 *
 * WHY A FLOOR IS SAFE HERE and would not be on a curated lane: the curated
 * assets are covered from the true protocol floor by their own lanes. This lane
 * exists only for what they do not cover, and what they do not cover has been
 * enumerated above rather than assumed.
 */
export const DISCOVERY_FROM_BLOCK = 90_000_000;
/** The earliest non-curated token event across all organ wallets, measured
 *  2026-07-27. The floor must stay at or below it — guard-pinned. */
export const EARLIEST_KNOWN_DISCOVERY_BLOCK = 90_460_152;
const DISCOVERY_CHUNK = 2_000;
const DISCOVERY_MAX_BLOCKS_PER_CYCLE = 200_000;
const DISCOVERY_REORG_OVERLAP = 50;

/**
 * The lane's cycle: resume from its cursor, walk the window in chunks, persist
 * each chunk and advance the cursor behind it (the convergence law — the cursor
 * only ever moves past PERSISTED rows, so the covered prefix has no hole).
 * NEVER THROWS: a fault is reported and the cursor stays where it was.
 */
export async function runTokenDiscoveryScan(args: {
  readonly transport: RpcTransport;
  readonly organWallets: readonly string[];
  readonly signerWallets: readonly string[];
  readonly pinnedContracts: readonly string[];
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
  };
}): Promise<{
  streamKey: string;
  rowsInserted: number;
  scannedTo: number;
  status: "ok" | "error";
  error: string | null;
}> {
  const streamKey = TOKEN_DISCOVERY_STREAM_KEY;
  const summary = {
    streamKey,
    rowsInserted: 0,
    scannedTo: DISCOVERY_FROM_BLOCK,
    status: "ok" as "ok" | "error",
    error: null as string | null,
  };
  try {
    const cursor = await args.deps.getCursor(streamKey).catch(() => null);
    const resumeFrom =
      cursor === null
        ? DISCOVERY_FROM_BLOCK
        : Math.max(
            DISCOVERY_FROM_BLOCK,
            cursor.lastScannedBlock + 1 - DISCOVERY_REORG_OVERLAP,
          );
    const budgetEnd = Math.min(args.head, resumeFrom + DISCOVERY_MAX_BLOCKS_PER_CYCLE - 1);
    summary.scannedTo = Math.max(resumeFrom - 1, DISCOVERY_FROM_BLOCK);
    for (let from = resumeFrom; from <= budgetEnd; from += DISCOVERY_CHUNK) {
      const to = Math.min(from + DISCOVERY_CHUNK - 1, budgetEnd);
      const candidates = await fetchDiscoveryCandidates(
        args.transport,
        args.organWallets,
        from,
        to,
      );
      if (candidates.length > 0) {
        // The two extra reads happen ONLY for what survived the cheap filters,
        // so a quiet window costs exactly the two getLogs passes.
        const signerByTx = await fetchSigners(
          args.transport,
          [...new Set(candidates.map((c) => c.transactionHash))],
        );
        const pinned = new Set(args.pinnedContracts.map((c) => c.toLowerCase()));
        const metaByContract = await fetchTokenMeta(
          args.transport,
          [...new Set(candidates.map((c) => c.contract))].filter((c) => !pinned.has(c)),
        );
        const records = buildDiscoveredRecords({
          candidates,
          organWallets: args.organWallets,
          signerWallets: args.signerWallets,
          pinnedContracts: args.pinnedContracts,
          signerByTx,
          metaByContract,
        });
        if (records.length > 0) {
          summary.rowsInserted += await args.deps.insert(records);
        }
      }
      await args.deps.upsertCursor({
        streamKey,
        fromBlock: DISCOVERY_FROM_BLOCK,
        lastScannedBlock: to,
        status: "ok",
        lastError: null,
      });
      summary.scannedTo = to;
    }
  } catch (err) {
    summary.status = "error";
    summary.error = err instanceof Error ? err.message : String(err);
  }
  return summary;
}

/** `symbol()` + `decimals()` per contract. A contract that cannot answer both
 *  yields NO entry, and its rows are simply not produced this cycle. */
export async function fetchTokenMeta(
  transport: RpcTransport,
  contracts: readonly string[],
): Promise<Map<string, TokenMeta>> {
  const byContract = new Map<string, TokenMeta>();
  for (const contract of contracts) {
    try {
      const [symbolHex, decimalsHex] = await Promise.all([
        transport("eth_call", [{ to: contract, data: SELECTOR_SYMBOL }, "latest"]),
        transport("eth_call", [{ to: contract, data: SELECTOR_DECIMALS }, "latest"]),
      ]);
      const symbol = decodeSymbolReturn(symbolHex);
      const decimals = decodeDecimalsReturn(decimalsHex);
      if (symbol.length === 0) continue;
      byContract.set(contract.toLowerCase(), { symbol, decimals });
    } catch {
      // A contract that will not describe itself is not rendered. Silent by
      // design: it is not a protocol fault, and the lane must not stall on it.
      continue;
    }
  }
  return byContract;
}
