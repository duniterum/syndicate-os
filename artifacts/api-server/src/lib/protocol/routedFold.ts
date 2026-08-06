/**
 * routedFold — THE ROUTED SPLIT, SUMMED FROM WHAT THE CHAIN EMITTED.
 * ===========================================================================
 * THE CANONICAL FLOW (founder, 2026-07-13 — `CANON_PROTOCOL_LANGUAGE.md` §4,
 * the only formula, everywhere):
 *
 *     Gross purchase
 *     → paid to referrer/source, if eligible
 *     → net protocol contribution
 *        ├─ 70% Vault
 *        ├─ 20% Liquidity
 *        └─ 10% Operations
 *
 * ⛔ THE LEGS ARE NOT DERIVED. Until 2026-08-06 the client published them as
 * `routedShare(aggregateRaw, 7_000n)` — 70% of GROSS — while the engine routes
 * 70/20/10 of NET. Measured that day: 1,410.00 shown against a true 1,408.75,
 * overstated by exactly the 1.25 of source payments ever made, on three public
 * pages, under a "verify on chain" anchor. Every generation EMITS its three
 * legs (V1 `TokensPurchased`, V2 `Routed`, V3 `MembershipPurchasedV3`), so
 * there is nothing to compute: we add up what the chain said.
 *
 * ⛔ AND THE SUM IS ANCHORED OUTSIDE ITSELF. `vault + liquidity + operations +
 * sourcePayment === gross` is SELF-REFERENTIAL: if the index misses a purchase
 * every term drops together, the identity still holds, and the published figure
 * is quietly short. So `reconcileRoutedFold` compares the fold against counters
 * the CONTRACT keeps — `totalGrossUsdc` / `totalAcquisitionCost` /
 * `totalProtocolContribution` on V3, `totalUsdcRaised` on V1/V2a/V2b — which no
 * indexing bug can move. Measured 2026-08-06, exact on all three axes.
 *
 * ⛔ VOCABULARY. The ABI says `acquisitionCost` and `protocolContribution`.
 * Those are BYTECODE words and they stop at the decode layer (§4, and
 * `guard-money-flow` ③ enforces it by directory sweep). Here and outward the
 * words are `sourcePaymentRaw` and `netProtocolContributionRaw`. The reason is
 * accounting, not taste: the source is paid at the ENTRANCE
 * (`MembershipSaleV3.verified.sol:279`, before the three treasury sends at
 * 280-282) and that money never enters the treasury. "Acquisition cost" says
 * the protocol bore a cost — the opposite of what happens.
 * ===========================================================================
 */

/** One indexed purchase's emitted legs. `null` = the generation did not emit it. */
export interface RoutedRow {
  readonly vaultRaw: string | null;
  readonly liquidityRaw: string | null;
  readonly operationsRaw: string | null;
  /** The ABI's `acquisitionCost`, renamed at the decode boundary. */
  readonly sourcePaymentRaw: string | null;
}

export interface RoutedFold {
  readonly vaultRaw: string;
  readonly liquidityRaw: string;
  readonly operationsRaw: string;
  readonly sourcePaymentRaw: string;
  /** vault + liquidity + operations. The ABI's `protocolContribution`. */
  readonly netProtocolContributionRaw: string;
  /** net + source payments. Reconciles against the engines' own gross counters. */
  readonly grossRaw: string;
  /** How many indexed rows were folded — carried so a caller can say so. */
  readonly rowCount: number;
}

/** What the CONTRACTS say, read from their own counters — never from the index. */
export interface RoutedAnchor {
  readonly grossRaw: string;
  readonly netProtocolContributionRaw: string;
  readonly sourcePaymentRaw: string;
}

const DECIMAL = /^[0-9]+$/;

/**
 * Fail-closed by construction: a value that is not a decimal string of base
 * units THROWS rather than being coerced to zero. A silently-zeroed leg is a
 * wrong money figure, which is exactly what this module exists to prevent.
 */
