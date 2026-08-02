/**
 * GET /api/registry — THE REGISTER (founder order 2026-07-30).
 *
 * The public per-seat register the 2026-07-25 address-model rescope
 * explicitly permits: `#N · 0x…↗ · chapter · rung · joined`, address-only,
 * zero identity. Every row carries the FULL chain-emitted wallet + its
 * Snowtrace link (the address law: short form is display; the full address
 * is what makes a row verifiable). The red line is untouched — no name,
 * alias, or email exists anywhere in the payload, and the wallet↔seat
 * pairing is the same public chain fact the season board already shows.
 *
 * No DB read, no RPC: one in-memory snapshot per request (the feed
 * pattern). Fail-closed: while the backbone has no model yet, an honest
 * DARK envelope — never invented rows. The serialized payload passes the
 * same address-safety gate as the public feed (40-hex member addresses are
 * lawful; 41+/64-hex still fail closed).
 */

import { Router, type IRouter } from "express";
import { getBackboneFeedSource } from "../backbone/backboneRunner";
import { buildPublicRegister } from "../backbone/registerProjection";
import { assertFeedSafeJson } from "../backbone/feedProjection";
import { GENESIS_SEAT_BY_WALLET } from "../lib/protocol/historicalFreezeWallets";

const router: IRouter = Router();

router.get("/registry", (_req, res) => {
  // The projection is DESIGNED to throw (malformed seat or wallet,
  // address-safety) — a designed failure answers as the sibling
  // routes' JSON envelope, never Express's default HTML 500 (go-live review
  // 2026-07-30: the one public route without a catch leaked stack traces on
  // non-production rigs).
  try {
    const feedSource = getBackboneFeedSource();
    const model = buildPublicRegister({
      capital: feedSource.capitalModel,
      activity: feedSource.model,
      genesisSeatByWallet: GENESIS_SEAT_BY_WALLET,
    });
    const serialized = JSON.stringify(model);
    assertFeedSafeJson(serialized);
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.send(serialized);
  } catch {
    res.status(500).json({ error: "register_unavailable" });
  }
});

export default router;
