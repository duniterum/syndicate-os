import { type ReactNode } from "react";

interface PublicPageProps {
  eyebrow?: string;
  title: string;
  lead?: string;
  badge?: ReactNode;
  children: ReactNode;
  /**
   * Layout mode (CANON_ACCESS_MODEL §C, the S7-d full-screen law):
   * - "prose" (default) — capped body (max-w-5xl) for marketing/reading surfaces.
   * - "app" — FLUID full-width body (gutters only, no page cap) for app/data/
   *   console surfaces that host MemberShell or a data grid. The hero TEXT keeps
   *   its measure caps (title max-w-3xl / lead max-w-2xl) either way.
   */
  variant?: "prose" | "app";
}

// Shared hero + body wrapper for public routes, so every route shares the same
// chrome rhythm as the homepage without re-implementing it.
export function PublicPage({ eyebrow, title, lead, badge, children, variant = "prose" }: PublicPageProps) {
  const shell =
    variant === "app"
      ? "w-full px-4 sm:px-6 lg:px-8"
      : "container mx-auto px-4 max-w-5xl";
  return (
    <div className="w-full">
      <section className="relative overflow-hidden border-b border-border/50 bg-background pt-14 pb-12 md:pt-20 md:pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className={`${shell} relative z-10`}>
          {eyebrow && (
            <p className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
              {eyebrow}
            </p>
          )}
          {badge && <div className="mb-5">{badge}</div>}
          <h1 className="type-h1 text-foreground max-w-3xl">
            {title}
          </h1>
          {lead && (
            <p className="type-body text-muted-foreground max-w-2xl mt-5">{lead}</p>
          )}
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className={shell}>{children}</div>
      </section>
    </div>
  );
}
