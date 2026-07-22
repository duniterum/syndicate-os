/**
 * Source-Ownership Index — SERVER-ONLY in-memory holder (D-TRUTH D2).
 * ---------------------------------------------------------------------------
 * WHY (founder GO 2026-07-16): source-standing used to derive ONLY the
 * canonical keccak sourceId, so a founder-signed source with its own id
 * (the BUILDER class) read as "no source exists" to the very wallet it pays
 * — a truth bug on the member's own dashboard. This index maps each indexed
 * source's CURRENT registry-read wallet of record to its sourceId so the
 * own-row standing read can fall back to it.
 *
 * REUSE-BEFORE-CREATE: the backbone's introduction refresh (M0) ALREADY
 * decodes the registry's full SourceRecord per indexed source every cycle
 * — this holder simply keeps the wallet→sourceId edge instead of throwing
 * it away. Zero extra RPC, zero DB, zero persistence.
 *
 * ADDRESS DISCIPLINE (ADR-003): wallets live here SERVER-ONLY, keyed for
 * exactly one purpose — matching a session's OWN bound account. Nothing in
 * this module is ever serialized; the standing read emits counts and never
 * the wallet or the raw id. The committed introduction snapshot stays
 * address-free by construction — this edge deliberately lives OUTSIDE it.
 *
 * Coverage honesty: candidates come from sources with at least one indexed
 * attributed purchase (the refresh's own universe). A founder-signed source
 * with ZERO purchases is not discoverable here — its member-class owners
 * are already covered by the canonical derivation; the residual gap is
 * noted, never guessed over.
 */

export interface OwnedSourceEdge {
  /** The source's bytes32 id (0x + 64 hex, lowercase). SERVER-ONLY. */
  readonly sourceId: string;
  /** The source's latest attributed-purchase block (candidate ordering). */
  readonly lastBlock: number;
}

interface OwnershipIndex {
  /** lowercase wallet of record → its sources, most recently active first. */
  readonly byWallet: ReadonlyMap<string, readonly OwnedSourceEdge[]>;
  readonly asOfBlock: number;
}

let current: OwnershipIndex | null = null;

/** Backbone-only writer (introductionRefresh) — replaces the whole index. */
export function setSourceOwnershipIndex(
  byWallet: ReadonlyMap<string, readonly OwnedSourceEdge[]>,
  asOfBlock: number,
): void {
  if (current !== null && asOfBlock < current.asOfBlock) return; // never regress
  current = { byWallet, asOfBlock };
}

/**
 * The sources whose registry wallet of record is this account (lowercase).
 * Returns null while the index has never built (post-boot warm-up — the
 * caller says "warming", never "no source exists"); [] once built and empty.
 */
export function getOwnedSources(
  accountLower: string,
): readonly OwnedSourceEdge[] | null {
  if (current === null) return null;
  return current.byWallet.get(accountLower) ?? [];
}

/**
 * K3.c (mockup Face 5, founder-approved): EVERY ownership edge — consumed
 * ONLY by the founder-gated per-source performance service, which masks the
 * wallet before anything is serialized (the ADR-003 posture above holds:
 * this module still never serializes). Null while the index has never built.
 */
export function getAllOwnershipEdges(): readonly {
  wallet: string;
  sourceId: string;
  lastBlock: number;
}[] | null {
  if (current === null) return null;
  const out: { wallet: string; sourceId: string; lastBlock: number }[] = [];
  for (const [wallet, edges] of current.byWallet) {
    for (const e of edges) {
      out.push({ wallet, sourceId: e.sourceId, lastBlock: e.lastBlock });
    }
  }
  return out;
}
