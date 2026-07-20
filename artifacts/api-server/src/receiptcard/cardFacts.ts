/**
 * receiptcard/cardFacts.ts — ONE served row → the painted card's facts.
 * ---------------------------------------------------------------------------
 * The painted preview cards (Q44 sealed order, founder-approved faces
 * 2026-07-20) render the SAME truths the ticket prints, so every formatter
 * here MIRRORS the studio spine (`artifacts/studio/src/lib/
 * protocolCommerceReceipt.ts`) — exact string math, trailing zeros trimmed
 * to a 2-decimal minimum on money, honest absence on every nullable. NO
 * RECOMPUTE: every figure is the row's own field re-based; nothing is
 * summed or derived here.
 *
 * The chapter table MIRRORS the studio's frozen canon
 * (`artifacts/studio/src/lib/chapters.ts` — boundaries engraved in
 * SEASONS_ENGINE_ON_SYNDICATE_OS §3; frozen, never renumbered). A drift
 * between the two copies would be a canon violation, not a style choice.
 */

import type { OwnPurchaseRow } from "../backbone/ownPurchaseReadmodel";

// ── the frozen narrative chapters (studio mirror — see header) ─────────────
interface Chapter {
  readonly roman: string;
  readonly name: string;
  readonly startSeat: number;
  readonly endSeat: number | null;
}
const CHAPTERS: readonly Chapter[] = [
  { roman: "I", name: "Genesis Signal", startSeat: 1, endSeat: 333 },
  { roman: "II", name: "First Thousand", startSeat: 334, endSeat: 1000 },
  { roman: "III", name: "The Expansion", startSeat: 1001, endSeat: 3333 },
  { roman: "IV", name: "First Ten Thousand", startSeat: 3334, endSeat: 10000 },
  { roman: "V", name: "Open Era", startSeat: 10001, endSeat: null },
];
function chapterForSeat(seat: number): Chapter | null {
  if (!Number.isInteger(seat) || seat < 1) return null;
  return (
    CHAPTERS.find(
      (c) => seat >= c.startSeat && (c.endSeat === null || seat <= c.endSeat),
    ) ?? null
  );
}

// ── the spine's exact formatters, mirrored ─────────────────────────────────
/** Money: full base-unit precision, trailing zeros trimmed to a 2-decimal
 *  minimum, thousands-grouped — so the printed lines SUM. */
