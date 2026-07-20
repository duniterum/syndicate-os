// components/referral/referrerKit.tsx — K1 · THE ARSENAL's artifacts (v2).
//
// The referrer's share artifacts, rendered CLIENT-SIDE at export dimensions
// (the proven ReceiptShareCard path: DOM node → html-to-image → canvas →
// PNG). Every artifact is FIXED INK — the R-CARDS canon: a share artifact
// renders identically whatever theme the member browses in. Figures are
// chain-proven only (seat, chapter, durable introductions, rung) — never a
// money projection, never a gain promise.
//
// V2 (founder defect report, 2026-07-20 — the K1-FIX lesson): ① the REAL
// brand mark — the interlock emblem (the fixed brand gold of
// BRAND_GUIDELINES) inlined as SVG paths, never a placeholder monogram; ② every layout
// re-sized so NOTHING clips (the 2-line seat coordinate is the design case,
// not an accident) — the harness FIT PROBE (scroll vs client bounds on every
// artifact) is the gate for this file's geometry, not eyeballs.

import type { CSSProperties, ReactNode } from "react";
import QRCode from "react-qr-code";

// The R-CARDS ink — the server card palette, resolved constants (identical
// export in both themes; the token layer is theme-bound by design, so a
// theme-independent artifact cannot read it).
const INK_BG = "#090E1A"; // no-raw-color-allow: share artifacts are fixed-ink by canon (R-CARDS) — identical export in both themes
const INK_FG = "#E1E7EF"; // no-raw-color-allow: share artifacts are fixed-ink by canon (R-CARDS)
const INK_MUTED = "#7F8EA3"; // no-raw-color-allow: share artifacts are fixed-ink by canon (R-CARDS)
const INK_GOLD = "#F7BF3B"; // no-raw-color-allow: share artifacts are fixed-ink by canon (R-CARDS)
const INK_BORDER = "#25344B"; // no-raw-color-allow: share artifacts are fixed-ink by canon (R-CARDS)
const BRAND_GOLD = "#E3A92B"; // no-raw-color-allow: the fixed brand gold of the interlock emblem (BRAND_GUIDELINES law)

/** Chain-proven facts only — assembled by the panel from the member's own
 * session reads; null fields render as absent, never invented. */
export interface KitFacts {
  /** "Seat #1 · Chapter I — Genesis Signal", or null (connected, no seat). */
  seatLine: string | null;
  /** "2 durable introductions · Emerging Connector", or null. */
  standingLine: string | null;
  /** "14 members introduced", or null when the record is empty/unread —
   * the record card renders only when this exists (never an empty boast). */
  recordLine: string | null;
  /** ADR-003 short form of the member's own wallet ("0x88e…dd73"). */
  shortWallet: string;
  /** The member's permanent introduction link (canonical, untagged). */
  joinLink: string;
}

/** The one channel-tag composer for kit artifacts (&via — the same tag
 * vocabulary the Channels tab counts; never a per-visitor tag). */
export function withVia(joinLink: string, tag: string): string {
  return `${joinLink}&via=${tag}`;
}

/** THE REAL MARK — the interlock emblem, inlined from the approved brand set
 * (origin brand-v2-syndicate-interlock/syn-mark-gold.svg, harvested to
 * public/syn-mark-gold.svg). Inline SVG paths: export-safe (no fetch), the
 * brand gold baked in. viewBox 2 25 598 477 → aspect ≈ 1.254 (w/h). */
