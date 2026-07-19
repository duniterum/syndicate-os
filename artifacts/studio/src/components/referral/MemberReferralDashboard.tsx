// components/referral/MemberReferralDashboard.tsx
//
// The member-facing referral dashboard — REAL figures only (S7 truth sweep,
// 2026-07-16), now TABBED (slice 2 of the referral arc, founder GO
// 2026-07-19): five deep-linkable tabs at real sub-routes
// (/referral · /referral/{introductions,commissions,ladder,link} — the URL
// decides the tab; refresh/back/bookmark/share all land right).
//
// Composition law (REFERRAL_PAGE_DESIGN canon):
//   · The FOUR FIGURES stay ABOVE the tab strip — the money is never behind
//     a tab (Visibility Law). The honest three-state block replaces them
//     whenever the member's own read has not answered.
//   · UNDERLINE text tabs (level-2 nav — distinct from the left doors and
//     from in-card pill lenses), gold underline: shape + weight, never
//     colour alone; aria-current marks the active tab.
//   · Content lives in the five panel components (components/referral/
//     Referral*Panel.tsx); the standing is read ONCE here and passed down,
//     so the panels can never drift apart on the same wallet's truth.

import { Link } from "wouter";
import { useAccount } from "wagmi";
import { useGetProtocolVerifyLinks } from "@workspace/api-client-react";
import { ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card/StatCard";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { referralProgram } from "@/config/referralProgram";
import {
  humanReadFailure,
  usd,
  useOwnSourceStanding,
  type StandingReadback,
} from "@/components/referral/referralStanding";
import { ReferralLinkHero } from "@/components/referral/ReferralLinkHero";
import { ReferralOverviewPanel } from "@/components/referral/ReferralOverviewPanel";
import { ReferralIntroductionsPanel } from "@/components/referral/ReferralIntroductionsPanel";
import { ReferralCommissionsPanel } from "@/components/referral/ReferralCommissionsPanel";
import { ReferralLadderPanel } from "@/components/referral/ReferralLadderPanel";
import { ReferralLinkPanel } from "@/components/referral/ReferralLinkPanel";

export type ReferralTabId =
  | "overview"
  | "introductions"
  | "commissions"
  | "ladder"
  | "link";

const TABS: { id: ReferralTabId; label: string; href: string }[] = [
  { id: "overview", label: "Overview", href: "/referral" },
  { id: "introductions", label: "Introductions", href: "/referral/introductions" },
  { id: "commissions", label: "Commissions", href: "/referral/commissions" },
  { id: "ladder", label: "Ladder & recognition", href: "/referral/ladder" },
  // Label "Channels" (2026-07-19): the LINK itself moved above the tabs as
  // the page hero; this tab holds the channel composer + analytics +
  // reference. The route stays /referral/link (registry stability).
  { id: "link", label: "Channels", href: "/referral/link" },
];

// Tab focus indicator: a rounded background TINT, never a boxing ring — the
// offset ring drew a floating rectangle around the active tab the moment any
// key was pressed while it held click-focus (founder-caught: his screenshot
// shortcut lit :focus-visible). WCAG stays satisfied: tint + underline +
// weight mark focus, shape-and-color, never color alone.
const TAB_FOCUS_STYLE =
  "focus-visible:outline-none focus-visible:bg-gold/10 rounded-t-md";

// The four figures — ABOVE the tabs, always (Visibility Law: the money is
// never behind a tab). Three DISTINCT honest states when the read has not
// answered (S7-b — a badge must never claim the wrong reason):
//   · signed in, no source/standing → no badge; the failureReason says it
//   · signed out (S1)               → "Sign in required"
//   · read failed / not loaded      → honest unavailable, nothing assumed
function ReferralFigures({ readback }: { readback: StandingReadback | null }) {
  const { address } = useAccount();
  const { data: verifyData } = useGetProtocolVerifyLinks();
  const s = readback?.standing ?? null;
  if (readback === null || s === null) {
    const signedIn = readback?.state === "S4";
    return (
      <Card className="bg-card/40 border-border/50 p-5 mt-6">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">Your introduction standing</span>
          {readback !== null && !signedIn ? (
            <LifecycleBadge lifecycle="AUTH_REQUIRED" />
          ) : null}
        </div>
        <p
          className="text-sm text-muted-foreground leading-relaxed"
          title={readback?.failureReason ?? undefined}
        >
          {signedIn
            ? (humanReadFailure(readback?.failureReason) ??
              "No referral standing exists for this wallet yet — a new source is a founder-signed on-chain act.")
            : readback !== null
              ? "The standing read is live — sign in with your wallet to see your own. No figure is shown without the read."
              : "The standing read is unavailable right now — nothing is assumed, nothing is invented."}
        </p>
      </Card>
    );
  }
  // Verify-first on the money figures: the wallet's own explorer page, where
  // every commission arrival is independently checkable. The origin derives
  // from the served registry verify link (never hardcoded); no link renders
  // until both resolve (fail closed — never a dead click).
  const registryUrl =
    verifyData?.links?.find((l) => l.id === "sourceRegistry")?.url ?? null;
  const explorerOrigin = registryUrl
    ? (registryUrl.match(/^https?:\/\/[^/]+/)?.[0] ?? null)
    : null;
  const ownAddressUrl =
    explorerOrigin && address ? `${explorerOrigin}/address/${address}` : null;
  const verifyOwn = ownAddressUrl ? (
    <a
      href={ownAddressUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="font-mono text-xs text-proof hover:text-proof/80 underline underline-offset-2"
    >
      verify ↗
    </a>
  ) : undefined;
  // Centered tiles (founder, 2026-07-19): label, figure and verify all
  // center-aligned. Scoped here via className — the shared StatCard atom
  // keeps its default left alignment everywhere else. ([&>div]:justify-center
  // centers the label's flex row; it is inert on the block-level value/meta
  // rows, which text-center handles.)
  const CENTERED = "text-center [&>div]:justify-center";
  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Introductions" className={CENTERED}>{String(s.introducedMembers)}</StatCard>
        <StatCard label="Durable introductions" className={CENTERED}>{String(s.durableIntroductions)}</StatCard>
        <StatCard label="Commission paid" tone="identity" meta={verifyOwn} className={CENTERED}>
          {usd(s.commissionPaidRaw)}
        </StatCard>
        <StatCard label="Held in escrow" tone="identity" meta={verifyOwn} className={CENTERED}>
          {usd(s.escrowOwedRaw)}
        </StatCard>
      </div>
      {/* D-TRUTH D2: when the standing resolved through the founder-signed
          fallback, say so — these figures belong to that source, not to the
          wallet's canonical link (which the link card derives separately). */}
      {readback?.sourceOrigin === "founder-signed" ? (
        <p className="text-sm text-muted-foreground leading-relaxed mt-3">
          These figures are the record of your founder-signed source — the
          source whose commission is paid to this wallet. The referral-link
          card shows your wallet&apos;s canonical link, which is its own
          separate source.
        </p>
      ) : null}
    </div>
  );
}

export function MemberReferralDashboard({ tab = "overview" }: { tab?: ReferralTabId }) {
  const readback = useOwnSourceStanding();
  const s = readback?.standing ?? null;

  return (
    <div>
      {/* The component owns its heading (title + lifecycle + framing) so it can
          never be duplicated by whoever mounts it — fixes the h2+h3 stutter. */}
      {/* No top margin: the dashboard IS the page now (the mt-8 was a relic
          of the embedded-in-/member era; founder 2026-07-19: start high). */}
      <div className="mb-1 flex flex-wrap items-center gap-3">
        <h2 className="type-h2 text-foreground">Your referral</h2>
        <LifecycleBadge lifecycle={referralProgram.lifecycle} />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-2">
        The people you brought in, your standing, and the Connector ladder.
      </p>

      <Card className="bg-gold/5 border-gold/30 p-4">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-md bg-gold/10 text-gold shrink-0 mt-0.5">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground mb-0.5">{referralProgram.statusCopy.status}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every figure below is your own — indexed introductions and live
              registry reads, only ever your own row. Never a sample.
            </p>
          </div>
          {s ? (
            <span className="ml-auto shrink-0 self-center font-mono text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
              recorded up to block {s.asOfBlock.toLocaleString("en-US")}
            </span>
          ) : null}
        </div>
      </Card>

      {/* THE LINK — the page's hero utility, above the tabs, visible on
          EVERY tab, exactly ONCE (founder structure order 2026-07-19: "a new
          member wants to see the LINK immediately"). */}
      <ReferralLinkHero readback={readback} />

      {/* THE FOUR FIGURES — above the tabs, always. */}
      <ReferralFigures readback={readback} />

      {/* THE TAB STRIP — underline tabs at real sub-routes; the URL decides.
          Structure note: the baseline is an ABSOLUTE hairline under the nav
          (never a border on the scroll container) and the nav hides its
          scrollbars while staying swipeable — the earlier -mb-px underline
          overflowed the container by 1px and Windows rendered a stray mini
          scrollbar beside the tabs (founder-caught in prod). */}
      <div className="relative mt-6 mb-6">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-border/50" />
        <nav
          aria-label="Referral sections"
          className="flex gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {TABS.map((t) => {
            const active = t.id === tab;
            return (
              <Link
                key={t.id}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 shrink-0 whitespace-nowrap px-3 py-2.5 border-b-2 text-sm transition-colors ${TAB_FOCUS_STYLE} ${
                  active
                    ? "border-gold text-foreground font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`referral-tab-${t.id}`}
              >
                {t.label}
                {t.id === "introductions" && s ? (
                  <span className="font-mono text-xs rounded-full bg-border/40 px-1.5">
                    {s.introducedMembers}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {tab === "overview" ? <ReferralOverviewPanel readback={readback} /> : null}
      {tab === "introductions" ? <ReferralIntroductionsPanel readback={readback} /> : null}
      {tab === "commissions" ? <ReferralCommissionsPanel readback={readback} /> : null}
      {tab === "ladder" ? <ReferralLadderPanel readback={readback} /> : null}
      {tab === "link" ? <ReferralLinkPanel readback={readback} /> : null}
    </div>
  );
}
