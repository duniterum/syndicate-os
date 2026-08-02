/**
 * guardImportHygiene — the ONE type-import erasure the guards share
 * (2026-08-02, from the guard-integrity review's PoC finding).
 * ---------------------------------------------------------------------------
 * THE DEFECT IT REPLACES: the first erasure regex used `[^}]*` for the import
 * list, which crosses `"`, `;` and newlines — so a crafted string literal
 * (`const decoy = "import type {";`) could anchor the match INSIDE a string
 * and swallow a REAL value import from the scanned text, laundering full DB
 * access past three guards. Proven with a running PoC before this fix.
 *
 * THE FIX: the brace class admits only what a type-import list can actually
 * contain — word characters, whitespace and commas. The PoC span carries
 * `"`, `;` and `{`, all excluded, so the crafted anchor no longer matches.
 *
 * SELF-PROOF ON EVERY RUN: this module re-runs the PoC at import time and
 * throws if the laundering ever works again — a guard helper that cannot
 * silently regress (RED by construction).
 */

const TYPE_IMPORT_ERASURE = /import\s+type\s*\{[\w\s,]*\}\s*from\s*["']@workspace\/db["'];?/g;

/**
 * Remove type-only `@workspace/db` imports (erased at compile time by both
 * tsc and esbuild — they couple nothing at runtime) before a guard scans for
 * static import forms.
 */
export function stripDbTypeImports(code: string): string {
  return code.replace(TYPE_IMPORT_ERASURE, "");
}

// ── Self-proof (runs at import time in every guard that uses this) ──────────
{
  // ① The laundering PoC from the review: the erasure must NOT touch it —
  // the real value import must survive and stay detectable.
  const poc =
    'const decoy = "import type {";\nimport { db, memberContinuityRecord } from "@workspace/db";';
  const cleaned = stripDbTypeImports(poc);
  if (!/from\s*["']@workspace\/db["']/.test(cleaned)) {
    throw new Error(
      "guardImportHygiene SELF-PROOF FAILED: the erasure swallowed a value import (the laundering PoC passed)",
    );
  }
  // ② A legitimate type-only import must still be erased.
  const legit =
    'import type { MemberContinuityRecordInsert, MemberContinuityVerificationRunInsert } from "@workspace/db";\nconst x = 1;';
  if (/@workspace\/db/.test(stripDbTypeImports(legit))) {
    throw new Error(
      "guardImportHygiene SELF-PROOF FAILED: a legitimate type-only import was not erased",
    );
  }
}