export function SynMark({ width }: { width: number }) {
  const height = Math.round((width * 477) / 598);
  return (
    <svg
      width={width}
      height={height}
      viewBox="2 25 598 477"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: "block" }}
      aria-hidden="true"
    >
      <g transform="translate(0,554) scale(0.1,-0.1)" fill={BRAND_GOLD}>
        <path d="M1765 5270 l-260 -7 -140 -40 c-166 -48 -204 -62 -395 -152 -55 -26 -119 -65 -184 -110 -120 -83 -315 -271 -387 -371 -63 -88 -119 -174 -119 -183 0 -5 -11 -23 -25 -41 -14 -18 -25 -36 -25 -40 0 -4 -13 -35 -30 -69 -60 -126 -111 -275 -130 -377 -10 -58 -26 -139 -35 -180 -15 -67 -16 -132 -10 -620 3 -300 6 -651 6 -780 1 -354 32 -509 155 -755 113 -228 166 -310 276 -431 196 -216 275 -274 558 -415 174 -86 180 -88 361 -132 l144 -35 607 -6 c443 -4 614 -3 633 6 39 18 48 64 42 217 -5 147 -17 191 -73 263 -50 63 -148 137 -218 163 l-66 25 -451 0 c-422 0 -456 1 -531 21 -173 44 -424 197 -536 326 -123 143 -210 316 -236 471 -17 98 -13 123 22 140 27 13 1014 7 1038 -6 22 -12 28 -24 60 -126 17 -55 55 -116 113 -180 71 -78 248 -179 346 -198 92 -17 1465 -16 1525 1 62 18 163 81 241 151 52 46 76 78 112 147 55 107 71 184 65 303 -7 116 -37 180 -128 270 -77 77 -138 112 -238 135 -69 17 -78 17 -160 1 -145 -29 -267 -111 -352 -238 -60 -90 -72 -143 -79 -356 -5 -168 -8 -185 -26 -198 -16 -12 -57 -14 -222 -12 -178 3 -204 5 -220 21 -15 15 -18 40 -20 185 -3 173 -9 203 -51 287 -73 145 -174 243 -332 318 l-85 41 -420 7 c-362 6 -426 9 -465 24 -25 9 -65 24 -90 32 -184 61 -385 201 -494 346 -66 87 -123 206 -137 287 -18 101 -16 326 4 420 17 81 86 234 142 315 58 83 171 200 238 248 118 82 304 166 419 187 28 6 255 10 508 10 355 0 467 3 502 14 98 29 237 151 281 246 18 38 21 70 25 215 4 159 3 172 -16 195 l-20 25 -379 1 c-208 0 -495 -2 -638 -6z" />
        <path d="M3220 5253 c-25 -21 -25 -22 -25 -190 0 -214 9 -244 103 -340 45 -45 90 -80 136 -103 l70 -35 510 -5 511 -5 65 -28 c36 -16 80 -33 97 -38 61 -18 194 -96 256 -150 72 -62 201 -203 230 -251 11 -18 27 -44 36 -58 25 -40 82 -181 92 -229 5 -25 10 -81 11 -124 2 -126 42 -117 -501 -116 -251 0 -494 4 -539 8 -98 8 -108 16 -117 100 -10 83 -21 112 -76 196 -98 150 -239 253 -384 280 -95 17 -1291 31 -1391 15 -47 -7 -98 -25 -162 -58 -127 -64 -203 -139 -259 -255 -54 -111 -65 -154 -65 -252 0 -110 14 -159 68 -248 57 -96 130 -161 232 -206 70 -31 86 -34 177 -35 95 0 104 1 178 37 110 52 209 154 269 273 l43 87 5 202 c5 203 8 220 45 247 6 4 87 8 182 8 184 0 197 -3 208 -53 2 -12 6 -107 8 -212 l3 -190 34 -70 c90 -186 181 -273 382 -366 l93 -43 450 -7 450 -7 84 -31 c258 -96 429 -239 533 -448 41 -80 88 -286 88 -381 0 -82 -47 -286 -85 -372 -48 -109 -160 -267 -233 -328 -143 -120 -191 -153 -285 -195 -167 -74 -191 -77 -712 -77 -431 0 -459 -1 -513 -20 -110 -39 -207 -122 -260 -225 l-37 -70 0 -167 c0 -104 4 -171 11 -178 7 -7 221 -11 665 -13 613 -2 657 -1 699 16 44 18 71 27 210 69 68 20 305 135 375 181 253 168 425 343 553 562 58 98 128 237 142 280 7 22 21 60 32 84 11 24 26 86 34 137 15 101 28 144 44 144 7 0 10 281 10 865 0 833 -1 867 -19 893 -12 17 -25 67 -35 135 -8 59 -24 124 -35 145 -10 20 -22 53 -26 72 -17 86 -147 321 -263 480 -112 152 -297 314 -500 437 -69 42 -215 113 -233 113 -8 0 -38 11 -68 25 -55 26 -134 49 -306 91 l-100 25 -585 -3 c-583 -3 -585 -3 -610 -25z" />
      </g>
    </svg>
  );
}

