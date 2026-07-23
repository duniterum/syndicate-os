/**
 * Season Read-Model — PURE BUILDER (SERVER-ONLY, in-memory; S1 of the seasons
 * arc, founder GO-and-GO-LIVE 2026-07-23).
 * ---------------------------------------------------------------------------
 * The design law: docs/reference/SEASONS_ORIGIN_HARVEST_AAA_BENCHMARK.md §0
 * (as amended §0.14–§0.17). What this model IS:
 *
 *   - ONE XP TRUTH (§0.1): a 100% REBUILDABLE projection over the gapless raw
 *     lanes — no tables, no persistence. The genesis retro-credit is automatic
 *     because every cycle replays the WHOLE history: idempotent by
 *     construction ("your first acts already count").
 *   - TWO PROOF CLASSES (§0.13-①): V1 emits CHAIN rows only (tx-anchored).
 *     App-attested sources (quiz, check-ins) arrive WITH their feeder slices,
 *     never before — THE FEEDER LAW is asserted fail-closed below: a quest
 *     referencing an unfed metric kills the build.
 *   - SEASON = ERA on TODAY's chain (§8-⑤): season N spans era N. The season
 *     boundary is THE SEALING BLOCK: every row at or after the sealing
 *     purchase's block belongs to the NEXT season (§0.17-③ snipe-proof —
 *     standings freeze at the block BEFORE the sealing act; nobody times the
 *     last seat to rig the frozen board).
 *   - A SEAT = A PLAYER (§0.14-F): XP credits SEATED wallets only (the sybil
 *     cost is a seat). Self-referral credits nothing (buyer == introducer).
 *     Hors-concours wallets stay LISTED and flagged — excluded from paid
 *     bands at S3, never erased from the record.
 *   - IDENTITY = THE WALLET (§0.14-A): one rank row per wallet (the #7+#11
 *     double resolves to one player); seats render as attributes. Wallet keys
 *     are SERVER-ONLY (the D3 own-purchase precedent): the PUBLIC standings
 *     are seat-keyed and address-free; the wallet index exists for the auth
 *     zone's future own-row serving and never enters any public payload.
 *   - MONEY IS NOT HERE: pot/rounds/bands are S3 (the merit primitive). This
 *     model is recognition standings + the season clock, nothing else — no
 *     approaching/progress scarcity shape exists in its output.
 *   - Purity: no db, no network, no clock — inputs arrive from the runner.
 */

import {
  PURCHASE_EVENT_BY_GENERATION,
  type BlockTimestampInput,
  type RawSaleEventInput,
  type SaleGeneration,
} from "./activityHeartbeatReadmodel";
import type {
  ArchiveMintItem,
  BurnLedgerItem,
} from "./protocolEventReadmodel";
import type { EraTransitionItem } from "./eraReadmodel";
import {
  LEVEL_XP_STEP,
  SEASON_QUESTS,
  XP_SOURCES,
  type SeasonAxis,
  type SeasonMetricKey,
  type XpSourceKey,
} from "../data/seasonConfig";

// ---------------------------------------------------------------------------
// THE FEEDER LAW (§0.3) — module-load assertion, fail-closed: the metrics this
// builder computes are the ONLY metrics a quest may reference. An unfed quest
// cannot exist; the class of "quests that can never complete" (the origin
// shipped 9 of them) is structurally dead.
// ---------------------------------------------------------------------------
const FED_METRICS: ReadonlySet<SeasonMetricKey> = new Set([
  "introductions-converted",
  "burn-acts",
  "archive-mints",
]);
for (const q of SEASON_QUESTS) {
  if (!FED_METRICS.has(q.metricKey)) {
    throw new Error(
      `season quest "${q.id}" references unfed metric "${q.metricKey}" — the feeder law (§0.3) forbids it`,
    );
  }
}

const XP_BY_SOURCE: ReadonlyMap<XpSourceKey, { xp: number; axis: SeasonAxis }> =
  new Map(XP_SOURCES.map((s) => [s.key, { xp: s.xp, axis: s.axis }]));

