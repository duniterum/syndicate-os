// guard-touch-target.ts — THE 44px FLOOR (Apple HIG / Material), made structural. BLOCKING.
// ---------------------------------------------------------------------------
// THE AUTHORITY. ADR-001, amendment 2026-07-16 (bis) « LA RÈGLE DE LA SURFACE
// FLUIDE », clause 4, researched against Apple HIG and Material: « Cibles
// tactiles ≥ 44px (Apple 44 / Material 48) avec ≥ 8px d'espacement ». The same
// amendment records that the rule was APPLIED that day to exactly one place —
// « puces 44px », the member shell's mobile nav chips — and that « le reste du
// site suit la même règle à chaque tranche qui le touche ». Ten days of tranches
// later, the rest of the site had not followed.
//
// THE DEFECT THAT MOTIVATED THIS FILE (senior review, 2026-07-26). On /activity,
// the PUBLIC record's most-clicked control — the per-row `verify` anchor, the
// row's entire reason to exist — carries no box height at all: `inline-flex …
// text-xs`, a 16px line box, UNDER A QUARTER of the floor. Two hundred pixels
// away in the same bar, the facet chips were deliberately padded `py-3.5` to
// REACH 44px, with a code comment citing this very ADR clause. The `Re-read`
// button next to them is 32px (`size="sm"` → min-h-8, then `h-7` on top);
// `Load more` is 36px (the Button atom's own default). So the rule was known,
// cited, applied once, and ignored everywhere else in the same component. That
// is the diagnosis this guard exists to end: « the page passes every design law
// that has a guard behind it, and fails most of the laws that do not — that is
// not a coincidence, it is the diagnosis. »
//
// WHY THE FLOOR IS ENCODED AND THE SCALE IS NOT. A separate workstream is
// re-basing the type and spacing scale (the founder judged the live page « à
// peine lisible sur un 27 pouces » and « trop condensé »). So this guard pins
// the RULE — 44 CSS px of vertical tap area — and READS the scale out of
// src/index.css at every run: `--spacing` drives every `h-N`/`py-N`, and any
// `--text-*` override drives the line box. Re-base the scale and this guard
// re-measures against the new one without a line changing. It never pins
// today's `h-9` as correct; it pins that a control must reach 44.
//
// ── WHAT IT COMPUTES ───────────────────────────────────────────────────────
// For each interactive element (`<button> <a> <Link> <NavLink> <Button>
// <input> <select> <textarea>`) it reads the element's own static classes and
// derives an outer height:
//   · explicit height — `h-N` / `min-h-N` / `size-N` / `h-[Npx]` / `min-h-[Npx]`.
//     Spacing unit × N. `min-height` beats `height` in CSS when it is larger, so
//     the larger of the two wins (that is why `size="sm"` + `h-7` computes 32px,
//     not 28: `min-h-8` outranks it).
//   · otherwise the padding box — `py`/`pt`/`pb`/`p` + the text's line box +
//     2px per border pair (with `box-sizing: border-box` and an auto height, the
//     border still adds to the outer height).
//   · the line box comes from the size class's line-height (Tailwind's defaults,
//     or an `--text-*` override in index.css), and any `leading-*` on the element
//     overrides it.
//   · the `<Button>` atom's own size variant is MERGED UNDER a call site's
//     classes, so a call site is measured as it actually renders.
//
// ── WHAT IT CANNOT SEE — the honest limits, none of them guesses ────────────
// ① NO LAYOUT ENGINE. It reads classes, not a rendered box. A height that comes
//    from a parent's `items-stretch`, a grid row, an absolutely-positioned
//    overlay, or a CSS file rule is invisible. Elements it cannot compute are
//    COUNTED and printed in the PASS line as the size of its own blind spot —
//    never silently treated as compliant.
// ② TOUCH IS READ AT THE MOBILE-FIRST BASE. Only unprefixed classes are
//    measured, because the 44px floor is a TOUCH floor and the base is the touch
//    regime. `py-3.5 sm:py-1` — 44px on a phone, a compact bar on a desktop — is
//    the ADR's own applied example and passes deliberately. THE GAP: a
//    touch-capable tablet or laptop at ≥640px receives the compacted variant, and
//    no static scan can know the input modality. A `sm:`-compaction is a human
//    judgement this guard permits, not one it verifies.
// ③ ARBITRARY TEXT SIZES HAVE NO KNOWN LINE BOX. `text-[10px]` sets font-size
//    only and inherits line-height, so the line box is genuinely unknowable
//    statically. The guard uses size × 1.5 — the ADR's own leading floor,
//    « interligne ≥ 1,5 » — which OVER-states the line box and can therefore only
//    ever make the guard more forgiving, never produce a false red.
// ④ CONDITIONAL CLASSES ARE READ LENIENTLY. From `cn(a ? "h-7" : "h-11")` it
//    takes the LARGEST height any branch could produce. A control that is short
//    in one branch only will pass. Lenient by choice: a false red on a design law
//    costs founder trust.
// ⑤ EXPANDED HIT AREAS ARE ONLY PARTLY DETECTABLE. A small visual target may
//    legitimately meet the floor through an invisible expansion. The guard
//    ACCEPTS the pseudo-element form it can see — `after:absolute`/`before:absolute`
//    paired with a negative `-inset`/`-inset-y` (the shadcn sidebar rail pattern).
//    It CANNOT see A WRAPPING `<label>`, which is the live case in this tree: the
//    FAQ and Guide search inputs carry no box of their own (a bare 20px line box
//    to this guard) because the `<label>` around them holds the padding — the
//    real targets are 42px and 38px. Both are still short, so the verdict here
//    happens to be right, but the NUMBER is not, and a fix belongs on the label,
//    not the input. Their allowlist reasons say so. It equally cannot see a
//    parent's padding acting as the target or a hit area declared in a CSS file:
//    those belong in the allowlist with the reason written as "hit area expanded
//    by X / real target Npx", so the claim is recorded and a human can check it.
// ⑥ A `<div onClick>` IS NOT AN ELEMENT IT LOOKS AT. There is exactly one in the
//    tree today (counted and reported at every run, so a growth in that class is
//    visible); a tap target that is not a real control is a separate defect that
//    `guard-access-state` territory and review own, not this file.
// ⑦ `components/ui/**` IS OUT OF THE PER-ELEMENT SCAN — vendored shadcn
//    primitives are library surface, not authored composition, and most of them
//    wrap Radix components whose tag names are not HTML controls at all. The
//    THREE atoms this product actually renders are pinned individually in §②
//    instead, which is where a height fix belongs: one line, every call site.
//    A newly-adopted primitive needs its own §② pin, in the slice that puts it
//    in service.
// ⑧ WIDTH IS NOT CHECKED. Apple HIG and Material state a 44/48px target in BOTH
//    axes, and ≥8px of spacing between neighbours. This guard measures HEIGHT
//    only — the axis the defect lived in, and the only one a static class read
//    can get right (width is overwhelmingly `w-full`/flex-derived here). Width
//    and spacing remain human review.
//
// ── THE INLINE-LINK EXCEPTION, drawn deliberately ──────────────────────────
// WCAG 2.5.8 Target Size (Minimum) exempts a target « in a sentence or whose
// size is otherwise constrained by the line-height of non-target text ». A guard
// that fired on every link inside a paragraph would be useless and would be
// switched off. The line drawn here: a link that declares A BOX OF ITS OWN —
// `inline-flex`/`flex`/`grid`/`block`, or its own padding, or a `rounded`/`border`
// ground — is a STANDALONE CONTROL and owes the floor. A link that declares no
// box is flowing inside text, constrained by its line-height, and is exempt.
// THE COST OF THAT LINE, stated: a standalone control written with no box class
// at all — a bare `<a className="text-xs text-proof">` alone in a meta rail —
// reads to this guard as inline text and is NOT caught. The box declaration is
// the signal; a control without one is invisible here.
//
// ── THE ALLOWLIST IS THE DEBT COUNTER ──────────────────────────────────────
// Keyed by file (repo-relative to src), each with a WRITTEN REASON, split PUBLIC
// vs MEMBER/ADMIN because a public control is the one a first-time visitor taps.
// A listed file forgives every short control it holds — the same shape as
// guard-fluid-surface — so the PASS line prints BOTH the entry count and the
// total occurrences forgiven. Both numbers can only ever shrink. When the type
// and spacing scale lands, the atom entries in §② go first and take most of the
// call sites with them.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");
const FLOOR = 44; // CSS px. Apple HIG 44 / Material 48 → ADR-001 amendment 2026-07-16 (bis) §4.

