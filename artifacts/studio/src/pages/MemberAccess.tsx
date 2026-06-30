import { Link } from "wouter";
import {
  Users,
  Network,
  Award,
  Library,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { TruthLabel, type TruthLabelVariant } from "@/components/TruthLabel";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type DisplayLifecycle } from "@/config/truthStatus";
import { getModuleById } from "@/config/modules";
import { memberAccess, expectations } from "@/config/syndicateFacts";
import { ctas } from "@/config/sharedCopy";

interface CockpitItem {
  icon: LucideIcon;
  title: string;
  body: string;
  lifecycle: DisplayLifecycle;
}

const cockpit: CockpitItem[] = [
  {
    icon: Users,
    title: "Your seat",
    body: "Your verifiable membership record and standing, once a seat can be issued.",
    lifecycle: "FOUNDER_GATED",
  },
  {
    icon: Network,
    title: "Attribution origin",
    body: "The verified introduction behind your join. The source registry is paused today.",
    lifecycle: "NOT_ACTIVE",
  },
  {
    icon: Award,
    title: "Recognition standing",
    body: "Structural recognition of your verified participation — a future concept.",
    lifecycle: "FUTURE",
  },
  {
    icon: Library,
    title: "Archive holdings",
    body: "Any archive artifacts tied to your membership. Archive reads are not wired.",
    lifecycle: "PENDING_ADAPTER",
  },
  {
    icon: ScrollText,
    title: "Proof receipts",
    body: "Your membership and contribution proofs, read from source once adapters exist.",
    lifecycle: "PENDING_ADAPTER",
  },
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
      <Card className="bg-card/20 border-border/50 p-6 mb-12">
        <ul className="space-y-3">
          {memberAccess.points.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </Card>

      <h2 className="text-xl font-light tracking-tight text-foreground mb-5">What the member cockpit will include</h2>
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
