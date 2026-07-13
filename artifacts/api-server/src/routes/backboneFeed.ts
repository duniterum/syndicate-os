/**
 * GET /api/backbone/feed — the public receipt-line feed (M4-b, founder GO).
 * Serves the backbone's last-good lines, newest first, hard-capped: each line
 * is "kind · generation · block N · chain-verified time · verify anchor" —
 * public chain data only. Identity-blind: the projection (feedProjection.ts)
 * structurally excludes everything else, and the output gate re-checks the
 * serialized payload fail-closed (exact-shape anchors masked, strict scan on
 * the rest). No DB read, no RPC: one in-memory snapshot per request.
 */

import { Router, type IRouter } from "express";
import { getBackboneFeedSource } from "../backbone/backboneRunner";
import { assertFeedSafeJson, buildPublicFeed } from "../backbone/feedProjection";

const router: IRouter = Router();

router.get("/backbone/feed", (_req, res) => {
  try {
    const feed = buildPublicFeed(getBackboneFeedSource());
    const serialized = JSON.stringify(feed);
    assertFeedSafeJson(serialized);
    res.type("application/json").send(serialized);
  } catch {
    // Never echo what tripped the gate.
    res.status(500).json({ error: "feed_unavailable" });
  }
});

export default router;
