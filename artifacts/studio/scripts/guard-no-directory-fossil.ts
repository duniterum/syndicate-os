// guard-no-directory-fossil.ts — THE REGISTER EXISTS. BLOCKING.
// ---------------------------------------------------------------------------
// THE FOSSIL (founder, 2026-08-03, angry, SECOND time — the first strike was
// 2026-07-30 and the sentence grew back): «annuaire oui maintenant
// thesyndicate.money/registry — change ce texte qui va revenir pour toujours,
// on a un annuaire maintenant!!!»
//
// The claim "no directory exists" is FALSE and has been since THE REGISTER
// shipped: /registry publishes the per-seat roster of ADDRESSES and the season
// board ranks and celebrates them. That is the product. An address is PUBLIC
// (CLAUDE.md, THE ADDRESS MODEL) — shown short-form, explorer-linked, never
// hidden and never masked-as-security.
//
// Striking it in prose failed twice, because prose is not a mechanism. This
// guard is the mechanism: the ABSOLUTE claim is a RED BUILD, forever, in both
// languages, in code and in docs.
//
// WHAT IS STILL TRUE AND MUST NOT BE KILLED — the difference this guard is
// built around:
//   · "this endpoint is own-row, not a directory lookup"  ← ACCURATE. A session
//     answers for its own account. Kept.
//   · "never a directory OF MEMBERS' IDENTITIES / no name↔address directory"
//     ← THE RED LINE. Kept, and it is the only thing that was ever true.
//   · "no directory exists" / "pas d'annuaire" (full stop)  ← THE FOSSIL. Dead.
// So the patterns below match the ABSOLUTE, EXISTENTIAL form only: a claim that
// no such thing exists ANYWHERE. A local, scoped description is never matched.
//
// WHAT THIS GUARD DOES NOT COVER (the report-shape law): it reads text. It
// cannot tell whether a NEW surface actually leaks a name↔address mapping —
// that is guard-access-state's and the boundary scanners' authority, deliberately
// not re-pinned here (one authority per rule).

import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");

/** Where the fossil can hide: our own code and our own canon. */
const ROOTS = [
  path.join(repoRoot, "artifacts", "studio", "src"),
  path.join(repoRoot, "artifacts", "studio", "server"),
  path.join(repoRoot, "artifacts", "api-server", "src"),
  path.join(repoRoot, "docs"), // the whole tree: the fossil survived in 00_CANON_INDEX.md,
];

/**
 * Historical records are EVIDENCE, not claims — a session log or a superseded
 * plan quoting the old sentence is how we remember it was struck. Only living
 * canon and living code are pinned.
 */
const EXEMPT = [
  `${path.sep}handoff${path.sep}`,
  "SESSION_STATE.md",
  "-HISTORICAL-",
  "SUPERSEDED",
  path.join("docs", "audits"),
  // This file NAMES the fossil in order to forbid it.
  "guard-no-directory-fossil.ts",
];

/**
 * THE ABSOLUTE CLAIM, in both languages. Each pattern requires the EXISTENTIAL
 * shape ("no X exists" / "aucun X n'existe" / "X does not exist"), never a
 * scoped description ("own-row, never a directory of others" stays legal).
 */
const FOSSILS: readonly { re: RegExp; why: string }[] = [
  {
    re: /\bno\s+(public\s+)?(directory|roster)\s+exists\b/i,
    why: `"no directory/roster exists" — THE REGISTER does: /registry publishes the per-seat address roster`,
  },
  {
    // Scoped by a lookbehind-in-spirit: a directory OF IDENTITIES / a NAME↔address
    // lookup genuinely does not exist and MUST stay writable — that is the red
    // line. Only the unscoped claim is the fossil.
    re: /\b(directory|roster)\b(?![^.\n]{0,60}(identit|name|nom|person|people|lookup))[^.\n]{0,60}\bdoes\s+not\s+exist\b/i,
    why: `"a directory does not exist" — it does; scope it to identities/name↔address`,
  },
  {
    // The form that reached a SERVED, INDEXED meta description and survived the
    // first four patterns (seo-route-registry /member, 2026-08-03).
    re: /\bthere\s+is\s+no\s+(public\s+)?(directory|roster|list)\s+of\s+members\b/i,
    why: `"there is no directory of members" — THE REGISTER lists every seat's address`,
  },
  {
    re: /\baucun\s+(annuaire|roster)[^.\n]{0,60}\bn['’]existe\b/i,
    why: `"aucun annuaire n'existe" — /registry EST un annuaire d'adresses (le produit)`,
  },
  {
    re: /\bpas\s+d['’]annuaire\b(?![^.\n]{0,40}(nominatif|nom))/i,
    why: `"pas d'annuaire" tout court — dire "pas d'annuaire NOMINATIF", la seule formule vraie`,
  },
  {
    re: /\bnever\s+a\s+directory\b(?![^.\n]{0,60}(of\s+(others|other\s+members|identities|people)|lookup|name))/i,
    why: `bare "never a directory" — scope it ("never a directory of others" / "not a directory lookup"), because one DOES exist`,
  },
];

function* walk(dir: string): Generator<string> {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    const abs = path.join(dir, name);
    if (statSync(abs).isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      yield* walk(abs);
    } else if (/\.(ts|tsx|mjs|md|html)$/.test(name)) {
      yield abs;
    }
  }
}

const hits: string[] = [];
let scanned = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const rel = path.relative(repoRoot, file);
    if (EXEMPT.some((e) => file.includes(e) || rel.includes(e))) continue;
    scanned += 1;
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      // A struck line QUOTES the fossil in order to bury it — that is the
      // record, and it stays legal. But the marker must come BEFORE the phrase
      // it strikes: a bare "⛔" appended anywhere on a line would otherwise be a
      // one-character opt-out of the whole mechanism (caught by the adversarial
      // pass, 2026-08-03 — "prose is not a mechanism" applies to the guard too).
      const struckAt = line.search(/⛔|STRUCK|Corrigé|Corrected|~~/);
      for (const f of FOSSILS) {
        const at = line.search(f.re);
        if (at !== -1 && struckAt !== -1 && struckAt < at) continue;
        if (f.re.test(line)) {
          hits.push(`${rel}:${i + 1} — ${f.why}\n      ${line.trim().slice(0, 140)}`);
        }
      }
    });
  }
}

if (hits.length > 0) {
  console.error(`[guard:no-directory-fossil] ${hits.length} FOSSIL CLAIM(S):`);
  for (const h of hits) console.error(`  ✗ ${h}`);
  console.error(
    `\n  THE REGISTER EXISTS (/registry). An address is PUBLIC; the red line is name/alias/email\n` +
      `  and any NAME↔ADDRESS directory. Scope the sentence — never claim none exists.`,
  );
  process.exit(1);
}
console.log(
  `[guard:no-directory-fossil] PASS — ${scanned} file(s) scanned, no absolute "no directory exists" claim. ` +
    `Scoped forms ("own-row, not a directory lookup", "never a directory of others") are legal and untouched. ` +
    `NOT CHECKED: whether a surface actually leaks a name↔address mapping (guard-access-state's authority).`,
);
