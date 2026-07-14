import React, { Suspense, lazy } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  Link2,
  ShieldCheck,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  useGetProtocolReality,
  useGetSourceStatus,
  type VerifyLinkId,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { TruthLabel } from "@/components/TruthLabel";
import { SampleTag } from "@/components/SampleTag";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { SeatFlowSurface } from "@/components/hero/SeatFlowDiagram";
import { ProtocolOverviewPanel } from "@/components/hero/ProtocolOverviewPanel";
import { HeroLedger } from "@/components/hero/HeroLedger";
import { HeroStatusChips } from "@/components/hero/HeroStatusChips";
import { HeroSeatLine } from "@/components/hero/HeroSeatLine";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import {
  RegistryPostureChip,
  realityGroupSummary,
  type RegistryPostureQueries,
} from "@/components/registry/registryPosture";
import { moduleRegistry } from "@/config/moduleRegistry";
import { useAuthAvailability } from "@/lib/authAvailability";
import {
  heroSystem,
  howItWorks,
  operationalReality,
  awaitingWiring,
  trustStrip,
  homepagePromotedStrip,
  homepageModuleStrip,
} from "@/config/syndicateFacts";

// Q-A (founder decision A1): the hero's PRIMARY CTA is session-aware — a
// SEATED member sees "Expand your footprint" (a further purchase adds SYN to
// their seat, never a second seat); everyone else keeps the canonical
// "Take your seat". The wallet module loads lazily ONLY when the auth zone is
// live (the MemberHeaderSlot pattern); dark zone / loading / any failure →
// the generic, fail-closed.
const HeroSeatCta = lazy(() => import("@/wallet/HeroSeatCta"));

// ② The headline's claim ("a permanent, numbered seat, written on-chain") is
// proven by the active sale engine — its verify path sits directly under it.
const HEADLINE_VERIFY_IDS: readonly VerifyLinkId[] = ["membershipSaleV3"];
const HERO_PRIMARY_CTA_CLASS =
  "h-12 w-full rounded-xl border border-gold/75 bg-gold px-6 font-semibold text-gold-foreground shadow-[0_0_34px_-8px_hsl(var(--gold)/0.75)] hover:bg-gold/90 sm:w-auto";

function GenericHeroCta() {
  return (
    <Link href={heroSystem.primaryCta.href}>
      <Button size="lg" className={HERO_PRIMARY_CTA_CLASS} data-testid="hero-primary-cta">
        {heroSystem.primaryCta.label}
      </Button>
    </Link>
  );
}

function HeroPrimaryCtaSlot() {
  const authLive = useAuthAvailability() === "live";
  if (!authLive) return <GenericHeroCta />;
  return (
    <Suspense fallback={<GenericHeroCta />}>
      <HeroSeatCta className={HERO_PRIMARY_CTA_CLASS} generic={heroSystem.primaryCta} />
    </Suspense>
  );
}

