import { Link } from "wouter";
import {
  ScrollText,
  Network,
  Flame,
  Library,
  type LucideIcon,
} from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type DisplayLifecycle } from "@/config/truthStatus";
import { ctas, safetyCopy } from "@/config/sharedCopy";

interface ProofFacet {
  icon: LucideIcon;
  title: string;
  body: string;
  lifecycle: DisplayLifecycle;
}

const facets: ProofFacet[] = [
  {
    icon: ScrollText,
    title: "Membership receipts",
    body: "Proof that a seat was taken, read from the membership source — never invented.",
    lifecycle: "PENDING_ADAPTER",
  },
  {
    icon: Network,
    title: "Source attribution",
    body: "Proof of the verified introduction behind a join. The registry is paused by precaution.",
    lifecycle: "NOT_ACTIVE",
  },
  {
    icon: Flame,
    title: "Proof of Fire",
    body: "Burn and contribution events mapped to members, once the event read-model is wired.",
    lifecycle: "PENDING_ADAPTER",
  },
  {
    icon: Library,
    title: "Archive memory",
    body: "Historical protocol artifacts held in the archive. Archive reads are not wired yet.",
    lifecycle: "PENDING_ADAPTER",
  },
];

const steps = [
  {
    n: "01",
    title: "Read from source",
    body: "Every proof is read from a verified contract or registry — never typed in by hand.",
  },
  {
    n: "02",
    title: "Verify against chain",
    body: "Anyone can independently check the same fact against on-chain reality.",
  },
  {
    n: "03",
    title: "Show with provenance",
    body: "Values appear with their source and lifecycle, so you always know how real they are.",
  },
];

export default function ProofDashboard() {
  return (
    <PublicPage
      eyebrow="Public proof"
      title="Proof, when there is something real to prove."
      lead="Public, auditable proof is the point of The Syndicate. This page is an honest account of what proof will cover — and why none of it is wired in this foundation yet."
      badge={<LifecycleBadge lifecycle="PENDING_ADAPTER" />}
    >
      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 text-sm text-muted-foreground leading-relaxed mb-10">
        {safetyCopy.readOnly} {safetyCopy.noFakeData}
      </div>

      <h2 className="type-h2 text-foreground mb-5">What proof will cover</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
        {facets.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="bg-card/40 border-border/50 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <LifecycleBadge lifecycle={f.lifecycle} />
              </div>
              <h3 className="text-base font-medium text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </Card>
          );
        })}
      </div>

      <h2 className="type-h2 text-foreground mb-5">How verification will work</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {steps.map((s) => (
          <Card key={s.n} className="bg-card/40 border-border/50 p-5">
            <span className="font-mono text-xs text-primary">{s.n}</span>
            <h3 className="text-base font-medium text-foreground mt-2 mb-1">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={ctas.viewStatus.href}>
          <Button>{ctas.viewStatus.label}</Button>
        </Link>
        <Link href={ctas.viewContracts.href}>
          <Button variant="outline">{ctas.viewContracts.label}</Button>
        </Link>
      </div>
    </PublicPage>
  );
}
