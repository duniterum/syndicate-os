// Guard: posture-map resolves to SourcePosture.
// Both projection maps in truthStatus.ts (TruthStatus -> SourcePosture and
// DisplayLifecycle -> SourcePosture) must be total and land on a valid
// @workspace/os-contracts SourcePosture. Nothing in this read-only foundation may
// project to LIVE_ACTION.
//
// SourcePosture is a TYPE-ONLY contract (os-contracts ships no runtime value), so
// the canonical posture set is mirrored here on purpose.
//
// Node-loadable (Node >= 22.6 / 24).

import {
  truthStatusToPosture,
  displayLifecycleToPosture,
  truthStatusText,
  displayLifecycleText,
} from "../src/config/truthStatus.ts";

const VALID_POSTURE = new Set([
  "NOT_WIRED",
  "READ_ONLY_PROOF",
  "VERIFIED_SOURCE_PENDING_ADAPTER",
  "AUTH_REQUIRED",
  "ADMIN_ONLY",
  "LIVE_ACTION",
  "FUTURE",
]);

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

const maps: { name: string; keys: string[]; map: Record<string, string> }[] = [
  {
    name: "TruthStatus",
    keys: Object.keys(truthStatusText),
    map: truthStatusToPosture as Record<string, string>,
  },
  {
    name: "DisplayLifecycle",
    keys: Object.keys(displayLifecycleText),
    map: displayLifecycleToPosture as Record<string, string>,
  },
];

for (const { name, keys, map } of maps) {
  for (const key of keys) {
    const posture = map[key];
    check(
      posture !== undefined,
      `${name} "${key}" is mapped`,
      `${name} "${key}" has no posture mapping`,
    );
    if (posture !== undefined) {
      check(
        VALID_POSTURE.has(posture),
        `${name} "${key}" -> valid posture ${posture}`,
        `${name} "${key}" maps to invalid posture "${posture}"`,
      );
      check(
        posture !== "LIVE_ACTION",
        `${name} "${key}" is not LIVE_ACTION`,
        `${name} "${key}" maps to LIVE_ACTION \u2014 forbidden in a read-only foundation`,
      );
    }
  }
  for (const key of Object.keys(map)) {
    check(
      keys.includes(key),
      `${name} map key "${key}" is real vocabulary`,
      `${name} map has unknown key "${key}"`,
    );
  }
}

console.log(`[guard:posture] ${ok.length} checks passed.`);
if (errors.length) {
  console.error(`[guard:posture] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  \u2717 ${e}`);
  process.exit(1);
}
console.log(
  `[guard:posture] PASS \u2014 every posture projection is total, valid, and non-live.`,
);
