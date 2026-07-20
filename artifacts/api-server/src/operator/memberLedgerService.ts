// operator/memberLedgerService.ts
//
// M-INT-1 — THE MEMBER LEDGER (founder-acted 2026-07-16; built 2026-07-18).
// The operator-side per-seat dossier list: a PURE PROJECTION of data the
// protocol has ALREADY indexed — the member-continuity spine (DB), the capital
// axis (rung + footprint), the own-purchase read-model (R/F/M), and the R5
// introduction read-model + ownership index (referral standing). ZERO new
// collection, ZERO chain reads, ZERO public-surface change.
//
// PRIVACY (ADR-003 + the §D privacy overlay, the recon's verdict):
//   • memberNumber↔wallet pairing is permitted ONLY to founder_root (the route
//     enforces the role); it is designed canon, never the public directory.
//   • A FULL wallet address never serializes — walletShort is derived
//     server-side as slice(0,6)+"…"+slice(-4); the route additionally runs the
//     BOUNDARY-AWARE 40-hex fail-closed scanner over the whole serialized
//     payload (the f436c42 form — the rows' 64-hex verify anchors pass, a
//     bare address never does).
//   • AMENDMENT A21 SHIPPED (founder-gated, approved on the wireframe +
//     "GO and GO-Live" 2026-07-20): each row now carries its RECEIPTS — the
//     same sanctioned public row shape /api/receipt/{txHash} serves, verify
//     anchors included, each one opening at its permanent public address.
//     Still founder_root-only, still audit-logged, still zero lookup params.
//   • Every ledger read writes an audit row (design §8: access is logged).
//
// SEGMENTS (honest derivation — no login/engagement data exists by design;
// S3 stays untracked): recency is measured against the NEWEST indexed
// purchase day (chain-anchored), never a wall clock. The definitions ship in
// the payload verbatim so the console renders exactly what the math does.
//
// Same fail-closed service shape as the sibling services: gateOpen() BEFORE
// any lazy @workspace/db import; pure module (no req/res/log); any error →
// "unavailable"; in-memory models absent → honest nulls, never invented.

import { randomUUID } from "node:crypto";
import { AUTH_EXPOSURE_FLAG } from "../auth/authExposure";
import { getBackboneFeedSource, getOwnPurchaseSource } from "../backbone/backboneRunner";
import { getLiveIntroductionModel } from "../lib/protocol/introductionLiveModel";
import { getOwnedSources } from "../lib/protocol/sourceOwnershipIndex";
import { sourceKeyOf } from "../lib/protocol/introductionReadmodel";
import { txUrl } from "../canon/the-syndicate/chain/chain-registry";
import type { OwnPurchaseRow } from "../backbone/ownPurchaseReadmodel";

function gateOpen(): boolean {
  return (
    process.env[AUTH_EXPOSURE_FLAG] === "true" &&
    process.env.DATABASE_URL != null &&
    process.env.DATABASE_URL.length > 0
  );
}

