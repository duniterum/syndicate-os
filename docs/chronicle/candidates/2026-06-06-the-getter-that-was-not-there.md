# The getter that was not there

- **id**: `2026-06-06-the-getter-that-was-not-there`
- **dateUtc**: 2026-06-06
- **status**: CANDIDATE — verified, NOT promoted. The Founder has not read it on screen.
- **harvest**: harvest-1 · confidence: sourced-verbatim

> Harvested from the origin repository `duniterum/TheSyndicate` on 2026-07-26 and put through an
> adversarial verifier instructed to REJECT it. Sources were fetched, figures recounted from their own
> source, and the verify instruction was FOLLOWED literally before this text was allowed to survive.

## The record

On 2026-06-06 the protocol's artifact contract went live on Avalanche C-Chain and the site was wired to read it. The contract answered. The site did not.
The fault was not on the chain. The site carried an older description of the contract's interface and asked for the artifact's state by a name the deployed contract does not carry, while a second, correctly named reading function returned that same state without complaint. Two other reads against the same contract — remaining supply, and whether a given wallet was still eligible — kept working throughout, so one part of the surface failed while the rest looked healthy. The protocol's own note records that the identical call succeeded from a developer console: the console had been given the deployed contract's real interface, and the site had not.
A second read fault of the same family was found the same day. Before a visitor connected a wallet, the eligibility gate asked the contract whether the empty address could mint; some Avalanche nodes reject that question even when the artifact is open. A live artifact could present itself as closed.

## What the protocol did

It changed the site, not the record. The interface was corrected to the deployed contract's own names, the returned values were mapped by position, and the cause was written down as a root cause rather than filed as a patch.
The second fault was fixed at the gate rather than at the symptom: the question about the empty address was removed from the opening check and kept only for a wallet that is actually connected, and the surface was changed so that a failed read shows as a failed read — a retry and a link to the contract — instead of switching the artifact's status off. The protocol's note states the standing rule that came out of it: the artifact no longer flips to inactive when reads transiently fail.

## Why this is recorded

The protocol's stated hierarchy is that the chain outranks the code and the code outranks the documents. This is the day that hierarchy cost something. A file in the repository claimed to describe a contract, the contract disagreed, and the contract was right.
Nothing on-chain had to be corrected, because nothing on-chain was wrong — which is why the failure is still reproducible today. Anyone can put the old question to the deployed contract and watch it refuse, then put the correct one and watch it answer. A record that can still be re-run is worth more than a record that has to be believed.

## Verify

The artifact contract is 0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d on Avalanche C-Chain (43114), and both halves of this record are still readable. Call getArtifact(1): it reverts, as it did then. Call getArtifactCore(1): it returns the artifact's state, including max supply 10,000, wallet limit 5, and a price of 500000 in USDC's six-decimal units — 0.50 USDC — the same values the 2026-06-06 note recorded. One figure has moved, as it should: that note recorded 0 minted; a read at block 91,290,629 returns 11, and remainingSupply(1) returns 9,989, which is 10,000 less 11. Don't trust — verify.

## Source

https://raw.githubusercontent.com/duniterum/TheSyndicate/main/docs/PRODUCTION_LOCK_CHECKLIST.md (21,775 B; the document is dated 2026-06-06). ORIGIN'S OWN WORDS, section 'Archive1155 read mismatch fix (2026-06-06)', quoted verbatim: "Root cause: stale frontend ABI/read path called `getArtifact(uint256)`, but deployed Archive1155 exposes `getArtifactCore(uint256)` and `getArtifactText(uint256)`. Remix succeeded because it used the deployed getter; the site failed only on the stale getter while `remainingSupply` and `isMintable` continued to work." · "Fix shipped: ABI + hook now call `getArtifactCore(1)` and normalize the returned tuple by index." · "Direct RPC evidence: `getArtifactCore(1)` returns active/frozen/on-chain SVG, `maxSupply=10000`, `walletLimit=5`, `priceUsdc=500000`, `minted=0`; stale `getArtifact(1)` reverts." The second fault, section 'Founder Mint Readiness (final pass)', verbatim: "Zero-address `isMintable(id, 0x0, 1)` preflight removed from the eligibility gate. Some Avalanche RPC nodes revert on the zero-address path even when the drop is live" · "ID 1 no longer flips to inactive when reads transiently fail." · "Read-error path shows a recovery panel with Retry + 'View contract ↗' rather than a dead disabled button." Deployment anchor, same file, section 'Archive Contract — Deployed (2026-06-06)': "Contract: `SyndicateArchive1155` at `0xB2AE1eb7aAf7577182e616DA497E0BC822E7D54d` on Avalanche C-Chain." MY OWN PROSE: all three section bodies are mine; every fact in them traces to the quotes above or to my own chain reads. MY OWN MEASUREMENT (Avalanche C-Chain 43114 via api.avax.network, head block 91,290,629): getArtifact(1) reverts; getArtifactCore(1) returns nine words decoding to 10000 / 5 / 500000 / 11 in the positions the origin named maxSupply / walletLimit / priceUsdc / minted; remainingSupply(1) = 0x2705 = 9,989. I did NOT verify the names of the first five returned words and make no claim about them.
