// guard-feature-truth.ts — THE DONE-IS-DONE GUARD (founder law, 2026-07-19).
// ---------------------------------------------------------------------------
// Kills the fossil class structurally: a user-visible "coming later" claim on
// a capability that is LIVE. Born from the /member Settings row that kept
// saying "Coming later" for notifications a full day after they sealed live.
//
// THE CONTRACT:
//   1. `config/featureStatus.ts` is the ONE live-vs-future truth, in code.
//   2. Every `lifecycle="FUTURE"` site in studio src is PINNED below to a
//      feature key; its key MUST be "future" in the registry. Making a
//      feature live without clearing (or re-keying) its claim sites = RED.
//   3. The site inventory is EXACT both ways: an unpinned FUTURE claim (a
//      new "coming" promise nobody registered) = RED; a pinned site whose
//      file dropped the claim = RED (the pin is stale — clean it, dated).
//   4. The human words "Coming later" live ONLY in the truthStatus atom —
//      hardcoding them anywhere else bypasses the badge system = RED.
// Comment-stripped scans (a pin can never be satisfied — or tripped — by a
// comment). Run in the guards chain; red build, never a founder explanation.

import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");

// ── The PINNED future-claim sites (file → feature keys, one per claim) ──────
// Adding a "coming" promise anywhere = add its pin here, dated, with its
// registry key. Removing/going-live = flip the registry key in the SAME
// commit; this guard then forces the claim sites clean.
const PINNED_CLAIM_SITES: Record<string, readonly string[]> = {
  "wallet/MemberSettings.tsx": [
    "avatarUpload",
    "aliasLayer",
    "languageChoice",
    "resetProfile",
  ],
  // S2b (2026-07-23): the /season page's pot card — the effort rail's frame,
  // FUTURE-badged until S3 funds it (no figure without its escrow proof).
  "pages/SeasonRanking.tsx": ["seasonBounty"],
  "components/referral/ReferralLadderPanel.tsx": [
    "rateRaiseHistory",
    // Seasons arc 2026-07-23: the single seasonEngine key split into
    // seasonRanking/seasonQuests/seasonBounty (§0.14-E). S2b shipped the
    // ranking LIVE — this panel's remaining future claim is the effort
    // rail ("that rail arrives with its own slice") = seasonBounty.
    "seasonBounty",
  ],
  "components/referral/ReferralIntroductionsPanel.tsx": ["secondGeneration"],
  "components/referral/ReferralLinkPanel.tsx": ["aliasLayer"],
};

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1");
}

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const abs = path.join(dir, name);
    if (statSync(abs).isDirectory()) yield* walk(abs);
    else if (/\.(ts|tsx)$/.test(name)) yield abs;
  }
}

const errors: string[] = [];
let checks = 0;
function pin(cond: boolean, fail: string): void {
  checks += 1;
  if (!cond) errors.push(fail);
}

// ── 1 · Parse the registry (text-level — dependency-free) ───────────────────
const registryRaw = readFileSync(
  path.join(srcDir, "config", "featureStatus.ts"),
  "utf8",
);
const statusByKey = new Map<string, string>();
for (const m of registryRaw.matchAll(
  /^\s{2}(\w+):\s*\{\s*status:\s*"(live|future)"/gm,
)) {
  statusByKey.set(m[1] as string, m[2] as string);
}
pin(
  statusByKey.size >= 10,
  `featureStatus.ts parsed only ${statusByKey.size} entries — the registry shape drifted`,
);

// ── 2 · Every pinned site's key is FUTURE; counts match exactly ─────────────
const FUTURE_MARK = /lifecycle="FUTURE"/g;
for (const [rel, keys] of Object.entries(PINNED_CLAIM_SITES)) {
  const abs = path.join(srcDir, rel);
  const code = stripComments(readFileSync(abs, "utf8"));
  const found = [...code.matchAll(FUTURE_MARK)].length;
  pin(
    found === keys.length,
    `${rel}: ${found} FUTURE claim(s) but ${keys.length} pinned — register or clean, dated`,
  );
  for (const key of keys) {
    const status = statusByKey.get(key);
    pin(
      status === "future",
      `${rel}: claims "${key}" is coming, but the registry says "${status}" — A LIVING FEATURE IS TOLD AS FUTURE (the fossil class; flip the surface copy in this commit)`,
    );
  }
}

// ── 3 · No unpinned FUTURE claim anywhere in src ────────────────────────────
{
  const pinnedFiles = new Set(
    Object.keys(PINNED_CLAIM_SITES).map((r) => path.join(srcDir, r)),
  );
  for (const f of walk(srcDir)) {
    if (pinnedFiles.has(f)) continue;
    const code = stripComments(readFileSync(f, "utf8"));
    const n = [...code.matchAll(FUTURE_MARK)].length;
    pin(
      n === 0,
      `${path.relative(srcDir, f)}: ${n} UNPINNED lifecycle="FUTURE" claim(s) — a "coming" promise must be registered here with its feature key`,
    );
  }
}

// ── 4 · "Coming later" words live ONLY in the truthStatus atom ──────────────
{
  const atom = path.join(srcDir, "config", "truthStatus.ts");
  for (const f of walk(srcDir)) {
    if (f === atom) continue;
    const code = stripComments(readFileSync(f, "utf8"));
    pin(
      !code.includes("Coming later"),
      `${path.relative(srcDir, f)}: hardcoded "Coming later" outside the truthStatus atom — the badge system is the one voice for future`,
    );
  }
}

if (errors.length > 0) {
  console.error(`[guard:feature-truth] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log(
  `[guard:feature-truth] PASS — ${checks} checks; every future claim cites a future feature (DONE-IS-DONE holds).`,
);
