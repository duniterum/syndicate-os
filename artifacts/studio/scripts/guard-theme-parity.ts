// guard-theme-parity.ts — NOTHING READS IN ONE THEME ONLY. BLOCKING.
// ---------------------------------------------------------------------------
// THE DEFECT CLASS. ADR-001 §2 names TWO modes off ONE tokenized code base —
// light "editorial art-museum" (the DEFAULT) + dark "command room" — and §1
// names the disease it was written against: "des correctifs LOCAUX qui
// engendrent le bug suivant — cyan --ring, patchwork monnaie, palette sprawl".
// A colour that exists in one theme block and not the other, or a colour that
// is not a token at all, produces a surface that is CORRECT FOR HALF THE
// AUDIENCE. Three live proofs found on 2026-07-26, all inside a green build:
//   · The AA contrast repair of --cyan-500 / --gold-500 landed on the LIGHT ramp
//     only — correctly, that is where it failed — which is exactly the shape of
//     defect that goes unnoticed: nobody is looking at the other theme.
//   · /activity (and every admin panel) carries ZERO `dark:` classes. That is
//     RIGHT if every colour is a semantic token and WRONG the instant one is a
//     literal, and no guard could tell the two apart.
//   · FIVE semantic border tokens are FORWARDED by the @theme layer
//     (--primary-border, --secondary-border, --muted-border, --accent-border,
//     --destructive-border) and VALUED IN NEITHER BLOCK, plus --button-outline /
//     --badge-outline referenced by the Button and Badge `outline` variants
//     (76 call sites) and --sidebar-border / --sidebar-accent by the admin
//     sidebar. Those colours read in NO theme: an undefined var() in
//     border-color computes to `unset` → currentColor. They are recorded here as
//     dated debt, not fixed — this file is the GUARD, never the cleanup.
//
// AUTHORITY: ADR-001 §2 (two modes, one tokenized code base; exact light AND
// dark hexes from the brand board), §3 (components reference ONLY the semantic
// tier), §6 (guards dependency-free; fix the cause, never weaken the guard).
//
// ── THE COLOUR-vs-STRUCTURAL RULE (§① states it because parity is only owed by
// COLOUR). A token is classified by its VALUE SHAPE first, its NAME second:
//   · COLOUR      — the value is WHOLLY a colour: a bare HSL triple
//                   (`214 32% 91%`, the shadcn channel convention), or a whole
//                   hsl()/rgb()/oklch()/lab()/hwb()/color-mix() call, or a hex,
//                   or one of the theme-neutral keywords. Parity is OWED.
//   · ALIAS       — the value is exactly `var(--other)`. If `--other` itself has
//                   parity, the alias FOLLOWS THE THEME by construction and owes
//                   nothing: that is why --identity/--live/--proof live in :root
//                   alone and are correct. If `--other` does NOT have parity, the
//                   alias inherits its orphanhood and is reported at the target.
//   · COMPOSITE   — lengths MIXED with a colour (a shadow, a gradient). Whether
//                   --elev-1's 6%-alpha near-black should differ in the command
//                   room is a DESIGN judgement no scanner can make, so these are
//                   a WARNING and never fail the build.
//   · STRUCTURAL  — a radius, a font stack, a clamp(), a length, a duration, a
//                   cubic-bezier, a z-index, a ch measure. Deliberately
//                   theme-invariant. NOT CHECKED, and that is load-bearing: the
//                   new type + spacing scale now in flight will pour dozens of
//                   new `--text-*` / `--space-*` tokens into :root alone, and
//                   this guard must stay green through it. THIS GUARD PINS NO
//                   TYPE SIZE, NO SPACING VALUE AND NO SPECIFIC COLOUR VALUE —
//                   only the RULE that a colour answers to both themes.
//
// ── DIVISION OF LABOUR WITH no-raw-color (guards/no-raw-color.mjs). That guard
// owns hand-picked Tailwind shade classes (bg-red-500 …), 6-digit hex, and
// rgb(/rgba( in **.ts/.tsx**. §③ deliberately does NOT re-scan those. It covers
// only what no-raw-color structurally CANNOT see:
//   (a) **.css files** — its walk() filters /\.(ts|tsx)$/ and it allowlists
//       index.css wholesale, so a raw colour in a `.syn-*` utility, or any new
//       stylesheet, is invisible to it. Outside the token blocks a stylesheet
//       may express colour only through var(--token).
//   (b) **Tailwind arbitrary values** — its patterns are anchored with `\b`, and
//       Tailwind joins arbitrary values with UNDERSCORES, which are word
//       characters. `drop-shadow-[0_0_36px_rgba(245,183,71,0.55)]` therefore
//       slips through `\brgba?\(` untouched. TWO FILES carry such raw colours
//       right now, three occurrences between them (§③ finds all three; both
//       files are recorded as debt below). The rule here is simply that a colour
//       FUNCTION inside a bracket must wrap a token: `hsl(var(--gold)/0.9)` is
//       exactly right and passes. Hex inside a bracket needs no leading word
//       boundary in no-raw-color's pattern, so hex there IS already its job.
//   (c) **CSS named colours and hsl()/oklch() literals** — `white`, `black`,
//       `red` … and `hsl(190 90% 50%)` match NONE of its three patterns, in SVG
//       `fill=`/`stroke=`/`stopColor=` attributes or in `style={{ }}` objects.
//       Hex and rgb() in those same places ARE its job and are left to it.
//   (d) **`-white` / `-black` utilities** — its palette list runs slate…rose and
//       requires a numeric shade, so `bg-white` and `bg-black/80` are outside it
//       entirely. A `dark:`-prefixed one is theme-scoped and fine; an unprefixed
//       one paints both themes the same.
//
// ── WHAT THIS GUARD CANNOT SEE (stated so no session mistakes a green run for a
// two-theme proof — a guard that overstates its coverage is the defect class
// this codebase hunts):
//   · IT CANNOT SEE CONTRAST. Two values, one per theme, are parity; whether
//     either passes WCAG AA is measurement, not parsing. The 2026-07-26 light
//     ramp failed AA for weeks while parity was perfect.
//   · IT CANNOT JUDGE A VALUE. `--card: 0 0% 100%` in BOTH blocks would satisfy
//     §① completely and give the command room a white card. Parity means "the
//     question was answered twice", never "answered well".
//   · IT CANNOT SEE A TAILWIND UTILITY NAME. `bg-sidebar`, `border-sidebar-border`
//     and `text-sidebar-foreground` reference @theme colour names that do not
//     exist, and no var() appears in the source to catch. §② sees var() refs only.
//   · IT CANNOT FOLLOW A CLASS THROUGH A VARIABLE. A className assembled from an
//     imported constant, a cva() variant map or a helper is out of static reach
//     for §③(d) and §④.
//   · IT DOES NOT READ THE RUNTIME. Whether the served page actually applies
//     `.dark` on <html>, and whether both themes render, is the PREVIEW GATE's
//     job (CLAUDE.md, THE VISUAL CHANGE LAW ②: both themes, desktop AND mobile).
//   · IT READS ONE `:root` AND ONE `.dark` BLOCK. A second `:root` declared
//     further down index.css, a token set inside an `@media (prefers-color-scheme)`
//     query, or a theme poured from JS at runtime is outside §①'s window
//     entirely. If the token architecture ever forks that way, this guard must be
//     taught the new shape IN THE SAME SLICE — silence here would be a lie.
//   · A FILE IN AN ALLOWLIST is forgiven for the sites the rules MATCHED there.
//     It is never a statement that the file holds no other theme-blind colour.
//     (The reverse is watched: an allowlist entry nothing leaned on this run is
//     reported as DEAD DEBT, so the four lists can only ever shrink.)

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const STUDIO = join(import.meta.dirname, "..");
const SRC = join(STUDIO, "src");
const CSS_FILE = join(SRC, "index.css");

