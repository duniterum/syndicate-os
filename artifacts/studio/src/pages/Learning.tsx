import { Link } from "wouter";
import { PublicPage } from "@/components/PublicPage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Icon } from "@/components/icon/Icon";
import {
  learningIntro,
  learningModules,
  knowledgeOsMap,
} from "@/config/learningModules";
import { ctas } from "@/config/sharedCopy";

export default function Learning() {
  return (
    <PublicPage
      eyebrow="Learn"
      title="How The Syndicate works."
      lead={learningIntro}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14">
        {learningModules.map((m) => (
          <Card key={m.id} className="bg-card/40 border-border/50 p-6">
            <h3 className="text-base font-medium text-foreground mb-1">{m.title}</h3>
            <p className="text-sm text-primary/90 mb-4">{m.summary}</p>
            <ul className="space-y-2.5">
              {m.topics.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mb-14">
        <h2 className="text-lg font-medium text-foreground mb-1.5">
          {knowledgeOsMap.heading}
        </h2>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl leading-relaxed">
          {knowledgeOsMap.intro}
        </p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {knowledgeOsMap.steps.map((step, i) => {
            const body = (
              <Card className="h-full bg-card/40 border-border/50 p-5 transition-colors hover:border-primary/40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full border border-border font-mono text-[11px] text-primary shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-primary/80">
                    {step.verb}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.detail}
                </p>
                {step.href ? (
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary">
                    Open
                    <Icon icon={ArrowRight} size="xs" />
                  </span>
                ) : null}
              </Card>
            );
            return step.href ? (
              <li key={step.id}>
                <Link href={step.href} className="block h-full">
                  {body}
                </Link>
              </li>
            ) : (
              <li key={step.id}>{body}</li>
            );
          })}
        </ol>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={ctas.viewStatus.href}>
          <Button>{ctas.viewStatus.label}</Button>
        </Link>
        <Link href={ctas.getSupport.href}>
          <Button variant="outline">{ctas.getSupport.label}</Button>
        </Link>
      </div>
    </PublicPage>
  );
}
