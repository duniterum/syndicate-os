// pages/MemberAccess.tsx — MEMBER HOME (S7 · S7-b · ③ HOME recomposition).
// ---------------------------------------------------------------------------
// TWO STATES, TWO SHAPES (founder-approved wireframes, 2026-07-15/16):
//   · Visitor / signed out — THE DOOR: a full-screen centered scene, one
//     human sentence, ONE connect CTA (RainbowKit connect + SIWE in a single
//     flow). Below: how a seat works, the locked-visible actions, the doors.
//   · Signed in — THE DASHBOARD, ③ HOME recomposition (approved wireframe
//     2026-07-16 §3 — the Linear/Stripe/Vercel post-login grammar; every
//     zone answers a decision; sealed stays sealed):
//       Z1 identity band (sealed) · Z2 KPI row 4→6 · Z3 NEEDS YOUR
//       ATTENTION (0–3 cards, real state only; the anti-scarcity law binds)
//       · Z4 YOUR RECENT ACTIVITY (own D3 rows) · Z5 the protocol pulse
//       (sealed — moves BELOW own work: my-work above world-news) + the
//       referral engine · Z6 capital axis (sealed) · Z7 protocol today +
//       Chronicle (sealed) · Z8 THE DOORS as a grouped grid (mirrors the
//       menu groups) · then verify + settings + expectations.
//     Our edge over the references: every figure carries its verify path.
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

// ③ HOME Z3 — needs-your-attention (real-state-only cards; same gated
// boundary: it reads the live allowance + own-row standing).
const MemberAttention = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberAttention"))
  : null;

// ③ HOME Z4 — the member's own recent purchases (D3 rows, verify anchors).
const MemberRecentActivity = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberRecentActivity"))
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
              {/* The work grid — the approved Z3–Z8 order: MY decisions and
                  MY record first (Z3 attention · Z4 own activity), the world
                  after (Z5 pulse), the engine beneath; recognition + system
                  state + the doors in the right column. */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-10">
                <div className="xl:col-span-2 min-w-0">
                  {/* Z3 — what do I act on now? (real state only). */}
                  {MemberAttention ? (
                    <div className="mb-8">
                      <Suspense fallback={null}>
                        <MemberAttention />
                      </Suspense>
                    </div>
                  ) : null}
                  {/* Z4 — what happened on my account; can I show it? */}
                  {MemberRecentActivity ? (
                    <div className="mb-8">
                      <Suspense fallback={null}>
                        <MemberRecentActivity />
                      </Suspense>
                    </div>
                  ) : null}
                  {/* Z5 — the protocol pulse (sealed), BELOW own work: the
                      world standard puts my-work above world-news. */}
                  <div className="mb-8">
                    <MemberPulse />
                  </div>
                  {/* Referral lives on its own surface now — the "Referral"
                      door opens /referral (elevated 2026-07-19, founder GO:
                      one door, one surface). The "Introductions" KPI tile above
                      keeps the count on this page. */}
                </div>
                <div className="min-w-0 grid gap-6 content-start">
                  {/* Z6 — the capital axis — own-account guidance (footprint,
                      ladder, next rung; the shield line inside). */}
                  {CapitalAxisCard ? (
                    <Suspense fallback={null}>
                      <CapitalAxisCard />
                    </Suspense>
                  ) : null}
                  {/* Z7 — the system state + the record's newest chapter —
                      the doors' own truths, surfaced as living summaries. */}
                  <ProtocolSnapshot />
                  <ChronicleLatest />
                  {/* The doors live in the MemberShell sidebar (left, sticky) —
                      the Z8 grid was a full-column duplicate of that same
                      MEMBER_DOOR_GROUPS and was removed (founder 2026-07-18,
                      WORK-FIRST): one door list, freeing the right column. */}
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
        <div className="w-full px-4 sm:px-6 lg:px-8">
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

            {/* Referral moved to its own surface /referral (elevated
                2026-07-19) — the visitor's "How a seat works" + doors carry the
                conversion; the program page itself is /referral when anon. */}

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
