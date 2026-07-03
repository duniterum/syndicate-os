import { Router, type IRouter } from "express";
import { GetSourceValidateResponse } from "@workspace/api-zod";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { ethCall, probeChain, readCodePresent } from "../lib/protocol/evmRead";
import { callData, decodeBool } from "../lib/protocol/archiveDecoders";
import {
  SELECTOR_SOURCE_EXISTS,
  SELECTOR_SOURCE_IS_ACTIVE,
  bytes32Word,
  isBytes32Hex,
} from "../lib/protocol/sourceDecoders";
import { SOURCE_LINKAGE_TARGET } from "../data/protocolTargets";
import { assertProtocolRealityDiscipline } from "../lib/protocol/payloadDiscipline";
import { allowPublicRead } from "./publicReadThrottle";
import { throttleKey } from "../auth/clientIdentity";

const router: IRouter = Router();

/**
 * GET /source/validate?sourceId=0x… (mounted at /api) — strictly read-only
 * Verified Introduction validation against SourceRegistryV1:
 * sourceExists(bytes32) + isActive(bytes32) booleans ONLY. The client-supplied
 * source id is NEVER echoed back, and nothing from the on-chain source
 * configuration (wallets, terms) is ever read or returned. Fail-closed: wrong
 * chain / missing code / decode failure → null values + failureReason. No
 * wallet, no write, no transaction.
 */
router.get("/source/validate", async (req, res) => {
  try {
    if (!allowPublicRead(throttleKey(req))) {
      res.status(429).json({ error: "too many requests" });
      return;
    }

    const rawSourceId = typeof req.query["sourceId"] === "string" ? req.query["sourceId"] : "";
    const formatValid = isBytes32Hex(rawSourceId);

    let chainVerified = false;
    let registryCodePresent: boolean | null = null;
    let exists: boolean | null = null;
    let active: boolean | null = null;
    let failureReason: string | null = null;

    if (!formatValid) {
      failureReason = "source id format invalid (expected 0x + 64 hex characters)";
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
        let hasCode = false;
        try {
          hasCode = await readCodePresent(transport, SOURCE_LINKAGE_TARGET.registryAddress);
        } catch {
          hasCode = false;
        }
        registryCodePresent = hasCode;
        if (!hasCode) {
          failureReason = "expected deployed registry code not found on chain; read skipped";
        } else {
          const word = bytes32Word(rawSourceId);
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
          if (exists === null) {
            failureReason = "source existence read failed (reported as unavailable)";
          } else if (!exists) {
            active = false;
          } else {
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
            if (active === null) {
              failureReason = "source active-state read failed (reported as unavailable)";
            }
          }
        }
      }
    }

    const payload = {
      mode: "READ_ONLY_SOURCE_VALIDATE" as const,
      asOf: new Date().toISOString(),
      formatValid,
      chainVerified,
      registryCodePresent,
      exists,
      active,
      failureReason,
    };
    assertProtocolRealityDiscipline(payload);
    res.json(GetSourceValidateResponse.parse(payload));
  } catch (err) {
    req.log.error({ err }, "source-validate failed");
    res.status(500).json({ error: "source-validate unavailable" });
  }
});

export default router;
