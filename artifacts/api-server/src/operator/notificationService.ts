// operator/notificationService.ts
//
// NOTIF-1 (Q43) write-zone services: notify ONE member, broadcast to ALL, and
// the founder's recent-notifications list. Same fail-closed shape as the
// registry service:
//   • gated on the exposure flag + DATABASE_URL BEFORE any DB module is touched;
//   • @workspace/db imported ONLY via a lazy await import();
//   • server-side validation is the authority (seat form, text limits, and a
//     40-hex refusal so the member inbox's leak scanner can never trip on a
//     served row);
//   • every write is a transaction that ALSO writes an audit_log row;
//   • any error rolls back and returns "unavailable".
//
// Identity discipline: the CLIENT sends a SEAT number only — the seat→wallet
// resolution happens here, on the continuity spine, server-side. The stored
// recipient_wallet never leaves the server unmasked, and the audit row records
// the seat only (wallet↔member-number pairings never land in audit — the
// pairing lives solely in the continuity spine). HARVEST-02/-08: a persisted
// read model only — no live push, no email, ever.

import { randomUUID } from "node:crypto";
import {
  NOTIFICATION_ICON_PALETTE,
  NOTIFICATION_LINK_PATHS,
} from "@workspace/os-contracts";
import { AUTH_EXPOSURE_FLAG } from "../auth/authExposure";

export type NotificationWriteResult = { ok: true } | { ok: false; reason: string };

// Server-side authority limits (the router's zod mirrors these).
export const NOTIFICATION_TITLE_MAX = 120;
export const NOTIFICATION_BODY_MAX = 2000;

// A raw 20-byte address anywhere in founder-authored text would later trip the
// fail-closed 40-hex output scan on every member inbox read. Refuse at write
// time with a clear reason instead of poisoning the read model.
const RAW_ADDRESS = /0x[0-9a-fA-F]{40}/;

// NOTIF-2: the authoritative allow-lists (the single source in os-contracts).
// A client-supplied icon/link is NEVER trusted — only exact-match membership
// passes. The internal-only boundary is THIS Set, never a `/`-prefix test.
const ICON_SET: ReadonlySet<string> = new Set(NOTIFICATION_ICON_PALETTE);
const LINK_SET: ReadonlySet<string> = new Set(NOTIFICATION_LINK_PATHS);

function gateOpen(): boolean {
  return (
    process.env[AUTH_EXPOSURE_FLAG] === "true" &&
    process.env.DATABASE_URL != null &&
    process.env.DATABASE_URL.length > 0
  );
}

/** Empty/whitespace → null; otherwise the trimmed value. */
function nullable(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t.length > 0 ? t : null;
}

function textReason(title: string, body: string): string | null {
  if (title.trim().length === 0 || title.length > NOTIFICATION_TITLE_MAX) return "bad_title";
  if (body.trim().length === 0 || body.length > NOTIFICATION_BODY_MAX) return "bad_body";
  if (RAW_ADDRESS.test(title) || RAW_ADDRESS.test(body)) return "address_in_text";
  return null;
}

// Optional icon + internal link: a non-null icon must be a palette member; a
// non-null link must be an EXACT whitelist member. Protocol-relative / backslash
// forms are refused explicitly (defense-in-depth; the Set already excludes them).
function optionReason(icon: string | null, link: string | null): string | null {
  if (icon !== null && !ICON_SET.has(icon)) return "bad_icon";
  if (link !== null) {
    if (link.startsWith("//") || link.startsWith("/\\") || !LINK_SET.has(link)) return "bad_link";
  }
  return null;
}

export interface SendMemberNotificationInput {
  seat: number;
  title: string;
  body: string;
  icon?: string | null;
  link?: string | null;
  actorWallet: string;
  actorRole: string;
}

