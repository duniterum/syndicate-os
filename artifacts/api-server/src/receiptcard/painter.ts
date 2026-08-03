/**
 * receiptcard/painter.ts — face spec → 1200×630 PNG, WhatsApp-safe.
 * ---------------------------------------------------------------------------
 * satori lays the face out as SVG (the fonts are the SITE'S OWN faces,
 * bundled as binary at build time — no filesystem paths, no network);
 * the QR module grid is injected into that SVG as plain rects at the face's
 * reserved white box (satori cannot run a QR component — the grid is exact
 * geometry, not layout); resvg rasterizes to PNG. The share ceiling is the
 * proven card's own constant: a card over 300 KB never serves (WhatsApp
 * drops big previews — the route falls back to the generic image instead).
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { injectQr } from "../lib/cards/qrGrid";
import { buildFace, CARD_H, CARD_W, type SatoriNode } from "./faces";
import type { ReceiptCardFacts } from "./cardFacts";

// The site's own faces, bundled as raw bytes (build.mjs `.ttf` binary
// loader). OFL 1.1 — see ./fonts/OFL-NOTICE.md.
import plexMonoRegular from "./fonts/IBMPlexMono-Regular.ttf";
import plexMonoSemiBold from "./fonts/IBMPlexMono-SemiBold.ttf";
import workSansRegular from "./fonts/WorkSans-Regular.ttf";
import workSansSemiBold from "./fonts/WorkSans-SemiBold.ttf";

/** The proven share card's ceiling (ReceiptShareCard.SHARE_CARD_MAX_BYTES). */
export const CARD_MAX_BYTES = 300_000;

const FONTS = [
  { name: "IBM Plex Mono", data: toArrayBuffer(plexMonoRegular), weight: 400 as const, style: "normal" as const },
  { name: "IBM Plex Mono", data: toArrayBuffer(plexMonoSemiBold), weight: 600 as const, style: "normal" as const },
  { name: "Work Sans", data: toArrayBuffer(workSansRegular), weight: 400 as const, style: "normal" as const },
  { name: "Work Sans", data: toArrayBuffer(workSansSemiBold), weight: 600 as const, style: "normal" as const },
];

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/**
 * Paint one face to a PNG buffer. Throws on any internal failure — the
 * route catches and falls back to the generic image (fail-closed: a broken
 * paint never serves a broken card). Returns null when the result exceeds
 * the share ceiling (same posture).
 */
export async function paintReceiptCard(
  face: number,
  facts: ReceiptCardFacts,
): Promise<Buffer | null> {
  const spec = buildFace(face, facts);
  let svg = await satori(spec.node as unknown as Parameters<typeof satori>[0], {
    width: CARD_W,
    height: CARD_H,
    fonts: FONTS,
  });
  svg = injectQr(svg, spec.qr);
  const png = new Resvg(svg, { fitTo: { mode: "width", value: CARD_W } }).render().asPng();
  const buf = Buffer.from(png);
  return buf.length <= CARD_MAX_BYTES ? buf : null;
}

export type { SatoriNode };
