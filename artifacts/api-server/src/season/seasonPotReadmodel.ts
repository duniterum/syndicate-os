/**
 * seasonPotReadmodel — the pool contract's EVENT-ONLY server twin (S3-5a ·
 * master plan §1-⑦ · spec §10).
 * ---------------------------------------------------------------------------
 * A PURE fold of the MeritDistributor §6 event log into the per-season
 * 4-bucket ledger — the read-model NEVER reads balanceOf (mirroring the
 * contract's own law): a stray transfer can never inflate the served pot.
 * Replays the WHOLE history every cycle (the backbone pattern); any impossible
 * transition THROWS — the runner fails the cycle closed to lastGood.
 *
 *   - publicPot(s) = committed[s] + that season's open roundReserved +
 *     carryover — THE one served headline (spec §2, arbitrated).
 *   - state: DARK until the first COMMITTED credit (money-dark law — DARK
 *     serves ZERO figures) · FUNDED after.
 *   - ALARMS (read-model-computed; the admin strip + bell consume them):
 *     conservation broken · a PENDING round past its activate time (anyone may
 *     activate) · an ACTIVE round past its expiry left unswept · a round
 *     posted below the witnessed live era · season N+1 rules not anchored
 *     while N approaches its seal (the silent-stall fix).
 *
 * Purity: no db, no network, no clock — `now`/era context arrive as inputs.
 */

export type RoundClassNum = 0 | 1 | 2; // INTERIM | CLOSE | FINAL (the .sol enum)
export type PotRoundState = "PENDING" | "ACTIVE" | "EXPIRED" | "REVOKED";
export type SeasonPhaseName = "NONE" | "OPEN" | "FINAL_PENDING" | "CLOSED";

export type PotEventInput =
  | { readonly kind: "Funded"; readonly from: string; readonly amountRaw: string; readonly bucket: 0 | 1; readonly seasonId: number; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "SeasonRulesSet"; readonly seasonId: number; readonly rulesHash: string; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "SeasonOpened"; readonly seasonId: number; readonly rulesHash: string; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "PendingRound"; readonly roundId: number; readonly seasonId: number; readonly root: string; readonly budgetRaw: string; readonly uri: string; readonly rulesHash: string; readonly roundClass: RoundClassNum; readonly activateAfter: number; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "RoundActivated"; readonly roundId: number; readonly expiresAt: number; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "RoundRevoked"; readonly roundId: number; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "Claimed"; readonly roundId: number; readonly account: string; readonly amountRaw: string; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "CarryoverMoved"; readonly roundId: number; readonly amountRaw: string; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "SweptToReserve"; readonly amountRaw: string; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "CommittedFromReserve"; readonly seasonId: number; readonly amountRaw: string; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "TimelockAnnounced"; readonly to: string; readonly amountRaw: string; readonly readyAt: number; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "Withdrawal"; readonly to: string; readonly amountRaw: string; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "SeasonSealed"; readonly seasonId: number; readonly xpRoot: string; readonly uri: string; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string }
  | { readonly kind: "SealCorrected"; readonly seasonId: number; readonly newRoot: string; readonly blockNumber: number; readonly logIndex: number; readonly transactionHash: string };

export interface PotRoundModel {
  readonly roundId: number;
  readonly seasonId: number;
  readonly roundClass: RoundClassNum;
  readonly state: PotRoundState;
  readonly root: string;
  readonly budgetRaw: bigint;
  readonly paidRaw: bigint;
  readonly claimedCount: number;
  readonly uri: string;
  readonly rulesHash: string;
  readonly activateAfter: number;
  readonly expiresAt: number | null;
  readonly postedTx: string;
}

export interface PotAlarm {
  readonly code:
    | "conservation-broken"
    | "pending-activatable"
    | "active-unswept-past-expiry"
    | "round-below-live-era"
    | "next-season-rules-missing";
  readonly detail: string;
}

