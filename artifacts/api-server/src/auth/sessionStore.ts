// Bounded in-memory session store — IA-2 dev skeleton only.
//
// Properties (founder-approved):
//   • opaque random session ids, server-side records only;
//   • absolute expiry ≤60 min plus a shorter idle timeout;
//   • bounded max entries — when full after pruning, creation fails safely;
//   • sessions store NO identity material at all: no wallet address, no
//     member data, nothing to leak. S4 means only "a control-proof session
//     exists". (Reserved for a future founder-gated slice: a registry-row
//     version binding would live here — deliberately absent in IA-2.)
//   • process restart loses all sessions → unknown cookie fails closed to S1.

import {
  SESSION_ABSOLUTE_TTL_MS,
  SESSION_IDLE_TTL_MS,
  SESSION_MAX_ENTRIES,
  newSessionId,
} from "./authConfig";

interface SessionRecord {
  createdAt: number;
  absoluteExpiresAt: number;
  idleExpiresAt: number;
}

const sessions = new Map<string, SessionRecord>();

function isExpired(record: SessionRecord, now: number): boolean {
  return record.absoluteExpiresAt <= now || record.idleExpiresAt <= now;
}

function pruneExpired(now: number): void {
  for (const [id, record] of sessions) {
    if (isExpired(record, now)) {
      sessions.delete(id);
    }
  }
}

// Returns a fresh opaque session id, or null when the store is full after
// pruning (caller fails safely).
export function createSession(): string | null {
  const now = Date.now();
  if (sessions.size >= SESSION_MAX_ENTRIES) {
    pruneExpired(now);
  }
  if (sessions.size >= SESSION_MAX_ENTRIES) {
    return null;
  }
  const id = newSessionId();
  sessions.set(id, {
    createdAt: now,
    absoluteExpiresAt: now + SESSION_ABSOLUTE_TTL_MS,
    idleExpiresAt: now + SESSION_IDLE_TTL_MS,
  });
  return id;
}

// Validates a session id and refreshes its idle window. Unknown or expired
// sessions are removed and return false (fail closed).
export function touchSession(id: string): boolean {
  const record = sessions.get(id);
  if (!record) {
    return false;
  }
  const now = Date.now();
  if (isExpired(record, now)) {
    sessions.delete(id);
    return false;
  }
  record.idleExpiresAt = Math.min(
    now + SESSION_IDLE_TTL_MS,
    record.absoluteExpiresAt,
  );
  return true;
}

export function destroySession(id: string): void {
  sessions.delete(id);
}

// Test-only visibility (count, never ids).
export function sessionStoreSize(): number {
  return sessions.size;
}
