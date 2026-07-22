// operator/activationQueueService.ts
//
// K3.a (mockup founder-approved 2026-07-22 "GO and GO-Live"): the Source
// review queue's server side — the founder's list of activation requests with
// LIVE preflight checks, the decide writes (decline / hold / reopen / close),
// and the deliberate signing-material read (one request's full wallet).
//
// Same fail-closed shape as the sibling services:
//   • gated on the exposure flag + DATABASE_URL BEFORE any DB module is touched;
//   • @workspace/db imported ONLY via a lazy await import();
//   • every write is a transaction that ALSO writes an audit_log row;
//   • any error rolls back and returns "unavailable".
//
// THE PREFLIGHT LAW (the mockup's fail-closed rendering): every check is a
// LIVE read at list time — never a stored verdict (the K2.1 mutable-fact law:
// SYN moves every block, status can flip). A read that did not run serves
// null — the client renders it as its own BLOCKING state, never a pass.
//
// APPROVE IS NEVER A SERVER ACT: only the founder's on-chain signatures move
// protocol state. The service's verdicts are decline (with the human reason
// the member reads — delivered to their bell in the same transaction), hold,
// reopen, and close (recording that reality answered on-chain). Identity
// discipline: list rows carry MASKED wallets + the 64-hex source id; the one
// FULL wallet needed to build the founder's transaction is served by its own
// audited read (the verify-links pattern for legitimate address material).

import { randomUUID } from "node:crypto";
import { AUTH_EXPOSURE_FLAG } from "../auth/authExposure";
import { readEngineMemberNumber } from "../auth/engineReadback";
import { readHoldsSyn, canonicalSourceIdHex } from "../auth/activationEligibility";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { ethCall, probeChain } from "../lib/protocol/evmRead";
import { callData, decodeBool } from "../lib/protocol/archiveDecoders";
import {
  SELECTOR_SOURCE_EXISTS,
  SELECTOR_SOURCE_IS_ACTIVE,
  bytes32Word,
} from "../lib/protocol/sourceDecoders";
import { SOURCE_LINKAGE_TARGET } from "../data/protocolTargets";

function gateOpen(): boolean {
  return (
    process.env[AUTH_EXPOSURE_FLAG] === "true" &&
    process.env.DATABASE_URL != null &&
    process.env.DATABASE_URL.length > 0
  );
}

// Founder-authored decline text is member-visible: same limits + address
// refusal as the notification service (a raw address would trip the member
// inbox's fail-closed leak scan later — refuse at write time instead).
const DECLINE_REASON_MAX = 500;
const RAW_ADDRESS = /0x[0-9a-fA-F]{40}/;

/** Live preflight per request — null = the read did not run (BLOCKING). */
export interface ActivationChecks {
  seatHeld: boolean | null;
  holdsSyn: boolean | null;
  sourceOnChain: boolean | null;
  sourceActive: boolean | null;
}

export interface ActivationQueueRow {
  id: string;
  /** Masked 0x1234…abcd — the house list form; never the full wallet. */
  walletShort: string;
  /** The engine's own live seat figure (exact decimal string), or null. */
  seat: string | null;
  /** The wallet's derived 64-hex source id (passes the address gates). */
  sourceIdHex: string;
  status: string;
  askedAtIso: string | null;
  decidedAtIso: string | null;
  declineReason: string | null;
  closeCause: string | null;
  /** Present on OPEN rows only (live reads are for pending decisions). */
  checks: ActivationChecks | null;
}

export type ActivationQueueResult =
  | {
      ok: true;
      payload: {
        rows: ActivationQueueRow[];
        openCount: number;
        /** Open rows beyond the live-check cap (shown, honestly, unchecked). */
        uncheckedOpenCount: number;
      };
    }
  | { ok: false; reason: string };

/** Open rows are NEVER windowed away (an open ask must never hide) — this cap
 * is a sanity bound far above reality; overflow is reported in openCount. */
const OPEN_LIMIT = 200;
/** Decided history — a bounded newest-first tail (display only). */
const DECIDED_LIMIT = 20;
/** Live preflight is several RPC reads per row — cap it, and SAY so. */
const CHECKED_OPEN_CAP = 20;
/** Rows live-checked in bounded parallel batches (RPC politeness). */
const CHECK_BATCH = 5;

function mask(wallet: string): string {
  return wallet.length >= 10
    ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
    : "0x…";
}

