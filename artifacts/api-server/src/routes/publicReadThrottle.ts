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
      // ⛔ A CLIFF, NOT A DEGRADATION — and it fell on exactly the wrong people
      // (review, 2026-08-05). ~~Still over cap after pruning → refuse new
      // clients rather than grow.~~ STRUCK. Above the cap, EVERY NEW visitor was
      // refused on the FIRST read of the landing while incumbents kept being
      // served — the funnel closing for strangers, which is the only audience it
      // exists for. And the money leg is worse than a slow page: the buy click
      // re-reads the quote, so a 429 there is «A fresh quote could not be read
      // right before signing — nothing was signed», with the buyer's approval
      // already granted and his gas already spent.
      // The cap protects MEMORY, so the honest answer is to make room, not to
      // turn people away: evict the OLDEST window (the client least recently
      // seen) and admit the newcomer. The bound holds; nobody is refused for
      // being new.
      if (windows.size >= MAX_TRACKED_CLIENTS) {
        let oldestKey: string | null = null;
        let oldestAt = Infinity;
        for (const [key, win] of windows) {
          if (win.startedAt < oldestAt) {
            oldestAt = win.startedAt;
            oldestKey = key;
          }
        }
        if (oldestKey !== null) windows.delete(oldestKey);
      }
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
