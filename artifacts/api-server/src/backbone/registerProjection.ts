/**
 * THE REGISTER — the public per-seat register (founder order 2026-07-30).
 * ---------------------------------------------------------------------------
 * THE LAW THIS PAGE LIVES UNDER (CANON_VISIBILITY_LAW + ADR-003, the
 * 2026-07-25 address-model rescope, quoted): « "The Register" (/registry) —
 * registre public par siège #N · 0x…↗ · chapitre · rung · joined — est
 * PERMIS (adresse-seulement, zéro identité). » Seat → ADDRESS is public,
 * verifiable chain data we SHOW — a transparent business hides nothing the
 * chain already proves. The forbidden artifact remains the name↔address
 * directory; no identity field exists anywhere in this projection.
 *
 * ONE AUTHORITY PER FACT (never a second derivation):
 *   · seat → wallet   — the seat's EARLIEST indexed purchase (the activity
 *                       heartbeat items carry buyer + seat ordinal), and for
 *                       the genesis seats the Merkle-frozen roster
 *                       (GENESIS_SEAT_BY_WALLET — committed on-chain behind
 *                       V1_MEMBER_ROOT). ⛔ NOT the season standings: the
 *                       board is ONE ROW PER WALLET (§0.14-A), so a wallet
 *                       holding two seats (the #7/#11 overlap) collapses
 *                       there — the first build lost a seat exactly that way
 *                       (13 rows for 14 seats, caught on the rig).
 *   · rung            — the capital axis walk's end state (standingBySeat).
 *   · joined          — the earliest indexed purchase day. A genesis seat
 *                       whose rows predate the indexed streams has NO
 *                       derivable day and serves null — an honest absence.
 *   · short form / explorer link — the feed projection's shortForm and the
 *                       canon addressUrl (never rebuilt here).
 *   · chapter         — derived from GENESIS_SIGNAL_SEAT_CEILING (the same
 *                       declaration the seats-333 milestone reads). A seat
 *                       BEYOND the known chapter table fails the build closed
 *                       (extend the table deliberately; never serve a guess).
 *
 * Fail-closed and address-safe by the same gates as the feed: the route
 * serializes through the feed's address-safety assertion; every row carries
 * the full wallet + explorerUrl (the 2026-07-25 law — short form is DISPLAY,
 * the full address is what makes a row verifiable).
 */

import { GENESIS_SIGNAL_SEAT_CEILING } from "./milestoneReadmodel";
import { shortForm } from "./feedProjection";
import { addressUrl } from "../canon/the-syndicate/chain/chain-registry";

// STRUCTURALLY NARROW inputs — the projection depends on exactly the fields
// it reads (the real CapitalBuildResult / ActivityBuildResult satisfy
// these), so the guard's fixtures stay honest and small instead of faking
// whole build results.
export interface RegisterCapitalInput {
  readonly standingBySeat: readonly { readonly seatNumber: number; readonly rung: string }[];
}
export interface RegisterActivityInput {
  readonly items: readonly {
    readonly memberNumber: number | null;
    readonly memberAddress: string | null;
    readonly blockNumber: number;
    readonly logIndex: number;
    readonly isoDayUtc: string;
  }[];
}

export interface PublicRegisterRow {
  /** Public seat ordinal ("#N" is the display form the page derives). */
  readonly seat: number;
  /** THE full chain-emitted address (2026-07-25 address law). */
  readonly wallet: string;
  /** Chain-emitted short form — what the page displays beside the link. */
  readonly shortForm: string;
  /** The row's Snowtrace address page, built server-side from canon. */
  readonly explorerUrl: string;
  /** The seat's chapter (from the ONE ceiling declaration). */
  readonly chapter: string;
  /** Capital-axis rung, or null when the seat has no walked standing yet. */
  readonly rung: string | null;
  /** UTC day of the seat's earliest INDEXED purchase; null = the seat's
   *  history predates the indexed streams (genesis) — honest absence. */
  readonly joinedIsoDay: string | null;
}

export interface PublicRegisterModel {
  readonly module: "the-register";
  readonly state: "LIVE" | "DARK";
  readonly seatsTotal: number;
  readonly chapterCeiling: number;
  readonly rows: readonly PublicRegisterRow[];
  readonly honesty: string;
}

