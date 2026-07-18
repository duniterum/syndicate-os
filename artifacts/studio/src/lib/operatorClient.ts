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

// ── M-INT-1: the member ledger (founder-only read) ──────────────────────────
export interface LedgerReferral {
  introduced: number;
  durable: number;
  commissionPaidRaw: string;
  entitledTitle: string;
  promotionDue: boolean;
}
export interface LedgerRow {
  id: string;
  seat: number;
  walletShort: string;
  authority: string;
  entryDay: string | null;
  rung: string | null;
  footprintUsdcRaw: string | null;
  purchaseCount: number;
  lastPurchaseDay: string | null;
  purchasesTotalRaw: string | null;
  referral: LedgerReferral | null;
  segment: "ACTIVE" | "SETTLED" | "DORMANT";
}
export interface LedgerPayload {
  rows: LedgerRow[];
  totals: {
    seats: number;
    active: number;
    settled: number;
    dormant: number;
    sourceOwners: number;
    promotionsDue: number;
  };
  segmentDefinitions: Record<string, string>;
  recencyAnchorDay: string | null;
  introductionsAsOfBlock: number | null;
  honesty: string;
}
export type MemberLedgerResult =
  | { status: "ok"; payload: LedgerPayload }
  | { status: "denied" }
  | { status: "unavailable" };

// GET the member ledger (M-INT-1). FOUNDER-ONLY server-side; wallets arrive
// pre-masked. Fail-closed exactly like listOperators: 401/403/404 → "denied"
// (deliberately indistinguishable), transport/shape → "unavailable".
export async function fetchMemberLedger(): Promise<MemberLedgerResult> {
  try {
    const res = await fetch("/api/operator/member-ledger", { method: "GET" });
    if (res.ok) {
      const body: unknown = await res.json();
      const p =
        typeof body === "object" && body !== null
          ? (body as Record<string, unknown>).payload
          : null;
      if (typeof p !== "object" || p === null) return { status: "unavailable" };
      const payload = p as Record<string, unknown>;
      const rowsRaw = payload.rows;
      if (!Array.isArray(rowsRaw) || typeof payload.totals !== "object" || payload.totals === null) {
        return { status: "unavailable" };
      }
      const rows = rowsRaw.filter(
        (r): r is LedgerRow =>
          typeof r === "object" &&
          r !== null &&
          typeof (r as Record<string, unknown>).seat === "number" &&
          typeof (r as Record<string, unknown>).walletShort === "string" &&
          typeof (r as Record<string, unknown>).segment === "string",
      );
      return {
        status: "ok",
        payload: { ...(p as unknown as LedgerPayload), rows },
      };
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

// ── NOTIF-1: notifications (founder-only writes + masked list) ──────────────
// Founder-only write: message ONE member. The client sends the SEAT number
// only — the server resolves seat→wallet on the continuity spine; no wallet
// ever enters a client request. Same fail-closed shape as the other writes.
export async function notifyMember(
  seat: number,
  title: string,
  body: string,
  icon?: string | null,
  link?: string | null,
): Promise<WriteResult> {
  try {
    const res = await fetch("/api/operator/notifications/member", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ seat, title, body, icon: icon ?? null, link: link ?? null }),
    });
    if (res.ok) return { ok: true, reason: null };
    let reason: string | null = null;
    try {
      const resBody: unknown = await res.json();
      if (typeof resBody === "object" && resBody !== null) {
        const r = (resBody as Record<string, unknown>).reason;
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

// Founder-only write: broadcast ONE message to ALL members (a single persisted
// row — the read model; no push, no email). Same fail-closed shape.
export async function sendBroadcast(
  title: string,
  body: string,
  icon?: string | null,
  link?: string | null,
): Promise<WriteResult> {
  try {
    const res = await fetch("/api/operator/notifications/broadcast", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, body, icon: icon ?? null, link: link ?? null }),
    });
    if (res.ok) return { ok: true, reason: null };
    let reason: string | null = null;
    try {
      const resBody: unknown = await res.json();
      if (typeof resBody === "object" && resBody !== null) {
        const r = (resBody as Record<string, unknown>).reason;
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

export interface NotificationListItem {
  id: string;
  audience: string;
  recipientShort: string | null;
  title: string;
  body: string;
  icon: string | null;
  linkPath: string | null;
  createdAtIso: string | null;
}

// Founder-only: delete a notification by its stable id (a mistaken / outdated /
// test send). Removes it from every recipient's inbox + its receipts. Same
// fail-closed shape as the other writes.
export async function deleteNotification(id: string): Promise<WriteResult> {
  try {
    const res = await fetch("/api/operator/notifications/delete", {
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
export type ListNotificationsResult =
  | { status: "ok"; notifications: NotificationListItem[] }
  | { status: "denied" }
  | { status: "unavailable" };

// GET the recent sent notifications (founder-only; recipients arrive
// pre-masked). Fail-closed exactly like listOperators: 401/403/404 → "denied"
// (deliberately indistinguishable), transport/shape → "unavailable".
export async function fetchNotifications(): Promise<ListNotificationsResult> {
  try {
    const res = await fetch("/api/operator/notifications", { method: "GET" });
    if (res.ok) {
      const body: unknown = await res.json();
      const raw =
        typeof body === "object" && body !== null
          ? (body as Record<string, unknown>).notifications
          : null;
      const notifications: NotificationListItem[] = Array.isArray(raw)
        ? raw.filter(
            (n): n is NotificationListItem =>
              typeof n === "object" &&
              n !== null &&
              typeof (n as Record<string, unknown>).id === "string" &&
              typeof (n as Record<string, unknown>).audience === "string" &&
              typeof (n as Record<string, unknown>).title === "string" &&
              typeof (n as Record<string, unknown>).body === "string",
          )
        : [];
      return { status: "ok", notifications };
    }
    if (res.status === 401 || res.status === 403 || res.status === 404) return { status: "denied" };
    return { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
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
