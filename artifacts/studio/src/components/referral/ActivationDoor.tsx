// components/referral/ActivationDoor.tsx — K3.a: the "Ask for activation"
// door (mockup founder-approved 2026-07-22, "GO and GO-Live").
//
// THE ELIGIBILITY CARD LAW (the founder's push, engraved in the mockup):
// nobody files a request that will surely be refused — the conditions are
// shown LIVE against the member's OWN wallet BEFORE the button, and every
// failed check carries its remedy inline (a door, never a wall). The same
// server checks feed the founder's review queue: one truth, two faces.
//
// The engraved contract truth: the check is the SYN token balance — ANY
// amount counts, there is no minimum; the balance is mutable, so the truth
// is re-read live and never stored. A request is a REQUEST: only the
// founder's on-chain signatures activate anything, and the member's states
// here are honest about exactly that.

import { useState } from "react";
import { Link } from "wouter";
import { BadgeCheck, CircleAlert, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { LIQUIDITY_LINKS } from "@/config/liquidityPool";
import { formatRawUnits } from "@/lib/rawUnits";
import { useOwnActivationState } from "@/components/referral/referralStanding";

/** Raw 18-decimal SYN → "500 SYN" (exact, trailing zeros trimmed). */
function synDisplay(raw: string): string {
  const s = formatRawUnits(raw, 18);
  const trimmed = s.includes(".") ? s.replace(/\.?0+$/, "") : s;
  return `${trimmed.length > 0 ? trimmed : "0"} SYN`;
}

/** The two ways to hold SYN — every no-SYN state carries both doors. */
function SynRemedies() {
  return (
    <>
      <div className="flex flex-wrap gap-2 mt-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/join" data-testid="link-activation-join">
            Add to your footprint — /join
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <a
            href={LIQUIDITY_LINKS.tradeUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-activation-pool"
          >
            Swap USDC → SYN on the live pool
            <ExternalLink className="h-3.5 w-3.5 ml-1.5" />
          </a>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
        /join uses the protocol's entry rate and grows your footprint. The pool
        trades at its own market price — independent of the entry rate; the
        protocol promises nothing about it.
      </p>
    </>
  );
}

export function ActivationDoor() {
  const [retryToken, setRetryToken] = useState(0);
  const [busy, setBusy] = useState(false);
  const [askFailed, setAskFailed] = useState(false);
  const readback = useOwnActivationState(retryToken);

  // Loading / signed-out: the surface above already speaks; stay quiet.
  if (readback === null || readback.state !== "S4") return null;

  const { seatHeld, holdsSyn, sourceOnChain, sourceActive, request, requestReadOk } =
    readback;

  // ── Active source ─────────────────────────────────────────────────────────
  if (sourceActive === true) {
    // The living truth AFTER activation (the spec's must-be-told nuance):
    // selling every SYN leaves the link active but suspends the commission.
    if (holdsSyn === false) {
      return (
        <Card className="bg-card/40 border-border/50 p-5 mt-4" data-testid="card-activation-paying-nothing">
          <div className="flex items-center gap-2">
            <CircleAlert className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-foreground">
              Active — but paying nothing right now: your wallet holds no SYN.
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Your link stays active and every introduction is still recorded
            on-chain. Commissions resume on their own the moment your wallet
            holds SYN again — any amount.
          </p>
          <SynRemedies />
        </Card>
      );
    }
    return null; // the hero's "Source active" pill already tells the story
  }

  // ── An open request: the honest pending state ─────────────────────────────
  const open = request !== null && (request.status === "WAITING" || request.status === "HOLD");
  if (open) {
    return (
      <Card className="bg-card/40 border-border/50 p-5 mt-4" data-testid="card-activation-pending">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            Request received.
          </span>
          <span className="text-sm text-muted-foreground">
            The founder reviews personally and signs on-chain.
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          You'll be notified here the moment it's decided. Your link already
          works — anyone who joins through it is recorded on-chain either way.
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-xs">
          <span className="text-proof">✓ Request received</span>
          <span className="text-gold font-medium">● Under review</span>
          <span className="text-muted-foreground">○ Founder signs on-chain</span>
        </div>
      </Card>
    );
  }

  // ── The eligibility card (no open request) ────────────────────────────────
  const declined = request !== null && request.status === "DECLINED";
  const checksUnavailable = seatHeld === null || holdsSyn === null;

  async function ask() {
    setBusy(true);
    setAskFailed(false);
    const { askForActivation } = await import("@/wallet/walletSession");
    const ok = await askForActivation();
    setBusy(false);
    if (!ok) setAskFailed(true);
    setRetryToken((t) => t + 1); // re-read either way — the server is the truth
  }

  return (
    <Card className="bg-card/40 border-border/50 p-5 mt-4" data-testid="card-activation-door">
      {declined ? (
        <div className="mb-4" data-testid="block-activation-declined">
          <div className="flex items-center gap-2">
            <CircleAlert className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-foreground">Request declined.</span>
          </div>
          {request?.declineReason ? (
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              “{request.declineReason}” — the founder
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground mt-1.5">
            You can ask again once things change.
          </p>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <BadgeCheck className="h-4 w-4 text-gold" />
        <span className="text-sm font-medium text-foreground">
          What activation needs
        </span>
        <span className="text-xs text-muted-foreground">
          — checked live against your wallet
        </span>
      </div>

      {!requestReadOk || checksUnavailable ? (
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed" data-testid="text-activation-unavailable">
          The live checks didn't answer just now — nothing is assumed, nothing
          is invented. Try again in a moment.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mt-3">
            {seatHeld === true ? (
              <StatusPill tone="live" size="xs">
                {/* K3.b own-figures (the approved mockup's pills): the
                    member's own facts, never a bare checkmark when the
                    figure is known. Fail-closed: no figure → the boolean
                    wording stands. */}
                {readback.seatFigure !== null
                  ? `✓ A seat — Seat #${readback.seatFigure} is yours`
                  : "✓ A seat — yours"}
              </StatusPill>
            ) : (
              <StatusPill tone="danger" size="xs">✕ A seat — you don't have one yet</StatusPill>
            )}
            {seatHeld === false ? (
              <StatusPill tone="neutral" size="xs">◌ SYN — comes with your seat</StatusPill>
            ) : holdsSyn === true ? (
              <StatusPill tone="live" size="xs">
                {readback.synRaw !== null
                  ? `✓ SYN in your wallet — you hold ${synDisplay(readback.synRaw)}`
                  : "✓ SYN in your wallet"}
              </StatusPill>
            ) : (
              <StatusPill tone="danger" size="xs">✕ SYN in your wallet — none right now</StatusPill>
            )}
          </div>

          {seatHeld === false ? (
            // No seat: the conversion face — one door, both checks in one act.
            <>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Your first purchase takes your seat and puts SYN in your wallet
                — both checks turn green in one act.
              </p>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link href="/join" data-testid="link-activation-membership">
                  See how membership works
                </Link>
              </Button>
            </>
          ) : holdsSyn === false ? (
            // Seat held, zero SYN: blocked honestly, remedies inline.
            <>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                The contract refuses commissions to a wallet holding no SYN.
                Hold any amount and this check turns green on its own. Two ways
                to hold SYN:
              </p>
              <SynRemedies />
              <Button size="sm" disabled className="mt-3" data-testid="button-ask-activation-blocked">
                Ask for activation — needs the check above
              </Button>
            </>
          ) : (
            // Eligible: the ask itself.
            <>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                Any amount of SYN counts — there is no minimum. Commissions only
                pay while your wallet holds SYN.
                {sourceOnChain === true
                  ? " Your link is already registered on-chain — one signature from activation."
                  : ""}
              </p>
              <Button
                size="sm"
                className="mt-3"
                disabled={busy}
                onClick={() => void ask()}
                data-testid="button-ask-activation"
              >
                {busy ? "Sending…" : declined ? "Ask again" : "Ask for activation"}
              </Button>
              {askFailed ? (
                <p className="text-xs text-destructive mt-2" data-testid="text-ask-failed">
                  The ask didn't go through — nothing was filed. Try again in a
                  moment.
                </p>
              ) : null}
            </>
          )}
        </>
      )}
    </Card>
  );
}