// ── DEBT ①: colour tokens deliberately declared in :root ALONE ───────────────
// Keyed by token name; each value is the written reason it is theme-invariant.
// This list is a live debt counter and can only ever shrink: a token here is a
// colour that is IDENTICAL in the museum and the command room, and every entry
// is a claim someone had to write down.
const TOKEN_INVARIANT_ALLOW: Record<string, string> = {
  "--gold-hi":
    "S2c podium metal — the struck-metal medallion's highlight stop. index.css records the metals as theme-independent (same values both themes) so an approved medallion renders identically in the museum and the command room; a medal is an object, not a surface.",
  "--gold-deep": "S2c podium metal — the medallion's rim/shading stop (same reason as --gold-hi).",
  "--silver-hi": "S2c podium metal — silver medallion highlight (same reason as --gold-hi).",
  "--silver": "S2c podium metal — silver medallion mid stop (same reason as --gold-hi).",
  "--silver-deep": "S2c podium metal — silver medallion rim (same reason as --gold-hi).",
  "--bronze-hi": "S2c podium metal — bronze medallion highlight (same reason as --gold-hi).",
  "--bronze": "S2c podium metal — bronze medallion mid stop (same reason as --gold-hi).",
  "--bronze-deep": "S2c podium metal — bronze medallion rim (same reason as --gold-hi).",
  "--avax":
    "the Avalanche network's own brand red (was #e84142) — a third party's brand constant used ONLY as the chain indicator. It is the same red on avax.network in either theme; re-tinting another organisation's mark per theme would misrepresent it.",
  "--surface-command":
    "the command-room near-black (was #080b11 / #05070b / #030609) — a FIXED dark panel used as a deliberate dark inset on both themes (the header's dark:bg-surface-command, the hero panels). It IS the dark surface; a light variant of it would be a different token, not this one.",
};

// ── DEBT ②: colour tokens REFERENCED but valued in NEITHER block ─────────────
// Every entry is a live bug, recorded on 2026-07-26 and NOT fixed here (this
// file is the guard, not the cleanup). An undefined var() in a colour property
// computes to `unset` → currentColor: the colour reads in NO theme, so it cannot
// read wrongly in one. Each fix belongs in the slice that owns that component.
const UNRESOLVED_TOKEN_DEBT: Record<string, string> = {
  "--primary-border":
    "DEBT 2026-07-26 — forwarded by @theme as --color-primary-border and used by Button's default variant (`border border-primary-border`), valued in neither block. Owed: the primary-button slice.",
  "--secondary-border":
    "DEBT 2026-07-26 — forwarded by @theme, used by Button/Badge secondary variants, valued in neither block. Owed: the button/badge token slice.",
  "--muted-border": "DEBT 2026-07-26 — forwarded by @theme, valued in neither block. Owed: the button/badge token slice.",
  "--accent-border": "DEBT 2026-07-26 — forwarded by @theme, valued in neither block. Owed: the button/badge token slice.",
  "--destructive-border":
    "DEBT 2026-07-26 — forwarded by @theme and used by Button's destructive variant, valued in neither block. Owed: the button/badge token slice.",
  "--button-outline":
    "DEBT 2026-07-26 — components/ui/button.tsx `outline` variant sets [border-color:var(--button-outline)]; the token exists nowhere, so 76 outline call sites draw a currentColor border. Owed: the button/badge token slice.",
  "--badge-outline":
    "DEBT 2026-07-26 — components/ui/badge.tsx `outline` variant sets [border-color:var(--badge-outline)]; same class of bug as --button-outline.",
  "--sidebar-border":
    "DEBT 2026-07-26 — components/ui/sidebar.tsx (vendored shadcn, consumed only by AdminShell) references hsl(var(--sidebar-border)) in a ring shadow; the whole --sidebar-* family was never poured into our token tiers. Owed: the admin-shell tokenization slice.",
  "--sidebar-accent": "DEBT 2026-07-26 — same vendored --sidebar-* family as --sidebar-border.",
};

