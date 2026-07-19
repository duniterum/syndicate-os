/**
 * Own-Purchase Read-Model — PURE BUILDER (server-only, in-memory; D-TRUTH D3).
 * ---------------------------------------------------------------------------
 * The member's OWN purchase history: every indexed purchase row keyed by its
 * public actor's wallet, so the auth zone can serve a session's own rows —
 * date · gross USDC amount · verify anchor. ADR-003 §3 own-row discipline:
 * the wallet key exists ONLY server-side (the auth route matches the
 * session's own bound account and emits rows WITHOUT the wallet); no lookup
 * surface for arbitrary wallets exists.
 *
 * One derivation, one truth: the fold walks the SAME gapless purchase lane
 * as the milestones/capital walk (RawSaleEventInput — the loader's
 * whitelisted projection; no second decodedJson reader is born). The actor
 * is the loader's memberAddress (V3 recipient — the seat's holder — else
 * the buyer): exactly the capital walk's attribution semantics.
 *
 * Purity: no db, no network, no clock. Fail closed on malformed amounts.
 */

import {
  PURCHASE_EVENT_BY_GENERATION,
  ROUTED_GENERATIONS,
  type BlockTimestampInput,
  type RawSaleEventInput,
  type SaleGeneration,
} from "./activityHeartbeatReadmodel";

/**
 * R-BIND (the Receipts binder — the A1 placements moment, founder order
 * 2026-07-19): one purchase's own RECEIPT facts — the event's OWN money
 * fields, verbatim raw decimal strings, plus a server-derived SHORT referrer
 * form. Numbers, booleans, 64-hex ids and short forms ONLY (the payload
 * boundary gate stays untouched by construction). Served on TWO sanctioned
 * paths: (a) the session's own wallet via /api/auth/member-purchases
 * (ADR-003 §3 — a member's own receipts are theirs to see and share), and
 * (b) since the /receipt/{txHash} slice (Q44, founder-sealed 2026-07-20),
 * PUBLICLY by transaction anchor via GET /api/receipt/{txHash} — the same
 * short-form, wallet-free facts, addressed by the receipt's own public
 * hash. Every nullable is HONEST ABSENCE — an engine that never emitted a
 * field serves null, never a guess (the ticket's ⑫ law).
 */
export interface OwnReceiptFacts {
  /** The seat: V2A/V3 the event's own memberNumber; V1 the frozen genesis
   *  roster join; null when the record carries none (V2B's 0 sentinel). */
  readonly seat: number | null;
  /** The row's own actor (the ticket's Holder line), ADR-003 SHORT form
   *  only — server-derived from the event's own field; it IS the session's
   *  wallet by keying, but the ticket prints the EVENT's fact. */
  readonly holderShort: string | null;
  /** V3 only — the commission the buyer's tx paid (acquisitionCost). */
  readonly commissionRaw: string | null;
  /** V3 only — the net sent to the company (protocolContribution). */
  readonly netRaw: string | null;
  /** V1+V3 on the purchase event; V2A/V2B folded from the SAME
   *  transaction's Routed sibling (the engraved binder-slice fold). */
  readonly vaultRaw: string | null;
  readonly liquidityRaw: string | null;
  readonly operationsRaw: string | null;
  readonly synOutRaw: string | null;
  readonly synPerUsdc: string | null;
  readonly era: number | null;
  readonly firstSeat: boolean | null;
  /** 64-hex introduction id (passes the boundary gate); null = unreferred. */
  readonly sourceIdHex: string | null;
  /** The referrer, ADR-003 SHORT form only — server-derived, or null. */
  readonly broughtByShort: string | null;
}

/** One raw event's receipt-fact projection (the loader's own whitelist —
 *  purchase rows AND Routed rows; the fold pairs them here, purely). */
export interface RawReceiptFactInput {
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
  readonly eventName: string;
  readonly commissionRaw: string | null;
  readonly netRaw: string | null;
  readonly vaultRaw: string | null;
  readonly liquidityRaw: string | null;
  readonly operationsRaw: string | null;
  readonly synOutRaw: string | null;
  readonly synPerUsdc: string | null;
  readonly memberNumber: number | null;
  readonly era: number | null;
  readonly firstSeat: boolean | null;
  readonly sourceIdHex: string | null;
  readonly broughtByShort: string | null;
}

