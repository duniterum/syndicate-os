/**
 * Part B Import Gate — pure, fail-closed verification engine (SERVER-ONLY).
 * ---------------------------------------------------------------------------
 * Validates the canonical historical-member freeze artifact against the pinned
 * expectations, the LIVE on-chain authority root, and the raw Part A event
 * substrate — and only if EVERY check passes, produces the exact row plan the
 * import script may persist. Any failure → no plan (fail closed).
 *
 * Purity contract: no DB access, no network access, no env access. Live reads
 * and raw aggregates are injected by the caller (scripts/partB-import.ts).
 * Never imported by served route code.
 *
 * PRIVACY: every `GateCheck.detail` string is address-safe by construction —
 * members are referenced as "member #N", wallets/txs never appear. The plan
 * object DOES carry wallet PII (it must, to insert rows) and must never be
 * serialized into any log or report.
 */

import { z } from "zod";
import {
  ARTIFACT_SOURCE_TO_GENERATION,
  PART_B_EXPECTATIONS,
  type PartBExpectations,
} from "../../data/partBExpectations";
import {
  computeLeaf,
  computeRoot,
  isStrictChecksumAddress,
  verifyProof,
} from "./merkleFreeze";
import type { ChainProbe } from "./evmRead";

const HEX_64_RE = /^0x[0-9a-fA-F]{64}$/;

// ---------------------------------------------------------------------------
// Artifact parsing (strict: required fields exact, unknown fields surfaced)
// ---------------------------------------------------------------------------

const artifactMemberSchema = z.object({
  wallet: z.string(),
  memberNumber: z.number().int(),
  firstBlock: z.number().int(),
  logIndex: z.number().int(),
  firstTransaction: z.string(),
  source: z.string(),
  leaf: z.string(),
  proof: z.array(z.string()),
});

const artifactSchema = z.object({
  schema: z.string(),
  generatedAt: z.string(),
  exactCommandUsed: z.string(),
  inputPath: z.string(),
  outputPath: z.string(),
  inputHash: z.string(),
  freezeBlock: z.number().int(),
  chainId: z.number().int(),
  memberCount: z.number().int(),
  root: z.string(),
  previousDocumentedRoot: z.string(),
  rootMatchesPreviousDocumentedRoot: z.boolean(),
  leafFormat: z.string(),
  treeAlgorithm: z.string(),
  sourceOrder: z.string(),
  verification: z.record(z.string(), z.boolean()),
  members: z.array(artifactMemberSchema),
});

export type FreezeArtifact = z.infer<typeof artifactSchema>;
export type ArtifactMember = z.infer<typeof artifactMemberSchema>;

export type ParsedArtifact = {
  artifact: FreezeArtifact;
  /** Unknown fields are SURFACED (warnings), not silently dropped. */
  unknownTopLevelKeys: string[];
  unknownMemberKeys: string[];
};

/** BOM-tolerant, strict parse. Throws with an address-safe message on failure. */
export function parseFreezeArtifact(rawText: string): ParsedArtifact {
  const text = rawText.charCodeAt(0) === 0xfeff ? rawText.slice(1) : rawText;
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error("artifact parse: invalid JSON");
  }
  const parsed = artifactSchema.safeParse(json);
  if (!parsed.success) {
    const paths = parsed.error.issues
      .slice(0, 8)
      .map((i) => i.path.map(String).join(".") || "(root)")
      .join(", ");
    throw new Error(`artifact parse: schema violation at ${paths}`);
  }
  const knownTop = new Set(Object.keys(artifactSchema.shape));
  const unknownTopLevelKeys = Object.keys(json as Record<string, unknown>).filter(
    (k) => !knownTop.has(k),
  );
  const knownMember = new Set(Object.keys(artifactMemberSchema.shape));
  const unknownMemberKeys = [
    ...new Set(
      ((json as { members?: unknown[] }).members ?? []).flatMap((m) =>
        m && typeof m === "object"
          ? Object.keys(m as Record<string, unknown>).filter(
              (k) => !knownMember.has(k),
            )
          : [],
      ),
    ),
  ];
  return { artifact: parsed.data, unknownTopLevelKeys, unknownMemberKeys };
}

