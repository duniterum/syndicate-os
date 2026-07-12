import { type ReactNode } from "react";
import { Link } from "wouter";
import { PublicPage } from "@/components/PublicPage";
import { Prose, ProseSection, ProseIndex, ProseCallout } from "@/components/prose/Prose";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { Amount } from "@/components/amount/Amount";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { Card } from "@/components/ui/card";
import { useHeroReality } from "@/components/hero/useHeroReality";
import { useTokenomics } from "@/components/tokenomics/useTokenomics";
import { LivingSignature } from "@/components/living/LivingSignature";
import { TransparencyPosture } from "@/components/living/TransparencyPosture";
import { SectionIndex, type IndexEntry } from "@/components/living/SectionIndex";
import { AllocationDonut } from "@/components/living/AllocationDonut";
import { ReconciliationTable } from "@/components/living/ReconciliationTable";
import { MembersProvenance } from "@/components/living/MembersProvenance";

// Whitepaper — the flagship written expression of a LIVING PROTOCOL
// (docs/direction/WHITEPAPER_LIVING_DOCTRINE.md). A short, scannable manifesto:
// words written once, EVERY figure a live chain read (or PENDING — never a typed
// numeral). Built on the shared living chassis (LivingSignature / TransparencyPosture
// / SectionIndex / AllocationDonut / ReconciliationTable) + the Prose atom, so
// tokenomics/FAQ/docs/knowledge reuse the same soul.

const SECTIONS: readonly IndexEntry[] = [
  { id: "what", label: "What The Syndicate is" },
  { id: "risk", label: "Risk & legal" },
  { id: "syn", label: "SYN — the token" },
  { id: "allocation", label: "Allocation, live" },
  { id: "seat", label: "Your seat & how you join" },
  { id: "money", label: "Where the money goes" },
  { id: "price", label: "Liquidity & the two prices" },
  { id: "archive", label: "The Archive" },
  { id: "recognition", label: "Recognition & the future" },
  { id: "modules", label: "The module system" },
  { id: "contracts", label: "Contracts — verify" },
  { id: "observe", label: "Observe, then decide" },
];

function Pending() {
  return (
    <StatusPill tone="caution" size="xs">
      PENDING · live read
    </StatusPill>
  );
}
function LiveNum({ value, unit }: { value: string | null; unit: string }) {
  if (value === null) return <Pending />;
  return (
    <span className="font-mono font-semibold text-foreground">
      {value}
      <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>
    </span>
  );
}
function Eyebrow({ n, status }: { n: number; status: string }) {
  return (
    <>
      <ProseIndex n={n} />
      <StatusPill tone={status === "VERIFIED" ? "proof" : status === "FUTURE" ? "neutral" : "caution"} size="xs">
        {status}
      </StatusPill>
    </>
  );
}

const usdc = (v: string | null) => (v ? [{ value: v, unit: "USDC" as const }] : null);
const syn = (v: string | null) => (v ? [{ value: v, unit: "SYN" as const }] : null);