// ── DEBT ③: files holding a colour that cannot follow a theme ────────────────
// Keyed repo-relative to src. Two honest kinds live here: colour that MUST be
// theme-blind (a QR quiet zone, a modal scrim) and colour that simply is not a
// token yet. The reason says which, so the list never hides a bug behind a
// legitimate neighbour.
const THEME_BLIND_DEBT: Record<string, string> = {
  // Legitimately theme-blind — the surface is not a themed surface.
  "components/referral/QrCodeBlock.tsx":
    "bg-white behind the QR — a QR code needs a solid light quiet zone to stay scannable by a phone camera; it is a machine target, not a themed surface.",
  "components/referral/ShareCard.tsx": "bg-white on the exported share card — the card is painted to a bitmap for other platforms, which have no theme of ours.",
  "wallet/ReceiptShareCard.tsx": "bg-white on the exported receipt card — same reason as ShareCard: an exported image carries no theme.",
  "wallet/ReceiptTicket.tsx": "bg-white behind the receipt's QR (same scannability reason as QrCodeBlock) — the ticket also prints to paper, which is white in both themes.",
  "components/ui/alert-dialog.tsx": "bg-black/80 modal scrim — a dimming overlay is deliberately theme-invariant (it darkens whatever is behind it); vendored shadcn convention.",
  "components/ui/dialog.tsx": "bg-black/80 modal scrim — same reason as alert-dialog.tsx.",
  "components/ui/drawer.tsx": "bg-black/80 modal scrim — same reason as alert-dialog.tsx.",
  "components/ui/sheet.tsx": "bg-black/80 modal scrim — same reason as alert-dialog.tsx.",
  // Raw colour, not legitimate — recorded as debt, owed to the slice that owns it.
  "components/hero/SeatThroneMark.tsx":
    "DEBT 2026-07-26 — drop-shadow-[0_0_36px_rgba(245,183,71,0.55)] is a RAW gold glow with no dark: counterpart, invisible to no-raw-color because Tailwind's underscore defeats its \\b anchor. Owed: hsl(var(--gold-metal)/0.55) in the hero-polish slice.",
  "components/layout/PublicLayout.tsx":
    "DEBT 2026-07-26 — the header's inset hairline is rgba(255,255,255,0.45) light / rgba(255,255,255,0.04) dark. The PAIR is theme-correct (that is why it is debt and not a failure) but both legs are raw. Owed: a --hairline token pair in the header slice.",
};

// ── DEBT ④: elements deliberately corrected in ONE theme only ────────────────
// §④ blocks a `dark:` colour override with no base for the same property. A few
// vendored shadcn primitives use that shape ON PURPOSE (transparent in the
// museum, a tint in the command room). Keyed repo-relative to src.
const HALF_CORRECTED_ALLOW: Record<string, string> = {
  "components/ui/input-group.tsx":
    "vendored shadcn, not imported by any of our surfaces. `dark:bg-input/30` with no light background is shadcn's own idiom: the group is transparent over the card in light mode and gets a tint in the command room. If we ever adopt this primitive, that choice gets re-decided at its wireframe.",
};

// ─────────────────────────────────────────────────────────────────────────────

let failures = 0;
const warnings: string[] = [];
// Every allowlist entry that a rule actually LEANED ON this run. An entry nobody
// leaned on is dead debt: the site was fixed or deleted and the forgiveness was
// left behind, which quietly inflates the counter and hides the next regression
// in the same file. Reported as a warning so the list can only ever shrink.
const leanedOn = new Set<string>();
let forgivenOccurrences = 0;
const fail = (m: string) => {
  failures += 1;
  console.error(`  ✗ ${m}`);
};
const warn = (m: string) => warnings.push(m);

function walk(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((e) => name.endsWith(e))) out.push(p);
  }
  return out;
}
const rel = (p: string) => relative(SRC, p).split("\\").join("/");

// Blank out comment-only lines but KEEP the line count, so a banned idiom quoted
// in a comment never trips a rule and every reported line number stays true.
const stripCommentLines = (text: string) =>
  text
    .split("\n")
    .map((ln) => (/^\s*(\/\/|\*|\/\*)/.test(ln) ? "" : ln))
    .join("\n");

// A CSS block body, by brace balancing (a selector may nest, and index.css does).
function cssBlock(css: string, selector: string): string | null {
  const at = css.indexOf(`${selector} {`);
  if (at < 0) return null;
  let depth = 0;
  const open = css.indexOf("{", at);
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  return null;
}
const stripCssComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "");

function declarations(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of stripCssComments(body).matchAll(/(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g)) {
    out[m[1]!] = m[2]!.trim().replace(/\s+/g, " ");
  }
  return out;
}

// ── value-shape classification (the rule is stated in the header) ────────────
const HSL_TRIPLE = /^-?[\d.]+(deg|turn|rad)?\s+-?[\d.]+%\s+-?[\d.]+%(\s*\/\s*[\d.]+%?)?$/;
const COLOR_FN = "hsla?|rgba?|oklch|oklab|lch|lab|hwb|color-mix|color";
const WHOLE_COLOR_FN = new RegExp(`^(?:${COLOR_FN})\\([^;]*\\)$`);
const WHOLE_HEX = /^#[0-9a-fA-F]{3,8}$/;
const NEUTRAL_KEYWORD = /^(transparent|currentColor|inherit|unset|initial|revert|none)$/i;
const ALIAS = /^var\(\s*(--[a-zA-Z0-9-]+)\s*\)$/;
const CARRIES_COLOR = new RegExp(`(?:${COLOR_FN})\\(|#[0-9a-fA-F]{3,8}\\b`);