const HONESTY_LINE =
  "Every row is public chain data: the purchase transaction wrote the seat, the address is the buyer's own, and the explorer link is the proof. Address-only by design — no name, alias, or email exists anywhere in this system. A dash is an honest absence, never a hidden value.";

function fail(msg: string): never {
  throw new Error(`register projection failed closed: ${msg}`);
}

function chapterFor(seat: number): string {
  if (seat >= 1 && seat <= GENESIS_SIGNAL_SEAT_CEILING) {
    return "Chapter I · Genesis Signal";
  }
  // A seat beyond the known chapter table is a NEW ERA the register must
  // describe deliberately — never with a guessed label.
  fail(
    `seat #${seat} is beyond the known chapter table (ceiling ${GENESIS_SIGNAL_SEAT_CEILING}); extend chapterFor() in the same commit as the era`,
  );
}

export function buildPublicRegister(input: {
  readonly capital: RegisterCapitalInput | null;
  readonly activity: RegisterActivityInput | null;
  /** The Merkle-frozen genesis roster: lowercase wallet → seat #1–#8. */
  readonly genesisSeatByWallet: ReadonlyMap<string, number>;
}): PublicRegisterModel {
  const { capital, activity, genesisSeatByWallet } = input;
  if (activity === null) {
    return {
      module: "the-register",
      state: "DARK",
      seatsTotal: 0,
      chapterCeiling: GENESIS_SIGNAL_SEAT_CEILING,
      rows: [],
      honesty: HONESTY_LINE,
    };
  }

  // rung by seat — the capital walk's end state, never recomputed here.
  const rungBySeat = new Map<number, string>();
  for (const s of capital?.standingBySeat ?? []) {
    rungBySeat.set(s.seatNumber, s.rung);
  }

  // seat → (wallet, joined day) from the EARLIEST indexed purchase — chain
  // order via (block, logIndex), never array order.
  const earliestBySeat = new Map<
    number,
    { wallet: string; day: string; block: number; logIndex: number }
  >();
  for (const item of activity.items) {
    if (item.memberNumber === null || item.memberAddress === null) continue;
    const prev = earliestBySeat.get(item.memberNumber);
    if (
      prev === undefined ||
      item.blockNumber < prev.block ||
      (item.blockNumber === prev.block && item.logIndex < prev.logIndex)
    ) {
      earliestBySeat.set(item.memberNumber, {
        wallet: item.memberAddress,
        day: item.isoDayUtc,
        block: item.blockNumber,
        logIndex: item.logIndex,
      });
    }
  }

  // The seat set: indexed purchases ∪ the frozen genesis roster. A wallet
  // holding BOTH a genesis seat and a purchased seat yields TWO rows — the
  // register is BY SEAT (the season board, one-row-per-wallet by §0.14-A,
  // is deliberately NOT the source here).
  const walletBySeat = new Map<number, { wallet: string; day: string | null }>();
  for (const [seat, e] of earliestBySeat) {
    walletBySeat.set(seat, { wallet: e.wallet, day: e.day });
  }
  for (const [wallet, seat] of genesisSeatByWallet) {
    if (!walletBySeat.has(seat)) walletBySeat.set(seat, { wallet, day: null });
  }

  const rows: PublicRegisterRow[] = [];
  for (const [seat, w] of walletBySeat) {
    if (!/^0x[0-9a-f]{40}$/.test(w.wallet)) fail(`seat #${seat} wallet is not a lowercase full address`);
    const explorerUrl = addressUrl(w.wallet);
    if (explorerUrl === null || !explorerUrl.includes("/address/")) {
      fail(`seat #${seat} explorer link could not be built from canon`);
    }
    const short = shortForm(w.wallet);
    if (short === null) fail(`seat #${seat} short form could not be built`);
    rows.push({
      seat,
      wallet: w.wallet,
      shortForm: short,
      explorerUrl,
      chapter: chapterFor(seat),
      rung: rungBySeat.get(seat) ?? null,
      joinedIsoDay: w.day,
    });
  }
  rows.sort((a, b) => a.seat - b.seat);

  return {
    module: "the-register",
    state: "LIVE",
    seatsTotal: rows.length,
    chapterCeiling: GENESIS_SIGNAL_SEAT_CEILING,
    rows,
    honesty: HONESTY_LINE,
  };
}
