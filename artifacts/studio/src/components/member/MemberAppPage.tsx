// components/member/MemberAppPage.tsx
//
// THE GENERAL member-surface wrapper (CANON_ACCESS_MODEL §C/§H + WORK-FIRST +
// the shell-continuity rule). ONE component every member-door page uses — swap
// its <PublicPage> for <MemberAppPage> and it inherits the whole pattern; no
// per-page logic. Change it here and every member surface follows.
//
//   · Signed (connected) → the page renders INSIDE the member shell (the "Your
//     doors" sidebar stays — you never leave the dashboard), fluid full-width
//     (S7-d). NO big marketing hero.
//   · NOT signed → the standalone public page: the explanatory hero (the
//     visitor's teaser), full-width, NO member sidebar (a visitor has no doors;
//     Google/prerender stays anonymous → untouched). The shell rides ONLY a
//     member DOOR and ONLY when connected — honouring MemberShell's "not trapped
//     in a bubble" + "prerender untouched" concerns.
//
// `kind` picks the two remaining differences, and the SSR/resolve default:
//   · "content" (default) — a PUBLIC content door (Chronicle/Activity/…). It is
//     SEO-prerendered, so it resolves to the PUBLIC hero (the prerender keeps its
//     title/lead). When a signed member views it, it renders in the shell with a
//     LIGHT header (title + lead + badge kept — that framing is real content,
//     useful to everyone), never the giant hero.
//   · "account" — a PRIVATE account/dashboard surface (/wallet, /toolkit): not an
//     SEO page, so it resolves to the WORK layout (a signed member never flashes
//     the hero) and, connected, opens STRAIGHT on the work — NO header at all
//     ("aucun texte au dessus").
//
// Session read is entry-safe (useSignedIn dynamically imports the wallet modules
// — rule 15). Body-level gating (e.g. the /wallet sign-in wall) lives in `children`.

import { type ReactNode } from "react";
import { PublicPage } from "@/components/PublicPage";
import { MemberShell } from "@/components/member/MemberShell";
import { useSignedIn } from "@/lib/useSignedIn";

interface MemberAppPageProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  badge?: ReactNode;
  children: ReactNode;
  kind?: "content" | "account";
}

export function MemberAppPage({ eyebrow, title, lead, badge, children, kind = "content" }: MemberAppPageProps) {
  const { signedIn, checking } = useSignedIn();
  const account = kind === "account";
  const showWork = signedIn || (checking && account);

  if (showWork) {
    // Connected → in the shell, full-width. Content doors keep a LIGHT header;
    // account surfaces open straight on the work.
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <MemberShell>
          {!account ? (
            <header className="mb-8">
              {eyebrow ? (
                <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-2">
                  {eyebrow}
                </p>
              ) : null}
              {badge ? <div className="mb-3">{badge}</div> : null}
              <h1 className="type-h2 text-foreground">{title}</h1>
              {lead ? (
                <p className="type-body text-muted-foreground max-w-3xl mt-3">{lead}</p>
              ) : null}
            </header>
          ) : null}
          {children}
        </MemberShell>
      </div>
    );
  }

  // Not connected → standalone public page: explanatory hero, no member sidebar.
  return (
    <PublicPage variant="app" eyebrow={eyebrow} title={title} lead={lead} badge={badge}>
      {children}
    </PublicPage>
  );
}
