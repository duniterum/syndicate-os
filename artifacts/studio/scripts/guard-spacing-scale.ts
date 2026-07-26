// guard-spacing-scale.ts — THE VERTICAL RHYTHM, made structural. BLOCKING.
// ---------------------------------------------------------------------------
// THE DEFECT. ADR-001's amendment of 2026-07-16 wrote down a foundation scale
// ("Fluid spacing (base 4/8pt) + section rhythm") and promised a guard would
// make the floor structural. The guard was never written. Ten days later the
// founder read the live page and said: « les espacement ca parait trop
// condenses » — and, of the type floor from the same amendment, « et c'est quoi
// nos regles de design maintenant ??!! ». The senior review named the mechanism
// in one sentence: "the page passes every design law that has a guard behind it,
// and fails most of the laws that do not — that is not a coincidence, it is the
// diagnosis." This file is the guard behind ONE of those laws.
//
// AUTHORITY: ADR-001 §3 (tokens → primitives; components reference the semantic
// tier ONLY) + its 2026-07-16 amendment, "Fondation tokens" §7-1 (the whole
// point of tiering index.css was to kill sprawl — 24 text colours and 43
// backgrounds were the colour version of exactly this) + the founder's
// 2026-07-26 reading of the live page.
//
// ── THE SCALE THAT ACTUALLY EXISTS (read, not invented) ────────────────────
// tailwindcss 4.3.1, CSS-first config. There is NO tailwind.config file, and
// src/index.css's `@theme inline` block does NOT declare `--spacing`, so the
// base unit is Tailwind v4's own default from node_modules/tailwindcss/
// theme.css: `--spacing: 0.25rem` = 4px. In v4 the spacing scale is DYNAMIC,
// not a fixed list: every `p-<n>` / `mt-<n>` / `gap-<n>` resolves to
// calc(var(--spacing) * n), n may carry a .5 fraction (p-2.5 = 10px), and
// `p-px` is the 1px hairline step. So the available steps are
//   … 0 · px(1) · 0.5(2) · 1(4) · 1.5(6) · 2(8) · 2.5(10) · 3(12) · 3.5(14) · 4(16) …
// and there is NO spacing value on a 2px grid the scale cannot already say.
// That is what makes an invented bracket value indefensible: it is never
// "the scale could not express this", only "the scale was not consulted".
// THE GUARD READS THIS BASE UNIT AT RUN TIME — index.css's @theme first, the
// installed Tailwind theme second — so when the type/spacing-scale workstream
// sets a new `--spacing`, this guard adopts it and its "write p-2 instead"
// advice stays correct. It pins the RULE and the FLOOR, never today's numbers.
//
// TRUTH NOTE recorded while reading the scale (for the scale workstream, not a
// violation): index.css ALSO declares a curated rhythm set `--space-1 … 16` +
// `--space-section` — but in `:root`, NOT in `@theme`, so Tailwind generates no
// utility from them, and `grep -rn "var(--space-"` over src returns ZERO
// consumers. Those tokens are decoration today. The ONE live spacing authority
// is the 4px base above.
//
// ── WHAT THIS GUARD PINS ──────────────────────────────────────────────────
// ① INVENTED SPACING: an arbitrary bracket value on a spacing utility —
//    p/px/py/pt/pr/pb/pl/ps/pe · m/mx/my/mt/mr/mb/ml/ms/me · gap/gap-x/gap-y ·
//    space-x/space-y · inset/inset-x/inset-y/top/right/bottom/left/start/end ·
//    scroll-p*/scroll-m* — expressed as a FIXED absolute length (px/rem/em),
//    with or without a leading minus. `p-[7px]` is the named shape.
//    Two messages, one rule: a value that lands ON a step is a step written the
//    long way (`p-[16px]` → `p-4`); a value that lands BETWEEN steps is off the
//    rhythm outright (`p-[18px]`, `gap-x-[22px]`, `ml-[-0.45rem]`).
//
// ── WHAT THIS GUARD DELIBERATELY DOES NOT CLAIM ───────────────────────────
// Stated up front, because a guard that overstates its coverage is the exact
// defect class this codebase hunts (see guard-one-figure's honest-limit note).
//
// ② RHYTHM COHERENCE IS NOT CHECKED, AND CANNOT BE. A surface can be built
//    entirely from legal scale steps and still read "trop condensé" — that is
//    what the founder was looking at, and every value he was looking at was
//    legal. Whether pt-6 / mt-9 / gap-4 on one card compose into a rhythm is a
//    HUMAN judgement made at the wireframe and the preview gate, against the
//    approved mockup (THE VISUAL CHANGE LAW ①②, THE PRE-HANDOFF GATE ①).
//    This guard stops INVENTED values. It does not and will not grade taste,
//    density, or step mixing. A green run here is not a claim that a page
//    breathes.
//
// ③ SIZE IS NOT SPACING — the line, drawn explicitly, and the side it errs on.
//    `w-[…]` `h-[…]` `size-[…]` `min-w-[…]` `max-w-[…]` `min-h-[…]` `max-h-[…]`
//    `basis-[…]` are NOT scanned. A bracket EXTENT is a legitimate design
//    decision about one object — a 34px icon box, the 340px receipt paper, a
//    sparkline column, a 2px hairline rail — while rhythm is about the GAPS
//    BETWEEN objects, which is what a spacing utility expresses. Trying to
//    sort "w-[34px] the icon" from "w-[7px] the spacer" statically produces
//    guesses, and a guard full of guesses needs an allowlist full of excuses,
//    which is how a guard ends up certifying its own debt as correct.
//    SO THIS GUARD ERRS ON SILENCE THERE, and names the cost: a spacer div
//    sized `h-[7px]`, or a rail nudged with `w-[3px]`, is INVISIBLE to it.
//    Human review owns that; so does the mockup diff.
//
// ④ INLINE STYLE OBJECTS ARE INVISIBLE. `style={{ padding: 7 }}` never reaches
//    a className scan. Counted honestly on 2026-07-26: 64 of the 67 inline
//    spacing declarations in src live in components/referral/referrerKit.tsx,
//    the fixed-canvas banner painter (1200×630 · 1080×1080 · 728×90 IAB), where
//    the pixel IS the design unit and page rhythm does not apply; the other 3
//    matches were prose in comments and copy, not spacing. So the blind spot is
//    empty of page surfaces TODAY — and it is still a blind spot the moment a
//    session writes an inline pad on a real surface.
//
// ⑤ VALUES SKIPPED BY CONSTRUCTION, never by allowlist, because they are not
//    rhythm steps at all: `var(--…)` / bare `--token` references (that IS
//    consulting the scale) · `env(safe-area-inset-*)` (required by the same
//    ADR-001 amendment §3) · percentages (proportional placement — the hero
//    diagram's 20 absolutely-positioned nodes, the dialog's left-[50%]
//    centring) · viewport units vh/vw/svh/dvh/vmin/vmax (fluid by law) ·
//    `ch`/`ex` (the .measure reading law) · `auto`. Colours, z-index, grid
//    templates, transforms, aspect ratios, tracking and blur are excluded
//    BY CONSTRUCTION too: the scan keys on the spacing utility PREFIX, so
//    `bg-[#fff]`, `z-[60]`, `grid-cols-[1.4fr_0.9fr]`, `tracking-[0.14em]` and
//    `text-[10px]` are never reached. (The sub-12px type floor is a different
//    law with its own guard — this one owns no type rule.)
//
// ⑥ THE ALLOWLIST FORGIVES A FILE WHOLESALE — the memberLedger lesson from
//    guard-one-figure, answered here with a RATCHET. A file in ALLOWLIST is
//    exempt for every match in it, so a new invented value added to an
//    allowlisted file would ride in free. So DEBT_CEILING records the exact
//    occurrence count counted in each file on 2026-07-26, and the guard goes
//    RED when a file exceeds it (new debt) AND when a file falls below it
//    (good news the printed counter must be told about, in the same commit).
//    The debt number this guard prints can therefore only ever be TRUE, and
//    can only ever shrink.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");
const INDEX_CSS = join(SRC, "index.css");
const TW_THEME = join(import.meta.dirname, "..", "node_modules", "tailwindcss", "theme.css");

