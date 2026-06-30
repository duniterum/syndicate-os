import { Link } from "wouter";
import { ShieldCheck } from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  sourceAttribution,
  sourceAttributionLifecycle,
  sourceDisclaimer,
} from "@/config/sourceAttributionTerminology";
import { ctas } from "@/config/sharedCopy";

export default function SourceAttribution() {
  return (
    <PublicPage
      eyebrow="Verified introductions"
      title={sourceAttribution.heading}
      lead={sourceAttribution.intro}
      badge={<LifecycleBadge lifecycle={sourceAttributionLifecycle} />}
    >
      <p className="text-lg text-foreground/90 font-light max-w-2xl mb-12">{sourceAttribution.tagline}</p>

      <h2 className="text-xl font-light tracking-tight text-foreground mb-5">The model</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
        {sourceAttribution.model.map((step, i) => (
          <Card key={step.title} className="bg-card/40 border-border/50 p-5">
            <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-base font-medium text-foreground mt-2 mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-light tracking-tight text-foreground mb-5">Boundaries</h2>
      <Card className="bg-card/20 border-border/50 p-6 mb-10">
        <ul className="space-y-3">
          {sourceAttribution.boundaries.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 flex items-start gap-3 mb-12">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{sourceDisclaimer}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={ctas.viewRecognition.href}>
          <Button>{ctas.viewRecognition.label}</Button>
        </Link>
        <Link href={ctas.viewStatus.href}>
          <Button variant="outline">{ctas.viewStatus.label}</Button>
        </Link>
      </div>
    </PublicPage>
  );
}
