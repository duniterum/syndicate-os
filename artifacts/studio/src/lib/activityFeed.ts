// lib/activityFeed.ts — the RECENT-WINDOW client feed spine (ARC ACT-1).
// ---------------------------------------------------------------------------
// Origin harvest (activity-hooks/onchain-events/event-caches — ADAPTED, and
// CRITICALLY RETARGETED: the origin scanned OLD contracts; every signature
// below is transcribed VERBATIM from TODAY's repo and SELF-CHECKED at module
// load (viem toEventSelector(signature) must equal the pinned topic0 — a
// drifted pin throws before it can lie).
//
// THE HONESTY LAW (2026-07-12 standing rule, applied): a client-RPC scan is
// a RECENT WINDOW — it claims presence of what it found and NOTHING about
// absence. Every consumer renders the covered window and the banner says the
// complete indexed history arrives with the event indexer. The Visibility
// Law sanctions this: the client reads the public chain like an explorer.
//
// Addresses are NEVER hardcoded here — callers resolve them from the
// server's verify-links and pass them in.

import { decodeEventLog, toEventSelector, parseAbi } from "viem";
import { publicClient } from "./chainReads";

// ── Event pins (verbatim from the repo; self-checked below) ─────────────────
// MembershipPurchasedV3 — signature + topic0 + param order transcribed from
// artifacts/api-server/src/lib/protocol/saleEventDecoders.ts (the pinned
// canon shape; 3 indexed + 21 data params, memberNumber first data slot).
const V3_SIGNATURE =
  "MembershipPurchasedV3(bytes32,address,address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint64,uint16,uint16,bytes32,uint8,address,uint16,uint8,uint256,uint256,uint256,bool,uint8)";
const V3_TOPIC0 =
  "0x4ae1104be21836909353b0af3cd82a339d2ac380eda00ad26313d8fce198c1bf";

const FEED_ABI = parseAbi([
  "event MembershipPurchasedV3(bytes32 indexed receiptId, address indexed buyer, address indexed recipient, uint256 memberNumber, uint256 grossUsdc, uint256 acquisitionCost, uint256 protocolContribution, uint256 vaultAmount, uint256 liquidityAmount, uint256 operationsAmount, uint256 synOut, uint64 synPerUsdc, uint16 era, uint16 chapter, bytes32 sourceId, uint8 sourceClass, address sourceWallet, uint16 commissionBps, uint8 attributionScope, uint256 attributionWindowEndsAt, uint256 sourceGrossRemaining, uint256 buyerGrossRemaining, bool firstSeat, uint8 receiptVersion)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  // SourceRegistryV1.sol events (lines 111–139), transcribed verbatim.
  "event SourceCreated(bytes32 indexed sourceId, address indexed sourceWallet, uint8 indexed sourceClass, uint16 commissionBps, uint8 status, uint8 scope, address payoutWallet, bytes32 metadataHash)",
  "event SourceTermsUpdated(bytes32 indexed sourceId, address indexed sourceWallet, uint8 indexed sourceClass, uint16 commissionBps, uint8 scope, uint64 startTime, uint64 endTime, uint256 grossCap, uint256 perBuyerCap, bool appliesToRepeatPurchases, address payoutWallet, bytes32 metadataHash)",
  "event SourceStatusChanged(bytes32 indexed sourceId, uint8 previousStatus, uint8 newStatus)",
]);

const TOPICS = {
  seat: toEventSelector(V3_SIGNATURE),
  transfer: toEventSelector("Transfer(address,address,uint256)"),
  sourceCreated: toEventSelector(
    "SourceCreated(bytes32,address,uint8,uint16,uint8,uint8,address,bytes32)",
  ),
  sourceTerms: toEventSelector(
    "SourceTermsUpdated(bytes32,address,uint8,uint16,uint8,uint64,uint64,uint256,uint256,bool,address,bytes32)",
  ),
  sourceStatus: toEventSelector("SourceStatusChanged(bytes32,uint8,uint8)"),
} as const;

