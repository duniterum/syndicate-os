// components/proof/ProofAnchor.tsx — THE ONE PROOF ANCHOR.
// ---------------------------------------------------------------------------
// "Don't trust — verify" is the protocol's whole proposition, so the control that
// carries it is the most important repeated object on the site. It was also, until
// 2026-07-26, the least designed: a bare 10-12px uppercase string with no box, no
// padding and no focus ring — measured at 59 × 16px, against a 44px touch floor.
// The /activity rebuild gave the feed row a real 112 × 44px button; the first-visit
// review then found the SAME defect still standing on /fire-ledger and in the
// sealed-milestone rows, and said plainly: do not copy those classes a second
// time — extract them once. This is that atom.
//
// GEOMETRY IS FROM THE APPROVED MOCKUP (§②): 112px minimum width so the label
// never reflows, 44px minimum height so a thumb can hit it, the proof cyan on its
// own tinted ground (the house chip grammar, which holds contrast in BOTH themes —
// a solid fill failed light mode at the rig), and a gold focus ring because a
// keyboard user must SEE where they are.
//
// `compact` exists for dense lists (a nine-row sealed record inside an expander),
// and it still clears the 44px floor — it trades WIDTH for room, never height,
// because height is the accessibility constraint and width is only typography.

import { ExternalLink } from "lucide-react";

// The DISPLAY class stays literal on the element below, never hidden in here:
// `guard-nav-display` reads the className at the site, and it is right to — an
// anchor that inherits `inline` fragments its own hover/focus paint across line
// boxes (the recurring vertical-bar bug). A guard that cannot see the class
// cannot protect the rule.
const BASE =
  "min-h-11 items-center justify-center gap-1.5 rounded-[10px] border border-proof bg-proof/10 font-mono text-sm font-bold uppercase tracking-wider text-proof transition-colors hover:border-proof-hover hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-card";

export function ProofAnchor({
  href,
  label = "Verify",
  compact = false,
  title,
}: {
  href: string;
  label?: string;
  /** Dense lists: narrower, never shorter (the 44px floor is not negotiable). */
  compact?: boolean;
  title?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex ${BASE} ${compact ? "min-w-20 px-2.5" : "min-w-28 px-3.5"}`}
      title={title ?? "Open the transaction on the block explorer"}
    >
      {label}
      <ExternalLink className="h-3 w-3" aria-hidden="true" />
    </a>
  );
}
