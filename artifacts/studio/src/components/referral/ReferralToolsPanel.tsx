// components/referral/ReferralToolsPanel.tsx — TAB 6 · Tools (K1 · THE ARSENAL, v2).
//
// The referrer's arsenal, per the founder-approved mockup
// (docs/design/referral-tools-mockup.html): everything a referrer needs,
// SHOWN not described. VISUAL-FIRST law (founder, 2026-07-20): the human
// sees the banner, not the text. AT 300 law: this page does not grow —
// artifacts are per-member constants.
//
// V2 (founder defect report, 2026-07-20): every artifact now carries its
// OWN action row (Download · Copy my link · Share…) — never only the top
// module; the artifact table (KIT_ARTIFACTS) drives previews, downloads and
// the harness fit probe from ONE source, so a future format joins every
// affordance automatically.
//
// Truth laws: every figure on an artifact is the member's own session read
// (seat via member-standing, durable/rung via source standing) — a missing
// fact renders as absent, never invented. Export is the proven client
// raster path (DOM → svg → canvas → PNG); artifacts are fixed-ink so the
// exported picture is identical in both themes.

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { useAccount } from "wagmi";
import { ChevronDown, Download, Share2 } from "lucide-react";
import { toSvg } from "html-to-image";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { ladderProgress } from "@/config/connectorLadder";
import { referralProgram } from "@/config/referralProgram";
import { chapterForSeat } from "@/lib/chapters";
import { payingSourceId } from "@/lib/sourceIdentity";
import {
  dateLabel,
  useOwnIntroductions,
  type StandingReadback,
} from "@/components/referral/referralStanding";
import {
  KIT_ARTIFACTS,
  withVia,
  type KitArtifactSpec,
  type KitFacts,
} from "@/components/referral/referrerKit";

