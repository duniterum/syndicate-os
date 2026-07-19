/**
 * Channel store — the fail-closed write service of the channel zone.
 * -----------------------------------------------------------------
 * The constitutionally-named "log des canaux" (CONSTITUTION_AUTORITE §③ N2):
 * daily aggregate click counters + receipt-verified conversions. ADR-003
 * posture: NO visitor identity is ever written — a click is an increment on
 * (source, tag, UTC day); a conversion carries only public chain data.
 *
 * Boundary discipline (mirrors memberInbox.ts): @workspace/db is imported
 * LAZILY and only after confirming a database is provisioned — the channel
 * zone does NOT depend on the auth exposure flag (an anonymous click is not
 * an auth act; absent a DB the beacons drop silently, nothing breaks).
 * Any miss — no DB, error, cap reached — fails closed (dropped, never
 * queued, never invented). Nothing here ever logs a source id or a tag.
 */

import { randomUUID } from "node:crypto";

/** Distinct tags one source may open per day — bounds row growth under spam. */
const MAX_VIAS_PER_SOURCE_PER_DAY = 24;

function gateClosed(): boolean {
  return process.env.DATABASE_URL == null || process.env.DATABASE_URL.length === 0;
}

/** UTC day "YYYY-MM-DD" — the only time grain the click log carries. */
function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Count one landing for (source, tag) today. Silent on every failure. */
export async function recordClick(sourceIdHex: string, via: string): Promise<void> {
  if (gateClosed()) return;
  try {
    const { db, referralChannelClick } = await import("@workspace/db");
    const { and, eq, sql } = await import("drizzle-orm");
    const source = sourceIdHex.toLowerCase();
    const day = utcDay();

    const existing = await db
      .select({ id: referralChannelClick.id })
      .from(referralChannelClick)
      .where(
        and(
          eq(referralChannelClick.sourceIdHex, source),
          eq(referralChannelClick.via, via),
          eq(referralChannelClick.day, day),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(referralChannelClick)
        .set({
          clicks: sql`${referralChannelClick.clicks} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(referralChannelClick.id, existing[0]!.id));
      return;
    }

    // New (source, tag, day) row — enforce the per-day distinct-tag cap first.
    const openToday = await db
      .select({ id: referralChannelClick.id })
      .from(referralChannelClick)
      .where(
        and(
          eq(referralChannelClick.sourceIdHex, source),
          eq(referralChannelClick.day, day),
        ),
      );
    if (openToday.length >= MAX_VIAS_PER_SOURCE_PER_DAY) return; // dropped

    await db
      .insert(referralChannelClick)
      .values({ id: randomUUID(), sourceIdHex: source, via, day, clicks: 1 })
      .onConflictDoUpdate({
        target: [
          referralChannelClick.sourceIdHex,
          referralChannelClick.via,
          referralChannelClick.day,
        ],
        set: {
          clicks: sql`${referralChannelClick.clicks} + 1`,
          updatedAt: new Date(),
        },
      });
  } catch {
    // fail closed — a dropped click is a dropped click, never retried here
  }
}

/**
 * Record ONE receipt-verified conversion. The caller has already verified
 * the tx on-chain; the unique tx-hash index makes double-counting
 * impossible (insert-ignore). Silent on every failure.
 */
export async function recordConversion(
  sourceIdHex: string,
  via: string,
  txHash: string,
): Promise<void> {
  if (gateClosed()) return;
  try {
    const { db, referralChannelConversion } = await import("@workspace/db");
    await db
      .insert(referralChannelConversion)
      .values({
        id: randomUUID(),
        sourceIdHex: sourceIdHex.toLowerCase(),
        via,
        txHash: txHash.toLowerCase(),
        day: utcDay(),
      })
      .onConflictDoNothing();
  } catch {
    // fail closed
  }
}
