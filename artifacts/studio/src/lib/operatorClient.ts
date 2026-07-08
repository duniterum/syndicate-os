// lib/operatorClient.ts
//
// Client for the operator WRITE zone (POST /api/operator/*). Root-relative and
// same-origin, so the httpOnly session cookie is sent automatically. Fail-closed
// by construction: any non-OK response — dark zone (404), no session (401),
// insufficient role (403), validation (400), or a transport error — resolves to
// { ok: false, reason } and NEVER throws to the caller. This module talks only
// to "/api/operator/..." and carries no wallet/identity material.

export interface WriteResult {
  ok: boolean;
  reason: string | null;
}

export async function saveReferralTerm(key: string, value: string): Promise<WriteResult> {
  try {
    const res = await fetch("/api/operator/referral-terms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
    if (res.ok) return { ok: true, reason: null };
    let reason: string | null = null;
    try {
      const body: unknown = await res.json();
      if (typeof body === "object" && body !== null) {
        const r = (body as Record<string, unknown>).reason;
        if (typeof r === "string") reason = r;
      }
    } catch {
      // No JSON body (e.g. a dark-zone 404) — leave the reason as the status.
    }
    return { ok: false, reason: reason ?? String(res.status) };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}

export interface OperatorListItem {
  id: string;
  walletShort: string;
  label: string;
  role: string;
  status: string;
}
export type ListOperatorsResult =
  | { status: "ok"; operators: OperatorListItem[] }
  | { status: "denied" }
  | { status: "unavailable" };

// GET the live operator registry (masked wallets). Fail-closed: dark zone (404),
// no session (401), or insufficient role (403) → "denied"; transport/other →
// "unavailable". Never throws. Talks only to "/api/operator/...".
export async function listOperators(): Promise<ListOperatorsResult> {
  try {
    const res = await fetch("/api/operator/operators", { method: "GET" });
    if (res.ok) {
      const body: unknown = await res.json();
      const raw =
        typeof body === "object" && body !== null
          ? (body as Record<string, unknown>).operators
          : null;
      const operators: OperatorListItem[] = Array.isArray(raw)
        ? raw.filter(
            (o): o is OperatorListItem =>
              typeof o === "object" &&
              o !== null &&
              typeof (o as Record<string, unknown>).id === "string" &&
              typeof (o as Record<string, unknown>).walletShort === "string" &&
              typeof (o as Record<string, unknown>).label === "string" &&
              typeof (o as Record<string, unknown>).role === "string" &&
              typeof (o as Record<string, unknown>).status === "string",
          )
        : [];
      return { status: "ok", operators };
    }
    if (res.status === 401 || res.status === 403 || res.status === 404) return { status: "denied" };
    return { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

// Founder-only registry write: invite (create) a new ACTIVE operator. Same
// fail-closed shape as saveReferralTerm — any non-OK (dark 404 / 401 / 403 /
// 400 validation / transport) resolves to { ok:false, reason }, never throws.
// The new operator's full wallet is typed by the founder here; the registry
// list keeps returning it masked.
export async function inviteOperator(
  wallet: string,
  label: string,
  role: string,
): Promise<WriteResult> {
  try {
    const res = await fetch("/api/operator/operators", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wallet, label, role }),
    });
    if (res.ok) return { ok: true, reason: null };
    let reason: string | null = null;
    try {
      const body: unknown = await res.json();
      if (typeof body === "object" && body !== null) {
        const r = (body as Record<string, unknown>).reason;
        if (typeof r === "string") reason = r;
      }
    } catch {
      // No JSON body (e.g. a dark-zone 404) — fall back to the status code.
    }
    return { ok: false, reason: reason ?? String(res.status) };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}

// Founder-only registry write: suspend an operator by its stable id (from the
// masked registry list — no full wallet needed client-side). Same fail-closed
// shape as the others.
export async function suspendOperator(id: string): Promise<WriteResult> {
  try {
    const res = await fetch("/api/operator/operators/suspend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) return { ok: true, reason: null };
    let reason: string | null = null;
    try {
      const body: unknown = await res.json();
      if (typeof body === "object" && body !== null) {
        const r = (body as Record<string, unknown>).reason;
        if (typeof r === "string") reason = r;
      }
    } catch {
      // no JSON body
    }
    return { ok: false, reason: reason ?? String(res.status) };
  } catch {
    return { ok: false, reason: "unreachable" };
  }
}
