// guard-contrast-aa.ts — WCAG AA CONTRAST, COMPUTED FROM THE TOKENS, IN BOTH THEMES.
// ---------------------------------------------------------------------------
// THE DEFECT (found 2026-07-26, live in prod until that morning). The DEFAULT
// theme is light — ADR-001 §2 says so: "light « editorial art-museum » (défaut)".
// It shipped with:
//   · --cyan-500 at `190 90% 40%` → the /activity "verify" link measured ~2.4:1
//     on the card it sits on. AA needs 4.5:1 for the 12px it carries.
//   · --gold-500 at `38 74% 44%` → every gold accent measured ~3.1:1.
// The DARK theme measured ~9.9:1 and ~11.3:1 and was fine. So the site READ IN
// ONE THEME ONLY, and the failing one was the default — nobody caught it because
// whoever built each surface was looking at dark. Worse, a code comment asserted
// the gold founder chip "holds AAA contrast in BOTH themes". AAA is 7:1. The
// sentence was false in both directions. The ramps were corrected the same day to
// 190 90% 29% and 38 74% 32% (measured 5.25:1 and 5.39:1 on --card).
//
// WHY A GUARD AND NOT A CHECKLIST: contrast is the one design law that is fully
// COMPUTABLE from the tokens. A human reviewer squints; this file does arithmetic.
// The diagnosis this guard answers, verbatim from the 2026-07-26 senior review:
// "the page passes every design law that has a guard behind it, and fails most of
// the laws that do not — that is not a coincidence, it is the diagnosis."
// AUTHORITY: ADR-001 amendment 2026-07-16 (the readability floor — researched
// against A11Y Collective / WebAIM / Section508) + WCAG 2.2 SC 1.4.3 (text 4.5:1,
// large text 3:1) and SC 1.4.11 (non-text / UI boundaries 3:1).
//
// WHAT IT DOES
//   ① parses the token VALUES out of src/index.css — the `:root` block (light) and
//     the `.dark` block (dark, layered ON TOP of :root as the cascade does), plus
//     the `@theme inline` block, which is what maps a Tailwind utility name
//     (`text-proof`) onto a token (`--proof`). No hardcoded colour anywhere here:
//     retune a ramp and this guard re-measures it on the next build.
//   ② converts HSL → sRGB → relative luminance → contrast ratio itself, and
//     ALPHA-COMPOSITES both sides (see the honest limits below).
//   ③ SELF-CHECKS the arithmetic against three published WebAIM values before it
//     trusts itself. Wrong maths in a contrast guard is worse than no guard.
//   ④ evaluates a table of foreground/background pairs THE SITE ACTUALLY RENDERS
//     — every one derived by reading the code, each row citing where — in BOTH
//     themes, and prints every measured ratio pass or fail, so the numbers live in
//     the build log and never have to be re-measured by hand.
//   ⑤ COVERAGE: every token-backed `text-*` utility used anywhere in src must
//     appear in that table. A new semantic text colour cannot ship unmeasured.
//   ⑥ bans an unbacked "AAA contrast" claim in code — the second half of today's
//     defect. This guard enforces AA; a comment promising AAA is a promise the
//     gate cannot keep, so it must state a measured ratio instead.
//
// WHY IT DOES NOT PIN TODAY'S NUMBERS. A separate workstream is producing a new
// type and spacing scale (the founder judged the live page "barely readable on a
// 27-inch screen"). So this guard pins the RULE and the FLOOR — 4.5:1 for text,
// 3:1 for large text and UI boundaries — and never the current token values. A
// ramp may move freely as long as it still measures. The ALLOWLIST carries the
// exceptions with their measured ratios, and it is the live DEBT COUNTER: the
// PASS line prints its size, so the number is visible at every build and can only
// ever shrink. A threshold is NEVER lowered to make a pair pass.
//
// ─── WHAT THIS GUARD CANNOT SEE (read this before trusting a green run) ───────
//   · ALPHA IS COMPOSITED, BUT ONLY WHERE IT IS DECLARED HERE. `text-proof/80`
//     over `bg-card/40` over `--background` is composited exactly (WCAG is defined
//     on the final rendered colour), and that is how the verify link's REAL ratio
//     is measured rather than its full-strength token's. But the layer stack comes
//     from the GROUNDS table below, written by hand from the markup. A surface
//     that stacks tints in some other order is measured against whichever ground
//     row it was assigned — or not measured at all if nobody assigned it.
//   · IT DOES NOT KNOW WHICH FOREGROUND MEETS WHICH BACKGROUND ON SCREEN. It
//     measures the pairs listed here. §⑤ guarantees every text TOKEN is measured
//     against at least one real ground; it does not and cannot guarantee that
//     every ground a token actually lands on is in the table. Adding a row when
//     you add a surface is the human half of this guard.
//   · FONT SIZE IS NOT READ FROM THE MARKUP. Each row declares its required ratio
//     (4.5 or 3.0) from the size the surface renders, judged by reading. The 12px
//     floor itself is a different guard's job (ADR-001 §4, no-sub-12px-text).
//   · GRADIENTS, IMAGES, TEXT OVER PHOTOGRAPHY, `box-shadow` glows and the
//     `--gold-metal` / medal / podium decoration are OUT OF SCOPE — they have no
//     single background colour to measure against.
//   · WCAG 1.4.3 EXPLICITLY EXEMPTS LOGOTYPES. That matters here: the brand
//     interlock mark is a fixed PNG that cannot follow a token, so it is neither
//     checked nor a violation.
//   · Third-party/shadcn chrome that references tokens this repo never defines
//     (`text-sidebar-foreground` has no `--sidebar-foreground`) resolves to
//     nothing and is invisible to §⑤ — it is also invisible on screen.
//   · `forced-colors` / Windows High Contrast overrides every colour here.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");
const CSS_PATH = join(SRC, "index.css");

