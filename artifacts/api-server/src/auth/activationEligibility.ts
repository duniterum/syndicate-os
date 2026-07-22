// activationEligibility.ts — K3.a: the live eligibility truths behind the
// member's "Ask for activation" card AND the founder's review-queue chips.
// ---------------------------------------------------------------------------
// ONE read path serves both faces (the mockup's law: one truth, two faces):
//   - seatHeld:  the active engine's memberNumberOf(account) recognition
//                (readEngineMemberNumber — the shared auth-zone read).
//   - holdsSyn:  SYN.balanceOf(account) > 0. The contract truth engraved from
//                MembershipSaleV3.sol:446-460: a source wallet holding no SYN
//                at purchase time makes an explicit-link purchase revert; the
//                check is the TOKEN balance — any amount counts, there is no
//                minimum. The balance is a MUTABLE fact: always read live at
//                decision time, never stored (the K2.1 law).
//   - source:    existence + live state via readOwnSourceStanding (the spine
//                helper the source-standing route already trusts — canonical
//                derivation + the founder-signed fallback).
// Every read fails closed to null ("unavailable"), never to a verdict. The
// bound account is server-side only and never appears in any result field.
// Read-only eth_call exclusively; no DB reach in this module.

import { keccak256, encodePacked, getAddress } from "viem";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { ethCall, probeChain } from "../lib/protocol/evmRead";
import { decodeUint256Decimal } from "../lib/protocol/saleDecoders";
import {
  SELECTOR_BALANCE_OF,
  encodeAddressArg,
} from "../lib/protocol/financialDecoders";
import { FINANCIAL_TARGETS } from "../data/protocolTargets";
import { readEngineMemberNumber } from "./engineReadback";
import {
  readOwnSourceStanding,
  type OwnSourceStanding,
} from "../lib/protocol/sourceStandingRead";

export interface ActivationEligibility {
  chainVerified: boolean;
  /** true = the engine recognizes a seat; false = none; null = unavailable. */
  seatHeld: boolean | null;
  /** true = SYN balance > 0 (any amount); false = zero; null = unavailable. */
  holdsSyn: boolean | null;
  /** The source resolution the standing route already serves (own-row). */
  sourceOnChain: boolean | null;
  sourceActive: boolean | null;
  /**
   * The RESOLVED id when a source exists (standing's own answer), else the
   * wallet's CANONICAL derivation — deterministic, no RPC — so the intake can
   * record which id the ask is about even before any source exists (64-hex;
   * passes the boundary-aware address gates).
   */
  sourceIdHex: string | null;
  failureReason: string | null;
}

/** keccak256("SYN.SOURCE.V1", account) — SPEC §③'s deterministic derivation. */
export function canonicalSourceIdHex(account: string): string | null {
  try {
    return keccak256(
      encodePacked(["string", "address"], ["SYN.SOURCE.V1", getAddress(account)]),
    ).toLowerCase();
  } catch {
    return null;
  }
}

/** SYN.balanceOf(account) > 0 — live, fail closed to null. */
export async function readHoldsSyn(account: string): Promise<boolean | null> {
  const timeoutMs =
    readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
  const probe = await probeChain(transport);
  if (!probe.chainIdOk) return null;
  const data = encodeAddressArg(SELECTOR_BALANCE_OF, account);
  if (data === null) return null;
  try {
    const decoded = decodeUint256Decimal(
      await ethCall(transport, FINANCIAL_TARGETS.synTokenAddress, data),
    );
    if (decoded === null) return null;
    return decoded !== "0";
  } catch {
    return null;
  }
}

/**
 * The full eligibility picture for a session-bound account. Composes the
 * three existing read paths; each leg fails closed independently so one
 * unreachable read never invents a verdict for another.
 */
export async function readActivationEligibility(
  boundAccount: string,
): Promise<ActivationEligibility> {
  const [engine, holdsSyn, standing] = await Promise.all([
    readEngineMemberNumber(boundAccount),
    readHoldsSyn(boundAccount),
    readOwnSourceStanding(boundAccount),
  ]);
  const src: OwnSourceStanding = standing;
  return {
    chainVerified: engine.chainVerified || src.chainVerified,
    seatHeld: engine.isRecognized,
    holdsSyn,
    sourceOnChain: src.sourceOnChain,
    sourceActive: src.sourceActive,
    sourceIdHex: src.sourceIdHex ?? canonicalSourceIdHex(boundAccount),
    failureReason: engine.failureReason ?? src.failureReason,
  };
}
