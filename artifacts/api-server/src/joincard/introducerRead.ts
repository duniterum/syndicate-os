/**
 * The introducer of a source — cached public-registry read (K2, 2026-07-20).
 * ---------------------------------------------------------------------------
 * sourceId → the source's wallet of record, ADR-003 SHORT FORM ONLY. The
 * registry record is public chain data (SourceRegistryV1.sourceConfig); the
 * full address never leaves this module — the short form is derived here,
 * server-side, and that is all any caller ever sees.
 *
 * Read discipline = the channel zone's (sourceExistence.ts): chain identity
 * probed first, fail-closed to null on any doubt, positives cached with a
 * TTL (a source's wallet CAN change — SourceWalletUpdated exists), negatives
 * cached briefly so crawler spam cannot drive upstream RPC.
 *
 * M2-v2 (founder « go dans l'ordre », 2026-08-03): the read now ALSO derives
 * the introducer's LIVING SEAT LINE ("Seat #3 · Chapter I") via the
 * continuity spine + the ONE chapter table. wallet↔seat is PUBLIC chain data
 * (the /registry precedent — the address law), and the full address STILL
 * never leaves this module. No spine row / no DB / any doubt → seatLine
 * null → the card degrades to the plain short-wallet face (fail closed,
 * never an invented seat).
 */

import { getAddress, keccak256, toHex } from "viem";
import {
  DEFAULT_TIMEOUT_MS,
  makeFetchTransport,
  readEnvInt,
  resolveEndpoints,
} from "../lib/protocol/rpcTransport";
import { ethCall, probeChain } from "../lib/protocol/evmRead";
import { callData, decodeBool } from "../lib/protocol/archiveDecoders";
import {
  SELECTOR_SOURCE_IS_ACTIVE,
  bytes32Word,
} from "../lib/protocol/sourceDecoders";
import { SOURCE_LINKAGE_TARGET } from "../data/protocolTargets";
import { chapterForSeat, chapterChipLabel, type Chapter } from "../lib/protocol/chapters";
import { sourceStatsFor } from "../lib/protocol/activeIntroductionModel";
import { displayRung } from "../lib/protocol/connectorLadderCanon";

/** keccak("sourceConfig(bytes32)")[0..4] — computed, never hand-typed. */
const SELECTOR_SOURCE_CONFIG = keccak256(
  toHex("sourceConfig(bytes32)"),
).slice(0, 10) as `0x${string}`;

const POSITIVE_TTL_MS = 10 * 60 * 1000;
/**
 * THE NEGATIVE IS CHEAP TO REDO AND EXPENSIVE TO KEEP (shortened 5 min → 30 s,
 * 2026-08-03).
 *
 * A negative here means "this source is not active", and it is seeded by any
 * visit while a request is pending — including the referrer's own preview click
 * from his Link hero. The founder then signs, the bell tells him «Your referral
 * link is active», and the card would still answer the generic image for up to
 * five more minutes. Networks keep the FIRST picture they scrape, so a share
 * inside that window pins the generic site card to his personal link
 * permanently — the one moment this whole slice exists to get right.
 *
 * The original 5 minutes was about crawler spam driving upstream RPC; that
 * concern is already carried by the route's public-read throttle, and a
 * re-read costs one eth_call.
 */
const NEGATIVE_TTL_MS = 30 * 1000;
const MAX_ENTRIES = 5_000;

/**
 * THE DEADLINE (2026-08-03, added once we understood how permanent a scrape is).
 *
 * This read costs a chain probe + two eth_calls + a spine read. Each RPC leg
 * carries its own 8s abort across two endpoints tried in SEQUENCE, so a slow
 * chain could take 16–40s, and the DB pool has no acquire timeout at all.
 *
 * That is not merely slow — it is PERMANENT. Facebook abandons around 10s, X and
 * WhatsApp sooner, and a network caches what it got on the FIRST scrape for
 * months. A referrer whose first share happened during an RPC hiccup would have
 * had "no preview" glued to his link, and our own fail-closed 302 to the generic
 * image would have arrived long after nobody was listening.
 *
 * So the whole read gets ONE budget. Past it we answer null immediately and the
 * route serves the generic image — a deterministic picture beats a perfect one
 * that arrives too late.
 */
