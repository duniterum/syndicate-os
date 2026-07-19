// wallet/receiptRowModel.ts (build-time-gated wallet module)
//
// ONE served row → ONE ticket model — the single mapper both the binder and
// the /receipt/{txHash} public mount use (extracted from the binder at the
// public-page slice, 2026-07-20; one spine, one fact shape, zero drift).
// Every figure is the served row's own fact passed VERBATIM to the spine
// builder; a row whose record cannot express a full ticket maps to null
// (honest absence, never a guess).

import {
  buildMembershipReceipt,
  type MembershipReceiptModel,
} from "@/lib/protocolCommerceReceipt";
import type { OwnPurchaseRowReadback } from "./walletSession";

/** Build the row's FULL ticket model, or null when the record cannot
 *  express one (no receipt facts / no seat / no block) — honest absence. */
export function ticketModelFor(
  row: OwnPurchaseRowReadback,
  decimals: { usdc: number; syn: number },
): MembershipReceiptModel | null {
  const f = row.receipt;
  if (f === null || f.seat === null || f.holderShort === null) return null;
  if (row.block === null) return null;
  return buildMembershipReceipt({
    event: {
      memberNumber: String(f.seat),
      recipient: f.holderShort,
      grossUsdcRaw: row.amountRaw,
      acquisitionCostRaw: f.commissionRaw,
      protocolContributionRaw: f.netRaw,
      vaultAmountRaw: f.vaultRaw,
      liquidityAmountRaw: f.liquidityRaw,
      operationsAmountRaw: f.operationsRaw,
      synOutRaw: f.synOutRaw,
      synPerUsdc: f.synPerUsdc,
      era: f.era,
      firstSeat: f.firstSeat,
      sourceId: f.sourceIdHex,
      sourceWallet: f.broughtByShort,
    },
    proof: {
      txHash: row.transaction,
      blockNumber: String(row.block),
      explorerTxUrl: row.explorerUrl,
    },
    blockTimestamp: row.sealedAtSec,
    usdcDecimals: decimals.usdc,
    synDecimals: decimals.syn,
  });
}
