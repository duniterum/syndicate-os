// components/referral/referrerKit.tsx — K1 · THE ARSENAL's artifacts.
//
// The referrer's share artifacts, rendered CLIENT-SIDE at export dimensions
// (the proven ReceiptShareCard path: DOM node → html-to-image → canvas →
// PNG). Every artifact is FIXED INK — the R-CARDS canon: a share artifact
// renders identically whatever theme the member browses in, so the exported
// picture is always the house picture. Figures are chain-proven only (seat,
// chapter, durable introductions, rung) — never a money projection, never a
// gain promise (anti-financialization canon). The QR on every artifact is
// the member's own permanent introduction link; print artifacts bake
// &via=print so the offline world counts in Channels like any channel.

import type { CSSProperties } from "react";
import QRCode from "react-qr-code";

// The R-CARDS ink — the server card palette, resolved constants (identical
// export in both themes; the token layer is theme-bound by design, so a
// theme-independent artifact cannot read it).
const INK_BG = "#090E1A"; // no-raw-color-allow: share artifacts are fixed-ink by canon (R-CARDS) — identical export in both themes
const INK_FG = "#E1E7EF"; // no-raw-color-allow: share artifacts are fixed-ink by canon (R-CARDS)
const INK_MUTED = "#7F8EA3"; // no-raw-color-allow: share artifacts are fixed-ink by canon (R-CARDS)
const INK_GOLD = "#F7BF3B"; // no-raw-color-allow: share artifacts are fixed-ink by canon (R-CARDS)
const INK_BORDER = "#25344B"; // no-raw-color-allow: share artifacts are fixed-ink by canon (R-CARDS)

/** Chain-proven facts only — assembled by the panel from the member's own
 * session reads; null fields render as absent, never invented. */
export interface KitFacts {
  /** "Seat #1 · Chapter I — Genesis Signal", or null (connected, no seat). */
  seatLine: string | null;
  /** "2 durable introductions · Emerging Connector", or null. */
  standingLine: string | null;
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

function Mark({ size, font }: { size: number; font: number }) {
  return (
    <span
      className="font-mono"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        flexShrink: 0,
        border: `2px solid ${INK_GOLD}`,
        borderRadius: 999,
        color: INK_GOLD,
        fontSize: font,
        fontWeight: 600,
      }}
    >
      SS
    </span>
  );
}

function QrBox({ url, size }: { url: string; size: number }) {
  return (
    <span
      style={{
        display: "flex",
        background: "#ffffff", // no-raw-color-allow: QR needs a solid white background to stay scannable (QrCodeBlock precedent)
        borderRadius: 8,
        padding: Math.max(8, Math.round(size / 18)),
        flexShrink: 0,
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

function Masthead({ mark, title, sub }: { mark: number; title: number; sub: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: mark / 3 }}>
      <Mark size={mark} font={Math.round(mark * 0.4)} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span className="font-mono" style={{ fontSize: title, fontWeight: 600, letterSpacing: title * 0.24, color: INK_FG }}>
          THE SYNDICATE
        </span>
        <span className="font-mono" style={{ fontSize: sub, fontWeight: 600, letterSpacing: sub * 0.18, color: INK_MUTED, marginTop: 2 }}>
          ON-CHAIN MEMBERSHIP PROTOCOL · AVALANCHE C-CHAIN
        </span>
      </div>
    </div>
  );
}

// ── The standing card · 1200×630 (the share/link-preview standard) ──────────
export function CardOg({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(1200, 630), padding: "56px 90px" }}>
      <Masthead mark={48} title={26} sub={14} />
      <div className="font-mono" style={{ fontSize: 54, fontWeight: 600, color: INK_GOLD, marginTop: 48 }}>
        {facts.seatLine ?? "An on-chain introduction record"}
      </div>
      {facts.standingLine !== null ? (
        <div style={{ fontSize: 30, color: INK_FG, marginTop: 14 }}>{facts.standingLine}</div>
      ) : null}
      <div className="font-mono" style={{ fontSize: 22, color: INK_MUTED, marginTop: 20 }}>
        source {facts.shortWallet} · verified on-chain · thesyndicate.money
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 30, marginTop: "auto" }}>
        <QrBox url={facts.joinLink} size={200} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span className="font-mono" style={{ fontSize: 20, fontWeight: 600, letterSpacing: 4, color: INK_MUTED }}>
            SCAN — JOIN THROUGH MY INTRODUCTION
          </span>
          <span className="font-mono" style={{ fontSize: 20, fontWeight: 600, letterSpacing: 5, color: INK_MUTED }}>
            DON&apos;T TRUST — VERIFY
          </span>
        </div>
      </div>
    </div>
  );
}

