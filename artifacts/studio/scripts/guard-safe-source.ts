// Guard: safe source-attribution terminology.
// Locks the source-attribution surface to recognition-only framing: the
// non-negotiable disclaimer is present and rendered, the approved vocabulary is
// declared, and the mechanism stays paused / any incentive stays a future concept.
//
// Node-loadable (Node >= 22.6 / 24); imports only type-only-dependent config.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  sourceDisclaimer,
  approvedSourceTerms,
  sourceAttributionLifecycle,
  sourceRewardConceptLifecycle,
  sourceAttribution,
} from "../src/config/sourceAttributionTerminology.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const pagePath = path.resolve(here, "..", "src", "pages", "SourceAttribution.tsx");

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

check(
  sourceDisclaimer.trim().length > 0,
  "sourceDisclaimer is declared",
  "sourceDisclaimer is empty",
);
check(
  /never/i.test(sourceDisclaimer) &&
    /(compensation|financial benefit)/i.test(sourceDisclaimer),
  "sourceDisclaimer actively disclaims compensation",
  'sourceDisclaimer must say it is "never" compensation / a financial benefit',
);
check(
  /not an investment/i.test(sourceDisclaimer),
  "sourceDisclaimer states membership is not an investment",
  'sourceDisclaimer must state "Membership is not an investment"',
);
for (const term of [
  "verified introduction",
  "growth contribution",
  "recognition of contribution",
]) {
  check(
    approvedSourceTerms.includes(term),
    `approvedSourceTerms includes "${term}"`,
    `approvedSourceTerms is missing "${term}"`,
  );
}
check(
  sourceAttributionLifecycle === "NOT_ACTIVE",
  "attribution mechanism lifecycle is NOT_ACTIVE (paused)",
  `attribution mechanism must be NOT_ACTIVE, got "${sourceAttributionLifecycle}"`,
);
check(
  sourceRewardConceptLifecycle === "FUTURE",
  "any introduction incentive is a FUTURE concept",
  `introduction incentive concept must be FUTURE, got "${sourceRewardConceptLifecycle}"`,
);
check(
  /never a payment/i.test(sourceAttribution.tagline),
  "source tagline disclaims payment",
  'sourceAttribution.tagline must say "never a payment"',
);
check(
  /not compensation/i.test(sourceAttribution.intro),
  "source intro disclaims compensation",
  'sourceAttribution.intro must say "not compensation"',
);
check(
  sourceAttribution.boundaries.some((b) => /not an investment/i.test(b)),
  "source boundaries restate the not-an-investment rule",
  "sourceAttribution.boundaries must include a not-an-investment boundary",
);

const pageSrc = readFileSync(pagePath, "utf8");
check(
  pageSrc.includes("sourceDisclaimer"),
  "SourceAttribution.tsx renders the disclaimer",
  "SourceAttribution.tsx must render {sourceDisclaimer}",
);

console.log(`[guard:source] ${ok.length} checks passed.`);
if (errors.length) {
  console.error(`[guard:source] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  process.exit(1);
}
console.log(
  `[guard:source] PASS \u2014 source-attribution stays recognition-only and paused.`,
);
