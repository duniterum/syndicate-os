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
// V3 (the founder's desktop catch, 2026-08-03, corrected twice the same
// day): Share… is ONE always-rendered door per row, and it opens THE
// dual-share box — the ticket's R-BIND-2 surface (ShareSurface: Copy first
// → the six networks → «Share with other apps», feature-detected, the only
// channel that carries the PNG). Desktop now SHARES instead of explaining;
// mobile keeps everything. First cut shipped a 3-network subset off a
// handoff note («nous avions plus» killed it); second cut flattened the six
// into loose row icons («harmonisé comme ticket» killed that) — the box is
// the law, ONE component, guard-share-intents pins it.
//
// Truth laws: every figure on an artifact is the member's own session read
// (seat via member-standing, durable/rung via source standing) — a missing
// fact renders as absent, never invented. Export is the proven client
// raster path (DOM → svg → canvas → PNG); artifacts are fixed-ink so the
// exported picture is identical in both themes.

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { useAccount } from "wagmi";
import { ChevronDown, Download, Share2 } from "lucide-react";
import { buildJoinLink, withCard, withVia } from "@/lib/joinLink";
import { ShareSurface } from "@/components/share/ShareSurface";
import { toSvg } from "html-to-image";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { ladderProgress } from "@/config/connectorLadder";
import { referralProgram } from "@/config/referralProgram";
import { chapterForSeat, STORY_FINAL_SEAT } from "@/lib/chapters";
import { payingSourceId } from "@/lib/sourceIdentity";
import {
  dateLabel,
  useOwnIntroductions,
  type StandingReadback,
} from "@/components/referral/referralStanding";
import {
  KIT_ARTIFACTS,
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

// The ONE share text — three consumers (the OS sheet, its link-only fallback,
// the intent family). URL-FREE by the shareTargets contract: every intent
// places the member's link ITSELF (text-only builders inline it after).
const SHARE_TEXT = "The Syndicate — an on-chain introduction record.";

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
 * Copy my link · Share… — and Share… opens THE dual-share box (v3, the
 * harmonization order: the same surface as the receipt ticket). */
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
  /**
   * THE LINK THIS ROW HANDS OUT (K1.7 — the founder's «je veux chaque image»).
   * A preview shows what the URL declares, so this row's link declares THIS
   * row's face: every door below — Copy, the six networks, the OS sheet — hands
   * out the same face-bearing link, and the picture that unfurls is the card
   * this artifact carries, never a single picture for all sixteen. The link is
   * otherwise identical: `card` only chooses the painted face.
   */
  const faceLink = withCard(joinLink, spec.previewFace);
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
  // One Share… door per row — it opens THE dual-share box below the row.
  const [shareOpen, setShareOpen] = useState(false);

  /** THE one artifact-PNG delivery (v4 — the twin law). The raster → download
   * sequence already lived TWICE inside doNativeShare and once behind the
   * Download button, and the intent path was about to make a fourth: it is ONE
   * function now. `prepared` lets a caller that already rastered hand its bytes
   * over instead of paying for a second raster; an empty note downloads in
   * silence (the Download button — the file IS the feedback). A failure always
   * speaks. */
  async function deliverArtifactPng(note: string, prepared?: string | null): Promise<void> {
    let png = prepared ?? null;
    if (png === null) {
      const el = node();
      if (el === null) return;
      png = await rasterizeToPng(el, spec.width, spec.height, spec.exportScale);
    }
    if (png === null) {
      say("Couldn't prepare the image — try again");
      return;
    }
    triggerDownload(png, spec.filename);
    if (note.length > 0) say(note);
  }

  /** An intent act. A share intent carries text + a link and CANNOT carry an
   * image — every network renders the LINK's own unfurl, which is the /join
   * card, not this artifact (founder catch, 2026-08-03: sixteen Share… doors,
   * one picture, none of them the artifact). The platform half is not
   * refactorable; ours is: the member gets THIS artifact's picture, in hand,
   * while the composer he just opened is still empty. */
  const handleIntent = (label: string) => {
    if (busy !== null) return; // a raster is already in flight for this row
    setBusy("share");
    void deliverArtifactPng(`${label} opened — image downloaded, attach it before you send`)
      .finally(() => setBusy(null));
  };
  // useId, never spec.id: the og artifact mounts this row TWICE (§1 card +
  // the standing moment card) — a spec-derived id collides in the document
  // and crosses aria-controls (six-hat review, 2026-08-03).
  const surfaceId = useId();

  /** The OS sheet, carrying the artifact PNG — invoked from the box's
   * «Share with other apps» row (feature-detected there, never a dead
   * button). Honest fallbacks unchanged from the K1 arc. */
  const doNativeShare = () => {
    if (busy !== null) {
      // The row is mid-raster (a Download in flight): the box has already
      // closed, so an honest note beats a silently swallowed click
      // (six-hat review, 2026-08-03 — «never a dead button» in spirit).
      say("Still preparing the image — press Share… again in a moment");
      return;
    }
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
            text: SHARE_TEXT,
            url: faceLink,
            files: [file],
          });
        } else {
          // This engine shares links but not files — share the link,
          // hand the picture as a download (honest, never silent).
          await navigator.share({
            title: "The Syndicate",
            text: SHARE_TEXT,
            url: faceLink,
          });
          await deliverArtifactPng("Link shared — the image was downloaded", png);
        }
      } catch (e) {
        const aborted = e instanceof DOMException && e.name === "AbortError";
        if (!aborted) {
          // A real failure (activation expiry, engine quirk): the
          // member still gets the artifact + the link.
          navigator.clipboard.writeText(faceLink).catch(() => {});
          await deliverArtifactPng("Sheet unavailable — image downloaded, link copied", png);
        }
      } finally {
        setBusy(null);
      }
    })();
  };

  return (
    <>
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => {
          setBusy("download");
          // The file itself is the feedback — no note on success.
          void deliverArtifactPng("").finally(() => setBusy(null));
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
            .writeText(faceLink)
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
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => setShareOpen((v) => !v)}
        aria-expanded={shareOpen}
        aria-controls={surfaceId}
        className="inline-flex items-center gap-1.5 h-9 rounded-lg border border-border bg-card px-3 text-xs text-foreground hover:bg-muted transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-testid={`button-kit-share-${spec.id}`}
      >
        <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
        {busy === "share" ? "Preparing…" : "Share…"}
      </button>
      {/* Always-mounted live region, text-only swap — a region inserted
          together with its content is not reliably announced (2026-08-03
          audit; twin of AddSynToWallet + PressKit). */}
      <span
        role="status"
        className={note !== null ? "text-xs text-muted-foreground" : "sr-only"}
      >
        {note ?? ""}
      </span>
    </div>
    {shareOpen ? (
      <ShareSurface
        id={surfaceId}
        testid={`kit-share-surface-${spec.id}`}
        pageUrl={faceLink}
        textBare={SHARE_TEXT}
        textInline={`${SHARE_TEXT} ${faceLink}`}
        nativeAvailable={nativeShareAvailable}
        nativeHint="Sends the image too"
        onNativeShare={doNativeShare}
        // Each network gets its OWN tagged link, so a share to X counts under
        // «x» in Channels — the tab the page promises counts everything. The
        // six ids ARE the tag vocabulary (whatsapp already names itself in the
        // creators block); the breakdown is open, so no registry to extend.
        linkForTarget={(t) => withVia(faceLink, t.id)}
        // What the link cannot carry, we hand over.
        onIntent={(t) => handleIntent(t.label)}
        intentHint="Networks carry the link, not the picture — so your image downloads, ready to attach."
        onClose={() => setShareOpen(false)}
        testidBase={`kit-share-${spec.id}`}
        placementClassName="mt-2"
      />
    ) : null}
    </>
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
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      <span className="text-sm text-muted-foreground">{why}</span>
    </div>
  );
}