// ─────────────────────────────────────────────────────────────────────────────
// THE DEBT COUNTER. Key = the pair id printed by §④ ("<fg> on <ground>"), value =
// the measured ratio + why it is tolerated + the date. Keyed by PAIR and not by
// file on purpose: the unit of this defect is a token pair, and one pair is
// rendered by dozens of files — a file-keyed list would forgive a whole file's
// unrelated colours. Every entry is a REAL failure of ADR-001's floor, written
// down instead of hidden. It shrinks in the readability sweep; it never grows
// without a measured number in its reason.
// ─────────────────────────────────────────────────────────────────────────────
// Every ratio below was MEASURED by this guard on 2026-07-26 against the corrected
// ramps (--cyan-500 190 90% 29% · --gold-500 38 74% 32%), light theme unless the
// entry says otherwise. Four classes of debt, none of them a threshold that was
// lowered:
//   A. THE OPACITY-MODIFIER CLASS. A token tuned to pass at full strength does not
//      pass at /70 or /80 — `text-proof/80` is the very "verify" link the ramp fix
//      was written for, and it is still under AA because the fix measured the TOKEN
//      and the markup dims it. The cure is architectural: drop the modifier and add
//      a real muted-accent token. It belongs to the new type/colour scale slice, not
//      to a ramp nudge, because raising --muted-foreground far enough for /40 to
//      pass would make full-strength meta text nearly black.
//   B. THE STATUS-ROLE RAMPS. --warning / --success / --destructive never got the
//      2026-07-26 lightness pass that cyan and gold got; they are the same defect,
//      one slice behind. --destructive in DARK is the worst number in the file
//      (1.95:1 — a dark red on a dark card, unreadable in the theme the site was
//      built in). Each is a one-line lightness move.
//   C. THE DATA-VIZ PALETTE, used as TEXT. index.css says of it "refine for
//      contrast/colorblind later"; that later is now overdue. Chart geometry at 3:1
//      would be fine — these are rendered as labels and figures, so 4.5:1 applies.
//   D. ONE DECORATION. `text-border` on a `·` separator.
const ALLOWLIST: Record<string, string> = {
  // ── A. opacity modifiers on a token that passes at full strength ──────────
  "text-muted-foreground/80 on card": "3.23:1 light / 4.08:1 dark (2026-07-26) — class A; 11px notes. Drop the /80.",
  "text-muted-foreground/75 on card": "2.95:1 light / 3.72:1 dark (2026-07-26) — class A; one caption. Drop the /75.",
  "text-muted-foreground/70 on card": "2.71:1 light / 3.39:1 dark (2026-07-26) — class A, 22 sites, the widest single instance of it.",
  "text-muted-foreground/60 on card": "2.30:1 light / 2.79:1 dark (2026-07-26) — class A; input placeholders, which ARE text.",
  "text-muted-foreground/50 on card": "1.96:1 light / 2.29:1 dark (2026-07-26) — class A at the 3:1 UI-glyph bar; inactive carets/chevrons.",
  "text-muted-foreground/40 on card": "1.69:1 light / 1.88:1 dark (2026-07-26) — class A at the 3:1 UI bar; a disabled state, the one case WCAG itself exempts (SC 1.4.3 note), kept measured rather than argued.",
  "text-proof/80 on feed-row": "3.55:1 light (2026-07-26) — class A. THE ORIGINAL DEFECT'S SURVIVING HALF: the /activity verify link. The ramp fix took the token to 5.25:1; the markup's /80 puts the rendered link back under AA.",
  "text-proof/80 on card": "3.62:1 light (2026-07-26) — class A; the shared VerifyOnChain atom, so this one number is every chain-proof affordance on the site.",
  "text-proof/85 on card": "3.97:1 light (2026-07-26) — class A.",
  "text-proof/70 on card": "3.02:1 light (2026-07-26) — class A.",
  "text-primary/90 on card": "4.36:1 light (2026-07-26) — class A; --primary aliases --cyan-500, so it inherits the same modifier debt.",
  "text-primary/80 on card": "3.62:1 light (2026-07-26) — class A.",
  "text-primary/70 on card": "3.02:1 light (2026-07-26) — class A.",
  "text-gold/90 on card": "4.39:1 light (2026-07-26) — class A; 6 sites, mostly member links. 0.11 short.",
  "text-gold on founder-chip": "4.29:1 light (2026-07-26) — the /activity Founder chip. Not a modifier on the TEXT but the same arithmetic on the GROUND: gold/15 inside a card/40 row lifts the ground until the full-strength text no longer clears AA. It is also the chip whose comment claims AAA (§⑥) — 4.29 is not 7.",
  "text-muted-foreground on muted": "4.30:1 light (2026-07-26) — StatusPill tone=neutral + every bg-muted panel. Full strength on a tinted ground, 0.2 short; falls out with the --muted-foreground move.",

  // ── B. the status-role ramps that never got the 2026-07-26 lightness pass ──
  "text-warning on card": "3.53:1 light (2026-07-26) — class B.",
  "text-warning on chip-warning": "3.16:1 light (2026-07-26) — class B; the /activity burn badge.",
  "text-success on card": "3.05:1 light (2026-07-26) — class B.",
  "text-success on chip-success": "2.75:1 light (2026-07-26) — class B; hero + admin status chips.",
  "text-destructive on card": "3.78:1 light / 1.95:1 DARK (2026-07-26) — class B and the worst pair in the file. 58 sites of error copy. --destructive is 0 84% 60% light / 0 63% 31% dark: the dark ramp is DARKER than its own card, which is the light-theme defect inverted.",
  "text-destructive on chip-danger": "3.32:1 light / 1.86:1 DARK (2026-07-26) — class B; StatusPill tone=danger.",
  "text-destructive/80 on card": "3.00:1 light / 1.62:1 DARK (2026-07-26) — class B compounded by class A.",
  "text-destructive-foreground on fill-destructive": "3.61:1 light (2026-07-26) — class B; the destructive button's own label, so the control fails at its most decisive moment.",

  // ── C. the data-viz palette rendered as text ──────────────────────────────
  "text-viz-1 on card": "2.47:1 light (2026-07-26) — class C; the vault lane figure + label.",
  "text-viz-2 on card": "1.82:1 light (2026-07-26) — class C, the worst of the six.",
  "text-viz-3 on card": "4.37:1 light (2026-07-26) — class C, 0.13 short.",
  "text-viz-4 on card": "2.43:1 light (2026-07-26) — class C; the gross-inflows figure AND a bolded prose fragment.",
  "text-viz-5 on card": "3.19:1 light (2026-07-26) — class C; the burn lane label.",
  "text-viz-6 on card": "4.06:1 light (2026-07-26) — class C; the liquidity lane label.",

  // ── D. decoration ─────────────────────────────────────────────────────────
  "text-border on card": "1.24:1 light / 1.30:1 dark (2026-07-26) — class D. A `·` between labels, aria-hidden where it separates spans; the adjacent text carries all the meaning, so it is decoration under SC 1.4.11. Kept in the table rather than dropped so that if someone ever puts READING text in --border the row is already measured.",
};