// ── THE DEBT ────────────────────────────────────────────────────────────────
// Counted 2026-07-26 against the tree at that commit: 92 short controls in 45
// files. Every count below was READ off the guard's own audit output, never
// estimated. Since 2026-07-30 the atoms (Button, Input, Textarea) are all AT
// the floor and may never re-enter this list — §⑤ makes an atom entry, or any
// entry that forgives nothing, a RED build.
//
// PUBLIC surfaces — what a visitor who has never signed in taps. These are the
// ones that matter first: a control a thumb misses on a public page is a
// conversion lost before anyone is a member.
const PUBLIC_DEBT: Record<string, string> = {
  "components/layout/PublicLayout.tsx":
    "(6) the site header and footer, on EVERY public page: the brand/social icon anchors at 36px (h-9), the desktop nav pills at 32px, the mobile drawer rows at 36px, two footer links at a bare 20px line box. Part of the header-affordance sweep ADR-001 already owed at its 2026-07-16 note. The mobile drawer's own trigger and rows were separately brought to min-h-11 and pass (2026-07-26).",
  "components/faq/FaqAccordion.tsx":
    "(3) the search input reads 20px HERE but its real target is the wrapping <label> at 42px (px-3 py-2.5 + border) — 2px short, and the fix goes on the LABEL, not the input (limit ⑤); plus a 15px `Clear` button and a 29px `text-[10px]` category chip, both with genuinely their own box. Rides the sub-12px sweep, which re-sizes the text and the target in one pass (2026-07-26).",
  "components/guide/SyndicateGuide.tsx":
    "(3) the search input reads 20px HERE but its real target is the wrapping <label> at 38px (px-2.5 py-2 + border) — 6px short, fix on the LABEL (limit ⑤); plus a `text-[10px]` meta anchor at 15px and a 38px action (2026-07-26).",
  "components/hero/HeroLedger.tsx": "(1) a ledger stepper button at min-h-10 = 40px — 4px short (2026-07-26).",
  "components/hero/ProtocolOverviewPanel.tsx":
    "(1) a `text-[10px]` meta anchor, 15px — same sub-12px sweep (2026-07-26).",
  "components/living/SectionIndex.tsx": "(1) an index row link at 28px (py-1 + text-sm) (2026-07-26).",
  "components/receipt/PublicReceiptPanel.tsx":
    "(1) the public receipt's explorer anchor, a 16px line box (2026-07-26).",
  "components/season/HomeSeasonSection.tsx":
    "(1) a `text-[10.5px]` explorer anchor at 16px. The section's CTA reaches the floor and is counted compliant (2026-07-26).",
  "components/referral/ShareMenu.tsx":
    "(2) the share menu rows at 36px — a menu list, the class Material sizes at 48 (2026-07-26).",
  "pages/FireLedger.tsx": "(1) a `text-[10px]` explorer anchor, 15px (2026-07-26).",
  "pages/JoinProtocol.tsx":
    "(1) a `text-[10px]` explorer anchor, 15px, on the conversion page. Its amount keypad is at min-h-11 and passes (2026-07-26).",
  "pages/PublicHome.tsx": "(1) one 30px pill link in the hero band (2026-07-26).",
  "pages/SeasonRanking.tsx":
    "(3) two 34px season facet chips and a `text-[10.5px]` explorer anchor at 16px on every ranked row (2026-07-26).",
  "wallet/PublicReceiptTicket.tsx": "(1) the public ticket's explorer anchor, 16px line box (2026-07-26).",
};

// MEMBER / ADMIN surfaces — behind the sign-in wall or the operator wall. 26
// files, 56 occurrences. Later in the queue than the public set, never exempt:
// the founder runs the admin console on a phone.
const MEMBER_ADMIN_DEBT: Record<string, string> = {
  "components/member/ChronicleLatest.tsx": "(1) a 16px 'read' link on the member card (2026-07-26).",
  "components/member/ProtocolSnapshot.tsx": "(1) a 16px 'see all' link on the member card (2026-07-26).",
  "components/referral/MemberReferralDashboard.tsx":
    "(1) the dashboard tab strip at 40px — 4px short (2026-07-26).",
  "components/referral/NotificationComposerFields.tsx":
    "(2) two 32px composer controls (h-8) in the broadcast composer (2026-07-26).",
  "components/referral/ReferralCommissionsPanel.tsx":
    "(5) the commissions table's own control set: four h-9 = 36px buttons and one h-8 = 32px (2026-07-26).",
  "components/referral/ReferralIntroductionsPanel.tsx": "(1) an explorer anchor, 16px line box (2026-07-26).",
  "components/referral/ReferralOverviewPanel.tsx": "(1) a 20px 'see all' link (2026-07-26).",
  "components/referral/ReferralToolsPanel.tsx": "(5) five h-9 = 36px tool buttons (2026-07-26).",
  "pages/admin/AdminHome.tsx": "(2) two console actions at 32/34px (2026-07-26).",
  "pages/admin/memberLedger.tsx":
    "(2) on the founder's register — remeasured 2026-07-30 by this guard's own count ratchet (the 2026-07-26 entry said 3; one control has since been fixed without the entry moving).",
  "pages/admin/sections.tsx": "(1) the admin tab strip at 40px — 4px short (2026-07-26).",
  "pages/admin/SourcePerformancePanel.tsx":
    "(1) a 22px filter chip (py-0.5) — the shortest control in the tree after the bare line-box anchors (2026-07-26).",
  "pages/OperatorPreview.tsx": "(1) a 20px back link (2026-07-26).",
  "wallet/JoinCheckout.tsx": "(1) a `text-[10px]` explorer anchor, 15px, on the checkout receipt (2026-07-26).",
  "wallet/MemberAttention.tsx": "(2) attention-lane action links, 16px line boxes (2026-07-26).",
  "wallet/MemberHeaderAffordance.tsx":
    "(2) a 32px icon button and a 16px meta anchor in the member header (2026-07-26).",
  "wallet/MemberNotificationsBell.tsx":
    "(1) the bell's panel filter chip — remeasured 2026-07-30 by the count ratchet (the 2026-07-26 entry said 2; the 36px trigger has since been fixed without the entry moving).",
  "wallet/MemberNotificationsPanel.tsx": "(1) a 26px filter chip (2026-07-26).",
  "wallet/MemberSettings.tsx": "(1) a 30px pill link (2026-07-26).",
  "wallet/MemberYourSeat.tsx": "(3) three pill links at 30px on the seat card (2026-07-26).",
  "wallet/ProposeSourceCreate.tsx":
    "(7) the largest single entry — the operator's source-proposal flow; remeasured 2026-07-30 by the count ratchet (the 2026-07-26 entry said 10; three controls have since been fixed without the entry moving).",
  "wallet/ProposeSourcePromotion.tsx": "(1) a 34px address field (2026-07-26).",
  "wallet/ReceiptsBinderPanel.tsx": "(3) two 36px binder controls and a 16px explorer anchor (2026-07-26).",
  "wallet/ReceiptTicket.tsx":
    "(1) the ticket's 37px footer link — 7px short. Its four action buttons were already brought to min-h-11 and pass (2026-07-26).",
};

