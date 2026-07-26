// components/disclosure/Disclosure.tsx — THE DESIGNED COLLAPSIBLE (Founder
// ruling at the /activity preview, 2026-07-26: "et les parties collapsibles ne
// font pas partie de ton travail de design ??!!!").
// ---------------------------------------------------------------------------
// HE WAS RIGHT, AND THE OMISSION HAS A SHAPE. The WORK-FIRST law sends every
// piece of reference material into a collapsed expander at the bottom of a page.
// So the expander is not a leftover — it is where a large share of the site's
// honesty LIVES, and it was the one control nobody had designed. What shipped
// before this atom, on the most public page we serve:
//   · a bare `<summary>` with the browser's default ▸ triangle, at 12-14px,
//   · no focus ring — a keyboard user could not see what they had landed on,
//   · a hit target the height of one line of text, far under the 44px floor,
//   · and, once open, a wall of 12px prose at the full width of a 27-inch
//     screen, i.e. ~200 characters a line, which nobody reads.
//
// WHAT THIS ATOM GUARANTEES INSTEAD, for every collapsible on the site:
//   ① a real ROW as the control — chevron + title + optional count — with
//      `min-h-11` (the 44px touch floor) and a visible gold focus ring;
//   ② a chevron that ROTATES with the open state, so the affordance is the
//      same object in both states rather than two different glyphs;
//   ③ the native `<details>` element underneath — it keeps keyboard support,
//      find-in-page inside closed content on modern engines, and works with
//      JavaScript disabled, none of which a div-and-state version gives;
//   ④ a body whose reading copy is BOUNDED in characters (`measure`), so
//      opening a section on a wide screen produces a column, not a wall.
//
// `list-none` + `[&::-webkit-details-marker]:hidden` removes the default
// triangle in both engine families; the chevron replaces it deliberately.

import { ChevronRight } from "lucide-react";

export function Disclosure({
  title,
  count = null,
  hint = null,
  defaultOpen = false,
  className = "",
  testId,
  children,
}: {
  /** The control's label — say what is inside, in human words. */
  title: string;
  /** An honest count of what opening reveals (null = nothing to count). */
  count?: number | null;
  /** A short clause after the title: what the reader gets, not how it works. */
  hint?: string | null;
  defaultOpen?: boolean;
  className?: string;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className={`group rounded-xl border border-border/60 bg-card/20 ${className}`}
      data-testid={testId}
    >
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold [&::-webkit-details-marker]:hidden">
        <ChevronRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-foreground">{title}</span>
        {count !== null ? (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            ({count.toLocaleString("en-US")})
          </span>
        ) : null}
        {hint !== null ? (
          <span className="hidden text-sm text-muted-foreground sm:inline">
            — {hint}
          </span>
        ) : null}
      </summary>
      <div className="border-t border-border/60 px-3.5 py-3.5">{children}</div>
    </details>
  );
}
