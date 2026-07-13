import { lazy, Suspense } from "react";
import { Link } from "wouter";
import {
  Users,
  Network,
  Award,
  Library,
  ScrollText,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MemberShell } from "@/components/member/MemberShell";
import { MEMBER_HOME_RESERVED_SLOTS } from "@/config/memberDoors";
import { MemberQuickActions } from "@/components/member/MemberQuickActions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { type DisplayLifecycle } from "@/config/truthStatus";
import { memberAccess, membershipIdentity, expectations } from "@/config/syndicateFacts";
import { MemberReferralDashboard } from "@/components/referral/MemberReferralDashboard";
import { WalletAuthComingSoon } from "@/components/WalletAuthComingSoon";
import { useAuthAvailability } from "@/lib/authAvailability";
import { ctas } from "@/config/sharedCopy";

// Wallet session gate: the public SIWE session panel (session + standing
// self-readback) is reachable ONLY through this conditional dynamic import.
// The gate now ships enabled in production-default builds (Public Online
// Integration MVP) — it remains a build-time seam, never security.
const WalletSessionPanel = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/WalletSessionPanel"))
  : null;

// Member Home §4 block 1 — the "Your Seat" identity strip (headline). Same
// lazy, flag-gated wallet-boundary pattern as the panel above.
const MemberYourSeat = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberYourSeat"))
  : null;

// SLICE B — the UI-only settings panel (zero new writes; honest rows). Same
// rule-15 lazy wallet-boundary pattern; anchored so the header menu links it.
const MemberSettings = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberSettings"))
  : null;

interface CockpitFacet {
  icon: LucideIcon;
  title: string;
  body: string;
  lifecycle: DisplayLifecycle;
  links?: { label: string; href: string }[];
}

// What Member Home resolves, facet by facet. Lifecycles are honest: the
// seat is the active engine's own figure read back for YOUR signed wallet
// (live, read-only); attribution readback awaits its adapter; recognition is
// a future concept; archive holdings are protocol memory, never a seat or a
// financial right. Nothing below is simulated — absent adapters say so.
const facets = {
  seat: {
    icon: Users,
    title: "Your seat",
    body: "Read live from the active engine for your signed wallet — sign a session in the panel above and your seat is the engine's own recognition figure, read-only and exact. No directory of other wallets is served.",
    lifecycle: "READ_ONLY_PROOF",
  } as CockpitFacet,
  receipt: {
    icon: ScrollText,
    title: "Proof receipts",
    body: "Your membership and contribution proofs, read from on-chain source once the receipt adapter exists. Until then no receipt is displayed here — a receipt shown without its adapter would be an invented value.",
    lifecycle: "PENDING_ADAPTER",
  } as CockpitFacet,
  source: {
    icon: Network,
    title: "Attribution origin",
    body: "The verified introduction behind your join. As a source, an eligible completed introduction can carry a transparent referral commission (paused today) and, over time, non-financial recognition — never passive income, never a profit promise. Introduction links validate read-only on the source builder; your own attribution readback is not yet served.",
    lifecycle: "PENDING_ADAPTER",
    links: [ctas.buildLink, ctas.exploreSource],
  } as CockpitFacet,
  activity: {
    icon: Activity,
    title: "Your activity",
    body: "Verified protocol events tied to your wallet become your public, shareable proof of participation. The event adapter is not wired — no feed is served, and none is simulated.",
    lifecycle: "PENDING_ADAPTER",
    links: [ctas.verifyProof],
  } as CockpitFacet,
  recognition: {
    icon: Award,
    title: "Recognition standing",
    body: "Structural recognition of your verified participation — a future concept, never a financial benefit. The recognition model is documented today; no standing figure is computed anywhere yet.",
    lifecycle: "FUTURE",
    links: [ctas.viewRecognition],
  } as CockpitFacet,
  archive: {
    icon: Library,
    title: "Archive holdings",
    body: "Any archive artifacts tied to your wallet. Artifacts are protocol memory — never a membership seat or a financial right. Archive reads are not wired; the public archive doctrine is.",
    lifecycle: "PENDING_ADAPTER",
    links: [ctas.viewArchive],
  } as CockpitFacet,
};

