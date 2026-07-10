import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Box, Droplet, LockKeyhole, Network, Settings, Shield, Sparkles, Users } from "lucide-react";
import { SampleTag } from "@/components/SampleTag";
import { LiveReadTag, liveFigure } from "@/components/hero/LiveReadTag";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { VerifyOnChain, VERIFY_SLOGAN } from "@/components/VerifyOnChain";
import { heroSystem } from "@/config/syndicateFacts";
import { Amount } from "@/components/amount/Amount";
import { Icon } from "@/components/icon/Icon";
import type { VerifyLinkId } from "@workspace/api-client-react";

// "Don't trust — verify" explorer targets per card (protocol infrastructure
// ONLY — links come from the read-only verify-links endpoint, fail-closed).
const sourceVerifyIds: Record<string, readonly VerifyLinkId[]> = {
  membership: ["membershipSaleV1", "membershipSaleV2A", "membershipSaleV2", "membershipSaleV3"],
  nft: ["nftArchive"],
  referrals: ["sourceRegistry"],
};

const routeVerifyIds: Record<string, readonly VerifyLinkId[]> = {
  vault: ["vaultWallet"],
  liquidity: ["lpPair"],
  operations: ["operationsWallet"],
};

const sourceIcons = {
  membership: Users,
  nft: Box,
  lpfees: Droplet,
  referrals: Network,
  future: Sparkles,
};

const routeIcons = {
  vault: Shield,
  liquidity: Droplet,
  operations: Settings,
};

// Categorical route accents → the tokenized data-viz palette, matching the
// flagship ProtocolOverviewPanel so the two hero panels stay consistent.
const routeTone = {
  vault: "border-viz-1/25 bg-viz-1/8 text-viz-1",
  liquidity: "border-viz-6/25 bg-viz-6/8 text-viz-6",
  operations: "border-viz-3/25 bg-viz-3/8 text-viz-3",
};

