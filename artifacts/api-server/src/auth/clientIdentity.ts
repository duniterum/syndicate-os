// Client identity derivation for auth-zone throttle keying — IA-2.5.
//
// Founder-approved contract:
//   • the ONLY trusted header is `x-forwarded-for`, because the shared path
//     proxy was measured to APPEND the peer it saw (client-spoofed entries
//     remain on the left); `x-real-ip` and `Forwarded` were measured to pass
//     through UNTOUCHED and must never be read;
//   • Express `trust proxy` stays UNSET (the platform hop count is
//     undocumented and may change); this module is hop-count-agnostic: it
//     takes the RIGHTMOST valid public entry, so attacker-prepended values
//     are ignored wherever trusted infrastructure appends afterwards;
//   • privacy: the derived IP is hashed (HMAC-SHA256, per-boot random salt,
//     truncated, base64url — never hex) before use as a throttle key. The
//     raw IP never leaves this module: not exported, not logged, not stored,
//     not returned in any response;
//   • fail-safe: when no valid public entry exists (dev loopback traffic,
//     all-private chains, malformed headers) every such caller shares ONE
//     fallback bucket — the pre-IA-2.5 coarse behavior, kept as the
//     documented degradation. Never throw, never log raw headers.
//
// Sole export: throttleKey(req). Nothing else may be exported (guarded).

import { createHmac, randomBytes } from "node:crypto";
import { isIP } from "node:net";
import type { Request } from "express";

// Per-boot random salt: never from env, never persisted, never logged. The
// throttle map is in-memory and per-boot, so key stability across restarts
// is not needed — a fresh salt each boot maximizes privacy.
const PER_BOOT_SALT = randomBytes(32);

const KEY_PREFIX = "ip:";
const FALLBACK_KEY = `${KEY_PREFIX}fallback`;
const KEY_HASH_LENGTH = 24; // base64url chars (~144 bits) — never hex.

// Normalize one x-forwarded-for entry: trim, strip brackets/port, strip the
// IPv4-mapped-IPv6 prefix, lowercase. Returns null when the remainder is not
// a valid IP literal (malformed entries are skipped, never fatal).
function normalizeEntry(raw: string): string | null {
  let entry = raw.trim().toLowerCase();
  if (entry.length === 0) {
    return null;
  }
  if (entry.startsWith("[")) {
    // Bracketed IPv6, possibly with a port: [2001:db8::7]:443
    const close = entry.indexOf("]");
    if (close === -1) {
      return null;
    }
    entry = entry.slice(1, close);
  } else if (entry.includes(".") && entry.includes(":") && !entry.startsWith("::ffff:")) {
    // Unbracketed IPv4 with a port: 203.0.113.7:4321 (exactly one colon).
    const colonCount = entry.split(":").length - 1;
    if (colonCount === 1) {
      entry = entry.slice(0, entry.indexOf(":"));
    }
  }
  if (entry.startsWith("::ffff:") && entry.slice(7).includes(".")) {
    // IPv4-mapped IPv6 → compare as plain IPv4.
    entry = entry.slice(7);
  }
  if (isIP(entry) === 0) {
    return null;
  }
  return entry;
}

// Private/internal ranges are never a client identity: loopback, RFC 1918,
// link-local, CGNAT (100.64/10 — platform-internal on cloud ingress paths),
// IPv6 loopback/unspecified, link-local fe80::/10, unique-local fc00::/7.
function isPrivateOrInternal(ip: string): boolean {
  if (ip.includes(".")) {
    const parts = ip.split(".");
    const a = Number(parts[0] ?? "-1");
    const b = Number(parts[1] ?? "-1");
    if (a === 0 || a === 127 || a === 10) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }
  if (ip === "::1" || ip === "::") return true;
  if (/^fe[89ab]/.test(ip)) return true; // fe80::/10 link-local
  if (/^f[cd]/.test(ip)) return true; // fc00::/7 unique-local
  return false;
}

// Rightmost valid public entry of x-forwarded-for, or null. Module-private:
// the raw derived IP must never escape this file.
function deriveClientIp(req: Request): string | null {
  const header = req.headers["x-forwarded-for"];
  const joined = Array.isArray(header) ? header.join(",") : (header ?? "");
  if (joined.length === 0) {
    return null;
  }
  const entries = joined.split(",");
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const normalized = normalizeEntry(entries[i] ?? "");
    if (normalized !== null && !isPrivateOrInternal(normalized)) {
      return normalized;
    }
  }
  return null;
}

// The one public surface: an opaque, privacy-preserving throttle key. Same
// client → same key within one boot; no key is reversible to an IP.
export function throttleKey(req: Request): string {
  const derived = deriveClientIp(req);
  if (derived === null) {
    return FALLBACK_KEY;
  }
  const digest = createHmac("sha256", PER_BOOT_SALT)
    .update(derived)
    .digest("base64url")
    .slice(0, KEY_HASH_LENGTH);
  return `${KEY_PREFIX}${digest}`;
}
