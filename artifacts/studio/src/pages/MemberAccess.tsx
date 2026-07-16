// pages/MemberAccess.tsx — MEMBER HOME (S7 recomposition).
// ---------------------------------------------------------------------------
// THE FOUNDER-APPROVED WIREFRAME (2026-07-15): two states, one page.
//   · Visitor / signed out — THE DOOR BAND: one human sentence, ONE connect
//     CTA (the RainbowKit button connects AND signs in — SIWE — in a single
//     flow). The old dead band (generic header + machinery badge + long
//     intro) is retired.
//   · Signed in — THE YOUR-SEAT HERO: the member's own record as the page
//     headline (sigil · Member #N · capital rung · chapter · receipt),
//     rendered by wallet/MemberYourSeat.
// Below the band both states share the member shell: quick actions (locked
// visible with plain reasons), the referral dashboard (anchored), the §11
// reserved slots, verify links, settings (signed-in). The jargon facet tabs
// and the stale stage table died with this recomposition (Human-First Law;
// their PENDING_ADAPTER claims had rotted against the live protocol).
// The session panel is retired too — its honesty doctrine lives on in the
// door band copy (guard-pinned verbatim) and its verify teaching moved into
// the hero. ONE connect CTA on the whole page.

import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MemberShell } from "@/components/member/MemberShell";
import { MEMBER_HOME_RESERVED_SLOTS } from "@/config/memberDoors";
import { MemberQuickActions } from "@/components/member/MemberQuickActions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { memberHome, expectations } from "@/config/syndicateFacts";
import { MemberReferralDashboard } from "@/components/referral/MemberReferralDashboard";
import { WalletAuthComingSoon } from "@/components/WalletAuthComingSoon";
import { useAuthAvailability } from "@/lib/authAvailability";
import { ctas } from "@/config/sharedCopy";

// Member Home hero — the "Your Seat" identity surface. Renders only for a
// signed-in wallet (own-row); rule-15 lazy, flag-gated wallet boundary.
const MemberYourSeat = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberYourSeat"))
  : null;

// SLICE B — the UI-only settings panel (zero new writes; honest rows). Same
// rule-15 lazy wallet-boundary pattern; anchored so the header menu links it.
const MemberSettings = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberSettings"))
  : null;

/**
 * S7 — the page-level composition switch (door band vs your-seat hero),
 * resolved ENTIRELY from the server's own session answer via the sanctioned
 * dynamic wallet import (rule 15). Fail-closed: any failure keeps the
 * visitor composition (the prerendered default). Re-reads on session
 * changes, so the page flips to the hero right after the connect flow.
 */
function useOwnSession(): { signedIn: boolean } {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;
    void Promise.all([
      import("@/wallet/walletSession"),
      import("@/wallet/sessionEvents"),
    ]).then(([ws, ev]) => {
      if (!active) return;
      const read = () => {
        void ws.fetchSessionState().then((s) => {
          if (active) setSignedIn(s === "S4");
        });
      };
      read();
      window.addEventListener(ev.SESSION_CHANGED_EVENT, read);
      cleanup = () =>
        window.removeEventListener(ev.SESSION_CHANGED_EVENT, read);
    });
    return () => {
      active = false;
      cleanup?.();
    };
  }, []);
  return { signedIn };
}

