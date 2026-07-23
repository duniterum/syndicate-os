// components/referral/ReferralLadderPanel.tsx — TAB 4 · Ladder & recognition.
//
// The Connector ladder as a HORIZONTAL RAIL (a road, never a leaderboard;
// the progress bar floored, never empty — the pinned UI law), the
// promotion-due box (the founder's simple-transparency rule: waiting is
// visible and chain-dated, never compensated), the honest rate-raise
// history state, and the recognition / season slots (own-row, Phase-5).

import { Card } from "@/components/ui/card";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { LADDER_RUNGS, ladderProgress } from "@/config/connectorLadder";
import type { StandingReadback } from "@/components/referral/referralStanding";

export function ReferralLadderPanel({ readback }: { readback: StandingReadback | null }) {
  const s = readback?.standing ?? null;
  const p = s ? ladderProgress(s.durableIntroductions) : null;
  const currentIdx = p ? LADDER_RUNGS.indexOf(p.current) : -1;

  return (
    <div>
      <Card className="bg-card/40 border-border/50 p-5 mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
          The Connector ladder — your road
        </p>
        {/* EDGE-TO-EDGE rail (founder-caught 2026-07-19: half-column dead
            space flanked the road) — the first rung aligns flush LEFT, the
            last flush RIGHT, the road spans the full card width. The
            "recognition title" chip is GONE (twice founder-flagged as
            confusing floating furniture) — the Next-sentence below already
            says it in a full human sentence. */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-[repeat(7,minmax(92px,1fr))] min-w-[640px]">
            {LADDER_RUNGS.map((rung, i) => {
              const isCurrent = i === currentIdx;
              const acquired = currentIdx >= 0 && i <= currentIdx;
              const first = i === 0;
              const last = i === LADDER_RUNGS.length - 1;
              const alignText = first ? "text-left" : last ? "text-right" : "text-center";
              const nodePos = first
                ? "left-0"
                : last
                  ? "right-0"
                  : "left-1/2 -translate-x-1/2";
              const barSpan = first ? "left-2 right-0" : last ? "left-0 right-2" : "left-0 right-0";
              return (
                <div key={rung.title} className={`relative ${alignText} pt-6`}>
                  {/* the road segment behind the node */}
                  <div
                    className={`absolute top-[9px] h-0.5 ${acquired ? "bg-gold/60" : "bg-border"} ${barSpan}`}
                  />
                  <div
                    className={`absolute rounded-full border-2 ${nodePos} ${
                      isCurrent
                        ? "top-0 h-4 w-4 bg-gold border-gold ring-4 ring-gold/15"
                        : acquired
                          ? "top-1 h-3 w-3 bg-gold/70 border-gold/70"
                          : "top-1 h-3 w-3 bg-card border-border"
                    }`}
                  />
                  <p className={`text-xs ${isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {rung.title}
                  </p>
                  <p className={`font-mono text-xs ${isCurrent ? "text-gold font-semibold" : "text-muted-foreground"}`}>
                    {rung.bps / 100}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isCurrent && s
                      ? `you · ${s.durableIntroductions} durable`
                      : `${rung.durableThreshold}${last ? " · cap" : ""}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        {p && s ? (
          <div className="space-y-1.5 mt-3">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="text-foreground/90">
                {p.current.title} · {p.current.bps / 100}%
              </span>
              {p.next ? (
                <span className="text-muted-foreground">
                  {p.next.raisesRate
                    ? `Next: ${p.next.title} at ${p.next.durableThreshold} durable introductions — the rate rises to ${p.next.bps / 100}%`
                    : `Next: ${p.next.title} at ${p.next.durableThreshold} durable introductions — a recognition title; the rate stays`}
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
              <div className="h-full rounded-full bg-gold/70" style={{ width: `${p.ratio * 100}%` }} />
            </div>
          </div>
        ) : null}
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          A durable introduction is an introduced member whose wallet still
          holds SYN. The threshold decides a promotion; the founder&apos;s
          signature executes it. An acquired rate never decreases.
        </p>
        {/* FOUNDER RULE (simple + transparency): the waiting between the
            threshold crossing and the signature is VISIBLE and DATED — never
            compensated. The public SourceTermsUpdated event dates the raise. */}
        {s?.promotionDue ? (
          <div className="rounded-md border border-gold/30 bg-gold/5 p-2.5 mt-3">
            <p className="text-xs text-foreground font-medium">
              Promotion due — awaiting founder signature: {s.entitledTitle} ·{" "}
              {s.entitledBps / 100}%
              {s.crossedAtDateUtc ? ` (threshold crossed ${s.crossedAtDateUtc})` : ""}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              The new rate applies from its on-chain recording; it is never
              retroactive. The signing is a public on-chain event — the raise is
              dated for everyone to verify.
            </p>
          </div>
        ) : null}
      </Card>

      <Card className="bg-card/30 border-border/50 border-dashed p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Rate-raise history</span>
          <LifecycleBadge lifecycle="PENDING_ADAPTER" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A rate raise is a public on-chain event — dated for anyone to verify,
          never retroactive, and a rung never descends. The dated history of
          your own raises needs its own indexing pass — it arrives with that
          micro-slice.
        </p>
      </Card>

      <Card className="bg-card/30 border-border/50 border-dashed p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">Your recognition — own-row</span>
          <LifecycleBadge lifecycle="FUTURE" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your standing among introducers, as your own row — retention- and
          quality-weighted, never a leaderboard of other members.
        </p>
      </Card>

      <Card className="bg-card/30 border-border/50 border-dashed p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">The season</span>
          <LifecycleBadge lifecycle="FUTURE" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The ladder is your acquired past; a season is the present — the live
          recognition ranking now stands at /season. When the company funds a
          season reward it is real USDC for effort, paid openly, every amount
          shown — that rail arrives with its own slice.
        </p>
      </Card>
    </div>
  );
}
