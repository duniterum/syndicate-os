/**
 * GUARD: Part B import gate — fail-closed behavior matrix (tsx-only).
 * -------------------------------------------------------------------
 * Exercises the pure gate engine against a fully SYNTHETIC fixture (fabricated
 * deterministic wallets — NEVER real member data) and proves that every
 * tamper/mismatch class fails closed, replay comparison is exact-or-fail, the
 * parser is BOM-tolerant + unknown-field-surfacing, and no gate output ever
 * carries an address. No network, no DB.
 *
 * Run: pnpm --filter @workspace/api-server run partB-import:guard
 */

import {
  computeLeaf,
  computeRoot,
  hashPair,
  keccakOfAscii,
  toChecksumAddress,
} from "../src/lib/protocol/merkleFreeze";
import {
  compareExistingVsPlan,
  parseFreezeArtifact,
  runPartBGate,
  type ExistingFreezeRow,
  type ExistingMemberRow,
  type GateOutcome,
  type PartBLiveReads,
  type RawSaleAggregates,
} from "../src/lib/protocol/partBImportGate";
import { PART_B_EXPECTATIONS } from "../src/data/partBExpectations";
import type { ChainProbe } from "../src/lib/protocol/evmRead";

type Result = { name: string; ok: boolean; detail?: string };
const results: Result[] = [];
const check = (name: string, ok: boolean, detail?: string) => {
  results.push(detail === undefined ? { name, ok } : { name, ok, detail });
};

const FULL_ADDRESS_RE = /0x[0-9a-fA-F]{40}(?![0-9a-fA-F])/;

// ---------------------------------------------------------------------------
// Synthetic fixture (deterministic fabricated wallets — no real data)
// ---------------------------------------------------------------------------

function syntheticWallet(i: number): string {
  return toChecksumAddress(`0x${keccakOfAscii(`partB-synthetic-wallet-${i}`).slice(2, 42)}`);
}
function syntheticTx(i: number): string {
  return keccakOfAscii(`partB-synthetic-tx-${i}`);
}

/** Sibling-path proof builder mirroring computeRoot (sorted pairs, odd promoted). */
function buildProof(leaves: readonly string[], index: number): string[] {
  let level = leaves.map((l) => l.toLowerCase());
  let i = index;
  const proof: string[] = [];
  while (level.length > 1) {
    const sib = i % 2 === 0 ? i + 1 : i - 1;
    if (sib < level.length) proof.push(level[sib]!);
    const next: string[] = [];
    for (let j = 0; j < level.length; j += 2) {
      if (j + 1 < level.length) next.push(hashPair(level[j]!, level[j + 1]!));
      else next.push(level[j]!);
    }
    i = Math.floor(i / 2);
    level = next;
  }
  return proof;
}

const SOURCES = ["V1", "V1", "V2a", "V2a", "V2a", "V2b", "V2b", "V2b"] as const;
const exp = PART_B_EXPECTATIONS;

type FixtureMember = {
  wallet: string;
  memberNumber: number;
  firstBlock: number;
  logIndex: number;
  firstTransaction: string;
  source: string;
  leaf: string;
  proof: string[];
};