export interface SeasonPotModel {
  readonly state: "DARK" | "FUNDED";
  readonly reserveRaw: bigint;
  readonly totalCommittedRaw: bigint;
  readonly roundReservedRaw: bigint;
  readonly carryoverRaw: bigint;
  readonly totalPaidRaw: bigint;
  readonly totalWithdrawnRaw: bigint;
  readonly totalFundedRaw: bigint;
  readonly committedBySeason: ReadonlyMap<number, bigint>;
  readonly seasonPhase: ReadonlyMap<number, SeasonPhaseName>;
  readonly rulesHashBySeason: ReadonlyMap<number, string>;
  /** The SeasonSealed tx — the public verify anchor (DISTINCT from the sealing
   *  purchase the season model derives; reconciliation ruling). */
  readonly sealAnchorTxBySeason: ReadonlyMap<number, string>;
  readonly rounds: ReadonlyMap<number, PotRoundModel>;
  readonly pendingWithdrawal: { readonly to: string; readonly amountRaw: bigint; readonly readyAt: number } | null;
  readonly conservationHolds: boolean;
  readonly alarms: readonly PotAlarm[];
  readonly notes: readonly string[];
}

/** publicPot(s) — spec §2: committed[s] + that season's OPEN roundReserved +
 *  the global carryover. THE one served headline figure. */
export function publicPotRaw(model: SeasonPotModel, seasonId: number): bigint {
  let seasonReserved = 0n;
  for (const r of model.rounds.values()) {
    if (r.seasonId === seasonId && (r.state === "PENDING" || r.state === "ACTIVE")) {
      seasonReserved += r.budgetRaw - r.paidRaw;
    }
  }
  return (model.committedBySeason.get(seasonId) ?? 0n) + seasonReserved + model.carryoverRaw;
}

function raw(v: string, where: string): bigint {
  if (!/^[0-9]+$/.test(v)) throw new Error(`pot fold: non-decimal amount "${v}" at ${where}`);
  return BigInt(v);
}

export interface PotFoldContext {
  /** Unix seconds "now" (runner-supplied — purity). */
  readonly nowSeconds: number;
  /** The witnessed live era (the era read-model's answer; 0 = unknown). */
  readonly liveEra: number;
  /** True when the LIVE season approaches its seal (the caller's own signal —
   *  e.g. seats within the configured approach margin); arms the rules alarm. */
  readonly seasonApproachingSeal: boolean;
}

