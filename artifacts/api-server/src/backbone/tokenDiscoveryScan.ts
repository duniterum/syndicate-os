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
 *
 * BACKFILL MODE: index → node — the contract is unknown by definition, so a
 * walk would mean every contract on the chain; the index names the
 * transactions and our own node supplies every published detail.
 * (CHAIN_READING_DOCTRINE §4.)
 */

import type { ProtocolEventRecord } from "./protocolEventScan";
import type { RpcTransport } from "../lib/protocol/rpcTransport";
import { EXPLORER_ACCOUNT_API, EXPLORER_PAGE_SIZE } from "./explorerIndex";

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
        // Bounded HERE, where the payload is built — never trusting a contract
        // to be reasonable about how much text it puts on our public feed.
        symbol: meta.symbol.slice(0, MAX_STORED_SYMBOL),
        decimals: meta.decimals,
      },
    });
  }
  return out;
}

/**
 * ── THE BACKFILL, ASKED RATHER THAN WALKED ──────────────────────────────────
 * THE CHAIN-READING LAW (`CLAUDE.md`; full doctrine in
 * `docs/architecture/CHAIN_READING_DOCTRINE.md`), from the founder's question:
 * *"pourquoi il ne lit pas … pour le bloc exact et met en cache … pourquoi sans
 * arrêt chercher ? nous ne sommes pas un RPC service."*
 *
 * A node stores BLOCKS, not answers: it has no index by wallet, so the only
 * question it can answer is "events of this shape between A and B" — it filters
 * as it walks. For a lane whose CONTRACT IS UNKNOWN BY DEFINITION, that walk is
 * every contract on the chain, one 2,000-block window at a time. This lane was
 * doing exactly that: 1.34M blocks, ~670 calls, to rediscover what an index
 * already holds and answers in ONE call per wallet.
 *
 * AND THE CLAUSE THAT KEEPS THE HONESTY CONTRACT — the index says WHERE to
 * look, OUR NODE says WHAT IS THERE. The explorer is asked only which
 * TRANSACTIONS involve our wallets; every published detail (the real log index,
 * the signer, the amounts) is then read from our own node's receipts. So no
 * figure rests on a third party's word, and the cost is a handful of receipts
 * instead of a million-block walk.
 */
/**
 * Where "history" ends and "the tail" begins. Below this distance from the head
 * the lane watches with our own node (the tail can still reorg); above it, the
 * history is finalized and is ASKED. 50,000 blocks ≈ 28 h on the C-Chain — far
 * wider than the 50-block reorg overlap, so the tail's overlap can never reach
 * back into a range the index already settled.
 */
const DISCOVERY_TAIL_WINDOW = 50_000;

/**
 * Ask the index which TRANSACTIONS touched our wallets with a non-curated
 * token. Returns hashes only — deliberately: nothing this function returns is
 * ever published, so the explorer cannot put a figure on a public page.
 */
