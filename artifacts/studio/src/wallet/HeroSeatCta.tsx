// wallet/HeroSeatCta.tsx (build-time-gated wallet module) — Q-A, founder A1.
//
// The home hero's PRIMARY CTA, made session-aware: a SEATED member (the same
// server self-readback the header pill speaks — S4 + chain-verified + seat)
// sees "Expand your footprint" (a further purchase adds SYN to their seat,
// never a second seat — the capital axis, true and register-legal); everyone
// else — visitors, no-seat sessions, unreadable standings, and the entire
// checking window — sees the canonical "Take your seat". Fail-closed: any
// doubt collapses to the generic. Reached ONLY via lazy import from the page,
// gated on useAuthAvailability()==="live" there (dark auth zone → this module
// never loads and the generic renders).

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { fetchMemberStanding } from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

export default function HeroSeatCta({
  className,
  generic,
}: {
  className: string;
  generic: { label: string; href: string };
}) {
  // null = checking → render the generic (never a flash of a wrong claim).
  const [seated, setSeated] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchMemberStanding().then((r) => {
        if (!active) return;
        setSeated(
          r !== null &&
            r.state === "S4" &&
            r.chainVerified &&
            r.recognized === true &&
            r.memberNumber !== null,
        );
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);

  const cta =
    seated === true
      ? {
          label: "Expand your footprint",
          href: "/join",
          title:
            "You hold your seat — a further purchase adds SYN to it, never a second seat.",
        }
      : { label: generic.label, href: generic.href, title: undefined };

  return (
    <Link href={cta.href}>
      <Button size="lg" className={className} title={cta.title} data-testid="hero-primary-cta">
        {cta.label}
      </Button>
    </Link>
  );
}
