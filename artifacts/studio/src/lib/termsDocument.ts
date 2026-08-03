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

/**
 * THE CURRENT DOCUMENT — what a NEW source commits to.
 *
 * v2 (2026-08-03, founder-approved): v1's eligibility clause claimed «The
 * referrer holds a Syndicate seat (is a member)» — a requirement the sale
 * contract never enforced. It gates on `SYN.balanceOf(sourceWallet)`, and the
 * error that reads ReferrerNotSeated «ne vérifie PAS le siège. Il vérifie le
 * solde» (SPEC_REFERRAL_SYSTEM §262/§436). A signed-in holder who bought SYN on
 * a DEX is a legitimate referrer, and v1 told him his commissions were void.
 */
export const TERMS_PATH = "/referral-program-terms-v2.txt";
export const TERMS_CANONICAL_URL =
  "https://thesyndicate.money/referral-program-terms-v2.txt";

/**
 * PRIOR VERSIONS — PUBLISHED FOREVER, NEVER EDITED.
 *
 * A document's keccak256 over its raw bytes IS the `metadataHash` the registry
 * stored on-chain when a source was created. Editing a published version in
 * place would break the verification of every source that committed to it —
 * which is exactly why v1 was superseded by a NEW file instead of a rewrite.
 * Each entry stays served at its own URL so its hash keeps verifying.
 */
export const TERMS_PRIOR_PATHS: readonly string[] = ["/referral-program-terms-v1.txt"];

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
export async function fetchTermsHash(path: string = TERMS_PATH): Promise<TermsHashRead | null> {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length === 0) return null;
    return { hash: keccak256(buf), bytes: buf.length };
  } catch {
    return null;
  }
}

/**
 * Does an on-chain `metadataHash` match ANY published version of the terms?
 *
 * THE HISTORY, because it cost two rounds. 420f2e1 shipped this helper with a
 * commit message claiming it made v1-era sources verify — it had ZERO call
 * sites, so the claim was false. 71d255e then DELETED it, on the written
 * grounds that "no page renders an existing source's metadataHash at all".
 * That second claim was false too: ProposeSourceCreate.tsx does exactly that,
 * and gates the founder's **Activate** signature on it. Deleting the helper
 * turned a version-blind comparison into a permanent brick — every source that
 * committed to v1 could never be activated again, on the money path, under an
 * on-screen instruction ("Do not activate until they match") that could not be
 * satisfied.
 *
 * So it is back, and this time it is WIRED. A source created before v2
 * committed to v1's bytes and that commitment is still perfectly valid;
 * comparing only against the CURRENT document reports a broken commitment
 * where there is none.
 *
 * Null on any read failure — fail closed: no answer, never a verdict.
 */
export async function matchesPublishedTerms(
  onChainHash: string,
): Promise<{ matched: true; path: string } | { matched: false } | null> {
  const want = onChainHash.toLowerCase();
  let allRead = true;
  for (const path of [TERMS_PATH, ...TERMS_PRIOR_PATHS]) {
    const read = await fetchTermsHash(path);
    if (read === null) {
      allRead = false;
      continue;
    }
    if (read.hash.toLowerCase() === want) return { matched: true, path };
  }
  // FAIL CLOSED ON A PARTIAL READ (corrected 2026-08-03, review finding).
  // This used to answer {matched:false} as soon as ANY ONE version had been
  // read — so v2 loading while v1 404s or times out produced a CONFIDENT
  // "does not match" about a hash we never compared against v1. That is the
  // v1-era brick this helper exists to prevent, relocated behind a partial
  // failure: the founder's Activate stays disabled under a sentence telling
  // him the on-chain commitment is broken when it is not. "No match" may only
  // be claimed when EVERY published version was actually read.
  return allRead ? { matched: false } : null;
}

