// Live tokenomics reads — the ONLY data source for /tokenomics figures.
// Every value is a live on-chain read (or a trivial derivation of one), fail-closed
// to null. NOTHING here is a canon constant: the design targets live in
// config/tokenomics.ts and are shown separately, clearly labelled.
//
//   - total supply + per-allocation balances → protocol-reality financial group
//     (financial.token.synTotalSupply, financial.distribution.<KEY>.balance)
//   - market price (USDC per SYN) → derived from the LIVE LP reserves
//   - entry rate (SYN per USDC) → the LIVE V3 join quote
//   - burn → financial.burn.synBalance
import {
  useGetProtocolReality,
  useGetJoinQuote,
  getGetJoinQuoteQueryKey,
} from "@workspace/api-client-react";
import { formatBaseUnits } from "@/components/hero/useHeroReality";
import { TOKENOMICS_DESIGN } from "@/config/tokenomics";

const USDC_DECIMALS = 6;
const SYN_DECIMALS = 18;
/** Reference amount (1 USDC, raw) for the read-only entry-rate quote. */
const ONE_USDC_RAW = "1000000";

function findRaw(
  financial: ReadonlyArray<{ id: string; value: unknown }> | undefined,
  id: string,
): string | null {
  const item = financial?.find((i) => i.id === id);
  return item && typeof item.value === "string" && /^[0-9]+$/.test(item.value)
    ? item.value
    : null;
}

/** USDC-per-SYN market price from the live pool reserves, or null (fail-closed). */
function priceFromReserves(usdcRaw: string | null, synRaw: string | null): string | null {
  if (usdcRaw === null || synRaw === null) return null;
  try {
    const syn = BigInt(synRaw);
    if (syn === 0n) return null;
    // price * 1e6 = usdcRaw(6dec) * 1e18 / synRaw(18dec) → format as 6-dec value.
    const priceRaw6 = (BigInt(usdcRaw) * 10n ** 18n) / syn;
    return formatBaseUnits(priceRaw6.toString(), 6, 6);
  } catch {
    return null;
  }
}

/** Live current share of supply (percent, 2 decimals) or null. */
function pctOfSupply(balanceRaw: string | null, supplyRaw: string | null): string | null {
  if (balanceRaw === null || supplyRaw === null) return null;
  try {
    const supply = BigInt(supplyRaw);
    if (supply === 0n) return null;
    const bp = (BigInt(balanceRaw) * 10_000n) / supply; // basis points
    return (Number(bp) / 100).toFixed(2);
  } catch {
    return null;
  }
}

export interface AllocationLive {
  key: string;
  label: string;
  designPct: number;
  note: string;
  /** Live current SYN balance of the allocation wallet (display, 0 decimals). */
  currentSyn: string | null;
  /** Live current share of live supply (percent, 2 decimals). */
  currentPct: string | null;
}

export interface TokenomicsData {
  loading: boolean;
  /** Live SYN total supply (display, 0 decimals). */
  totalSupply: string | null;
  allocations: AllocationLive[];
  /** Live market price, USDC per SYN (6 decimals). */
  marketPriceUsdcPerSyn: string | null;
  /** Live entry rate, SYN per 1 USDC (0 decimals). */
  entrySynPerUsdc: string | null;
  /** Live LP pool reserves (fail-closed null) — the /liquidity LpStatus reads. */
  lpReserveSyn: string | null;
  lpReserveUsdc: string | null;
  /** Live cumulative burned SYN (0 decimals). */
  burnedSyn: string | null;
}

export function useTokenomics(): TokenomicsData {
  const reality = useGetProtocolReality();
  const quoteParams = { grossUsdc: ONE_USDC_RAW };
  const quote = useGetJoinQuote(quoteParams, {
    query: { queryKey: getGetJoinQuoteQueryKey(quoteParams) },
  });

  const financial = reality.data?.groups.financial;
  const supplyRaw = findRaw(financial, "financial.token.synTotalSupply");

  const allocations: AllocationLive[] = TOKENOMICS_DESIGN.map((d) => {
    const balanceRaw = findRaw(financial, `financial.distribution.${d.key}.balance`);
    return {
      key: d.key,
      label: d.label,
      designPct: d.designPct,
      note: d.note,
      currentSyn: formatBaseUnits(balanceRaw, SYN_DECIMALS, 0),
      currentPct: pctOfSupply(balanceRaw, supplyRaw),
    };
  });

  // Entry rate = the SYN out for exactly 1 USDC (our reference quote). synOutRaw
  // is 18-decimal SYN base units, so it formats correctly to whole SYN. Do NOT
  // use synPerUsdcRaw — that field is an already-human whole-SYN rate (uint64,
  // e.g. "100"), NOT base units; dividing it by 1e18 rounds every rate to 0.
  const entrySynOutRaw =
    quote.data?.chainVerified && quote.data.quote
      ? quote.data.quote.synOutRaw
      : null;

  return {
    loading: reality.isLoading || quote.isLoading,
    totalSupply: formatBaseUnits(supplyRaw, SYN_DECIMALS, 0),
    allocations,
    marketPriceUsdcPerSyn: priceFromReserves(
      findRaw(financial, "financial.lp.reserveUsdc"),
      findRaw(financial, "financial.lp.reserveSyn"),
    ),
    entrySynPerUsdc: formatBaseUnits(entrySynOutRaw, SYN_DECIMALS, 0),
    lpReserveSyn: formatBaseUnits(findRaw(financial, "financial.lp.reserveSyn"), SYN_DECIMALS, 0),
    lpReserveUsdc: formatBaseUnits(findRaw(financial, "financial.lp.reserveUsdc"), USDC_DECIMALS, 2),
    burnedSyn: formatBaseUnits(findRaw(financial, "financial.burn.synBalance"), SYN_DECIMALS, 0),
  };
}

/** Re-export for readers that only need the design targets. */
export { TOKENOMICS_DESIGN, USDC_DECIMALS };
