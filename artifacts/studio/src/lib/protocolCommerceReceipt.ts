// protocolCommerceReceipt.ts — the kind-extensible protocol receipt spine.
// ---------------------------------------------------------------------------
// THE TICKET (founder-approved wireframe, 2026-07-16): a purchase's solemn
// paper — zones A–G + identity head + living zone + next door. This module is
// the PURE data layer: it maps a CONFIRMED on-chain event's own fields to a
// render model and computes NOTHING financial.
//
// THE HARD FILTERS (engraved at build, per the GO'd plan — never relax):
//   • THE MIRROR FILTER: a receipt is born ONLY from a confirmed, decoded
//     on-chain event (a mined transaction's own logs, or an indexed row).
//     There is deliberately NO status field on a ticket — PARTIAL / PREVIEW /
//     speculative shapes cannot exist here because the type cannot express
//     them. If it isn't confirmed, no ticket exists.
//   • NO RECOMPUTE: every figure is the event's OWN field, formatted verbatim
//     with exact string math. This module never multiplies, divides, sums or
//     derives an amount. The 70/20/10 percentages appear ONLY inside label
//     text — they are the protocol's published routing names, not arithmetic.
//   • TICKET AMOUNTS ARE EXACT (ADR-001): full base-unit precision, trailing
//     zeros trimmed to a 2-decimal minimum ($5.00 · $3.325 · $0.475) so the
//     printed lines SUM. The floored dashboard display rule does not apply —
//     a receipt is an accounting document.
//   • ORDINAL HONESTY: the witness line exists only when the caller passes a
//     REAL one (a class the record truly carries). This module never invents,
//     defaults, or embellishes one; absence renders as absence.
//   • ONE DOOR MAX: the next-door field is a single optional door, decided by
//     the caller from the wallet's REAL state — never a list, never a pitch.
//
// THE ROADMAP (engraved, builds at its own gates — never silently begun):
//   V1 = the checkout-success ticket (BUILT) → the public /receipt/{txHash}
//   page (BUILT 2026-07-20 — every receipt's permanent address, one rendering
//   path; the dedicated PDF engine stays its own rider — founder default,
//   print already saves clean). Next, in order: the LIVING TICKET (the ticket
//   re-reads the record and gains lines the seat later earns) →
//   receipt-as-artifact (the audit's lens-12 option).
//
// Kind-extensible: "membership" ships first; every future protocol commerce
// class (artifact mint, …) adds a kind + builder HERE, in the same slice that
// introduces it — one spine, never parallel receipt models.

import { CHAPTERS, chapterForSeat } from "@/lib/chapters";
import { formatRawUnits } from "@/lib/rawUnits";

/** Every protocol commerce class that can print a ticket. Extend per slice. */
export type ReceiptKind = "membership";

/**
 * EVOLUTIVE PRODUCT NAMING (founder correction, 2026-07-17): the item line's
 * product name derives from the receipt KIND — never hardcoded prose in a
 * surface. A future kind (artifact mint, …) adds its own product name HERE,
 * in the same slice that introduces the kind.
 */
export const RECEIPT_PRODUCT_NAMES: Record<ReceiptKind, string> = {
  membership: "Membership",
};

/** The document title per kind — a buyer's words, never machine plumbing. */
export const RECEIPT_DOC_TITLES: Record<ReceiptKind, string> = {
  membership: "Membership receipt — proof of purchase",
};

/** The confirmed transaction anchor — the ticket's signature. */
export interface ReceiptProof {
  /** The mined transaction hash (0x + 64 hex). */
  readonly txHash: string;
  /** The block the event was sealed in, as a plain integer string. */
  readonly blockNumber: string;
  /** Ready-to-open explorer URL for the transaction, or null when the
   *  verified explorer base could not be resolved (the hash still renders). */
  readonly explorerTxUrl: string | null;
}

/** One printed money line. `value` is a finished display string. */
export interface ReceiptMoneyLine {
  readonly label: string;
  readonly value: string;
  /** Indented = a routing detail under its parent figure. */
  readonly indent: boolean;
}

/** One printed context line (seat zone). */
export interface ReceiptContextLine {
  readonly label: string;
  readonly value: string;
  /** Emphasized (the seat line). */
  readonly em?: boolean;
  /** Muted suffix rendered after the value (e.g. the engine's own rate). */
  readonly suffix?: string;
}

/** THE ONE DOOR — a single next step, decided from the wallet's REAL state. */
export interface ReceiptDoor {
  readonly title: string;
  readonly body: string;
  /** Internal route (wouter). */
  readonly href: string;
}

