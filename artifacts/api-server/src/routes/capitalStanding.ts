/**
 * GET /api/backbone/capital-standing?seat=N — one seat's capital-axis
 * standing (S7 · S7-b).
 * ---------------------------------------------------------------------------
 * The Member Home reads the seat's CURRENT standing on the capital axis from
 * the SAME canon walk the feed's rises come from (capitalAxisReadmodel —
 * one derivation, one truth; the feed is capped and can never be re-folded
 * client-side without silently understating one day).
 *
 * Doctrine:
 *   - PUBLIC data only: a seat ordinal in; the rung TITLE, the seat's
 *     cumulative gross USDC, the founder-named LADDER and the NEXT rung out.
 *     S7-b (founder, 2026-07-16 — THE OWN-ACCOUNT DISPLAY RULE,
 *     GAMIFICATION_LEGAL_DOCTRINE): the member's own dashboard shows his own
 *     footprint, the ladder and the next rung — the Sephora account pattern,
 *     guidance. Every figure here is public chain data made legible
 *     (CANON_VISIBILITY_LAW); no wallet material exists on this path.
 *   - The FEED's voice is untouched: a feed line never carries the amount,
 *     and the public anti-scarcity narrative pins stand.
 *   - The red line stands: a rung unlocks recognition only — this route
 *     serves facts, never a benefit.
 *   - Fail-closed: model dark or seat unwalked (V1 rows carry no ordinal)
 *     → rung null with an honest note — never a guess.
 * No DB read, no RPC: one in-memory snapshot per request, same output gate
 * as the feed (defense in depth on an address-free payload).
 */

import { Router, type IRouter } from "express";
import { getBackboneFeedSource } from "../backbone/backboneRunner";
import { assertFeedSafeJson } from "../backbone/feedProjection";
import { CAPITAL_AXIS_LADDER } from "../backbone/capitalAxisReadmodel";

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
    const standing =
      source.capitalModel?.standingBySeat.find(
        (s) => s.seatNumber === seatNumber,
      ) ?? null;

    // The founder-named canon ladder (public), and the rung ABOVE the seat's
    // current one — own-account guidance (null at the summit or when the
    // seat's footprint is not derivable).
    const ladder = CAPITAL_AXIS_LADDER.map((r) => ({
      title: r.title,
      usdc: r.usdc,
    }));
    const currentIdx =
      standing !== null
        ? CAPITAL_AXIS_LADDER.findIndex((r) => r.title === standing.rung)
        : -1;
    const nextRung =
      currentIdx >= 0 && currentIdx < CAPITAL_AXIS_LADDER.length - 1
        ? ladder[currentIdx + 1]!
        : null;

    const payload = {
      module: "event-backbone",
      state: source.state,
      headBlock: source.headBlock,
      seatNumber,
      rung: standing?.rung ?? null,
      cumulativeUsdcRaw: standing?.cumulativeUsdcRaw ?? null,
      nextRung,
      ladder,
      note:
        standing !== null
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
