// components/share/ShareSurface.tsx — THE dual-share box (R-BIND-2).
//
// Engraved 2026-07-19 (founder-approved mockup) and made THE ONE
// implementation on the founder's harmonization order, 2026-08-03 («ça ouvre
// le box comme dans le ticket»): one Share button opens ONE surface —
// Copy link FIRST (the action that works everywhere) → the six network
// intents (orderedShareTargets, the engraved crypto-native order) → «Share
// with other apps» (the OS sheet, the ONLY channel that carries the image),
// feature-detected, never a dead button. The receipt ticket and the referrer
// kit both MOUNT this box; neither re-implements it (guard-share-intents).
//
// Behavior, receipts-exact: every act fires onAct (the receipts advance
// their face rotation on it); an intent or native act CLOSES the box; a copy
// never does. The url/text contract rides shareIntentArgs — ONE decision.
//
// V2 (founder catch, 2026-08-03 — the sixteen-doors-one-picture defect): a
// share INTENT carries text + a link and can never carry an image; the picture
// a network shows is the LINK's own unfurl. That is the platforms' law, not
// ours. What is ours is being honest about it and making the mount able to
// compensate — three OPTIONAL seams, all no-ops for a mount that ignores them
// (the receipt ticket, whose page already unfurls its own ticket, is unchanged):
//   · linkForTarget — the link resolved PER NETWORK, so a mount can tag it
//     with the channel it is being handed to (&via=, what Channels counts);
//   · onIntent — fired after the intent opens, so a mount can hand the member
//     what the link could not carry (the kit downloads the artifact PNG);
//   · intentHint — one line, under the six, saying what actually travels.

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { orderedShareTargets, shareIntentArgs, type ShareTargetDef } from "@/lib/shareTargets";
import { shareTargetIcons } from "@/lib/shareTargetIcons";
import { copyText } from "@/lib/clipboard";

const RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ShareSurface({
  pageUrl,
  textBare,
  textInline,
  nativeAvailable,
  nativeHint,
  onNativeShare,
  onAct,
  onIntent,
  linkForTarget,
  intentHint,
  onClose,
  id,
  testid,
  testidBase = "share",
  placementClassName = "mx-auto mt-3",
}: {
  /** The permanent page every url-param intent carries — and what Copy copies. */
  pageUrl: string;
  /** URL-FREE text (the platform places the url itself). */
  textBare: string;
  /** Full inline text for text-only intents — carries the link exactly once. */
  textInline: string;
  /** The engine truth — the OS-sheet row renders only where the sheet exists. */
  nativeAvailable: boolean;
  /** The one honest line under «Share with other apps» (what rides along). */
  nativeHint: string;
  onNativeShare: () => void;
  /** Fired after EVERY successful act (copy · intent · native). */
  onAct?: () => void;
  /** Fired after an INTENT act only, with the network it went to — the mount's
   * hook for whatever the link itself cannot carry (the kit hands over the
   * artifact PNG so the member attaches it to the post). */
  onIntent?: (target: ShareTargetDef) => void;
  /** The link this network gets, when it differs from pageUrl — the mount's
   * chance to tag the destination channel. Absent → every intent carries
   * pageUrl, exactly as before. */
  linkForTarget?: (target: ShareTargetDef) => string;
  /** One honest line under the six: what a link intent does and does not
   * carry. Absent → no line (a mount whose page already unfurls its own
   * picture has nothing to explain). */
  intentHint?: string;
  /** The box closes itself after intent/native acts — never after copy. */
  onClose: () => void;
  /** The DOM id the trigger's aria-controls points at — pass a useId-unique
   * value when the same artifact can mount more than once. */
  id?: string;
  /** Stable container testid, independent of the (possibly random) id. */
  testid?: string;
  testidBase?: string;
  placementClassName?: string;
}) {
  // THREE states, not two: an absent or refused clipboard used to end in
  // silence (2026-08-03 audit) — a failure now SAYS so on the button.
  const [copyState, setCopyState] = useState<"idle" | "done" | "failed">("idle");
  return (
    <div
      id={id}
      className={`w-[340px] max-w-full ${placementClassName} rounded-xl border border-border bg-card p-4 print:hidden`}
      data-testid={testid ?? id ?? `${testidBase}-surface`}
    >
      <button
        type="button"
        onClick={() => {
          void copyText(pageUrl).then((done) => {
            setCopyState(done ? "done" : "failed");
            window.setTimeout(() => setCopyState("idle"), 1600);
            // The rotation advances on a real copy only.
            if (done) onAct?.();
          });
        }}
        className={`w-full min-h-11 rounded-lg border border-gold/50 bg-gold/[0.08] text-gold text-sm font-medium flex items-center justify-center gap-2 hover:bg-gold/[0.12] transition-colors ${RING}`}
        data-testid={`button-${testidBase}-copy-link`}
      >
        {copyState === "done" ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4" aria-hidden="true" />
        )}
        {copyState === "done" ? "Copied" : copyState === "failed" ? "Couldn't copy" : "Copy link"}
      </button>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {orderedShareTargets.map((t) => {
          const Icon = shareTargetIcons[t.id] ?? Share2;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                // The link THIS network gets — tagged by the mount, or the page.
                const url = linkForTarget?.(t) ?? pageUrl;
                // The inline form (whatsapp · email place the link themselves)
                // must carry the SAME link: recomposed from the bare text when
                // the mount tags, so a tagged share never sends an untagged
                // link in its body. No mount tagging → byte-identical to before.
                const inline = linkForTarget === undefined ? textInline : `${textBare} ${url}`;
                const [intentUrl, intentText] = shareIntentArgs(t, url, textBare, inline);
                // Opened SYNCHRONOUSLY on the click: a window.open placed
                // behind an await loses the user activation and dies in a
                // popup blocker — the silent failure this family refuses.
                window.open(t.build(intentUrl, intentText), "_blank", "noopener,noreferrer");
                onIntent?.(t);
                onAct?.();
                onClose();
              }}
              className={`flex flex-col items-center gap-1.5 rounded-lg border border-border px-1 py-2.5 min-h-14 text-xs text-foreground hover:bg-muted transition-colors ${RING}`}
              data-testid={`button-${testidBase}-${t.id}`}
            >
              <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              {t.label}
            </button>
          );
        })}
      </div>
      {intentHint !== undefined ? (
        <p
          className="text-xs text-muted-foreground leading-relaxed mt-2.5"
          data-testid={`text-${testidBase}-intent-hint`}
        >
          {intentHint}
        </p>
      ) : null}
      {nativeAvailable ? (
        <button
          type="button"
          onClick={() => {
            onClose();
            onNativeShare();
            onAct?.();
          }}
          className={`w-full mt-3 min-h-12 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors ${RING}`}
          data-testid={`button-${testidBase}-other-apps`}
        >
          Share with other apps
          <span className="block text-xs font-normal text-muted-foreground">{nativeHint}</span>
        </button>
      ) : null}
    </div>
  );
}
