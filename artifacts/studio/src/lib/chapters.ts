// chapters.ts — narrative chapters, a member's story-coordinate.
// ---------------------------------------------------------------------------
// A chapter is a PURE, deterministic function of the member's seat number.
// RECOGNITION ONLY (SEASONS_ENGINE doctrine): a chapter is "when you joined the
// story" — it is NEVER a rank, a tier, or a financial advantage. Earlier is NOT
// "better"; a chapter carries no economic or monetary benefit of any kind — it is
// purely narrative recognition. Boundaries are canon
// (docs/direction/SEASONS_ENGINE_ON_SYNDICATE_OS.md §3). Own-row by construction:
// this reads ONLY the member's own seat number
// (already known client-side) — it is not a directory or a lookup of anyone else,
// makes no network call, and touches no address.

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

// The 5 chapters, by member number. Frozen canon — do not reorder or renumber.
export const CHAPTERS: readonly Chapter[] = [
  { roman: "I", name: "Genesis Signal", startSeat: 1, endSeat: 333 },
  { roman: "II", name: "First Thousand", startSeat: 334, endSeat: 1000 },
  { roman: "III", name: "The Expansion", startSeat: 1001, endSeat: 3333 },
  { roman: "IV", name: "First Ten Thousand", startSeat: 3334, endSeat: 10000 },
  { roman: "V", name: "Open Era", startSeat: 10001, endSeat: null },
];

/**
 * The narrative chapter for a seat number. Pure + deterministic. Fails closed to
 * null for a non-integer / non-positive / unparseable seat — never a fabricated
 * chapter (memberNumber 0 is a sentinel, never a seat).
 */
export function chapterForSeat(seat: number | string | null | undefined): Chapter | null {
  const n = typeof seat === "string" ? Number(seat) : (seat ?? NaN);
  if (!Number.isInteger(n) || (n as number) < 1) return null;
  return (
    CHAPTERS.find(
      (c) => (n as number) >= c.startSeat && (c.endSeat === null || (n as number) <= c.endSeat),
    ) ?? null
  );
}
