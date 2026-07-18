// pages/Liquidity.tsx — /liquidity (ARC SLICE L-1, founder-found harvest).
// Origin: TheSyndicate liquidity.tsx + rail/why/status components — ADAPTED
// to the living chassis and our tokens; every external link verified (see
// config/liquidityPool.ts). THE FLOW-SEPARATION LAW: no Join/membership CTA
// on this page's rail — LP-side actions only, so the two flows never blur.
// Live figures come from the EXISTING reality spine (LP reserves + derived
// price via useTokenomics) — no new read path, fail-closed.

import { ArrowDown, ExternalLink } from "lucide-react";
import { MemberAppPage } from "@/components/member/MemberAppPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { Card } from "@/components/ui/card";
import { useTokenomics } from "@/components/tokenomics/useTokenomics";
import {
  LIQUIDITY_LINKS,
  WHY_LP_CARDS,
  LP_NO_ENTITLEMENT_LINE,
  LP_RISKS,
} from "@/config/liquidityPool";

type RailAction = {
  label: string;
  hint: string;
  href?: string;
  anchor?: string;
  variant: "primary" | "secondary" | "ghost";
};

const RAIL: RailAction[] = [
  { label: "Trade SYN", hint: "Swap on Trader Joe", href: LIQUIDITY_LINKS.tradeUrl, variant: "primary" },
  { label: "Add Liquidity", hint: "Deposit SYN + USDC", href: LIQUIDITY_LINKS.addLiquidityUrl, variant: "secondary" },
  { label: "Become an LP", hint: "How it works · risks", anchor: "#provide-liquidity", variant: "secondary" },
  { label: "View Pool", hint: "DexScreener chart", href: LIQUIDITY_LINKS.dexscreenerUrl, variant: "ghost" },
];

function railClass(variant: RailAction["variant"]): string {
  if (variant === "primary") return "border-gold/60 bg-gold/10 hover:bg-gold/20";
  if (variant === "secondary") return "border-border/70 hover:border-gold/50";
  return "border-dashed border-border/60 hover:border-gold/40";
}

function ActionRail() {
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-12">
      <div className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Liquidity actions
        </p>
        <p className="mt-1 text-xs text-muted-foreground max-w-2xl leading-relaxed">
          Trade, deposit, or look up the live SYN/USDC pair on Avalanche. These
          are LP-side actions only — membership (USDC → SYN via the sale) is a
          separate flow and deliberately not on this rail.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {RAIL.map((a) => (
          <a
            key={a.label}
            href={a.href ?? a.anchor}
            target={a.href ? "_blank" : undefined}
            rel={a.href ? "noopener noreferrer" : undefined}
            className={`group block rounded-md border px-3 py-3 text-left transition-colors ${railClass(a.variant)}`}
            data-testid={`liquidity-action-${a.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
          >
            <span className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-foreground">
              {a.label}
              {a.href ? (
                <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-gold" aria-hidden="true" />
              ) : (
                <ArrowDown className="h-3 w-3 text-muted-foreground group-hover:text-gold" aria-hidden="true" />
              )}
            </span>
            <span className="mt-1 block text-[11px] text-muted-foreground leading-snug">{a.hint}</span>
          </a>
        ))}
        {/* Verify Pair — the on-chain pair via the server's verify-links (never
            a hardcoded client address); fail-closed: absent link, absent tile. */}
        <div className="rounded-md border border-dashed border-border/60 px-3 py-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-foreground">
            Verify Pair
          </span>
          <span className="mt-1 block text-[11px] text-muted-foreground leading-snug">
            The pair contract, on-chain
          </span>
          <span className="mt-1.5 block">
            <VerifyOnChain ids={["lpPair"]} />
          </span>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">{LP_NO_ENTITLEMENT_LINE}</p>
    </Card>
  );
}

// LpStatus — live reserves + derived price from the EXISTING spine reads.
// Fail-closed: an unreadable figure renders as absent, never stale.
function LpStatus() {
  const { lpReserveSyn, lpReserveUsdc, marketPriceUsdcPerSyn, loading } = useTokenomics();
  const rows = [
    { label: "SYN in pool", value: lpReserveSyn, unit: "SYN" },
    { label: "USDC in pool", value: lpReserveUsdc, unit: "USDC" },
    { label: "Implied price", value: marketPriceUsdcPerSyn, unit: "USDC / SYN" },
  ];
  return (
    <Card className="bg-card/40 border-border/50 p-5 mb-12">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-base font-medium text-foreground">The pool, read live</h2>
        <VerifyOnChain ids={["lpPair"]} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-md border border-border/50 bg-background/40 p-3">
            <p className="text-[11px] text-muted-foreground mb-1">{r.label}</p>
            <p className="font-mono text-lg text-foreground" data-testid={`lp-${r.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}>
              {r.value ?? (loading ? "…" : "—")}{" "}
              <span className="text-xs text-muted-foreground">{r.unit}</span>
            </p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground leading-relaxed">
        Read from the pair's own reserves through the protocol's reality spine —
        the same source as every live figure on this site. The implied price is
        arithmetic on reserves, never a quote or a promise.
      </p>
    </Card>
  );
}

export default function Liquidity() {
  return (
    <MemberAppPage
      eyebrow="Liquidity"
      title="LP is what makes SYN tradable."
      lead="Before any chart or reserve number — understand why a liquidity pool exists at all. The pool below is small on purpose: every early LP shapes how SYN trades for everyone who comes after."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      {/* Why LP matters — the origin's three cards, framing kept. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {WHY_LP_CARDS.map((c) => (
          <Card key={c.title} className="bg-card/40 border-border/50 p-5">
            <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{c.body}</p>
          </Card>
        ))}
      </div>

      <ActionRail />
      <LpStatus />

      {/* Become an LP — the anchor target: how it works + the Risk Notice. */}
      <section id="provide-liquidity" className="scroll-mt-24">
        <h2 className="type-h2 text-foreground mb-2">Become an LP</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-6">
          Providing liquidity means depositing SYN and USDC together into the
          pair on Trader Joe, from your own wallet, on the DEX itself. The
          Syndicate runs no liquidity interface and holds no position for you —
          the "Add Liquidity" action above leaves this site.
        </p>
        <h3 className="text-base font-medium text-foreground mb-3">The LP Risk Notice</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {LP_RISKS.map((r) => (
            <Card key={r.title} className="bg-card/20 border-border/50 p-4">
              <h4 className="text-sm font-medium text-foreground mb-1">{r.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{r.body}</p>
            </Card>
          ))}
        </div>
        <Card className="bg-gold/5 border-gold/25 p-4">
          <p className="text-sm text-foreground/90 leading-relaxed">{LP_NO_ENTITLEMENT_LINE}</p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            Not equity. Not a pooled fund of the Syndicate. Not an investment
            product. Membership is a separate act on a separate page.
          </p>
        </Card>
      </section>
    </MemberAppPage>
  );
}
