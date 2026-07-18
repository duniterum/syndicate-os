// pages/MemberNotifications.tsx — /notifications (NOTIF-1, founder-approved
// wireframe 2026-07-18). The dedicated notification center behind the member
// bell's "View all". FLAT route deliberately (/member/notifications would
// create a member/ directory in the built output and resurrect the 2.0
// trailing-slash redirect on /member — infra truth wins; the door label stays
// "Notifications"). The no-email canon: in-app is the protocol's ONLY
// channel — this page is the channel of record. AUTH_REQUIRED badge: the
// inbox is own-row and answers only a wallet session; a visitor sees the
// honest sign-in prompt, never sample rows.

import { lazy, Suspense } from "react";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MemberShell } from "@/components/member/MemberShell";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";

const MemberNotificationsPanel = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberNotificationsPanel"))
  : null;

export default function MemberNotifications() {
  return (
    <PublicPage
      eyebrow="Notifications"
      title="Your inbox — the protocol's only channel."
      lead="Messages to you alone and announcements to all members, read with your own wallet session. The protocol never emails: real messages from the Syndicate appear only here, and nothing unread ever expires."
      badge={<LifecycleBadge lifecycle="AUTH_REQUIRED" />}
    >
      <MemberShell>
        {MemberNotificationsPanel ? (
          <Suspense fallback={null}>
            <MemberNotificationsPanel />
          </Suspense>
        ) : null}
      </MemberShell>
    </PublicPage>
  );
}
