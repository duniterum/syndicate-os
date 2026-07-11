// wallet/MemberHeaderAffordance.tsx (build-time-gated wallet module)
//
// Public header member affordance — the SAME one-modal shape as the admin
// OperatorSignInAction/OperatorBadge, reused (not reinvented): RainbowKit treats
// a connected-but-unauthenticated wallet as needing the sign step, so ONE MODAL
// COVERS BOTH CONNECT AND SIGN (openConnectModal). After signing, it resolves
// IN PLACE via SESSION_CHANGED_EVENT by reading the server self-readback
// (fetchMemberStanding — the signed wallet's OWN seat, never a directory).
//
// This component is reached ONLY through a runtime dynamic import from
// PublicLayout, gated on useAuthAvailability()==="live" (so it is absent while
// the auth zone is dark and appears the instant the founder flips the flag).
// The server is the sole source of identity (AccessStateProvider: anything not
// exactly S4 collapses to S1). Honest states only — never a fabricated seat.

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchMemberStanding, type MemberStandingReadback } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

type Status =
  | { kind: "checking" }
  | { kind: "signedOut" }
  | { kind: "member"; seat: string }
  | { kind: "noSeat" }
  | { kind: "signedIn" }; // S4 but standing unreadable/unresolved — never a fake seat

function classify(r: MemberStandingReadback | null): Status {
  if (r === null || r.state !== "S4") return { kind: "signedOut" };
  if (r.chainVerified && r.recognized === true && r.memberNumber !== null) {
    return { kind: "member", seat: r.memberNumber };
  }
  if (r.chainVerified && r.recognized === false) return { kind: "noSeat" };
  return { kind: "signedIn" };
}

export default function MemberHeaderAffordance({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const [status, setStatus] = useState<Status>({ kind: "checking" });
  const { openConnectModal } = useConnectModal();

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

  const mobile = variant === "mobile";
  const base = mobile
    ? "min-h-12 w-full justify-center rounded-xl border-gold/35 bg-transparent font-semibold text-foreground hover:bg-gold/10"
    : "min-h-9 rounded-xl border-gold/35 bg-transparent px-3.5 font-semibold text-foreground hover:border-gold/55 hover:bg-gold/10";

  if (status.kind === "checking") return null;

  // Signed out (or session lapsed): one modal = connect + SIWE sign, exactly
  // like the operator action. If RainbowKit no longer offers the modal (already
  // connected+authed edge), fall back to the /member panel rather than a no-op.
  if (status.kind === "signedOut") {
    if (openConnectModal) {
      return (
        <Button
          variant="outline"
          size={mobile ? "default" : "sm"}
          onClick={() => openConnectModal()}
          title="Already a member? Connect + sign to read your standing (read-only — proves wallet control only)."
          className={base}
        >
          <Wallet className={mobile ? "mr-2 h-4 w-4 text-gold" : "mr-1.5 h-4 w-4 text-gold"} aria-hidden="true" />
          Member sign-in
        </Button>
      );
    }
    return (
      <Link href="/member" className={mobile ? "w-full" : "inline-flex"}>
        <Button variant="outline" size={mobile ? "default" : "sm"} className={base}>
          <Wallet className={mobile ? "mr-2 h-4 w-4 text-gold" : "mr-1.5 h-4 w-4 text-gold"} aria-hidden="true" />
          Member
        </Button>
      </Link>
    );
  }

  // Signed in: resolve IN PLACE. The badge links to /member for the full standing.
  const label =
    status.kind === "member"
      ? `Member · seat #${status.seat}`
      : status.kind === "noSeat"
        ? "Signed in · no seat yet"
        : "Signed in · your standing";

  return (
    <Link href="/member" className={mobile ? "w-full" : "inline-flex"} title="Open your member standing (read-only self-readback).">
      <Button variant="outline" size={mobile ? "default" : "sm"} className={base}>
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-proof" aria-hidden="true" />
        {label}
      </Button>
    </Link>
  );
}
