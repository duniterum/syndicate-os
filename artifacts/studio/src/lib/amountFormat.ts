// amountFormat.ts — THE ONE TRUNCATION. Every token amount a human reads on
// this site is projected from its raw base units by the primitive below.
// `guard-one-figure` makes a second projection a RED BUILD.
// ---------------------------------------------------------------------------
// THE DEFECT (live in prod until 2026-07-26, and WIDER than it first looked).
// Four independent projections of the same money coexisted and disagreed:
//   · /activity                     truncated   → 0.026551 WETH.e
//   · /contracts assets card        rounded up  → 0.026552 WETH.e
//   · the PUBLIC HOME reserves band rounded up  → 0.026552 WETH.e  (Number + Intl,
//     whose default rounding mode is halfExpand — half-up by another name)
//   · lib/rawUnits (member wallet, checkout) truncated but with NO floor
// The vault's holding had not moved between those reads. A member opening two
// tabs of the same site saw two different numbers for the same coins — the exact
// cross-surface mismatch the ONE-AUTHORITY rule exists to prevent, on a site
// whose whole promise is that every figure is checkable against the chain.
//
// THE RULE, settled 2026-07-26: TRUNCATE. Rounding up states MORE money than the
// protocol (or the member) holds — chain-refutable in one click. Truncation can
// only ever under-state. Fail-closed governs arithmetic exactly as it governs
// sentences. This is not a new law: lib/rawUnits.ts had already written it down
// ("a money display must never overstate what the wallet holds"); it simply was
// not the only implementation. Now it is.
//
// TRUNCATION'S ONE HAZARD is printing a flat `0` for a real holding — which was
// LIVE: a member holding 0.004 SYN read "0" on their own wallet panel, and a
// burn under 1 SYN published "0 SYN was retired … gone for everyone, forever".
// Every display helper here carries the `< 0.0…1` floor. Honest dust, never a
// false zero.
//
// ── WHAT THIS MODULE DOES NOT OWN (stated so the boundary is never guessed) ──
// · EXACT rendering — `rawUnits.formatRawUnits` and
//   `protocolCommerceReceipt.formatAmountExact` show a value in FULL, not at a
//   display precision. Different job, legitimately separate; the receipt pair
//   (studio + its api-server twin) is pinned by `guard-receipt-ticket`.
// · USD VALUATION — a fiat figure derived by multiplying an amount by a live
//   price is float maths on a DERIVED quantity, not a projection of base units.
//   It stays in the components that compute it.
// · PERCENTAGES, basis points and SVG geometry are not money.

/**
 * THE ONE TRUNCATION. Raw base units → the integer count of 10^-display units,
 * floored. Null on malformed input — fail-closed, nothing invented.
 * Every display helper on this site is built on THIS function.
 */
export function truncateToDisplayUnits(
  raw: string | null | undefined,
  decimals: number,
  displayDecimals: number,
): bigint | null {
  if (typeof raw !== "string" || !/^[0-9]+$/.test(raw)) return null;
  let value: bigint;
  try {
    value = BigInt(raw);
  } catch {
    return null;
  }
  const display = clampDisplay(decimals, displayDecimals);
  // Floored, never rounded: there is deliberately no half-up step here.
  return value / 10n ** BigInt(decimals - display);
}

/** The display precision actually used, once clamped to the token's own decimals. */
export function clampDisplay(decimals: number, displayDecimals: number): number {
  if (!Number.isFinite(displayDecimals) || displayDecimals <= 0) return 0;
  return Math.min(Math.floor(displayDecimals), Math.max(decimals, 0));
}

/** The `< 0.0…1` text for a precision — what a real holding reads instead of `0`. */
export function dustFloorText(display: number): string {
  return display > 0 ? `< 0.${"0".repeat(display - 1)}1` : "< 1";
}

function isZeroText(shown: string): boolean {
  return /^0(\.0*)?$/.test(shown.replace(/,/g, ""));
}

/**
 * Raw base units → a FIXED-decimal display string, BigInt-safe and truncated.
 * Keeps trailing zeros ("50.00"). Null on malformed input.
 * Prefer `formatAmount` on any surface where the value can be small.
 */
export function formatBaseUnits(
  raw: string | null | undefined,
  decimals: number,
  displayDecimals: number,
): string | null {
  const units = truncateToDisplayUnits(raw, decimals, displayDecimals);
  if (units === null) return null;
  const display = clampDisplay(decimals, displayDecimals);
  const base = 10n ** BigInt(display);
  const wholeText = (units / base).toLocaleString("en-US");
  if (display <= 0) return wholeText;
  return `${wholeText}.${(units % base).toString().padStart(display, "0")}`;
}

/**
 * The same figure with the FALSE-ZERO FLOOR: a non-zero holding that truncates
 * to all zeros renders `< 0.0…1` (or `< 1`) rather than a flat `0` that would
 * read as "nothing".
 */
export function formatAmount(
  raw: string | null | undefined,
  decimals: number,
  displayDecimals: number,
): string | null {
  const shown = formatBaseUnits(raw, decimals, displayDecimals);
  if (shown === null) return null;
  if (!isZeroText(shown)) return shown;
  // An all-zero RAW is a true zero and says so; only a real holding gets the floor.
  if (typeof raw !== "string" || /^0+$/.test(raw)) return shown;
  return dustFloorText(clampDisplay(decimals, displayDecimals));
}

/** Sum raw base-unit strings exactly. Null if ANY leg is missing — a partial
 *  sum is a wrong figure, and a wrong figure is worse than an honest gap. */
export function sumRawUnits(legs: (string | null | undefined)[]): string | null {
  let total = 0n;
  for (const leg of legs) {
    if (typeof leg !== "string" || !/^[0-9]+$/.test(leg)) return null;
    total += BigInt(leg);
  }
  return total.toString();
}

/**
 * A share of a raw amount, taken with exact integer maths:
 * `amountRaw × numeratorRaw ÷ denominatorRaw`, truncated. Used for the
 * protocol's own share of a liquidity pool — never a float ratio, so the
 * displayed figure is derived the same way the total is.
 */
export function rawShare(
  amountRaw: string | null | undefined,
  numeratorRaw: string | null | undefined,
  denominatorRaw: string | null | undefined,
): string | null {
  const ok = (v: unknown): v is string => typeof v === "string" && /^[0-9]+$/.test(v);
  if (!ok(amountRaw) || !ok(numeratorRaw) || !ok(denominatorRaw)) return null;
  const den = BigInt(denominatorRaw);
  if (den === 0n) return null;
  return ((BigInt(amountRaw) * BigInt(numeratorRaw)) / den).toString();
}