function need(value: string | null, field: string, row: number): bigint {
  if (value === null) return 0n;
  if (!DECIMAL.test(value)) {
    throw new Error(`routedFold: row ${row} carries a non-decimal ${field} — refusing to fold`);
  }
  return BigInt(value);
}

export function foldRoutedTotals(rows: readonly RoutedRow[]): RoutedFold {
  let v = 0n;
  let l = 0n;
  let o = 0n;
  let pay = 0n;
  for (let i = 0; i < rows.length; i += 1) {
    const r = rows[i] as RoutedRow;
    v += need(r.vaultRaw, "vaultRaw", i);
    l += need(r.liquidityRaw, "liquidityRaw", i);
    o += need(r.operationsRaw, "operationsRaw", i);
    pay += need(r.sourcePaymentRaw, "sourcePaymentRaw", i);
  }
  const net = v + l + o;
  return {
    vaultRaw: v.toString(),
    liquidityRaw: l.toString(),
    operationsRaw: o.toString(),
    sourcePaymentRaw: pay.toString(),
    netProtocolContributionRaw: net.toString(),
    grossRaw: (net + pay).toString(),
    rowCount: rows.length,
  };
}

/**
 * THE ANCHOR. Any divergence — in either direction, of any size — refuses.
 *
 * A fold SHORT of the anchor means the index is missing purchases: publish
 * nothing rather than a number we know is understated (founder, 2026-08-06:
 * "never silently serve the lower number"). A fold ABOVE the anchor means a
 * double count, which is worse. There is no tolerance band, because there is no
 * honest reason for these to differ by one base unit.
 */
/** 6-decimal USDC, for a reason a human can act on. Never used for a served figure. */
function usdc(raw: bigint): string {
  const neg = raw < 0n;
  const s = (neg ? -raw : raw).toString().padStart(7, "0");
  const whole = s.slice(0, -6).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${neg ? "-" : ""}${whole}.${s.slice(-6, -4)}`;
}

/** The human name of each anchored figure — a field name is not actionable. */
const FIELD_NAME: Readonly<Record<string, string>> = {
  grossRaw: "gross purchases",
  netProtocolContributionRaw: "net protocol contribution",
  sourcePaymentRaw: "paid to referrers",
};

export function reconcileRoutedFold(
  fold: RoutedFold,
  anchor: RoutedAnchor,
): { readonly ok: boolean; readonly reason: string | null } {
  for (const field of ["grossRaw", "netProtocolContributionRaw", "sourcePaymentRaw"] as const) {
    const got = fold[field];
    const want = anchor[field];
    if (!DECIMAL.test(String(got)) || !DECIMAL.test(String(want))) {
      return {
        ok: false,
        reason: `${FIELD_NAME[field]}: one side is not a decimal base-unit string — refusing to compare`,
      };
    }
    if (BigInt(got) !== BigInt(want)) {
      // ⛔ NAME THE FIGURE AND THE SIZE (founder, 2026-08-06). "divergence" is
      // not actionable; "net protocol contribution — contracts say 1,408.75,
      // indexed rows fold to 1,402.50, SHORT by 6.25 USDC" is.
      const delta = BigInt(got) - BigInt(want);
      const short = delta < 0n;
      return {
        ok: false,
        reason:
          `${FIELD_NAME[field]}: the contracts' own counters say ${usdc(BigInt(want))} USDC, ` +
          `the indexed rows fold to ${usdc(BigInt(got))} USDC — ` +
          `${short ? "SHORT" : "OVER"} by ${usdc(delta < 0n ? -delta : delta)} USDC ` +
          `across ${fold.rowCount} indexed row(s). ` +
          `${short
            ? "The indexed record is not the whole record"
            : "A purchase has been counted twice"}, so the routed figures are withheld ` +
          `rather than published wrong.`,
      };
    }
  }
  return { ok: true, reason: null };
}
