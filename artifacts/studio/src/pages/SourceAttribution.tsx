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
import { referralProgram } from "@/config/referralProgram";
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

      {/* ── Referral Program (public layer over Source; paused today) ──────── */}
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h2 className="type-h2 text-foreground">{referralProgram.heading}</h2>
        <LifecycleBadge lifecycle={referralProgram.lifecycle} />
      </div>
      <p className="font-mono text-xs text-primary mb-4">{referralProgram.poweredBy}</p>
      <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mb-6">{referralProgram.subheading}</p>

      <Card className="bg-primary/5 border-primary/30 p-5 mb-12">
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0 mt-0.5">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">{referralProgram.pausedCopy.status}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{referralProgram.pausedCopy.detail}</p>
          </div>
        </div>
      </Card>

      <h3 className="type-h3 text-foreground mb-4">How it works</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {referralProgram.howItWorks.map((step, i) => (
          <Card key={step} className="bg-card/40 border-border/50 p-4">
            <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
            <p className="text-sm text-foreground/90 leading-relaxed mt-2">{step}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="type-h3 text-foreground mb-4">What counts as eligible</h3>
          <ul className="space-y-2">
            {referralProgram.eligibility.map((e) => (
              <li key={e} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="type-h3 text-foreground mb-4">Anti-abuse</h3>
          <ul className="space-y-2">
            {referralProgram.antiAbuse.map((a) => (
              <li key={a} className="flex items-start gap-3 text-sm text-foreground/90 leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h3 className="type-h3 text-foreground mb-4">Program states</h3>
      <div className="flex flex-wrap gap-2 mb-12">
        {referralProgram.states.map((st) => (
          <span
            key={st.id}
            title={st.meaning}
            className="font-mono text-xs px-2.5 py-1 rounded-md border border-border/50 bg-card/40 text-foreground/80"
          >
            {st.id}
          </span>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20 p-6 mb-14">
        <h3 className="text-base font-medium text-foreground mb-2">What it is — and is not</h3>
        <p className="text-sm text-foreground/90 leading-relaxed mb-2">{referralProgram.constitutionalLine}</p>
        <p className="text-sm text-muted-foreground leading-relaxed">{referralProgram.notCharityLine}</p>
      </Card>

      <div className="h-px bg-border/50 mb-14" />

      <h2 className="type-h2 text-foreground mb-5">The model</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
        {sourceAttribution.model.map((step, i) => (
          <Card key={step.title} className="bg-card/40 border-border/50 p-5">
            <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="text-base font-medium text-foreground mt-2 mb-1">{step.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
          </Card>
        ))}
      </div>

      <h2 className="type-h2 text-foreground mb-5">What's live today</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
        {sourceAttribution.currentState.map((item) => (
          <Card key={item.title} className="bg-primary/5 border-primary/20 p-5">
            <h3 className="text-base font-medium text-foreground mb-1.5">{item.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
          </Card>
        ))}
      </div>

      <h2 className="type-h2 text-foreground mb-5">Boundaries</h2>
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
        <Link href={ctas.buildLink.href}>
          <Button>{ctas.buildLink.label}</Button>
        </Link>
        <Link href={ctas.viewRecognition.href}>
          <Button variant="outline">{ctas.viewRecognition.label}</Button>
        </Link>
        <Link href={ctas.viewStatus.href}>
          <Button variant="outline">{ctas.viewStatus.label}</Button>
        </Link>
      </div>
    </PublicPage>
  );
}