export function buildSeasonPotModel(
  events: readonly PotEventInput[],
  ctx: PotFoldContext,
): SeasonPotModel {
  const notes: string[] = [];
  let reserve = 0n;
  let roundReserved = 0n;
  let carryover = 0n;
  let totalCommitted = 0n;
  let totalPaid = 0n;
  let totalWithdrawn = 0n;
  let totalFunded = 0n;
  const committedBySeason = new Map<number, bigint>();
  const seasonPhase = new Map<number, SeasonPhaseName>();
  const rulesHashBySeason = new Map<number, string>();
  const sealAnchorTxBySeason = new Map<number, string>();
  const rounds = new Map<
    number,
    Omit<PotRoundModel, "budgetRaw" | "paidRaw"> & { budgetRaw: bigint; paidRaw: bigint }
  >();
  let pendingWithdrawal: SeasonPotModel["pendingWithdrawal"] = null;
  let sawCommitted = false;

  const ordered = [...events].sort(
    (a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex,
  );
  const addCommitted = (s: number, amt: bigint) => {
    committedBySeason.set(s, (committedBySeason.get(s) ?? 0n) + amt);
    totalCommitted += amt;
  };
  const drawCommitted = (s: number, amt: bigint, where: string) => {
    const cur = committedBySeason.get(s) ?? 0n;
    if (cur < amt) throw new Error(`pot fold: committed[${s}] underflow at ${where}`);
    committedBySeason.set(s, cur - amt);
    totalCommitted -= amt;
  };

  for (const e of ordered) {
    switch (e.kind) {
      case "Funded": {
        const amt = raw(e.amountRaw, "Funded");
        if (e.bucket === 1) {
          addCommitted(e.seasonId, amt);
          sawCommitted = true;
        } else {
          reserve += amt;
        }
        totalFunded += amt;
        break;
      }
      case "CommittedFromReserve": {
        const amt = raw(e.amountRaw, "CommittedFromReserve");
        if (reserve < amt) throw new Error("pot fold: reserve underflow at CommittedFromReserve");
        reserve -= amt;
        addCommitted(e.seasonId, amt);
        sawCommitted = true;
        break;
      }
      case "SeasonRulesSet": {
        rulesHashBySeason.set(e.seasonId, e.rulesHash);
        break;
      }
      case "SeasonOpened": {
        rulesHashBySeason.set(e.seasonId, e.rulesHash);
        seasonPhase.set(e.seasonId, "OPEN");
        break;
      }
      case "PendingRound": {
        if (rounds.has(e.roundId)) throw new Error(`pot fold: duplicate round ${e.roundId}`);
        const budget = raw(e.budgetRaw, "PendingRound");
        if (e.roundClass === 0) {
          drawCommitted(e.seasonId, budget, `openRound ${e.roundId}`);
        } else {
          // CLOSE/FINAL pay the WHOLE committed[s] + carryover (the contract's
          // distinct accounting) — the fold mirrors it exactly.
          const cs = committedBySeason.get(e.seasonId) ?? 0n;
          if (cs + carryover !== budget) {
            throw new Error(
              `pot fold: close/final round ${e.roundId} budget ${budget} != committed[${e.seasonId}] ${cs} + carryover ${carryover}`,
            );
          }
          drawCommitted(e.seasonId, cs, `closeRound ${e.roundId}`);
          carryover = 0n;
          seasonPhase.set(e.seasonId, "FINAL_PENDING");
        }
        roundReserved += budget;
        rounds.set(e.roundId, {
          roundId: e.roundId,
          seasonId: e.seasonId,
          roundClass: e.roundClass,
          state: "PENDING",
          root: e.root,
          budgetRaw: budget,
          paidRaw: 0n,
          claimedCount: 0,
          uri: e.uri,
          rulesHash: e.rulesHash,
          activateAfter: e.activateAfter,
          expiresAt: null,
          postedTx: e.transactionHash,
        });
        break;
      }
      case "RoundActivated": {
        const r = rounds.get(e.roundId);
        if (!r || r.state !== "PENDING") throw new Error(`pot fold: activate on non-pending ${e.roundId}`);
        rounds.set(e.roundId, { ...r, state: "ACTIVE", expiresAt: e.expiresAt });
        if (r.roundClass !== 0) seasonPhase.set(r.seasonId, "CLOSED");
        break;
      }
      case "RoundRevoked": {
        const r = rounds.get(e.roundId);
        if (!r || r.state !== "PENDING") throw new Error(`pot fold: revoke on non-pending ${e.roundId}`);
        roundReserved -= r.budgetRaw;
        addCommitted(r.seasonId, r.budgetRaw); // carryover portion merges (the contract law)
        rounds.set(e.roundId, { ...r, state: "REVOKED" });
        if (r.roundClass !== 0) seasonPhase.set(r.seasonId, "OPEN");
        break;
      }
      case "Claimed": {
        const r = rounds.get(e.roundId);
        if (!r || r.state !== "ACTIVE") throw new Error(`pot fold: claim on non-active ${e.roundId}`);
        const amt = raw(e.amountRaw, "Claimed");
        if (r.paidRaw + amt > r.budgetRaw) throw new Error(`pot fold: round ${e.roundId} over-paid`);
        roundReserved -= amt;
        totalPaid += amt;
        rounds.set(e.roundId, { ...r, paidRaw: r.paidRaw + amt, claimedCount: r.claimedCount + 1 });
        break;
      }
      case "CarryoverMoved": {
        const r = rounds.get(e.roundId);
        if (!r || r.state !== "ACTIVE") throw new Error(`pot fold: sweep on non-active ${e.roundId}`);
        const amt = raw(e.amountRaw, "CarryoverMoved");
        roundReserved -= amt;
        carryover += amt;
        rounds.set(e.roundId, { ...r, state: "EXPIRED" });
        break;
      }
      case "SweptToReserve": {
        const amt = raw(e.amountRaw, "SweptToReserve");
        reserve += amt;
        totalFunded += amt;
        break;
      }
      case "TimelockAnnounced": {
        pendingWithdrawal = { to: e.to, amountRaw: raw(e.amountRaw, "TimelockAnnounced"), readyAt: e.readyAt };
        break;
      }
      case "Withdrawal": {
        const amt = raw(e.amountRaw, "Withdrawal");
        if (reserve < amt) throw new Error("pot fold: reserve underflow at Withdrawal");
        reserve -= amt;
        totalWithdrawn += amt;
        pendingWithdrawal = null;
        break;
      }
      case "SeasonSealed": {
        sealAnchorTxBySeason.set(e.seasonId, e.transactionHash);
        break;
      }
      case "SealCorrected": {
        notes.push(`season ${e.seasonId} seal corrected once (event-trailed) at ${e.transactionHash}.`);
        break;
      }
    }
  }

  const conservationHolds =
    reserve + totalCommitted + roundReserved + carryover + totalPaid + totalWithdrawn ===
    totalFunded;

  // ── the alarm set ──
  const alarms: PotAlarm[] = [];
  if (!conservationHolds) {
    alarms.push({ code: "conservation-broken", detail: "the fold's identity does not balance — cycle fails closed" });
  }
  for (const r of rounds.values()) {
    if (r.state === "PENDING" && ctx.nowSeconds >= r.activateAfter) {
      alarms.push({
        code: "pending-activatable",
        detail: `round ${r.roundId} passed its public window — ANYONE may activate (executor-stall backstop)`,
      });
    }
    if (r.state === "ACTIVE" && r.expiresAt !== null && ctx.nowSeconds > r.expiresAt && r.budgetRaw > r.paidRaw) {
      alarms.push({
        code: "active-unswept-past-expiry",
        detail: `round ${r.roundId} holds ${(r.budgetRaw - r.paidRaw).toString()} raw past expiry — sweepExpired recycles it`,
      });
    }
    if (ctx.liveEra > 0 && r.seasonId < ctx.liveEra && (r.state === "PENDING" || r.state === "ACTIVE")) {
      alarms.push({
        code: "round-below-live-era",
        detail: `round ${r.roundId} targets season ${r.seasonId} below the live era ${ctx.liveEra} — verify intent`,
      });
    }
  }
  if (ctx.seasonApproachingSeal && ctx.liveEra > 0 && !rulesHashBySeason.has(ctx.liveEra + 1)) {
    alarms.push({
      code: "next-season-rules-missing",
      detail: `era ${ctx.liveEra} approaches its seal and season ${ctx.liveEra + 1}'s rule sheet is NOT anchored — the founder's one rules signature is due (the silent-stall fix)`,
    });
  }

  return {
    state: sawCommitted ? "FUNDED" : "DARK",
    reserveRaw: reserve,
    totalCommittedRaw: totalCommitted,
    roundReservedRaw: roundReserved,
    carryoverRaw: carryover,
    totalPaidRaw: totalPaid,
    totalWithdrawnRaw: totalWithdrawn,
    totalFundedRaw: totalFunded,
    committedBySeason,
    seasonPhase,
    rulesHashBySeason,
    sealAnchorTxBySeason,
    rounds,
    pendingWithdrawal,
    conservationHolds,
    alarms,
    notes,
  };
}
