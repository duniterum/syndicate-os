// Protocol assets — a single honest card answering "what does the protocol
// hold?" with LIVE read-only chain reads (fail-closed: unavailable reads say
// so, nothing is invented).
//
// THE VALUATION RULE (founder ruling 2026-07-25, and the senior review of the
// same day that caught its first implementation breaking it):
//   · Only assets the protocol holds DIRECTLY in a protocol wallet, and whose
//     price comes from a DEEP market, are given a USD value and summed:
//     USDC at $1, plus AVAX / BTC.b / WETH.e at live Chainlink prices.
//   · SYN is NEVER assigned a USD value — its only on-chain price is a thin
//     pool, so a mark-to-market would be unrealizable and chain-refutable.
//   · THE POOL IS COUNTED AT OUR REAL SHARE, USDC LEG ONLY. It is NEVER counted
//     by doubling the USDC reserve (the usual AMM shortcut), because that
//     silently marks the pool's SYN half to the same thin price the rule above
//     forbids. And the pair's reserves belong to every liquidity provider, so
//     ownership is READ, never assumed: `financial.lp.totalSupply` +
//     `financial.lp.protocolBalance` (balanceOf(pair, LIQUIDITY_WALLET)) — LP
//     tokens are an ERC-20, so who-put-what is a public balance. Only the
//     protocol's liquidity wallet counts; the Founder's personal liquidity is
//     HIS, never the protocol's treasury.
//     CORRECTED 2026-07-26: this header still described the pool as "not valued
//     and not summed … a named follow-up", a hundred lines above the body that
//     performs exactly that read and sums it. The follow-up SHIPPED on
//     2026-07-25 and nobody moved the header — which is how featureStatus came
//     to carry the same false line, and how the /contracts served head did too.
// Every row links to Snowtrace — the wallet page proves each balance.
import { CoinMark, SYN_LOGO } from "@/components/coin/CoinMark";
import { useGetProtocolReality, type VerifyLinkId } from "@workspace/api-client-react";
import { LiveReadTag, liveFigure } from "@/components/hero/LiveReadTag";
// THE ONE FIGURE: this card and /activity now render a holding through the SAME
// truncating formatter. They used to disagree — the vault's untouched WETH.e read
// `0.026552` here and `0.026551` on /activity. See lib/amountFormat.ts.
import { formatAmount as fmtAmount } from "@/lib/amountFormat";
import { VerifyOnChain, VERIFY_SLOGAN } from "@/components/VerifyOnChain";

// "Don't trust — verify" explorer targets per asset row (protocol
// infrastructure ONLY — links come from the read-only endpoint, fail-closed).
const assetVerifyIds: Record<string, readonly VerifyLinkId[]> = {
  vault: ["vaultWallet"],
  ops: ["operationsWallet"],
  "vault-avax": ["vaultWallet"],
  "vault-btcb": ["vaultWallet"],
  "vault-weth": ["vaultWallet"],
  "vault-syn": ["vaultWallet"],
  "nft-sales": ["nftArchive"],
  pool: ["lpPair"],
  "seat-reserve": ["membershipSaleV3"],
};

function findValue(
  items: ReadonlyArray<{ id: string; value: unknown }> | undefined,
  id: string,
): string | null {
  const item = items?.find((i) => i.id === id);
  if (!item) return null;
  return typeof item.value === "string" ? item.value : null;
}

