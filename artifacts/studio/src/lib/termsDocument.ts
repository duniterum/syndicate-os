// termsDocument.ts — the published referral-program terms and their hash.
// ---------------------------------------------------------------------------
// R1 (SPEC_REFERRAL_SYSTEM §⑪): the program terms are a PUBLISHED plain
// document; its keccak256 over the raw served bytes IS the metadataHash the
// registry stores on-chain (LIFETIME member sources revert MissingMetadata
// without it). The hash is never hardcoded anywhere: it is computed from the
// served file each time it is needed, so document and commitment cannot drift.
// Same-origin fetch: dev serves the identical repo file from public/; the
// production static host serves the same bytes at the canonical URL.
// Raw I/O lives here in lib (the chainReads convention) — wallet-zone modules
// consume the helper and stay free of raw fetches (guard-access-state).

import { keccak256 } from "viem";

export const TERMS_PATH = "/referral-program-terms-v1.txt";
export const TERMS_CANONICAL_URL =
  "https://thesyndicate.money/referral-program-terms-v1.txt";

export interface TermsHashRead {
  /** keccak256 over the served file's raw bytes — the on-chain commitment. */
  readonly hash: `0x${string}`;
  /** Size of the hashed document, for the human check. */
  readonly bytes: number;
}

/**
 * Fetch the served terms document and hash its exact bytes. Null on ANY
 * failure (missing file, empty body, network) — callers fail closed: no
 * document, no hash, nothing to sign.
 */
export async function fetchTermsHash(): Promise<TermsHashRead | null> {
  try {
    const res = await fetch(TERMS_PATH, { cache: "no-store" });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length === 0) return null;
    return { hash: keccak256(buf), bytes: buf.length };
  } catch {
    return null;
  }
}
