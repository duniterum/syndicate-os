/**
 * The invitee's unfurl card — K2 (founder-approved mockup, 2026-07-20).
 * ---------------------------------------------------------------------------
 * Paints the 1200×630 picture a shared /join?source= link unfurls with:
 * the interlock emblem, "You were introduced." and the introducer's SHORT
 * wallet, the provable hook, and the approved door line. The R-CARDS
 * machinery reused (satori + resvg + the embedded house fonts); the R-CARDS
 * ink (identical in every context); the ARTIFACT_TYPOGRAPHY_FLOORS law
 * (feed format → floor 20, content ≥23, headline ≥56). The INVITATION carries
 * no QR (the unfurl IS the link); the three MEMBER faces do — see JOIN_CARD_FACES.
 * Facts: the short wallet only — never a name, never invented;
 * an unresolvable source never reaches this painter (the route 302s).
 */

import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { SYN_MARK_DATA_URI } from "./synMark";
import { STORY_FINAL_SEAT } from "../lib/protocol/chapters";
import { injectQr, quietZonePad } from "../lib/cards/qrGrid";
import type { IntroducerFacts } from "./introducerRead";
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

/**
 * THE FACES (founder GO 2026-08-03 — «je veux chaque image»).
 * A link preview renders what the LINK declares, and the link is ours; so each
 * artifact's share declares its own face. All four are 1200×630, the ONE shape
 * every preview network renders (X · Facebook · LinkedIn · WhatsApp · Telegram,
 * checked in their specs the same day — none previews a portrait image, and X's
 * square `summary` card is a SMALL thumbnail, so a square face would shrink the
 * card rather than honour it). The vertical and square artifacts keep their own
 * shape where it is actually used: the download.
 *
 * Each member face mirrors, word for word, the card the member downloads —
 * join-card.guard reconciles the wording against the studio source, because a
 * preview that contradicts his own picture is worse than no preview.
 *
 * THE MEMBER FACES CARRY A QR; the invitation does not. (This block first said
 * "No QR on any face — the unfurl IS the link", inherited from the header
 * above, and the founder refused it the same day: a card is screenshot and
 * re-posted as an image, and at that moment the link is gone. The invitation
 * keeps its founder-approved no-QR layout.)
 */
export const JOIN_CARD_FACES = ["invite", "standing", "seat", "record"] as const;
export type JoinCardFace = (typeof JOIN_CARD_FACES)[number];

/** The requested face, or the invitation — an unknown value never paints. */
export function faceFromParam(raw: unknown): JoinCardFace {
  return typeof raw === "string" && (JOIN_CARD_FACES as readonly string[]).includes(raw)
    ? (raw as JoinCardFace)
    : "invite";
}

/** The masthead every face opens with (the approved lockup + register). */
function masthead(): SatoriNode {
  return el({ flexDirection: "row", alignItems: "center", gap: 22 }, [
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
  ]);
}

/**
 * THE QR (founder order 2026-08-03: «il y a plus les qr codes, ajoutes»).
 *
 * The inherited painter header said «No QR — the unfurl IS the link», and I
 * carried that onto the new faces. He was right to refuse it: a card gets
 * SCREENSHOT and re-posted as an image, and at that moment the link is gone —
 * the QR is the only way back. It is also what parity demands, since every
 * artifact he downloads carries one.
 *
 * Geometry MIRRORS the studio artifact (CardOg): the code sits bottom-LEFT with
 * the verify lines to its right — not a right-hand column, which would be a
 * different card. 190px box, a little over the download's 166: a preview is
 * read small in a feed, so the modules need the extra room to survive a
 * screenshot. The quiet zone is the injector's `pad`.
 */
const QR_BOX = 190;
const QR_X = 64; // the shell's left padding
const QR_Y = CARD_H - 44 - QR_BOX; // sits on the shell's bottom padding
/**
 * THE BORDER OFFSET, measured not assumed (2026-08-03). satori resolves an
 * absolutely-positioned child against the PADDING box, so the plate declared at
 * left:64 renders at x=66 on a card with a 2px border — while `injectQr` writes
 * into the finished SVG's raw coordinates. Without this the grid sat 2px up and
 * left of its own white plate, eating the quiet zone on two sides. Caught by
 * reading the rendered pixels back; nothing in the source could have shown it.
 */
const CARD_BORDER = 2;
/** What the verify column must clear to sit beside the code. */
const QR_GUTTER = QR_BOX + 28;

/** The reserved white box — satori lays it out, the grid lands in it after. */
function qrPlate(): SatoriNode {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        position: "absolute",
        left: QR_X,
        top: QR_Y,
        width: QR_BOX,
        height: QR_BOX,
        backgroundColor: "#ffffff",
        borderRadius: 8,
      },
      children: [],
    },
  };
}