// ── THE DEBT, counted on 2026-07-26: 46 occurrences across 11 files ─────────
// file (repo-relative to src) → the WRITTEN reason it is permitted, grouped
// PUBLIC / MEMBER / VENDORED. This list is the live "invented-spacing debt"
// counter; the PASS line prints its size and the occurrences it forgives, and
// DEBT_CEILING (below) makes those numbers enforceable rather than believed.
// NOTE, counted not assumed: there are ZERO admin-console entries. The founder's
// admin surfaces carry no invented bracket spacing at all — the drift is on the
// public season band, the two fixed-canvas documents, and vendored shadcn.
const ALLOWLIST: Record<string, string> = {
  // ---- PUBLIC surfaces ----------------------------------------------------
  "components/season/HomeSeasonSection.tsx":
    "the visitor home's season band, transcribed VERBATIM from the approved mockup docs/design/seasons/season-visitor-home.mockup.html (§0.14-E) — the wireframe's geometry binds (2026-07-18 ruling), so these px were APPROVED ON SCREEN, not invented at the keyboard. Owed to the type/spacing-scale slice, which re-derives them against the new base and re-previews the band.",
  "components/season/HomeRegisterBand.tsx":
    "the same approved-mockup transcription as the band above — the three register cards' 18px inset. Same owner, same slice, same re-preview.",
  "components/season/SeasonMedal.tsx":
    "the crown's OVERHANG above the medallion rim — an optical anchor to another element's edge (§9 struck-metal craft, approved seasons mockups), not a step in a rhythm. Converting it would move the crown off the medal.",

  // ---- MEMBER surfaces ----------------------------------------------------
  "wallet/ReceiptShareCard.tsx":
    "THE WORST FILE, and legitimately so: a fixed 1200×630 EXPORT CANVAS rasterized to a bitmap under 300KB, pinned to the cross-platform share standard — not a page. Its unit IS the pixel, page rhythm does not apply, and rewriting these to scale steps would change the exported image. Includes the off-viewport hoist left-[-4000px], which is a render trick, not spacing.",
  "wallet/ReceiptTicket.tsx":
    "the 340px receipt PAPER's inset — an accounting/print document at fixed geometry (approved wireframe 2026-07-16, print-clean Save-as-PDF), not an app surface.",
  "wallet/SeasonStandingCard.tsx":
    "GENUINE DRIFT, and the cheapest fix in this list: one meta row's gap-x-[22px], two pixels off gap-6. Owed to the scale slice.",
  "components/referral/ReferralCommissionsPanel.tsx":
    "GENUINE DRIFT: one px-[18px] copied from the receipt paper's inset it sits beside, on a surface that is a page and not a document. Owed to the scale slice.",
  "components/referral/ReferralLadderPanel.tsx":
    "the ladder rail's vertical anchor onto the rung nodes' centre line — an optical alignment to another element, not a rhythm step.",

  // ---- VENDORED shadcn primitives (ours only by copy) ---------------------
  "components/ui/input-group.tsx":
    "upstream shadcn: four negative rem nudges pulling an inline button/kbd optically toward the field edge. Vendor code — it changes on component upgrade, never by hand, and hand-editing it is how a shadcn tree becomes unupgradable.",
  "components/ui/scroll-area.tsx":
    "upstream shadcn: the scrollbar track's 1px hairline inset.",
  "components/ui/navigation-menu.tsx":
    "upstream shadcn: the chevron's 1px baseline nudge.",
};

