// wallet/ReceiptTicket.tsx (build-time-gated wallet module)
//
// THE PROTOCOL RECEIPT — the founder-approved ticket (wireframe 2026-07-16):
// zones A–G + identity head + living zone + next door, in the house skin
// (command-room ink + gold, both themes). Purely presentational: it renders
// the MembershipReceiptModel VERBATIM — every figure was placed there by the
// spine from the confirmed event's own fields, and this file performs no
// arithmetic, no chain read for the figures, no derivation (the hard filters
// live in lib/protocolCommerceReceipt.ts and the receipt guard pins both).
//
// THE ONE DOOR: the next-door zone renders exactly one door, decided from the
// wallet's REAL state (a live Archive holding read; the referral door needs
// no read — every seated wallet's link exists). Never a list, never urgency.
//
// V1 export stance (approved): "Save image" rasterizes the ticket (SVG
// foreignObject via html-to-image); the print stylesheet + light-theme print
// hook give a clean browser Save-as-PDF. The public /receipt/{txHash} page is
// LIVE (2026-07-20, this same rendering path — one truth); the dedicated PDF
// engine stays its own rider (founder default: print already saves clean).

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import QRCode from "react-qr-code";
import {
  Check,
  Copy,
  ExternalLink,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Send,
  Share2,
  Twitter,
} from "lucide-react";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { shareTargets, type ShareTargetDef } from "@/lib/shareTargets";
import { brandAssets } from "@/config/brand";
import { readArtifactBalance } from "@/lib/chainReads";
import { payingSourceId } from "@/lib/sourceIdentity";
import { fetchSourceStanding } from "./walletSession";
import { ReceiptShareCard, rasterizeShareCard } from "./ReceiptShareCard";
import type {
  MembershipReceiptModel,
  ReceiptDoor,
} from "@/lib/protocolCommerceReceipt";

/** Token address out of a verify-links explorer URL (token or address form). */
function addressFromUrl(url: string): string | null {
  return url.match(/\/(?:token|address)\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}

// The two real doors of V1. The Archive door claims openness only on a
// CONFIRMED zero holding of The First Signal (id 1 — the archive id canon,
// same as ownReads); any unreadable state falls back to the referral door,
// which is true for every seated wallet with no read at all.
const REFERRAL_DOOR: ReceiptDoor = {
  title: "Your referral link is ready",
  body: "— open Referral to share it.",
  href: "/referral",
};
const ARCHIVE_DOOR: ReceiptDoor = {
  title: "The Archive is open",
  body: "— The First Signal awaits.",
  href: "/archive",
};

/**
 * ⑪ THE MEMBER'S OWN LINK ON THE SHARE ARTIFACT (founder, 2026-07-17): the
 * shared receipt is also the member's recruitment tool (the settled
 * referrer-pride doctrine), so the SHARE text carries their permanent link —
 * resolved by THE one resolver (Ruling ①: server-resolved paying source
 * first, canonical SYN.SOURCE.V1 derivation as the fallback; reused, never
 * rebuilt). ONE-DOOR-MAX holds: the door zone still renders exactly one
 * door — the link lives in the Zone G share ACTION, outside the paper, so
 * the print/PDF accounting document stays clean by construction.
 */
function useOwnReferralLink(wallet: string | undefined): string | null {
  const [link, setLink] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    setLink(null);
    if (!wallet) return;
    const resolve = (sourceIdHex: string | null) => {
      const id = payingSourceId(sourceIdHex, wallet);
      if (active && id) setLink(`https://thesyndicate.money/join?source=${id}`);
    };
    fetchSourceStanding()
      .then((r) => resolve(r?.sourceIdHex ?? null))
      .catch(() => resolve(null));
    return () => {
      active = false;
    };
  }, [wallet]);
  return link;
}

/** Decide THE one door from the wallet's real state. Fail-closed to the
 *  door that is true without any read. */
