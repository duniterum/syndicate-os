import { type ReactNode } from "react";
import { Link } from "wouter";
import { PublicPage } from "@/components/PublicPage";
import { Prose, ProseSection, ProseIndex, ProseCallout } from "@/components/prose/Prose";
import { StatusPill } from "@/components/status-pill/StatusPill";
import { Amount } from "@/components/amount/Amount";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { useTokenomics } from "@/components/tokenomics/useTokenomics";

// Tokenomics — SYN supply, the live distribution, the two prices, burn, and the
// no-yield boundary. TRUTH-FIRST: ZERO hardcoded figures. Supply, per-allocation
// balances, market price, entry rate, and burn are all LIVE chain reads (via
// useTokenomics); the mint-time DESIGN targets (35/25/…) come from config and are
// labelled "design" beside the live current figure — never presented as live.

function Pending() {
  return (
    <StatusPill tone="caution" size="xs">
      PENDING · live read
    </StatusPill>
  );
}

/** A live inline mono figure with a unit suffix, fail-closed to PENDING. */
function Live({ value, unit }: { value: string | null; unit: string }) {
  if (value === null) return <Pending />;
  return (
    <span className="font-mono font-semibold text-foreground">
      {value}
      <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>
    </span>
  );
}

function Eyebrow({ n, status }: { n: number; status: string }): ReactNode {
  return (
    <>
      <ProseIndex n={n} />
      <StatusPill tone={status === "VERIFIED" ? "proof" : "caution"} size="xs">
        {status}
      </StatusPill>
    </>
  );
}

const syn = (v: string | null) => (v ? [{ value: v, unit: "SYN" as const }] : null);

export default function Tokenomics() {
  const t = useTokenomics();

  return (
    <PublicPage
      eyebrow="Tokenomics"
      title="SYN — fixed supply, public distribution, verifiable on-chain."
      lead="How much SYN exists, who holds what right now, the two independent prices, and what is burned — every figure read live from Avalanche, never hardcoded. SYN is a membership token: the protocol promises no gain."
      badge={
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill tone="proof" size="xs">VERIFIED</StatusPill>
          <span className="font-mono text-[11px] text-muted-foreground">
            Supply · distribution · prices · burn — all live chain reads
          </span>
        </div>
      }
    >
      <Prose>
        <ProseSection id="supply" title="Fixed supply" eyebrow={<Eyebrow n={1} status="VERIFIED" />}>
          <p>
            SYN has a <strong>fixed supply</strong>, read live from the token contract:{" "}
            <strong><Amount segments={syn(t.totalSupply)} variant="inline" loading={t.loading} /></strong>.
            The token is minimal by design — no mint function, no admin powers, no transfer
            restrictions — so the supply can only stay fixed or fall (via burns).
          </p>
          <VerifyOnChain ids={["synToken"]} />
          <ProseCallout tone="risk" title="Legal">
            <p>
              A fixed supply is a structural fact, not a promise. SYN is not a security and carries
              no promise of gain. Joining can result in total loss.
            </p>
          </ProseCallout>
        </ProseSection>

        <ProseSection id="distribution" title="Distribution — design vs. on-chain now" eyebrow={<Eyebrow n={2} status="VERIFIED" />}>
          <p>
            SYN was minted across seven public allocation wallets. Below, each allocation's{" "}
            <strong>mint-time design target</strong> sits beside its <strong>current live balance</strong>{" "}
            read from the chain — they legitimately differ as SYN is sold to members, vested, or moved.
          </p>
          <ul>
            {t.allocations.map((a) => (
              <li key={a.key}>
                <strong>{a.label}</strong> — design {a.designPct}% · now{" "}
                <Amount segments={syn(a.currentSyn)} variant="inline" loading={t.loading} />{" "}
                <span className="text-muted-foreground">
                  (<Live value={a.currentPct} unit="% of supply" />)
                </span>
                . <span className="text-muted-foreground">{a.note}</span>
              </li>
            ))}
          </ul>
          <p>
            The allocation wallet balances are read live from the SYN contract. Verify the token and
            its holders on-chain:
          </p>
          <VerifyOnChain ids={["synToken"]} />
        </ProseSection>

        <ProseSection id="prices" title="Two independent prices" eyebrow={<Eyebrow n={3} status="VERIFIED" />}>
          <p>
            There are <strong>two independent prices</strong>, and neither is a valuation of the other:
          </p>
          <ul>
            <li>
              <strong>Entry rate</strong> — set by the protocol, read live from the active join engine:{" "}
              <Live value={t.entrySynPerUsdc} unit="SYN per 1 USDC" />. Preview an exact read-only quote on{" "}
              <Link href="/join">Join</Link>.
            </li>
            <li>
              <strong>Market price</strong> — from the live Trader Joe SYN/USDC pool reserves:{" "}
              <Live value={t.marketPriceUsdcPerSyn} unit="USDC per SYN" />. Like any token, it can rise or fall.
            </li>
          </ul>
          <VerifyOnChain ids={["lpPair", "synToken"]} />
          <ProseCallout tone="risk" title="Legal">
            <p>
              The entry rate is neither a floor nor a market valuation. The protocol promises nothing
              about the market price. SYN is not a security.
            </p>
          </ProseCallout>
        </ProseSection>

        <ProseSection id="burn" title="Burn" eyebrow={<Eyebrow n={4} status="VERIFIED" />}>
          <p>
            SYN sent to the burn address is removed from circulation permanently — the protocol runs no
            automated buyback and promises no scarcity value. Burned to date, read live from the burn
            address: <strong><Amount segments={syn(t.burnedSyn)} variant="inline" loading={t.loading} /></strong>.
          </p>
          <VerifyOnChain ids={["burnAddress", "synToken"]} />
        </ProseSection>

        <ProseSection id="routing" title="Revenue routing" eyebrow={<Eyebrow n={5} status="VERIFIED" />}>
          <p>
            SYN is acquired with USDC through the membership engine, which routes the net USDC on-chain
            across <strong>Reserve</strong>, <strong>Liquidity</strong>, and <strong>Operations</strong>.
            Members hold no claim on these funds — it is protocol revenue. The live routed figures and
            the exact split are on the <Link href="/">home ledger</Link> and the{" "}
            <Link href="/status">Status</Link> page; the full whitepaper explains the model.
          </p>
        </ProseSection>

        <ProseSection id="no-yield" title="No yield, by design" eyebrow={<Eyebrow n={6} status="VERIFIED" />}>
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
          Every figure above is a live chain read. Read the full{" "}
          <Link href="/whitepaper">Whitepaper</Link>, check the{" "}
          <Link href="/status">Status</Link> ledger, or explore the{" "}
          <Link href="/map">Protocol Map</Link>.
        </p>
      </Prose>
    </PublicPage>
  );
}