// SELF-CHECK: the transcribed V3 signature must reproduce the repo's pinned
// topic0 — a drifted transcription throws at load, never scans wrong events.
if (TOPICS.seat !== V3_TOPIC0) {
  throw new Error("activityFeed: MembershipPurchasedV3 signature drifted from the pinned topic0");
}

// ── The feed model ───────────────────────────────────────────────────────────
export type ActivityKind =
  | "seat"
  | "burn"
  | "source-created"
  | "source-terms"
  | "source-status"
  // H1a — THE COMPLETE HEARTBEAT ARC: these kinds arrive via the SERVED feed
  // only (the client recent-window scanner deliberately stays seat/burn/
  // registry-lifecycle; the backbone is the complete source).
  | "source-wallet"
  | "lp-add"
  | "lp-remove"
  | "archive-mint"
  | "archive-pause"
  // H2-⑦ — treasury movements: served-feed only (post-Fold-Law).
  | "treasury-move"
  // H2-⑬ — milestone crossings: derived server-side from the gapless
  // indexed history; the client window scanner never produces this kind.
  | "milestone"
  // H2-⑫ — era transitions: derived witness lines (served feed only).
  | "era-transition"
  // H2-⑭ — Chronicle promotions: register-derived (client-side, CHR-1 —
  // a promotion is a founder COMMIT, not a chain event; no tx anchor exists
  // and none is invented; the line links into the record itself).
  | "chronicle-entry"
  // H2-⑰ — capital-axis rises: derived witness lines (served feed only).
  | "capital-rise";

export interface ActivityItem {
  kind: ActivityKind;
  /** The receipt-backed sentence (H2-P: the chain's own voice, short form). */
  sentence: string;
  /** 0 on register-derived lines (no chain anchor exists — see readHref). */
  blockNumber: number;
  txHash: `0x${string}`;
  /** Position within the tx — the line's identity (one tx can carry two events). */
  logIndex: number;
  /** UTC day from the block header — chain time, never a wall clock. */
  dateUtc: string;
  /** Memory grade (the receipt-thread doctrine): anchored events persist. */
  memory: boolean;
  /**
   * H2-⑭: register-derived lines carry an INTERNAL read link instead of an
   * explorer verify anchor ("read the record →" into /chronicle#id).
   */
  readHref?: string;
}

export interface ActivityScan {
  items: ActivityItem[];
  /** The window ACTUALLY covered (honesty: this is what was read, no more). */
  fromBlock: number;
  toBlock: number;
  /** Chunks that failed (coverage shrinks honestly; never silently). */
  chunksFailed: number;
}

const CHUNK = 2000;
/** ~24h of Avalanche blocks (≈2s) — the default recent window. */
export const DEFAULT_WINDOW_BLOCKS = 43_200;

function fmtSyn(raw: bigint): string {
  const whole = raw / 10n ** 18n;
  return whole.toLocaleString("en-US");
}

export interface FeedAddresses {
  sale: string;
  synToken: string;
  burnAddress: string;
  sourceRegistry: string;
}

/**
 * Scan the recent window for protocol events. Fail-soft per chunk (a failed
 * chunk shrinks REPORTED coverage — the caller renders the truth), fail-closed
 * per item (an undecodable log is skipped, never guessed).
 */