const ALLOWLIST: Record<string, string> = { ...PUBLIC_DEBT, ...MEMBER_ADMIN_DEBT };

let failures = 0;
const fail = (m: string) => {
  failures += 1;
  console.error(`  ✗ ${m}`);
};

// ── THE LIVE SCALE, read out of index.css (never hardcoded) ─────────────────
const css = readFileSync(join(SRC, "index.css"), "utf8");
const remPx = 16; // the root size; the ADR's floors are all stated in px against it.
const toPx = (v: string): number | null => {
  const m = /^(-?\d*\.?\d+)(rem|px)$/.exec(v.trim());
  if (!m) return null; // clamp(), calc(), var() → not statically knowable
  return m[2] === "rem" ? parseFloat(m[1]!) * remPx : parseFloat(m[1]!);
};
// `--spacing` drives EVERY h-N / py-N / p-N. Tailwind v4's default is 0.25rem.
// If the scale workstream re-bases it, this guard re-measures against the new
// unit; it never assumes 4px.
const spacingDecl = /--spacing:\s*([^;]+);/.exec(css);
const UNIT = spacingDecl ? toPx(spacingDecl[1]!) : 4;
if (UNIT === null || !(UNIT > 0)) {
  fail(`index.css declares --spacing: ${spacingDecl?.[1]?.trim()} — not a static rem/px value, so no h-N/py-N can be measured. Give the guard a static unit or pin the affected controls in px.`);
}
const unit = UNIT ?? 4;

