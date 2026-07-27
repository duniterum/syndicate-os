# CHAIN-READING DOCTRINE — how this protocol asks the blockchain questions

> **Status: CANON.** Engraved 2026-07-27 as `THE CHAIN-READING LAW` in `CLAUDE.md`.
> Origin: the founder's question, after watching a lane walk 1.34 million blocks —
> *« comment le système rattrape ? pourquoi il ne lit pas … pour le bloc exact et met en cache …
> pourquoi sans arrêt chercher ? nous ne sommes pas un RPC service. »*
> He was right. Every session reads this before adding or changing a scan lane.

---

## §0 — THE ONE-PARAGRAPH ANSWER

A blockchain node stores **blocks, not answers**. It keeps no index by wallet, so the only
question it can answer is *"show me events of this shape between block A and block B"* — it
filters as it walks. An **indexer** (an explorer's account API) has already done that walk for
the whole chain and stored the result, so it answers *"what has this address ever touched?"*
instantly. **History is immutable and therefore ASKED, once. The tail can still change and is
therefore WATCHED, from our own node.** Using one tool for the other's job is the mistake this
document exists to prevent.

---

## §1 — THE TWO MODES, AND WHEN EACH IS CORRECT

| | **BACKFILL (history)** | **TAIL (live)** |
|---|---|---|
| What it covers | the floor block → a safe distance behind the head | that safe distance → the head |
| Can the data still change? | **No.** Finalized history is immutable | **Yes.** A reorg can orphan recent blocks |
| Correct source | an **INDEX** — one call per address, complete | **our own node**, `eth_getLogs`, small windows |
| Reorg handling | **none needed** | required: stay a margin behind the head, re-read a small overlap |
| Cost shape | one-time, tiny | per-cycle, tiny |
| Third party in the path? | only to say WHERE to look (see §2) | **never** |

This split is not our invention. It is the standard production pattern, and our own RPC provider
sells it as a product: QuickNode Streams takes a historical range, delivers it, then continues
into the live stream, with `keep_distance_from_tip` for reorg safety and elastic batching as it
approaches the tip. See §6.

---

## §2 — THE CLAUSE THAT KEEPS THE HONESTY CONTRACT

**The index says WHERE to look. Our node says WHAT IS THERE.**

An index is a third party. This protocol publishes receipt-backed claims, so no *figure* may rest
on a third party's word. The resolution is a division of labour, not a compromise:

1. Ask the index which **transactions** involve our wallets. It is allowed to be wrong by
   omission or by noise — we verify everything it returns and nothing it says is published raw.
2. Read those few transactions from **our own node** (`eth_getTransactionReceipt`,
   `eth_getTransactionByHash`) for the authoritative detail: the real log index, the real signer,
   the real amounts.
3. Publish only what step 2 produced.

The cost is nothing — the transactions that matter are a handful — and it removes the trust
transfer entirely. A hundred receipts from our node beat a million-block walk *and* beat trusting
an explorer's numbers.

---

## §3 — READ ONCE, STORE FOREVER

- A **persisted cursor** per lane; a block that has been read is never read again.
- **Idempotent writes** (`onConflictDoNothing` on `(chainId, transactionHash, logIndex)`), so a
  re-read can never duplicate.
- The cursor advances **only past rows actually persisted** — never past rows that were dropped,
  skipped or unresolved. Converging slowly beats converging with a hole.
- A small **reorg overlap** on the tail only. Backfill needs none: finalized history cannot move.

## §3b — THE TRAPS THIS LANE FAMILY HAS ALREADY FALLEN INTO

Each of these was a real defect, found by review, in one day. They are listed so they are not
rediscovered:

- **A synthetic log index that collides with a real one.** The dedup key does not contain the
  stream key, so a native/index-sourced row must live in a reserved numeric space far above any
  reachable real log index — and the FEED ROUTE's cursor shape must accept that width.
- **A cursor advanced on someone else's clock.** Rows from an index, a cursor set to the *node's*
  head: the lane certifies as covered a range the index had not read. Stop short of the head by
  more than any observed indexer lag.
- **A fail-closed throw with no exit.** Refusing a malformed row is right; refusing to continue
  the window is not. One spam ERC-721 to a published wallet must never halt a lane.
- **A hold whose test disagrees with the builder's test.** Two rules that must be identical,
  written twice, will diverge. Export one function; import it in both places.
- **A page size assumed rather than measured.** An explorer that silently truncates at its default
  page turns "read the window" into "read a prefix". Ask for an explicit page size and fail LOUD
  when the answer fills it.

---

## §4 — WHAT EVERY LANE MUST DECLARE

Every scan lane declares, in code, which mode it uses and why. `backbone.guard` pins that the
declaration exists. A lane that **walks** deep history carries a written reason for why no index
could answer its question — for example: *"no index exposes this event shape"*.

Current lanes:

| Lane | Backfill mode | Why |
|---|---|---|
| curated treasury (USDC · SYN · BTC.b · WETH.e), burns, lifecycle, LP, archive | **walk** | one pinned contract each, narrow topic filter, floors already close to the data |
| `TREASURY_AVAX` (native) | **index** | native AVAX emits no log at all — `eth_getLogs` is structurally blind; only an account API can see internal value transfers |
| `TREASURY_DISCOVERED` (any bought asset) | **index → node** | the contract is unknown by definition, so a walk means every contract on the chain; the index names the transactions, our node supplies the detail (§2) |

---

## §5 — THE SMELL TESTS

Before adding or changing a lane, ask:

1. **"Am I walking to rediscover something already indexed?"** If an explorer can answer it in one
   call, walking is waste — and waste at this scale is measured in hours of catch-up.
2. **"Is a published figure resting on a third party?"** If yes, re-read it from our node.
3. **"Does my cursor certify blocks someone else has not read?"**
4. **"Can one cheap external action stop this lane forever?"** (A dust transfer. A spam NFT.)
5. **"Would this rule be caught if someone deleted it?"** If not, it is not a rule yet.

---

## §6 — SOURCES (read 2026-07-27, not remembered)

- QuickNode — *Blockchain Data Backfilling*: <https://www.quicknode.com/docs/streams/backfilling>
  (historical range + continue-into-live, `keep_distance_from_tip`, elastic batch at tip)
- Allium — *Blockchain Indexing Explained*:
  <https://www.allium.so/blog/blockchain-indexing-explained-how-onchain-data-becomes-queryable/>
- AWS — *Building a blockchain indexer*: <https://aws.amazon.com/blogs/web3/building-a-blockchain-indexer-on-aws/>
- Alchemy — *What is a blockchain indexer?*: <https://www.alchemy.com/overviews/blockchain-indexer>

Consensus across all four: backfill and live tail are **different problems**; backfill syncs
finalized blocks and needs no reorg handling; the live path stays a distance behind the tip and
handles reorgs; checkpoint the cursor and write idempotently.
