// components/referral/AdminReferralPanel.tsx
//
// Operator view of the referral/source program for the Admin Console.
// Read-only and PAUSED: every KPI, ranking, flag, and chart below is SAMPLE
// (illustrative shape, never a live read) and carries a SampleTag. At
// activation these are replaced by verified read-model data; no write control
// exists here. Rankings are retention- and quality-weighted — never a money
// leaderboard, never a downline.

import { Megaphone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SampleTag } from "@/components/SampleTag";
import { ProtocolRealityPanel } from "@/components/ProtocolReality";
import { TruthLabel } from "@/components/TruthLabel";
import {
  referralProgram,
  adminKpisSample,
  adminTopSourcesSample,
  adminAbuseFlagsSample,
  adminConversionSample,
} from "@/config/referralProgram";

function MiniBars({ data }: { data: { label: string; value: number }[] }) {
  const w = 320;
  const h = 90;
  const gap = 8;
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="Sample source conversion over time">
      {data.map((d, i) => {
        const bh = Math.round((d.value / max) * (h - 18));
        const x = i * (bw + gap);
        return (
          <g key={d.label}>
            <rect x={x} y={h - bh - 14} width={bw} height={bh} rx={3} className="fill-primary/40" />
            <text x={x + bw / 2} y={h - 2} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function AdminReferralPanel() {
  return (
    <Card id="referral" className="p-6 scroll-mt-24">
      <div className="flex items-center gap-3 flex-wrap mb-1">
        <Megaphone className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Referral / Source program</h2>
        <TruthLabel variant="DESIGN_PREVIEW" />
        <SampleTag kind="simulated" />
      </div>
      <p className="text-sm text-muted-foreground max-w-3xl mb-5 leading-relaxed">
        {referralProgram.statusCopy.status} The source reads below are LIVE on-chain (read-only); the KPI figures are still sample until the referral read-model is wired. No write controls exist here.
      </p>

      {/* Live on-chain source reads — same truth-labelling as /status */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-sm font-medium text-foreground">Live source reads</h3>
          <span className="text-[10px] font-mono uppercase tracking-wider text-primary">On-chain</span>
        </div>
        <ProtocolRealityPanel groups={["source"]} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {adminKpisSample.map((k) => (
          <div key={k.label} className="rounded-lg border border-border p-3">
            <div className="text-lg font-semibold text-foreground">{k.sampleValue}</div>
            <div className="text-xs text-muted-foreground leading-tight mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top sources — retention-weighted, never a money leaderboard */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-foreground">Top durable sources</h3>
            <SampleTag kind="simulated" />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="font-normal pb-2">Source</th>
                <th className="font-normal pb-2 text-right">Introduced</th>
                <th className="font-normal pb-2 text-right">Durable</th>
                <th className="font-normal pb-2 text-right">Quality</th>
              </tr>
            </thead>
            <tbody>
              {adminTopSourcesSample.map((r) => (
                <tr key={r.source} className="border-t border-border/40">
                  <td className="py-2 font-mono text-xs text-foreground/80">{r.source}</td>
                  <td className="py-2 text-right text-muted-foreground">{r.introduced}</td>
                  <td className="py-2 text-right text-muted-foreground">{r.durable}</td>
                  <td className="py-2 text-right text-foreground/80">{r.quality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Abuse flags + conversion */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-medium text-foreground">Abuse review</h3>
            <SampleTag kind="simulated" />
          </div>
          <div className="space-y-2 mb-6">
            {adminAbuseFlagsSample.map((f) => (
              <div key={f.flag} className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2">
                <span className="text-sm text-muted-foreground">{f.flag}</span>
                <span className="text-sm font-medium text-foreground">{f.count}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-foreground">Source conversion</h3>
            <SampleTag kind="simulated" />
          </div>
          <MiniBars data={adminConversionSample} />
        </div>
      </div>
    </Card>
  );
}
