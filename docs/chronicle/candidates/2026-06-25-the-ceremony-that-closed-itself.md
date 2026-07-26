# The ceremony that closed itself

- **id**: `2026-06-25-the-ceremony-that-closed-itself`
- **dateUtc**: 2026-06-25
- **status**: CANDIDATE — verified, NOT promoted. The Founder has not read it on screen.
- **harvest**: repair-pass

> Harvested from the origin repository `duniterum/TheSyndicate` on 2026-07-26 and put through an
> adversarial verifier instructed to REJECT it. Sources were fetched, figures recounted from their own
> source, and the verify instruction was FOLLOWED literally before this text was allowed to survive.

## The record

On 2026-06-25 the protocol opened one commission-paying source on mainnet, ran a single real purchase through it, and closed it again the same evening. The record was open for four hours, twenty-eight minutes and fifty-six seconds.
The record it used had been created the day before. On 2026-06-24 at 09:11:50 UTC an internal test source was written into the on-chain source registry, and the creation event carries its status as paused. That was not a choice. The registry's creation function has no other setting, and it says why in its own source: “Creates source terms in PAUSED status. A separate explicit activation step keeps money-routing terms reviewable before use.”
The terms were written the next morning, at 08:13:21 UTC: five percent, a fourteen-day window opening 2026-06-25T12:00:00Z and closing 2026-07-09T12:00:00Z, twenty-five dollars across the whole source, five dollars per buyer, no repeat purchases.
Eight hours and forty-one minutes later, at 16:55:05 UTC, one signature moved the record from paused to active. Ten seconds after it, a second signature sent the same instruction again, and the chain recorded that one as active to active — it changed nothing. The ceremony document names the second transaction as the activation. The state moved on the first.
At 20:59:20 UTC a single purchase ran through the sale engine. Five dollars entered. Twenty-five cents left first, to the source's own wallet, before the protocol received anything; the remaining four dollars and seventy-five cents were split on-chain — 3.325 to the vault, 0.95 to liquidity, 0.475 to operations. Five hundred SYN were delivered, and the engine wrote member number 10, marked as a first seat.
Twenty-four minutes and forty-one seconds later, at 21:24:01 UTC, a fifth signature put the record back to paused. Every one of those five acts was signed by the same wallet.

## What the protocol did

It refused to call the ceremony finished when the money moved. The operating ledger written from that day states the rule it took away: “Do not call an operator ceremony complete after the exciting transaction. Call it complete only after the safety transaction, final readback, and public-boundary check are recorded.” The ledger anchors the record to the closing act, not to the paying one.
It also kept the test off the public path. Throughout, the default join route continued to use the zero source id; no public source link existed, no claim screen existed, no source dashboard existed, and no contract code changed. The ceremony record says so in its own words: “The first source-attributed receipt is a protocol capability proof, not a public referral launch.” What is recorded here is a closed internal test, not a public opening.
And it wrote the day down imperfectly. Each of the four timestamps printed in the ceremony document runs three hours, forty-six minutes and forty seconds ahead of the block it names, which pushes two of its rows into the following day; the two origin ledgers that record the day inherit that and are dated 2026-06-26. The document's own numbers refute its rendering — the closure epoch it prints, 1782422641, is exactly the closing block's timestamp and decodes to 21:24:01 UTC on 2026-06-25. Where a document and the chain disagree, the chain governs, and this entry is dated from the blocks.

## Why this is recorded

The commission arithmetic is the least interesting thing here. It worked to the cent, and anyone can recompute it from the transaction.
What is worth keeping is the shape of a day a tidier register would have filed as a clean success. Three things about it are not clean, and all three are in this entry: the document names an activation that changed no state; its clock is wrong by the same amount on every row; and the closure it records did not hold — on 2026-07-06 at 17:16:56 UTC the same wallet reopened the same record, under terms with no window and no caps, and a live read today returns it as active.
None of that needed an auditor. It is what the chain says when the chain is asked instead of the file. A register that recorded only the parts that stayed true would be a brochure. This one records the night as it happened, the paperwork as it was written, and what has become of the record since.

## Verify

Seven transactions on Avalanche C-Chain carry this record, and each is checkable from its own receipt. Full hashes, because a shortened hash cannot be looked up. The source registry is 0x780013bB358be6be95b401901264FC7c22a595a6 and the source id is 0x8338e9ffa4f94cb15a195d6dbbb8051f064aeb69ae4cd7b7952dc8621b1cf620.
Creation — 0xf72d3c0ad6445f407382508985fc01c8d458186a410701ae40308a9d5f7a5280 (its SourceCreated event carries status 2, paused; block 88705814, whose own header timestamp is the 2026-06-24 date used above). Terms — 0x898b4f142ca388543701da8e483f764d1daef4c3256d28b449aac5cf08e2784d (SourceTermsUpdated: 500 bps, the fourteen-day window, the twenty-five and five dollar caps). Activation — 0x31974f66712ddcb374c05864502f897fe7aeaf6994ce75535b423a98954f3602 (SourceStatusChanged 2 to 1: this is the one that moved the state). The repeat — 0x7565d0fbe6389a7fc39da4ec0f9e69d2a82a99d42d3192e616d18fc35efc4df1 (SourceStatusChanged 1 to 1, no change: the transaction the ceremony document names). Closure — 0x67f6498cd734b27032f0a10fe55bad57079f5b9cf38b38a85a1f95895aece71f (SourceStatusChanged 1 to 2).
The purchase is 0x58f4d5a78ab14ed1eda546226ca5d6ca4098487d90429677633f911f9d049c46 on the sale engine: its transfer logs, read in order, show 5.000000 USDC in, 0.250000 out to the source wallet as the first outbound leg, then 3.325000, 0.950000 and 0.475000, and 500 SYN out. Take each date from the block header of the transaction, not from the document's printed row.
Do not verify the closure with a live read — the record did not stay closed. The reopening is 0xf91b7405b206f3669f55df47ac0bdacd7b62f5d9bf794587a10184d53008d81b, 2026-07-06, and sourceConfig on that source id returns status 1, active, when read today. The registry's own transaction list — fourteen since it was deployed — holds the whole lifecycle in one place. Don't trust — verify.

## Source

Origin repository github.com/duniterum/TheSyndicate, files re-fetched raw on 2026-07-26 after listing the tree through the git trees API: docs/SOURCE_REAL_CONDITION_CEREMONY_READBACK.md (status line, ceremony transaction table, buy receipt table, and the boundary sentence quoted above); docs/OPERATIONAL_MEMORY_LEDGER.md, OML-019 “Source ceremonies close only after final safe-state readback” (the never-again rule quoted above, and the Founder attribution for the closure transaction); docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md, SCRL-016 “Source attribution lifecycle is proven but state-scoped”; contracts/src/SourceRegistryV1.sol (the createSource comment quoted above, the enum in which PAUSED is 2 and ACTIVE is 1, and updateSourceTerms, which does not touch status). Chain evidence measured directly on Avalanche C-Chain, chain id 43114, on 2026-07-26: block headers 88705814, 88769017, 88794245, 88794252, 88806161 and 88807390; the receipts and decoded event logs of all seven transactions named in the verify note; the registry's complete fourteen-transaction history; and sourceConfig read at block 91292452. Where the origin documents and the chain disagree on time, the chain is used.
