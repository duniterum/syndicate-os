// pages/Risk.tsx — AUD-T (founder GO on the full text, 2026-07-16).
// Honest and specific, never boilerplate. Doctrine-verified: banned words
// appear ONLY in negated-disclaimer form (the shield); the price section
// points DOWN only (no upside whisper); the purchase-flow protections are
// stated exactly as the code has them (no simulation claim — verified);
// immutable code is not framed as frozen behavior.

import { PublicPage } from "@/components/PublicPage";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";

function S({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="type-h2 text-foreground mb-2">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function Risk() {
  return (
    <PublicPage
      eyebrow="Legal"
      title="Risk Disclosure"
      lead="Joining means signing two transactions from your own wallet on Avalanche C-Chain: an exact-amount USDC approval, then a purchase. Before you sign anything, read this page slowly. Joining can result in total loss."
      badge={<StatusPill tone="caution">Version 1 — draft of 2026-07-16</StatusPill>}
    >
      <Card className="bg-muted/20 border-border/50 p-4 text-sm text-muted-foreground leading-relaxed mb-10">
        This draft awaits review by qualified counsel before it is legal
        protection. Nothing on this page is legal, tax, or financial advice.
      </Card>

      <S title="The price of SYN can fall">
        <p>
          SYN is an experimental utility membership token with a market price on
          a public pool. The market is free — it can price SYN below what you
          paid, or at nothing. The entry rate is neither a floor nor a market
          valuation, and the protocol promises nothing about price. A seat is
          recognition, identity, and participation.
          {" "}Buy a seat to belong — never to profit.{" "}
          If the market price of SYN goes to zero, your seat still stands, and
          no one owes you anything for it.
        </p>
      </S>

      <S title="Smart contracts can have flaws">
        <p>
          The seat sale and SYN live in smart contracts on a public blockchain.
          Deployed contract code is immutable: if a bug exists, it cannot be
          silently fixed — the same code runs for everyone until a new contract
          is published in the open. Immutable code is not frozen behavior: some
          parameters can change within the contract&apos;s own published rules —
          the entry rate, for one, can be raised under the recorded on-chain
          terms, never silently.
        </p>
        <p>
          The purchase flow takes real precautions — the approval is for the
          exact amount, read from the sale contract itself; the buy unlocks only
          after your approval is confirmed on-chain; the quote is refreshed at
          the moment you click; and the flow refuses to run on any chain but
          Avalanche 43114 — but no code is ever certain to be flawless. No
          independent audit is claimed as of this version.
        </p>
      </S>

      <S title="Your keys are your only access">
        <p>
          There are no accounts, no email, no password, and no reset. You sign
          in with your wallet, and your seat lives at your wallet address. If
          you lose your keys, you lose access — nobody, including The Syndicate,
          can restore it. The Syndicate never holds your assets: you sign from
          your own wallet, and no withdrawal function exists on our side to help
          you or to hurt you.
        </p>
      </S>

      <S title="Blockchain transactions are final">
        <p>
          There are no chargebacks and no reversals. A confirmed purchase cannot
          be undone. Your seat exists only when the purchase event appears in
          your own transaction receipt — nothing predicted, nothing inferred. If
          a screen and the chain ever disagree, the chain is the truth: check
          your transaction on a public Avalanche explorer before you rely on
          what any interface tells you.
        </p>
      </S>

      <S title="The rules around crypto-assets are unsettled">
        <p>
          Laws on crypto-assets differ by country and keep changing. A change in
          law or regulation could restrict the protocol, the pool, or your
          ability to participate. You are solely responsible for making sure
          that joining is lawful where you live, and for your own taxes.
        </p>
      </S>

      <S title="Nothing here promises money">
        <p>
          Membership is not a security or financial product, and it promises no
          money or financial gain. The ladder is recognition only — status,
          access, standing. A rung never pays, never discounts, never confers
          any financial advantage. Referral commissions are transparent payments
          for eligible completed member introductions —
          {" "}not passive income, not token yield, not downline, and not a profit promise.{" "}
          Past protocol activity never implies future activity: what the
          protocol did yesterday is a public record, not a forecast.
        </p>
      </S>

      <S title="The pool can be thin">
        <p>
          The pool is a courtesy, not a promise. Liquidity can be thin, and a
          small pool moves hard. If you provide liquidity yourself: impermanent
          loss is structural to AMMs, not a defect; total loss is possible;
          deposit only what you can afford to lose entirely. Withdrawals are
          yours alone — The Syndicate does not custody, manage, or guarantee LP
          positions. Providing liquidity is a market act, not a membership act.
        </p>
      </S>

      <S title="Phishing and impersonation">
        <p>
          Assume any unsolicited message claiming to be The Syndicate is
          hostile. We will never ask for your keys or seed phrase, and never ask
          you to &quot;validate&quot; or &quot;sync&quot; your wallet. Our only
          channels are thesyndicate.money, X (@TheSyndicateOne), and the
          official Telegram channels. Anyone else claiming to speak for The
          Syndicate does not. Type the site address yourself, and never enter a
          seed phrase anywhere.
        </p>
      </S>

      <S title="Verify everything yourself">
        <p>
          Every figure, contract, and transaction is public on Avalanche
          C-Chain. If anything we write disagrees with the real code or on-chain
          proof, the proof wins and we correct the words. Don&apos;t trust —
          verify.
        </p>
      </S>
    </PublicPage>
  );
}
