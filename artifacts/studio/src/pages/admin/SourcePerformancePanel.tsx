// pages/admin/SourcePerformancePanel.tsx — K3.c (mockup Face 5, founder-
// approved "GO and GO-Live"): the per-source performance table + the
// screen-exact CSV.
//
// ADMIN SEES, PUBLIC NEVER. The Face 5 laws, engraved here:
//   · plain figures, no trend charts (durable CAN descend — the SYN-held
//     test re-runs every cycle; never a curve that only climbs);
//   · the CSV is EXACTLY the screen — same rows (the active filter), same
//     columns, human-word headers; a screen/file mismatch is a truth bug;
//   · asOfBlock stated — the read-model's own clock, never assumed;
//   · a status the live read didn't confirm renders as its own honest
//     state, never a guess; zero gain glyphs, facts only.

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usdExact } from "@/components/referral/referralStanding";
import {
  fetchSourcePerformance,
  type SourcePerformanceResult,
  type SourcePerformanceRow,
} from "@/lib/operatorClient";

type FilterId = "all" | "active" | "paused" | "revoked";
const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "revoked", label: "Revoked" },
];

/** The on-screen column heads — the CSV reuses these EXACT words. */
const COLUMNS = [
  "Source",
  "Owner",
  "Status",
  "Introduced",
  "Durable",
  "Purchases",
  "Commission paid",
  "In escrow",
  "Rate",
  "Promotion",
  "Last activity",
] as const;

function shortId(id: string): string {
  return `${id.slice(0, 10)}…${id.slice(-6)}`;
}
function rateLabel(bps: number | null): string {
  return bps === null ? "—" : `${(bps / 100).toLocaleString("en-US")}%`;
}
function lastActivityLabel(block: number | null): string {
  return block === null ? "no purchase yet" : `block ${block.toLocaleString("en-US")}`;
}
function statusLabel(s: string | null): string {
  if (s === "ACTIVE") return "Active";
  if (s === "PAUSED") return "Paused";
  if (s === "REVOKED") return "Revoked";
  return "read didn't run";
}

/** One row → its CSV cells, in COLUMNS order (screen-exact by construction). */
function csvCells(r: SourcePerformanceRow): string[] {
  return [
    shortId(r.sourceIdHex),
    r.ownerShort,
    statusLabel(r.status),
    String(r.introducedMembers),
    String(r.durableIntroductions),
    String(r.attributedPurchases),
    usdExact(r.commissionPaidRaw),
    usdExact(r.escrowOwedRaw),
    rateLabel(r.currentBps),
    r.promotionDue ? "due" : "—",
    lastActivityLabel(r.lastBlock),
  ];
}

function toCsv(rows: SourcePerformanceRow[]): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v);
  const lines = [
    COLUMNS.map(esc).join(","),
    ...rows.map((r) => csvCells(r).map(esc).join(",")),
  ];
  return lines.join("\n");
}

export function SourcePerformancePanel() {
  const [state, setState] = useState<{ status: "loading" } | SourcePerformanceResult>({
    status: "loading",
  });
  const [filter, setFilter] = useState<FilterId>("all");

  useEffect(() => {
    let active = true;
    void fetchSourcePerformance().then((r) => {
      if (active) setState(r);
    });
    return () => {
      active = false;
    };
  }, []);

  const rows =
    state.status === "ok"
      ? state.rows.filter((r) =>
          filter === "all" ? true : r.status === filter.toUpperCase(),
        )
      : [];

  function exportCsv() {
    // WYSIWYG: exactly the filtered rows on screen, the same column words —
    // downloaded on click, no options (the approved Face 5 law).
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const day = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `sources-${day}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="p-6 scroll-mt-24" id="source-performance">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <h2 className="text-base font-semibold text-foreground">Per-source performance</h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
          Live · founder-only
        </span>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto"
          disabled={state.status !== "ok" || rows.length === 0}
          onClick={exportCsv}
          data-testid="button-export-csv"
        >
          Export CSV
        </Button>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-3 leading-relaxed">
        Every source the machine knows — figures from the introduction
        read-model, status read live from the registry. The CSV is exactly
        this screen. &ldquo;Durable&rdquo; can go down: a member who sells
        their SYN leaves the count — facts, never a curve that only climbs.
      </p>

      {state.status === "loading" ? (
        <p className="text-sm text-muted-foreground">Reading the performance rows…</p>
      ) : state.status === "denied" ? (
        <p className="text-sm text-muted-foreground">
          Sign in as the founder to read per-source performance.
        </p>
      ) : state.status === "unavailable" ? (
        <p className="text-sm text-muted-foreground">
          The performance read is unavailable right now — nothing is assumed.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-3 py-0.5 text-xs transition-colors ${
                  filter === f.id
                    ? "border-gold/50 text-gold bg-gold/10"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`filter-${f.id}`}
              >
                {f.label}
              </button>
            ))}
            {!state.statusReadOk ? (
              <span className="text-xs text-muted-foreground self-center">
                status reads didn&apos;t run — every row says so honestly
              </span>
            ) : null}
          </div>
          {state.indexWarming ? (
            <p className="text-sm text-muted-foreground mb-2" data-testid="text-performance-warming">
              The source index is still warming after a restart — purchase-backed
              rows return shortly; nothing is assumed.
            </p>
          ) : null}
          {state.totalKnown > state.rows.length ? (
            <p className="text-xs text-muted-foreground mb-2">
              Showing the {state.rows.length} most recently active of{" "}
              {state.totalKnown} known sources — the CSV carries exactly the
              rows on screen.
            </p>
          ) : null}
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground" data-testid="text-performance-empty">
              No sources under this filter.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[860px]">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    {COLUMNS.map((c, i) => (
                      <th
                        key={c}
                        className={`font-normal pb-2 ${i >= 3 && i <= 8 ? "text-right" : ""}`}
                      >
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.sourceIdHex} className="border-t border-border/40">
                      <td className="py-2 font-mono text-xs text-foreground/80">
                        {shortId(r.sourceIdHex)}
                      </td>
                      <td className="py-2 font-mono text-xs text-foreground/80">{r.ownerShort}</td>
                      <td className="py-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-normal ${
                            r.status === "ACTIVE"
                              ? "text-live border-live/40"
                              : r.status === null
                                ? "text-muted-foreground"
                                : ""
                          }`}
                        >
                          {statusLabel(r.status)}
                        </Badge>
                      </td>
                      <td className="py-2 text-right tabular-nums">{r.introducedMembers}</td>
                      <td className="py-2 text-right tabular-nums">{r.durableIntroductions}</td>
                      <td className="py-2 text-right tabular-nums">{r.attributedPurchases}</td>
                      <td className="py-2 text-right tabular-nums">{usdExact(r.commissionPaidRaw)}</td>
                      <td className="py-2 text-right tabular-nums">{usdExact(r.escrowOwedRaw)}</td>
                      <td className="py-2 text-right tabular-nums">{rateLabel(r.currentBps)}</td>
                      <td className="py-2">{r.promotionDue ? "due" : "—"}</td>
                      <td className="py-2 text-muted-foreground">{lastActivityLabel(r.lastBlock)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            As of block {state.asOfBlock.toLocaleString("en-US")} — the
            read-model&apos;s own clock, stated, never assumed.
          </p>
        </>
      )}
    </Card>
  );
}
