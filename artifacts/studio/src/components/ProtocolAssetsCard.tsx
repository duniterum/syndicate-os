// Protocol assets amorce — the first pier of the economy page. A single
// honest card answering "what does the protocol hold?" with LIVE read-only
// chain reads (fail-closed: unavailable reads say so, nothing is invented).
// AVAX is a declared "coming" placeholder — the treasury acquisition strategy
// shows a real figure only once assets are actually acquired on-chain.
import { Coins, Droplet, Shield, Sparkles } from "lucide-react";
import { useGetProtocolReality, type VerifyLinkId } from "@workspace/api-client-react";
import { LiveReadTag, liveFigure } from "@/components/hero/LiveReadTag";
import { formatBaseUnits } from "@/components/hero/useHeroReality";
import { VerifyOnChain, VERIFY_SLOGAN } from "@/components/VerifyOnChain";

// "Don't trust — verify" explorer targets per asset row (protocol
// infrastructure ONLY — links come from the read-only endpoint, fail-closed).
const assetVerifyIds: Record<string, readonly VerifyLinkId[]> = {
  vault: ["vaultWallet"],
  lp: ["lpPair"],
  "syn-reserve": ["membershipSaleV3"],
};

function findValue(
  items: ReadonlyArray<{ id: string; value: unknown }> | undefined,
  id: string,
): string | null {
  const item = items?.find((i) => i.id === id);
  if (!item) return null;
  return typeof item.value === "string" ? item.value : null;
}

export function ProtocolAssetsCard() {
  const reality = useGetProtocolReality();
  const financial = reality.data?.groups.financial;
  const sale = reality.data?.groups.sale;

  const vaultUsdc = formatBaseUnits(findValue(financial, "financial.vault.usdcBalance"), 6, 2);
  const lpUsdc = formatBaseUnits(findValue(financial, "financial.lp.reserveUsdc"), 6, 2);
  const lpSyn = formatBaseUnits(findValue(financial, "financial.lp.reserveSyn"), 18, 2);
  const synReserve = formatBaseUnits(
    findValue(sale, "sale.MEMBERSHIP_SALE_V3.availableSyn"),
    18,
    0,
  );

  const anyLive = vaultUsdc !== null || lpUsdc !== null || synReserve !== null;
  const tagState = anyLive ? "live" : reality.isLoading ? "checking" : "unavailable";

  const rows: Array<{
    id: string;
    label: string;
    icon: typeof Shield;
    tone: string;
    value: string | null;
    meta: string;
    coming?: boolean;
  }> = [
    {
      id: "vault",
      label: "Vault USDC",
      icon: Shield,
      tone: "text-viz-1",
      value: vaultUsdc !== null ? `${vaultUsdc} USDC` : null,
      meta: "70% routing destination · live balance",
    },
    {
      id: "lp",
      label: "LP position",
      icon: Droplet,
      tone: "text-viz-6",
      value: lpSyn !== null && lpUsdc !== null ? `${lpSyn} SYN + ${lpUsdc} USDC` : null,
      meta: "Protocol-owned liquidity · live reserves",
    },
    {
      id: "syn-reserve",
      label: "SYN reserve",
      icon: Coins,
      tone: "text-gold",
      value: synReserve !== null ? `${synReserve} SYN` : null,
      meta: "V3 sale engine · available for membership",
    },
    {
      id: "avax",
      label: "AVAX",
      icon: Sparkles,
      tone: "text-muted-foreground",
      value: null,
      meta: "Treasury acquisition strategy — shows real once acquired",
      coming: true,
    },
  ];

  return (
    <section className="rounded-[1.05rem] border border-gold/25 bg-card/74 p-5 dark:bg-surface-command/76">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="type-h2 text-foreground">Protocol assets</h2>
        <LiveReadTag state={tagState} />
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        What the protocol holds — on-chain verifiable.{" "}
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground/70">{VERIFY_SLOGAN}</span>
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.id}
              className="min-h-[104px] rounded-xl border border-border bg-background/58 p-3.5 dark:border-white/10 dark:bg-white/[0.035]"
            >
              <div className="mb-2 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${row.tone}`} />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {row.label}
                </span>
              </div>
              {row.coming ? (
                <div className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Coming
                </div>
              ) : row.value !== null ? (
                <div className="font-mono text-base font-black text-foreground">{row.value}</div>
              ) : (
                <div className="font-mono text-sm font-semibold text-muted-foreground">
                  {liveFigure(null, reality.isLoading)}
                </div>
              )}
              <div className="mt-2 text-[11px] leading-snug text-muted-foreground">{row.meta}</div>
              {assetVerifyIds[row.id] ? (
                <VerifyOnChain ids={assetVerifyIds[row.id]} className="mt-1.5 block" />
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
