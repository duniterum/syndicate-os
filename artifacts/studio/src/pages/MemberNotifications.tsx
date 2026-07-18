// pages/MemberNotifications.tsx — /notifications (NOTIF-1; recomposed
// 2026-07-18 after the founder's AAA rejection of the marketing-hero cut).
// THE WORK-FIRST PAGE LAW applied: this is a WORK surface, not a marketing
// surface — a compact identity band (the dashboard's own band pattern, h1
// for SEO, ONE short context line) and then THE INBOX immediately. No
// full-screen hero, no duplicated lead, no static lifecycle badge (the old
// "Sign in required" badge lied to a signed-in member — the panel's honest
// states carry the truth instead).
// FLAT route deliberately (/member/notifications would create a member/
// directory in the built output and resurrect the 2.0 trailing-slash
// redirect on /member). The no-email canon: this page is the channel of
// record — the protocol never emails.

import { lazy, Suspense } from "react";
import { MemberShell } from "@/components/member/MemberShell";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";

const MemberNotificationsPanel = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberNotificationsPanel"))
  : null;

export default function MemberNotifications() {
  return (
    <div className="w-full">
      {/* Compact band — the dashboard's own header pattern, never a hero. */}
      <section className="relative overflow-hidden border-b border-border/50 bg-background py-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
            Notifications
          </p>
          {/* No static lifecycle badge here BY DECISION: every candidate lied
              in some state ("Sign in required" to a signed member; "signed
              from your wallet" for a session act). The page's honesty is
              STATE-AWARE and lives in the panel (guard-lifecycle-labels
              exempts this page and pins the panel's states instead). */}
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Your inbox
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Messages to you and announcements to all members. The protocol
            never emails — real messages from the Syndicate appear only here.
          </p>
        </div>
      </section>

      {/* THE WORK — the inbox itself, immediately. */}
      <section className="py-10 md:py-12">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <MemberShell>
            {MemberNotificationsPanel ? (
              <Suspense fallback={null}>
                <MemberNotificationsPanel />
              </Suspense>
            ) : null}
          </MemberShell>
        </div>
      </section>
    </div>
  );
}
