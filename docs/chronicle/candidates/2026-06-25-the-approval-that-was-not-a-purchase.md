# The approval that was not a purchase

- **id**: `2026-06-25-the-approval-that-was-not-a-purchase`
- **dateUtc**: 2026-06-25
- **status**: CANDIDATE — verified, NOT promoted. The Founder has not read it on screen.
- **harvest**: repair-pass

> Harvested from the origin repository `duniterum/TheSyndicate` on 2026-07-26 and put through an
> adversarial verifier instructed to REJECT it. Sources were fetched, figures recounted from their own
> source, and the verify instruction was FOLLOWED literally before this text was allowed to survive.

## The record

On 2026-06-25 the protocol put its referral rail — the path that pays a referral source out of the buyer's own transaction — through a real-condition test: real money, on mainnet, on an internal route the public site did not link to or list. The Founder ran the ceremony himself.
The first transaction he signed succeeded, and it was not the test. It confirmed on Avalanche C-Chain at 19:14:56 UTC, in block 88801135: a USDC approval, authorising the sale engine to spend five dollars. It carries exactly one event — permission granted — and nothing else. No USDC moved, no tokens were delivered, no seat was written.
The purchase came one hour, forty-four minutes and twenty-four seconds later, at 20:59:20 UTC, in block 88806161. That transaction called the engine's buy function and did the whole thing in one signature: five dollars in; twenty-five cents out to the source's wallet at five percent; four dollars and seventy-five cents as the net protocol contribution, split on-chain to the cent — 3.325 to the vault, 0.95 to liquidity, 0.475 to operations; five hundred SYN delivered; and the engine wrote seat #10, the first seat for that wallet.

## What the protocol did

It wrote the confusion down as a defect of its own making — three entries across two ledgers in its public engineering record — and then changed the machine.
The operational ledger names the cause without softening it: the internal route was “a technically safe harness, but not a ceremony cockpit.” The gates were correct; what was missing was a step model, a current action, a stop condition. The contract-lessons ledger states the rule as its own heading: “Approval is not purchase.” And the operating rule that came out of the day is a reading discipline, not a copy fix: “Transaction success is not enough. Name what function was called, what event it emitted, and whether it is permission, protocol action, proof, or closure.”
The changes followed the rule. The operator console gained a first-class state for an approval that has happened while the purchase is still pending, with separate explorer links for the two transactions and copy that says which one is still missing. The tests refuse to call a ceremony complete without evidence of the purchase transaction itself. And the interface is forbidden from describing an approval as joined, seated, or purchased.

## Why this is recorded

No funds were misrouted: the permission was real, the purchase followed, and both are permanently readable. What failed was reading. For one hour and forty-four minutes the ceremony sat on a successful transaction that proved nothing about the thing being tested, and the surface in front of the Founder did not make that state loud enough to settle it.
The protocol's standing claim is that nobody has to believe it, because everything it does is checkable. This is the day the same discipline turned inward. A successful transaction is not a protocol event: it is a function call and the events it emitted, and until those are named, all that is proven is that gas was spent. Every act this register records is read that way now — which function, which event, and what it proves.
It is written down rather than quietly fixed because a register that holds only the days when nothing went wrong is evidence of nothing. This one holds a day when the operator could not tell what he had just signed, and it leaves both transaction hashes where anyone can open them.

## Verify

Both transactions are public on Avalanche C-Chain (43114). The approval: https://snowtrace.io/tx/0x2e2bbe37db1ad1094c2e2b45a3d86b608fcd3e64de83688053fb5a8438e95773 — Success, block 88801135, 2026-06-25 19:14:56 UTC, an approve on the USDC contract for 5,000,000 units (five dollars) with the sale engine as spender; the page lists no token transfers, and the receipt carries one log, an Approval. The purchase: https://snowtrace.io/tx/0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46 — Success, block 88806161, 2026-06-25 20:59:20 UTC, calling buy() on the sale engine: 5.000000 USDC in, 0.250000 out at 500 bps, then 3.325000 / 0.950000 / 0.475000, 500 SYN delivered, and a MembershipPurchasedV3 event whose memberNumber is 10 and whose firstSeat is true. The seat still answers live on the sale engine 0x2A6cFc76906e758B934209AFf5A163c9bC20132E: memberByNumber(10) returns the wallet the purchase was sent from, and memberNumberOf() for that wallet returns 10. The words are in the public origin repository github.com/duniterum/TheSyndicate — OML-017 and OML-018 in docs/OPERATIONAL_MEMORY_LEDGER.md, SCRL-009 in docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md. Don't trust — verify.

## Source

Origin repository github.com/duniterum/TheSyndicate (fetched raw, 2026-07-26): docs/OPERATIONAL_MEMORY_LEDGER.md — OML-017 “Operator consoles must make ceremony state explicit” (Date discovered 2026-06-25; root cause “The route was a technically safe harness, but not a ceremony cockpit.”; symptom: the first transaction completed was a USDC approval, not the source-attributed buy) and OML-018 “A blockchain transaction is not automatically the protocol event” (Date discovered 2026-06-25; fix: first-class approval-only/buy-pending state, separate approval and buy explorer links, tests requiring buy-transaction evidence; never-again rule quoted in full in the entry). docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md — SCRL-009 “Approval is not purchase” (frontend implication: the UI must never call an approval joined, seated, or purchased). docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md line 59 and OML-019 both cite the same purchase hash. Contract shapes read from contracts/src/MembershipSaleV3.sol (buy() and the MembershipPurchasedV3 event) and contracts/src/SourceRegistryV1.sol (SourceClass enum; this purchase carries class 1 = BUILDER_SOURCE). Chain measurements, Avalanche C-Chain 43114, taken 2026-07-26: transactions 0x2e2bbe37db1ad1094c2e2b45a3d86b608fcd3e64de83688053fb5a8438e95773 (block 0x54aff6f, header timestamp 0x6a3d7e30) and 0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46 (block 0x54b1311, header timestamp 0x6a3d96a8), receipts decoded log by log; selector 0x1317ce79 and topic0 0x4ae1104be21836909353b0af3cd82a339d2ac380eda00ad26313d8fce198c1bf computed from the contract source; live reads memberByNumber(10) and memberNumberOf().
