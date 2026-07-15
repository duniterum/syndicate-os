/**
 * Era-Transition Read-Model — PURE BUILDER (server-only, in-memory; H2-⑫).
 * ---------------------------------------------------------------------------
 * An era is a sale engine's rate-table page. NO deployed engine emits an
 * era-advance event (verified against every canon ABI) — a transition's only
 * on-chain witnesses are ① the era field each V2/V3 purchase carries and
 * ② the live currentEra() views. This model derives transition lines by the
 * WITNESS PATTERN (the milestone family):
 *
 *   Within ONE engine's chain-ordered, gapless purchase history, the FIRST
 *   purchase carrying era n — where n exceeds every era seen before it in
 *   that engine — witnesses the transition INTO era n, and anchors the line
 *   to its exact transaction. Cross-engine restarts are NOT transitions (a
 *   new engine's first era is its birth — the ⑩ deployments story).
 *
 * Doctrine (founder-confirmed at the H2-⑫ gate):
 *   - LINE-ON-CROSSING ONLY. No "approaching era n" progress, meter, or
 *     countdown exists ANYWHERE in this model's output — era bounds are
 *     bytecode, never framed as scarcity pressure (§8 canon note; the
 *     seat-not-security shield).
 *   - OVERCLAIM PROTECTION: the ACTIVE engine's live currentEra() read
 *     (fail-soft null) withholds any derived transition the live chain does
 *     not back, with an honest note. Sealed engines need no live check —
 *     their event history is frozen chain truth.
 *   - Eras never regress: a lower era after a higher one in the same engine
 *     fails the build closed (corrupt data, never a guess).
 *   - Purity: no db, no network, no clock.
 *
 * Privacy: outputs carry the era number, the engine's public generation
 * label, and the anchor transaction — public chain data only.
 */

import {
  PURCHASE_EVENT_BY_GENERATION,
  type BlockTimestampInput,
  type RawSaleEventInput,
  type SaleGeneration,
} from "./activityHeartbeatReadmodel";

/** Engines that carry an era field (V1 predates the era machinery). */
export const ERA_ENGINES: readonly SaleGeneration[] = ["V2A", "V2B", "V3"];

export interface EraTransitionItem {
  /** The engine whose rate table turned (public generation label). */
  readonly engine: SaleGeneration;
  /** The era the protocol entered. */
  readonly era: number;
  /** The witnessing purchase — the transition's verify anchor. */
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
  readonly blockTimestampSec: number;
  readonly isoDayUtc: string;
}

export interface EraBuildInput {
  readonly expectedChainId: number;
  /** The sale lane's raw rows (era whitelisted for the witness walk). */
  readonly rawEvents: readonly RawSaleEventInput[];
  readonly blockTimestamps: readonly BlockTimestampInput[];
  /**
   * The ACTIVE engine's live currentEra() read (fail-soft null — overclaim
   * protection only; sealed engines' histories are frozen chain truth).
   */
  readonly liveActiveEngineEra: number | null;
  /** Which engine the live read belongs to (the active engine). */
  readonly activeEngine: SaleGeneration;
}

export interface EraBuildResult {
  /** Chain order (oldest first). Empty today — all engines sit in era 1. */
  readonly transitions: readonly EraTransitionItem[];
  /** Honest derivation notes (withheld lines, live-read posture). */
  readonly notes: readonly string[];
}

function fail(message: string): never {
  throw new Error(`era build failed closed: ${message}`);
}

/** Format chain-verified epoch seconds as a UTC calendar day. NOT a clock read. */
function isoDayUtcFromSeconds(sec: number): string {
  if (!Number.isFinite(sec) || !Number.isInteger(sec) || sec <= 0) {
    fail("non-positive or non-integer block timestamp");
  }
  return new Date(sec * 1000).toISOString().slice(0, 10);
}

