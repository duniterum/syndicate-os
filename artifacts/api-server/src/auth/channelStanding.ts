// auth/channelStanding.ts
//
// Member OWN-ROW channel breakdown (SPEC R3 `&via=`, founder GO 2026-07-19 —
// the read half of the channel log). Resolves a SIWE-verified wallet session
// to its OWN source (the same D2-aware resolution as source-standing: the
// canonical derived id, or the founder-signed fallback), then serves that
// source's aggregate clicks + receipt-verified conversions grouped by
// channel tag. Rows are written ONLY by the anonymous fail-closed channel
// zone (src/channel/); this file never writes.
//
// Boundary discipline (mirrors memberInbox.ts — the FOURTH sanctioned
// DB-reaching auth file): @workspace/db is imported LAZILY and only after
// confirming BOTH that the auth zone is enabled AND that a database is
// provisioned. Own-row ONLY: the ONLY input is the session's SERVER-SIDE
// bound account; there is no lookup surface, no third-party query, and the
// payload carries NO wallet, NO source id — just tag/clicks/conversions.
// Any miss — no DB, zone disabled, unresolved source, error — fails closed
// (null), never an invented empty.

import { readOwnSourceStanding } from "../lib/protocol/sourceStandingRead";
import { AUTH_EXPOSURE_FLAG } from "./authExposure";

export interface ChannelBreakdownRow {
  /** The member's own channel tag (`&via=` value) — never free prose. */
  via: string;
  clicks: number;
  conversions: number;
}

export interface ChannelBreakdownPayload {
  rows: ChannelBreakdownRow[];
}

function gateClosed(): boolean {
  return (
    process.env[AUTH_EXPOSURE_FLAG] !== "true" ||
    process.env.DATABASE_URL == null ||
    process.env.DATABASE_URL.length === 0
  );
}

/**
 * Read the signed wallet's OWN channel breakdown. Totals are all-time sums
 * of the daily aggregate counters (the store's only grain).
 *
 * @param account SIWE-verified account, lowercased (server-only).
 */
export async function readOwnChannelBreakdown(
  account: string,
): Promise<ChannelBreakdownPayload | null> {
  if (gateClosed()) return null;

  try {
    // The session's own source — the same resolution the standing read uses
    // (canonical, else the founder-signed fallback). No source → no rows to
    // read; that is an honest EMPTY breakdown, not a failure.
    const standing = await readOwnSourceStanding(account.toLowerCase());
    const sourceIdHex = standing.sourceIdHex?.toLowerCase() ?? null;
    if (sourceIdHex === null) {
      return standing.failureReason === null || standing.sourceOnChain === false
        ? { rows: [] }
        : null; // resolution itself failed → unavailable, never invented
    }

    const { db, referralChannelClick, referralChannelConversion } = await import(
      "@workspace/db"
    );
    const { eq, sql } = await import("drizzle-orm");

    const clickRows = await db
      .select({
        via: referralChannelClick.via,
        clicks: sql<number>`sum(${referralChannelClick.clicks})`,
      })
      .from(referralChannelClick)
      .where(eq(referralChannelClick.sourceIdHex, sourceIdHex))
      .groupBy(referralChannelClick.via);

    const conversionRows = await db
      .select({
        via: referralChannelConversion.via,
        conversions: sql<number>`count(*)`,
      })
      .from(referralChannelConversion)
      .where(eq(referralChannelConversion.sourceIdHex, sourceIdHex))
      .groupBy(referralChannelConversion.via);

    const byVia = new Map<string, ChannelBreakdownRow>();
    for (const r of clickRows) {
      byVia.set(r.via, { via: r.via, clicks: Number(r.clicks), conversions: 0 });
    }
    for (const r of conversionRows) {
      const row = byVia.get(r.via) ?? { via: r.via, clicks: 0, conversions: 0 };
      row.conversions = Number(r.conversions);
      byVia.set(r.via, row);
    }
    const rows = [...byVia.values()].sort((a, b) => b.clicks - a.clicks);
    return { rows };
  } catch {
    return null; // fail closed
  }
}
