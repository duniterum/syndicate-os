import { lazy, Suspense } from "react";
import { Link } from "wouter";
import {
  Wallet,
  Users,
  Network,
  Award,
  Library,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";
import { PublicPage } from "@/components/PublicPage";
import { TruthLabel, type TruthLabelVariant } from "@/components/TruthLabel";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type DisplayLifecycle } from "@/config/truthStatus";
import { getModuleById } from "@/config/modules";
import { memberAccess, membershipIdentity, expectations } from "@/config/syndicateFacts";
import { ctas } from "@/config/sharedCopy";

// Wallet session hard gate (S2): the dev-only SIWE session panel is
// reachable ONLY through this conditional dynamic import — default
// production builds dead-code-eliminate the wallet module entirely.
const WalletSessionPanel = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/WalletSessionPanel"))
  : null;

interface CockpitItem {
  icon: LucideIcon;
  title: string;
  body: string;
  lifecycle: DisplayLifecycle;
}

// What the Member OS resolves once the indexer is wired. Lifecycles are honest:
// the seat is DERIVED from a verified receipt (pending the indexer), not granted
// by hand; source attribution is paused upstream; recognition is a future
// concept; archive holdings are protocol memory, never a seat or financial right.
const cockpit: CockpitItem[] = [
  {
    icon: Users,
    title: "Your seat",
    body: "Derived from a verified Membership Sale receipt resolved through the Holder Index — never granted by hand. The membership indexer is not wired here yet.",
    lifecycle: "PENDING_ADAPTER",
  },
  {
    icon: Network,
    title: "Attribution origin",
    body: "The verified introduction behind your join — recognition of who opened the door, never a payment. The source registry is paused by precaution.",
    lifecycle: "PAUSED_BY_PRECAUTION",
  },
  {
    icon: Award,
    title: "Recognition standing",
    body: "Structural recognition of your verified participation — a future concept, never a financial benefit or reward.",
    lifecycle: "FUTURE",
  },
  {
    icon: Library,
    title: "Archive holdings",
    body: "Any archive artifacts tied to your wallet. Artifacts are protocol memory — never a membership seat or a financial right. Archive reads are not wired.",
    lifecycle: "PENDING_ADAPTER",
  },
  {
    icon: ScrollText,
    title: "Proof receipts",
    body: "Your membership and contribution proofs, read from on-chain source once the adapter exists.",
    lifecycle: "PENDING_ADAPTER",
  },
];

// Cross-links to proof surfaces that actually exist in this foundation. We never
// link to /my-syndicate, /wallet/:address, /member/:number or /join here —
// those routes are not built in this read-only app, so linking them would imply
// a live system that does not exist.
const proofLinks = [
  ctas.viewStatus,
  ctas.viewContracts,
  ctas.viewRecognition,
  ctas.exploreSource,
];

export default function MemberAccess() {
  const module = getModuleById("member");
  const label: TruthLabelVariant = module?.truthStatus ?? "AWAITING_FOUNDER_APPROVAL";

  return (
    <PublicPage
      eyebrow="Membership"
      title={memberAccess.heading}
      lead={memberAccess.intro}
      badge={<TruthLabel variant={label} />}
    >
      {/* Wallet-as-identity doctrine — the recovered core of the organism */}
      <Card className="bg-primary/5 border-primary/20 p-6 mb-12">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-md bg-primary/10 text-primary shrink-0">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-medium text-foreground mb-3">
              Your wallet is your identity key
            </h2>
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

      {/* Dev-only wallet session shell (S2) — absent from production builds */}
      {WalletSessionPanel ? (
        <Suspense fallback={null}>
          <WalletSessionPanel />
        </Suspense>
      ) : null}

      {/* The identity pipeline: wallet → receipt → index → derived facts → OS → proof */}
      <h2 className="text-xl font-light tracking-tight text-foreground mb-2">
        {membershipIdentity.heading}
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-6">
        {membershipIdentity.lead}
      </p>
      <ol className="space-y-3 mb-12">
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

      <h2 className="text-xl font-light tracking-tight text-foreground mb-5">What your Member OS will resolve</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {cockpit.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.title} className="bg-card/40 border-border/50 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <LifecycleBadge lifecycle={c.lifecycle} />
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
            </Card>
          );
        })}
      </div>

      <h2 className="text-base font-medium text-foreground mb-4">Verify the foundation</h2>
      <div className="flex flex-wrap gap-3 mb-4">
        {proofLinks.map((cta) => (
          <Link key={cta.href} href={cta.href}>
            <Button variant="outline">{cta.label}</Button>
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mb-12">
        <Link href={ctas.getSupport.href}>
          <Button>{ctas.getSupport.label}</Button>
        </Link>
        <Link href={ctas.learn.href}>
          <Button variant="outline">{ctas.learn.label}</Button>
        </Link>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl pt-6 border-t border-border/50">
        {expectations.body}
      </p>
    </PublicPage>
  );
}
