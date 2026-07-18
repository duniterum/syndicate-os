// auth/memberInbox.ts
//
// Member OWN-ROW notification center (NOTIF-1, founder GO 2026-07-18 —
// HARVEST-08 + the no-email canon: in-app is the ONLY channel, so the bell
// must be honest: badge = per-member UNSEEN count, an item reads only when
// CLICKED — the two-tier seen/read model of the world-class centers).
// Resolves a SIWE-verified wallet session to its OWN notifications (rows
// addressed to the session wallet + audience=ALL broadcasts) joined to its
// OWN receipts. Message rows are written ONLY by the founder-gated operator
// write zone; the receipts here are THE FIRST member-side writes — own-row
// ONLY (member_wallet = the session's bound account), never another row.
//
// Boundary discipline (mirrors memberRoster.ts). The registry-less server
// stays bootable: @workspace/db is imported LAZILY and only after confirming
// BOTH that the auth zone is enabled AND that a database is provisioned.
// Own-row ONLY: the ONLY input is the session's SERVER-SIDE bound account;
// there is no lookup surface, the account is never echoed, and served rows
// carry NO wallet at all. Receipt invariant: every receipt row carries a
// non-null seen_at (reading implies seeing), so mark-seen can insert-ignore.
// Any miss — no DB, zone disabled, error — fails closed (null / false).

import { AUTH_EXPOSURE_FLAG } from "./authExposure";

export interface InboxRow {
  id: string;
  /** "you" = addressed to this member alone; "all" = a broadcast. */
  scope: "you" | "all";
  title: string;
  body: string;
  /** NOTIF-2: a curated lucide icon key, or null. Carries no address. */
  icon: string | null;
  /** NOTIF-2: an internal deep-link (whitelisted path key), or null. */
  linkPath: string | null;
  createdAtIso: string | null;
  /** true until the member CLICKS the item (or marks all read). */
  unread: boolean;
}
// NOTE: `category` is deliberately NOT carried to the member payload in v1
// (it is NULL for every v1 send and not member-surfaced) — no needless field.

export interface InboxPayload {
  rows: InboxRow[];
  /** Count of rows never marked seen — the bell badge. */
  unseenCount: number;
}

const INBOX_LIMIT = 50;

function gateClosed(): boolean {
  return (
    process.env[AUTH_EXPOSURE_FLAG] !== "true" ||
    process.env.DATABASE_URL == null ||
    process.env.DATABASE_URL.length === 0
  );
}

/**
 * Read the signed wallet's OWN inbox joined to its OWN receipts, newest
 * first, bounded. Recipient wallets are stored lowercased by the write zone,
 * so the lowercased session account matches directly.
 *
 * @param account SIWE-verified account, lowercased (server-only).
 */
export async function readOwnInbox(account: string): Promise<InboxPayload | null> {
  if (gateClosed()) return null;

  try {
    const { db, notification, notificationReceipt } = await import("@workspace/db");
    const { or, and, eq, desc } = await import("drizzle-orm");
    const me = account.toLowerCase();
    const rows = await db
      .select({
        id: notification.id,
        audience: notification.audience,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        linkPath: notification.linkPath,
        createdAt: notification.createdAt,
        seenAt: notificationReceipt.seenAt,
        readAt: notificationReceipt.readAt,
      })
      .from(notification)
      .leftJoin(
        notificationReceipt,
        and(
          eq(notificationReceipt.notificationId, notification.id),
          eq(notificationReceipt.memberWallet, me),
        ),
      )
      .where(
        or(
          eq(notification.audience, "ALL"),
          eq(notification.recipientWallet, me),
        ),
      )
      .orderBy(desc(notification.createdAt))
      .limit(INBOX_LIMIT);

    const mapped: InboxRow[] = rows.map((r) => ({
      id: r.id,
      scope: r.audience === "MEMBER" ? ("you" as const) : ("all" as const),
      title: r.title,
      body: r.body,
      icon: r.icon,
      linkPath: r.linkPath,
      createdAtIso: r.createdAt instanceof Date ? r.createdAt.toISOString() : null,
      unread: r.readAt === null,
    }));
    const unseenCount = rows.filter((r) => r.seenAt === null).length;
    return { rows: mapped, unseenCount };
  } catch {
    // Any DB/schema/connection error → fail closed, never invent an inbox.
    return null;
  }
}

/** The own-visible notification ids (the same window the inbox serves). */
async function ownVisibleIds(account: string): Promise<string[] | null> {
  try {
    const { db, notification } = await import("@workspace/db");
    const { or, eq, desc } = await import("drizzle-orm");
    const me = account.toLowerCase();
    const rows = await db
      .select({ id: notification.id })
      .from(notification)
      .where(or(eq(notification.audience, "ALL"), eq(notification.recipientWallet, me)))
      .orderBy(desc(notification.createdAt))
      .limit(INBOX_LIMIT);
    return rows.map((r) => r.id);
  } catch {
    return null;
  }
}

/**
 * Mark the member's OWN visible inbox SEEN (opening the bell clears the
 * badge; items stay unread). Insert-ignore is sufficient by the receipt
 * invariant (every existing receipt already carries seen_at).
 *
 * @param account SIWE-verified account, lowercased (server-only).
 */
export async function markInboxSeen(account: string): Promise<boolean> {
  if (gateClosed()) return false;
  try {
    const { db, notificationReceipt } = await import("@workspace/db");
    const me = account.toLowerCase();
    const ids = await ownVisibleIds(me);
    if (ids === null) return false;
    if (ids.length === 0) return true;
    const now = new Date();
    await db
      .insert(notificationReceipt)
      .values(ids.map((id) => ({ notificationId: id, memberWallet: me, seenAt: now })))
      .onConflictDoNothing();
    return true;
  } catch {
    return false;
  }
}

/**
 * Mark ONE own-visible notification (or ALL, when id is null) READ for this
 * member. Reading implies seeing. Own-row ONLY: receipts are keyed by the
 * session's bound account; ids outside the member's own window are ignored.
 *
 * @param account SIWE-verified account, lowercased (server-only).
 */
export async function markInboxRead(
  account: string,
  id: string | null,
): Promise<boolean> {
  if (gateClosed()) return false;
  try {
    const { db, notificationReceipt } = await import("@workspace/db");
    const { and, eq, isNull, inArray } = await import("drizzle-orm");
    const me = account.toLowerCase();
    const visible = await ownVisibleIds(me);
    if (visible === null) return false;
    const targets = id === null ? visible : visible.filter((v) => v === id);
    if (targets.length === 0) return id === null; // unknown id → refuse quietly
    const now = new Date();
    await db.transaction(async (tx) => {
      await tx
        .insert(notificationReceipt)
        .values(
          targets.map((t) => ({
            notificationId: t,
            memberWallet: me,
            seenAt: now,
            readAt: now,
          })),
        )
        .onConflictDoNothing();
      await tx
        .update(notificationReceipt)
        .set({ readAt: now })
        .where(
          and(
            eq(notificationReceipt.memberWallet, me),
            isNull(notificationReceipt.readAt),
            inArray(notificationReceipt.notificationId, targets),
          ),
        );
    });
    return true;
  } catch {
    return false;
  }
}
