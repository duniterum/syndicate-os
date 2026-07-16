// pages/MemberAccess.tsx — MEMBER HOME (S7 recomposition · S7-b dashboard).
// ---------------------------------------------------------------------------
// TWO STATES, TWO SHAPES (founder-approved wireframes, 2026-07-15/16):
//   · Visitor / signed out — THE DOOR: a full-screen centered scene, one
//     human sentence, ONE connect CTA (RainbowKit connect + SIWE in a single
//     flow). Below: how a seat works, the locked-visible actions, the doors.
//   · Signed in — THE DASHBOARD (S7-b, founder art direction at the S7 seal;
//     research-grounded: F-pattern, KPI row top-left, 12-col card grid,
//     full width): zone 1 the identity band (sigil · Member #N · rung ·
//     receipt chip) · zone 2 the four live KPI tiles · zone 3 the work grid
//     (referral engine 2/3 + reserved slots 1/3) · zone 4 the protocol pulse
//     · zone 5 verify-the-foundation + settings + expectations. Our edge
//     over the references: every figure carries its verify path.
// The member quick-actions grid is VISITOR-ONLY (the conversion surface,
// locks visible); for a member every action lives in context (band, referral
// card, header CTA, doors) — no duplicate buttons.

import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "wouter";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MemberShell } from "@/components/member/MemberShell";
import { MEMBER_HOME_RESERVED_SLOTS } from "@/config/memberDoors";
import { MemberQuickActions } from "@/components/member/MemberQuickActions";
import { MemberPulse } from "@/components/member/MemberPulse";
import { ProtocolSnapshot } from "@/components/member/ProtocolSnapshot";
import { ChronicleLatest } from "@/components/member/ChronicleLatest";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { memberHome, expectations } from "@/config/syndicateFacts";
import { MemberReferralDashboard } from "@/components/referral/MemberReferralDashboard";
import { WalletAuthComingSoon } from "@/components/WalletAuthComingSoon";
import { useAuthAvailability } from "@/lib/authAvailability";
import { ctas } from "@/config/sharedCopy";

// The identity band — the "Your Seat" surface (own-row; rule-15 lazy,
// flag-gated wallet boundary).
const MemberYourSeat = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberYourSeat"))
  : null;

// S7-b — the four live KPI tiles (own-row figures; same gated boundary).
const MemberKpiRow = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberKpiRow"))
  : null;

// S7-b — the capital footprint card (own-account display rule: footprint +
// ladder + next rung, the shield line beside it; same gated boundary).
const CapitalAxisCard = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/CapitalAxisCard"))
  : null;

// SLICE B — the UI-only settings panel (zero new writes; honest rows).
const MemberSettings = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberSettings"))
  : null;

/**
 * The page-level composition switch (door vs dashboard), resolved ENTIRELY
 * from the server's own session answer via the sanctioned dynamic wallet
 * import (rule 15). Fail-closed: any failure keeps the visitor composition
 * (the prerendered default). Re-reads on session changes.
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

/** The shared verify-the-foundation button row (both states, zone 5). */
function VerifyFoundationRow() {
  return (
    <>
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
    </>
  );
}

