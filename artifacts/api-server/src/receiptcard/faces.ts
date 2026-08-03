/**
 * receiptcard/faces.ts — the four founder-approved faces (mockup approved
 * 2026-07-20) as satori node trees.
 * ---------------------------------------------------------------------------
 * FIXED INK, by design: the card renders on the PLATFORMS' backgrounds
 * (X, WhatsApp, Telegram…), never in the site's theme — one look, the
 * command room (near-black + gold), exactly the proven share card's. The
 * hex values below are the house tokens' dark values, resolved once
 * (index.css: card 222 47% 7% · foreground 213 31% 91% · muted
 * 215.4 16.3% 56.9% · gold 42 92% 60% · border ≈ 216 34% 22%).
 *
 * THE VISIBILITY LAW (TIER-0): the real figures are NEVER hidden — the
 * amount is already public in the very transaction the card cites.
 * Every string arrives from cardFacts (the spine's mirrored formatters);
 * this file lays out, never computes.
 *
 * All text lives inside the 90px central safe zone (the share standard).
 */

import type { ReceiptCardFacts } from "./cardFacts";

export const CARD_W = 1200;
export const CARD_H = 630;

const BG = "#090E1A";
const FG = "#E1E7EF";
const MUTED = "#7F8EA3";
const GOLD = "#F7BF3B";
const GOLD_40 = "rgba(247,191,59,0.4)";
const GOLD_10 = "rgba(247,191,59,0.1)";
const BORDER = "#25344B";

const MONO = "IBM Plex Mono";
const SANS = "Work Sans";

// The QR spot type and the quiet-zone rule are ONE declaration each, in
// lib/cards/qrGrid — the join card and this file both reserve a plate for the
// same injector, so a field added there can never be silently missed here
// (2026-08-03).
import { quietZonePad, type QrSpot } from "../lib/cards/qrGrid";
export type { QrSpot };

export interface FaceSpec {
  readonly node: SatoriNode;
  readonly qr: QrSpot | null;
}

/** Minimal satori element shape (object form — no JSX, no react). */
export interface SatoriNode {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: (SatoriNode | string)[] | SatoriNode | string;
  };
}

function el(
  style: Record<string, string | number>,
  children: (SatoriNode | string)[] | string,
): SatoriNode {
  // satori requires explicit display on every multi-child node — flex is
  // the base law here; callers override direction/alignment as needed.
  return {
    type: "div",
    props: {
      style: { display: "flex", ...style },
      children: Array.isArray(children) ? children : [children],
    },
  };
}

const row = (extra: Record<string, string | number>, children: (SatoriNode | string)[]) =>
  el({ display: "flex", flexDirection: "row", ...extra }, children);
const col = (extra: Record<string, string | number>, children: (SatoriNode | string)[]) =>
  el({ display: "flex", flexDirection: "column", ...extra }, children);

/** The masthead every face carries — the issuer's mark + the protocol name. */
function masthead(): SatoriNode {
  return row({ alignItems: "center", gap: 16 }, [
    el(
      {
        width: 48,
        height: 48,
        flexShrink: 0,
        border: `2px solid ${GOLD}`,
        borderRadius: 999,
        alignItems: "center",
        justifyContent: "center",
        color: GOLD,
        fontFamily: MONO,
        fontSize: 19,
        fontWeight: 600,
      },
      "SS",
    ),
    col({}, [
      el(
        { fontFamily: MONO, fontSize: 24, fontWeight: 600, letterSpacing: 5.8, color: FG },
        "THE SYNDICATE",
      ),
      el(
        { fontFamily: MONO, fontSize: 14, fontWeight: 600, letterSpacing: 2.5, color: MUTED },
        "ON-CHAIN MEMBERSHIP PROTOCOL · Avalanche C-Chain (43114)",
      ),
    ]),
  ]);
}

function chip(text: string): SatoriNode {
  return el(
    {
      border: `1px solid ${GOLD_40}`,
      backgroundColor: GOLD_10,
      color: GOLD,
      borderRadius: 999,
      fontSize: 20,
      padding: "5px 16px",
      flexShrink: 0,
      whiteSpace: "nowrap",
    },
    text,
  );
}

function root(children: (SatoriNode | string)[]): SatoriNode {
  return el(
    {
      width: CARD_W,
      height: CARD_H,
      display: "flex",
      backgroundColor: BG,
      color: FG,
      border: `2px solid ${BORDER}`,
      fontFamily: SANS,
      position: "relative",
    },
    children,
  );
}

