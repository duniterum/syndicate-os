// components/activity/LiveActivityFeed.tsx — THE ACTIVITY NEWSROOM (A3,
// wireframe founder-approved "GO and GO-Live" 2026-07-22, commit c1a57a1;
// grew from ARC ACT-1 → M5 → M4-c → H1a/H2 — the complete heartbeat).
// ---------------------------------------------------------------------------
// THE COMPOSITION (WORK-FIRST law): Z1 one-line header + the ONE-authority
// seat figure + the era band (AW-2, founder YES) → Z2 facet chips with real
// served counts → Z3 THE FEED FIRST (12 lines, newest first, date-grouped,
// gold Founder chip on proven founder acts, Load more) → Z4 milestones
// condensed AFTER the work (+ the historical-FOMO line — business-first
// ruling 2026-07-22: TRUE and chain-derived, never financial) → Z5 the full
// methodology in a collapsed expander (the honesty stays whole; it is no
// longer the front hall — a DEGRADED source still announces itself at top).
// TWO honest sources still compose here, each labeled with its own coverage:
//   • SERVED HISTORIES — /api/backbone/feed (complete indexed record; the A2
//     pagination continues past the newest cap on demand).
//   • RECENT WINDOW — the client chain read (~24h freshness layer).
// Overlap dedupes by (kind · transaction anchor · log index) — the window's
// richer sentence wins. Never a silent gap, never proof of absence.

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Anchor, ExternalLink, RefreshCw } from "lucide-react";
import {
  useGetProtocolVerifyLinks,
  useGetProtocolReality,
} from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill/StatusPill";
import {
  scanRecentActivity,
  DEFAULT_WINDOW_BLOCKS,
  type ActivityItem,
  type ActivityKind,
  type ActivityScan,
} from "@/lib/activityFeed";
import {
  fetchServedFeed,
  sentenceForServedLine,
  factsForServedLine,
  type ServedFeed,
  type ServedFeedLine,
  type ServedFeedPagination,
} from "@/lib/backboneFeedClient";
import { MilestonesPanel } from "@/components/activity/MilestonesPanel";
import { CHRONICLE_REGISTER } from "@/config/chronicleRegister";
import { DEPLOYMENT_REGISTRY } from "@/config/deploymentRegistry";
import { CHAPTERS } from "@/lib/chapters";
import { eraForSeatCount } from "@/config/eraCanon";

// The §8 event lexicon lives in backboneFeedClient (one mapping, shared with
// the hero's live mini-feed since M1-b — no copy invented twice).

const SERVED_KIND_TO_WINDOW_KIND: Record<ServedFeedLine["kind"], ActivityKind> = {
  purchase: "seat",
  burn: "burn",
  "source-created": "source-created",
  "source-terms": "source-terms",
  "source-status": "source-status",
  // H1a — the complete heartbeat's kinds (served-feed only).
  "source-wallet": "source-wallet",
  "lp-add": "lp-add",
  "lp-remove": "lp-remove",
  "archive-mint": "archive-mint",
  "archive-pause": "archive-pause",
  // H2-⑦ — treasury movements (served-feed only).
  "treasury-move": "treasury-move",
  // H2-⑬ — milestone crossings (served-feed only).
  milestone: "milestone",
  // H2-⑫ — era transitions (served-feed only).
  "era-transition": "era-transition",
  // H2-⑰ — capital-axis rises (served-feed only).
  "capital-rise": "capital-rise",
};

const KIND_LABEL: Record<ActivityKind, string> = {
  seat: "Seat",
  burn: "Burn",
  "source-created": "Referral",
  "source-terms": "Referral",
  "source-status": "Referral",
  "source-wallet": "Referral",
  "lp-add": "Liquidity",
  "lp-remove": "Liquidity",
  "archive-mint": "Archive",
  "archive-pause": "Archive",
  "treasury-move": "Treasury",
  milestone: "Milestone",
  "era-transition": "Era",
  "chronicle-entry": "Chronicle",
  "capital-rise": "Footprint",
  deployment: "Deployment",
};

