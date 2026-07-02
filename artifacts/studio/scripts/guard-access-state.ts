// Guard: access-state shell (Slice IA-1).
// The S1–S14 vocabulary, the two-field surface registry, and the fail-closed
// shell must stay honest:
//   1. the studio metadata covers exactly the 14 states, each with a valid
//      track and non-empty labels/copy;
//   2. CURRENT_ACCESS_STATE_ID stays pinned to S1 — no auth system exists, so
//      any other value is fake auth (changing it is a founder-gated act);
//   3. every classified surface carries both new fields with valid values;
//   4. NO surface is GATED: frontend gating without a real, wired state
//      machine would be theater — flipping any surface to GATED must be a
//      deliberate future founder-gated change together with this guard;
//   5. the audience ↔ requiredState projection stays consistent
//      (PUBLIC→S1, MEMBER_PREVIEW→S7, OPERATOR_PREVIEW→S11);
//   6. the matrix projection is total (every state × every used requirement
//      evaluates) and fail-closed (unknown state → S1; unmodelled tier →
//      block; PREVIEW_LABELLED never blocks);
//   7. the provider and simulator hold no persistence: no localStorage /
//      sessionStorage / cookies / indexedDB — simulated state is in-memory
//      only and the app-wide state is hardwired;
//   8. the shared vocabulary in lib/os-contracts stays type-only and never
//      accepts a "SIMULATED" value;
//   9. no access-shell file carries wallet-address or 64-hex material — this
//      layer is vocabulary only and must never pair wallets with members.
//
// Scans are comment-stripped so documentation may name the primitives it
// forbids without self-matching. Node-loadable (Node >= 22.6 / 24).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  ACCESS_STATE_IDS,
  CURRENT_ACCESS_STATE_ID,
  accessStates,
  evaluateAccess,
  matrixAllows,
  resolveAccessState,
} from "../src/config/accessState.ts";
import { surfaceClassification } from "../src/config/surfaceClassification.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(here, "..", "src");
const repoRoot = path.resolve(here, "..", "..", "..");

function read(abs: string): string {
  return readFileSync(abs, "utf8");
}

