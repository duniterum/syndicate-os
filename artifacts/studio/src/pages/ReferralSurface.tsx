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
// The Referral door points HERE; /member no longer embeds the referral section
// (one door, one surface — the doors-grid lesson). SLICE 1 (the elevation)
// reuses the proven MemberReferralDashboard as-is, so no new content code ships
// with the route move; the grade-AAA 5-tab split (Overview · Introductions ·
// Commissions · Ladder & recognition · Link & channels) lands next on this
// stable base, at its own real sub-routes.
//
// Entry-safe: useSignedIn dynamically imports the wallet modules (guard-access-
// state rule 15 — App.tsx is the only static @/wallet reach; this page is not).

import { useSignedIn } from "@/lib/useSignedIn";
import { MemberShell } from "@/components/member/MemberShell";
import { MemberReferralDashboard } from "@/components/referral/MemberReferralDashboard";
import SourceAttribution from "@/pages/SourceAttribution";

export default function ReferralSurface() {
  const { signedIn } = useSignedIn();

  if (signedIn) {
    // Connected → in the member shell, full-width, work-first (S7-d).
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <MemberShell>
          <MemberReferralDashboard />
        </MemberShell>
      </div>
    );
  }

  // Not connected (and the anonymous prerender) → the public program page.
  // Google never sees the shell; the prerendered head/lead stay untouched.
  return <SourceAttribution />;
}
