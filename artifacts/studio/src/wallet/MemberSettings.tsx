// wallet/MemberSettings.tsx (build-time-gated wallet module)
//
// Member Home arc SLICE B — SETTINGS, UI-ONLY (HARD CONSTRAINT: zero new
// server write endpoints, zero new DB tables — every row below is either
// REAL through an EXISTING mechanism or an honest "Coming soon" on the
// existing posture system; nothing writes anywhere new).
//
// Rows (founder-ordered, each honest):
//   Avatar        — the deterministic SIGIL is the default; uploaded image =
//                   SOON (needs storage infra — flagged to the founder);
//                   NFT avatar = FUTURE. The abstraction is named, not built.
//   Alias         — SOON (the queued IDENTITY-ALIAS slice; opt-in, own-row).
//   Language      — SOON (no i18n mechanism exists; saying otherwise would lie).
//   Theme         — REAL (the existing ThemeToggle mechanism, reused).
//   Notifications — SOON (arrives with the event backbone).
//   Session       — REAL: wallet + verify + disconnect via the EXISTING
//                   logoutSession (no new write; the session is in-memory).
//   Reset profile — SOON (off-chain only; THE SEAT IS PERMANENT — stated).
//   Email         — DOES NOT EXIST and never will (ADR-003: no identity store).
//
// Chrome learned from Supa AvatarUploader/Settings (read to LEARN — rows,
// grouping, defaults); copied nothing (theirs writes to a backend; ours won't).

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MemberSigil } from "@/components/member/MemberSigil";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { fetchMemberStanding, logoutSession, shortAddress } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";
import type { DisplayLifecycle } from "@/config/truthStatus";

function Row({
  title,
  body,
  lifecycle,
  children,
}: {
  title: string;
  body: string;
  lifecycle?: DisplayLifecycle;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 border-b border-border/40 last:border-b-0">
      <div className="sm:w-40 shrink-0 flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{title}</span>
        {lifecycle ? <LifecycleBadge lifecycle={lifecycle} /> : null}
      </div>
      <p className="flex-1 text-xs text-muted-foreground leading-relaxed">{body}</p>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}

export default function MemberSettings() {
  const { address } = useAccount();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchMemberStanding().then((r) => {
        if (active) setSignedIn(r?.state === "S4");
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);

  return (
    <Card className="bg-card/40 border-border/50 p-5">
      <h2 className="text-base font-medium text-foreground mb-1">Settings</h2>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        Everything here is off-chain comfort. Your seat and your proofs live on
        the chain and are not settings. No email is ever asked for or stored.
      </p>

      <Row
        title="Avatar"
        body="Your deterministic sigil, derived from your wallet — the default identity mark. An uploaded image and an NFT avatar are named future options; neither exists yet."
        lifecycle="FUTURE"
      >
        {address ? <MemberSigil address={address} size={36} /> : null}
      </Row>

      <Row
        title="Alias"
        body="A human-readable name above your wallet — opt-in, invisible by default, own-row, lineage-tracked. Arrives with the IDENTITY-ALIAS slice."
        lifecycle="FUTURE"
      />

      <Row
        title="Language"
        body="One language ships today. A language choice arrives only when a real translation mechanism exists — a switch that changes nothing would be a lie."
        lifecycle="FUTURE"
      />

      <Row
        title="Theme"
        body="Light or dark — the one setting that is fully real today."
      >
        <ThemeToggle />
      </Row>

      <Row
        title="Notifications"
        body="Arrives with the event backbone — the bell in the header is already reserved for it."
        lifecycle="PENDING_ADAPTER"
      />

      <Row
        title="Session"
        body={
          signedIn && address
            ? `Signed in as ${shortAddress(address)} — the session proves wallet control only, never membership.`
            : "No active wallet session. Connect and sign in from the panel above."
        }
      >
        {signedIn ? (
          <div className="flex items-center gap-2">
            <VerifyOnChain ids={["membershipSaleV3"]} />
            <Button
              size="sm"
              variant="outline"
              onClick={() => void logoutSession()}
              data-testid="settings-disconnect"
            >
              <LogOut className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              Disconnect
            </Button>
          </div>
        ) : null}
      </Row>

      <Row
        title="Reset profile"
        body="Clears off-chain comfort settings only, once profile settings exist. THE SEAT IS PERMANENT — nothing on this page can ever touch it."
        lifecycle="FUTURE"
      />
    </Card>
  );
}