function QrBox({ url, size }: { url: string; size: number }) {
  // EXPLICIT square dims — the structural kill of the white-void class: a
  // sized box can never be stretched by a flex column, AND (unlike the old
  // alignSelf override, adversarial-verify 2026-07-20) it still obeys every
  // parent's alignment — centered columns center it, centered rows center
  // it vertically, the story column keeps it at its own edge.
  const pad = Math.max(8, Math.round(size / 20));
  const box = size + pad * 2;
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: box,
        height: box,
        background: "#ffffff", // no-raw-color-allow: QR needs a solid white background to stay scannable (QrCodeBlock precedent)
        borderRadius: 8,
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <QRCode value={url} size={size} />
    </span>
  );
}

function artefactRoot(w: number, h: number): CSSProperties {
  return {
    display: "flex",
    flexDirection: "column",
    width: w,
    height: h,
    background: INK_BG,
    color: INK_FG,
    border: `2px solid ${INK_BORDER}`,
    boxSizing: "border-box",
    overflow: "hidden",
  };
}

// READABILITY LAW (founder order 2026-07-20 + ARTIFACT_TYPOGRAPHY_FLOORS):
// less text, bigger type. The masthead sub is SHORT (the category, nothing
// more) so every line can sit above its format's type floor — a feed image
// is seen at ~40% size, print at 300dpi (30px ≈ 7pt), a poster from meters.
function Masthead({ mark, title, sub }: { mark: number; title: number; sub: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: Math.round(mark / 3) }}>
      <SynMark width={mark} />
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <span className="font-mono" style={{ fontSize: title, fontWeight: 600, letterSpacing: title * 0.18, color: INK_FG, whiteSpace: "nowrap" }}>
          THE SYNDICATE
        </span>
        <span className="font-mono" style={{ fontSize: sub, fontWeight: 600, letterSpacing: sub * 0.1, color: INK_MUTED, marginTop: 4, whiteSpace: "nowrap" }}>
          ON-CHAIN MEMBERSHIP PROTOCOL
        </span>
      </div>
    </div>
  );
}

function VerifyLines({ size, lines }: { size: number; lines: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: Math.round(size * 0.6), minWidth: 0 }}>
      {lines.map((l) => (
        <span key={l} className="font-mono" style={{ fontSize: size, fontWeight: 600, letterSpacing: size * 0.18, color: INK_MUTED }}>
          {l}
        </span>
      ))}
    </div>
  );
}

// ── The standing card · 1200×630 (the share/link-preview standard) ──────────
// Geometry designed for the 2-LINE seat coordinate (the longest chapter
// names wrap) — the fit probe holds this, not hope.
export function CardOg({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(1200, 630), padding: "44px 64px 40px" }}>
      <Masthead mark={72} title={30} sub={20} />
      <div className="font-mono" style={{ fontSize: 58, lineHeight: 1.18, fontWeight: 600, color: INK_GOLD, marginTop: 24 }}>
        {facts.seatLine ?? "An on-chain introduction record"}
      </div>
      {facts.standingLine !== null ? (
        <div style={{ fontSize: 32, color: INK_FG, marginTop: 12 }}>{facts.standingLine}</div>
      ) : null}
      <div className="font-mono" style={{ fontSize: 23, color: INK_MUTED, marginTop: 12 }}>
        source {facts.shortWallet} · thesyndicate.money
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 28, marginTop: "auto" }}>
        <QrBox url={facts.joinLink} size={150} />
        <VerifyLines size={23} lines={["SCAN — JOIN THROUGH MY INTRODUCTION", "DON'T TRUST — VERIFY"]} />
      </div>
    </div>
  );
}

