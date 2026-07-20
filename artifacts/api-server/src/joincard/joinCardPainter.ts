/**
 * The invitee's unfurl card — K2 (founder-approved mockup, 2026-07-20).
 * ---------------------------------------------------------------------------
 * Paints the 1200×630 picture a shared /join?source= link unfurls with:
 * the interlock emblem, "You were introduced." and the introducer's SHORT
 * wallet, the provable hook, and the approved door line. The R-CARDS
 * machinery reused (satori + resvg + the embedded house fonts); the R-CARDS
 * ink (identical in every context); the ARTIFACT_TYPOGRAPHY_FLOORS law
 * (feed format → floor 20, content ≥23, headline ≥56). No QR — the unfurl
 * IS the link. Facts: the short wallet only — never a name, never invented;
 * an unresolvable source never reaches this painter (the route 302s).
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { SYN_MARK_DATA_URI } from "./synMark";
// The site's own faces, bundled as raw bytes (build.mjs `.ttf` binary
// loader). OFL 1.1 — see ../receiptcard/fonts/OFL-NOTICE.md.
import plexMonoRegular from "../receiptcard/fonts/IBMPlexMono-Regular.ttf";
import plexMonoSemiBold from "../receiptcard/fonts/IBMPlexMono-SemiBold.ttf";
import workSansRegular from "../receiptcard/fonts/WorkSans-Regular.ttf";
import workSansSemiBold from "../receiptcard/fonts/WorkSans-SemiBold.ttf";

export const CARD_W = 1200;
export const CARD_H = 630;
/** The proven share-card ceiling (WhatsApp-safe). */
export const CARD_MAX_BYTES = 300_000;

const BG = "#090E1A";
const FG = "#E1E7EF";
const MUTED = "#7F8EA3";
const GOLD = "#F7BF3B";
const BORDER = "#25344B";

const MONO = "IBM Plex Mono";
const SANS = "Work Sans";

const FONTS = [
  { name: MONO, data: toArrayBuffer(plexMonoRegular), weight: 400 as const, style: "normal" as const },
  { name: MONO, data: toArrayBuffer(plexMonoSemiBold), weight: 600 as const, style: "normal" as const },
  { name: SANS, data: toArrayBuffer(workSansRegular), weight: 400 as const, style: "normal" as const },
  { name: SANS, data: toArrayBuffer(workSansSemiBold), weight: 600 as const, style: "normal" as const },
];

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

interface SatoriNode {
  type: string;
  props: {
    src?: string;
    width?: number;
    height?: number;
    style?: Record<string, string | number>;
    children?: (SatoriNode | string)[] | SatoriNode | string;
  };
}

function el(
  style: Record<string, string | number>,
  children: (SatoriNode | string)[] | string,
): SatoriNode {
  // satori requires explicit display on every multi-child node.
  return {
    type: "div",
    props: {
      style: { display: "flex", ...style },
      children: Array.isArray(children) ? children : [children],
    },
  };
}

/** The real emblem — an <img> with a data URI (satori-reliable). */
function mark(width: number): SatoriNode {
  const height = Math.round((width * 477) / 598);
  return { type: "img", props: { src: SYN_MARK_DATA_URI, width, height, style: { display: "flex" } } };
}

function buildCard(shortWallet: string): SatoriNode {
  return el(
    {
      width: CARD_W,
      height: CARD_H,
      flexDirection: "column",
      backgroundColor: BG,
      color: FG,
      border: `2px solid ${BORDER}`,
      fontFamily: SANS,
      padding: "48px 64px 44px",
    },
    [
      el({ flexDirection: "row", alignItems: "center", gap: 22 }, [
        mark(68),
        el({ flexDirection: "column" }, [
          el(
            { fontFamily: MONO, fontSize: 30, fontWeight: 600, letterSpacing: 5.4, color: FG },
            "THE SYNDICATE",
          ),
          el(
            { fontFamily: MONO, fontSize: 20, fontWeight: 600, letterSpacing: 2, color: MUTED, marginTop: 4 },
            "ON-CHAIN MEMBERSHIP PROTOCOL",
          ),
        ]),
      ]),
      el(
        { fontFamily: MONO, fontSize: 60, fontWeight: 600, color: GOLD, marginTop: 52 },
        "You were introduced.",
      ),
      el({ fontSize: 30, color: FG, marginTop: 16, flexDirection: "row", flexWrap: "wrap" }, [
        el({ fontFamily: MONO, color: FG }, `by ${shortWallet}`),
        el({ color: MUTED, marginLeft: 12 }, "— recorded on-chain when you take your seat."),
      ]),
      el(
        { fontSize: 25, color: MUTED, marginTop: 18 },
        "Every purchase is a verifiable receipt. Proof, not promises.",
      ),
      el(
        { flexDirection: "row", alignItems: "baseline", marginTop: "auto" },
        [
          el(
            { fontFamily: MONO, fontSize: 26, fontWeight: 600, letterSpacing: 3.4, color: GOLD },
            "SEATS ARE OPEN — SEE HOW MEMBERSHIP WORKS",
          ),
          el(
            { fontFamily: MONO, fontSize: 21, color: MUTED, marginLeft: "auto" },
            "thesyndicate.money",
          ),
        ],
      ),
    ],
  );
}

/** Paint the invitee card — or null (over-ceiling / render failure; the
 * route falls back to the generic image, never a broken unfurl). */
export async function paintJoinCard(shortWallet: string): Promise<Buffer | null> {
  try {
    const svg = await satori(buildCard(shortWallet) as unknown as Parameters<typeof satori>[0], {
      width: CARD_W,
      height: CARD_H,
      fonts: FONTS,
    });
    const png = new Resvg(svg, { fitTo: { mode: "width", value: CARD_W } }).render().asPng();
    const buf = Buffer.from(png);
    return buf.length <= CARD_MAX_BYTES ? buf : null;
  } catch {
    return null;
  }
}
