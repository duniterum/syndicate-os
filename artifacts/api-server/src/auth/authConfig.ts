// Auth zone configuration — IA-2 dev-only SIWE challenge/session skeleton.
//
// Founder-approved boundaries (IA-2):
//   • registry-less, fixture-tested, S4-capped: a verified signature proves
//     wallet control ONLY and produces state "S4" (signed-in, unverified) — it
//     never verifies membership, never grants operator authority, and no
//     surface becomes GATED;
//   • bounded in-memory stores only (dev skeleton) — restart loses state and
//     the system fails closed to S1;
//   • same-origin HttpOnly cookies; global CORS stays credential-free;
//   • this zone is architecturally separate from the read-only protocol
//     reality spine and must never import registry/DB modules.

import { randomBytes } from "node:crypto";

// Avalanche C-Chain. Must equal the vendored canon chain id — reconciled by
// scripts/guard-auth-zone.ts (served code stays canon-free by design).
export const AUTH_CHAIN_ID = 43114;

// Founder-approved SIWE statement (exact text; guard-reconciled, do not edit
// without founder approval).
export const AUTH_STATEMENT =
  "Sign to prove control of this wallet. This creates a temporary unverified session only. It does not verify membership, grant operator authority, authorize a transaction, or move funds.";

export const SIWE_VERSION = "1" as const;

// Nonce store bounds (≤5 min TTL per design doc §B; bounded entries so an
// unauthenticated challenge flood cannot exhaust memory).
export const NONCE_TTL_MS = 5 * 60 * 1000;
export const NONCE_MAX_ENTRIES = 5000;

// Session store bounds (absolute ≤60 min per design doc §B; shorter idle
// timeout; bounded entries).
export const SESSION_ABSOLUTE_TTL_MS = 60 * 60 * 1000;
export const SESSION_IDLE_TTL_MS = 15 * 60 * 1000;
export const SESSION_MAX_ENTRIES = 1000;

export const SESSION_COOKIE_NAME = "syn_session";

// Request body cap for the auth router's scoped JSON parser (a full SIWE
// message with the approved statement is well under 1 KB).
export const AUTH_JSON_LIMIT = "8kb";

// Per-IP throttle for the unauthenticated POST endpoints. Behind the shared
// path proxy all callers may collapse onto few peer IPs, so this is a memory/
// abuse backstop for the dev skeleton, not a precision rate limiter.
export const THROTTLE_WINDOW_MS = 60 * 1000;
export const THROTTLE_MAX_PER_WINDOW = 30;
export const THROTTLE_MAX_TRACKED_KEYS = 10_000;

function splitEnvList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

// Platform-internal hosts Replit injects into REPLIT_DOMAINS alongside the
// custom domain. These are the URL the wallet must NOT be asked to sign for —
// a member on thesyndicate.money seeing "sign for *.replit.app" reads as
// phishing. Used only to DEMOTE these hosts, never to reject them.
const INTERNAL_HOST_RE = /\.(replit\.app|repl\.co|replit\.dev)$/i;

// The canonical public host this deployment serves under. Preference, most
// authoritative first: (1) an explicitly DECLARED host (SYNDICATE_CANONICAL_HOST)
// — declare-don't-infer; (2) the first non-platform host in REPLIT_DOMAINS (the
// custom apex, e.g. thesyndicate.money — self-healing with zero env action);
// (3) REPLIT_DOMAINS[0] as it was; (4) the dev domain; (5) localhost.
function canonicalHost(): string | undefined {
  const declared = process.env["SYNDICATE_CANONICAL_HOST"]?.trim();
  if (declared) return declared;
  const domains = splitEnvList(process.env["REPLIT_DOMAINS"]);
  const custom = domains.find((h) => !INTERNAL_HOST_RE.test(h));
  if (custom) return custom;
  if (domains[0]) return domains[0];
  const devHost = process.env["REPLIT_DEV_DOMAIN"];
  if (devHost) return devHost;
  return undefined;
}

// The SIWE challenge is domain- and URI-bound to the canonical origin this
// server actually serves. Values are computed server-side and re-checked
// server-side on verify — never trusted from the client.
export function expectedSiweOrigin(): { domain: string; uri: string } {
  const host = canonicalHost();
  if (host) {
    return { domain: host, uri: `https://${host}/` };
  }
  return { domain: "localhost", uri: "http://localhost/" };
}

// Browser-origin allowlist for the CSRF origin check on auth POSTs. Mirrors
// the app-level CORS derivation (kept self-contained here so the auth zone
// never reaches into app wiring); the global CORS policy itself stays
// credential-free and untouched.
export function isAllowedBrowserOrigin(origin: string): boolean {
  const allowed = new Set<string>();
  for (const host of splitEnvList(process.env["REPLIT_DOMAINS"])) {
    allowed.add(`https://${host}`);
  }
  // The canonical host may be DECLARED out-of-band (SYNDICATE_CANONICAL_HOST);
  // keep the CSRF allow-list in lockstep with the SIWE domain so they can
  // never diverge.
  const canonical = canonicalHost();
  if (canonical) {
    allowed.add(`https://${canonical}`);
  }
  const devDomain = process.env["REPLIT_DEV_DOMAIN"];
  if (devDomain) {
    allowed.add(`https://${devDomain}`);
  }
  for (const extra of splitEnvList(process.env["CORS_ALLOWED_ORIGINS"])) {
    allowed.add(extra);
  }
  if (allowed.has(origin)) {
    return true;
  }
  if (process.env["NODE_ENV"] !== "production") {
    return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  }
  return false;
}

// 16 random bytes as 32 hex chars — satisfies EIP-4361's alphanumeric
// nonce requirement without ever emitting 64-hex-looking material.
export function newNonce(): string {
  return randomBytes(16).toString("hex");
}

// Opaque 256-bit session id (base64url, never hex, never logged).
export function newSessionId(): string {
  return randomBytes(32).toString("base64url");
}