// ---------------------------------------------------------------------------
// Injected inputs
// ---------------------------------------------------------------------------

/** Live chain reads, performed by the caller BEFORE gating (probe first). */
export type PartBLiveReads = {
  probe: ChainProbe;
  /** Decoded bytes32 result of eth_call V1_MEMBER_ROOT() on the V3 engine, or null. */
  onChainRoot: string | null;
  /** Address-safe description if the live read failed. */
  liveReadError: string | null;
};

/** Aggregates over sale_event_raw (server-only in memory; sets never printed). */
export type RawSaleAggregates = {
  totalRawRows: number;
  v1EventCount: number;
  /** lower-cased distinct V1 TokensPurchased buyer wallets (server-only). */
  v1DistinctBuyersLower: readonly string[];
  v2aFirstSeatMemberNumbers: readonly number[];
  v2bFirstSeatTrueMemberNumbers: readonly number[];
  v2bSentinelZeroCount: number;
  v2bSentinelZeroAllFirstSeatFalse: boolean;
  v3FirstSeatMemberNumbers: readonly number[];
  /** `${lower(txHash)}#${logIndex}` for every raw row (server-only). */
  txLogPairsLower: ReadonlySet<string>;
};

export type GateCheck = { name: string; ok: boolean; detail?: string };

export type FreezeRowPlan = {
  chainId: number;
  freezeBlock: number;
  root: string;
  memberCount: number;
  validationStatus: "VERIFIED";
  verification: Record<string, unknown>;
  provenanceRepo: string;
  provenanceCommitSha: string;
  provenancePath: string;
  provenanceGeneratedAt: Date;
  inputHashRecorded: string | null;
  inputHashComputed: string | null;
  inputHashNote: string | null;
  leafFormat: string;
  treeAlgorithm: string;
  sourceOrder: string;
};

export type MemberRowPlan = {
  chainId: number;
  freezeBlock: number;
  memberNumber: number;
  wallet: string;
  source: "V1" | "V2A" | "V2B";
  firstBlock: number;
  logIndex: number;
  firstTransaction: string;
  leaf: string;
  proof: string[];
};

export type GateOutcome = {
  ok: boolean;
  checks: GateCheck[];
  warnings: string[];
  plan: { freeze: FreezeRowPlan; members: MemberRowPlan[] } | null;
};

// ---------------------------------------------------------------------------
// The gate
// ---------------------------------------------------------------------------

