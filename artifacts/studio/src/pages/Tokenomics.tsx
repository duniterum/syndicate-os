import { SectionEyebrow, sectionReadState } from "@/components/prose/SectionEyebrow";
import { Link } from "wouter";
import { PublicPage } from "@/components/PublicPage";
import { Prose, ProseSection, ProseCallout } from "@/components/prose/Prose";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { Amount } from "@/components/amount/Amount";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { Card } from "@/components/ui/card";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { useTokenomics } from "@/components/tokenomics/useTokenomics";
import { LivingSignature } from "@/components/living/LivingSignature";
import { AllocationDonut } from "@/components/living/AllocationDonut";
import { ReconciliationTable } from "@/components/living/ReconciliationTable";
import { RoutingBar } from "@/components/living/RoutingBar";
import { TransparencyPosture } from "@/components/living/TransparencyPosture";
import { SectionIndex, type IndexEntry } from "@/components/living/SectionIndex";

// THE SIBLING CHASSIS (founder "construis 1-5", 2026-07-30): /tokenomics was
// the one living-chassis sibling with a fixed max-w-5xl page cap, no rail and
// no posture block — Whitepaper, FAQ and Docs all carry the 240px SectionIndex
// grid and the TransparencyPosture. The cap is gone (Prose fills its region,
// per its own law) and the rail drives the 7 anchored sections.
const SECTIONS: readonly IndexEntry[] = [
  { id: "supply", label: "Fixed supply" },
  { id: "distribution", label: "Distribution" },
  { id: "prices", label: "Two prices & the pool" },
  { id: "routing", label: "Revenue routing" },
  { id: "burn", label: "Burn" },
  { id: "vesting", label: "Founder vesting" },
  { id: "no-yield", label: "No yield, by design" },
];

// Tokenomics — the deeper VISUAL view of the same live spine the whitepaper reads:
// supply, the live distribution (donut + design-vs-live table), the two prices +
// LP card, burn, the live 70/20/10 routing bar, and the Founder vesting card.
// TRUTH-FIRST: zero hardcoded figures — every number is a live chain read (or a
// PENDING fail-closed pill); the mint-time design targets come from config, labelled.

function Pending() {
  return (
    <StatusPill tone="caution" size="xs">
      PENDING · live read
    </StatusPill>
  );
}
function Live({ value, unit }: { value: string | null; unit: string }) {
  if (value === null) return <Pending />;
  return (
    <span className="font-mono font-semibold text-foreground">
      {value}
      <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>
    </span>
  );
}
// The local Eyebrow twin died 2026-07-30 (footer audit): the ONE atom lives at
// components/prose/SectionEyebrow.tsx, and its status is DERIVED, never typed.

const usdc = (v: string | null) => (v ? [{ value: v, unit: "USDC" as const }] : null);
const syn = (v: string | null) => (v ? [{ value: v, unit: "SYN" as const }] : null);
/** Parse a formatted decimal display string to a number for bar weights, or null. */
const weight = (v: string | null): number | null => {
  if (v === null) return null;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
};

