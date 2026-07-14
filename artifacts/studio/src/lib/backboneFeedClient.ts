// lib/backboneFeedClient.ts — the SERVED feed client (ARC M5; M4-c extended).
// ---------------------------------------------------------------------------
// Reads /api/backbone/feed — the event backbone's receipt-line projection:
// the COMPLETE indexed histories, newest first, for seats (M5), burns
// (Proof of Burn, M4-c) and referral lifecycle (M4-c). Identity-blind by
// design: a line carries kind · block · chain-verified time · the transaction
// verify anchor (+ its log index — one tx can carry two burns) · the kind's
// own facts (generation/firstSeat for seats; the exact amount, the
// Founder/Community LABEL and the Proof of Burn number for burns) — no seat
// numbers, no wallets (the server's output gate enforces it; this client
// re-validates the shape anyway, fail-closed).
//
// HONESTY LAW: a null return means "the served history is unavailable right
// now" — the consumer falls back to the client recent window and SAYS so.
// A malformed line is skipped and COUNTED (mirrors the client scan: an
// undecodable log is never guessed into a sentence).

const TX_ANCHOR_RE = /^0x[0-9a-fA-F]{64}$/;
const BUCKETS = new Set(["true", "false", "unknown"]);
const LIFECYCLE_KINDS = new Set([
  "source-created",
  "source-terms",
  "source-status",
]);

interface ServedLineCommon {
  blockNumber: number;
  /** Chain-verified epoch seconds (Protocol Time — never a wall clock). */
  blockTimestampSec: number;
  isoDayUtc: string;
  transactionHash: `0x${string}`;
  logIndex: number;
}

export interface ServedSeatLine extends ServedLineCommon {
  kind: "purchase";
  generation: string;
  firstSeatBucket: "true" | "false" | "unknown";
  routedFolded: boolean;
}

export interface ServedBurnLine extends ServedLineCommon {
  kind: "burn";
  /** 1-based Proof of Burn number, oldest first (#1 = the first burn ever). */
  proofOfBurnNumber: number;
  /** Exact raw 18-decimal base units, decimal string. */
  amountSynRaw: string;
  senderLabel: "Founder" | "Community";
}

export interface ServedLifecycleLine extends ServedLineCommon {
  kind: "source-created" | "source-terms" | "source-status";
}

export type ServedFeedLine = ServedSeatLine | ServedBurnLine | ServedLifecycleLine;

export interface ServedFeed {
  state: string;
  headBlock: number | null;
  finishedIso: string | null;
  /** The protocol lane's honest bounds — below headBlock while catching up. */
  burnsAsOfBlock: number | null;
  lifecycleAsOfBlock: number | null;
  /** Total indexed lines server-side across kinds (served = newest cap). */
  itemsTotal: number;
  served: number;
  /** Which histories the server declared COMPLETE in this payload. */
  lanes: { seats: boolean; burns: boolean; referralLifecycle: boolean };
  /** Malformed lines skipped by THIS client's validation (honesty count). */
  linesSkipped: number;
  /** Mixed feed, newest first, server-capped. */
  items: ServedFeedLine[];
  /** The COMPLETE numbered Proof of Burn record, oldest first. */
  burnLedger: ServedBurnLine[];
}

function toInt(v: unknown): number | null {
  return typeof v === "number" && Number.isSafeInteger(v) ? v : null;
}

function parseCommon(r: Record<string, unknown>): ServedLineCommon | null {
  const blockNumber = toInt(r.blockNumber);
  const blockTimestampSec = toInt(r.blockTimestampSec);
  const logIndex = toInt(r.logIndex);
  if (
    blockNumber === null ||
    blockTimestampSec === null ||
    logIndex === null ||
    typeof r.isoDayUtc !== "string" ||
    typeof r.transactionHash !== "string" ||
    !TX_ANCHOR_RE.test(r.transactionHash)
  ) {
    return null;
  }
  return {
    blockNumber,
    blockTimestampSec,
    logIndex,
    isoDayUtc: r.isoDayUtc,
    transactionHash: r.transactionHash as `0x${string}`,
  };
}

