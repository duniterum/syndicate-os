import { type ReactNode } from "react";

interface PublicPageProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  badge?: ReactNode;
  children: ReactNode;
}

// Shared hero + body wrapper for public marketing surfaces, so every public
// route shares the same chrome rhythm as the homepage without re-implementing it.
export function PublicPage({ eyebrow, title, lead, badge, children }: PublicPageProps) {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-border/50 bg-background pt-14 pb-12 md:pt-20 md:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          {eyebrow && (
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
              {eyebrow}
            </p>
          )}
          {badge && <div className="mb-5">{badge}</div>}
          <h1 className="text-3xl md:text-5xl font-light tracking-tight text-foreground max-w-3xl leading-[1.1]">
            {title}
          </h1>
          {lead && (
            <p className="text-lg text-muted-foreground max-w-2xl mt-5 leading-relaxed">{lead}</p>
          )}
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-5xl">{children}</div>
      </section>
    </div>
  );
}