// ── The standing card · 1080×1080 (post) ────────────────────────────────────
export function CardSquare({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(1080, 1080), padding: 72 }}>
      <Masthead mark={44} title={24} sub={13} />
      <div className="font-mono" style={{ fontSize: 62, fontWeight: 600, color: INK_GOLD, marginTop: 96 }}>
        {facts.seatLine ?? "An on-chain introduction record"}
      </div>
      {facts.standingLine !== null ? (
        <div style={{ fontSize: 32, color: INK_FG, marginTop: 16 }}>{facts.standingLine}</div>
      ) : null}
      <div className="font-mono" style={{ fontSize: 22, color: INK_MUTED, marginTop: 22 }}>
        source {facts.shortWallet} · thesyndicate.money
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 34, marginTop: "auto" }}>
        <QrBox url={facts.joinLink} size={270} />
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <span className="font-mono" style={{ fontSize: 21, fontWeight: 600, letterSpacing: 4, color: INK_MUTED }}>
            SCAN TO JOIN
          </span>
          <span className="font-mono" style={{ fontSize: 21, fontWeight: 600, letterSpacing: 5, color: INK_MUTED }}>
            DON&apos;T TRUST — VERIFY
          </span>
        </div>
      </div>
    </div>
  );
}

// ── The standing card · 1080×1920 (story / status) ──────────────────────────
export function CardStory({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(1080, 1920), padding: 84 }}>
      <Masthead mark={48} title={26} sub={14} />
      <div className="font-mono" style={{ fontSize: 72, fontWeight: 600, color: INK_GOLD, marginTop: 230, lineHeight: 1.25 }}>
        {facts.seatLine ?? "An on-chain introduction record"}
      </div>
      {facts.standingLine !== null ? (
        <div style={{ fontSize: 38, color: INK_FG, marginTop: 22 }}>{facts.standingLine}</div>
      ) : null}
      <div className="font-mono" style={{ fontSize: 26, color: INK_MUTED, marginTop: 26 }}>
        source {facts.shortWallet} · verified on-chain
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: "auto" }}>
        <QrBox url={facts.joinLink} size={310} />
        <span className="font-mono" style={{ fontSize: 24, fontWeight: 600, letterSpacing: 5, color: INK_MUTED }}>
          SCAN — JOIN THROUGH MY INTRODUCTION
        </span>
        <span className="font-mono" style={{ fontSize: 24, fontWeight: 600, letterSpacing: 6, color: INK_MUTED }}>
          DON&apos;T TRUST — VERIFY
        </span>
      </div>
    </div>
  );
}

// ── Banners — the standard web sizes, the member's link in the pixels ───────
export function Banner728({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(728, 90), flexDirection: "row", alignItems: "center", gap: 16, padding: "0 20px" }}>
      <Mark size={44} font={17} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span className="font-mono" style={{ fontSize: 21, fontWeight: 600, letterSpacing: 4, whiteSpace: "nowrap" }}>
          THE SYNDICATE
        </span>
        <span className="font-mono" style={{ fontSize: 11.5, letterSpacing: 1.5, color: INK_MUTED, whiteSpace: "nowrap" }}>
          ON-CHAIN MEMBERSHIP · EVERY PURCHASE IS A VERIFIABLE RECEIPT
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginLeft: "auto" }}>
        <span className="font-mono" style={{ fontSize: 14, color: INK_GOLD, whiteSpace: "nowrap" }}>
          Introduced by {facts.shortWallet}
        </span>
        <span className="font-mono" style={{ fontSize: 11, color: INK_MUTED }}>thesyndicate.money</span>
      </div>
      <QrBox url={facts.joinLink} size={58} />
    </div>
  );
}

