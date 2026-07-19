/**
 * On-chain conversion verification — SPEC R3's differentiator, enforced.
 * ---------------------------------------------------------------------
 * "Le canal est off-chain, mais il pointe vers une PREUVE on-chain." A
 * conversion row is recorded ONLY after this module confirmed, itself, that
 * the claimed transaction (a) succeeded, (b) emitted MembershipPurchasedV3
 * from the pinned V3 sale contract, and (c) names the claimed source id.
 * The channel never trusts a client claim — the chain is the authority.
 * Fail-closed: any doubt → false → nothing recorded.
 */

import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { probeChain } from "../lib/protocol/evmRead";
import {
  MEMBERSHIP_PURCHASED_V3_DEF,
  decodeSaleEventLog,
  type RawLog,
} from "../lib/protocol/saleEventDecoders";
import { SALE_TARGETS } from "../data/protocolTargets";

const V3_SALE_ADDRESS = (
  SALE_TARGETS.find((t) => t.key === "MEMBERSHIP_SALE_V3")?.address ?? ""
).toLowerCase();

type ReceiptShape = {
  status?: unknown;
  logs?: unknown;
};

/** True only when the tx receipt proves a V3 purchase naming this source. */
export async function verifyConversionOnChain(
  txHash: string,
  sourceIdHex: string,
): Promise<boolean> {
  if (V3_SALE_ADDRESS === "") return false;
  try {
    const timeoutMs = readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
    const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
    const probe = await probeChain(transport);
    if (!probe.chainIdOk) return false;

    const receipt = (await transport("eth_getTransactionReceipt", [
      txHash,
    ])) as ReceiptShape | null;
    if (receipt === null || typeof receipt !== "object") return false;
    if (receipt.status !== "0x1") return false;
    if (!Array.isArray(receipt.logs)) return false;

    const wanted = sourceIdHex.toLowerCase();
    for (const raw of receipt.logs as RawLog[]) {
      const addr =
        typeof raw.address === "string" ? raw.address.toLowerCase() : null;
      if (addr !== V3_SALE_ADDRESS) continue;
      const decoded = decodeSaleEventLog(MEMBERSHIP_PURCHASED_V3_DEF, raw);
      if (!decoded.ok) continue;
      const eventSource = decoded.fields["sourceId"];
      if (typeof eventSource === "string" && eventSource.toLowerCase() === wanted) {
        return true;
      }
    }
    return false;
  } catch {
    return false; // fail closed
  }
}