function useReceiptNextDoor(wallet: string | undefined): ReceiptDoor {
  const { data } = useGetProtocolVerifyLinks();
  const archiveUrl = data?.links?.find((l) => l.id === "nftArchive")?.url ?? null;
  const archiveAddr = archiveUrl ? addressFromUrl(archiveUrl) : null;
  const [door, setDoor] = useState<ReceiptDoor>(REFERRAL_DOOR);
  useEffect(() => {
    let active = true;
    if (!wallet || !archiveAddr) return;
    void readArtifactBalance(archiveAddr, wallet, 1).then((raw) => {
      if (!active || raw === null) return;
      setDoor(raw === 0n ? ARCHIVE_DOOR : REFERRAL_DOOR);
    });
    return () => {
      active = false;
    };
  }, [wallet, archiveAddr]);
  return door;
}

/** While mounted, a browser print renders in the LIGHT tokens (a printer
 *  never paints the command-room ink), restoring the member's theme after.
 *  This is what makes the V1 browser Save-as-PDF print-clean. */
function usePrintCleanTheme(): void {
  useEffect(() => {
    let wasDark = false;
    const before = () => {
      const root = document.documentElement;
      wasDark = root.classList.contains("dark");
      if (wasDark) {
        root.classList.remove("dark");
        root.classList.add("light");
      }
    };
    const after = () => {
      if (!wasDark) return;
      const root = document.documentElement;
      root.classList.remove("light");
      root.classList.add("dark");
    };
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);
}

function ZoneRule() {
  return <div className="border-t border-dashed border-border" aria-hidden="true" />;
}

// ── R-BIND-2 · THE DUAL SHARE (founder-approved mockup 2026-07-19) ─────────
// One Share button opens ONE surface: Copy link FIRST (the action that works
// everywhere) → the six network intents (reusing THE shareTargets module —
// rendered in the crypto-native order; Facebook/LinkedIn carry the URL only,
// by those platforms' own rules) → "Share with other apps" (the OS sheet,
// kept and renamed; the ONLY channel that carries the ticket image) —
// feature-detected, never a dead button.
const NETWORK_ORDER = ["x", "whatsapp", "telegram", "linkedin", "facebook", "email"];
const NETWORK_ICONS: Record<string, typeof Share2> = {
  x: Twitter,
  whatsapp: MessageCircle,
  telegram: Send,
  linkedin: Linkedin,
  facebook: Facebook,
  email: Mail,
};
const ORDERED_TARGETS: ShareTargetDef[] = NETWORK_ORDER.map(
  (id) => shareTargets.find((t) => t.id === id),
).filter((t): t is ShareTargetDef => t !== undefined);

export default function ReceiptTicket({
  model,
  wallet,
  doorOverride,
}: {
  model: MembershipReceiptModel;
  /** The connected wallet — the identity the sigil seals and the state the
   *  one door is decided from. */
  wallet: string | undefined;
  /** The /receipt/{txHash} public mount (2026-07-20, review-hardened): the
   *  VISITOR's door, used until the viewer's OWN referral link has actually
   *  resolved — the member doors ("Your referral link is ready" / "The
   *  Archive is open") are buyer claims, true only of a wallet whose link
   *  exists; an anonymous or seatless viewer gets the one honest door
   *  instead. A resolved link restores the real-state decision. Still a
   *  single optional door object — ONE DOOR MAX holds. */
  doorOverride?: ReceiptDoor;
}) {
  const paperRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hookDoor = useReceiptNextDoor(wallet);
  const referralLink = useOwnReferralLink(wallet);
  // The one door: the visitor door stands until the viewer's OWN link has
  // resolved (proof the member claims are true of THEM); then the real
  // decision applies. Callers without an override are member surfaces —
  // unchanged.
  const door = doorOverride && referralLink === null ? doorOverride : hookDoor;
  usePrintCleanTheme();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  // R-BIND-2: the dual share surface + native-share availability (detected
  // once — the OS button renders only where the sheet truly exists).
  const [shareOpen, setShareOpen] = useState(false);
  const nativeShareAvailable = typeof navigator.share === "function";

  const txUrl = model.proof.explorerTxUrl;
  const shortTx = `${model.proof.txHash.slice(0, 6)}…${model.proof.txHash.slice(-4)}`;
  // THE ROTATION (the founder's idea, engraved — the painted-cards slice,
  // 2026-07-20): the rotation lives in the LINK, never the preview. Every
  // share act hands out the CURRENT face's link, then advances — four
  // shares, four different honest painted pictures, each one permanent
  // (platforms photograph a page once; a variant url is its own object).
  // Stateless by design: the counter lives in the mount, no shortener,
  // no server state.
  const [shareFace, setShareFace] = useState(1);
  const advanceShareFace = () => setShareFace((f) => (f % 4) + 1);
  // THE RETARGET (the /receipt/{txHash} slice, Q44 sealed — ships in the
  // SAME deploy as the page, never before): the link a member HANDS someone
  // is the receipt's own public page — the one address that renders the full
  // document for anyone with the link. The explorer proof stays exactly one
  // click deeper: Verify and the QR are UNCHANGED.
  const receiptPageUrl = `https://thesyndicate.money/receipt/${model.proof.txHash}${shareFace > 1 ? `?f=${shareFace}` : ""}`;
  // ⑪ the share artifact: sealed proof + the member's own link (when it
  // resolves — a share never carries a broken or half-derived link).
  const shareText = txUrl
    ? `The Syndicate — ${model.living.coordinate}. Sealed proof: ${receiptPageUrl}` +
      (referralLink ? `\nMy introduction link: ${referralLink}` : "")
    : null;
  // The shareTargets contract (founder screenshot, 2026-07-20): `text` never
  // contains the link — each intent places the url ITSELF, so a text that
  // embeds it prints the link twice in the draft. Url-param intents (x,
  // telegram; facebook/linkedin take the url alone) get this URL-FREE text;
  // the platform appends the receipt url after it, so the receipt stays the
  // LAST link — the one X cards. Text-only intents (whatsapp, email) keep
  // the full inline text and an empty url — the receipt link LEADS the
  // message there (the first link is the one WhatsApp cards).
  const shareIntentText = txUrl
    ? `The Syndicate — ${model.living.coordinate}.` +
      (referralLink ? `\nMy introduction link: ${referralLink}` : "")
    : null;

  async function handleCopy() {
    if (!txUrl) return;
    try {
      await navigator.clipboard.writeText(receiptPageUrl);
      setCopied(true);
      advanceShareFace(); // the NEXT copy hands the next face's link
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard refused — the Verify link still carries the URL */
    }
  }

  /** R-BIND-2 — "Share with other apps": the OS sheet, the one channel that
   * carries the ticket PNG. The canShare-gap FIXED (audit): a built card the
   * platform cannot file-share no longer skips the sheet — text-only
   * navigator.share is attempted before the download+clipboard fallback. */
  async function handleNativeShare() {
    if (!shareText) return;
    // RECEIPT-SHARE rider: the share artifact is the 1200×630 CARD (the
    // member's introduction QR on it) + the proof text. The card only exists
    // when the link resolved — a share never carries a half-built artifact.
    let cardFile: File | null = null;
    if (cardRef.current && referralLink) {
      try {
        cardFile = await rasterizeShareCard(cardRef.current);
      } catch {
        cardFile = null;
      }
    }
    if (
      cardFile &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [cardFile] })
    ) {
      try {
        await navigator.share({
          title: model.head.docTitle,
          text: shareText,
          files: [cardFile],
        });
        return;
      } catch {
        /* share sheet dismissed — fall through */
      }
    } else if (typeof navigator.share === "function") {
      // Text-only sheet — the platform has a sheet but cannot take the file
      // (or no card was built): the sheet still opens, nothing dead-ends.
      try {
        await navigator.share({ title: model.head.docTitle, text: shareText });
        return;
      } catch {
        /* share sheet dismissed — fall through */
      }
    }
    // Fallback: the card downloads (when built) and the text lands on the
    // clipboard — nothing is lost on platforms without file-share.
    if (cardFile) {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(cardFile);
      a.download = cardFile.name;
      a.click();
    }
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard refused — the Verify link still carries the proof */
    }
  }

  async function handleSaveImage() {
    const node = paperRef.current;
    if (!node || saving) return;
    setSaving(true);
    try {
      // toSvg (styles + fonts inlined; the fonts stylesheet is CORS-readable
      // via index.html's crossorigin) + the HOUSE SVG→canvas rasterization
      // (the QrCodeBlock precedent). html-to-image's own toPng is avoided:
      // its internal decode() hangs on large foreignObject SVGs (verified at
      // the rig) — onload never does.
      const { toSvg } = await import("html-to-image");
      const svgUrl = await toSvg(node);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("ticket raster image failed to load"));
        img.src = svgUrl;
      });
      const scale = 3;
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `syndicate-receipt-${model.proof.txHash.slice(0, 10)}.png`;
      a.click();
    } catch {
      /* rasterizer failed — the printed/PDF path and explorer proof remain */
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="receipt-print-root w-full max-w-[372px]" data-testid="receipt-ticket">
      {/* ── the ticket paper (zones A–F + the one door) ── */}
      <div
        ref={paperRef}
        className="w-[340px] max-w-full mx-auto rounded-[10px] border border-border bg-card px-[18px] pt-5 pb-3.5 shadow-xl"
      >
        {/* Zone A · identity head — THE SYNDICATE's own gold mark: an official
            document carries the ISSUER's seal (founder correction 2026-07-17;
            the member's wallet-derived sigil is the HOLDER's identity and
            stays on the member surfaces). */}
        <div className="py-3 px-0.5 text-center">
          <div className="flex justify-center mb-2">
            <img
              src={brandAssets["syn-mark-gold"]}
              alt="The Syndicate mark"
              className="h-11 w-auto object-contain"
              data-testid="receipt-brand-mark"
            />
          </div>
          <div className="font-mono text-sm font-semibold tracking-[0.24em]">
            {model.head.protocol}
          </div>
          <div className="font-mono text-xs font-semibold tracking-[0.18em] text-muted-foreground mt-1">
            {model.head.protocolSub}
          </div>
          <div className="text-xs mt-1.5">{model.head.docTitle}</div>
          <div className="text-xs text-muted-foreground mt-1">{model.head.chainLine}</div>
          {model.head.chapterChip ? (
            <div className="mt-2">
              <span
                className="inline-block rounded-full border border-gold/35 bg-gold/10 px-2.5 py-px text-xs text-gold"
                data-testid="receipt-chapter-chip"
              >
                {model.head.chapterChip}
              </span>
            </div>
          ) : null}
        </div>

        <ZoneRule />

        {/* Zone B · when, sealed where */}
        <div className="py-3 px-0.5 flex flex-wrap justify-between gap-x-3 text-[13px]">
          <span className="text-muted-foreground" data-testid="receipt-context-line">
            {model.context.dateUtc ? `${model.context.dateUtc} · ` : ""}
            {model.context.blockDisplay}
          </span>
          {model.context.eraLabel !== null ? (
            <span className="font-mono text-muted-foreground">{model.context.eraLabel}</span>
          ) : null}
        </div>

        <ZoneRule />

        {/* Zone C · the seat. ⑨ THE STRESS LAW (founder, 2026-07-17): exact
            values never round, never shrink, never truncate — a value too
            wide for its row WRAPS to its own full-width right-aligned line
            (flex-wrap + ml-auto), the label standing above it. */}
        <div className="py-3 px-0.5">
          {model.seatLines.map((line) => (
            <div
              key={line.label}
              className="flex flex-wrap justify-between gap-x-3 text-[13px] leading-[1.9]"
            >
              <span className="text-muted-foreground">{line.label}</span>
              <span
                className={`font-mono text-right ml-auto min-w-0 break-words ${line.em ? "text-[15px] font-semibold" : ""}`}
              >
                {line.value}
                {line.suffix ? (
                  <span className="text-xs text-muted-foreground"> {line.suffix}</span>
                ) : null}
              </span>
            </div>
          ))}
        </div>

        <ZoneRule />

        {/* THE COMMERCE BLOCK · what I bought, what I paid — the buyer's own
            story first (founder correction 2026-07-17). */}
        <div className="py-3 px-0.5" data-testid="receipt-commerce-zone">
          <div className="flex flex-wrap justify-between gap-x-3 text-[13px] leading-[1.9]">
            <span data-testid="receipt-item-line">{model.commerce.itemLine.label}</span>
            <span className="font-mono text-right ml-auto min-w-0 break-words font-semibold">
              {model.commerce.itemLine.value}
            </span>
          </div>
          <div className="flex flex-wrap justify-between items-baseline gap-x-3 mt-1.5">
            <span className="font-mono text-xs font-semibold tracking-[0.14em] text-muted-foreground">
              {model.commerce.total.label}
            </span>
            <span
              className="font-mono text-xl font-semibold text-right ml-auto min-w-0 break-words"
              data-testid="receipt-total"
            >
              {model.commerce.total.value}
            </span>
          </div>
        </div>

        {/* THE PROOF BLOCK · our signature — where the money went, inside the
            buyer's own transaction. Every figure is the event's own field;
            an event that never carried its splits prints NO proof block
            (⑫ honest absence — the zone and its rule simply don't exist). */}
        {model.moneyProof !== null ? (
          <>
            <ZoneRule />
            <div className="py-3 px-0.5" data-testid="receipt-money-zone">
              <div
                className="font-mono text-xs font-semibold tracking-[0.18em] text-gold"
                data-testid="receipt-proof-title"
              >
                {model.moneyProof.title}
              </div>
              <div className="text-xs text-muted-foreground mb-1.5">
                {model.moneyProof.subtitle}
              </div>
              {model.moneyProof.paidFirstLine ? (
                <div className="flex flex-wrap justify-between gap-x-3 text-[13px] leading-[1.9]">
                  <span className="text-muted-foreground">
                    {model.moneyProof.paidFirstLine.label}
                  </span>
                  <span className="font-mono text-right ml-auto min-w-0 break-words">
                    {model.moneyProof.paidFirstLine.value}
                  </span>
                </div>
              ) : null}
              <div
                className="text-[13px] leading-[1.9] text-muted-foreground"
                data-testid="receipt-remainder-lead"
              >
                {model.moneyProof.remainderLead}
              </div>
              {model.moneyProof.splitLines.map((line) => (
                <div
                  key={line.label}
                  className={`flex flex-wrap justify-between gap-x-3 text-[13px] leading-[1.9] ${line.indent ? "pl-3.5" : ""}`}
                >
                  <span className="text-muted-foreground">{line.label}</span>
                  <span className="font-mono text-right ml-auto min-w-0 break-words">{line.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : null}

        <ZoneRule />

        {/* Living zone · the story coordinate (grows with the record) */}
        <div className="py-3 px-0.5 text-[12.5px] leading-relaxed">
          <div className="font-mono text-xs" data-testid="receipt-coordinate">
            {model.living.coordinate}
          </div>
          {model.living.witnessLine ? (
            <div className="text-gold mt-1" data-testid="receipt-witness-line">
              ✦ {model.living.witnessLine}
            </div>
          ) : null}
          {/* ⑩ READABILITY FIRST (founder, 2026-07-17): upright, the ticket's
              own sans, full foreground contrast, above the 12px floor — the
              doctrine's distinction is the gold accent + spacing, never a
              legibility penalty. */}
          <div className="border-l-2 border-gold/40 pl-2.5 mt-2 text-[13px] leading-relaxed text-foreground">
            “{model.living.doctrine}”
          </div>
        </div>

        <ZoneRule />

        {/* Zone F · verify */}
        <div className="py-3 px-0.5">
          <div className="font-mono text-xs font-semibold tracking-[0.22em] text-center text-gold mb-2.5">
            ONE WALLET · ONE SEAT
          </div>
          <div className="flex items-center gap-3">
            {txUrl ? (
              <div className="shrink-0 rounded-md border border-border bg-white p-1.5">
                <QRCode value={txUrl} size={72} />
              </div>
            ) : null}
            <div className="text-xs leading-normal text-muted-foreground">
              <div className="font-mono text-xs font-semibold tracking-[0.14em] text-foreground">
                SCAN TO VERIFY
              </div>
              {txUrl
                ? "Opens the transaction on the public explorer."
                : "The explorer link could not be resolved — the transaction hash below is the proof; look it up on any Avalanche explorer."}
              <br />
              <span className="font-mono" data-testid="receipt-tx-short">
                tx {shortTx}
              </span>
            </div>
          </div>
          <div className="font-mono text-xs font-semibold tracking-[0.22em] text-center text-muted-foreground mt-2.5">
            DON&apos;T TRUST — VERIFY
          </div>
          <div className="text-xs text-center text-muted-foreground mt-1.5">
            Sealed by the protocol · {model.context.blockDisplay} — the transaction hash{" "}
            <em>is</em> the signature.
          </div>
        </div>

        <ZoneRule />

        {/* THE ONE DOOR · decided from the wallet's real state */}
        <div className="pt-3 pb-1 px-0.5">
          <Link
            href={door.href}
            className="block rounded-lg border border-gold/30 bg-gold/[0.07] px-3 py-2 text-[12.5px] leading-normal text-foreground hover:bg-gold/10 transition-colors"
            data-testid="receipt-next-door"
          >
            <b className="text-gold font-semibold">{door.title}</b>{" "}
            <span className="text-muted-foreground">{door.body}</span>
          </Link>
        </div>
      </div>

      {/* Zone G · actions — outside the ticket paper */}
      <div className="w-[340px] max-w-full mx-auto flex flex-wrap gap-2 justify-center border-t border-border mt-3.5 pt-3 px-1 print:hidden">
        {txUrl ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="min-h-11"
              onClick={() => void handleCopy()}
              data-testid="button-receipt-copy"
            >
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="min-h-11"
              onClick={() => setShareOpen((v) => !v)}
              aria-expanded={shareOpen}
              aria-controls="receipt-share-surface"
              data-testid="button-receipt-share"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              Share
            </Button>
          </>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="min-h-11 border-gold/50 text-gold hover:text-gold"
          onClick={() => void handleSaveImage()}
          disabled={saving}
          data-testid="button-receipt-save-image"
        >
          {saving ? "Rendering…" : "Save image"}
        </Button>
        {txUrl ? (
          <Button variant="outline" size="sm" className="min-h-11" asChild data-testid="button-receipt-verify">
            <a href={txUrl} target="_blank" rel="noopener noreferrer">
              Verify
              <ExternalLink className="ml-1 h-3 w-3" aria-hidden="true" />
            </a>
          </Button>
        ) : null}
      </div>
      {/* R-BIND-2 · the dual share surface (founder-approved mockup) — in
          flow under the actions, print-hidden like every action. */}
      {shareOpen && txUrl ? (
        <div
          id="receipt-share-surface"
          className="w-[340px] max-w-full mx-auto mt-3 rounded-xl border border-border bg-card p-4 print:hidden"
          data-testid="receipt-share-surface"
        >
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="w-full min-h-11 rounded-lg border border-gold/50 bg-gold/[0.08] text-gold text-sm font-medium flex items-center justify-center gap-2 hover:bg-gold/[0.12] transition-colors"
            data-testid="button-share-copy-link"
          >
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy link"}
          </button>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {ORDERED_TARGETS.map((t) => {
              const Icon = NETWORK_ICONS[t.id] ?? Share2;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    // THE RETARGET: every network intent carries the
                    // receipt's own public page (see receiptPageUrl above);
                    // each act advances the rotation for the next share.
                    // Url/text split per the shareTargets contract — the
                    // link prints exactly ONCE in every draft.
                    const [intentUrl, intentText] =
                      t.id === "whatsapp" || t.id === "email"
                        ? ["", shareText ?? ""]
                        : [receiptPageUrl, shareIntentText ?? ""];
                    window.open(t.build(intentUrl, intentText), "_blank", "noopener,noreferrer");
                    advanceShareFace();
                    setShareOpen(false);
                  }}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border px-1 py-2.5 min-h-14 text-xs text-foreground hover:bg-muted transition-colors"
                  data-testid={`button-share-${t.id}`}
                >
                  <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  {t.label}
                </button>
              );
            })}
          </div>
          {nativeShareAvailable ? (
            <button
              type="button"
              onClick={() => {
                setShareOpen(false);
                void handleNativeShare();
                advanceShareFace();
              }}
              className="w-full mt-3 min-h-12 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors"
              data-testid="button-share-other-apps"
            >
              Share with other apps
              <span className="block text-xs font-normal text-muted-foreground">
                Sends the ticket image too
              </span>
            </button>
          ) : null}
        </div>
      ) : null}

      <p className="w-[340px] max-w-full mx-auto text-xs text-muted-foreground text-center mt-2 print:hidden">
        Printing this page (Ctrl/Cmd+P) gives a clean Save-as-PDF of the ticket alone.
      </p>

      {/* RECEIPT-SHARE rider: the offscreen 1200×630 card the Share action
          rasterizes — mounted only once the member's link resolved (the
          card's QR IS that link; no link, no card). Off-viewport + print
          projections never include it. */}
      {referralLink ? (
        <ReceiptShareCard ref={cardRef} model={model} referralLink={referralLink} />
      ) : null}
    </div>
  );
}
