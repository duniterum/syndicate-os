// components/referral/ShareCard.tsx
//
// The shareable "verified introducer" card — REAL since the S7 truth sweep
// (2026-07-16; the program went ACTIVE 2026-07-13 and the R5 indexer serves
// the figures, so the promised sample→real swap is DONE). The whole point:
// unlike ordinary referral programs where a referrer's claims can't be
// checked, here the figures are the member's OWN indexed on-chain record —
// a shared card is proof, not a boast. The parent passes real standing
// figures + the member's real derived link; this component invents nothing
// and renders only when given the real thing.

import { useState } from "react";
import { Link } from "wouter";
import { ShieldCheck, ExternalLink, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShareMenu } from "@/components/referral/ShareMenu";
import { QrCodeBlock } from "@/components/referral/QrCodeBlock";

interface ShareCardProps {
  /** The member's OWN indexed introduction count (R5, real). */
  introduced: number;
  /** Formatted verified commission total, or null to say nothing about money. */
  commissionPaidUsd: string | null;
  /** The member's REAL permanent referral link (derived from their wallet). */
  link: string;
}

const TAGLINE =
  "Proof, not claims — every figure is on-chain and verifiable.";

export function ShareCard({ introduced, commissionPaidUsd, link }: ShareCardProps) {
  const [showQr, setShowQr] = useState(false);

  const headline =
    introduced > 0
      ? `${introduced} member${introduced === 1 ? "" : "s"} introduced`
      : "A verified introduction record";
  const subline =
    commissionPaidUsd !== null
      ? `${commissionPaidUsd} in verified referral commissions`
      : "Every introduction is recorded on-chain — verifiable by anyone.";

  return (
    <Card className="overflow-hidden border-primary/30 bg-card/40 p-0 mb-6">
      {/* Clickable proof area — opens the member's own join link */}
      <a href={link} className="block">
        <div className="p-5 cursor-pointer hover:bg-primary/5 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified on-chain
            </span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="type-h2 text-foreground">{headline}</p>
              <p className="text-sm text-muted-foreground mt-1">{subline}</p>
            </div>
            <div className="shrink-0 rounded-md bg-white p-1.5">
              <QRCode value={link} size={64} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{TAGLINE}</p>
        </div>
      </a>

      {/* Actions row — outside the link to avoid nested interactive elements */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/50 p-4">
        <div className="flex-1 min-w-0 font-mono text-xs text-muted-foreground truncate">
          {link}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowQr((v) => !v)}>
          <QrCode className="h-4 w-4 mr-1.5" />
          Get QR code
        </Button>
        <ShareMenu url={link} text={TAGLINE} />
        <Link href="/proof">
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Verify on-chain
          </Button>
        </Link>
      </div>

      {showQr ? (
        <div className="border-t border-border/50 p-5">
          <QrCodeBlock value={link} />
        </div>
      ) : null}
    </Card>
  );
}
