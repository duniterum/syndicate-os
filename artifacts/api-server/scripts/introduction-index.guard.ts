/**
 * Guard: introduction read-model (R5). Node-loadable, dependency-light.
 * ---------------------------------------------------------------------------
 * 1. FIXTURES — the pure builder is deterministic (shuffled input →
 *    byte-identical output), counts correctly (durable test, unique
 *    recipients, repeat purchases), and FAILS CLOSED on every shape surprise.
 * 2. SNAPSHOT — the committed generated snapshot parses, is internally
 *    coherent (totals == sum of rows, hash matches content), and contains
 *    ZERO identity material: no 40-hex address run, no raw bytes32 source id,
 *    and none of the forbidden field names.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  buildIntroductionReadmodel,
  readmodelCanonicalJson,
  readmodelHash,
  sourceKeyOf,
  type AttributedPurchaseRow,
} from "../src/lib/protocol/introductionReadmodel.ts";
import { INTRODUCTION_SNAPSHOT } from "../src/lib/protocol/introductionSnapshot.ts";

const errors: string[] = [];
let passes = 0;
function check(cond: boolean, fail: string): void {
  if (cond) passes += 1;
  else errors.push(fail);
}
function throws(fn: () => unknown, label: string): void {
  try {
    fn();
    errors.push(`${label}: expected a throw, got none`);
  } catch {
    passes += 1;
  }
}

// ── 1. Fixtures ──────────────────────────────────────────────────────────────
const SRC_A = `0x${"a".repeat(64)}`;
const SRC_B = `0x${"b".repeat(64)}`;
const R1 = `0x${"1".repeat(40)}`;
const R2 = `0x${"2".repeat(40)}`;
const R3 = `0x${"3".repeat(40)}`;
const row = (
  n: number,
  sourceId: string,
  recipient: string,
  cost: string,
): AttributedPurchaseRow => ({
  chainId: 43114,
  eventName: "MembershipPurchasedV3",
  blockNumber: 88_505_301 + n,
  logIndex: 0,
  sourceId,
  recipient,
  acquisitionCostRaw: cost,
});
const rows = [
  row(1, SRC_A, R1, "250000"),
  row(2, SRC_A, R2, "250000"),
  row(3, SRC_A, R2, "500000"), // repeat purchase — same recipient, not a 2nd introduction
  row(4, SRC_B, R3, "100000"),
];
const inputs = {
  rows,
  durableByRecipient: { [R1]: true, [R2]: false, [R3]: true },
  escrowBySourceId: { [SRC_A]: "0", [SRC_B]: "42" },
  fromBlock: 88_505_301,
  asOfBlock: 90_000_000,
};
const m1 = buildIntroductionReadmodel(inputs);
const m2 = buildIntroductionReadmodel({ ...inputs, rows: [...rows].reverse() });
check(
  readmodelCanonicalJson(m1) === readmodelCanonicalJson(m2),
  "shuffled input must produce byte-identical output",
);
const a = m1.bySource[sourceKeyOf(SRC_A)];
const b = m1.bySource[sourceKeyOf(SRC_B)];
check(a?.attributedPurchases === 3, "source A: 3 attributed purchases");
check(a?.introducedMembers === 2, "source A: 2 unique introduced members");
check(a?.durableIntroductions === 1, "source A: 1 durable (R2 dumped its SYN)");
check(a?.commissionPaidRaw === "1000000", "source A: commission sum exact");
check(b?.durableIntroductions === 1 && b?.escrowOwedRaw === "42", "source B: durable + escrow");
check(m1.totals.attributedPurchases === 4 && m1.totals.distinctSources === 2, "totals coherent");
check(m1.durableTest === "SYN_BALANCE_HELD", "the founder-decided durable test is pinned");

throws(
  () => buildIntroductionReadmodel({ ...inputs, rows: [row(1, SRC_A, R1, "1.5")] }),
  "non-decimal commission",
);
throws(
  () =>
    buildIntroductionReadmodel({
      ...inputs,
      rows: [{ ...row(1, SRC_A, R1, "1"), chainId: 1 }],
    }),
  "wrong chain",
);
throws(
  () => buildIntroductionReadmodel({ ...inputs, rows: [row(1, SRC_A, `0x${"9".repeat(40)}`, "1")] }),
  "recipient missing from the durable map",
);
throws(
  () => buildIntroductionReadmodel({ ...inputs, rows: [row(1, `0x${"0".repeat(64)}`, R1, "1")] }),
  "zero sourceId row",
);
throws(() => sourceKeyOf("0x1234"), "sourceKeyOf rejects a non-bytes32");

// ── 2. The committed snapshot ────────────────────────────────────────────────
const snap = INTRODUCTION_SNAPSHOT;
check(snap.status === "VERIFIED", "snapshot status VERIFIED");
check(snap.model.chainId === 43114, "snapshot chain 43114");
check(
  readmodelHash(snap.model) === snap.snapshotHash,
  "snapshotHash matches the model content (no hand edits)",
);
const sumRows = Object.values(snap.model.bySource);
check(
  sumRows.reduce((n, r) => n + r.attributedPurchases, 0) === snap.model.totals.attributedPurchases,
  "totals.attributedPurchases == sum of rows",
);
check(
  sumRows.reduce((n, r) => n + r.durableIntroductions, 0) === snap.model.totals.durableIntroductions,
  "totals.durableIntroductions == sum of rows",
);
check(
  Object.keys(snap.model.bySource).every((k) => /^src_[0-9a-f]{24}$/.test(k)),
  "every per-source key is the opaque sourceKey shape",
);

const here = path.dirname(fileURLToPath(import.meta.url));
const fileText = readFileSync(
  path.resolve(here, "..", "src", "lib", "protocol", "introductionSnapshot.ts"),
  "utf8",
);
check(!/0x[0-9a-fA-F]{40}/.test(fileText), "no 40-hex address run in the snapshot file");
check(!/0x[0-9a-fA-F]{64}/.test(fileText), "no raw bytes32 (sourceId/tx) in the snapshot file");
for (const f of ["recipient", "buyer", "wallet", "transactionHash", "memberNumber", "logIndex"]) {
  check(!fileText.includes(`"${f}"`), `forbidden field "${f}" absent from the snapshot file`);
}

console.log(`[guard:introductions] ${passes} checks passed.`);
if (errors.length) {
  console.error(`[guard:introductions] ${errors.length} FAILURE(S):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}
console.log("[guard:introductions] PASS — deterministic, fail-closed, address-free.");
