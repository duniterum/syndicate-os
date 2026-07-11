# ORIGIN RECLAMATION LEDGER — what the origin engineered better, and what we reclaim
*DIRECTION doc, TIER-0 (read every boot). Founder is the authority; only LEGAL + SECURITY +
TRUTH-FIRST bind. Written 2026-07-11 from a disk-level audit of the origin `TheSyndicate`
(`src/lib/protocol-knowledge-map.ts`, `src/routes/knowledge-map.tsx`, `src/components/syndicate/
PagePurpose.tsx`, `src/lib/__tests__/*`) against `syndicate-os`. Companion to `SETTLED_RULES`,
`GAMIFICATION_LEGAL_DOCTRINE`, `LIVING_ORGANISM_MASTER_PLAN`.*

**Why this doc exists (anti-entropy):** this analysis was produced in a chat. Across the previous
five rebuilds, exactly this kind of engineering insight was the thing that got lost — not features,
not aesthetics. Committing it to canon is the fix. If it is not written here, it does not exist.

---

## 1. The refined verdict — enforcement did not THIN, it changed ALTITUDE

The founder's thesis (the origin was better *engineered*; we lost it) is **confirmed, sharpened.**
The loss is precise and narrow:

- **syndicate-os enforces VALUES-doctrine better than the origin** — a server-side fail-closed spine
  that never emits an address, `publicSafe` filtering, prerender/SSG + real 404, and **11 BLOCKING
  guards** in the release gate. These block the build.
- **The origin encoded EPISTEMIC doctrine that we never ported** — a code registry that declares its
  own precedence over the docs ("THIS FILE WINS"), taxonomies for *what a data home cannot prove*
  (coverage) and *whether it is truth or a cache* (permanence), and non-live statuses that **must
  cite an on-disk evidencing file**, kept honest by tests.

So doctrine about **values** (no yield, no fake-live, no address) is strong here; doctrine about
**epistemology** (coverage / permanence / precedence / lifecycle) migrated into PROSE
(`SESSION_STATE` + the direction docs) and into **zero tests** (confirmed: 0 `*.test.ts` across
`artifacts/`; no vitest/jest — and we will NOT add one; honesty ships as a **blocking guard**, our
established model).

## 2. The operative law — ENFORCEMENT IS BOUNDED BY VOCABULARY

**A guard cannot catch a fake it has no word for.** Our guards are not weak; they are **blind where
the language is missing.** At the figure level on public surfaces our vocabulary is **single-axis —
readiness** (live chain read vs `PENDING`). Two axes are absent:

- **FRESHNESS** — `live-per-load` vs `served-but-frozen (snapshot)` vs `stale`. A served snapshot
  figure has **no honest label available**, so it has no choice but to masquerade as live.
- **COVERAGE** — what a home *cannot* prove (`deployment-anchored` can answer "first ever";
  `bounded-window` cannot; a point-in-time read has `none`).

This is the real loss across the rebuilds: **not features — WORDS.** Reclaiming the epistemic layer
is reclaiming vocabulary, and the guard that enforces it.

## 3. The good news — the SERVER ALREADY HAS THE VOCABULARY

