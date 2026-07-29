// Protocol Reserves — the home band (founder-approved mockup, 2026-07-25:
// name "Protocol Reserves", the look, and the composition bar all validated).
// ---------------------------------------------------------------------------
// What the protocol OWNS, read live from Avalanche when the page loads. Driven
// entirely by config/trackedAssets.ts: one registry entry decides a row's order,
// logo, decimals, balance source and price source — the total, the composition
// bar and the share bars all follow.
//
// THE VALUATION LAW (same one the /contracts card obeys — one authority, never
// two answers): only assets held DIRECTLY in a protocol wallet with a DEEP
// market are valued and summed. USDC counts at one dollar; AVAX/BTC/ETH take
// live Chainlink prices. SYN is NEVER priced here. If ANY component cannot be
// read, the headline says so instead of publishing a partial sum.
import { useState } from "react";
import { useGetProtocolReality, type VerifyLinkId } from "@workspace/api-client-react";
import { LiveReadTag, liveFigure } from "@/components/hero/LiveReadTag";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { TRACKED_ASSETS } from "@/config/trackedAssets";
import { formatAmount, sumRawUnits, rawShare } from "@/lib/amountFormat";

/**
 * LITERAL class names on purpose. Tailwind scans source text, so a class built
 * as `bg-${tone}` is never generated and the bar renders invisible — a silent
 * design bug. Every tone a registry entry may name is spelled out here.
 */
const TONE_BG: Record<string, string> = {
  "viz-1": "bg-viz-1",
  "viz-2": "bg-viz-2",
  "viz-3": "bg-viz-3",
  "viz-4": "bg-viz-4",
  "viz-5": "bg-viz-5",
  "viz-6": "bg-viz-6",
  gold: "bg-gold",
};
const toneBg = (tone: string): string => TONE_BG[tone] ?? "bg-muted-foreground";

function raw(items: ReadonlyArray<{ id: string; value: unknown }> | undefined, id: string): string | null {
  const it = items?.find((i) => i.id === id);
  return it && typeof it.value === "string" ? it.value : null;
}