// THE TOUCH FLOOR CLASS — parsed out of index.css's real coarse-pointer block, never
// typed here.
// ⛔ CORRECTED 2026-07-29 — THE 2026-07-27 CLAIM ON THIS LINE WAS A MEASUREMENT ERROR.
// Tailwind's coarse-pointer variant DOES compile normally in this build: verified against
// the project's own `vite build`, whose emitted stylesheet carries the variant's rule
// inside a real coarse-pointer media block. Two compounding traps produced the false
// negative: Tailwind CSS-ESCAPES the colon in the selector, so a search for the class as
// AUTHORED can never match the CSS as EMITTED; and the DEV SERVER serves the rule NESTED
// inside its class rule rather than as a top-level media rule, so a CSSOM walk over
// top-level rules counts none. The dev server is not what ships.
// THE BLOCK BELOW IS KEPT, on the correct reason: a NAMED class lets this guard PARSE the
// 44px out of the CSS that actually ships, instead of trusting a class string it can only
// assume compiles — and deleting the block turns the build RED. ADR-001 amendment
// 2026-07-16 bis §4 (Apple HIG 44 / Material 48); WCAG 2.5.5 44×44 is level AAA, the AA
// rule 2.5.8 is 24×24 — so it applies to the coarse pointer only.
// A pin that cannot be READ is a FAILURE, never a silent pass.
const coarseBlock = /@media\s*\(\s*pointer\s*:\s*coarse\s*\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? null;
/** Parse ONE class's min-height out of the coarse block. `\b` stops
 *  `.touch-target` from matching `.touch-target-square {`. */
function coarseFloorOf(cls: string): number | null {
  if (coarseBlock === null) return null;
  const m = new RegExp(`\\.${cls}\\s*\\{[^}]*min-height:\\s*([\\d.]+)(rem|px)`).exec(coarseBlock);
  if (!m) return null;
  return m[2] === "rem" ? parseFloat(m[1]!) * remPx : parseFloat(m[1]!);
}
const TOUCH_CLASS_PX: number | null = coarseFloorOf("touch-target");
// THE SQUARE VARIANT WAS NEVER PARSED (2026-07-29 review, confirmed and worse than
// declared). The measure CREDITED `.touch-target-square` with `.touch-target`'s
// value while nothing ever read the square rule — so deleting that rule from
// index.css was SILENT, and its only carriers are the header's theme toggle and
// menu button. A pin that cannot be READ is a FAILURE, never a silent pass — this
// file's own words, three sections above, unapplied to its own second class.
const TOUCH_SQUARE_PX: number | null = coarseFloorOf("touch-target-square");
if (coarseBlock === null) {
  fail(
    "index.css has no `@media (pointer: coarse)` block, so `.touch-target` renders NOTHING and every Button " +
      "carrying it is back at its base height. The named class exists so this guard can PARSE the floor out " +
      "of the CSS that ships instead of assuming a class string compiles — restore the block or this guard " +
      "is certifying a height no browser applies.",
  );
} else if (TOUCH_CLASS_PX === null) {
  fail("index.css's `@media (pointer: coarse)` block defines no `.touch-target { min-height: … }` — the touch floor cannot be read.");
} else if (TOUCH_CLASS_PX < FLOOR) {
  fail(`index.css's \`.touch-target\` is ${TOUCH_CLASS_PX}px, under the ${FLOOR}px floor it exists to enforce.`);
}
// The square variant carries the header's icon pair. It is now READ, not assumed.
if (coarseBlock !== null && TOUCH_SQUARE_PX === null) {
  fail(
    "index.css's `@media (pointer: coarse)` block defines no `.touch-target-square { min-height: … }`. " +
      "The header's theme toggle and menu button carry that class and nothing else gives them a floor — " +
      "this guard used to CREDIT them `.touch-target`'s value without ever reading the square rule, so " +
      "deleting it was silent.",
  );
} else if (TOUCH_SQUARE_PX !== null && TOUCH_SQUARE_PX < FLOOR) {
  fail(`index.css's \`.touch-target-square\` is ${TOUCH_SQUARE_PX}px, under the ${FLOOR}px floor.`);
}

// Font size → [font-size, line box]. Tailwind v4 defaults; an `--text-<name>`
// declaration in index.css WINS, with its paired `--text-<name>--line-height`
// if present and the ADR's 1.5 leading floor otherwise.
const TW_TEXT: Record<string, [number, number]> = {
  "text-xs": [12, 16],
  "text-sm": [14, 20],
  "text-base": [16, 24],
  "text-lg": [18, 28],
  "text-xl": [20, 28],
  "text-2xl": [24, 32],
  "text-3xl": [30, 36],
  "text-4xl": [36, 40],
};
for (const name of Object.keys(TW_TEXT)) {
  const key = name.slice("text-".length);
  const decl = new RegExp(`--text-${key}:\\s*([^;]+);`).exec(css);
  if (!decl) continue; // no override → the framework default above stands
  const px = toPx(decl[1]!);
  if (px === null) continue; // a clamp()/calc() token — not statically knowable, default stands
  const lh = new RegExp(`--text-${key}--line-height:\\s*([^;]+);`).exec(css);
  const lhPx = lh ? toPx(lh[1]!) : null;
  TW_TEXT[name] = [px, lhPx ?? Math.round(px * 1.5)];
}
// The house type classes (index.css). Only the ones with a STATIC font-size —
// `type-body`/`type-display` are clamp() and stay out of reach by construction.
const HOUSE_TEXT: Record<string, [number, number]> = {};
for (const [cls, sizeVar, lead] of [
  ["type-label", "--text-label", 1.3],
  ["type-caption", "--text-caption", 1.3],
  // Added 2026-07-27 WITH the class it names, and the reason is worth keeping:
  // `.type-eyebrow` replaced 23 hand-typed `text-xs`/`text-[10px]` labels, and 3
  // of them were anchors this guard had MEASURED as short. Without this line the
  // guard stopped being able to resolve their font size, so they silently left
  // "measured SHORT" (84 → 81) and joined "NOT statically knowable" (40 → 43) —
  // the debt counter would have printed −3 as if something had been fixed. A
  // house type class must land here in the same commit that creates it, or this
  // guard grades a smaller site than it reports.
  ["type-eyebrow", "--text-caption", 1.3],
] as const) {
  const decl = new RegExp(`${sizeVar}:\\s*([^;]+);`).exec(css);
  const px = decl ? toPx(decl[1]!) : null;
  if (px !== null) HOUSE_TEXT[cls] = [px, Math.round(px * lead)];
}
for (const [cls, size, lead] of [
  ["syn-eyebrow", 12, 1.1],
  ["syn-label", 12, 1.15],
  ["syn-caption", 12, 1.2],
] as const) {
  // These three are literal px in index.css; read them so a re-base is picked up.
  const decl = new RegExp(`\\.${cls}\\s*\\{[^}]*font-size:\\s*([^;]+);`).exec(css);
  const px = decl ? toPx(decl[1]!) : size;
  HOUSE_TEXT[cls] = [px ?? size, Math.round((px ?? size) * lead)];
}
const TEXT: Record<string, [number, number]> = { ...TW_TEXT, ...HOUSE_TEXT };

// The utility class that MEANS "the floor", derived from the live unit rather
// than written down. Today `min-h-11`; if the spacing unit is re-based, the
// advice this guard prints re-bases with it instead of teaching a stale class.
const FLOOR_CLASS = Number.isInteger(FLOOR / unit) ? `min-h-${FLOOR / unit}` : `min-h-[${FLOOR}px]`;

const LEADING: Record<string, number> = {
  "leading-none": 1,
  "leading-tight": 1.25,
  "leading-snug": 1.375,
  "leading-normal": 1.5,
  "leading-relaxed": 1.625,
  "leading-loose": 2,
};

// ── THE MEASURE ─────────────────────────────────────────────────────────────
// Returns the outer height in px, or null when it is not statically knowable.
// `how` is carried so a violation line can show its own arithmetic.
type Measured = { px: number; how: string } | null;

function measure(classes: string[]): Measured {
  // Only the MOBILE-FIRST BASE. A `sm:`/`md:`/`lg:` variant is a desktop
  // refinement; the 44px floor is a touch floor (limit ② in the header).
  //
  // ONE EXCEPTION, and it is the header's own reasoning turned around (added
  // 2026-07-27). Limit ② reads touch at the base BECAUSE "no static scan can
  // know the input modality" — a `sm:` breakpoint is a WIDTH, and a touch-capable
  // laptop at ≥640px would wrongly receive the compaction. `.touch-target` is not
  // a width: it is `@media (pointer: coarse)` in index.css, the modality itself,
  // applying to exactly the finger this floor exists for. So it is read AS the
  // touch regime. It can only ever RAISE — it is a `min-height`, so a control
  // already taller keeps its own height.
  //
  // AND IT IS READ OUT OF THE CSS, never typed here. The first version of this
  // rule was justified by a claim that the variant produces no CSS in this
  // build: the served stylesheet carried zero `pointer:` media rules while this
  // guard reported 15 controls fixed. TOUCH_FLOOR_PX below is parsed from the
  // real block, and its absence is a FAILURE, so that lie cannot be told twice.
  const base = classes.filter((c) => !/^[a-z0-9-]+:/.test(c));
  if (TOUCH_CLASS_PX !== null && base.some((c) => c === "touch-target" || c === "touch-target-square")) {
    const bare = measure(base.filter((c) => c !== "touch-target" && c !== "touch-target-square"));
    if (!bare || TOUCH_CLASS_PX > bare.px) return { px: TOUCH_CLASS_PX, how: `.touch-target (@media pointer:coarse) = ${TOUCH_CLASS_PX}px` };
    return bare;
  }

  // ① an explicit height. min-height outranks height when larger (CSS), so max().
  let explicit: number | null = null;
  let explicitHow = "";
  for (const c of base) {
    let m: RegExpExecArray | null;
    let v: number | null = null;
    if ((m = /^(?:min-)?h-\[(\d*\.?\d+)px\]$/.exec(c))) v = parseFloat(m[1]!);
    else if ((m = /^(?:min-)?h-\[(\d*\.?\d+)rem\]$/.exec(c))) v = parseFloat(m[1]!) * remPx;
    else if ((m = /^(?:min-)?h-(\d+(?:\.5)?)$/.exec(c))) v = parseFloat(m[1]!) * unit;
    else if ((m = /^size-(\d+(?:\.5)?)$/.exec(c))) v = parseFloat(m[1]!) * unit;
    if (v === null) continue;
    if (explicit === null || v > explicit) {
      explicit = v;
      explicitHow = c;
    }
  }

  // ② the padding box: py/pt/pb/p + line box + border pair.
  let pt: number | null = null;
  let pb: number | null = null;
  for (const c of base) {
    let m: RegExpExecArray | null;
    if ((m = /^p-(\d+(?:\.5)?)$/.exec(c))) {
      pt = parseFloat(m[1]!) * unit;
      pb = pt;
    }
    if ((m = /^py-(\d+(?:\.5)?)$/.exec(c))) {
      pt = parseFloat(m[1]!) * unit;
      pb = pt;
    }
    if ((m = /^py-\[(\d*\.?\d+)px\]$/.exec(c))) {
      pt = parseFloat(m[1]!);
      pb = pt;
    }
    if ((m = /^pt-(\d+(?:\.5)?)$/.exec(c))) pt = parseFloat(m[1]!) * unit;
    if ((m = /^pb-(\d+(?:\.5)?)$/.exec(c))) pb = parseFloat(m[1]!) * unit;
    if ((m = /^pt-\[(\d*\.?\d+)px\]$/.exec(c))) pt = parseFloat(m[1]!);
    if ((m = /^pb-\[(\d*\.?\d+)px\]$/.exec(c))) pb = parseFloat(m[1]!);
  }

  let fontPx: number | null = null;
  let lineBox: number | null = null;
  let fontHow = "";
  for (const c of base) {
    if (TEXT[c]) {
      [fontPx, lineBox] = TEXT[c]!;
      fontHow = c;
      continue;
    }
    // An arbitrary size sets font-size only and inherits line-height — genuinely
    // unknowable. × 1.5 is the ADR's leading floor and OVER-states (limit ③).
    const m = /^text-\[(\d*\.?\d+)px\]$/.exec(c);
    if (m) {
      fontPx = parseFloat(m[1]!);
      lineBox = Math.round(fontPx * 1.5);
      fontHow = `${c} (line box assumed 1.5×)`;
    }
  }
  const lead = base.find((c) => /^leading-/.test(c));
  if (lead && lineBox !== null) {
    let m: RegExpExecArray | null;
    if (LEADING[lead] !== undefined && fontPx !== null) lineBox = Math.round(fontPx * LEADING[lead]!);
    else if ((m = /^leading-(\d+(?:\.5)?)$/.exec(lead))) lineBox = parseFloat(m[1]!) * unit;
    else if ((m = /^leading-\[(\d*\.?\d+)px\]$/.exec(lead))) lineBox = parseFloat(m[1]!);
    fontHow += ` + ${lead}`;
  }
  // With border-box and an auto height the border still adds to the outer box.
  const border = base.some((c) => c === "border" || /^border-(?:[0-9]|\[\d+px\])$/.test(c)) ? 2 : 0;

  const padBox = lineBox === null ? null : (pt ?? 0) + (pb ?? 0) + lineBox + border;
  const padHow =
    padBox === null
      ? ""
      : `${pt ?? 0}+${pb ?? 0} padding + ${lineBox} line box (${fontHow})${border ? " + 2 border" : ""}`;

  if (explicit === null && padBox === null) return null;
  if (explicit !== null && (padBox === null || explicit >= padBox)) {
    return { px: explicit, how: `${explicitHow} = ${explicit}px` };
  }
  return { px: padBox!, how: padHow };
}

// ── CLASS EXTRACTION ────────────────────────────────────────────────────────
// Handles `className="…"`, `className={`…`}` and the house `className={cn("…",
// cond && "…", className)}` idiom, by taking EVERY string literal in the
// expression. Conditional branches therefore contribute together, which is the
// lenient direction (limit ④).
type Cls = { list: string[]; readable: boolean };

function classNameOf(attrs: string): Cls | null {
  const i = attrs.indexOf("className=");
  if (i < 0) return null;
  const rest = attrs.slice(i + "className=".length).trimStart();
  if (rest.startsWith('"')) {
    const j = rest.indexOf('"', 1);
    if (j < 0) return null;
    return { list: rest.slice(1, j).split(/\s+/).filter(Boolean), readable: true };
  }
  if (!rest.startsWith("{")) return null; // className={someVar} without braces cannot happen
  let depth = 0;
  let k = 0;
  let quote: string | null = null;
  for (; k < rest.length; k += 1) {
    const ch = rest[k]!;
    if (quote) {
      if (ch === "\\") k += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) break;
    }
  }
  const body = rest.slice(1, k);
  const lits = [...body.matchAll(/`([^`]*)`|"([^"]*)"|'([^']*)'/gs)].map((m) => m[1] ?? m[2] ?? m[3] ?? "");
  if (lits.length === 0) return { list: [], readable: false }; // className={someVariable}
  const text = lits.join(" ").replace(/\$\{[^}]*\}/gs, " ");
  return { list: text.split(/\s+/).filter(Boolean), readable: true };
}

// ── THE TAG SCANNER ─────────────────────────────────────────────────────────
// Finds each opening tag and its FULL attribute run, walking to the `>` at brace
// depth 0 so an inline arrow (`onClick={() => x}`) never truncates the read.
const TAGS = ["button", "a", "Link", "NavLink", "Button", "input", "select", "textarea"];
const LINK_TAGS = new Set(["a", "Link", "NavLink"]);
// Not controls — counted only, so the size of limit ⑥ is visible at every build.
const NON_CONTROL = ["div", "span", "li", "tr", "td", "label", "p", "section", "article"];

type Found = { tag: string; attrs: string; line: number; index: number };

function openTags(text: string, wanted: string[]): Found[] {
  const out: Found[] = [];
  const re = /<([A-Za-z][A-Za-z0-9]*)(?=[\s/>])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (!wanted.includes(m[1]!)) continue;
    let i = re.lastIndex;
    let depth = 0;
    let quote: string | null = null;
    for (; i < text.length; i += 1) {
      const ch = text[i]!;
      if (quote) {
        if (ch === "\\") i += 1;
        else if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'" || ch === "`") quote = ch;
      else if (ch === "{") depth += 1;
      else if (ch === "}") depth -= 1;
      else if (ch === ">" && depth === 0) break;
    }
    out.push({
      tag: m[1]!,
      attrs: text.slice(re.lastIndex, i),
      line: text.slice(0, m.index).split("\n").length,
      index: m.index,
    });
  }
  return out;
}

