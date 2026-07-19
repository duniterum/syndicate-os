// Channel zone router — SPEC R3 (`&via=`), the THIRD sanctioned zone.
//
// Mounted at /api/channel. The constitutionally-named channel log
// (CONSTITUTION_AUTORITE §③ N2: "Le log des canaux" · "Les analytics";
// founder GO 2026-07-19, referral-arc slice ③): two ANONYMOUS, bounded,
// fail-closed beacons — the only public-write surface in the OS, and by
// design the least trusting one:
//
//   POST /api/channel/click       { sourceId, via }          → 204 always
//   POST /api/channel/conversion  { sourceId, via, txHash }  → 204 always
//
// The bounding (each layer fails closed, silently):
//   · throttled per hashed client key (the raw IP is never stored/logged);
//   · zod-validated, size-capped body (scoped 1kb parser — never app-wide);
//   · via tag normalized + format-capped (lowercase [a-z0-9][a-z0-9_-]{0,23});
//   · a click counts ONLY for a source the live registry confirms exists;
//   · a conversion records ONLY after the server itself verified the tx
//     receipt on-chain (V3 purchase event naming this source — txVerify.ts);
//   · responses are ALWAYS 204 with no body: nothing is echoed, nothing is
//     revealed, no error detail exists to probe (the client fires and forgets);
//   · no sourceId / via / txHash ever reaches a log line.
//
// What is deliberately ABSENT: cookies, sessions, identifiers, GET routes,
// query params, per-click event rows, IP/UA capture. The stored record is an
// aggregate daily counter + a public tx hash — ADR-003's "nothing to leak".

import { Router, json, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { isAllowedBrowserOrigin } from "../auth/authConfig";
import { throttleKey } from "../auth/clientIdentity";
import { allowChannelClick, allowChannelConversion } from "./channelThrottle";
import { sourceExistsCached } from "./sourceExistence";
import { verifyConversionOnChain } from "./txVerify";
import { recordClick, recordConversion } from "./channelStore";

const router: Router = Router();

// Scoped body parsing: channel zone only, tiny cap, never app-wide.
router.use(json({ limit: "1kb" }));

// CSRF/origin defense (the auth zone's pattern): a browser-declared
// cross-site origin or fetch metadata is dropped with the uniform 204 —
// the beacons are same-origin utilities, not an open ingestion API.
function dropCrossOrigin(req: Request, res: Response, next: NextFunction): void {
  if (req.method === "POST") {
    const origin = req.headers.origin;
    if (typeof origin === "string" && !isAllowedBrowserOrigin(origin)) {
      res.status(204).end();
      return;
    }
    const fetchSite = req.headers["sec-fetch-site"];
    if (
      typeof fetchSite === "string" &&
      !["same-origin", "same-site", "none"].includes(fetchSite)
    ) {
      res.status(204).end();
      return;
    }
  }
  next();
}
router.use(dropCrossOrigin);

const HEX32 = /^0x[0-9a-fA-F]{64}$/;
/** Channel tag law: lowercase, short, boring — never free prose. */
const VIA_RE = /^[a-z0-9][a-z0-9_-]{0,23}$/;

const clickSchema = z.object({
  sourceId: z.string().regex(HEX32),
  via: z.string().min(1).max(64),
});

const conversionSchema = z.object({
  sourceId: z.string().regex(HEX32),
  via: z.string().min(1).max(64),
  txHash: z.string().regex(HEX32),
});

/** Normalize a member-chosen tag; null when it can't be a valid tag. */
function normalizeVia(raw: string): string | null {
  const via = raw.trim().toLowerCase();
  return VIA_RE.test(via) ? via : null;
}

// ── POST /api/channel/click ─────────────────────────────────────────────────
router.post("/click", (req: Request, res: Response) => {
  // The response is decided FIRST and is always the same: nothing to probe.
  res.status(204).end();
  if (!allowChannelClick(throttleKey(req))) return;
  const parsed = clickSchema.safeParse(req.body);
  if (!parsed.success) return;
  const via = normalizeVia(parsed.data.via);
  if (via === null) return;
  const sourceId = parsed.data.sourceId.toLowerCase();
  // Fire-and-forget after the response — the visitor never waits on RPC/DB.
  void sourceExistsCached(sourceId).then((exists) => {
    if (exists) return recordClick(sourceId, via);
    return undefined;
  });
});

// ── POST /api/channel/conversion ────────────────────────────────────────────
router.post("/conversion", (req: Request, res: Response) => {
  res.status(204).end();
  if (!allowChannelConversion(throttleKey(req))) return;
  const parsed = conversionSchema.safeParse(req.body);
  if (!parsed.success) return;
  const via = normalizeVia(parsed.data.via);
  if (via === null) return;
  const sourceId = parsed.data.sourceId.toLowerCase();
  const txHash = parsed.data.txHash.toLowerCase();
  void sourceExistsCached(sourceId).then(async (exists) => {
    if (!exists) return;
    const proven = await verifyConversionOnChain(txHash, sourceId);
    if (proven) await recordConversion(sourceId, via, txHash);
  });
});

export default router;
