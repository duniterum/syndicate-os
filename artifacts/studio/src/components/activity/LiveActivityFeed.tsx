// components/activity/LiveActivityFeed.tsx — the feed chrome (ARC ACT-1).
// ---------------------------------------------------------------------------
// Origin harvest (LiveActivityFeed/ActivityHealthBanner/ActivityFilterChips/
// ActivitySummaryRow — ADAPTED to our tokens and the HONESTY LAW): the banner
// states the RECENT WINDOW truth and that the complete indexed history
// arrives with the event indexer — never a completeness claim, never proof
// of absence. Every rendered line is receipt-backed: sentence + type badge +
// memory flag + the tx proof link (the chain publishes it; the client reads
// like an explorer — Visibility Law).

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

const KIND_LABEL: Record<ActivityKind, string> = {
  seat: "Seat",
  burn: "Burn",
  "source-created": "Referral",
  "source-terms": "Referral",
  "source-status": "Referral",
};

function addressFromUrl(url: string): string | null {
  return url.match(/\/(?:token|address)\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null;
}

type FilterId = "all" | "seat" | "burn" | "referral";
const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "seat", label: "Seats" },
  { id: "burn", label: "Burns" },
  { id: "referral", label: "Referral events" },
];

function matches(item: ActivityItem, f: FilterId): boolean {
  if (f === "all") return true;
  if (f === "referral") return item.kind.startsWith("source-");
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
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterId>("all");

  useEffect(() => {
    if (!addrs || loading || scan) return;
    setLoading(true);
    void scanRecentActivity(addrs).then((s) => {
      setScan(s);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addrs]);

  const items = (scan?.items ?? []).filter(
    (i) => (onlyKinds ? onlyKinds.includes(i.kind) : true) && matches(i, filter),
  );

  return (
    <div>
      {/* THE HEALTH BANNER — the recent-window honesty, always visible. */}
      <Card className="bg-card/30 border-border/50 p-3.5 mb-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed" data-testid="activity-health-banner">
          <span className="text-foreground font-medium">A recent window, read live from the chain.</span>{" "}
          {scan
            ? `Blocks ${scan.fromBlock.toLocaleString("en-US")} → ${scan.toBlock.toLocaleString("en-US")} (~24h)${scan.chunksFailed > 0 ? ` · ${scan.chunksFailed} range(s) could not be read and are NOT covered` : ""}.`
            : `The last ~${Math.round(DEFAULT_WINDOW_BLOCKS / 1800)} hours of blocks.`}{" "}
          What appears here happened and is verifiable; what does not appear is
          simply outside this window — never evidence of absence. The complete
          indexed history arrives with the event indexer.
        </p>
      </Card>

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
            }}
          >
            <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" /> Re-read
          </Button>
        </div>
      ) : null}

      {/* Summary row — counts WITHIN the covered window only. */}
      {scan && !onlyKinds ? (
        <p className="text-[11px] text-muted-foreground mb-3" data-testid="activity-summary">
          In this window: {scan.items.filter((i) => i.kind === "seat").length} seat(s) ·{" "}
          {scan.items.filter((i) => i.kind === "burn").length} burn(s) ·{" "}
          {scan.items.filter((i) => i.kind.startsWith("source-")).length} referral event(s).
        </p>
      ) : null}

      {loading || scan === null ? (
        <p className="text-sm text-muted-foreground py-6">Reading the chain…</p>
      ) : items.length === 0 ? (
        <Card className="bg-card/20 border-dashed border-border/60 p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            No {onlyKinds ? "matching events" : "events"} in this window. That is
            an honest read of a quiet stretch — not a claim about anything
            outside it.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((i) => (
            <Card key={`${i.txHash}-${i.blockNumber}-${i.kind}`} className="bg-card/40 border-border/50 p-3.5">
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
