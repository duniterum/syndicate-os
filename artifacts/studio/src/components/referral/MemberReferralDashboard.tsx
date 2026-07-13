// components/referral/MemberReferralDashboard.tsx
//
// The member-facing referral dashboard: link + code, summary stats, an
// introductions-over-time trend, and recent-introduction history. The referral
// program is PAUSED, so every figure here is SAMPLE (illustrative shape, never
// a live read) and carries a SampleTag; the paused banner sits on top. At
// activation the sample arrays are swapped for verified read-model / receipt
// data and the SampleTags come off — the layout does not change.

import { useEffect, useState } from "react";
import { ladderProgress } from "@/config/connectorLadder";
import { Copy, Check, Link2, ShieldCheck, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SampleTag } from "@/components/SampleTag";
import { StatCard } from "@/components/stat-card/StatCard";
import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";
import { DataTable, type Column } from "@/components/data-table/DataTable";
import { ShareCard } from "@/components/referral/ShareCard";
import { ShareMenu } from "@/components/referral/ShareMenu";
import { QrCodeBlock } from "@/components/referral/QrCodeBlock";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import {
  referralProgram,
  sampleReferralLink,
  sampleReferralCode,
  memberStatsSample,
  memberHistorySample,
  memberTrendSample,
  type ReferralHistoryRow,
} from "@/config/referralProgram";

// Referral status → tokenized StatusPill tone. Paid is settled (proof/cyan),
// Pending is caution (amber), anything else (Ineligible) is inert → neutral.
function referralStatusTone(status: string): StatusTone {
  if (status === "Paid") return "proof";
  if (status === "Pending") return "caution";
  return "neutral";
}

const historyColumns: Column<ReferralHistoryRow>[] = [
  {
    key: "referred",
    header: "Referred",
    cell: (r) => <span className="font-mono text-xs text-foreground/80">{r.referred}</span>,
  },
  {
    key: "date",
    header: "Date",
    cell: (r) => <span className="text-muted-foreground">{r.date}</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (r) => (
      <StatusPill tone={referralStatusTone(r.status)} size="xs">
        {r.status}
      </StatusPill>
    ),
  },
  {
    key: "commission",
    header: "Commission",
    align: "right",
    cell: (r) => <span className="font-mono text-foreground/80">{r.commission}</span>,
  },
];

