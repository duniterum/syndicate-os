import { Link } from "wouter";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { PublicPage } from "@/components/PublicPage";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";
import { TransparencyPosture } from "@/components/living/TransparencyPosture";
import { SectionIndex, type IndexEntry } from "@/components/living/SectionIndex";
import { getRouteSeoByPath, getRouteLabel } from "@/lib/seo-route-registry";
import { DOCS_GROUPS, DOCS_JOURNEY } from "@/content/docs-content";

// Docs (slice 2.4) — the protocol operating manual / knowledge hub. Composed from
// the living chassis (PublicPage + LivingSignature + TransparencyPosture +
// SectionIndex); the only new pieces are the curated corpus (docs-content.ts) and
// this layout. Every card links to a REAL route; its STATUS is DERIVED from the
// SEO route registry (never hardcoded) — so a surface flips its own pill when its
// posture changes. Audience tags are editorial wayfinding, never access-gating.

const TOC: IndexEntry[] = DOCS_GROUPS.map((g) => ({ id: g.id, label: g.title }));

/** Card status, DERIVED from the route registry — never a hardcoded live label. */
function docStatus(path: string): { tone: StatusTone; label: string } {
  const entry = getRouteSeoByPath(path);
  if (entry.indexStatus === "INDEX") return { tone: "proof", label: "Ready" };
  if (entry.indexStatus === "PENDING") return { tone: "caution", label: "Pending" };
  return { tone: "neutral", label: "Reference" };
}

export default function Docs() {
  return (
    <PublicPage
      eyebrow="Docs · the protocol operating manual"
      title="Read the protocol in the order a member lives it."
      lead="Docs aren't a separate pile of pages — they're the map. Understand the system, take a seat, verify the receipt, and watch the memory form. Every card carries a status and who it's for, and links to the real surface — where every figure is read live from Avalanche."
    >
      <div className="space-y-12">
        <TransparencyPosture />

        {/* Journey spine — the order a member experiences the protocol (live surfaces). */}
        <Card className="border-border/60 bg-card/40 p-5">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            The journey
          </p>
          <ol className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {DOCS_JOURNEY.map((step, i) => {
              const entry = getRouteSeoByPath(step.routePath);
              return (
                <li key={step.routePath} className="flex items-center gap-3">
                  <Link
                    href={step.routePath}
                    className="group flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 px-3 py-2 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border font-mono text-[10px] text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">{step.label}</span>
                    <span className="hidden font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70 sm:inline">
                      {getRouteLabel(entry)}
                    </span>
                  </Link>
                  {i < DOCS_JOURNEY.length - 1 && (
                    <ArrowRight aria-hidden className="hidden h-4 w-4 shrink-0 text-muted-foreground/50 sm:block" />
                  )}
                </li>
              );
            })}
          </ol>
        </Card>

        <div className="lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <SectionIndex entries={TOC} heading="Sections" className="mb-8 lg:mb-0" />

          <div className="min-w-0 space-y-14">
            {DOCS_GROUPS.map((group) => (
              <section key={group.id} id={group.id} aria-labelledby={`${group.id}-title`} className="scroll-mt-24">
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{group.eyebrow}</p>
                <h2 id={`${group.id}-title`} className="type-h2 mt-1 text-foreground">{group.title}</h2>
                <p className="mt-2 max-w-2xl type-body text-muted-foreground">{group.description}</p>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {group.cards.map((card) => {
                    const entry = getRouteSeoByPath(card.routePath);
                    const st = docStatus(card.routePath);
                    return (
                      <Link
                        key={card.routePath}
                        href={card.routePath}
                        className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        <Card className="flex h-full flex-col gap-3 border-border/60 bg-card/40 p-5 transition-colors group-hover:border-primary/30 group-hover:bg-card/70">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-base font-semibold leading-snug text-foreground">
                              {getRouteLabel(entry)}
                            </h3>
                            <StatusPill tone={st.tone} size="xs">{st.label}</StatusPill>
                          </div>
                          <p className="text-sm leading-relaxed text-muted-foreground">{card.purpose}</p>
                          <div className="mt-auto flex flex-wrap items-center gap-1.5">
                            {card.audience.map((a) => (
                              <span
                                key={a}
                                className="rounded-full border border-border/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary">
                            Open <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </span>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Closing CTA */}
        <Card className="border-border/60 bg-card/40 p-6">
          <h2 className="type-h3 text-foreground">Where to next</h2>
          <p className="mt-2 type-body text-muted-foreground">
            New to it all? Start with the plain-language{" "}
            <Link href="/learning" className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">Learn</Link>{" "}
            page. Want the proof? Open the{" "}
            <Link href="/status" className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">Status</Link>{" "}
            ledger. Ready to observe from the inside?{" "}
            <Link href="/join" className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">Take a seat</Link>{" "}
            — observe first, join if it suits you.
          </p>
        </Card>
      </div>
    </PublicPage>
  );
}
