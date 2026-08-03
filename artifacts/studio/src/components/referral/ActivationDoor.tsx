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
  const read = useOwnActivationState(retryToken);

  // A FAILED READ IS NOT AN EMPTY ONE (2026-08-03). This used to render null
  // for both, so a 429 — this route shares one throttle bucket with every auth
  // read the page fires on mount — or any drop made the whole door disappear,
  // taking the "the ask didn't go through" sentence with it. He was left with
  // no door, no message and no retry, on the one screen Member Home had just
  // pointed him to.
  if (read.kind === "failed") {
    return (
      <Card className="bg-card/40 border-border/50 p-5 mt-4" data-testid="card-activation-read-failed">
        <div className="flex items-center gap-2">
          <CircleAlert className="h-4 w-4 text-gold" />
          <span className="text-sm font-medium text-foreground">
            Couldn&apos;t read your activation state just now.
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Nothing is assumed and nothing was filed. This is the read, not your
          standing — try again in a moment.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setRetryToken((t) => t + 1)}
          data-testid="button-activation-reread"
        >
          Read again
        </Button>
      </Card>
    );
  }
  // Loading / signed-out: the surface above already speaks; stay quiet.
  if (read.kind === "loading" || read.readback.state !== "S4") return null;
  const readback = read.readback;

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
          You'll be notified here the moment it's decided.{" "}
          <span className="text-foreground">
            Wait for that before you share it:
          </span>{" "}
          until your source is signed on-chain, a purchase made through your
          link is <span className="text-foreground">not credited to you</span>.
          Clicks are already counted in Channels once the source exists on the
          registry.
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
  // ONLY the SYN read can make the checks unavailable. The seat is shown, not
  // required (the chain gates on the balance — SPEC §262/§436), so an engine
  // hiccup must never collapse this card for a wallet whose one real condition
  // is satisfied. Corrected 2026-08-03 with the server's own gate.
  const checksUnavailable = holdsSyn === null;

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
              // NEUTRAL, never danger: the chain does not ask for a seat to
              // introduce (see the gate note below). It is a fact about him,
              // not a failed requirement.
              <StatusPill tone="neutral" size="xs">◌ A seat — not yet, and not required to introduce</StatusPill>
            )}
            {holdsSyn === true ? (
              <StatusPill tone="live" size="xs">
                {readback.synRaw !== null
                  ? `✓ SYN in your wallet — you hold ${synDisplay(readback.synRaw)}`
                  : "✓ SYN in your wallet"}
              </StatusPill>
            ) : (
              <StatusPill tone="danger" size="xs">✕ SYN in your wallet — none right now</StatusPill>
            )}
          </div>

          {/* THE GATE IS SYN, NEVER THE SEAT (founder, 2026-08-03; the chain
              agrees and the spec says so twice). MembershipSaleV3 reverts only
              on `SYN.balanceOf(sourceWallet) == 0` — the error is NAMED
              ReferrerNotSeated but SPEC_REFERRAL_SYSTEM §262/§436 state it
              plainly: «ReferrerNotSeated ne vérifie pas le siège. Il vérifie le
              solde.» Until today this door branched on the SEAT first and never
              rendered the ask for a seatless wallet — so a signed-in holder who
              bought SYN on the DEX, whom the contract accepts, could not even
              ask. The seat is now what it always was: a separate, welcome fact,
              never a blocker. */}
          {holdsSyn === false ? (
            // Zero SYN — the ONE real blocker, seat or no seat.
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
              {seatHeld === false ? (
                // An INVITATION, never a condition — he can ask right now.
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  You hold SYN, so you can introduce others without a seat. A
                  seat is a different thing — it makes you a member and writes
                  you into the story.{" "}
                  <Link
                    href="/join"
                    className="text-gold hover:underline"
                    data-testid="link-activation-membership"
                  >
                    See how membership works
                  </Link>
                  .
                </p>
              ) : null}
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