// ── COMMENTS ARE NOT CODE ───────────────────────────────────────────────────
// The house rule is that quoting a banned idiom in a comment must never trip a
// guard. The usual one-liner — skip a line that STARTS with `//`/`*`/`/*` — is
// not enough here and was caught failing during the self-test: this codebase
// documents its old shapes inside multi-line JSX comments
// (`{/* … <a className="text-xs">verify</a> … */}`) whose continuation lines
// start with neither. So real comment RANGES are computed instead, with string
// literals respected so a `https://` inside an href never opens a fake one.
// KNOWN SOFT SPOT, in the lenient direction: a regex literal spelling `//` or
// `/*` outside a string could open a phantom comment range, which would make
// this guard MISS violations in that region — never invent one.
function commentRanges(text: string): [number, number][] {
  const out: [number, number][] = [];
  let i = 0;
  while (i < text.length) {
    const ch = text[i]!;
    if (ch === '"' || ch === "'" || ch === "`") {
      i += 1;
      while (i < text.length) {
        if (text[i] === "\\") i += 2;
        else if (text[i] === ch) {
          i += 1;
          break;
        } else i += 1;
      }
      continue;
    }
    if (ch === "/" && text[i + 1] === "/") {
      const nl = text.indexOf("\n", i);
      const end = nl < 0 ? text.length : nl;
      out.push([i, end]);
      i = end;
      continue;
    }
    if (ch === "/" && text[i + 1] === "*") {
      const close = text.indexOf("*/", i + 2);
      const end = close < 0 ? text.length : close + 2;
      out.push([i, end]);
      i = end;
      continue;
    }
    i += 1;
  }
  return out;
}

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}
const rel = (p: string) => relative(SRC, p).split("\\").join("/");

