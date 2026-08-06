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

---

## ⛔ THE REGISTRY'S OWN HEADER LIES — measured 2026-08-06, and it can never be fixed

`SourceRegistryV1` at **`0x780013bB358be6be95b401901264FC7c22a595a6`** carries this
line at the top of its publisher-verified source, verbatim:

```
//  SourceRegistryV1 - V3 CANDIDATE (not deployed, not activated)
//  STATUS: Implementation candidate for docs/V3_PROTOCOL_ENGINE_CONSTITUTION.md.
```

**Every clause of that is false, and each part was measured on 2026-08-06:**

| the header's claim | what the chain answered |
|---|---|
| "not deployed" | the explorer serves a publisher-**verified** source for that address — `ContractName SourceRegistryV1`, compiler `v0.8.24+commit.e11b9ed9`, 21 708 bytes |
| "not activated" | it answered **8** `sourceConfig(bytes32)` calls in one session, and **8** `sourceEscrowOwed` reads resolved against the sale |
| implicitly, that the sale does not depend on it | **`sale.SOURCE_REGISTRY()` (selector `0xee9ab677`) returns `0x780013bb…95a6` — this exact address.** The link is closed by a live call, not by inference. *(The lowercase `sourceRegistry()` REVERTS — no such getter; a probe on that name proves nothing.)* |
| implicitly, that it is unowned scaffolding | `registry.owner()` = `0x88ec79af…dd73`, `pendingOwner()` = zero — **the same key that owns the sale** |

**THE READING RULE, and it is general:**
**the deployed code beats its own comment; the chain beats everything.**
A comment describes what its author believed at the moment of writing. Bytecode is
immutable, so a header that was true before deployment stays frozen in the past
FOREVER — a STATE line written where only an INVARIANT can survive, which is the
disease `docs/direction/CANON_INVARIANT_VS_STATE.md` exists to name. **The comment
cannot be corrected — no commit reaches deployed bytecode — so the correction lives
HERE, permanently.**

⚠ **THIS CONTRACT HAS ALREADY COST A SESSION ONCE.** The registers carried
«SourceRegistryV1 is PAUSED» until `paused()` was called and found to **REVERT** —
the function does not exist on that contract; there is no global pause to be in.
Struck 2026-08-06. Same contract, same failure mode: a claim believed instead of a
call made.

## THE ESCROW PATH — read from the verified source, 2026-08-06

Measured at the same time as the above, and recorded here so it is never re-derived.
**Escrow exists on V3 and it fires**: `_payAcquisition` (`MembershipSaleV3.verified.sol:527-534`)
pushes the source payout through an external self-call (`:304-308`) precisely so a
token-level revert can be **caught** — the escrow is credited, `SourcePayoutEscrowed`
fires, **and the purchase completes**. A failed payout does not revert the buy.

| question | the deployed answer |
|---|---|
| who may claim | **anyone** — `claimSourceEscrow` at `:290` is `external nonReentrant`, no access modifier; the NatSpec at `:288-289` says so |
| where the money goes | the registry's **current** payout wallet, re-read at claim time (`:294`) and sent at `:299`. **No recipient parameter.** So a claim retries the same wallet unless the registry entry is re-pointed first |
| the dead-wallet escape | `updatePayoutWallet(sourceId, newWallet)` on the registry (**onlyOwner**), then anyone calls `claimSourceEscrow`. `updateSourceTerms` REVERTS on a payout-wallet change (`PayoutWalletChangeRequiresRecovery`) — that error names the dedicated function; do not conclude from it that wallets are immutable |
| when a claim is refused | `:296` reverts `SourceEscrowLocked()` unless the source is **ACTIVE** — **pausing or revoking a source that holds escrow makes that escrow unclaimable until it is reactivated** |
| any founder sweep | **none, by design.** `rescueToken` (`:704`) reverts `ProtectedToken()` on USDC and SYN; `recoverUnsoldSyn` moves SYN only. There is no owner path to escrowed USDC on the sale |

**Escrow owed right now: 0 across ALL 8 sources** (ids read from the chain's own
`SourceCreated` receipts, then `sourceEscrowOwed` called per id — the local index
only said *where* to look). Nothing is trapped today. This table exists so the day
one is, nobody re-derives the mechanics under pressure.