export default function Tokenomics() {
  const r = useHeroReality();
  const t = useTokenomics();
  // ONE derived state for every section eyebrow: VERIFIED is EARNED by the
  // page's own live reads resolving — never typed as a literal (2026-07-30).
  const eyebrowState = sectionReadState(
    t.loading || r.loading,
    [t.entrySynPerUsdc, t.marketPriceUsdcPerSyn, r.burnedSyn].every((v) => v !== null),
  );

  const donut = t.allocations.map((a) => ({
    key: a.key,
    label: a.label,
    pct: a.currentPct === null ? null : Number(a.currentPct),
  }));
  const founder = t.allocations.find((a) => a.key === "FOUNDER");

  return (
    <PublicPage
      eyebrow="Tokenomics · a living view"
      title="SYN — fixed supply, public distribution, verifiable on-chain."
      lead="How much SYN exists, who holds what right now, the two independent prices, the on-chain routing, and what is burned — every figure read live from Avalanche, never hardcoded. SYN is a membership token: the protocol promises no gain."
      badge={<LivingSignature />}
    >
      <div className="space-y-12">
        <TransparencyPosture />

        <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <SectionIndex entries={SECTIONS} className="mb-10 lg:mb-0" />

          <Prose className="min-w-0">
        <ProseSection id="supply" title="Fixed supply" eyebrow={<SectionEyebrow n={1} state={eyebrowState} />}>
          <p>
            SYN is a minimal, fixed-supply ERC-20 — no mint function, no admin powers, no transfer
            restrictions — so supply can only stay fixed or fall via burns. Read live:{" "}
            <strong><Amount segments={syn(t.totalSupply)} variant="inline" loading={t.loading} /></strong>.
          </p>
          <VerifyOnChain ids={["synToken"]} />
          <ProseCallout tone="risk" title="Legal">
            <p>
              A fixed supply is a structural fact, not a promise. SYN is not a security and carries no
              promise of gain. Joining can result in total loss.
            </p>
          </ProseCallout>
        </ProseSection>

        <ProseSection id="distribution" title="Distribution — design vs. on-chain now" eyebrow={<SectionEyebrow n={2} state={eyebrowState} />}>
          <p>
            SYN was minted across seven public allocation wallets. Each allocation's{" "}
            <strong>mint-time design target</strong> sits beside its <strong>current live balance</strong>{" "}
            read from the chain — they differ as SYN is sold, vested, or moved.
          </p>
          <AllocationDonut segments={donut} className="my-6" />
          <ReconciliationTable rows={t.allocations} loading={t.loading} />
          <div className="mt-4"><VerifyOnChain ids={["synToken"]} /></div>
        </ProseSection>

        <ProseSection id="prices" title="Two prices & the pool" eyebrow={<SectionEyebrow n={3} state={eyebrowState} />}>
          <p>
            Two <strong>independent prices</strong>, neither valuing the other: the{" "}
            <strong>entry rate</strong> set by the protocol (
            <Live value={t.entrySynPerUsdc} unit="SYN per 1 USDC" />), and the{" "}
            <strong>market price</strong> from the live LFJ pool (
            <Live value={t.marketPriceUsdcPerSyn} unit="USDC per SYN" />).
          </p>
          <Card className="my-5 bg-card/40 border-border/60 p-5">
            <div className="type-eyebrow text-muted-foreground">
              SYN / USDC pool — live reserves
            </div>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <div className="text-xs text-muted-foreground">SYN reserve</div>
                <div className="mt-0.5"><Amount segments={syn(r.lpSyn)} variant="stat" loading={r.loading} /></div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">USDC reserve</div>
                <div className="mt-0.5"><Amount segments={usdc(r.lpUsdc)} variant="stat" loading={r.loading} /></div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Market price</div>
                <div className="mt-0.5"><Live value={t.marketPriceUsdcPerSyn} unit="USDC/SYN" /></div>
              </div>
            </div>
            <div className="mt-4"><VerifyOnChain ids={["lpPair", "synToken"]} /></div>
          </Card>
          <ProseCallout tone="risk" title="Legal">
            <p>
              The entry rate is neither a floor nor a market valuation. The protocol promises nothing
              about the market price. SYN is not a security.
            </p>
          </ProseCallout>
        </ProseSection>

        <ProseSection id="routing" title="Revenue routing — live" eyebrow={<SectionEyebrow n={4} state={eyebrowState} />}>
          <p>
            SYN is acquired with USDC through the membership engine, which routes the net USDC on-chain
            across Reserve, Liquidity, and Operations. Members hold no claim — it is protocol revenue.
            Cumulative inflow to date <strong><Amount segments={usdc(r.aggregateInflowUsdc)} variant="inline" loading={r.loading} /></strong>,
            of which <strong><Amount segments={usdc(r.paidToReferrersUsdc)} variant="inline" loading={r.loading} /></strong> was
            paid to referrers; <strong><Amount segments={usdc(r.routedNetTotalUsdc)} variant="inline" loading={r.loading} /></strong> routed live:{" "}
            {/* ⛔ THE DOCTRINAL SENTENCE — VERBATIM, founder-approved 2026-08-06, canon in
                CANON_PROTOCOL_LANGUAGE §4. Never reworded: it explains why the inflow above
                and the routed total differ, and it is the sentence that keeps "paid to
                referrers" from reading as a cost the treasury bore (verified.sol:279). */}
            <strong>
              The referrer is not paid from Syndicate revenue after the fact. The referrer is paid
              from the purchase transaction before the net protocol contribution is routed.
            </strong>
          </p>
          <RoutingBar
            className="my-5"
            segments={[
              { key: "reserve", label: "Reserve", weight: weight(r.routedVault), figure: <Amount segments={usdc(r.routedVault)} variant="inline" loading={r.loading} />, target: "70% target", colorClass: "bg-identity" },
              { key: "liquidity", label: "Liquidity", weight: weight(r.routedLiquidity), figure: <Amount segments={usdc(r.routedLiquidity)} variant="inline" loading={r.loading} />, target: "20% target", colorClass: "bg-proof" },
              { key: "operations", label: "Operations", weight: weight(r.routedOperations), figure: <Amount segments={usdc(r.routedOperations)} variant="inline" loading={r.loading} />, target: "10% target", colorClass: "bg-viz-3" },
            ]}
          />
          <VerifyOnChain ids={["vaultWallet", "operationsWallet", "lpPair"]} />
        </ProseSection>

        <ProseSection id="burn" title="Burn" eyebrow={<SectionEyebrow n={5} state={eyebrowState} />}>
          <p>
            SYN sent to the burn address is removed permanently — no automated buyback, no scarcity
            promise. Burned to date, read live from the burn address:{" "}
            <strong><Amount segments={syn(r.burnedSyn)} variant="inline" loading={r.loading} /></strong>.
          </p>
          <VerifyOnChain ids={["burnAddress", "synToken"]} />
        </ProseSection>

        <ProseSection id="vesting" title="Founder allocation — vested & public" eyebrow={<SectionEyebrow n={6} state={eyebrowState} />}>
          <Card className="my-2 bg-card/40 border-border/60 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <div className="type-eyebrow text-muted-foreground">
                Founder wallet — current SYN balance
              </div>
              <div className="text-lg">
                <Amount segments={syn(founder?.currentSyn ?? null)} variant="stat" loading={t.loading} />
              </div>
            </div>
            {/* Footer audit 2026-07-30: "watch it vest on-chain" DIED — no
                vesting contract exists (prod contracts group: 8 contracts,
                none vesting); the cliff/schedule is a published commitment,
                not a mechanism the chain enforces. Say what the chain proves. */}
            <p className="mt-3 text-sm text-muted-foreground">
              {founder?.note ?? "Public wallet, no hidden unlocks."} The wallet is public and its
              balance is read live above — every movement is visible on-chain. The cliff and
              monthly schedule are a published commitment of the protocol, not a contract the
              chain enforces.
            </p>
          </Card>
        </ProseSection>

        <ProseSection id="no-yield" title="No yield, by design" eyebrow={<SectionEyebrow n={7} state={eyebrowState} />}>
          <ProseCallout tone="risk" title="Read this">
            <p>
              SYN is an <strong>experimental utility membership token</strong>. It is{" "}
              <strong>not a share, not a security, and not a promise of gain</strong> — the protocol
              pays no return of any kind and promises nothing about price. A rank is recognition.{" "}
              <strong>Joining can result in total loss.</strong> Verify every figure on-chain before you act.
            </p>
          </ProseCallout>
        </ProseSection>

        <hr />
        <p className="type-body text-muted-foreground">
          Every figure above is a live chain read of the same spine the{" "}
          <Link href="/whitepaper">Whitepaper</Link> reads. Check the{" "}
          <Link href="/status">Status</Link> ledger or explore the <Link href="/map">Protocol Map</Link>.
        </p>
          </Prose>
        </div>
      </div>
    </PublicPage>
  );
}