// The ratchet (⑥). file → occurrences counted 2026-07-26. Exceeded = new debt =
// RED. Under-run = the printed counter is stale = RED, with instructions.
const DEBT_CEILING: Record<string, number> = {
  "components/season/HomeSeasonSection.tsx": 12,
  "components/season/HomeRegisterBand.tsx": 3,
  "components/season/SeasonMedal.tsx": 1,
  "wallet/ReceiptShareCard.tsx": 19,
  "wallet/ReceiptTicket.tsx": 1,
  "wallet/SeasonStandingCard.tsx": 1,
  "components/referral/ReferralCommissionsPanel.tsx": 1,
  "components/referral/ReferralLadderPanel.tsx": 1,
  "components/ui/input-group.tsx": 4,
  "components/ui/scroll-area.tsx": 2,
  "components/ui/navigation-menu.tsx": 1,
};

// A spacing utility (optionally negated, optionally variant-prefixed) carrying an
// arbitrary bracket value. The lookbehind refuses a preceding word char or dash, so
// `justify-end`, `min-w-[…]`, `border-r-[…]` and `drop-shadow-[…]` are never reached
// — only a real utility head is. `size-`, `w-`, `h-`, `basis-` are absent BY
// DESIGN (③ above): extent is not rhythm.
const SPACING_RE =
  /(?<![\w-])(-?)(p[xytrbl]?|p[se]|m[xytrbl]?|m[se]|gap(?:-[xy])?|space-[xy]|inset(?:-[xy])?|top|right|bottom|left|start|end|scroll-p[xytrbl]?|scroll-m[xytrbl]?)-\[([^\]\s]+)\]/g;

