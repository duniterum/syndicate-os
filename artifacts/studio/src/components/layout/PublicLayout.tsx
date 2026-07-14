import React, { lazy, Suspense, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Activity, ChevronDown, Menu, ShieldCheck, X } from "lucide-react";
import { useAuthAvailability } from "@/lib/authAvailability";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { headerNav, headerNavPrimary, headerNavMore, footerGroups, navLabel } from "@/config/navigation";
import { brand, brandAssets, headerChips, socialLinks, type HeaderChipState, type SocialLink } from "@/config/brand";
import { useGetProtocolReality } from "@workspace/api-client-react";
import { heroSystem } from "@/config/syndicateFacts";
import { SyndicateGuide } from "@/components/guide/SyndicateGuide";

// Member sign-in / standing affordance. Reached ONLY through a runtime dynamic
// import so PublicLayout never STATICALLY reaches @/wallet (guard-access-state
// rule 15 — App.tsx is the sole static wallet importer). Rendered only when the
// auth zone is live (dark → nothing; auto-appears the instant the auth exposure
// flag flips). One modal covers connect + SIWE sign; standing resolves in place.
const MemberHeaderAffordance = lazy(() => import("@/wallet/MemberHeaderAffordance"));

function MemberHeaderSlot({ variant }: { variant: "desktop" | "mobile" }) {
  const authLive = useAuthAvailability() === "live";
  if (!authLive) return null;
  return (
    <Suspense fallback={null}>
      <MemberHeaderAffordance variant={variant} />
    </Suspense>
  );
}

// Q-A extension (founder order, 2026-07-14): the HEADER's seat CTA is
// session-aware too — a seated member reads "Expand your footprint" next to
// their pill, never the generic invite the hero already stopped showing them.
// Same module, same discipline: lazy, auth-gated, fail-closed to the generic.
const HeroSeatCta = lazy(() => import("@/wallet/HeroSeatCta"));

function SeatCtaSlot({
  className,
  size,
  onNavigate,
}: {
  className: string;
  size: "sm" | "default";
  onNavigate?: () => void;
}) {
  const authLive = useAuthAvailability() === "live";
  const generic = (
    <Link href={heroSystem.primaryCta.href} onClick={onNavigate}>
      <Button size={size} className={className}>
        {heroSystem.primaryCta.label}
      </Button>
    </Link>
  );
  if (!authLive) return generic;
  return (
    <Suspense fallback={generic}>
      <HeroSeatCta
        className={className}
        size={size}
        generic={heroSystem.primaryCta}
        onNavigate={onNavigate}
      />
    </Suspense>
  );
}

// NOTE: the raw access-state session chip ("S4 · SIGNED — UNVERIFIED") was
// removed from the public header — it is internal S1–S14 vocabulary and, once
// membership recognition shipped, it contradicted the member identity menu (a
// verified member saw "UNVERIFIED"). The MemberHeaderAffordance menu is now the
// SINGLE human-facing signed-in/standing surface; the S-vocabulary stays for the
// operator console + AccessStateSimulator only.

// M1-c structural law: the header's status chips are DERIVED from the Protocol
// Reality Spine read at render time — never frozen "Live" text. Fail-closed:
// a failed read says Unavailable, loading says Checking…. (The old tooltips
// claimed a "read-only public surface" — read-only-era leftovers, dead: the
// protocol sells seats live, in-page.)
function useHeaderChipState(): HeaderChipState {
  const { data, isLoading, isError } = useGetProtocolReality();
  if (isLoading) return "checking";
  if (isError || !data) return "unavailable";
  return "live";
}

const chipStateTone: Record<HeaderChipState, string> = {
  live: "border-proof/30 bg-proof/10 text-proof",
  checking: "border-border bg-muted/40 text-muted-foreground",
  unavailable: "border-destructive/35 bg-destructive/10 text-destructive",
};

function ChainPill({ state }: { state: HeaderChipState }) {
  return (
    <span
      title="Avalanche C-Chain — every public figure is a live chain read, fail-closed"
      className={`hidden items-center gap-2 whitespace-nowrap rounded-xl border px-2.5 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] shadow-sm 2xl:inline-flex ${chipStateTone[state]}`}
    >
      <span className="grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-avax shadow-[0_0_18px_-8px_hsl(var(--avax)/0.9)]">
        <img src="/brand/avalanche-avax-token.png" alt="Avalanche" className="h-full w-full object-cover" />
      </span>
      <span className="text-foreground/85">{headerChips.chainName}</span>
      <span className="text-muted-foreground">·</span>
      <span>{headerChips.states[state]}</span>
    </span>
  );
}