function buildFixture(): {
  artifactJson: Record<string, unknown>;
  root: string;
  members: FixtureMember[];
} {
  const base = exp.freezeBlock - 1_000_000;
  const partial = Array.from({ length: 8 }, (_, idx) => {
    const memberNumber = idx + 1;
    return {
      wallet: syntheticWallet(memberNumber),
      memberNumber,
      firstBlock: base + idx * 1000,
      logIndex: idx % 3,
      firstTransaction: syntheticTx(memberNumber),
      source: SOURCES[idx]!,
      leaf: computeLeaf(syntheticWallet(memberNumber), memberNumber),
    };
  });
  const leaves = partial.map((m) => m.leaf);
  const root = computeRoot(leaves);
  const members: FixtureMember[] = partial.map((m, idx) => ({
    ...m,
    proof: buildProof(leaves, idx),
  }));
  const artifactJson: Record<string, unknown> = {
    schema: exp.artifact.schema,
    generatedAt: "2026-06-21T10:41:53.677Z",
    exactCommandUsed: "synthetic-fixture (guard only)",
    inputPath: exp.artifact.inputPath,
    outputPath: exp.artifact.outputPath,
    inputHash: `sha256:${keccakOfAscii("synthetic-input").slice(2)}`,
    freezeBlock: exp.freezeBlock,
    chainId: exp.chainId,
    memberCount: 8,
    root,
    previousDocumentedRoot: root,
    rootMatchesPreviousDocumentedRoot: true,
    leafFormat: "keccak256(bytes.concat(keccak256(abi.encode(wallet, memberNumber))))",
    treeAlgorithm: "synthetic guard tree",
    sourceOrder: "synthetic guard order",
    verification: { allProofsVerify: true },
    members,
  };
  return { artifactJson, root, members };
}

function goodLive(root: string): PartBLiveReads {
  const probe: ChainProbe = {
    rpcReachable: true,
    chainIdActual: exp.chainId,
    chainIdActualHex: "0xa86a",
    chainIdOk: true,
    wrongChain: false,
  };
  return { probe, onChainRoot: root, liveReadError: null };
}

function goodRaw(members: readonly FixtureMember[]): RawSaleAggregates {
  return {
    totalRawRows: 26,
    v1EventCount: 5,
    v1DistinctBuyersLower: members
      .filter((m) => m.source === "V1")
      .map((m) => m.wallet.toLowerCase()),
    v2aFirstSeatMemberNumbers: [3, 4, 5],
    v2bFirstSeatTrueMemberNumbers: [6, 7, 8],
    v2bSentinelZeroCount: 1,
    v2bSentinelZeroAllFirstSeatFalse: true,
    v3FirstSeatMemberNumbers: [9, 10],
    txLogPairsLower: new Set(
      members.map((m) => `${m.firstTransaction.toLowerCase()}#${m.logIndex}`),
    ),
  };
}

/** Synthetic expectations: real pins except the root, which is the fixture's. */
function synthExpectations(root: string) {
  return { ...exp, expectedRoot: root };
}

function runFixture(
  mutate?: (a: Record<string, unknown>) => void,
  liveOverride?: (root: string) => PartBLiveReads,
  rawOverride?: (r: RawSaleAggregates) => RawSaleAggregates,
): GateOutcome {
  const { artifactJson, root, members } = buildFixture();
  if (mutate) mutate(artifactJson);
  const parsed = parseFreezeArtifact(JSON.stringify(artifactJson));
  const live = (liveOverride ?? goodLive)(root);
  const raw = rawOverride ? rawOverride(goodRaw(members)) : goodRaw(members);
  return runPartBGate({
    parsed,
    live,
    raw,
    inputSnapshotSha256: null,
    expectations: synthExpectations(root),
  });
}

const outcomes: GateOutcome[] = [];
const expectPass = (name: string, outcome: GateOutcome) => {
  outcomes.push(outcome);
  check(
    name,
    outcome.ok && outcome.plan !== null,
    outcome.ok ? undefined : outcome.checks.filter((c) => !c.ok).map((c) => c.name).join("; "),
  );
  return outcome;
};
const expectFail = (name: string, outcome: GateOutcome, mustFail?: string) => {
  outcomes.push(outcome);
  const failed = outcome.checks.filter((c) => !c.ok).map((c) => c.name);
  const hit = mustFail === undefined || failed.some((f) => f.includes(mustFail));
  check(
    name,
    !outcome.ok && outcome.plan === null && hit,
    outcome.ok ? "gate unexpectedly PASSED" : `failed: ${failed.join("; ")}`,
  );
};