This is not a lie to fix; it is a **truth to publish.** `artifacts/api-server/src/lib/protocol/
holderIndexStanding.ts` maps a live-engine `memberNumber` into **exactly one** snapshot era **or
fails closed**, and explicitly handles *"live engine is ahead of the verified snapshot → `STALE`,
never guessed into an era."* It carries `VERIFIED_IN_SNAPSHOT`, `snapshotHash`, `freezeBlock`,
per-era authority (**dual authority: #1–8 freeze/root, #9+ V3-emitted, never collapsed**), and an
address-safety gate. The snapshot itself (`holderIndexSnapshot.ts`) is `status:"VERIFIED"` with
`freezeBlock` + `builtAt` + `snapshotHash`. **The engineering is more honest than the public
surfaces can express.** `/knowledge` is the surface that gives the public the words the server
already has — its flagship content is the **dual-authority + STALE-divergence** model (aggregate /
era level only — no wallets, no roster, no linkage).

## 4. Audit finding (#4) — a frozen figure under a live signature → OVERCLAIM

**Question:** does any surface render a frozen/snapshot member figure under a live "as of {ts}"
signature? **Answer: yes.**

- The Holder Index member count is a **served snapshot** — `builtAt: 2026-07-03`, `freezeBlock:
  88496414` (`holderIndexSnapshot.ts`).
- It renders under a **live** provenance on three surfaces, sharing a card/section with genuinely
  live figures:
  - `pages/Faq.tsx:85` — "Recognised seats" inside the **"Live · read from Avalanche"** hero pill.
  - `pages/Whitepaper.tsx:101` — "Recognised seats today" in a **"VERIFIED"** section.
  - `components/hero/ProtocolOverviewPanel.tsx:45` — the homepage KPI grid.
  - all carry `LivingSignature` = *"read live from Avalanche · as of {reality.asOf}"* (the LIVE spine's
    timestamp, e.g. 2026-07-11) — so a days-old frozen figure wears a live timestamp.
- `guard-no-fake-live` cannot catch it: it bans the literal token `>Live<`, and has **no concept of
  freshness-provenance** (the vocabulary gap of §2, proven).

**Consequence (pre-committed decision tree):** the **liveness fix lands FIRST**. We do not publish a
truth-map (`/knowledge`) while a surface misstates.

**CORRECTION (founder, 2026-07-11) — the fix is to make the figure LIVE, not to label the snapshot.**
`memberCount()` is already served LIVE in the reality envelope (`financial.members.memberCount`,
`financialDecoders.ts:12,24` selector `0x11aee380`, `realityService.ts:1368-1385`, LIVE_CHAIN_RPC).
Labelling a frozen number makes it honest; reading it live makes it TRUE — and it restores the
snapshot to its real job (era attribution + verification, the dual authority). **We turned a
verification instrument into a headline number; the fix reverses that.** See §11 for the composite.

> **STANDING RULE — NO SNAPSHOT FOR A LIVE-READABLE FIGURE.** Direct extension of "no PENDING for a
> readable figure." If a figure has a live source in the reality envelope, a served snapshot value may
> NOT stand in for it on a public surface. The freshness guard enforces this (§11).

**And note, because it proves §2 concretely:** `guard-no-fake-live` is a **literal string check** — it
bans the token `>Live<` as a JSX text node (`FAKE_LIVE_RE = />\s*(LIVE|Live|Online|Active)\s*</`). It
has no concept of freshness-provenance, so it could not see this overclaim. The guard was not weak; it
had no word for the fake. Add the word, then the guard can see it.

## 5. The 9 mechanisms — reclamation ledger

Verdict: KEEP-AS-IS · RECLAIM · REFUSE. Evidence cites origin `protocol-knowledge-map.ts` (PKM) and
syndicate-os files.

| # | Mechanism | Origin evidence | syndicate-os | Verdict | Size |
|---|---|---|---|---|---|
| 1 | Precedence encoded ("THIS FILE WINS") | PKM:9-12 (cites `docs/canon/00_AUTHORITY_MAP.md`) | prose only (`00_CANON_INDEX`, `SESSION_STATE`) | **RECLAIM** (descriptive-truth scope only) | ~15 ln |
| 2 | Coverage model (what a home CANNOT prove) | PKM:40-46 | absent | **RECLAIM (lean, dual-era)** | 1 type + data |
| 3 | Permanence + "cache, not truth" | PKM:32-38 | absent (`truthStatus.ts` = lifecycle, not permanence) | **RECLAIM** | 1 type + data |
| 4 | Evidence-cited statuses + honesty test | PKM:80,92-93; `__tests__/protocol-knowledge-map.test.ts` | blocking guards enforce copy/label/structure; **no evidence-cite check; 0 tests** | **RECLAIM — as a BLOCKING GUARD** (crown jewel) | ~50-70 ln guard |
| 5 | `notAuthorityFor` + fact lifecycle (proof ≠ activation) | `KNOWLEDGE_FACT_LIFECYCLE` | prose in `SETTLED_RULES` | **RECLAIM data (2.5)** · **DEFER enforcement (Phase 3–6)** | data now |
| 6 | Doctrine-as-data from ONE source | PKM `ANTI_FRAGMENTATION_RULES` rendered from array | **present**: `seo-jsonld.ts` + `seo-faq-jsonld.ts` (one builder → prerender + runtime) | **KEEP / generalize** | ~0 |
| 7 | `PagePurpose` "distinctions" (declare what it is NOT) | `PagePurpose.tsx` | prose "link, don't duplicate" + ad-hoc CTAs | **RECLAIM (tiny atom, ~30 ln)** | ~30 ln |
| 8 | Doctrinal invariants in CODE (S2 cap; member-subjects-forbidden; held-never-invented) | `protocol-event-registry.ts`, PKM rule 3 | values in code (spine, `guard-safe-source`, no-address); structural in `SETTLED_RULES` prose | **KEEP values · DEFER structural (Phase 3–6)** | later |
| 9 | Purity leaf + Adjacency Law | PKM:28-30 | `seo-route-registry.ts` is dependency-free (only confirmed leaf) | **RECLAIM leaf · REFUSE full Adjacency Law** | ~0 + 1 rule |

## 6. What syndicate-os does BETTER — must NOT regress

- **Server-side fail-closed spine + `publicSafe` + zero-address payload** (`artifacts/api-server`) —
  vs the origin's client-side RPC reads and config-exposed addresses. Verified live each slice.
- **prerender/SSG + real 404** (`scripts/prerender-routes.ts`) — vs the origin SPA.
- **11 BLOCKING guards** in the release gate — they fail the build.
- **The `living/` chassis** (build-once / compose) — reuse discipline.
- **Operator hard-gate** strips console code from the production bundle (`operatorPreviewGate`) — a
  real security property the origin's `/labs` sprawl lacked.
- **`no-raw-color` 0/blocking** + the fluid `.type-*` scale.

Any reclaim must not reintroduce client-side reads-as-truth, addresses in data, or optimistic
statuses.

## 7. REFUSE to reimport (approved)

- The **21 layers / 873-line registry** → build ~6–8 REAL homes.
- **`/labs` sprawl** → the operator hard-gate is our model.
- The origin's **optimistic `live`/`partial`** statuses → ours is fail-closed + evidence-cited.
- **"governance" / "marketplace" / referral-bonus** framing → banned by `SETTLED_RULES` (recognition
  / verified-introduction only).
- **client-side RPC reads as source of truth**, and **config-exposed addresses** → our spine +
  no-address-leak is the whole point.
- **vitest/jest as the enforcement path** → honesty ships as a blocking guard.
- Do NOT import `config/protocolOsMap.ts` or `@/operator/*` into any public page (server-only nodes,
  stale static `asOf` counts). Link the **public twin** only: `/map` not `/os-map`, `/source` not
  `/os-source`, `/proof` not `/proof-studio`.

## 8. The three-state status law (the reconciliation — ONE law, ZERO hand-typed statuses)

Two status mechanisms would re-fragment the very thing `/knowledge` preaches (Rule 1: one canonical
home per fact). Unification: **status is never declared — it is a pure function of a home's single
cited `evidence`.** Two orthogonal axes:

- **Permanence** — declared taxonomy (classification, not a truth-claim): `onchain-permanent /
  recomputed-projection / config-pinned / append-only-curated / reserved`.
- **Status** — DERIVED, three states, never typed:
  1. **LIVE PROJECTION** — evidence is a live read recomputed per load (reality spine).
  2. **SERVED SNAPSHOT** — evidence is a hash-pinned served snapshot; its as-of is `builtAt`/
     `freezeBlock`, **never** the live signature (the Holder Index).
  3. **RESERVED-HELD** — named, not built; evidence is a plan/doc, not an implementation.

**One law, two derivations:** a home WITH a public `route` derives its state from
`seo-route-registry` (the 2.4 Docs mechanism, reused not duplicated); a home WITHOUT a route cites
on-disk `paths` and derives from their existence/kind. The `KnowledgeHome` type has **no `status`
field** (hand-typing is structurally impossible). `cannotProve` (coverage) is **required non-empty**
per home. Precedence is reclaimed as **descriptive truth only** (it states the authority order; it
does not grant this file power over runtime).

**`guard-knowledge-map.ts` (BLOCKING, ships no later than the page it verifies) asserts:**
1. every home's `evidence` route/path **exists on disk**;
2. every non-`LIVE` home **cites an on-disk evidencing file**;
3. **zero 40-hex addresses** anywhere in the registry module (no-address-leak canon binds it);
4. every linked route resolves to a **PUBLIC·INDEX** entry in `seo-route-registry` (no dead links,
   no internal twins);
5. **no hand-typed status** (no field) and permanence cannot contradict the derived state;
6. `cannotProve` non-empty per home.

## 9. Slotting (frozen Phase-2 list UNCHANGED — proposals)

- **Fold into 2.5 `/knowledge`:** #1, #2, #3, #4, #5(data), #6, #7, #9 — they are the fields, content,
  and guard of the page itself.
- **Freshness fix (from §4) lands FIRST**, before 2.5 ships — the smallest correct correction (give
  the snapshot its own as-of + a "served snapshot" freshness word on the 3 surfaces). It is the first
  installment of the **core-vocabulary migration** (add the FRESHNESS axis), pulled forward because
  the audit found a live overclaim.
- **Defer to the Phase 3–6 holding area:** #5(enforcement) → checkout/referral + seasons;
  #8(structural invariants: S2 cap, member-subjects-forbidden, held-never-invented) → the new
  sale/era contract + Activity/Chronicle. One-line annotations only.

## 10. Conflicts with existing canon

- #1-3, #6, #9, and the three-state law: **no conflict** — they reinforce truth-first / no-fake-live.
  Hard constraint (not a conflict): `sourceOfTruth`/evidence cites **paths and endpoint names, never
  addresses.**
- #5 lifecycle: **reframe required** — the origin's stage text names "referral activation / claim
  UI"; importing verbatim would conflict with `SETTLED_RULES` public framing. Reframe to
  "verified-introduction" vocab; the mechanism (proof ≠ activation) aligns.
- #8 "money never buys a tier": **aligns** with `SETTLED_RULES` + `GAMIFICATION_LEGAL_DOCTRINE`;
  implementation depends on the new sale/era contract (Phase 5) → defer, not conflict.
- Governance/marketplace layers: in the REFUSE column → no conflict arises.

---

## 11. `memberCount()` verification + the dual-provenance composite (the liveness fix, ⓪)

**Question (dangerous to get wrong):** does live V3 `memberCount()` return the CONTINUOUS total
(10, incl. the 8 historical freeze/root) or ONLY V3-emitted seats (2)?

**Evidence read on disk (not assumed):**
- `holderIndexSnapshot.ts:57-74` — `memberTotal: 10` is explicitly partitioned into two
  never-collapsed authorities: `PART_B_FREEZE_ROOT` (seats **#1–8**, count **8**, authority =
  verified historical freeze + on-chain `V1_MEMBER_ROOT`, "imported once, never re-derived") and
  `V3_EMITTED` (seats **#9–10**, count **2**, authority = memberNumber emitted by V3 events, "read
  from raw indexed events, never inferred, never renumbered"). Built from raw events
  (`inputSaleEventCount: 26`) — independent of any view function.
- `sale-abi.ts:88-92` — the V3 sale exposes `memberCount()`, **`GENESIS_OFFSET()`**,
  `nextSeatNumber()`, and `V1_MEMBER_ROOT()` as SEPARATE views. A `GENESIS_OFFSET` is only needed if
  `memberCount()` counts V3-emitted seats from a base — so `memberCount()` is **V3-ONLY**, and the
  continuous head = `GENESIS_OFFSET (8) + memberCount (2) = 10`.
- **Caveat:** only the ABI is vendored (no contract source in-repo). The evidence is decisive but
  circumstantial; the fix MUST reconcile the live read against the snapshot at build/runtime and
  **fail closed on surprise** (the `holder-index:reconcile` pattern already does this).

**Hypothesis (NOT a verdict): V3-ONLY.** The above is an INFERENCE — largely from the *name*
`GENESIS_OFFSET`, and it does not weigh `nextSeatNumber()` (which may be the continuous head directly).
**Names lie, and only the ABI is vendored (no source).** A name-based guess is not evidence. We do
NOT flip the surfaces on inference.

> **STANDING RULE — SEMANTICS ARE RECONCILED, NEVER INFERRED FROM ABI NAMES.** When contract source is
> not in-repo, a view function's meaning is PROVEN by reconciling its live value against an independent
> truth, then failing closed on any disagreement — never assumed from its identifier.

**The independent truth is the snapshot** (built from raw indexed events, not a view): `8 + 2 = 10`.
So ⓪ must **empirically reconcile** the live reads before shipping:
- read `GENESIS_OFFSET()`, `memberCount()`, `nextSeatNumber()` **live**;
- assert **`GENESIS_OFFSET == 8` AND `memberCount == 2` AND `nextSeatNumber == 11`** (they reconcile
  with the snapshot's independent partition, freeze block state);
- **reconcile → semantics PROVEN → ship** the dual-provenance composite;
- **any disagreement → FAIL CLOSED, do NOT flip the surfaces, report to the founder.**

**RESULT — the hypothesis was REFUTED; the rule worked the FIRST time it was used (2026-07-11).**
Live reads on the V3 engine: **`memberCount()` = 12, `GENESIS_OFFSET()` = 8, `nextSeatNumber()` = 13.**
The name-based V3-ONLY inference was WRONG: `memberCount()` is the **CONTINUOUS total** (seats #1..12), not
the V3-emitted count. The proven relationships are **anchor `GENESIS_OFFSET == 8`** (✓) and **structural
`nextSeatNumber == memberCount + 1`** (13 == 12 + 1 ✓) — NOT `offset + count + 1`. V3-emitted =
`memberCount − GENESIS_OFFSET` = 4 (#9–12). **Worked example (record it): had we shipped the V3-ONLY
hypothesis, the site would today render `8 + 12 = 20` seats — a doubled, false number, in production, under
a live signature.** The name `GENESIS_OFFSET` lied; the chain did not. This is the canonical proof of
"SEMANTICS ARE RECONCILED, NEVER INFERRED FROM ABI NAMES" — it will stop a future session from trusting a
name. Founder ruling: **12 is 12** — members #11/#12 are real on-chain purchases (real USDC); there is no
"test seat" category and none will ever be invented. Founder doctrine: **he transacts publicly on-chain by
design** — work, tests, problems, all visible; proof-of-life that cannot be faked. Seat authority stays as
canon: #1–8 Part B freeze/root, #9+ emitted V3 memberNumber. No filtering, no asterisk, no founder exclusion.

**SECOND worked example, same session (2026-07-11) — the advisor's checkout brief.** The advisor cited
`sale-abi.ts:33` `buy(usdcAmount)` and built a whole "no slippage protection" argument on it. That line
is the **V1** ABI. Reading the actual **V3** engine (`sale-abi.ts:146-157`) shows
`buy(grossUsdc, recipient, sourceId, **minSynOut**, v1Proof)` — **native slippage protection** (a
`minSynOut` floor) plus on-chain **per-address-per-era caps** (`usdcByAddressEra`/`maxUsdcPerAddressPerEra`)
and the seat read from the `MembershipPurchasedV3` event. So the rule fired **twice in one session** —
`GENESIS_OFFSET` (inferred V3-only from a name), then `sale-abi.ts:33` (inferred the buy signature from
the wrong ABI line). **Both times, reading the file beat inferring from a line.** This is precisely why
"SEMANTICS ARE RECONCILED, NEVER INFERRED FROM ABI NAMES" — and REPO-WINS-OVER-PROSE (§12b) — are
standing rules: *no file cited (read in full), no claim.*

**The honest figure is a DUAL-PROVENANCE COMPOSITE, never a bare number, never silently summed** —
the snapshot's own boundary #3 forbids collapsing the two authorities; a bare live "10" would itself
violate doctrine.

**The composite, and why it's stronger than "one live number":** BOTH parts are live-readable —
`GENESIS_OFFSET()` / `V1_MEMBER_ROOT()` anchor the 8 (freeze/root authority), `memberCount()` is the
live V3-emitted count (V3 authority). So "no snapshot for a live-readable figure" applies to BOTH:
`recognised seats = 8 verified historical (freeze/root · V1_MEMBER_ROOT) + N live V3-emitted`, each
part under its own provenance. The static snapshot returns to its real job — era attribution +
own-row verification — and is NEVER the headline.

**Fix ⓪ scope (build after this ledger is approved):** extend the reality spine to also read
`GENESIS_OFFSET` (and `V1_MEMBER_ROOT` for the anchor); the client composes the dual-provenance total;
the three surfaces (`/faq`, `/whitepaper`, homepage KPI) render the composite under correct
provenance; extend the freshness guard so a snapshot-sourced value may not stand in for a figure with
a live reality-envelope source. api-server change → Claude Code authors, Replit deploys. Verify both
modes. (No conflict with canon; reinforces truth-first + the dual-authority model `/knowledge` will
publish.)

**THE DIVERGENCE IS THE FLAGSHIP, NOT A PROBLEM.** Once live, the composite will eventually EXCEED the
snapshot (member #11 joins → live `8 + 3 = 11` while the verified snapshot still reads `10` as of its
`builtAt`). That is not a bug — it is the **STALE story**, and the single most differentiating thing we
can publish. Design ⓪ (and `/knowledge`) so the divergence is SURFACED, never hidden or collapsed:
**"11 seats live · 10 verified in the snapshot as of {builtAt} · the two authorities are never
collapsed."** Live head (per-load) and verified snapshot (`builtAt`/`freezeBlock`/`snapshotHash`)
shown side by side, each with its own provenance — the divergence is the proof that we read live and
verify honestly, exactly the truth `holderIndexStanding.ts` already models as `STALE`.

---

## 12. AGENT DRIFT — the multi-agent contract (a system defect, not a human one)

Three agents operate on this repo with partial views: **Replit** (build/deploy/runtime gate),
**Claude Code** (the only code author), **Claude advisor** (review/translation, on request). The
founder must NOT be the shared memory of three agents — that is the defect this section kills.
Symptoms actually hit: mismatched file names across agents; an advisor reasoning from `SESSION_STATE`
prose while the answer sat in code on disk; Replit pushing when it shouldn't; a TIER-0 doc pushed
without review.

### (a) The Agent Contract — who owns what
- **Claude Code** = sole writer to `main`. Reads the real repo → 4-line gate → **founder GO** →
  build + guards → **show the diff** → **founder approves** → commit + push → tick trackers →
  deploy verdict.
- **Replit** = deploy/runtime ONLY. Pulls `main`, builds, deploys, migrates, reports. Its GitHub
  token is read-only; it physically cannot push.
- **Claude advisor** = second opinion + plain-language, on request. Not a mandatory relay; writes no code.

> **STANDING RULE — NO PUSH WITHOUT FOUNDER APPROVAL, INCLUDING DOCS-ONLY. No exceptions.** The slice
> protocol is: show diff → founder approves → commit + push. "Docs-only and arguably authorized" is
> NOT approval. Canon that boots every session especially requires review before it lands.
> (Origin of this rule: `c69c0ef`, 178 lines of TIER-0 canon, was pushed without a diff shown — the
> exact agent-drift failure mode we are killing.)

### (b) REPO WINS OVER PROSE — the epistemic rule for every agent
An agent must **read the file on disk before making a claim about it, and cite the file.** No file
cited, no claim. Prose (`SESSION_STATE` + direction docs) is a pointer, never the authority; when
prose and code disagree, **code wins** and the prose is corrected. This is the doc-side twin of the
`/knowledge` precedence law.

### (c) Canonical file map — the exact paths all three agents keep mis-naming
| Concern | Exact path |
|---|---|
| Route/SEO registry (purity leaf) | `artifacts/studio/src/lib/seo-route-registry.ts` |
| Surface ↔ audience ↔ layout | `artifacts/studio/src/config/surfaceClassification.ts` |
| Operator OS map (server-only; NEVER import into a public page) | `artifacts/studio/src/config/protocolOsMap.ts` |
| Holder Index snapshot (served, aggregate-only) | `artifacts/api-server/src/lib/protocol/holderIndexSnapshot.ts` |
| Own-row era resolution (dual authority, STALE) | `artifacts/api-server/src/lib/protocol/holderIndexStanding.ts` |
| Chain decoders + selectors (memberCount, reserves, supply) | `artifacts/api-server/src/lib/protocol/financialDecoders.ts` |
| Reality envelope builder (the spine) | `artifacts/api-server/src/lib/protocol/realityService.ts` |
| V3 sale ABI (memberCount / GENESIS_OFFSET / V1_MEMBER_ROOT) | `artifacts/api-server/src/canon/the-syndicate/contracts/abi/sale-abi.ts` |
| Studio guards (blocking gate) | `artifacts/studio/scripts/guard-*.ts` + `guards/no-raw-color.mjs` |
| api-server guards | `artifacts/api-server/scripts/*.guard.ts` |
| Prerender / SSG | `artifacts/studio/scripts/prerender-routes.ts` |
| Serving rewrites (generated, never hand-edited) | `artifacts/studio/.replit-artifact/artifact.toml` |

---

## 13. THE APPROVE ≠ PAYMENT LAW (engrave now, before the checkout slice exists)

Across previous versions, every checkout build implemented ONLY the USDC `approve`, saw a successful
receipt, and treated it as "payment confirmed" — the seat was NEVER purchased, yet the user believed
they were a member. The founder fixed this by hand, repeatedly. Engrave it before Phase-3 checkout:

- **`approve` is NOT payment.** It is a call on the **TOKEN** contract granting an allowance. The
  purchase is a **SECOND** transaction, on the **SALE** contract.
- **The UI must NEVER show success, a seat number, or any member state after the `approve` receipt.**
  Membership is confirmed ONLY by a successful **PURCHASE** receipt.
- **The seat number is READ FROM THE EMITTED EVENT** — never inferred, never predicted (mirrors the
  holder-index doctrine: "read from raw indexed events, never inferred, never renumbered").
- **Approve the EXACT quote amount, never unlimited.**

This is a hard checkout invariant for Phase 3 (#22 live checkout) and pairs with §8's deferred
structural invariants. It will be encoded as a guard when the checkout surface is built.

---

## 14. The OPEN QUEUE — anti-entropy, one level up

This ledger is anti-entropy for the ORIGIN. The same disease hits our OWN in-flight decisions: every
gate brings a new question and the old ones evaporate — the founder becomes the shared memory of three
agents (a system defect, §12). Fix: **`docs/direction/OPEN_QUEUE.md`** is the living queue of open
decisions. **HARD RULE: at every gate, Claude Code restates the FULL open queue, not just the new ask;
nothing closes until the founder closes it explicitly.** The queue is **reconstructed from evidence**
(session history + repo on disk, each item citing a file/where-raised), NEVER from memory — a
from-memory list is the drift it exists to kill. It carries a merge report naming what a from-memory
pass MISSED (e.g. the `/docs` decorative live-signature overclaim; the `MASTER_BUILD_SPEC` Phase-1
doc-drift; two confirms asked-and-never-answered).
