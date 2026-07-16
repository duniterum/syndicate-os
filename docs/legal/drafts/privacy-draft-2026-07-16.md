# Privacy Policy

Version 1 — draft of 2026-07-16

*This is a draft. It awaits review by qualified counsel before it counts as legal protection.*

## The short version

The Syndicate is built to know almost nothing about you. There are no accounts, no email addresses, no passwords, no identity checks, and no member directory. You connect a wallet; the wallet — and the ordinary technical traces any web server sees — is all we see. We run no analytics and no advertising trackers. We sell no data. Nothing leaves except what a connection itself requires.

## Who operates this site

[FOUNDER DECISION: legal entity name, form, jurisdiction of organization, and registered address of the operator ("the data controller" in European terms).]

## What we never collect

No name, email, phone number, postal address, government ID, or payment card. No KYC. There is no sign-up form anywhere on the site. Signing in means proving control of a wallet with a cryptographic signature — nothing more.

## Wallet addresses

A wallet address is public blockchain data. The site reads it from the Avalanche C-Chain, where anyone can read it. We never link a wallet address to a real-world identity, and we never publish which wallet holds which member number — that mapping stays server-side, by design.

## One cookie, and only one

When you sign in with your wallet, the site sets a single session cookie named `syn_session`. It is strictly functional: it keeps you signed in, nothing else. It is HttpOnly (scripts cannot read it), sent only over HTTPS, restricted to our own API, and never shared cross-site. A session lasts at most 60 minutes, and ends after 15 minutes of inactivity. Because this cookie is strictly necessary and does no tracking, there is no cookie banner — there is nothing to consent to.

## Your browser's local storage

The site stores two small preferences in your own browser: your light/dark theme choice, and a flag noting the guide greeting was already shown. Neither is personal data, and neither is ever sent anywhere.

## Server logs

Like nearly every server on the internet, ours writes operational request logs, and it counts requests per IP address to slow down abusive sign-in attempts. An IP address can be personal data under laws like the GDPR, so we say it plainly: logs exist for keeping the service running and safe, not for profiling. [FOUNDER DECISION: the exact log retention period — no window is set today; once set, it will be stated here.]

## What our database holds

One record class touches members: the pairing between a wallet address and its member number, kept so a member's number stays theirs. Your own purchase history is served only to you, only while you are signed in with that wallet. The database also mirrors the public on-chain event record — wallet addresses, amounts, timestamps of purchases, burns, mints and referrals — as an index of what the chain already publishes: mirrored, never collected from you. A small operator registry, keyed by wallet, controls who can administer the protocol.

## The blockchain is public and permanent

Membership happens on the Avalanche C-Chain. Every transaction there — wallet addresses, amounts, timestamps — is public and permanent by the chain's design. This site reads that record; it did not create it and cannot erase it. No one can, including us. Please understand this before transacting: rights like erasure can apply to data *we* hold (the cookie, the session, the logs) but cannot apply to the blockchain itself. The wallet-to-number pairing exists to keep a member's seat theirs — an erasure request against it is assessed against that function and the legal grounds, case by case.

## Third parties

Two kinds of outside services come into play, each under its own privacy policy, not ours: wallet connection infrastructure (WalletConnect, used when you connect certain wallets), and public Avalanche RPC endpoints your browser contacts directly to read chain data. Your wallet app is your own choice and governed by its own terms. We send them nothing beyond what the connection itself requires.

## Your rights

Depending on where you live, you may have rights to access, correct, or delete personal data, and to complain to a supervisory authority. For the little we hold — session data, short-lived logs, the wallet-to-number pairing — contact us and we will respond honestly about what exists and what can be done. For on-chain data, see the section above: it is public and permanent, and no operator can alter it.

## Changes

A change to this policy is never silent. A new version is published at this page with a new version number and date.

## Contact

[FOUNDER DECISION: the contact channel for privacy requests — a dedicated email address does not currently exist; today's only public channels are X (@TheSyndicateOne) and Telegram.]