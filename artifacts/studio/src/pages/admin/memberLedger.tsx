// pages/admin/memberLedger.tsx
//
// M-INT-1 — THE MEMBER LEDGER (founder-acted 2026-07-16; built 2026-07-18).
// The operator-side per-seat dossier list rendered from the founder-only
// GET /api/operator/member-ledger: a projection of ALREADY-INDEXED data only
// (continuity spine · capital axis · own purchases · R5 introductions).
// Wallets arrive PRE-MASKED from the server (never a full address — ADR-003);
// segment chips render the server's own definitions VERBATIM (the console
// shows exactly what the math does — no unexplained judgment); every fetch is
// audit-logged server-side. Honest states: loading / ok / denied / unavailable
// — never a fake fallback, never a sample row.
//
// Admin-graph discipline: imported ONLY by pages/admin/sections.tsx
// (guard-operator-gate §5b pins the chain).

import { useEffect, useState } from "react";
import { BookUser, TrendingUp, Users2, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fetchMemberLedger,
  type LedgerPayload,
  type LedgerRow,
} from "@/lib/operatorClient";

type State =
  | { kind: "loading" }
  | { kind: "ok"; payload: LedgerPayload }
  | { kind: "denied" }
  | { kind: "unavailable" };

/** Raw 6-dec USDC base units → exact human dollars (no rounding invented). */
function usd(raw: string | null): string {
  if (raw === null) return "—";
  const neg = raw.startsWith("-");
  const digits = (neg ? raw.slice(1) : raw).padStart(7, "0");
  const whole = digits.slice(0, -6).replace(/^0+(?=\d)/, "");
  const frac = digits.slice(-6, -4); // cents precision for display
  return `${neg ? "-" : ""}$${whole}.${frac}`;
}

const SEGMENT_TONE: Record<LedgerRow["segment"], string> = {
  ACTIVE: "border-primary/40 bg-primary/10 text-primary",
  SETTLED: "border-border text-muted-foreground",
  DORMANT: "border-warning/40 bg-warning/10 text-warning",
};

function SegmentChip({ segment }: { segment: LedgerRow["segment"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${SEGMENT_TONE[segment]}`}
    >
      {segment}
    </span>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground leading-tight mt-0.5">{label}</div>
    </div>
  );
}

export function MemberLedgerPanel() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let active = true;
    void fetchMemberLedger().then((r) => {
      if (!active) return;
      if (r.status === "ok") setState({ kind: "ok", payload: r.payload });
      else setState({ kind: r.status });
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <BookUser className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Member ledger</h2>
        <span className="font-mono text-[10px] uppercase tracking-wider text-primary">
          Live · indexed record · founder-only
        </span>
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-5 leading-relaxed">
        Every seat&apos;s dossier from the already-indexed record: entry, capital
        standing, own purchases, referral standing. Wallets are masked
        server-side; this read is audit-logged.
      </p>

      {state.kind === "loading" && (
        <p className="text-sm text-muted-foreground">Reading the ledger…</p>
      )}
      {state.kind === "denied" && (
        <p className="text-sm text-muted-foreground">
          The ledger answers only a founder-root session. Sign in with the
          founder wallet to read it.
        </p>
      )}
      {state.kind === "unavailable" && (
        <p className="text-sm text-muted-foreground">
          The ledger read is unavailable right now (fail-closed) — nothing is
          guessed. Try again after the next backbone cycle.
        </p>
      )}

      {state.kind === "ok" && (
        <>
          {/* Segment summary */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-5">
            <StatCard label="Seats" value={String(state.payload.totals.seats)} />
            <StatCard label="Active" value={String(state.payload.totals.active)} />
            <StatCard label="Settled" value={String(state.payload.totals.settled)} />
            <StatCard label="Dormant" value={String(state.payload.totals.dormant)} />
            <StatCard label="Referral sources" value={String(state.payload.totals.sourceOwners)} />
            <StatCard label="Promotions due" value={String(state.payload.totals.promotionsDue)} />
          </div>

          {/* The ledger table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seat</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Rung</TableHead>
                  <TableHead className="text-right">Footprint</TableHead>
                  <TableHead className="text-right">Purchases</TableHead>
                  <TableHead>Last purchase</TableHead>
                  <TableHead>Referral</TableHead>
                  <TableHead>Segment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.payload.rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">#{r.seat}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.walletShort}
                      <span className="ml-1.5 text-[9px] uppercase tracking-wider text-muted-foreground/70">
                        {r.authority === "PART_B_FREEZE_ROOT" ? "genesis" : "v3"}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.entryDay ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">{r.rung ?? "—"}</TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {usd(r.footprintUsdcRaw)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {r.purchaseCount > 0 ? `${r.purchaseCount} · ${usd(r.purchasesTotalRaw)}` : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {r.lastPurchaseDay ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs">
                      {r.referral === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span>
                          {r.referral.introduced} intro · {r.referral.durable} durable ·{" "}
                          {usd(r.referral.commissionPaidRaw)} paid
                          {r.referral.promotionDue && (
                            <span className="ml-1.5 inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-gold">
                              <Sparkles className="h-2.5 w-2.5" /> promotion due
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <SegmentChip segment={r.segment} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Internal rankings — recognition/retention-weighted, operator-only. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users2 className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Durable ambassadors</h3>
              </div>
              {state.payload.rows.filter((r) => (r.referral?.durable ?? 0) > 0).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No seat holds a durable introduction yet.
                </p>
              ) : (
                <ol className="space-y-1 text-xs text-muted-foreground">
                  {[...state.payload.rows]
                    .filter((r) => (r.referral?.durable ?? 0) > 0)
                    .sort((a, b) => (b.referral?.durable ?? 0) - (a.referral?.durable ?? 0))
                    .slice(0, 5)
                    .map((r) => (
                      <li key={r.id} className="flex justify-between rounded-md border border-border/50 px-2.5 py-1.5">
                        <span className="font-mono">#{r.seat} · {r.walletShort}</span>
                        <span>{r.referral?.durable} durable</span>
                      </li>
                    ))}
                </ol>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-foreground">Footprints</h3>
              </div>
              <ol className="space-y-1 text-xs text-muted-foreground">
                {[...state.payload.rows]
                  .filter((r) => r.footprintUsdcRaw !== null)
                  .sort((a, b) => Number(BigInt(b.footprintUsdcRaw ?? "0") - BigInt(a.footprintUsdcRaw ?? "0")))
                  .slice(0, 5)
                  .map((r) => (
                    <li key={r.id} className="flex justify-between rounded-md border border-border/50 px-2.5 py-1.5">
                      <span className="font-mono">#{r.seat} · {r.rung ?? "—"}</span>
                      <span className="font-mono">{usd(r.footprintUsdcRaw)}</span>
                    </li>
                  ))}
              </ol>
            </div>
          </div>

          {/* The definitions — VERBATIM from the server (the math on screen). */}
          <div className="mt-6 rounded-md border border-border/50 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">
              Segment definitions (chain-anchored
              {state.payload.recencyAnchorDay !== null &&
                ` · reference day ${state.payload.recencyAnchorDay}`}
              )
            </div>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {Object.entries(state.payload.segmentDefinitions).map(([k, v]) => (
                <li key={k}>
                  <span className="font-mono uppercase">{k}</span> — {v}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground/80 leading-relaxed">
              {state.payload.honesty}
            </p>
          </div>
        </>
      )}
    </Card>
  );
}

export default MemberLedgerPanel;
