# CHRONICLE CANDIDATE — The duplicate seat

```
status:    ✅ PROMOTED — founder GO 2026-07-14. Entry 1 of the public register
           (artifacts/studio/src/config/chronicleRegister.ts, rendered at
           /chronicle). This file remains as the candidate-of-record.
register:  protocol-institutional
date:      2026-07-12 (the day the overlap was verified and answered on-chain-truthfully)
discipline: identity-blind (seat numbers only, no wallet, no person) ·
           amount-blind · protocol-centric framing
surface:   /chronicle (live since the promotion; oldest-first).
```

---

## The record

The protocol carries its members across engine generations by a frozen
commitment: eight historical seats, sealed behind a Merkle root written
immutably into the third-generation sale engine at deployment. To be carried
across, a historical member must present a proof and claim their seat — one
on-chain act, once.

The engine, however, does not force the claim. A historical member who
purchases before claiming is seen by the engine as a stranger — and is issued
a new seat.

In the protocol's first era of live operation, this happened. Historical seat
#7, unclaimed, purchased through the active engine and was issued seat #11.
One member, two seat numbers — written to mainnet, permanent. The engine's
member count says 12. The number of distinct members is 11.

## What the protocol did

It did not edit the number. It did not quietly reconcile the count, retire a
seat, or wait for the claim that can no longer happen — the engine permanently
refuses a claim from a member it already knows, so seat #7 will stand empty
forever, and the overlap can never be undone.

Instead, the protocol now states both figures, derived live from the chain on
every read — never typed, never frozen into a document:

> **12 seats issued · 11 distinct wallets — one wallet holds two seats:
> a member of an earlier era who bought again before the claim gate existed.**

And it closed the gap: the joining surface now reads the engine's own
recognition state for every historical seat before a purchase path is offered.
An unclaimed historical seat is blocked from buying — *claim your seat first*
— and any failure to verify blocks rather than guesses. The check that the
engine lacks was built in front of it.

## Why this is recorded

This protocol was built in public, on mainnet, deliberately — errors dated,
signed, and impossible to erase. Anyone can claim transparency when everything
is clean. The claim is only proven when something is not.

The duplicate seat is that proof: an inconvenient truth the chain records and
the protocol repeats, at the exact place where it would be easiest to round
away. The count on the public page and the count on the chain will disagree
with each other exactly never — because the page is the chain.

## Verify

Every figure in this record is a live read of the active sale engine (see the
public verify links): `memberCount()` (seats issued), `GENESIS_OFFSET()` (the
eight historical seats), `memberNumberOf(address)` (the overlap — a historical
wallet answering with a seat number above eight), `memberByNumber(7)` (the
permanently empty seat). Don't trust — verify.
