// lib/capitalStanding.ts — one seat's capital-axis rung, read from the server.
// ---------------------------------------------------------------------------
// S7: the Member Home hero shows the seat's CURRENT standing on the capital
// axis. The rung comes from /api/backbone/capital-standing — the server's own
// canon walk (capitalAxisReadmodel), NEVER re-folded client-side from the
// feed (the feed is capped at 100 lines; a client fold would silently
// understate one day). PUBLIC data only: a seat ordinal in, a rung TITLE out
// — no wallet material travels on this path, and no amount ever arrives.
// Fail-closed: ANY transport/shape failure returns null and the hero simply
// does not render the line — a rung is never invented or cached stale.
//
// This module lives in lib/ (not wallet/) deliberately: the wallet module's
// transport boundary is /api/auth only; public protocol reads reach it via
// lib helpers, the same seam as chainReads/verify-links.

/** Read the rung title for a PUBLIC seat ordinal. Null on any failure. */
export async function fetchCapitalRung(
  seatNumber: string,
): Promise<string | null> {
  if (!/^[1-9][0-9]{0,6}$/.test(seatNumber)) return null;
  try {
    const res = await fetch(
      `/api/backbone/capital-standing?seat=${seatNumber}`,
      { cache: "no-store" },
    );
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const o = body as Record<string, unknown>;
    if (o.module !== "event-backbone") return null;
    return typeof o.rung === "string" && o.rung.length > 0 ? o.rung : null;
  } catch {
    return null;
  }
}
