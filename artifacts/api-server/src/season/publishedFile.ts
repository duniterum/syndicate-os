/**
 * publishedFile — the round's PUBLIC verification artifact (spec §7/§10).
 * ---------------------------------------------------------------------------
 * FULL-ADDRESS rows (founder ruling 2026-07-24: "on montre — sur la blockchain
 * tout est visible"; every claim emits the address on Snowtrace anyway). With
 * this file ANYONE rebuilds the Merkle tree and matches the on-chain root —
 * Merkl-grade permissionless verification during the pending window: a phantom
 * leaf or a wrong share is publicly detectable, not merely owner-vetoable.
 *
 * TWO-ARTIFACT HASH MODEL: this file's own keccak rides `PendingRound.uri`;
 * the season RULE SHEET's hash is the separate `rulesHash` (rulesHash.ts).
 */

import { keccak256, toBytes } from "viem";
import type { PaidSlot } from "./potPolicy.js";
import { canonicalSerialize } from "./rulesHash.js";

export const PUBLISHED_FILE_FORMAT = "syndicate-season-round@1";

export interface PublishedRoundFile {
  readonly format: typeof PUBLISHED_FILE_FORMAT;
  readonly chainId: string;
  readonly pool: `0x${string}`;
  readonly seasonId: number;
  readonly roundId: number;
  readonly budgetRaw: string;
  readonly root: `0x${string}`;
  /** rank · FULL address · window XP · exact USDC base units. */
  readonly rows: readonly {
    readonly rank: number;
    readonly address: `0x${string}`;
    readonly seat: number;
    readonly windowXp: number;
    readonly amountRaw: string;
  }[];
}

export function buildPublishedFile(args: {
  chainId: bigint;
  pool: `0x${string}`;
  seasonId: number;
  roundId: number;
  budgetRaw: bigint;
  root: `0x${string}`;
  paidSlots: readonly PaidSlot[];
}): { file: PublishedRoundFile; canonicalJson: string; fileKeccak: `0x${string}` } {
  const file: PublishedRoundFile = {
    format: PUBLISHED_FILE_FORMAT,
    chainId: args.chainId.toString(),
    pool: args.pool,
    seasonId: args.seasonId,
    roundId: args.roundId,
    budgetRaw: args.budgetRaw.toString(),
    root: args.root,
    rows: args.paidSlots.map((s) => ({
      rank: s.rank,
      address: s.account,
      seat: s.seat,
      windowXp: s.windowXp,
      amountRaw: s.amountRaw.toString(),
    })),
  };
  const canonicalJson = canonicalSerialize(file);
  return { file, canonicalJson, fileKeccak: keccak256(toBytes(canonicalJson)) };
}