// ── the member's own seat facts (session read — own row, fail-closed) ───────
// M3 (2026-08-02): the same sealed readback now ALSO feeds the collectible —
// seat number, chapter chip, the entry receipt, and the oldest own indexed
// purchase day; the seniority % measures against STORY_FINAL_SEAT (the
// engraved final-seat canon). vanity stays null unless the story is WHOLE.
function useOwnSeatFacts(): { seatLine: string | null; vanity: KitFacts["vanity"] } {
  const [seatLine, setSeatLine] = useState<string | null>(null);
  const [vanity, setVanity] = useState<KitFacts["vanity"]>(null);
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;
    void Promise.all([
      import("@/wallet/walletSession"),
      import("@/wallet/sessionEvents"),
    ]).then(([ws, ev]) => {
      if (!active) return;
      const read = () => {
        void Promise.all([ws.fetchMemberStanding(), ws.fetchOwnPurchases()]).then(
          ([r, own]) => {
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
            const n = seat !== null ? Number(seat) : null;
            if (
              n !== null &&
              Number.isInteger(n) &&
              n >= 1 &&
              n <= STORY_FINAL_SEAT &&
              chapter !== null &&
              r?.receipt != null
            ) {
              // Oldest own indexed purchase day (rows are newest-first), or
              // null — the written line then degrades honestly (genesis).
              const rows = own?.rows ?? null;
              const entryDay =
                rows !== null && rows.length > 0
                  ? (rows[rows.length - 1]?.isoDayUtc ?? null)
                  : null;
              setVanity({
                seatNumber: n,
                chapterLine: `Chapter ${chapter.roman} · ${chapter.name}`,
                // Exact recognition arithmetic, trailing zeros trimmed
                // (99.9986 · 50 — never "50.0000").
                seniorityPct: (Math.round((1 - n / STORY_FINAL_SEAT) * 1e6) / 1e4).toString(),
                entryDay,
                entryBlock: r.receipt.block,
                verifyShort: `${r.receipt.transaction.slice(0, 6)}…${r.receipt.transaction.slice(-4)}`,
              });
            } else {
              setVanity(null);
            }
          },
        );
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
  return { seatLine, vanity };
}

const spec = (id: string): KitArtifactSpec => {
  const found = KIT_ARTIFACTS.find((a) => a.id === id);
  if (found === undefined) throw new Error(`unknown kit artifact: ${id}`);
  return found;
};

// ── the tab ─────────────────────────────────────────────────────────────────
export function ReferralToolsPanel({ readback }: { readback: StandingReadback | null | undefined }) {
  const { address } = useAccount();
  const s = readback?.standing ?? null;
  const { seatLine, vanity } = useOwnSeatFacts();
  const intro = useOwnIntroductions();
  const rows = intro?.rows ?? null;
  const [guideOpen, setGuideOpen] = useState(false);

  const refs = {
    og: useRef<HTMLDivElement | null>(null),
    square: useRef<HTMLDivElement | null>(null),
    story: useRef<HTMLDivElement | null>(null),
    vog: useRef<HTMLDivElement | null>(null),
    vsquare: useRef<HTMLDivElement | null>(null),
    vstory: useRef<HTMLDivElement | null>(null),
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
  const joinLink = sourceId !== null ? buildJoinLink(sourceId) : null;

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
    vanity,
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
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Your record card — the results, ready to show. Proof, not
              claims: every figure on it is on-chain and verifiable by anyone.
            </p>
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground leading-relaxed">
          The card shows only what the chain proves — your seat, your chapter,
          your durable introductions, your rung. The QR scans straight to your
          permanent link.
        </p>
      </Card>

      {/* 1b · M3 — THE COLLECTIBLE (founder-approved wireframe + mobile
          clause, 2026-08-02): the vanity face of the seat — number in
          majesty, chapter, the seniority line against the engraved
          1,000,000-seat story, the entry receipt, the member's own QR
          (&via=card). Mounts ONLY on a whole story (vanity !== null — the
          record-card precedent). STORY leads the pair (the mobile clause:
          on a stacked phone layout the native share shape comes first). */}
      {facts.vanity !== null ? (
        <>
          <SectionTitle
            title="Your collectible — the seat itself, in majesty"
            why="historical pride the chain proves — seniority, never money"
          />
          <Card className="bg-card/40 border-border/50 p-5 space-y-5" data-testid="kit-collectible">
            <div>
              <div className="overflow-x-auto pb-1">
                <ScaledPreview width={1200} height={630} scale={0.5} nodeRef={refs.vog}>
                  {spec("vog").render(facts)}
                </ScaledPreview>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <span className="font-mono text-xs text-muted-foreground">{spec("vog").label}</span>
                <ArtifactActions spec={spec("vog")} nodeRef={refs.vog} joinLink={joinLink} gold />
              </div>
            </div>
            <div className="flex flex-wrap items-start gap-6">
              <div>
                <ScaledPreview width={1080} height={1920} scale={0.135} nodeRef={refs.vstory}>
                  {spec("vstory").render(facts)}
                </ScaledPreview>
                <div className="flex flex-wrap items-center gap-2 mt-2.5 max-w-[260px]">
                  <span className="font-mono text-xs text-muted-foreground">{spec("vstory").label}</span>
                  <ArtifactActions spec={spec("vstory")} nodeRef={refs.vstory} joinLink={joinLink} />
                </div>
              </div>
              <div>
                <ScaledPreview width={1080} height={1080} scale={0.24} nodeRef={refs.vsquare}>
                  {spec("vsquare").render(facts)}
                </ScaledPreview>
                <div className="flex flex-wrap items-center gap-2 mt-2.5 max-w-[260px]">
                  <span className="font-mono text-xs text-muted-foreground">{spec("vsquare").label}</span>
                  <ArtifactActions spec={spec("vsquare")} nodeRef={refs.vsquare} joinLink={joinLink} />
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your seat, as a keepsake — the number, the chapter, and how early
              you stand in a story of 1,000,000 seats. Every line is on-chain
              and verifiable; the QR carries your own introduction link.
            </p>
          </Card>
        </>
      ) : null}

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
        <p className="text-sm text-muted-foreground leading-relaxed mt-4">
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
            <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-[300px]">
              The naked code, untouched — put it on a t-shirt, a sticker, a
              flyer, any color around it. The SVG scales to any print size
              without losing sharpness.
            </p>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed min-w-[200px] flex-1">
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
              <span className="text-sm">
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
              <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                {dateLabel(r.isoDayUtc)}
              </span>
              <span className="text-sm">
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
          <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 mb-2">
            The description block, ready to paste under a video:
          </p>
          <p className="text-xs bg-background border border-border rounded-lg p-2.5 break-all mb-2">
            The Syndicate — on-chain membership protocol on Avalanche. Every
            purchase is a verifiable receipt. My introduction link:{" "}
            {withVia(joinLink, "youtube")}
          </p>
          <CopyButton
            value={`The Syndicate — on-chain membership protocol on Avalanche. Every purchase is a verifiable receipt. My introduction link: ${withVia(joinLink, "youtube")}`}
            label="Copy the block"
            testid="button-kit-creator-youtube"
          />
          <p className="text-sm text-muted-foreground leading-relaxed mt-3 mb-2">
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
          <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 mb-2">
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
          <p className="text-sm text-muted-foreground leading-relaxed mt-1.5 mb-2">
            The story format above, plus the ready line:
          </p>
          <p className="text-xs bg-background border border-border rounded-lg p-2.5 break-all mb-2">
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
          <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">
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
            <span className="text-sm flex-1 min-w-[280px]">« {line} »</span>
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
                <p className="type-eyebrow text-proof mb-1.5">What you can say</p>
                <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-4 space-y-1">
                  <li>membership · seat · receipt · proof · verify</li>
                  <li>&ldquo;every purchase is an on-chain receipt&rdquo;</li>
                  <li>&ldquo;the commission is paid inside the buyer&apos;s own transaction&rdquo;</li>
                  <li>&ldquo;don&apos;t trust me — verify the hash&rdquo;</li>
                </ul>
              </div>
              <div>
                <p className="type-eyebrow text-muted-foreground mb-1.5">What we never say</p>
                <ul className="text-sm text-muted-foreground leading-relaxed list-disc pl-4 space-y-1">
                  <li>promised gains, projections, &ldquo;up to X&rdquo;</li>
                  <li>invented urgency, countdowns</li>
                  <li>multi-level networks, &ldquo;recruit N more&rdquo;</li>
                  <li>anything the chain cannot prove</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              You must hold SYN to introduce others — any amount, no minimum — you
              cannot recommend what you have left. A referrer who promises
              gains endangers the program: a source can be suspended. The
              artifacts above are already compliant — share them as they are.
            </p>
          </div>
        ) : null}
      </Card>

      {/* the legal seal */}
      <div className="border-t border-dashed border-border mt-7 pt-3.5">
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {referralProgram.boundaryLine}
        </p>
      </div>
    </div>
  );
}