// ── the proven export path (ReceiptTicket's house recipe: toSvg → Image →
// canvas → PNG; toPng's internal decode() hangs on large foreignObject
// SVGs, so it is never used) ────────────────────────────────────────────────
async function rasterizeToPng(
  node: HTMLElement,
  width: number,
  height: number,
  scale: number,
): Promise<string | null> {
  try {
    const svg = await toSvg(node, { width, height });
    const img = new Image();
    img.src = svg;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("artifact image failed to decode"));
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext("2d");
    if (ctx === null) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function triggerDownload(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
}

// ── a scaled live preview of a full-size artifact node ──────────────────────
function ScaledPreview({
  width,
  height,
  scale,
  nodeRef,
  children,
}: {
  width: number;
  height: number;
  scale: number;
  nodeRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <div
      style={{ width: width * scale, height: height * scale, overflow: "hidden" }}
      className="rounded-lg border border-border shrink-0"
    >
      <div ref={nodeRef} style={{ transform: `scale(${scale})`, transformOrigin: "top left", width, height }}>
        {children}
      </div>
    </div>
  );
}

/** EVERY artifact's own action row (v2 — the founder's rule): Download ·
 * Copy my link · Share… (native, carrying the artifact's PNG file). */
function ArtifactActions({
  spec,
  nodeRef,
  joinLink,
  gold = false,
}: {
  spec: KitArtifactSpec;
  nodeRef: RefObject<HTMLDivElement | null>;
  joinLink: string;
  gold?: boolean;
}) {
  const [busy, setBusy] = useState<null | "download" | "share">(null);
  const [copied, setCopied] = useState(false);
  // Transient honest feedback — a failure is never silent (adversarial
  // verify 2026-07-20: iOS activation expiry and unsupported file-share
  // used to masquerade as a closed sheet).
  const [note, setNote] = useState<string | null>(null);
  const say = (msg: string) => {
    setNote(msg);
    window.setTimeout(() => setNote(null), 2600);
  };
  const nativeShareAvailable =
    typeof navigator !== "undefined" && typeof navigator.share === "function";
  const node = () => (nodeRef.current?.firstElementChild as HTMLElement | null) ?? null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => {
          const el = node();
          if (el === null) return;
          setBusy("download");
          void rasterizeToPng(el, spec.width, spec.height, spec.exportScale)
            .then((png) => {
              if (png !== null) triggerDownload(png, spec.filename);
              else say("Couldn't prepare the image — try again");
            })
            .finally(() => setBusy(null));
        }}
        className={`inline-flex items-center gap-1.5 h-9 rounded-lg border px-3 text-xs transition-colors disabled:opacity-60 ${
          gold
            ? "border-gold/50 text-gold bg-gold/5 hover:bg-gold/10"
            : "border-border bg-card text-foreground hover:bg-muted"
        }`}
        data-testid={`button-kit-download-${spec.id}`}
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        {busy === "download" ? "Preparing…" : "Download PNG"}
      </button>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard
            .writeText(joinLink)
            .then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1400);
            })
            .catch(() => {});
        }}
        className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground hover:bg-muted transition-colors"
        data-testid={`button-kit-copy-${spec.id}`}
      >
        {copied ? "Copied ✓" : "Copy my link"}
      </button>
      {nativeShareAvailable ? (
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => {
            const el = node();
            if (el === null) return;
            setBusy("share");
            void (async () => {
              let png: string | null = null;
              try {
                png = await rasterizeToPng(el, spec.width, spec.height, spec.exportScale);
                if (png === null) throw new Error("raster failed");
                const blob = await (await fetch(png)).blob();
                const file = new File([blob], spec.filename, { type: "image/png" });
                const canShareFiles =
                  typeof navigator.canShare === "function" &&
                  navigator.canShare({ files: [file] });
                if (canShareFiles) {
                  await navigator.share({
                    title: "The Syndicate",
                    text: "The Syndicate — an on-chain introduction record.",
                    url: joinLink,
                    files: [file],
                  });
                } else {
                  // This engine shares links but not files — share the link,
                  // hand the picture as a download (honest, never silent).
                  await navigator.share({
                    title: "The Syndicate",
                    text: "The Syndicate — an on-chain introduction record.",
                    url: joinLink,
                  });
                  triggerDownload(png, spec.filename);
                  say("Link shared — the image was downloaded");
                }
              } catch (e) {
                const aborted = e instanceof DOMException && e.name === "AbortError";
                if (!aborted) {
                  // A real failure (activation expiry, engine quirk): the
                  // member still gets the artifact + the link.
                  if (png !== null) triggerDownload(png, spec.filename);
                  navigator.clipboard.writeText(joinLink).catch(() => {});
                  say("Sheet unavailable — image downloaded, link copied");
                }
              } finally {
                setBusy(null);
              }
            })();
          }}
          className="inline-flex items-center gap-1.5 h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-60"
          data-testid={`button-kit-share-${spec.id}`}
        >
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          {busy === "share" ? "Preparing…" : "Share…"}
        </button>
      ) : null}
      {note !== null ? (
        <span className="text-xs text-muted-foreground" role="status">
          {note}
        </span>
      ) : null}
    </div>
  );
}

function CopyButton({ value, label, testid }: { value: string; label: string; testid: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1400);
          })
          .catch(() => {});
      }}
      className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground hover:bg-muted transition-colors"
      data-testid={testid}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}

function SectionTitle({ title, why }: { title: string; why: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-8 mb-2.5">
      <h3 className="text-[15px] font-medium text-foreground">{title}</h3>
      <span className="text-[12.5px] text-muted-foreground">{why}</span>
    </div>
  );
}

// ── the member's own seat line (session read — own row, fail-closed) ────────
function useOwnSeatLine(): string | null {
  const [seatLine, setSeatLine] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;
    void Promise.all([
      import("@/wallet/walletSession"),
      import("@/wallet/sessionEvents"),
    ]).then(([ws, ev]) => {
      if (!active) return;
      const read = () => {
        void ws.fetchMemberStanding().then((r) => {
          if (!active) return;
          const seat = r?.memberNumber ?? null;
          const chapter = seat !== null ? chapterForSeat(seat) : null;
          setSeatLine(
            seat !== null
              ? chapter !== null
                ? `Seat #${seat} · Chapter ${chapter.roman} — ${chapter.name}`
                : `Seat #${seat}`
              : null,
          );
        });
      };
      read();
      window.addEventListener(ev.SESSION_CHANGED_EVENT, read);
      cleanup = () => window.removeEventListener(ev.SESSION_CHANGED_EVENT, read);
    });
    return () => {
      active = false;
      cleanup?.();
    };
  }, []);
  return seatLine;
}