export function buildEraReadModel(input: EraBuildInput): EraBuildResult {
  const {
    expectedChainId,
    rawEvents,
    blockTimestamps,
    liveActiveEngineEra,
    activeEngine,
  } = input;

  const notes: string[] = [];

  const tsByBlock = new Map<number, number>();
  for (const t of blockTimestamps) {
    if (t.chainId !== expectedChainId) {
      fail(`block timestamp on unexpected chain ${t.chainId} (expected ${expectedChainId})`);
    }
    const existing = tsByBlock.get(t.blockNumber);
    if (existing !== undefined && existing !== t.blockTimestampSec) {
      fail("conflicting verified timestamps for one block");
    }
    tsByBlock.set(t.blockNumber, t.blockTimestampSec);
  }

  // Era-carrying purchases only, chain-ordered (the witness walk's spine).
  const purchases = rawEvents
    .filter((e) => {
      if (e.chainId !== expectedChainId) {
        fail(`raw event on unexpected chain ${e.chainId} (expected ${expectedChainId})`);
      }
      const gen = e.generation as SaleGeneration;
      if (!(gen in PURCHASE_EVENT_BY_GENERATION)) {
        fail(`unknown sale generation "${e.generation}"`);
      }
      return (
        ERA_ENGINES.includes(gen) &&
        e.eventName === PURCHASE_EVENT_BY_GENERATION[gen]
      );
    })
    .slice()
    .sort((a, b) =>
      a.blockNumber !== b.blockNumber
        ? a.blockNumber - b.blockNumber
        : a.logIndex - b.logIndex,
    );

  const transitions: EraTransitionItem[] = [];
  const maxEraByEngine = new Map<SaleGeneration, number>();

  for (const p of purchases) {
    if (p.era === null || !Number.isSafeInteger(p.era) || p.era < 1) {
      fail("an era-engine purchase carries no clean era — the witness walk refuses to guess");
    }
    const engine = p.generation as SaleGeneration;
    const seen = maxEraByEngine.get(engine);
    if (seen === undefined) {
      // The engine's FIRST indexed purchase: its birth era — never a
      // transition line. An engine born beyond era 1 turned pages without
      // a witness; say so honestly rather than invent an anchor.
      maxEraByEngine.set(engine, p.era);
      if (p.era > 1) {
        notes.push(
          `${engine} entered the record already in era ${p.era} — earlier page turns left no purchase witness, so no line can anchor them`,
        );
      }
      continue;
    }
    if (p.era < seen) {
      fail("an engine's era regressed within the gapless history — refusing to derive");
    }
    if (p.era > seen) {
      maxEraByEngine.set(engine, p.era);
      const ts = tsByBlock.get(p.blockNumber);
      if (ts === undefined) {
        fail("a transition-witness block has no verified timestamp in the Protocol Time cache");
      }
      transitions.push({
        engine,
        era: p.era,
        blockNumber: p.blockNumber,
        logIndex: p.logIndex,
        transactionHash: p.transactionHash,
        blockTimestampSec: ts,
        isoDayUtc: isoDayUtcFromSeconds(ts),
      });
    }
  }

  // Overclaim protection on the ACTIVE engine: a derived transition beyond
  // the live currentEra() is withheld (fail-closed), never served.
  let served = transitions;
  if (liveActiveEngineEra !== null) {
    const withheld = transitions.filter(
      (t) => t.engine === activeEngine && t.era > liveActiveEngineEra,
    );
    if (withheld.length > 0) {
      served = transitions.filter((t) => !withheld.includes(t));
      notes.push(
        `${withheld.length} ${activeEngine} transition(s) withheld — the live era read sits below the indexed witness (fail-closed)`,
      );
    }
    const derivedMax = maxEraByEngine.get(activeEngine);
    if (derivedMax !== undefined && liveActiveEngineEra > derivedMax) {
      notes.push(
        `${activeEngine} is live in era ${liveActiveEngineEra}; its first purchase there is not yet indexed — the line appears with its first witness`,
      );
    }
  } else {
    notes.push(
      "live era cross-check unavailable this cycle — transitions served from the gapless indexed history alone",
    );
  }

  return { transitions: served, notes };
}