/** One honest facet panel — never renders data it does not have. */
function FacetPanel({ facet }: { facet: CockpitFacet }) {
  const Icon = facet.icon;
  return (
    <Card className="bg-card/40 border-border/50 p-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <LifecycleBadge lifecycle={facet.lifecycle} />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1.5">{facet.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{facet.body}</p>
      {facet.links && facet.links.length > 0 ? (
        <div className="flex flex-wrap gap-3 mt-4">
          {facet.links.map((cta) => (
            <Link key={cta.href} href={cta.href}>
              <Button variant="outline" size="sm">
                {cta.label}
              </Button>
            </Link>
          ))}
        </div>
      ) : null}
    </Card>
  );
}

export default function MemberAccess() {
  const authLive = useAuthAvailability() === "live";

  return (
    <PublicPage
      eyebrow="Member Home"
      title={memberAccess.heading}
      lead={memberAccess.intro}
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      {/* MEMBER SHELL (two-shells rule): THIS PAGE chooses the member shell —
          the left sidebar of member doors. Public pages keep the public shell;
          the prerender sees the same static doors (locked-visible, honest). */}
      <MemberShell>
      {/* Member Home headline — the "Your Seat" identity strip. Renders only for
          a signed-in wallet (own-row); a visitor sees the content below as before.
          Carries the receipt (moved from the session panel), the live SYN
          balance, and the Chapter line (MEMBER SHELL slice fold-ins). */}
      {authLive && MemberYourSeat ? (
        <Suspense fallback={null}>
          <div className="mb-8">
            <MemberYourSeat />
          </div>
        </Suspense>
      ) : null}
      {/* The old "identity ribbon" card (wallet-as-identity copy + raw access
          chip) is RETIRED — the Your Seat strip IS the identity surface now
          (one truth, zero twins). */}

      {/* One-button wallet connect (Phase 1): RainbowKit connects AND signs
          in (SIWE) against /api/auth in a single flow. Session ≠ membership.
          While the auth zone is dark, the entry shows a calm "coming soon"
          state instead of a sign-in that would 404. */}
      <div className="mb-6">
        {authLive ? <ConnectButton showBalance={false} /> : <WalletAuthComingSoon />}
      </div>

      {/* Session panel — sign-in + standing self-readback (the receipt now
          lives in the strip above). */}
      {authLive && WalletSessionPanel ? (
        <Suspense fallback={null}>
          <WalletSessionPanel />
        </Suspense>
      ) : null}

      {/* Quick actions — rendered FROM the registry (config/memberActions.ts,
          §4.3): locked actions stay visible with their plain reason; operator
          actions do not exist in the registry. Replaces the old static row. */}
      <div className="mb-12">
        <MemberQuickActions />
      </div>

      {/* The referral dashboard — MOVED out of the Source tab to a first-class
          anchored section (the sidebar door targets it; ladder law: visible
          progress everywhere; moved, never duplicated). */}
      <section id="referral-dashboard" className="mb-12 scroll-mt-24">
        <h2 className="type-h2 text-foreground mb-1">Your referral</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-2">
          Your introductions, your indexed standing, and the Connector ladder.
        </p>
        <MemberReferralDashboard />
      </section>

      {/* SEASONS_ENGINE §11 slots 3–5 — RESERVED VISIBLY (wireframe v2, agreed
          with the founder): the season card, quests, and "while you were away"
          land here in Phase 5 / with the event backbone. Coming-soon on the
          EXISTING posture system; nothing simulated, nothing hidden. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-12">
        {MEMBER_HOME_RESERVED_SLOTS.map((slot) => (
          <Card key={slot.label} className="bg-card/30 border-border/50 border-dashed p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-muted-foreground">{slot.label}</span>
              {slot.lifecycle ? <LifecycleBadge lifecycle={slot.lifecycle} /> : null}
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug">{slot.note}</p>
          </Card>
        ))}
      </div>

      {/* Member Home tabs — state-only (no URL sync); every tab is an honest
          facet: live where wired, explicitly absent where not. */}
      <Tabs defaultValue="overview" className="mb-12">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="seat">Seat &amp; Receipt</TabsTrigger>
          <TabsTrigger value="source">Source</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="recognition">Recognition</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <h2 className="type-h2 text-foreground mb-2">
            {membershipIdentity.heading}
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-6">
            {membershipIdentity.lead}
          </p>
          <ol className="space-y-3">
            {membershipIdentity.stages.map((stage) => (
              <li key={stage.step}>
                <Card className="bg-card/40 border-border/50 p-5">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-xs text-primary/70 pt-0.5 shrink-0 w-6">
                      {stage.step}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h3 className="text-base font-medium text-foreground">{stage.title}</h3>
                        <LifecycleBadge lifecycle={stage.lifecycle} />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{stage.body}</p>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="seat" className="mt-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <FacetPanel facet={facets.seat} />
            <FacetPanel facet={facets.receipt} />
          </div>
        </TabsContent>

        <TabsContent value="source" className="mt-6">
          {/* The dashboard moved to the anchored #referral-dashboard section
              above (the sidebar door's target) — moved, never duplicated. */}
          <FacetPanel facet={facets.source} />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <FacetPanel facet={facets.activity} />
        </TabsContent>

        <TabsContent value="recognition" className="mt-6">
          <FacetPanel facet={facets.recognition} />
        </TabsContent>

        <TabsContent value="archive" className="mt-6">
          <FacetPanel facet={facets.archive} />
        </TabsContent>
      </Tabs>

      <h2 className="text-base font-medium text-foreground mb-4">Verify the foundation</h2>
      <div className="flex flex-wrap gap-3 mb-12">
        {[ctas.viewStatus, ctas.viewContracts, ctas.getSupport, ctas.learn].map((cta) => (
          <Link key={cta.href} href={cta.href}>
            <Button variant="outline">{cta.label}</Button>
          </Link>
        ))}
      </div>

      {/* SLICE B — Settings (anchored: the header member menu links here). */}
      {authLive && MemberSettings ? (
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
    </PublicPage>
  );
}
