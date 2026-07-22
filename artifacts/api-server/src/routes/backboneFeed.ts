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
 *   · items = the newest `limit` lines, extended so a same-anchor CLUSTER
 *     (derived milestone/era lines sharing their purchase's block+logIndex)
 *     is never split across pages — no line can be skipped or duplicated
 *     when new lines prepend between requests;
 *   · `pagination` = { nextCursor, totalCount, kindCounts } — kindCounts are
 *     the WHOLE feed's per-kind totals (the client facet chips speak real
 *     served counts, never client arithmetic);
 *   · `cursor` = "blockNumber:logIndex" (the previous page's last line):
 *     the page starts strictly OLDER than that position. A malformed
 *     cursor/limit is a 400 — never a silent full feed.
 */

import { Router, type IRouter } from "express";
import { getBackboneFeedSource } from "../backbone/backboneRunner";
import { assertFeedSafeJson, buildPublicFeed } from "../backbone/feedProjection";

const router: IRouter = Router();

const LIMIT_RE = /^[0-9]{1,2}$/;
const CURSOR_RE = /^[0-9]{1,12}:[0-9]{1,6}$/;

router.get("/backbone/feed", (req, res) => {
  try {
    const feed = buildPublicFeed(getBackboneFeedSource());

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
    let startIndex = 0;
    if (rawCursor !== undefined) {
      if (typeof rawCursor !== "string" || !CURSOR_RE.test(rawCursor)) {
        res.status(400).json({ error: "bad_cursor" });
        return;
      }
      const [cb, cl] = rawCursor.split(":").map(Number) as [number, number];
      // Strictly older than the cursor position — stable when new lines
      // prepend between pages (index drift can never skip or repeat).
      startIndex = feed.items.findIndex(
        (i) => i.blockNumber < cb || (i.blockNumber === cb && i.logIndex < cl),
      );
      if (startIndex === -1) startIndex = feed.items.length;
    }

    // Cluster-closed page: never split lines sharing (blockNumber, logIndex)
    // — a derived crossing and its underlying purchase stay on one page.
    let endIndex = Math.min(startIndex + limit, feed.items.length);
    while (
      endIndex > startIndex &&
      endIndex < feed.items.length &&
      feed.items[endIndex]!.blockNumber === feed.items[endIndex - 1]!.blockNumber &&
      feed.items[endIndex]!.logIndex === feed.items[endIndex - 1]!.logIndex
    ) {
      endIndex += 1;
    }

    const pageItems = feed.items.slice(startIndex, endIndex);
    const last = pageItems.length > 0 ? pageItems[pageItems.length - 1]! : null;
    const kindCounts: Record<string, number> = {};
    for (const i of feed.items) {
      kindCounts[i.kind] = (kindCounts[i.kind] ?? 0) + 1;
    }

    const paged = {
      ...feed,
      items: pageItems,
      pagination: {
        nextCursor:
          last !== null && endIndex < feed.items.length
            ? `${last.blockNumber}:${last.logIndex}`
            : null,
        totalCount: feed.items.length,
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
