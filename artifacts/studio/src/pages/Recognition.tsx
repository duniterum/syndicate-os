import { Link } from "wouter";
import { PublicPage } from "@/components/PublicPage";
import { TruthLabel } from "@/components/TruthLabel";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { surfaceStatus, type DisplayLifecycle } from "@/config/truthStatus";
import { ctas } from "@/config/sharedCopy";

interface Dimension {
  title: string;
  body: string;
  lifecycle: DisplayLifecycle;
}

const dimensions: Dimension[] = [
  {
    title: "Verified participation",
    body: "Recognition begins with participation that can be verified against source — not self-claimed.",
    lifecycle: "FUTURE",
  },
  {
    title: "Source attribution",
    body: "Who opened the door is acknowledged as a growth contribution. The referral registry is live and paying today; its recognition dimension arrives with the recognition model.",
    lifecycle: "FUTURE",
  },
  {
    title: "Archive memory",
    body: "Contributions that endure become part of the protocol's archive and chronicle.",
    lifecycle: "PENDING_ADAPTER",
  },
  {
    title: "Standing over time",
    body: "Recognition accrues structurally as a record of contribution — a design concept today.",
    lifecycle: "DESIGN_CONCEPT",
  },
];

export default function Recognition() {
  return (
    <PublicPage
      eyebrow="Recognition"
      title="Recognition, not a financial benefit."
      lead="Recognition is structural: it acknowledges verified participation and contribution to The Syndicate. It is never a financial benefit, a security, or a promise of gain — and it is a future concept: no standing figure is computed today."
      badge={<TruthLabel variant={surfaceStatus.recognition} />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
        {dimensions.map((d) => (
          <Card key={d.title} className="bg-card/40 border-border/50 p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-base font-medium text-foreground">{d.title}</h3>
              <LifecycleBadge lifecycle={d.lifecycle} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={ctas.exploreSource.href}>
          <Button>{ctas.exploreSource.label}</Button>
        </Link>
        <Link href={ctas.learn.href}>
          <Button variant="outline">{ctas.learn.label}</Button>
        </Link>
      </div>
    </PublicPage>
  );
}