// ── The standing card · 1080×1080 (post) ────────────────────────────────────
export function CardSquare({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(1080, 1080), padding: 64 }}>
      <Masthead mark={68} title={28} sub={20} />
      <div className="font-mono" style={{ fontSize: 58, lineHeight: 1.2, fontWeight: 600, color: INK_GOLD, marginTop: 64 }}>
        {facts.seatLine ?? "An on-chain introduction record"}
      </div>
      {facts.standingLine !== null ? (
        <div style={{ fontSize: 32, color: INK_FG, marginTop: 14 }}>{facts.standingLine}</div>
      ) : null}
      <div className="font-mono" style={{ fontSize: 23, color: INK_MUTED, marginTop: 14 }}>
        source {facts.shortWallet} · thesyndicate.money
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 30, marginTop: "auto" }}>
        <QrBox url={facts.joinLink} size={230} />
        <VerifyLines size={23} lines={["SCAN TO JOIN", "DON'T TRUST — VERIFY"]} />
      </div>
    </div>
  );
}

// ── The standing card · 1080×1920 (story / status) ──────────────────────────
export function CardStory({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(1080, 1920), padding: 76 }}>
      <Masthead mark={76} title={32} sub={22} />
      <div className="font-mono" style={{ fontSize: 76, lineHeight: 1.22, fontWeight: 600, color: INK_GOLD, marginTop: 170 }}>
        {facts.seatLine ?? "An on-chain introduction record"}
      </div>
      {facts.standingLine !== null ? (
        <div style={{ fontSize: 38, color: INK_FG, marginTop: 22 }}>{facts.standingLine}</div>
      ) : null}
      <div className="font-mono" style={{ fontSize: 27, color: INK_MUTED, marginTop: 22 }}>
        source {facts.shortWallet} · thesyndicate.money
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: "auto" }}>
        <QrBox url={facts.joinLink} size={280} />
        <VerifyLines size={26} lines={["SCAN — JOIN THROUGH MY INTRODUCTION", "DON'T TRUST — VERIFY"]} />
      </div>
    </div>
  );
}

// The CTA chip — the one action affordance on banners (adopted craft: a
// clear action verb; the wording is the APPROVED visitor-door register —
// never urgency, never a discount, never a promise the chain can't prove).
function CtaChip({ text, size }: { text: string; size: number }) {
  return (
    <span
      className="font-mono"
      style={{
        display: "flex",
        alignItems: "center",
        border: `1.5px solid ${INK_GOLD}`,
        color: INK_GOLD,
        borderRadius: 8,
        padding: `${Math.round(size * 0.55)}px ${Math.round(size * 1.1)}px`,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: size * 0.1,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {text}
    </span>
  );
}

// ── Banners — THE PERFORMING SET (ARTIFACT_TYPOGRAPHY_FLOORS §banner canon:
// Google's top performers 300×250 · 336×280 · 300×600 · 728×90 + mobile
// 320×100; the legacy 468×60 is retired). One message per banner, a hook
// from the approved register, one CTA — sized so NOTHING clips. ─────────────
export function Banner728({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(728, 90), flexDirection: "row", alignItems: "center", gap: 12, padding: "0 16px" }}>
      <SynMark width={44} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span className="font-mono" style={{ fontSize: 18, fontWeight: 600, letterSpacing: 2.6, whiteSpace: "nowrap" }}>
          THE SYNDICATE
        </span>
        <span style={{ fontSize: 11.5, color: INK_MUTED, whiteSpace: "nowrap", marginTop: 3 }}>
          Proof, not promises.
        </span>
      </div>
      <CtaChip text="SEE HOW IT WORKS" size={11} />
      <span className="font-mono" style={{ fontSize: 12.5, color: INK_GOLD, marginLeft: "auto", whiteSpace: "nowrap" }}>
        Introduced by {facts.shortWallet}
      </span>
      <QrBox url={facts.joinLink} size={52} />
    </div>
  );
}

export function Banner336({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(336, 280), alignItems: "center", justifyContent: "center", gap: 5, padding: 12, textAlign: "center" }}>
      <SynMark width={40} />
      <span className="font-mono" style={{ fontSize: 17, fontWeight: 600, letterSpacing: 2.6, whiteSpace: "nowrap", marginTop: 2 }}>
        THE SYNDICATE
      </span>
      <span style={{ fontSize: 11, color: INK_MUTED, whiteSpace: "nowrap" }}>
        Every purchase is a verifiable receipt.
      </span>
      <QrBox url={facts.joinLink} size={88} />
      <CtaChip text="SCAN TO JOIN" size={11} />
      <span className="font-mono" style={{ fontSize: 12, color: INK_GOLD, whiteSpace: "nowrap" }}>
        Introduced by {facts.shortWallet}
      </span>
    </div>
  );
}

