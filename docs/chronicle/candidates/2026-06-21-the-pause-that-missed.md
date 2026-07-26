# The pause that missed

- **id**: `2026-06-21-the-pause-that-missed`
- **dateUtc**: 2026-06-21
- **status**: CANDIDATE — verified, NOT promoted. The Founder has not read it on screen.
- **harvest**: harvest-1 · confidence: sourced-paraphrased

> Harvested from the origin repository `duniterum/TheSyndicate` on 2026-07-26 and put through an
> adversarial verifier instructed to REJECT it. Sources were fetched, figures recounted from their own
> source, and the verify instruction was FOLLOWED literally before this text was allowed to survive.

## The record

On 2026-06-21 the protocol was retiring the sale engine of its second generation. Two engines of that generation stood on mainnet, at addresses that a person reads as the same shape and a machine reads as entirely different things.
The Founder signed the pause against the wrong one. At 14:43:18 UTC the transaction was mined, reverted, and emitted nothing. It changed no state, stopped no engine, and cost only its gas. The engine that was meant to stop was still running.
Twelve minutes and six seconds later, at 14:55:24 UTC, the same wallet signed the pause again against the correct engine. That one succeeded and emitted its event. The engine has been paused ever since.

## What the protocol did

It could not delete the failed attempt and did not try. A reverted transaction is as permanent on a public chain as a successful one; the only choice available was whether to explain it.
The protocol's ledger records the symptom in the plainest available words — that a pause was attempted on the wrong engine, that the transaction reverted, and that it did not pause the intended one — and files the cause as addresses that looked similar in the workflow, with a target that was not verified tightly enough before the action.
The correction was not a reminder to be careful. It became a required sequence before any owner transaction: confirm the chain, the signer, the target address, the contract's role, the function, its arguments, the expected result, and the conditions that mean stop. If any one of them cannot be confirmed, the rule is to stop. The line the protocol wrote for itself afterwards is that an owner transaction is never performed from an address or a name alone.

## Why this is recorded

This is the cheapest possible version of this mistake. The transaction reverted, so the wrong engine was not stopped either — nothing moved at all.
The same confusion, aimed at a function that does not revert, does not fail politely. It stops the wrong engine while everyone reads the confirmation and believes the right one is stopped. The protocol's own note on why it mattered says exactly that: pausing the wrong contract can create false confidence while the intended contract remains open.
The cost here was gas and twelve minutes. It is recorded because the cost is not always twelve minutes, and because a register that only shows the transactions that worked is a catalogue, not a record.

## Verify

Both transactions are public on Avalanche C-Chain and can be read on any explorer. The failed attempt is 0x3b7db7ab…2979: status 0 (reverted), zero event logs, block 88510675, 2026-06-21 14:43:18 UTC, sent to 0x0b88…2b48. The successful pause is 0x74ccaa2f…fede: status 1, one event emitted, block 88511253, 2026-06-21 14:55:24 UTC, sent to 0x507E…B88b. Both were signed by the same wallet, 726 seconds apart. The paused engine still answers paused() with true. Don't trust — verify.

## Source

https://raw.githubusercontent.com/duniterum/TheSyndicate/main/docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md — entry SCRL-003 "Wrong contract target during pause". Origin's own words: symptom "Founder attempted a pause on V2a instead of V2b; the transaction reverted and did not pause V2b"; root cause "Historical sale addresses looked similar in the workflow and the target was not verified tightly enough before the action"; why it mattered "Pausing the wrong contract can create false confidence while the intended live contract remains open"; never-again rule "Never perform an owner transaction from an address/name alone; verify address-role-function-chain-signer-readback as a set." Both transaction hashes are listed in https://raw.githubusercontent.com/duniterum/TheSyndicate/main/docs/V3_NON_LIVE_DEPLOYMENT_READBACK_LOG.md ("Mistaken V2a pause tx" / "Correct V2b pause tx"). I verified both receipts and both block timestamps directly against Avalanche C-Chain: the reverted status, the empty log array, the differing target addresses, the shared sender and the 726-second gap are my own measurements, not the document's claims.
