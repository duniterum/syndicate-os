import { Link } from "wouter";
import { PublicPage } from "@/components/PublicPage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { learningIntro, learningModules } from "@/config/learningModules";
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
