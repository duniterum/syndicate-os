import { lazy, Suspense } from "react";
import { Link } from "wouter";
import {
  Wallet,
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
import { AccessStateChip } from "@/components/access/AccessStateChip";
import { useAccessState } from "@/components/access/AccessStateProvider";
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
  const accessState = useAccessState();
  const authLive = useAuthAvailability() === "live";

  return (
    <PublicPage
      eyebrow="Member Home"
      title={memberAccess.heading}
      lead={memberAccess.intro}
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      {/* Member Home headline — the "Your Seat" identity strip. Renders only for
          a signed-in wallet (own-row); a visitor sees the content below as before. */}
      {authLive && MemberYourSeat ? (
        <Suspense fallback={null}>
          <div className="mb-8">
            <MemberYourSeat />
          </div>
        </Suspense>
      ) : null}
      {/* Identity ribbon — wallet-as-identity doctrine + the live session state.
          The chip reflects the app-wide access state (S1 fail-closed default,
          S4 after a signed session); it is vocabulary, never evidence. */}
      <Card className="bg-primary/5 border-primary/20 p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-md bg-primary/10 text-primary shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 className="text-base font-medium text-foreground">
                Your wallet is your identity key
              </h2>
              <AccessStateChip stateId={accessState} />
            </div>
            <ul className="space-y-3">
              {memberAccess.points.map((point) => (
                <li key={point} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* One-button wallet connect (Phase 1): RainbowKit connects AND signs
          in (SIWE) against /api/auth in a single flow. Session ≠ membership.
          While the auth zone is dark, the entry shows a calm "coming soon"
          state instead of a sign-in that would 404. */}
      <div className="mb-6">
        {authLive ? <ConnectButton showBalance={false} /> : <WalletAuthComingSoon />}
      </div>

      {/* Status centerpiece — the ONE live surface of Member Home: public
          wallet session + standing self-readback. Mounted only when the auth
          zone is live, so a dark zone never renders the sign-in panel. */}
      {authLive && WalletSessionPanel ? (
        <Suspense fallback={null}>
          <WalletSessionPanel />
        </Suspense>
      ) : null}

      {/* Quick actions — real surfaces only; the receipt readback is honestly
          absent (no adapter), so it renders as a labelled non-link. */}
      <div className="flex flex-wrap items-center gap-3 mb-12">
        <Link href={ctas.requestSeat.href}>
          <Button>{ctas.requestSeat.label}</Button>
        </Link>
        <Link href={ctas.buildLink.href}>
          <Button variant="outline">{ctas.buildLink.label}</Button>
        </Link>
        <Link href={ctas.viewStatus.href}>
          <Button variant="outline">{ctas.viewStatus.label}</Button>
        </Link>
        <span className="inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
          View your receipt
          <LifecycleBadge lifecycle="PENDING_ADAPTER" />
        </span>
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
          <FacetPanel facet={facets.source} />
          <MemberReferralDashboard />
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

      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl pt-6 border-t border-border/50">
        {expectations.body}
      </p>
    </PublicPage>
  );
}