export async function listActivationRequests(actor: {
  wallet: string;
  role: string;
}): Promise<ActivationQueueResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };
  try {
    const { db, activationRequest, auditLog } = await import("@workspace/db");
    const { asc, desc, inArray, notInArray } = await import("drizzle-orm");
    const selection = {
      id: activationRequest.id,
      memberWallet: activationRequest.memberWallet,
      sourceIdHex: activationRequest.sourceIdHex,
      status: activationRequest.status,
      askedAt: activationRequest.askedAt,
      decidedAt: activationRequest.decidedAt,
      declineReason: activationRequest.declineReason,
      closeCause: activationRequest.closeCause,
    };
    // TWO reads (adversarial verify 2026-07-22): a single newest-first window
    // could silently HIDE an old WAITING request behind decided history — an
    // open ask must never fall out of the founder's view. Open rows are
    // fetched by status, OLDEST first (the work); decided history is its own
    // bounded newest-first tail.
    const openRows = await db
      .select(selection)
      .from(activationRequest)
      .where(inArray(activationRequest.status, ["WAITING", "HOLD"]))
      .orderBy(asc(activationRequest.askedAt))
      .limit(OPEN_LIMIT);
    const decidedRows = await db
      .select(selection)
      .from(activationRequest)
      .where(notInArray(activationRequest.status, ["WAITING", "HOLD"]))
      .orderBy(desc(activationRequest.decidedAt))
      .limit(DECIDED_LIMIT);
    const rows = [...openRows, ...decidedRows];

    // One chain probe for the whole list; per-row reads reuse the transport.
    // Any probe/read miss serves null for that leg — never an invented pass.
    const timeoutMs =
      readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
    const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
    const probe = await probeChain(transport);
    const chainOk = probe.chainIdOk;

    const readRegistryPair = async (
      idHex: string,
    ): Promise<{ exists: boolean | null; active: boolean | null }> => {
      if (!chainOk) return { exists: null, active: null };
      let exists: boolean | null = null;
      let active: boolean | null = null;
      try {
        exists = decodeBool(
          await ethCall(
            transport,
            SOURCE_LINKAGE_TARGET.registryAddress,
            callData(SELECTOR_SOURCE_EXISTS, [bytes32Word(idHex)]),
          ),
        );
      } catch {
        exists = null;
      }
      if (exists === true) {
        try {
          active = decodeBool(
            await ethCall(
              transport,
              SOURCE_LINKAGE_TARGET.registryAddress,
              callData(SELECTOR_SOURCE_IS_ACTIVE, [bytes32Word(idHex)]),
            ),
          );
        } catch {
          active = null;
        }
      } else if (exists === false) {
        active = false;
      }
      return { exists, active };
    };

    // THE WORK-FIRST LAW applied to the check budget: openRows arrive OLDEST
    // first, so the budget spends on the requests that waited longest.
    // RPC discipline (adversarial verify 2026-07-22): when the shared chain
    // probe FAILED, no per-row read is attempted at all — every leg would
    // build its own transport and time out row by row; the checks serve null
    // (rendered blocking) instantly instead. Healthy reads run in bounded
    // parallel batches, never one long serial crawl.
    const toCheck = chainOk ? openRows.slice(0, CHECKED_OPEN_CAP) : [];
    const checkById = new Map<
      string,
      { checks: ActivationChecks; seat: string | null }
    >();
    for (let i = 0; i < toCheck.length; i += CHECK_BATCH) {
      const batch = toCheck.slice(i, i + CHECK_BATCH);
      await Promise.all(
        batch.map(async (r) => {
          const [engine, holdsSyn, pair] = await Promise.all([
            readEngineMemberNumber(r.memberWallet),
            readHoldsSyn(r.memberWallet),
            readRegistryPair(r.sourceIdHex),
          ]);
          checkById.set(r.id, {
            seat: engine.isRecognized === true ? engine.engineFigure : null,
            checks: {
              seatHeld: engine.isRecognized,
              holdsSyn,
              sourceOnChain: pair.exists,
              sourceActive: pair.active,
            },
          });
        }),
      );
    }

    const openStatuses = new Set(["WAITING", "HOLD"]);
    const out: ActivationQueueRow[] = [];
    let openCount = 0;
    let uncheckedOpenCount = 0;
    for (const r of rows) {
      const isOpen = openStatuses.has(r.status);
      if (isOpen) openCount += 1;
      const checked = checkById.get(r.id) ?? null;
      if (isOpen && checked === null && !chainOk) {
        // The probe failed: the row still renders, checks all null (blocking).
        checkById.set(r.id, {
          seat: null,
          checks: { seatHeld: null, holdsSyn: null, sourceOnChain: null, sourceActive: null },
        });
      } else if (isOpen && checked === null) {
        uncheckedOpenCount += 1;
      }
      const c = checkById.get(r.id) ?? null;
      out.push({
        id: r.id,
        walletShort: mask(r.memberWallet),
        seat: isOpen ? (c?.seat ?? null) : null,
        sourceIdHex: r.sourceIdHex,
        status: r.status,
        askedAtIso: r.askedAt instanceof Date ? r.askedAt.toISOString() : null,
        decidedAtIso:
          r.decidedAt instanceof Date ? r.decidedAt.toISOString() : null,
        declineReason: r.declineReason,
        closeCause: r.closeCause,
        checks: isOpen ? (c?.checks ?? null) : null,
      });
    }

    // The founder's queue read is audited like the member ledger (§8:
    // access is logged) — row counts only, never row content.
    await db.insert(auditLog).values({
      id: randomUUID(),
      actorWallet: actor.wallet,
      actorRole: actor.role,
      action: "activation-queue.read",
      target: null,
      detail: { rows: out.length, open: openCount },
      stepUpSigned: false,
    });

    return {
      ok: true,
      payload: { rows: out, openCount, uncheckedOpenCount },
    };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export type ActivationDecideResult = { ok: true } | { ok: false; reason: string };

/**
 * One standalone live isActive() read — K3.b hardening (the recorded K3.a
 * non-action, now closed): the "close" verdict's bell claims an on-chain
 * activation, so the REGISTRY confirms it before the bell is written. The
 * founder's assertion alone never rings a truth-bearing bell. Fail-closed:
 * null = the read did not run → refuse, never assume.
 */
async function sourceActiveLive(idHex: string): Promise<boolean | null> {
  try {
    const timeoutMs =
      readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
    const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
    const probe = await probeChain(transport);
    if (!probe.chainIdOk) return null;
    // Exists-first, like every sibling registry reader: an unknown id
    // answers false honestly instead of risking a revert → eternal 503.
    const exists = decodeBool(
      await ethCall(
        transport,
        SOURCE_LINKAGE_TARGET.registryAddress,
        callData(SELECTOR_SOURCE_EXISTS, [bytes32Word(idHex)]),
      ),
    );
    if (exists !== true) return exists === false ? false : null;
    return decodeBool(
      await ethCall(
        transport,
        SOURCE_LINKAGE_TARGET.registryAddress,
        callData(SELECTOR_SOURCE_IS_ACTIVE, [bytes32Word(idHex)]),
      ),
    );
  } catch {
    return null;
  }
}

export interface DecideActivationInput {
  id: string;
  verdict: "decline" | "hold" | "reopen" | "close";
  /** Required for decline — the human sentence the member reads. */
  reason?: string | null;
  actorWallet: string;
  actorRole: string;
}

/**
 * The founder's verdicts on a request. decline/hold/reopen are decisions;
 * close records that REALITY answered (the source turned live on-chain —
 * the caller states it, the member's bell announces it). Each verdict flips
 * status, writes the member's bell notification where one is owed, and
 * audit-rows the act — all in ONE transaction.
 */
export async function decideActivationRequest(
  input: DecideActivationInput,
): Promise<ActivationDecideResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };
  if (input.id.length === 0 || input.id.length > 64)
    return { ok: false, reason: "bad_id" };

  const reason = (input.reason ?? "").trim();
  if (input.verdict === "decline") {
    if (reason.length === 0 || reason.length > DECLINE_REASON_MAX)
      return { ok: false, reason: "bad_reason" };
    if (RAW_ADDRESS.test(reason)) return { ok: false, reason: "address_in_text" };
  }

  try {
    const { db, activationRequest, notification, auditLog } = await import(
      "@workspace/db"
    );
    const { eq, and, inArray, sql } = await import("drizzle-orm");

    // K3.b — the close verdict is VERIFIED, never asserted: before any write,
    // the registry itself must confirm the source is live. The read runs
    // OUTSIDE the transaction (an RPC must never hold a DB connection); the
    // UPDATE's status guard still protects against a concurrent verdict.
    if (input.verdict === "close") {
      const pre = await db
        .select({
          sourceIdHex: activationRequest.sourceIdHex,
          memberWallet: activationRequest.memberWallet,
        })
        .from(activationRequest)
        .where(eq(activationRequest.id, input.id))
        .limit(1);
      if (pre[0] === undefined) return { ok: false, reason: "not_found" };
      // The recorded id first; then the wallet's CANONICAL derivation (the
      // D2 class: an ask recorded against a founder-signed id while the
      // signing session creates the canonical one — either being live means
      // the member's link truly pays; adversarial verify 2026-07-22).
      let live = await sourceActiveLive(pre[0].sourceIdHex);
      if (live !== true) {
        const canonical = canonicalSourceIdHex(pre[0].memberWallet);
        if (canonical !== null && canonical !== pre[0].sourceIdHex.toLowerCase()) {
          const liveCanonical = await sourceActiveLive(canonical);
          if (liveCanonical !== null) live = liveCanonical;
        }
      }
      if (live === null) return { ok: false, reason: "unavailable" };
      if (live !== true) return { ok: false, reason: "not_active_on_chain" };
    }

    let result: ActivationDecideResult = { ok: false, reason: "not_found" };
    await db.transaction(async (tx) => {
      const found = await tx
        .select({
          id: activationRequest.id,
          memberWallet: activationRequest.memberWallet,
          status: activationRequest.status,
        })
        .from(activationRequest)
        .where(eq(activationRequest.id, input.id))
        .limit(1);
      const row = found[0];
      if (row === undefined) return; // not_found

      const now = new Date();
      const transitions: Record<string, { from: string[]; to: string }> = {
        decline: { from: ["WAITING", "HOLD"], to: "DECLINED" },
        hold: { from: ["WAITING"], to: "HOLD" },
        reopen: { from: ["HOLD"], to: "WAITING" },
        close: { from: ["WAITING", "HOLD"], to: "CLOSED" },
      };
      const t = transitions[input.verdict];
      if (!t.from.includes(row.status)) {
        result = { ok: false, reason: "bad_state" };
        return;
      }

      // THE STATE GUARD RIDES THE WRITE (adversarial verify 2026-07-22):
      // under READ COMMITTED a concurrent verdict could land between the
      // SELECT above and this UPDATE — the WHERE re-asserts the from-status
      // at write time, and ZERO matched rows = bad_state: the status never
      // flips twice and the member's bell never carries two contradictory
      // decisions for one ask.
      const updated = await tx
        .update(activationRequest)
        .set({
          status: t.to,
          decidedAt: input.verdict === "reopen" ? null : now,
          decidedByRole: input.verdict === "reopen" ? null : input.actorRole,
          declineReason: input.verdict === "decline" ? reason : null,
          closeCause: input.verdict === "close" ? "activated-on-chain" : null,
          rowVersion: sql`${activationRequest.rowVersion} + 1`,
        })
        .where(
          and(
            eq(activationRequest.id, input.id),
            inArray(activationRequest.status, t.from),
          ),
        )
        .returning({ id: activationRequest.id });
      if (updated.length === 0) {
        result = { ok: false, reason: "bad_state" };
        return;
      }

      // The bell announces every REAL state change the member must hear
      // (no email, ever). Decline carries the founder's own sentence; close
      // announces the on-chain activation. hold/reopen are internal parking —
      // the member's view stays "under review", no notification owed.
      if (input.verdict === "decline") {
        await tx.insert(notification).values({
          id: randomUUID(),
          audience: "MEMBER",
          recipientWallet: row.memberWallet,
          title: "Activation request — declined",
          body: `The founder declined your activation request: "${reason}" You can ask again once things change.`,
          icon: null,
          linkPath: "/referral",
          category: null,
          createdByRole: input.actorRole,
        });
      } else if (input.verdict === "close") {
        await tx.insert(notification).values({
          id: randomUUID(),
          audience: "MEMBER",
          recipientWallet: row.memberWallet,
          title: "Your referral link is active",
          body: "The founder signed the activation on-chain. Commissions apply from your next introduction.",
          icon: "badge-check",
          linkPath: "/referral",
          category: null,
          createdByRole: input.actorRole,
        });
      }

      await tx.insert(auditLog).values({
        id: randomUUID(),
        actorWallet: input.actorWallet,
        actorRole: input.actorRole,
        action: `activation-request.${input.verdict}`,
        target: `request#${input.id}`, // never the wallet↔seat pairing
        detail: input.verdict === "decline" ? { reasonChars: reason.length } : null,
        stepUpSigned: false,
      });
      result = { ok: true };
    });
    return result;
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

export type ActivationWalletResult =
  | { ok: true; wallet: string }
  | { ok: false; reason: string };

/**
 * THE SIGNING MATERIAL — one request's FULL wallet, founder-only, audited
 * per read. This is the ONE deliberate address-emitting read of the queue
 * (the verify-links pattern): the founder's wallet screen must show exactly
 * the wallet the request named, and createSource takes the wallet, not the
 * id. List rows stay masked; this read exists solely to build the signature
 * and is audit-rowed every single time.
 */
export async function readActivationRequestWallet(input: {
  id: string;
  actorWallet: string;
  actorRole: string;
}): Promise<ActivationWalletResult> {
  if (!gateOpen()) return { ok: false, reason: "unavailable" };
  if (input.id.length === 0 || input.id.length > 64)
    return { ok: false, reason: "bad_id" };
  try {
    const { db, activationRequest, auditLog } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const found = await db
      .select({ memberWallet: activationRequest.memberWallet })
      .from(activationRequest)
      .where(eq(activationRequest.id, input.id))
      .limit(1);
    const row = found[0];
    if (row === undefined) return { ok: false, reason: "not_found" };
    await db.insert(auditLog).values({
      id: randomUUID(),
      actorWallet: input.actorWallet,
      actorRole: input.actorRole,
      action: "activation-request.wallet-read",
      target: `request#${input.id}`,
      detail: null,
      stepUpSigned: false,
    });
    return { ok: true, wallet: row.memberWallet };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
