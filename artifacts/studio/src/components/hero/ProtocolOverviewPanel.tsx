import { motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { Activity, Archive, Droplet, Flame, Gauge, Settings, Shield, Users, WalletCards } from "lucide-react";
import { LiveReadTag, liveFigure } from "@/components/hero/LiveReadTag";
import { useHeroReality, type HeroReality } from "@/components/hero/useHeroReality";
import { MembersProvenance } from "@/components/living/MembersProvenance";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { Icon } from "@/components/icon/Icon";
import { heroSystem, type HeroStat } from "@/config/syndicateFacts";
import type { VerifyLinkId } from "@workspace/api-client-react";

// "Don't trust — verify" explorer targets per stat (protocol infrastructure
// ONLY — links come from the read-only verify-links endpoint, fail-closed).
const statVerifyIds: Record<string, readonly VerifyLinkId[]> = {
  members: ["synToken"],
  gross: ["membershipSaleV1", "membershipSaleV2A", "membershipSaleV2", "membershipSaleV3"],
  vault: ["vaultWallet"],
  liquidity: ["lpPair"],
  operations: ["operationsWallet"],
  burned: ["burnAddress"],
};

const statIcons = {
  members: Users,
  gross: WalletCards,
  vault: Shield,
  liquidity: Droplet,
  operations: Settings,
  burned: Flame,
};

// Stat accents are CATEGORICAL (different assets), not semantic states — so they
// map to the tokenized data-viz palette (--viz-*), preserving the per-stat variety
// while killing the raw palette. Members stays on the identity (gold) axis.
const statTone: Record<string, string> = {
  members: "text-gold",
  gross: "text-viz-4",
  vault: "text-viz-1",
  liquidity: "text-viz-6",
  operations: "text-viz-3",
  burned: "text-viz-5",
};

/** Resolve a stat's LIVE value from the hero reality reads — null = unavailable. */
function resolveStat(reality: HeroReality, stat: HeroStat): string | null {
  switch (stat.bind) {
    case "membersTotal":
      return reality.membersTotal;
    case "aggregateInflowUsdc":
      return reality.aggregateInflowUsdc;
    case "grossTotalUsdc":
      return reality.grossTotalUsdc;
    case "vaultUsdc":
      return reality.vaultUsdc;
    case "opsUsdc":
      return reality.opsUsdc;
    case "lpReserves":
      return reality.lpUsdc !== null && reality.lpSyn !== null
        ? `${reality.lpUsdc} USDC + ${reality.lpSyn} SYN`
        : null;
    case "burnedSyn":
      return reality.burnedSyn;
  }
}

export function ProtocolOverviewPanel() {
  const reduceMotion = useReducedMotion();
  const reality = useHeroReality();

  const anyLive =
    heroSystem.overview.stats.some((s) => resolveStat(reality, s) !== null) ||
    reality.membersTotal !== null;
  const tagState = anyLive ? "live" : reality.loading ? "checking" : "unavailable";

  const filled = reality.membersTotalNumber;
  const window = heroSystem.overview.seats.chapterWindow;
  const pct = filled !== null && window > 0 ? Math.max(1, Math.round((filled / window) * 100)) : null;

  return (
    <motion.aside
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="flex h-full min-h-[400px] flex-col rounded-[1.05rem] border border-gold/22 bg-card/76 p-3.5 shadow-sm backdrop-blur-md dark:bg-black/38"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold tracking-[-0.02em] text-foreground">{heroSystem.overview.title}</h2>
        <LiveReadTag state={tagState} />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {heroSystem.overview.stats.map((stat, index) => {
          const StatGlyph = statIcons[stat.id as keyof typeof statIcons] ?? Gauge;
          const tone = statTone[stat.id] ?? "text-gold";
          const value = resolveStat(reality, stat);
          const display = liveFigure(value, reality.loading);
          const isFigure = value !== null;
          return (
            <motion.div
              key={stat.id}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.16 + index * 0.04 }}
              className="min-h-[104px] rounded-xl border border-border/80 bg-background/62 p-3.5 dark:border-white/10 dark:bg-white/[0.035]"
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon icon={StatGlyph} size="sm" className={tone} />
                <span className="syn-label text-muted-foreground">{stat.label}</span>
              </div>
              {isFigure ? (
                <div className={`font-mono font-black ${stat.bind === "lpReserves" ? "text-sm leading-5" : "text-xl"} ${tone}`}>
                  {display}
                  {stat.unit ? <span className="ml-1 text-[11px] font-semibold text-muted-foreground">{stat.unit}</span> : null}
                </div>
              ) : (
                <div className="font-mono text-sm font-semibold text-muted-foreground">{display}</div>
              )}
              <div className="mt-2 text-[11px] text-muted-foreground">{stat.meta}</div>
              {statVerifyIds[stat.id] ? (
                <VerifyOnChain ids={statVerifyIds[stat.id]} className="mt-1.5 block" />
              ) : null}
              {/* M4-c: the burn total's HISTORY DOOR — the figure links to its
                  receipts (the complete numbered Proof of Burn record). */}
              {stat.id === "burned" ? (
                <Link
                  href="/fire-ledger"
                  className="mt-1 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                  data-testid="link-burn-history"
                >
                  every burn, numbered →
                </Link>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {/* Members figure is the LIVE continuous memberCount; carry its dual-authority
          split + the verified snapshot's as-of (freshness provenance, guard-enforced). */}
      <MembersProvenance
        variant="compact"
        className="mt-2"
        historicalFreeze={reality.historicalFreeze}
        v3Emitted={reality.v3Emitted}
        snapshotMemberTotal={reality.snapshotMemberTotal}
        snapshotAsOf={reality.snapshotAsOf}
        membersDiverged={reality.membersDiverged}
        distinctWallets={reality.distinctWallets}
        seatOverlap={reality.seatOverlap}
      />

      <div className="mt-2.5 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl border border-gold/30 bg-gold/8 p-3.5">
          <div className="mb-2 flex items-center gap-2 text-gold">
            <Icon icon={Archive} size="sm" />
            <span className="syn-label text-muted-foreground">{heroSystem.overview.chapter.label}</span>
          </div>
          <div className="text-base font-semibold text-foreground">{heroSystem.overview.chapter.value}</div>
          <div className="mt-1 font-mono text-[11px] text-gold">{heroSystem.overview.chapter.meta}</div>
        </div>
        <div className="rounded-xl border border-border/80 bg-background/62 p-3.5 dark:border-white/10 dark:bg-white/[0.035]">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="syn-label text-muted-foreground">{heroSystem.overview.seats.label}</span>
            {pct !== null ? (
              <span className="rounded-full border border-gold/30 px-2 py-1 font-mono text-[10px] text-gold">{pct}%</span>
            ) : null}
          </div>
          {filled !== null ? (
            <>
              <div className="font-mono text-xl font-black text-foreground">
                {filled} <span className="text-sm font-semibold text-muted-foreground">/ {window}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gold shadow-[0_0_18px_hsl(var(--gold)/0.5)]"
                  style={{ width: `${pct ?? 0}%` }}
                />
              </div>
            </>
          ) : (
            <div className="font-mono text-sm font-semibold text-muted-foreground">
              {liveFigure(null, reality.loading)}
            </div>
          )}
          <div className="mt-1 text-[11px] text-muted-foreground">{heroSystem.overview.seats.chapterNote}</div>
        </div>
      </div>

      <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-xl border border-border/80 bg-background/42 p-3.5 dark:border-white/10 dark:bg-black/32">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <Icon icon={Activity} size="sm" tone="live" />
            {heroSystem.activity.title}
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Coming</span>
        </div>
        <div className="grid flex-1 place-items-center rounded-lg border border-dashed border-border/80 bg-card/40 px-3 py-6 text-center dark:border-white/10">
          <p className="max-w-[28ch] text-xs text-muted-foreground">{heroSystem.activity.comingNote}</p>
        </div>
      </div>
    </motion.aside>
  );
}
