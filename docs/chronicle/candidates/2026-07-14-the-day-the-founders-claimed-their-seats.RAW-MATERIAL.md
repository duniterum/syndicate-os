# RAW MATERIAL — the day the founders claimed their seats (2026-07-14)

> ⚠️ STATUS: **RAW MATERIAL, NOT A CANDIDATE, NOT A PROMOTION.** Chain-verified facts
> captured the day they happened, so the future Chronicle entry (or PIPELINE-CHRONICLE)
> can be written from truth instead of memory. Writing the solemn candidate text and any
> promotion remain FOUNDER ACTS (CHR-1 doctrine). Per the register discipline, the final
> entry must be identity-blind (seat numbers + roles, no hex in the prose) — the anchors
> below are for the VERIFY cards and for verification, not for the entry body.

## What happened (chain-verified 2026-07-14, advisor session, read live on Avascan)

The eight historical members existed as a NUMBER inside MembershipSaleV3 (memberCount
started at GENESIS_OFFSET = 8) but the engine did not KNOW them: knownMember was false
for every unclaimed wallet, and an unclaimed wallet that bought was minted a second,
duplicate seat (it happened once — historical #7 also holds seat #11; Chronicle Entry 1).

On 2026-07-14, between 01:58:58 and 02:27:39 GMT, **all seven claimable historical seats
were claimed on-chain** via `claimHistoricalMembership(memberNumber, proof)` on Sale V3
(`0x2A6cFc76906e758B934209AFf5A163c9bC20132E`), each signed from its own wallet, each
proof folding to the immutable on-chain V1_MEMBER_ROOT.

**Consequence: the "armed historical wallets" risk is EXTINCT.** No wallet can mint a
duplicate seat by buying anymore. All eight genesis members are now known to the live
engine. The C1.3 client gate on /join has nothing left to block (it stays as belt-and-
braces; every verdict now reads `claimed`).

## The claims (block · time GMT · tx anchor)

| Seat | Wallet | Block | Time | Tx |
|---|---|---|---|---|
| #1 | 0x244531C571966f90f4849e03a507543d90f9C721 | 90252025 | 01:58:58 | 0x335e4a369c4cc5009f344c189106c578c35915f9a663ac10294cc5eda94fcc4b (SUCCESS proven by logs: HistoricalMembershipRecognized(wallet, 1) + V1MembershipRecognized) |
| #2 | 0x3488857b003104e2B08A1D198f8a23BFF28B0045 | 90253201 | 02:19:06 | 0xa2ee4…5cb67a9 (partial anchor; success read from gas profile ~95k) |
| #3 | 0x03E99f09f0FC8D04864466bc37fd73Dd7ba3C6d0 | 90253333 | 02:21:18 | 0x356fa…347aaa7 (partial; ~95k profile) |
| #4 | 0x3b1396B1ff61b79C742751CfB6f0f04eAc25Ec6a | 90253412 | 02:22:40 | 0x8315d…6df5380 (partial; ~95k profile) |
| #5 | 0x5734C19D1907857d1e54F95D12300e2fc7B0C2cD | 90253517 | 02:24:28 | 0x43bcf…dc7835c (partial; ~95k profile) |
| #6 | 0x8DeB56b4db62f48A6E1bC226220E24845B592Cb9 | 90253565 | 02:25:17 | 0xd241f…e18f63b (partial; ~95k profile) |
| #8 | 0xAb87e74Ff69Ee0B6C1A73B884a80b737988DE081 | 90253707 | 02:27:39 | 0xeb949…6de90d1 (partial; ~95k profile) |

- Seat **#7** (the duplicate, Chronicle Entry 1): nothing to claim — knownMember already
  true (holds seat #11); a claim reverts `AlreadyKnown`; `memberByNumber[7]` stays empty
  in the register forever. That permanence is itself part of the story.
- Harmless duplicate attempts that day: 4 extra sends from #1's wallet and 1 from #4's,
  each reverting `AlreadyKnown` at ~25.5k gas — the contract refusing politely.
- Verification method note: #1's success is event-proven; #2–#8 successes were read from
  the unambiguous gas-fee profile (successful claim ≈ 95k gas with storage writes +
  2 events, vs `AlreadyKnown` revert ≈ 25.5k). Before writing the final entry, resolve
  each partial anchor to its full hash and confirm the HistoricalMembershipRecognized
  event per tx (one Avascan LOGS read each, or the event indexer once claims are indexed).

## Human context (founder-side, for the storyteller — filter per register discipline)

- The founder walked the rail himself, wallet by wallet, through the explorer's write
  interface — seven signatures in 29 minutes, the proofs supplied from the freeze
  artifact (`artifacts/studio/src/lib/historicalMembers.ts`, verified against the live
  root by the /join gate before the first signature).
- The first attempt LOOKED like a failure (MetaMask resubmissions reverting
  `AlreadyKnown`) — until the transaction LIST showed the very first send had succeeded.
  Lesson lived: read the history before debugging a single failure.

## Possible entry titles (founder's call)

- "The day the founders claimed their seats"
- "Seven signatures in twenty-nine minutes"
- "The register learns its own genesis"