function shortForm(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** UTC day arithmetic on ISO days (chain-anchored; never a clock read). */
function daysBetween(older: string, newer: string): number {
  const a = Date.parse(`${older}T00:00:00Z`);
  const b = Date.parse(`${newer}T00:00:00Z`);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return Number.MAX_SAFE_INTEGER;
  return Math.round((b - a) / 86_400_000);
}

export type LedgerSegment = "ACTIVE" | "SETTLED" | "DORMANT";

/** The served definitions — rendered VERBATIM by the console next to the chips. */
export const SEGMENT_DEFINITIONS: Record<LedgerSegment, string> = {
  ACTIVE: "Own purchase within 30 days of the newest indexed purchase day.",
  SETTLED: "Seat held; last own purchase 31–90 days before the newest indexed purchase day.",
  DORMANT: "Seat held; no own purchase within 90 days of the newest indexed purchase day.",
};

export interface LedgerReferralFacts {
  readonly introduced: number;
  readonly durable: number;
  readonly commissionPaidRaw: string;
  readonly entitledTitle: string;
  readonly promotionDue: boolean;
}

/**
 * A21: one purchase's ledger receipt line — the SAME sanctioned public row
 * shape GET /api/receipt/{txHash} serves (one spine, one fact shape): the
 * verify anchor + explorer URL + the event's own receipt facts, short-form
 * actors by construction. Newest first, like the binder.
 */
export interface LedgerReceiptLine {
  readonly isoDayUtc: string;
  readonly amountRaw: string;
  readonly transaction: string;
  readonly explorerUrl: string;
  readonly block: number;
  readonly engine: string;
  readonly sealedAtSec: number;
  readonly receipt: OwnPurchaseRow["receipt"];
}

export interface LedgerRow {
  readonly id: string;
  readonly seat: number;
  /** Server-side masked short form — never a full address (ADR-003). */
  readonly walletShort: string;
  /** Numbering authority: PART_B_FREEZE_ROOT (#1–#8) or V3_EMITTED (#9+). */
  readonly authority: string;
  /** UTC day of the entry transaction (chain-verified), when known. */
  readonly entryDay: string | null;
  /** Capital axis — the seat's rung + cumulative footprint (raw 6-dec). */
  readonly rung: string | null;
  readonly footprintUsdcRaw: string | null;
  /** Own purchases (R/F/M): count, newest day, summed gross (raw 6-dec). */
  readonly purchaseCount: number;
  readonly lastPurchaseDay: string | null;
  readonly purchasesTotalRaw: string | null;
  /** A21: the seat's receipts, newest first — verify anchors included
   *  (founder-gated amendment shipped 2026-07-20; founder_root-only route). */
  readonly receipts: readonly LedgerReceiptLine[];
  /** R5 referral standing when this seat's wallet owns an indexed source. */
  readonly referral: LedgerReferralFacts | null;
  readonly segment: LedgerSegment;
}

export interface LedgerPayload {
  readonly rows: readonly LedgerRow[];
  readonly totals: {
    readonly seats: number;
    readonly active: number;
    readonly settled: number;
    readonly dormant: number;
    readonly sourceOwners: number;
    readonly promotionsDue: number;
  };
  readonly segmentDefinitions: Record<LedgerSegment, string>;
  /** The chain-anchored recency reference (newest indexed purchase day). */
  readonly recencyAnchorDay: string | null;
  readonly introductionsAsOfBlock: number | null;
  readonly honesty: string;
}

export type LedgerResult =
  | { ok: true; payload: LedgerPayload }
  | { ok: false; reason: string };

export async function readMemberLedger(actor: {
  wallet: string;
  role: string;
}): Promise<LedgerResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };

  try {
    const { db, memberContinuityRecord, auditLog } = await import("@workspace/db");

    const spine = await db
      .select({
        memberNumber: memberContinuityRecord.memberNumber,
        entryWallet: memberContinuityRecord.entryWallet,
        numberingAuthority: memberContinuityRecord.numberingAuthority,
        entryBlockTimestampSec: memberContinuityRecord.entryBlockTimestampSec,
      })
      .from(memberContinuityRecord);

    if (spine.length === 0) return { ok: false, reason: "empty_spine" };

    // In-memory read-models (rebuilt every backbone cycle; absent → honest null).
    const capital = getBackboneFeedSource().capitalModel;
    const rungBySeat = new Map<number, { rung: string; cumulativeUsdcRaw: string }>(
      (capital?.standingBySeat ?? []).map((s) => [
        s.seatNumber,
        { rung: s.rung, cumulativeUsdcRaw: s.cumulativeUsdcRaw },
      ]),
    );
    const purchases = getOwnPurchaseSource();
    const intro = getLiveIntroductionModel();

    // The chain-anchored recency reference: the newest indexed purchase day.
    let anchorDay: string | null = null;
    if (purchases !== null) {
      for (const rows of purchases.rowsByWallet.values()) {
        const newest = rows[0]?.isoDayUtc ?? null; // rows are newest-first
        if (newest !== null && (anchorDay === null || newest > anchorDay)) {
          anchorDay = newest;
        }
      }
    }

    const ledger: LedgerRow[] = [];
    for (const rec of spine) {
      if (typeof rec.memberNumber !== "number" || rec.memberNumber < 1) continue;
      const walletLower = (rec.entryWallet ?? "").toLowerCase();
      if (!/^0x[0-9a-f]{40}$/.test(walletLower)) continue;

      const own = purchases?.rowsByWallet.get(walletLower) ?? null;
      const lastPurchaseDay = own?.[0]?.isoDayUtc ?? null;
      let purchasesTotalRaw: string | null = null;
      if (own !== null && own.length > 0) {
        let sum = 0n;
        for (const r of own) sum += BigInt(r.usdcGrossRaw);
        purchasesTotalRaw = sum.toString();
      }
      // A21 (founder-gated, shipped 2026-07-20): the seat's receipt lines —
      // the SAME row objects the binder and the public per-transaction read
      // serve, mapped to the sanctioned shape. An anchor we cannot
      // verify-link never serves (the auth-route discipline, verbatim).
      const receipts: LedgerReceiptLine[] = [];
      for (const r of own ?? []) {
        const explorerUrl = txUrl(r.transactionHash);
        if (explorerUrl === null) continue;
        receipts.push({
          isoDayUtc: r.isoDayUtc,
          amountRaw: r.usdcGrossRaw,
          transaction: r.transactionHash,
          explorerUrl,
          block: r.blockNumber,
          engine: r.generation,
          sealedAtSec: r.sealedAtSec,
          receipt: r.receipt === null ? null : { ...r.receipt },
        });
      }

      // Referral standing via the ownership edge → the R5 model's own row.
      let referral: LedgerReferralFacts | null = null;
      const owned = getOwnedSources(walletLower);
      if (owned !== null && owned.length > 0 && intro !== null) {
        const row = intro.model.bySource[sourceKeyOf(owned[0].sourceId)] ?? null;
        if (row !== null) {
          referral = {
            introduced: row.introducedMembers,
            durable: row.durableIntroductions,
            commissionPaidRaw: row.commissionPaidRaw,
            entitledTitle: row.entitledTitle,
            promotionDue: row.promotionDue,
          };
        }
      }

      // Segment: chain-anchored recency; no purchases at all → DORMANT is
      // wrong for genesis seats whose early-era rows predate the index — the
      // capital axis still carries them; recency then reads from entry day.
      const recencyDay = lastPurchaseDay ?? isoDayFromSeconds(rec.entryBlockTimestampSec);
      let segment: LedgerSegment = "DORMANT";
      if (anchorDay !== null && recencyDay !== null) {
        const d = daysBetween(recencyDay, anchorDay);
        segment = d <= 30 ? "ACTIVE" : d <= 90 ? "SETTLED" : "DORMANT";
      }

      const cap = rungBySeat.get(rec.memberNumber) ?? null;
      ledger.push({
        id: randomUUID(),
        seat: rec.memberNumber,
        walletShort: shortForm(walletLower),
        authority: rec.numberingAuthority ?? "UNKNOWN",
        entryDay: isoDayFromSeconds(rec.entryBlockTimestampSec),
        rung: cap?.rung ?? null,
        footprintUsdcRaw: cap?.cumulativeUsdcRaw ?? null,
        purchaseCount: own?.length ?? 0,
        lastPurchaseDay,
        purchasesTotalRaw,
        receipts,
        referral,
        segment,
      });
    }
    ledger.sort((a, b) => a.seat - b.seat);

    const payload: LedgerPayload = {
      rows: ledger,
      totals: {
        seats: ledger.length,
        active: ledger.filter((r) => r.segment === "ACTIVE").length,
        settled: ledger.filter((r) => r.segment === "SETTLED").length,
        dormant: ledger.filter((r) => r.segment === "DORMANT").length,
        sourceOwners: ledger.filter((r) => r.referral !== null).length,
        promotionsDue: ledger.filter((r) => r.referral?.promotionDue === true).length,
      },
      segmentDefinitions: SEGMENT_DEFINITIONS,
      recencyAnchorDay: anchorDay,
      introductionsAsOfBlock: intro?.model.asOfBlock ?? null,
      honesty:
        "A projection of already-indexed data only (continuity spine · capital axis · own purchases with their verify anchors · R5 introductions). Masked short wallets, founder_root-gated, access audit-logged. Segments derive from purchase recency against the newest indexed purchase day — no login or engagement data exists by design.",
    };

    // §8: the access is logged (who read the ledger, when — never row content).
    await db.insert(auditLog).values({
      id: randomUUID(),
      actorWallet: actor.wallet,
      actorRole: actor.role,
      action: "member-ledger.read",
      target: null,
      detail: { rows: ledger.length },
      stepUpSigned: false,
    });

    return { ok: true, payload };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

/** Chain-verified epoch seconds → UTC day; null on absent/invalid.
 *  Accepts number OR bigint (the continuity column is a Postgres bigint). */
function isoDayFromSeconds(sec: unknown): string | null {
  const n =
    typeof sec === "bigint" ? Number(sec) : typeof sec === "number" ? sec : null;
  if (n === null || !Number.isFinite(n) || n <= 0) return null;
  return new Date(n * 1000).toISOString().slice(0, 10);
}
