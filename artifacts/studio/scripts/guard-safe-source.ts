// Guard: safe source-attribution terminology.
// Locks the source-attribution surface to bounded, protective framing: the
// non-negotiable disclaimer is present and rendered and the approved
// vocabulary is declared.
//
// REFERRAL ACTIVATION ADAPTATION (founder-ordered slice, 2026-07-13, per
// CANON_LOI_ANTIBLOCAGE — the guard is adapted IN the slice, then re-locked):
// the program lifecycle pins flipped from "must stay paused" to "must be
// exactly LIVE_ACTION" (the founder-published state; the commission is paid
// inside the buyer's own signed transaction). The PROTECTIVE pins are
// permanent and unchanged: the disclaimers (not passive income / not an
// investment / no profit promise), the constitutional line, and the
// recognition concept staying FUTURE.
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
  sourceAttributionLifecycle === "LIVE_ACTION",
  "attribution mechanism lifecycle is LIVE_ACTION (founder-published 2026-07-13)",
  `attribution mechanism must be LIVE_ACTION (the founder-published state), got "${sourceAttributionLifecycle}"`,
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
  /active terms/i.test(sourceAttribution.intro) &&
    /never creates, activates, or writes/i.test(sourceAttribution.intro) &&
    /founder-signed on-chain act/i.test(sourceAttribution.intro),
  "source intro states the active terms + the read-only /source boundary + founder-gated creation",
  "sourceAttribution.intro must state active terms, the never-creates/writes boundary, and that a new source is a founder-signed on-chain act",
);
check(
  sourceAttribution.boundaries.some((b) => /not an investment/i.test(b)),
  "source boundaries restate the not-an-investment rule",
  "sourceAttribution.boundaries must include a not-an-investment boundary",
);

check(
  programLifecycle === "LIVE_ACTION",
  "referral programLifecycle is LIVE_ACTION (founder-published 2026-07-13)",
  `referral programLifecycle must be LIVE_ACTION (the founder-published state), got "${programLifecycle}"`,
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
  `[guard:source] PASS \u2014 source/referral is bounded, protective, and honestly ACTIVE.`,
);
