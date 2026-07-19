/**
 * GET /api/receipt/:txHash — ONE purchase's public receipt row (the
 * /receipt/{txHash} page's server read; Q44 sealed 2026-07-19, built
 * 2026-07-20).
 * ---------------------------------------------------------------------------
 * The capitalStanding discipline verbatim: shape-validate the param → one
 * in-memory snapshot → honest null notes → output leak gates. The served
 * row is the SAME projection the member's own binder reads (one spine, one
 * fact shape) — short-form actors by construction, never a wallet key
 * (ADR-003; rowsByWallet stays SERVER-ONLY and this route never touches
 * it). Publishing these facts by transaction anchor is the Q44
 * founder-sealed design: the row carries the protocol's own indexed record
 * of a purchase (including server-joined standing like a V1 frozen-roster
 * seat), addressed by its public hash — anyone with the link may read it;
 * publicReadThrottle bounds the pace.
 *
 * Honest edges, served plainly:
 *   - model not built yet → row null + the honest reason (never a guess);
 *   - unknown hash → row null + "no purchase receipt … in the served record"
 *     (the page adds the too-recent nuance — an indexer cycle may be behind);
 *   - `explorerTxUrl` for the REQUESTED hash serves regardless, so even the
 *     no-receipt state keeps a real verify affordance.
 */

import { Router, type IRouter } from "express";
import { getOwnPurchaseSource } from "../backbone/backboneRunner";
import { txUrl } from "../canon/the-syndicate/chain/chain-registry";
import { assertProtocolRealityDiscipline } from "../lib/protocol/payloadDiscipline";
import { allowPublicRead } from "./publicReadThrottle";
import { throttleKey } from "../auth/clientIdentity";

const router: IRouter = Router();

/** The public anchor's exact shape — anything else is a 400, never a scan. */
const TX_SHAPE_RE = /^0x[0-9a-fA-F]{64}$/;

router.get("/receipt/:txHash", (req, res) => {
  try {
    if (!allowPublicRead(throttleKey(req))) {
      res.status(429).json({ error: "too many requests" });
      return;
    }

    const raw = typeof req.params["txHash"] === "string" ? req.params["txHash"] : "";
    if (!TX_SHAPE_RE.test(raw)) {
      res.status(400).json({ error: "transaction_hash_required" });
      return;
    }

    const source = getOwnPurchaseSource();
    // First row in event order — the page prints one document per address
    // (same-transaction siblings are a theoretical class; the projection
    // keeps them ordered rather than guessing which to hide).
    const match = source?.rowsByTxHash.get(raw.toLowerCase())?.[0] ?? null;
    const explorerUrl = match !== null ? txUrl(match.transactionHash) : null;

    // The served row mirrors the auth member-purchases row shape EXACTLY —
    // one fact shape, one client parser (the binder's), zero drift.
    const row =
      match !== null && explorerUrl !== null
        ? {
            isoDayUtc: match.isoDayUtc,
            amountRaw: match.usdcGrossRaw,
            transaction: match.transactionHash,
            explorerUrl,
            block: match.blockNumber,
            engine: match.generation,
            sealedAtSec: match.sealedAtSec,
            receipt: match.receipt === null ? null : { ...match.receipt },
          }
        : null;

    const payload = {
      row,
      /** False while the record model has not built — the page then says
       *  "unavailable", never "no receipt" (a dark model proves nothing). */
      modelReady: source !== null,
      // The chain-verified token decimals — the same constants the auth
      // member-purchases read serves (ONE truth source; the page re-bases
      // exact amounts on served facts, never a client literal).
      decimals: { usdc: 6 as const, syn: 18 as const },
      /** The requested hash's canonical explorer address — a real verify
       *  affordance even when no receipt serves. */
      explorerTxUrl: txUrl(raw),
      note:
        row !== null
          ? null
          : source === null
            ? "the record model has not built yet — nothing is assumed; try again in a moment"
            : match !== null
              ? "the explorer link could not be resolved — look the transaction hash up on any Avalanche explorer"
              : "no purchase receipt on this transaction in the served record",
    };

    // Leak gates: payload discipline + the boundary-aware address scan
    // (40-hex fail-closes; the 64-hex anchors pass — the f436c42 lesson).
    const serialized = JSON.stringify(payload);
    assertProtocolRealityDiscipline(payload);
    if (/0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/.test(serialized)) {
      throw new Error("address-shaped token in payload");
    }
    res.type("application/json").send(serialized);
  } catch {
    // Never echo what tripped the gate.
    res.status(500).json({ error: "receipt_unavailable" });
  }
});

export default router;
