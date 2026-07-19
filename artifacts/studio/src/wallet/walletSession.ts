// walletSession.ts — dev-only SIWE session flow (S2 wallet session shell).
// ---------------------------------------------------------------------------
// This module sits behind the wallet session gate
// (config/walletSessionGate.ts), which is enabled in ALL builds; in
// production the server-side /api/auth zone stays dark unless explicitly
// exposed, so every call here fails closed to S1 against a dark zone.
//
// Boundaries (founder-locked):
//   - Talks ONLY to /api/auth/* — never to member/protocol/source surfaces.
//   - The server never echoes a wallet address and stores no identity; the
//     address shown in the UI is a client-side fact from the wallet itself,
//     held in memory only (never persisted, never sent anywhere except
//     inside the signed SIWE message the server verifies and drops).
//   - A session proves wallet control right now — session ≠ membership.
//   - Every failure fails closed to S1.

import { createSiweMessage } from "viem/siwe";
import { getAddress } from "viem";
import { resolveWiredState, type WiredAccessStateId } from "@/config/accessState";
import { announceSessionChanged } from "./sessionEvents";

// ── EIP-1193 injected provider (browser wallet) ─────────────────────────────

export interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
}

export function getInjectedProvider(): Eip1193Provider | null {
  if (typeof window === "undefined") return null;
  const eth = (window as { ethereum?: unknown }).ethereum;
  if (
    typeof eth === "object" &&
    eth !== null &&
    typeof (eth as { request?: unknown }).request === "function"
  ) {
    return eth as Eip1193Provider;
  }
  return null;
}

/** Prompt the wallet for account access; returns the first account or null. */
export async function requestAccount(
  provider: Eip1193Provider,
): Promise<string | null> {
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  if (Array.isArray(accounts) && typeof accounts[0] === "string") {
    return accounts[0];
  }
  return null;
}

// ── /api/auth transport (root-relative; studio is served at domain root) ────

const challengeShape = (v: unknown): v is {
  domain: string;
  uri: string;
  statement: string;
  version: string;
  chainId: number;
  nonce: string;
  issuedAt: string;
  expirationTime: string;
} => {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.domain === "string" &&
    typeof o.uri === "string" &&
    typeof o.statement === "string" &&
    o.version === "1" &&
    typeof o.chainId === "number" &&
    typeof o.nonce === "string" &&
    typeof o.issuedAt === "string" &&
    typeof o.expirationTime === "string"
  );
};

export class WalletSessionError extends Error {
  constructor(public readonly code: string) {
    super(code);
    this.name = "WalletSessionError";
  }
}

/**
 * Full SIWE sign-in: challenge → wallet signature → verify.
 * Returns the wired state on success ("S4"). The exact signed string is what
 * gets POSTed — the message is never rebuilt after signing.
 */
export async function signInWithWallet(
  provider: Eip1193Provider,
  rawAddress: string,
): Promise<WiredAccessStateId> {
  const address = getAddress(rawAddress); // EIP-55 checksum for SIWE
  const challengeRes = await fetch("/api/auth/challenge", { method: "POST" });
  if (!challengeRes.ok) throw new WalletSessionError("challenge_failed");
  const challenge: unknown = await challengeRes.json();
  if (!challengeShape(challenge)) throw new WalletSessionError("challenge_shape");

  const message = createSiweMessage({
    address,
    chainId: challenge.chainId,
    domain: challenge.domain,
    nonce: challenge.nonce,
    uri: challenge.uri,
    version: "1",
    statement: challenge.statement,
    issuedAt: new Date(challenge.issuedAt),
    expirationTime: new Date(challenge.expirationTime),
  });

  const signature = await provider.request({
    method: "personal_sign",
    params: [message, address],
  });
  if (typeof signature !== "string") throw new WalletSessionError("sign_rejected");

  const verifyRes = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, signature }),
  });
  if (!verifyRes.ok) throw new WalletSessionError("verify_rejected");
  const verified: unknown = await verifyRes.json();
  announceSessionChanged();
  return resolveWiredState(
    typeof verified === "object" && verified !== null
      ? (verified as Record<string, unknown>).state
      : undefined,
  );
}

/** Resolve the current server session; ANY failure fails closed to S1. */
export async function fetchSessionState(): Promise<WiredAccessStateId> {
  try {
    const res = await fetch("/api/auth/session", { method: "GET" });
    if (!res.ok) return "S1";
    const body: unknown = await res.json();
    return resolveWiredState(
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>).state
        : undefined,
    );
  } catch {
    return "S1";
  }
}