// ── ① THE MEASURE ITSELF, against known values ──────────────────────────────
// The calculator is the guard. A silent break in it turns every check below
// into a green light, so it is tested before it is used. (Written after exactly
// that break bit during development: a refactor of the class reader made every
// plain string className unreadable and the violation count fell from 51 to 3
// while the guard still said PASS.)
const CASES: [string, number | null, number | null][] = [
  // the /activity bar, all four controls the review measured
  ["the facet chip REACHES the floor", measure("rounded-full border px-3 py-3.5 text-xs".split(" "))?.px ?? null, 46],
  ["its sm: compaction is not read", measure("rounded-full border px-3 py-3.5 sm:py-1 text-xs".split(" "))?.px ?? null, 46],
  ["the verify anchor is a bare line box", measure("inline-flex items-center gap-1 font-mono text-xs uppercase".split(" "))?.px ?? null, 16],
  ["min-height outranks a smaller height", measure("min-h-8 px-3 text-xs h-7".split(" "))?.px ?? null, 32],
  ["h-11 is exactly the floor", measure(["h-11"])?.px ?? null, 44],
  // the scale, read from index.css and not assumed
  ["the spacing unit is live", unit * 11, 44],
  ["leading-none collapses the line box", measure("py-2 text-sm leading-none".split(" "))?.px ?? null, 30],
  ["leading-[44px] is honoured", measure("text-xs leading-[44px]".split(" "))?.px ?? null, 44],
  ["an arbitrary size assumes 1.5 leading", measure("text-[10px]".split(" "))?.px ?? null, 15],
  ["a border pair adds 2px", measure("border px-3 py-1.5 text-xs".split(" "))?.px ?? null, 30],
  ["a house caption class is known", measure(["syn-label"])?.px ?? null, 14],
  ["no size and no height is NOT computable", measure("inline-flex items-center gap-2".split(" ")), null],
  ["a padding box beats a smaller explicit height", measure("h-4 py-4 text-sm".split(" "))?.px ?? null, 52],
  // Added 2026-07-27 with the rule below it, and proven RED first (it returned 38).
  // Limit ② in this file's header says touch is read at the mobile-first base
  // BECAUSE "no static scan can know the input modality". `pointer-coarse:` is
  // the input modality, declared. So it is not an exception to that reasoning —
  // it is the one case where the reasoning's own premise no longer holds.
  ["the touch class IS the touch regime", measure("min-h-9 touch-target".split(" "))?.px ?? null, 44],
  ["the touch class never LOWERS a taller control", measure("min-h-14 touch-target".split(" "))?.px ?? null, 56],
  ["sm: is still a desktop refinement and still ignored", measure("min-h-9 sm:min-h-11".split(" "))?.px ?? null, 36],
];
for (const [label, got, want] of CASES) {
  if (got !== want) fail(`the measure — ${label}: expected ${JSON.stringify(want)}, got ${JSON.stringify(got)}.`);
}

// ── ② THE ATOMS — one height, every call site ───────────────────────────────
// Fixing an atom fixes hundreds of controls; measuring call sites that inherit
// an atom's height would print the same defect hundreds of times. So the atoms
// are pinned HERE, at their definition, and §③ only measures a call site that
// declares a geometry of its own. A pin that cannot be READ is a FAILURE, never
// a silent pass (the guard-one-figure rule).
const BTN_FILE = "components/ui/button.tsx";
const btn = readFileSync(join(SRC, BTN_FILE), "utf8");
const cvaBase = /cva\(\s*"([^"]*)"/.exec(btn)?.[1] ?? "";
const sizeBlock = /\bsize:\s*\{([\s\S]*?)\n(\s*)\},/.exec(btn)?.[1] ?? null;
const BUTTON_SIZES: Record<string, string> = {};
if (sizeBlock === null) {
  fail(`${BTN_FILE} — the cva \`size:\` variant block could not be read, so the Button atom's height is unpinned. Keep the block shape or update this reader in the same commit.`);
} else {
  for (const m of sizeBlock.matchAll(/(?:^|\n)\s*(\w+):\s*(?:\/\/[^\n]*\n\s*)*"([^"]*)"/g)) {
    BUTTON_SIZES[m[1]!] = m[2]!;
  }
  const EXPECTED = ["default", "sm", "lg", "icon"];
  const got = Object.keys(BUTTON_SIZES);
  if (got.length === 0) fail(`${BTN_FILE} — no size variants parsed out of the cva block; the Button atom is unpinned.`);
  for (const extra of got.filter((k) => !EXPECTED.includes(k))) {
    fail(`${BTN_FILE} — a NEW Button size variant "${extra}" was added without a floor check. Measure it against ${FLOOR}px and add it to this guard's EXPECTED list in the same commit (ADR-001 2026-07-16 bis §4).`);
  }
  for (const missing of EXPECTED.filter((k) => !got.includes(k))) {
    fail(`${BTN_FILE} — the Button size variant "${missing}" has disappeared; this pin can no longer be checked. Update the guard in the same commit as the refactor.`);
  }
}

type AtomPin = { file: string; label: string; classes: string };
const ATOM_PINS: AtomPin[] = [
  ...Object.entries(BUTTON_SIZES).map(([name, cls]) => ({
    file: BTN_FILE,
    label: `Button size="${name}"`,
    classes: `${cvaBase} ${cls}`,
  })),
  {
    file: "components/ui/input.tsx",
    label: "Input (the one text field)",
    classes: /cn\(\s*"([^"]*)"/.exec(readFileSync(join(SRC, "components/ui/input.tsx"), "utf8"))?.[1] ?? "",
  },
  {
    file: "components/ui/textarea.tsx",
    label: "Textarea",
    classes: /cn\(\s*"([^"]*)"/.exec(readFileSync(join(SRC, "components/ui/textarea.tsx"), "utf8"))?.[1] ?? "",
  },
];

// The debt counters are SHARED by §② and §③ so the PASS line's occurrence total
// is the real total — an atom variant and a call site are both one short control.
let forgivenOccurrences = 0;
const forgivenFiles = new Set<string>();
const forgivenByFile = new Map<string, number>();
let forgivenPublic = 0;
let forgivenMemberAdmin = 0;
function forgive(file: string) {
  forgivenOccurrences += 1;
  forgivenFiles.add(file);
  forgivenByFile.set(file, (forgivenByFile.get(file) ?? 0) + 1);
  if (file in PUBLIC_DEBT) forgivenPublic += 1;
  else forgivenMemberAdmin += 1;
}

