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
// THE ONE FIGURE: base-unit → display lives in exactly one module, and it
// TRUNCATES. This hook used to carry its own half-up-rounding copy, which made
// the same WETH.e holding read `0.026552` here and `0.026551` on /activity.
// See lib/amountFormat.ts for the rule; guard-one-figure keeps it single.
import { displayRoutedSplit, formatBaseUnits } from "@/lib/amountFormat";
import { useSpineAttestation } from "@/lib/useSpineAttestation";
import { currentChapterFacts, type CurrentChapterFacts } from "@/config/syndicateFacts";

// ⛔ `routedShare` LIVED HERE AND IS DELETED (P0-1 step 3, founder 2026-08-06).
// It returned 70/20/10 of the GROSS aggregate while the engine routes 70/20/10
// of NET (MembershipSaleV3.verified.sol:498-503), so these three pages published
// 987.00 / 282.00 / 141.00 against a true 986.12 / 281.75 / 140.88 — overstated
// by exactly the source payments ever made, growing with every referral, under a
// verify-on-chain anchor a visitor could use to refute it.
// The legs are no longer computed from anything. They are SUMMED by the backbone
// from the amounts the chain emitted, reconciled against the engines' own
// counters, and served as `financial.routed.*` — read below like any other spine
// figure. Any divergence serves null and these lines render "Unavailable".

export interface HeroReality {
  loading: boolean;
  /**
   * LIVE continuous member total — the active V3 engine's reconciled
   * memberCount() (seats #1..memberCount). The canonical public headline; a live
   * chain read, NOT the served snapshot. Fail-closed to null.
   */
  membersTotal: string | null;
  membersTotalNumber: number | null;
  /** The CURRENT chapter's presentation facts, derived ONCE here (the one
   *  choke point) from the live count via currentChapterFacts — consumers
   *  (header wordmark badge, hero chapter card, seats window) read this field
   *  and never re-derive. Null while the live count is unavailable (honest
   *  absence, never a guessed chapter). Senior review 2026-08-02. */
  chapterFacts: CurrentChapterFacts | null;
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
  /**
   * Cumulative USDC actually PAID TO REFERRERS by the sale engine, inside each
   * buyer's own transaction (direct-payment model) — the introduction
   * read-model's aggregate total, served by the reality spine. Fail-closed.
   */
  paidToReferrersUsdc: string | null;
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
  /**
   * The routed legs as the chain emitted them, summed by the backbone and
   * displayed so the parts SUM TO THE TOTAL (operations is the remainder,
   * mirroring verified.sol:503). <s>Computed 70/20/10 shares of the
   * aggregate</s> — STRUCK 2026-08-06: that derivation was the P0-1 defect,
   * 70% of GROSS where the engine routes 70% of NET.
   * All four are null together — a partial split is a wrong figure.
   */
  routedVault: string | null;
  routedLiquidity: string | null;
  routedOperations: string | null;
  /** Vault + Liquidity + Operations, the figure the three must add up to. */
  routedNetTotalUsdc: string | null;
  /** What referrers were paid inside the buyers' own transactions, to date. */
  routedPaidToReferrersUsdc: string | null;
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

  // THE ROUTED SPLIT, DISPLAYED SO IT ADDS UP (P0-1 step 4). The legs arrive as
  // exact base units summed from the chain; the display rule — floor two, let
  // operations take the remainder — lives in ONE place beside the one
  // truncation, and returns null unless all three raws are present and coherent.
  const routedDisplay = displayRoutedSplit(
    findFinancial(financial, "financial.routed.vault"),
    findFinancial(financial, "financial.routed.liquidity"),
    findFinancial(financial, "financial.routed.netTotal"),
  );

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

  // Verified attestation (point-in-time) — the divergence line, not the
  // headline. AMENDED 2026-08-02 (founder order: « it must be always up to
  // date » — the committed snapshot froze at 14/Jul-16 while the chain held
  // 16): the spine lane re-verifies membership EVERY backbone cycle and
  // publishes its latest VERIFIED run on the public status payload; that
  // attestation is preferred, and the committed snapshot remains only the
  // honest boot fallback (before the first cycle's status is readable).
  const spine = useSpineAttestation();
  const snapMemberTotal = holderIndex.data?.memberTotal;
  const staticSnapshotTotal =
    typeof snapMemberTotal === "number" && Number.isFinite(snapMemberTotal) && snapMemberTotal >= 0
      ? snapMemberTotal
      : null;
  const builtAt = holderIndex.data?.provenance?.builtAt;
  const staticSnapshotAsOf = typeof builtAt === "string" && builtAt.length > 0 ? builtAt : null;
  const snapshotMemberTotal = spine?.memberTotal ?? staticSnapshotTotal;
  const snapshotAsOf = spine?.verifiedAtIso ?? staticSnapshotAsOf;
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
    chapterFacts: currentChapterFacts(membersTotalNumber),
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
    paidToReferrersUsdc: formatBaseUnits(
      findFinancial(financial, "financial.referral.paidToReferrersTotal"),
      6,
      2,
    ),
    nftFirstSignalMinted: firstSignalMinted === null ? null : firstSignalMinted.toLocaleString("en-US"),
    nftPatronSealMinted: patronSealMinted === null ? null : patronSealMinted.toLocaleString("en-US"),
    nftMintedTotal: nftMintedTotal === null ? null : nftMintedTotal.toLocaleString("en-US"),
    nftRevenueUsdc: formatBaseUnits(nftRevenueRaw, 6, 2),
    nftRevenueRaw,
    grossTotalUsdc: formatBaseUnits(grossTotalRaw, 6, 2),
    grossTotalRaw,
    // The three legs, SUMMED from the chain by the backbone, anchored to the
    // engines' own counters — never a percentage of the inflow aggregate above —
    // and displayed so THE PARTS SUM TO THE TOTAL: vault and liquidity floored,
    // operations the remainder, exactly as the engine does it
    // (verified.sol:503). One home for that rule: `displayRoutedSplit`.
    // <s>this line reads 140.87 until step 4</s> — CLOSED 2026-08-06: it reads
    // the approved 140.88, and 986.12 + 281.75 + 140.88 = 1,408.75 on screen.
    routedVault: routedDisplay?.vault ?? null,
    routedLiquidity: routedDisplay?.liquidity ?? null,
    routedOperations: routedDisplay?.operations ?? null,
    routedNetTotalUsdc: routedDisplay?.total ?? null,
    routedPaidToReferrersUsdc: formatBaseUnits(
      findFinancial(financial, "financial.referral.paidToReferrersTotal"),
      6,
      2,
    ),
  };
}
