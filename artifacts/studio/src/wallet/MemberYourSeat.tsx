// wallet/MemberYourSeat.tsx (build-time-gated wallet module)
//
// Member Home §4 block 1 — the "Your Seat" identity strip. Reads the signed
// wallet's OWN standing (member-standing) + its own address, and makes the SEAT
// STATUS the headline (green "Seat Held" / amber "No Seat Yet"), never a tab.
// Honest states only — no invented seat; own-row only (ADR-003). Reached via a
// lazy import from /member (guard-access-state rule 15: only App.tsx statically
// reaches @/wallet). Slice 1 of Member Home — the identity strip + the empty-
// state conversion; the shell, quick actions, and nav are later slices.

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { MemberSigil } from "@/components/member/MemberSigil";
import {
  fetchMemberStanding,
  shortAddress,
  type MemberStandingReadback,
} from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

type Status =
  | { kind: "checking" }
  | { kind: "signedOut" }
  | { kind: "member"; seat: string; era: string | null }
  | { kind: "noSeat" }
  | { kind: "signedIn" }; // S4 but standing unreadable — never a fake seat

function classify(r: MemberStandingReadback | null): Status {
  if (r === null || r.state !== "S4") return { kind: "signedOut" };
  if (r.chainVerified && r.recognized === true && r.memberNumber !== null) {
    return { kind: "member", seat: r.memberNumber, era: r.era };
  }
  if (r.chainVerified && r.recognized === false) return { kind: "noSeat" };
  return { kind: "signedIn" };
}

/** Human era label — raw enums never reach the user (Genesis is the badge). */
function eraLabel(era: string | null): string | null {
  if (era === "PART_B_FREEZE_ROOT") return "Genesis";
  if (era === "V3_EMITTED") return "Member";
  return null;
}

export default function MemberYourSeat() {
  const [status, setStatus] = useState<Status>({ kind: "checking" });
  const { address } = useAccount();

  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchMemberStanding().then((r) => {
        if (active) setStatus(classify(r));
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);

  // Signed-out / still checking: the page's own connect flow handles it.
  if (status.kind === "checking" || status.kind === "signedOut") return null;

  const seated = status.kind === "member";
  return (
    <div
      className="rounded-2xl border border-gold/25 bg-gold/5 p-5 sm:p-6"
      data-testid="member-your-seat"
    >
      <div className="flex items-start gap-4">
        <span className="shrink-0">
          <MemberSigil address={address ?? null} size={56} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h2 className="text-lg font-semibold text-foreground">
              {seated ? `Member #${status.seat}` : "Signed in"}
            </h2>
            {seated ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success"
                data-testid="seat-status-held"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                Seat Held
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-0.5 text-xs font-medium text-warning"
                data-testid="seat-status-none"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
                No Seat Yet
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {address ? <span className="font-mono">{shortAddress(address)}</span> : null}
            {seated && eraLabel(status.era) ? (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-gold">{eraLabel(status.era)}</span>
              </>
            ) : null}
          </div>

          {status.kind === "noSeat" ? (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Your wallet is connected, but no seat is anchored to it.
              </p>
              <Link href="/join" className="mt-3 inline-flex">
                <Button
                  size="sm"
                  className="rounded-xl bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
                >
                  Take your seat
                </Button>
              </Link>
            </div>
          ) : null}

          {seated ? (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Your seat is recognized on-chain — read live, never assigned by hand.
              This is your Member Home.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
