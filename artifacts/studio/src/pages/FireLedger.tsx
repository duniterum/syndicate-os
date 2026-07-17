// pages/FireLedger.tsx — /fire-ledger, LIVE V2 (ARC ACT-1 grew it;
// ARC M4-c: the complete NUMBERED Proof of Burn record, served by the event
// backbone). The live TOTAL burn stays a direct chain read (unchanged); below
// it, the full record from the first burn — oldest = #1, every line
// receipt-backed, amounts rendered (the amount IS the record), senders as
// Founder/Community labels only, never an address. If the served record is
// unavailable, the honest ~24h window stands in and SAYS so.
// Naming (founder, final): the PAGE is Fire Ledger (the place); the ACT and
// its numbered receipts are "Proof of Burn" — every rendered token says burn.

import { Flame, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { LiveActivityFeed } from "@/components/activity/LiveActivityFeed";
import {
  fetchServedFeed,
  formatSynRaw,
  type ServedFeed,
} from "@/lib/backboneFeedClient";

// The one figure that is always readable — live, fail-closed. (Unchanged.)
function LiveTotalBurn() {
  const { burnedSyn } = useHeroReality();
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-md bg-primary/10 text-primary" aria-hidden="true">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Total SYN retired — read live</p>
            <p className="text-[11px] text-muted-foreground">
              The burn address balance, read from the chain on every load. It
              only ever grows.
            </p>
          </div>
        </div>
        <div className="text-right">
          {burnedSyn !== null ? (
            <p className="font-mono text-xl text-foreground" data-testid="text-live-burn-total">
              {burnedSyn} <span className="text-xs text-muted-foreground">SYN</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Checking the chain…</p>
          )}
          <VerifyOnChain ids={["burnAddress"]} />
        </div>
      </div>
    </Card>
  );
}

// The complete numbered record (M4-c) — served by the event backbone.
function ProofOfBurnRecord() {
  const [served, setServed] = useState<ServedFeed | null>(null);
  const [tried, setTried] = useState(false);
  const { data } = useGetProtocolVerifyLinks();
  const explorerBase = (() => {
    const u = data?.links?.find((l) => l.id === "membershipSaleV3")?.url ?? null;
    return u ? (u.match(/^(.*)\/address\//)?.[1] ?? null) : null;
  })();

  useEffect(() => {
    void fetchServedFeed().then((f) => {
      setServed(f);
      setTried(true);
    });
  }, []);

  const available = served !== null && served.lanes.burns;
  const ledger = available ? [...served.burnLedger].reverse() : []; // newest first on screen
  const catchingUp =
    available &&
    served.burnsAsOfBlock !== null &&
    served.headBlock !== null &&
    served.burnsAsOfBlock < served.headBlock - 1_000;

  if (!tried) {
    return <p className="text-sm text-muted-foreground py-6">Reading the served record…</p>;
  }

  if (!available) {
    // Honest fallback: the served record is unavailable — the ~24h window
    // stands in, and its own banner says exactly what it covers.
    return (
      <>
        <Card className="bg-card/20 border-dashed border-border/60 p-4 mb-4">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">
              The served Proof of Burn record is unavailable right now
            </span>{" "}
            — the recent window below stands in. Numbers (#1 → #N) return with
            the served record; a number is only ever assigned on the complete,
            gapless history.
          </p>
        </Card>
        <LiveActivityFeed onlyKinds={["burn"]} showFilters={false} />
      </>
    );
  }

  return (
    <div>
      <Card className="bg-card/30 border-border/50 p-3.5 mb-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed" data-testid="burn-record-banner">
          <span className="text-foreground font-medium">
            The Proof of Burn record, served by the event indexer.
          </span>{" "}
          Every burn since the first block — oldest is #1 — complete up to
          block{" "}
          {(served.burnsAsOfBlock ?? served.headBlock)?.toLocaleString("en-US") ?? "…"}
          {catchingUp
            ? " — the indexer is catching up toward the chain head; newer burns appear as it advances"
            : ""}
          . A number is assigned only on the gapless record; the sender is
          named as Founder or Community, never an address. Between indexer
          cycles this is a snapshot — never evidence of absence.
        </p>
      </Card>

      {ledger.length === 0 ? (
        <Card className="bg-card/20 border-dashed border-border/60 p-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            No burn has been recorded yet within the indexed history. That is
            an honest read — not a claim about anything outside it.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {ledger.map((b) => (
            <Card key={`${b.transactionHash}-${b.logIndex}`} className="bg-card/40 border-border/50 p-3.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <StatusPill tone="caution" size="xs">
                  Proof of Burn #{b.proofOfBurnNumber}
                </StatusPill>
                <p className="text-sm text-foreground/90 flex-1 min-w-48">
                  {formatSynRaw(b.amountSynRaw)} SYN was retired to the burn
                  address — gone for everyone, forever.
                </p>
                <StatusPill tone={b.senderLabel === "Founder" ? "proof" : "neutral"} size="xs">
                  {b.senderLabel}
                </StatusPill>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {b.isoDayUtc} · block {b.blockNumber.toLocaleString("en-US")}
                </span>
                {explorerBase ? (
                  <a
                    href={`${explorerBase}/tx/${b.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-proof/80 hover:text-proof"
                  >
                    verify <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FireLedger() {
  return (
    <PublicPage
      eyebrow="Fire Ledger"
      title="Supply, retired in public."
      lead="Proof of Burn is a costly signal: SYN sent to the burn address is gone for everyone, forever — a manual, verifiable transfer, never automated, never a price promise. Below: the live total, and the complete numbered record — every burn since the first block, each with its own verify link."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <LiveTotalBurn />

      <h2 className="text-base font-medium text-foreground mb-3">The Proof of Burn record</h2>
      <ProofOfBurnRecord />

      <Card className="bg-card/20 border-dashed border-border/60 p-5 mt-10">
        <h2 className="text-base font-medium text-foreground mb-1.5">What the event indexer adds next</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          The record serves every burn since the first block, numbered from
          #1 — and always states exactly what it covers. What arrives next:
          who chose the fire, by their own opt-in name (the identity layer),
          and pagination as the record grows. The total above is already
          whole either way.
        </p>
      </Card>
    </PublicPage>
  );
}
