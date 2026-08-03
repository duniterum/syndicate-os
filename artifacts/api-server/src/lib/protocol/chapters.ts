/**
 * lib/protocol/chapters.ts — the server's ONE narrative chapter table.
 * ---------------------------------------------------------------------------
 * A chapter is "when you joined the story" — RECOGNITION ONLY (SEASONS_ENGINE
 * doctrine): never a rank, a tier, or a financial advantage. Boundaries are
 * frozen canon (docs/direction/SEASONS_ENGINE_ON_SYNDICATE_OS.md §3) — never
 * reordered, never renumbered.
 *
 * DECLARED CROSS-ARTIFACT MIRROR (the USDC-base pattern): the studio carries
 * the same frozen table (`artifacts/studio/src/lib/chapters.ts`) because
 * client and server cannot import each other. backbone.guard pins this file's
 * rows against the studio source VALUE BY VALUE — drift is a RED BUILD, not a
 * style choice. When canon ever moves, BOTH files move in the same commit.
 *
 * HISTORY (2026-08-02): before this module the server held the chapter fact
 * TWICE — receiptcard/cardFacts.ts carried the full five-chapter mirror while
 * registerProjection.ts privately re-derived a PARTIAL copy (Chapter I only)
 * that threw on seat #334 and darkened the whole public register. One table,
 * imported everywhere, ends that class.
 */

export interface Chapter {
  /** Roman numeral I–V. */
  readonly roman: string;
  /** Narrative name shown to the member. */
  readonly name: string;
  /** First seat in the chapter (inclusive). */
  readonly startSeat: number;
  /** Last seat in the chapter (inclusive); null = open-ended (Open Era). */
  readonly endSeat: number | null;
}

// Each sealed chapter's final seat — ONE numeral each, the table below and
// the milestone rungs (seats-333/1000/3333/10000) all read these.
/** Chapter I (Genesis Signal) seals forever at this seat. */
export const GENESIS_SIGNAL_SEAT_CEILING = 333;
/** Chapter II (First Thousand) seals forever at this seat. */
export const FIRST_THOUSAND_SEAT_CEILING = 1000;
/** Chapter III (The Expansion) seals forever at this seat. */
export const EXPANSION_SEAT_CEILING = 3333;
/** Chapter IV (First Ten Thousand) seals forever at this seat. */
export const FIRST_TEN_THOUSAND_SEAT_CEILING = 10000;

// The 5 chapters, by seat number. Frozen canon — do not reorder or renumber.
// Start seats derive from the previous ceiling so adjacency is structural.
export const CHAPTERS: readonly Chapter[] = [
  { roman: "I", name: "Genesis Signal", startSeat: 1, endSeat: GENESIS_SIGNAL_SEAT_CEILING },
  { roman: "II", name: "First Thousand", startSeat: GENESIS_SIGNAL_SEAT_CEILING + 1, endSeat: FIRST_THOUSAND_SEAT_CEILING },
  { roman: "III", name: "The Expansion", startSeat: FIRST_THOUSAND_SEAT_CEILING + 1, endSeat: EXPANSION_SEAT_CEILING },
  { roman: "IV", name: "First Ten Thousand", startSeat: EXPANSION_SEAT_CEILING + 1, endSeat: FIRST_TEN_THOUSAND_SEAT_CEILING },
  { roman: "V", name: "Open Era", startSeat: FIRST_TEN_THOUSAND_SEAT_CEILING + 1, endSeat: null },
];

/**
 * THE STORY'S FINAL SEAT — narrative canon, the declared mirror of the studio's
 * `STORY_FINAL_SEAT` (artifacts/studio/src/lib/chapters.ts). Its origin is the
 * engraved membership ladder's final rung — PROTOCOL_MILESTONES `seats-1000000`,
 * "THE FINAL SEAT — #1,000,000 sealed". Declared here rather than imported so
 * the share-card zone never has to pull the backbone in to paint a card.
 * Recognition arithmetic ONLY — never a supply, price, or promise figure.
 */
export const STORY_FINAL_SEAT = 1_000_000;

/**
 * The narrative chapter for a seat number. Pure + deterministic. Fails closed
 * to null for a non-integer / non-positive seat — never a fabricated chapter
 * (memberNumber 0 is a sentinel, never a seat). Chapter V is open-ended, so
 * every real seat resolves forever.
 */
export function chapterForSeat(seat: number): Chapter | null {
  if (!Number.isInteger(seat) || seat < 1) return null;
  return (
    CHAPTERS.find(
      (c) => seat >= c.startSeat && (c.endSeat === null || seat <= c.endSeat),
    ) ?? null
  );
}

/** The one chip/display form both the receipts and the register speak. */
export function chapterChipLabel(c: Chapter): string {
  return `Chapter ${c.roman} · ${c.name}`;
}