export default function MemberAccess() {
  const authLive = useAuthAvailability() === "live";
  const { signedIn } = useOwnSession();
  const memberView = signedIn && MemberYourSeat !== null;

  if (memberView) {
    // ── THE DASHBOARD (S7-b) ──────────────────────────────────────────────
    return (
      <div className="w-full">
        {/* Zone 1+2 — identity band + KPI row (compact; the full-screen
            treatment belongs to the visitor door, not to a working
            dashboard). */}
        <section className="relative overflow-hidden border-b border-border/50 bg-background py-8">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
              {memberHome.eyebrow}
            </p>
            <Suspense fallback={null}>
              <MemberYourSeat />
            </Suspense>
            {MemberKpiRow ? (
              <div className="mt-4">
                <Suspense fallback={null}>
                  <MemberKpiRow />
                </Suspense>
              </div>
            ) : null}
          </div>
        </section>

        <section className="py-10 md:py-12">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
            <MemberShell>
              {/* Zone 3 — the work grid, after-login standard order: the
                  LIVING RECORD first (recent activity — the exchange
                  pattern), then the referral engine; beside them the
                  recognition + system-state column drawn from the doors. */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
                <div className="xl:col-span-2 min-w-0">
                  {/* The pulse leads — recent activity is what every
                      world-class dashboard lands on (gains My | Protocol
                      with A1). */}
                  <div className="mb-8">
                    <MemberPulse />
                  </div>
                  <section id="referral-dashboard" className="scroll-mt-24">
                    <h2 className="type-h2 text-foreground mb-1">Your referral</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-2">
                      The people you brought in, your standing, and the Connector
                      ladder.
                    </p>
                    <MemberReferralDashboard />
                  </section>
                </div>
                <div className="min-w-0 grid gap-6 content-start">
                  {/* The capital axis — own-account guidance (footprint,
                      ladder, next rung; the shield line inside). */}
                  {CapitalAxisCard ? (
                    <Suspense fallback={null}>
                      <CapitalAxisCard />
                    </Suspense>
                  ) : null}
                  {/* The system state + the record's newest chapter — the
                      doors' own truths, surfaced as living summaries. */}
                  <ProtocolSnapshot />
                  <ChronicleLatest />
                  <div>
                    <h2 className="type-h2 text-foreground mb-1">Coming to your seat</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                      Reserved, honestly — nothing here is simulated.
                    </p>
                    <div className="grid gap-3">
                      {MEMBER_HOME_RESERVED_SLOTS.map((slot) => (
                        <Card
                          key={slot.label}
                          className="bg-card/30 border-border/50 border-dashed p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="text-sm font-medium text-muted-foreground">
                              {slot.label}
                            </span>
                            {slot.lifecycle ? (
                              <LifecycleBadge lifecycle={slot.lifecycle} />
                            ) : null}
                          </div>
                          <p className="text-xs text-muted-foreground leading-snug">
                            {slot.note}
                          </p>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Zone 5 — verify + settings + expectations. */}
              <VerifyFoundationRow />

              {signedIn && authLive && MemberSettings ? (
                <section id="settings" className="mb-12 scroll-mt-24">
                  <Suspense fallback={null}>
                    <MemberSettings />
                  </Suspense>
                </section>
              ) : null}

              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl pt-6 border-t border-border/50">
                {expectations.body}
              </p>
            </MemberShell>
          </div>
        </section>
      </div>
    );
  }

  // ── THE DOOR (visitor / signed out — approved S7 composition) ───────────
  return (
    <div className="w-full">
      {/* Full-screen centered scene: the first viewport IS the door
          (CANON_CONVERSION_SURFACE §4; the underscore calc spacing is
          deliberate — the space-less form can drop as invalid CSS and
          silently fall back to the mobile height). */}
      <section className="relative overflow-hidden border-b border-border/50 bg-background flex items-center min-h-[65svh] md:min-h-[calc(100svh_-_3.75rem)] py-12 md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10 w-full">
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
            {/* THE one connect CTA (RainbowKit: connect + SIWE sign-in in a
                single flow; session truth stays with the server). While the
                auth zone is dark, an honest coming-soon state renders
                instead of a sign-in that would 404. */}
            <div className="mt-8">
              {authLive ? (
                <ConnectButton showBalance={false} />
              ) : (
                <WalletAuthComingSoon />
              )}
            </div>
            <p className="mt-6 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {memberHome.door.honestyControl}
            </p>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {memberHome.door.honestySafety}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <MemberShell>
            {/* How a seat works — three human steps. */}
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

            {/* Quick actions — the visitor conversion surface: locked
                actions stay visible with their plain reason. */}
            <div className="mb-12">
              <MemberQuickActions />
            </div>

            {/* The referral dashboard — anchored (the sidebar door's
                target); honest signed-out states inside. */}
            <section id="referral-dashboard" className="mb-12 scroll-mt-24">
              <h2 className="type-h2 text-foreground mb-1">Your referral</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-2">
                The people you brought in, your standing, and the Connector
                ladder.
              </p>
              <MemberReferralDashboard />
            </section>

            {/* SEASONS_ENGINE §11 slots 3–5 — RESERVED VISIBLY. */}
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
                  <p className="text-xs text-muted-foreground leading-snug">
                    {slot.note}
                  </p>
                </Card>
              ))}
            </div>

            <VerifyFoundationRow />

            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl pt-6 border-t border-border/50">
              {expectations.body}
            </p>
          </MemberShell>
        </div>
      </section>
    </div>
  );
}