function stripComments(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/([^:"'])\/\/[^\n"']*$/gm, "$1");
}

const errors: string[] = [];
const ok: string[] = [];
function check(cond: boolean, pass: string, fail: string): void {
  if (cond) ok.push(pass);
  else errors.push(fail);
}

// ── 1. Fourteen states, valid tracks, complete metadata ─────────────────────
const EXPECTED_IDS = [
  "S1", "S2", "S3", "S4", "S5", "S6", "S7",
  "S8", "S9", "S10", "S11", "S12", "S13", "S14",
];
check(
  ACCESS_STATE_IDS.length === 14 &&
    EXPECTED_IDS.every((id, i) => ACCESS_STATE_IDS[i] === id),
  "accessStates covers exactly S1–S14 in order",
  `accessStates must cover exactly S1–S14 (found: ${ACCESS_STATE_IDS.join(", ")})`,
);
const VALID_TRACKS = new Set(["USER", "PRIVILEGED", "MACHINE"]);
for (const id of ACCESS_STATE_IDS) {
  const m = accessStates[id];
  check(
    Boolean(m) &&
      VALID_TRACKS.has(m.track) &&
      m.name.length > 0 &&
      m.chipLabel.startsWith(`${id} ·`) &&
      m.honestNote.length > 0,
    `${id}: complete metadata (track ${m?.track})`,
    `${id}: metadata incomplete or invalid (need name, valid track, "${id} ·"-prefixed chipLabel, honestNote)`,
  );
}
check(
  accessStates.S14.track === "MACHINE" &&
    accessStates.S11.track === "PRIVILEGED" &&
    accessStates.S12.track === "PRIVILEGED" &&
    accessStates.S13.track === "PRIVILEGED",
  "track split matches the design doc (§1): S11–S13 PRIVILEGED, S14 MACHINE",
  "track assignments drifted from the design doc (§1): S11–S13 must be PRIVILEGED, S14 MACHINE",
);

// ── 2. The one real state stays S1 ───────────────────────────────────────────
check(
  CURRENT_ACCESS_STATE_ID === "S1",
  "CURRENT_ACCESS_STATE_ID is pinned to S1 (no auth system exists)",
  "CURRENT_ACCESS_STATE_ID must stay S1 until a real, founder-approved session system exists — anything else is fake auth",
);

// ── 3 + 4 + 5. Two-field registry: valid, ungated, audience-consistent ──────
const VALID_ENFORCEMENT = new Set(["PREVIEW_LABELLED", "GATED"]);
const audienceRequired: Record<string, string> = {
  PUBLIC: "S1",
  MEMBER_PREVIEW: "S7",
  OPERATOR_PREVIEW: "S11",
};
let gatedCount = 0;
for (const s of surfaceClassification) {
  check(
    (EXPECTED_IDS as string[]).includes(s.requiredState) &&
      VALID_ENFORCEMENT.has(s.enforcement),
    `${s.routePath}: classified (requiredState ${s.requiredState}, ${s.enforcement})`,
    `${s.routePath}: requiredState/enforcement missing or invalid`,
  );
  if (s.enforcement === "GATED") gatedCount++;
  check(
    s.requiredState === audienceRequired[s.audience],
    `${s.routePath}: requiredState matches audience ${s.audience}`,
    `${s.routePath}: audience ${s.audience} must map to requiredState ${audienceRequired[s.audience]}, found ${s.requiredState}`,
  );
}
check(
  gatedCount === 0,
  "no surface is GATED (no wired state machine exists)",
  `${gatedCount} surface(s) are GATED — forbidden until a real, wired, founder-approved state machine exists; update this guard deliberately in that slice`,
);

// ── 6. Matrix projection is total and fail-closed ───────────────────────────
const usedRequirements = [...new Set(surfaceClassification.map((s) => s.requiredState))];
let matrixTotal = true;
for (const st of ACCESS_STATE_IDS) {
  for (const req of usedRequirements) {
    if (typeof matrixAllows(st, req) !== "boolean") matrixTotal = false;
  }
}
check(
  matrixTotal,
  `matrix projection is total (14 states × ${usedRequirements.length} used requirements)`,
  "matrixAllows failed to evaluate some state × requirement pair",
);
check(
  resolveAccessState("NOT_A_STATE") === "S1" &&
    resolveAccessState(undefined) === "S1",
  "unknown state resolves to S1 (fail closed)",
  "resolveAccessState must resolve unknown values to S1",
);
check(
  evaluateAccess("S1", "S11", "GATED").allowed === false &&
    evaluateAccess("S1", "S7", "GATED").allowed === false,
  "a GATED surface above S1 blocks (fail closed)",
  "evaluateAccess must block a GATED surface whose requirement exceeds the current state",
);
check(
  surfaceClassification.every(
    (s) => evaluateAccess("S1", s.requiredState, s.enforcement).allowed,
  ),
  "every current surface renders for S1 (all PREVIEW_LABELLED — behavior preserved)",
  "a PREVIEW_LABELLED surface blocked for S1 — IA-1 must not change current rendering",
);
check(
  matrixAllows("S14", "S1") === false && matrixAllows("S13", "S7") === false,
  "matrix spot checks match the design doc §3 (S14 has no public FE; S13 not in member cockpit)",
  "matrix drifted from the design doc §3 rows",
);

// ── 7. No persistence in the access shell ────────────────────────────────────
const shellFiles = [
  "components/access/AccessStateProvider.tsx",
  "components/access/AccessGate.tsx",
  "components/access/AccessStateChip.tsx",
  "operator/AccessStateSimulator.tsx",
  "config/accessState.ts",
];
const PERSISTENCE = ["localStorage", "sessionStorage", "document.cookie", "indexedDB"];
for (const rel of shellFiles) {
  const code = stripComments(read(path.resolve(srcDir, rel)));
  for (const banned of PERSISTENCE) {
    check(
      !code.includes(banned),
      `${rel}: no ${banned}`,
      `${rel} uses ${banned} — the access shell must hold no persistence (in-memory only)`,
    );
  }
}
const providerCode = stripComments(
  read(path.resolve(srcDir, "components/access/AccessStateProvider.tsx")),
);
for (const banned of ["useState", "useEffect", "fetch("]) {
  check(
    !providerCode.includes(banned),
    `provider is hardwired: no ${banned}`,
    `AccessStateProvider must stay hardwired to S1 — found \`${banned}\``,
  );
}
const simulatorCode = stripComments(
  read(path.resolve(srcDir, "operator/AccessStateSimulator.tsx")),
);
check(
  simulatorCode.includes("useState"),
  "simulator state is in-memory React state",
  "AccessStateSimulator must keep its simulated state in React useState (in-memory only)",
);
check(
  !simulatorCode.includes("AccessStateProvider"),
  "simulator never touches the app-wide provider",
  "AccessStateSimulator must not import or wrap the app-wide AccessStateProvider — simulation stays self-contained",
);

// ── 8. Shared vocabulary stays type-only, no SIMULATED value ─────────────────
const contractsSrc = stripComments(
  read(path.resolve(repoRoot, "lib", "os-contracts", "src", "access-state.ts")),
);
check(
  !/export\s+(const|function|class|let|var)\b/.test(contractsSrc),
  "lib/os-contracts access-state.ts is type-only (no runtime exports)",
  "lib/os-contracts/src/access-state.ts must stay type-only",
);
check(
  !/"SIMULATED[^"]*"\s*(\||;|$)/m.test(contractsSrc),
  'no "SIMULATED" accepted value in the shared vocabulary',
  'lib/os-contracts access-state.ts must never accept a "SIMULATED" value — simulator warning copy is UI copy only',
);

// ── 9. No wallet/hex material in the access shell ────────────────────────────
const HEX40 = /0x[0-9a-fA-F]{40}\b/;
const HEX64 = /\b[0-9a-fA-F]{64}\b/;
for (const rel of shellFiles) {
  const code = stripComments(read(path.resolve(srcDir, rel)));
  check(
    !HEX40.test(code) && !HEX64.test(code),
    `${rel}: no wallet-address / 64-hex material`,
    `${rel} contains wallet-address or 64-hex material — the access shell is vocabulary only`,
  );
}

// ── Report ───────────────────────────────────────────────────────────────────
for (const line of ok) console.log(`PASS  ${line}`);
if (errors.length > 0) {
  for (const line of errors) console.error(`FAIL  ${line}`);
  console.error(`\nguard-access-state: ${errors.length} check(s) failed.`);
  process.exit(1);
}
console.log(`\nguard-access-state: all ${ok.length} checks passed.`);
