// wallet/ReceiptShareCard.tsx (build-time-gated wallet module)
//
// THE SHARE CARD — the RECEIPT-SHARE rider (founder GO, 2026-07-17): the
// receipt's OUTWARD projection at the cross-platform share standard —
// 1200×630 (1.91:1), all text inside the central safe zone, exported under
// 300KB (WhatsApp-safe, quality step-down in the generator).
//
// THE CARD CARRIES THE REAL FIGURES, LIKE THE TICKET DOES — THE VISIBILITY
// LAW (CANON_VISIBILITY_LAW.md, TIER-0): the amount is ALREADY public in the
// very transaction this card's verify anchor opens; hiding it here while
// linking to it would be theatre, the exact class the law forbids. WE HIDE
// NOTHING (settled block §6①, SETTLED_RULES_DO_NOT_RELITIGATE.md — enforced
// by the amounts-visible pin). Every figure is the model's own field,
// verbatim (REAL-ROW). Its QR is the member's OWN introduction link (the
// settled referrer-pride doctrine) — the link arrives as a PROP from the
// ticket's ONE resolver site, never rebuilt here.
//
// Renders offscreen (fixed, off-viewport, print-hidden) so the generator can
// rasterize it through the same toSvg → canvas path as Save-image. Both
// themes by construction: tokens only.

import { forwardRef } from "react";
import QRCode from "react-qr-code";
import { brandAssets } from "@/config/brand";
import type { MembershipReceiptModel } from "@/lib/protocolCommerceReceipt";

export const SHARE_CARD_WIDTH = 1200;
export const SHARE_CARD_HEIGHT = 630;
/** WhatsApp-safe ceiling for the exported file (bytes). */
export const SHARE_CARD_MAX_BYTES = 300_000;

export const ReceiptShareCard = forwardRef<
  HTMLDivElement,
  {
    model: MembershipReceiptModel;
    /** The member's own introduction link — resolved by the ticket's ONE
     *  resolver site (payingSourceId) and passed down, never rebuilt. */
    referralLink: string;
  }
>(function ReceiptShareCard({ model, referralLink }, ref) {
  const seatLine = model.seatLines.find((l) => l.em);
  const shortTx = `${model.proof.txHash.slice(0, 6)}…${model.proof.txHash.slice(-4)}`;
  const proof = model.moneyProof;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-testid="receipt-share-card"
      className="fixed top-0 left-[-4000px] print:hidden bg-card text-foreground border border-border overflow-clip"
      style={{ width: SHARE_CARD_WIDTH, height: SHARE_CARD_HEIGHT }}
    >
      {/* central safe zone — every glyph lives inside this padding */}
      <div className="h-full w-full flex items-center justify-between gap-[56px] px-[90px] py-[56px]">
        {/* left column — the seat and its money truth, verbatim */}
        <div className="min-w-0">
          <div className="flex items-center gap-[16px]">
            <img
              src={brandAssets["syn-mark-gold"]}
              alt=""
              style={{ height: 48, width: "auto" }}
            />
            <div>
              <div className="font-mono font-semibold text-[24px] tracking-[0.24em]">
                THE SYNDICATE
              </div>
              <div className="font-mono font-semibold text-[14px] tracking-[0.18em] text-muted-foreground">
                ON-CHAIN MEMBERSHIP PROTOCOL · {model.head.chainLine}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-[24px] gap-y-[10px] mt-[34px]">
            <div
              className="font-mono font-semibold text-[64px] leading-none"
              data-testid="share-card-seat"
            >
              {seatLine?.value ?? model.living.coordinate}
            </div>
            {model.head.chapterChip ? (
              <span className="inline-block rounded-full border border-gold/40 bg-gold/10 px-[16px] py-[5px] text-[20px] text-gold">
                {model.head.chapterChip}
              </span>
            ) : null}
          </div>

          {/* THE VISIBILITY LAW: the real figures, never hidden */}
          <div className="flex items-baseline gap-[16px] mt-[26px]" data-testid="share-card-total">
            <span className="font-mono font-semibold text-[16px] tracking-[0.14em] text-muted-foreground">
              {model.commerce.total.label}
            </span>
            <span className="font-mono font-semibold text-[34px]">
              {model.commerce.total.value}
            </span>
          </div>
          {proof !== null ? (
            <div className="text-[17px] text-muted-foreground mt-[10px]" data-testid="share-card-proof">
              {proof.paidFirstLine
                ? `${proof.paidFirstLine.label} ${proof.paidFirstLine.value} — ${proof.remainderLead} `
                : `${proof.remainderLead} `}
              {proof.splitLines.map((l) => `${l.label} ${l.value}`).join(" · ")}
            </div>
          ) : null}

          <div className="text-[18px] text-muted-foreground mt-[20px]">
            Seat held — written on-chain ·{" "}
            {model.context.dateUtc ? `${model.context.dateUtc} · ` : ""}
            {model.context.blockDisplay}
          </div>
          <div className="font-mono text-[16px] text-muted-foreground mt-[8px]">
            Verify tx {shortTx} · thesyndicate.money
          </div>
          <div className="font-mono font-semibold text-[19px] tracking-[0.22em] text-gold mt-[20px]">
            ONE WALLET · ONE SEAT
          </div>
        </div>

        {/* right column — the member's own door in */}
        <div className="shrink-0 text-center">
          <div className="rounded-[12px] border border-border bg-white p-[16px] inline-block">
            <QRCode value={referralLink} size={230} />
          </div>
          <div className="font-mono font-semibold text-[19px] tracking-[0.16em] mt-[14px]">
            SCAN TO JOIN
          </div>
          <div className="text-[17px] text-muted-foreground mt-[4px]">
            through my introduction
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Rasterize the mounted card node to a WhatsApp-safe file: PNG first, then
 * JPEG quality step-down until the byte size fits under the ceiling. Uses
 * the house SVG→canvas path (toSvg + Image.onload — never toPng's decode()).
 */
export async function rasterizeShareCard(node: HTMLElement): Promise<File | null> {
  const { toSvg } = await import("html-to-image");
  // The mounted card sits off-viewport (fixed, left:-4000px). The clone must
  // shed that positioning or the foreignObject renders an empty frame —
  // caught blank at the rig, 2026-07-17.
  const svgUrl = await toSvg(node, {
    style: { position: "static", left: "0", top: "0" },
  });
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("share-card raster image failed to load"));
    img.src = svgUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  const bytesOf = (dataUrl: string) =>
    Math.ceil(((dataUrl.length - dataUrl.indexOf(",") - 1) * 3) / 4);
  const toFile = (dataUrl: string, name: string, type: string) => {
    const b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return new File([bytes], name, { type });
  };

  const png = canvas.toDataURL("image/png");
  if (bytesOf(png) <= SHARE_CARD_MAX_BYTES) {
    return toFile(png, "syndicate-receipt-card.png", "image/png");
  }
  for (const q of [0.9, 0.85, 0.8, 0.7, 0.6]) {
    const jpeg = canvas.toDataURL("image/jpeg", q);
    if (bytesOf(jpeg) <= SHARE_CARD_MAX_BYTES) {
      return toFile(jpeg, "syndicate-receipt-card.jpg", "image/jpeg");
    }
  }
  return null;
}
