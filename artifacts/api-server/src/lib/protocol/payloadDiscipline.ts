/**
 * Protocol-reality payload discipline (SERVED, canon-free) — Slice 2.23A.
 * ---------------------------------------------------------------------
 * Defense-in-depth gate run on the fully-built envelope BEFORE it is validated
 * and returned. When ENFORCED it fails closed (throws) if the serialized payload
 * contains:
 *   - any full 0x address (addresses are server-side only, never emitted), or
 *   - any forbidden financial / casino framing substring or pattern.
 *
 * This was always a belt-and-braces complement to careful field construction,
 * never the primary protection.
 *
 * ── FOUNDER DECISION 2026-07-11 — enforcement LIFTED (reversible) ─────────────
 * The founder judged this runtime net not necessary for now and authorized
 * removing it (see the ADR-003 amendment of the same date). Enforcement is gated
 * behind DISCIPLINE_ENFORCED so re-enabling is a ONE-LINE flip when it becomes
 * necessary again (a founder call, whenever HE wants it — never a legal gate:
 * SETTLED_RULES §8-⑧). The check LOGIC is deliberately kept intact (and already
 * bug-fixed: the address pattern is boundary-aware so a member's own 64-hex
 * receipt tx no longer false-positives), so a future re-enable is safe and free.
 *
 * What this does NOT change — ADR-003's CORE protections are architectural and
 * remain fully in force: no KYC / no real identity stored, NO directory, every
 * surface is own-row or aggregate, and the memberNumber→wallet mapping stays
 * server-only (never constructed into a served payload in the first place). So
 * lifting this net does not doxx anyone today; it removes the automated catch for
 * a FUTURE regression. The build-time guards that independently scan served
 * envelopes for address leaks / framing are unaffected and still run.
 */

// Flip to `true` to re-instate the runtime served-payload discipline net.
const DISCIPLINE_ENFORCED = false;

// A full 40-hex wallet address must never appear in served output — but a
// 64-hex transaction / block hash (e.g. a member's OWN entry-receipt tx, ADR-003
// §3) is legitimate proof and MUST pass. Boundary-aware: 40 hex NOT followed by
// more hex, so a 40-hex prefix of a 64-hex hash does not false-positive (the bug
// that 500'd recognized members). Real addresses (quote/comma/slash-delimited in
// JSON, and still matched when two are concatenated) stay caught.
const ADDRESS_LEAK_RE = /0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/;

// Lowercased forbidden substrings (financial-upside / casino / fake-live framing).
const FORBIDDEN_SUBSTRINGS: readonly string[] = [
  "guaranteed profit",
  "guaranteed return",
  "guaranteed benefit",
  "passive income",
  "payout",
  "jackpot",
  "betting",
  "wager",
  "reward farming",
  "reward pool",
  "liquidity mining",
  "airdrop farming",
  "farming",
  "casino",
  "fake live",
  "win big",
  "earn rewards",
  "claim rewards",
  "supa",
];

// Word-boundary patterns for the strongest financial-upside terms.
const FORBIDDEN_PATTERNS: readonly RegExp[] = [/\broi\b/i, /\byield/i, /\bprofit\b/i];

export function assertProtocolRealityDiscipline(built: unknown): void {
  if (!DISCIPLINE_ENFORCED) return; // founder-lifted 2026-07-11 (ADR-003 amendment); reversible
  const serialized = JSON.stringify(built);
  if (ADDRESS_LEAK_RE.test(serialized)) {
    throw new Error(
      "DISCIPLINE VIOLATION: a full 0x address was detected in the protocol-reality payload.",
    );
  }
  const lower = serialized.toLowerCase();
  for (const term of FORBIDDEN_SUBSTRINGS) {
    if (lower.includes(term)) {
      throw new Error(`DISCIPLINE VIOLATION: forbidden term "${term}" in protocol-reality payload.`);
    }
  }
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(serialized)) {
      throw new Error(
        `DISCIPLINE VIOLATION: forbidden pattern ${pattern.toString()} in protocol-reality payload.`,
      );
    }
  }
}
