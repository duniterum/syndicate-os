/**
 * Channel-zone throttles — SPEC R3 (`&via=`), the third sanctioned zone.
 * ---------------------------------------------------------------------
 * Two tiny per-client fixed-window throttles for the anonymous channel
 * beacons. In-memory, per-instance, best-effort — a politeness/abuse bound
 * on write RATE, not a security boundary (nothing pays from a click; the
 * conversion path is additionally receipt-verified on-chain). Keys are the
 * hashed, per-boot-salted client keys from src/auth/clientIdentity.ts — the
 * raw IP is never stored, logged, or persisted anywhere (ADR-003).
 */

type Window = { startedAt: number; count: number };

function makeThrottle(windowMs: number, maxPerWindow: number, maxTracked: number) {
  const windows = new Map<string, Window>();
  return function allow(clientKey: string): boolean {
    const now = Date.now();
    const existing = windows.get(clientKey);
    if (!existing || now - existing.startedAt >= windowMs) {
      if (windows.size >= maxTracked) {
        for (const [key, win] of windows) {
          if (now - win.startedAt >= windowMs) windows.delete(key);
        }
        // Still over cap after pruning → refuse new clients rather than grow.
        if (windows.size >= maxTracked) return false;
      }
      windows.set(clientKey, { startedAt: now, count: 1 });
      return true;
    }
    existing.count += 1;
    return existing.count <= maxPerWindow;
  };
}

/** Click beacons: a landing pings once — 6 per 10s per client is generous. */
export const allowChannelClick = makeThrottle(10_000, 6, 5_000);

/** Conversion beacons: at most one real purchase per client per minutes —
 * 3 per 60s bounds the RPC verification work an abuser can cause. */
export const allowChannelConversion = makeThrottle(60_000, 3, 5_000);
