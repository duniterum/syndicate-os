// Explicit .ts extension (allowed by tsconfig `allowImportingTsExtensions`) so
// `guard-one-figure` can import this module directly and PROVE its behaviour,
// instead of only text-matching it. A guard that cannot execute the code it
// protects is decoration — that is the lesson this whole slice is built on.
import { truncateToDisplayUnits, clampDisplay, dustFloorText } from "./amountFormat.ts";

// rawUnits.ts — exact raw base-unit helpers (display-side only).
// ---------------------------------------------------------------------------
// The wire truth is ALWAYS the raw base-10 string from the server (never
// humanized there). These helpers derive a human-readable rendering — and
// parse user input — with exact integer string math. No floats anywhere, no
// bigint→number narrowing, no rounding: a formatted value is a projection of
// the raw string, and the raw string is always shown alongside it.

/** bytes32 hex id format (0x + 64 hex). Client-side format check only. */
export const SOURCE_ID_RE = /^0x[0-9a-fA-F]{64}$/;

export function isSourceIdFormat(value: string): boolean {
  return SOURCE_ID_RE.test(value);
}

/**
 * Parse a human USDC amount ("120", "99.5") into an exact raw 6-decimal
 * base-unit string. Returns null when the input is not a positive decimal
 * with at most 6 fractional digits (no floats involved — pure string math).
 */
export function usdcInputToRaw(input: string): string | null {
  const trimmed = input.trim();
  if (!/^\d{1,12}(\.\d{1,6})?$/.test(trimmed)) return null;
  const [whole = "0", frac = ""] = trimmed.split(".");
  const raw = `${whole}${frac.padEnd(6, "0")}`.replace(/^0+(?=\d)/, "");
  if (/^0+$/.test(raw)) return null;
  return raw;
}

/**
 * Render an exact raw base-unit string with a decimal point inserted at
 * `decimals` and thousands grouping on the whole part. Pure string math;
 * trailing fractional zeros are trimmed. Non-digit input is returned as-is.
 */
export function formatRawUnits(raw: string, decimals: number): string {
  if (!/^\d+$/.test(raw)) return raw;
  const padded = raw.padStart(decimals + 1, "0");
  const whole = padded.slice(0, padded.length - decimals) || "0";
  const frac =
    decimals > 0 ? padded.slice(padded.length - decimals).replace(/0+$/, "") : "";
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
}

/**
 * HUMAN DISPLAY rendering (S7-e, READABILITY FLOOR — ADR-001): the same exact
 * string math, TRUNCATED (floored) to `display` fractional digits. Floored on
 * purpose: a money display must never overstate what the wallet holds
 * (2.998916 USDC renders "2.99", never "3"). The raw string remains the wire
 * truth for verifiers. Pure bigint math — no floats, ever.
 *
 * THE TRUNCATION ITSELF NOW LIVES IN ONE PLACE (2026-07-26). This function's
 * rule was always right — it was written here first, and the rest of the site
 * had drifted away from it. It keeps its own PRESENTATION (trailing fractional
 * zeros trimmed, which is what the wallet and checkout surfaces read today) and
 * borrows the shared projection, so the site can no longer hold two truncations.
 *
 * THE FALSE ZERO IS FIXED IN THE SAME PASS: a member holding 0.004 SYN or
 * 0.004 USDC read a flat "0" on their own wallet panel. A real holding now
 * reads "< 0.01". Honest dust, never nothing.
 */
export function formatRawUnitsDisplay(
  raw: string,
  decimals: number,
  display = 2,
): string {
  if (!/^\d+$/.test(raw)) return raw;
  if (display >= decimals) return formatRawUnits(raw, decimals);
  const units = truncateToDisplayUnits(raw, decimals, display);
  if (units === null) return raw;
  if (units === 0n && BigInt(raw) > 0n) return dustFloorText(clampDisplay(decimals, display));
  return formatRawUnits(units.toString(), display);
}