export function Banner300({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(300, 250), alignItems: "center", justifyContent: "center", gap: 4, padding: 10, textAlign: "center" }}>
      <SynMark width={34} />
      <span className="font-mono" style={{ fontSize: 16, fontWeight: 600, letterSpacing: 2.4, whiteSpace: "nowrap", marginTop: 2 }}>
        THE SYNDICATE
      </span>
      <span style={{ fontSize: 10.5, color: INK_MUTED, whiteSpace: "nowrap" }}>
        Every purchase is a verifiable receipt.
      </span>
      <QrBox url={facts.joinLink} size={78} />
      <CtaChip text="SCAN TO JOIN" size={10.5} />
      <span className="font-mono" style={{ fontSize: 11.5, color: INK_GOLD, whiteSpace: "nowrap" }}>
        Introduced by {facts.shortWallet}
      </span>
    </div>
  );
}

export function Banner600({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(300, 600), alignItems: "center", padding: "34px 24px 28px", textAlign: "center" }}>
      <SynMark width={60} />
      <span className="font-mono" style={{ fontSize: 20, fontWeight: 600, letterSpacing: 2.8, whiteSpace: "nowrap", marginTop: 12 }}>
        THE SYNDICATE
      </span>
      <span style={{ fontSize: 13, color: INK_MUTED, lineHeight: 1.45, marginTop: 8, maxWidth: 240 }}>
        Every purchase is a verifiable receipt.
      </span>
      <div style={{ marginTop: 18, display: "flex" }}>
        <QrBox url={facts.joinLink} size={168} />
      </div>
      <div style={{ marginTop: 16, display: "flex" }}>
        <CtaChip text="SCAN TO JOIN" size={13} />
      </div>
      <span style={{ fontSize: 12.5, color: INK_MUTED, lineHeight: 1.45, marginTop: 14, maxWidth: 240 }}>
        Seats are open — see how membership works.
      </span>
      <span className="font-mono" style={{ fontSize: 12, color: INK_GOLD, whiteSpace: "nowrap", marginTop: "auto" }}>
        Introduced by {facts.shortWallet}
      </span>
      <span className="font-mono" style={{ fontSize: 11, color: INK_MUTED, whiteSpace: "nowrap", marginTop: 6 }}>
        thesyndicate.money
      </span>
    </div>
  );
}

// Restructured after the adversarial verify (2026-07-20): the old 3-line
// side column collided with the CTA chip deterministically. Mobile = the
// smallest canvas → ONE message, two centered rows, nothing overlaps.
export function Banner320({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(320, 100), alignItems: "center", justifyContent: "center", gap: 8, padding: "0 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <SynMark width={28} />
        <span className="font-mono" style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: 1.5, whiteSpace: "nowrap" }}>
          THE SYNDICATE
        </span>
        <CtaChip text="TAKE YOUR SEAT" size={10} />
      </div>
      <span className="font-mono" style={{ fontSize: 10, color: INK_GOLD, whiteSpace: "nowrap" }}>
        Introduced by {facts.shortWallet}
      </span>
    </div>
  );
}

// ── The record card · 1200×630 — the referrer's RESULTS, proof not claims ───
// (founder order 2026-07-20: "il a amené 10 personnes, c'est déjà prêt — tout
// est on-chain et vérifiable"). Chain-proven counts only; the panel mounts it
// ONLY when a real record exists — never an empty boast, never money.
export function RecordCard({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(1200, 630), padding: "44px 64px 40px" }}>
      <Masthead mark={72} title={30} sub={20} />
      <div className="font-mono" style={{ fontSize: 66, lineHeight: 1.15, fontWeight: 600, color: INK_GOLD, marginTop: 26 }}>
        {facts.recordLine ?? "An on-chain introduction record"}
      </div>
      {facts.standingLine !== null ? (
        <div style={{ fontSize: 30, color: INK_FG, marginTop: 10 }}>{facts.standingLine}</div>
      ) : null}
      <div style={{ fontSize: 25, color: INK_MUTED, marginTop: 10 }}>
        Every introduction is an on-chain record — verify it, don&apos;t trust it.
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 28, marginTop: "auto" }}>
        <QrBox url={facts.joinLink} size={140} />
        <VerifyLines size={23} lines={["SCAN — JOIN THROUGH MY INTRODUCTION", "DON'T TRUST — VERIFY"]} />
      </div>
    </div>
  );
}

