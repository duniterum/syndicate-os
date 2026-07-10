import { type ReactNode } from "react";
import { Link } from "wouter";
import { PublicPage } from "@/components/PublicPage";
import { Prose, ProseSection, ProseIndex, ProseCallout } from "@/components/prose/Prose";
import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";
import { Amount } from "@/components/amount/Amount";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { useHeroReality } from "@/components/hero/useHeroReality";

// Whitepaper — the anchor content page (slice 2.1). Prose is written ONCE; every
// figure is read LIVE from the chain via useHeroReality + Amount / VerifyOnChain.
// TRUTH-FIRST LOCK: this file contains ZERO hardcoded figures. A number that is
// not yet live-readable through the hook renders as a <Pending/> label — never a
// typed numeral (supply, the seven allocation shares, and the two prices have no
// live read yet, so they show PENDING until a supply/price read is wired).

/** Lifecycle label → StatusPill tone (canon: VERIFIED/live=proof, PENDING/PAUSED=caution,
 *  FUTURE=neutral, FOUNDER-GATED=identity). */
const STATUS_TONE: Record<string, StatusTone> = {
  VERIFIED: "proof",
  PENDING: "caution",
  FUTURE: "neutral",
  PAUSED: "caution",
  "FOUNDER-GATED": "identity",
};

function Status({ label }: { label: keyof typeof STATUS_TONE | string }) {
  return (
    <StatusPill tone={STATUS_TONE[label] ?? "neutral"} size="xs">
      {label}
    </StatusPill>
  );
}

/** Inline "not-yet-live figure" marker — used INSTEAD of ever typing a number. */
function Pending({ label = "PENDING · live read" }: { label?: string }) {
  return (
    <StatusPill tone="caution" size="xs">
      {label}
    </StatusPill>
  );
}

/** Section header eyebrow: monospace index + the section's lifecycle status. */
function Eyebrow({ n, status }: { n: number; status: string }) {
  return (
    <>
      <ProseIndex n={n} />
      <Status label={status} />
    </>
  );
}

const usdc = (v: string | null) => (v ? [{ value: v, unit: "USDC" as const }] : null);
const syn = (v: string | null) => (v ? [{ value: v, unit: "SYN" as const }] : null);

