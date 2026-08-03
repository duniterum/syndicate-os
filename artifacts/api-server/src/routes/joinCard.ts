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
import { introducerFacts, introducerShortWallet } from "../joincard/introducerRead";
import { paintJoinCard, faceFromParam } from "../joincard/joinCardPainter";
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
// Four faces per source now share this cap, so 200 entries meant 50 sources.
const CACHE_CAP = 800;
const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { png: Buffer; at: number }>();

/** One paint per (source, face) at a time — every concurrent caller awaits it. */
const painting = new Map<string, Promise<Buffer | null>>();
function singleFlight(
  key: string,
  work: () => Promise<Buffer | null>,
): Promise<Buffer | null> {
  const flying = painting.get(key);
  if (flying !== undefined) return flying;
  const run = work();
  painting.set(key, run);
  run.catch(() => undefined).then(() => painting.delete(key));
  return run;
}

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
      // K1.7 — WHICH FACE. An unknown ?card= is not an error: it degrades to
      // the invitation, so a mangled or stale share link still unfurls.
      const face = faceFromParam(req.query["card"]);
      // The bytes cache is keyed BY FACE — four pictures per source, never one
      // bucket serving another face's picture.
      const cacheKey = `${sourceId}:${face}`;

      const hit = cache.get(cacheKey);
      if (hit !== undefined && Date.now() - hit.at < CACHE_TTL_MS) {
        res.setHeader("Cache-Control", "public, max-age=600");
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.type("image/png").send(hit.png);
        return;
      }
      if (hit !== undefined) cache.delete(cacheKey);

      // M2-v2: the enriched read — the card paints the introducer's living
      // seat line when the spine resolves it, the plain card otherwise.
      const facts = await introducerFacts(sourceId);
      if (facts === null) {
        fallback(res);
        return;
      }
      // FACE_FALLBACK: a member face whose facts do not resolve (no seat yet,
      // an empty record) paints null — never a half-empty boast. The share
      // still unfurls: it falls back to the invitation, and only the
      // invitation's own null reaches the generic site image.
      // The QR on a member face carries the introducer's own join link, so a
      // SCREENSHOT of the card still leads back to him (the founder's order,
      // 2026-08-03 — a re-posted picture has lost the link it came with).
      // Origin DERIVED from the generic-card url: one origin literal in this
      // file, never two.
      const base = `${new URL(GENERIC_CARD_URL).origin}/join?source=${sourceId}`;
      // The COLLECTIBLE download tags its QR &via=card (referrerKit); the
      // preview of the same card must land in the same Channels bucket.
      const joinLink = face === "seat" ? `${base}&via=card` : base;
      // SINGLE FLIGHT (2026-08-03). satori is CPU-bound and resvg's render is a
      // SYNCHRONOUS native call — it blocks the loop this process also serves
      // members' auth and quotes on. One share fans out to five networks, and
      // Facebook alone issues several parallel fetches, so the same cold key
      // used to run every one of those paints at once. One promise per key.
      const png = await singleFlight(cacheKey, async () =>
        (await paintJoinCard(facts, face, joinLink)) ??
        (face === "invite" ? null : await paintJoinCard(facts, "invite", joinLink)),
      );
      if (png === null) {
        fallback(res);
        return;
      }
      if (cache.size >= CACHE_CAP) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
      }
      cache.set(cacheKey, { png, at: Date.now() });
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
