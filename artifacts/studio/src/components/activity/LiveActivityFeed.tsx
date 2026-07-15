// components/activity/LiveActivityFeed.tsx — the feed chrome (ARC ACT-1;
// ARC M5: the served seat history; ARC M4-c: burns + referral lifecycle
// complete — the whole heartbeat is served).
// ---------------------------------------------------------------------------
// Origin harvest (LiveActivityFeed/ActivityHealthBanner/ActivityFilterChips/
// ActivitySummaryRow — ADAPTED to our tokens and the HONESTY LAW). TWO honest
// sources compose here, each labeled with its own coverage:
//   • SERVED HISTORIES — /api/backbone/feed: the COMPLETE indexed records for
//     seats (M5), burns (Proof of Burn, M4-c) and referral lifecycle (M4-c),
//     identity-blind (a burn sender is a Founder/Community LABEL, never an
//     address). Every sentence is the CANON_PROTOCOL_LANGUAGE §8 lexicon line.
//   • RECENT WINDOW — the client chain read (~24h): the freshness layer
//     between backbone cycles; seat lines carry their public seat numbers.
// Overlap dedupes by (kind · transaction anchor · log index) — the window's
// richer sentence wins. If a served lane is unavailable, the window stands
// alone for it and the banner SAYS so — never a silent gap, never proof of
// absence.

import { useEffect, useMemo, useState } from "react";
import { Anchor, ExternalLink, RefreshCw } from "lucide-react";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
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
} from "@/lib/backboneFeedClient";
import { MilestonesPanel } from "@/components/activity/MilestonesPanel";

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
};

function addressFromUrl(url: string): string | null {
  return url.match(/\/(?:token|address)\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}

type FilterId =
  | "all"
  | "seat"
  | "burn"
  | "referral"
  | "liquidity"
  | "archive"
  | "treasury-move"
  | "milestone";
const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "seat", label: "Seats" },
  { id: "burn", label: "Burns" },
  { id: "referral", label: "Referral events" },
  { id: "liquidity", label: "Liquidity" },
  { id: "archive", label: "Archive" },
  { id: "treasury-move", label: "Treasury" },
  { id: "milestone", label: "Milestones" },
];

function matches(item: ActivityItem, f: FilterId): boolean {
  if (f === "all") return true;
  if (f === "referral") return item.kind.startsWith("source-");
  if (f === "liquidity") return item.kind === "lp-add" || item.kind === "lp-remove";
  if (f === "archive") return item.kind === "archive-mint" || item.kind === "archive-pause";
  return item.kind === f;
}