/** The shared QR geometry (faces 1 + 4): white box, right side, centered. */
const QR_BOX = 262;
// The quiet zone is COMPUTED from the payload, not guessed: the hand-picked
// 16px measured 2.85 modules on a real explorer url where the QR standard asks
// FOUR (2026-08-03, the same defect the join card was fixed for — this surface
// already ships to members, so it gets the fix too).
const qrPad = (url: string) => quietZonePad(QR_BOX, url);
const QR_X = CARD_W - 90 - QR_BOX; // 848
const QR_Y = 140;
// satori resolves an absolute child against the PADDING box, so a plate on a
// 2px-bordered card renders 2px in — while injectQr writes raw SVG coordinates.
// The join card learned this by reading its pixels back; the receipt card has
// the same shell and was missing it (2026-08-03), which is why its quiet-zone
// fix landed at 3.35 modules on two sides instead of 4.
const CARD_BORDER = 2;

function qrColumn(caption: string, sub: string | null): SatoriNode[] {
  const nodes: SatoriNode[] = [
    el(
      {
        position: "absolute",
        left: QR_X,
        top: QR_Y,
        width: QR_BOX,
        height: QR_BOX,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        border: `1px solid ${BORDER}`,
        display: "flex",
      },
      [],
    ),
    el(
      {
        position: "absolute",
        left: QR_X,
        top: QR_Y + QR_BOX + 14,
        width: QR_BOX,
        display: "flex",
        justifyContent: "center",
        fontFamily: MONO,
        fontSize: 19,
        fontWeight: 600,
        letterSpacing: 3,
        color: FG,
      },
      caption,
    ),
  ];
  if (sub !== null) {
    nodes.push(
      el(
        {
          position: "absolute",
          left: QR_X,
          top: QR_Y + QR_BOX + 46,
          width: QR_BOX,
          display: "flex",
          justifyContent: "center",
          fontSize: 17,
          color: MUTED,
        },
        sub,
      ),
    );
  }
  return nodes;
}

/** Face 1 · THE SEAT — the default face (the bare link). */
function faceSeat(f: ReceiptCardFacts): FaceSpec {
  const moneyLine = [
    ...(f.paidFirst !== null ? [`Referral · paid first ${f.paidFirst}`] : []),
    ...(f.remainderLead !== null
      ? [`${f.paidFirst !== null ? "— " : ""}${f.remainderLead} ${f.splits.map(([k, v]) => `${k} ${v}`).join(" · ")}`]
      : []),
  ].join(" ");
  return {
    node: root([
      col({ padding: "56px 90px", width: CARD_W - QR_BOX - 90 - 40 }, [
        masthead(),
        row({ alignItems: "baseline", gap: 24, marginTop: 34, flexWrap: "wrap" }, [
          el(
            { fontFamily: MONO, fontSize: 64, fontWeight: 600, color: FG, flexShrink: 0, whiteSpace: "nowrap" },
            f.seatDisplay,
          ),
          ...(f.chapterChip !== null ? [chip(f.chapterChip)] : []),
        ]),
        row({ alignItems: "baseline", gap: 16, marginTop: 26 }, [
          el({ fontFamily: MONO, fontSize: 16, fontWeight: 600, letterSpacing: 2.2, color: MUTED }, "TOTAL PAID"),
          el({ fontFamily: MONO, fontSize: 34, fontWeight: 600, color: FG }, f.totalValue),
        ]),
        ...(moneyLine.length > 0
          ? [el({ fontSize: 18, color: MUTED, marginTop: 10, lineHeight: 1.4 }, moneyLine)]
          : []),
        el({ fontSize: 18, color: MUTED, marginTop: 20 }, f.sealedLine),
        el(
          { fontFamily: MONO, fontSize: 16, color: MUTED, marginTop: 8 },
          `Verify tx ${f.shortTx} · thesyndicate.money`,
        ),
        el(
          { fontFamily: MONO, fontSize: 19, fontWeight: 600, letterSpacing: 4.2, color: GOLD, marginTop: 20 },
          "ONE WALLET · ONE SEAT",
        ),
      ]),
      ...qrColumn("SCAN TO VERIFY", "the transaction, on-chain"),
    ]),
    qr: { x: QR_X + CARD_BORDER, y: QR_Y + CARD_BORDER, box: QR_BOX, pad: qrPad(f.explorerTxUrl), url: f.explorerTxUrl },
  };
}

