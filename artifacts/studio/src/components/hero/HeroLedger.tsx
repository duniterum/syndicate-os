import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Box, Droplet, LockKeyhole, Package, Settings, Shield, Sparkles, Users } from "lucide-react";
import { SampleTag } from "@/components/SampleTag";
import { heroSystem } from "@/config/syndicateFacts";

const sourceIcons = {
  membership: Users,
  nft: Box,
  package: Package,
  lpfees: Droplet,
  referrals: Users,
  future: Sparkles,
};

const routeIcons = {
  vault: Shield,
  liquidity: Droplet,
  operations: Settings,
};

const routeTone = {
  vault: "border-cyan-400/25 bg-cyan-400/8 text-cyan-500 dark:text-cyan-300",
  liquidity: "border-blue-500/25 bg-blue-500/8 text-blue-500 dark:text-blue-400",
  operations: "border-violet-500/25 bg-violet-500/8 text-violet-500 dark:text-violet-400",
};

export function HeroLedger() {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(heroSystem.entryPreview.defaultAmount);
  const routed = useMemo(() => {
    return heroSystem.entryPreview.split.map((s) => ({ ...s, amount: selected * s.ratio }));
  }, [selected]);

  return (
    <div className="grid gap-2.5 xl:grid-cols-[0.98fr_1.03fr_1.08fr]">
      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.46, delay: 0.18 }}
        className="rounded-[1.05rem] border border-gold/25 bg-card/74 p-3.5 shadow-sm dark:bg-[#080b11]/76"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{heroSystem.sources.title}</h3>
          <SampleTag kind="simulated" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {heroSystem.sources.items.map((item, index) => {
            const Icon = sourceIcons[item.id as keyof typeof sourceIcons] ?? Sparkles;
            return (
              <motion.div
                key={item.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.24 + index * 0.035 }}
                className="min-h-[90px] rounded-xl border border-border bg-background/58 p-3 dark:border-white/10 dark:bg-white/[0.035]"
              >
                <Icon className="mb-2 h-4 w-4 text-gold" />
                <div className="min-h-[26px] font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">{item.label}</div>
                <div className="mt-2 font-mono text-sm font-black text-emerald-500 dark:text-emerald-400 sm:text-base">{item.value}</div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 text-center text-xs text-muted-foreground">
          Gross inflows are cumulative and <span className="font-semibold text-emerald-500 dark:text-emerald-400">never decrease.</span>
        </div>
      </motion.section>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.46, delay: 0.24 }}
        className="rounded-[1.05rem] border border-gold/25 bg-card/74 p-3.5 dark:bg-[#080b11]/76"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{heroSystem.routing.title}</h3>
          <span className="rounded-full border border-cyan-400/25 bg-cyan-400/8 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-cyan-600 dark:text-cyan-200">Canonical 70 / 20 / 10</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {heroSystem.routing.routes.map((route, index) => {
            const Icon = routeIcons[route.id as keyof typeof routeIcons];
            return (
              <motion.div
                key={route.id}
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.32, delay: 0.3 + index * 0.06 }}
                className={`rounded-xl border p-3 ${routeTone[route.id as keyof typeof routeTone]}`}
              >
                <Icon className="mb-2 h-5 w-5" />
                <div className="font-mono text-2xl font-black">{route.ratio}</div>
                <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px]">{route.label}</div>
                <div className="mt-2 font-mono text-sm font-semibold text-foreground sm:text-base">{route.amount}</div>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-background/58 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Total routed</span>
          <span className="font-mono text-xl font-black text-foreground">{heroSystem.routing.total}</span>
        </div>
      </motion.section>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.46, delay: 0.3 }}
        className="rounded-[1.05rem] border border-gold/25 bg-card/74 p-3.5 dark:bg-[#080b11]/76"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{heroSystem.entryPreview.title}</h3>
          <SampleTag kind="illustrative" />
        </div>
        <div className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          <LockKeyhole className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
          {heroSystem.entryPreview.readonlyNote}
        </div>
        <div className="flex flex-wrap gap-2">
          {heroSystem.entryPreview.amounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setSelected(amount)}
              className={`min-h-10 min-w-12 rounded-lg border px-3 font-mono text-sm transition ${selected === amount ? "border-gold bg-gold/18 text-gold shadow-[0_0_20px_-10px_hsl(var(--gold)/0.9)]" : "border-border bg-background/50 text-muted-foreground hover:border-gold/40 hover:text-gold dark:border-white/10 dark:bg-white/[0.025]"}`}
            >
              ${amount}
            </button>
          ))}
        </div>
        <div className="mt-3 grid gap-2">
          {routed.map((r) => (
            <div key={r.id} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${routeTone[r.id as keyof typeof routeTone]}`}>
              <span className="font-semibold text-foreground">{r.label}</span>
              <span className="font-mono text-base font-semibold text-foreground">${r.amount % 1 === 0 ? r.amount.toFixed(0) : r.amount.toFixed(2)} <span className="text-[10px] text-muted-foreground">({Math.round(r.ratio * 100)}%)</span></span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">Illustrative routing preview only. No wallet, no write, no transaction.</p>
      </motion.section>
    </div>
  );
}
