/**
 * Per-introduction rows — LIVE IN-MEMORY HOLDER (referral-arc slice ④,
 * founder GO 2026-07-19).
 * -------------------------------------------------------------------
 * The backbone's introduction refresh SETS the freshest per-row model here;
 * the auth zone serves a session's OWN source's rows out of it (the D3
 * own-purchase pattern applied to the introducer's axis). Pure state, no
 * imports beyond types, no I/O — safe for any layer to read.
 *
 * PII posture (ADR-003, the short-form amendment): a row carries the
 * introduced wallet ONLY as the server-derived SHORT form (`0x123…abcd`) —
 * the full address never enters this model; the map key is the full 64-hex
 * sourceId (SERVER-ONLY — a route serves values for the session's own
 * resolved source, never the keys). Every row field is a chain-event fact
 * (block, log index, tx hash, commission) plus the R5 durable flag (the
 * live SYN-balance test at the model's asOfBlock) and the chain-verified
 * UTC day. Nothing else — no roster joins, no enrichment.
 */

/** Slice ⑤ — the receipt-backed anatomy of ONE commission: the event's own
 * amounts (never recomputed), all USDC base-unit decimal strings. Held only
 * when the receipt is internally consistent (commission + net == gross and
 * vault + liquidity + operations == net); otherwise null — an inconsistent
 * receipt is never invented into a breakdown. Numbers only, no addresses. */
export interface OwnReceiptAnatomy {
  /** What the buyer paid (grossUsdc). */
  readonly grossRaw: string;
  /** The commission rate the sale applied, basis points (commissionBps). */
  readonly commissionBps: number;
  /** Sent to the company inside the same tx (protocolContribution). */
  readonly netRaw: string;
  /** The on-chain 70/20/10 routing of the net — the event's own amounts. */
  readonly vaultRaw: string;
  readonly liquidityRaw: string;
  readonly operationsRaw: string;
}

export interface OwnIntroductionRow {
  /** Chain-verified UTC day of the sealing block (Protocol Time cache). */
  readonly isoDayUtc: string;
  readonly blockNumber: number;
  readonly logIndex: number;
  /** 64-hex verify anchor (passes the boundary-aware 40-hex gate). */
  readonly transactionHash: string;
  /** The introduced wallet, ADR-003 short form only (`0x123…abcd`). */
  readonly who: string;
  /** Commission paid for this introduction (USDC base units, exact string). */
  readonly commissionRaw: string;
  /** The R5 durable test at asOfBlock: the introduced wallet still holds SYN. */
  readonly durable: boolean;
  /** Slice ⑤: the receipt breakdown, or null (fail-closed, never invented). */
  readonly anatomy: OwnReceiptAnatomy | null;
}

export interface IntroductionRowsModel {
  readonly asOfBlock: number;
  /** SERVER-ONLY keying: full lowercase sourceId → own rows, newest first. */
  readonly rowsBySourceId: ReadonlyMap<string, readonly OwnIntroductionRow[]>;
}

let live: IntroductionRowsModel | null = null;

/** Set by the backbone's introduction refresh ONLY (same breath as the
 * aggregate model — one cycle, one truth). */
export function setIntroductionRowsModel(next: IntroductionRowsModel): void {
  live = next;
}

/** Freshest per-row model, or null (boot / refresh never succeeded yet). */
export function getIntroductionRowsModel(): IntroductionRowsModel | null {
  return live;
}
