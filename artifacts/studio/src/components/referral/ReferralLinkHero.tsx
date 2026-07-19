// components/referral/ReferralLinkHero.tsx — THE ONE canonical link block.
//
// FOUNDER STRUCTURE ORDER (2026-07-19, emphatic): "a new member wants to see
// the LINK immediately" — so the link lives at the TOP OF THE PAGE, above the
// tabs, visible on EVERY tab, and it exists EXACTLY ONCE. Every other surface
// that used to repeat the link (the Overview share block, the Link-tab card)
// is dead; the Channels composer shows only the TAGGED variant, never the
// bare link again. This is the §11-2b card (permanent derived link + live
// two-state honesty + copy/QR/share) promoted to the page hero — the proven
// logic moved verbatim, no new content code.

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { Check, Copy, Link2, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { ShareMenu } from "@/components/referral/ShareMenu";
import { QrCodeBlock } from "@/components/referral/QrCodeBlock";
import { payingSourceId } from "@/lib/sourceIdentity";
import { readSourceConfig } from "@/lib/chainReads";
import type { StandingReadback } from "@/components/referral/referralStanding";

export function ReferralLinkHero({ readback }: { readback: StandingReadback | null }) {
  const { address } = useAccount();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  // Live registry state for the derived source: true=ACTIVE · false=known but
  // not active OR not created yet · null=read unavailable (fail closed — the
  // permanence statement stands; no activity claim is made).
  const [active, setActive] = useState<boolean | null>(null);
  const { data: verifyData } = useGetProtocolVerifyLinks();
  const registryUrl =
    verifyData?.links?.find((l) => l.id === "sourceRegistry")?.url ?? null;
  const registryAddr = registryUrl
    ? (registryUrl.match(/\/address\/(0x[0-9a-fA-F]{40})\b/)?.[1] ?? null)
    : null;
  // Ruling ① (2026-07-16): advertise the source that PAYS this wallet —
  // the server-resolved id first, canonical derivation as the fallback.
  const founderSigned = readback?.sourceOrigin === "founder-signed";
  const sourceId = payingSourceId(readback?.sourceIdHex, address);
  const link = sourceId ? `https://thesyndicate.money/join?source=${sourceId}` : null;

  useEffect(() => {
    let alive = true;
    setActive(null);
    if (!registryAddr || !sourceId) return;
    void readSourceConfig(registryAddr, sourceId).then((r) => {
      if (alive) setActive(r === null ? null : r.active);
    });
    return () => {
      alive = false;
    };
  }, [registryAddr, sourceId]);

  function copyLink() {
    if (!link) return;
    void navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <Card className="bg-card/40 border-border/50 p-5 mt-6">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="h-4 w-4 text-gold" />
        <span className="text-sm font-medium text-foreground">Your referral link</span>
        {active === true ? (
          <StatusPill tone="proof" size="xs">Source active</StatusPill>
        ) : null}
      </div>
      {link ? (
        <>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input readOnly value={link} className="font-mono text-xs" data-testid="input-my-referral-link" />
            <Button variant="outline" size="sm" onClick={copyLink} className="shrink-0">
              {copied ? <Check className="h-4 w-4 mr-1.5" /> : <Copy className="h-4 w-4 mr-1.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed" data-testid="text-link-state">
            {active === true
              ? founderSigned
                ? "This is your founder-signed source's link — the source whose commission is paid to this wallet, ACTIVE inside the buyer's own transaction."
                : "Your source is ACTIVE — the commission is paid inside the buyer's own transaction, live."
              : founderSigned
                ? "This is your founder-signed source's link — the source whose commission is paid to this wallet."
                : "Your link is permanent — derived from your wallet, it never changes. The commission activates when your source is founder-signed."}
          </p>
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
