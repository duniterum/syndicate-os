// engineReadback.ts — shared auth-zone live read of the active engine's
// public memberNumberOf(account) figure for a session-bound account.
// ---------------------------------------------------------------------------
// Extracted VERBATIM from the founder-approved /api/auth/member-self flow so
// that member-self and member-standing share one read path. Behavior is
// byte-identical to the original inline block:
//   - probe chain identity first; unverified → fail closed, no read
//   - require deployed engine code at the canon-resolved address
//   - eth_call memberNumberOf(boundAccount), decode as EXACT decimal string
//   - "0" on chain = sentinel = not recognized (never a seat)
// The bound account is used server-side only and never appears in any result
// field. No write surface; read-only eth_call exclusively.

import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { ethCall, probeChain, readCodePresent } from "../lib/protocol/evmRead";
import { callData } from "../lib/protocol/archiveDecoders";
import { decodeUint256Decimal } from "../lib/protocol/saleDecoders";
import {
  SELECTOR_MEMBER_NUMBER_OF,
  addressWord,
} from "../lib/protocol/sourceDecoders";
import { SOURCE_LINKAGE_TARGET } from "../data/protocolTargets";

export interface EngineMemberRead {
  chainVerified: boolean;
  /** true = engine recognizes the account; false = sentinel "0"; null = read unavailable */
  isRecognized: boolean | null;
  /** EXACT decimal string from the engine, only when isRecognized === true */
  engineFigure: string | null;
  failureReason: string | null;
}

export async function readEngineMemberNumber(
  boundAccount: string,
): Promise<EngineMemberRead> {
  let chainVerified = false;
  let isRecognized: boolean | null = null;
  let engineFigure: string | null = null;
  let failureReason: string | null = null;

  const timeoutMs =
    readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
  const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
  const probe = await probeChain(transport);
  chainVerified = probe.chainIdOk;
  if (!chainVerified) {
    failureReason = probe.rpcReachable
      ? "chain identity unverified; live read skipped (fail closed)"
      : "RPC unreachable; live read skipped (fail closed)";
  } else {
    let engineHasCode = false;
    try {
      engineHasCode = await readCodePresent(
        transport,
        SOURCE_LINKAGE_TARGET.saleAddress,
      );
    } catch {
      engineHasCode = false;
    }
    if (!engineHasCode) {
      failureReason =
        "expected deployed engine code not found on chain; read skipped";
    } else {
      let decoded: string | null = null;
      try {
        decoded = decodeUint256Decimal(
          await ethCall(
            transport,
            SOURCE_LINKAGE_TARGET.saleAddress,
            callData(SELECTOR_MEMBER_NUMBER_OF, [addressWord(boundAccount)]),
          ),
        );
      } catch {
        decoded = null;
      }
      if (decoded === null) {
        failureReason = "membership read failed (reported as unavailable)";
      } else if (decoded === "0") {
        isRecognized = false;
      } else {
        isRecognized = true;
        engineFigure = decoded;
      }
    }
  }

  return { chainVerified, isRecognized, engineFigure, failureReason };
}