// The name tiers, used ONLY as a cross-check on the value shape (a warning when
// a token's NAME lies about what it holds) — never as the classifier itself.
const COLOUR_NAME =
  /(background|foreground|border|input|ring|card|popover|primary|secondary|muted|accent|destructive|gold|silver|bronze|cyan|identity|live|proof|warning|success|avax|surface|viz-|metal|outline|scrim|hairline)/;
const STRUCTURAL_NAME = /^--(radius|text|space|measure|blur|z|dur|ease|density|app-font|leading|tracking|weight|auto-grid)\b/;

type Kind = "colour" | "alias" | "composite" | "structural";
function classify(value: string): { kind: Kind; target?: string } {
  const a = ALIAS.exec(value);
  if (a) return { kind: "alias", target: a[1]! };
  if (HSL_TRIPLE.test(value) || WHOLE_COLOR_FN.test(value) || WHOLE_HEX.test(value) || NEUTRAL_KEYWORD.test(value)) {
    return { kind: "colour" };
  }
  if (CARRIES_COLOR.test(value)) return { kind: "composite" };
  return { kind: "structural" };
}

const css = readFileSync(CSS_FILE, "utf8");
const rootBody = cssBlock(css, ":root");
const darkBody = cssBlock(css, ".dark");
const themeBody = cssBlock(css, "@theme inline");
if (rootBody === null) fail("src/index.css — no `:root {` block found. The light (DEFAULT) token block has gone missing; ADR-001 §2 requires both modes on one tokenized base.");
if (darkBody === null) fail("src/index.css — no `.dark {` block found. The command-room token block has gone missing; ADR-001 §2 requires both modes on one tokenized base.");
if (themeBody === null) fail("src/index.css — no `@theme inline {` block found; §② cannot check the forwarding layer.");

const root = declarations(rootBody ?? "");
const dark = declarations(darkBody ?? "");
const theme = declarations(themeBody ?? "");
const defined = new Set([...Object.keys(root), ...Object.keys(dark), ...Object.keys(theme)]);

// ── ① TOKEN PARITY — every COLOUR token answers to both themes ───────────────
const names = [...new Set([...Object.keys(root), ...Object.keys(dark)])];
const kindOf = new Map<string, Kind>();
let colourTokens = 0;
let aliasTokens = 0;
let structuralTokens = 0;
let compositeTokens = 0;

for (const name of names) {
  const value = root[name] ?? dark[name]!;
  const { kind } = classify(value);
  kindOf.set(name, kind);
  if (kind === "colour") colourTokens += 1;
  else if (kind === "alias") aliasTokens += 1;
  else if (kind === "composite") compositeTokens += 1;
  else structuralTokens += 1;

  // NAME-vs-VALUE cross-check (warning only): a token whose name reads
  // structural while it holds a colour, or the reverse, will mislead the next
  // reader long before it breaks anything.
  if (kind === "colour" && STRUCTURAL_NAME.test(name)) {
    warn(`src/index.css — ${name} holds a COLOUR (${value}) but its name reads structural. Rename it into the colour tier so §① is obviously owed on it.`);
  }
  // `--z-popover` matches the colour-name pattern on "popover" while its
  // structural prefix says exactly what it is; the prefix wins.
  if (kind === "structural" && COLOUR_NAME.test(name) && !STRUCTURAL_NAME.test(name)) {
    warn(`src/index.css — ${name} reads like a colour token but holds a structural value (${value}). Rename it so the next reader is not misled.`);
  }
}

for (const name of names) {
  const kind = kindOf.get(name)!;
  const inRoot = name in root;
  const inDark = name in dark;
  if (inRoot && inDark) continue;

  // An alias to a token that itself has parity FOLLOWS the theme by
  // construction — declaring it twice would be duplication, not correctness.
  if (kind === "alias") {
    const target = ALIAS.exec(root[name] ?? dark[name]!)![1]!;
    const targetHasParity = target in root && target in dark;
    if (targetHasParity) continue;
    // An alias to a colour the allowlist already declares theme-invariant is
    // itself theme-invariant: the target's written reason covers the whole
    // chain, and demanding a second entry here would only duplicate it.
    if (target in TOKEN_INVARIANT_ALLOW) {
      leanedOn.add(`TOKEN_INVARIANT_ALLOW:${target}`);
      continue;
    }
    if (!defined.has(target)) continue; // reported by §② at the reference
    fail(
      `src/index.css — ${name} is declared only in ${inRoot ? ":root" : ".dark"} and aliases ${target}, which is ITSELF only in ` +
        `${target in root ? ":root" : ".dark"}. The alias inherits the orphan: give ${target} a value in both blocks (ADR-001 §2), ` +
        `or add ${target} to TOKEN_INVARIANT_ALLOW with a written reason.`,
    );
    continue;
  }

  if (kind === "structural") continue; // deliberately theme-invariant, never checked

  if (kind === "composite") {
    warn(
      `src/index.css — ${name} carries a colour inside a structural value (${(root[name] ?? dark[name])!.slice(0, 60)}) and is declared only in ` +
        `${inRoot ? ":root" : ".dark"}. Whether the command room wants its own value here is a DESIGN judgement, so this is a warning, never a failure.`,
    );
    continue;
  }

  // A colour token missing from :root is the harder bug of the two: :root is the
  // DEFAULT theme (ADR-001 §2), so the colour is undefined for the default
  // audience. That direction is never allowlisted.
  if (!inRoot) {
    fail(
      `src/index.css — COLOUR token ${name} is declared in .dark but NOT in :root. :root is the DEFAULT theme (ADR-001 §2), so this colour ` +
        `is undefined for the default audience and computes to nothing. Declare ${name} in :root in the same commit. ` +
        `This direction has no allowlist.`,
    );
    continue;
  }
  if (name in TOKEN_INVARIANT_ALLOW) {
    leanedOn.add(`TOKEN_INVARIANT_ALLOW:${name}`);
    forgivenOccurrences += 1;
    continue;
  }
  fail(
    `src/index.css — COLOUR token ${name} (${root[name]}) is declared in :root but NOT in .dark. ADR-001 §2: two modes, one tokenized base, ` +
      `exact light AND dark values. Give it a .dark value, or — if it is genuinely the same colour in the museum and the command room — ` +
      `add it to this guard's TOKEN_INVARIANT_ALLOW with the written reason.`,
  );
}