/** The seal every MEMBER face closes with — indented past the code, the
 * artifact's own verify line then the house domain (the invitation keeps its
 * own door line and its own layout; that copy is approved and untouched). */
function verifySeal(left: string): SatoriNode {
  return el(
    { flexDirection: "row", alignItems: "flex-end", marginLeft: QR_GUTTER, height: QR_BOX },
    [
      el(
        {
          flexDirection: "column",
          fontFamily: MONO,
          fontSize: 23,
          fontWeight: 600,
          letterSpacing: 3,
          color: MUTED,
        },
        [el({}, "SCAN — JOIN THROUGH MY INTRODUCTION"), el({ marginTop: 10 }, left)],
      ),
      // No domain on the right: the STANDING face already prints it on its
      // source line, and the studio artifacts carry it exactly once. Printing
      // it twice, 200px apart, in the same muted mono, was a parity break the
      // design pass caught (2026-08-03).
    ],
  );
}

/**
 * The member faces' frame: masthead pinned top, seal pinned bottom, and the
 * message CENTERED in the space between.
 *
 * The centering is not decoration: laid out top-down, the leftover canvas
 * collected at the bottom and the card read as unfinished. Caught by LOOKING at
 * the first painted PNGs — no byte count or dimension check could have said it.
 * `position: relative` anchors the reserved QR plate the injector fills after.
 */
function shell(content: SatoriNode[], seal: SatoriNode): SatoriNode {
  return el(
    {
      position: "relative",
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
      masthead(),
      el({ flexDirection: "column", flexGrow: 1, justifyContent: "center" }, content),
      seal,
      qrPlate(),
    ],
  );
}

/** STANDING — the twin of the studio's CardOg (1200×630). */
function buildStanding(f: IntroducerFacts): SatoriNode | null {
  /**
   * NO SEAT IS NOT NO CARD (founder correction, 2026-08-03: «un non member —
   * pas de seat — se logue, il a aussi un lien de referrer, doit avoir du SYN
   * acquis peut-être sur le DEX, et il peut referrer»).
   *
   * The chain agrees and the spec says it twice: MembershipSaleV3 reverts only
   * on `SYN.balanceOf(sourceWallet) == 0`; the error is NAMED
   * ReferrerNotSeated but «ne vérifie PAS le siège. Il vérifie le solde»
   * (SPEC_REFERRAL_SYSTEM §262, §436). A signed-in holder who bought SYN on the
   * DEX is a legitimate referrer with no seat at all.
   *
   * This face used to return null for him — so his every share fell back to the
   * invitation while the card he DOWNLOADS renders fine with its fallback
   * headline. That is the "sixteen doors, one picture" defect, reopened for an
   * entire class of referrer. The headline now degrades exactly as the studio's
   * CardOg does, word for word.
   *
   * Reaching this builder already means the source is ACTIVE (introducerFacts'
   * status gate), so there is always a real referrer behind it.
   */
  return shell([
    el(
      { fontFamily: MONO, fontSize: 58, fontWeight: 600, color: GOLD },
      f.seatLineFull ?? "An on-chain introduction record",
    ),
    el({ fontSize: 32, color: FG, marginTop: 14 }, f.rungLine),
    el(
      { fontFamily: MONO, fontSize: 23, color: MUTED, marginTop: 14 },
      `source ${f.shortWallet} · thesyndicate.money`,
    ),
  ], verifySeal("DON'T TRUST — VERIFY"));
}

/** SEAT — the twin of the studio's CardVanityOg. The number carries the
 * majesty through SCALE: the painter's bundled faces are the house mono and
 * sans, so the studio artifact's display serif (Instrument Serif) has no
 * server-side equivalent — stated, never silently approximated. */
function buildSeat(f: IntroducerFacts): SatoriNode | null {
  // The client refuses to mount the collectible outside 1..STORY_FINAL_SEAT
  // (ReferralToolsPanel); without the same bound the sentence prints a NEGATIVE
  // percentage and an ordinal past the story. Mirrored here.
  if (f.seatNumber === null || f.chapterChip === null) return null;
  if (f.seatNumber < 1 || f.seatNumber > STORY_FINAL_SEAT) return null;
  const pct = (
    Math.round((1 - f.seatNumber / STORY_FINAL_SEAT) * 1e6) / 1e4
  ).toString();
  return shell([
    el(
      { fontFamily: MONO, fontSize: 112, fontWeight: 600, color: GOLD },
      `Seat #${f.seatNumber.toLocaleString("en-US")}`,
    ),
    el(
      { fontFamily: MONO, fontSize: 26, fontWeight: 600, letterSpacing: 4, color: FG, marginTop: 16 },
      f.chapterChip.toUpperCase(),
    ),
    el(
      { fontSize: 27, color: MUTED, marginTop: 16 },
      `Seated before ${pct}% of the story — the ${ordinal(f.seatNumber)} of ${STORY_FINAL_SEAT.toLocaleString("en-US")} seats, written on-chain, forever.`,
    ),
  ], verifySeal("DON'T TRUST — VERIFY"));
}