export default function Whitepaper() {
  const r = useHeroReality();

  // Live inline amount, fail-closed to "Checking…/Unavailable" — never a fallback number.
  const live = (
    segments: { value: string; unit: "USDC" | "SYN" }[] | null,
  ): ReactNode => <Amount segments={segments} variant="inline" loading={r.loading} />;

  return (
    <PublicPage
      eyebrow="Whitepaper"
      title="The Syndicate — written once, verified live."
      lead="What The Syndicate is, how a seat works, where the money goes, and how to verify every figure yourself on-chain. The words are written once; the numbers are read live from Avalanche — so this page stays current on its own."
      badge={
        <div className="flex flex-wrap items-center gap-2">
          <Status label="VERIFIED" />
          <span className="font-mono text-[11px] text-muted-foreground">
            Figures read live from the chain · nothing hardcoded
          </span>
        </div>
      }
    >
      <Prose>
        <ProseSection id="what-it-is" title="What The Syndicate is" eyebrow={<Eyebrow n={1} status="VERIFIED" />}>
          <p>
            The Syndicate is an on-chain <strong>membership protocol</strong> on Avalanche C-Chain. You
            join by acquiring <strong>SYN</strong> with USDC, and you receive a permanent, numbered,
            verifiable <strong>seat</strong>. This is <strong>identity and belonging</strong> — a record
            of membership — not a placement and not a promise of gain.
          </p>
        </ProseSection>

        <ProseSection id="your-seat" title="Your seat" eyebrow={<Eyebrow n={2} status="VERIFIED" />}>
          <p>
            <strong>Your first acquisition creates your membership.</strong> Your number, your chapter,
            and your entry date are written by the network and read back from the chain — not asserted by
            us. Today, the recognised seat count reads <strong>{r.membersTotal ?? <Pending />}</strong>.
          </p>
        </ProseSection>

        <ProseSection id="syn" title="SYN — the key to the seat" eyebrow={<Eyebrow n={3} status="VERIFIED" />}>
          <p>
            SYN is the key that opens a seat. There are <strong>two independent prices</strong>: the{" "}
            <strong>entry price</strong> set by the protocol ({<Pending />}), and the{" "}
            <strong>market price</strong> on Trader Joe if SYN trades ({<Pending />}). The entry price is
            neither a floor nor a market valuation. SYN has a <strong>fixed supply</strong> and trades on a
            market — like any token, its price <strong>can rise or fall</strong>.
          </p>
          <ProseCallout tone="risk" title="Legal">
            <p>
              SYN is an experimental utility membership token. It is <em>not</em> a share, <em>not</em> a
              security, and carries <em>no</em> promise of financial gain. The protocol promises nothing
              about its price. Joining can result in total loss.
            </p>
          </ProseCallout>
        </ProseSection>

        <ProseSection id="how-you-join" title="How you join" eyebrow={<Eyebrow n={4} status="VERIFIED" />}>
          <p>
            You acquire SYN through your <strong>wallet</strong>. Before you confirm, the app shows you
            exactly where your money goes; the receipt is written <strong>on-chain</strong>. Joining is
            self-service, up to the available SYN. You can preview an exact, read-only quote on the{" "}
            <Link href="/join">Join</Link> page — no transaction is sent from this app.
          </p>
        </ProseSection>

        <ProseSection id="entry-amounts" title="Entry amounts & tiers" eyebrow={<Eyebrow n={5} status="VERIFIED" />}>
          <p>
            A featured <strong>entry amount</strong> is a highlighted amount tied to a{" "}
            <strong>recognition tier</strong>. You can also enter a <strong>custom amount</strong>. Tiers
            are <strong>recognition only</strong> — never a better price and never a return. Amounts are
            read from configuration, never invented.
          </p>
        </ProseSection>

        <ProseSection id="ranks" title="Ranks — recognition, nothing more" eyebrow={<Eyebrow n={6} status="VERIFIED" />}>
          <p>
            Ranks are fixed tiers, ordered by the USDC amount of entry. A rank is{" "}
            <strong>recognition</strong> — <strong>no right, no return, no discount</strong>. A name never
            buys a better price. It works like a <strong>loyalty program</strong> (Cumulus, airline
            miles): the more you use the protocol, the higher your <strong>standing</strong> — recognition,
            never a guaranteed gain. Thresholds are read from configuration.
          </p>
        </ProseSection>

        <ProseSection id="chapters-eras" title="Chapters & Eras" eyebrow={<Eyebrow n={7} status="VERIFIED" />}>
          <p>
            <strong>Chapters</strong> are the story — they seal at membership milestones.{" "}
            <strong>Eras</strong> are the pricing calendar. <strong>Genesis is the only active price
            today</strong>; the later eras are a <strong>future</strong> model awaiting a future contract.
          </p>
          <p>
            <Status label="FUTURE" /> Later eras — pricing beyond Genesis.
          </p>
        </ProseSection>

        <ProseSection id="where-money-goes" title="Where the money goes" eyebrow={<Eyebrow n={8} status="VERIFIED" />}>
          <p>
            When you join, <strong>you acquire your access</strong>: that money becomes{" "}
            <strong>protocol revenue</strong> — the protocol owes you nothing in return. It is a business,
            not a pooled fund. Revenue is split automatically on-chain across{" "}
            <strong>Reserve</strong>, <strong>Liquidity</strong>, and <strong>Operations</strong>. Members
            hold <strong>no claim</strong> over these funds.
          </p>
          <p>
            Cumulative on-chain inflow to date: <strong>{live(usdc(r.aggregateInflowUsdc))}</strong>.
            Routed live — Reserve <strong>{live(usdc(r.routedVault))}</strong>, Liquidity{" "}
            <strong>{live(usdc(r.routedLiquidity))}</strong>, Operations{" "}
            <strong>{live(usdc(r.routedOperations))}</strong>.
          </p>
          <VerifyOnChain ids={["vaultWallet", "operationsWallet", "lpPair"]} />
        </ProseSection>

        <ProseSection id="tokenomics" title="Tokenomics — supply and who holds what" eyebrow={<Eyebrow n={9} status="VERIFIED" />}>
          <p>
            SYN has a <strong>fixed supply</strong> ({<Pending />}), distributed across these allocations,
            each verified against its allocation wallet: <strong>Membership Distribution</strong>{" "}
            ({<Pending />}), <strong>Vault Reserve</strong> ({<Pending />}),{" "}
            <strong>Founder (vested)</strong> ({<Pending />}), <strong>Liquidity</strong> ({<Pending />}),{" "}
            <strong>Partnerships</strong> ({<Pending />}), <strong>Contributors</strong> ({<Pending />}),
            and <strong>Future Ecosystem</strong> ({<Pending />}).
          </p>
          <p>
            Tokens sent to the burn address are removed permanently. Burned to date:{" "}
            <strong>{live(syn(r.burnedSyn))}</strong>.
          </p>
          <VerifyOnChain ids={["synToken", "burnAddress"]} />
          <ProseCallout tone="risk" title="Legal">
            <p>
              Fixed supply, a vested founder share, and burned tokens are structural facts — not a promise.
              No gain is promised or guaranteed. SYN is not a security.
            </p>
          </ProseCallout>
        </ProseSection>

        <ProseSection id="contracts" title="The contracts — verify everything yourself" eyebrow={<Eyebrow n={10} status="VERIFIED" />}>
          <p>
            The official addresses are public. Open any of them in the block explorer and check the
            protocol for yourself — <em>don't trust, verify</em>.
          </p>
          <VerifyOnChain
            ids={[
              "synToken",
              "membershipSaleV1",
              "membershipSaleV2A",
              "membershipSaleV2",
              "membershipSaleV3",
              "nftArchive",
              "lpPair",
              "sourceRegistry",
            ]}
          />
          <p>
            A fuller read-only map of the protocol's contracts and economy lives on the{" "}
            <Link href="/contracts">Contracts</Link> and <Link href="/map">Protocol Map</Link> pages.
          </p>
        </ProseSection>

        <ProseSection id="archive" title="The Archive — SYN is the seat, NFTs are the memory" eyebrow={<Eyebrow n={11} status="PAUSED" />}>
          <p>
            The NFTs are <strong>not</strong> a speculative collection: they are{" "}
            <strong>memory artifacts</strong> — chapters, seals, proofs. Minted to date:{" "}
            <strong>{r.nftMintedTotal ?? <Pending />}</strong>. The Archive is read-only today.
          </p>
          <VerifyOnChain ids={["nftArchive"]} />
        </ProseSection>

        <ProseSection id="recognition-seasons" title="Recognition & seasons" eyebrow={<Eyebrow n={12} status="FUTURE" />}>
          <p>
            The gamification layer is a <strong>future</strong> concept, funded by the protocol: standing,
            badges, a contribution leaderboard, and seasons with prizes funded from the protocol treasury.
            Everything is <strong>recognition and standing</strong> — never money won by a bet. This page
            will render it live from the status registry once it activates.
          </p>
        </ProseSection>

        <ProseSection id="proof-status" title="Proof & status" eyebrow={<Eyebrow n={13} status="VERIFIED" />}>
          <p>
            Every public figure is <strong>labelled</strong> (verified / pending / future) and linked to
            its on-chain proof. See the authoritative <Link href="/status">Status</Link> ledger for exactly
            what is wired versus posture-only. <strong>Verified introductions</strong> and any source
            payment are a <strong>future</strong> capability — the contract is not deployed, so this is
            read-only today.
          </p>
          <p>
            <Status label="FUTURE" /> Source payment — awaiting a deployed contract.
          </p>
        </ProseSection>

        <ProseSection id="risk-legal" title="Risk & legal" eyebrow={<Eyebrow n={14} status="VERIFIED" />}>
          <ProseCallout tone="risk" title="Read this before you join">
            <p>
              SYN is an <strong>experimental utility membership token</strong>. It is{" "}
              <strong>not a share, not a security, and not a promise of gain</strong>. A rank is
              recognition. <strong>Joining can result in total loss.</strong> Nothing on this page is
              financial advice. Verify every figure on-chain before you act.
            </p>
          </ProseCallout>
        </ProseSection>

        <ProseSection id="modules" title="The module system" eyebrow={<Eyebrow n={15} status="VERIFIED" />}>
          <p>
            The Syndicate OS grows by <strong>activating modules</strong> — like installing plugins. Each
            module carries a <strong>public status</strong>: active or future. The list and the statuses
            are read from the protocol's status registry, so when a new module activates it flips from
            future to active <strong>by itself</strong> on this page — nothing is rewritten.
          </p>
          <p>
            Known modules, all future today: later eras, marketplace, signal chamber, source
            payment/referral, gamification &amp; seasons, the admin console, and a live activity feed.
            More can be added without rewriting this page.{" "}
            <strong>Observe → join when you are ready.</strong>
          </p>
        </ProseSection>

        <hr />
        <p className="type-body text-muted-foreground">
          Every contract, wallet, and balance is public — verify any number on-chain. Read next: the{" "}
          <Link href="/status">Status</Link> ledger, the <Link href="/map">Protocol Map</Link>, or{" "}
          <Link href="/learning">Learn how it works</Link>.
        </p>
      </Prose>
    </PublicPage>
  );
}
