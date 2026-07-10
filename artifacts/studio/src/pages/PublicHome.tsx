import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Link2,
  ShieldCheck,
  TerminalSquare,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  useGetProtocolReality,
  useGetSourceStatus,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { TruthLabel } from "@/components/TruthLabel";
import { SampleTag } from "@/components/SampleTag";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { SeatFlowDiagram } from "@/components/hero/SeatFlowDiagram";
import { ProtocolOverviewPanel } from "@/components/hero/ProtocolOverviewPanel";
import { HeroLedger } from "@/components/hero/HeroLedger";
import {
  RegistryPostureChip,
  realityGroupSummary,
  type RegistryPostureQueries,
} from "@/components/registry/registryPosture";
import { surfaceStatus } from "@/config/truthStatus";
import { moduleRegistry } from "@/config/moduleRegistry";
import {
  heroSystem,
  howItWorks,
  operationalReality,
  awaitingWiring,
  studioPreview,
  studioPreviewPanel,
  trustStrip,
  homepagePromotedStrip,
  homepageModuleStrip,
} from "@/config/syndicateFacts";

function ProofRail({ className = "" }: { className?: string }) {
  return (
    <div className={`grid gap-2 ${className}`}>
      {heroSystem.proofRail.map((item) => (
        <div
          key={item.label}
          className="flex min-h-11 items-center gap-3 rounded-xl border border-gold/18 bg-background/54 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/[0.025]"
        >
          <span
            className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border font-mono text-[10px] font-black ${
              item.tone === "avax"
                ? "border-[#e84142]/30 bg-[#e84142] text-white shadow-[0_0_18px_-10px_rgba(232,65,66,0.9)]"
                : item.tone === "cyan"
                  ? "border-primary/35 bg-primary/10 text-primary"
                  : "border-gold/35 bg-gold/10 text-gold"
            }`}
          >
            {item.tone === "avax" ? <img src="/brand/avalanche-avax-token.png" alt="Avalanche" className="h-full w-full rounded-full object-cover" /> : item.mark}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] font-semibold text-foreground dark:text-white">{item.label}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{item.note}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Slim live trust strip — the only live-bound band on `/`. Reads the
 * read-only Protocol Reality Spine and reports per-group reconciliation
 * counts. Any fetch failure or missing group fails closed to an explicit
 * "unavailable" line; nothing is assumed or invented.
 */
function TrustStatusStrip() {
  const { data, isLoading, isError } = useGetProtocolReality();

  return (
    <section className="border-b border-border/60 bg-muted/30">
      <div className="container mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <span className="inline-flex items-center gap-2.5">
          <LifecycleBadge lifecycle="READ_ONLY_PROOF" />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {trustStrip.eyebrow}
          </span>
        </span>
        {isLoading ? (
          <span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground">
            <Spinner className="h-3.5 w-3.5" />
            Reading protocol reality…
          </span>
        ) : isError || !data ? (
          <span className="font-mono text-[11px] text-destructive">
            {trustStrip.failText}
          </span>
        ) : (
          trustStrip.groups.map((group) => {
            const summary = realityGroupSummary(data, group.key);
            return (
              <span key={group.key} className="inline-flex items-baseline gap-1.5 text-[11px]">
                <span className="text-muted-foreground">{group.label}</span>
                {summary ? (
                  <span className="font-mono font-semibold text-primary">
                    {summary.readable}/{summary.total} {trustStrip.reconciledNote}
                  </span>
                ) : (
                  <span className="font-mono text-destructive">
                    unavailable (fail-closed)
                  </span>
                )}
              </span>
            );
          })
        )}
        <span className="ml-auto flex items-center gap-4">
          {trustStrip.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[11px] font-medium text-primary underline-offset-4 hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </span>
      </div>
    </section>
  );
}

const promotedIcons: Record<string, LucideIcon> = {
  "membership-join": UserPlus,
  "verified-introduction": Link2,
  "member-cockpit": Users,
  "protocol-reality": ShieldCheck,
};

function useRegistryPostureQueries(): RegistryPostureQueries {
  const {
    data: sourceStatus,
    isLoading: sourceLoading,
    isError: sourceError,
  } = useGetSourceStatus();
  const {
    data: reality,
    isLoading: realityLoading,
    isError: realityError,
  } = useGetProtocolReality();
  return { sourceStatus, sourceLoading, sourceError, reality, realityLoading, realityError };
}

/** Promoted Strip — 4 action cards driven entirely by Module Registry v0. */
function PromotedStrip() {
  const queries = useRegistryPostureQueries();
  const promoted = moduleRegistry.filter(
    (entry) => entry.publicVisible && entry.homepageZone === "PROMOTED_STRIP",
  );

  return (
    <section className="bg-background py-14 text-foreground">
      <div className="container mx-auto px-4">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
            {homepagePromotedStrip.eyebrow}
          </div>
          <h2 className="mb-3 text-3xl font-light tracking-tight text-foreground">
            {homepagePromotedStrip.title}
          </h2>
          <p className="text-muted-foreground">{homepagePromotedStrip.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {promoted.map((entry) => {
            const Icon = promotedIcons[entry.registryId] ?? Boxes;
            const href = entry.route ?? entry.cta?.href ?? null;
            if (!href) return null;
            return (
              <Link key={entry.registryId} href={href} className="group block h-full">
                <Card className="flex h-full flex-col border-card-border bg-card p-6 shadow-sm transition-colors group-hover:border-gold/40">
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <Icon className="h-6 w-6 text-gold" />
                    <RegistryPostureChip entry={entry} {...queries} />
                  </div>
                  <h3 className="mb-2 text-base font-medium text-card-foreground">{entry.title}</h3>
                  <p className="mb-5 flex-1 text-sm text-muted-foreground">
                    {homepagePromotedStrip.blurbs[entry.registryId] ?? entry.notes}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    {entry.cta?.label ?? entry.title}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/** Slim module strip — further public modules, still registry-driven. */
function ModuleStrip() {
  const queries = useRegistryPostureQueries();
  const entries = moduleRegistry.filter(
    (entry) => entry.publicVisible && entry.homepageZone === "MODULE_STRIP",
  );

  return (
    <section className="border-t border-border/50 bg-background py-6 text-foreground">
      <div className="container mx-auto flex flex-wrap items-center gap-x-3 gap-y-2 px-4">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {homepageModuleStrip.lead}
        </span>
        {entries.map((entry) => {
          const href = entry.route ?? entry.cta?.href ?? null;
          if (!href) return null;
          return (
            <Link
              key={entry.registryId}
              href={href}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40"
            >
              {entry.title}
              <RegistryPostureChip entry={entry} {...queries} />
            </Link>
          );
        })}
        <Link
          href={homepageModuleStrip.statusLink.href}
          className="ml-auto text-[11px] font-medium text-primary underline-offset-4 hover:underline"
        >
          {homepageModuleStrip.statusLink.label}
        </Link>
      </div>
    </section>
  );
}

export default function PublicHome() {
  return (
    <div className="w-full bg-background text-foreground">
      {/*
        V6: the public vitrine follows the app's real .light/.dark theme.
        Dark mode keeps the black/gold command-center reference.
        Light mode renders the same cockpit anatomy in a readable institutional light treatment.
      */}
      <section className="syn-command-island relative isolate overflow-hidden border-b border-border bg-[radial-gradient(70%_48%_at_50%_0%,hsl(var(--gold)/0.18),transparent_68%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)))] text-foreground dark:border-gold/18 dark:bg-[#030609] dark:text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(42%_46%_at_48%_44%,rgba(16,185,129,0.08),transparent_63%)] dark:bg-[radial-gradient(42%_46%_at_48%_44%,rgba(16,185,129,0.06),transparent_63%)]" />
          <div className="absolute inset-0 syn-command-grid opacity-35" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1840px] px-3 pb-3 pt-2 md:px-5 md:pb-4 md:pt-2.5">
          <div className="syn-cockpit-card overflow-hidden rounded-[1.25rem] border border-gold/30 bg-card/82 shadow-xl backdrop-blur-xl dark:bg-black/54">
            <div className="grid grid-cols-1 gap-2.5 p-3 md:p-3.5 xl:grid-cols-[0.74fr_1.28fr_0.84fr] xl:grid-rows-[minmax(440px,auto)_auto] xl:gap-2.5 2xl:grid-cols-[0.72fr_1.34fr_0.82fr]">
              <motion.div
                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                className="order-1 flex min-h-[420px] flex-col justify-start rounded-[1.05rem] border border-gold/18 bg-card/66 p-4 pt-6 shadow-sm dark:bg-black/28 xl:min-h-[440px] xl:p-5 xl:pt-7"
              >
                <div className="mb-3 inline-flex items-center gap-2">
                  <span className="h-1 w-8 rounded-full bg-gold shadow-[0_0_18px_hsl(var(--gold)/0.65)]" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                    {heroSystem.eyebrow}
                  </span>
                </div>

                <h1 className="max-w-[420px] font-serif text-[clamp(1.62rem,1.85vw,2.2rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-foreground dark:text-white">
                  {heroSystem.headlineLead}{" "}
                  <span className="text-gold">{heroSystem.headlineEmphasis}</span>
                </h1>

                <p className="mt-3 max-w-[390px] text-[0.8rem] leading-5 text-muted-foreground xl:text-[0.88rem]">
                  {heroSystem.subheadline}
                </p>

                <ProofRail className="mt-4 max-w-[330px]" />

                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row xl:flex-col 2xl:flex-row">
                  <Link href={heroSystem.primaryCta.href}>
                    <Button
                      size="lg"
                      className="h-12 w-full rounded-xl border border-gold/75 bg-gold px-6 font-semibold text-gold-foreground shadow-[0_0_34px_-8px_hsl(var(--gold)/0.75)] hover:bg-gold/90 sm:w-auto"
                    >
                      {heroSystem.primaryCta.label}
                    </Button>
                  </Link>
                  <Link href={heroSystem.secondaryCta.href}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="group h-12 w-full rounded-xl border-border bg-background/50 px-6 text-foreground hover:border-primary/40 hover:bg-primary/5 dark:border-white/15 dark:bg-white/[0.025] dark:text-white sm:w-auto"
                    >
                      {heroSystem.secondaryCta.label}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <div className="order-2 flex min-h-[430px] items-center justify-center overflow-hidden rounded-[1.05rem] border border-gold/18 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--gold)/0.1),transparent_48%)] xl:min-h-[440px]">
                <SeatFlowDiagram />
              </div>

              <div className="order-4 xl:order-3 xl:min-h-[440px]">
                <ProtocolOverviewPanel />
              </div>

              <div className="order-5 xl:col-span-3 xl:row-span-1">
                <HeroLedger />
              </div>
            </div>

            <div className="mx-4 mb-3 flex flex-wrap items-center justify-center gap-2 border-t border-border/70 pt-3 text-center md:mx-5 dark:border-white/10">
              <SampleTag kind="illustrative" />
              <span className="font-mono text-[11px] leading-tight text-muted-foreground">{heroSystem.disclaimer}</span>
            </div>
          </div>
        </div>
      </section>

      <TrustStatusStrip />

      <PromotedStrip />

      <section className="border-t border-border/50 bg-muted/20 py-16 text-foreground">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground">{howItWorks.title}</h2>
            <p className="text-muted-foreground">{howItWorks.subtitle}</p>
          </div>
          <div className="relative grid grid-cols-1 gap-8 md:grid-cols-5 md:gap-6">
            <div className="absolute left-[10%] right-[10%] top-6 z-0 hidden h-px bg-border md:block" />
            {howItWorks.steps.map((step) => (
              <div key={step.step} className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card font-mono font-medium text-gold shadow-sm">{step.step}</div>
                <h3 className="mb-3 text-lg font-medium text-foreground">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ModuleStrip />

      <section className="border-t border-border/50 bg-background py-16 text-foreground">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="mb-4 text-3xl font-light tracking-tight text-foreground">{operationalReality.title}</h2>
              <p className="text-muted-foreground">{operationalReality.subtitle}</p>
            </div>
            <Link href={operationalReality.statusCta.href}>
              <Button variant="outline">{operationalReality.statusCta.label}</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="border-card-border bg-card p-8 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {operationalReality.liveHeading}
              </h3>
              <ul className="space-y-6">
                {operationalReality.live.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="flex items-start gap-4">
                      <div className="rounded-md bg-muted p-2 text-foreground"><Icon className="h-4 w-4" /></div>
                      <div>
                        <h4 className="mb-1 text-sm font-medium text-foreground">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
            <Card className="border-card-border bg-card/70 p-8 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-orange-500/80" />
                {operationalReality.pendingHeading}
              </h3>
              <ul className="space-y-6">
                {awaitingWiring.map((item) => (
                  <li key={item.surfaceId} className="flex items-start gap-4">
                    <div className="mt-0.5"><TruthLabel variant={surfaceStatus[item.surfaceId]} /></div>
                    <div>
                      <h4 className="mb-1 text-sm font-medium text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-border/50 bg-muted/20 py-16 text-foreground">
        <div className="container mx-auto max-w-5xl px-4">
          <Card className="overflow-hidden border-card-border bg-card shadow-lg">
            <div className="flex flex-col md:flex-row">
              <div className="flex flex-col justify-center p-8 md:w-1/2 md:p-12">
                <TerminalSquare className="mb-6 h-8 w-8 text-gold" />
                <h2 className="mb-4 text-2xl font-light tracking-tight text-foreground">{studioPreview.title}</h2>
                <p className="mb-8 text-sm leading-relaxed text-muted-foreground">{studioPreview.description}</p>
                <div>
                  <Link href={studioPreview.cta.href}>
                    <Button>{studioPreview.cta.label}</Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center border-t border-border bg-muted/30 p-6 md:w-1/2 md:border-l md:border-t-0 md:p-8">
                <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-lg border border-border bg-background shadow-sm">
                  <div className="flex h-8 items-center gap-2 border-b border-border bg-muted/50 px-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
                    <span className="ml-1 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {studioPreviewPanel.eyebrow}
                    </span>
                    <span className="ml-auto">
                      <SampleTag kind="illustrative" />
                    </span>
                  </div>
                  <div className="flex-1 divide-y divide-border/50 px-2 py-1">
                    {studioPreviewPanel.rows.map((row) => (
                      <div
                        key={row.id}
                        className="flex items-start justify-between gap-2 px-2 py-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-foreground">
                            {row.label}
                          </div>
                          <div className="text-[10px] leading-snug text-muted-foreground">
                            {row.detail}
                          </div>
                        </div>
                        <LifecycleBadge
                          lifecycle={row.lifecycle}
                          className="shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border bg-muted/30 px-3 py-2">
                    <p className="text-[10px] leading-snug text-muted-foreground">
                      {studioPreviewPanel.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
