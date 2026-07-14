import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "wouter";
import { Gauge } from "lucide-react";
import { LiveReadTag } from "@/components/hero/LiveReadTag";
import { useHeroReality, type HeroReality } from "@/components/hero/useHeroReality";
import { heroSourceIcons, heroRouteIcons, heroBurnIcon as BurnIcon } from "@/components/hero/heroIconLanguage";
import { heroSystem } from "@/config/syndicateFacts";
import { SeatThroneMark } from "@/components/hero/SeatThroneMark";
import { useCountUp } from "@/components/hero/useCountUp";
import { CHRONICLE_REGISTER } from "@/config/chronicleRegister";

const sourcePositions: Record<string, string> = {
  membership: "left-[14%] top-[20%]",
  chronicle: "left-[8%] top-[34%]",
  nft: "left-[11%] top-[48%]",
  lpfees: "left-[16%] top-[72%]",
  referrals: "left-[17%] top-[83%]",
  // M1-b orbit rebalance: future streams take the top-right slot (empty
  // before), leaving the bottom row to referrals (left) and burn (right) —
  // no chip collisions down to the narrowest md container.
  future: "right-[6%] top-[12%]",
};

const routePositions: Record<string, string> = {
  vault: "right-[5%] top-[32%]",
  liquidity: "right-[5%] top-[53%]",
  operations: "right-[13%] top-[72%]",
};

// M1-b: Proof of Burn joins the map — the one real SYN outflow (the numbered
// burn record), filling the empty bottom-right orbit slot.
const burnPosition = "right-[6%] top-[88%]";

const flowPaths = [
  { id: "membership", d: "M205 128 C282 166 332 214 420 286", color: "emerald" },
  { id: "chronicle", d: "M165 214 C270 244 337 268 420 296", color: "emerald" },
  { id: "nft", d: "M177 293 C275 296 338 300 420 304", color: "emerald" },
  { id: "lpfees", d: "M207 446 C305 398 365 344 420 318", color: "emerald" },
  { id: "referrals", d: "M150 452 C240 405 360 350 424 320", color: "emerald" },
  { id: "future", d: "M712 92 C610 148 512 228 434 290", color: "emerald" },
  { id: "vault", d: "M438 300 C518 230 610 174 714 130", color: "gold" },
  { id: "liquidity", d: "M442 306 C540 307 651 307 768 307", color: "cyan" },
  { id: "operations", d: "M438 318 C520 388 608 450 725 502", color: "violet" },
  { id: "burn", d: "M430 325 C480 420 560 480 665 512", color: "flame" },
];

// Categorical flow colors → the tokenized gold + data-viz palette (matching the
// other hero panels). Applied via CSS (style / fill-*) so hsl(var(...)) resolves
// reliably, not as a raw SVG presentation attribute.
const flowColor = {
  emerald: "hsl(var(--viz-4) / 0.5)",
  gold: "hsl(var(--gold) / 0.58)",
  cyan: "hsl(var(--viz-1) / 0.6)",
  violet: "hsl(var(--viz-3) / 0.58)",
  flame: "hsl(var(--viz-5) / 0.55)",
};

function SourceIcon({ id }: { id: string }) {
  const Icon = heroSourceIcons[id] ?? Gauge;
  return <Icon className="h-4 w-4" />;
}

function RouteIcon({ id }: { id: string }) {
  const Icon = heroRouteIcons[id] ?? Gauge;
  return <Icon className="h-5 w-5" />;
}

// ── THE STRUCTURAL LAW (M1-b): every node sub-label is DERIVED from real
// status at render time — live chain reads, or the committed chronicle
// register — never a frozen string. Fail-closed: an unavailable read renders
// an honest Checking…/Unavailable, never yesterday's claim.
function deriveNodeSub(id: string, reality: HeroReality): string {
  const fallback = reality.loading ? "Checking…" : "Unavailable";
  switch (id) {
    case "membership":
      // Liveness derived from the sale's own live inflow read. The SEAT COUNT
      // deliberately does not render here: a public member figure must carry
      // its MembersProvenance split (guard-freshness law), and it already
      // does — twice — in the hero's seat line and the overview panel.
      return reality.aggregateInflowUsdc !== null ? "Live · seats selling now" : fallback;
    case "chronicle":
      // Repo truth: the committed public register's real size.
      return `${CHRONICLE_REGISTER.length} chapter${CHRONICLE_REGISTER.length === 1 ? "" : "s"} public`;
    case "nft":
      return reality.nftMintedTotal !== null ? `Live · ${reality.nftMintedTotal} minted` : fallback;
    case "lpfees":
      return reality.lpUsdc !== null && reality.lpSyn !== null
        ? "Live · reserves on-chain"
        : fallback;
    case "referrals":
      return reality.paidToReferrersUsdc !== null
        ? `Live · ${reality.paidToReferrersUsdc} USDC paid`
        : fallback;
    case "future":
      // A declaration, not a status claim — the one honest static sub.
      return "Declared";
    case "burn":
      // The label already says "Proof of Burn" — the sub stays compact.
      return reality.burnedSyn !== null ? `Live · ${reality.burnedSyn} SYN` : fallback;
    default:
      return fallback;
  }
}