export interface OwnPurchaseRow {
  /** UTC calendar day of the purchase (chain-verified block timestamp). */
  readonly isoDayUtc: string;
  /** Chain-verified epoch seconds of the sealing block (Protocol Time) —
   *  named WITHOUT the cache vocabulary so serving routes can relay it
   *  (the protocol-time guard confines that vocabulary to this zone). */
  readonly sealedAtSec: number;
  readonly blockNumber: number;
  readonly logIndex: number;
  /** The purchase's own 64-hex verify anchor. */
  readonly transactionHash: string;
  /** The purchase's own PUBLIC gross USDC (6-dec raw decimal string). */
  readonly usdcGrossRaw: string;
  /** Engine generation — a public protocol parameter (V1 · V2A · V2B · V3). */
  readonly generation: string;
  /** R-BIND: the row's receipt facts, or null (honest absence, never a
   *  guess) — the binder prints a full ticket only when these exist. */
  readonly receipt: OwnReceiptFacts | null;
}

export interface OwnPurchaseBuildInput {
  readonly expectedChainId: number;
  readonly rawEvents: readonly RawSaleEventInput[];
  readonly blockTimestamps: readonly BlockTimestampInput[];
  /** R-BIND: the loader's receipt-fact projection (may be empty — rows then
   *  serve without receipt facts, exactly the pre-binder shape). */
  readonly rawReceiptFacts?: readonly RawReceiptFactInput[];
  /** D-TRUTH D1: the frozen genesis roster (lowercase wallet → seat #1–#8)
   *  joining V1 rows to their seats — STANDING only, never emitted as a
   *  wallet. Absent → V1 rows carry no seat (honest absence). */
  readonly genesisSeatByWallet?: ReadonlyMap<string, number>;
}

export interface OwnPurchaseBuildResult {
  /** SERVER-ONLY: lowercase actor wallet → own rows, newest first. */
  readonly rowsByWallet: ReadonlyMap<string, readonly OwnPurchaseRow[]>;
  /**
   * The /receipt/{txHash} public page's projection (Q44 sealed 2026-07-19;
   * built 2026-07-20): the SAME row objects keyed by their lowercase 64-hex
   * transaction hash — a PUBLIC anchor, exactly as public as the transaction
   * a receipt cites. The rows carry short-form actors by construction and no
   * wallet field, so serving one leaks nothing rowsByWallet protects
   * (rowsByWallet itself stays SERVER-ONLY). Same-transaction rows keep
   * event order (logIndex ascending).
   */
  readonly rowsByTxHash: ReadonlyMap<string, readonly OwnPurchaseRow[]>;
}

function fail(message: string): never {
  throw new Error(`own-purchase build failed closed: ${message}`);
}

