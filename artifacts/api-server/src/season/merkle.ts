/**
 * season-merkle v2 — the ONLY tree builder (S3-3 · spec §1/§10 · the frozen leaf).
 * ---------------------------------------------------------------------------
 * OZ StandardMerkleTree over the byte-exact spec-§1 tuple:
 *     (uint8 kind, uint256 chainId, address pool, uint256 roundId,
 *      address account, uint256 amount)
 * kind=1 PAYOUT (amount = USDC 6-dec base units) · kind=2 SEAL (roundId =
 * seasonId, amount = the wallet's season XP). The kind byte INSIDE the
 * pre-image makes a seal root STRUCTURALLY unclaimable as a payout root; the
 * contract hardcodes kind=1 in every claim reconstruction.
 *
 * REFUSALS (the builder is the first fence; the on-chain per-round fence is the
 * trustless backstop): Σ amounts ≠ budget (over AND under — the round-3 catch),
 * a duplicate account, a zero amount, an amount past uint128. The ⛔ SUPERSEDED
 * origin format (single-hash abi.encodePacked, season-merkle.reference.ts)
 * appears nowhere — the Foundry MerkleForgery suite proves it REJECTED.
 */

import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

export const KIND_PAYOUT = 1;
export const KIND_SEAL = 2;
export const UINT128_MAX = (1n << 128n) - 1n;

/** The frozen leaf ABI — the exact type list the differential fixture pins. */
export const LEAF_TYPES = [
  "uint8",
  "uint256",
  "address",
  "uint256",
  "address",
  "uint256",
] as const;

export interface PayoutLeafInput {
  readonly account: `0x${string}`;
  readonly amountRaw: bigint;
}

export interface SealRowInput {
  readonly account: `0x${string}`;
  readonly seasonXp: number;
}

export interface BuiltTree {
  readonly root: `0x${string}`;
  /** account → its merkle proof (claim-ready). */
  readonly proofs: ReadonlyMap<`0x${string}`, readonly `0x${string}`[]>;
  /** The OZ tree dump — re-loadable, committed into season-files/. */
  readonly dump: unknown;
}

function buildTree(
  kind: number,
  chainId: bigint,
  pool: `0x${string}`,
  scopeId: bigint,
  rows: readonly { account: `0x${string}`; value: bigint }[],
): BuiltTree {
  const seen = new Set<string>();
  for (const r of rows) {
    const key = r.account.toLowerCase();
    if (seen.has(key)) throw new Error(`duplicate account in tree: ${r.account}`);
    seen.add(key);
    if (r.value <= 0n) throw new Error(`zero/negative value for ${r.account}`);
    if (r.value > UINT128_MAX) throw new Error(`value past uint128 for ${r.account}`);
  }
  const values = rows.map((r) => [kind, chainId, pool, scopeId, r.account, r.value]);
  const tree = StandardMerkleTree.of(values as unknown as (string | number | bigint)[][], [
    ...LEAF_TYPES,
  ]);
  const proofs = new Map<`0x${string}`, readonly `0x${string}`[]>();
  for (const [i, v] of tree.entries()) {
    proofs.set(String(v[4]) as `0x${string}`, tree.getProof(i) as `0x${string}`[]);
  }
  return { root: tree.root as `0x${string}`, proofs, dump: tree.dump() };
}

/** Build a PAYOUT round tree. Refuses unless Σ amounts === budget EXACTLY. */
export function buildPayoutRoot(args: {
  chainId: bigint;
  pool: `0x${string}`;
  roundId: number;
  budgetRaw: bigint;
  leaves: readonly PayoutLeafInput[];
}): BuiltTree {
  const sum = args.leaves.reduce((a, l) => a + l.amountRaw, 0n);
  if (sum > args.budgetRaw) {
    throw new Error(
      `REFUSED: Σ leaves (${sum}) EXCEEDS the round budget (${args.budgetRaw}) — an inflated root never leaves this builder`,
    );
  }
  if (sum < args.budgetRaw) {
    throw new Error(
      `REFUSED: Σ leaves (${sum}) UNDER the round budget (${args.budgetRaw}) — an under-sum root strands member money (round-3 catch)`,
    );
  }
  return buildTree(
    KIND_PAYOUT,
    args.chainId,
    args.pool,
    BigInt(args.roundId),
    args.leaves.map((l) => ({ account: l.account, value: l.amountRaw })),
  );
}

/** Build a SEAL (XP fingerprint) tree — every XP>0 wallet; moves no money. */
export function buildSealRoot(args: {
  chainId: bigint;
  pool: `0x${string}`;
  seasonId: number;
  rows: readonly SealRowInput[];
}): BuiltTree {
  return buildTree(
    KIND_SEAL,
    args.chainId,
    args.pool,
    BigInt(args.seasonId),
    args.rows
      .filter((r) => r.seasonXp > 0)
      .map((r) => ({ account: r.account, value: BigInt(r.seasonXp) })),
  );
}

/** Recompute + verify a proof against a root (the anyone-can-verify path). */
export function verifyPayoutProof(args: {
  root: `0x${string}`;
  chainId: bigint;
  pool: `0x${string}`;
  roundId: number;
  account: `0x${string}`;
  amountRaw: bigint;
  proof: readonly `0x${string}`[];
}): boolean {
  return StandardMerkleTree.verify(
    args.root,
    [...LEAF_TYPES],
    [KIND_PAYOUT, args.chainId, args.pool, BigInt(args.roundId), args.account, args.amountRaw],
    [...args.proof],
  );
}
