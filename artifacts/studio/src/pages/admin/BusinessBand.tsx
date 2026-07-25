// pages/admin/BusinessBand.tsx — the Dashboard's LEAD section (founder ruling
// 2026-07-25: "un dashboard OUVRE sur ses chiffres, il ne les cache pas").
// The business figures lead the page — never a collapsible, never a stub.
//
// Every figure is a LIVE read already served today: the Protocol Reality Spine
// (useHeroReality) for the money + mint figures, the shared cached console
// signals for the referral/seat figures, and GET /api/season for builders
// earning. Fail-closed to "—" per field; every money tile is a DOOR to its
// ledger and states its verify anchor (the A1 honesty contract). Never a
// sample — a null read renders "—", nothing is invented.

import { useEffect, useState } from "react";
import {
  useGetProtocolVerifyLinks,
} from "@workspace/api-client-react";
import { Coins, Flame, Landmark, Users, Gem, ArrowUpRight, GitBranch, Trophy } from "lucide-react";
import { StatCard } from "@/components/stat-card/StatCard";
import { useHeroReality } from "@/components/hero/useHeroReality";
import {
  fetchConsoleSignals,
  type ConsoleSignals,
} from "@/lib/operatorClient";
import { requestSourcesTab } from "@/lib/adminPrefill";
import type { AdminSectionId } from "@/pages/admin/AdminHome";

/** USDC display string → "$" money node, or "—" when the read is unavailable. */
function money(v: string | null): string {
  return v === null ? "—" : `$${v}`;
}
function count(v: number | null | undefined): string {
  return v === null || v === undefined ? "—" : v.toLocaleString("en-US");
}

export function BusinessBand({
  onNavigate,
}: {
  onNavigate: (section: AdminSectionId) => void;
}) {
  const r = useHeroReality();
  const [signals, setSignals] = useState<ConsoleSignals | null>(null);
  const [buildersEarning, setBuildersEarning] = useState<number | null>(null);
  const { data: verifyData } = useGetProtocolVerifyLinks();
  const saleVerifyUrl =
    verifyData?.links?.find((l) => l.id === "membershipSaleV3")?.url ?? null;

  useEffect(() => {
    let active = true;
    void fetchConsoleSignals().then((s) => active && setSignals(s));
    void fetch("/api/season")
      .then((res) => (res.ok ? res.json() : null))
      .then((d) => {
        if (!active || !d) return;
        const n = d.playersEarning;
        setBuildersEarning(typeof n === "number" && n >= 0 ? n : null);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Denied (not founder_root) → the referral figures are not this operator's to
  // see; the money figures are public spine reads, so the band still leads with
  // them. A denied ledger simply renders "—" on the seat/referral tiles.
  const totals =
    signals !== null && signals.ledger.status === "ok"
      ? signals.ledger.payload.totals
      : null;
  const asOfBlock =
    signals !== null && signals.ledger.status === "ok"
      ? signals.ledger.payload.introductionsAsOfBlock
      : null;

  const door = (section: AdminSectionId, label: string, tab?: string) => (
    <button
      type="button"
      onClick={() => {
        if (tab !== undefined) requestSourcesTab(tab);
        onNavigate(section);
      }}
      className="text-muted-foreground hover:text-foreground underline underline-offset-2"
    >
      {label}
    </button>
  );

  const verify =
    saleVerifyUrl !== null ? (
      <a
        href={saleVerifyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-proof/80 hover:text-proof underline underline-offset-2"
      >
        verify ↗
      </a>
    ) : null;

  // Total revenue = the true gross (membership sales + NFT), or the membership
  // aggregate alone when the NFT reads aren't all live (fail-closed, labelled).
  const revenue = r.grossTotalUsdc ?? r.aggregateInflowUsdc;

  return (
    <section aria-label="The business" data-testid="dashboard-business">
      <div className="mb-3 flex items-baseline gap-3 flex-wrap">
        <h2 className="text-lg font-semibold text-foreground">The business</h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-success">
          <span aria-hidden>●</span> Live · on-chain
        </span>
        {asOfBlock !== null ? (
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            as of block {asOfBlock.toLocaleString("en-US")}
          </span>
        ) : null}
      </div>

      {/* Money */}
      <p className="syn-label mb-2 text-muted-foreground">Money</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total revenue"
          tone="identity"
          icon={<Coins className="h-4 w-4" />}
          meta={
            <span>
              {verify}
              {verify ? " · " : ""}membership{r.grossTotalUsdc !== null ? " + NFT" : ""}
            </span>
          }
        >
          {money(revenue)}
        </StatCard>
        <StatCard label="Paid to referrers" meta={door("sources-referrals", "→ Sources")}>
          {money(r.paidToReferrersUsdc)}
        </StatCard>
        <StatCard label="SYN burned" icon={<Flame className="h-4 w-4" />} meta={verify}>
          {r.burnedSyn === null ? "—" : r.burnedSyn}
        </StatCard>
        <StatCard
          label="Reserve balance"
          icon={<Landmark className="h-4 w-4" />}
          meta={
            <span>
              ops {money(r.opsUsdc)} · 70/20/10 routed
            </span>
          }
        >
          {money(r.vaultUsdc)}
        </StatCard>
      </div>

      {/* Growth & activity */}
      <p className="syn-label mb-2 mt-5 text-muted-foreground">Growth &amp; activity</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <StatCard label="Members seated" icon={<Users className="h-4 w-4" />} meta={door("members", "→ Members")}>
          {count(totals?.seats ?? null)}
        </StatCard>
        <StatCard
          label="Artifacts minted"
          icon={<Gem className="h-4 w-4" />}
          meta={<span>revenue {money(r.nftRevenueUsdc)}</span>}
        >
          {r.nftMintedTotal ?? "—"}
        </StatCard>
        <StatCard label="Source owners" icon={<GitBranch className="h-4 w-4" />} meta={door("sources-referrals", "→ Performance", "performance")}>
          {count(totals?.sourceOwners ?? null)}
        </StatCard>
        <StatCard label="Promotions due" icon={<ArrowUpRight className="h-4 w-4" />} meta={door("sources-referrals", "→ Signing", "signing")}>
          {count(totals?.promotionsDue ?? null)}
        </StatCard>
        <StatCard label="Builders earning" icon={<Trophy className="h-4 w-4" />} meta={door("seasons", "→ Seasons")}>
          {count(buildersEarning)}
        </StatCard>
      </div>

      {signals !== null && totals === null ? (
        <p className="mt-3 text-xs text-muted-foreground">
          The referral/seat reads didn&apos;t answer just now — those tiles show
          &ldquo;—&rdquo;; nothing is assumed, nothing is invented.
        </p>
      ) : null}
    </section>
  );
}