// ── ② TOKEN RESOLUTION — a var() in a colour position must resolve ───────────
// A colour token that exists in NEITHER block cannot follow a theme; it does not
// render at all (an invalid-at-computed-value-time colour falls back to `unset`,
// i.e. currentColor for border-color). This is the same disease as §① with the
// volume turned all the way up.
const COLOUR_CSS_PROPS =
  "color|background|background-color|background-image|border-color|border-[a-z]+-color|outline-color|box-shadow|text-shadow|fill|stroke|stop-color|caret-color|accent-color|text-decoration-color|--tw-[a-z-]*color";
const COLOUR_FN_BEFORE = new RegExp(`(?:${COLOR_FN})\\(\\s*$`);

let colourRefs = 0;
const unresolvedReported = new Set<string>();

function checkColourRefs(fileLabel: string, text: string) {
  text.split("\n").forEach((ln, i) => {
    if (/^\s*(\/\/|\*|\/\*)/.test(ln)) return; // comments are not code
    for (const m of ln.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
      const name = m[1]!;
      const before = ln.slice(0, m.index ?? 0);
      const inColourFn = COLOUR_FN_BEFORE.test(before);
      const inColourProp = new RegExp(`(?:${COLOUR_CSS_PROPS})\\s*:[^;\\]]*var\\(\\s*${name}\\b`).test(ln);
      if (!inColourFn && !inColourProp && !COLOUR_NAME.test(name)) continue; // not a colour position
      colourRefs += 1;
      if (defined.has(name)) continue;
      if (name in UNRESOLVED_TOKEN_DEBT) {
        leanedOn.add(`UNRESOLVED_TOKEN_DEBT:${name}`);
        forgivenOccurrences += 1;
        continue;
      }
      const key = `${name}@${fileLabel}`;
      if (unresolvedReported.has(key)) continue;
      unresolvedReported.add(key);
      fail(
        `${fileLabel}:${i + 1} — colour token ${name} is REFERENCED but valued in neither :root nor .dark nor @theme. ` +
          `It renders in NO theme (an undefined var() in a colour property computes to \`unset\` → currentColor). ` +
          `Declare it in both blocks in this commit, or add it to UNRESOLVED_TOKEN_DEBT with the slice that owes the fix. ADR-001 §3.`,
      );
    }
  });
}