// ⑤ — not a rhythm step, skipped by construction and never by allowlist.
const NOT_RHYTHM =
  /var\(|env\(|^--|%|\b(?:vh|vw|svh|dvh|lvh|svw|dvw|vmin|vmax|ch|ex)\b|^(?:auto|full|fit|min|max|inherit|initial|unset)$/;

// A single fixed absolute length, optionally signed. Anything else (a bare calc,
// a multi-part shorthand) is UNPARSEABLE and reported as such, never guessed at.
const LENGTH_RE = /^(-?\d*\.?\d+)(px|rem|em)$/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".ts") || name.endsWith(".tsx")) out.push(p);
  }
  return out;
}
const rel = (p: string) => relative(SRC, p).split("\\").join("/");

let failures = 0;
const fail = (m: string) => {
  failures += 1;
  console.error(`  ✗ ${m}`);
};

// ── ① the base unit RESOLVES — index.css's @theme first, Tailwind's second ──
// If neither can be read, the scale has gone missing and this guard cannot
// compute a step equivalence. That is a FAILURE, never a silent pass.
function resolveBaseUnitPx(): { px: number; source: string } | null {
  const css = readFileSync(INDEX_CSS, "utf8");
  const theme = /@theme[^{]*\{([\s\S]*?)\n\}/.exec(css);
  const local = theme ? /--spacing:\s*(\d*\.?\d+)(rem|px)\s*;/.exec(theme[1]!) : null;
  if (local) {
    const px = Number(local[1]) * (local[2] === "rem" ? 16 : 1);
    return { px, source: "src/index.css @theme --spacing" };
  }
  try {
    const m = /^\s*--spacing:\s*(\d*\.?\d+)(rem|px)\s*;/m.exec(readFileSync(TW_THEME, "utf8"));
    if (m) {
      const px = Number(m[1]) * (m[2] === "rem" ? 16 : 1);
      return { px, source: "tailwindcss/theme.css --spacing (framework default; index.css does not override it)" };
    }
  } catch {
    /* fall through to the failure below */
  }
  return null;
}

const base = resolveBaseUnitPx();
if (!base) {
  fail(
    `the spacing BASE UNIT cannot be resolved — neither src/index.css's @theme block nor ` +
      `node_modules/tailwindcss/theme.css declares '--spacing'. Declare the scale's base in @theme ` +
      `(that is where the type/spacing-scale slice belongs) — without it there is no rhythm to enforce ` +
      `and no correct step to suggest. ADR-001 §3 + §7-1.`,
  );
}
const BASE = base?.px ?? 4;

/** The scale STEP that expresses `px`, or null when it lands between steps.
 *  v4 accepts .5 fractions (p-2.5 = 10px) and the 1px hairline step `p-px`. */
function stepFor(px: number): string | null {
  if (px === 0) return "0";
  if (px === 1) return "px";
  const n = px / BASE;
  return n > 0 && Number.isInteger(n * 2) ? String(n) : null;
}
/** The two real class names this value falls between, so the fix can be pasted. */
const nearest = (px: number, cls: string): string => {
  const half = BASE / 2;
  const lo = Math.floor(px / half) * half;
  const hi = lo + half;
  return `\`${cls}-${stepFor(lo)}\` (${lo}px) or \`${cls}-${stepFor(hi)}\` (${hi}px)`;
};

// ── ② the classifier's own behaviour, pinned against fixtures ───────────────
// The line this guard draws lives in two regexes; a comment claiming where it
// falls is a claim, and these are the check. Each case is `[className, expected
// number of REPORTABLE hits]` — reportable = matched AND a fixed length.
function reportable(text: string): number {
  let n = 0;
  for (const m of text.matchAll(SPACING_RE)) {
    if (NOT_RHYTHM.test(m[3]!)) continue;
    if (!LENGTH_RE.test(m[3]!)) continue;
    n += 1;
  }
  return n;
}
const FIXTURES: [string, number][] = [
  ["p-[7px]", 1],                                        // the named shape
  ["p-[16px]", 1],                                       // on a step, written the long way — still invented
  ["-mt-[17px] gap-x-[22px] ml-[-0.45rem]", 3],          // negated head, x-axis gap, negative rem
  ["[&>*]:pt-[3px] hover:mb-[5px]", 2],                  // variant-prefixed heads are reached
  ["p-[var(--space-4)] px-[--cell-size]", 0],            // consulting the scale ⑤
  ["top-[52%] left-[50%] pb-[calc(100%-1rem)]", 0],      // proportional / fluid ⑤
  ["py-[env(safe-area-inset-bottom)]", 0],               // ADR-001 amendment §3 ⑤
  ["max-w-[68ch] gap-[2vw] h-[100dvh]", 0],              // measure + viewport units ⑤
  ["w-[34px] h-[7px] size-[18px] min-w-[12rem] basis-[30%]", 0], // extent, not rhythm ③
  ["text-[10px] z-[60] bg-[#fff] tracking-[0.14em] grid-cols-[1.4fr_0.9fr]", 0], // other laws' business ⑤
  ["justify-end items-start rounded-[10px] drop-shadow-[0_0_8px_red]", 0],        // no utility head here
  ["left-[calc(var(--sidebar-width)*-1)]", 0],           // token-derived ⑤
];
for (const [cls, want] of FIXTURES) {
  const got = reportable(cls);
  if (got !== want) fail(`behaviour — "${cls}": expected ${want} reportable hit(s), got ${got}. The guard's own line has moved; fix the rule, not the fixture.`);
}

// ── ③ the scan: no unlisted invented spacing anywhere in src ────────────────
const files = walk(SRC);
let matched = 0;      // spacing utilities with a bracket value, all kinds
let skipped = 0;      // ⑤ — not a rhythm step by construction
let unparseable = 0;  // a length shape this guard will not guess at
let forgiven = 0;     // inside an allowlisted file
const perFile: Record<string, number> = {};

for (const file of files) {
  const r = rel(file);
  const text = readFileSync(file, "utf8");
  text.split("\n").forEach((ln, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(ln)) return; // quoting an idiom in a comment never trips a guard
    for (const m of ln.matchAll(SPACING_RE)) {
      const neg = m[1] === "-";
      const util = m[2]!;
      const raw = m[3]!;
      matched += 1;
      if (NOT_RHYTHM.test(raw)) {
        skipped += 1;
        continue;
      }
      const len = LENGTH_RE.exec(raw);
      if (!len) {
        unparseable += 1;
        continue;
      }
      perFile[r] = (perFile[r] ?? 0) + 1;
      if (r in ALLOWLIST) {
        forgiven += 1;
        continue;
      }
      const px = Math.abs(Number(len[1]) * (len[2] === "rem" || len[2] === "em" ? 16 : 1));
      const sign = neg || Number(len[1]) < 0 ? "-" : "";
      const step = stepFor(px);
      const fix =
        step !== null
          ? `this value IS on the scale — write \`${sign}${util}-${step}\` instead of the bracket`
          : `${px}px lands BETWEEN steps on the ${BASE}px base — use ${nearest(px, `${sign}${util}`)}, ` +
            `or, if the composition genuinely needs this figure, take it back to the wireframe`;
      fail(
        `${r}:${i + 1} — \`${sign}${util}-[${raw}]\` invents a spacing value outside the scale. ${fix}. ` +
          `Bracket spacing is how a design system becomes a patchwork one component at a time — the ` +
          `colour version of this cost 24 text colours and 43 backgrounds (ADR-001 §1). If this is a ` +
          `fixed-canvas export, a print document or an optical anchor to another element, add the FILE ` +
          `to this guard's ALLOWLIST with a written reason AND its count to DEBT_CEILING, in this commit. ` +
          `Authority: ADR-001 §3 + the 2026-07-16 foundation-scale amendment; founder 2026-07-26.`,
      );
    }
  });
}

