/**
 * Address-safe serialization gate (served-side canonical copy).
 * -------------------------------------------------------------
 * Fail-closed leak scan for any aggregate/diagnostic output that must be free
 * of hex identity material: 20-byte addresses AND bare 32-byte hashes (block
 * hashes / transaction hashes are server-side context, never output).
 *
 * Mirrors the script-side scanner in scripts/member-continuity-readmodel.ts
 * (same two patterns — kept byte-identical by the backbone guard). The looser
 * address-only scan for RPC run summaries stays in rpcTransport.ts
 * (assertNoAddressLeak); THIS scanner is the stricter one for anything the
 * server serializes toward a public surface.
 */

const HEX_IDENTITY_PATTERNS: readonly RegExp[] = [
  /0x[0-9a-fA-F]{40,}/,
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