// ── The QR pack — the naked code, ready for any surface ─────────────────────
// Pure white-box QR (&via=print): t-shirts, stickers, flyers — any color
// around it, the code stays scannable untouched (founder order 2026-07-20:
// "sans manipuler, pour le mettre sur un t-shirt").
export function QrPrint({ facts }: { facts: KitFacts }) {
  const url = withVia(facts.joinLink, "print");
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 1000,
        height: 1000,
        background: "#ffffff", // no-raw-color-allow: QR needs a solid white background to stay scannable (QrCodeBlock precedent)
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <QRCode value={url} size={840} />
    </div>
  );
}

// The video QR (&via=youtube): made to sit in a video corner or hold a
// one-minute sequence — dark card, the code, the site, nothing else. Viewers
// scan on screen and land on the member's join page.
export function QrVideo({ facts }: { facts: KitFacts }) {
  const url = withVia(facts.joinLink, "youtube");
  return (
    <div style={{ ...artefactRoot(900, 900), alignItems: "center", justifyContent: "center", gap: 36, padding: 56 }}>
      <QrBox url={url} size={580} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <span className="font-mono" style={{ fontSize: 40, fontWeight: 600, letterSpacing: 6, color: INK_GOLD, whiteSpace: "nowrap" }}>
          SCAN TO JOIN
        </span>
        <span className="font-mono" style={{ fontSize: 28, letterSpacing: 3, color: INK_MUTED, whiteSpace: "nowrap" }}>
          thesyndicate.money
        </span>
      </div>
    </div>
  );
}

// ── The offline world — print artifacts (&via=print rides the QR) ───────────
export function PosterA4({ facts }: { facts: KitFacts }) {
  const url = withVia(facts.joinLink, "print");
  return (
    <div style={{ ...artefactRoot(1240, 1754), alignItems: "center", padding: "96px 80px 76px", textAlign: "center" }}>
      <SynMark width={200} />
      <span className="font-mono" style={{ fontSize: 92, fontWeight: 600, letterSpacing: 13, marginTop: 44, whiteSpace: "nowrap" }}>
        THE SYNDICATE
      </span>
      <span style={{ fontSize: 36, color: INK_MUTED, lineHeight: 1.5, marginTop: 26, maxWidth: 920 }}>
        On-chain membership protocol. Every purchase is a receipt anyone can verify.
      </span>
      <div style={{ marginTop: 60, display: "flex" }}>
        <QrBox url={url} size={520} />
      </div>
      <span className="font-mono" style={{ fontSize: 40, fontWeight: 600, letterSpacing: 6, color: INK_GOLD, marginTop: 44, whiteSpace: "nowrap" }}>
        SCAN TO SEE HOW IT WORKS
      </span>
      <span className="font-mono" style={{ fontSize: 25, letterSpacing: 3, color: INK_MUTED, marginTop: "auto", whiteSpace: "nowrap" }}>
        INTRODUCED BY {facts.shortWallet} · DON&apos;T TRUST — VERIFY
      </span>
    </div>
  );
}

export function BizCard({ facts }: { facts: KitFacts }) {
  const url = withVia(facts.joinLink, "print");
  return (
    <div style={{ ...artefactRoot(1004, 650), flexDirection: "row", alignItems: "center", gap: 44, padding: 56 }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1, minWidth: 0 }}>
        <SynMark width={104} />
        <span className="font-mono" style={{ fontSize: 42, fontWeight: 600, letterSpacing: 4, marginTop: 24, whiteSpace: "nowrap" }}>
          THE SYNDICATE
        </span>
        <span style={{ fontSize: 30, color: INK_MUTED, marginTop: 12, lineHeight: 1.45 }}>
          On-chain membership.
          <br />
          Proof, not promises.
        </span>
        <span className="font-mono" style={{ fontSize: 30, color: INK_GOLD, marginTop: "auto", whiteSpace: "nowrap" }}>
          Introduced by {facts.shortWallet}
        </span>
        <span className="font-mono" style={{ fontSize: 30, color: INK_MUTED, marginTop: 10 }}>thesyndicate.money</span>
      </div>
      <QrBox url={url} size={344} />
    </div>
  );
}