// ── ④ the ratchet: the printed debt number can only be TRUE, and only shrink ─
for (const [f, ceiling] of Object.entries(DEBT_CEILING)) {
  const now = perFile[f] ?? 0;
  if (!(f in ALLOWLIST)) {
    fail(`DEBT_CEILING lists ${f}, which is not in ALLOWLIST — the two lists have forked. Keep them in step.`);
    continue;
  }
  if (now > ceiling) {
    fail(
      `${f} — invented spacing GREW from ${ceiling} to ${now}. An allowlisted file is forgiven wholesale, ` +
        `which is exactly why this ceiling exists: the file's existing debt is dated, NEW debt is not ` +
        `covered by it. Write the ${now - ceiling} new value(s) as scale steps.`,
    );
  } else if (now < ceiling) {
    fail(
      `${f} — GOOD NEWS the counter has not been told: invented spacing dropped from ${ceiling} to ${now}. ` +
        `Lower DEBT_CEILING to ${now}${now === 0 ? " and delete the ALLOWLIST entry" : ""} in this same commit, ` +
        `so the debt number this guard prints stays true (THE PRE-HANDOFF GATE ③: every figure is recounted ` +
        `from its own list before commit).`,
    );
  }
}
for (const f of Object.keys(ALLOWLIST)) {
  if (!(f in DEBT_CEILING)) fail(`ALLOWLIST lists ${f} with no DEBT_CEILING entry — an uncounted exemption. Count it and record the number.`);
}

