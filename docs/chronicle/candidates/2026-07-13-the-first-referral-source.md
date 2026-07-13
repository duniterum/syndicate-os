# CHRONICLE CANDIDATE — The first referral source

```
status:    ✅ PROMOTED — founder GO 2026-07-14. Entry 3 of the public register
           (artifacts/studio/src/config/chronicleRegister.ts, rendered at
           /chronicle). This file remains as the candidate-of-record.
register:  protocol-institutional (solemn-alive, CANON_PROTOCOL_LANGUAGE §8)
date:      2026-07-13 (the day the convention gained its first on-chain instance)
discipline: identity-blind (roles only, no wallet, no person) · amount-blind
           except the rate, which IS the record · protocol-centric framing
surface:   /chronicle (upon promotion; oldest-first)
```

---

## The record

The protocol's referral system rests on a convention: a member's referral
source has one deterministic identity, derived from their wallet — computed,
never assigned, so the same wallet always resolves to the same source and no
registry clerk exists to get it wrong.

On 2026-07-13, the convention stopped being a design. The first member
referral source was created in the on-chain Source Registry — member class,
five percent, lifetime terms — and its terms fingerprint was written with it:
the exact hash of the public terms document served at the protocol's own
address. The words and the chain now hold each other: edit the document and
the fingerprint breaks; anyone can download the file and recompute the
commitment.

The source was born paused — the contract enforces it — and was activated by
a second, separate signature about a minute later. Two acts, both public
events, both the founder's own wallet through the console's first PROPOSE
form. Minutes after activation, the live quote confirmed the rail end to end:
a join through the new referral link pays its referrer inside the buyer's own
transaction.

## What made it deliberate

The first source under the member convention is the founder's. The pattern
repeats on purpose: before any member is offered a referral link, the founder
created one against his own wallet, signed both lifecycle acts himself, and
left the whole sequence on mainnet — creation, pause, activation, terms
fingerprint — as the worked example every future source will follow.

## Why this is recorded

A referral program is where protocols usually reach for trust-us language.
This one committed the opposite way: the terms are a public file whose bytes
are hashed on-chain, the source's existence and status are public events, and
the payment path was proven with real money before the program was spoken of
in the present tense. The first source is the template: derived identity,
fingerprinted terms, founder-signed lifecycle, no silent edits — ever.

## Verify

Read the source's record live from the on-chain registry (`sourceConfig` /
the registry's public reads — the /referral page renders them). Download the
served terms document (`/referral-program-terms-v1.txt`), compute keccak256
over its raw bytes, and compare it to the on-chain terms fingerprint (the
contract's `metadataHash`) — they match or something is wrong. The creation
and activation are public registry events; the served activity feed speaks
them as its referral lifecycle lines. Don't trust — verify.
