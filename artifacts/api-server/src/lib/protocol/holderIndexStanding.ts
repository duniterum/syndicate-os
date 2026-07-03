// holderIndexStanding.ts — pure own-row era resolution over the static
// Holder Index snapshot (founder Decision 5a: self-readback only).
// ---------------------------------------------------------------------------
// Maps a live engine memberNumber (EXACT decimal string) into EXACTLY ONE
// snapshot era, or fails closed. No lookup by wallet, no per-seat rows, no
// directory: the ONLY input is a memberNumber the live engine itself emitted
// for the session's own bound account. This module performs no I/O and no
// database access; the snapshot is the static hash-pinned served source.
//
// Fail-closed outcomes:
//   - snapshot status not VERIFIED            → UNRECONCILED (unavailable)
//   - memberNumber "0"                        → callers must treat as sentinel
//     BEFORE calling (this module rejects it defensively as OUT_OF_RANGE)
//   - memberNumber outside every era range    → STALE (live engine is ahead of
//     the verified snapshot; never guessed into an era)
//   - memberNumber inside >1 era (impossible
//     by construction, checked anyway)        → AMBIGUOUS (unavailable)

import {
  HOLDER_INDEX_SNAPSHOT,
  type HolderIndexSnapshot,
} from "./holderIndexSnapshot";

export type StandingResolution =
  | {
      kind: "MAPPED";
      era: string;
      authority: string;
      authorityLabel: string;
      continuityStatus: "VERIFIED_IN_SNAPSHOT";
      snapshotHash: string;
      snapshotStatus: string;
    }
  | { kind: "STALE" }
  | { kind: "AMBIGUOUS" }
  | { kind: "UNRECONCILED" }
  | { kind: "OUT_OF_RANGE" };

/** Decimal-string guard: rejects anything that is not a plain uint decimal. */
const DECIMAL_RE = /^(0|[1-9][0-9]*)$/;

export function resolveStandingIn(
  snapshot: HolderIndexSnapshot,
  memberNumberDecimal: string,
): StandingResolution {
  if (snapshot.status !== "VERIFIED") return { kind: "UNRECONCILED" };
  if (!DECIMAL_RE.test(memberNumberDecimal)) return { kind: "OUT_OF_RANGE" };

  const n = BigInt(memberNumberDecimal);
  if (n === 0n) return { kind: "OUT_OF_RANGE" }; // sentinel — never a seat

  const matches = snapshot.eras.filter(
    (e) => n >= BigInt(e.seatNumberLow) && n <= BigInt(e.seatNumberHigh),
  );
  if (matches.length > 1) return { kind: "AMBIGUOUS" };
  if (matches.length === 0) return { kind: "STALE" };

  const era = matches[0]!;
  return {
    kind: "MAPPED",
    era: era.era,
    // Numbering authority IS the era in this model (#1–8 freeze/root, #9+
    // V3 emitted) — mirrored verbatim from the snapshot, never re-derived.
    authority: era.era,
    authorityLabel: era.label,
    continuityStatus: "VERIFIED_IN_SNAPSHOT",
    snapshotHash: snapshot.snapshotHash,
    snapshotStatus: snapshot.status,
  };
}

/** Convenience wrapper over the served static snapshot. */
export function resolveOwnStanding(
  memberNumberDecimal: string,
): StandingResolution {
  return resolveStandingIn(HOLDER_INDEX_SNAPSHOT, memberNumberDecimal);
}