let atomsChecked = 0;
let atomsCompliant = 0;
let atomsShort = 0;
for (const pin of ATOM_PINS) {
  if (!pin.classes) {
    fail(`${pin.file} — ${pin.label}: its class string could not be read, so its height is unpinned. Update this reader in the same commit as the refactor.`);
    continue;
  }
  atomsChecked += 1;
  const m = measure(pin.classes.split(/\s+/).filter(Boolean));
  if (m === null) {
    fail(`${pin.file} — ${pin.label}: no static height at all. An ATOM must declare its own tap height (${FLOOR_CLASS}, or padding that reaches ${FLOOR}px), never inherit one. ADR-001 2026-07-16 bis §4.`);
    continue;
  }
  if (m.px >= FLOOR) {
    atomsCompliant += 1;
    continue;
  }
  atomsShort += 1;
  if (pin.file in ALLOWLIST) {
    forgive(pin.file);
    continue;
  }
  fail(
    `${pin.file} — ${pin.label} measures ${m.px}px (${m.how}), under the ${FLOOR}px touch floor. ` +
      `EVERY call site inherits this. Raise the atom (${FLOOR_CLASS}, or padding that reaches ${FLOOR}px) — never patch the call sites. ` +
      `Authority: ADR-001 amendment 2026-07-16 (bis) §4, Apple HIG 44 / Material 48.`,
  );
}

// ── ③ THE PER-ELEMENT SCAN ──────────────────────────────────────────────────
const GEOMETRY = /^(?:(?:min-)?h-|size-|p-|py-|pt-|pb-)/;
const BOX = /^(?:inline-flex|flex|inline-grid|grid|block|inline-block|table-cell)$/;
// The expanded-hit-area form this guard CAN see (limit ⑤): a pseudo-element
// overlay pushed out past the visual box.
const HIT_AREA = /(?:after|before):absolute/;
const HIT_INSET = /(?:after|before):-inset/;

let compliant = 0;
let elementShort = 0;
let atomGoverned = 0;
let inlineExempt = 0;
let hitExpanded = 0;
let notComputable = 0;
let elements = 0;
let divClick = 0;