function TrendChart({ data }: { data: { label: string; value: number }[] }) {
  const w = 320;
  const h = 96;
  const gap = 8;
  const max = Math.max(1, ...data.map((d) => d.value));
  const bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="Sample introductions over time">
      {data.map((d, i) => {
        const bh = Math.round((d.value / max) * (h - 18));
        const x = i * (bw + gap);
        const y = h - bh - 14;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={bw} height={bh} rx={3} className="fill-primary/40" />
            <text x={x + bw / 2} y={h - 2} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// R5 — the signed wallet's OWN indexed introduction standing (counts from the
// introduction snapshot + live registry existence), fetched through the
// gated wallet module via a runtime dynamic import (guard rule 15). Null =
// not loaded / no session / read failed → the section renders its honest
// PENDING state; a figure only ever comes from the readback.
type StandingReadback = import("@/wallet/walletSession").SourceStandingReadback;

function useOwnSourceStanding(): StandingReadback | null {
  const [standing, setStanding] = useState<StandingReadback | null>(null);
  useEffect(() => {
    let active = true;
    void import("@/wallet/walletSession").then(({ fetchSourceStanding }) =>
      fetchSourceStanding().then((r) => {
        if (active) setStanding(r);
      }),
    );
    return () => {
      active = false;
    };
  }, []);
  return standing;
}

function usd(raw: string): string {
  const n = BigInt(raw);
  const whole = n / 1_000_000n;
  const cents = ((n % 1_000_000n) / 10_000n).toString().padStart(2, "0");
  return `$${whole}.${cents}`;
}

// The indexed standing + the Connector ladder progress. The four figures are
// REAL (the R5 snapshot + live escrow read, labeled as-of block); the bar is
// never empty (the pinned UI law); the summit stays a road, not a promise.
function IntroductionStanding({ readback }: { readback: StandingReadback | null }) {
  const s = readback?.standing ?? null;
  if (readback === null || s === null) {
    return (
      <Card className="bg-card/40 border-border/50 p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">Your introduction standing</span>
          <LifecycleBadge lifecycle="PENDING_ADAPTER" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {readback?.failureReason ??
            "Sign in with your wallet to read your own indexed standing. No figure is shown without the read."}
        </p>
      </Card>
    );
  }
  const p = ladderProgress(s.durableIntroductions);
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-6">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm font-medium text-foreground">Your introduction standing</span>
        <span className="font-mono text-[10px] text-muted-foreground">
          indexed · as of block {s.asOfBlock}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Introductions">{String(s.introducedMembers)}</StatCard>
        <StatCard label="Durable introductions">{String(s.durableIntroductions)}</StatCard>
        <StatCard label="Commission paid">{usd(s.commissionPaidRaw)}</StatCard>
        <StatCard label="Held in escrow">{usd(s.escrowOwedRaw)}</StatCard>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-3 text-xs">
          <span className="text-foreground/90">
            {p.current.title} · {p.current.bps / 100}%
          </span>
          {p.next ? (
            <span className="text-muted-foreground">
              {p.next.title} at {p.next.durableThreshold} durable
              {p.next.raisesRate ? ` · ${p.next.bps / 100}%` : " · title"}
            </span>
          ) : (
            <span className="text-muted-foreground">the summit — the on-chain cap</span>
          )}
        </div>
        <div
          className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden"
          role="progressbar"
          aria-label="Progress to the next Connector rung"
          aria-valuemin={0}
          aria-valuemax={1}
          aria-valuenow={p.ratio}
        >
          <div className="h-full rounded-full bg-primary/70" style={{ width: `${p.ratio * 100}%` }} />
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          A durable introduction is an introduced member whose wallet still holds SYN.
          The threshold decides a promotion; the founder&apos;s signature executes it.
          An acquired rate never decreases.
        </p>
        {/* FOUNDER RULE (simple + transparency): the waiting between the
            threshold crossing and the signature is VISIBLE and DATED — never
            compensated. The public SourceTermsUpdated event dates the raise. */}
        {s.promotionDue ? (
          <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5 mt-1">
            <p className="text-xs text-foreground font-medium">
              Promotion due — awaiting founder signature: {s.entitledTitle} ·{" "}
              {s.entitledBps / 100}%
              {s.crossedAtDateUtc ? ` (threshold crossed ${s.crossedAtDateUtc})` : ""}
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              The new rate applies from its on-chain recording; it is never
              retroactive. The signing is a public on-chain event — the raise is
              dated for everyone to verify.
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

export function MemberReferralDashboard() {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const readback = useOwnSourceStanding();

  function copyLink() {
    void navigator.clipboard?.writeText(sampleReferralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div>
      <div className="mt-8 mb-2 flex flex-wrap items-center gap-3">
        <h3 className="text-base font-medium text-foreground">Your referral</h3>
        <LifecycleBadge lifecycle={referralProgram.lifecycle} />
      </div>

      <Card className="bg-primary/5 border-primary/30 p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-0.5">{referralProgram.statusCopy.status}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The dashboard below is a sample of the coming per-member view — no figure here is
              live yet; the introduction read-model (indexer) is what wires it.
            </p>
          </div>
        </div>
      </Card>

      {/* R5 — the OWN indexed standing + Connector ladder progress (real). */}
      <IntroductionStanding readback={readback} />

      {/* Shareable verified-introducer card — the one-tap share asset */}
      <ShareCard />

      {/* Link + code */}
      <Card className="bg-card/40 border-border/50 p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Your referral link</span>
          <SampleTag kind="simulated" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input readOnly value={sampleReferralLink} className="font-mono text-xs" />
          <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0">
            {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Referral code: <span className="font-mono text-foreground/80">{sampleReferralCode}</span>
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <Button variant="outline" size="sm" onClick={() => setShowQr((v) => !v)}>
            <QrCode className="h-4 w-4 mr-1.5" />
            Get QR code
          </Button>
          <ShareMenu url={sampleReferralLink} text="Join The Syndicate with my verified introduction." />
        </div>
        {showQr ? (
          <div className="mt-4 pt-4 border-t border-border/50">
            <QrCodeBlock value={sampleReferralLink} />
          </div>
        ) : null}
      </Card>

      {/* Summary stats */}
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-medium text-foreground">Summary</h4>
        <SampleTag kind="simulated" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {memberStatsSample.map((s) => (
          <StatCard key={s.label} label={s.label}>
            {s.sampleValue}
          </StatCard>
        ))}
      </div>

      {/* Trend + history */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
        <Card className="bg-card/40 border-border/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-medium text-foreground">Introductions over time</h4>
            <SampleTag kind="simulated" />
          </div>
          <TrendChart data={memberTrendSample} />
        </Card>

        <Card className="bg-card/40 border-border/50 p-5">
          <div className="flex items-center gap-2 mb-4">
            <h4 className="text-sm font-medium text-foreground">Recent introductions</h4>
            <SampleTag kind="simulated" />
          </div>
          <DataTable
            columns={historyColumns}
            rows={memberHistorySample}
            getRowKey={(r) => r.referred}
            density="compact"
            zebra
          />
        </Card>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">{referralProgram.boundaryLine}</p>
    </div>
  );
}