export default function MemberAccess() {
  const authLive = useAuthAvailability() === "live";
  const { signedIn } = useOwnSession();
  const memberView = signedIn && MemberYourSeat !== null;

  return (
    <div className="w-full">
      {/* THE TOP BAND — door band (visitor) or your-seat hero (member).
          FULL SCREEN, CENTERED SCENE (founder at the S7 preview gate,
          2026-07-16 — the left-anchored block read as "boxed" on wide
          screens): the first viewport IS the scene, its content centered on
          BOTH axes like a door (CANON_CONVERSION_SURFACE §4; the underscore
          calc spacing is deliberate — the space-less form can drop as
          invalid CSS and silently fall back to the mobile height). */}
      <section className="relative overflow-hidden border-b border-border/50 bg-background flex items-center min-h-[65svh] md:min-h-[calc(100svh_-_3.75rem)] py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10 w-full">
          {memberView ? (
            <div className="max-w-3xl mx-auto w-full">
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
                {memberHome.eyebrow}
              </p>
              <Suspense fallback={null}>
                <MemberYourSeat />
              </Suspense>
            </div>
          ) : (
            <div
              className="flex flex-col items-center text-center"
              data-testid="member-door-band"
            >
              <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-5">
                {memberHome.eyebrow}
              </p>
              <h1 className="type-h1 text-foreground max-w-3xl">
                {memberHome.door.title}
              </h1>
              <p className="type-body text-muted-foreground max-w-2xl mt-5">
                {memberHome.door.lead}
              </p>
              {/* THE one connect CTA (RainbowKit: connect + SIWE sign-in in
                  a single flow; session truth stays with the server). While
                  the auth zone is dark, an honest coming-soon state renders
                  instead of a sign-in that would 404. */}
              <div className="mt-8">
                {authLive ? (
                  <ConnectButton showBalance={false} />
                ) : (
                  <WalletAuthComingSoon />
                )}
              </div>
              <p className="mt-6 text-xs text-muted-foreground max-w-2xl">
                {memberHome.door.honestyControl}
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
                {memberHome.door.honestySafety}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* MEMBER SHELL (two-shells rule): THIS PAGE chooses the member
              shell — the left sidebar of member doors. Public pages keep the
              public shell; the prerender sees the same static doors. */}
          <MemberShell>
            {/* Visitor: how a seat works — three human steps (the stale
                six-stage machinery table died with S7). */}
            {!memberView ? (
              <div className="mb-12" data-testid="member-how-a-seat-works">
                <h2 className="type-h2 text-foreground mb-4">
                  {memberHome.stepsHeading}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {memberHome.steps.map((step, i) => (
                    <Card
                      key={step.title}
                      className="bg-card/40 border-border/50 p-5"
                    >
                      <p className="font-mono text-xs text-primary/70 mb-2">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="text-base font-medium text-foreground mb-1.5">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.body}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Quick actions — rendered FROM the registry
                (config/memberActions.ts, §4.3): locked actions stay visible
                with their plain reason; operator actions do not exist in the
                registry. */}
            <div className="mb-12">
              <MemberQuickActions />
            </div>

            {/* The referral dashboard — first-class anchored section (the
                sidebar door targets it; ladder law: visible progress
                everywhere; honest signed-out states inside). */}
            <section id="referral-dashboard" className="mb-12 scroll-mt-24">
              <h2 className="type-h2 text-foreground mb-1">Your referral</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-2">
                Your introductions, your indexed standing, and the Connector
                ladder.
              </p>
              <MemberReferralDashboard />
            </section>

            {/* SEASONS_ENGINE §11 slots 3–5 — RESERVED VISIBLY (wireframe v2):
                the season card, quests, and "while you were away" land here
                in Phase 5 / with the event backbone. Coming-soon on the
                EXISTING posture system; nothing simulated, nothing hidden. */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
              {MEMBER_HOME_RESERVED_SLOTS.map((slot) => (
                <Card
                  key={slot.label}
                  className="bg-card/30 border-border/50 border-dashed p-4"
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {slot.label}
                    </span>
                    {slot.lifecycle ? (
                      <LifecycleBadge lifecycle={slot.lifecycle} />
                    ) : null}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {slot.note}
                  </p>
                </Card>
              ))}
            </div>

            <h2 className="text-base font-medium text-foreground mb-4">
              Verify the foundation
            </h2>
            <div className="flex flex-wrap gap-3 mb-12">
              {[ctas.viewStatus, ctas.viewContracts, ctas.getSupport, ctas.learn].map(
                (cta) => (
                  <Link key={cta.href} href={cta.href}>
                    <Button variant="outline">{cta.label}</Button>
                  </Link>
                ),
              )}
            </div>

            {/* SLICE B — Settings (anchored: the header member menu links
                here). Signed-in only — a visitor has no session to manage. */}
            {signedIn && authLive && MemberSettings ? (
              <section id="settings" className="mb-12 scroll-mt-24">
                <Suspense fallback={null}>
                  <MemberSettings />
                </Suspense>
              </section>
            ) : null}

            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl pt-6 border-t border-border/50">
              {expectations.body}
            </p>
          </MemberShell>
        </div>
      </section>
    </div>
  );
}
