// routes/joinCard.ts — K2 · the invitee's side (founder-approved mockup).
//
//   GET /api/join-card/{sourceId}.png  → the painted unfurl card for a shared
//       /join?source= link (the receipt-card serving discipline: throttled,
//       shape-valid or 400, fail-closed 302 to the generic site image —
//       never a broken or invented picture).
//   GET /api/source/introducer?sourceId= → { shortWallet } for the /join
//       page's honest introduced-by strip. ADR-003: the SHORT form only,
//       derived server-side; the full address never leaves the server.
//
// Facts come from the PUBLIC registry record (sourceConfig — chain-public
// data) via the cached introducer read; no session, no directory, no names.

import { Router, type IRouter } from "express";
import { introducerShortWallet } from "../joincard/introducerRead";
import { paintJoinCard } from "../joincard/joinCardPainter";
import { allowPublicRead } from "./publicReadThrottle";
import { throttleKey } from "../auth/clientIdentity";

const router: IRouter = Router();

const FILE_SHAPE_RE = /^0x[0-9a-fA-F]{64}\.png$/;
const ID_SHAPE_RE = /^0x[0-9a-fA-F]{64}$/;

/** The generic fallback — the site's one static card (crawler-followable). */
const GENERIC_CARD_URL = "https://thesyndicate.money/opengraph.jpg";

/** Tiny in-memory politeness cache (sourceId → bytes) — capped AND TTL'd
 * (adversarial verify 2026-07-21): the introducer is a MUTABLE fact (a
 * source's wallet can change, a source can pause), so the painted bytes
 * expire with the read's own positive TTL — never an immortal card. */
const CACHE_CAP = 200;
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { png: Buffer; at: number }>();

function fallback(res: import("express").Response): void {
  res.setHeader("Cache-Control", "public, max-age=300");
  res.redirect(302, GENERIC_CARD_URL);
}

router.get("/join-card/:file", (req, res) => {
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
      const sourceId = file.slice(0, -4).toLowerCase();

      const hit = cache.get(sourceId);
      if (hit !== undefined && Date.now() - hit.at < CACHE_TTL_MS) {
        res.setHeader("Cache-Control", "public, max-age=600");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.type("image/png").send(hit.png);
        return;
      }
      if (hit !== undefined) cache.delete(sourceId);

      const shortWallet = await introducerShortWallet(sourceId);
      if (shortWallet === null) {
        fallback(res);
        return;
      }
      const png = await paintJoinCard(shortWallet);
      if (png === null) {
        fallback(res);
        return;
      }
      if (cache.size >= CACHE_CAP) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
      }
      cache.set(sourceId, { png, at: Date.now() });
      res.setHeader("Cache-Control", "public, max-age=600");
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

router.get("/source/introducer", (req, res) => {
  void (async () => {
    try {
      if (!allowPublicRead(throttleKey(req))) {
        res.status(429).json({ error: "too many requests" });
        return;
      }
      const raw = typeof req.query["sourceId"] === "string" ? req.query["sourceId"] : "";
      if (!ID_SHAPE_RE.test(raw)) {
        res.json({ shortWallet: null });
        return;
      }
      const shortWallet = await introducerShortWallet(raw.toLowerCase());
      res.json({ shortWallet });
    } catch {
      try {
        res.json({ shortWallet: null }); // fail closed — the strip stays generic
      } catch {
        /* headers already sent */
      }
    }
  })();
});

export default router;