export async function fetchIndexedTransactionHashes(args: {
  readonly organWallets: readonly string[];
  readonly pinnedContracts: readonly string[];
  readonly fromBlock: number;
  readonly toBlock: number;
  readonly timeoutMs?: number;
}): Promise<string[]> {
  const pinned = new Set(args.pinnedContracts.map((c) => c.toLowerCase()));
  const hashes = new Set<string>();
  for (const wallet of args.organWallets) {
    const url =
      `${EXPLORER_ACCOUNT_API}?module=account&action=tokentx&address=${wallet}` +
      `&startblock=${args.fromBlock}&endblock=${args.toBlock}&sort=asc` +
      `&page=1&offset=${EXPLORER_PAGE_SIZE}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), args.timeoutMs ?? 20_000);
    try {
      const res = await fetch(url, { headers: { accept: "application/json" }, signal: controller.signal });
      if (!res.ok) throw new Error(`discovery index: HTTP ${res.status}`);
      const body = (await res.json()) as { status?: unknown; result?: unknown };
      // "No transactions found" answers status "0" with an empty result — a
      // legitimately empty window, not a fault.
      if (body.status === "0" && Array.isArray(body.result) && body.result.length === 0) continue;
      if (body.status !== "1" || !Array.isArray(body.result)) {
        throw new Error(`discovery index: explorer status ${String(body.status)}`);
      }
      if (body.result.length >= EXPLORER_PAGE_SIZE) {
        throw new Error("discovery index: answer fills the page — may be truncated, refusing to advance");
      }
      for (const row of body.result as { hash?: unknown; contractAddress?: unknown }[]) {
        const contract = typeof row.contractAddress === "string" ? row.contractAddress.toLowerCase() : "";
        const hash = typeof row.hash === "string" ? row.hash.toLowerCase() : "";
        if (!/^0x[0-9a-f]{64}$/.test(hash)) continue;
        if (contract === "" || pinned.has(contract)) continue; // curated lanes own those
        hashes.add(hash);
      }
    } finally {
      clearTimeout(timer);
    }
  }
  return [...hashes];
}

/**
 * Read those transactions from OUR OWN NODE and decode their real Transfer
 * logs. This is where every published detail comes from — real log indices
 * included, so an index-sourced row and a tail-walked row are the SAME row and
 * de-duplicate on the same key.
 */
export async function fetchCandidatesFromReceipts(
  transport: RpcTransport,
  txHashes: readonly string[],
  organWallets: readonly string[],
): Promise<{ candidates: DiscoveredTransferCandidate[]; unread: string[] }> {
  const organs = new Set(organWallets.map((w) => w.toLowerCase()));
  const out: DiscoveredTransferCandidate[] = [];
  // A hash the index NAMED and our node did not answer is UNRESOLVED, not
  // absent — and the two must never be confused by a cursor. The transport
  // throws on HTTP and JSON-RPC errors, so those are already safe; what is NOT
  // is a backend that simply does not hold the transaction and answers
  // `{"result": null}`. The first version dropped that silently, so a window
  // could end with ZERO candidates and still be certified covered.
  const unread: string[] = [];
  for (const hash of txHashes) {
    const receipt = await transport("eth_getTransactionReceipt", [hash]);
    if (typeof receipt !== "object" || receipt === null) {
      unread.push(hash);
      continue;
    }
    const logs = (receipt as { logs?: unknown }).logs;
    if (!Array.isArray(logs)) {
      unread.push(hash);
      continue;
    }
    for (const log of logs) {
      let c: DiscoveredTransferCandidate;
      try {
        c = decodeDiscoveredTransferLog(log as Record<string, unknown>);
      } catch {
        continue; // not an ERC-20 Transfer — the receipt holds every kind
      }
      if (!organs.has(c.to) && !organs.has(c.from)) continue;
      out.push(c);
    }
  }
  return { candidates: out, unread };
}

/**
 * THE ROWS WE OWE THE RECORD — one predicate, used by BOTH phases.
 * ---------------------------------------------------------------------------
 * A candidate we WOULD have published (ours by signature, not curated, non-zero)
 * whose contract would not describe itself. It cannot be rendered honestly yet,
 * so the cursor must NOT move past it — the next cycle retries.
 *
 * WHY THIS IS A FUNCTION AND NOT TWO COPIES (senior review, 2026-07-27, found by
 * two independent lenses): the hold existed only in the TAIL phase. The INDEX
 * phase — the arc's headline path, one shot over ~1.34M blocks, never revisited
 * because the 50-block overlap cannot reach back — advanced its cursor
 * unconditionally. One transient `eth_call` failure there would have erased a
 * bought asset from the public record PERMANENTLY, with the lane reporting
 * status "ok". The named row at risk was the founder's own LINK.e purchase.
 * The arc's own doctrine forbids it in one line (CHAIN_READING_DOCTRINE §3: the
 * cursor advances "only past rows actually persisted — never past rows that were
 * dropped, skipped or unresolved"), and the code contradicted it.
 *
 * It is the FOURTH time in one day that one decision written in two places
 * diverged. Hence: one function, imported by both callers, and a guard that
 * drives each phase.
 */
export function undescribedOwedRows(input: {
  readonly candidates: readonly DiscoveredTransferCandidate[];
  readonly pinnedContracts: readonly string[];
  readonly signerWallets: readonly string[];
  readonly signerByTx: ReadonlyMap<string, string>;
  readonly metaByContract: ReadonlyMap<string, TokenMeta>;
}): DiscoveredTransferCandidate[] {
  const pinned = new Set(input.pinnedContracts.map((c) => c.toLowerCase()));
  const signers = new Set(input.signerWallets.map((w) => w.toLowerCase()));
  return input.candidates.filter((c) => {
    if (pinned.has(c.contract)) return false;
    if (c.valueRaw === "0") return false;
    const signer = input.signerByTx.get(c.transactionHash);
    if (signer === undefined || !signers.has(signer.toLowerCase())) return false;
    return !input.metaByContract.has(c.contract);
  });
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
): Promise<{ candidates: DiscoveredTransferCandidate[]; skipped: number }> {
  const organTopics = organWallets.map(addressToTopic);
  const passes: unknown[][] = [
    [TRANSFER_TOPIC0, null, organTopics], // money IN
    [TRANSFER_TOPIC0, organTopics, null], // money OUT
  ];
  const seen = new Set<string>();
  const out: DiscoveredTransferCandidate[] = [];
  let skipped = 0;
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
      // A LOG WE CANNOT DECODE IS SKIPPED, NEVER FATAL (senior review,
      // 2026-07-27). This lane has NO contract filter, so it necessarily meets
      // logs the pinned lanes never see: ERC-721 transfers (same topic0, a
      // fourth topic), ERC-1155, and every non-standard contract on the chain.
      // The decoder REFUSES those on purpose — but throwing here aborted the
      // whole window, and the cursor never advanced past it. One spam NFT sent
      // to a PUBLISHED organ wallet would have frozen the lane permanently, for
      // the price of dust. Refusing a log and refusing to continue are two
      // different decisions; only the first one was intended.
      let c: DiscoveredTransferCandidate;
      try {
        c = decodeDiscoveredTransferLog(log as Record<string, unknown>);
      } catch {
        skipped += 1;
        continue;
      }
      // An organ→organ transfer matches BOTH passes; keyed dedupe, here, where
      // a duplicate is still visible rather than swallowed by the insert.
      const key = `${c.transactionHash}:${c.logIndex}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
  }
  return { candidates: out, skipped };
}