function formatAmountExact(raw: string, decimals: number): string | null {
  if (!/^\d+$/.test(raw) || decimals < 0) return null;
  const padded = raw.padStart(decimals + 1, "0");
  const whole = padded.slice(0, padded.length - decimals) || "0";
  let frac = decimals > 0 ? padded.slice(padded.length - decimals).replace(/0+$/, "") : "";
  if (frac.length < 2) frac = frac.padEnd(2, "0");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${grouped}.${frac}`;
}
/** Token units: full precision, trailing zeros trimmed entirely (the
 *  SYN-line voice — "500", "0.5"), thousands-grouped. */
function formatUnitsTrimmed(raw: string, decimals: number): string | null {
  if (!/^\d+$/.test(raw) || decimals < 0) return null;
  const padded = raw.padStart(decimals + 1, "0");
  const whole = padded.slice(0, padded.length - decimals) || "0";
  const frac = decimals > 0 ? padded.slice(padded.length - decimals).replace(/0+$/, "") : "";
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac.length > 0 ? `${grouped}.${frac}` : grouped;
}
function groupInteger(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/** UTC calendar date of chain-verified epoch seconds — never a clock read. */
function utcDate(seconds: number): string | null {
  if (!Number.isInteger(seconds) || seconds <= 0) return null;
  const d = new Date(seconds * 1000);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

const USDC_DECIMALS = 6;
const SYN_DECIMALS = 18;

export interface ReceiptCardFacts {
  readonly seatDisplay: string; // "Member #14"
  readonly chapterChip: string | null; // "Chapter I · Genesis Signal"
  readonly coordinate: string; // "Seat #14 of Chapter I · Era 1"
  readonly totalValue: string; // "$5.00 USDC"
  readonly paidFirst: string | null; // "$0.25" when truly carried
  readonly remainderLead: string | null; // "The remaining $4.75:" / "Your $4.75:"
  readonly splits: readonly (readonly [string, string])[]; // [["Vault · 70%","$3.325"],…]
  readonly synLine: string | null; // "500 SYN received (100 SYN / USDC)"
  readonly sealedLine: string; // "Seat held — written on-chain · 2026-07-13 · block 90,187,059"
  readonly blockDateLine: string; // "block 90,187,059 · 2026-07-13"
  readonly shortTx: string; // "0xa30f…fb50"
  readonly doctrine: string;
  readonly explorerTxUrl: string;
}

/** The house doctrine line (spine mirror — the ticket's own words). */
const DOCTRINE =
  "SYN is the seat — one wallet, one seat; more SYN is footprint, never more seats.";

/**
 * The card's facts from a served row — null when the record cannot express
 * a painted card (no receipt facts / no seat / no clean gross): the route
 * then falls back to the generic site image, nothing invented.
 */
export function cardFactsFor(
  row: OwnPurchaseRow,
  explorerTxUrl: string,
): ReceiptCardFacts | null {
  const f = row.receipt;
  if (f === null || f.seat === null) return null;
  const gross = formatAmountExact(row.usdcGrossRaw, USDC_DECIMALS);
  if (gross === null) return null;

  const chapter = chapterForSeat(f.seat);
  const seatGrouped = groupInteger(f.seat);
  const eraLabel = f.era === null ? null : `Era ${f.era}`;

  const usd = (raw: string | null): string | null => {
    if (raw === null) return null;
    const v = formatAmountExact(raw, USDC_DECIMALS);
    return v === null ? null : `$${v}`;
  };
  const vault = usd(f.vaultRaw);
  const liquidity = usd(f.liquidityRaw);
  const operations = usd(f.operationsRaw);
  const hasSplits = vault !== null && liquidity !== null && operations !== null;
  const paidFirst =
    f.commissionRaw !== null && !/^0+$/.test(f.commissionRaw)
      ? usd(f.commissionRaw)
      : null;
  const remainder = usd(f.netRaw) ?? `$${gross}`;

  const syn = f.synOutRaw !== null ? formatUnitsTrimmed(f.synOutRaw, SYN_DECIMALS) : null;
  const rate =
    f.synPerUsdc !== null && /^\d+$/.test(f.synPerUsdc)
      ? f.synPerUsdc.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : null;

  const date = utcDate(row.sealedAtSec);
  const blockDisplay = `block ${groupInteger(row.blockNumber)}`;

  return {
    seatDisplay: `Member #${seatGrouped}`,
    chapterChip: chapter ? `Chapter ${chapter.roman} · ${chapter.name}` : null,
    coordinate: [
      chapter ? `Seat #${seatGrouped} of Chapter ${chapter.roman}` : `Seat #${seatGrouped}`,
      ...(eraLabel === null ? [] : [eraLabel]),
    ].join(" · "),
    totalValue: `$${gross} USDC`,
    paidFirst,
    remainderLead: hasSplits
      ? paidFirst !== null
        ? `The remaining ${remainder}:`
        : `Your ${remainder}:`
      : null,
    splits: hasSplits
      ? [
          ["Vault · 70%", vault],
          ["Liquidity · 20%", liquidity],
          ["Operations · 10%", operations],
        ]
      : [],
    synLine:
      syn !== null
        ? `${syn} SYN received${rate !== null ? ` (${rate} SYN / USDC)` : ""}`
        : null,
    sealedLine: `Seat held — written on-chain${date ? ` · ${date}` : ""} · ${blockDisplay}`,
    blockDateLine: `${blockDisplay}${date ? ` · ${date}` : ""}`,
    shortTx: `${row.transactionHash.slice(0, 6)}…${row.transactionHash.slice(-4)}`,
    doctrine: DOCTRINE,
    explorerTxUrl,
  };
}
