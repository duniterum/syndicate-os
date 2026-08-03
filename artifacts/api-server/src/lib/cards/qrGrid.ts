/**
 * THE ONE painted-card QR grid.
 * ---------------------------------------------------------------------------
 * satori cannot run a QR component, so a painted card RESERVES a white box in
 * its layout and the module grid is injected into the finished SVG as plain
 * rects — exact geometry, not layout. Proven by the receipt card since
 * 2026-07-20.
 *
 * EXTRACTED 2026-08-03 (the twin law): the join card gained QRs on the founder's
 * order («il y a plus les qr codes, ajoutes») and the injector would have become
 * a second copy — one wrong error-correction level or one wrong quiet zone in
 * either copy is an unscannable code that nobody notices until a member points a
 * phone at it.
 *
 * THE QUIET ZONE IS NOT DECORATION: `pad` is the white margin the print standard
 * demands around the modules. A grid injected flush to its box edge stops
 * scanning against a dark background — the studio's own QR-print export learned
 * this the hard way (ReferralToolsPanel's quiet-zone wrapper).
 */

import QRCode from "qrcode";

export interface QrSpot {
  /** Top-left of the RESERVED WHITE BOX in card coordinates. */
  readonly x: number;
  readonly y: number;
  /** The white box's side, quiet zone included. */
  readonly box: number;
  /** The quiet zone inside the box, per side. */
  readonly pad: number;
  readonly url: string;
}

/**
 * The quiet zone the QR standard asks for — FOUR MODULES — expressed in pixels
 * for a given box and payload. A pixel pad is a guess: the module size depends
 * on the url's length (a longer link = a denser grid = smaller modules), so the
 * same 12px that is generous for a short link is under-spec for a long one.
 *
 * Solving `pad = 4 · (box − 2·pad) / n` gives `pad = 4·box / (n + 8)`.
 *
 * Measured 2026-08-03 on the join card: box 190, a 105-char link → n = 41 →
 * 15.5px. The hand-picked 12px had left a 10px zone (≈2.5 modules).
 */
export function quietZonePad(box: number, url: string): number {
  const n = QRCode.create(url, { errorCorrectionLevel: "M" }).modules.size;
  // CEIL, never round: the zone is monotone in pad, so rounding DOWN lands under
  // the four modules this function exists to guarantee (measured 3.89 and 3.91
  // on the two live surfaces). Ceiling costs at most one pixel.
  return Math.ceil((4 * box) / (n + 8));
}

/** The QR module grid as plain SVG rects, placed inside a reserved box. */
export function qrSvgGroup(url: string, x: number, y: number, box: number, pad: number): string {
  const qr = QRCode.create(url, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const inner = box - 2 * pad;
  const s = inner / n;
  const rects: string[] = [];
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) {
      if (qr.modules.get(r, c)) {
        rects.push(
          `<rect x="${(x + pad + c * s).toFixed(2)}" y="${(y + pad + r * s).toFixed(2)}" width="${s.toFixed(2)}" height="${s.toFixed(2)}" fill="#000"/>`,
        );
      }
    }
  }
  return `<g>${rects.join("")}</g>`;
}

/** Inject a spot's grid into a finished satori SVG (no spot → unchanged). */
export function injectQr(svg: string, spot: QrSpot | null): string {
  if (spot === null) return svg;
  return svg.replace("</svg>", `${qrSvgGroup(spot.url, spot.x, spot.y, spot.box, spot.pad)}</svg>`);
}
