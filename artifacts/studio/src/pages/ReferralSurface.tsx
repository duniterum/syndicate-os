// pages/ReferralSurface.tsx
//
// /referral — the ELEVATED member referral surface (access-model fork; the
// same discipline as MemberAppPage, but /referral's anon and connected CONTENT
// differ, so it forks explicitly rather than sharing children):
//   · Connected  → the referral dashboard INSIDE the member shell (WORK-FIRST;
//     the "Your doors" sidebar stays — you never leave the dashboard).
//   · NOT signed (incl. Google / the 2.0 prerender) → the public program page
//     (SourceAttribution), untouched → SEO stays exactly as it was.
//
// SLICE 2 (the 5 tabs, founder GO 2026-07-19): the dashboard is TABBED at
// real deep-linkable sub-routes — /referral (Overview) ·
// /referral/{introductions,commissions,ladder,link}. Each sub-route mounts
// this same fork with its `tab`; the anonymous branch always serves the
// public program page (the sub-routes are REDIRECT-class in the SEO
// registry, canonical → /referral — Google consolidates, links never break).
//
// Entry-safe: useSignedIn dynamically imports the wallet modules (guard-access-
// state rule 15 — App.tsx is the only static @/wallet reach; this page is not).

import { useSignedIn } from "@/lib/useSignedIn";
import { MemberShell } from "@/components/member/MemberShell";
import {
  MemberReferralDashboard,
  type ReferralTabId,
} from "@/components/referral/MemberReferralDashboard";
import SourceAttribution from "@/pages/SourceAttribution";

export default function ReferralSurface({ tab = "overview" }: { tab?: ReferralTabId }) {
  const { signedIn } = useSignedIn();

  if (signedIn) {
    // Connected → in the member shell, full-width, work-first (S7-d).
    // Top padding TIGHT (founder 2026-07-19: the work starts high — 24/32px,
    // not 40/56px; bottom keeps the scroll comfort), matching MemberAppPage.
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 md:pt-8 pb-10 md:pb-14">
        <MemberShell>
          <MemberReferralDashboard tab={tab} />
        </MemberShell>
      </div>
    );
  }

  // Not connected (and the anonymous prerender) → the public program page.
  // Google never sees the shell; the prerendered head/lead stay untouched.
  return <SourceAttribution />;
}
