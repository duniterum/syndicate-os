# INVARIANT vs STATE — the anti-drift law

**TIER-0 · Founder-authored · Binding on every agent, every session**

## Why this exists

Across six rebuilds the same failure repeated, and it was never technical:

> An agent hesitated to build → it wrote *"this does not exist" / "not authorized" /
> `FUTURE_MODULE`* into the repo → that sentence became canon → the next agent read the
> canon and hesitated to build → **rebuild.**

The agent's own caution got laundered into the founder's law. Nobody decided this. It
accumulated. This document ends it.

## The law

Every statement in this repository — canon docs, code comments, registry `notes`, panel
copy, TruthLabels — is exactly one of two kinds.

### `INVARIANT` — a rule
A promise about **how** the protocol behaves. It constrains *how* things are built, never
*whether* they are built.
- **Only the founder writes or changes an INVARIANT.**
- An agent may cite one and must obey one. An agent may **never author** one.
- If an agent believes a new invariant is needed, it **proposes** it and stops.

### `STATE` — a description
A record of **what exists today**. A photograph, not a fence.
- **Any slice may make a STATE obsolete.** That is what building *is*.
- The slice that changes reality **must update the STATE line in the same commit.**
  A stale STATE is a defect of the same family as a stale on-chain figure.
- **No agent may treat a STATE as a closed door, a permission gate, or a reason not to
  build.**

## The rule that kills the loop

> **A description of the current state is never a permission to be requested.**
> Building means changing the state, then updating the description.
>
> "X does not exist" is not "X may not exist."
> "This app never sends a transaction" is not "This app must never send a transaction."
> `FUTURE_MODULE` is a label, not a lock.

## Worked examples — all real, all currently in this repo

| Sentence | Kind | Meaning |
|---|---|---|
| "The seat number must be read from the emitted event, never inferred." | **INVARIANT** | Binding. |
| "`approve` is not payment. Membership is confirmed only by a purchase receipt." | **INVARIANT** | Binding. |
| "Fail-closed: no figure is ever invented." | **INVARIANT** | Binding. |
| "No wallet PII, no member directory, no lookup of another wallet." | **INVARIANT** | Binding. |
| "No financial-upside framing." | **INVARIANT** | Binding. |
| "This app never sends a transaction." (`moduleRegistry.ts` → `membership-join.notes`) | **STATE** | True yesterday. The checkout slice makes it false and rewrites it in the same commit. Not a gate. |
| "No packages, pricing, checkout, or placements exist." (`panels.tsx` §5) | **STATE** | True until the commit that creates them. Not a gate. |
| `FUTURE_MODULE` / `PENDING_ADAPTER` / "Canon Vendored, Wiring Pending" | **STATE** | Honest labels for today. Not gates. |
| `requiresApproval: true` | **STATE — superseded** | `GRAND_RECONCILIATION_AND_CARTE_BLANCHE` pre-authorized Phases 1–10. Standing approval exists. This field records review strictness, not a missing permission. |
| "MembershipSaleV3 — V3 CANDIDATE (not deployed, not activated)" (`MembershipSaleV3.sol` line 4; same header in `SourceRegistryV1.sol`) | **STATE — STALE** | Both contracts **are deployed and live** — seats #9–#12 came out of V3. The header is a photograph taken before deployment that nobody updated. It is not a gate. |

## Authoring rules for agents (binding)

1. **Never write a prohibition.** Say what *is*, not what *may not be*. "Not built yet" —
   never "must not be built."
2. **Never invent a gate.** If uncertain whether to build, **ask the founder in session.**
   Do not encode hesitation in a file. A file outlives the doubt.
3. **When you change reality, update its description in the same commit.** Registry
   `notes`, panel copy, TruthLabels, CTA labels. A shipped feature with a stale
   description is an incomplete slice.
4. **Cite the kind.** When a repo statement blocks you, name it: *"this is a STATE, not an
   INVARIANT — proceeding and updating it."* If you believe it is an INVARIANT and it
   blocks a founder instruction, **stop and say so, with file and line.**
5. **BUILD ≠ GO-LIVE.** Building is pre-authorized. Turning a thing on in production is a
   separate, explicit founder act. Never conflate the two, in either direction.

## The distinction that must never be collapsed

| | `enabled` (governance) | `posture` (proof) |
|---|---|---|
| Question | Does this module exist for users? | Are its figures proven? |
| Who decides | **The founder.** A decision. | **The chain / the server.** Derived at render. |
| Hardcoded literal allowed? | **Yes** — a decision may be written down. | **Never.** Fail-closed to "unavailable." |

A module that is `enabled` but whose proof source fails **must appear and say so
honestly**. A module that is not `enabled` appears nowhere. Conflating these two
reintroduces the exact stale-figure disease this protocol exists to refuse.

*Nothing here weakens any invariant. Honesty about what is real is the product. This
document only refuses to let an agent's caution masquerade as the founder's law.*
