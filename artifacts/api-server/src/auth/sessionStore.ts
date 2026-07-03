// Bounded in-memory session store — Public MVP wallet session.
//
// Properties (founder-approved):
//   • opaque random session ids, server-side records only;
//   • absolute expiry ≤60 min plus a shorter idle timeout;
//   • bounded max entries — when full after pruning, creation fails safely;
//   • Public MVP amendment (founder-approved, supersedes the IA-2 "no
//     identity material" rule): each session binds the SIWE-verified account
//     SERVER-SIDE ONLY, exclusively to serve the read-only member-self
//     readback (memberNumberOf eth_call). The bound value is never echoed in
//     any response, never logged, and never leaves the process. No member
//     data, registry rows, or operator authority are stored — S4 still means
//     only "a control-proof session exists".
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
  /** SIWE-verified account, lowercased. SERVER-ONLY: never echoed or logged. */
  verifiedAccount: string;
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
// pruning (caller fails safely). The SIWE-verified account is bound
// server-side only (see header doctrine).
export function createSession(verifiedAccount: string): string | null {
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
    verifiedAccount: verifiedAccount.toLowerCase(),
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

// Validates + idle-refreshes a session and returns its bound SIWE-verified
// account (lowercased) — or null (fail closed). SERVER-SIDE USE ONLY: the
// returned value must never be echoed in a response or logged.
export function getSessionAccount(id: string): string | null {
  if (!touchSession(id)) {
    return null;
  }
  return sessions.get(id)?.verifiedAccount ?? null;
}

export function destroySession(id: string): void {
  sessions.delete(id);
}

// Test-only visibility (count, never ids).
export function sessionStoreSize(): number {
  return sessions.size;
}
