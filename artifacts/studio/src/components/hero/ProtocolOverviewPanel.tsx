import { motion, useReducedMotion } from "framer-motion";
import { Activity, Archive, Droplet, Flame, Gauge, Shield, Users, WalletCards } from "lucide-react";
import { SampleTag } from "@/components/SampleTag";
import { heroSystem } from "@/config/syndicateFacts";

const statIcons = {
  members: Users,
  gross: WalletCards,
  vault: Shield,
  liquidity: Droplet,
  lpFees: Droplet,
  burned: Flame,
};

const statTone: Record<string, string> = {
  members: "text-gold",
  gross: "text-emerald-500 dark:text-emerald-400",
  vault: "text-cyan-500 dark:text-cyan-300",
  liquidity: "text-blue-500 dark:text-blue-400",
  lpFees: "text-gold",
  burned: "text-orange-500",
};

export function ProtocolOverviewPanel() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.aside
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="flex h-full min-h-[400px] flex-col rounded-[1.05rem] border border-gold/22 bg-card/76 p-3.5 shadow-sm backdrop-blur-md dark:bg-black/38"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-[-0.02em] text-foreground">{heroSystem.overview.title}</h2>
        <SampleTag kind="simulated" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {heroSystem.overview.stats.map((stat, index) => {
          const Icon = statIcons[stat.id as keyof typeof statIcons] ?? Gauge;
          const tone = statTone[stat.id] ?? "text-gold";
          return (
            <motion.div
              key={stat.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.16 + index * 0.04 }}
              className="min-h-[104px] rounded-xl border border-border/80 bg-background/62 p-3.5 dark:border-white/10 dark:bg-white/[0.035]"
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${tone}`} />
                <span className="syn-label text-muted-foreground">{stat.label}</span>
              </div>
              <div className={`font-mono text-xl font-black ${tone}`}>{stat.value}</div>
              <div className="mt-2 text-[11px] text-muted-foreground">{stat.meta}</div>
              {stat.id === "gross" ? (
                <svg className="mt-2 h-5 w-full text-emerald-500 dark:text-emerald-400" viewBox="0 0 150 28" aria-hidden="true">
                  <path d="M2 22 C28 20 38 18 52 14 C74 12 88 10 108 7 C124 5 136 4 148 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-gold/30 bg-gold/8 p-3.5">
          <div className="mb-2 flex items-center gap-2 text-gold">
            <Archive className="h-4 w-4" />
            <span className="syn-label text-muted-foreground">{heroSystem.overview.chapter.label}</span>
          </div>
          <div className="text-base font-semibold text-foreground">{heroSystem.overview.chapter.value}</div>
          <div className="mt-1 font-mono text-[11px] text-gold">{heroSystem.overview.chapter.meta}</div>
        </div>
        <div className="rounded-xl border border-border/80 bg-background/62 p-3.5 dark:border-white/10 dark:bg-white/[0.035]">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="syn-label text-muted-foreground">{heroSystem.overview.seats.label}</span>
            <span className="rounded-full border border-gold/30 px-2 py-1 font-mono text-[10px] text-gold">{heroSystem.overview.seats.pct}%</span>
          </div>
          <div className="font-mono text-xl font-black text-foreground">{heroSystem.overview.seats.filled} / {heroSystem.overview.seats.total}</div>
          <div className="mt-2 h-2 rounded-full bg-muted dark:bg-slate-900">
            <div className="h-full rounded-full bg-gold shadow-[0_0_18px_hsl(var(--gold)/0.5)]" style={{ width: `${heroSystem.overview.seats.pct}%` }} />
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">Recognised seats</div>
        </div>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-xl border border-border/80 bg-background/42 p-3.5 dark:border-white/10 dark:bg-black/32">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Activity className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
            {heroSystem.activity.title}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Illustrative</span>
        </div>
        <div className="grid gap-2 overflow-hidden">
          {heroSystem.activity.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.42 + index * 0.06 }}
              className="rounded-lg border border-border/80 bg-card/72 px-3 py-2 dark:border-white/10 dark:bg-white/[0.035]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-semibold text-foreground">{item.event}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{item.time}</div>
              </div>
              <div className="mt-0.5 truncate text-xs text-muted-foreground">{item.meta}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
