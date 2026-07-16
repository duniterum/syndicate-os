// lib/capitalStanding.ts — one seat's capital-axis standing from the server.
// ---------------------------------------------------------------------------
// S7: the rung comes from /api/backbone/capital-standing — the server's own
// canon walk (capitalAxisReadmodel), NEVER re-folded client-side from the
// feed (the feed is capped; a client fold would silently understate one
// day). S7-b (founder, 2026-07-16 — THE OWN-ACCOUNT DISPLAY RULE): the route
// also serves the seat's cumulative footprint, the founder-named ladder and
// the next rung, so the member's OWN dashboard can guide (the Sephora
// account pattern). PUBLIC chain data made legible — no wallet material
// travels on this path. Fail-closed: ANY transport/shape failure returns
// null and the consumer renders nothing — never an invented figure.
//
// This module lives in lib/ (not wallet/) deliberately: the wallet module's
// transport boundary is /api/auth only; public protocol reads reach it via
// lib helpers, the same seam as chainReads/verify-links.

export interface CapitalLadderRung {
  title: string;
  /** Cumulative gross USDC threshold (whole USDC — public canon). */
  usdc: number;
}

export interface CapitalStanding {
  /** The seat's current rung title, or null when not derivable (honest gap). */
  rung: string | null;
  /** The seat's cumulative gross USDC (raw 6-dec base units), when walked. */
  cumulativeUsdcRaw: string | null;
  /** The rung above the current one — own-account guidance (null at the
   *  summit or when the footprint is not derivable). */
  nextRung: CapitalLadderRung | null;
  /** The founder-named 12-rung canon ladder. */
  ladder: CapitalLadderRung[];
}

function parseRung(v: unknown): CapitalLadderRung | null {
  if (typeof v !== "object" || v === null) return null;
  const o = v as Record<string, unknown>;
  return typeof o.title === "string" && typeof o.usdc === "number"
    ? { title: o.title, usdc: o.usdc }
    : null;
}

/** Read the full capital standing for a PUBLIC seat ordinal. Null on any failure. */
export async function fetchCapitalStanding(
  seatNumber: string,
): Promise<CapitalStanding | null> {
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
    const ladder = Array.isArray(o.ladder)
      ? o.ladder.map(parseRung).filter((r): r is CapitalLadderRung => r !== null)
      : [];
    if (ladder.length === 0) return null;
    return {
      rung: typeof o.rung === "string" && o.rung.length > 0 ? o.rung : null,
      cumulativeUsdcRaw:
        typeof o.cumulativeUsdcRaw === "string" &&
        /^[0-9]+$/.test(o.cumulativeUsdcRaw)
          ? o.cumulativeUsdcRaw
          : null,
      nextRung: parseRung(o.nextRung),
      ladder,
    };
  } catch {
    return null;
  }
}

/** Rung title only — the identity band's need. Null on any failure. */
export async function fetchCapitalRung(
  seatNumber: string,
): Promise<string | null> {
  const standing = await fetchCapitalStanding(seatNumber);
  return standing?.rung ?? null;
}
