import { motion, useReducedMotion } from "framer-motion";
import { Archive, Box, Droplet, Network, Settings, Shield, Sparkles, Users } from "lucide-react";
import { LiveReadTag } from "@/components/hero/LiveReadTag";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { heroSystem } from "@/config/syndicateFacts";
import { SeatThroneMark } from "@/components/hero/SeatThroneMark";
import { useCountUp } from "@/components/hero/useCountUp";

const sourceIcons = {
  membership: Users,
  chronicle: Archive,
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

const sourcePositions: Record<string, string> = {
  membership: "left-[14%] top-[20%]",
  chronicle: "left-[8%] top-[34%]",
  nft: "left-[11%] top-[48%]",
  lpfees: "left-[16%] top-[72%]",
  referrals: "left-[17%] top-[83%]",
  future: "left-[56%] top-[83%]",
};

const routePositions: Record<string, string> = {
  vault: "right-[5%] top-[32%]",
  liquidity: "right-[5%] top-[53%]",
  operations: "right-[13%] top-[72%]",
};

const flowPaths = [
  { id: "membership", d: "M205 128 C282 166 332 214 420 286", color: "emerald" },
  { id: "chronicle", d: "M165 214 C270 244 337 268 420 296", color: "emerald" },
  { id: "nft", d: "M177 293 C275 296 338 300 420 304", color: "emerald" },
  { id: "lpfees", d: "M207 446 C305 398 365 344 420 318", color: "emerald" },
  { id: "referrals", d: "M150 452 C240 405 360 350 424 320", color: "emerald" },
  { id: "future", d: "M482 452 C458 405 436 355 426 320", color: "emerald" },
  { id: "vault", d: "M438 300 C518 230 610 174 714 130", color: "gold" },
  { id: "liquidity", d: "M442 306 C540 307 651 307 768 307", color: "cyan" },
  { id: "operations", d: "M438 318 C520 388 608 450 725 502", color: "violet" },
];

// Categorical flow colors → the tokenized gold + data-viz palette (matching the
// other hero panels). Applied via CSS (style / fill-*) so hsl(var(...)) resolves
// reliably, not as a raw SVG presentation attribute.
const flowColor = {
  emerald: "hsl(var(--viz-4) / 0.5)",
  gold: "hsl(var(--gold) / 0.58)",
  cyan: "hsl(var(--viz-1) / 0.6)",
  violet: "hsl(var(--viz-3) / 0.58)",
};

function SourceIcon({ id }: { id: keyof typeof sourceIcons }) {
  const Icon = sourceIcons[id];
  return <Icon className="h-4 w-4" />;
}

function RouteIcon({ id }: { id: keyof typeof routeIcons }) {
  const Icon = routeIcons[id];
  return <Icon className="h-5 w-5" />;
}

function Particle({ pathId, color, delay = "0s", reverse = false }: { pathId: string; color: string; delay?: string; reverse?: boolean }) {
  return (
    <circle r="3" style={{ fill: color }} opacity="0.5">
      <animateMotion dur="6.8s" begin={delay} repeatCount="indefinite" keyPoints={reverse ? "1;0" : "0;1"} keyTimes="0;1" calcMode="linear">
        <mpath href={`#flow-${pathId}`} />
      </animateMotion>
    </circle>
  );
}

export function SeatFlowDiagram() {
  const reduceMotion = useReducedMotion();
  const reality = useHeroReality();

  // LIVE centrepiece: the TRUE gross cumulative inflow — membership sales
  // aggregate (V1+V2A+V2+V3) PLUS NFT artifact revenue (live price × minted) —
  // in whole-USDC terms for the count-up. null = honest unavailable state. The
  // Number conversion is used ONLY for the animation and ONLY when it is
  // exactly safe; otherwise the exact BigInt-formatted string is shown as-is.
  const grossUsdc = (() => {
    if (reality.grossTotalRaw === null) return null;
    const n = Number(reality.grossTotalRaw);
    return Number.isSafeInteger(n) && String(n) === reality.grossTotalRaw
      ? n / 1_000_000
      : null;
  })();
  const { ref, value } = useCountUp(grossUsdc ?? 0, 1350);
  const displayValue =
    reality.grossTotalUsdc === null
      ? null
      : reduceMotion || grossUsdc === null
        ? `${reality.grossTotalUsdc} USDC`
        : `${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC`;
  const tagState =
    reality.grossTotalUsdc !== null ? "live" : reality.loading ? "checking" : "unavailable";

  return (
    <div className="relative mx-auto h-[430px] w-full max-w-[760px] overflow-hidden rounded-[1.1rem] bg-[radial-gradient(circle_at_50%_43%,hsl(var(--gold)/0.12),transparent_46%)] md:h-[450px] xl:h-full xl:min-h-[440px]">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute left-1/2 top-[52%] h-[80%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-gold/28" />
        <div className="absolute left-1/2 top-[52%] h-[68%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-gold/22" />
        <div className="absolute left-1/2 top-[52%] h-[56%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-viz-4/18" />
        <div className="absolute left-1/2 top-[52%] h-[44%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/16" />
        <div className="absolute left-1/2 top-[52%] h-[34%] w-[36%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10" />
        <motion.div
          className="absolute left-1/2 top-[52%] h-[86%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 48, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute left-1/2 top-[52%] h-[72%] w-[74%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-gold/18"
          animate={reduceMotion ? undefined : { rotate: -360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <svg className="pointer-events-none absolute inset-0 z-10 h-full w-full" viewBox="0 0 850 560" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <radialGradient id="syn-center-glow-v7" cx="50%" cy="50%" r="58%">
            <stop offset="0" style={{ stopColor: "hsl(var(--gold) / 0.13)" }} />
            <stop offset="1" style={{ stopColor: "hsl(var(--gold) / 0)" }} />
          </radialGradient>
          <filter id="line-glow-v7">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <ellipse cx="425" cy="312" rx="188" ry="172" fill="url(#syn-center-glow-v7)" />
        {flowPaths.map((path) => (
          <path
            key={path.id}
            id={`flow-${path.id}`}
            className={path.color === "emerald" ? "syn-flow-in" : "syn-flow-out"}
            d={path.d}
            style={{ stroke: flowColor[path.color as keyof typeof flowColor] }}
            strokeWidth="2"
            fill="none"
            filter="url(#line-glow-v7)"
          />
        ))}
        {!reduceMotion ? (
          <>
            {flowPaths.filter((p) => p.color === "emerald").map((path, index) => (
              <Particle key={`particle-${path.id}`} pathId={path.id} color="hsl(var(--viz-4) / 0.8)" delay={`${index * 0.6}s`} />
            ))}
            <Particle pathId="vault" color="hsl(var(--gold) / 0.8)" delay="0.35s" />
            <Particle pathId="liquidity" color="hsl(var(--viz-1) / 0.8)" delay="0.85s" />
            <Particle pathId="operations" color="hsl(var(--viz-3) / 0.8)" delay="1.35s" />
          </>
        ) : null}
      </svg>

      <div className="absolute left-1/2 top-[5%] z-30 w-[130px] -translate-x-1/2 sm:w-[146px] xl:w-[160px]">
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, -3, 0], filter: ["drop-shadow(0 0 16px hsl(var(--gold) / 0.36))", "drop-shadow(0 0 28px hsl(var(--gold) / 0.62))", "drop-shadow(0 0 16px hsl(var(--gold) / 0.36))"] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <SeatThroneMark className="h-auto w-full" />
        </motion.div>
      </div>

      <div
        ref={ref}
        className="absolute left-1/2 top-[55%] z-30 grid h-[200px] w-[200px] max-w-[66vw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-gold/32 bg-card/92 px-5 py-5 text-center shadow-[0_0_48px_-30px_hsl(var(--gold)/0.7)] backdrop-blur-md dark:bg-black/78 sm:h-[214px] sm:w-[214px] xl:h-[222px] xl:w-[222px]"
      >
        <div className="max-w-[210px]">
          <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-gold/90 sm:text-[10px]">
            {heroSystem.seat.coreLabel}
          </div>
          {displayValue !== null ? (
            <div className="mt-2.5 whitespace-nowrap font-mono text-[clamp(1.1rem,1.9vw,1.6rem)] font-black leading-none tracking-[-0.04em] text-viz-4">
              {displayValue}
            </div>
          ) : (
            <div className="mt-2.5 font-mono text-xs font-semibold text-muted-foreground">
              {reality.loading ? "Checking…" : heroSystem.seat.coreUnavailable}
            </div>
          )}
          <svg className="mx-auto mt-3 h-7 w-[78%] text-viz-4" viewBox="0 0 260 42" aria-hidden="true">
            <motion.path
              d="M4 33 C36 31 54 27 78 25 C116 22 140 18 166 15 C196 10 222 9 256 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0.35 }}
              animate={reduceMotion ? undefined : { pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.4, delay: 0.35, ease: "easeOut" }}
            />
          </svg>
          <div className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em] text-foreground/75 dark:text-white/80">
            {heroSystem.seat.coreNote}
          </div>
          <div className="mt-3 flex justify-center"><LiveReadTag state={tagState} /></div>
        </div>
      </div>

      <div className="absolute inset-0 z-20 hidden md:block">
        {heroSystem.flow.sources.map((source, index) => {
          const IconKey = source.id as keyof typeof sourceIcons;
          return (
            <motion.div
              key={source.id}
              className={`absolute ${sourcePositions[source.id]} flex items-center gap-1.5`}
              initial={reduceMotion ? false : { opacity: 0, x: -12 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ delay: 0.18 + index * 0.07, duration: 0.45 }}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/45 bg-card/82 text-gold shadow-[0_0_24px_-12px_hsl(var(--gold)/0.9)] dark:bg-black/62">
                <SourceIcon id={IconKey} />
              </span>
              <span className="min-w-[84px] rounded-lg border border-viz-4/25 bg-card/88 px-2 py-1.5 shadow-[0_0_22px_-18px_hsl(var(--viz-4)/0.9)] backdrop-blur-sm dark:bg-black/64">
                <span className="block whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-foreground dark:text-white">{source.label}</span>
                <span className="block font-mono text-[8px] text-muted-foreground">{source.sub}</span>
              </span>
            </motion.div>
          );
        })}

        {heroSystem.flow.routes.map((route, index) => {
          const id = route.id as keyof typeof routeIcons;
          const tone = route.tone === "liquidity" ? "text-viz-6 border-viz-6/45" : route.tone === "operations" ? "text-viz-3 border-viz-3/45" : "text-gold border-gold/50";
          return (
            <motion.div
              key={route.id}
              className={`absolute ${routePositions[route.id]} flex items-center gap-1.5`}
              initial={reduceMotion ? false : { opacity: 0, x: 12 }}
              animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ delay: 0.58 + index * 0.08, duration: 0.45 }}
            >
              <span className={`grid h-11 w-11 place-items-center rounded-full border bg-card/84 shadow-[0_0_24px_-12px_currentColor] dark:bg-black/62 ${tone}`}>
                <RouteIcon id={id} />
              </span>
              <span className={`min-w-[70px] rounded-lg border bg-card/90 px-2 py-1.5 dark:bg-black/64 ${tone}`}>
                <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.07em] text-foreground dark:text-white">{route.label}</span>
                <span className="block font-mono text-sm font-black">{route.ratio}</span>
                <span className="block font-mono text-[8px] text-muted-foreground">Routed</span>
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
