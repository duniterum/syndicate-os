import { LifeBuoy } from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { supportIntake } from "@/config/supportIntake";

export default function Support() {
  return (
    <PublicPage
      eyebrow="Help & review"
      title={supportIntake.heading}
      lead={supportIntake.intro}
      badge={<LifecycleBadge lifecycle="NOT_ACTIVE" />}
    >
      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 flex items-start gap-3 mb-12">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
          <LifeBuoy className="h-4 w-4" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{supportIntake.note}</p>
      </div>

      <h2 className="text-xl font-light tracking-tight text-foreground mb-5">What you'll be able to raise</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
        {supportIntake.channels.map((c) => (
          <Card key={c.id} className="bg-card/40 border-border/50 p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-base font-medium text-foreground">{c.label}</h3>
              <LifecycleBadge lifecycle={c.lifecycle} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-light tracking-tight text-foreground mb-5">How requests would be triaged</h2>
      <Card className="bg-card/20 border-border/50 p-6">
        <ol className="space-y-4">
          {supportIntake.triage.map((t, i) => (
            <li key={t.state} className="flex items-start gap-4">
              <span className="font-mono text-xs text-primary mt-0.5 w-6 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h4 className="text-sm font-medium text-foreground">{t.label}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{t.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </PublicPage>
  );
}