/** Format chain-verified epoch seconds as a UTC calendar day. NOT a clock read. */
function isoDayUtcFromSeconds(sec: number): string {
  if (!Number.isFinite(sec) || !Number.isInteger(sec) || sec <= 0) {
    fail("non-positive or non-integer block timestamp");
  }
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

/** R-BIND — assemble one purchase row's receipt facts from its own event's
 * projection + (V2A/V2B) the SAME transaction's Routed sibling — the fold the
 * spine engraved for the binder slice. Pure; null on any unpaired/absent
 * piece (honest absence, never a guess). */
function receiptFactsFor(
  e: RawSaleEventInput,
  factByEvent: ReadonlyMap<string, RawReceiptFactInput>,
  routedByTx: ReadonlyMap<string, RawReceiptFactInput>,
  genesisSeatByWallet: ReadonlyMap<string, number> | undefined,
): OwnReceiptFacts | null {
  const own = factByEvent.get(`${e.blockNumber}:${e.logIndex}`);
  if (own === undefined) return null;
  // The seat: the event's own memberNumber where it is a REAL seat (V2A/V3 —
  // the V2B 0 is a pairing sentinel, never a member), else the frozen
  // genesis roster join (V1's seatless event; STANDING only).
  const eventSeat =
    own.memberNumber !== null && own.memberNumber > 0 ? own.memberNumber : null;
  const genesisSeat =
    e.memberAddress !== null
      ? (genesisSeatByWallet?.get(e.memberAddress.toLowerCase()) ?? null)
      : null;
  const seat = eventSeat ?? genesisSeat;
  // V2A/V2B: splits live in the paired Routed event of the same transaction.
  // The fold applies ONLY when the pairing carries no referral figure — a
  // V2 referral-bearing routing cannot be expressed honestly by this
  // receipt shape yet, so its splits stay absent rather than mis-led.
  let vaultRaw = own.vaultRaw;
  let liquidityRaw = own.liquidityRaw;
  let operationsRaw = own.operationsRaw;
  if (
    ROUTED_GENERATIONS.has(e.generation as SaleGeneration) &&
    vaultRaw === null
  ) {
    const routed = routedByTx.get(e.transactionHash.toLowerCase());
    if (
      routed !== undefined &&
      (routed.commissionRaw === null || /^0+$/.test(routed.commissionRaw))
    ) {
      vaultRaw = routed.vaultRaw;
      liquidityRaw = routed.liquidityRaw;
      operationsRaw = routed.operationsRaw;
    }
  }
  const holder = e.memberAddress;
  return {
    seat,
    holderShort:
      holder !== null && /^0x[0-9a-f]{40}$/.test(holder)
        ? `0x${holder.slice(2, 5)}…${holder.slice(-4)}`
        : null,
    commissionRaw: own.commissionRaw,
    netRaw: own.netRaw,
    vaultRaw,
    liquidityRaw,
    operationsRaw,
    synOutRaw: own.synOutRaw,
    synPerUsdc: own.synPerUsdc,
    era: own.era,
    firstSeat: own.firstSeat,
    sourceIdHex: own.sourceIdHex,
    broughtByShort: own.broughtByShort,
  };
}

export function buildOwnPurchaseReadModel(
  input: OwnPurchaseBuildInput,
): OwnPurchaseBuildResult {
  const { expectedChainId, rawEvents, blockTimestamps } = input;

  const tsByBlock = new Map<number, number>();
  for (const t of blockTimestamps) {
    if (t.chainId !== expectedChainId) {
      fail(`block timestamp on unexpected chain ${t.chainId} (expected ${expectedChainId})`);
    }
    const existing = tsByBlock.get(t.blockNumber);
    if (existing !== undefined && existing !== t.blockTimestampSec) {
      fail("conflicting verified timestamps for one block");
    }
    tsByBlock.set(t.blockNumber, t.blockTimestampSec);
  }

  // R-BIND: the receipt-fact projections, keyed for the pure fold — by the
  // event's own coordinates, and Routed rows ALSO by their transaction (the
  // V2 pairing key; SERVER-ONLY, never serialized).
  const factByEvent = new Map<string, RawReceiptFactInput>();
  const routedByTx = new Map<string, RawReceiptFactInput>();
  for (const f of input.rawReceiptFacts ?? []) {
    factByEvent.set(`${f.blockNumber}:${f.logIndex}`, f);
    if (f.eventName === "Routed") {
      routedByTx.set(f.transactionHash.toLowerCase(), f);
    }
  }

  const rowsByWallet = new Map<string, OwnPurchaseRow[]>();
  const rowsByTxHash = new Map<string, OwnPurchaseRow[]>();
  for (const e of rawEvents) {
    if (e.chainId !== expectedChainId) {
      fail(`raw event on unexpected chain ${e.chainId} (expected ${expectedChainId})`);
    }
    const gen = e.generation as SaleGeneration;
    if (!(gen in PURCHASE_EVENT_BY_GENERATION)) {
      fail(`unknown sale generation "${e.generation}"`);
    }
    if (e.eventName !== PURCHASE_EVENT_BY_GENERATION[gen]) continue; // routing rows are not purchases
    // A purchase row without its public actor (a malformed early decode)
    // simply cannot be an own-row — skipped, never guessed onto a wallet.
    if (e.memberAddress === null) continue;
    if (e.usdcGrossRaw === null || !/^[0-9]+$/.test(e.usdcGrossRaw)) {
      fail("a purchase row carries no clean USDC amount — the own-row fold refuses to guess");
    }
    const ts = tsByBlock.get(e.blockNumber);
    if (ts === undefined) {
      fail("a purchase block has no verified timestamp in the Protocol Time cache");
    }
    const key = e.memberAddress.toLowerCase();
    const rows = rowsByWallet.get(key) ?? [];
    const row: OwnPurchaseRow = {
      isoDayUtc: isoDayUtcFromSeconds(ts),
      sealedAtSec: ts,
      blockNumber: e.blockNumber,
      logIndex: e.logIndex,
      transactionHash: e.transactionHash,
      usdcGrossRaw: e.usdcGrossRaw,
      generation: e.generation,
      receipt: receiptFactsFor(e, factByEvent, routedByTx, input.genesisSeatByWallet),
    };
    rows.push(row);
    rowsByWallet.set(key, rows);
    // The public tx-keyed projection: the SAME row object, keyed by its own
    // public anchor (see the interface note — nothing wallet-keyed serves).
    const txKey = e.transactionHash.toLowerCase();
    const txRows = rowsByTxHash.get(txKey) ?? [];
    txRows.push(row);
    rowsByTxHash.set(txKey, txRows);
  }

  // Newest first — the display order (the receipt list reads downward in time).
  for (const rows of rowsByWallet.values()) {
    rows.sort((a, b) =>
      a.blockNumber !== b.blockNumber
        ? b.blockNumber - a.blockNumber
        : b.logIndex - a.logIndex,
    );
  }
  // Same-transaction rows in event order (logIndex ascending) — the public
  // page prints the FIRST as the transaction's document.
  for (const rows of rowsByTxHash.values()) {
    rows.sort((a, b) => a.logIndex - b.logIndex);
  }

  return { rowsByWallet, rowsByTxHash };
}
