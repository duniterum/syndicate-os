// wallet/JoinHistoricalGate.tsx (build-time-gated wallet module)
//
// C1.3 — THE HISTORICAL GATE (safety-critical; ships BEFORE any buy button).
//
// A production duplicate seat already exists: historical member #7 bought on V3
// without claiming and was minted seat #11 — the contract does not stop an
// unclaimed historical wallet from buying (knownMember is false until
// claimHistoricalMembership). Seven historical wallets are still armed. This
// component is the gate the contract lacks: when the CONNECTED wallet is one of
// the 8 historical members and the LIVE engine does not know it yet, the buy
// path is declared BLOCKED — "claim your seat first" — before any transaction
// UI ever exists on /join (C2 must consult resolveHistoricalGate again before
// enabling a buy).
//
// Discipline:
//   · own-row only — the gate checks the CONNECTED wallet against the set;
//     it never lists the set, never looks up anyone else;
//   · chain is authority — knownMember + V1_MEMBER_ROOT are read LIVE and the
//     local proof is re-folded to the LIVE root (the contract's exact math);
//   · fail closed — any read/verify failure renders BLOCKED, never silence;
//   · addresses reach this layer from the server (verify-links) via props —
//     nothing hardcoded here; reached only via a runtime dynamic import
//     (guard-access-state rule 15).
//
// ⚠️ RECIPIENT, not buyer: the contract checks knownMember[RECIPIENT]. Today
// the recipient IS the connected wallet; when gifting lands (C4), this gate
// must be evaluated on the RECIPIENT address.

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ExternalLink, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  getHistoricalMember,
  resolveHistoricalGate,
  type HistoricalGateVerdict,
} from "@/lib/historicalMembers";

export default function JoinHistoricalGate({
  saleAddress,
  saleUrl,
}: {
  /** Deployed MembershipSaleV3 address, derived from the server verify-link. */
  saleAddress: string | null;
  /** Explorer URL of the sale contract (the verify affordance), if available. */
  saleUrl: string | null;
}) {
  const { address } = useAccount();
  const [verdict, setVerdict] = useState<HistoricalGateVerdict | null>(null);

  // Synchronous own-row set check: every wallet OUTSIDE the historical set
  // renders nothing and never touches the chain (client read volume stays tiny).
  const entry = getHistoricalMember(address);

  useEffect(() => {
    let active = true;
    if (!address || !entry) {
      setVerdict(null);
      return;
    }
    setVerdict(null);
    void resolveHistoricalGate(saleAddress, address).then((v) => {
      if (active) setVerdict(v);
    });
    return () => {
      active = false;
    };
  }, [address, entry, saleAddress]);

  if (!address || !entry) return null;

  // Resolving (only the 8 historical wallets ever see this line).
  if (verdict === null) {
    return (
      <Card className="p-5 mb-10 bg-card/40 border-border/50" data-testid="panel-historical-gate-loading">
        <p className="text-sm text-muted-foreground">
          This wallet is in the historical member set — reading its live claim
          state from the engine…
        </p>
      </Card>
    );
  }

  // Claimed (or already duplicated — #7): the engine knows this wallet; a
  // further buy is a repeat purchase, not a new seat. Nothing to block.
  if (verdict.kind === "not_historical" || verdict.kind === "claimed") return null;

  const blocked = verdict.kind === "blocked_unclaimed";

  return (
    <Card
      className="border-destructive/40 bg-destructive/5 p-6 mb-10"
      data-testid={blocked ? "panel-historical-gate-blocked" : "panel-historical-gate-unverified"}
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-md bg-destructive/10 text-destructive shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-medium text-foreground mb-2">
            {blocked
              ? `This wallet already holds seat #${verdict.memberNumber} — claim it before any purchase`
              : `Historical seat #${verdict.memberNumber} — live state unverified`}
          </h2>
          {blocked ? (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              This wallet is one of the eight historical members. Its seat exists
              from a previous engine era, and the live engine does not know it yet
              — the on-chain claim has not been made. Buying from this wallet
              before claiming would mint a second, duplicate seat. Irreversibly.
              It has happened once already. So the buy path stays blocked for
              this wallet until the seat is claimed on the sale contract
              (claimHistoricalMembership). The claim itself is an on-chain act
              from your own wallet; it is not wired into this page yet.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              This wallet is recorded as historical member #{verdict.memberNumber},
              but its live claim state could not be verified right now — the chain
              read or the on-chain proof check did not succeed. Nothing is guessed:
              the buy path stays blocked for this wallet until the live read
              succeeds. Reload to retry.
            </p>
          )}
          <p className="font-mono text-[10px] text-muted-foreground mt-3">
            {blocked
              ? "Live read: knownMember = false · membership proof verified against the engine's on-chain historical root"
              : "Fail-closed: no live verification, no assumption"}
            {saleUrl ? (
              <>
                {" · "}
                <a
                  href={saleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-proof/80 transition-colors hover:text-proof"
                >
                  verify the sale contract
                  <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                </a>
              </>
            ) : null}
          </p>
        </div>
      </div>
    </Card>
  );
}
