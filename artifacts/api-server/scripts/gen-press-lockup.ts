// gen-press-lockup.ts — one-shot generator for the press-kit LOCKUP assets
// (founder catch, live prod 2026-08-03: «un seul logo sans texte … ce n'est
// pas suffisant» — a press kit owes the mark WITH the wordmark).
//
// Composition, all VECTOR: the interlock mark's paths verbatim (from the
// served studio/public/syn-mark-gold.svg — the brand authority's file) + the
// wordmark text rendered to GLYPH PATHS by satori with the house TTFs (the
// receipt-card painter's own fonts — no <text> element survives, so the SVG
// needs no font installed anywhere). resvg (the painter's own rasterizer)
// then produces the PNG at 1x and 2x. A pixel probe self-verifies the export
// (the artifact-verification law: bitmap probes, never DOM/text presence):
// mark ink present · text ink present · the right padding column empty
// (nothing clipped).
//
// Run (from artifacts/api-server): .\node_modules\.bin\tsx.cmd .\scripts\gen-press-lockup.ts
// Outputs (committed, served): ../studio/public/brand/syn-lockup-gold.svg + .png + @2x.png

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const here = path.dirname(fileURLToPath(import.meta.url));
const FONTS = path.resolve(here, "..", "src", "receiptcard", "fonts");
const STUDIO_PUBLIC = path.resolve(here, "..", "..", "studio", "public");
const OUT_DIR = path.join(STUDIO_PUBLIC, "brand");

// The R-CARDS fixed ink (share artifacts are theme-independent by canon).
const INK_FG = "#E1E7EF";
const INK_MUTED = "#7F8EA3";

// Geometry — a designed object: 160 tall, mark at 140, generous right pad
// that the pixel probe proves empty (nothing clipped).
const H = 160;
const MARK_H = 140;
const MARK_NATIVE_W = 598;
const MARK_NATIVE_H = 477;
const MARK_W = Math.round((MARK_H * MARK_NATIVE_W) / MARK_NATIVE_H); // 176
const PAD = 12;
const GAP = 34;
const TEXT_W = 700;
const TOTAL_W = PAD + MARK_W + GAP + TEXT_W + PAD;

async function main(): Promise<void> {
  const workSansSemiBold = readFileSync(path.join(FONTS, "WorkSans-SemiBold.ttf"));

  // 1 · the wordmark, glyphs → paths (satori's explicit-flex law honored).
  const textSvg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        },
        children: [
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                fontFamily: "Work Sans",
                fontWeight: 600,
                fontSize: 66,
                letterSpacing: "0.05em",
                color: INK_FG,
              },
              children: "THE SYNDICATE",
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                marginTop: 12,
                fontFamily: "Work Sans",
                fontWeight: 600,
                fontSize: 21,
                letterSpacing: "0.34em",
                color: INK_MUTED,
              },
              children: "ON-CHAIN MEMBERSHIP PROTOCOL",
            },
          },
        ],
      },
    },
    {
      width: TEXT_W,
      height: H,
      fonts: [{ name: "Work Sans", data: workSansSemiBold, weight: 600, style: "normal" }],
    },
  );
  const textInner = textSvg.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

  // 2 · the mark, verbatim from the served brand file (normalized out of its
  // own viewBox offset, scaled to MARK_H).
  const markFile = readFileSync(path.join(STUDIO_PUBLIC, "syn-mark-gold.svg"), "utf8");
  const markInner = markFile.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>[\s\S]*$/, "");
  const s = MARK_H / MARK_NATIVE_H;

  const composed = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TOTAL_W} ${H}" width="${TOTAL_W}" height="${H}">
<g transform="translate(${PAD},${(H - MARK_H) / 2}) scale(${s}) translate(-2,-25)">${markInner}</g>
<g transform="translate(${PAD + MARK_W + GAP},0)">${textInner}</g>
</svg>
`;

  // 3 · rasterize (1x + 2x) with the painter's own resvg.
  const png1 = new Resvg(composed, { fitTo: { mode: "width", value: TOTAL_W } }).render();
  const png2 = new Resvg(composed, { fitTo: { mode: "width", value: TOTAL_W * 2 } }).render();

  // 4 · PIXEL PROBE on the 1x render — the export is verified, never assumed.
  const { width, height } = png1;
  const px = png1.pixels; // RGBA
  const alphaAt = (x: number, y: number) => px[(y * width + x) * 4 + 3] ?? 0;
  const columnInk = (x: number) => {
    for (let y = 0; y < height; y++) if (alphaAt(x, y) > 8) return true;
    return false;
  };
  // BANDS, not single columns — a lone column can land in a letter gap
  // (this very script's first probe did, between «T» and «H»).
  const bandInk = (x0: number, x1: number) => {
    for (let x = x0; x <= x1; x++) if (columnInk(x)) return true;
    return false;
  };
  const markInk = bandInk(PAD + 20, PAD + MARK_W - 20);
  const textStart = PAD + MARK_W + GAP;
  const textInk = bandInk(textStart + 5, textStart + 160);
  const rightPadClean = !columnInk(width - 2) && !columnInk(width - 5);
  console.log(
    `[gen-press-lockup] probe — mark ink: ${markInk} · text ink: ${textInk} · right pad clean (nothing clipped): ${rightPadClean} · canvas ${width}×${height}`,
  );
  if (!markInk || !textInk || !rightPadClean) {
    console.error("[gen-press-lockup] PROBE FAILED — not writing broken assets.");
    process.exit(1);
  }

  writeFileSync(path.join(OUT_DIR, "syn-lockup-gold.svg"), composed);
  writeFileSync(path.join(OUT_DIR, "syn-lockup-gold.png"), png1.asPng());
  writeFileSync(path.join(OUT_DIR, "syn-lockup-gold@2x.png"), png2.asPng());
  console.log(`[gen-press-lockup] wrote syn-lockup-gold.svg + .png + @2x.png → ${OUT_DIR}`);
}

void main();
