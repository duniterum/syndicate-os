import { ExternalLink, LifeBuoy } from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { supportIntake } from "@/config/supportIntake";
import { socialLinks } from "@/config/brand";

export default function Support() {
  return (
    <PublicPage
      eyebrow="Help & review"
      title={supportIntake.heading}
      lead={supportIntake.intro}
      badge={<LifecycleBadge lifecycle="PREVIEW" />}
      variant="app"
    >
      {/* WORK-FIRST (founder "construis 1-5", 2026-07-30): a help-seeker used
          to land on a dead preview with ZERO live channel — while Terms and
          Privacy both named the live doors. The page now opens on them, from
          brand.ts (the ONE channel source, same as the legal pages). */}
      <h2 className="type-h2 text-foreground mb-2">Reach us today</h2>
      <p className="type-body text-muted-foreground measure mb-5">
        The live doors, today: X and the two official Telegram channels — the
        same channels the legal pages name. Anyone else claiming to speak for
        The Syndicate does not.
      </p>
      <div className="flex flex-wrap gap-3 mb-14">
        {socialLinks.map((s) => (
          <a
            key={s.id}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border/60 bg-card/40 px-4 text-sm font-medium text-foreground transition-colors hover:border-gold/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {s.label}
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          </a>
        ))}
      </div>

      <div className="rounded-lg border border-border/50 bg-muted/20 p-4 flex items-start gap-3 mb-12">
        <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
          <LifeBuoy className="h-4 w-4" />
        </div>
        <p className="type-body text-muted-foreground measure">{supportIntake.note}</p>
      </div>

      <h2 className="type-h2 text-foreground mb-5">What you'll be able to raise</h2>
      <div className="auto-grid gap-5 mb-14">
        {supportIntake.channels.map((c) => (
          <Card key={c.id} className="bg-card/40 border-border/50 p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="type-h3 text-foreground">{c.label}</h3>
              <LifecycleBadge lifecycle={c.lifecycle} />
            </div>
            <p className="type-body text-muted-foreground measure">{c.description}</p>
          </Card>
        ))}
      </div>

      <h2 className="type-h2 text-foreground mb-5">How requests would be triaged</h2>
      <Card className="bg-card/20 border-border/50 p-6">
        <ol className="space-y-4">
          {supportIntake.triage.map((t, i) => (
            <li key={t.state} className="flex items-start gap-4">
              <span className="font-mono text-xs text-primary mt-0.5 w-6 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h4 className="type-h3 text-foreground">{t.label}</h4>
                <p className="type-body text-muted-foreground measure mt-0.5">{t.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </PublicPage>
  );
}