export interface SeasonBuildInput {
  readonly expectedChainId: number;
  readonly rawEvents: readonly RawSaleEventInput[];
  readonly blockTimestamps: readonly BlockTimestampInput[];
  readonly burnItems: readonly BurnLedgerItem[];
  readonly archiveMintItems: readonly ArchiveMintItem[];
  /** Witnessed era transitions (the era read-model's frozen record). */
  readonly eraTransitions: readonly EraTransitionItem[];
  /** D-TRUTH D1: lowercase wallet → seat #1–#8 (SERVER-ONLY join input). */
  readonly genesisSeatByWallet: ReadonlyMap<string, number>;
  /** §0.14-F hors-concours (lowercase; operator/founder wallets — flagged,
   *  never erased; excluded from paid bands at S3). */
  readonly horsConcoursWallets: ReadonlySet<string>;
}

/** One XP credit — CHAIN proof class, tx-anchored (§0.13-①). SERVER-ONLY
 *  (wallet key); public surfaces read the seat-keyed standings only. */
interface XpEvent {
  readonly wallet: string;
  readonly sourceKey: XpSourceKey | "quest-bonus";
  readonly axis: SeasonAxis;
  readonly xp: number;
  readonly blockNumber: number;
  readonly logIndex: number;
  readonly transactionHash: string;
}

/** Address-free public standing row (seat-keyed — §0.14-D). */
export interface SeasonStandingPublic {
  readonly seat: number;
  readonly rank: number;
  readonly xp: number;
  readonly axes: Readonly<Record<SeasonAxis, number>>;
  readonly horsConcours: boolean;
  readonly lastActBlock: number;
}

export interface SeasonModelPublic {
  readonly seasonNumber: number;
  readonly era: number;
  readonly state: "LIVE" | "SEALED";
  /** The sealing purchase's anchor (SEALED seasons only). */
  readonly sealTransactionHash: string | null;
  readonly sealBlockNumber: number | null;
  readonly playersEarning: number;
  readonly standings: readonly SeasonStandingPublic[];
}

/** SERVER-ONLY per-wallet view (future auth-zone own-row serving; never a
 *  public payload — the D3 precedent). */
export interface WalletSeasonView {
  readonly seat: number;
  readonly lifetimeXp: number;
  readonly level: number;
  readonly metrics: Readonly<Record<SeasonMetricKey, number>>;
  readonly questsCompleted: readonly string[];
}

export interface SeasonBuildResult {
  readonly seasons: readonly SeasonModelPublic[];
  readonly currentSeasonNumber: number;
  /** SERVER-ONLY wallet index (lowercase keys). Never serialized publicly. */
  readonly walletIndex: ReadonlyMap<string, WalletSeasonView>;
  readonly notes: readonly string[];
}

function fail(msg: string): never {
  throw new Error(`season read-model: ${msg}`);
}

