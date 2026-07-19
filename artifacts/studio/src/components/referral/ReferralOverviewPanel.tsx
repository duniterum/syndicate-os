// components/referral/ReferralOverviewPanel.tsx — TAB 1 · Overview.
//
// FOUNDER STRUCTURE ORDER (2026-07-19): the LINK lives ONCE, as the page
// hero above the tabs — this panel repeats NOTHING (the earlier link/share
// block here was duplication, founder-caught: "not clean, like mixed").
// Overview = where you stand (the work summary) + the §7 conversion claim
// (the words a member uses when sharing — verbatim canon + its verify path).

import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { ladderProgress } from "@/config/connectorLadder";
import type { StandingReadback } from "@/components/referral/referralStanding";

export function ReferralOverviewPanel({ readback }: { readback: StandingReadback | null }) {
  const s = readback?.standing ?? null;
  const p = s ? ladderProgress(s.durableIntroductions) : null;

  return (
    <div>
      {/* ① Where you stand — the standing summary; the full road lives on
          the Ladder & recognition tab. */}
      <Card className="bg-card/40 border-border/50 p-5 mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
          Where you stand
        </p>
        {s && p ? (
          <p className="text-sm text-foreground/90 leading-relaxed">
            <span className="font-medium text-foreground">
              {p.current.title} · {p.current.bps / 100}%
            </span>{" "}
            — {s.durableIntroductions} durable{" "}
            {s.durableIntroductions === 1 ? "introduction" : "introductions"}.{" "}
            {p.next
              ? p.next.raisesRate
                ? `Next: ${p.next.title} at ${p.next.durableThreshold} durable introductions — the rate rises to ${p.next.bps / 100}%.`
                : `Next: ${p.next.title} at ${p.next.durableThreshold} durable introductions — a recognition title; the rate stays.`
              : "The summit — the on-chain cap."}
            {s.promotionDue ? (
              <span className="block mt-1 text-gold">
                Promotion due — awaiting the founder&apos;s signature.
              </span>
            ) : null}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">
            Every member source starts at Emerging · 5% — the road is the same
            for everyone, and the threshold alone decides a promotion.
          </p>
        )}
        <Link
          href="/referral/ladder"
          className="inline-flex items-center mt-2 text-sm text-proof hover:text-proof/80 underline underline-offset-2"
        >
          Full ladder &amp; recognition →
        </Link>
      </Card>

      {/* ② The unique claim — §7 flagship lines, verbatim; the verify link is
          the claim's proof path (the one CONVERSION law). These are the words
          a member uses when sharing — the link itself lives above the tabs. */}
      <Card className="bg-gold/5 border-gold/30 p-5 mb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-gold mb-2">
          Your unique claim
        </p>
        <h3 className="type-h3 text-foreground leading-snug">
          The referral program where the payout is part of the purchase.
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mt-2">
          You don&apos;t wait to get paid. Nothing to claim — it&apos;s already
          in your wallet when the block confirms. A referral payment can never
          break a sale — and can never be lost. Paid to your wallet inside the
          buyer&apos;s own transaction, on-chain.{" "}
          <VerifyOnChain ids={["sourceRegistry"]} className="ml-0.5" />
        </p>
      </Card>
    </div>
  );
}