const FACTS_BUDGET_MS = 2_000;
/** The ceiling on the SHARED read itself — see the note where it is applied. */
const SHARED_READ_CEILING_MS = 15_000;
const TIMED_OUT = Symbol("introducer-facts-timed-out");

function withDeadline<T>(p: Promise<T>, ms: number): Promise<T | typeof TIMED_OUT> {
  return new Promise((resolve) => {
    const t = setTimeout(() => resolve(TIMED_OUT), ms);
    // The slow work is abandoned, never awaited: it settles into the void.
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      () => {
        clearTimeout(t);
        resolve(TIMED_OUT);
      },
    );
  });
}

/**
 * SINGLE FLIGHT. A member shares once and five networks scrape in parallel, so
 * the same cold key used to run N chain reads and N paints at the same time —
 * the cache is only written after the awaits complete. One promise per key now
 * serves every concurrent caller.
 */
const inFlight = new Map<string, Promise<IntroducerFacts | null>>();

export interface IntroducerFacts {
  /** ADR-003 short form — all any caller ever sees of the address. */
  shortWallet: string;
  /** M2-v2: "Seat #3 · Chapter I", or null (no spine row / no DB / doubt).
   *  The INVITATION face's line — deliberately the short chapter form. */
  seatLine: string | null;
  // ── K1.7 (founder GO 2026-08-03) — the facts the three member faces print.
  // Each one mirrors, word for word, what the member's own downloadable card
  // shows; join-card.guard reconciles the wording against the studio source.
  // A SEAT-DERIVED field is null when the spine cannot resolve it, and a face
  // whose fact is null falls back to the invitation — never a half-empty
  // boast. `rungLine` is the deliberate exception; its own note says why.
  /** "Seat #3 · Chapter I — Genesis Signal" (the STANDING face's headline). */
  seatLineFull: string | null;
  /** The seat itself, for the collectible's number-in-majesty. */
  seatNumber: number | null;
  /** "Chapter I · Genesis Signal" — the one chip form (chapterChipLabel). */
  chapterChip: string | null;
  /**
   * "Active Connector" — the rung ALONE, never the count.
   *
   * THE NO-FALLING-FIGURE LAW (founder ruling 2026-08-03, option (a)): a painted
   * preview may never carry a figure that can go DOWN. Networks cache a scraped
   * og:image per URL essentially forever — our 10-minute TTL is server-side and
   * does not reach them — so whatever is painted on a member's FIRST share stays
   * glued to that link. A durable-introduction COUNT can fall (a member sells
   * his SYN), and a brand-new referrer would have frozen "0 durable
   * introductions" onto the very link he recruits with. The rung is a TITLE, it
   * is the base rung for everyone at the start, and it is never embarrassing.
   * The record face's count survives because introducedMembers only ever RISES:
   * a stale value understates, it can never overstate.
   */
  rungLine: string;
  /** "14 members introduced", or null when the record is empty — the RECORD
   *  face then falls back, exactly as the client card refuses to mount. */
  recordLine: string | null;
}

interface CacheEntry {
  facts: IntroducerFacts | null;
  at: number;
}
const cache = new Map<string, CacheEntry>();

/** Decode sourceConfig's tuple word 0 (sourceWallet). The FULL lowercase
 * address stays in-module (the seat lookup key); callers get the short form. */
function decodeWallet(data: string): { short: string; fullLower: string } | null {
  if (!/^0x[0-9a-fA-F]{64,}$/.test(data)) return null;
  const word0 = data.slice(2, 2 + 64);
  // A real address word is 12 zero bytes then 20 address bytes — anything
  // else is not an address and never becomes a "wallet" (the house
  // decodeAddressWord discipline).
  if (!/^0{24}/.test(word0)) return null;
  const addrHex = `0x${word0.slice(24)}`;
  try {
    const a = getAddress(addrHex);
    // The zero address = no record (fail closed, never a "0x0000…0000" card).
    if (/^0x0{40}$/i.test(addrHex)) return null;
    return { short: `${a.slice(0, 6)}…${a.slice(-4)}`, fullLower: addrHex.toLowerCase() };
  } catch {
    return null;
  }
}

/** The living seat via the continuity spine (whole-table read — the
 * ledger-service pattern; tiny, and the 10-min cache bounds the rate). Any
 * failure → null: the card degrades, never an invented seat. */
