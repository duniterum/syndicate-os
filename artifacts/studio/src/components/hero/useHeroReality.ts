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
  /** Holder Index recognition count — the canonical public member count. */
  membersTotal: string | null;
  membersTotalNumber: number | null;
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

  const memberTotal = holderIndex.data?.memberTotal;
  const membersTotalNumber =
    typeof memberTotal === "number" && Number.isFinite(memberTotal) && memberTotal >= 0
      ? memberTotal
      : null;

  const attribution = findFinancialCount(financial, "financial.referral.attributionActivity");

  return {
    loading: reality.isLoading || holderIndex.isLoading,
    membersTotal: membersTotalNumber === null ? null : membersTotalNumber.toLocaleString("en-US"),
    membersTotalNumber,
    aggregateInflowUsdc: formatBaseUnits(aggregateRaw, 6, 2),
    aggregateInflowRaw: aggregateRaw,
    vaultUsdc: formatBaseUnits(findFinancial(financial, "financial.vault.usdcBalance"), 6, 2),
    opsUsdc: formatBaseUnits(findFinancial(financial, "financial.ops.usdcBalance"), 6, 2),
    lpUsdc: formatBaseUnits(findFinancial(financial, "financial.lp.reserveUsdc"), 6, 2),
    lpSyn: formatBaseUnits(findFinancial(financial, "financial.lp.reserveSyn"), 18, 2),
    burnedSyn: formatBaseUnits(findFinancial(financial, "financial.burn.synBalance"), 18, 0),
    attributionActivities: attribution === null ? null : attribution.toLocaleString("en-US"),
    routedVault: routedShare(aggregateRaw, 7_000n),
    routedLiquidity: routedShare(aggregateRaw, 2_000n),
    routedOperations: routedShare(aggregateRaw, 1_000n),
  };
}