// Raw base-unit string → JS number, for the USD valuation ONLY (display math on
// figures whose magnitude is far below the precision limit; the exact base-unit
// string always remains the authority for the token amount itself).
function toNum(raw: string | null, decimals: number): number | null {
  if (raw === null) return null;
  try {
    const n = Number(BigInt(raw)) / 10 ** decimals;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** A USD figure. A non-zero holding never renders as a flat $0.00 (honest dust). */
function fmtUsd(n: number): string {
  if (n > 0 && n < 0.01) return "< $0.01";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function ProtocolAssetsCard() {
  const reality = useGetProtocolReality();
  const financial = reality.data?.groups.financial;
  const sale = reality.data?.groups.sale;

  // ── Raw reads ───────────────────────────────────────────────────────────────
  const rawVaultUsdc = findValue(financial, "financial.vault.usdcBalance");
  const rawOpsUsdc = findValue(financial, "financial.ops.usdcBalance");
  const rawAvax = findValue(financial, "financial.vault.avaxBalance");
  const rawBtcb = findValue(financial, "financial.vault.btcbBalance");
  const rawWeth = findValue(financial, "financial.vault.wethBalance");
  // The vault's SYN balance IS the VAULT_RESERVE allocation (the same wallet,
  // pinned by the targets-reconcile guard) — reuse that live read, never a twin.
  const rawVaultSyn = findValue(financial, "financial.distribution.VAULT_RESERVE.balance");
  const rawPoolSyn = findValue(financial, "financial.lp.reserveSyn");
  const rawPoolUsdc = findValue(financial, "financial.lp.reserveUsdc");
  const rawLpSupply = findValue(financial, "financial.lp.totalSupply");
  const rawLpOwned = findValue(financial, "financial.lp.protocolBalance");
  const rawNftWallet = findValue(financial, "financial.nftSale.walletUsdcBalance");
  const rawNftContract = findValue(financial, "financial.nftSale.contractUsdcBalance");
  const rawSeatReserve = findValue(sale, "sale.MEMBERSHIP_SALE_V3.availableSyn");

  // ── Token amounts (display strings) ─────────────────────────────────────────
  const vaultUsdc = fmtAmount(rawVaultUsdc, 6, 2);
  const opsUsdc = fmtAmount(rawOpsUsdc, 6, 2);
  const vaultAvax = fmtAmount(rawAvax, 18, 4);
  const vaultBtcb = fmtAmount(rawBtcb, 8, 8);
  const vaultWeth = fmtAmount(rawWeth, 18, 6);
  const vaultSyn = fmtAmount(rawVaultSyn, 18, 0);
  const poolSyn = fmtAmount(rawPoolSyn, 18, 2);
  const poolUsdc = fmtAmount(rawPoolUsdc, 6, 2);
  const seatReserve = fmtAmount(rawSeatReserve, 18, 0);

  // ── USD valuation — directly-held, deep-market assets ONLY ──────────────────
  const avaxPx = toNum(findValue(financial, "financial.price.avaxUsd"), 8);
  const btcPx = toNum(findValue(financial, "financial.price.btcUsd"), 8);
  const ethPx = toNum(findValue(financial, "financial.price.ethUsd"), 8);

  const usdcUsd = toNum(rawVaultUsdc, 6); // a dollar stablecoin at $1
  const opsUsd = toNum(rawOpsUsdc, 6);
  const avaxAmt = toNum(rawAvax, 18);
  const btcbAmt = toNum(rawBtcb, 8);
  const wethAmt = toNum(rawWeth, 18);

  const avaxUsd = avaxAmt !== null && avaxPx !== null ? avaxAmt * avaxPx : null;
  const btcbUsd = btcbAmt !== null && btcPx !== null ? btcbAmt * btcPx : null;
  const wethUsd = wethAmt !== null && ethPx !== null ? wethAmt * ethPx : null;

  // THE POOL, HONESTLY: the pair's reserves belong to every liquidity provider,
  // so we attribute only the protocol's own SHARE — its LP tokens over the total
  // supply, both read live. And only of the USDC leg: pricing the SYN leg would
  // mark SYN to the thin pool price, which the valuation law forbids.
  const lpUsdcNum = toNum(rawPoolUsdc, 6);
  const lpSupplyNum = toNum(rawLpSupply, 18);
  const lpOwnedNum = toNum(rawLpOwned, 18);
  const poolShare =
    lpSupplyNum !== null && lpOwnedNum !== null && lpSupplyNum > 0 ? lpOwnedNum / lpSupplyNum : null;
  const poolUsd = poolShare !== null && lpUsdcNum !== null ? lpUsdcNum * poolShare : null;

  // NFT sale money: what the mints paid in and where it sits TODAY — the wallet
  // the sale contract itself names as its destination, plus anything still
  // resting inside the contract. NOT the same figure as all-time NFT
  // contributions (that one is mint price x minted count, served elsewhere).
  const nftWalletUsd = toNum(rawNftWallet, 6);
  const nftContractUsd = toNum(rawNftContract, 6);
  const nftUsd =
    nftWalletUsd !== null && nftContractUsd !== null ? nftWalletUsd + nftContractUsd : null;
  const nftAmount = nftUsd !== null ? nftUsd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : null;

  // The total fails closed: if ANY priced component is unavailable the headline
  // says so rather than publishing a partial (and therefore misleading) sum.
  const priced = [usdcUsd, opsUsd, avaxUsd, btcbUsd, wethUsd, poolUsd, nftUsd];
  const totalUsd = priced.every((c) => c !== null)
    ? (priced as number[]).reduce((a, c) => a + c, 0)
    : null;

  // The live tag speaks about the READS, not about the valuation: token amounts
  // can serve perfectly while a price feed is down, and vice versa.
  const anyAmountLive =
    vaultUsdc !== null ||
    opsUsdc !== null ||
    vaultAvax !== null ||
    vaultBtcb !== null ||
    vaultWeth !== null ||
    vaultSyn !== null ||
    seatReserve !== null;
  const tagState = anyAmountLive ? "live" : reality.isLoading ? "checking" : "unavailable";

  const rows: Array<{
    id: string;
    label: string;
    logo: string;
    tone: string;
    value: string | null;
    usd: string | null;
    meta: string;
  }> = [
    {
      id: "vault",
      label: "Vault USDC",
      logo: "usdc",
      tone: "text-viz-1",
      value: vaultUsdc !== null ? `${vaultUsdc} USDC` : null,
      usd: usdcUsd !== null ? fmtUsd(usdcUsd) : null,
      meta: "70% routing destination",
    },
    {
      id: "ops",
      label: "Operations USDC",
      logo: "usdc",
      tone: "text-viz-1",
      value: opsUsdc !== null ? `${opsUsdc} USDC` : null,
      usd: opsUsd !== null ? fmtUsd(opsUsd) : null,
      meta: "10% routing destination",
    },
    {
      id: "nft-sales",
      label: "NFT sales USDC",
      logo: "usdc",
      tone: "text-viz-1",
      value: nftAmount !== null ? `${nftAmount} USDC` : null,
      usd: nftUsd !== null ? fmtUsd(nftUsd) : null,
      meta: "Held now from NFT mints · not the all-time total",
    },
    {
      id: "vault-avax",
      label: "Vault AVAX",
      logo: "avax",
      tone: "text-viz-5",
      value: vaultAvax !== null ? `${vaultAvax} AVAX` : null,
      usd: avaxUsd !== null ? fmtUsd(avaxUsd) : null,
      meta: "Native holding · Chainlink price",
    },
    {
      id: "vault-btcb",
      label: "Vault BTC.b",
      logo: "btc",
      tone: "text-viz-2",
      value: vaultBtcb !== null ? `${vaultBtcb} BTC.b` : null,
      usd: btcbUsd !== null ? fmtUsd(btcbUsd) : null,
      meta: "Bridged bitcoin · Chainlink price",
    },
    {
      id: "vault-weth",
      label: "Vault WETH.e",
      logo: "eth",
      tone: "text-viz-3",
      value: vaultWeth !== null ? `${vaultWeth} WETH.e` : null,
      usd: wethUsd !== null ? fmtUsd(wethUsd) : null,
      meta: "Bridged ether · Chainlink price",
    },
    {
      id: "vault-syn",
      label: "Vault SYN",
      logo: SYN_LOGO,
      tone: "text-gold",
      value: vaultSyn !== null ? `${vaultSyn} SYN` : null,
      usd: null,
      meta: "Protocol token · amount only, never priced",
    },
    {
      id: "pool",
      label: "SYN/USDC pool",
      logo: SYN_LOGO,
      tone: "text-viz-6",
      value: poolSyn !== null && poolUsdc !== null ? `${poolSyn} SYN + ${poolUsdc} USDC` : null,
      usd: poolUsd !== null ? fmtUsd(poolUsd) : null,
      meta:
        poolShare !== null
          ? `Protocol share ${(poolShare * 100).toFixed(1)}% · only our USDC side is counted`
          : "Whole-pool reserves · the protocol's share could not be read",
    },
    {
      id: "seat-reserve",
      label: "Seat-sale reserve",
      logo: SYN_LOGO,
      tone: "text-viz-4",
      value: seatReserve !== null ? `${seatReserve} SYN` : null,
      usd: null,
      meta: "Still available to seat members",
    },
  ];

  return (
    <section className="rounded-[1.05rem] border border-gold/25 bg-card/74 p-5 dark:bg-surface-command/76">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h2 className="type-h2 text-foreground">Protocol assets</h2>
        <LiveReadTag state={tagState} />
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        What the protocol holds — on-chain verifiable.{" "}
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{VERIFY_SLOGAN}</span>
      </p>
      {/* The headline figure. Scope is stated, never implied: only directly-held
          assets with a deep market are valued and summed. */}
      <div className="mb-5 rounded-xl border border-gold/25 bg-background/58 p-4 dark:border-white/10 dark:bg-white/[0.035]">
        <div className="type-eyebrow text-muted-foreground">
          Value of the priced holdings
        </div>
        <div className="mt-1 font-mono text-2xl font-black text-foreground">
          {totalUsd !== null ? (
            fmtUsd(totalUsd)
          ) : (
            <span className="text-base font-semibold text-muted-foreground">
              {liveFigure(null, reality.isLoading)}
            </span>
          )}
        </div>
        <div className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
          USDC counted at one dollar; AVAX, BTC.b and WETH.e at live Chainlink prices. From the pool, only the
          protocol's own share of the USDC side — its LP tokens over the total supply, both read live; liquidity
          provided from any other wallet is not ours and is not counted. SYN is shown as an amount and never priced:
          its only on-chain price is that same thin pool. If one figure cannot be read, this total says so.
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => {
          return (
            <div
              key={row.id}
              className="min-h-[104px] rounded-xl border border-border bg-background/58 p-3.5 dark:border-white/10 dark:bg-white/[0.035]"
            >
              <div className="mb-2 flex items-center gap-2">
                {/* THE REAL LOGO (founder, 2026-07-28: « utilise les vrais logos
                    de tokens / coins »). These nine rows drew generic lucide
                    glyphs — a shield for USDC, a triangle for AVAX, a hexagon for
                    ETH — while the actual logos were vendored in public/coins/
                    and already rendered by the home page's reserves band. Same
                    component now, both surfaces. */}
                <CoinMark logo={row.logo} symbol={row.label} size={18} />
                <span className="type-eyebrow text-muted-foreground">
                  {row.label}
                </span>
              </div>
              {row.value !== null ? (
                <div className="font-mono text-base font-black text-foreground">{row.value}</div>
              ) : (
                <div className="font-mono text-sm font-semibold text-muted-foreground">
                  {liveFigure(null, reality.isLoading)}
                </div>
              )}
              {row.usd !== null ? (
                <div className="mt-0.5 font-mono text-[11px] font-semibold text-muted-foreground">≈ {row.usd}</div>
              ) : null}
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
