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
 * ⛔ NOT IMPLEMENTED — AND THE RECORD IS CORRECTED HERE.
 *
 * A `matchesPublishedTerms()` helper was written when v2 shipped, and commit
 * 420f2e1's message claimed it "checks an on-chain hash against the current
 * document AND every prior one, so a v1-era source still verifies". THAT CLAIM
 * WAS FALSE: the function had ZERO call sites, so no surface performed the
 * check, and shipping a safety property that does not exist is worse than not
 * having it. It has been removed rather than left as dead code that reads like
 * a guarantee.
 *
 * WHAT IS TRUE TODAY: every published version stays served at its own address
 * (see TERMS_PRIOR_PATHS), so ANY source's commitment remains independently
 * verifiable by hand — download the version, keccak256 its raw bytes, compare
 * to the registry's metadataHash. What does NOT exist is a surface that does
 * that comparison FOR the reader; no page currently renders an existing
 * source's on-chain metadataHash at all. Building one is its own slice.
 */

