/**
 * Address-safe serialization gate (served-side canonical copy).
 * -------------------------------------------------------------
 * Fail-closed leak scan for aggregate/diagnostic output. Per the 2026-07-25
 * ADDRESS LAW a full 40-hex wallet address is PUBLIC (it may serialize + link);
 * this scanner guards only OVER-LONG hex (0x + 41 or more) and bare 32-byte
 * hashes (block / transaction hashes are server-side context, never output).
 *
 * Mirrors the script-side scanner in scripts/member-continuity-readmodel.ts
 * (same two patterns — kept byte-identical by the backbone guard). The looser
 * address-only scan for RPC run summaries stays in rpcTransport.ts
 * (assertAddressSafeAggregate); THIS scanner is the stricter one for anything the
 * server serializes toward a public surface.
 */

const HEX_IDENTITY_PATTERNS: readonly RegExp[] = [
  // Address law (2026-07-25, CLAUDE.md rule ①): a full 40-hex wallet address is
  // PUBLIC — short-form display + a Snowtrace /address/ link. Trip only on
  // OVER-LONG hex (0x + 41+) and bare 32-byte hashes; name/email are the red line.
  /0x[0-9a-fA-F]{41,}/,
  /\b[0-9a-fA-F]{64}\b/,
];

/** Fail-closed leak scan. Throws WITHOUT echoing the leaked material. */
export function assertAddressSafeJson(json: string): void {
  for (const pattern of HEX_IDENTITY_PATTERNS) {
    if (pattern.test(json)) {
      throw new Error(
        `address-safe serialization violated (pattern ${String(pattern)} matched; content withheld)`,
      );
    }
  }
}
