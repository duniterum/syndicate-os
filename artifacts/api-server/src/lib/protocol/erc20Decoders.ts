/**
 * Pure ERC-20 metadata decoders (SERVED, canon-free) — Slice 2.23A.
 * ----------------------------------------------------------------
 * Strict, network-free ABI decoders for the only ERC-20 views this slice reads:
 * symbol() and decimals(). They validate strictly and return null on any
 * malformation so the caller can emit an explicit failure instead of fake data.
 *
 * Selectors are the canonical keccak256(signature)[:4] values; a reconcile guard
 * verifies these hardcoded selectors still match the derived selectors.
 */

// keccak256("name()")[:4], keccak256("symbol()")[:4], keccak256("decimals()")[:4]
export const SELECTOR_NAME = "0x06fdde03" as const;
export const SELECTOR_SYMBOL = "0x95d89b41" as const;
export const SELECTOR_DECIMALS = "0x313ce567" as const;

/** Reject empty/non-printable/oversized decoded text (treated as a decode failure). */
function cleanText(s: string): string | null {
  const t = s.replace(/\u0000/g, "").trim();
  if (!t) return null;
  // Any C0 control char other than tab/newline/CR means we decoded garbage.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(t)) return null;
  if (t.length > 128) return null; // a real token name/symbol is short
  return t;
}

/** Decode an ABI-encoded `string` return (dynamic), with a bytes32 fallback. */
export function decodeAbiString(hex: unknown): string | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]*$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length === 0) return null;

  // Standard dynamic string: [offset(32)][length(32)][content...].
  if (data.length >= 128) {
    let offset: number;
    try {
      offset = Number(BigInt("0x" + data.slice(0, 64)));
    } catch {
      offset = -1;
    }
    const lenStart = offset * 2;
    if (offset >= 0 && Number.isFinite(lenStart) && lenStart + 64 <= data.length) {
      let len: number;
      try {
        len = Number(BigInt("0x" + data.slice(lenStart, lenStart + 64)));
      } catch {
        len = -1;
      }
      const contentStart = lenStart + 64;
      const contentEnd = contentStart + len * 2;
      if (len >= 0 && len <= 1024 && contentEnd <= data.length) {
        const buf = Buffer.from(data.slice(contentStart, contentEnd), "hex");
        return cleanText(buf.toString("utf8"));
      }
    }
  }

  // Legacy bytes32 string: exactly one word, right-NUL-padded.
  if (data.length === 64) {
    const buf = Buffer.from(data, "hex");
    return cleanText(buf.toString("utf8"));
  }

  return null;
}

/** Decode a single uint8 word (decimals). Rejects anything outside 0..255. */
export function decodeUint8(hex: unknown): number | null {
  if (typeof hex !== "string" || !/^0x[0-9a-fA-F]+$/.test(hex)) return null;
  const data = hex.slice(2);
  if (data.length !== 64) return null;
  let n: bigint;
  try {
    n = BigInt("0x" + data);
  } catch {
    return null;
  }
  if (n < 0n || n > 255n) return null;
  return Number(n);
}
