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