// --- base case ---------------------------------------------------------------
const base = expectPass("BASE: synthetic 8-member fixture passes the full gate", runFixture());
check(
  "BASE: plan maps V2a/V2b → enum V2A/V2B",
  base.plan !== null &&
    base.plan.members.filter((m) => m.source === "V2A").length === 3 &&
    base.plan.members.filter((m) => m.source === "V2B").length === 3 &&
    base.plan.members.filter((m) => m.source === "V1").length === 2,
);
check(
  "BASE: plan rows ordered 1..8 with VERIFIED status",
  base.plan !== null &&
    base.plan.members.every((m, i) => m.memberNumber === i + 1) &&
    base.plan.freeze.validationStatus === "VERIFIED",
);
check(
  "V1 DOCTRINE: gate passes without any raw V1 memberNumber signal",
  base.ok, // goodRaw has no V1 memberNumbers at all — only distinct buyers
);

// --- tamper/mismatch matrix (every class must fail closed) ---------------------
expectFail("chainId mismatch fails", runFixture((a) => { a.chainId = 1; }), "chainId");
expectFail("freezeBlock mismatch fails", runFixture((a) => { a.freezeBlock = 1; }), "freezeBlock");
expectFail("memberCount 7 fails", runFixture((a) => { a.memberCount = 7; }), "memberCount");
expectFail(
  "missing member fails",
  runFixture((a) => { (a.members as unknown[]).pop(); }),
);
expectFail(
  "sentinel memberNumber 0 fails",
  runFixture((a) => { (a.members as FixtureMember[])[0]!.memberNumber = 0; }),
  "sentinel",
);
expectFail(
  "duplicate memberNumber fails",
  runFixture((a) => { (a.members as FixtureMember[])[1]!.memberNumber = 1; }),
  "duplicate",
);
expectFail(
  "case-variant duplicate wallet fails",
  runFixture((a) => {
    const ms = a.members as FixtureMember[];
    ms[1]!.wallet = ms[0]!.wallet.toLowerCase();
  }),
);
expectFail(
  "malformed / non-checksum wallet fails",
  runFixture((a) => { (a.members as FixtureMember[])[2]!.wallet = (a.members as FixtureMember[])[2]!.wallet.toLowerCase(); }),
  "EIP-55",
);
expectFail(
  "unmapped source value fails",
  runFixture((a) => { (a.members as FixtureMember[])[0]!.source = "V9"; }),
  "sources map",
);
expectFail(
  "wrong distribution fails",
  runFixture((a) => { (a.members as FixtureMember[])[5]!.source = "V2a"; }),
  "distribution",
);
expectFail(
  "tampered leaf fails",
  runFixture((a) => {
    (a.members as FixtureMember[])[3]!.leaf = keccakOfAscii("tampered");
  }),
  "leaf recompute",
);
expectFail(
  "tampered root fails",
  runFixture((a) => { a.root = keccakOfAscii("evil-root"); }),
  "root",
);
expectFail(
  "tampered proof fails",
  runFixture((a) => {
    (a.members as FixtureMember[])[4]!.proof = [keccakOfAscii("bogus")];
  }),
  "proofs verify",
);
expectFail(
  "first-seen ordering violation fails",
  runFixture((a) => {
    const ms = a.members as FixtureMember[];
    // swap chain positions of members 1 and 2 without renumbering
    const b = ms[0]!.firstBlock;
    ms[0]!.firstBlock = ms[1]!.firstBlock;
    ms[1]!.firstBlock = b;
    // recompute leaves/proofs so ONLY the ordering check can fail
    ms.forEach((m) => { m.leaf = computeLeaf(m.wallet, m.memberNumber); });
    const leaves = ms.map((m) => m.leaf);
    a.root = computeRoot(leaves);
    a.previousDocumentedRoot = a.root;
    ms.forEach((m, i) => { m.proof = buildProof(leaves, i); });
  }),
  "first-seen",
);
expectFail(
  "post-freeze member firstBlock fails",
  runFixture((a) => {
    (a.members as FixtureMember[])[7]!.firstBlock = exp.freezeBlock + 1;
  }),
  "pre-freeze",
);

