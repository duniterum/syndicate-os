// Bounded in-memory nonce store — IA-2 dev skeleton only.
//
// Properties (founder-approved):
//   • cryptographically random nonces (authConfig.newNonce);
//   • ≤5 minute TTL;
//   • bounded max entries — when full after pruning, issuance fails safely;
//   • single-use with atomic consume: the entry is deleted BEFORE validity is
//     checked, so a replayed or expired nonce can never pass twice;
//   • process restart loses all nonces → every in-flight challenge fails
//     closed (verify denies on unknown nonce).

import { NONCE_MAX_ENTRIES, NONCE_TTL_MS, newNonce } from "./authConfig";

interface NonceRecord {
  expiresAt: number;
}

const nonces = new Map<string, NonceRecord>();

function pruneExpired(now: number): void {
  for (const [nonce, record] of nonces) {
    if (record.expiresAt <= now) {
      nonces.delete(nonce);
    }
  }
}

// Returns the issued nonce plus its expiry, or null when the store is full
// (caller must fail safely — never block the event loop, never grow past the
// bound).
export function issueNonce(): { nonce: string; expiresAt: number } | null {
  const now = Date.now();
  if (nonces.size >= NONCE_MAX_ENTRIES) {
    pruneExpired(now);
  }
  if (nonces.size >= NONCE_MAX_ENTRIES) {
    return null;
  }
  const nonce = newNonce();
  const expiresAt = now + NONCE_TTL_MS;
  nonces.set(nonce, { expiresAt });
  return { nonce, expiresAt };
}

// Atomic single-use consume: delete first, then judge. Unknown, replayed and
// expired nonces all return false (fail closed, one code path).
export function consumeNonce(nonce: string): boolean {
  const record = nonces.get(nonce);
  nonces.delete(nonce);
  if (!record) {
    return false;
  }
  return record.expiresAt > Date.now();
}

// Test-only visibility (used by the fixture test script; harmless in served
// code — exposes a count, never nonce values).
export function nonceStoreSize(): number {
  return nonces.size;
}
