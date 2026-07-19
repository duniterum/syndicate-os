// components/referral/ReferralLinkPanel.tsx — TAB 5 · Link & channels.
//
// The member's permanent link as the hero utility block (link + copy + QR +
// share — the §11-2b card, moved here verbatim from the pre-tab dashboard),
// the honest &via channels slot (the click store is its own future slice),
// and the COLLAPSED reference layer (WORK-FIRST: how-it-works, eligibility &
// anti-abuse, the hashed terms — one click away, never in the way).

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { Check, ChevronDown, Copy, Link2, QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { ShareMenu } from "@/components/referral/ShareMenu";
import { QrCodeBlock } from "@/components/referral/QrCodeBlock";
import { TermsCommitmentHash } from "@/components/referral/TermsCommitmentHash";
import { payingSourceId } from "@/lib/sourceIdentity";
import { readSourceConfig } from "@/lib/chainReads";
import { referralProgram } from "@/config/referralProgram";
import type { StandingReadback } from "@/components/referral/referralStanding";

// The §11-2b card implementation: permanent derived link + live two-state
// honesty + copy/QR/share, all wired to the REAL link (the sample is gone).
// Moved verbatim from MemberReferralDashboard.tsx in the 5-tab split.
function MyReferralLinkCard({ readback }: { readback: StandingReadback | null }) {
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
    <Card className="bg-card/40 border-border/50 p-5 mb-6">
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

/** A collapsed reference section (WORK-FIRST: closed by default). */
function ReferenceSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Collapsible>
      <Card className="bg-card/30 border-border/50 p-0 mb-2">
        <CollapsibleTrigger className="flex w-full items-center gap-2 p-4 text-left group">
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
          <span className="text-sm font-medium text-foreground">{title}</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4">{children}</CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function ReferralLinkPanel({ readback }: { readback: StandingReadback | null }) {
  return (
    <div>
      <MyReferralLinkCard readback={readback} />

      {/* The &via channels slot — the system's biggest recorded gap (SPEC R3);
          the click store is its own slice, so this stays an honest shell. */}
      <Card className="bg-card/30 border-border/50 border-dashed p-5 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-muted-foreground">
            Channels — where your clicks come from
          </span>
          <LifecycleBadge lifecycle="FUTURE" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Add <span className="font-mono text-foreground/80">&amp;via=twitter</span>,{" "}
          <span className="font-mono text-foreground/80">&amp;via=blog</span> or{" "}
          <span className="font-mono text-foreground/80">&amp;via=telegram</span> to
          your link, and this panel will show clicks and conversions per channel —
          each conversion tied to an on-chain receipt. Self-service and private;
          the channel breakdown arrives with its own slice.
        </p>
      </Card>

      {/* Reference — always available, never leading (WORK-FIRST). */}
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">
        Reference
      </p>
      <ReferenceSection title="How the commission works">
        <ol className="space-y-2 mb-3">
          {referralProgram.howItWorks.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
              <span className="font-mono text-xs text-gold mt-0.5">{String(i + 1).padStart(2, "0")}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {referralProgram.statusCopy.detail}
        </p>
      </ReferenceSection>
      <ReferenceSection title="Eligibility & anti-abuse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">What counts as eligible</p>
            <ul className="space-y-1.5">
              {referralProgram.eligibility.map((e) => (
                <li key={e} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-2 h-1 w-1 rounded-full bg-gold/70 shrink-0" />
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Anti-abuse</p>
            <ul className="space-y-1.5">
              {referralProgram.antiAbuse.map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-2 h-1 w-1 rounded-full bg-gold/70 shrink-0" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ReferenceSection>
      <ReferenceSection title="Program terms — the hashed document">
        <p className="text-sm text-muted-foreground leading-relaxed">
          The program terms are published as a plain document whose fingerprint
          (keccak256 hash) is recorded on-chain with each member referral
          source:{" "}
          <a
            href="/referral-program-terms-v1.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-proof/80 hover:text-proof underline underline-offset-2"
          >
            Member Referral Program Terms (v1)
          </a>
          . The hash below is computed from the served document as you read
          this; the same value is recorded on the Source Registry as each
          member source&apos;s terms fingerprint.
          <TermsCommitmentHash />
        </p>
      </ReferenceSection>
      <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-card/30 px-4 py-3 mb-6 mt-2">
        <span className="text-sm text-muted-foreground">Claim a human alias — opt-in, over the seat</span>
        <LifecycleBadge lifecycle="FUTURE" />
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        {referralProgram.boundaryLine}
      </p>
    </div>
  );
}
