# Handoff — 2026-07-12 · The duplicate seat + the historical gate (URGENT)

**Read FIRST after `docs/SESSION_STATE.md`.** A production duplicate seat exists on-chain, and the
gate that would have prevented it is NOT built. Chain read as provenance. Everything below is
INDEPENDENTLY VERIFIED live against MembershipSaleV3 `0x2A6cFc76…132E`.

## THE FINDING — a duplicate seat already happened, on mainnet
- **`memberCount()` = 12 · `GENESIS_OFFSET` = 8 · nextSeat 13.** The constructor sets
  `memberCount = genesisOffset` but does NOT populate `knownMember`/`memberNumberOf`. So the 8
  historical members are a NUMBER, not people on V3, until they call `claimHistoricalMembership`.
- **`memberByNumber(1..12)`:** seats **#1–#8 are ALL EMPTY (0x0)** — zero historical members have
  claimed. Seats #9–#12 = the 4 V3 buyers (`0xDDF3…2BD0` #9, `0x620f…C75F` #10, `0x3FF0…894F` #11,
  `0x32B2…CE66` #12). STATE proves 0 claims (a claim would permanently populate `memberByNumber` +
  `knownMember`) — no lossy log scan needed; state is dispositive.
- 🔴 **THE DUPLICATE: historical member #7 = `0x3FF01A0c3e70101bFb1dBb3742e135E7eD9e894F` = seat #11.**
  Live: `knownMember(0x3FF01A0c)` = **TRUE**, `memberNumberOf` = **11**. He bought on V3 WITHOUT
  claiming and got seat #11. He holds TWO numbers: historical #7 (roster/root, unclaimed) AND V3
  seat #11 (contract). **Irreversible. Already done, in production.**
- **7 historical still ARMED** (`knownMember=false`): #1,#2,#3,#4,#5,#6,#8. **The FOUNDER himself
  (`0x88EC79AF0d5A2F3b83022A1770c645506803Dd73`) is armed** (`knownMember=false`). If any armed
  wallet buys before the gate ships → another duplicate.
- **Distinct wallets = 11** (8 historical + 4 V3 buyers − 1 overlap `0x3FF01A0c` is both #7 and #11);
  **`memberCount()` reports 12.** The public site says "12 MEMBERS" → off by one, on a protocol whose
  doctrine is "no invented figure, ever."

## THE TWO ARTIFACTS — one right, one poison
- ✅ **RIGHT (V3): `TheSyndicate/src/lib/v3-historical-members.ts`** — root
  `0x6d81a73621dc9e4fd328b56aef67f98a8e4dde8e2adb68d85b9b87b8685f3329` = **EXACTLY the live V3
  `V1_MEMBER_ROOT()`** (verified). Carries all 8 wallets WITH member numbers (the shape V3's leaf
  needs). Its own header (months old) already said: *"V3 direct buys currently use an empty proof and
  claimHistoricalMembership is not wired into the public UI, so the frontend MUST FAIL CLOSED for
  these wallets."* **Someone saw it. Nobody built it.** The 8 wallets: #1 `0x244531C5…9C721` · #2
  `0x3488857b…0045` · #3 `0x03E99f09…C6d0` · #4 `0x3b1396B1…Ec6a` · #5 `0x5734C19D…C2cD` · #6
  `0x8DeB56b4…2Cb9` · #7 `0x3FF01A0c…894F` (THE DUPLICATE) · #8 `0xAb87e74F…E081`.
- 🔴 **POISON (V2b, NOT V3): `TheSyndicate/src/lib/v1-proof.ts`** — root `0xa1f2ed…8c49` (≠ V3), only
  **5** wallets, and leaf encoding `["address"]` **address-ALONE**. V3's `_verifyHistoricalMember`
  uses `keccak256(bytes.concat(keccak256(abi.encode(who, memberNumber))))` — **address + NUMBER**. So
  even if the root matched, the LEAF FORMAT would not. **`v1-proof.ts` is the V2b artifact; it MUST
  NEVER be used on any V3 path** — it would fail every V3 verify.

## Archive1155 — NO connection to sale membership
Read from `MembershipSaleV3.sol`: `knownMember` is set ONLY in `_recordPurchase` (a buy) and
`_claimHistoricalMembership`. No Archive import, no hook. Minting the $0.50 artifact does NOT make a
wallet "known" to the sale. (Archive1155 is a separate ERC-1155.)

## THE FOUNDER'S DECISION (settles "should the 8 claim?")
**We do NOT fix the number silently. We SHOW BOTH and EXPLAIN — a readback, not an excuse:**
> 12 seats issued · 11 distinct wallets · one wallet holds two seats — a V2b member who bought again
> before the claim gate existed. [Verify on-chain]

This protocol was built IN PUBLIC, on mainnet, deliberately — errors dated, signed, impossible to
erase. The duplicate is not a bug to hide; it is the PROOF the protocol tells the truth even when the
truth is inconvenient. "Anyone can claim transparency when everything is clean. He proves it when it
is not."

## BUILD ORDER (verify each yourself first — chain is authority)
1. ~~**C1.3 — THE HISTORICAL GATE. Urgent. Blocking. C2 does NOT ship before it.**~~ ✅ **SEALED in
   prod** (`a019152`, Replit-verified + live-domain checked; syndicate-os: `lib/historicalMembers.ts`
   + `chainReads.ts` reads + `wallet/JoinHistoricalGate.tsx` on `/join`; live-chain verified — see
   SESSION_STATE). C2 must re-consult `resolveHistoricalGate` before enabling any buy.
   - Root + set: `v3-historical-members.ts` (root VERIFIED against live V3).
   - Leaf: `abi.encode(who, memberNumber)` — address + number, NOT address-alone.
   - Read `knownMember[wallet]` LIVE (reuse `lib/chainReads.ts`). Historical + NOT known → **BLOCK the
     buy**: "Claim your seat first." → route to `claimHistoricalMembership`. Fail closed: cannot load or
     Merkle-verify → BLOCK, never guess.
   - ⚠️ The contract checks `knownMember[RECIPIENT]`, not `[buyer]`. When gifting lands, the check runs
     on the RECIPIENT. Note it in the code now.
2. **NEUTRALIZE `v1-proof.ts` as V2b-only** — wrong root, wrong leaf shape, wrong contract. Forbidden on
   any V3 path. Say so in the file; guard it if possible.
3. **THE HONEST READBACK** — "12 seats / 11 distinct wallets / one overlap", DERIVED from the chain
   (`memberCount` + a distinct-wallet count), with a verify link. NEVER a literal.
4. **A CHRONICLE CANDIDATE** — "how we built in public, and what it cost." ⚠️ Promotion is a HUMAN ACT.
   Prepare the candidate; the founder promotes it.

## Status when this handoff was written
92% context. Verified all of the above on-chain (this session). Did NOT start C1.3 — a safety-critical
Merkle gate must not be rushed at 92%. NEXT SESSION builds C1.3 first (everything needed is in this
handoff + `v3-historical-members.ts` + `lib/chainReads.ts`). The read-only checkout C1.0–C1.2b is done
+ live; C1.3 is the last safety gate before C2 (approve→buy) can ever ship.
