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
 *   - THE MULTI-LEVEL LAW (founder ruling 2026-07-23 "OK ça me va" — supersedes
 *     the earlier seat-gate): XP accrues at EVERY user level. The chain itself
 *     pays commissions to no-seat SYN referrers (ReferrerNotSeated checks the
 *     BALANCE, never the seat), so their acts are real and COUNT — and future
 *     modules (swap · marketplace) join as XP sources with their families.
 *     THE POT requires the seat: `potEligible` = seated AND not hors-concours;
 *     a no-seat builder's standing shows the share their rank WOULD pay —
 *     PENDING, activated the day they seat (the conversion machine, the K4
 *     lever). Self-referral credits nothing (buyer == introducer).
 *     Hors-concours wallets stay LISTED and flagged — never erased, never paid.
 *     Public identity: the chain-emitted SHORT FORM for every row (the feed
 *     projection's own pattern — never a full address), plus the seat
 *     ordinal for the seated (S2c: the board renders both, per the mockup).
 *   - IDENTITY = THE WALLET (§0.14-A): one rank row per wallet (the #7+#11
 *     double resolves to one builder); seats render as attributes. Wallet keys
 *     are SERVER-ONLY (the D3 own-purchase precedent): the PUBLIC standings
 *     are seat-keyed and address-free; the wallet index exists for the auth
 *     zone's own-row serving (LIVE at GET /api/auth/season-standing since
 *     S2d 2026-07-24) and never enters any public payload.
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

/** Address-safe public standing row (§0.14-D + the multi-level law): every
 *  row carries the chain-emitted SHORT FORM (the feed projection's own
 *  pattern — never a full address); the seated carry their seat ordinal
 *  on top (S2c, founder 2026-07-23: the board shows both, per the approved
 *  ranking mockup's "#3 0x03e…c6d0" identity). */
export interface SeasonStandingPublic {
  /** "#14" for the seated · "0x3f2…0a91" for no-seat builders. */
  readonly display: string;
  /** The chain-emitted short form ("0x3f2…0a91") — every row, seated too. */
  readonly shortForm: string;
  readonly seat: number | null;
  /** Seated AND not hors-concours — the ONLY wallets the pot may pay (S3). */
  readonly potEligible: boolean;
  /** §0.18: NUMBERED ranks belong to pot-eligible builders ONLY — a no-seat or
   *  hors-concours row is sorted in place but carries null (renders "—"). */
  readonly rank: number | null;
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

/** SERVER-ONLY per-wallet view (serves the auth zone's own-row endpoint
 *  GET /api/auth/season-standing — S2d 2026-07-24; never a
 *  public payload — the D3 precedent). */
export interface WalletSeasonView {
  /** null = a no-seat builder (multi-level law) — XP counts, the pot waits. */
  readonly seat: number | null;
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

