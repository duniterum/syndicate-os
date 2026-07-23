/**
 * GET /api/season — the public season/XP read (S2 of the seasons arc,
 * founder GO 2026-07-23; the law: the harvest dossier §0 as amended, §0.18
 * multi-level builders — the word is BUILDERS, founder ruling 2026-07-23).
 *
 * Serves the backbone's last-good season model as an ADDRESS-SAFE projection:
 * standings rows carry `display` ("#14" for the seated · the feed projection's
 * SHORT FORM for no-seat builders), `shortForm` (the chain-emitted short form,
 * every row — S2c: the board renders seat + short form together), rank, XP,
 * axes, potEligible, horsConcours — never a full address, never a wallet key
 * (the SERVER-ONLY wallet index stays in memory; own-row serving arrives with
 * the auth-zone wiring). Seal anchors
 * serve the BLOCK NUMBER only in this v1 — the tx-hash verify anchor joins
 * with the feed's exact-shape masking pattern when the first seal exists
 * (today: zero sealed seasons; nothing is invented).
 *
 * No DB read, no RPC: one in-memory snapshot per request (the feed pattern).
 * Fail-closed: while the backbone has no model yet, an honest DARK envelope —
 * never invented rows. The serialized payload passes the same address-safety
 * gate as the public feed before it leaves.
 */

import { Router, type IRouter } from "express";
import { getSeasonSource } from "../backbone/backboneRunner";
import { assertFeedSafeJson } from "../backbone/feedProjection";

const router: IRouter = Router();

router.get("/season", (_req, res) => {
  try {
    const model = getSeasonSource();
    if (model === null) {
      res.type("application/json").send(
        JSON.stringify({
          module: "season",
          state: "DARK",
          note: "the season projection has not produced a model yet — nothing is invented; retry after the next backbone cycle",
          currentSeasonNumber: null,
          seasons: [],
        }),
      );
      return;
    }
    const payload = {
      module: "season",
      state: "LIVE",
      currentSeasonNumber: model.currentSeasonNumber,
      seasons: model.seasons.map((s) => ({
        seasonNumber: s.seasonNumber,
        era: s.era,
        state: s.state,
        sealBlockNumber: s.sealBlockNumber,
        playersEarning: s.playersEarning,
        standings: s.standings,
      })),
      notes: model.notes,
    };
    const serialized = JSON.stringify(payload);
    assertFeedSafeJson(serialized);
    res.type("application/json").send(serialized);
  } catch {
    res.status(500).json({ error: "season_unavailable" });
  }
});

export default router;