function LiveChip({ state }: { state: HeaderChipState }) {
  return (
    <span
      title="Live on-chain reads — fail-closed, never invented"
      className={`hidden items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] lg:inline-flex ${chipStateTone[state]}`}
    >
      <Activity className="h-3.5 w-3.5" />
      {headerChips.states[state]}
    </span>
  );
}

function SocialGlyph({ kind, className }: { kind: SocialLink["kind"]; className?: string }) {
  if (kind === "x") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function SocialIconRow({ className, iconClass }: { className?: string; iconClass?: string }) {
  return (
    <div className={className}>
      {socialLinks.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.label}
          aria-label={link.label}
          className="grid h-9 w-9 place-items-center rounded-xl border border-gold/25 bg-gold/5 text-muted-foreground transition-colors hover:border-gold/45 hover:bg-gold/10 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45"
        >
          <SocialGlyph kind={link.kind} className={iconClass ?? "h-4 w-4"} />
        </a>
      ))}
    </div>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/45 bg-background/80 shadow-[0_0_20px_-14px_hsl(var(--gold)/0.8)] transition-colors group-hover:bg-gold/10 dark:bg-black/65">
        <img src={brandAssets["syn-mark-gold"]} alt="The Syndicate" className="h-7 w-7 object-contain" />
      </span>
      <span className="flex shrink-0 flex-col leading-none">
        <span className="whitespace-nowrap text-[1.02rem] font-semibold uppercase tracking-[0.18em] text-foreground sm:text-[1.14rem] 2xl:text-[1.26rem]">
          {brand.name}
        </span>
        <span className="mt-1 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.3em] text-gold/90 sm:text-[9px]">
          {brand.descriptor}
        </span>
      </span>
      {/* M1-c: the chapter badge reads from the ONE chapter config (shared
          with the hero's overview panel) — never a hardcoded literal here. */}
      <span
        title={`${heroSystem.overview.chapter.label} — ${heroSystem.overview.chapter.value}`}
        className="ml-1 hidden rounded-full border border-gold/35 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-gold sm:inline-flex"
      >
        {heroSystem.overview.chapter.badge}
      </span>
    </Link>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const chipState = useHeaderChipState();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground selection:bg-gold/30">
      <motion.header
        initial={reduceMotion ? false : { y: -12, opacity: 0, filter: "blur(8px)" }}
        animate={reduceMotion ? undefined : { y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/92 shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_24px_60px_-52px_hsl(var(--gold)/0.65)] backdrop-blur-xl dark:border-gold/20 dark:bg-surface-command/94 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_28px_70px_-58px_hsl(var(--gold)/0.85)]"
      >
        <div className="mx-auto flex h-[58px] w-full max-w-[1840px] items-center justify-between gap-2 px-4 md:px-5 2xl:px-7">
          <div className="flex min-w-0 items-center gap-4 2xl:gap-6">
            <Wordmark />

            <nav className="hidden min-w-0 items-center gap-1 xl:flex 2xl:gap-1.5" aria-label="Public navigation">
              {headerNavPrimary.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={reduceMotion ? false : { opacity: 0, y: -5 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + index * 0.035, duration: 0.3 }}
                >
                  {/* M1-c ROOT-CAUSE FIX: a wouter <Link> is a bare inline <a>;
                      inline + padding + block child = fragmented hover/focus
                      paint (the recurring vertical gold/cyan bar). inline-flex
                      heals the box; focus-visible keeps the ring for keyboards
                      and off mouse clicks. Pinned by guard-nav-link-display. */}
                  <Link
                    href={item.path}
                    className={`group relative inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-gold/8 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 2xl:px-3 2xl:text-[12px] ${
                      location === item.path ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span className="block whitespace-nowrap leading-none">{item.label}</span>
                    {location === item.path && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2.5 -bottom-px h-px rounded-full bg-gold/70 2xl:inset-x-3"
                      />
                    )}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: -5 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.06 + headerNavPrimary.length * 0.035, duration: 0.3 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className={`group relative inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors hover:bg-gold/8 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 data-[state=open]:bg-gold/8 data-[state=open]:text-gold 2xl:px-3 2xl:text-[12px] ${
                      headerNavMore.some((item) => item.path === location)
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                    aria-label="More navigation"
                  >
                    <span className="whitespace-nowrap leading-none">More</span>
                    <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
                    {headerNavMore.some((item) => item.path === location) && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2.5 -bottom-px h-px rounded-full bg-gold/70 2xl:inset-x-3"
                      />
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    sideOffset={10}
                    className="min-w-[190px] rounded-xl border-border/80 bg-popover/95 p-1.5 backdrop-blur-xl dark:border-gold/20"
                  >
                    {headerNavMore.map((item) => (
                      <DropdownMenuItem key={item.id} asChild>
                        <Link
                          href={item.path}
                          className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-[12px] font-medium transition-colors focus:bg-gold/8 focus:text-gold ${
                            location === item.path ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="font-mono text-[10px] text-muted-foreground/60">{item.path}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <SocialIconRow className="hidden items-center gap-1.5 lg:flex" iconClass="h-3.5 w-3.5" />
            <ChainPill state={chipState} />
            <LiveChip state={chipState} />
            <ThemeToggle />
            <Link
              href="/proof"
              title="View public proof"
              aria-label="View public proof"
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gold/8 text-gold transition-colors hover:border-gold/50 hover:bg-gold/15 lg:inline-flex"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </Link>
            {/* Existing-member affordance — auth-gated one-modal sign-in + in-place
                standing (mirrors the admin OperatorSignInAction/OperatorBadge).
                Hidden while the auth zone is dark; appears the instant it goes live. */}
            <span className="hidden md:inline-flex">
              <MemberHeaderSlot variant="desktop" />
            </span>
            <span className="hidden md:inline-flex">
              <SeatCtaSlot
                size="sm"
                className="min-h-9 rounded-xl border border-gold/60 bg-gold px-4 font-semibold text-gold-foreground shadow-[0_0_28px_-14px_hsl(var(--gold)/0.9)] hover:bg-gold/90 xl:px-5"
              />
            </span>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="min-h-11 min-w-11 rounded-xl border border-gold/30 bg-gold/8 text-gold xl:hidden">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] border-border bg-popover sm:w-[420px] dark:border-gold/25 dark:bg-surface-command/96">
                <SheetHeader>
                  <SheetTitle className="text-left font-serif text-lg uppercase tracking-widest text-foreground">
                    {brand.name}
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-3" aria-label="Mobile public navigation">
                  {headerNav.map((item) => (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex min-h-12 items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-base font-medium transition-colors hover:border-gold/30 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 ${
                        location === item.path ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-xs text-gold">{item.path}</span>
                    </Link>
                  ))}
                  <div className={`mt-2 rounded-xl border px-4 py-3 text-xs ${chipStateTone[chipState]}`}>
                    {headerChips.chainName} · {headerChips.states[chipState]}
                  </div>
                  <div className="mt-2 flex flex-col gap-2">
                    {socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex min-h-11 items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-gold/30 hover:text-gold"
                      >
                        <SocialGlyph kind={link.kind} className="h-4 w-4 text-gold" />
                        <span>{link.label}</span>
                      </a>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-col gap-2 border-t border-border/50 pt-4">
                    <MemberHeaderSlot variant="mobile" />
                    <SeatCtaSlot
                      size="default"
                      className="min-h-12 w-full justify-center rounded-xl bg-gold font-semibold text-gold-foreground hover:bg-gold/90"
                      onNavigate={() => setMobileOpen(false)}
                    />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </motion.header>

      <main className="flex flex-1 flex-col bg-background">{children}</main>

      <footer className="border-t border-border/50 bg-muted/20 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerGroups.map((group) => (
              <div key={group.heading}>
                <h3 className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {group.heading}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.path}
                        className="rounded text-sm text-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45"
                      >
                        {navLabel(item, "footer")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mb-8 flex flex-col items-center gap-3 border-t border-border/50 pt-8 sm:flex-row sm:justify-center sm:gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded text-sm text-muted-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45"
              >
                <SocialGlyph kind={link.kind} className="h-4 w-4" />
                <span>{link.label}</span>
              </a>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
            <p className="text-xs text-muted-foreground">© 2026 {brand.name}. {brand.rightsNote}</p>
            <p className="text-xs text-muted-foreground">{brand.foundationNote}</p>
          </div>
        </div>
      </footer>

      {/* Global floating Guide — deterministic help assistant on every public surface. */}
      <SyndicateGuide />
    </div>
  );
}