/** RECORD — the twin of the studio's RecordCard. Mounts only on a REAL record
 * (recordLine null → null → the route falls back), never an empty boast. */
function buildRecord(f: IntroducerFacts): SatoriNode | null {
  if (f.recordLine === null) return null;
  return shell([
    el(
      { fontFamily: MONO, fontSize: 66, fontWeight: 600, color: GOLD },
      f.recordLine,
    ),
    el({ fontSize: 30, color: FG, marginTop: 12 }, f.rungLine),
    el(
      { fontSize: 25, color: MUTED, marginTop: 12 },
      "Every introduction is an on-chain record — verify it, don't trust it.",
    ),
  ], verifySeal("DON'T TRUST — VERIFY"));
}

/** English ordinal — the studio artifact's own form, mirrored. */
function ordinal(n: number): string {
  const t = n % 100;
  if (t >= 11 && t <= 13) return `${n.toLocaleString("en-US")}th`;
  const s = n % 10 === 1 ? "st" : n % 10 === 2 ? "nd" : n % 10 === 3 ? "rd" : "th";
  return `${n.toLocaleString("en-US")}${s}`;
}

// M2-v2 (2026-08-03): the "by" row carries the introducer's LIVING IDENTITY
// when the spine resolves it — "by Seat #3 · Chapter I — 0x123…abcd" — and
// degrades to the plain short-wallet row when seatLine is null (fail closed,
// never an invented seat). Same approved register, one richer fact.
function buildCard(shortWallet: string, seatLine: string | null): SatoriNode {
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
      // The SAME lockup as every other face. It was inlined here until
      // 2026-08-03: a review caught that a mark-size or tracking change would
      // have silently applied to three faces and skipped the invitation — the
      // one every un-`?card=`'d link and every fallback still serves.
      masthead(),
      el(
        { fontFamily: MONO, fontSize: 60, fontWeight: 600, color: GOLD, marginTop: 52 },
        "You were introduced.",
      ),
      el({ fontSize: 30, color: FG, marginTop: 16, flexDirection: "row", flexWrap: "wrap" }, [
        el(
          { fontFamily: MONO, color: FG },
          seatLine !== null ? `by ${seatLine} — ${shortWallet}` : `by ${shortWallet}`,
        ),
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

/** Paint a face — or null (facts unresolved / over-ceiling / render failure).
 * Null is never a broken unfurl: the route falls back to the invitation face,
 * and the invitation's own null falls to the generic site image. */
export async function paintJoinCard(
  facts: IntroducerFacts,
  face: JoinCardFace = "invite",
  /** The introducer's own join link — what the member faces' QR carries, so a
   * SCREENSHOT of the card still leads back to him. Absent → no QR is drawn
   * (fail closed: an empty plate would be worse than none). */
  joinLink: string | null = null,
): Promise<Buffer | null> {
  const node =
    face === "standing"
      ? buildStanding(facts)
      : face === "seat"
        ? buildSeat(facts)
        : face === "record"
          ? buildRecord(facts)
          : buildCard(facts.shortWallet, facts.seatLine);
  if (node === null) return null;
  try {
    let svg = await satori(node as unknown as Parameters<typeof satori>[0], {
      width: CARD_W,
      height: CARD_H,
      fonts: FONTS,
    });
    // The invitation keeps its approved no-QR layout; the member faces get the
    // grid injected into the plate their shell reserved.
    svg = injectQr(
      svg,
      face === "invite" || joinLink === null
        ? null
        : {
            x: QR_X + CARD_BORDER,
            y: QR_Y + CARD_BORDER,
            box: QR_BOX,
            // Four modules, computed from THIS link's density — never a
            // hand-picked pixel pad.
            pad: quietZonePad(QR_BOX, joinLink),
            url: joinLink,
          },
    );
    const png = new Resvg(svg, { fitTo: { mode: "width", value: CARD_W } }).render().asPng();
    const buf = Buffer.from(png);
    return buf.length <= CARD_MAX_BYTES ? buf : null;
  } catch {
    return null;
  }
}