export function LiveActivityFeed({
  onlyKinds,
  showFilters = true,
}: {
  /** Restrict the feed (the Fire Ledger passes ["burn"]). */
  onlyKinds?: readonly ActivityKind[];
  showFilters?: boolean;
}) {
  const { data } = useGetProtocolVerifyLinks();
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
  const [filter, setFilter] = useState<FilterId>("all");
  // The Re-read counter: bumping it re-arms the fetch effect below (state
  // resets alone never re-fire an [addrs]-keyed effect — the button stalled
  // on "Reading the chain…" forever; found at the H2-⑬ rig verification).
  const [readNonce, setReadNonce] = useState(0);

  useEffect(() => {
    if (!addrs || loading || scan) return;
    setLoading(true);
    // Both sources in parallel: the served history (fail-soft to null) and
    // the client recent window. Each renders only what it truly covers.
    void Promise.all([scanRecentActivity(addrs), fetchServedFeed()]).then(
      ([s, f]) => {
        setScan(s);
        setServed(f);
        setServedTried(true);
        setLoading(false);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addrs, readNonce]);

  // M5/M4-c merge: served lines of EVERY kind join the window's items;
  // overlap dedupes by (kind · anchor · log index) — the window's richer
  // sentence (a seat line carries its public seat number) wins.
  const merged = useMemo<ActivityItem[]>(() => {
    const windowItems = scan?.items ?? [];
    const seen = new Set(
      windowItems.map((i) => `${i.kind}:${i.txHash.toLowerCase()}:${i.logIndex}`),
    );
    const deepLines: ActivityItem[] = (served?.items ?? [])
      .filter(
        (l) =>
          !seen.has(
            `${SERVED_KIND_TO_WINDOW_KIND[l.kind]}:${l.transactionHash.toLowerCase()}:${l.logIndex}`,
          ),
      )
      .map((l) => {
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
        };
      });
    return [...windowItems, ...deepLines].sort((a, b) =>
      a.blockNumber !== b.blockNumber
        ? b.blockNumber - a.blockNumber
        : b.logIndex - a.logIndex,
    );
  }, [scan, served]);

  const items = merged.filter(
    (i) => (onlyKinds ? onlyKinds.includes(i.kind) : true) && matches(i, filter),
  );

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
  ];
  const servedComplete =
    served !== null && served.items.length >= 0 && kindsInScope.every(laneFor);

  return (
    <div>
      {/* THE HEALTH BANNER — every source labeled with its own coverage. */}
      <Card className="bg-card/30 border-border/50 p-3.5 mb-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed" data-testid="activity-health-banner">
          {servedComplete && served ? (
            <>
              <span className="text-foreground font-medium">
                Complete history, served by the event indexer.
              </span>{" "}
              {`${onlyKinds ? "" : "Seats, burns (Proof of Burn), referral lifecycle, liquidity, archive mints, treasury movements and milestone crossings — "}the full indexed record from each stream's first block, as of block ${served.headBlock ? served.headBlock.toLocaleString("en-US") : "…"}${served.burnsAsOfBlock !== null && served.headBlock !== null && served.burnsAsOfBlock < served.headBlock - 1_000 ? ` · the protocol lanes are catching up — complete up to block ${served.burnsAsOfBlock.toLocaleString("en-US")}` : ""}${served.itemsTotal > served.served ? ` (newest ${served.served} of ${served.itemsTotal.toLocaleString("en-US")} lines shown)` : ""}${served.linesSkipped > 0 ? ` · ${served.linesSkipped} line(s) failed validation and are NOT shown` : ""}. `}
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
          What appears here happened and is verifiable; what does not appear is
          simply outside the stated coverage — never evidence of absence.
        </p>
      </Card>

      {/* H2-⑬ — the Milestones panel: the protocol's canonical account
          (full-feed surfaces only; a restricted feed like the Fire Ledger
          stays a single-purpose record). */}
      {!onlyKinds && served?.milestones ? (
        <MilestonesPanel milestones={served.milestones} explorerBase={explorerBase} />
      ) : null}

      {showFilters ? (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                filter === f.id
                  ? "border-gold/50 bg-gold/10 text-foreground"
                  : "border-border/50 text-muted-foreground hover:border-gold/30"
              }`}
              data-testid={`activity-filter-${f.id}`}
            >
              {f.label}
            </button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-7 px-2"
            disabled={loading || !addrs}
            onClick={() => {
              setScan(null);
              setServed(null);
              setServedTried(false);
              setReadNonce((n) => n + 1);
            }}
          >
            <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" /> Re-read
          </Button>
        </div>
      ) : null}

      {/* Summary row — counts WITHIN each source's stated coverage only. */}
      {scan && !onlyKinds ? (
        <p className="text-[11px] text-muted-foreground mb-3" data-testid="activity-summary">
          {servedComplete
            ? `Across the indexed history: ${merged.filter((i) => i.kind === "seat").length} seat(s) · ${merged.filter((i) => i.kind === "burn").length} burn(s) · ${merged.filter((i) => i.kind.startsWith("source-")).length} referral event(s).`
            : `In this window: ${scan.items.filter((i) => i.kind === "seat").length} seat(s) · ${scan.items.filter((i) => i.kind === "burn").length} burn(s) · ${scan.items.filter((i) => i.kind.startsWith("source-")).length} referral event(s).`}
        </p>
      ) : null}

      {loading || scan === null ? (
        <p className="text-sm text-muted-foreground py-6">Reading the chain…</p>
      ) : items.length === 0 ? (
        <Card className="bg-card/20 border-dashed border-border/60 p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            No {onlyKinds ? "matching events" : "events"} within the stated
            coverage. That is an honest read — not a claim about anything
            outside it.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((i) => (
            <Card key={`${i.txHash}-${i.logIndex}-${i.kind}`} className="bg-card/40 border-border/50 p-3.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <StatusPill tone={i.kind === "burn" ? "caution" : "proof"} size="xs">
                  {KIND_LABEL[i.kind]}
                </StatusPill>
                <p className="text-sm text-foreground/90 flex-1 min-w-48">{i.sentence}</p>
                {i.memory ? (
                  <span
                    className="inline-flex items-center gap-1 text-[10px] text-gold"
                    title="Anchored to protocol memory — a Chronicle-grade event."
                  >
                    <Anchor className="h-3 w-3" aria-hidden="true" /> memory
                  </span>
                ) : null}
                <span className="font-mono text-[10px] text-muted-foreground">
                  {i.dateUtc || "—"} · block {i.blockNumber.toLocaleString("en-US")}
                </span>
                {explorerBase ? (
                  <a
                    href={`${explorerBase}/tx/${i.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-proof/80 hover:text-proof"
                  >
                    verify <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
