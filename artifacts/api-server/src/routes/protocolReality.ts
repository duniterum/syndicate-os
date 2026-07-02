import { Router, type IRouter } from "express";
import { GetProtocolRealityResponse } from "@workspace/api-zod";
import { getProtocolReality } from "../lib/protocol/realityService";
import { assertProtocolRealityDiscipline } from "../lib/protocol/payloadDiscipline";

const router: IRouter = Router();

/**
 * GET /protocol/reality (mounted at /api) — strictly read-only protocol
 * observability. Builds the reality envelope from vendored-canon-reconciled,
 * read-only Avalanche C-Chain reads, runs the payload-discipline gate (no
 * address leak, no forbidden framing), validates against the generated schema,
 * then responds. Any discipline/schema failure throws and is reported as 500 —
 * we never ship a non-compliant payload and never fabricate data.
 */
router.get("/protocol/reality", async (req, res) => {
  try {
    const envelope = await getProtocolReality();
    assertProtocolRealityDiscipline(envelope);
    const data = GetProtocolRealityResponse.parse(envelope);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "protocol-reality build failed");
    res.status(500).json({ error: "protocol-reality unavailable" });
  }
});

export default router;
