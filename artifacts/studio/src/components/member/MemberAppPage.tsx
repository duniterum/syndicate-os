// components/member/MemberAppPage.tsx
//
// The MEMBER-ACCOUNT app-surface wrapper (CANON_ACCESS_MODEL §C + the WORK-FIRST
// PAGE LAW). Founder rule (2026-07-18): a CONNECTED member page shows NO
// explanatory hero — it opens directly on the work. The explanatory hero is the
// VISITOR's teaser only.
//
//   · NOT signed → the explanatory hero (what this page is) via PublicPage.
//   · Signed (connected) → NO hero; open on the work, full-width (fluid, S7-d).
//
// Resolving defaults to the no-hero/work layout so a member never flashes the
// hero. Session read is entry-safe (useSignedIn dynamically imports the wallet
// modules — rule 15). The body-level gating (e.g. the /wallet sign-in wall) lives
// inside `children`; this wrapper only decides hero-vs-no-hero.

import { type ReactNode } from "react";
import { PublicPage } from "@/components/PublicPage";
import { useSignedIn } from "@/lib/useSignedIn";

interface MemberAppPageProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  badge?: ReactNode;
  children: ReactNode;
}

export function MemberAppPage({ eyebrow, title, lead, badge, children }: MemberAppPageProps) {
  const { signedIn, checking } = useSignedIn();

  if (signedIn || checking) {
    // Connected → straight to the work, no explanatory hero, fluid full-width.
    return <div className="w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">{children}</div>;
  }

  // Not connected → the explanatory hero (the teaser of what the account is).
  return (
    <PublicPage variant="app" eyebrow={eyebrow} title={title} lead={lead} badge={badge}>
      {children}
    </PublicPage>
  );
}
