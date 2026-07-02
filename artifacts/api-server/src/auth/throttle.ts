// Minimal bounded per-IP throttle — IA-2 dev skeleton only.
//
// Purpose: memory-pressure and abuse backstop for the unauthenticated auth
// POST endpoints (challenge/verify). Behind the shared path proxy, callers
// may collapse onto few peer IPs, so this is deliberately coarse — the
// bounded nonce/session stores are the real memory guarantee.

import {
  THROTTLE_MAX_PER_WINDOW,
  THROTTLE_MAX_TRACKED_KEYS,
  THROTTLE_WINDOW_MS,
} from "./authConfig";

interface Bucket {
  windowStart: number;
  count: number;
}

const buckets = new Map<string, Bucket>();

function pruneExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now - bucket.windowStart >= THROTTLE_WINDOW_MS) {
      buckets.delete(key);
    }
  }
}

// Fixed-window counter. Unknown-key inserts are denied when the tracking map
// is full even after pruning (fail closed rather than grow unbounded).
export function allowRequest(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (bucket && now - bucket.windowStart < THROTTLE_WINDOW_MS) {
    if (bucket.count >= THROTTLE_MAX_PER_WINDOW) {
      return false;
    }
    bucket.count += 1;
    return true;
  }
  if (buckets.size >= THROTTLE_MAX_TRACKED_KEYS) {
    pruneExpired(now);
  }
  if (!bucket && buckets.size >= THROTTLE_MAX_TRACKED_KEYS) {
    return false;
  }
  buckets.set(key, { windowStart: now, count: 1 });
  return true;
}