// live authority failures — fail closed, never fall back to pinned root
expectFail(
  "RPC unreachable fails closed",
  runFixture(undefined, () => ({
    probe: { rpcReachable: false, chainIdActual: null, chainIdActualHex: null, chainIdOk: false, wrongChain: false },
    onChainRoot: null,
    liveReadError: "rpc unreachable",
  })),
  "eth_chainId",
);
expectFail(
  "wrong live chain fails closed",
  runFixture(undefined, () => ({
    probe: { rpcReachable: true, chainIdActual: 1, chainIdActualHex: "0x1", chainIdOk: false, wrongChain: true },
    onChainRoot: null,
    liveReadError: "wrong chain",
  })),
  "eth_chainId",
);
expectFail(
  "live root read failure fails closed (no pinned fallback)",
  runFixture(undefined, (root) => ({ ...goodLive(root), onChainRoot: null, liveReadError: "eth_call failed" })),
  "V1_MEMBER_ROOT",
);
expectFail(
  "live root mismatch fails",
  runFixture(undefined, () => ({ ...goodLive(keccakOfAscii("other-root")), liveReadError: null })),
  "V1_MEMBER_ROOT",
);

// raw reconciliation failures
expectFail(
  "raw V1 buyer count 3 fails",
  runFixture(undefined, undefined, (r) => ({
    ...r,
    v1DistinctBuyersLower: [...r.v1DistinctBuyersLower, "0x" + "9".repeat(40)],
  })),
  "distinct buyers",
);
expectFail(
  "V1 member not among raw buyers fails",
  runFixture(undefined, undefined, (r) => ({
    ...r,
    v1DistinctBuyersLower: ["0x" + "1".repeat(40), "0x" + "2".repeat(40)],
  })),
  "raw V1 buyer",
);
expectFail(
  "raw V2A set {3,4} fails",
  runFixture(undefined, undefined, (r) => ({ ...r, v2aFirstSeatMemberNumbers: [3, 4] })),
  "V2A",
);
expectFail(
  "raw V2B firstSeat count 2 fails",
  runFixture(undefined, undefined, (r) => ({ ...r, v2bFirstSeatTrueMemberNumbers: [6, 7] })),
  "V2B",
);
expectFail(
  "sentinel rows with firstSeat=true fail",
  runFixture(undefined, undefined, (r) => ({ ...r, v2bSentinelZeroAllFirstSeatFalse: false })),
  "sentinel",
);
expectFail(
  "V3 corroboration break fails",
  runFixture(undefined, undefined, (r) => ({ ...r, v3FirstSeatMemberNumbers: [8, 9] })),
  "V3",
);
expectFail(
  "member tx missing from raw index fails",
  runFixture(undefined, undefined, (r) => {
    const pairs = new Set(r.txLogPairsLower);
    pairs.delete([...pairs][0]!);
    return { ...r, txLogPairsLower: pairs };
  }),
  "raw index",
);

// --- parser behavior -----------------------------------------------------------
{
  const { artifactJson } = buildFixture();
  const text = JSON.stringify(artifactJson);
  const bomParsed = parseFreezeArtifact(`\uFEFF${text}`);
  check("parser tolerates BOM", bomParsed.artifact.memberCount === 8);

  const withUnknown = { ...artifactJson, futureField: true };
  const parsedUnknown = parseFreezeArtifact(JSON.stringify(withUnknown));
  check(
    "unknown top-level field is SURFACED",
    parsedUnknown.unknownTopLevelKeys.includes("futureField"),
  );
  const membersUnknown = JSON.parse(text) as { members: Record<string, unknown>[] };
  membersUnknown.members[0]!.extraMemberField = 1;
  const parsedMemberUnknown = parseFreezeArtifact(JSON.stringify(membersUnknown));
  check(
    "unknown member field is SURFACED",
    parsedMemberUnknown.unknownMemberKeys.includes("extraMemberField"),
  );
  const gateWithUnknown = runPartBGate({
    parsed: parsedUnknown,
    live: goodLive(artifactJson.root as string),
    raw: goodRaw(artifactJson.members as FixtureMember[]),
    inputSnapshotSha256: null,
    expectations: synthExpectations(artifactJson.root as string),
  });
  outcomes.push(gateWithUnknown);
  check(
    "unknown field is a WARNING, not a gate failure",
    gateWithUnknown.ok &&
      gateWithUnknown.warnings.some((w) => w.includes("futureField")),
  );

  let threwMissing = false;
  try {
    const broken = JSON.parse(text) as Record<string, unknown>;
    delete broken.root;
    parseFreezeArtifact(JSON.stringify(broken));
  } catch {
    threwMissing = true;
  }
  check("missing required field throws (strict parse)", threwMissing);

  let threwJson = false;
  try {
    parseFreezeArtifact("not-json{");
  } catch (e) {
    threwJson = e instanceof Error && !FULL_ADDRESS_RE.test(e.message);
  }
  check("invalid JSON throws address-safe error", threwJson);
}