/**
 * The app-wide access state, resolved ENTIRELY from the server's own answers
 * about the account IT bound (founder-authorized wire widening, 2026-07-11):
 *   S1  — no signed session (fail-closed default);
 *   S4  — signed wallet control only;
 *   S7  — recognized member (member-standing: chainVerified + recognized + seat);
 *   S11 — active operator (operator-context: isOperator).
 * NEVER a client claim; ANY read failure leaves the lower state (fail-closed).
 * Operator (S11) outranks member (S7) outranks bare signed (S4). Every value is
 * still forced through resolveWiredState at the provider seam — this is defense
 * in depth, the membership/operator gate the app can finally see.
 */
export async function resolveWiredAccessState(): Promise<WiredAccessStateId> {
  const session = await fetchSessionState();
  if (session !== "S4") return "S1"; // not signed in → nothing to elevate
  const [op, standing] = await Promise.all([
    fetchOperatorContext(),
    fetchMemberStanding(),
  ]);
  if (op.isOperator === true) return "S11";
  if (
    standing !== null &&
    standing.state === "S4" &&
    standing.chainVerified &&
    standing.recognized === true &&
    standing.memberNumber !== null
  ) {
    return "S7";
  }
  return "S4";
}

/**
 * Reachability probe for the auth zone: distinguishes a DARK zone (the server
 * returns 404 for every /api/auth/* route) from a LIVE-but-signed-out one
 * ({ state: "S1" }). Fail-closed to "dark" on any non-OK response, unexpected
 * shape, or transport error — so a sign-in entry is only ever offered when the
 * zone is genuinely answering. Talks only to /api/auth, like the rest of this
 * module; the address is never involved.
 */
export async function fetchAuthAvailability(): Promise<"live" | "dark"> {
  try {
    const res = await fetch("/api/auth/session", { method: "GET" });
    if (!res.ok) return "dark";
    const body: unknown = await res.json();
    if (
      typeof body === "object" &&
      body !== null &&
      ((body as Record<string, unknown>).state === "S1" ||
        (body as Record<string, unknown>).state === "S4")
    ) {
      return "live";
    }
    return "dark";
  } catch {
    return "dark";
  }
}

/** Destroy the server session; always resolves to S1 (fail closed). */
export async function logoutSession(): Promise<WiredAccessStateId> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Cookie may outlive a failed request; the caller still wires S1 locally
    // and the next fetchSessionState() re-resolves the truth.
  }
  announceSessionChanged();
  return "S1";
}

// ── Operator authorization readback (Phase 3 bridge) ────────────────────────
// GET /api/auth/operator-context maps the session's SERVER-SIDE bound account to
// its operator role via the ACTIVE registry row. Returns { isOperator, role }.
// Fail-closed: any transport/shape failure, a dark auth zone, no session, or a
// non-ACTIVE / unknown wallet → not an operator. The account is never echoed.

export interface OperatorContextReadback {
  isOperator: boolean;
  role: string | null;
}

export async function fetchOperatorContext(): Promise<OperatorContextReadback> {
  try {
    const res = await fetch("/api/auth/operator-context", { method: "GET" });
    if (!res.ok) return { isOperator: false, role: null };
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return { isOperator: false, role: null };
    const o = body as Record<string, unknown>;
    const isOperator = o.isOperator === true;
    const role = typeof o.role === "string" ? o.role : null;
    return { isOperator, role: isOperator ? role : null };
  } catch {
    return { isOperator: false, role: null };
  }
}

/** Truncated display form of a client-known address, e.g. 0x1234…abcd. */
export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

// ── Holder Index self-readback (founder Decision 5a) ────────────────────────
// GET /api/auth/member-standing maps the session's SERVER-SIDE bound account
// to its own Holder Index era standing via the static hash-pinned snapshot.
// Own-row only: no directory, roster, or arbitrary lookup exists anywhere;
// the bound account is never echoed and no tx hash is returned.

export interface MemberStandingReadback {
  state: "S1" | "S4";
  chainVerified: boolean;
  recognized: boolean | null;
  memberNumber: string | null;
  era: string | null;
  authority: string | null;
  authorityLabel: string | null;
  continuityStatus: string | null;
  proofPosture: { snapshotStatus: string; snapshotHash: string } | null;
  /** The member's OWN entry receipt (ADR-003 §3) — own-row only, never a directory. */
  receipt: { transaction: string; block: number | null; explorerUrl: string } | null;
  failureReason: string | null;
}