export function runPartBGate(input: {
  parsed: ParsedArtifact;
  live: PartBLiveReads;
  raw: RawSaleAggregates;
  /** sha256 of the fetched INPUT snapshot bytes (caveat context), if fetched. */
  inputSnapshotSha256: string | null;
  expectations?: PartBExpectations;
}): GateOutcome {
  const exp = input.expectations ?? PART_B_EXPECTATIONS;
  const { artifact, unknownTopLevelKeys, unknownMemberKeys } = input.parsed;
  const checks: GateCheck[] = [];
  const warnings: string[] = [];
  const add = (name: string, ok: boolean, detail?: string) => {
    checks.push(detail === undefined ? { name, ok } : { name, ok, detail });
  };

  // --- identity pins -------------------------------------------------------
  add("artifact schema id", artifact.schema === exp.artifact.schema);
  add(
    "chainId pinned",
    artifact.chainId === exp.chainId,
    `artifact=${artifact.chainId} expected=${exp.chainId}`,
  );
  add(
    "freezeBlock pinned",
    artifact.freezeBlock === exp.freezeBlock,
    `artifact=${artifact.freezeBlock} expected=${exp.freezeBlock}`,
  );
  add(
    "memberCount pinned",
    artifact.memberCount === exp.memberCount,
    `artifact=${artifact.memberCount} expected=${exp.memberCount}`,
  );
  add(
    "members.length == memberCount",
    artifact.members.length === exp.memberCount,
    `members=${artifact.members.length}`,
  );

  // --- member set invariants ----------------------------------------------
  const numbers = artifact.members.map((m) => m.memberNumber);
  const numberSet = new Set(numbers);
  add("no sentinel memberNumber 0", !numberSet.has(0));
  add("no duplicate memberNumber", numberSet.size === numbers.length);
  const expectedSeq = Array.from({ length: exp.memberCount }, (_, i) => i + 1);
  add(
    "memberNumber set exactly 1..8",
    expectedSeq.every((n) => numberSet.has(n)) &&
      numberSet.size === exp.memberCount,
  );

  const walletsLower = artifact.members.map((m) => m.wallet.toLowerCase());
  add(
    "8 distinct case-normalized wallets",
    new Set(walletsLower).size === exp.memberCount,
  );
  const badChecksum = artifact.members.filter(
    (m) => !isStrictChecksumAddress(m.wallet),
  );
  add(
    "strict EIP-55 checksum policy",
    badChecksum.length === 0,
    badChecksum.length > 0
      ? `violations at member #${badChecksum.map((m) => m.memberNumber).join(", #")}`
      : undefined,
  );

  // --- source mapping + distribution ---------------------------------------
  const unknownSources = artifact.members.filter(
    (m) => !(m.source in ARTIFACT_SOURCE_TO_GENERATION),
  );
  add(
    "all sources map to sale_generation",
    unknownSources.length === 0,
    unknownSources.length > 0
      ? `unmapped source at member #${unknownSources.map((m) => m.memberNumber).join(", #")}`
      : undefined,
  );
  const dist: Record<string, number> = { V1: 0, V2A: 0, V2B: 0 };
  for (const m of artifact.members) {
    const gen =
      ARTIFACT_SOURCE_TO_GENERATION[
        m.source as keyof typeof ARTIFACT_SOURCE_TO_GENERATION
      ];
    if (gen) dist[gen] = (dist[gen] ?? 0) + 1;
  }
  add(
    "distribution V1x2 / V2Ax3 / V2Bx3",
    dist.V1 === exp.distribution.V1 &&
      dist.V2A === exp.distribution.V2A &&
      dist.V2B === exp.distribution.V2B,
    `V1=${dist.V1} V2A=${dist.V2A} V2B=${dist.V2B}`,
  );

  // --- first-seen ordering doctrine ----------------------------------------
  const sorted = [...artifact.members].sort(
    (a, b) =>
      a.firstBlock - b.firstBlock ||
      a.logIndex - b.logIndex ||
      (a.firstTransaction.toLowerCase() < b.firstTransaction.toLowerCase()
        ? -1
        : a.firstTransaction.toLowerCase() > b.firstTransaction.toLowerCase()
          ? 1
          : 0),
  );
  add(
    "memberNumber follows first-seen chain order",
    sorted.every((m, i) => m.memberNumber === i + 1),
  );
  add(
    "all member firstBlock pre-freeze",
    artifact.members.every((m) => m.firstBlock <= exp.freezeBlock),
  );

  // --- cryptographic recompute ---------------------------------------------
  const leafMismatch = artifact.members.filter(
    (m) =>
      !HEX_64_RE.test(m.leaf) ||
      computeLeaf(m.wallet, m.memberNumber) !== m.leaf.toLowerCase(),
  );
  add(
    "leaf recompute matches for every member",
    leafMismatch.length === 0,
    leafMismatch.length > 0
      ? `mismatch at member #${leafMismatch.map((m) => m.memberNumber).join(", #")}`
      : undefined,
  );

  const orderedLeaves = [...artifact.members]
    .sort((a, b) => a.memberNumber - b.memberNumber)
    .map((m) => m.leaf.toLowerCase());
  let recomputedRoot: string | null = null;
  try {
    recomputedRoot = computeRoot(orderedLeaves);
  } catch {
    recomputedRoot = null;
  }
  add(
    "Merkle root recompute matches artifact root",
    recomputedRoot !== null &&
      recomputedRoot === artifact.root.toLowerCase(),
  );
  add(
    "artifact root equals pinned expected root",
    artifact.root.toLowerCase() === exp.expectedRoot.toLowerCase(),
    `artifact=${shortRoot(artifact.root)} expected=${shortRoot(exp.expectedRoot)}`,
  );
  const proofFailures = artifact.members.filter(
    (m) => !verifyProof(m.leaf, m.proof, artifact.root),
  );
  add(
    "Merkle proofs verify for all 8",
    proofFailures.length === 0,
    proofFailures.length > 0
      ? `proof failure at member #${proofFailures.map((m) => m.memberNumber).join(", #")}`
      : undefined,
  );

  // --- LIVE authority (RPC failure = fail closed; no pinned-root fallback) --
  add(
    "live eth_chainId == 43114",
    input.live.probe.rpcReachable && input.live.probe.chainIdOk,
    input.live.probe.rpcReachable
      ? `actual=${input.live.probe.chainIdActual ?? "null"}`
      : "rpc unreachable — fail closed",
  );
  add(
    "live V1_MEMBER_ROOT() equals expected root",
    input.live.onChainRoot !== null &&
      input.live.onChainRoot.toLowerCase() === exp.expectedRoot.toLowerCase(),
    input.live.onChainRoot === null
      ? `live read unavailable (${input.live.liveReadError ?? "unknown"}) — fail closed`
      : `onChain=${shortRoot(input.live.onChainRoot)}`,
  );

  // --- raw Part A reconciliation --------------------------------------------
  const raw = input.raw;
  add(
    "raw V1: 5 purchase events",
    raw.v1EventCount === 5,
    `count=${raw.v1EventCount}`,
  );
  add(
    "raw V1: exactly 2 distinct buyers",
    raw.v1DistinctBuyersLower.length === 2,
    `distinct=${raw.v1DistinctBuyersLower.length}`,
  );
  const v1Members = artifact.members.filter((m) => m.source === "V1");
  const v1BuyerSet = new Set(raw.v1DistinctBuyersLower);
  const v1NotInRaw = v1Members.filter(
    (m) => !v1BuyerSet.has(m.wallet.toLowerCase()),
  );
  add(
    "raw V1: every V1 member wallet is a raw V1 buyer",
    v1Members.length === 2 && v1NotInRaw.length === 0,
    v1NotInRaw.length > 0
      ? `no raw V1 buyer match for member #${v1NotInRaw.map((m) => m.memberNumber).join(", #")}`
      : undefined,
  );
  const v2aSet = new Set(raw.v2aFirstSeatMemberNumbers);
  add(
    "raw V2A: firstSeat=true set == {3,4,5}",
    v2aSet.size === 3 && [3, 4, 5].every((n) => v2aSet.has(n)),
    `set={${[...v2aSet].sort((a, b) => a - b).join(",")}}`,
  );
  const v2bSet = new Set(raw.v2bFirstSeatTrueMemberNumbers);
  add(
    "raw V2B: firstSeat=true set == {6,7,8}",
    v2bSet.size === 3 && [6, 7, 8].every((n) => v2bSet.has(n)),
    `set={${[...v2bSet].sort((a, b) => a - b).join(",")}}`,
  );
  add(
    "raw V2B: sentinel memberNumber=0 rows are all firstSeat=false",
    raw.v2bSentinelZeroAllFirstSeatFalse,
    `sentinelRows=${raw.v2bSentinelZeroCount}`,
  );
  add(
    "raw V3: post-freeze only, numbers > 8 ({9,10} corroboration)",
    raw.v3FirstSeatMemberNumbers.length === 2 &&
      raw.v3FirstSeatMemberNumbers.every((n) => n > exp.memberCount) &&
      new Set(raw.v3FirstSeatMemberNumbers).size === 2,
    `set={${[...raw.v3FirstSeatMemberNumbers].sort((a, b) => a - b).join(",")}}`,
  );
  const txMissing = artifact.members.filter(
    (m) =>
      !raw.txLogPairsLower.has(
        `${m.firstTransaction.toLowerCase()}#${m.logIndex}`,
      ),
  );
  add(
    "every member firstTransaction+logIndex exists in raw index",
    txMissing.length === 0,
    txMissing.length > 0
      ? `missing raw row for member #${txMissing.map((m) => m.memberNumber).join(", #")}`
      : undefined,
  );

  // --- surfaced caveats (never gates) ---------------------------------------
  if (unknownTopLevelKeys.length > 0) {
    warnings.push(
      `artifact carries unknown top-level fields: ${unknownTopLevelKeys.join(", ")}`,
    );
  }
  if (unknownMemberKeys.length > 0) {
    warnings.push(
      `artifact members carry unknown fields: ${unknownMemberKeys.join(", ")}`,
    );
  }
  const recordedHash = artifact.inputHash.replace(/^sha256:/, "").toLowerCase();
  if (
    input.inputSnapshotSha256 !== null &&
    input.inputSnapshotSha256.toLowerCase() !== recordedHash
  ) {
    warnings.push(
      "inputHash byte-drift present (known BOM/reformat caveat) — recorded as provenance caveat, not a gate",
    );
  }

  const ok = checks.every((c) => c.ok);
  if (!ok) return { ok, checks, warnings, plan: null };

  // --- plan (only exists when EVERYTHING passed) -----------------------------
  const freeze: FreezeRowPlan = {
    chainId: exp.chainId,
    freezeBlock: exp.freezeBlock,
    root: artifact.root.toLowerCase(),
    memberCount: exp.memberCount,
    validationStatus: "VERIFIED",
    verification: {
      authorityEngineKey: exp.authorityEngineKey,
      method: exp.method,
      selector: exp.selector,
      rootTripleMatch: true,
      onChainRootMatched: true,
      recomputedRootMatched: true,
      allProofsVerified: true,
      allLeavesRecomputed: true,
      strictChecksumPolicy: true,
      firstSeenOrderingVerified: true,
      rawReconciliation: {
        v1EventCount: raw.v1EventCount,
        v1DistinctBuyers: raw.v1DistinctBuyersLower.length,
        v2aFirstSeatCount: raw.v2aFirstSeatMemberNumbers.length,
        v2bFirstSeatCount: raw.v2bFirstSeatTrueMemberNumbers.length,
        v2bSentinelZeroExcluded: raw.v2bSentinelZeroCount,
        v3PostFreezeCorroboration: raw.v3FirstSeatMemberNumbers.length,
        totalRawRows: raw.totalRawRows,
      },
      distribution: dist,
      checksPassed: checks.length,
      artifactVerificationSelfTest: artifact.verification,
    },
    provenanceRepo: exp.artifact.repo,
    provenanceCommitSha: exp.artifact.commitSha,
    provenancePath: exp.artifact.outputPath,
    provenanceGeneratedAt: new Date(artifact.generatedAt),
    inputHashRecorded: artifact.inputHash,
    inputHashComputed: input.inputSnapshotSha256
      ? `sha256:${input.inputSnapshotSha256.toLowerCase()}`
      : null,
    inputHashNote: exp.inputHashNote,
    leafFormat: artifact.leafFormat,
    treeAlgorithm: artifact.treeAlgorithm,
    sourceOrder: artifact.sourceOrder,
  };
  const members: MemberRowPlan[] = [...artifact.members]
    .sort((a, b) => a.memberNumber - b.memberNumber)
    .map((m) => ({
      chainId: exp.chainId,
      freezeBlock: exp.freezeBlock,
      memberNumber: m.memberNumber,
      wallet: m.wallet,
      source:
        ARTIFACT_SOURCE_TO_GENERATION[
          m.source as keyof typeof ARTIFACT_SOURCE_TO_GENERATION
        ],
      firstBlock: m.firstBlock,
      logIndex: m.logIndex,
      firstTransaction: m.firstTransaction,
      leaf: m.leaf.toLowerCase(),
      proof: m.proof.map((p) => p.toLowerCase()),
    }));

  return { ok, checks, warnings, plan: { freeze, members } };
}