function parseLine(raw: unknown): ServedFeedLine | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const common = parseCommon(r);
  if (!common) return null;

  if (r.kind === "purchase") {
    if (
      typeof r.generation !== "string" ||
      typeof r.firstSeatBucket !== "string" ||
      !BUCKETS.has(r.firstSeatBucket) ||
      typeof r.routedFolded !== "boolean"
    ) {
      return null;
    }
    return {
      kind: "purchase",
      ...common,
      generation: r.generation,
      firstSeatBucket: r.firstSeatBucket as "true" | "false" | "unknown",
      routedFolded: r.routedFolded,
    };
  }
  if (r.kind === "burn") {
    const n = toInt(r.proofOfBurnNumber);
    if (
      n === null ||
      n < 1 ||
      typeof r.amountSynRaw !== "string" ||
      !/^[0-9]+$/.test(r.amountSynRaw) ||
      (r.senderLabel !== "Founder" && r.senderLabel !== "Community")
    ) {
      return null;
    }
    return {
      kind: "burn",
      ...common,
      proofOfBurnNumber: n,
      amountSynRaw: r.amountSynRaw,
      senderLabel: r.senderLabel,
    };
  }
  if (typeof r.kind === "string" && LIFECYCLE_KINDS.has(r.kind)) {
    return {
      kind: r.kind as ServedLifecycleLine["kind"],
      ...common,
    };
  }
  return null;
}

/**
 * Fetch the served receipt-line histories. Returns null on ANY transport/
 * shape failure — the consumer renders the honest fallback, never a guess.
 */
export async function fetchServedFeed(): Promise<ServedFeed | null> {
  try {
    const res = await fetch("/api/backbone/feed", { cache: "no-store" });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    if (typeof body !== "object" || body === null) return null;
    const b = body as Record<string, unknown>;
    if (b.module !== "event-backbone" || !Array.isArray(b.items)) return null;
    const coverage =
      typeof b.coverage === "object" && b.coverage !== null
        ? (b.coverage as Record<string, unknown>)
        : {};
    const lanesRaw =
      typeof b.lanes === "object" && b.lanes !== null
        ? (b.lanes as Record<string, unknown>)
        : {};

    let linesSkipped = 0;
    const items: ServedFeedLine[] = [];
    for (const raw of b.items) {
      const line = parseLine(raw);
      if (line) items.push(line);
      else linesSkipped += 1;
    }

    const burnLedger: ServedBurnLine[] = [];
    if (Array.isArray(b.burnLedger)) {
      for (const raw of b.burnLedger) {
        const line = parseLine(raw);
        if (line && line.kind === "burn") burnLedger.push(line);
        else linesSkipped += 1;
      }
    }

    return {
      state: typeof b.state === "string" ? b.state : "unknown",
      headBlock: toInt(coverage.headBlock),
      finishedIso:
        typeof coverage.finishedIso === "string" ? coverage.finishedIso : null,
      burnsAsOfBlock: toInt(coverage.burnsAsOfBlock),
      lifecycleAsOfBlock: toInt(coverage.lifecycleAsOfBlock),
      itemsTotal: toInt(coverage.itemsTotal) ?? items.length,
      served: toInt(coverage.served) ?? items.length,
      lanes: {
        seats: lanesRaw.seats === true,
        burns: lanesRaw.burns === true,
        referralLifecycle: lanesRaw.referralLifecycle === true,
      },
      linesSkipped,
      items,
      burnLedger,
    };
  } catch {
    return null; // honest unavailability — the consumer says so
  }
}

/** Format a raw 18-decimal SYN amount for a sentence (whole SYN, localized). */
export function formatSynRaw(amountSynRaw: string): string {
  const whole = BigInt(amountSynRaw) / 10n ** 18n;
  return whole.toLocaleString("en-US");
}

// The §8 event lexicon — one event kind, ONE canonical sentence. Never
// reinvented; the served lines carry facts, these lines carry the words.
// (Moved here from LiveActivityFeed in M1-b so the hero's live mini-feed and
// the /activity page speak from the SAME single mapping — no copy invented.)
export function sentenceForServedLine(line: ServedFeedLine): string {
  switch (line.kind) {
    case "purchase":
      return `A seat was written on-chain${line.firstSeatBucket === "true" ? " — a first seat" : ""}.`;
    case "burn":
      return `${formatSynRaw(line.amountSynRaw)} SYN was retired to the burn address — gone for everyone, forever.`;
    case "source-created":
      return "A referral source was created — a founder-signed on-chain act.";
    case "source-terms":
      return "A source's terms were updated — a public event; there are no silent edits.";
    case "source-status":
      return "A source's status changed — a public event; there are no silent edits.";
  }
}