/** The finished render model the ticket component consumes verbatim. */
export interface MembershipReceiptModel {
  readonly kind: "membership";
  readonly head: {
    readonly protocol: string;
    readonly protocolSub: string;
    readonly docTitle: string;
    readonly chainLine: string;
    /** "Chapter I · Genesis Signal", or null when the seat has no chapter. */
    readonly chapterChip: string | null;
  };
  readonly context: {
    /** UTC calendar date of the sealing block, or null when the block
     *  timestamp could not be read (the block number still anchors). */
    readonly dateUtc: string | null;
    readonly blockDisplay: string;
    /** Null when the event predates eras (V1) — absence renders as absence. */
    readonly eraLabel: string | null;
  };
  readonly seatLines: readonly ReceiptContextLine[];
  /** THE COMMERCE BLOCK (founder correction, 2026-07-17) — the buyer's own
   *  story first: what I bought, what I paid. */
  readonly commerce: {
    /** The product line: kind-derived product name + the seat, priced. */
    readonly itemLine: { readonly label: string; readonly value: string };
    readonly total: { readonly label: string; readonly value: string };
  };
  /** THE PROOF BLOCK — our signature: where the money went, inside the
   *  buyer's own transaction. Every figure is the event's own field. NULL
   *  when the event never carried its splits (⑫ honest absence — e.g. a
   *  V2a/V2b `Purchased` row before its `Routed` pairing): the zone simply
   *  does not print, it never guesses. */
  readonly moneyProof: {
    readonly title: string;
    readonly subtitle: string;
    /** The referrer-paid-first line, or null when the event carried none. */
    readonly paidFirstLine: ReceiptMoneyLine | null;
    /** The plain-words lead over the split ("The remaining $4.75:"). */
    readonly remainderLead: string;
    readonly splitLines: readonly ReceiptMoneyLine[];
  } | null;
  readonly living: {
    /** The seat's story coordinate. */
    readonly coordinate: string;
    /** A REAL witnessed class, or null — never invented (ordinal honesty). */
    readonly witnessLine: string | null;
    readonly doctrine: string;
  };
  readonly proof: ReceiptProof;
}

/**
 * A confirmed membership purchase's OWN fields, verbatim, as decoded from a
 * mined transaction's logs (JoinCheckout law 4) or an indexed row. Raw
 * base-unit strings — no floats anywhere.
 *
 * ⑫ EVERY PAST PURCHASE HAS ITS TICKET (founder, 2026-07-17): the spine
 * covers the WHOLE indexed history — ALL FOUR on-chain engines (the
 * AUD-TRUTH-3 four-engines truth; no bare "V2" exists), not only V3
 * checkouts:
 *   · V1 `TokensPurchased` (0x0020Df…) — buyer, gross, SYN and the three
 *     splits, but NO seat (the frozen-roster join supplies it), NO era, NO
 *     rate, NO referral fields;
 *   · V2a (0x0b883F…, seats #3–#5) and V2b (0x507E9c…) — both emit
 *     `Purchased` (seat · era · rate · gross · SYN · firstSeat) with the
 *     splits in the PAIRED `Routed` event of the same transaction; that
 *     two-event fold rides the A1 receipt-binder slice, so a Purchased-alone
 *     ticket prints NO proof block rather than a guessed one;
 *   · V3 `MembershipPurchasedV3` — the full 25-field receipt.
 * HONEST ABSENCE is the law here: an optional field is null when the event
 * never carried it, and the ticket renders ABSENCE — never a guess, never a
 * recompute. Chain-verified references: the protocol's FIRST purchase (V1,
 * block 87,158,947, 2026-06-04 — $5.00 → $3.50/$1.00/$0.50, splits summing
 * to the gross exactly) and seat #3's birth (V2a, block 88,105,075,
 * 2026-06-15 — its `Routed` pairing carries the same exact splits).
 */
