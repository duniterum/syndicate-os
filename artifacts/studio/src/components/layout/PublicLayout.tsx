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
import { HEADER_ICON_PRIMARY } from "@/components/layout/headerControls";
import { RouteBreadcrumbTrail } from "@/components/layout/RouteBreadcrumbTrail";
import { getRouteBreadcrumb } from "@/lib/seo-route-registry";
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

// ONE LIVE BADGE, NOT TWO (founder, 2026-07-28, from a screenshot of his own
// header: « 2 LIVE pour rien, on peut merge live in the Avalanche box »).
//
// There were two pills reading the SAME `chipState`: this one — "Avalanche ·
// LIVE" from `2xl:` — and a `LiveChip` showing a bare "LIVE" from `lg:`. Above
// 1536px both rendered, so the header said LIVE twice, side by side, about one
// fact. Below that only the bare one showed, which is the weaker of the two: it
// names the state without naming what is live.
//
// So the chain pill now carries it alone, from `lg:` — the breakpoint the bare
// chip used, so nothing LOSES its live signal — and the `Activity` pulse glyph
// is folded in beside the state word, keeping the motion cue that pill had.
//
// AND THE WORD SHRINKS BEFORE THE BADGE DOES, which was MEASURED, not guessed.
// Showing the full pill from `lg:` overlapped the wordmark by 125px and the
// chapter badge by 69px at 1024px — the `2xl:` it used to sit at was not
// arbitrary, it was the width the FULL pill needs. But the box already carries
// the Avalanche LOGO, so between `lg:` and `2xl:` the redundant part is the
// WORD: the mark names the chain, and the badge says LIVE. That is exactly the
// founder's instruction — merge LIVE into the Avalanche box.
function ChainPill({ state }: { state: HeaderChipState }) {
  return (
    <span
      title="Avalanche C-Chain — every public figure is a live chain read, fail-closed"
      className={`hidden items-center gap-2 whitespace-nowrap rounded-xl border px-2.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.08em] shadow-sm lg:inline-flex ${chipStateTone[state]}`}
    >
      <span className="grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-avax shadow-[0_0_18px_-8px_hsl(var(--avax)/0.9)]">
        <img src="/brand/avalanche-avax-token.png" alt="Avalanche" className="h-full w-full object-cover" />
      </span>
      <span className="hidden text-foreground/85 2xl:inline">{headerChips.chainName}</span>
      <span className="hidden text-muted-foreground 2xl:inline">·</span>
      <Activity className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{headerChips.states[state]}</span>
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
        {/* TYPE SIZE ONLY (2026-07-26). This tagline was `text-[10px]` widening
            to `sm:text-[11px]` — a responsive step that CAPPED BELOW the 12px
            floor, so it never reached it at any width, on every page of the site.
            It measured as the smallest text on /activity: 5 rendered instances at
            11px. Now the `text-xs` token, which IS the floor. Nothing else about
            this element changes — same face, same tracking, same colour, same
            place.

            AND THE COLLISION THAT WAS NEVER MEASURED (founder-caught 2026-07-28,
            from a screenshot of /join — it is LIVE on thesyndicate.money, on the
            header of every public page). At 375px this line RAN UNDERNEATH the
            theme and menu buttons. Measured, and the numbers matter because they
            correct the obvious assumption:
              room between the wordmark and the first button ... 209px
              intrinsic width at 10px 269 · at 11px 286 · at 12px 302
            It NEVER FIT — not at the size the 2026-07-26 raise replaced, and not
            before it. The raise widened the overlap from ~60px to 93px; it did
            not create it. The tagline has been colliding at phone width for as
            long as it has had this tracking.
            THE FIX IS NOT A SMALLER SIZE — ADR-001's floor forbids that, and 10px
            overlapped anyway. It is WORK-FIRST §3: on a 375px header this line
            serves nobody, so it is not shown. Mark + name carry the brand, which
            is the pattern every AAA header uses on a phone.

            AND IT RETURNS AT 1700px, NOT `sm:` AND NOT `2xl:` — corrected twice
            the same day, each time by measuring instead of guessing. The founder
            asked for the header to be checked; the sweep found the collision is
            not a phone problem, it is THIS LINE'S problem at every width. At HEAD,
            1280px: SIX overlapping pairs in the header row. This 302px
            `whitespace-nowrap` line inside a `shrink-0` wordmark is the single
            biggest consumer of the left side, so the left block cannot yield and
            runs UNDER the right cluster — which is also exactly where the nav
            switches on (`xl:`).
            THE ARITHMETIC, measured at 1920px where the row is clean:
              left block 809 + right block 731 .... 1540px of content
              row padding ........................... 64px
              so the full header needs ≥ 1604px, and at the `2xl:` cliff (1536)
              only 1472px is available — 68px short, which is exactly the three
              overlaps that appeared there when the tagline, the social icons and
              the word AVALANCHE all switched on at the SAME breakpoint.
            The other two stay at `2xl:` (without this line the row needs 1238px
            and has 1472). This one waits for 1700px, where the measured slack is
            ~96px. A breakpoint cliff is what you get when everything returns at
            once; these are staggered on purpose. */}
        <span className="mt-1 hidden whitespace-nowrap font-mono text-xs uppercase tracking-[0.3em] text-gold min-[1700px]:block">
          {brand.descriptor}
        </span>
      </span>
      {/* M1-c: the chapter badge reads from the ONE chapter config (shared
          with the hero's overview panel) — never a hardcoded literal here. */}
      <span
        title={`${heroSystem.overview.chapter.label} — ${heroSystem.overview.chapter.value}`}
        // TYPE SIZE ONLY: 11px → the `text-xs` token, which IS the 12px floor.
        // The last sub-floor text rendered on /activity, and it sits in the
        // chrome, so it was the last one on every page. Nothing else changes.
        className="ml-1 hidden rounded-full border border-gold/35 bg-gold/10 px-1.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider text-gold sm:inline-flex"
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
  // ONE resolver for the rendered trail and the BreadcrumbList JSON-LD.
  const crumb = getRouteBreadcrumb(location);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground selection:bg-gold/30">
      <motion.header
        initial={reduceMotion ? false : { y: -12, opacity: 0, filter: "blur(8px)" }}
        animate={reduceMotion ? undefined : { y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/92 shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_24px_60px_-52px_hsl(var(--gold)/0.65)] backdrop-blur-xl dark:border-gold/20 dark:bg-surface-command/94 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_28px_70px_-58px_hsl(var(--gold)/0.85)]"
      >
        <div className="flex h-[58px] w-full items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
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
                    className={`group relative inline-flex items-center rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-colors hover:bg-gold/8 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 2xl:px-3 ${
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
                    className={`group relative inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-colors hover:bg-gold/8 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45 data-[state=open]:bg-gold/8 data-[state=open]:text-gold 2xl:px-3 ${
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
                          className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors focus:bg-gold/8 focus:text-gold ${
                            location === item.path ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="font-mono text-[11px] text-muted-foreground">{item.path}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* THE HEADER WAS OVERFLOWING ONTO ITSELF, and this row is the third
                copy of the same links (the mobile drawer and the footer carry the
                other two — nothing is lost by holding it back).
                MEASURED at HEAD, 1280px, before any change today: SIX overlapping
                pairs in this one row — the nav links running under the social
                icons and under the live chip by up to 49px. The cause is a row of
                `shrink-0` items that together need more than the viewport, so they
                overlap instead of yielding. WORK-FIRST: at a laptop width the
                header owes the nav, sign-in, the one gold CTA and the live proof —
                not a third route to X and Telegram. They return at `2xl:`, where
                the row was measured with room. */}
            <SocialIconRow className="hidden items-center gap-1.5 2xl:flex" iconClass="h-3.5 w-3.5" />
            <ChainPill state={chipState} />
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
                <Button variant="ghost" size="icon" className={`${HEADER_ICON_PRIMARY} xl:hidden`}>
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

      {/* THE PUBLIC BREADCRUMB (founder: Option A, M1, "oui Q2 pour tout" —
          2026-07-28, from an approved wireframe: docs/design/breadcrumb-public-wireframe.html).
          Until today the BreadcrumbList JSON-LD was emitted to search engines
          while NO breadcrumb was rendered — the machine saw a trail the human
          never did, because the only thing that rendered one was mounted in
          `Shell`, which the operator console uses and the public pages do not.
          PublicRoute wraps every public route in this layout, so this is the ONE
          mounting point. The front door is skipped: a "Home › Home" trail says
          nothing. */}
      {/* A DIV, not a <nav>: `RouteBreadcrumbTrail` renders the shadcn
          `<Breadcrumb>`, which IS `<nav aria-label="breadcrumb">`
          (ui/breadcrumb.tsx:12). Wrapping it in a second one shipped TWO nested
          landmarks with the same name on every public page (axe
          `landmark-unique` — a best-practice rule, not a WCAG criterion). This
          element only ever carried the border and the padding. */}
      {!crumb.isHome && (
        <div className="border-b border-border/60 bg-background px-4 py-1 sm:px-6 lg:px-8">
          <RouteBreadcrumbTrail trail={crumb.trail} />
        </div>
      )}

      <main className="flex flex-1 flex-col bg-background">{children}</main>

      <footer className="border-t border-border/50 bg-muted/20 py-12 md:py-16">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Mobile (<sm): tap-to-open accordion so 25 links stay tidy; targets ≥44px. */}
          <div className="mb-8 sm:hidden">
            {footerGroups.map((group) => (
              <details key={group.heading} className="group border-b border-border/50">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45">
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {group.heading}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <ul className="space-y-3 pb-4 pt-1">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.path}
                        className="inline-flex min-h-11 items-center rounded text-sm text-foreground transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/45"
                      >
                        {navLabel(item, "footer")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
          {/* Desktop (sm+): full-width column grid, aligned to the header edges. */}
          <div className="mb-12 hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-4">
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
