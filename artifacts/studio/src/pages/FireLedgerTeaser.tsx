// pages/FireLedgerTeaser.tsx — /fire-ledger designed teaser (§11 slot 2c).
// The living record of retired supply. THE TOTAL BURN IS ALREADY READABLE, so
// it renders LIVE on the teaser (LIVE-PRODUCTION rule: readable ⇒ displayed);
// the per-event ledger arrives with the event backbone. Number-free otherwise.

import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TeaserSurface, type TeaserSpec } from "@/components/TeaserSurface";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { useHeroReality } from "@/components/hero/useHeroReality";

const spec: TeaserSpec = {
  eyebrow: "Fire Ledger",
  title: "Supply, retired in public.",
  what:
    "Proof of Fire is a costly signal: SYN sent to the burn address is gone for everyone, forever — never minting, never yield, never a price promise. The Fire Ledger will list every burn as its own dated, verifiable event: who chose the fire (opt-in), how much was retired, and the transaction that proves it.",
  lifecycle: "PENDING_ADAPTER",
  previewRows: [
    { label: "A burn event", hint: "amount · block · verify" },
    { label: "A burn event", hint: "amount · block · verify" },
    { label: "A burn event", hint: "amount · block · verify" },
  ],
  unlocks:
    "The event backbone's burn-event scan. The TOTAL is already read live from the chain (above) — the ledger of individual fires is what arrives.",
  returnHook:
    "The total above only ever grows. Each step it takes is a story this page will tell, transaction by transaction.",
};

// The one figure already readable — rendered live, fail-closed (no figure on
// a failed read, never a stale or typed number).
function LiveTotalBurn() {
  const { burnedSyn } = useHeroReality();
  return (
    <Card className="bg-card/40 border-border/50 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-md bg-primary/10 text-primary" aria-hidden="true">
            <Flame className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">Total SYN retired — read live</p>
            <p className="text-[11px] text-muted-foreground">
              The burn address balance, read from the chain on every load.
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

export default function FireLedgerTeaser() {
  return <TeaserSurface spec={spec} liveSlot={<LiveTotalBurn />} />;
}