/**
 * Read the signed wallet's own Holder Index standing. Returns null on ANY
 * transport/shape failure — the caller renders an honest "read unavailable",
 * never an invented standing.
 */
export async function fetchMemberStanding(): Promise<MemberStandingReadback | null> {
  try {
    const res = await fetch("/api/auth/member-standing", { method: "GET" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const o = body as Record<string, unknown>;
    if (o.state !== "S1" && o.state !== "S4") return null;

    let proofPosture: MemberStandingReadback["proofPosture"] = null;
    if (typeof o.proofPosture === "object" && o.proofPosture !== null) {
      const p = o.proofPosture as Record<string, unknown>;
      if (
        typeof p.snapshotStatus === "string" &&
        typeof p.snapshotHash === "string"
      ) {
        proofPosture = {
          snapshotStatus: p.snapshotStatus,
          snapshotHash: p.snapshotHash,
        };
      }
    }

    let receipt: MemberStandingReadback["receipt"] = null;
    if (typeof o.receipt === "object" && o.receipt !== null) {
      const rc = o.receipt as Record<string, unknown>;
      if (typeof rc.transaction === "string" && typeof rc.explorerUrl === "string") {
        receipt = {
          transaction: rc.transaction,
          block: typeof rc.block === "number" ? rc.block : null,
          explorerUrl: rc.explorerUrl,
        };
      }
    }

    return {
      state: o.state,
      chainVerified: o.chainVerified === true,
      recognized: typeof o.recognized === "boolean" ? o.recognized : null,
      memberNumber:
        typeof o.memberNumber === "string" ? o.memberNumber : null,
      era: typeof o.era === "string" ? o.era : null,
      authority: typeof o.authority === "string" ? o.authority : null,
      authorityLabel:
        typeof o.authorityLabel === "string" ? o.authorityLabel : null,
      continuityStatus:
        typeof o.continuityStatus === "string" ? o.continuityStatus : null,
      proofPosture,
      receipt,
      failureReason:
        typeof o.failureReason === "string" ? o.failureReason : null,
    };
  } catch {
    return null;
  }
}

// ── R5: own-row referral-source standing (the introduction indexer) ─────────
export interface SourceStandingReadback {
  state: "S1" | "S4";
  chainVerified: boolean;
  sourceOnChain: boolean | null;
  sourceActive: boolean | null;
  /** D2 — which resolution answered: the wallet's canonical id, or a
   * founder-signed source whose registry record pays this wallet. */
  sourceOrigin: "canonical" | "founder-signed" | null;
  /** Ruling ① — the resolved PAYING source's bytes32 id (own-row): the link
   * to advertise. Null when no source resolved (canonical derive applies). */
  sourceIdHex: string | null;
  standing: {
    attributedPurchases: number;
    introducedMembers: number;
    durableIntroductions: number;
    commissionPaidRaw: string;
    escrowOwedRaw: string;
    asOfBlock: number;
    durableTest: string;
    snapshotHash: string;
    // Ladder facts (founder simple-transparency rule: the waiting is visible,
    // dated, and never compensated — the rate applies at on-chain recording).
    currentBps: number | null;
    entitledBps: number;
    entitledTitle: string;
    promotionDue: boolean;
    crossedAtBlock: number | null;
    crossedAtDateUtc: string | null;
  } | null;
  failureReason: string | null;
}

/**
 * Read the signed wallet's OWN referral-source standing (counts from the R5
 * introduction snapshot + live registry existence). Null on ANY failure —
 * the caller renders PENDING, never an invented figure.
 */
export async function fetchSourceStanding(): Promise<SourceStandingReadback | null> {
  try {
    const res = await fetch("/api/auth/source-standing", { method: "GET" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const o = body as Record<string, unknown>;
    if (o.state !== "S1" && o.state !== "S4") return null;

    let standing: SourceStandingReadback["standing"] = null;
    if (typeof o.standing === "object" && o.standing !== null) {
      const s = o.standing as Record<string, unknown>;
      if (
        typeof s.attributedPurchases === "number" &&
        typeof s.introducedMembers === "number" &&
        typeof s.durableIntroductions === "number" &&
        typeof s.commissionPaidRaw === "string" &&
        typeof s.escrowOwedRaw === "string" &&
        typeof s.asOfBlock === "number" &&
        typeof s.durableTest === "string" &&
        typeof s.snapshotHash === "string" &&
        typeof s.entitledBps === "number" &&
        typeof s.entitledTitle === "string" &&
        typeof s.promotionDue === "boolean"
      ) {
        standing = {
          attributedPurchases: s.attributedPurchases,
          introducedMembers: s.introducedMembers,
          durableIntroductions: s.durableIntroductions,
          commissionPaidRaw: s.commissionPaidRaw,
          escrowOwedRaw: s.escrowOwedRaw,
          asOfBlock: s.asOfBlock,
          durableTest: s.durableTest,
          snapshotHash: s.snapshotHash,
          currentBps: typeof s.currentBps === "number" ? s.currentBps : null,
          entitledBps: s.entitledBps,
          entitledTitle: s.entitledTitle,
          promotionDue: s.promotionDue,
          crossedAtBlock: typeof s.crossedAtBlock === "number" ? s.crossedAtBlock : null,
          crossedAtDateUtc:
            typeof s.crossedAtDateUtc === "string" ? s.crossedAtDateUtc : null,
        };
      }
    }

    return {
      state: o.state,
      chainVerified: o.chainVerified === true,
      sourceOnChain: typeof o.sourceOnChain === "boolean" ? o.sourceOnChain : null,
      sourceActive: typeof o.sourceActive === "boolean" ? o.sourceActive : null,
      sourceOrigin:
        o.sourceOrigin === "canonical" || o.sourceOrigin === "founder-signed"
          ? o.sourceOrigin
          : null,
      sourceIdHex:
        typeof o.sourceIdHex === "string" && /^0x[0-9a-f]{64}$/.test(o.sourceIdHex)
          ? o.sourceIdHex
          : null,
      standing,
      failureReason: typeof o.failureReason === "string" ? o.failureReason : null,
    };
  } catch {
    return null;
  }
}

// ── SPEC R3: own-row channel breakdown (`&via=` — the channel log's read) ───
export interface ChannelBreakdownReadback {
  state: "S1" | "S4";
  /** false = the read/gate/resolution missed — honest unavailable, never an
   * invented empty; true + [] = genuinely no channels tracked yet. */
  available: boolean;
  rows: { via: string; clicks: number; conversions: number }[];
}

/**
 * Read the signed wallet's OWN channel breakdown (aggregate clicks +
 * receipt-verified conversions per tag, for the session's own source only).
 * Null on ANY failure — the caller renders the honest state, never a figure.
 */
export async function fetchChannelBreakdown(): Promise<ChannelBreakdownReadback | null> {
  try {
    const res = await fetch("/api/auth/channel-standing", { method: "GET" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const o = body as Record<string, unknown>;
    if (o.state !== "S1" && o.state !== "S4") return null;
    const rows: ChannelBreakdownReadback["rows"] = [];
    if (Array.isArray(o.rows)) {
      for (const r of o.rows) {
        if (typeof r !== "object" || r === null) continue;
        const row = r as Record<string, unknown>;
        if (
          typeof row.via === "string" &&
          typeof row.clicks === "number" &&
          typeof row.conversions === "number"
        ) {
          rows.push({ via: row.via, clicks: row.clicks, conversions: row.conversions });
        }
      }
    }
    return { state: o.state, available: o.available === true, rows };
  } catch {
    return null;
  }
}

// ── Slice ④: own per-introduction rows (the introducer's axis) ──────────────
/** Slice ⑤ — the receipt-backed anatomy of one commission: the sale event's
 * own amounts (USDC base-unit decimal strings), server-cross-checked; null
 * when the server could not hold a consistent breakdown (never invented). */
export interface OwnReceiptAnatomyReadback {
  grossRaw: string;
  commissionBps: number;
  netRaw: string;
  vaultRaw: string;
  liquidityRaw: string;
  operationsRaw: string;
}

export interface OwnIntroductionRowReadback {
  isoDayUtc: string;
  /** The introduced wallet, ADR-003 short form (`0x123…abcd`) — server-derived. */
  who: string;
  /** The R5 durable test at asOfBlock: the introduced wallet still holds SYN. */
  durable: boolean;
  /** Commission paid for this introduction (USDC 6-dec raw decimal string). */
  commissionRaw: string;
  /** 64-hex verify anchor + its canonical explorer URL, served per row. */
  transaction: string;
  explorerUrl: string;
  block: number;
  /** Slice ⑤: the receipt breakdown, or null — the card falls back honestly. */
  anatomy: OwnReceiptAnatomyReadback | null;
}

export interface OwnIntroductionsReadback {
  state: "S1" | "S4";
  rows: OwnIntroductionRowReadback[] | null;
  asOfBlock: number | null;
  failureReason: string | null;
}

/** Slice ⑤ — parse a row's anatomy: every field whole and well-formed, or
 * null (the panel falls back to the static example, never a partial figure). */
function parseReceiptAnatomy(v: unknown): OwnReceiptAnatomyReadback | null {
  if (typeof v !== "object" || v === null) return null;
  const a = v as Record<string, unknown>;
  const dec = (x: unknown): x is string => typeof x === "string" && /^[0-9]+$/.test(x);
  if (
    dec(a.grossRaw) &&
    typeof a.commissionBps === "number" &&
    Number.isSafeInteger(a.commissionBps) &&
    a.commissionBps >= 0 &&
    a.commissionBps <= 10_000 &&
    dec(a.netRaw) &&
    dec(a.vaultRaw) &&
    dec(a.liquidityRaw) &&
    dec(a.operationsRaw)
  ) {
    return {
      grossRaw: a.grossRaw,
      commissionBps: a.commissionBps,
      netRaw: a.netRaw,
      vaultRaw: a.vaultRaw,
      liquidityRaw: a.liquidityRaw,
      operationsRaw: a.operationsRaw,
    };
  }
  return null;
}

/**
 * Read the signed wallet's OWN per-introduction rows (each attributed join:
 * verified day · short-form wallet · durable flag · commission · verify
 * anchor). Null on ANY failure — the caller renders an honest gap, never a
 * guess.
 */
export async function fetchOwnIntroductions(): Promise<OwnIntroductionsReadback | null> {
  try {
    const res = await fetch("/api/auth/introduction-rows", { method: "GET" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const o = body as Record<string, unknown>;
    if (o.state !== "S1" && o.state !== "S4") return null;
    let rows: OwnIntroductionRowReadback[] | null = null;
    if (Array.isArray(o.rows)) {
      rows = [];
      for (const r of o.rows) {
        if (typeof r !== "object" || r === null) continue;
        const row = r as Record<string, unknown>;
        if (
          typeof row.isoDayUtc === "string" &&
          typeof row.who === "string" &&
          typeof row.durable === "boolean" &&
          typeof row.commissionRaw === "string" &&
          /^[0-9]+$/.test(row.commissionRaw) &&
          typeof row.transaction === "string" &&
          typeof row.explorerUrl === "string" &&
          typeof row.block === "number"
        ) {
          rows.push({
            isoDayUtc: row.isoDayUtc,
            who: row.who,
            durable: row.durable,
            commissionRaw: row.commissionRaw,
            transaction: row.transaction,
            explorerUrl: row.explorerUrl,
            block: row.block,
            anatomy: parseReceiptAnatomy(row.anatomy),
          });
        }
      }
    }
    return {
      state: o.state,
      rows,
      asOfBlock: typeof o.asOfBlock === "number" ? o.asOfBlock : null,
      failureReason: typeof o.failureReason === "string" ? o.failureReason : null,
    };
  } catch {
    return null;
  }
}

// ── D-TRUTH D3: own purchase-history rows (the member's own receipts) ───────
export interface OwnPurchaseRowReadback {
  isoDayUtc: string;
  /** Gross USDC, 6-dec raw decimal string — humanized at render. */
  amountRaw: string;
  /** The purchase's own 64-hex verify anchor + its canonical explorer URL. */
  transaction: string;
  explorerUrl: string;
  block: number | null;
  /** Engine generation — a public protocol parameter (V1 · V2A · V2B · V3). */
  engine: string;
}

export interface OwnPurchasesReadback {
  state: "S1" | "S4";
  /** null = the record model is unavailable (honest gap, never guessed). */
  rows: OwnPurchaseRowReadback[] | null;
  failureReason: string | null;
}

/**
 * Read the signed wallet's OWN purchase rows (every indexed purchase — the
 * cumulative footprint's addends, each with its verify anchor). Null on ANY
 * transport/shape failure — the caller renders an honest gap, never a guess.
 */
export async function fetchOwnPurchases(): Promise<OwnPurchasesReadback | null> {
  try {
    const res = await fetch("/api/auth/member-purchases", { method: "GET" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const o = body as Record<string, unknown>;
    if (o.state !== "S1" && o.state !== "S4") return null;

    let rows: OwnPurchaseRowReadback[] | null = null;
    if (Array.isArray(o.rows)) {
      rows = [];
      for (const raw of o.rows) {
        if (typeof raw !== "object" || raw === null) return null;
        const r = raw as Record<string, unknown>;
        if (
          typeof r.isoDayUtc !== "string" ||
          typeof r.amountRaw !== "string" ||
          !/^[0-9]+$/.test(r.amountRaw) ||
          typeof r.transaction !== "string" ||
          typeof r.explorerUrl !== "string" ||
          typeof r.engine !== "string"
        ) {
          return null;
        }
        rows.push({
          isoDayUtc: r.isoDayUtc,
          amountRaw: r.amountRaw,
          transaction: r.transaction,
          explorerUrl: r.explorerUrl,
          block: typeof r.block === "number" ? r.block : null,
          engine: r.engine,
        });
      }
    }

    return {
      state: o.state,
      rows,
      failureReason:
        typeof o.failureReason === "string" ? o.failureReason : null,
    };
  } catch {
    return null;
  }
}

// ── NOTIF-1: the member's own notification center (no-email canon) ──────────
export interface OwnInboxRow {
  id: string;
  /** "you" = addressed to this member alone; "all" = a broadcast. */
  scope: "you" | "all";
  title: string;
  body: string;
  /** NOTIF-2: a curated lucide icon key (or null) — rendered fail-closed. */
  icon: string | null;
  /** NOTIF-2: an internal deep-link path (or null) — clickable if whitelisted. */
  linkPath: string | null;
  createdAtIso: string | null;
  /** true until the member CLICKS the item (or marks all read). */
  unread: boolean;
}

export interface OwnInboxReadback {
  state: "S1" | "S4";
  /** null = the inbox is unavailable (honest gap, never guessed). */
  rows: OwnInboxRow[] | null;
  /** The bell badge: rows never marked seen. null when unavailable. */
  unseenCount: number | null;
  failureReason: string | null;
}

/**
 * Read the signed wallet's OWN inbox (its operator messages + broadcasts,
 * joined to its own seen/read receipts). Null on ANY transport/shape failure
 * — the caller renders an honest gap, never a guess.
 */
export async function fetchOwnInbox(): Promise<OwnInboxReadback | null> {
  try {
    const res = await fetch("/api/auth/member-inbox", { method: "GET" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const o = body as Record<string, unknown>;
    if (o.state !== "S1" && o.state !== "S4") return null;

    let rows: OwnInboxRow[] | null = null;
    if (Array.isArray(o.rows)) {
      rows = [];
      for (const raw of o.rows) {
        if (typeof raw !== "object" || raw === null) return null;
        const r = raw as Record<string, unknown>;
        if (
          typeof r.id !== "string" ||
          (r.scope !== "you" && r.scope !== "all") ||
          typeof r.title !== "string" ||
          typeof r.body !== "string" ||
          typeof r.unread !== "boolean"
        ) {
          return null;
        }
        rows.push({
          id: r.id,
          scope: r.scope,
          title: r.title,
          body: r.body,
          icon: typeof r.icon === "string" ? r.icon : null,
          linkPath: typeof r.linkPath === "string" ? r.linkPath : null,
          createdAtIso: typeof r.createdAtIso === "string" ? r.createdAtIso : null,
          unread: r.unread,
        });
      }
    }

    return {
      state: o.state,
      rows,
      unseenCount: typeof o.unseenCount === "number" ? o.unseenCount : null,
      failureReason:
        typeof o.failureReason === "string" ? o.failureReason : null,
    };
  } catch {
    return null;
  }
}

/**
 * Mark the own inbox SEEN (opening the bell clears the badge; items stay
 * unread until clicked). Fail-closed: false on any failure, never a retry
 * storm — the badge simply reappears next read.
 */
export async function postInboxSeen(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/member-inbox/seen", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Mark ONE own notification read (or ALL when id is omitted). Fail-closed:
 * false on any failure — the caller re-reads instead of guessing.
 */
export async function postInboxRead(id?: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/member-inbox/read", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(id === undefined ? {} : { id }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Truncated display form of a long hash pin, e.g. sha256:9cf82d90…211a. */
export function shortHashPin(pin: string): string {
  const [algo, hex] = pin.includes(":")
    ? [pin.slice(0, pin.indexOf(":")), pin.slice(pin.indexOf(":") + 1)]
    : ["", pin];
  if (hex.length <= 16) return pin;
  const head = `${hex.slice(0, 8)}…${hex.slice(-4)}`;
  return algo ? `${algo}:${head}` : head;
}