export function buildSeasonReadModel(input: SeasonBuildInput): SeasonBuildResult {
  const {
    expectedChainId,
    rawEvents,
    blockTimestamps,
    burnItems,
    archiveMintItems,
    eraTransitions,
    genesisSeatByWallet,
    horsConcoursWallets,
  } = input;
  const notes: string[] = [];

  // --- Chain uniformity (heartbeat discipline, fail closed) ---
  for (const t of blockTimestamps) {
    if (t.chainId !== expectedChainId) {
      fail(`block timestamp on unexpected chain ${t.chainId} (expected ${expectedChainId})`);
    }
  }

  // --- The purchase sequence, chain-ordered (the spine) ---
  const purchases = rawEvents
    .filter((e) => {
      if (e.chainId !== expectedChainId) {
        fail(`raw event on unexpected chain ${e.chainId} (expected ${expectedChainId})`);
      }
      const gen = e.generation as SaleGeneration;
      if (!(gen in PURCHASE_EVENT_BY_GENERATION)) {
        fail(`unknown sale generation "${e.generation}"`);
      }
      return e.eventName === PURCHASE_EVENT_BY_GENERATION[gen];
    })
    .slice()
    .sort((a, b) =>
      a.blockNumber !== b.blockNumber
        ? a.blockNumber - b.blockNumber
        : a.logIndex - b.logIndex,
    );

  // --- A SEAT = A PLAYER: the seated-wallet roster (lowercase → seat) ---
  // Genesis roster (frozen, seats #1–#8) + every first-seat purchase whose
  // event names its holder. V1 rows without an address are covered by the
  // genesis roster; anything else stays honestly unattributed.
  const seatByWallet = new Map<string, number>(genesisSeatByWallet);
  let unattributedSeats = 0;
  for (const p of purchases) {
    if (p.firstSeat === true && p.memberNumber !== null) {
      const w = p.memberAddress?.toLowerCase() ?? null;
      if (w === null) {
        unattributedSeats += 1;
        continue;
      }
      if (!seatByWallet.has(w)) seatByWallet.set(w, p.memberNumber);
    }
  }
  if (unattributedSeats > 0) {
    notes.push(
      `${unattributedSeats} early seat row(s) carry no holder address in their own event — covered by the frozen genesis roster where applicable, otherwise honestly outside the XP record.`,
    );
  }

  // --- SEASON BOUNDARIES (§0.17-③): one rule for every row ---
  // For each witnessed transition to era E, the sealing act = the LAST era-
  // (E-1) purchase strictly before the witness. Every row with blockNumber >=
  // sealing block belongs to the next season (freeze at the block BEFORE the
  // sealing act — snipe-proof, deterministic).
  const sealBlocks: { era: number; blockNumber: number; transactionHash: string }[] = [];
  const sortedTransitions = eraTransitions
    .slice()
    .sort((a, b) => a.era - b.era);
  for (const t of sortedTransitions) {
    const oldEra = t.era - 1;
    let sealing: RawSaleEventInput | null = null;
    for (const p of purchases) {
      if (p.blockNumber > t.blockNumber) break;
      if (p.blockNumber === t.blockNumber && p.logIndex >= t.logIndex) break;
      const pEra = p.era ?? 1; // V1 rows carry no era — era-1 history (noted)
      if (pEra === oldEra) sealing = p;
    }
    if (sealing === null) {
      notes.push(
        `era ${t.era} transition witnessed but no sealing era-${oldEra} purchase found before it — boundary anchored at the witness itself (honest fallback).`,
      );
      sealBlocks.push({ era: oldEra, blockNumber: t.blockNumber, transactionHash: t.transactionHash });
    } else {
      sealBlocks.push({ era: oldEra, blockNumber: sealing.blockNumber, transactionHash: sealing.transactionHash });
    }
  }
  const seasonOf = (blockNumber: number): number => {
    let s = 1;
    for (const b of sealBlocks) {
      if (blockNumber >= b.blockNumber) s += 1;
      else break;
    }
    return s;
  };
  const currentSeasonNumber = sealBlocks.length + 1;

  // --- THE XP EVENTS (chain proof class only, V1) ---
  const src = (k: XpSourceKey) => {
    const d = XP_BY_SOURCE.get(k);
    if (!d) fail(`XP source "${k}" missing from the config sheet`);
    return d;
  };
  const events: XpEvent[] = [];
  // Purchase + introduction credits (the sale lane's own fields, no joins).
  const purchaseCredited = new Set<string>(); // `${wallet}|${season}` — once per season (§0.17-⑤)
  let selfReferralsIgnored = 0;
  let unseatedIntroducersIgnored = 0;
  for (const p of purchases) {
    const holder = p.memberAddress?.toLowerCase() ?? null;
    const season = seasonOf(p.blockNumber);
    if (holder !== null && seatByWallet.has(holder) && p.firstSeat === true) {
      const onceKey = `${holder}|${season}`;
      if (!purchaseCredited.has(onceKey)) {
        purchaseCredited.add(onceKey);
        const d = src("purchase-receipt");
        events.push({
          wallet: holder,
          sourceKey: "purchase-receipt",
          axis: d.axis,
          xp: d.xp,
          blockNumber: p.blockNumber,
          logIndex: p.logIndex,
          transactionHash: p.transactionHash,
        });
      }
    }
    const introducer = p.referrerAddress?.toLowerCase() ?? null;
    if (introducer !== null) {
      if (holder !== null && introducer === holder) {
        selfReferralsIgnored += 1;
      } else if (!seatByWallet.has(introducer)) {
        unseatedIntroducersIgnored += 1;
      } else {
        const d = src("introduction-converted");
        events.push({
          wallet: introducer,
          sourceKey: "introduction-converted",
          axis: d.axis,
          xp: d.xp,
          blockNumber: p.blockNumber,
          logIndex: p.logIndex,
          transactionHash: p.transactionHash,
        });
      }
    }
  }
  if (selfReferralsIgnored > 0) {
    notes.push(`${selfReferralsIgnored} self-referral row(s) credited nothing (§0.14-F — structural).`);
  }
  if (unseatedIntroducersIgnored > 0) {
    notes.push(
      `${unseatedIntroducersIgnored} introduction(s) by not-yet-seated sources credited nothing (a seat = a player).`,
    );
  }
  // Burn acts (the fire lane's own actor).
  for (const b of burnItems) {
    const w = b.actorAddress.toLowerCase();
    if (!seatByWallet.has(w)) continue;
    const d = src("burn-act");
    events.push({
      wallet: w,
      sourceKey: "burn-act",
      axis: d.axis,
      xp: d.xp,
      blockNumber: b.blockNumber,
      logIndex: b.logIndex,
      transactionHash: b.transactionHash,
    });
  }
  // Archive mints (known minters only — honest gaps stay gaps).
  let unknownMinters = 0;
  for (const m of archiveMintItems) {
    const w = m.minterAddress?.toLowerCase() ?? null;
    if (w === null) {
      unknownMinters += 1;
      continue;
    }
    if (!seatByWallet.has(w)) continue;
    const d = src("archive-mint");
    events.push({
      wallet: w,
      sourceKey: "archive-mint",
      axis: d.axis,
      xp: d.xp,
      blockNumber: m.blockNumber,
      logIndex: m.logIndex,
      transactionHash: m.transactionHash,
    });
  }
  if (unknownMinters > 0) {
    notes.push(
      `${unknownMinters} archive mint(s) predate the minter backfill — credited to nobody (an honest gap, never a guess).`,
    );
  }
  notes.push(
    "burn-act holding-period condition (§0.17-⑤) arrives with the bounty slice — recognition-only until then.",
  );

  // --- QUEST LADDERS (feeder-law metrics; bonus XP at the crossing act) ---
  events.sort((a, b) =>
    a.blockNumber !== b.blockNumber
      ? a.blockNumber - b.blockNumber
      : a.logIndex - b.logIndex,
  );
  const METRIC_BY_SOURCE: Partial<Record<XpSourceKey, SeasonMetricKey>> = {
    "introduction-converted": "introductions-converted",
    "burn-act": "burn-acts",
    "archive-mint": "archive-mints",
  };
  const metricsByWallet = new Map<string, Record<SeasonMetricKey, number>>();
  const questsByWallet = new Map<string, string[]>();
  const bonusEvents: XpEvent[] = [];
  for (const e of events) {
    const metricKey = e.sourceKey === "quest-bonus" ? undefined : METRIC_BY_SOURCE[e.sourceKey];
    if (metricKey === undefined) continue;
    let m = metricsByWallet.get(e.wallet);
    if (!m) {
      m = { "introductions-converted": 0, "burn-acts": 0, "archive-mints": 0 };
      metricsByWallet.set(e.wallet, m);
    }
    m[metricKey] += 1;
    for (const q of SEASON_QUESTS) {
      if (q.metricKey !== metricKey || m[metricKey] !== q.target) continue;
      const done = questsByWallet.get(e.wallet) ?? [];
      done.push(q.id);
      questsByWallet.set(e.wallet, done);
      bonusEvents.push({
        wallet: e.wallet,
        sourceKey: "quest-bonus",
        axis: e.axis,
        xp: q.bonusXp,
        blockNumber: e.blockNumber,
        logIndex: e.logIndex,
        transactionHash: e.transactionHash,
      });
    }
  }
  const allEvents = events.concat(bonusEvents);

  // --- STANDINGS per season (deterministic tie-break, §0.14-B) ---
  interface Acc {
    xp: number;
    axes: Record<SeasonAxis, number>;
    lastActBlock: number;
  }
  const bySeason = new Map<number, Map<string, Acc>>();
  const lifetime = new Map<string, number>();
  for (const e of allEvents) {
    const season = seasonOf(e.blockNumber);
    let walletMap = bySeason.get(season);
    if (!walletMap) {
      walletMap = new Map();
      bySeason.set(season, walletMap);
    }
    let acc = walletMap.get(e.wallet);
    if (!acc) {
      acc = { xp: 0, axes: { connector: 0, capital: 0, steward: 0, historian: 0 }, lastActBlock: 0 };
      walletMap.set(e.wallet, acc);
    }
    acc.xp += e.xp;
    acc.axes[e.axis] += e.xp;
    if (e.blockNumber > acc.lastActBlock) acc.lastActBlock = e.blockNumber;
    lifetime.set(e.wallet, (lifetime.get(e.wallet) ?? 0) + e.xp);
  }

  const seasons: SeasonModelPublic[] = [];
  for (let s = 1; s <= currentSeasonNumber; s += 1) {
    const walletMap = bySeason.get(s) ?? new Map<string, Acc>();
    const rows = [...walletMap.entries()]
      .map(([wallet, acc]) => ({
        wallet,
        seat: seatByWallet.get(wallet),
        acc,
      }))
      .filter((r): r is { wallet: string; seat: number; acc: Acc } => r.seat !== undefined)
      .sort((a, b) => {
        if (a.acc.xp !== b.acc.xp) return b.acc.xp - a.acc.xp;
        if (a.acc.lastActBlock !== b.acc.lastActBlock) {
          return a.acc.lastActBlock - b.acc.lastActBlock;
        }
        return a.seat - b.seat;
      });
    const standings: SeasonStandingPublic[] = rows.map((r, i) => ({
      seat: r.seat,
      rank: i + 1,
      xp: r.acc.xp,
      axes: { ...r.acc.axes },
      horsConcours: horsConcoursWallets.has(r.wallet),
      lastActBlock: r.acc.lastActBlock,
    }));
    const seal = sealBlocks[s - 1] ?? null;
    seasons.push({
      seasonNumber: s,
      era: s,
      state: seal !== null ? "SEALED" : "LIVE",
      sealTransactionHash: seal?.transactionHash ?? null,
      sealBlockNumber: seal?.blockNumber ?? null,
      playersEarning: standings.filter((r) => r.xp > 0).length,
      standings,
    });
  }

  // --- SERVER-ONLY wallet index (future own-row serving; never public) ---
  const walletIndex = new Map<string, WalletSeasonView>();
  for (const [wallet, seat] of seatByWallet) {
    const xp = lifetime.get(wallet) ?? 0;
    walletIndex.set(wallet, {
      seat,
      lifetimeXp: xp,
      level: Math.floor(xp / LEVEL_XP_STEP) + 1,
      metrics:
        metricsByWallet.get(wallet) ??
        { "introductions-converted": 0, "burn-acts": 0, "archive-mints": 0 },
      questsCompleted: questsByWallet.get(wallet) ?? [],
    });
  }

  notes.push(
    `retro-credit: the whole indexed history replayed (${allEvents.length} XP credit(s) across ${currentSeasonNumber} season(s)) — idempotent by construction.`,
  );

  return {
    seasons,
    currentSeasonNumber,
    walletIndex,
    notes,
  };
}
