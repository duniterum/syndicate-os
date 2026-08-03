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

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { orderedShareTargets, shareIntentArgs } from "@/lib/shareTargets";
import { shareTargetIcons } from "@/lib/shareTargetIcons";

const RING = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ShareSurface({
  pageUrl,
  textBare,
  textInline,
  nativeAvailable,
  nativeHint,
  onNativeShare,
  onAct,
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
  const [copied, setCopied] = useState(false);
  return (
    <div
      id={id}
      className={`w-[340px] max-w-full ${placementClassName} rounded-xl border border-border bg-card p-4 print:hidden`}
      data-testid={testid ?? id ?? `${testidBase}-surface`}
    >
      <button
        type="button"
        onClick={() => {
          // Optional-chained: an insecure-context rig has no clipboard —
          // the old box's try/await caught that; the bare chain threw
          // synchronously (six-hat review, 2026-08-03).
          navigator.clipboard
            ?.writeText(pageUrl)
            .then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
              onAct?.();
            })
            .catch(() => {});
        }}
        className={`w-full min-h-11 rounded-lg border border-gold/50 bg-gold/[0.08] text-gold text-sm font-medium flex items-center justify-center gap-2 hover:bg-gold/[0.12] transition-colors ${RING}`}
        data-testid={`button-${testidBase}-copy-link`}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <div className="grid grid-cols-3 gap-2 mt-3">
        {orderedShareTargets.map((t) => {
          const Icon = shareTargetIcons[t.id] ?? Share2;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                const [intentUrl, intentText] = shareIntentArgs(t, pageUrl, textBare, textInline);
                window.open(t.build(intentUrl, intentText), "_blank", "noopener,noreferrer");
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
