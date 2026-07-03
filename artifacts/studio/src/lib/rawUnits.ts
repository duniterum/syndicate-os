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
