# THE VISIBILITY LAW

**TIER-0 · Founder-authored · Binding on every agent, every session**

## ON A CHAIN, "HIDING" DOES NOT EXIST.
## There is only MAKING LEGIBLE, or MAKING TEDIOUS.

Every address, transaction, and amount is ALREADY public. Not showing it protects NOBODY — it
only makes our product less useful than the explorer.

## WE HIDE NOTHING. WE REFUSE TO FABRICATE WHAT THE CHAIN DOES NOT HAVE.

What is forbidden is NOT the ADDRESS. It is the NON-CONSENSUAL LINK between a wallet and a PERSON.

FORBIDDEN — we do not fabricate it:
  · A DIRECTORY ("give me a wallet, I tell you its seat") · A SEARCH · A REVERSE INDEX
    (seat → wallet) · A forced link wallet ↔ real identity · Exposing a NON-CONSENTING member

ALLOWED — the chain already publishes it:
  · INFRASTRUCTURE addresses — Vault, Liquidity, Operations, SourceRegistry, Sale, Token
  · Any address the chain EMITS in an event (sourceWallet, buyer, recipient in
    MembershipPurchasedV3)
  · YOUR OWN transaction — including the wallet that pays you and the one you pay
  · An address the buyer MUST see BEFORE SIGNING
  · Whatever a member CHOOSES to publish (opt-in self-publish)

## TWO DISCIPLINES. DIFFERENT ON PURPOSE.
THE SERVER emits no MEMBER address — not out of modesty, but because NO DIRECTORY EXISTS TO EMIT.
  member-standing = own-row only. Source registry = two booleans. UNCHANGED.
THE CLIENT reads the chain like an explorer — because THE CHAIN IS PUBLIC.
  These are not contradictory rules. They are two LAYERS with two ROLES.
  The server refuses to FABRICATE. The client refuses to HIDE.

## INFRASTRUCTURE ADDRESSES ARE NOT MEMBER ADDRESSES
Vault, Liquidity, Operations, Registry, Sale, Token — THEY ARE NOBODY'S WALLET. THEY ARE PIPES.
A pipe MUST be verifiable, or "don't trust, verify" is an empty slogan.
An amount without a verifiable destination is "trust me." That is the opposite of this product.

## THE DEFAULT
The default is the AGGREGATE — for UTILITY, never for SECRECY. Convenience, never concealment.
A member becomes visible BY HIS OWN CHOICE. Never by default. Never without consent.

## THE COROLLARY — what the guard's name got wrong:
##   WHAT PROVES IS PUBLIC. WHAT GRANTS ACCESS IS A SECRET.
##   A contract address PROVES. An RPC token GRANTS ACCESS. They are not the same thing.

## THE FIVE QUESTIONS, IN ORDER
1. Is this already public on-chain? → If yes, hiding it protects nobody.
2. Am I FABRICATING a link the chain does not have? → FORBIDDEN.
3. Is this a PERSON's address, or a PIPE's? → A pipe is always published.
4. Does the user need it to VERIFY before acting? → SHOW IT.
5. Am I exposing someone who did not consent? → FORBIDDEN.
