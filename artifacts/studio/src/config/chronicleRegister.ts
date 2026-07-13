// config/chronicleRegister.ts — THE CHRONICLE REGISTER (committed file).
// ---------------------------------------------------------------------------
// CHR-1 doctrine: the Chronicle's v1 data source is THIS FILE, in the repo.
// PROMOTION IS A FOUNDER ACT — an entry lands here via a commit the founder
// approves; there is no DB, no server write, and no auto-promotion, ever.
// Candidates wait in docs/chronicle/candidates/; the console's Chronicle
// panel PREPARES an entry in this exact shape for the founder's commit.
//
// Register discipline (matches the first candidate): protocol-institutional
// voice · identity-blind (seat numbers only, never a wallet or a person) ·
// amount-blind unless the amount IS the record · oldest-first on the page ·
// every entry says how to VERIFY itself.

export interface ChronicleSection {
  heading: string;
  body: string;
}

export interface ChronicleEntry {
  /** Stable id (kebab, dated) — also the anchor on /chronicle. */
  id: string;
  /** The day the recorded thing happened (UTC). */
  dateUtc: string;
  title: string;
  sections: readonly ChronicleSection[];
  /** How a reader verifies this record themselves (verify-first, always). */
  verifyNote: string;
}

/**
 * The public register. EMPTY until the founder promotes the first entry —
 * and /chronicle says so honestly. Oldest-first when rendered.
 */
export const CHRONICLE_REGISTER: readonly ChronicleEntry[] = [];
