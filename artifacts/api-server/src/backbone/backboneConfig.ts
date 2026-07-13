/**
 * Event Backbone exposure + cadence config (M4-a, founder GO).
 * -------------------------------------------------------------
 * The unattended backbone is DARK BY DEFAULT in EVERY environment (stricter
 * than the auth zone's dev-open posture: an unattended chain-scanning WRITER
 * must never start by accident, not even in dev). It runs ONLY when the
 * founder sets SYNDICATE_BACKBONE_ENABLED === "true" — exact string match,
 * so unset, "1", "TRUE" or "yes" all keep it dark (default-deny opt-in).
 */

/** Explicit opt-in flag name. Server-side only. */
export const BACKBONE_EXPOSURE_FLAG = "SYNDICATE_BACKBONE_ENABLED";

/** Optional cadence override (seconds between cycle END and next cycle START). */
export const BACKBONE_INTERVAL_FLAG = "SYNDICATE_BACKBONE_INTERVAL_SEC";

/** Default cadence: 5 minutes between cycles. */
export const DEFAULT_INTERVAL_SEC = 300;
/** Cadence bounds: never hammer the RPC, never go stale beyond an hour. */
export const MIN_INTERVAL_SEC = 60;
export const MAX_INTERVAL_SEC = 3600;

/** Delay after server boot before the first cycle (lets the server settle). */
export const BOOT_DELAY_MS = 10_000;

export interface BackboneConfig {
  readonly enabled: boolean;
  readonly intervalSec: number;
}

/** True ONLY on the founder's exact opt-in literal. */
export function backboneEnabled(): boolean {
  return process.env[BACKBONE_EXPOSURE_FLAG] === "true";
}

export function readBackboneConfig(): BackboneConfig {
  const raw = process.env[BACKBONE_INTERVAL_FLAG];
  let intervalSec = DEFAULT_INTERVAL_SEC;
  if (raw != null && raw.length > 0) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isSafeInteger(parsed) && parsed > 0) {
      intervalSec = Math.min(
        MAX_INTERVAL_SEC,
        Math.max(MIN_INTERVAL_SEC, parsed),
      );
    }
  }
  return { enabled: backboneEnabled(), intervalSec };
}
