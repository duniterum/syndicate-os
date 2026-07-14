// guard-nav-link-display.ts — THE RECURRING GOLD/CYAN BAR, killed as a CLASS.
// ---------------------------------------------------------------------------
// ROOT CAUSE (M1-c, 2026-07-14): wouter's <Link> renders a bare <a>, which is
// display:inline by default. An INLINE box with padding (px-/py-) and/or a
// block child has FRAGMENTED paint geometry — its hover background and focus
// ring render as broken slivers: the recurring "vertical gold line" under the
// header nav links (cyan before commit 8221b06 recolored --ring; that fix
// recolored the bars, it never killed them).
//
// THE LAW: any <Link> or <a> that is styled as a BOX (carries its own padding)
// MUST declare an explicit display class (inline-flex / flex / inline-block /
// block / grid / inline-grid / hidden). Text-only links (no padding) stay
// honest inline text.
//
// This guard parses every studio src .tsx file, extracts the className of
// each <Link …> / <a …> opening tag (string or template-literal head), and
// FAILS the build on a padded link with no display token — the geometry bug
// can never come back silently, anywhere, under any color.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

// Padding ON the link box itself (not on descendants — we only read the tag's
// own className). p-N / px-N / py-N / pt- / pb- / pl- / pr-, incl. responsive
// variants (md:px-4) and arbitrary values (px-[10px]).
const PADDING_RE = /(?:^|[\s"'`:])p[trblxy]?-(?:\[|\d)/;

// An explicit display utility, incl. responsive variants.
const DISPLAY_RE =
  /(?:^|[\s"'`:])(?:inline-flex|inline-block|inline-grid|flex|grid|block|hidden|contents|table)(?:$|[\s"'`])/;

// Opening tags for wouter Links and raw anchors; captures the attribute blob
// up to the tag close (handles multi-line attributes non-greedily).
const TAG_RE = /<(?:Link|a)\b([^>]*?)>/gs;
// className="…" | className={`…`} | className={"…"} — the STATIC head only
// (a template's dynamic tail can't remove a display token that's present).
const CLASS_RE = /className=(?:"([^"]*)"|\{\s*`([^`]*)`|\{\s*"([^"]*)")/s;

let failures = 0;
let scanned = 0;
let boxLinks = 0;

for (const file of walk(SRC)) {
  const text = readFileSync(file, "utf8");
  scanned += 1;
  for (const m of text.matchAll(TAG_RE)) {
    const attrs = m[1] ?? "";
    const cm = attrs.match(CLASS_RE);
    if (!cm) continue;
    const cls = cm[1] ?? cm[2] ?? cm[3] ?? "";
    if (!PADDING_RE.test(cls)) continue; // text link — inline is honest
    boxLinks += 1;
    if (!DISPLAY_RE.test(cls)) {
      failures += 1;
      const line = text.slice(0, m.index ?? 0).split("\n").length;
      const rel = file.slice(SRC.length + 1);
      console.error(
        `  ✗ ${rel}:${line} — padded <Link>/<a> without an explicit display class (inline anchor fragments its hover/focus paint — the recurring vertical-bar bug). Add inline-flex/flex/block/….`,
      );
    }
  }
}

if (failures > 0) {
  console.error(`[guard:nav-display] ${failures} FAILURE(S) across ${scanned} files.`);
  process.exit(1);
}
console.log(
  `[guard:nav-display] PASS — ${boxLinks} box-styled link(s) all declare their display (${scanned} files scanned).`,
);
