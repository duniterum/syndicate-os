// lib/contentLink.ts — the ONE inline-link treatment for links living in Cards
// (outside the <Prose> subtree, so they inherit none of its `[&_a]` styling).
// ---------------------------------------------------------------------------
// Extracted 2026-07-30 (footer audit): /faq solved this with a local constant
// (cyan/primary, underlined, VISIBLE focus ring) while /docs hand-typed the
// same treatment WITHOUT the focus-visible ring — a keyboard user got a ring
// on one sibling and none on the other. One decision, imported (Check ①/④).

export const CONTENT_LINK_CLS =
  "text-primary underline underline-offset-2 decoration-primary/40 hover:decoration-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:rounded-sm";