export interface ConfirmedMembershipPurchase {
  readonly memberNumber: string;
  /** The seat's holder: a full 40-hex address (checkout's decoded log —
   *  rendered short) OR an already-short ADR-003 form from an own-row read
   *  (rendered verbatim; the server never serves the full form). */
  readonly recipient: string;
  readonly grossUsdcRaw: string;
  /** V3 only — null on engines that never carried a referral figure. */
  readonly acquisitionCostRaw: string | null;
  /** V3 only — older engines never emitted a net figure. */
  readonly protocolContributionRaw: string | null;
  /** V1+V3 emit the splits on the purchase event; V2a/V2b's live in `Routed`. */
  readonly vaultAmountRaw: string | null;
  readonly liquidityAmountRaw: string | null;
  readonly operationsAmountRaw: string | null;
  readonly synOutRaw: string | null;
  /** The engine's own rate field (plain integer, SYN per USDC); V1: null. */
  readonly synPerUsdc: string | null;
  /** V2a/V2b/V3 only — V1 predates eras; null renders NO era, never "Era 1". */
  readonly era: number | null;
  readonly firstSeat: boolean | null;
  /** bytes32; the zero id means "no introduction on this purchase". */
  readonly sourceId: string | null;
  /** The referrer: a full 40-hex address (checkout's decoded log — rendered
   *  short) OR an already-short ADR-003 form from an own-row read (`0x244…c721`
   *  — rendered verbatim; the server never serves the full form). */
  readonly sourceWallet: string | null;
}

/** ADR-003 short referrer form (`0x` + 3 hex + `…` + 4 hex). */
const SHORT_REF_RE = /^0x[0-9a-fA-F]{3}…[0-9a-fA-F]{4}$/;

export interface MembershipReceiptInput {
  readonly event: ConfirmedMembershipPurchase;
  readonly proof: ReceiptProof;
  /** Sealing-block UNIX timestamp (seconds) when readable, else null. */
  readonly blockTimestamp: number | null;
  readonly usdcDecimals: number;
  readonly synDecimals: number;
  /** A REAL witnessed line when the record truly carries one; the V3
   *  purchase event itself carries none, so checkout passes nothing. */
  readonly witnessLine?: string | null;
}

const ZERO_BYTES32 = `0x${"0".repeat(64)}`;

/**
 * TICKET AMOUNTS ARE EXACT: render a raw base-unit amount at full precision,
 * trailing zeros trimmed to a 2-decimal minimum. Pure string math — the
 * value IS the event's field, re-based, never rounded.
 */