export default function Whitepaper() {
  const r = useHeroReality();
  const tk = useTokenomics();
  const live = (segments: { value: string; unit: "USDC" | "SYN" }[] | null): ReactNode => (
    <Amount segments={segments} variant="inline" loading={r.loading || tk.loading} />
  );
  const donut = tk.allocations.map((a) => ({
    key: a.key,
    label: a.label,
    pct: a.currentPct === null ? null : Number(a.currentPct),
  }));

  return (
    <PublicPage
      eyebrow="Whitepaper · a living document"
      title="Not a frozen PDF — a protocol proving itself, live."
      lead="Most whitepapers are a static PDF of frozen numbers and price forecasts — promises about a future that may never come. This is the opposite: the words are written once; every figure is read live from Avalanche and updates itself. We do not project or simulate. We show what is true right now — and you verify it."
      badge={<LivingSignature />}
    >
      <div className="space-y-12">
        <TransparencyPosture />

        <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
          <SectionIndex entries={SECTIONS} className="mb-10 lg:mb-0" />

          <Prose className="min-w-0">
            <ProseSection id="what" title="What The Syndicate is" eyebrow={<Eyebrow n={1} status="VERIFIED" />}>
              <p>
                The Syndicate is an on-chain <strong>membership protocol</strong> on Avalanche C-Chain.
                You join by acquiring <strong>SYN</strong> with USDC and receive a permanent, numbered,
                verifiable <strong>seat</strong>. It sells <strong>access and recognition</strong> — it
                is a business, not a fundraise, and not an investment. Recognised seats today:{" "}
                <strong>{r.membersTotal ?? <Pending />}</strong>.
              </p>
              <MembersProvenance
                historicalFreeze={r.historicalFreeze}
                v3Emitted={r.v3Emitted}
                snapshotMemberTotal={r.snapshotMemberTotal}
                snapshotAsOf={r.snapshotAsOf}
                membersDiverged={r.membersDiverged}
                distinctWallets={r.distinctWallets}
                seatOverlap={r.seatOverlap}
              />
            </ProseSection>

            <ProseSection id="risk" title="Risk & legal" eyebrow={<Eyebrow n={2} status="VERIFIED" />}>
              <ProseCallout tone="risk" title="Read before participating">
                <p>
                  SYN is an <strong>experimental utility membership token</strong>. It is{" "}
                  <strong>not a share, not a security, and not a promise of gain</strong> — the protocol
                  pays no return of any kind and promises nothing about price. A rank is recognition.{" "}
                  <strong>Joining can result in total loss.</strong> Nothing here is financial advice.
                </p>
              </ProseCallout>
            </ProseSection>

            <ProseSection id="syn" title="SYN — the token" eyebrow={<Eyebrow n={3} status="VERIFIED" />}>
              <p>
                SYN is a minimal, fixed-supply ERC-20 — no mint function, no admin powers, no transfer
                restrictions — so supply can only stay fixed or fall via burns.
              </p>
              <Card className="my-5 bg-card/40 border-border/60 p-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total supply</div>
                    <div className="mt-1 text-lg"><Amount segments={syn(tk.totalSupply)} variant="stat" loading={tk.loading} /></div>
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Burned to date</div>
                    <div className="mt-1 text-lg"><Amount segments={syn(r.burnedSyn)} variant="stat" loading={r.loading} /></div>
                  </div>
                </div>
                <div className="mt-4"><VerifyOnChain ids={["synToken", "burnAddress"]} /></div>
              </Card>
            </ProseSection>

            <ProseSection id="allocation" title="Allocation — design vs. live" eyebrow={<Eyebrow n={4} status="VERIFIED" />}>
              <p>
                SYN was minted across seven public allocation wallets. Each wallet's{" "}
                <strong>current on-chain balance</strong> is read live below — it differs from the
                mint-time design as SYN sells, vests, or moves. This is the full live distribution;{" "}
                <Link href="/tokenomics">Tokenomics</Link> is a deeper visual view of the same
                on-chain figures (LP and vesting detail).
              </p>
              <AllocationDonut segments={donut} className="my-6" />
              <ReconciliationTable rows={tk.allocations} loading={tk.loading} />
            </ProseSection>

            <ProseSection id="seat" title="Your seat & how you join" eyebrow={<Eyebrow n={5} status="VERIFIED" />}>
              <p>
                Your first acquisition creates your membership; your number, chapter, and entry date are
                written by the network, not by us. You acquire SYN through your <strong>wallet</strong> —
                the app shows exactly where your money goes before you confirm, and the receipt is
                on-chain. Every amount purchases the <strong>same single seat</strong>. Larger
                contributions build higher standing on the Capital axis — recognition that grows with
                what you put in, like any serious membership house. Standing never changes your seat,
                never changes the SYN price, and never creates a financial advantage. The live entry
                rate is <LiveNum value={tk.entrySynPerUsdc} unit="SYN per 1 USDC" />. Preview an exact
                read-only quote on <Link href="/join">Join</Link> — no transaction is sent from this app.
              </p>
            </ProseSection>

            <ProseSection id="money" title="Where the money goes" eyebrow={<Eyebrow n={6} status="VERIFIED" />}>
              <p>
                When you join, you acquire access — that money becomes <strong>protocol revenue</strong>;
                the protocol owes you nothing in return (a business, not a pooled fund). Net USDC is
                routed on-chain across <strong>Reserve</strong>, <strong>Liquidity</strong>, and{" "}
                <strong>Operations</strong>; members hold no claim on these funds. Cumulative inflow to
                date <strong>{live(usdc(r.aggregateInflowUsdc))}</strong> — routed live: Reserve{" "}
                <strong>{live(usdc(r.routedVault))}</strong>, Liquidity{" "}
                <strong>{live(usdc(r.routedLiquidity))}</strong>, Operations{" "}
                <strong>{live(usdc(r.routedOperations))}</strong>.
              </p>
              <VerifyOnChain ids={["vaultWallet", "operationsWallet", "lpPair"]} />
            </ProseSection>

            <ProseSection id="price" title="Liquidity & the two prices" eyebrow={<Eyebrow n={7} status="VERIFIED" />}>
              <p>
                There are <strong>two independent prices</strong>, and neither values the other: the{" "}
                <strong>entry rate</strong> set by the protocol (
                <LiveNum value={tk.entrySynPerUsdc} unit="SYN per 1 USDC" />), and the{" "}
                <strong>market price</strong> from the live Trader Joe pool (
                <LiveNum value={tk.marketPriceUsdcPerSyn} unit="USDC per SYN" />). Live pool reserves:{" "}
                <strong>{live(usdc(r.lpUsdc))}</strong> and <strong>{live(syn(r.lpSyn))}</strong>. Like
                any token, the market price can rise or fall — the protocol promises nothing about it.
              </p>
              <VerifyOnChain ids={["lpPair", "synToken"]} />
            </ProseSection>

            <ProseSection id="archive" title="The Archive — SYN is the seat, NFTs are the memory" eyebrow={<Eyebrow n={8} status="PAUSED" />}>
              <p>
                The NFTs are <strong>not</strong> a speculative collection — they are memory artifacts
                (chapters, seals, proofs). Minted to date: <strong>{r.nftMintedTotal ?? <Pending />}</strong>.
                The Archive is read-only today.
              </p>
              <VerifyOnChain ids={["nftArchive"]} />
            </ProseSection>

            <ProseSection id="recognition" title="Recognition & the future" eyebrow={<Eyebrow n={9} status="FUTURE" />}>
              <p>
                A rank is <strong>recognition</strong>, like a loyalty program (Cumulus, airline miles) —
                never a better price, never a financial right. There is{" "}
                <strong>no token-weighted voting and no vote that functions as a security</strong>. The
                gamification layer — standing, badges, a contribution leaderboard, seasons with
                protocol-funded prizes — is a <strong>future</strong> capability, recognition only, and
                will render live from the status registry once it activates.
              </p>
            </ProseSection>

            <ProseSection id="modules" title="The module system" eyebrow={<Eyebrow n={10} status="VERIFIED" />}>
              <p>
                The Syndicate OS grows by <strong>activating modules</strong> — like installing plugins.
                Each carries a public status (active or future), read from the protocol's registry, so a
                new module flips from future to active <strong>by itself</strong> here — nothing is
                rewritten. Known future modules: later eras · marketplace · source payment/referral ·
                gamification &amp; seasons · admin console · live activity feed.
              </p>
            </ProseSection>

            <ProseSection id="contracts" title="Contracts — verify everything yourself" eyebrow={<Eyebrow n={11} status="VERIFIED" />}>
              <p>
                Every address is public. Open any in the block explorer and check the protocol for
                yourself — <em>don't trust, verify</em>.
              </p>
              <VerifyOnChain
                ids={[
                  "synToken", "membershipSaleV1", "membershipSaleV2A", "membershipSaleV2",
                  "membershipSaleV3", "nftArchive", "lpPair", "sourceRegistry", "burnAddress",
                ]}
              />
              <p>
                A fuller read-only map lives on <Link href="/contracts">Contracts</Link>,{" "}
                <Link href="/map">Protocol Map</Link>, and the <Link href="/status">Status</Link> ledger.
              </p>
            </ProseSection>

            <ProseSection id="observe" title="Observe, then decide" eyebrow={<Eyebrow n={12} status="VERIFIED" />}>
              <p>
                We ask for nothing — no email, no signup, no gate. Everything is already here, open and
                verifiable. Watch a living protocol prove itself; <strong>if it suits you, take a
                seat</strong> and become a member. If not, simply keep watching.{" "}
                <strong>Observe → join when you're ready.</strong>
              </p>
            </ProseSection>

            <hr />
            <p className="type-body text-muted-foreground">
              Every contract, wallet, and balance is public — verify any number on-chain. Read next:{" "}
              <Link href="/tokenomics">Tokenomics</Link>, the <Link href="/status">Status</Link> ledger,
              or <Link href="/map">Protocol Map</Link>.
            </p>
          </Prose>
        </div>
      </div>
    </PublicPage>
  );
}
