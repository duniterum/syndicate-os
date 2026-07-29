// headerControls.ts — the dress of the header's icon controls. ONE decision.
//
// THE DEFECT (founder-caught 2026-07-28, from a screenshot of /join; measured in
// the browser before this file existed). The two icon buttons that sit SIDE BY
// SIDE in the public header were written in two different files, at two different
// times, and each answered the same question for itself:
//
//                    Toggle theme          Toggle menu
//   file             ThemeToggle.tsx       PublicLayout.tsx
//   box              36 × 36               44 × 44
//   corner radius    6px  (rounded-md)     12px (rounded-xl)
//   border           transparent           gold 30%
//   background       none                  gold 8%
//
// Two neighbours of the same rank, dressed as two different kinds of control —
// and the reason is structural, not aesthetic: nobody decided it, two files did.
// This is CLAUDE.md ① (a rule that lives in 2+ places becomes ONE place and is
// imported) applied to a visual decision instead of a constant.
//
// WHAT IS KEPT AND WHAT IS UNIFIED. The menu button's EMPHASIS is correct and
// stays: on a phone the hamburger is the primary navigation affordance, the one
// control a visitor must find, and colour is the right way to say so. What was
// never a decision is the SHAPE — the radius and the ground now come from here,
// so the pair reads as a pair and emphasis is carried by colour alone.
//
// THE SIZE IS DELIBERATELY NOT HERE, and this is the second defect, caught by
// measuring the fix itself. The first version pinned `min-h-11 min-w-11` (44px)
// unconditionally so the mobile pair would match. Measured at 1440px, that made
// the theme toggle the ONLY 44px control in a header row of 36px chips and
// buttons — 8px taller than every neighbour and sitting 4px higher than the row's
// baseline. 44px is a TOUCH floor (Apple HIG / Material; WCAG 2.5.5 is level AAA
// and the AA rule, 2.5.8, is 24×24), not a desktop size. So the box comes from
// the Button atom's `size="icon"` variant, which already carries
// `.touch-target-square` — the 44px floor defined ONCE in index.css under
// `@media (pointer: coarse)`. A finger gets 44, a mouse keeps the header's 36px
// rhythm, and the pair matches in BOTH regimes because they share one atom.

/** Shared corner — the header's icon controls are one family. */
const HEADER_ICON_SHAPE = "rounded-xl";

/** The quiet one: no ground of its own, it belongs to the header's own surface. */
export const HEADER_ICON_QUIET = `${HEADER_ICON_SHAPE} border border-transparent`;

/** The emphasised one: same shape, gold ground — the primary mobile nav affordance. */
export const HEADER_ICON_PRIMARY = `${HEADER_ICON_SHAPE} border border-gold/30 bg-gold/8 text-gold`;
