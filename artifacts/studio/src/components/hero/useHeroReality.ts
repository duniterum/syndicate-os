// Live public hero data — the ONLY data source for the hero's financial
// figures. Every value is a real read-only on-chain read served by the
// Protocol Reality Spine (GET /api/protocol/reality, cached ≤30s server-side
// with stale-while-revalidate) or the Holder Index aggregates
// (GET /api/holder-index, static hash-pinned snapshot).
//
// Fail-closed doctrine: every field is `string | null` — null means the live
// read is unavailable and the UI must show an honest "unavailable / checking"
// state. NOTHING here ever falls back to a simulated figure.
import { useGetProtocolReality, useGetHolderIndex } from "@workspace/api-client-react";

/**
 * Raw base-unit string → fixed-decimal display string, BigInt-safe and
 * half-up ROUNDED (never truncated) at `displayDecimals`. Null on any
 * malformed input — fail-closed, nothing invented.
 */
export function formatBaseUnits(
  raw: string | null | undefined,
  decimals: number,
  displayDecimals: number,
): string | null {
  if (typeof raw !== "string" || !/^[0-9]+$/.test(raw)) return null;
  let value: bigint;
  try {
    value = BigInt(raw);
  } catch {
    return null;
  }
  const display = displayDecimals <= 0 ? 0 : Math.min(displayDecimals, decimals);
  // Scale down to display units with half-up rounding.
  const dropDigits = BigInt(decimals - display);
  const scale = 10n ** dropDigits;
  const rounded = (value + scale / 2n) / scale; // integer count of 10^-display units
  const displayBase = 10n ** BigInt(display);
  const whole = rounded / displayBase;
  const frac = rounded % displayBase;
  const wholeText = whole.toLocaleString("en-US");
  if (display <= 0) return wholeText;
  return `${wholeText}.${frac.toString().padStart(display, "0")}`;
}

/** 70/20/10 routed share of a raw USDC base-unit aggregate (exact bigint math). */
function routedShare(rawAggregate: string | null, bps: bigint): string | null {
  if (typeof rawAggregate !== "string" || !/^[0-9]+$/.test(rawAggregate)) return null;
  try {
    return formatBaseUnits(((BigInt(rawAggregate) * bps) / 10_000n).toString(), 6, 2);
  } catch {
    return null;
  }
}

export interface HeroReality {
  loading: boolean;
  /**
   * LIVE continuous member total — the active V3 engine's reconciled
   * memberCount() (seats #1..memberCount). The canonical public headline; a live
   * chain read, NOT the served snapshot. Fail-closed to null.
   */
  membersTotal: string | null;
  membersTotalNumber: number | null;
  /** Historical freeze/root base #1–#8 (live GENESIS_OFFSET), fail-closed. */
  historicalFreeze: number | null;
  /** Live V3-emitted seats = memberCount − GENESIS_OFFSET (dual authority). */
  v3Emitted: number | null;
  /** Verified snapshot total (the point-in-time attestation) + its as-of. */
  snapshotMemberTotal: number | null;
  snapshotAsOf: string | null;
  /** True when the live engine has advanced past the verified snapshot (STALE). */
  membersDiverged: boolean;
  /**
   * The honest readback (12/11 doctrine): memberCount() counts SEATS, not
   * people. distinctWallets = memberCount − seatOverlap, DERIVED server-side
   * from live memberNumberOf() reads over the historical freeze set (counts
   * only — no wallet is ever served). Fail-closed to null.
   */
  distinctWallets: number | null;
  /** Wallets holding TWO seats (bought on V3 before claiming — pre-gate duplicates). */
  seatOverlap: number | null;
  /** Aggregate cumulative on-chain inflow (V1+V2A+V2+V3), USDC display. */
  aggregateInflowUsdc: string | null;
  /** Raw 6-dec base units of the aggregate (for count-up animation). */
  aggregateInflowRaw: string | null;
  /** Live wallet/reserve balances. */
  vaultUsdc: string | null;
  opsUsdc: string | null;
  lpUsdc: string | null;
  lpSyn: string | null;
  burnedSyn: string | null;
  /** Referral attribution ACTIVITY COUNT (never a USDC/commission figure). */
  attributionActivities: string | null;
  /** Archive1155 minted counts — live reads from the archive group. */
  nftFirstSignalMinted: string | null;
  nftPatronSealMinted: string | null;
  /** Sum of both minted counts; null unless BOTH live reads are available. */
  nftMintedTotal: string | null;
  /**
   * NFT revenue = Σ (live mint price × live minted) per artifact, exact bigint
   * math on raw 6-dec base units. Null unless EVERY input read is available.
   */
  nftRevenueUsdc: string | null;
  nftRevenueRaw: string | null;
  /**
   * TRUE gross cumulative inflow = membership sales aggregate + NFT revenue.
   * Null unless BOTH live figures are available (fail-closed, never partial).
   */
  grossTotalUsdc: string | null;
  grossTotalRaw: string | null;
  /** Computed 70/20/10 routed shares of the aggregate (the routing proof). */
  routedVault: string | null;
  routedLiquidity: string | null;
  routedOperations: string | null;
}