const spec = (id: string): KitArtifactSpec => {
  const found = KIT_ARTIFACTS.find((a) => a.id === id);
  if (found === undefined) throw new Error(`unknown kit artifact: ${id}`);
  return found;
};

// ── the tab ─────────────────────────────────────────────────────────────────
export function ReferralToolsPanel({ readback }: { readback: StandingReadback | null }) {
  const { address } = useAccount();
  const s = readback?.standing ?? null;
  const seatLine = useOwnSeatLine();
  const intro = useOwnIntroductions();
  const rows = intro?.rows ?? null;
  const [guideOpen, setGuideOpen] = useState(false);

  const refs = {
    og: useRef<HTMLDivElement | null>(null),
    square: useRef<HTMLDivElement | null>(null),
    story: useRef<HTMLDivElement | null>(null),
    record: useRef<HTMLDivElement | null>(null),
    b300: useRef<HTMLDivElement | null>(null),
    b336: useRef<HTMLDivElement | null>(null),
    b600: useRef<HTMLDivElement | null>(null),
    b728: useRef<HTMLDivElement | null>(null),
    b320: useRef<HTMLDivElement | null>(null),
    poster: useRef<HTMLDivElement | null>(null),
    bizcard: useRef<HTMLDivElement | null>(null),
    qrprint: useRef<HTMLDivElement | null>(null),
    qrvideo: useRef<HTMLDivElement | null>(null),
  } as const;

  // The member's permanent link — same derivation as the hero above the tabs
  // (payingSourceId: the source that PAYS this wallet, canonical fallback).
  const sourceId = payingSourceId(readback?.sourceIdHex ?? null, address);
  const joinLink = sourceId !== null ? `https://thesyndicate.money/join?source=${sourceId}` : null;

  if (joinLink === null || address === undefined) {
    return (
      <Card className="bg-card/40 border-border/50 p-5" data-testid="panel-referrer-kit">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Connect and sign in with your wallet to open your arsenal — your
          card, your banners, and your print pack all carry your permanent
          introduction link, derived from your wallet.
        </p>
      </Card>
    );
  }

  const durable = s?.durableIntroductions ?? null;
  const introduced = s?.introducedMembers ?? null;
  const rungTitle = durable !== null ? ladderProgress(durable).current.title : null;
  const standingLine =
    durable !== null && rungTitle !== null
      ? `${durable} durable introduction${durable === 1 ? "" : "s"} · ${rungTitle} Connector`
      : null;
  const facts: KitFacts = {
    seatLine,
    standingLine,
    // The record card mounts only on a REAL record — never an empty boast.
    recordLine:
      introduced !== null && introduced > 0
        ? `${introduced} member${introduced === 1 ? "" : "s"} introduced`
        : null,
    shortWallet: `${address.slice(0, 6)}…${address.slice(-4)}`,
    joinLink,
  };

  return (
    <div data-testid="panel-referrer-kit">
      {/* 1 · THE CARD — painted from the member's own chain-proven facts. */}
      <SectionTitle
        title="Your card — chain-proven figures only"
        why="what the chain proves, nothing else — never a money projection"
      />
      <Card className="bg-card/40 border-border/50 p-5 space-y-5">
        <div>
          <div className="overflow-x-auto pb-1">
            <ScaledPreview width={1200} height={630} scale={0.5} nodeRef={refs.og}>
              {spec("og").render(facts)}
            </ScaledPreview>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className="font-mono text-xs text-muted-foreground">{spec("og").label}</span>
            <ArtifactActions spec={spec("og")} nodeRef={refs.og} joinLink={joinLink} gold />
          </div>
        </div>
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <ScaledPreview width={1080} height={1080} scale={0.24} nodeRef={refs.square}>
              {spec("square").render(facts)}
            </ScaledPreview>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 max-w-[260px]">
              <span className="font-mono text-xs text-muted-foreground">{spec("square").label}</span>
              <ArtifactActions spec={spec("square")} nodeRef={refs.square} joinLink={joinLink} />
            </div>
          </div>
          <div>
            <ScaledPreview width={1080} height={1920} scale={0.135} nodeRef={refs.story}>
              {spec("story").render(facts)}
            </ScaledPreview>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 max-w-[260px]">
              <span className="font-mono text-xs text-muted-foreground">{spec("story").label}</span>
              <ArtifactActions spec={spec("story")} nodeRef={refs.story} joinLink={joinLink} />
            </div>
          </div>
        </div>
        {facts.recordLine !== null ? (
          <div>
            <div className="overflow-x-auto pb-1">
              <ScaledPreview width={1200} height={630} scale={0.5} nodeRef={refs.record}>
                {spec("record").render(facts)}
              </ScaledPreview>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="font-mono text-xs text-muted-foreground">{spec("record").label}</span>
              <ArtifactActions spec={spec("record")} nodeRef={refs.record} joinLink={joinLink} gold />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              Your record card — the results, ready to show. Proof, not
              claims: every figure on it is on-chain and verifiable by anyone.
            </p>
          </div>
        ) : null}
        <p className="text-xs text-muted-foreground leading-relaxed">
          The card shows only what the chain proves — your seat, your chapter,
          your durable introductions, your rung. The QR scans straight to your
          permanent link.
        </p>
      </Card>

      {/* 2 · THE BANNERS — the performing set (Google's top formats +
          mobile), real size, one message + one CTA each. */}
      <SectionTitle title="Your banners — the formats that perform, real size" why="one message, one action — download, then place them anywhere you publish" />
      <Card className="bg-card/40 border-border/50 p-5">
        <div className="flex flex-wrap items-start gap-6">
          {(["b300", "b336", "b600"] as const).map((id) => (
            <div key={id} className="max-w-full">
              {/* overflow container: a 336px preview must scroll INSIDE its
                  box on a small phone — the page never scrolls horizontally */}
              <div className="overflow-x-auto pb-1">
                <ScaledPreview width={spec(id).width} height={spec(id).height} scale={1} nodeRef={refs[id]}>
                  {spec(id).render(facts)}
                </ScaledPreview>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2 max-w-[336px]">
                <span className="font-mono text-xs text-muted-foreground">{spec(id).label}</span>
                <ArtifactActions spec={spec(id)} nodeRef={refs[id]} joinLink={joinLink} />
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-5 mt-6">
          {(["b728", "b320"] as const).map((id) => (
            <div key={id}>
              <div className="overflow-x-auto pb-1">
                <ScaledPreview width={spec(id).width} height={spec(id).height} scale={1} nodeRef={refs[id]}>
                  {spec(id).render(facts)}
                </ScaledPreview>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="font-mono text-xs text-muted-foreground">{spec(id).label}</span>
                <ArtifactActions spec={spec(id)} nodeRef={refs[id]} joinLink={joinLink} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mt-4">
          The five formats that actually perform — medium rectangle, large
          rectangle, half page, leaderboard, and the mobile banner. Every hook
          is a provable house line; never urgency, never a discount — every
          claim on these banners can be checked against the chain.
        </p>
      </Card>

      {/* 3 · THE OFFLINE WORLD — print-ready, the QR does the work. */}
      <SectionTitle title="The offline world — print and hand out" why="the QR carries &via=print — real-world scans count in Channels" />
      <Card className="bg-card/40 border-border/50 p-5">
        <div className="flex flex-wrap items-start gap-6">
          <div>
            <ScaledPreview width={1240} height={1754} scale={0.18} nodeRef={refs.poster}>
              {spec("poster").render(facts)}
            </ScaledPreview>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 max-w-[280px]">
              <span className="font-mono text-xs text-muted-foreground">{spec("poster").label}</span>
              <ArtifactActions spec={spec("poster")} nodeRef={refs.poster} joinLink={joinLink} gold />
            </div>
          </div>
          <div>
            <ScaledPreview width={1004} height={650} scale={0.28} nodeRef={refs.bizcard}>
              {spec("bizcard").render(facts)}
            </ScaledPreview>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 max-w-[300px]">
              <span className="font-mono text-xs text-muted-foreground">{spec("bizcard").label}</span>
              <ArtifactActions spec={spec("bizcard")} nodeRef={refs.bizcard} joinLink={joinLink} />
            </div>
          </div>
          <div>
            <ScaledPreview width={1000} height={1000} scale={0.16} nodeRef={refs.qrprint}>
              {spec("qrprint").render(facts)}
            </ScaledPreview>
            <div className="flex flex-wrap items-center gap-2 mt-2.5 max-w-[300px]">
              <span className="font-mono text-xs text-muted-foreground">{spec("qrprint").label}</span>
              <ArtifactActions spec={spec("qrprint")} nodeRef={refs.qrprint} joinLink={joinLink} />
              <button
                type="button"
                onClick={() => {
                  const svg = refs.qrprint.current?.querySelector("svg");
                  if (svg === null || svg === undefined) return;
                  // QUIET ZONE (adversarial verify 2026-07-20): the raw QR
                  // svg ends flush at the finder patterns; the print standard
                  // demands 4 modules of white margin — without it, "any
                  // color around it" breaks the scan. Wrap in an outer svg
                  // with the white margin baked in.
                  const vb = svg.getAttribute("viewBox")?.split(/\s+/) ?? [];
                  const n = Number(vb[2] ?? 0) || 29;
                  const q = 4;
                  const t = n + q * 2;
                  const inner = new XMLSerializer()
                    .serializeToString(svg)
                    .replace(
                      /<svg([^>]*)>/,
                      `<svg$1 x="${q}" y="${q}" width="${n}" height="${n}">`,
                    );
                  const out =
                    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${t}">` +
                    `<rect width="${t}" height="${t}" fill="#ffffff"/>${inner}</svg>`; // no-raw-color-allow: the QR quiet zone must be solid white to stay scannable (QrCodeBlock precedent)
                  const blob = new Blob([out], { type: "image/svg+xml;charset=utf-8" });
                  const href = URL.createObjectURL(blob);
                  triggerDownload(href, "syndicate-qr-print.svg");
                  window.setTimeout(() => URL.revokeObjectURL(href), 5000);
                }}
                className="h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground hover:bg-muted transition-colors"
                data-testid="button-kit-download-qr-svg"
              >
                Download SVG (vector)
              </button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2 max-w-[300px]">
              The naked code, untouched — put it on a t-shirt, a sticker, a
              flyer, any color around it. The SVG scales to any print size
              without losing sharpness.
            </p>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed min-w-[200px] flex-1">
            Print them as they are — export is 2× for crisp paper. Anyone who
            scans lands on your join page, and the visit counts under the{" "}
            <span className="font-mono">print</span> channel in Channels.
          </p>
        </div>
      </Card>

      {/* 4 · THE LIVING MOMENTS — the system works for the referrer. */}
      <SectionTitle title="Living moments — the system works for you" why="real, dated, provable events — never invented" />
      {rows === null ? (
        <Card className="bg-card/40 border-border/50 p-5">
          <p className="text-sm text-muted-foreground leading-relaxed" title={intro?.failureReason ?? undefined}>
            {intro === null
              ? "The moments read is resolving — nothing is assumed, nothing is invented."
              : "Your moments are unavailable right now — your record on-chain is unchanged. Try again in a moment."}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {standingLine !== null && durable !== null && durable > 0 ? (
            <Card className="bg-card border-border p-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-2">
              <span className="text-[13.5px]">
                <span className="font-medium">Your standing: {standingLine}.</span>{" "}
                <span className="text-muted-foreground">Your card is up to date — share it.</span>
              </span>
              <span className="ml-auto">
                <ArtifactActions spec={spec("og")} nodeRef={refs.og} joinLink={joinLink} />
              </span>
            </Card>
          ) : null}
          {rows.slice(0, 5).map((r) => (
            <Card key={r.transaction} className="bg-card border-border p-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-2">
              <span className="font-mono text-[12.5px] text-muted-foreground whitespace-nowrap">
                {dateLabel(r.isoDayUtc)}
              </span>
              <span className="text-[13.5px]">
                <span className="font-medium">Your introduction sealed on-chain.</span>{" "}
                <span className="text-muted-foreground">
                  Its receipt is shareable proof — the painted card travels with the link.
                </span>
              </span>
              <span className="ml-auto">
                <CopyButton
                  value={`https://thesyndicate.money/receipt/${r.transaction}`}
                  label="Copy the receipt link"
                  testid={`button-kit-moment-${r.transaction.slice(2, 10)}`}
                />
              </span>
            </Card>
          ))}
          {rows.length === 0 && (durable === null || durable === 0) ? (
            <Card className="bg-card/40 border-border/50 p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your moments appear here as they happen — each introduction
                you seal becomes a dated, provable, shareable event.
              </p>
            </Card>
          ) : null}
        </div>
      )}

      {/* 5 · FOR CREATORS — every audience gets its kit, pre-tagged. */}
      <SectionTitle title="For creators — every audience, pre-tagged" why="the channel tag is already in each link — Channels counts everything" />
      <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
        <Card className="bg-card/40 border-border/50 p-4">
          <p className="text-sm font-medium text-foreground">
            YouTube · streaming <span className="font-mono text-xs text-gold">&via=youtube</span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 mb-2">
            The description block, ready to paste under a video:
          </p>
          <p className="font-mono text-xs bg-background border border-border rounded-lg p-2.5 break-all mb-2">
            The Syndicate — on-chain membership protocol on Avalanche. Every
            purchase is a verifiable receipt. My introduction link:{" "}
            {withVia(joinLink, "youtube")}
          </p>
          <CopyButton
            value={`The Syndicate — on-chain membership protocol on Avalanche. Every purchase is a verifiable receipt. My introduction link: ${withVia(joinLink, "youtube")}`}
            label="Copy the block"
            testid="button-kit-creator-youtube"
          />
          <p className="text-xs text-muted-foreground leading-relaxed mt-3 mb-2">
            And the on-screen QR — keep it in a corner of the video, or hold
            it for a minute; viewers scan the screen and land on your join page:
          </p>
          <div className="flex flex-wrap items-start gap-3">
            <ScaledPreview width={900} height={900} scale={0.14} nodeRef={refs.qrvideo}>
              {spec("qrvideo").render(facts)}
            </ScaledPreview>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-xs text-muted-foreground">{spec("qrvideo").label}</span>
              <ArtifactActions spec={spec("qrvideo")} nodeRef={refs.qrvideo} joinLink={joinLink} />
            </div>
          </div>
        </Card>
        <Card className="bg-card/40 border-border/50 p-4">
          <p className="text-sm font-medium text-foreground">
            Blog · website <span className="font-mono text-xs text-gold">&via=blog</span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 mb-2">
            The badge to embed — the image lives with us, your link inside:
          </p>
          <p className="font-mono text-xs bg-background border border-border rounded-lg p-2.5 break-all mb-2">
            {`<a href="${withVia(joinLink, "blog")}"><img src="https://thesyndicate.money/referrer-badge.png" alt="The Syndicate — on-chain membership protocol" width="460" height="100"></a>`}
          </p>
          <CopyButton
            value={`<a href="${withVia(joinLink, "blog")}"><img src="https://thesyndicate.money/referrer-badge.png" alt="The Syndicate — on-chain membership protocol" width="460" height="100"></a>`}
            label="Copy the code"
            testid="button-kit-creator-blog"
          />
        </Card>
        <Card className="bg-card/40 border-border/50 p-4">
          <p className="text-sm font-medium text-foreground">
            Messaging · statuses <span className="font-mono text-xs text-gold">&via=whatsapp</span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 mb-2">
            The story format above, plus the ready line:
          </p>
          <p className="font-mono text-xs bg-background border border-border rounded-lg p-2.5 break-all mb-2">
            {seatLine !== null ? `I hold ${seatLine.split(" · ")[0]} of The Syndicate — proof on-chain, not promises.` : "The Syndicate — proof on-chain, not promises."}{" "}
            See how membership works: {withVia(joinLink, "whatsapp")}
          </p>
          <CopyButton
            value={`${seatLine !== null ? `I hold ${seatLine.split(" · ")[0]} of The Syndicate — proof on-chain, not promises.` : "The Syndicate — proof on-chain, not promises."} See how membership works: ${withVia(joinLink, "whatsapp")}`}
            label="Copy the line"
            testid="button-kit-creator-whatsapp"
          />
        </Card>
        <Card className="bg-card/40 border-border/50 p-4">
          <p className="text-sm font-medium text-foreground">
            The real world <span className="font-mono text-xs text-gold">&via=print</span>
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
            The A4 poster and the business card above — the QR carries the
            print tag, and real-world scans count in Channels like any other
            channel.
          </p>
        </Card>
      </div>

      {/* 6 · THE WORDS — the flagship lines, provable, one click to copy. */}
      <SectionTitle title="The words — provable house lines, one click to copy" why="the artifact's text is fixed; around it, your words stay yours" />
      <Card className="bg-card/40 border-border/50 p-5">
        {[
          "You don't wait to get paid. The contract pays you inside your referral's own transaction — before we ever see the money. One signature. Two recipients. Verify the hash yourself.",
          "Nothing to claim. It's already in your wallet when the block confirms.",
          "A referral payment can never break a sale — and can never be lost.",
          "The referral program where the payout is part of the purchase.",
        ].map((line, i) => (
          <div
            key={line}
            className={`flex flex-wrap items-center gap-x-3.5 gap-y-2 py-2.5 ${i > 0 ? "border-t border-dashed border-border" : ""}`}
          >
            <span className="text-[13.5px] flex-1 min-w-[280px]">« {line} »</span>
            <CopyButton value={line} label="Copy" testid={`button-kit-word-${i + 1}`} />
          </div>
        ))}
      </Card>

      {/* 7 · THE GUIDE — collapsed, one click away, never in the way. */}
      <Card className="bg-card/40 border-border/50 mt-7 overflow-hidden p-0">
        <button
          type="button"
          onClick={() => setGuideOpen((v) => !v)}
          aria-expanded={guideOpen}
          aria-controls="kit-promote-guide"
          className="w-full flex items-center gap-2.5 px-5 py-3.5 min-h-12 text-left"
          data-testid="button-kit-guide"
        >
          <span className="text-sm text-foreground">How to promote — what we say, what we never say</span>
          <StatusPill tone="neutral" size="xs">
            Guide
          </StatusPill>
          <ChevronDown
            className={`ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none ${guideOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        {guideOpen ? (
          <div id="kit-promote-guide" className="px-5 pb-4">
            <div className="border-t border-dashed border-border pt-3.5 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-proof mb-1.5">What you can say</p>
                <ul className="text-[12.5px] text-muted-foreground leading-relaxed list-disc pl-4 space-y-1">
                  <li>membership · seat · receipt · proof · verify</li>
                  <li>&ldquo;every purchase is an on-chain receipt&rdquo;</li>
                  <li>&ldquo;the commission is paid inside the buyer&apos;s own transaction&rdquo;</li>
                  <li>&ldquo;don&apos;t trust me — verify the hash&rdquo;</li>
                </ul>
              </div>
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-1.5">What we never say</p>
                <ul className="text-[12.5px] text-muted-foreground leading-relaxed list-disc pl-4 space-y-1">
                  <li>promised gains, projections, &ldquo;up to X&rdquo;</li>
                  <li>invented urgency, countdowns</li>
                  <li>multi-level networks, &ldquo;recruit N more&rdquo;</li>
                  <li>anything the chain cannot prove</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mt-3">
              You must hold your seat and hold SYN to introduce others — you
              cannot recommend what you have left. A referrer who promises
              gains endangers the program: a source can be suspended. The
              artifacts above are already compliant — share them as they are.
            </p>
          </div>
        ) : null}
      </Card>

      {/* the legal seal */}
      <div className="border-t border-dashed border-border mt-7 pt-3.5">
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-2xl">
          {referralProgram.boundaryLine}
        </p>
      </div>
    </div>
  );
}
