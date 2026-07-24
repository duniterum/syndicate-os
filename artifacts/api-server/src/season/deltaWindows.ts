/**
 * deltaWindows — THE BLOCK-BOUNDED MONEY STANDINGS (S3-5a · §0.17-② · the
 * single largest additive change to the season model, shipped + tested BEFORE
 * any payout root exists — the double-pay class dies here).
 * ---------------------------------------------------------------------------
 * Every round — interim AND season-close — pays XP earned inside ITS window:
 * the half-open span (previousSnapshotBlock, currentSnapshotBlock], contiguous
 * by construction. XP in a pending window belongs to the NEXT window. For the
 * season-close round the caller passes currentSnapshot = sealingBlock − 1 (the
 * §0.17-③ snipe-proof freeze), which by construction captures ALL remaining
 * season XP — the trailing-XP exception needs no special case: nothing
 * in-season is ever dropped.
 *
 * The pipeline: window-select → enrich (acquisition history for the holding
 * period · referred purchase + referred wallet XP for the floor-gate) →
 * `filterForMoneyWindow` (the §0.17-⑤ laws, fail-closed) → per-wallet money
 * XP + attaining block → PotInputRow[] for `potPolicy` (the ONE share
 * authority). LIFETIME/recognition XP is computed elsewhere and NEVER touched
 * here — rank never drops; only the MONEY binds to windows.
 */

import type { SeasonMoneyContext } from "../backbone/seasonReadmodel.js";
import {
  filterForMoneyWindow,
  type AntiFarmKnobs,
  type MoneyExclusionReason,
  type MoneyWindowEventInput,
} from "./antiFarm.js";
import type { PotInputRow } from "./potPolicy.js";

export interface WindowStandingsArgs {
  readonly moneyContext: SeasonMoneyContext;
  /** block → unix seconds (the enriched block-time lane). Missing = fail-closed. */
  readonly timeByBlock: ReadonlyMap<number, number>;
  readonly horsConcoursWallets: ReadonlySet<string>;
  /** The previous snapshot block (EXCLUSIVE — the engraved half-open law). */
  readonly windowStartBlock: number;
  /** The current snapshot block (INCLUSIVE; season-close: sealingBlock − 1). */
  readonly windowEndBlock: number;
  readonly knobs: AntiFarmKnobs;
}

export interface WindowStandingsResult {
  /** potPolicy-ready rows — every acting wallet in the window (the policy
   *  applies seat/floor eligibility itself; nothing pre-judged here). */
  readonly rows: readonly PotInputRow[];
  readonly includedEvents: number;
  readonly exclusionsByReason: Readonly<Partial<Record<MoneyExclusionReason, number>>>;
  readonly notes: readonly string[];
}

export function buildMoneyWindowStandings(args: WindowStandingsArgs): WindowStandingsResult {
  const {
    moneyContext,
    timeByBlock,
    horsConcoursWallets,
    windowStartBlock,
    windowEndBlock,
    knobs,
  } = args;
  if (windowEndBlock <= windowStartBlock) {
    throw new Error(
      `delta window: end ${windowEndBlock} must exceed start ${windowStartBlock} (half-open (start, end])`,
    );
  }
  const notes: string[] = [];

  // ── window select: (start, end] — the engraved contiguity law ──
  const inWindow = moneyContext.xpEvents.filter(
    (e) => e.blockNumber > windowStartBlock && e.blockNumber <= windowEndBlock,
  );

  // ── enrich for the §0.17-⑤ laws (null context = fail-closed exclusion) ──
  // Referred-wallet XP at the SNAPSHOT: cumulative credits up to the window end.
  const xpAtSnapshot = new Map<string, number>();
  for (const e of moneyContext.xpEvents) {
    if (e.blockNumber <= windowEndBlock) {
      xpAtSnapshot.set(e.wallet, (xpAtSnapshot.get(e.wallet) ?? 0) + e.xp);
    }
  }
  const lastAcquisitionBefore = (wallet: string, block: number): number | null => {
    const blocks = moneyContext.purchaseBlocksByWallet.get(wallet);
    if (!blocks || blocks.length === 0) return null;
    let found: number | null = null;
    for (const b of blocks) {
      if (b <= block) found = b;
      else break;
    }
    return found;
  };
  const enriched: MoneyWindowEventInput[] = [];
  let missingTimestamps = 0;
  for (const e of inWindow) {
    const ts = timeByBlock.get(e.blockNumber);
    if (ts === undefined) missingTimestamps += 1;
    let lastAcquiredAtSec: number | null = null;
    if (e.sourceKey === "burn-act" || e.sourceKey === "archive-mint") {
      const acqBlock = lastAcquisitionBefore(e.wallet, e.blockNumber);
      const acqTs = acqBlock !== null ? timeByBlock.get(acqBlock) : undefined;
      lastAcquiredAtSec = acqTs ?? null; // unknown → antiFarm excludes
    }
    enriched.push({
      wallet: e.wallet,
      sourceKey: e.sourceKey,
      xp: e.xp,
      blockNumber: e.blockNumber,
      logIndex: e.logIndex,
      actAtSec: ts ?? 0, // 0 with null acquisition stays fail-closed
      lastAcquiredAtSec,
      referredPurchaseUsdc: e.referredPurchaseUsdc,
      referredWalletXp:
        e.referredWallet !== null ? (xpAtSnapshot.get(e.referredWallet) ?? 0) : null,
    });
  }
  if (missingTimestamps > 0) {
    notes.push(
      `${missingTimestamps} window event(s) lack an enriched block time — their holding-period context stays fail-closed.`,
    );
  }

  // ── the §0.17-⑤ laws ──
  const filtered = filterForMoneyWindow(enriched, knobs);
  const exclusionsByReason: Partial<Record<MoneyExclusionReason, number>> = {};
  for (const x of filtered.excluded) {
    exclusionsByReason[x.reason] = (exclusionsByReason[x.reason] ?? 0) + 1;
  }

  // ── per-wallet money XP + the attaining block (the §0.14-B second key:
  //    the block at which the wallet REACHED its final window total) ──
  const attainingBlock = new Map<string, number>();
  for (const e of filtered.included) {
    const prev = attainingBlock.get(e.wallet) ?? 0;
    if (e.blockNumber > prev) attainingBlock.set(e.wallet, e.blockNumber);
  }
  const rows: PotInputRow[] = [...filtered.perWalletMoneyXp.entries()].map(([wallet, xp]) => ({
    account: wallet as `0x${string}`,
    seat: moneyContext.seatByWallet.get(wallet) ?? null,
    windowXp: xp,
    attainingBlock: attainingBlock.get(wallet) ?? windowEndBlock,
    horsConcours: horsConcoursWallets.has(wallet),
  }));

  return { rows, includedEvents: filtered.included.length, exclusionsByReason, notes };
}

/** The contiguous window chain for a season (§0.17-② — "no interim rounds =
 *  the seal pays the whole season"): given the season's paid snapshots so far,
 *  the NEXT window is (lastPaidSnapshot, currentSnapshot]. Pure bookkeeping,
 *  exported so the executor and the admin dry-run share ONE definition. */
export function nextWindow(
  lastPaidSnapshotBlock: number | null,
  currentSnapshotBlock: number,
  seasonStartBlock: number,
): { windowStartBlock: number; windowEndBlock: number } {
  return {
    windowStartBlock: lastPaidSnapshotBlock ?? seasonStartBlock - 1,
    windowEndBlock: currentSnapshotBlock,
  };
}