export async function scanRecentActivity(
  addrs: FeedAddresses,
  windowBlocks: number = DEFAULT_WINDOW_BLOCKS,
): Promise<ActivityScan> {
  const head = Number(await publicClient.getBlockNumber());
  const from = Math.max(0, head - windowBlocks);
  const items: ActivityItem[] = [];
  let chunksFailed = 0;

  const addresses = [addrs.sale, addrs.synToken, addrs.sourceRegistry] as `0x${string}`[];
  const burn = addrs.burnAddress.toLowerCase();

  for (let start = from; start <= head; start += CHUNK) {
    const end = Math.min(start + CHUNK - 1, head);
    try {
      const logs = await publicClient.getLogs({
        address: addresses,
        fromBlock: BigInt(start),
        toBlock: BigInt(end),
      });
      for (const log of logs) {
        const t0 = log.topics[0];
        if (!t0 || log.blockNumber === null || log.transactionHash === null) continue;
        try {
          if (t0 === TOPICS.seat && log.address.toLowerCase() === addrs.sale.toLowerCase()) {
            const d = decodeEventLog({ abi: FEED_ABI, eventName: "MembershipPurchasedV3", data: log.data, topics: log.topics });
            // H2-P — the pride amendment: the window speaks the SAME origin
            // voice as the served feed (one §8 lexicon, one register). The
            // recipient is the seat's holder; short form only.
            const holder = (d.args.recipient ?? d.args.buyer) as string | undefined;
            const holderShort =
              typeof holder === "string" && /^0x[0-9a-fA-F]{40}$/.test(holder)
                ? `0x${holder.slice(2, 5).toLowerCase()}…${holder.slice(-4).toLowerCase()}`
                : null;
            items.push({
              kind: "seat",
              sentence: d.args.firstSeat
                ? `Member #${d.args.memberNumber} ${holderShort ? `· ${holderShort} ` : ""}entered the public registry.`
                : `Member #${d.args.memberNumber} ${holderShort ? `· ${holderShort} ` : ""}expanded their footprint — recorded on-chain.`,
              blockNumber: Number(log.blockNumber),
              txHash: log.transactionHash,
              logIndex: log.logIndex ?? 0,
              dateUtc: "",
              memory: true,
            });
          } else if (t0 === TOPICS.transfer && log.address.toLowerCase() === addrs.synToken.toLowerCase()) {
            const d = decodeEventLog({ abi: FEED_ABI, eventName: "Transfer", data: log.data, topics: log.topics });
            if (d.args.to.toLowerCase() !== burn) continue; // only burns speak here
            items.push({
              kind: "burn",
              sentence: `${fmtSyn(d.args.value)} SYN was retired to the burn address — gone for everyone, forever.`,
              blockNumber: Number(log.blockNumber),
              txHash: log.transactionHash,
              logIndex: log.logIndex ?? 0,
              dateUtc: "",
              memory: true,
            });
          } else if (log.address.toLowerCase() === addrs.sourceRegistry.toLowerCase()) {
            if (t0 === TOPICS.sourceCreated) {
              items.push({
                kind: "source-created",
                sentence: "A referral source was created — a founder-signed on-chain act.",
                blockNumber: Number(log.blockNumber),
                txHash: log.transactionHash,
                logIndex: log.logIndex ?? 0,
                dateUtc: "",
                memory: true,
              });
            } else if (t0 === TOPICS.sourceTerms) {
              items.push({
                kind: "source-terms",
                sentence: "A source's terms were updated — a public event; there are no silent edits.",
                blockNumber: Number(log.blockNumber),
                txHash: log.transactionHash,
                logIndex: log.logIndex ?? 0,
                dateUtc: "",
                memory: true,
              });
            } else if (t0 === TOPICS.sourceStatus) {
              items.push({
                kind: "source-status",
                sentence: "A source's status changed — a public event; there are no silent edits.",
                blockNumber: Number(log.blockNumber),
                txHash: log.transactionHash,
                logIndex: log.logIndex ?? 0,
                dateUtc: "",
                memory: true,
              });
            }
          }
        } catch {
          // An undecodable log is skipped — never guessed into a sentence.
        }
      }
    } catch {
      chunksFailed += 1; // coverage shrinks honestly; the banner reports it
    }
  }

  // Chain-time stamps: one header read per UNIQUE event block (events are
  // sparse; a missing header leaves the date empty — never invented).
  const uniqueBlocks = [...new Set(items.map((i) => i.blockNumber))];
  const dates = new Map<number, string>();
  await Promise.all(
    uniqueBlocks.map(async (bn) => {
      try {
        const b = await publicClient.getBlock({ blockNumber: BigInt(bn) });
        dates.set(bn, new Date(Number(b.timestamp) * 1000).toISOString().slice(0, 10));
      } catch {
        /* honest absence */
      }
    }),
  );
  for (const i of items) i.dateUtc = dates.get(i.blockNumber) ?? "";

  items.sort((a, b) => b.blockNumber - a.blockNumber);
  return { items, fromBlock: from, toBlock: head, chunksFailed };
}
