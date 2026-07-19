// components/referral/ReferralOverviewPanel.tsx — TAB 1 · Overview.
//
// WORK-FIRST ORDER (founder correction 2026-07-19 — grade-AAA, the canon's
// own benchmark line: "the referral link as a HERO UTILITY BLOCK, the
// Binance cluster"): a signed member arrives for THE LINK. So the panel
// opens on the share/link block — ALWAYS (when the standing read hasn't
// answered, the honest link fallback renders; the member never faces an
// empty opening) — then the standing summary, and the REFERRAL-SHOWCASE
// conversion hero LAST (CANON_PROTOCOL_LANGUAGE §7 verbatim + its verify
// path — the words a member uses when sharing, not the page's opening).

import { useState } from "react";
import { Link } from "wouter";
import { useAccount } from "wagmi";
import { Check, Copy, Link2, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { ShareCard } from "@/components/referral/ShareCard";
import { ShareMenu } from "@/components/referral/ShareMenu";
import { QrCodeBlock } from "@/components/referral/QrCodeBlock";
import { ladderProgress } from "@/config/connectorLadder";
import { payingSourceId } from "@/lib/sourceIdentity";
import { usd, type StandingReadback } from "@/components/referral/referralStanding";

// The always-there link fallback: while the standing read resolves (or when
// it honestly failed), the member STILL gets their derived permanent link —
// copyable and shareable — never an empty opening. The full two-state link
// card (registry ACTIVE read, QR) lives on the Link & channels tab.
function LinkFallbackCard({ link }: { link: string | null }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  function copyLink() {
    if (!link) return;
    void navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="h-4 w-4 text-gold" />
        <span className="text-sm font-medium text-foreground">Your referral link</span>
      </div>
      {link ? (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input readOnly value={link} className="font-mono text-xs" data-testid="input-overview-referral-link" />
            <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0">
              {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Button variant="outline" size="sm" onClick={() => setShowQr((v) => !v)}>
              <QrCode className="h-4 w-4 mr-1.5" />
              Get QR code
            </Button>
            <ShareMenu url={link} text="Join The Syndicate with my verified introduction." />
          </div>
          {showQr ? (
            <div className="mt-4 pt-4 border-t border-border/50">
              <QrCodeBlock value={link} />
            </div>
          ) : null}
        </>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Connect and sign in with your wallet to derive your permanent referral
          link. It exists before anyone signs anything — one wallet, one link,
          forever.
        </p>
      )}
    </Card>
  );
}

export function ReferralOverviewPanel({ readback }: { readback: StandingReadback | null }) {
  const { address } = useAccount();
  const s = readback?.standing ?? null;
  // Ruling ① (2026-07-16): the share card carries the SAME paying-source
  // link as the link card — one resolver, zero drift between surfaces.
  const sourceId = payingSourceId(readback?.sourceIdHex, address);
  const shareLink = sourceId
    ? `https://thesyndicate.money/join?source=${sourceId}`
    : null;
  const p = s ? ladderProgress(s.durableIntroductions) : null;

  return (
    <div>
      {/* ① THE WORK — the member's link, first, always. The full verified-
          introducer share card when the standing read answered; the honest
          link fallback while it hasn't (never an empty opening). */}
      {s !== null && shareLink !== null ? (
        <ShareCard
          introduced={s.introducedMembers}
          commissionPaidUsd={s.commissionPaidRaw !== "0" ? usd(s.commissionPaidRaw) : null}
          link={shareLink}
        />
      ) : (
        <LinkFallbackCard link={shareLink} />
      )}

      {/* ② Where you stand — the standing summary; the full road lives on
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

      {/* ③ The unique claim — §7 flagship lines, verbatim; the verify link is
          the claim's proof path (the one CONVERSION law). Deliberately LAST:
          these are the words a member uses when sharing, not the opening. */}
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
