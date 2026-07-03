/**
 * Tiny per-client fixed-window throttle for the public read-only RPC-backed
 * endpoints (/source/validate, /join/quote). These endpoints perform live
 * eth_call reads with client-supplied parameters (so they can't share the
 * envelope cache); this bounds how fast one client can drive upstream RPC.
 *
 * In-memory, per-instance, best-effort — a politeness bound, not a security
 * boundary. Fails open only in the sense that a process restart clears it.
 */

const WINDOW_MS = 10_000;
const MAX_PER_WINDOW = 20;
const MAX_TRACKED_CLIENTS = 5_000;

type Window = { startedAt: number; count: number };
const windows = new Map<string, Window>();

/** True if this request is allowed; false → caller should respond 429. */
export function allowPublicRead(clientKey: string): boolean {
  const now = Date.now();
  const existing = windows.get(clientKey);
  if (!existing || now - existing.startedAt >= WINDOW_MS) {
    // Opportunistic prune: drop expired windows before (rarely) capping.
    if (windows.size >= MAX_TRACKED_CLIENTS) {
      for (const [key, win] of windows) {
        if (now - win.startedAt >= WINDOW_MS) windows.delete(key);
      }
      // Still over cap after pruning → refuse new clients rather than grow.
      if (windows.size >= MAX_TRACKED_CLIENTS) return false;
    }
    windows.set(clientKey, { startedAt: now, count: 1 });
    return true;
  }
  existing.count += 1;
  return existing.count <= MAX_PER_WINDOW;
}

/** Test hook. */
export function __resetPublicReadThrottle(): void {
  windows.clear();
}