/** `tx.from` for each transaction — the signature the whole rule rests on. */
export async function fetchSigners(
  transport: RpcTransport,
  txHashes: readonly string[],
): Promise<{ signerByTx: Map<string, string>; unread: string[] }> {
  const byTx = new Map<string, string>();
  // "NOT OURS" AND "COULD NOT READ" ARE DIFFERENT ANSWERS, and only one of them
  // is safe to move a cursor past. Collapsing them is right for the PUBLISH
  // decision — unknown is not consent — and wrong for the CURSOR decision: a
  // stranger's transaction is resolved-and-rejected, an unanswered one is not
  // resolved at all. This read is a SECOND round trip after the receipt, over a
  // load-balanced multi-provider transport, which is exactly where the two can
  // disagree.
  const unread: string[] = [];
  for (const hash of txHashes) {
    const tx = await transport("eth_getTransactionByHash", [hash]);
    if (typeof tx !== "object" || tx === null) {
      unread.push(hash.toLowerCase());
      continue;
    }
    const from = (tx as { from?: unknown }).from;
    if (typeof from === "string" && /^0x[0-9a-fA-F]{40}$/.test(from)) {
      byTx.set(hash.toLowerCase(), from.toLowerCase());
    } else {
      unread.push(hash.toLowerCase());
    }
  }
  return { signerByTx: byTx, unread };
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
/** Paced like the curated lanes: 100 back-to-back getLogs is what earned a
 *  measured 403 from the provider once already. */
const DISCOVERY_CHUNK_DELAY_MS = 120;

function sleep(ms: number): Promise<void> {
  // DELIBERATELY NOT unref()ed. The sibling lanes unref so a shutdown is not
  // delayed by a pace timer — but an unref'd timer lets Node EXIT while the
  // loop is sleeping, which means no fixture can drive this function to
  // completion. That is exactly why the phase-1 cursor defect survived three
  // reviews: the branch existed and nothing could reach it. A 120 ms delay on
  // shutdown is a smaller price than a money lane no guard can execute.
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * A HARD BOUND ON THE SYMBOL, server-side (senior review, 2026-07-27 — the
 * one-authority break: the browser bounded it and the server did not, so the
 * two sides of one figure disagreed by construction). A symbol is text an
 * arbitrary contract returns; it enters a public payload, so its size is ours
 * to bound, not its author's. Long or hostile symbols do not lose the row —
 * the client renders the CONTRACT instead, which cannot be chosen twice.
 */
const MAX_STORED_SYMBOL = 32;

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
    /**
     * The index read, injectable ONLY so a guard can drive the asked-history
     * phase without a network. Production leaves it undefined and gets the real
     * explorer call. It exists because the phase-1 cursor defect survived three
     * reviews for exactly one reason: no fixture could reach that branch.
     */
    fetchIndexHashes?: typeof fetchIndexedTransactionHashes;
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
    // ── PHASE 1 — HISTORY IS ASKED, NOT WALKED (THE CHAIN-READING LAW) ──────
    // Everything further than the tail window behind the head is FINALIZED, so
    // it cannot reorg and there is nothing to watch for: one index call per
    // wallet names the transactions, our own node supplies every published
    // detail, and the cursor jumps the whole range in a single cycle instead of
    // walking it 2,000 blocks at a time across seven.
    const indexEnd = args.head - DISCOVERY_TAIL_WINDOW;
    let tailFrom = resumeFrom;
    if (resumeFrom <= indexEnd) {
      const askIndex = args.deps.fetchIndexHashes ?? fetchIndexedTransactionHashes;
      const txHashes = await askIndex({
        organWallets: args.organWallets,
        pinnedContracts: args.pinnedContracts,
        fromBlock: resumeFrom,
        toBlock: indexEnd,
      });
      // EVERY UNRESOLVED THING HOLDS THIS CURSOR — and the check lives OUTSIDE
      // the "did we get candidates" branch, because ZERO CANDIDATES IS THE
      // DANGEROUS CASE (senior review #5, 2026-07-27, measured by driving this
      // function). The previous version nested the hold inside
      // `if (candidates.length > 0)`, so a node answering `{"result": null}`
      // for the one transaction the index named produced no candidates, skipped
      // the hold entirely, and advanced the cursor across ~1.34M blocks with
      // status "ok". The commit that added the hold named THREE drop paths in
      // its own message and covered ONE of them.
      const { candidates, unread: unreadReceipts } = await fetchCandidatesFromReceipts(
        args.transport,
        txHashes,
        args.organWallets,
      );
      const { signerByTx, unread: unreadSigners } = await fetchSigners(
        args.transport,
        [...new Set(candidates.map((c) => c.transactionHash))],
      );
      const pinnedSet = new Set(args.pinnedContracts.map((c) => c.toLowerCase()));
      const metaByContract = await fetchTokenMeta(
        args.transport,
        [...new Set(candidates.map((c) => c.contract))].filter((c) => !pinnedSet.has(c)),
      );
      if (candidates.length > 0) {
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
      const owedHere = undescribedOwedRows({
        candidates,
        pinnedContracts: args.pinnedContracts,
        signerWallets: args.signerWallets,
        signerByTx,
        metaByContract,
      });
      const unresolved = [
        ...unreadReceipts.map((h) => `receipt unread ${h}`),
        ...unreadSigners.map((h) => `signer unread ${h}`),
        ...[...new Set(owedHere.map((c) => c.contract))].map((c) => `undescribed ${c}`),
      ];
      if (unresolved.length > 0) {
        summary.status = "error";
        summary.error =
          `asked history ${resumeFrom}-${indexEnd}: ${unresolved.length} unresolved item(s) — ` +
          `${unresolved.join(" · ")} — cursor HELD, the next cycle re-asks this window ` +
          `(this phase runs once over the whole history; advancing here loses the row forever)`;
        return summary;
      }
      await args.deps.upsertCursor({
        streamKey,
        fromBlock: DISCOVERY_FROM_BLOCK,
        lastScannedBlock: indexEnd,
        status: "ok",
        lastError: null,
      });
      summary.scannedTo = indexEnd;
      // No reorg overlap crossing back: the tail window is 1,000× the overlap,
      // and finalized history does not move.
      tailFrom = indexEnd + 1;
    }

    // ── PHASE 2 — THE TAIL IS WATCHED, FROM OUR OWN NODE ────────────────────
    const budgetEnd = Math.min(args.head, tailFrom + DISCOVERY_MAX_BLOCKS_PER_CYCLE - 1);
    summary.scannedTo = Math.max(summary.scannedTo, Math.max(tailFrom - 1, DISCOVERY_FROM_BLOCK));
    const resumeFromTail = tailFrom;
    for (let from = resumeFromTail; from <= budgetEnd; from += DISCOVERY_CHUNK) {
      const to = Math.min(from + DISCOVERY_CHUNK - 1, budgetEnd);
      // PACING, like every other lane: back-to-back getLogs is what earned a
      // measured 403 from the provider once already.
      if (from > resumeFromTail) await sleep(DISCOVERY_CHUNK_DELAY_MS);
      const { candidates } = await fetchDiscoveryCandidates(
        args.transport,
        args.organWallets,
        from,
        to,
      );
      if (candidates.length > 0) {
        // The two extra reads happen ONLY for what survived the cheap filters,
        // so a quiet window costs exactly the two getLogs passes.
        const { signerByTx, unread: unreadSignersTail } = await fetchSigners(
          args.transport,
          [...new Set(candidates.map((c) => c.transactionHash))],
        );
        const pinned = new Set(args.pinnedContracts.map((c) => c.toLowerCase()));
        const metaByContract = await fetchTokenMeta(
          args.transport,
          [...new Set(candidates.map((c) => c.contract))].filter((c) => !pinned.has(c)),
        );
        // A ROW WE COULD NOT DESCRIBE MUST NOT BE LEFT BEHIND (senior review,
        // 2026-07-27). `buildDiscoveredRecords` silently skips a candidate
        // whose contract would not answer symbol()/decimals(), and the cursor
        // then advanced past it — so a transient RPC failure on ONE eth_call
        // deleted a bought asset from the record permanently. The 50-block
        // overlap does not save it: the chunk is 2,000 blocks wide. So the
        // cursor STOPS at the previous chunk and the next cycle retries this
        // one. Converging slowly beats converging with a hole.
        // THE HOLD MUST USE THE SAME ADMISSION TEST AS THE BUILDER (confirmation
        // review, 2026-07-27 — this fix had re-created, one layer up, the exact
        // freeze it was written beside). The first version asked only whether a
        // signer was READABLE; the builder admits only when the signer is OURS.
        // So a stranger could airdrop an ERC-20 that refuses to describe itself
        // and hold the cursor FOREVER — a permanent freeze of the lane, for the
        // price of gas, to a wallet we publish. Only a row we would actually
        // have PUBLISHED is worth waiting for.
        const owed = undescribedOwedRows({
          candidates,
          pinnedContracts: args.pinnedContracts,
          signerWallets: args.signerWallets,
          signerByTx,
          metaByContract,
        });
        // The tail holds for the SAME two reasons as the asked history: an
        // asset we signed for that will not describe itself, and a transaction
        // whose signer our node did not answer. The second costs one cycle here
        // (this chunk is simply re-read) and would cost a row forever in phase 1.
        const unresolvedTail = [
          ...unreadSignersTail.map((h) => `signer unread ${h}`),
          ...[...new Set(owed.map((c) => c.contract))].map((c) => `undescribed ${c}`),
        ];
        if (unresolvedTail.length > 0) {
          // Named, not counted: this halts a money lane, so the operator screen
          // must say WHAT is blocking it rather than "1 row".
          summary.status = "error";
          summary.error =
            `blocks ${from}-${to}: ${unresolvedTail.length} unresolved item(s) — ` +
            `${unresolvedTail.join(" · ")} — cursor held so the next cycle retries`;
          return summary;
        }
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

/** Exposed for backbone.guard: the two constants whose RATIO keeps the asked
 *  history and the watched tail from ever covering the same block. */
export const DISCOVERY_TAIL_WINDOW_FOR_GUARD = DISCOVERY_TAIL_WINDOW;
export const DISCOVERY_REORG_OVERLAP_FOR_GUARD = DISCOVERY_REORG_OVERLAP;