  // --- The seated roster (lowercase → seat) — decides POT eligibility and
  //     the public display form, never who may EARN (multi-level law) ---
  // Genesis roster (frozen, seats #1–#8) + every first-seat purchase whose
  // event names its holder. V1 rows without an address are covered by the
  // genesis roster; anything else stays honestly unattributed.
  // DISPLAYED ORDINAL = THE LIVE ENGINE'S ANSWER (founder ruling 2026-07-23,
  // chain-verified that day: memberNumberOf(0x3ff…894f) = 11 while
  // memberByNumber(7) stands empty forever): a V3-minted seat OVERRIDES the
  // frozen roster and sealed-era numbers — the board shows the contract's own
  // ordinal, the same number the feed and receipts already carry. The wallet
  // still keys ONE row (§0.14-A); only the shown number follows the chain.
  const seatByWallet = new Map<string, number>(genesisSeatByWallet);
  const liveEngineSeated = new Set<string>();
  let unattributedSeats = 0;
  for (const p of purchases) {
    if (p.firstSeat === true && p.memberNumber !== null) {
      const w = p.memberAddress?.toLowerCase() ?? null;
      if (w === null) {
        unattributedSeats += 1;
        continue;
      }
      if (p.generation === "V3") {
        if (!liveEngineSeated.has(w)) {
          liveEngineSeated.add(w);
          seatByWallet.set(w, p.memberNumber);
        }
      } else if (!seatByWallet.has(w)) {
        seatByWallet.set(w, p.memberNumber);
      }
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
  // §0.17-⑤ (final-audit fix): the FIRST qualifying purchase per wallet per
  // SEASON credits — a footprint purchase in a later season re-credits once
  // (the firstSeat-only gate mis-paid every season after the seating one).
  const purchaseCredited = new Set<string>(); // `${wallet}|${season}` — once per season
  let selfReferralsIgnored = 0;
  for (const p of purchases) {
    const holder = p.memberAddress?.toLowerCase() ?? null;
    const season = seasonOf(p.blockNumber);
    if (holder !== null && seatByWallet.has(holder)) {
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
      } else {
        // MULTI-LEVEL LAW: a no-seat SYN referrer's conversion is a real
        // chain-paid act — it credits XP; only the POT requires the seat.
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
    notes.push(`${selfReferralsIgnored} self-referral row(s) credited nothing (structural).`);
  }
  // Burn acts (the fire lane's own actor — every level plays, multi-level law).
  for (const b of burnItems) {
    const w = b.actorAddress.toLowerCase();
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
    "burn-act recognition credits unconditionally by design; the §0.17-⑤ holding-period law gates the MONEY window in src/season/antiFarm.ts (S3-4).",
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

  // The feed projection's own short form — the ONLY address shape that may
  // leave the server (multi-level law: no-seat builders render short-form).
  const shortForm = (w: string): string => `${w.slice(0, 5)}…${w.slice(-4)}`;
  const seasons: SeasonModelPublic[] = [];
  for (let s = 1; s <= currentSeasonNumber; s += 1) {
    const walletMap = bySeason.get(s) ?? new Map<string, Acc>();
    const rows = [...walletMap.entries()]
      .map(([wallet, acc]) => ({
        wallet,
        seat: seatByWallet.get(wallet) ?? null,
        acc,
      }))
      .sort((a, b) => {
        if (a.acc.xp !== b.acc.xp) return b.acc.xp - a.acc.xp;
        if (a.acc.lastActBlock !== b.acc.lastActBlock) {
          return a.acc.lastActBlock - b.acc.lastActBlock;
        }
        return (a.seat ?? Number.MAX_SAFE_INTEGER) - (b.seat ?? Number.MAX_SAFE_INTEGER);
      });
    // §0.18: the paid numbering walks ELIGIBLE rows only — nobody's rank
    // depends on someone else's choice; ineligible rows sort in place, unnumbered.
    let eligibleRank = 0;
    const standings: SeasonStandingPublic[] = rows.map((r) => {
      const potEligible = r.seat !== null && !horsConcoursWallets.has(r.wallet);
      if (potEligible) eligibleRank += 1;
      return {
        display: r.seat !== null ? `#${r.seat}` : shortForm(r.wallet),
        shortForm: shortForm(r.wallet),
        seat: r.seat,
        potEligible,
        rank: potEligible ? eligibleRank : null,
        xp: r.acc.xp,
        axes: { ...r.acc.axes },
        horsConcours: horsConcoursWallets.has(r.wallet),
        lastActBlock: r.acc.lastActBlock,
      };
    });
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

  // --- SERVER-ONLY wallet index (own-row serving LIVE via the auth zone
  //     since S2d; never public) ---
  // Multi-level law: EVERY acting wallet gets a view (seated or not), plus
  // seated wallets that have not acted yet (their zero state still exists).
  const walletIndex = new Map<string, WalletSeasonView>();
  const allWallets = new Set<string>([...lifetime.keys(), ...seatByWallet.keys()]);
  for (const wallet of allWallets) {
    const xp = lifetime.get(wallet) ?? 0;
    walletIndex.set(wallet, {
      seat: seatByWallet.get(wallet) ?? null,
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