/** Node chip — a DOOR (Link) when its page exists, inert otherwise. */
function NodeChip({
  door,
  className,
  children,
  testId,
}: {
  door: string | null;
  className: string;
  children: ReactNode;
  testId: string;
}) {
  if (door === null) {
    return (
      <span className={className} data-testid={testId}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={door}
      className={`${className} cursor-pointer transition-colors hover:border-gold/60`}
      data-testid={testId}
    >
      {children}
    </Link>
  );
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
        {heroSystem.flow.sources.map((source, index) => (
          <motion.div
            key={source.id}
            className={`absolute ${sourcePositions[source.id]} flex items-center gap-1.5`}
            initial={reduceMotion ? false : { opacity: 0, x: -12 }}
            animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
            transition={{ delay: 0.18 + index * 0.07, duration: 0.45 }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/45 bg-card/82 text-gold shadow-[0_0_24px_-12px_hsl(var(--gold)/0.9)] dark:bg-black/62">
              <SourceIcon id={source.id} />
            </span>
            <NodeChip
              door={source.door}
              testId={`map-node-${source.id}`}
              className="block min-w-[84px] rounded-lg border border-viz-4/25 bg-card/88 px-2 py-1.5 shadow-[0_0_22px_-18px_hsl(var(--viz-4)/0.9)] backdrop-blur-sm dark:bg-black/64"
            >
              <span className="block whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-foreground dark:text-white">{source.label}</span>
              <span className="block font-mono text-[8px] text-muted-foreground">{deriveNodeSub(source.id, reality)}</span>
            </NodeChip>
          </motion.div>
        ))}

        {heroSystem.flow.routes.map((route, index) => {
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
                <RouteIcon id={route.id} />
              </span>
              <span className={`min-w-[70px] rounded-lg border bg-card/90 px-2 py-1.5 dark:bg-black/64 ${tone}`}>
                <span className="block font-mono text-[9px] font-bold uppercase tracking-[0.07em] text-foreground dark:text-white">{route.label}</span>
                <span className="block font-mono text-sm font-black">{route.ratio}</span>
                <span className="block font-mono text-[8px] text-muted-foreground">Routed</span>
              </span>
            </motion.div>
          );
        })}

        {/* Proof of Burn — the SYN outflow node, live and numbered. */}
        <motion.div
          className={`absolute ${burnPosition} flex items-center gap-1.5`}
          initial={reduceMotion ? false : { opacity: 0, x: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, x: 0 }}
          transition={{ delay: 0.82, duration: 0.45 }}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border border-viz-5/45 bg-card/84 text-viz-5 shadow-[0_0_24px_-12px_currentColor] dark:bg-black/62">
            <BurnIcon className="h-4 w-4" />
          </span>
          <NodeChip
            door={heroSystem.flow.burn.door}
            testId="map-node-burn"
            className="block min-w-[84px] rounded-lg border border-viz-5/30 bg-card/88 px-2 py-1.5 backdrop-blur-sm dark:bg-black/64"
          >
            <span className="block whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-foreground dark:text-white">{heroSystem.flow.burn.label}</span>
            <span className="block font-mono text-[8px] text-muted-foreground">{deriveNodeSub("burn", reality)}</span>
          </NodeChip>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * The living map + its mobile rendering. On md+ the nodes live ON the map; on
 * mobile the map keeps its throne/center/orbits and the nodes render as a
 * compact clickable chip grid beneath — same derived truth, same doors,
 * nothing hidden from a phone.
 */
export function SeatFlowSurface() {
  const reality = useHeroReality();
  const mobileNodes = [
    ...heroSystem.flow.sources.map((s) => ({ id: s.id, label: s.label, door: s.door })),
    { id: "burn", label: heroSystem.flow.burn.label, door: heroSystem.flow.burn.door },
  ];
  return (
    <div className="w-full">
      <SeatFlowDiagram />
      <div className="mt-2 grid grid-cols-2 gap-1.5 px-2 pb-2 md:hidden">
        {mobileNodes.map((node) => {
          const Icon = node.id === "burn" ? BurnIcon : (heroSourceIcons[node.id] ?? Gauge);
          return (
            <NodeChip
              key={node.id}
              door={node.door}
              testId={`map-chip-${node.id}`}
              className="flex items-center gap-2 rounded-lg border border-border/70 bg-card/80 px-2.5 py-2 dark:border-white/10 dark:bg-black/40"
            >
              <Icon className={`h-4 w-4 shrink-0 ${node.id === "burn" ? "text-viz-5" : "text-gold"}`} />
              <span className="min-w-0">
                <span className="block truncate font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-foreground dark:text-white">{node.label}</span>
                <span className="block truncate font-mono text-[8px] text-muted-foreground">{deriveNodeSub(node.id, reality)}</span>
              </span>
            </NodeChip>
          );
        })}
      </div>
    </div>
  );
}
