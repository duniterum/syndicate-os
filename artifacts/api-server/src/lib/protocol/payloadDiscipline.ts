/**
 * Protocol-reality payload discipline (SERVED, canon-free) — Slice 2.23A.
 * ---------------------------------------------------------------------
 * Defense-in-depth gate run on the fully-built envelope BEFORE it is validated
 * and returned. It fails closed (throws) if the serialized payload contains:
 *   - any full 0x address (addresses are server-side only, never emitted), or
 *   - any forbidden financial / casino framing substring or pattern.
 *
 * This is a belt-and-braces complement to careful field construction, not a
 * substitute for it. The route catches a throw and returns 500 rather than ever
 * shipping a non-compliant payload.
 */

import { FULL_ADDRESS_RE } from "./rpcTransport";

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
  const serialized = JSON.stringify(built);
  if (FULL_ADDRESS_RE.test(serialized)) {
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
