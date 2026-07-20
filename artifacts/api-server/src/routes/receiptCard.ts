/**
 * GET /api/receipt-card/:file — ONE receipt's painted preview picture
 * (the painted-cards slice, Q44 sealed order; founder-approved faces
 * 2026-07-20). `:file` = `{64-hex tx hash}.png`, `?f=1..4` picks the face.
 * ---------------------------------------------------------------------------
 * Thin by design: shape-validate → throttle → read the tx-keyed projection
 * → paint (src/receiptcard — the painting zone owns every string and
 * figure) → serve with a long public cache. FAIL-CLOSED, NEVER INVENTED:
 * an unknown hash, a dark model, a record that cannot express a card, or
 * any painting fault → 302 to the canonical generic site image — the same
 * picture every page served before this slice.
 */

import { Router, type IRouter } from "express";
import { getOwnPurchaseSource } from "../backbone/backboneRunner";
import { txUrl } from "../canon/the-syndicate/chain/chain-registry";
import { cardFactsFor } from "../receiptcard/cardFacts";
import { paintReceiptCard } from "../receiptcard/painter";
import { FACE_COUNT } from "../receiptcard/faces";
import { allowPublicRead } from "./publicReadThrottle";
import { throttleKey } from "../auth/clientIdentity";

const router: IRouter = Router();

const FILE_SHAPE_RE = /^0x[0-9a-fA-F]{64}\.png$/;
const FACE_SHAPE_RE = /^[1-9]$/;

/** The generic fallback — the site's one static card (crawler-followable). */
const GENERIC_CARD_URL = "https://thesyndicate.money/opengraph.jpg";

/** Tiny in-memory politeness cache (tx+face → bytes) — painting is cheap
 *  but crawler bursts re-fetch; capped, never a correctness layer. */
const CACHE_CAP = 200;
const cache = new Map<string, Buffer>();

function fallback(res: import("express").Response): void {
  res.setHeader("Cache-Control", "public, max-age=300");
  res.redirect(302, GENERIC_CARD_URL);
}

router.get("/receipt-card/:file", (req, res) => {
  void (async () => {
    try {
      if (!allowPublicRead(throttleKey(req))) {
        res.status(429).json({ error: "too many requests" });
        return;
      }
      const file = typeof req.params["file"] === "string" ? req.params["file"] : "";
      if (!FILE_SHAPE_RE.test(file)) {
        res.status(400).json({ error: "card_address_required" });
        return;
      }
      const rawFace = typeof req.query["f"] === "string" ? req.query["f"] : "1";
      if (!FACE_SHAPE_RE.test(rawFace) || Number(rawFace) > FACE_COUNT) {
        res.status(400).json({ error: "face_out_of_range" });
        return;
      }
      const face = Number(rawFace);
      const hash = file.slice(0, -4);

      const key = `${hash.toLowerCase()}#${face}`;
      const hit = cache.get(key);
      if (hit !== undefined) {
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.type("image/png").send(hit);
        return;
      }

      const source = getOwnPurchaseSource();
      const match = source?.rowsByTxHash.get(hash.toLowerCase())?.[0] ?? null;
      const explorerUrl = match !== null ? txUrl(match.transactionHash) : null;
      if (match === null || explorerUrl === null) {
        fallback(res);
        return;
      }
      const facts = cardFactsFor(match, explorerUrl);
      if (facts === null) {
        fallback(res);
        return;
      }

      const png = await paintReceiptCard(face, facts);
      if (png === null) {
        fallback(res);
        return;
      }
      if (cache.size >= CACHE_CAP) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
      }
      cache.set(key, png);
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.setHeader("X-Content-Type-Options", "nosniff");
      res.type("image/png").send(png);
    } catch {
      // Never a broken card, never an echoed fault — the generic picture.
      try {
        fallback(res);
      } catch {
        /* headers already sent */
      }
    }
  })();
});

export default router;
