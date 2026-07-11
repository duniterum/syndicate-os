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

**Consequence (pre-committed decision tree):** the **freshness fix lands FIRST** — smallest correct
fix: give the snapshot figure its own as-of (`builtAt`/`freezeBlock` + a "served snapshot" word),
never the live signature. **We do not publish a truth-map (`/knowledge`) while a surface misstates.**

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
