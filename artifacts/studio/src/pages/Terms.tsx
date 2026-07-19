// pages/Terms.tsx — AUD-T (founder GO on the full text, 2026-07-16).
// The audit's fourth P0 dies here: live seat sales now run under published
// terms. The text is the founder-approved draft VERBATIM (doctrine-verified,
// zero banned vocabulary; negated disclaimers are the shield, not the breach).
// Draft honesty: the page SAYS it awaits qualified counsel — truth-first.
// Founder-decision placeholders render as honest pending lines, never
// invented facts. A change of terms is never silent (new version, new date).

import { PublicPage } from "@/components/PublicPage";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/status-pill/StatusPill";

function S({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="type-h2 text-foreground mb-2">
        <span className="font-mono text-sm text-primary mr-2">{n}</span>
        {title}
      </h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function Terms() {
  return (
    <PublicPage
      eyebrow="Legal"
      title="Terms of Use"
      lead="The terms that govern thesyndicate.money and your interaction with the Syndicate protocol on Avalanche C-Chain."
      badge={<StatusPill tone="caution">Version 1 — draft of 2026-07-16</StatusPill>}
    >
      <Card className="bg-muted/20 border-border/50 p-4 text-sm text-muted-foreground leading-relaxed mb-10">
        This is a draft. It awaits review by qualified legal counsel before it can
        be relied on as legal protection. Not legal advice. A change of terms is
        never silent: a new version is published with a new date, and prior
        versions remain available.
      </Card>

      <S n="1" title="Acceptance">
        <p>
          These terms govern your use of thesyndicate.money and your interaction
          with the Syndicate protocol on Avalanche C-Chain (chain 43114). By using
          the site, or by signing any transaction the site helps you prepare, you
          accept these terms. If you do not accept them, do not use the site and
          do not sign.
        </p>
      </S>

      <S n="2" title="What a seat is">
        <p>
          The Syndicate is a recognition and attribution protocol. A seat is
          on-chain membership recognition: your wallet buys SYN through the
          membership sale, and the purchase event recorded on the chain is your
          proof of entry. One wallet, one seat. A further buy adds SYN to your
          holdings, never a second seat — and never control of anything.
        </p>
        <p>
          There are no accounts here. No email, no password, no identity check.
          You sign in with your own wallet, and your proof of entry lives on the
          chain, not on our servers.
        </p>
      </S>

      <S n="3" title="What a seat is not">
        <p>
          A seat is not an investment, not a security, and not a financial
          product. It promises no money, no gain, and nothing about future value.
          The protocol pays no return of any kind. Recognition, status, and
          access are the whole of what membership gives. Not equity. Not yield.
          Not passive income. Joining can result in total loss of what you spend.
        </p>
      </S>

      <S n="4" title="Eligibility and your responsibility">
        <p>
          You must be of legal age in your jurisdiction and legally permitted to
          use cryptocurrency there. You are solely responsible for:
        </p>
        <p>
          <strong className="text-foreground">Your wallet.</strong> You hold your
          own keys. We cannot recover, freeze, or move anything in your wallet —
          ever.
        </p>
        <p>
          <strong className="text-foreground">Your law.</strong> You must ensure
          that joining, and anything you do around the protocol, complies with
          the laws of your jurisdiction.
        </p>
        <p>
          <strong className="text-foreground">Your taxes.</strong> Anything of
          value you receive — including referral commissions — may be taxable.
          That is between you and your tax authority.
        </p>
      </S>

      <S n="5" title="How a purchase works">
        <p>
          Membership is bought with USDC on Avalanche C-Chain. The flow is
          deliberate and yours at every step: first you sign an approval for the
          exact amount — never an open-ended one; then you sign the purchase
          itself, at a fresh quote. A stale figure is never signed.
        </p>
        <p>
          You sign every transaction from your own wallet. SYN is sent to your
          wallet at the rate shown — sent, not sold back. Your seat is confirmed
          by the purchase event in your transaction receipt on the chain: nothing
          predicted, nothing inferred.
        </p>
        <p>
          <strong className="text-foreground">Purchases are final.</strong> The
          chain is permanent by construction. There is no mechanism — ours or
          anyone&apos;s — that can reverse a confirmed transaction, so no refund
          is possible. Do not sign unless you fully understand and accept this.
        </p>
      </S>

      <S n="6" title="The referral program">
        <p>
          A member purchase may carry a verified introduction. When it does, a
          bounded commission is paid inside the buyer&apos;s own transaction to a
          founder-signed source wallet. The buyer&apos;s price is unchanged by
          it. A referral commission is a transparent payment for an eligible
          completed introduction — not passive income, not token yield, not
          downline, and not a profit promise. There is no recruitment structure,
          no multi-level anything, and self-referral is rejected by the contract
          itself. The full referral terms are published separately and committed
          on-chain by hash.
        </p>
      </S>

      <S n="7" title="No custody, no advice">
        <p>
          We never hold your funds or your tokens. The site&apos;s backend makes
          no state-changing chain calls and signs nothing on your behalf; the
          records it keeps are the operational ones the Privacy Policy lists,
          and none of them ever touches your funds. There is no deposit with us
          and no withdrawal from us, because nothing of yours ever sits with
          us. Nothing on this site is financial, legal, or tax advice. Decide
          with your own judgment or your own advisors.
        </p>
      </S>

      <S n="8" title="The public record">
        <p>
          The protocol&apos;s events are public and permanent by chain design.
          Purchases, referral payments, and contract activity are visible to
          anyone, forever. Your wallet address appears in that record; your legal
          identity does not — we collect no name, no email, no identity document
          (the Privacy Policy states exactly what technical traces exist), and we
          never publish a link between a member number and a wallet.
        </p>
      </S>

      <S n="9" title="Prohibited use">
        <p>
          You may not: use the site or protocol for anything unlawful in your
          jurisdiction; present the protocol, a seat, or SYN as a financial
          product, or a commission as income anyone is promised; mislead others
          about what the protocol is or does; interfere with, or attempt to
          break, the site or its contracts.
        </p>
      </S>

      <S n="10" title="Site provided as-is">
        <p>
          The site is provided as-is, without warranty of any kind. If anything
          we write disagrees with the real code or on-chain proof, the proof wins
          and we correct the words — verify for yourself; the chain is the
          record. To the fullest extent the law allows, we are not liable for
          losses arising from your use of the site or the protocol, including
          market movements, wallet errors, or transactions you sign.
        </p>
      </S>

      <S n="11" title="Changes to these terms">
        <p>
          A change of terms is never silent. A new version is published at a new
          URL with a new date and version number, and prior versions remain
          available. The version you accepted is the version that governed at
          that time.
        </p>
      </S>

      <S n="12" title="Governing law">
        <p>
          To be stated in the next version, together with the operating entity.
          These terms remain a dated draft until then.
        </p>
      </S>

      <S n="13" title="Contact">
        <p>
          Today&apos;s public channels are X (@TheSyndicateOne) and the official
          Telegram. A durable written channel for legal notices arrives with the
          next version.
        </p>
      </S>

      <p className="text-sm text-muted-foreground border-t border-border/40 pt-4">
        Published by The Syndicate — thesyndicate.money. Operating-entity details
        arrive with the next version.
      </p>
    </PublicPage>
  );
}