// --- replay comparison doctrine ---------------------------------------------------
{
  const outcome = runFixture();
  const plan = outcome.plan!;
  const existingFreeze: ExistingFreezeRow = {
    chainId: plan.freeze.chainId,
    freezeBlock: plan.freeze.freezeBlock,
    root: plan.freeze.root,
    memberCount: plan.freeze.memberCount,
    validationStatus: plan.freeze.validationStatus,
    provenanceRepo: plan.freeze.provenanceRepo,
    provenanceCommitSha: plan.freeze.provenanceCommitSha,
    provenancePath: plan.freeze.provenancePath,
    inputHashRecorded: plan.freeze.inputHashRecorded,
    leafFormat: plan.freeze.leafFormat,
    treeAlgorithm: plan.freeze.treeAlgorithm,
    sourceOrder: plan.freeze.sourceOrder,
  };
  const existingMembers: ExistingMemberRow[] = plan.members.map((m) => ({ ...m }));
  const same = compareExistingVsPlan(existingFreeze, existingMembers, plan);
  check("replay: exact match → no-op", same.match && same.divergences.length === 0);

  const tamperedMembers = existingMembers.map((m) =>
    m.memberNumber === 3 ? { ...m, wallet: syntheticWallet(99) } : m,
  );
  const diverged = compareExistingVsPlan(existingFreeze, tamperedMembers, plan);
  check(
    "replay: wallet divergence → HARD FAIL, address-safe detail",
    !diverged.match &&
      diverged.divergences.some((d) => d.includes("member #3") && d.includes("wallet")) &&
      !FULL_ADDRESS_RE.test(JSON.stringify(diverged.divergences)),
  );
  const fewer = compareExistingVsPlan(existingFreeze, existingMembers.slice(0, 7), plan);
  check(
    "replay: row-count divergence → HARD FAIL",
    !fewer.match && fewer.divergences.some((d) => d.includes("count differs")),
  );
  const rootDiff = compareExistingVsPlan(
    { ...existingFreeze, root: keccakOfAscii("different") },
    existingMembers,
    plan,
  );
  check(
    "replay: freeze root divergence → HARD FAIL",
    !rootDiff.match && rootDiff.divergences.some((d) => d.includes("root")),
  );
}

// --- privacy: NO gate output ever carries an address --------------------------------
{
  const serialized = JSON.stringify(
    outcomes.map((o) => ({ ok: o.ok, checks: o.checks, warnings: o.warnings })),
  );
  const stripped = serialized.replace(/0x[0-9a-fA-F]{64}/g, "<h64>");
  check(
    "no address in ANY gate checks/warnings across the whole matrix",
    !FULL_ADDRESS_RE.test(stripped),
  );
  check(
    "plan (PII) is the ONLY carrier of wallets — checks never include them",
    outcomes.every((o) =>
      o.checks.every((c) => !c.detail || !FULL_ADDRESS_RE.test(c.detail)),
    ),
  );
}

// --- report -----------------------------------------------------------------------
for (const r of results) {
  console.log(`${r.ok ? "[PASS]" : "[FAIL]"} ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
}
const passed = results.filter((r) => r.ok).length;
console.log(`partB-import guard: ${passed}/${results.length} passed`);
if (passed !== results.length) process.exit(1);
