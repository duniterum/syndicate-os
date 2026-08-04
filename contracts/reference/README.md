# contracts/reference — the DEPLOYED engines' own verified source

**Why this folder exists (2026-08-04, and it cost a whole session to learn).**

For weeks every session reasoned about `MembershipSaleV3` by *inference*: from
its ABI, from its behaviour, from notes written by earlier sessions. The source
was not in this repo, so nobody could read it. The bill:

- a handoff recorded the cause of seven reverted purchases as
  `appliesToRepeatPurchases = false`. **That term is `true` on that source.**
- a fix was built on a DIFFERENTIAL («does the purchase succeed with the link and
  without it?») that needed the buyer's approval to be meaningful, so it never
  ran for anyone arriving on a link. The founder found it with a second wallet.
- fourteen custom-error signatures were guessed from names. **Seven were wrong**
  — they carry `uint256` parameters — so their selectors were wrong, viem could
  not decode them, and seven honest human sentences were unreachable.
- and the eligibility rule itself was inferred wrongly twice, in two different
  directions, before anyone simply read line 448.

**CLAUDE.md's refactoring law says it plainly: never let a limit of a TOOL
masquerade as a limit of REALITY.** The source was one call away the whole time.

## What is here

| File | Address | Provenance |
|---|---|---|
| `MembershipSaleV3.verified.sol` | `0x2A6cFc76906e758B934209AFf5A163c9bC20132E` | The publisher-verified source served by the Avalanche explorer's `getsourcecode` API, fetched 2026-08-04. 789 lines. **sha256 of the committed blob** (`git cat-file -p HEAD:contracts/reference/MembershipSaleV3.verified.sol | sha256sum`) = `bc874d75f6d2e344d17de9e8efefac634c7289f31641d692a2da170cca74e572`. ⚠ A first version of this line carried the hash of my working copy instead — it did not match what git stored, and an unverified fingerprint in a truth document is the exact defect class this whole session was about. Verify with the command, never from this sentence. |

## What it is, and what it is NOT

- It IS the source the explorer serves as matching the deployed bytecode at that
  address, on Avalanche C-Chain (43114).
- It is **NOT built by us**, not compiled here, and not part of any build. It is
  READ-ONLY REFERENCE. Nothing imports it; no guard compiles it.
- It is **NOT the authority on live state.** The chain is. This file answers
  *what the contract does*; only a live read answers *what is true right now*.

## THE RULE THIS FOLDER EXISTS TO STOP PEOPLE GUESSING

`_resolveSource` (line 423) decides whether a referral link attaches. The two
lines that produced every screen the founder tested:

```solidity
// line 440 — you already have a LIVE introduction, and it is a different one
if (requestedSourceId != 0 && linked != 0 && linked != requestedSourceId && linkedCanApply)
    revert SourceAlreadyLinked();

// line 448 — this is not your first seat, you have NO introduction on record,
// and you supplied an explicit link
if (!p.firstSeat && linked == bytes32(0) && explicitSource)
    revert SourceNotEligible();
```

Measured against live wallets on 2026-08-04, and every one of them agrees:

| wallet | recorded introduction | engine |
|---|---|---|
| seats #5, #8, #12 | none | `SourceNotEligible` (line 448) |
| seats #13, #14 | one, still live | `SourceAlreadyLinked` (line 440) |
| seat #10 | one, but EXHAUSTED (scope 1, spent) | **accepted** — it escapes 448 by having a record, and 440 because that record can no longer apply |

And on acceptance the contract **rewrites** the buyer's introducer:
`buyerSourceId[recipient] = requestedSourceId` (line ~478). A new link therefore
replaces an exhausted one.

**Read this file before writing any sentence about what the engine does.**