export function HeroLedger() {
  const reduceMotion = useReducedMotion();
  const reality = useHeroReality();
  const [selected, setSelected] = useState(heroSystem.entryPreview.defaultAmount);
  const routed = useMemo(() => {
    return heroSystem.entryPreview.split.map((s) => ({ ...s, amount: selected * s.ratio }));
  }, [selected]);

  const sourcesLive = reality.aggregateInflowUsdc !== null || reality.attributionActivities !== null;
  const sourcesTag = sourcesLive ? "live" : reality.loading ? "checking" : "unavailable";

  const routedByTone: Record<string, string | null> = {
    vault: reality.routedVault,
    liquidity: reality.routedLiquidity,
    operations: reality.routedOperations,
  };
  const balanceByTone: Record<string, string | null> = {
    vault: reality.vaultUsdc !== null ? `${reality.vaultUsdc} USDC` : null,
    liquidity:
      reality.lpUsdc !== null && reality.lpSyn !== null
        ? `${reality.lpUsdc} USDC + ${reality.lpSyn} SYN`
        : null,
    operations: reality.opsUsdc !== null ? `${reality.opsUsdc} USDC` : null,
  };

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
          <LiveReadTag state={sourcesTag} />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {heroSystem.sources.items.map((item, index) => {
            const Icon = sourceIcons[item.id as keyof typeof sourceIcons] ?? Sparkles;
            const isMoneyBind =
              item.bind === "aggregateInflowUsdc" || item.bind === "nftRevenueUsdc";
            const moneyValue =
              item.bind === "aggregateInflowUsdc"
                ? reality.aggregateInflowUsdc
                : item.bind === "nftRevenueUsdc"
                  ? reality.nftRevenueUsdc
                  : null;
            const countValue =
              item.bind === "attributionActivities"
                ? reality.attributionActivities
                : item.bind === "nftMintedTotal"
                  ? reality.nftMintedTotal
                  : null;
            const noteText =
              item.bind === "nftRevenueUsdc" && reality.nftMintedTotal !== null
                ? `${reality.nftMintedTotal} minted${
                    reality.nftFirstSignalMinted !== null && reality.nftPatronSealMinted !== null
                      ? ` (${reality.nftFirstSignalMinted} First Signal · ${reality.nftPatronSealMinted} Patron Seal)`
                      : ""
                  }`
                : item.note;
            const verifyIds = sourceVerifyIds[item.id];
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
                {item.bind ? (
                  isMoneyBind ? (
                    <div className="mt-2">
                      <Amount
                        segments={moneyValue !== null ? [{ value: moneyValue, unit: "USDC" }] : null}
                        variant="lead"
                        loading={reality.loading}
                        className="text-viz-4"
                      />
                      {noteText ? <div className="mt-1 text-[9px] leading-tight text-muted-foreground">{noteText}</div> : null}
                    </div>
                  ) : countValue !== null ? (
                    <div className="mt-2">
                      <span className="font-mono text-sm font-black text-viz-4 sm:text-base">{countValue}</span>
                      {item.unit ? <span className="ml-1 font-mono text-[9px] font-semibold text-muted-foreground">{item.unit}</span> : null}
                      {noteText ? <div className="mt-1 text-[9px] leading-tight text-muted-foreground">{noteText}</div> : null}
                    </div>
                  ) : (
                    <div className="mt-2 font-mono text-[11px] font-semibold text-muted-foreground">
                      {liveFigure(null, reality.loading)}
                    </div>
                  )
                ) : (
                  <div className="mt-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{item.status}</div>
                )}
                {verifyIds ? <VerifyOnChain ids={verifyIds} className="mt-1.5 block" /> : null}
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 text-center text-xs text-muted-foreground">
          Gross inflows are cumulative and <span className="font-semibold text-viz-4">never decrease.</span>
          <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70">{VERIFY_SLOGAN}</span>
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
          <span className="rounded-full border border-proof/25 bg-proof/8 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-proof">Canonical 70 / 20 / 10</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {heroSystem.routing.routes.map((route, index) => {
            const Icon = routeIcons[route.id as keyof typeof routeIcons];
            const amount = routedByTone[route.id] ?? null;
            const balance = balanceByTone[route.id] ?? null;
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
                <div className="mt-2 font-mono text-sm font-semibold text-foreground">
                  {amount !== null ? `${amount} USDC` : liveFigure(null, reality.loading)}
                </div>
                <div className="mt-1.5 border-t border-current/10 pt-1.5 text-[9px] leading-tight text-muted-foreground">
                  {balance !== null ? (
                    <>
                      <span className="font-semibold uppercase tracking-[0.08em]">Live balance</span>
                      <span className="mt-0.5 block font-mono">{balance}</span>
                    </>
                  ) : (
                    liveFigure(null, reality.loading)
                  )}
                </div>
                {routeVerifyIds[route.id] ? (
                  <VerifyOnChain ids={routeVerifyIds[route.id]} className="mt-1.5 block" />
                ) : null}
              </motion.div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-border bg-background/58 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{heroSystem.routing.totalRoutedLabel}</span>
          <span className="font-mono text-xl font-black text-foreground">
            {reality.aggregateInflowUsdc !== null ? (
              <>
                {reality.aggregateInflowUsdc} <span className="text-xs font-semibold text-muted-foreground">USDC</span>
              </>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{liveFigure(null, reality.loading)}</span>
            )}
          </span>
        </div>
        <div className="mt-2 grid gap-1.5">
          {heroSystem.routing.allocation.map((a) => (
            <div key={a.id} className="rounded-lg border border-border bg-background/45 px-3 py-1.5 text-[10px] leading-snug text-muted-foreground dark:border-white/10 dark:bg-white/[0.02]">
              <span className="font-semibold uppercase tracking-[0.08em] text-foreground/80">{a.label}</span>
              <span className="mx-1.5 text-muted-foreground/60">→</span>
              {a.text}
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] text-muted-foreground">{heroSystem.routing.balanceNote}</p>
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
          <Icon icon={LockKeyhole} size="sm" tone="proof" />
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
        <p className="mt-3 text-[10px] text-muted-foreground">Preview of the routing split only. No wallet, no write, no transaction.</p>
      </motion.section>
    </div>
  );
}