function findFinancial(
  financial: ReadonlyArray<{ id: string; value: unknown }> | undefined,
  id: string,
): string | null {
  const item = financial?.find((i) => i.id === id);
  if (!item) return null;
  return typeof item.value === "string" ? item.value : null;
}

/** Spine values are EXACT raw strings — parse a non-negative integer count strictly. */
function findFinancialCount(
  financial: ReadonlyArray<{ id: string; value: unknown }> | undefined,
  id: string,
): number | null {
  const item = financial?.find((i) => i.id === id);
  if (!item) return null;
  if (typeof item.value === "number" && Number.isInteger(item.value) && item.value >= 0) {
    return item.value;
  }
  if (typeof item.value === "string" && /^[0-9]+$/.test(item.value)) {
    const parsed = Number(item.value);
    return Number.isSafeInteger(parsed) ? parsed : null;
  }
  return null;
}

export function useHeroReality(): HeroReality {
  const reality = useGetProtocolReality();
  const holderIndex = useGetHolderIndex();

  const financial = reality.data?.groups.financial;
  const aggregateRaw = findFinancial(financial, "financial.inflow.aggregate");

  // LIVE headline: the reconciled continuous memberCount() from the reality
  // spine (fail-closed if the server's anchor/invariant reconciliation failed).
  // NO SNAPSHOT FOR A LIVE-READABLE FIGURE — the served snapshot is used only for
  // the dual-authority attestation + divergence, never as the headline.
  const liveMemberCount = findFinancialCount(financial, "financial.members.memberCount");
  const genesisOffset = findFinancialCount(financial, "financial.members.genesisOffset");
  const distinctWallets = findFinancialCount(financial, "financial.members.distinctWallets");
  const seatOverlap = findFinancialCount(financial, "financial.members.seatOverlap");
  const membersTotalNumber = liveMemberCount;
  const v3Emitted =
    liveMemberCount !== null && genesisOffset !== null ? liveMemberCount - genesisOffset : null;

  // Verified snapshot attestation (point-in-time) — the divergence, not the headline.
  const snapMemberTotal = holderIndex.data?.memberTotal;
  const snapshotMemberTotal =
    typeof snapMemberTotal === "number" && Number.isFinite(snapMemberTotal) && snapMemberTotal >= 0
      ? snapMemberTotal
      : null;
  const builtAt = holderIndex.data?.provenance?.builtAt;
  const snapshotAsOf = typeof builtAt === "string" && builtAt.length > 0 ? builtAt : null;
  const membersDiverged =
    liveMemberCount !== null &&
    snapshotMemberTotal !== null &&
    liveMemberCount !== snapshotMemberTotal;

  const attribution = findFinancialCount(financial, "financial.referral.attributionActivity");

  const archive = reality.data?.groups.archive;
  const firstSignalMinted = findFinancialCount(archive, "archive.artifact.1.minted");
  const patronSealMinted = findFinancialCount(archive, "archive.artifact.3.minted");
  const nftMintedTotal =
    firstSignalMinted === null || patronSealMinted === null
      ? null
      : firstSignalMinted + patronSealMinted;

  // NFT revenue: exact bigint math on the live raw reads (price @6dec × count).
  // Fail-closed — null unless BOTH artifacts' price AND minted reads are live.
  const firstSignalPriceRaw = findFinancial(archive, "archive.artifact.1.price");
  const patronSealPriceRaw = findFinancial(archive, "archive.artifact.3.price");
  let nftRevenueRaw: string | null = null;
  if (
    firstSignalPriceRaw !== null &&
    patronSealPriceRaw !== null &&
    firstSignalMinted !== null &&
    patronSealMinted !== null &&
    /^[0-9]+$/.test(firstSignalPriceRaw) &&
    /^[0-9]+$/.test(patronSealPriceRaw)
  ) {
    try {
      nftRevenueRaw = (
        BigInt(firstSignalPriceRaw) * BigInt(firstSignalMinted) +
        BigInt(patronSealPriceRaw) * BigInt(patronSealMinted)
      ).toString();
    } catch {
      nftRevenueRaw = null;
    }
  }

  // TRUE gross total = membership sales aggregate + NFT revenue (raw @6dec).
  let grossTotalRaw: string | null = null;
  if (nftRevenueRaw !== null && aggregateRaw !== null && /^[0-9]+$/.test(aggregateRaw)) {
    try {
      grossTotalRaw = (BigInt(aggregateRaw) + BigInt(nftRevenueRaw)).toString();
    } catch {
      grossTotalRaw = null;
    }
  }

  return {
    loading: reality.isLoading || holderIndex.isLoading,
    membersTotal: membersTotalNumber === null ? null : membersTotalNumber.toLocaleString("en-US"),
    membersTotalNumber,
    historicalFreeze: genesisOffset,
    v3Emitted,
    snapshotMemberTotal,
    snapshotAsOf,
    membersDiverged,
    distinctWallets,
    seatOverlap,
    aggregateInflowUsdc: formatBaseUnits(aggregateRaw, 6, 2),
    aggregateInflowRaw: aggregateRaw,
    vaultUsdc: formatBaseUnits(findFinancial(financial, "financial.vault.usdcBalance"), 6, 2),
    opsUsdc: formatBaseUnits(findFinancial(financial, "financial.ops.usdcBalance"), 6, 2),
    lpUsdc: formatBaseUnits(findFinancial(financial, "financial.lp.reserveUsdc"), 6, 2),
    lpSyn: formatBaseUnits(findFinancial(financial, "financial.lp.reserveSyn"), 18, 2),
    burnedSyn: formatBaseUnits(findFinancial(financial, "financial.burn.synBalance"), 18, 0),
    attributionActivities: attribution === null ? null : attribution.toLocaleString("en-US"),
    nftFirstSignalMinted: firstSignalMinted === null ? null : firstSignalMinted.toLocaleString("en-US"),
    nftPatronSealMinted: patronSealMinted === null ? null : patronSealMinted.toLocaleString("en-US"),
    nftMintedTotal: nftMintedTotal === null ? null : nftMintedTotal.toLocaleString("en-US"),
    nftRevenueUsdc: formatBaseUnits(nftRevenueRaw, 6, 2),
    nftRevenueRaw,
    grossTotalUsdc: formatBaseUnits(grossTotalRaw, 6, 2),
    grossTotalRaw,
    routedVault: routedShare(aggregateRaw, 7_000n),
    routedLiquidity: routedShare(aggregateRaw, 2_000n),
    routedOperations: routedShare(aggregateRaw, 1_000n),
  };
}
