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
import {
  programLifecycle,
  constitutionalLine,
} from "../src/config/referralProgram.ts";

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
  /not passive income/i.test(sourceDisclaimer) &&
    /token yield/i.test(sourceDisclaimer) &&
    /profit promise/i.test(sourceDisclaimer),
  "sourceDisclaimer carries the protective negatives (passive income / yield / profit promise)",
  "sourceDisclaimer must disclaim passive income, token yield, and a profit promise",
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
  /introduction|receipt|source|door/i.test(sourceAttribution.tagline),
  "source tagline frames the verified introduction",
  "sourceAttribution.tagline must frame the introduction / receipt",
);
check(
  /paused/i.test(sourceAttribution.intro),
  "source intro discloses that public activation is paused",
  "sourceAttribution.intro must disclose the paused reality",
);
check(
  sourceAttribution.boundaries.some((b) => /not an investment/i.test(b)),
  "source boundaries restate the not-an-investment rule",
  "sourceAttribution.boundaries must include a not-an-investment boundary",
);

check(
  programLifecycle === "NOT_ACTIVE" ||
    programLifecycle === "FUTURE" ||
    programLifecycle === "PAUSED_BY_PRECAUTION",
  "referral program stays paused (never presented as live)",
  `referral programLifecycle must be paused, got "${programLifecycle}"`,
);
check(
  /not passive income/i.test(constitutionalLine) &&
    /profit promise/i.test(constitutionalLine),
  "referral constitutionalLine carries the protective negatives",
  "referral constitutionalLine must disclaim passive income and a profit promise",
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
  `[guard:source] PASS \u2014 source/referral stays bounded, protective, and paused.`,
);