// ─────────────────────────────────────────────────────────────────────────────
// ② COLOUR MATHS — HSL → sRGB → relative luminance → WCAG contrast ratio.
// sRGB linearisation + luminance coefficients: WCAG 2.x relative-luminance
// definition. Compositing: standard source-over on non-premultiplied sRGB, which
// is what a browser paints and therefore what WCAG measures.
// ─────────────────────────────────────────────────────────────────────────────
type RGB = [number, number, number];
const HSL_RE = /^(-?[\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/;

function hslToRgb(triple: string): RGB {
  const m = HSL_RE.exec(triple)!;
  let h = parseFloat(m[1]);
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let rgb: RGB;
  if (hp < 1) rgb = [c, x, 0];
  else if (hp < 2) rgb = [x, c, 0];
  else if (hp < 3) rgb = [0, c, x];
  else if (hp < 4) rgb = [0, x, c];
  else if (hp < 5) rgb = [x, 0, c];
  else rgb = [c, 0, x];
  const off = l - c / 2;
  return [rgb[0] + off, rgb[1] + off, rgb[2] + off];
}

const linearize = (ch: number) => (ch <= 0.04045 ? ch / 12.92 : Math.pow((ch + 0.055) / 1.055, 2.4));
const luminance = (c: RGB) => 0.2126 * linearize(c[0]) + 0.7152 * linearize(c[1]) + 0.0722 * linearize(c[2]);

function contrast(a: RGB, b: RGB): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// source-over: `top` painted at `alpha` onto opaque `under`.
const composite = (top: RGB, under: RGB, alpha: number): RGB =>
  [0, 1, 2].map((i) => top[i] * alpha + under[i] * (1 - alpha)) as RGB;

let failures = 0;
const fail = (m: string) => {
  failures += 1;
  console.error(`  ✗ ${m}`);
};

// ─────────────────────────────────────────────────────────────────────────────
// ③ THE ARITHMETIC SELF-CHECK. Three ratios published by WebAIM's contrast
// checker. If any drifts, every number below is worthless and the build must stop
// here rather than report confident nonsense.
// ─────────────────────────────────────────────────────────────────────────────
const MATHS: [string, number, number][] = [
  ["#000000 on #ffffff", contrast(hslToRgb("0 0% 0%"), hslToRgb("0 0% 100%")), 21.0],
  // #767676 — the canonical "smallest grey that passes AA on white" (4.54:1).
  ["#767676 on #ffffff", contrast(hslToRgb("0 0% 46.2745%"), hslToRgb("0 0% 100%")), 4.54],
  // #0000ff — a saturated hue, so a wrong HSL→RGB conversion cannot hide.
  ["#0000ff on #ffffff", contrast(hslToRgb("240 100% 50%"), hslToRgb("0 0% 100%")), 8.59],
];
for (const [label, got, want] of MATHS) {
  if (Math.abs(got - want) > 0.01) {
    fail(`MATHS SELF-CHECK — ${label}: computed ${got.toFixed(4)}:1, WebAIM publishes ${want}:1. The HSL→sRGB→luminance chain in this file is WRONG; every ratio it prints is meaningless. Fix the maths before reading anything else.`);
  }
}
if (failures > 0) {
  console.error(`[guard:contrast-aa] ${failures} FAILURE(S) — the guard does not trust its own arithmetic.`);
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// ① TOKEN PARSE — the values, and the utility→token map, straight out of index.css
// ─────────────────────────────────────────────────────────────────────────────
const CSS = readFileSync(CSS_PATH, "utf8");

function cssBlock(selector: string): string {
  const open = CSS.indexOf(`${selector} {`);
  if (open < 0) {
    fail(`src/index.css — the '${selector}' block is GONE. The token source of truth moved; this guard cannot measure anything. Point it at the new one in the same commit.`);
    return "";
  }
  const close = CSS.indexOf("\n}", open);
  return CSS.slice(open, close < 0 ? undefined : close);
}
function declarations(selector: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of cssBlock(selector).matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/gi)) out[m[1]] = m[2].trim();
  return out;
}

const rootVars = declarations(":root");
const darkVars = { ...rootVars, ...declarations(".dark") }; // .dark cascades over :root
const themeVars = declarations("@theme inline");

// Tailwind resolves `text-proof` through `--color-proof`. Only the entries shaped
// `hsl(var(--x))` are measurable colour tokens; `var(--primary-border)` and the
// font/radius entries are not and are deliberately skipped.
const UTILITY_TO_TOKEN: Record<string, string> = {};
for (const [name, value] of Object.entries(themeVars)) {
  const m = /^color-([a-z0-9-]+)$/.exec(name);
  const v = /^hsl\(var\(--([a-z0-9-]+)\)\)$/.exec(value);
  if (m && v) UTILITY_TO_TOKEN[m[1]] = v[1];
}
if (Object.keys(UTILITY_TO_TOKEN).length < 20) {
  fail(`src/index.css — only ${Object.keys(UTILITY_TO_TOKEN).length} colour utilities parsed out of '@theme inline'. The block's shape changed and this guard has gone half-blind; repair the parser in the same commit.`);
}

/** Follow `var(--x)` aliases (e.g. --proof → --cyan-500) to a bare HSL triple. */
function resolve(vars: Record<string, string>, token: string, depth = 0): string | null {
  if (depth > 8) return null;
  const v = vars[token];
  if (v === undefined) return null;
  const alias = /^var\(--([a-z0-9-]+)\)$/.exec(v);
  if (alias) return resolve(vars, alias[1], depth + 1);
  return HSL_RE.test(v) ? v : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// ④a THE GROUNDS — every layer stack a pinned foreground actually lands on,
// bottom-most layer first. Each row cites the markup it was read from. An alpha
// given as {light, dark} is a `bg-x/10 dark:bg-x/15` pair (the StatusPill idiom).
// ─────────────────────────────────────────────────────────────────────────────
type Alpha = number | { light: number; dark: number };
type Layer = { token: string; alpha?: Alpha };

const GROUNDS: Record<string, Layer[]> = {
  // Opaque surfaces — components/ui/card.tsx (`bg-card`), body (`bg-background`).
  card: [{ token: "card" }],
  background: [{ token: "background" }],
  muted: [{ token: "muted" }], // 45 `bg-muted` sites
  secondary: [{ token: "secondary" }], // button variant="secondary"
  accent: [{ token: "accent" }], // dropdown/menu hover ground
  popover: [{ token: "popover" }], // components/ui/popover.tsx
  // The /activity row: `bg-card/40 border-border/50` over the page background
  // (components/activity/LiveActivityFeed.tsx:684) — the ground the "verify" link
  // that started this whole defect is painted on.
  "feed-row": [{ token: "background" }, { token: "card", alpha: 0.4 }],
  // The tinted status chips — components/status-pill/StatusPill.tsx TONE map:
  // `bg-<tone>/10 … dark:bg-<tone>/15`, text at full strength, on a card.
  "chip-identity": [{ token: "card" }, { token: "identity", alpha: { light: 0.1, dark: 0.15 } }],
  "chip-proof": [{ token: "card" }, { token: "proof", alpha: { light: 0.1, dark: 0.15 } }],
  "chip-warning": [{ token: "card" }, { token: "warning", alpha: { light: 0.1, dark: 0.15 } }],
  "chip-danger": [{ token: "card" }, { token: "destructive", alpha: { light: 0.1, dark: 0.15 } }],
  // `border-success/40 bg-success/10 text-success` — components/hero/HeroStatusChips.tsx:56,
  // pages/admin/BusinessBand.tsx:113 (no dark override, so one alpha both themes).
  "chip-success": [{ token: "card" }, { token: "success", alpha: 0.1 }],
  // The founder chip — LiveActivityFeed.tsx:703, `bg-gold/15 … text-gold` INSIDE
  // the bg-card/40 feed row. Three layers, and the exact pairing whose comment
  // claimed AAA in both themes (§⑥).
  "founder-chip": [{ token: "background" }, { token: "card", alpha: 0.4 }, { token: "gold", alpha: 0.15 }],
  // Solid action fills — components/ui/button.tsx variants default/destructive/identity.
  "fill-primary": [{ token: "primary" }],
  "fill-gold": [{ token: "gold" }],
  "fill-destructive": [{ token: "destructive" }],
};

function groundColor(vars: Record<string, string>, name: string, theme: "light" | "dark"): RGB | null {
  const layers = GROUNDS[name];
  if (!layers) return null;
  const base = resolve(vars, layers[0].token);
  if (!base) return null;
  let rgb = hslToRgb(base);
  for (const layer of layers.slice(1)) {
    const v = resolve(vars, layer.token);
    if (!v) return null;
    const a = typeof layer.alpha === "number" ? layer.alpha : layer.alpha ? layer.alpha[theme] : 1;
    rgb = composite(hslToRgb(v), rgb, a);
  }
  return rgb;
}

// ─────────────────────────────────────────────────────────────────────────────
// ④b THE PAIRS. `fg` is the Tailwind utility name (so the row reads like the
// className it guards); `a` is its opacity modifier; `need` is 4.5 for normal
// text, 3.0 for large text (≥18.66px bold / ≥24px) and for non-text/UI per SC
// 1.4.11 — with `why` saying which, judged by reading the surface.
// ─────────────────────────────────────────────────────────────────────────────
type Pair = { fg: string; a?: number; on: string; need: number; why: string };

const PAIRS: Pair[] = [
  // ── reading copy ──────────────────────────────────────────────────────────
  { fg: "foreground", on: "card", need: 4.5, why: "card body copy (text-sm/type-body) — normal text" },
  { fg: "foreground", on: "background", need: 4.5, why: "page body copy — normal text" },
  { fg: "card-foreground", on: "card", need: 4.5, why: "the Card atom's own text colour (components/ui/card.tsx)" },
  { fg: "foreground", a: 0.9, on: "feed-row", need: 4.5, why: "the /activity event sentence, text-sm leading-relaxed (LiveActivityFeed.tsx:709)" },
  { fg: "foreground", a: 0.85, on: "card", need: 4.5, why: "hero sub-line, text-sm (HeroSeatLine.tsx:49) + the header chain name" },
  { fg: "foreground", a: 0.8, on: "card", need: 4.5, why: "secondary reading copy, 27 sites" },
  { fg: "foreground", a: 0.75, on: "card", need: 4.5, why: "SeatFlowDiagram.tsx:273 node caption" },
  { fg: "foreground", a: 0.7, on: "card", need: 4.5, why: "dimmed reading copy, 5 sites" },
  { fg: "foreground", a: 0.5, on: "background", need: 3.0, why: "the toast close ✕ glyph (ui/toast.tsx:78) — a UI control, SC 1.4.11" },

  // ── muted / meta / provenance (ADR-001 §2: labels ≥12px) ──────────────────
  { fg: "muted-foreground", on: "card", need: 4.5, why: "the most-used text colour on the site (959 sites) — labels, meta, notes" },
  { fg: "muted-foreground", on: "background", need: 4.5, why: "same colour directly on the page ground" },
  { fg: "muted-foreground", on: "muted", need: 4.5, why: "StatusPill tone=neutral (`bg-muted text-muted-foreground`) + every bg-muted panel" },
  { fg: "muted-foreground", on: "feed-row", need: 4.5, why: "the /activity facts suffix, font-mono text-xs (LiveActivityFeed.tsx:712)" },
  { fg: "muted-foreground", a: 0.8, on: "card", need: 4.5, why: "ProtocolReality.tsx:104 item note, 11px reading copy" },
  { fg: "muted-foreground", a: 0.75, on: "card", need: 4.5, why: "ReferralCommissionsPanel.tsx:236 calc caption, text-xs" },
  { fg: "muted-foreground", a: 0.7, on: "card", need: 4.5, why: "the VERIFY slogan + season captions, 22 sites" },
  { fg: "muted-foreground", a: 0.6, on: "card", need: 4.5, why: "input placeholder text (FaqAccordion.tsx:85, SyndicateGuide.tsx:279) — placeholders are text" },
  { fg: "muted-foreground", a: 0.5, on: "card", need: 3.0, why: "inactive sort caret / row chevron (DataTable.tsx:133, Docs.tsx:67) — a UI glyph, SC 1.4.11" },
  { fg: "muted-foreground", a: 0.4, on: "card", need: 3.0, why: "the disabled notification-subject state (MemberNotificationsBell.tsx:247) — a disabled control" },

  // ── gold / identity (seat · recognition · membership) ─────────────────────
  { fg: "gold", on: "card", need: 4.5, why: "gold accent text on a card, 132 sites — normal text" },
  { fg: "gold", on: "background", need: 4.5, why: "gold accent text directly on the page ground" },
  { fg: "gold", on: "chip-identity", need: 4.5, why: "StatusPill tone=identity — 12px mono chip label" },
  { fg: "gold", on: "founder-chip", need: 4.5, why: "the /activity Founder chip, text-xs font-semibold (LiveActivityFeed.tsx:703) — 12px semibold is NOT large text" },
  { fg: "gold", a: 0.9, on: "card", need: 4.5, why: "member links + hero eyebrows (CapitalAxisCard.tsx:165, MemberAttention.tsx:145)" },
  { fg: "identity", on: "chip-identity", need: 4.5, why: "the semantic alias of the same chip — pinned so an alias fork is caught" },
  { fg: "gold-foreground", on: "fill-gold", need: 4.5, why: "the gold CTA's own label (PublicLayout.tsx:305, button variant=identity)" },
  { fg: "background", on: "fill-gold", need: 4.5, why: "the admin sidebar count badge (AdminShell.tsx:414) — 10px bold on a gold pill" },

  // ── cyan (live · proof · verification) ────────────────────────────────────
  { fg: "proof", on: "card", need: 4.5, why: "proof/verification text on a card, 64 sites" },
  { fg: "proof", on: "chip-proof", need: 4.5, why: "StatusPill tone=proof — the /activity kind badge, once per row" },
  // THE RATIONALISED VERIFY IDIOM (2026-07-26, founder order "ce n'est pas une
  // loi figée"). The idiom used to be `rest text-proof/80, hover text-proof` —
  // a hover delta built by WEAKENING the rest state, because the cyan ramp had
  // one step and offered no other lever. Both alpha rows below are now the
  // measured HISTORY of that defect, kept so the numbers stay on the record;
  // src no longer renders either (grep: 0 occurrences of text-proof/80).
  // The live idiom is the two rows after them.
  { fg: "proof", a: 0.8, on: "feed-row", need: 4.5, why: "HISTORY — the original defect, the /activity verify link at /80. 0 sites since 2026-07-26; kept as the measured record" },
  { fg: "proof", a: 0.8, on: "card", need: 4.5, why: "HISTORY — the shared VerifyOnChain atom at /80. 0 sites since 2026-07-26; kept as the measured record" },
  // A STATE CHANGE ADDS CONTRAST — it never subtracts legibility. Light means
  // DARKER (brightening a cyan on a near-white card measures 2.99:1 and is
  // illegal); dark means BRIGHTER. Same perceived polarity, opposite lightness,
  // which is why --proof-hover is declared per theme.
  { fg: "proof-hover", on: "card", need: 4.5, why: "the verify link's HOVER state — 35 sites through the one idiom; a hover is a state a user reads, so it carries the full text requirement" },
  { fg: "proof-hover", on: "feed-row", need: 4.5, why: "the same hover inside an /activity feed row" },
  { fg: "proof-hover", on: "background", need: 4.5, why: "the same hover on a bare page ground (JoinProtocol, ChronicleTeaser)" },
  { fg: "proof", a: 0.85, on: "card", need: 4.5, why: "3 further verify affordances" },
  { fg: "proof", a: 0.7, on: "card", need: 4.5, why: "1 dimmed verify affordance" },
  { fg: "live", on: "card", need: 4.5, why: "the live/heartbeat indicator label" },
  { fg: "primary", on: "card", need: 4.5, why: "link + active-nav colour, 100 sites (button variant=link)" },
  { fg: "primary", on: "background", need: 4.5, why: "same colour directly on the page ground" },
  { fg: "primary", a: 0.9, on: "card", need: 4.5, why: "Learning.tsx:26 module summary, text-sm" },
  { fg: "primary", a: 0.8, on: "card", need: 4.5, why: "Learning.tsx:54 module eyebrow" },
  { fg: "primary", a: 0.7, on: "card", need: 4.5, why: "MemberAccess.tsx:321 gate note, font-mono text-xs" },
  { fg: "primary-foreground", on: "fill-primary", need: 4.5, why: "the default button's own label (ui/button.tsx:15, ui/badge.tsx:16)" },

  // ── status roles ──────────────────────────────────────────────────────────
  { fg: "warning", on: "card", need: 4.5, why: "caution/pending copy, 17 sites" },
  { fg: "warning", on: "chip-warning", need: 4.5, why: "StatusPill tone=caution — the /activity burn badge" },
  { fg: "success", on: "card", need: 4.5, why: "positive/ok copy, 16 sites" },
  { fg: "success", on: "chip-success", need: 4.5, why: "the hero + admin status chips (HeroStatusChips.tsx:56, BusinessBand.tsx:113)" },
  { fg: "destructive", on: "card", need: 4.5, why: "error + fail-closed copy, 58 sites" },
  { fg: "destructive", on: "chip-danger", need: 4.5, why: "StatusPill tone=danger" },
  { fg: "destructive", a: 0.8, on: "card", need: 4.5, why: "the destructive inline action links (ProposeSourceCreate.tsx:859/937)" },
  { fg: "destructive-foreground", on: "fill-destructive", need: 4.5, why: "the destructive button's own label (ui/button.tsx:17)" },

  // ── chrome ────────────────────────────────────────────────────────────────
  { fg: "accent-foreground", on: "accent", need: 4.5, why: "menu/dropdown item on its hover ground, 24 sites" },
  { fg: "secondary-foreground", on: "secondary", need: 4.5, why: "the secondary button's own label" },
  { fg: "popover-foreground", on: "popover", need: 4.5, why: "popover body text (ui/popover.tsx)" },
  { fg: "border", on: "card", need: 3.0, why: "the `·` separator glyph (LivingSignature.tsx:31, ProtocolReality.tsx:153) — decoration, SC 1.4.11 not 1.4.3" },

  // ── data-viz used AS TEXT (not as chart geometry) ─────────────────────────
  { fg: "viz-1", on: "card", need: 4.5, why: "the vault lane figure + label (ProtocolAssetsCard.tsx:179, HeroLedger.tsx:33)" },
  { fg: "viz-2", on: "card", need: 4.5, why: "an asset-lane label (ProtocolAssetsCard.tsx:215)" },
  { fg: "viz-3", on: "card", need: 4.5, why: "the operations lane label (ProtocolOverviewPanel.tsx:50)" },
  { fg: "viz-4", on: "card", need: 4.5, why: "the gross-inflows figure at text-sm AND a bolded prose fragment (HeroLedger.tsx:133/151) — the smallest rendered size is normal text" },
  { fg: "viz-5", on: "card", need: 4.5, why: "the burn lane label (ProtocolOverviewPanel.tsx:51)" },
  { fg: "viz-6", on: "card", need: 4.5, why: "the liquidity lane label (ProtocolOverviewPanel.tsx:49)" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ④c EVALUATE — both themes, every pair, ratio printed pass or fail.
// ─────────────────────────────────────────────────────────────────────────────
const THEMES: [string, "light" | "dark", Record<string, string>][] = [
  ["light (DEFAULT — ADR-001 §2)", "light", rootVars],
  ["dark", "dark", darkVars],
];

const pairId = (p: Pair) => `text-${p.fg}${p.a === undefined ? "" : `/${Math.round(p.a * 100)}`} on ${p.on}`;
let forgiven = 0;
const rows: string[] = [];

for (const [themeLabel, themeKey, vars] of THEMES) {
  rows.push(`  ── ${themeLabel} ──`);
  for (const p of PAIRS) {
    const id = pairId(p);
    const token = UTILITY_TO_TOKEN[p.fg];
    // A pin that cannot be READ is a FAILURE, never a silent pass.
    if (!token) {
      fail(`${id} [${themeKey}] — 'text-${p.fg}' has no '--color-${p.fg}' entry in index.css's '@theme inline' block, so it resolves to no colour. Either the utility was renamed (update this row in the same commit) or the className is dead.`);
      continue;
    }
    const fgTriple = resolve(vars, token);
    const bg = groundColor(vars, p.on, themeKey);
    if (!fgTriple) {
      fail(`${id} [${themeKey}] — token '--${token}' does not resolve to an HSL triple in the ${themeKey} theme. The ramp moved or was deleted; this pair is now UNMEASURED.`);
      continue;
    }
    if (!bg) {
      fail(`${id} [${themeKey}] — the ground '${p.on}' could not be resolved from its token layers. Repair the GROUNDS table in the same commit as the token change.`);
      continue;
    }
    const fg = p.a === undefined ? hslToRgb(fgTriple) : composite(hslToRgb(fgTriple), bg, p.a);
    const ratio = contrast(fg, bg);
    const ok = ratio + 1e-9 >= p.need;
    const mark = ok ? "ok  " : id in ALLOWLIST ? "DEBT" : "FAIL";
    rows.push(`  ${mark} ${ratio.toFixed(2).padStart(6)}:1  (needs ${p.need.toFixed(1)})  ${id}`);
    if (ok) continue;
    if (id in ALLOWLIST) {
      forgiven += 1;
      continue;
    }
    fail(
      `${id} [${themeKey}] — measured ${ratio.toFixed(2)}:1, needs ${p.need.toFixed(1)}:1. ` +
        `${p.why}. Fix the TOKEN, not the surface: move only the LIGHTNESS of --${token} ` +
        `(hold hue + saturation, the 2026-07-26 discipline) until it measures, and re-run. ` +
        `Never lower the threshold, and never darken a ramp so far it breaks the other theme — ` +
        `both are measured here. If the pair is genuinely exempt, add "${id}" to this guard's ` +
        `ALLOWLIST with the measured ratio in its reason. ` +
        `(ADR-001 amendment 2026-07-16 · WCAG 2.2 SC ${p.need >= 4.5 ? "1.4.3" : "1.4.11"})`,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑤ COVERAGE — no token-backed text colour ships unmeasured.
// Keyed on the resolved TOKEN, not the utility name, so an alias (`text-identity-
// foreground` → --gold-foreground) counts as covered by the token's own row.
// ─────────────────────────────────────────────────────────────────────────────
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
const files = walk(SRC);

const measuredTokens = new Set(PAIRS.map((p) => UTILITY_TO_TOKEN[p.fg]).filter(Boolean));
const TEXT_UTIL_RE = /\btext-([a-z][a-z0-9-]*)\b/g;
const seen = new Map<string, string>(); // token → first "file:line" that renders it

for (const file of files) {
  const text = readFileSync(file, "utf8");
  text.split("\n").forEach((ln, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(ln)) return; // quoting a class in a comment is not rendering it
    for (const m of ln.matchAll(TEXT_UTIL_RE)) {
      const token = UTILITY_TO_TOKEN[m[1]];
      if (!token) continue; // a size/alignment utility, or chrome referencing an undefined token
      if (!seen.has(token)) seen.set(token, `${rel(file)}:${i + 1}`);
    }
  });
}
for (const [token, where] of seen) {
  if (measuredTokens.has(token)) continue;
  fail(
    `--${token} is rendered as TEXT (first seen ${where}) but no pair in this guard measures it. ` +
      `A semantic text colour must not ship unmeasured — that is exactly how the light theme ` +
      `shipped at 2.4:1. Add a row to PAIRS naming the ground it actually lands on and the ` +
      `ratio its size requires. (ADR-001 amendment 2026-07-16)`,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ⑥ NO UNBACKED "AAA" CLAIM. The second half of today's defect: a comment on the
// founder chip asserted it "holds AAA contrast in BOTH themes". AAA is 7:1, this
// guard enforces AA, and the chip measured well under either. A claim the gate
// cannot check is worse than no claim, so it is a RED BUILD. This scan reads
// COMMENTS on purpose — that is where the false sentence lived.
// ─────────────────────────────────────────────────────────────────────────────
const AAA_RE = /\bAAA\b[^\n]{0,48}contrast|contrast[^\n]{0,48}\bAAA\b/i;
const AAA_ALLOWLIST: Record<string, string> = {
  // The original false sentence, still in the tree — recorded here as debt rather
  // than quietly deleted, because deleting it would erase the evidence of the
  // defect class. It reads "the tinted pairing … holds AAA contrast in BOTH themes".
  // MEASURED by §④ on 2026-07-26: 4.29:1 light, 9.02:1 dark. AAA is 7:1, so the
  // sentence is false in light in BOTH directions — it does not even hold AA there.
  // The comment goes when the founder chip's pair leaves the ALLOWLIST above; the
  // replacement sentence states the two measured ratios and cites this guard.
  "components/activity/LiveActivityFeed.tsx":
    "the false claim this rule was written for — measured 4.29:1 light / 9.02:1 dark, not AAA and not even AA in the default theme (2026-07-26)",
};

for (const file of [...files, CSS_PATH]) {
  const r = rel(file);
  readFileSync(file, "utf8").split("\n").forEach((ln, i) => {
    if (!AAA_RE.test(ln)) return;
    if (r in AAA_ALLOWLIST) return;
    fail(
      `${r}:${i + 1} — an "AAA contrast" claim in code. AAA is 7:1; this gate enforces AA (4.5:1 ` +
        `text / 3:1 large & UI) and cannot verify AAA, so the sentence is unbacked. State the ` +
        `MEASURED ratio and cite this guard instead, or delete the claim. ` +
        `(the false founder-chip comment, 2026-07-26)`,
    );
  });
}

// ─────────────────────────────────────────────────────────────────────────────
for (const line of rows) console.log(line);

if (failures > 0) {
  console.error(
    `[guard:contrast-aa] ${failures} FAILURE(S). The default theme is LIGHT — a ramp that only ` +
      `reads in dark mode ships a site nobody can read.`,
  );
  process.exit(1);
}
console.log(
  `[guard:contrast-aa] PASS — ${PAIRS.length} foreground/background pairs measured from the tokens in ` +
    `BOTH themes (${PAIRS.length * 2} evaluations), arithmetic self-checked against ${MATHS.length} published ` +
    `WebAIM ratios; ${measuredTokens.size} text tokens covered, and every token-backed text colour ` +
    `rendered anywhere in src (${seen.size} found across ${files.length} files) is measured; ` +
    `${Object.keys(AAA_ALLOWLIST).length} recorded unbacked AAA claim(s) and no new one. ` +
    `${Object.keys(ALLOWLIST).length} allowlisted pair(s) forgiving ${forgiven} failing ` +
    `evaluation(s) — the CONTRAST DEBT counter. NOT checked: font size (a different guard), gradients, ` +
    `glows, images, text over photography, logotypes (WCAG-exempt), and any ground not written into the ` +
    `GROUNDS table.`,
);
