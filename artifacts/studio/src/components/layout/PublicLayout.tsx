import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Crown, Eye, Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { headerNav, footerGroups, navLabel } from "@/config/navigation";
import { brand } from "@/config/brand";
import { heroSystem } from "@/config/syndicateFacts";

function ChainPill() {
  return (
    <span
      title="Avalanche C-Chain target network — read-only public surface"
      className="hidden items-center gap-2 whitespace-nowrap rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-cyan-700 shadow-sm dark:text-cyan-200 2xl:inline-flex"
    >
      <span className="grid h-5 w-5 place-items-center overflow-hidden rounded-full bg-[#e84142] shadow-[0_0_18px_-8px_rgba(232,65,66,0.9)]">
        <img src="/brand/avalanche-avax-token.png" alt="Avalanche" className="h-full w-full object-cover" />
      </span>
      <span>Avalanche</span>
      <span className="text-muted-foreground">·</span>
      <span>Target network</span>
      <span className="text-muted-foreground">·</span>
      <span className="text-cyan-600 dark:text-cyan-300">Read-only</span>
    </span>
  );
}

function ReadOnlyChip() {
  return (
    <span
      title="Read-only public foundation — no writes are initiated from this header"
      className="hidden items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-2.5 py-1.5 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-gold lg:inline-flex"
    >
      <Eye className="h-3.5 w-3.5" />
      Read-only
    </span>
  );
}

function Wordmark() {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5">
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/45 bg-background/80 text-gold shadow-[0_0_20px_-14px_hsl(var(--gold)/0.8)] transition-colors group-hover:bg-gold/10 dark:bg-black/65">
        <span aria-hidden className="absolute inset-1 rounded-lg border border-gold/20" />
        <Crown className="h-4 w-4" />
      </span>
      <span className="flex shrink-0 flex-col leading-none">
        <span className="whitespace-nowrap text-[1.02rem] font-semibold uppercase tracking-[0.18em] text-foreground sm:text-[1.14rem] 2xl:text-[1.26rem]">
          {brand.name}
        </span>
        <span className="mt-1 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.3em] text-gold/90 sm:text-[9px]">
          {brand.tagline}
        </span>
      </span>
      <span className="ml-1 hidden rounded-full border border-gold/35 bg-gold/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-gold sm:inline-flex">
        Preview
      </span>
    </Link>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex min-h-[100dvh] flex-col bg-background text-foreground selection:bg-gold/30">
      <motion.header
        initial={reduceMotion ? false : { y: -12, opacity: 0, filter: "blur(8px)" }}
        animate={reduceMotion ? undefined : { y: 0, opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/92 shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_24px_60px_-52px_hsl(var(--gold)/0.65)] backdrop-blur-xl dark:border-gold/20 dark:bg-[#05070b]/94 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_28px_70px_-58px_hsl(var(--gold)/0.85)]"
      >
        <div className="mx-auto flex h-[58px] w-full max-w-[1840px] items-center justify-between gap-2 px-4 md:px-5 2xl:px-7">
          <div className="flex min-w-0 items-center gap-4 2xl:gap-6">
            <Wordmark />

            <nav className="hidden min-w-0 items-center gap-1 xl:flex 2xl:gap-1.5" aria-label="Public navigation">
              {headerNav.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={reduceMotion ? false : { opacity: 0, y: -5 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 + index * 0.035, duration: 0.3 }}
                >
                  <Link
                    href={item.path}
                    className={`group rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors hover:bg-gold/8 hover:text-gold focus:outline-none focus:ring-2 focus:ring-cyan-400/40 2xl:px-2.5 2xl:text-[11px] ${
                      location === item.path ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <span className="block whitespace-nowrap leading-none">{item.label}</span>
                    <span className="mt-0.5 hidden whitespace-nowrap font-mono text-[9px] leading-none text-muted-foreground/60 group-hover:text-gold/80 2xl:block">
                      {item.path}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <ChainPill />
            <ReadOnlyChip />
            <ThemeToggle />
            <span className="hidden h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-gold/8 text-gold lg:inline-flex">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </span>
            <Link href={heroSystem.primaryCta.href} className="hidden md:inline-flex">
              <Button
                size="sm"
                className="min-h-9 rounded-xl border border-gold/60 bg-gold px-4 font-semibold text-gold-foreground shadow-[0_0_28px_-14px_hsl(var(--gold)/0.9)] hover:bg-gold/90 xl:px-5"
              >
                {heroSystem.primaryCta.label}
                <span className="ml-2 font-mono text-[10px] opacity-75">/member</span>
              </Button>
            </Link>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="min-h-10 min-w-10 rounded-xl border border-gold/30 bg-gold/8 text-gold xl:hidden">
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] border-border bg-popover sm:w-[420px] dark:border-gold/25 dark:bg-[#05070b]/96">
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
                      className={`flex min-h-12 items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-base font-medium transition-colors hover:border-gold/30 hover:text-gold ${
                        location === item.path ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="font-mono text-xs text-gold">{item.path}</span>
                    </Link>
                  ))}
                  <div className="mt-2 rounded-xl border border-cyan-400/20 bg-cyan-400/5 px-4 py-3 text-xs text-cyan-600 dark:text-cyan-200">
                    Avalanche · Target network · Read-only
                  </div>
                  <div className="mt-2 border-t border-border/50 pt-4">
                    <Link href={heroSystem.primaryCta.href} onClick={() => setMobileOpen(false)}>
                      <Button className="min-h-12 w-full justify-center rounded-xl bg-gold font-semibold text-gold-foreground hover:bg-gold/90">
                        {heroSystem.primaryCta.label}
                        <span className="ml-1.5 text-xs opacity-70">/member</span>
                      </Button>
                    </Link>
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
                      <Link href={item.path} className="text-sm text-foreground transition-colors hover:text-gold">
                        {navLabel(item, "footer")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
            <p className="text-xs text-muted-foreground">© 2026 {brand.name}. {brand.rightsNote}</p>
            <p className="text-xs text-muted-foreground">{brand.foundationNote}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