/** ⑥ The quiet Inspect rail — crypto-native doors, never competing with the CTA. */
function InspectRail({ className = "" }: { className?: string }) {
  return (
    <nav
      aria-label="Protocol inspect actions"
      className={`flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] ${className}`}
    >
      <span className="mr-1 text-muted-foreground/80">{heroSystem.inspectRail.lead}</span>
      {heroSystem.inspectRail.items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="inline-flex items-center rounded border border-border/60 bg-background/40 px-2.5 py-1.5 text-muted-foreground transition-colors hover:border-gold/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 dark:border-white/10 dark:bg-white/[0.03]"
        >
          {item.label}
        </Link>
      ))}
    </nav>
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
          <h2 className="type-h2 mb-3 text-foreground">
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
        Light mode renders the same layout anatomy in a readable institutional light treatment.
      */}
      <section className="syn-command-island relative isolate overflow-hidden border-b border-border bg-[radial-gradient(70%_48%_at_50%_0%,hsl(var(--gold)/0.18),transparent_68%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)))] text-foreground dark:border-gold/18 dark:bg-surface-command dark:text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(42%_46%_at_48%_44%,hsl(var(--success)/0.08),transparent_63%)] dark:bg-[radial-gradient(42%_46%_at_48%_44%,hsl(var(--success)/0.06),transparent_63%)]" />
          <div className="absolute inset-0 syn-command-grid opacity-35" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1840px] px-3 pb-3 pt-2 md:px-5 md:pb-4 md:pt-2.5">
          <div className="syn-cockpit-card overflow-hidden rounded-[1.25rem] border border-gold/30 bg-card/82 shadow-xl backdrop-blur-xl dark:bg-black/54">
            <div className="grid grid-cols-1 gap-2.5 p-3 md:p-3.5 xl:grid-cols-[0.74fr_1.28fr_0.84fr] xl:grid-rows-[minmax(440px,auto)_auto] xl:gap-2.5 2xl:grid-cols-[0.72fr_1.34fr_0.82fr]">
              {/* M1-a — the hero's first act, in the origin's design language,
                  LIVE-PRODUCTION posture: ① honest posture chips · ② editorial
                  headline (CONVERSION register, verify path adjacent) · ③ the
                  OS in plain words · ④ the living seat line (chain read,
                  fail-closed) · ⑤ ONE dominant session-aware seat CTA · ⑥ the
                  quiet Inspect rail. */}
              <motion.div
                initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
                className="order-1 flex min-h-[420px] flex-col justify-start rounded-[1.05rem] border border-gold/18 bg-card/66 p-4 pt-5 shadow-sm dark:bg-black/28 xl:min-h-[440px] xl:p-5 xl:pt-6"
              >
                <HeroStatusChips className="mb-4" />

                <div className="mb-3 inline-flex items-center gap-2">
                  <span className="h-1 w-8 rounded-full bg-gold shadow-[0_0_18px_hsl(var(--gold)/0.65)]" />
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">
                    {heroSystem.eyebrow}
                  </span>
                </div>

                <h1 className="type-h1 max-w-[440px] text-foreground dark:text-white">
                  {heroSystem.headlineLead}{" "}
                  <span className="text-gold">{heroSystem.headlineEmphasis}</span>
                </h1>
                <VerifyOnChain ids={HEADLINE_VERIFY_IDS} className="mt-1.5 block" />

                <div className="mt-3 max-w-[420px] space-y-2 text-[0.8rem] leading-5 text-muted-foreground xl:text-[0.88rem]">
                  {heroSystem.explainer.map((sentence) => (
                    <p key={sentence}>{sentence}</p>
                  ))}
                </div>

                <HeroSeatLine className="mt-4" />

                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row xl:flex-col 2xl:flex-row">
                  <HeroPrimaryCtaSlot />
                </div>

                <InspectRail className="mt-auto pt-5" />
              </motion.div>

              <div className="order-2 flex min-h-[430px] items-center justify-center overflow-hidden rounded-[1.05rem] border border-gold/18 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--gold)/0.1),transparent_48%)] xl:min-h-[440px]">
                <SeatFlowSurface />
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
            <h2 className="type-h2 mb-4 text-foreground">{howItWorks.title}</h2>
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
              <h2 className="type-h2 mb-4 text-foreground">{operationalReality.title}</h2>
              <p className="text-muted-foreground">{operationalReality.subtitle}</p>
            </div>
            <Link href={operationalReality.statusCta.href}>
              <Button variant="outline">{operationalReality.statusCta.label}</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <Card className="border-card-border bg-card p-8 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-foreground">
                <span className="h-2 w-2 rounded-full bg-success" />
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
                <span className="h-2 w-2 rounded-full bg-warning/80" />
                {operationalReality.pendingHeading}
              </h3>
              <ul className="space-y-6">
                {awaitingWiring.map((item) => (
                  <li key={item.title} className="flex items-start gap-4">
                    <div className="mt-0.5"><TruthLabel variant={item.status} /></div>
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

      {/* The former "Studio OS Console" teaser was REMOVED from the public
          home (founder decision, 2026-07-13 — locked-vs-hidden law: operator
          categories are removed from public views, not promoted). Its intent
          ("members see us advancing") moves to the future public Roadmap page
          (Phase-2 slice 2.8), which renders from the registry — not to a
          console door. */}
    </div>
  );
}