export function Banner468({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(468, 60), flexDirection: "row", alignItems: "center", gap: 11, padding: "0 14px" }}>
      <Mark size={30} font={11} />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span className="font-mono" style={{ fontSize: 15, fontWeight: 600, letterSpacing: 2.6, whiteSpace: "nowrap" }}>
          THE SYNDICATE
        </span>
        <span className="font-mono" style={{ fontSize: 8.5, letterSpacing: 1, color: INK_MUTED, whiteSpace: "nowrap" }}>
          PROOF-FIRST MEMBERSHIP
        </span>
      </div>
      <span className="font-mono" style={{ fontSize: 10.5, color: INK_GOLD, marginLeft: "auto", whiteSpace: "nowrap" }}>
        Introduced by {facts.shortWallet}
      </span>
    </div>
  );
}

export function Banner300({ facts }: { facts: KitFacts }) {
  return (
    <div style={{ ...artefactRoot(300, 250), alignItems: "center", justifyContent: "center", gap: 10, padding: 18, textAlign: "center" }}>
      <Mark size={38} font={15} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="font-mono" style={{ fontSize: 17, fontWeight: 600, letterSpacing: 3 }}>THE SYNDICATE</span>
        <span className="font-mono" style={{ fontSize: 10, letterSpacing: 1.2, color: INK_MUTED }}>
          ON-CHAIN MEMBERSHIP PROTOCOL
        </span>
      </div>
      <QrBox url={facts.joinLink} size={104} />
      <span className="font-mono" style={{ fontSize: 11.5, color: INK_GOLD }}>Introduced by {facts.shortWallet}</span>
    </div>
  );
}

// ── The offline world — print artifacts (&via=print rides the QR) ───────────
export function PosterA4({ facts }: { facts: KitFacts }) {
  const url = withVia(facts.joinLink, "print");
  return (
    <div style={{ ...artefactRoot(1240, 1754), alignItems: "center", padding: "120px 110px", textAlign: "center" }}>
      <Mark size={96} font={38} />
      <span className="font-mono" style={{ fontSize: 58, fontWeight: 600, letterSpacing: 12, marginTop: 44 }}>
        THE SYNDICATE
      </span>
      <span style={{ fontSize: 27, color: INK_MUTED, lineHeight: 1.6, marginTop: 26, maxWidth: 760 }}>
        On-chain membership protocol. Every purchase is a receipt anyone can verify.
      </span>
      <div style={{ marginTop: 76, display: "flex" }}>
        <QrBox url={url} size={560} />
      </div>
      <span className="font-mono" style={{ fontSize: 30, fontWeight: 600, letterSpacing: 6, color: INK_GOLD, marginTop: 44 }}>
        SCAN TO SEE HOW IT WORKS
      </span>
      <span className="font-mono" style={{ fontSize: 20, letterSpacing: 3, color: INK_MUTED, marginTop: "auto" }}>
        INTRODUCED BY {facts.shortWallet} · DON&apos;T TRUST — VERIFY
      </span>
    </div>
  );
}

export function BizCard({ facts }: { facts: KitFacts }) {
  const url = withVia(facts.joinLink, "print");
  return (
    <div style={{ ...artefactRoot(1004, 650), flexDirection: "row", alignItems: "center", gap: 54, padding: 70 }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", flex: 1 }}>
        <Mark size={60} font={24} />
        <span className="font-mono" style={{ fontSize: 34, fontWeight: 600, letterSpacing: 5, marginTop: 28 }}>
          THE SYNDICATE
        </span>
        <span style={{ fontSize: 17, color: INK_MUTED, marginTop: 12, lineHeight: 1.5 }}>
          On-chain membership.
          <br />
          Proof, not promises.
        </span>
        <span className="font-mono" style={{ fontSize: 19, color: INK_GOLD, marginTop: "auto" }}>
          Introduced by {facts.shortWallet}
        </span>
        <span className="font-mono" style={{ fontSize: 15, color: INK_MUTED, marginTop: 8 }}>thesyndicate.money</span>
      </div>
      <QrBox url={url} size={380} />
    </div>
  );
}