/** Face 2 · WHERE YOUR MONEY WENT. */
function faceMoney(f: ReceiptCardFacts): FaceSpec {
  const moneyRow = (k: string, v: string, big = false) =>
    row({ alignItems: "baseline", marginTop: 10, maxWidth: 760 }, [
      el({ fontFamily: MONO, fontSize: 26, color: MUTED }, k),
      el(
        { fontFamily: MONO, fontSize: big ? 34 : 26, fontWeight: 600, color: FG, marginLeft: "auto" },
        v,
      ),
    ]);
  return {
    node: root([
      col({ padding: "56px 90px", width: "100%" }, [
        masthead(),
        el(
          { fontFamily: MONO, fontSize: 20, fontWeight: 600, letterSpacing: 3.6, color: GOLD, marginTop: 30 },
          "WHERE YOUR MONEY WENT",
        ),
        el(
          { fontSize: 17, color: MUTED, marginTop: 2 },
          `— in the buyer’s own transaction · ${f.coordinate}`,
        ),
        moneyRow("TOTAL PAID", f.totalValue, true),
        ...(f.paidFirst !== null ? [moneyRow("Referral · paid first", f.paidFirst)] : []),
        ...f.splits.map(([k, v]) => moneyRow(k, v)),
        el(
          { fontFamily: MONO, fontSize: 16, color: MUTED, marginTop: 24 },
          `Verify tx ${f.shortTx} · thesyndicate.money`,
        ),
        el(
          { fontFamily: MONO, fontSize: 19, fontWeight: 600, letterSpacing: 4.2, color: GOLD, marginTop: "auto" },
          "ONE WALLET · ONE SEAT",
        ),
      ]),
    ]),
    qr: null,
  };
}

/** Face 3 · THE STORY. */
function faceStory(f: ReceiptCardFacts): FaceSpec {
  return {
    node: root([
      col({ padding: "56px 90px", width: "100%" }, [
        masthead(),
        el({ fontFamily: MONO, fontSize: 54, fontWeight: 600, color: FG, marginTop: 36 }, f.coordinate),
        el(
          {
            borderLeft: `3px solid ${GOLD_40}`,
            paddingLeft: 18,
            fontSize: 24,
            lineHeight: 1.45,
            color: FG,
            marginTop: 26,
            maxWidth: 900,
            display: "flex",
          },
          `“${f.doctrine}”`,
        ),
        el(
          { fontSize: 18, color: MUTED, marginTop: 24 },
          `${f.synLine !== null ? `${f.synLine} · ` : ""}${f.blockDateLine}`,
        ),
        el(
          { fontFamily: MONO, fontSize: 16, color: MUTED, marginTop: 8 },
          `Verify tx ${f.shortTx} · thesyndicate.money`,
        ),
        el(
          { fontFamily: MONO, fontSize: 19, fontWeight: 600, letterSpacing: 4.2, color: GOLD, marginTop: "auto" },
          "ONE WALLET · ONE SEAT",
        ),
      ]),
    ]),
    qr: null,
  };
}

/** Face 4 · THE PROOF. */
function faceProof(f: ReceiptCardFacts): FaceSpec {
  return {
    node: root([
      col({ padding: "56px 90px", width: CARD_W - QR_BOX - 90 - 40 }, [
        masthead(),
        el(
          { fontFamily: MONO, fontSize: 20, fontWeight: 600, letterSpacing: 4.4, color: GOLD, marginTop: 34 },
          "SEALED BY THE PROTOCOL",
        ),
        el({ fontFamily: MONO, fontSize: 34, fontWeight: 600, color: FG, marginTop: 16 }, f.blockDateLine),
        el({ fontSize: 18, color: MUTED, marginTop: 14 }, "the transaction hash is the signature"),
        el({ fontFamily: MONO, fontSize: 22, color: MUTED, marginTop: 10 }, f.shortTx),
        el(
          { fontFamily: MONO, fontSize: 19, fontWeight: 600, letterSpacing: 4.2, color: GOLD, marginTop: 24 },
          "DON’T TRUST — VERIFY",
        ),
      ]),
      ...qrColumn("SCAN TO VERIFY", null),
    ]),
    qr: { x: QR_X + CARD_BORDER, y: QR_Y + CARD_BORDER, box: QR_BOX, pad: qrPad(f.explorerTxUrl), url: f.explorerTxUrl },
  };
}

export const FACE_COUNT = 4;

/** The face builder — f is 1..FACE_COUNT (validated by the route). */
export function buildFace(face: number, facts: ReceiptCardFacts): FaceSpec {
  switch (face) {
    case 2:
      return faceMoney(facts);
    case 3:
      return faceStory(facts);
    case 4:
      return faceProof(facts);
    default:
      return faceSeat(facts);
  }
}