async function seatFor(
  fullLower: string,
): Promise<{ seat: number; chapter: Chapter } | null> {
  try {
    if (process.env.DATABASE_URL == null || process.env.DATABASE_URL.length === 0) return null;
    const { db, memberContinuityRecord } = await import("@workspace/db");
    const spine = await db
      .select({
        memberNumber: memberContinuityRecord.memberNumber,
        entryWallet: memberContinuityRecord.entryWallet,
      })
      .from(memberContinuityRecord);
    const rec = spine.find((r) => (r.entryWallet ?? "").toLowerCase() === fullLower);
    const seat = rec?.memberNumber;
    if (typeof seat !== "number" || seat < 1) return null;
    const chapter = chapterForSeat(seat);
    if (chapter === null) return null;
    return { seat, chapter };
  } catch {
    return null; // fail closed — the plain card
  }
}

/** The standing + record lines, from the source's own row in the active
 * introduction read-model (chain-derived — the same counters the member's own
 * standing screen serves). A row-less source reads 0, exactly as
 * sourceStandingRead does, so the preview and the download agree. */
function standingFor(sourceIdHex: string): {
  /** Always present on this path — see the field note in IntroducerFacts. */
  rungLine: string;
  recordLine: string | null;
} {
  const row = sourceStatsFor(sourceIdHex);
  const durable = row?.durableIntroductions ?? 0;
  const introduced = row?.introducedMembers ?? 0;
  return {
    // displayRung, NOT entitledRateRung: the card speaks the TITLE ladder.
    // The COUNT is deliberately ABSENT — see rungLine's note: a painted preview
    // never carries a figure that can go down, because the networks' image
    // cache outlives ours by months.
    rungLine: `${displayRung(durable).title} Connector`,
    // The client mounts its record card only on a REAL record — mirrored here.
    recordLine:
      introduced > 0
        ? `${introduced} member${introduced === 1 ? "" : "s"} introduced`
        : null,
  };
}

/** The source's introducer facts (short form + living seat line) — or null
 * (fail closed, cached). */
export async function introducerFacts(
  sourceIdHex: string,
): Promise<IntroducerFacts | null> {
  const key = sourceIdHex.toLowerCase();
  const hit = cache.get(key);
  if (hit !== undefined) {
    const ttl = hit.facts !== null ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;
    if (Date.now() - hit.at < ttl) return hit.facts;
    cache.delete(key);
  }

  // ── SINGLE FLIGHT KEYED ON THE *READ*, NOT ON THE DEADLINE ────────────────
  //
  // CORRECTED 2026-08-03 (review finding). The first cut raced the read against
  // the budget and then deleted the in-flight key when the RACE settled — so on
  // a slow chain the key was released after 2s while the read was still
  // running, and the next request started ANOTHER one. Every caller spawned a
  // fresh chain+DB read: unbounded fan-out precisely when the chain is already
  // struggling, on the loop that also serves members' auth. Worse, the slow
  // read's result was thrown away, so a read that took longer than the budget
  // could NEVER populate the cache — the source stayed permanently uncached and
  // every single request paid full price. A system that cannot recover.
  //
  // Now: ONE underlying read per key, held until it actually settles, and it
  // writes the cache WHENEVER it lands — late is still useful, the next scrape
  // gets it warm. Each CALLER races that shared read against its own budget, so
  // a crawler still gets its deterministic 2s answer without cancelling the
  // work everyone behind it is waiting on.
  let reading = inFlight.get(key);
  if (reading === undefined) {
    // A HARD CAP ON THE SHARED READ (2026-08-03, review finding). The shared
    // promise is what the in-flight key is released on, and `seatFor` reaches a
    // pg Pool with NO connectionTimeout / statement_timeout anywhere in the
    // repo. A half-open socket or an exhausted pool means resolveFacts never
    // settles — so the key would never clear and EVERY later request for that
    // source would join a dead promise, race its 2s budget and answer the
    // generic image forever, for the process lifetime, with no recovery after
    // the DB healed. The 2s budget is the CALLER's answer; this is the ceiling
    // on the work itself, generous enough that a merely slow read still lands
    // and warms the cache.
    reading = withDeadline(resolveFacts(key), SHARED_READ_CEILING_MS)
      .then((r) => {
        if (r === TIMED_OUT) throw new Error("introducer read exceeded its ceiling");
        return r;
      })
      .then((facts) => {
      // A DECIDED answer, however late. A timeout is never remembered (a slow
      // chain is not a decided negative) — but this is the read itself
      // returning, not the clock giving up.
      rememberFacts(key, facts);
      return facts;
    });
    inFlight.set(key, reading);
    // Released on the READ settling, never on a caller's deadline.
    reading.catch(() => undefined).then(() => inFlight.delete(key));
  }

  // A rejected shared read (transport failure or the ceiling) is an ANSWERLESS
  // read, not a decided negative: this caller serves the generic image and the
  // next request retries from scratch, because nothing was remembered.
  const raced = await withDeadline(reading.catch(() => null), FACTS_BUDGET_MS);
  // Past the budget this caller answers null and the route serves the generic
  // image; the read continues for everyone else and warms the cache.
  return raced === TIMED_OUT ? null : raced;
}