// The forwarding layer first: @theme inline republishes semantic tokens as
// Tailwind colour utilities, so a name it forwards with no value silently mints
// a broken utility (`border-primary-border`).
for (const [key, value] of Object.entries(theme)) {
  for (const m of value.matchAll(/var\(\s*(--[a-zA-Z0-9-]+)/g)) {
    const name = m[1]!;
    if (!/^--color-/.test(key) && !COLOUR_NAME.test(name)) continue;
    colourRefs += 1;
    if (defined.has(name)) continue;
    if (name in UNRESOLVED_TOKEN_DEBT) {
      leanedOn.add(`UNRESOLVED_TOKEN_DEBT:${name}`);
      forgivenOccurrences += 1;
      continue;
    }
    fail(
      `src/index.css @theme inline — ${key} forwards ${name}, which is valued in NEITHER :root nor .dark. Every Tailwind utility built ` +
        `from ${key} therefore paints nothing in either theme. Give ${name} a value in both blocks, or record it in UNRESOLVED_TOKEN_DEBT.`,
    );
  }
}

const tsFiles = walk(SRC, [".ts", ".tsx"]);
const cssFiles = walk(SRC, [".css"]);
for (const f of tsFiles) checkColourRefs(rel(f), readFileSync(f, "utf8"));
for (const f of cssFiles) {
  // Inside the token blocks a raw colour is the POINT (that is the token layer);
  // outside them a stylesheet may only reference tokens.
  const text = readFileSync(f, "utf8");
  checkColourRefs(rel(f), text);
}

// ── ③ THEME-BLIND COLOUR — the four classes no-raw-color cannot see ──────────
let themeBlindSites = 0;
const debtFilesHit = new Set<string>();
const hit = (file: string, line: number, what: string, instead: string) => {
  themeBlindSites += 1;
  if (file in THEME_BLIND_DEBT) {
    debtFilesHit.add(file);
    leanedOn.add(`THEME_BLIND_DEBT:${file}`);
    forgivenOccurrences += 1;
    return;
  }
  fail(
    `${file}:${line} — ${what} A colour that is not a token cannot answer to a theme: it paints the museum and the command room the same. ` +
      `${instead} (ADR-001 §3 — components reference the SEMANTIC tier only.) If it MUST be theme-blind (a QR quiet zone, a modal scrim, ` +
      `an exported bitmap), add the file to THEME_BLIND_DEBT with that reason.`,
  );
};

// ③(a) stylesheets, outside the token blocks. Only var(--token) may carry colour.
const NAMED_CSS_COLOURS =
  "aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|black|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkgrey|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkslategrey|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dimgrey|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|grey|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightgrey|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightslategrey|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|rebeccapurple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|slategrey|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen";
const RAW_COLOUR_IN_CSS = new RegExp(
  `#[0-9a-fA-F]{3,8}\\b|(?:${COLOR_FN})\\((?!\\s*var\\()|(?:^|[\\s:,(])(?:${NAMED_CSS_COLOURS})(?=[\\s;,)!]|$)`,
);

for (const f of cssFiles) {
  const label = rel(f);
  const text = readFileSync(f, "utf8");
  // Mask the token blocks (they legitimately hold raw colour) and the comments,
  // preserving line count so reported line numbers stay true.
  const masked = text.split("\n");
  const maskRange = (selector: string) => {
    const at = text.indexOf(`${selector} {`);
    if (at < 0) return;
    const startLine = text.slice(0, at).split("\n").length - 1;
    const body = cssBlock(text, selector) ?? "";
    const endLine = startLine + body.split("\n").length;
    for (let i = startLine; i <= endLine && i < masked.length; i += 1) masked[i] = "";
  };
  maskRange(":root");
  maskRange(".dark");
  maskRange("@theme inline");
  const body = stripCssComments(masked.join("\n"));
  body.split("\n").forEach((ln, i) => {
    if (!RAW_COLOUR_IN_CSS.test(ln)) return;
    hit(
      label,
      i + 1,
      `a RAW COLOUR in a stylesheet, outside the :root/.dark token blocks ("${ln.trim().slice(0, 70)}").`,
      `Express it as hsl(var(--token)) and declare the token in BOTH blocks. (no-raw-color does not walk .css files and allowlists index.css wholesale, so this rule is the only thing watching here.)`,
    );
  });
}

// ③(b) raw colour inside a Tailwind arbitrary value. The rule is simply: a
// colour FUNCTION inside a bracket must wrap a token. `hsl(var(--gold)/0.9)` is
// exactly right and passes; `rgba(245,183,71,0.55)` does not. Hex inside a
// bracket needs no leading word boundary in no-raw-color's pattern, so hex here
// IS already its job and is deliberately not re-scanned.
const ARBITRARY = /-\[([^\]]*)\]/g;
const RAW_IN_ARBITRARY = new RegExp(`(?:${COLOR_FN})\\((?!\\s*var\\()`);

// ③(c) a CSS named colour or an hsl()/oklch() literal in an SVG colour attribute
// or a style object — the shapes no-raw-color has no pattern for. Hex and rgb()
// in these same places are ITS job and are deliberately left to it.
const SVG_COLOUR_ATTR = /\b(fill|stroke|stopColor|stop-color|floodColor|flood-color|lightingColor)=(?:"([^"]*)"|\{"([^"]*)"\}|\{'([^']*)'\})/g;
// Scoped to the inside of a `style=` attribute ONLY. Unscoped, this pattern
// reads plain data objects as CSS: SeatFlowDiagram's lane config carries
// `color: "gold" | "cyan" | "violet"` as a VARIANT KEY, and three of those words
// happen to be CSS named colours.
const STYLE_COLOUR_PROP =
  /\b(color|background|backgroundColor|backgroundImage|borderColor|border[A-Za-z]*Color|outlineColor|boxShadow|textShadow|fill|stroke|stopColor|caretColor|accentColor|textDecorationColor)\s*:\s*(?:"([^"]*)"|'([^']*)')/g;
const NAMED_OR_FN_LITERAL = new RegExp(`^(?:${NAMED_CSS_COLOURS})$|(?:hsla?|oklch|oklab|lch|lab|hwb|color-mix)\\((?!\\s*var\\()`, "i");

// The full text of a JSX attribute's value — a quoted string, or a braced
// expression read by BRACE BALANCING so cn(…) calls, ternaries, template
// literals and object literals spanning many lines all come back whole.
function attrExpressions(text: string, attr: string): { expr: string; at: number }[] {
  const out: { expr: string; at: number }[] = [];
  for (const m of text.matchAll(new RegExp(`\\b${attr}\\s*=\\s*`, "g"))) {
    const i = (m.index ?? 0) + m[0].length;
    const q = text[i];
    if (q === '"' || q === "'") {
      const j = text.indexOf(q, i + 1);
      if (j < 0) continue;
      out.push({ expr: text.slice(i + 1, j), at: i + 1 });
    } else if (q === "{") {
      let depth = 0;
      let j = i;
      for (; j < text.length; j += 1) {
        if (text[j] === "{") depth += 1;
        else if (text[j] === "}") {
          depth -= 1;
          if (depth === 0) break;
        }
      }
      out.push({ expr: text.slice(i + 1, j), at: i + 1 });
    }
  }
  return out;
}
const lineAt = (text: string, index: number) => text.slice(0, index).split("\n").length;

