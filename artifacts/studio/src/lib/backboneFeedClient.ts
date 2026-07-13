// lib/backboneFeedClient.ts — the SERVED feed client (ARC M5).
// ---------------------------------------------------------------------------
// Reads /api/backbone/feed — the event backbone's receipt-line projection
// (M4-b, prod-verified): the COMPLETE indexed purchase history, newest first,
// hard-capped server-side. Identity-blind by design: each line carries kind ·
// generation · block · chain-verified time · the transaction verify anchor —
// no seat numbers, no wallets (the server's output gate enforces it; this
// client re-validates the shape anyway, fail-closed).
//
// HONESTY LAW: a null return means "the served history is unavailable right
// now" — the consumer falls back to the client recent window and SAYS so.
// A malformed line is skipped and COUNTED (mirrors the client scan: an
// undecodable log is never guessed into a sentence).

const TX_ANCHOR_RE = /^0x[0-9a-fA-F]{64}$/;
const BUCKETS = new Set(["true", "false", "unknown"]);

export interface ServedReceiptLine {
  generation: string;
  blockNumber: number;
  /** Chain-verified epoch seconds (Protocol Time — never a wall clock). */
  blockTimestampSec: number;
  isoDayUtc: string;
  transactionHash: `0x${string}`;
  firstSeatBucket: "true" | "false" | "unknown";
  routedFolded: boolean;
}

export interface ServedFeed {
  state: string;
  headBlock: number | null;
  finishedIso: string | null;
  /** Total indexed purchase lines server-side (served = newest cap). */
  itemsTotal: number;
  served: number;
  /** Malformed lines skipped by THIS client's validation (honesty count). */
  linesSkipped: number;
  items: ServedReceiptLine[];
}

function toInt(v: unknown): number | null {
  return typeof v === "number" && Number.isSafeInteger(v) ? v : null;
}

function parseLine(raw: unknown): ServedReceiptLine | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  const blockNumber = toInt(r.blockNumber);
  const blockTimestampSec = toInt(r.blockTimestampSec);
  if (
    r.kind !== "purchase" ||
    typeof r.generation !== "string" ||
    blockNumber === null ||
    blockTimestampSec === null ||
    typeof r.isoDayUtc !== "string" ||
    typeof r.transactionHash !== "string" ||
    !TX_ANCHOR_RE.test(r.transactionHash) ||
    typeof r.firstSeatBucket !== "string" ||
    !BUCKETS.has(r.firstSeatBucket) ||
    typeof r.routedFolded !== "boolean"
  ) {
    return null;
  }
  return {
    generation: r.generation,
    blockNumber,
    blockTimestampSec,
    isoDayUtc: r.isoDayUtc,
    transactionHash: r.transactionHash as `0x${string}`,
    firstSeatBucket: r.firstSeatBucket as "true" | "false" | "unknown",
    routedFolded: r.routedFolded,
  };
}

/**
 * Fetch the served receipt-line history. Returns null on ANY transport/shape
 * failure — the consumer renders the honest fallback, never a guess.
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

    const items: ServedReceiptLine[] = [];
    let linesSkipped = 0;
    for (const raw of b.items) {
      const line = parseLine(raw);
      if (line) items.push(line);
      else linesSkipped += 1;
    }

    return {
      state: typeof b.state === "string" ? b.state : "unknown",
      headBlock: toInt(coverage.headBlock),
      finishedIso:
        typeof coverage.finishedIso === "string" ? coverage.finishedIso : null,
      itemsTotal: toInt(coverage.itemsTotal) ?? items.length,
      served: toInt(coverage.served) ?? items.length,
      linesSkipped,
      items,
    };
  } catch {
    return null; // honest unavailability — the consumer says so
  }
}