// ---------------------------------------------------------------------------
// Replay comparison (idempotency doctrine: exact match = no-op, else HARD FAIL)
// ---------------------------------------------------------------------------

export type ExistingFreezeRow = {
  chainId: number;
  freezeBlock: number;
  root: string;
  memberCount: number;
  validationStatus: string;
  provenanceRepo: string;
  provenanceCommitSha: string;
  provenancePath: string;
  inputHashRecorded: string | null;
  leafFormat: string;
  treeAlgorithm: string;
  sourceOrder: string;
};

export type ExistingMemberRow = {
  chainId: number;
  freezeBlock: number;
  memberNumber: number;
  wallet: string;
  source: string;
  firstBlock: number;
  logIndex: number;
  firstTransaction: string;
  leaf: string;
  proof: unknown;
};

export type ReplayComparison = {
  match: boolean;
  /** Address-safe divergence descriptions ("member #3: wallet differs"). */
  divergences: string[];
};

/**
 * Field-by-field comparison of existing rows vs the incoming plan. Timestamps
 * and the verification jsonb (which carries run metadata) are NOT compared —
 * identity/authority fields are. NEVER silently overwrites: any divergence is
 * a hard failure surfaced to the founder.
 */
export function compareExistingVsPlan(
  existingFreeze: ExistingFreezeRow,
  existingMembers: readonly ExistingMemberRow[],
  plan: { freeze: FreezeRowPlan; members: MemberRowPlan[] },
): ReplayComparison {
  const div: string[] = [];
  const f = existingFreeze;
  const p = plan.freeze;
  const cmp = (field: string, a: unknown, b: unknown) => {
    if (a !== b) div.push(`freeze row: ${field} differs`);
  };
  cmp("chainId", f.chainId, p.chainId);
  cmp("freezeBlock", f.freezeBlock, p.freezeBlock);
  cmp("root", f.root.toLowerCase(), p.root.toLowerCase());
  cmp("memberCount", f.memberCount, p.memberCount);
  cmp("validationStatus", f.validationStatus, p.validationStatus);
  cmp("provenanceRepo", f.provenanceRepo, p.provenanceRepo);
  cmp("provenanceCommitSha", f.provenanceCommitSha, p.provenanceCommitSha);
  cmp("provenancePath", f.provenancePath, p.provenancePath);
  cmp("inputHashRecorded", f.inputHashRecorded, p.inputHashRecorded);
  cmp("leafFormat", f.leafFormat, p.leafFormat);
  cmp("treeAlgorithm", f.treeAlgorithm, p.treeAlgorithm);
  cmp("sourceOrder", f.sourceOrder, p.sourceOrder);

  if (existingMembers.length !== plan.members.length) {
    div.push(
      `member rows: count differs (existing=${existingMembers.length} incoming=${plan.members.length})`,
    );
  } else {
    const byNumber = new Map(existingMembers.map((m) => [m.memberNumber, m]));
    for (const pm of plan.members) {
      const em = byNumber.get(pm.memberNumber);
      if (!em) {
        div.push(`member #${pm.memberNumber}: missing in existing rows`);
        continue;
      }
      const mcmp = (field: string, a: unknown, b: unknown) => {
        if (a !== b) div.push(`member #${pm.memberNumber}: ${field} differs`);
      };
      mcmp("chainId", em.chainId, pm.chainId);
      mcmp("freezeBlock", em.freezeBlock, pm.freezeBlock);
      mcmp("wallet", em.wallet, pm.wallet);
      mcmp("source", em.source, pm.source);
      mcmp("firstBlock", em.firstBlock, pm.firstBlock);
      mcmp("logIndex", em.logIndex, pm.logIndex);
      mcmp("firstTransaction", em.firstTransaction.toLowerCase(), pm.firstTransaction.toLowerCase());
      mcmp("leaf", em.leaf.toLowerCase(), pm.leaf.toLowerCase());
      mcmp(
        "proof",
        JSON.stringify(em.proof).toLowerCase(),
        JSON.stringify(pm.proof).toLowerCase(),
      );
    }
  }
  return { match: div.length === 0, divergences: div };
}

function shortRoot(root: string): string {
  if (root.length < 14) return "malformed";
  return `${root.slice(0, 10)}…${root.slice(-6)}`;
}