const files = walk(SRC).filter((f) => !rel(f).startsWith("components/ui/")); // limit ⑦
for (const file of files) {
  const r = rel(file);
  const text = readFileSync(file, "utf8");
  const comments = commentRanges(text);
  const inComment = (i: number) => comments.some(([a, b]) => i >= a && i < b);

  // Counted, not judged (limit ⑥) — so a growth in the non-control tap-target
  // class is visible at every build instead of discovered by a founder.
  for (const el of openTags(text, NON_CONTROL)) {
    if (!inComment(el.index) && /\bonClick=/.test(el.attrs)) divClick += 1;
  }

  for (const el of openTags(text, TAGS)) {
    if (inComment(el.index)) continue; // comments are not code (house rule)
    elements += 1;
    const cls = classNameOf(el.attrs);

    if (el.tag === "Button") {
      const own = cls?.readable ? cls.list : [];
      const ownText = own.join(" ");
      if (HIT_AREA.test(ownText) && HIT_INSET.test(ownText)) {
        hitExpanded += 1;
        continue;
      }
      // No geometry of its own → the §② atom pin governs its height. Counted
      // there, never re-printed here.
      if (!own.some((c) => GEOMETRY.test(c))) {
        atomGoverned += 1;
        continue;
      }
      const sizeName = /size=\{?"(\w+)"/.exec(el.attrs)?.[1] ?? "default";
      const atomClasses = `${cvaBase} ${BUTTON_SIZES[sizeName] ?? BUTTON_SIZES.default ?? ""}`;
      const m = measure([...atomClasses.split(/\s+/).filter(Boolean), ...own]);
      report(r, el, m, `<Button size="${sizeName}">`, own);
      continue;
    }

    if (!cls || !cls.readable) {
      // A link with no readable class declares no box → inline text (WCAG 2.5.8).
      if (LINK_TAGS.has(el.tag)) inlineExempt += 1;
      else notComputable += 1;
      continue;
    }

    const all = cls.list.join(" ");
    if (HIT_AREA.test(all) && HIT_INSET.test(all)) {
      hitExpanded += 1;
      continue;
    }

    const declaresBox =
      cls.list.some((c) => BOX.test(c)) ||
      cls.list.some((c) => /^(?:p|py|pt|pb|px)-/.test(c)) ||
      cls.list.some((c) => /^(?:min-)?h-/.test(c)) ||
      cls.list.some((c) => /^rounded/.test(c)) ||
      cls.list.includes("border");

    // THE INLINE-LINK EXCEPTION (WCAG 2.5.8): no box of its own → it flows in a
    // sentence, constrained by the line-height of the text around it.
    if (LINK_TAGS.has(el.tag) && !declaresBox) {
      inlineExempt += 1;
      continue;
    }

    report(r, el, measure(cls.list), `<${el.tag}>`, cls.list);
  }
}

function report(r: string, el: Found, m: Measured, what: string, own: string[]) {
  if (m === null) {
    notComputable += 1;
    return;
  }
  if (m.px >= FLOOR) {
    compliant += 1;
    return;
  }
  elementShort += 1;
  if (r in ALLOWLIST) {
    forgive(r);
    return;
  }
  const isLink = LINK_TAGS.has(el.tag);
  fail(
    `${r}:${el.line} — ${what} is a standalone control measuring ${m.px}px tall (${m.how}), ` +
      `under the ${FLOOR}px touch floor. ` +
      (isLink
        ? `A link sitting in a meta rail as its own control owes the floor — WCAG 2.5.8 exempts a link INSIDE a sentence, not one with a box of its own. `
        : ``) +
      `Fix: give it \`${FLOOR_CLASS}\` (or padding that reaches ${FLOOR}px) — and on a small visual target, expand the hit area ` +
      `(\`relative\` + \`after:absolute after:-inset-3\`) rather than growing the ink. ` +
      `Classes read: "${own.join(" ").slice(0, 110)}". ` +
      `Authority: ADR-001 amendment 2026-07-16 (bis) §4 (Apple HIG 44 / Material 48).`,
  );
}

// ── ④ POSITIVE PINS — the places the floor is PROVEN reached ────────────────
// §③ proves no UNLISTED control is short; a listed file forgives every control
// it holds, which necessarily opens a door inside it. These pins close it on the
// two controls that matter most: the /activity facet chips, the one place in the
// whole tree where the rule was consciously applied (and the comment citing this
// ADR sits beside them), and the member shell's mobile nav pills, the « puces
// 44px » the ADR amendment itself records as applied.
const PROVEN: [string, RegExp, string][] = [
  [
    "components/activity/LiveActivityFeed.tsx",
    /py-3\.5 sm:py-1/,
    "the /activity facet chips must keep the touch-width padding that reaches 44px (the one applied instance of this rule; its loss would leave the bar with no compliant control at all)",
  ],
  [
    "components/member/MemberShell.tsx",
    new RegExp(`rounded-full border px-4 (?:${FLOOR_CLASS.replace(/[[\]]/g, "\\$&")}|min-h-\\[${FLOOR}px\\])`),
    "the member shell's nav pills are the « puces 44px » ADR-001's 2026-07-16 (bis) amendment records as APPLIED — the floor's first and oldest instance in this codebase",
  ],
];
for (const [f, re, why] of PROVEN) {
  let src: string;
  try {
    src = readFileSync(join(SRC, f), "utf8");
  } catch {
    fail(`${f} — the file this guard pins is gone; the pin cannot be checked. Move the pin in the same commit as the move.`);
    continue;
  }
  if (!re.test(src)) {
    fail(`${f} — expected touch-floor pattern NOT FOUND: ${why}. Either the control lost its 44px, or this pin needs updating in the same commit as the refactor.`);
  }
}

// ── ⑤ THE ALLOWLIST POLICES ITSELF ──────────────────────────────────────────
// Two rules, both learned from the same 2026-07-30 finding: with the Button
// atom's 2026-07-26 debt entry still in place two days after the atom was
// FIXED, reverting the whole 44px fix kept the build green — the entry forgave
// the regression it was written to count down.
//
// ① An ATOM is never debt. Forgiving an atom forgives every call site that
//   inherits it (108 today), so an atom under the floor is always a defect to
//   fix AT the atom — never an entry to write.
for (const atomFile of new Set(ATOM_PINS.map((p) => p.file))) {
  if (atomFile in ALLOWLIST) {
    fail(
      `${atomFile} — an ATOM sits in this guard's allowlist. An atom's shortness multiplies through ` +
        `every call site that inherits it; it is never debt. Delete the entry and raise the atom ` +
        `in the same commit (the Button escape-hatch lesson, 2026-07-30).`,
    );
  }
}
// ② A debt entry with nothing left to forgive is a FOSSIL — and a pre-armed
//   escape hatch for the NEXT regression in that file. The sibling
//   guard-focus-visible has enforced this since 2026-07-27; unported here, it
//   let five fossils accumulate.
// ③ (2026-07-30 adversarial review) The entry's written "(N)" count is a
//   two-way RATCHETED CEILING, not prose: existence-only checking let a listed
//   file forgive UNLIMITED new short controls, and three entries' counts had
//   already drifted stale by 5 occurrences without a single red. Over the
//   ceiling = a NEW short control rode a debt entry; under = debt was paid —
//   lower the number in the same commit. An entry with no "(N)" is unpinned
//   and fails.
for (const [listed, reason] of Object.entries(ALLOWLIST)) {
  if (!forgivenFiles.has(listed)) {
    fail(
      `${listed} — this allowlist entry forgives NOTHING: every control in that file now reaches the ` +
        `floor. DELETE the entry in this same commit — a fossil entry silently forgives the next ` +
        `regression in that file instead of failing on it.`,
    );
    continue;
  }
  const ceilingMatch = /\((\d+)\)/.exec(reason);
  if (ceilingMatch === null) {
    fail(`${listed} — its allowlist entry declares no "(N)" occurrence count, so its debt is unpinned. Add the measured count to the entry text.`);
    continue;
  }
  const ceiling = Number.parseInt(ceilingMatch[1]!, 10);
  const actual = forgivenByFile.get(listed) ?? 0;
  if (actual > ceiling) {
    fail(
      `${listed} — ${actual} short control(s) forgiven against its written ceiling of (${ceiling}). ` +
        `A NEW short control was added under a debt entry's cover. Fix the control — never raise the ` +
        `count without a written reason.`,
    );
  } else if (actual < ceiling) {
    fail(
      `${listed} — ${actual} short control(s) left against its written ceiling of (${ceiling}). ` +
        `Debt was paid: lower the count in the entry text (same commit) so the payment cannot be ` +
        `silently undone.`,
    );
  }
}

// ── VERDICT ─────────────────────────────────────────────────────────────────
const debtEntries = Object.keys(ALLOWLIST).length;
const totalShort = elementShort + atomsShort;
// The debt counter must RECONCILE: every short control is either a failure or a
// forgiven one. If these two ever disagree, a control was counted twice or lost,
// and every number in the PASS line becomes untrustworthy — so it fails loudly
// rather than printing a figure nobody can check (the ONE-AUTHORITY rule applied
// to the guard's own arithmetic).
if (failures === 0 && forgivenOccurrences !== totalShort) {
  console.error(
    `  ✗ this guard's own arithmetic does not reconcile: ${totalShort} short control(s) measured ` +
      `(${elementShort} elements + ${atomsShort} atom variants) but ${forgivenOccurrences} forgiven. Fix the counters before trusting any figure here.`,
  );
  process.exit(1);
}
if (failures > 0) {
  console.error(
    `[guard:touch-target] ${failures} FAILURE(S). A control a thumb cannot hit is a control that does not exist. ` +
      `${FLOOR}px floor — ADR-001 amendment 2026-07-16 (bis) §4.`,
  );
  process.exit(1);
}
console.log(
  `[guard:touch-target] PASS — the ${FLOOR}px touch floor holds (spacing unit read live from index.css: ${unit}px, so h-11 = ${unit * 11}px). ` +
    `CHECKED: ${atomsChecked} in-service atom variant(s) — ${atomsCompliant} at or above the floor, ${atomsShort} short — plus ` +
    `${elements} interactive element(s) across ${files.length} files, of which ` +
    `${compliant} COMPUTED compliant · ${hitExpanded} with a detected expanded hit area · ` +
    `${elementShort} measured SHORT · ` +
    `${atomGoverned} Button call site(s) inheriting a pinned atom height · ` +
    `${inlineExempt} link(s) inline in text (WCAG 2.5.8 exception) · ` +
    `${notComputable} whose height is NOT statically knowable — this guard's blind spot, not a pass. ` +
    `DEBT: all ${totalShort} short control(s) sit inside the ${debtEntries}-entry allowlist ` +
    `(${Object.keys(PUBLIC_DEBT).length} public files · ${Object.keys(MEMBER_ADMIN_DEBT).length} member/admin files), ` +
    `forgiving ${forgivenOccurrences} occurrence(s) across ${forgivenFiles.size} file(s) — ${forgivenPublic} public · ${forgivenMemberAdmin} member/admin. ` +
    `${CASES.length} measure cases green · ${PROVEN.length} control(s) PROVEN at the floor. ` +
    `NOT CHECKED: target WIDTH and neighbour spacing · desktop (\`sm:\`) compactions · ` +
    `${divClick} <div onClick> tap target(s) in the scanned files · ` +
    `components/ui/** beyond the ${atomsChecked} pinned atom variant(s) in ${new Set(ATOM_PINS.map((p) => p.file)).size} files · ` +
    `anything sized by layout, a parent, or a CSS file.`,
);