export async function sendMemberNotification(
  input: SendMemberNotificationInput,
): Promise<NotificationWriteResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };
  if (!Number.isInteger(input.seat) || input.seat < 1) return { ok: false, reason: "bad_seat" };
  const bad = textReason(input.title, input.body);
  if (bad !== null) return { ok: false, reason: bad };
  const icon = nullable(input.icon);
  const linkPath = nullable(input.link);
  const optBad = optionReason(icon, linkPath);
  if (optBad !== null) return { ok: false, reason: optBad };

  try {
    const { db, memberContinuityRecord, notification, auditLog } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");

    // Seat → wallet on the continuity spine (the ONLY place the pairing lives).
    // entry_wallet is stored in checksum form; the read model stores lowercase.
    const rows = await db
      .select({ entryWallet: memberContinuityRecord.entryWallet })
      .from(memberContinuityRecord)
      .where(eq(memberContinuityRecord.memberNumber, input.seat))
      .limit(1);
    const wallet = (rows[0]?.entryWallet ?? "").toLowerCase();
    if (!/^0x[0-9a-f]{40}$/.test(wallet)) return { ok: false, reason: "unknown_seat" };

    await db.transaction(async (tx) => {
      await tx.insert(notification).values({
        id: randomUUID(),
        audience: "MEMBER",
        recipientWallet: wallet,
        title: input.title.trim(),
        body: input.body.trim(),
        icon, // validated ∈ palette or null
        linkPath, // validated ∈ whitelist or null
        category: null, // v1 free-text send; v2 generator owns category
        createdByRole: input.actorRole,
      });
      await tx.insert(auditLog).values({
        id: randomUUID(),
        actorWallet: input.actorWallet,
        actorRole: input.actorRole,
        action: "notification.send-member",
        target: `seat#${input.seat}`, // seat only — never the wallet pairing
        detail: { titleChars: input.title.trim().length, bodyChars: input.body.trim().length },
        stepUpSigned: false,
      });
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export interface BroadcastNotificationInput {
  title: string;
  body: string;
  icon?: string | null;
  link?: string | null;
  actorWallet: string;
  actorRole: string;
}

export async function broadcastNotification(
  input: BroadcastNotificationInput,
): Promise<NotificationWriteResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };
  const bad = textReason(input.title, input.body);
  if (bad !== null) return { ok: false, reason: bad };
  const icon = nullable(input.icon);
  const linkPath = nullable(input.link);
  const optBad = optionReason(icon, linkPath);
  if (optBad !== null) return { ok: false, reason: optBad };

  try {
    const { db, notification, auditLog } = await import("@workspace/db");
    await db.transaction(async (tx) => {
      await tx.insert(notification).values({
        id: randomUUID(),
        audience: "ALL",
        recipientWallet: null,
        title: input.title.trim(),
        body: input.body.trim(),
        icon, // validated ∈ palette or null
        linkPath, // validated ∈ whitelist or null
        category: null, // v1 free-text send; v2 generator owns category
        createdByRole: input.actorRole,
      });
      await tx.insert(auditLog).values({
        id: randomUUID(),
        actorWallet: input.actorWallet,
        actorRole: input.actorRole,
        action: "notification.broadcast",
        target: null,
        detail: { titleChars: input.title.trim().length, bodyChars: input.body.trim().length },
        stepUpSigned: false,
      });
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

// Masked recent list for the founder's console (the honest bell + composer
// history). Wallets are masked server-side like every operator list; reads are
// not privileged mutations, so nothing is audited here (mirrors listOperators).
export interface NotificationListRow {
  id: string;
  audience: string;
  recipientShort: string | null; // masked 0x1234…abcd, null for ALL
  title: string;
  body: string;
  icon: string | null;
  linkPath: string | null;
  createdAtIso: string | null;
}
export type NotificationListResult =
  | { ok: true; notifications: NotificationListRow[] }
  | { ok: false; reason: string };

const LIST_LIMIT = 50;

export async function listNotifications(): Promise<NotificationListResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };
  try {
    const { db, notification } = await import("@workspace/db");
    const { desc } = await import("drizzle-orm");
    const rows = await db
      .select({
        id: notification.id,
        audience: notification.audience,
        recipientWallet: notification.recipientWallet,
        title: notification.title,
        body: notification.body,
        icon: notification.icon,
        linkPath: notification.linkPath,
        createdAt: notification.createdAt,
      })
      .from(notification)
      .orderBy(desc(notification.createdAt))
      .limit(LIST_LIMIT);
    const notifications: NotificationListRow[] = rows.map((r) => ({
      id: r.id,
      audience: r.audience,
      recipientShort:
        r.recipientWallet !== null && r.recipientWallet.length >= 10
          ? `${r.recipientWallet.slice(0, 6)}…${r.recipientWallet.slice(-4)}`
          : null,
      title: r.title,
      body: r.body,
      icon: r.icon,
      linkPath: r.linkPath,
      createdAtIso: r.createdAt instanceof Date ? r.createdAt.toISOString() : null,
    }));
    return { ok: true, notifications };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
