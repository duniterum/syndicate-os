// pages/Privacy.tsx — AUD-T (founder GO on the full text, 2026-07-16).
// Every claim here was harvested from the REAL code and adversarially
// verified (the one HttpOnly cookie, two localStorage preferences, zero
// third-party analytics, pino logs + IP throttle, the on-chain mirror,
// WalletConnect + public RPC third parties). The "trust-us" shape was
// removed at the doctrine pass — statements stand flat, counsel can stand
// behind them.
// Version 2 draft (SPEC R3, founder GO on the wording 2026-07-19): the
// referral channel counter is disclosed — the site's ONE first-party
// aggregate record (clicks per referral code + channel tag + day; never who
// clicked, no cookie, no identifier). Still zero third-party analytics.

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

export default function Privacy() {
  return (
    <PublicPage
      eyebrow="Legal"
      title="Privacy Policy"
      lead="The Syndicate is built to know almost nothing about you. This page says plainly what little exists — and what never does."
      badge={<StatusPill tone="caution">Version 2 — draft of 2026-07-19</StatusPill>}
    >
      <Card className="bg-muted/20 border-border/50 p-4 text-sm text-muted-foreground leading-relaxed mb-10">
        This is a draft. It awaits review by qualified counsel before it counts
        as legal protection. A change to this policy is never silent: a new
        version is published here with a new version number and date.
      </Card>

      <S title="The short version">
        <p>
          There are no accounts, no email addresses, no passwords, no identity
          checks, and no member directory. You connect a wallet; the wallet —
          and the ordinary technical traces any web server sees — is all we see.
          We run no third-party analytics and no advertising trackers. We sell
          no data. The one counting we do ourselves: when a referral link
          carries a channel tag, the landing adds one to a daily counter for
          that referral code and tag — a number, never a person; who clicked
          is not recorded, anywhere. Nothing else leaves except what a
          connection itself requires.
        </p>
      </S>

      <S title="Who operates this site">
        <p>
          The Syndicate — thesyndicate.money. Operating-entity details (legal
          name, form, jurisdiction, registered address) arrive with the next
          version of this policy.
        </p>
      </S>

      <S title="What we never collect">
        <p>
          No name, email, phone number, postal address, government ID, or
          payment card. No KYC. There is no sign-up form anywhere on the site.
          Signing in means proving control of a wallet with a cryptographic
          signature — nothing more.
        </p>
      </S>

      <S title="Wallet addresses">
        <p>
          A wallet address is public blockchain data. The site reads it from the
          Avalanche C-Chain, where anyone can read it. We never link a wallet
          address to a real-world identity, and we never publish which wallet
          holds which member number — that mapping stays server-side, by design.
        </p>
      </S>

      <S title="One cookie, and only one">
        <p>
          When you sign in with your wallet, the site sets a single session
          cookie. It is strictly functional: it keeps you signed in, nothing
          else. It is HttpOnly (scripts cannot read it), sent only over HTTPS,
          restricted to our own API, and never shared cross-site. A session
          lasts at most 60 minutes, and ends after 15 minutes of inactivity.
          Because this cookie is strictly necessary and does no tracking, there
          is no cookie banner — there is nothing to consent to.
        </p>
      </S>

      <S title="Your browser's local storage">
        <p>
          The site stores two small preferences in your own browser: your
          light/dark theme choice, and a flag noting the guide greeting was
          already shown. Neither is personal data, and neither is ever sent
          anywhere.
        </p>
      </S>

      <S title="Server logs">
        <p>
          Like nearly every server on the internet, ours writes operational
          request logs, and it counts requests per IP address to slow down
          abusive sign-in attempts. An IP address can be personal data under
          laws like the GDPR, so we say it plainly: logs exist for keeping the
          service running and safe, not for profiling. A precise retention
          window will be stated in the next version of this policy.
        </p>
      </S>

      <S title="What our database holds">
        <p>
          One record class touches members: the pairing between a wallet address
          and its member number, kept so a member&apos;s number stays theirs.
          Your own purchase history is served only to you, only while you are
          signed in with that wallet. The database also mirrors the public
          on-chain event record — wallet addresses, amounts, timestamps of
          purchases, burns, mints and referrals — as an index of what the chain
          already publishes: mirrored, never collected from you. A small
          operator registry, keyed by wallet, controls who can administer the
          protocol.
        </p>
        <p>
          Messages the operator sends to members (the in-app notification
          center) are stored with each member&apos;s own read state — served
          only to that member&apos;s signed session, never published.
        </p>
        <p>
          The referral channel counter: when a referral link carries a channel
          tag (for example <span className="font-mono">&amp;via=twitter</span>),
          the landing adds one to a daily count for that referral code and tag,
          and a completed purchase is paired to its tag only after the server
          verifies the purchase&apos;s public on-chain receipt. These rows hold
          a referral code, a tag, a day, and a count — no IP address, no
          browser fingerprint, no cookie, no identifier of who clicked, ever.
          The breakdown is served only to the referral code&apos;s own signed
          owner.
        </p>
      </S>

      <S title="The blockchain is public and permanent">
        <p>
          Membership happens on the Avalanche C-Chain. Every transaction there —
          wallet addresses, amounts, timestamps — is public and permanent by the
          chain&apos;s design. This site reads that record; it did not create it
          and cannot erase it. No one can, including us. Rights like erasure can
          apply to data <em>we</em> hold (the cookie, the session, the logs) but
          cannot apply to the blockchain itself. The wallet-to-number pairing
          exists to keep a member&apos;s seat theirs — an erasure request
          against it is assessed against that function and the legal grounds,
          case by case.
        </p>
      </S>

      <S title="Third parties">
        <p>
          Two kinds of outside services come into play, each under its own
          privacy policy, not ours: wallet-connection infrastructure
          (WalletConnect, used when you connect certain wallets), and public
          Avalanche RPC endpoints your browser contacts directly to read chain
          data. Your wallet app is your own choice and governed by its own
          terms. We send them nothing beyond what the connection itself
          requires.
        </p>
      </S>

      <S title="Your rights">
        <p>
          Depending on where you live, you may have rights to access, correct,
          or delete personal data, and to complain to a supervisory authority.
          For the little we hold — session data, logs, the wallet-to-number
          pairing — contact us and we will respond honestly about what exists
          and what can be done. For on-chain data, see the section above: it is
          public and permanent, and no operator can alter it.
        </p>
      </S>

      <S title="Contact">
        <p>
          Today&apos;s public channels are X (@TheSyndicateOne) and the official
          Telegram. A dedicated privacy-request channel arrives with the next
          version of this policy.
        </p>
      </S>
    </PublicPage>
  );
}