export function formatAmountExact(raw: string, decimals: number): string | null {
  if (!/^\d+$/.test(raw) || decimals < 0) return null;
  const padded = raw.padStart(decimals + 1, "0");
  const whole = padded.slice(0, padded.length - decimals) || "0";
  let frac = decimals > 0 ? padded.slice(padded.length - decimals).replace(/0+$/, "") : "";
  if (frac.length < 2) frac = frac.padEnd(2, "0");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${grouped}.${frac}`;
}

/** Thousands-grouped plain integer display (block numbers, seats). */
export function groupInteger(raw: string): string {
  if (!/^\d+$/.test(raw)) return raw;
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** UTC calendar date (YYYY-MM-DD) of a UNIX-seconds timestamp. */
function utcDate(seconds: number): string {
  const d = new Date(seconds * 1000);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

const SHORT = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

/** The house doctrine line every membership ticket carries. */
export const TICKET_DOCTRINE =
  "SYN is the seat — one wallet, one seat; more SYN is footprint, never more seats.";

/**
 * Build the membership ticket model from a confirmed purchase event.
 * Every figure below is the event's own field passed through exact
 * formatting — nothing is computed, summed, or derived here.
 */
export function buildMembershipReceipt(
  input: MembershipReceiptInput,
): MembershipReceiptModel | null {
  const { event: ev, proof, blockTimestamp, usdcDecimals, synDecimals } = input;

  // THE MIRROR FILTER: no confirmed anchor → no ticket, ever.
  if (!/^0x[0-9a-fA-F]{64}$/.test(proof.txHash)) return null;
  if (!/^\d+$/.test(proof.blockNumber)) return null;

  const usd = (raw: string | null) => {
    if (raw === null) return null;
    const v = formatAmountExact(raw, usdcDecimals);
    return v === null ? null : `$${v}`;
  };
  const gross = usd(ev.grossUsdcRaw);
  const acquisition = usd(ev.acquisitionCostRaw);
  const remainder = usd(ev.protocolContributionRaw);
  const vault = usd(ev.vaultAmountRaw);
  const liquidity = usd(ev.liquidityAmountRaw);
  const operations = usd(ev.operationsAmountRaw);
  // Fail closed on the COMMERCE truth: a ticket without its gross cannot
  // exist. Optional fields degrade to honest absence instead (⑫).
  if (!gross) return null;

  const chapter = chapterForSeat(ev.memberNumber);
  const seatDisplay = groupInteger(ev.memberNumber);

  const hasIntroduction =
    ev.sourceId !== null &&
    ev.sourceWallet !== null &&
    ev.sourceId.toLowerCase() !== ZERO_BYTES32 &&
    ((/^0x[0-9a-fA-F]{40}$/.test(ev.sourceWallet) &&
      !/^0x0{40}$/.test(ev.sourceWallet)) ||
      SHORT_REF_RE.test(ev.sourceWallet));
  // The paid-to-referrer line prints only when the event truly carried one.
  const hasSourcePayment =
    hasIntroduction &&
    acquisition !== null &&
    ev.acquisitionCostRaw !== null &&
    !/^0+$/.test(ev.acquisitionCostRaw);

  const seatLines: ReceiptContextLine[] = [
    { label: "Seat", value: `Member #${seatDisplay}`, em: true },
    {
      label: "Holder",
      // A served short form prints verbatim (it IS the fact); a full
      // address prints in the ticket's own short form. Display only.
      value: SHORT_REF_RE.test(ev.recipient) ? ev.recipient : SHORT(ev.recipient),
    },
  ];
  if (ev.synOutRaw !== null) {
    seatLines.push({
      label: "SYN received",
      value: `${formatRawUnits(ev.synOutRaw, synDecimals)} SYN`,
      suffix:
        ev.synPerUsdc !== null && /^\d+$/.test(ev.synPerUsdc)
          ? `(${groupInteger(ev.synPerUsdc)} SYN / USDC)`
          : undefined,
    });
  }
  if (hasIntroduction && ev.sourceWallet !== null) {
    // A short form renders verbatim (it IS the served fact); a full address
    // renders in the ticket's own short form. Display only — never derived.
    const refDisplay = SHORT_REF_RE.test(ev.sourceWallet)
      ? ev.sourceWallet
      : SHORT(ev.sourceWallet);
    seatLines.push({ label: "Referral", value: `brought by ${refDisplay}` });
  }

  // THE COMMERCE BLOCK — the buyer's perspective: the product bought at its
  // price, then the total paid. Item price and total are BOTH the event's own
  // gross field (one product, one price) — the lines close by construction.
  const productName = RECEIPT_PRODUCT_NAMES.membership;
  const itemLine = {
    label: `${productName} — Seat #${seatDisplay}`,
    value: gross,
  };

  // THE PROOF BLOCK — our signature. The remainder figure is the event's OWN
  // protocolContribution field (never gross-minus-anything computed here);
  // on engines that never emitted a net figure (V1), the lead speaks the
  // gross field itself — chain-verified: V1 splits sum to the gross exactly.
  // The whole block is NULL unless the event carried ALL THREE splits (⑫).
  const moneyProof =
    vault !== null && liquidity !== null && operations !== null
      ? {
          title: "WHERE YOUR MONEY WENT",
          subtitle: "— in your own transaction",
          paidFirstLine: hasSourcePayment
            ? ({ label: "Referral · paid first", value: acquisition, indent: false } as ReceiptMoneyLine)
            : null,
          remainderLead: hasSourcePayment
            ? `The remaining ${remainder ?? gross}:`
            : `Your ${remainder ?? gross}:`,
          splitLines: [
            { label: "Vault · 70%", value: vault, indent: true },
            { label: "Liquidity · 20%", value: liquidity, indent: true },
            { label: "Operations · 10%", value: operations, indent: true },
          ] as ReceiptMoneyLine[],
        }
      : null;

  const eraLabel = ev.era === null ? null : `Era ${ev.era}`;

  return {
    kind: "membership",
    head: {
      protocol: "THE SYNDICATE",
      protocolSub: "ON-CHAIN MEMBERSHIP PROTOCOL",
      docTitle: RECEIPT_DOC_TITLES.membership,
      chainLine: "Avalanche C-Chain (43114)",
      chapterChip: chapter ? `Chapter ${chapter.roman} · ${chapter.name}` : null,
    },
    context: {
      dateUtc: blockTimestamp !== null && blockTimestamp > 0 ? utcDate(blockTimestamp) || null : null,
      blockDisplay: `block ${groupInteger(proof.blockNumber)}`,
      eraLabel,
    },
    seatLines,
    commerce: {
      itemLine,
      total: { label: "TOTAL PAID", value: `${gross} USDC` },
    },
    moneyProof,
    living: {
      coordinate: [
        chapter ? `Seat #${seatDisplay} of Chapter ${chapter.roman}` : `Seat #${seatDisplay}`,
        ...(eraLabel === null ? [] : [eraLabel]),
      ].join(" · "),
      witnessLine: input.witnessLine ?? null,
      doctrine: TICKET_DOCTRINE,
    },
    proof,
  };
}

// Re-exported so the ticket's chapter chip and the living coordinate can be
// asserted against the same frozen canon the rest of the app reads.
export { CHAPTERS };
