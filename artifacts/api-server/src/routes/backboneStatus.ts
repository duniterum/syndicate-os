/**
 * GET /api/backbone/status — the event backbone's public, address-safe status
 * (M4-a, founder GO). Serves ONLY the in-memory ops snapshot: enabled/state,
 * cycle counters, last-good scan coverage (block numbers are public chain
 * data, same class as the protocol-time report and the client HealthBanner)
 * and the address-safe AGGREGATE activity report. No per-item feed here —
 * that is the separate founder-gated M4-b slice. No DB read, no RPC: this
 * endpoint costs one in-memory snapshot.
 *
 * Fail-closed output gate: the serialized snapshot is scanned for hex
 * identity material (20-byte addresses AND bare 32-byte hashes) before it is
 * ever written to the response.
 */

import { Router, type IRouter } from "express";
import { getBackboneStatus } from "../backbone/backboneRunner";
import { assertAddressSafeJson } from "../lib/protocol/addressSafety";

const router: IRouter = Router();

router.get("/backbone/status", (_req, res) => {
  try {
    const snapshot = getBackboneStatus();
    const serialized = JSON.stringify(snapshot);
    assertAddressSafeJson(serialized);
    res.type("application/json").send(serialized);
  } catch {
    // Never echo what tripped the gate.
    res.status(500).json({ error: "status_unavailable" });
  }
});

export default router;