// ③(d) an unprefixed -white / -black utility: no `dark:` in its variant chain,
// so it paints both themes identically. no-raw-color's palette list cannot see it.
const WHITE_BLACK = /(?:^|[\s"'`])((?:[a-z][a-z0-9-]*:)*)(bg|text|border|ring|fill|stroke|from|to|via|shadow|outline|decoration|divide|placeholder|caret|accent)-(white|black)(\/(?:\[[^\]]*\]|[0-9.]+))?(?=$|[\s"'`])/g;

for (const f of tsFiles) {
  const label = rel(f);
  const raw = readFileSync(f, "utf8");
  const text = stripCommentLines(raw);
  text.split("\n").forEach((ln, i) => {
    for (const m of ln.matchAll(ARBITRARY)) {
      const inner = m[1] ?? "";
      if (!RAW_IN_ARBITRARY.test(inner)) continue;
      hit(
        label,
        i + 1,
        `a RAW COLOUR inside a Tailwind arbitrary value ("${m[0].slice(0, 60)}").`,
        `Use hsl(var(--token)) inside the bracket. NOTE: no-raw-color CANNOT see this — Tailwind joins arbitrary values with underscores, and an underscore is a word character, so its \\brgba?\\( anchor never matches; hsl()/oklch() literals match none of its three patterns at all.`,
      );
    }
    for (const m of ln.matchAll(SVG_COLOUR_ATTR)) {
      const value = (m[2] ?? m[3] ?? m[4] ?? "").trim();
      if (!value || value.startsWith("url(") || /^(none|currentColor|inherit|transparent)$/i.test(value)) continue;
      if (value.includes("var(--")) continue;
      if (!NAMED_OR_FN_LITERAL.test(value)) continue; // hex / rgb() belong to no-raw-color
      hit(label, i + 1, `SVG ${m[1]}="${value}" is a literal colour on a rendered vector.`, `Use ${m[1]}="hsl(var(--token))" — or "currentColor", which follows the text colour and therefore the theme for free.`);
    }
    for (const m of ln.matchAll(WHITE_BLACK)) {
      const variants = m[1] ?? "";
      if (/(^|:)dark:/.test(variants)) continue; // theme-scoped on purpose
      hit(
        label,
        i + 1,
        `\`${m[2]}-${m[3]}${m[4] ?? ""}\` has no \`dark:\` in its variant chain, so it paints both themes identically.`,
        `Use the semantic token (bg-card / bg-background / text-foreground / border-border), or scope it with dark:.`,
      );
    }
  });
  // Inside `style=` attributes only — see the note on STYLE_COLOUR_PROP.
  for (const { expr, at } of attrExpressions(text, "style")) {
    for (const m of expr.matchAll(STYLE_COLOUR_PROP)) {
      const value = (m[2] ?? m[3] ?? "").trim();
      if (!value || value.includes("var(--")) continue;
      if (/^(none|currentColor|inherit|transparent|unset|initial)$/i.test(value)) continue;
      if (!NAMED_OR_FN_LITERAL.test(value)) continue; // hex / rgb() belong to no-raw-color
      hit(label, lineAt(text, at + (m.index ?? 0)), `an inline style ${m[1]}: "${value}" is a literal colour.`, `Use \`hsl(var(--token))\`.`);
    }
  }
}

// ── ④ HALF-CORRECTED ELEMENT — a dark: colour with no base for that property ──
// The asymmetry the brief names: half a component gets corrected. Formulated
// strictly enough to BLOCK, because it needs no judgement — `dark:bg-white/5`
// with no unprefixed `bg-*` in the same className means the element HAS a
// background in the command room and NONE in the museum. The base value's
// correctness is not judged (see WHAT THIS GUARD CANNOT SEE); only its presence.
const COLOUR_UTIL = "bg|text|border|ring|fill|stroke|from|to|via|shadow|outline|decoration|divide|placeholder|caret|accent";
let darkVariantSites = 0;
const halfCorrectedFilesHit = new Set<string>();

for (const f of tsFiles) {
  const label = rel(f);
  const text = stripCommentLines(readFileSync(f, "utf8"));
  // The whole className expression, so a base class living in ANOTHER cn()
  // argument or on another line still counts as present.
  for (const { expr, at } of attrExpressions(text, "className")) {
    const line = lineAt(text, at);
    const tokens = expr.split(/[\s"'`{}()]+/).filter(Boolean);
    const darkProps = new Map<string, string>();
    const baseProps = new Set<string>();
    for (const t of tokens) {
      const d = new RegExp(`^dark:(?:[a-z][a-z0-9-]*:)*(${COLOUR_UTIL})-`).exec(t);
      if (d) {
        darkProps.set(d[1]!, t);
        continue;
      }
      const b = new RegExp(`^(?:(?!dark:)[a-z][a-z0-9-]*:)*(${COLOUR_UTIL})-`).exec(t);
      if (b) baseProps.add(b[1]!);
    }
    for (const [prop, token] of darkProps) {
      darkVariantSites += 1;
      if (baseProps.has(prop)) continue;
      if (label in HALF_CORRECTED_ALLOW) {
        halfCorrectedFilesHit.add(label);
        leanedOn.add(`HALF_CORRECTED_ALLOW:${label}`);
        forgivenOccurrences += 1;
        continue;
      }
      fail(
        `${label}:${line} — \`${token}\` corrects the command room but this className sets no unprefixed \`${prop}-*\` at all, ` +
          `so the LIGHT theme — the DEFAULT (ADR-001 §2) — gets nothing for that property. Half the component is corrected. ` +
          `Add the base \`${prop}-*\` (a semantic token), or drop the dark: override.`,
      );
    }
  }
}

// ── ⑤ THE BROWSER CHROME follows the theme too ───────────────────────────────
// The <meta name="theme-color"> tints the mobile browser's own chrome. A meta
// tag cannot read a CSS variable, so index.html must ship the DEFAULT theme's
// --background as a literal AND the ThemeProvider must re-derive it from the
// live token on every flip. Both halves are pinned: the literal against the
// token it duplicates (computed, not trusted), and the sync against the source.
function hslToHex(triple: string): string | null {
  const m = /^(-?[\d.]+)(?:deg)?\s+(-?[\d.]+)%\s+(-?[\d.]+)%$/.exec(triple.trim());
  if (!m) return null;
  const h = ((Number(m[1]) % 360) + 360) % 360;
  const s = Number(m[2]) / 100;
  const l = Number(m[3]) / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const seg = Math.floor(hp) % 6;
  const rgb = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ][seg]!;
  const mm = l - c / 2;
  return (
    "#" +
    rgb
      .map((v) =>
        Math.round((v + mm) * 255)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

const themeProviderPath = join(SRC, "components", "ThemeProvider.tsx");
const provider = readFileSync(themeProviderPath, "utf8");
const html = readFileSync(join(STUDIO, "index.html"), "utf8");

const PROVIDER_PINS: [RegExp, string][] = [
  [/root\.classList\.(remove|add)\(/, "the provider must put the theme on the document root as a class — that is what `.dark` selects"],
  [/getComputedStyle\(root\)\.getPropertyValue\("--background"\)/, "the browser-chrome colour must be READ from the live --background token after the class flip, never written as a second literal"],
  [/meta\[name="theme-color"\]/, "the provider must find the theme-color meta"],
  [/themeColor\.setAttribute\("content"/, "the provider must WRITE the derived colour back onto the meta, or the chrome stays on the pre-hydration literal forever"],
];
for (const [re, why] of PROVIDER_PINS) {
  if (!re.test(provider)) {
    fail(`components/ThemeProvider.tsx — expected code NOT FOUND: ${why}. Either the theme sync was removed (the browser chrome then forks from the theme) or this pin needs updating in the same commit as the refactor.`);
  }
}

const defaultTheme = /defaultTheme\s*=\s*"(dark|light)"/.exec(provider)?.[1];
const metaColour = /<meta\s+name="theme-color"\s+content="([^"]+)"/.exec(html)?.[1];
if (!defaultTheme) {
  fail(`components/ThemeProvider.tsx — could not read the default theme (\`defaultTheme = "dark" | "light"\`). §⑤ cannot check index.html's theme-color against the theme it must match.`);
} else if (!metaColour) {
  fail(`index.html — no <meta name="theme-color" content="…"> found. Mobile browsers then tint their chrome with their own default, which is the wrong theme for half the audience.`);
} else {
  const bg = (defaultTheme === "dark" ? dark : root)["--background"];
  const want = bg ? hslToHex(bg) : null;
  if (!want) {
    fail(`src/index.css — --background is missing or not an HSL triple in the ${defaultTheme} block, so index.html's theme-color cannot be checked against it.`);
  } else if (metaColour.trim().toLowerCase() !== want) {
    fail(
      `index.html — theme-color is "${metaColour}" but the DEFAULT theme (${defaultTheme}) has --background: ${bg} = ${want}. ` +
        `A meta tag cannot read a CSS variable, so this literal is the one place the token must be duplicated by hand — and it has drifted. ` +
        `Set content="${want}", in the same commit as whatever moved --background or the default theme.`,
    );
  }
}

// ── DEAD DEBT — an allowlist entry nothing leaned on this run ─────────────────
const ALLOWLISTS: [string, Record<string, string>][] = [
  ["TOKEN_INVARIANT_ALLOW", TOKEN_INVARIANT_ALLOW],
  ["UNRESOLVED_TOKEN_DEBT", UNRESOLVED_TOKEN_DEBT],
  ["THEME_BLIND_DEBT", THEME_BLIND_DEBT],
  ["HALF_CORRECTED_ALLOW", HALF_CORRECTED_ALLOW],
];
let debtEntries = 0;
for (const [listName, list] of ALLOWLISTS) {
  for (const key of Object.keys(list)) {
    debtEntries += 1;
    if (leanedOn.has(`${listName}:${key}`)) continue;
    warn(
      `${listName} still forgives ${key}, but nothing in the tree needed that forgiveness this run — the site was fixed or deleted. ` +
        `DELETE the entry: dead debt inflates the counter and would silently forgive the NEXT violation in the same place.`,
    );
  }
}

if (warnings.length > 0) {
  console.warn(`[guard:theme-parity] ${warnings.length} WARNING(S) — reported, never blocking:`);
  warnings.forEach((w) => console.warn(`  ⚠ ${w}`));
}
if (failures > 0) {
  console.error(`[guard:theme-parity] ${failures} FAILURE(S). Nothing reads in one theme only.`);
  process.exit(1);
}
console.log(
  `[guard:theme-parity] PASS — ${Object.keys(root).length} tokens in :root and ${Object.keys(dark).length} in .dark; ` +
    `of ${names.length} distinct, ${colourTokens} are COLOUR (parity owed), ${aliasTokens} aliases (theme-following via their target), ` +
    `${compositeTokens} composite (warned, never blocking), ${structuralTokens} structural (invariant by design — no type size, spacing value ` +
    `or colour VALUE is pinned by this guard, so a new scale cannot break it); ` +
    `${colourRefs} colour-position var() references all resolve; ` +
    `${themeBlindSites} theme-blind colour site(s), all in the ${debtFilesHit.size} allowlisted file(s) that own them; ` +
    `${darkVariantSites} dark: colour override(s) each paired with a base for the same property ` +
    `(${halfCorrectedFilesHit.size} allowlisted exception file); ` +
    `browser chrome pinned to the ${defaultTheme ?? "?"} --background. ` +
    `DEBT: ${debtEntries} allowlist entries forgiving ${forgivenOccurrences} occurrence(s), every one with a written reason. NOT CHECKED: contrast ratios, whether a value is GOOD, Tailwind utility names with no var() ` +
    `(bg-sidebar…), classes assembled through variables, and the rendered page in either theme (that is the PREVIEW GATE's job).`,
);
