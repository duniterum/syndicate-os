/**
 * GET /api/backbone/feed — the public receipt-line feed (M4-b, founder GO).
 * Serves the backbone's last-good lines, newest first, hard-capped: each line
 * is "kind · generation · block N · chain-verified time · verify anchor" —
 * public chain data only. Identity-blind: the projection (feedProjection.ts)
 * structurally excludes everything else, and the output gate re-checks the
 * serialized payload fail-closed (exact-shape anchors masked, strict scan on
 * the rest). No DB read, no RPC: one in-memory snapshot per request.
 *
 * A2 — PAGINATION (the /activity newsroom arc, founder GO 2026-07-22).
 * ADDITIVE and fail-closed: with NO query params the response is exactly the
 * pre-A2 whole-feed envelope (older clients untouched). With `limit` (1–50):
 *   · the page walks the WHOLE projected history (`allLines`, uncapped) —
 *     the newest-100 items cap governs only the bare envelope; pagination
 *     reaches every line ever indexed (adversarial-verify hardening,
 *     2026-07-22: counts and cursor must never speak from the capped
 *     window while coverage.itemsTotal speaks the whole — one authority);
 *   · pages are CLUSTER-CLOSED via the pure sliceFeedPage (fixture-pinned
 *     in backbone.guard) — no line can be skipped or duplicated when new
 *     lines prepend between requests;
 *   · `pagination` = { nextCursor, totalCount, kindCounts } — WHOLE-history
 *     figures (the client facet chips speak real served counts);
 *   · `cursor` = "blockNumber:logIndex" (the previous page's last line):
 *     the page starts strictly OLDER. Malformed cursor/limit = 400 — never
 *     a silent full feed.
 */

import { Router, type IRouter } from "express";
import { getBackboneFeedSource } from "../backbone/backboneRunner";
import {
  assertFeedSafeJson,
  buildPublicFeedWithLines,
  sliceFeedPage,
} from "../backbone/feedProjection";

const router: IRouter = Router();

const LIMIT_RE = /^[0-9]{1,2}$/;
const CURSOR_RE = /^[0-9]{1,12}:[0-9]{1,6}$/;

router.get("/backbone/feed", (req, res) => {
  try {
    const { feed, allLines } = buildPublicFeedWithLines(getBackboneFeedSource());

    const rawLimit = req.query.limit;
    const rawCursor = req.query.cursor;

    // Pre-A2 behavior, byte-identical: no params → the whole envelope.
    if (rawLimit === undefined && rawCursor === undefined) {
      const serialized = JSON.stringify(feed);
      assertFeedSafeJson(serialized);
      res.type("application/json").send(serialized);
      return;
    }

    // Paged mode — strict param shapes, fail-closed 400 (never a guess).
    if (typeof rawLimit !== "string" || !LIMIT_RE.test(rawLimit)) {
      res.status(400).json({ error: "bad_limit" });
      return;
    }
    const limit = Number(rawLimit);
    if (limit < 1 || limit > 50) {
      res.status(400).json({ error: "bad_limit" });
      return;
    }
    let cursor: { blockNumber: number; logIndex: number } | null = null;
    if (rawCursor !== undefined) {
      if (typeof rawCursor !== "string" || !CURSOR_RE.test(rawCursor)) {
        res.status(400).json({ error: "bad_cursor" });
        return;
      }
      const [cb, cl] = rawCursor.split(":").map(Number) as [number, number];
      cursor = { blockNumber: cb, logIndex: cl };
    }

    const { pageItems, nextCursor } = sliceFeedPage(allLines, limit, cursor);
    const kindCounts: Record<string, number> = {};
    for (const i of allLines) {
      kindCounts[i.kind] = (kindCounts[i.kind] ?? 0) + 1;
    }

    const paged = {
      ...feed,
      items: pageItems,
      pagination: {
        nextCursor,
        totalCount: allLines.length,
        kindCounts,
      },
    };
    const serialized = JSON.stringify(paged);
    assertFeedSafeJson(serialized);
    res.type("application/json").send(serialized);
  } catch {
    // Never echo what tripped the gate.
    res.status(500).json({ error: "feed_unavailable" });
  }
});

export default router;
