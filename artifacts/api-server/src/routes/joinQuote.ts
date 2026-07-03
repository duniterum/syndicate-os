import { Router, type IRouter } from "express";
import { GetJoinQuoteResponse } from "@workspace/api-zod";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { ethCall, probeChain, readCodePresent } from "../lib/protocol/evmRead";
import { callData, decodeBool, encodeUint256 } from "../lib/protocol/archiveDecoders";
import {
  SELECTOR_QUOTE,
  SELECTOR_SOURCE_EXISTS,
  SELECTOR_SOURCE_IS_ACTIVE,
  ZERO_ADDRESS,
  ZERO_SOURCE_ID,
  addressWord,
  bytes32Word,
  decodeQuoteFigures,
  isBytes32Hex,
  type QuoteFigures,
} from "../lib/protocol/sourceDecoders";
import { SOURCE_LINKAGE_TARGET } from "../data/protocolTargets";
import { assertProtocolRealityDiscipline } from "../lib/protocol/payloadDiscipline";
import { allowPublicRead } from "./publicReadThrottle";
import { throttleKey } from "../auth/clientIdentity";

const router: IRouter = Router();

/** Positive base-10 integer, no leading zeros, bounded well inside uint256. */
const GROSS_USDC_RE = /^[1-9][0-9]{0,29}$/;

/**
 * GET /join/quote?grossUsdc=…&sourceId=0x… (mounted at /api) — strictly
 * read-only quote from the active MembershipSaleV3 engine via eth_call, for an
 * anonymous recipient (zero address). Amounts are EXACT raw base-unit strings.
 * A supplied sourceId is applied ONLY when it exists and is active on
 * SourceRegistryV1 — otherwise the quote fails closed with a failureReason
 * (never a silent fallback), and the source id is never echoed back. No
 * wallet, no approval, no transaction, no write surface.
 */
router.get("/join/quote", async (req, res) => {
  try {
    if (!allowPublicRead(throttleKey(req))) {
      res.status(429).json({ error: "too many requests" });
      return;
    }

    const rawGross = typeof req.query["grossUsdc"] === "string" ? req.query["grossUsdc"] : "";
    const rawSourceId = typeof req.query["sourceId"] === "string" ? req.query["sourceId"] : "";
    const sourceProvided = rawSourceId.length > 0;
    const inputValid = GROSS_USDC_RE.test(rawGross);

    let chainVerified = false;
    let sourceValid: boolean | null = null;
    let quote: QuoteFigures | null = null;
    let failureReason: string | null = null;

    if (!inputValid) {
      failureReason =
        "grossUsdc must be a positive base-10 integer (exact raw 6-decimal USDC base units)";
    } else {
      const timeoutMs = readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
      const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
      const probe = await probeChain(transport);
      chainVerified = probe.chainIdOk;

      if (!chainVerified) {
        failureReason = probe.rpcReachable
          ? "chain identity unverified; live read skipped (fail closed)"
          : "RPC unreachable; live read skipped (fail closed)";
      } else {
        // Resolve the effective source id: zero (no-source path) by default; a
        // provided id is applied ONLY when it exists AND is active on the
        // registry — anything else fails closed (no silent fallback).
        let effectiveSourceId: string | null = ZERO_SOURCE_ID;
        if (sourceProvided) {
          if (!isBytes32Hex(rawSourceId)) {
            sourceValid = false;
            effectiveSourceId = null;
            failureReason = "source id format invalid (expected 0x + 64 hex characters)";
          } else {
            let registryHasCode = false;
            try {
              registryHasCode = await readCodePresent(
                transport,
                SOURCE_LINKAGE_TARGET.registryAddress,
              );
            } catch {
              registryHasCode = false;
            }
            if (!registryHasCode) {
              sourceValid = null;
              effectiveSourceId = null;
              failureReason = "expected deployed registry code not found on chain; read skipped";
            } else {
              const word = bytes32Word(rawSourceId);
              let exists: boolean | null = null;
              let active: boolean | null = null;
              try {
                exists = decodeBool(
                  await ethCall(
                    transport,
                    SOURCE_LINKAGE_TARGET.registryAddress,
                    callData(SELECTOR_SOURCE_EXISTS, [word]),
                  ),
                );
              } catch {
                exists = null;
              }
              if (exists === true) {
                try {
                  active = decodeBool(
                    await ethCall(
                      transport,
                      SOURCE_LINKAGE_TARGET.registryAddress,
                      callData(SELECTOR_SOURCE_IS_ACTIVE, [word]),
                    ),
                  );
                } catch {
                  active = null;
                }
              }
              if (exists === null || (exists === true && active === null)) {
                sourceValid = null;
                effectiveSourceId = null;
                failureReason = "source state read failed (reported as unavailable)";
              } else if (exists && active) {
                sourceValid = true;
                effectiveSourceId = rawSourceId;
              } else {
                sourceValid = false;
                effectiveSourceId = null;
                failureReason =
                  "source link is not active on the registry; request a quote without a source link instead";
              }
            }
          }
        }

        if (effectiveSourceId !== null) {
          let engineHasCode = false;
          try {
            engineHasCode = await readCodePresent(transport, SOURCE_LINKAGE_TARGET.saleAddress);
          } catch {
            engineHasCode = false;
          }
          if (!engineHasCode) {
            failureReason = "expected deployed engine code not found on chain; quote skipped";
          } else {
            const data = callData(SELECTOR_QUOTE, [
              encodeUint256(BigInt(rawGross)),
              addressWord(ZERO_ADDRESS),
              bytes32Word(effectiveSourceId),
            ]);
            let decoded: QuoteFigures | null = null;
            try {
              decoded = decodeQuoteFigures(
                await ethCall(transport, SOURCE_LINKAGE_TARGET.saleAddress, data),
              );
            } catch {
              decoded = null;
            }
            if (decoded === null) {
              failureReason =
                "quote read failed (the engine may be paused or the amount out of range; see /api/protocol/reality)";
            } else {
              quote = decoded;
            }
          }
        }
      }
    }

    const payload = {
      mode: "READ_ONLY_JOIN_QUOTE" as const,
      asOf: new Date().toISOString(),
      inputValid,
      chainVerified,
      sourceProvided,
      sourceValid,
      quote,
      decimals: { usdc: 6 as const, syn: 18 as const },
      failureReason,
    };
    assertProtocolRealityDiscipline(payload);
    res.json(GetJoinQuoteResponse.parse(payload));
  } catch (err) {
    req.log.error({ err }, "join-quote failed");
    res.status(500).json({ error: "join-quote unavailable" });
  }
});

export default router;