function addressFromUrl(url: string): string | null {
  return url.match(/\/(?:token|address)\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}

type FilterId =
  | "all"
  | "founder"
  | "seat"
  | "burn"
  | "referral"
  | "liquidity"
  | "archive"
  | "treasury-move"
  | "milestone"
  | "era-transition"
  | "chronicle-entry"
  | "capital-rise"
  | "deployment";
// A3: PRIMARY facets render on the bar; the rest live behind "More" (the
// benchmark's 5-6-visible law) — a deep link to an overflow facet expands it.
const FILTERS: { id: FilterId; label: string; primary: boolean }[] = [
  { id: "all", label: "All", primary: true },
  // THE FOUNDER FACET (founder order 2026-07-22): an ACTOR facet beside the
  // kind lanes — every act that is provably the founder's: deployments,
  // registry lifecycle (onlyOwner signatures), treasury moves, chronicle
  // promotions, and his own burns (the ledger's senderLabel). Never guessed:
  // a line joins only when the served facts say founder. No count renders on
  // this chip: the whole-history per-ACTOR total is not a served figure, and
  // a guessed count would be a lie.
  { id: "founder", label: "Founder", primary: true },
  // "Membership" (the seat-law sweep 2026-07-22): this lane holds FIRST
  // seats AND footprint expansions — the honest name for its whole content
  // ("Seats" undercounted-in-word; the separate Footprint chip keeps the
  // capital-rise recognitions).
  { id: "seat", label: "Membership", primary: true },
  { id: "burn", label: "Burns", primary: true },
  { id: "treasury-move", label: "Treasury", primary: true },
  { id: "liquidity", label: "Liquidity", primary: true },
  { id: "archive", label: "Archive", primary: true },
  // H2-⑭ founder decision A: this chip filters the REGISTRY's own admin
  // lifecycle (source created/terms/status/wallet) — named for what it is;
  // member referrals live inside seat lines ("brought by 0x…").
  { id: "referral", label: "Referral registry", primary: true },
  { id: "milestone", label: "Milestones", primary: false },
  { id: "era-transition", label: "Eras", primary: false },
  { id: "chronicle-entry", label: "Chronicle", primary: false },
  { id: "capital-rise", label: "Footprint", primary: false },
  { id: "deployment", label: "Deployments", primary: false },
];
const FILTER_IDS = new Set<string>(FILTERS.map((f) => f.id));
const PAGE_SIZE = 12;

function matches(item: ActivityItem, f: FilterId): boolean {
  if (f === "all") return true;
  if (f === "founder") return isFounderLine(item);
  if (f === "referral") return item.kind.startsWith("source-");
  if (f === "liquidity") return item.kind === "lp-add" || item.kind === "lp-remove";
  if (f === "archive") return item.kind === "archive-mint" || item.kind === "archive-pause";
  return item.kind === f;
}

// THE COMPLETE FOUNDER FACET (his sweep order 2026-07-22): kind-level
// founder acts (the canon says so per lane — deployments · registry
// lifecycle · treasury · chronicle promotions · the archive's ceremonial
// pause/resume) + per-line PROVEN acts via the server's own founderAddresses
// labels (his burns · his LP adds/removes · his archive mints). Seats/
// milestones/eras stay out (protocol facts / member acts — never guessed).
// A3 lifts this to a helper: the gold per-line Founder chip (capital F —
// founder order 2026-07-22) renders from the SAME truth the facet filters by.
function isFounderLine(item: ActivityItem): boolean {
  return (
    item.kind === "deployment" ||
    item.kind === "chronicle-entry" ||
    item.kind === "treasury-move" ||
    item.kind === "archive-pause" ||
    item.kind.startsWith("source-") ||
    item.founderAct === true
  );
}

/** A3 date-group label: Today / Yesterday (UTC day) / "July 2026". */
function dateGroupLabel(dateUtc: string, todayUtc: string, yesterdayUtc: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateUtc)) return "Earlier";
  const pretty = new Date(`${dateUtc}T00:00:00Z`).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  if (dateUtc === todayUtc) return `Today — ${pretty}`;
  if (dateUtc === yesterdayUtc) return `Yesterday — ${pretty}`;
  return new Date(`${dateUtc}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

const lineKey = (i: { kind: string; txHash: string; logIndex: number }) =>
  `${i.kind}:${i.txHash.toLowerCase()}:${i.logIndex}`;
const servedKey = (l: ServedFeedLine) =>
  `${SERVED_KIND_TO_WINDOW_KIND[l.kind]}:${l.transactionHash.toLowerCase()}:${l.logIndex}`;

export function LiveActivityFeed({
  onlyKinds,
  showFilters = true,
}: {
  /** Restrict the feed (the Fire Ledger passes ["burn"]). */
  onlyKinds?: readonly ActivityKind[];
  showFilters?: boolean;
}) {
  const { data } = useGetProtocolVerifyLinks();
  // ONE authority for the seat figure — the SAME reality item the homepage
  // headlines (financial.members.memberCount, the reconciled live engine
  // read). The two surfaces can never diverge again. Fail-closed to null.
  const { data: realityData } = useGetProtocolReality();
  const liveSeatCount = (() => {
    const item =
      realityData?.groups?.financial?.find(
        (i) => i.id === "financial.members.memberCount",
      ) ?? null;
    if (item === null || typeof item.value !== "string" || !/^[0-9]+$/.test(item.value)) {
      return null;
    }
    const n = Number(item.value);
    return Number.isSafeInteger(n) ? n : null;
  })();
  const urlFor = (id: string) => data?.links?.find((l) => l.id === id)?.url ?? null;
  const explorerBase = (() => {
    const u = urlFor("membershipSaleV3");
    return u ? (u.match(/^(.*)\/address\//)?.[1] ?? null) : null;
  })();

  const addrs = useMemo(() => {
    const sale = urlFor("membershipSaleV3");
    const syn = urlFor("synToken");
    const burn = urlFor("burnAddress");
    const reg = urlFor("sourceRegistry");
    if (!sale || !syn || !burn || !reg) return null;
    const a = {
      sale: addressFromUrl(sale),
      synToken: addressFromUrl(syn),
      burnAddress: addressFromUrl(burn),
      sourceRegistry: addressFromUrl(reg),
    };
    return a.sale && a.synToken && a.burnAddress && a.sourceRegistry
      ? (a as { sale: string; synToken: string; burnAddress: string; sourceRegistry: string })
      : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const [scan, setScan] = useState<ActivityScan | null>(null);
  const [served, setServed] = useState<ServedFeed | null>(null);
  const [servedTried, setServedTried] = useState(false);
  const [loading, setLoading] = useState(false);
  // A3: whole-history counts from the A2 head call (the chips' authority).
  const [pageInfo, setPageInfo] = useState<ServedFeedPagination | null>(null);
  // A3: served lines loaded BEYOND the first envelope — older pages (Load
  // more past the newest cap) and fresher lines (the live poll).
  const [servedMore, setServedMore] = useState<ServedFeedLine[]>([]);
  // A3: keys of live-polled lines — they slide in with the gold flash.
  const [freshKeys, setFreshKeys] = useState<ReadonlySet<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreChipsOpen, setMoreChipsOpen] = useState(false);
  // A3: the facet is deep-linkable (?facet=…) — read once, replace on change.
  const [filter, setFilter] = useState<FilterId>(() => {
    if (typeof window === "undefined") return "all";
    const q = new URLSearchParams(window.location.search).get("facet");
    return q !== null && FILTER_IDS.has(q) ? (q as FilterId) : "all";
  });
  const selectFilter = (f: FilterId) => {
    setFilter(f);
    setVisibleCount(PAGE_SIZE);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (f === "all") url.searchParams.delete("facet");
      else url.searchParams.set("facet", f);
      window.history.replaceState(null, "", url.toString());
    }
  };
  // The Re-read counter: bumping it re-arms the fetch effect below (state
  // resets alone never re-fire an [addrs]-keyed effect — the button stalled
  // on "Reading the chain…" forever; found at the H2-⑬ rig verification).
  const [readNonce, setReadNonce] = useState(0);

  useEffect(() => {
    if (!addrs || loading || scan) return;
    setLoading(true);
    // Three sources in parallel: the served history (fail-soft to null), the
    // A2 head page (whole-history counts for the chips — fail-soft), and the
    // client recent window. Each renders only what it truly covers.
    void Promise.all([
      scanRecentActivity(addrs),
      fetchServedFeed(),
      onlyKinds ? Promise.resolve(null) : fetchServedFeed({ limit: 1 }),
    ]).then(([s, f, head]) => {
      setScan(s);
      setServed(f);
      setPageInfo(head?.pagination ?? null);
      setServedTried(true);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addrs, readNonce]);

  // A3 — THE LIVE PULSE (business-first ruling 2026-07-22: the feed breathes;
  // no click-to-refresh theater). A light poll of the newest served page;
  // unseen lines join with the gold entrance. List-top insertion never moves
  // the reader's viewport content below it (browser scroll anchoring); the
  // full-feed surface only.
  const knownKeysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const keys = new Set<string>();
    for (const l of served?.items ?? []) keys.add(servedKey(l));
    for (const l of servedMore) keys.add(servedKey(l));
    knownKeysRef.current = keys;
  }, [served, servedMore]);
  useEffect(() => {
    if (onlyKinds || served === null) return;
    const t = window.setInterval(() => {
      void fetchServedFeed({ limit: PAGE_SIZE }).then((f) => {
        if (f === null) return;
        const fresh = f.items.filter((l) => !knownKeysRef.current.has(servedKey(l)));
        if (fresh.length === 0) return;
        setServedMore((prev) => [...fresh, ...prev]);
        setFreshKeys(new Set(fresh.map(servedKey)));
      });
    }, 60_000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyKinds, served === null]);

  // M5/M4-c merge, REVERSED at the founder's live read (2026-07-22, the
  // Replit-diagnosed gap): the SERVED line now WINS the dedup — it carries
  // the ledger facts and the server-proven actor labels (senderLabel /
  // actorLabel / minterLabel), so a fresh founder burn wears its gold chip
  // and joins the Founder facet IMMEDIATELY, never after a ~24h window
  // hand-off. (The old "window wins" note dated from before H2-P gave the
  // served seat lines their own pride voice — a STATE, not a law.) The
  // window's only job left is FRESHNESS: lines the indexer has not served
  // yet.
  const merged = useMemo<ActivityItem[]>(() => {
    const servedLines: ServedFeedLine[] = [];
    {
      const seenServed = new Set<string>();
      for (const l of [...(served?.items ?? []), ...servedMore]) {
        const k = servedKey(l);
        if (seenServed.has(k)) continue;
        seenServed.add(k);
        servedLines.push(l);
      }
    }
    const servedKeys = new Set(servedLines.map(servedKey));
    const windowItems = (scan?.items ?? []).filter((i) => !servedKeys.has(lineKey(i)));
    const deepLines: ActivityItem[] = servedLines.map((l) => {
      // THE VISIBILITY RULE (H1a): the line carries what the chain
      // publishes — amounts and public facts join the sentence.
      const facts = factsForServedLine(l);
      return {
        kind: SERVED_KIND_TO_WINDOW_KIND[l.kind],
        sentence: facts
          ? `${sentenceForServedLine(l)} (${facts})`
          : sentenceForServedLine(l),
        blockNumber: l.blockNumber,
        txHash: l.transactionHash,
        logIndex: l.logIndex,
        dateUtc: l.isoDayUtc,
        memory: true,
        // The seat law rides into the summary: the served bucket says
        // first-seat / expansion / never-emitted — carried verbatim,
        // never inferred (founder-caught 2026-07-22). Only the purchase
        // variant carries the flag (the discriminated union narrows).
        firstSeat:
          l.kind === "purchase"
            ? l.firstSeatBucket === "true"
              ? true
              : l.firstSeatBucket === "false"
                ? false
                : null
            : undefined,
        // The founder facet's per-line proof (the founder's sweep order
        // 2026-07-22, "check the FULL list"): the served labels the SERVER
        // derives from its own founderAddresses set — burns (senderLabel),
        // LP adds/removes (actorLabel), archive mints (minterLabel).
        // Window-scanned lines can't prove an actor and never join.
        founderAct:
          l.kind === "burn"
            ? l.senderLabel === "Founder"
            : l.kind === "lp-add" || l.kind === "lp-remove"
              ? l.actorLabel === "Founder"
              : l.kind === "archive-mint"
                ? l.minterLabel === "Founder"
                : undefined,
      };
    });
    // H2-⑭ — Chronicle promotions join from the committed register (CHR-1:
    // a promotion is a founder COMMIT, not a chain event — no anchor exists
    // and none is invented; the line links into the record itself and wears
    // the PROMOTION date).
    const chronicleLines: ActivityItem[] = CHRONICLE_REGISTER.map((e, idx) => ({
      kind: "chronicle-entry" as const,
      sentence: `“${e.title}” entered the Chronicle — promoted by the founder, recorded forever.`,
      blockNumber: 0,
      txHash: `0x${e.id}` as `0x${string}`,
      logIndex: idx,
      dateUtc: e.promotedUtc,
      memory: true,
      readHref: `/chronicle#${e.id}`,
    }));

    // Ordering: chain lines keep exact block order among themselves; a
    // register line slots by its promotion DAY (block order is monotonic
    // with days, so the mix stays truthful) and reads as the day's headline.
    // H2-⑩ — deployments: the protocol's births, from the committed canon
    // registry (chain-verified at the gate). REAL creation-tx anchors — the
    // lines sort by their true blocks like any chain line. Founder-voice
    // rule: deployments ARE founder acts, and the sentence says so; the
    // pool's creation carries its own line — the market's opening.
    const deploymentLines: ActivityItem[] = DEPLOYMENT_REGISTRY.map((d) => ({
      kind: "deployment" as const,
      sentence: d.isPoolCreation
        ? "The SYN/USDC pool was created — the public market opened."
        : `${d.label} was deployed — a founder act, permanent on Avalanche.`,
      blockNumber: d.blockNumber,
      txHash: d.transactionHash,
      logIndex: 0,
      dateUtc: d.dateUtc,
      memory: true,
    }));

    const isChron = (i: ActivityItem) => i.kind === "chronicle-entry";
    return [...windowItems, ...deepLines, ...chronicleLines, ...deploymentLines].sort((a, b) => {
      if (isChron(a) || isChron(b)) {
        const ad = a.dateUtc || "9999-12-31";
        const bd = b.dateUtc || "9999-12-31";
        if (ad !== bd) return ad > bd ? -1 : 1;
        if (isChron(a) !== isChron(b)) return isChron(a) ? -1 : 1;
        return b.logIndex - a.logIndex;
      }
      return a.blockNumber !== b.blockNumber
        ? b.blockNumber - a.blockNumber
        : b.logIndex - a.logIndex;
    });
  }, [scan, served, servedMore]);

  const items = merged.filter(
    (i) => (onlyKinds ? onlyKinds.includes(i.kind) : true) && matches(i, filter),
  );

  // A3 — Load more: widen the client window; when the loaded served lines
  // run out BEFORE the server's whole history does, continue via the A2
  // cursor (the newest-cap ceiling is dead — the full record pages in).
  const oldestServed = useMemo<ServedFeedLine | null>(() => {
    let oldest: ServedFeedLine | null = null;
    for (const l of [...(served?.items ?? []), ...servedMore]) {
      if (
        oldest === null ||
        l.blockNumber < oldest.blockNumber ||
        (l.blockNumber === oldest.blockNumber && l.logIndex < oldest.logIndex)
      ) {
        oldest = l;
      }
    }
    return oldest;
  }, [served, servedMore]);
  const loadedServedCount = (served?.items.length ?? 0) + servedMore.length;
  const serverHasOlder =
    served !== null &&
    (pageInfo?.totalCount ?? served.itemsTotal) > loadedServedCount &&
    oldestServed !== null;
  const onLoadMore = () => {
    setVisibleCount((c) => c + PAGE_SIZE);
    if (serverHasOlder && !loadingMore && oldestServed) {
      setLoadingMore(true);
      void fetchServedFeed({
        limit: 2 * PAGE_SIZE,
        cursor: `${oldestServed.blockNumber}:${oldestServed.logIndex}`,
      }).then((f) => {
        if (f !== null && f.items.length > 0) {
          setServedMore((prev) => {
            const have = new Set([...prev.map(servedKey)]);
            return [...prev, ...f.items.filter((l) => !have.has(servedKey(l)))];
          });
        }
        setLoadingMore(false);
      });
    }
  };

  // Served coverage is claimed ONLY for lanes that are both in scope and
  // declared complete by the server (H1a: seats + burns + referral lifecycle
  // + liquidity + archive — the complete heartbeat).
  const laneFor = (k: ActivityKind): boolean =>
    k === "seat"
      ? (served?.lanes.seats ?? false)
      : k === "burn"
        ? (served?.lanes.burns ?? false)
        : k === "lp-add" || k === "lp-remove"
          ? (served?.lanes.liquidity ?? false)
          : k === "archive-mint" || k === "archive-pause"
            ? (served?.lanes.archive ?? false)
            : k === "treasury-move"
              ? (served?.lanes.treasury ?? false)
              : k === "milestone"
                ? (served?.lanes.milestones ?? false)
                : k === "era-transition"
                  ? (served?.lanes.eras ?? false)
                  : k === "capital-rise"
                    ? (served?.lanes.capital ?? false)
                    : (served?.lanes.referralLifecycle ?? false);
  const kindsInScope: readonly ActivityKind[] = onlyKinds ?? [
    "seat",
    "burn",
    "source-created",
    "source-terms",
    "source-status",
    "source-wallet",
    "lp-add",
    "lp-remove",
    "archive-mint",
    "archive-pause",
    "treasury-move",
    "milestone",
    "era-transition",
    "capital-rise",
  ];
  const servedComplete =
    served !== null && served.items.length >= 0 && kindsInScope.every(laneFor);

  // A3 — the chips' counts: the SERVER's whole-history kindCounts (A2) plus
  // the two committed registers. A facet whose true total is unknown shows
  // no number (the Founder actor facet, a failed head call, or a DARK served
  // history — an unproven zero is not a zero; rig-caught 2026-07-22) —
  // never client arithmetic dressed as a total.
  const kc =
    servedTried && served !== null && kindsInScope.every(laneFor)
      ? (pageInfo?.kindCounts ?? null)
      : null;
  const chipCount = (f: FilterId): number | null => {
    if (kc === null) return null;
    const n = (k: string) => kc[k] ?? 0;
    switch (f) {
      case "all":
        return (
          (pageInfo?.totalCount ?? 0) + CHRONICLE_REGISTER.length + DEPLOYMENT_REGISTRY.length
        );
      case "founder":
        return null;
      case "seat":
        return n("purchase");
      case "burn":
        return n("burn");
      case "referral":
        return n("source-created") + n("source-terms") + n("source-status") + n("source-wallet");
      case "liquidity":
        return n("lp-add") + n("lp-remove");
      case "archive":
        return n("archive-mint") + n("archive-pause");
      case "treasury-move":
        return n("treasury-move");
      case "milestone":
        return n("milestone");
      case "era-transition":
        return n("era-transition");
      case "capital-rise":
        return n("capital-rise");
      case "chronicle-entry":
        return CHRONICLE_REGISTER.length;
      case "deployment":
        return DEPLOYMENT_REGISTRY.length;
    }
  };

  // A3 — the era band (AW-2, founder YES 2026-07-22: factual bytecode
  // disclosure). The era derives from the LIVE seat count against the
  // committed bytecode schedule — rendered ONLY while the indexed history
  // carries ZERO era transitions (today's truth: every engine sits in era
  // 1, so count-vs-boundary IS the era). The first real transition retires
  // this gate and the band learns the engine split in its own slice —
  // fail-closed hidden until then, never a guess.
  // Fail-closed: an era-transition count is only a COUNT when the server
  // declared the eras lane complete — a dark served history yields null
  // (an unproven zero is not a zero), and the band hides.
  const eraTransitionsTotal =
    served !== null && served.lanes.eras
      ? kc !== null
        ? (kc["era-transition"] ?? 0)
        : served.items.filter((l) => l.kind === "era-transition").length
      : null;
  const eraBand = (() => {
    if (onlyKinds || liveSeatCount === null || eraTransitionsTotal !== 0) return null;
    const era = eraForSeatCount(liveSeatCount);
    if (era === null) return null;
    const seatsAway = era.endSeat - liveSeatCount;
    if (seatsAway <= 0) return null;
    return { era, seatsAway };
  })();

  // A3 — the historical-FOMO line (business-first ruling: TRUE, historical,
  // chain-derived — Chapter I's bound is frozen canon; the live count is the
  // ONE-authority engine read). Fail-closed: no live count → no line.
  const genesis = CHAPTERS[0]!;
  const fomoLine =
    liveSeatCount !== null &&
    genesis.endSeat !== null &&
    liveSeatCount < genesis.endSeat
      ? `${liveSeatCount.toLocaleString("en-US")} of ${genesis.endSeat.toLocaleString("en-US")} ${genesis.name} seats are taken — Chapter ${genesis.roman} seals forever at seat #${genesis.endSeat.toLocaleString("en-US")}. A place in the founding story is claimed once.`
      : null;

  // A3 — the honest history counts, in human words (the 12-vs-14 lesson:
  // the seat figure and the event counts are DIFFERENT grains — the counts
  // speak subordinate, clearly named as history).
  const historyCounts = (() => {
    if (kc !== null) {
      const refs =
        (kc["source-created"] ?? 0) +
        (kc["source-terms"] ?? 0) +
        (kc["source-status"] ?? 0) +
        (kc["source-wallet"] ?? 0);
      return { purchases: kc["purchase"] ?? 0, burns: kc["burn"] ?? 0, refs };
    }
    if (!servedComplete) return null;
    const pool = merged;
    return {
      purchases: pool.filter((i) => i.kind === "seat").length,
      burns: pool.filter((i) => i.kind === "burn").length,
      refs: pool.filter((i) => i.kind.startsWith("source-")).length,
    };
  })();

  // A3 — the degraded-coverage notice: honesty ALWAYS announces itself at
  // the top when a source is limping; the full methodology lives in Z5.
  const degraded: string[] = [];
  if (servedTried && !servedComplete) {
    degraded.push("the served history is unavailable right now — the recent window stands alone");
  }
  if (scan && scan.chunksFailed > 0) {
    degraded.push(`${scan.chunksFailed} live-window range(s) could not be read and are NOT covered`);
  }
  if (served && served.linesSkipped > 0) {
    degraded.push(`${served.linesSkipped} served line(s) failed validation and are NOT shown`);
  }

  const visible = items.slice(0, visibleCount);
  const todayUtc = new Date().toISOString().slice(0, 10);
  const yesterdayUtc = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  const renderLine = (i: ActivityItem) => (
    <Card
      key={lineKey(i)}
      className={`bg-card/40 border-border/50 p-3.5 ${
        freshKeys.has(lineKey(i))
          ? "animate-in fade-in slide-in-from-top-2 border-gold/50"
          : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <StatusPill tone={i.kind === "burn" ? "caution" : "proof"} size="xs">
          {KIND_LABEL[i.kind]}
        </StatusPill>
        {/* THE FOUNDER CHIP (founder order 2026-07-22): capital F, gold —
            rendered from the same proven truth the Founder facet filters
            by; never a guess on a window-scanned line. */}
        {!onlyKinds && isFounderLine(i) ? (
          // Capital-F Founder in GOLD (founder order 2026-07-22). The tinted
          // pairing (gold text on gold-tinted ground) is the house chip
          // grammar and holds AAA contrast in BOTH themes — a solid-gold
          // ground failed light-mode contrast at the rig.
          <span
            className="rounded border border-gold/50 bg-gold/15 px-1.5 py-0.5 text-xs font-semibold leading-none text-gold"
            data-testid="founder-chip"
          >
            Founder
          </span>
        ) : null}
        <p className="text-sm text-foreground/90 flex-1 min-w-48">{i.sentence}</p>
        {i.memory ? (
          <span
            className="inline-flex items-center gap-1 text-xs text-gold"
            title="Anchored to protocol memory — a Chronicle-grade event."
          >
            <Anchor className="h-3 w-3" aria-hidden="true" /> memory
          </span>
        ) : null}
        <span className="font-mono text-xs text-muted-foreground">
          {/* Register-derived lines have no chain anchor — the date
              alone is honest; "block 0" would be a lie. */}
          {i.readHref
            ? i.dateUtc || "—"
            : `${i.dateUtc || "—"} · block ${i.blockNumber.toLocaleString("en-US")}`}
        </span>
        {i.readHref ? (
          <Link
            href={i.readHref}
            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-proof/80 hover:text-proof"
          >
            read the record <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          </Link>
        ) : explorerBase ? (
          <a
            href={`${explorerBase}/tx/${i.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-proof/80 hover:text-proof"
          >
            verify <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    </Card>
  );

  // ── RESTRICTED MODE (the Fire Ledger et al.): the single-purpose record
  // keeps its original composition — banner + the full list. ──
  if (onlyKinds) {
    return (
      <div>
        <Card className="bg-card/30 border-border/50 p-3.5 mb-4">
          <p className="text-xs text-muted-foreground leading-relaxed" data-testid="activity-health-banner">
            {servedComplete && served ? (
              <>
                <span className="text-foreground font-medium">
                  Complete history, served by the event indexer.
                </span>{" "}
                {`The full indexed record from each stream's first block, as of block ${served.headBlock ? served.headBlock.toLocaleString("en-US") : "…"}. `}
              </>
            ) : servedTried ? (
              <>
                <span className="text-foreground font-medium">
                  The served history is unavailable right now
                </span>
                {" — the recent window below stands alone. "}
              </>
            ) : null}
            <span className="text-foreground font-medium">
              {servedComplete
                ? "The live window: a recent chain read, refreshing between indexer cycles."
                : "A recent window, read live from the chain."}
            </span>{" "}
            {scan
              ? `Blocks ${scan.fromBlock.toLocaleString("en-US")} → ${scan.toBlock.toLocaleString("en-US")} (~24h)${scan.chunksFailed > 0 ? ` · ${scan.chunksFailed} range(s) could not be read and are NOT covered` : ""}.`
              : `The last ~${Math.round(DEFAULT_WINDOW_BLOCKS / 1800)} hours of blocks.`}{" "}
            What appears here happened and is verifiable; what does not appear
            is simply outside the stated coverage — never evidence of absence.
          </p>
        </Card>
        {loading || scan === null ? (
          <p className="text-sm text-muted-foreground py-6">Reading the chain…</p>
        ) : items.length === 0 ? (
          <Card className="bg-card/20 border-dashed border-border/60 p-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              No matching events within the stated coverage. That is an honest
              read — not a claim about anything outside it.
            </p>
          </Card>
        ) : (
          <div className="space-y-2">{items.map(renderLine)}</div>
        )}
      </div>
    );
  }

  // ── THE NEWSROOM (full-feed mode; wireframe c1a57a1, approved). ──
  // THE WIREFRAME'S GEOMETRY BINDS (founder catch 2026-07-22): the approved
  // mockup capped the newsroom column at ~1180px — a reading feed stretched
  // edge-to-edge on a wide screen tears the sentence from its date/verify
  // meta (the S7-d law's own words: readability bounded per card, never one
  // column stretched). max-w-6xl (1152px) is the house token nearest the
  // approved cap; the page around it stays fluid.
  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Z1 — the header band: ONE authority figure + honest history counts
          + the era band. The seat figure quotes the SAME live engine
          memberCount() the homepage headlines (founder-caught twice,
          2026-07-22 — the flag-split "12 seats" class is dead); event
          counts render SUBORDINATE and named as history (different grain,
          never beside the seat figure at equal rank). Fail-closed: no live
          read → no seat claim, never an invented figure. */}
      <div className="mb-5" data-testid="activity-header-band">
        {liveSeatCount !== null ? (
          // TYPE HARMONY (founder catch 2026-07-22): the page has ONE serif
          // display — the hero h1. This figure is a STAT and speaks the
          // house stat voice (Work Sans semibold), exactly as the approved
          // wireframe drew it. Never a second serif headline.
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1" data-testid="activity-summary">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              {liveSeatCount.toLocaleString("en-US")} seats on-chain
            </span>
            <StatusPill tone="proof" size="xs">
              Live engine read
            </StatusPill>
          </p>
        ) : null}
        {historyCounts !== null ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {`Indexed history: ${historyCounts.purchases} purchases · ${historyCounts.burns} burns · ${historyCounts.refs} referral acts — complete since each stream's first block.`}
          </p>
        ) : null}
        {degraded.length > 0 ? (
          <p className="mt-2 text-xs text-muted-foreground" data-testid="activity-degraded">
            <span className="font-medium text-foreground">Coverage notice:</span>{" "}
            {degraded.join(" · ")}. Details below.
          </p>
        ) : null}
        {eraBand !== null ? (
          // TYPE HARMONY: ONE size (text-sm), ONE face (Work Sans) across
          // the band — gold carries emphasis, never a font change mid-line.
          <div
            className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border border-border/50 border-l-2 border-l-gold bg-card/30 px-3.5 py-2.5"
            data-testid="activity-era-band"
          >
            <span className="text-sm font-medium text-gold">
              Era {eraBand.era.era}
            </span>
            <span className="text-sm text-foreground/90">
              {eraBand.era.synPerUsd.toLocaleString("en-US")} SYN per $ · minimum entry $
              {eraBand.era.minEntryUsd.toLocaleString("en-US")}
            </span>
            <span className="text-sm text-muted-foreground">
              the rate table turns a page at seat #
              {eraBand.era.endSeat.toLocaleString("en-US")} —{" "}
              <span className="font-medium text-gold">
                {eraBand.seatsAway.toLocaleString("en-US")} seats away
              </span>
            </span>
          </div>
        ) : null}
      </div>

      {/* Z2 — the facet bar: primaries + More; counts are the server's own
          whole-history figures (never client arithmetic over a page). */}
      {showFilters ? (
        <div className="mb-4 flex flex-wrap items-center gap-2" data-testid="activity-facets">
          {FILTERS.filter(
            (f) =>
              f.primary ||
              moreChipsOpen ||
              filter === f.id /* a deep-linked overflow facet stays visible */,
          ).map((f) => {
            const c = chipCount(f.id);
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => selectFilter(f.id)}
                // py-3.5 on touch widths keeps the 44px floor (ADR-001);
                // desktop keeps the compact bar.
                className={`rounded-full border px-3 py-3.5 sm:py-1 text-xs transition-colors ${
                  f.id === "founder"
                    ? filter === "founder"
                      ? "border-gold bg-gold/15 text-gold"
                      : "border-gold/50 text-gold hover:bg-gold/10"
                    : filter === f.id
                      ? "border-gold/50 bg-gold/10 text-foreground"
                      : "border-border/50 text-muted-foreground hover:border-gold/30"
                }`}
                data-testid={`activity-filter-${f.id}`}
              >
                {f.id === "founder" ? "✦ " : ""}
                {f.label}
                {c !== null ? <span className="ml-1 opacity-60">{c}</span> : null}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreChipsOpen((v) => !v)}
            className="rounded-full border border-border/50 px-3 py-3.5 sm:py-1 text-xs text-muted-foreground transition-colors hover:border-gold/30"
            data-testid="activity-filter-more"
            aria-expanded={moreChipsOpen}
          >
            {moreChipsOpen ? "Less ▴" : "More ▾"}
          </button>
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-7 px-2"
            disabled={loading || !addrs}
            onClick={() => {
              setScan(null);
              setServed(null);
              setServedMore([]);
              setFreshKeys(new Set());
              setServedTried(false);
              setVisibleCount(PAGE_SIZE);
              setReadNonce((n) => n + 1);
            }}
          >
            <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" /> Re-read
          </Button>
        </div>
      ) : null}

      {/* Z3 — THE FEED FIRST: newest → oldest, date-grouped, paged. */}
      {loading || scan === null ? (
        <p className="text-sm text-muted-foreground py-6">Reading the chain…</p>
      ) : visible.length === 0 ? (
        <Card className="bg-card/20 border-dashed border-border/60 p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            No events within the stated coverage. That is an honest read — not
            a claim about anything outside it.
          </p>
        </Card>
      ) : (
        <div className="space-y-2" data-testid="activity-feed-list">
          {visible.map((i, idx) => {
            const label = dateGroupLabel(i.dateUtc || "", todayUtc, yesterdayUtc);
            const prevLabel =
              idx > 0
                ? dateGroupLabel(visible[idx - 1]!.dateUtc || "", todayUtc, yesterdayUtc)
                : null;
            return (
              <div key={lineKey(i)}>
                {label !== prevLabel ? (
                  <p className="mt-4 mb-2 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground first:mt-0">
                    {label}
                  </p>
                ) : null}
                {renderLine(i)}
              </div>
            );
          })}
        </div>
      )}
      {!loading && scan !== null && (items.length > visibleCount || serverHasOlder) ? (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            className="px-8"
            onClick={onLoadMore}
            disabled={loadingMore}
            data-testid="activity-load-more"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Showing {Math.min(visibleCount, items.length)} of{" "}
            {filter === "all" && pageInfo !== null
              ? Math.max(
                  items.length,
                  pageInfo.totalCount + CHRONICLE_REGISTER.length + DEPLOYMENT_REGISTRY.length,
                ).toLocaleString("en-US")
              : items.length.toLocaleString("en-US")}{" "}
            events — the full history stays one click at a time.
          </p>
        </div>
      ) : null}

      {/* Z4 — milestones AFTER the work (condensed; the wireframe's order). */}
      {served?.milestones ? (
        <div className="mt-8">
          <MilestonesPanel
            milestones={served.milestones}
            explorerBase={explorerBase}
            condensed
            fomoLine={fomoLine}
          />
        </div>
      ) : null}

      {/* Z5 — the whole methodology, one click away (WORK-FIRST: reference
          material lives in a collapsed expander at the bottom — the honesty
          is intact, it is no longer the front hall). */}
      <details className="mt-6" data-testid="activity-methodology">
        <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
          How this feed works — coverage, live window, verification
        </summary>
        <Card className="bg-card/30 border-border/50 p-3.5 mt-3">
          <p className="text-xs text-muted-foreground leading-relaxed" data-testid="activity-health-banner">
            {servedComplete && served ? (
              <>
                <span className="text-foreground font-medium">
                  Complete history, served by the event indexer.
                </span>{" "}
                {`Seats, burns (Proof of Burn), referral lifecycle, liquidity, archive mints, treasury movements, milestone crossings, era turns and footprint rises — the full indexed record from each stream's first block, as of block ${served.headBlock ? served.headBlock.toLocaleString("en-US") : "…"}${served.burnsAsOfBlock !== null && served.headBlock !== null && served.burnsAsOfBlock < served.headBlock - 1_000 ? ` · the protocol lanes are catching up — complete up to block ${served.burnsAsOfBlock.toLocaleString("en-US")}` : ""}${served.itemsTotal > loadedServedCount ? ` (${loadedServedCount} of ${served.itemsTotal.toLocaleString("en-US")} lines loaded — Load more continues the record)` : ""}${served.linesSkipped > 0 ? ` · ${served.linesSkipped} line(s) failed validation and are NOT shown` : ""}. `}
              </>
            ) : servedTried ? (
              <>
                <span className="text-foreground font-medium">
                  The served history is unavailable right now
                </span>
                {" — the recent window stands alone. "}
              </>
            ) : null}
            <span className="text-foreground font-medium">
              {servedComplete
                ? "The live window: a recent chain read, refreshing between indexer cycles."
                : "A recent window, read live from the chain."}
            </span>{" "}
            {scan
              ? `Blocks ${scan.fromBlock.toLocaleString("en-US")} → ${scan.toBlock.toLocaleString("en-US")} (~24h)${scan.chunksFailed > 0 ? ` · ${scan.chunksFailed} range(s) could not be read and are NOT covered` : ""}.`
              : `The last ~${Math.round(DEFAULT_WINDOW_BLOCKS / 1800)} hours of blocks.`}{" "}
            The feed refreshes itself as the indexer advances — a new line
            slides in at the top. What appears here happened and is
            verifiable; what does not appear is simply outside the stated
            coverage — never evidence of absence. What the indexer adds next:
            per-seat feeds, notifications generated from these events, and
            the candidate pipeline that feeds the Chronicle.
          </p>
        </Card>
      </details>
    </div>
  );
}