/** The artifact table — the fit probe and the panel iterate over THIS, so a
 * new artifact automatically joins the download row, the share row, and the
 * geometry gate. */
export interface KitArtifactSpec {
  id: string;
  label: string;
  width: number;
  height: number;
  /** Export scale (print formats export at 2× for crisp paper). */
  exportScale: number;
  /** The format's TYPE FLOOR in px (ARTIFACT_TYPOGRAPHY_FLOORS law): no
   * text node inside the artifact may compute below it. Derived from the
   * viewing context — feed images are seen at ~40% size, print at 300dpi
   * (30px ≈ 7pt), a poster from meters. The harness probe enforces it. */
  typeFloor: number;
  filename: string;
  render: (facts: KitFacts) => ReactNode;
}

export const KIT_ARTIFACTS: readonly KitArtifactSpec[] = [
  { id: "og", label: "1200×630 · link preview", width: 1200, height: 630, exportScale: 1, typeFloor: 20, filename: "syndicate-card-1200x630.png", render: (f) => <CardOg facts={f} /> },
  { id: "square", label: "1080×1080 · post", width: 1080, height: 1080, exportScale: 1, typeFloor: 20, filename: "syndicate-card-1080x1080.png", render: (f) => <CardSquare facts={f} /> },
  { id: "story", label: "1080×1920 · story", width: 1080, height: 1920, exportScale: 1, typeFloor: 22, filename: "syndicate-card-1080x1920.png", render: (f) => <CardStory facts={f} /> },
  { id: "record", label: "1200×630 · your record", width: 1200, height: 630, exportScale: 1, typeFloor: 20, filename: "syndicate-record-1200x630.png", render: (f) => <RecordCard facts={f} /> },
  { id: "b300", label: "300×250 · medium rectangle", width: 300, height: 250, exportScale: 2, typeFloor: 10, filename: "syndicate-banner-300x250.png", render: (f) => <Banner300 facts={f} /> },
  { id: "b336", label: "336×280 · large rectangle", width: 336, height: 280, exportScale: 2, typeFloor: 10, filename: "syndicate-banner-336x280.png", render: (f) => <Banner336 facts={f} /> },
  { id: "b600", label: "300×600 · half page", width: 300, height: 600, exportScale: 2, typeFloor: 10, filename: "syndicate-banner-300x600.png", render: (f) => <Banner600 facts={f} /> },
  { id: "b728", label: "728×90 · leaderboard", width: 728, height: 90, exportScale: 2, typeFloor: 10, filename: "syndicate-banner-728x90.png", render: (f) => <Banner728 facts={f} /> },
  { id: "b320", label: "320×100 · mobile", width: 320, height: 100, exportScale: 2, typeFloor: 10, filename: "syndicate-banner-320x100.png", render: (f) => <Banner320 facts={f} /> },
  { id: "poster", label: "A4 · poster", width: 1240, height: 1754, exportScale: 2, typeFloor: 25, filename: "syndicate-poster-a4.png", render: (f) => <PosterA4 facts={f} /> },
  { id: "bizcard", label: "85×55 · business card", width: 1004, height: 650, exportScale: 2, typeFloor: 30, filename: "syndicate-business-card.png", render: (f) => <BizCard facts={f} /> },
  { id: "qrprint", label: "QR only · print", width: 1000, height: 1000, exportScale: 2, typeFloor: 1, filename: "syndicate-qr-print.png", render: (f) => <QrPrint facts={f} /> },
  { id: "qrvideo", label: "QR · video overlay", width: 900, height: 900, exportScale: 2, typeFloor: 28, filename: "syndicate-qr-video.png", render: (f) => <QrVideo facts={f} /> },
];
