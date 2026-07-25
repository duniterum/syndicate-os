// guard-font-discipline.ts — MONO IS NEVER FOR PROSE (the patchwork, killed as a class).
// ---------------------------------------------------------------------------
// FOUNDER RULING (2026-07-25, benchmarked — Butterick "Monospaced fonts": in body
// text there are no good reasons to use monospace; NN/g; EightShapes). THE FONT LAW:
//   · SERIF (Instrument Serif) = DISPLAY HEADINGS only.
//   · SANS (Work Sans, default) = ALL body copy, descriptions, UI labels, and stat numbers.
//   · MONO (IBM Plex Mono) = ONLY on-chain data VALUES, addresses/hashes/ids, code, and
//     SHORT UPPERCASE eyebrow labels. NEVER a descriptive sentence.
// The named drift (the /season patchwork the founder was angry about): a running
// SENTENCE rendered in `font-mono` (or a stat number in `font-serif`). This guard reds
// the build when a `font-mono`/`font-serif` element's own STATIC leading text reads as
// prose — a multi-word, mixed/lower-case sentence. Dynamic `{values}`, short labels and
// ALL-CAPS eyebrows pass untouched (they are the legit mono uses).
//
// SCOPE NOTE: covers string classNames (the overwhelming common case). Template-literal
// classNames and text assembled entirely from expressions are out of static reach — the
// human font law + review still govern those.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SRC = join(import.meta.dirname, "..", "src");

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

// An opening tag carrying a STRING className that contains font-mono or font-serif,
// capturing (1) the full className and (2) its leading STATIC text (stops at < { }).
const TAG_TEXT_RE =
  /<\w+\b[^>]*className="([^"]*\bfont-(mono|serif)\b[^"]*)"[^>]*>\s*([^<>{}][^<>{}]*)/gs;

// A code token / endpoint leading the text — legit mono (Butterick: code IS mono's job).
const CODE_LEAD_RE = /^\s*(GET|POST|PUT|PATCH|DELETE)\b|\/api\//;

// A run of literal text reads as PROSE (not a label/value) when it is a multi-word,
// mixed/lower-case sentence. Thresholds tuned to pass eyebrows/labels/data captions
// and catch real sentences (verified 0 false positives on the harmonized tree).
function isProse(raw: string): boolean {
  const t = raw.replace(/&[a-z]+;/gi, "'").trim(); // &apos; etc → a char, so word-count is honest
  if (!/[a-zA-Z]/.test(t)) return false;            // pure data/punctuation
  if (t === t.toUpperCase()) return false;          // ALL-CAPS eyebrow/label
  if (!/[a-z]/.test(t)) return false;               // no lowercase → label-ish
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 6) return false;               // short label, not a sentence
  return true;
}

let failures = 0;
let scanned = 0;

for (const file of walk(SRC)) {
  const rel = file.slice(SRC.length + 1).split("\\").join("/");
  const text = readFileSync(file, "utf8");
  scanned += 1;
  for (const m of text.matchAll(TAG_TEXT_RE)) {
    const cls = m[1] ?? "";
    const kind = m[2];
    const leading = m[3] ?? "";
    // UPPERCASE (rendered caps) = an eyebrow/section LABEL — legit mono, skip.
    if (/\buppercase\b/.test(cls)) continue;
    // A leading code endpoint/route — legit mono, skip.
    if (CODE_LEAD_RE.test(leading)) continue;
    if (!isProse(leading)) continue;
    failures += 1;
    const line = text.slice(0, m.index ?? 0).split("\n").length;
    const snippet = leading.trim().replace(/\s+/g, " ").slice(0, 70);
    console.error(
      `  ✗ ${rel}:${line} — font-${kind} on a PROSE sentence ("${snippet}…"). ` +
        `Mono is for data/addresses/code/UPPERCASE eyebrows; serif is for display headings. ` +
        `Running text is Work Sans — drop font-${kind}. (font law, 2026-07-25)`,
    );
  }
}

if (failures > 0) {
  console.error(`[guard:font-discipline] ${failures} FAILURE(S) across ${scanned} files.`);
  process.exit(1);
}
console.log(
  `[guard:font-discipline] PASS — no font-mono/font-serif on prose sentences (${scanned} files scanned).`,
);
