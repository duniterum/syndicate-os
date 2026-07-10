// components/referral/ShareCard.tsx
//
// The shareable "verified introducer" card. The whole point: unlike ordinary
// referral programs where a referrer's claims can't be checked, here the
// figures are on-chain and verifiable — so a shared card is proof, not a boast.
// One Share button opens platform choices; Get QR code produces a scannable,
// downloadable QR for ads / cards / video. Sample/paused today: every figure
// sits behind a SampleTag and links to on-chain proof; at activation the sample
// values are swapped for verified read-model data and the tags come off.

import { useState } from "react";
import { Link } from "wouter";
import { ShieldCheck, ExternalLink, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SampleTag } from "@/components/SampleTag";
import { ShareMenu } from "@/components/referral/ShareMenu";
import { QrCodeBlock } from "@/components/referral/QrCodeBlock";
import { shareCardSample } from "@/config/referralProgram";

export function ShareCard() {
  const [showQr, setShowQr] = useState(false);

  return (
    <Card className="overflow-hidden border-primary/30 bg-card/40 p-0 mb-6">
      {/* Clickable proof area — opens the join link for this source */}
      <Link href={shareCardSample.joinHref}>
        <div className="p-5 cursor-pointer hover:bg-primary/5 transition-colors">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              {shareCardSample.eyebrow}
            </span>
            <SampleTag kind="simulated" />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="type-h2 text-foreground">{shareCardSample.headline}</p>
              <p className="text-sm text-muted-foreground mt-1">{shareCardSample.subline}</p>
            </div>
            <div className="shrink-0 rounded-md bg-white p-1.5">
              <QRCode value={shareCardSample.link} size={64} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{shareCardSample.tagline}</p>
        </div>
      </Link>

      {/* Actions row — outside the link to avoid nested interactive elements */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border/50 p-4">
        <div className="flex-1 min-w-0 font-mono text-xs text-muted-foreground truncate">
          {shareCardSample.link}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowQr((v) => !v)}>
          <QrCode className="h-4 w-4 mr-1.5" />
          Get QR code
        </Button>
        <ShareMenu url={shareCardSample.link} text={shareCardSample.tagline} />
        <Link href={shareCardSample.proofHref}>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-1.5" />
            Verify on-chain
          </Button>
        </Link>
      </div>

      {showQr ? (
        <div className="border-t border-border/50 p-5">
          <QrCodeBlock value={shareCardSample.link} />
        </div>
      ) : null}
    </Card>
  );
}