if (failures > 0) {
  console.error(
    `[guard:spacing-scale] ${failures} FAILURE(S). The rhythm comes from the scale, never from the keyboard.`,
  );
  process.exit(1);
}

const worst = Object.entries(perFile).sort((a, b) => b[1] - a[1])[0];
console.log(
  `[guard:spacing-scale] PASS — no INVENTED spacing outside the allowlist. ` +
    `Base unit ${BASE}px, read at run time from ${base!.source}; scale steps are dynamic ` +
    `(n × ${BASE}px, .5 fractions, plus the 1px 'px' step). ` +
    `${files.length} .ts/.tsx files scanned; ${matched} bracket spacing utilit${matched === 1 ? "y" : "ies"} matched, ` +
    `of which ${skipped} are not rhythm steps by construction (tokens · env() · % · viewport units · ch) ` +
    `and ${unparseable} carry a length shape this guard does not judge; ` +
    `DEBT: ${Object.keys(ALLOWLIST).length} allowlisted file(s) forgiving ${forgiven} occurrence(s)` +
    (worst ? `, worst ${worst[0]} (${worst[1]})` : "") +
    `, each ratcheted to its dated count. ` +
    `NOT CHECKED, and no green run here claims otherwise: rhythm COHERENCE and density (human judgement at ` +
    `the wireframe + preview gate) · w-/h-/size-/min-/max-/basis- extents · inline style={{}} objects · ` +
    `type sizes (a different law, a different guard).`,
);
