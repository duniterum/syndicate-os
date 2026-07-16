/**
 * GET /api/backbone/capital-standing?seat=N — one seat's capital-axis rung (S7).
 * ---------------------------------------------------------------------------
 * The Member Home hero reads the seat's CURRENT standing on the capital axis
 * from the SAME canon walk the feed's rises come from (capitalAxisReadmodel —
 * one derivation, one truth; the feed is capped and can never be re-folded
 * client-side without silently understating one day).
 *
 * Doctrine (H2-⑰, engraved):
 *   - PUBLIC data only: a seat ordinal in, a rung TITLE out. No wallet
 *     material exists anywhere on this path; the cumulative amount never
 *     leaves the read-model. Seat→rung is recomputable by anyone from the
 *     chain — this is legibility, never disclosure (CANON_VISIBILITY_LAW).
 *   - NO approaching/next-rung shape is served (the anti-scarcity pin).
 *   - Fail-closed: model dark or seat unwalked (V1 rows carry no ordinal)
 *     → rung null with an honest note — never a guess.
 * No DB read, no RPC: one in-memory snapshot per request, same output gate
 * as the feed (defense in depth on an address-free payload).
 */

import { Router, type IRouter } from "express";
import { getBackboneFeedSource } from "../backbone/backboneRunner";
import { assertFeedSafeJson } from "../backbone/feedProjection";

const router: IRouter = Router();

/** Public seat ordinal: positive integer, sane width. */
const SEAT_SHAPE_RE = /^[1-9][0-9]{0,6}$/;

router.get("/backbone/capital-standing", (req, res) => {
  try {
    const rawSeat = req.query["seat"];
    if (typeof rawSeat !== "string" || !SEAT_SHAPE_RE.test(rawSeat)) {
      res.status(400).json({ error: "seat_required" });
      return;
    }
    const seatNumber = Number(rawSeat);

    const source = getBackboneFeedSource();
    const modelAvailable = source.capitalModel !== null;
    const rung =
      source.capitalModel?.standingBySeat.find(
        (s) => s.seatNumber === seatNumber,
      )?.rung ?? null;

    const payload = {
      module: "event-backbone",
      state: source.state,
      headBlock: source.headBlock,
      seatNumber,
      rung,
      note:
        rung !== null
          ? null
          : modelAvailable
            ? "no derivable footprint for this seat — early-era purchases carry no seat ordinal and are honestly excluded, never guessed"
            : "the capital model has not built yet — standing unavailable, never guessed",
    };
    const serialized = JSON.stringify(payload);
    assertFeedSafeJson(serialized);
    res.type("application/json").send(serialized);
  } catch {
    // Never echo what tripped the gate.
    res.status(500).json({ error: "capital_standing_unavailable" });
  }
});

export default router;