/** Raw base units → number, for display valuation only. Null-safe, finite-checked. */
function toNum(v: string | null, decimals: number): number | null {
  if (v === null) return null;
  try {
    const n = Number(BigInt(v)) / 10 ** decimals;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function usd(n: number): string {
  if (n > 0 && n < 0.01) return "< $0.01";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// A token amount is rendered by THE ONE TRUNCATION (lib/amountFormat), never
// here. This band used to run Number() + Intl, whose default rounding mode is
// halfExpand — half-up — so the vault's untouched WETH.e read 0.026552 on this
// public page and 0.026551 on /contracts and /activity at the same instant.
// Floats survive below for the USD VALUATION only, which is a derived fiat
// figure and not a projection of base units.

/** Local vendored logo, falling back to a lettered disc — never a broken image. */
function CoinMark({ logo, symbol }: { logo: string; symbol: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <span className="font-mono text-[11px] font-bold text-muted-foreground">{symbol.slice(0, 3)}</span>
    );
  }
  return (
    <img
      src={`/coins/${logo}.svg`}
      alt=""
      aria-hidden="true"
      width={34}
      height={34}
      loading="lazy"
      className="h-[34px] w-[34px]"
      onError={() => setBroken(true)}
    />
  );
}

export function ProtocolReservesBand() {
  const reality = useGetProtocolReality();
  const fin = reality.data?.groups.financial;

  // The protocol's OWN SHARE of the pool, USDC leg only (the SYN leg is never
  // priced — pricing it would mark SYN to the thin pool price). Computed BEFORE
  // the rows, because the USDC row folds it in.
  // Taken with EXACT integer maths — amount × ourLP ÷ totalLP on the three raw
  // reads — so our share of the pool's USDC leg is derived the same way the
  // wallet balances are. `poolShare` stays a float for the caption only.
  const poolUsdcRaw = raw(fin, "financial.lp.reserveUsdc");
  const lpSupplyRaw = raw(fin, "financial.lp.totalSupply");
  const lpOwnedRaw = raw(fin, "financial.lp.protocolBalance");
  const poolUsdcOwnedRaw = rawShare(poolUsdcRaw, lpOwnedRaw, lpSupplyRaw);
  const lpSupply = toNum(lpSupplyRaw, 18);
  const lpOwned = toNum(lpOwnedRaw, 18);
  const poolShare = lpSupply !== null && lpOwned !== null && lpSupply > 0 ? lpOwned / lpSupply : null;

  // ── Rows from the registry. ONE ASSET = ONE ROW: an asset held across several
  //    wallets — and for USDC across the pool as well (founder, 2026-07-25:
  //    "on ajoute aussi le pool dans USDC ainsi on a 4 cards") — is SUMMED here,
  //    never split into look-alike cards. A missing component makes the whole
  //    row unavailable rather than a partial sum.
  const rows = TRACKED_ASSETS.map((a) => {
    const legs = a.balanceIds.map((id) => raw(fin, id));
    if (a.includesPoolShare) legs.push(poolUsdcOwnedRaw);
    // Summed in RAW base units: a missing leg makes the whole row unavailable
    // rather than a partial sum, and the shown figure is the same projection
    // /contracts and /activity use.
    const amtRaw = sumRawUnits(legs);
    const amt = toNum(amtRaw, a.decimals); // float — for the USD valuation only
    const px = a.priceId === "PEGGED_USD" ? 1 : toNum(raw(fin, a.priceId), 8);
    const value = amt !== null && px !== null ? amt * px : null;
    return { ...a, amtRaw, amt, px, value };
  });

  // THE ONE LIST. The total and the composition bar are computed from the SAME
  // array — that is what makes the bar fill exactly 100%. When they were built
  // from different lists the bar summed to 80% and left a black gap at the end
  // (founder caught it on the live site, 2026-07-25). Never split them again.
  const segments = rows.map((r) => ({ key: r.symbol, tone: r.tone, value: r.value }));
  const parts = segments.map((s) => s.value);
  const total = parts.every((p) => p !== null) ? (parts as number[]).reduce((a, b) => a + b, 0) : null;

  const anyLive = parts.some((p) => p !== null);
  const tagState = anyLive ? "live" : reality.isLoading ? "checking" : "unavailable";

  // Composition — only meaningful once the whole total is known.
  const pct = (v: number | null): number => (total !== null && total > 0 && v !== null ? (v / total) * 100 : 0);
  const mix = segments.map((s) => ({ ...s, p: pct(s.value) })).filter((m) => m.p > 0);

  return (
    <section className="w-full px-4 py-3 text-foreground sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card/40 p-6 shadow-sm md:p-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              Protocol Reserves
            </div>
            <h2 className="type-h2 mt-1.5 text-foreground">What the protocol owns, right now.</h2>
          </div>
          <LiveReadTag state={tagState} />
        </div>

        <div className="mb-7 grid items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-11">
          <div>
            <div className="type-eyebrow text-muted-foreground">
              Total value
            </div>
            <div className="mt-1 font-mono text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              {total !== null ? (
                usd(total)
              ) : (
                <span className="text-xl font-semibold text-muted-foreground">
                  {liveFigure(null, reality.isLoading)}
                </span>
              )}
            </div>
            <p className="measure mt-3 text-sm text-muted-foreground">
              Priced from live Chainlink feeds. Every figure below is read from Avalanche when this page loads — if one
              cannot be read, this total says so instead of guessing. SYN, our own token, is never given a dollar value
              here.
            </p>
          </div>

          {mix.length > 0 ? (
            <div>
              <div className="mb-2.5 type-eyebrow text-muted-foreground">
                Composition
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full border border-border bg-background/60">
                {mix.map((m) => (
                  <span key={m.key} className={`block ${toneBg(m.tone)}`} style={{ width: `${m.p}%` }} />
                ))}
              </div>
              <div className="mt-3 flex flex-wrap gap-3.5">
                {mix.map((m) => (
                  <span
                    key={m.key}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-muted-foreground"
                  >
                    <i className={`h-2 w-2 rounded-[2px] ${toneBg(m.tone)}`} />
                    {/* A real, non-zero holding never reads as "0%" — the same
                        false-zero law the amounts follow. */}
                    {m.key} {m.p > 0 && m.p < 0.5 ? "< 1" : Math.round(m.p)}%
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Four assets, four columns from lg — the approved mockup shows them in
            ONE row, not 3+1 (a 3-column grid left the fourth card orphaned on a
            1280px screen). Two columns on tablet, one on phone. */}
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((r) => (
            <div
              key={r.symbol}
              className="rounded-xl border border-border bg-background/58 p-4 transition-colors hover:border-gold/40 dark:border-white/10 dark:bg-white/[0.035]"
            >
              <div className="mb-3 flex items-center gap-3">
                <span className="grid h-9 w-9 flex-none place-items-center overflow-hidden rounded-full border border-border bg-background/70">
                  <CoinMark logo={r.logo} symbol={r.symbol} />
                </span>
                <span>
                  <span className="block font-mono text-xs font-bold uppercase tracking-[0.1em]">{r.symbol}</span>
                  <span className="block text-[11px] text-muted-foreground">{r.name}</span>
                </span>
              </div>
              <div className="font-mono text-lg font-black">
                {formatAmount(r.amtRaw, r.decimals, r.dp) ?? liveFigure(null, reality.isLoading)}
              </div>
              {r.value !== null ? (
                <div className="mt-0.5 font-mono text-[13px] font-semibold text-proof">{usd(r.value)}</div>
              ) : null}
              <div className="mt-3 h-[3px] overflow-hidden rounded-sm bg-border/70">
                <i className={`block h-full ${toneBg(r.tone)}`} style={{ width: `${pct(r.value)}%` }} />
              </div>
              <div className="mt-2 font-mono text-[10.5px] text-muted-foreground">
                {r.priceId === "PEGGED_USD"
                  ? "$1.00 · stablecoin"
                  : r.px !== null
                    ? `${usd(r.px)} / ${r.symbol} · Chainlink`
                    : "price unavailable"}
              </div>
              {r.held ? (
                <div className="mt-1 text-[10.5px] leading-snug text-muted-foreground">{r.held}</div>
              ) : null}
              <VerifyOnChain ids={r.verify as readonly VerifyLinkId[]} className="mt-2 block" />
            </div>
          ))}

        </div>

        <p className="measure mt-6 border-t border-border pt-5 text-[12.5px] text-muted-foreground">
          These are assets the protocol owns outright. They are <b>not</b> a claim and <b>not</b> a promise to any
          member — holding a seat entitles you to none of them. They are shown so you can check us.
        </p>
      </div>
    </section>
  );
}
