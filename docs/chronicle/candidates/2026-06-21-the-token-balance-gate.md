# The token-balance gate

- **id**: `2026-06-21-the-token-balance-gate`
- **dateUtc**: 2026-06-21
- **status**: CANDIDATE — verified, NOT promoted. The Founder has not read it on screen.
- **harvest**: harvest-1 · confidence: sourced-paraphrased

> Harvested from the origin repository `duniterum/TheSyndicate` on 2026-07-26 and put through an
> adversarial verifier instructed to REJECT it. Sources were fetched, figures recounted from their own
> source, and the verify instruction was FOLLOWED literally before this text was allowed to survive.

## The record

Before the third-generation sale engine reached mainnet, its source carried a single line of defence that would have closed the door on the people most likely to walk through it.
The engine had to answer one question on every purchase: is this wallet a member of an earlier era, carrying a seat number that must be preserved, or a stranger who should be issued the next number? For a short period the engine answered it partly by looking at the wallet's balance of the protocol's own token. A wallet that was not a recognised historical member and held any amount of that token at all was refused — and refused with an error that told it, wrongly, that it was an unrecognised historical member.
The effect was the opposite of what the check intended. Anyone who had acquired the token by transfer, or been sent a trivial amount of it unasked, would have been permanently unable to join. A token that anyone can send to anyone had been treated as proof of who someone is.

## What the protocol did

It removed the line, on 2026-06-21, about seven hours before the engine was deployed to mainnet. The check never governed a real purchase.
It then wrote down why, in the engine's own tests: an unknown wallet holding the token must be able to buy and receive a new seat number, and that assertion is now part of the test suite rather than a memory. The protocol's own ledger records the root cause without softening it — that the work had confused transferable holder status with historical member identity — and states the rule it took away in one sentence: a raw token balance is not proof of historical identity.
Identity was moved onto ground that cannot be gifted or dusted into someone's wallet. A member of an earlier era is carried across by a proof that binds their wallet to their seat number, and nothing else counts.

## Why this is recorded

This mistake was caught before deployment, which is the only reason it is a paragraph rather than a permanent condition. Had it shipped, it would not have announced itself: there would have been no failed purchases to investigate, only people who tried once, were told they were something they were not, and did not come back.
It is recorded because it belongs to the class of error that is invisible from the inside. The protocol was reading a number that was genuinely on the chain and drawing a conclusion the chain never supported. Being right about the data and wrong about what it means is not a rare failure, and a register that only recorded the mistakes that reached production would teach the wrong lesson about how they are avoided.

## Verify

The change is a public commit in the origin repository (duniterum/TheSyndicate, commit 1581edf6, authored 2026-06-21 05:39:12 UTC, "Remove SYN balance gate from V3 member assignment"). Its diff removes exactly one line from the sale engine's member-assignment path — a rejection triggered when the recipient's token balance is not zero — and adds a test asserting that an unknown wallet with no token balance starts unseated and can buy. Read it at github.com/duniterum/TheSyndicate/commit/1581edf6. The deployed engine is source-verified on Snowtrace, Routescan and Sourcify, so the deployed source can be read directly to confirm the check is absent: the engine was created by transaction 0x635770ef…b42c on Avalanche C-Chain, block 88505301, 2026-06-21 12:51:48 UTC — about seven hours after the line was removed. Don't trust — verify.

## Source

https://raw.githubusercontent.com/duniterum/TheSyndicate/main/docs/SMART_CONTRACT_LESSONS_AND_REGRESSION_LEDGER.md — entry SCRL-004 "SYN balance used as member identity gate" (Severity Critical). Origin's own words: symptom "V3 briefly used SYN balance as a hard gate for unknown recipients"; root cause "Confused transferable holder status with historical member identity"; why it mattered "A wallet can receive transferred or dusted SYN without being a numbered historical member. Blocking or classifying by raw balance would corrupt membership identity."; never-again rule "Raw ERC-20 balance is not historical identity proof." The removed line, read from the commit patch at https://github.com/duniterum/TheSyndicate/commit/1581edf6b78f59055b4f618a4655377285a9cd1d.patch, is: `if (SYN.balanceOf(recipient) != 0) revert UnknownHistoricalMemberNumber(recipient);` in contracts/src/MembershipSaleV3.sol. Deployment tx and block timestamp verified by me directly against Avalanche C-Chain (chain 43114).
