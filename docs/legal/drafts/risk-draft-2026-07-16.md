# Risk Disclosure

Version 1 — draft of 2026-07-16

*This draft awaits review by qualified counsel before it is legal protection. Nothing on this page is legal, tax, or financial advice.*

Joining The Syndicate means signing two transactions from your own wallet on Avalanche C-Chain (chain 43114): an exact-amount USDC approval, then a purchase. SYN is sent to your wallet at the rate shown — sent, not sold back. Before you sign anything, read this page slowly. **Joining can result in total loss.**

## The price of SYN can fall

SYN is an experimental utility membership token with a market price on a public pool. The market is free — it can price SYN below what you paid, or at nothing. The entry rate is neither a floor nor a market valuation, and the protocol promises nothing about price. A seat is recognition, identity, and participation. Buy a seat to belong — never to profit. If the market price of SYN goes to zero, your seat still stands, and no one owes you anything for it.

## Smart contracts can have flaws

The seat sale and SYN live in smart contracts on a public blockchain. Deployed contract code is immutable: if a bug exists, it cannot be silently fixed — the same code runs for everyone until a new contract is published in the open. Immutable code is not frozen behavior: some parameters can change within the contract's own published rules — the entry rate, for one, can be raised under the recorded on-chain terms, never silently. The purchase flow takes real precautions — the approval is for the exact amount, read from the sale contract itself; the buy unlocks only after your approval is confirmed on-chain; the quote is refreshed at the moment you click; and the flow refuses to run on any chain but Avalanche 43114 — but no code is ever certain to be flawless. [FOUNDER DECISION: state plainly whether the contracts have been independently audited, and by whom. Nothing in the current record claims an audit, and this page must not imply one.]

## Your keys are your only access

There are no accounts, no email, no password, and no reset. You sign in with your wallet, and your seat lives at your wallet address. If you lose your keys, you lose access — nobody, including The Syndicate, can restore it. The Syndicate never holds your assets: you sign from your own wallet, and no withdrawal function exists on our side to help you or to hurt you.

## Blockchain transactions are final

There are no chargebacks and no reversals. A confirmed purchase cannot be undone. Your seat exists only when the purchase event appears in your own transaction receipt — nothing predicted, nothing inferred. If a screen and the chain ever disagree, the chain is the truth: check your transaction on a public Avalanche explorer before you rely on what any interface tells you.

## The rules around crypto-assets are unsettled

Laws on crypto-assets differ by country and keep changing. A change in law or regulation could restrict the protocol, the pool, or your ability to participate. You are solely responsible for making sure that joining is lawful where you live, and for your own taxes. [FOUNDER DECISION: eligibility statement — minimum age, restricted jurisdictions, sanctions screening posture. None exists in the current record.] [FOUNDER DECISION: the legal entity and jurisdiction publishing this disclosure. The current record names only "The Syndicate".]

## Nothing here promises money

Membership is not a security or financial product, and it promises no money or financial gain. The ladder is recognition only — status, access, standing. A rung never pays, never discounts, never confers any financial advantage. Referral commissions are transparent payments for eligible completed member introductions — not passive income, not token yield, not downline, and not a profit promise. Past protocol activity never implies future activity: what the protocol did yesterday is a public record, not a forecast.

## The pool can be thin

The pool is a courtesy, not a promise. Liquidity can be thin, and a small pool moves hard. If you provide liquidity yourself: impermanent loss is structural to AMMs, not a defect; total loss is possible; deposit only what you can afford to lose entirely. Withdrawals are yours alone — The Syndicate does not custody, manage, or guarantee LP positions. Providing liquidity is a market act, not a membership act.

## Phishing and impersonation

Assume any unsolicited message claiming to be The Syndicate is hostile. We will never ask for your keys or seed phrase, and never ask you to "validate" or "sync" your wallet. [FOUNDER DECISION: whether to adopt and publish a "we never message first" commitment as operational policy.] Our only channels are thesyndicate.money, X (@TheSyndicateOne), and the official Telegram channels. Anyone else claiming to speak for The Syndicate does not. Type the site address yourself, and never enter a seed phrase anywhere. [FOUNDER DECISION: a channel for reporting impersonation — no support email exists in the current record.]

## Verify everything yourself

Every figure, contract, and transaction is public on Avalanche C-Chain. If anything we write disagrees with the real code or on-chain proof, the proof wins and we correct the words. Don't trust — verify.