/** The read itself — unchanged behaviour, now behind the budget. */
async function resolveFacts(key: string): Promise<IntroducerFacts | null> {
  let facts: IntroducerFacts | null = null;
  try {
    const timeoutMs =
      readEnvInt(process.env["AVALANCHE_RPC_TIMEOUT_MS"]) ?? DEFAULT_TIMEOUT_MS;
    const transport = makeFetchTransport(resolveEndpoints(), timeoutMs);
    const probe = await probeChain(transport);
    if (probe.chainIdOk) {
      // THE STATUS GATE (adversarial verify 2026-07-21): a PAUSED/REVOKED
      // source must never unfurl an attribution claim the /join page
      // itself denies — the registry's own isActive() decides, exactly as
      // the validation surface does. Inactive → null → the generic image.
      const activeData = await ethCall(
        transport,
        SOURCE_LINKAGE_TARGET.registryAddress,
        callData(SELECTOR_SOURCE_IS_ACTIVE, [bytes32Word(key)]),
      );
      if (decodeBool(activeData) === true) {
        const data = await ethCall(
          transport,
          SOURCE_LINKAGE_TARGET.registryAddress,
          callData(SELECTOR_SOURCE_CONFIG, [bytes32Word(key)]),
        );
        const wallet = typeof data === "string" ? decodeWallet(data) : null;
        if (wallet !== null) {
          const seated = await seatFor(wallet.fullLower);
          const { rungLine, recordLine } = standingFor(key);
          facts = {
            shortWallet: wallet.short,
            // The invitation face's short chapter form — UNCHANGED (live copy).
            seatLine:
              seated !== null ? `Seat #${seated.seat} · Chapter ${seated.chapter.roman}` : null,
            seatLineFull:
              seated !== null
                ? `Seat #${seated.seat} · Chapter ${seated.chapter.roman} — ${seated.chapter.name}`
                : null,
            seatNumber: seated?.seat ?? null,
            chapterChip: seated !== null ? chapterChipLabel(seated.chapter) : null,
            rungLine,
            recordLine,
          };
        }
      }
    }
  } catch {
    // A TRANSPORT FAILURE IS NOT A DECIDED "INACTIVE" (corrected 2026-08-03).
    // This swallowed every RPC/DB error into `null`, indistinguishable from
    // "the registry says this source is not active" — and since the read now
    // writes the cache whenever it lands, that null was being REMEMBERED as a
    // decided negative for the whole NEGATIVE_TTL_MS. A chain hiccup therefore
    // pinned the generic image for 30s AFTER the chain recovered, on the
    // surface whose first scrape a network keeps for months. Thrown, so the
    // caller can tell "we could not read" from "there is nothing to serve".
    throw new Error("introducer read failed");
  }
  return facts;
}

/** Remember a DECIDED answer (the chain replied, either way). A timeout never
 * reaches here — see the deadline's note. */
function rememberFacts(key: string, facts: IntroducerFacts | null): void {
  if (cache.size >= MAX_ENTRIES) {
    const now = Date.now();
    for (const [k, e] of cache) {
      const ttl = e.facts !== null ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS;
      if (now - e.at >= ttl) cache.delete(k);
    }
    if (cache.size >= MAX_ENTRIES) return; // refuse to grow; the throttle bounds the rate
  }
  cache.set(key, { facts, at: Date.now() });
}

/** The source's introducer, short form — or null (fail closed, cached).
 * Compat wrapper over introducerFacts (the /source/introducer strip). */
export async function introducerShortWallet(
  sourceIdHex: string,
): Promise<string | null> {
  return (await introducerFacts(sourceIdHex))?.shortWallet ?? null;
}
