# THE SYNDICATE OS COMPASS

**First-read operating compass for AI agents (Replit, Codex, Hermes, others) and human operators.**

This file is a **meta-canon router**. It routes you to canonical documents; it does not
replace them. It is not a constitution, not a doctrine rewrite, and it deliberately
restates almost nothing. Read this first, then open only the source docs your task needs.

## 1. Conflict rule

> **If this file disagrees with a source doc, the source doc wins and this file is the bug.**
> Fix the compass pointer; never "fix" canon to match the compass.

## 2. Source hierarchy — canonical files and what each controls

| Canon file | Controls |
|---|---|
| `replit.md` | Operating constitution: run/verify commands, phase gates, forbidden UI copy list, recognition vocabulary, homepage governance, architecture decisions, gotchas |
| `docs/handoff/new-session-handoff-2026-07-03-first-clean-schema-publish.md` | **Current state** (latest handoff): live production truth, GitHub/tag state, DB state, auth posture, next slice |
| `the-syndicate-master-operating-map.md` (repo root) | Master operating map of the whole protocol/business |
| `docs/strategy/CORRECTED_DOCTRINE_REHARVEST_2_20G.md` | Corrected doctrine baseline (supersedes earlier harvest framings) |
| `docs/strategy/GRAND_RECONCILIATION_AND_CARTE_BLANCHE_UNBLOCK_2026-07-06.md` | Founder carte-blanche authority: which *process* gates are lifted (implementation now standing-authorized, Phases 1–10) vs which *truth/safety* invariants are kept; the Boost-Protocol source resolution; route/phase reconciliation |
| `docs/architecture/CAPABILITY_HARVEST_AND_REUSE_MAP.md` | What business mechanics are preserved vs which framings/patterns are rejected |
| `docs/architecture/SOURCE_BOUNDARY_MANIFEST.md` | Public/private source boundary; what may never leak into served surfaces |
| `docs/audits/SLICE_2_17_FULL_OS_LANGUAGE_CONSTITUTION_RECOVERY.md` | Language constitution for copy/vocabulary |
| `docs/architecture/WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` | Founder-audited identity doctrine: 3-layer seat/wallet/history model, per-era numbering authority, Holder Index read-model rules |
| `docs/architecture/HOLDER_INDEX_READ_MODEL_DESIGN.md` | Design-only bridge: fold/normalization rules, read-model shapes, posture mapping, exposure gates for the future Holder Index (no implementation authorized) |
| `docs/architecture/WALLET_FIRST_IDENTITY_ACCESS_AND_USER_REGISTRY_DESIGN.md` | Wallet-first access/user-registry design |
| `docs/architecture/OPERATOR_WALLET_AUTH_AND_ROLES_DESIGN.md` | Operator auth/roles design (dark until founder-enabled) |
| `docs/architecture/ACTIVITY_HEARTBEAT_READ_MODEL.md` | Script-only activity read-model doctrine |
| `docs/architecture/FULL_PROTOCOL_VISIBILITY_OS_MAP.md` | `/os-map` operator-preview design: full-protocol OS map, live-proof binding, exposure classification |
| `artifacts/api-server/src/canon/the-syndicate/proof/protocol-event-registry.ts` | **The one event taxonomy** (never mint another) |
| `artifacts/studio/src/lib/seo-route-registry.ts` | **The one route/IA/SEO canon** (breadcrumbs/posture/index chips are projections of it) |
| `lib/db/src/schema/partB.ts` | Part B historical-member continuity schema + in-file doctrine comments (incl. the expression-index platform lesson) |
| `lib/os-contracts/src/` | **The one posture/surface/status vocabulary** (types only) |

## 3. Non-negotiable invariants (one-liners; the cited doc is the authority)

1. Professionalize the business; do not erase the business — only unsafe framings/patterns are rejected. (`CAPABILITY_HARVEST_AND_REUSE_MAP.md`)
2. No fake-live data anywhere; every non-real value renders a truth label. (`replit.md` — Architecture decisions)
3. No financial-upside framing; the banned-term list and founder-locked recognition vocabulary live in `replit.md` (Gotchas) and `SLICE_2_17_...LANGUAGE_CONSTITUTION...md` — check both before writing any copy.
4. SYN is the seat: seat owner = the wallet currently holding SYN; nothing overrides live balance. (`WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md`)
5. Receipt is proof of entry, not control; wallet ≠ person; historical identity never moves on transfer. (same doc)
6. Holder Index is the identity **read-model**: a pure, rebuildable function of Part B tables + raw sale events; derived fields never stored; no manual fields. (same doc)
7. Member numbering authority per era: #1–8 = Part B freeze/root only (never re-derive, never renumber); #9+ = the emitted V3 `memberNumber`. (same doc + `partB.ts`)
8. Activity, Chronicle, Register, Archive are distinct surfaces — do not merge their doctrines. (`the-syndicate-master-operating-map.md`)
9. Designed transparency is intended; accidental raw leaks are forbidden — wallet/proof/tx detail is server-side until deliberately surfaced; the memberNumber→wallet mapping is never exposed. (`SOURCE_BOUNDARY_MANIFEST.md`, `WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md`)
10. One canon each — posture vocabulary (`lib/os-contracts`), event taxonomy (`protocol-event-registry.ts`), route/IA map (`seo-route-registry.ts`). Parallel versions are doctrine drift.
11. Served backend is read-only and fails closed: no runtime DB writes, no state-changing chain calls, canon mismatch → `null`, never a normalized/invented value. (`replit.md` — Architecture decisions)
12. Source attribution = verified introduction (business mechanics preserved); never multi-level or income-promise framing. (`CAPABILITY_HARVEST_AND_REUSE_MAP.md`, `CORRECTED_DOCTRINE_REHARVEST_2_20G.md`)

## 4. Task → source-doc routing

| Task | Read first |
|---|---|
| Replit ops, run/verify commands, phase gates | `replit.md` |
| "What is the current state?" | `docs/handoff/new-session-handoff-2026-07-03-first-clean-schema-publish.md` |
| Public/private boundary, leak questions | `docs/architecture/SOURCE_BOUNDARY_MANIFEST.md` |
| Business mechanics: what to keep vs reject | `docs/architecture/CAPABILITY_HARVEST_AND_REUSE_MAP.md` |
| Corrected doctrine baseline | `docs/strategy/CORRECTED_DOCTRINE_REHARVEST_2_20G.md` |
| What is authorized to build now vs still gated; Boost source | `docs/strategy/GRAND_RECONCILIATION_AND_CARTE_BLANCHE_UNBLOCK_2026-07-06.md` |
| Copy, language, vocabulary | `docs/audits/SLICE_2_17_FULL_OS_LANGUAGE_CONSTITUTION_RECOVERY.md` + `replit.md` Gotchas |
| Holder Index / member identity / numbering | `docs/architecture/WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` (doctrine) + `docs/architecture/HOLDER_INDEX_READ_MODEL_DESIGN.md` (bridge design) + `lib/db/src/schema/partB.ts` + `protocol-event-registry.ts` |
| Auth / access / roles (dark) | `OPERATOR_WALLET_AUTH_AND_ROLES_DESIGN.md` + `WALLET_FIRST_IDENTITY_ACCESS_AND_USER_REGISTRY_DESIGN.md` |
| Routes, IA, SEO, breadcrumbs | `artifacts/studio/src/lib/seo-route-registry.ts` |
| Event taxonomy / normalization | `artifacts/api-server/src/canon/the-syndicate/proof/protocol-event-registry.ts` — only |
| Public status/posture surfaces | `lib/os-contracts/src/` + the source-status contract (`GET /api/source-status`, contract-first via the api-spec package) |
| Whole-protocol/business picture | `the-syndicate-master-operating-map.md` (repo root) |

## 5. Do-not-repeat list

- Do **not** re-audit production, publish state, prod DB, or GitHub unless a new publish/checkpoint changed the evidence. (Last full audit + durability checkpoint: 2026-07-03, tag `prod-2026-07-03-first-clean-schema-publish`.)
- Do **not** create a parallel route map, event taxonomy, or posture/status vocabulary — extend the single canon instead.
- Do **not** regenerate, re-derive, or renumber historical members / the Part B freeze — ever.
- Do **not** rescan the prior-art/GitHub source universe unless the slice specifically requires new evidence (harvest atlases already exist in `docs/strategy/`).
- Do **not** write a doctrine rewrite when a pointer or a small update to an existing canon doc is enough.
- Do **not** copy dev DB rows to production, run manual prod SQL, or enable auth — all founder-gated.

## 6. Doc status ledger

| Status | Docs |
|---|---|
| **Canonical / current** | Everything in section 2 |
| **Current handoff** | `docs/handoff/new-session-handoff-2026-07-03-first-clean-schema-publish.md` |
| **Reference-only** | `docs/architecture/PRIOR_ART_RECONCILIATION_2_19D.md`; `docs/strategy/DUNITERUM_CAPABILITY_HARVEST_2_20E.md`; `docs/strategy/PRINCIPAL_PRIOR_ART_AUDIT_THESYNDICATE_2_20F.md`; `docs/handoff/syndicate-hero-header-design-export.md`; external prior-art `HOLDER_INDEX_ARCHITECTURE.md` (pattern-only — its event-replay numbering and public wallet-profile pages are superseded) |
| **Historical record** (point-in-time; do not derive current state from them) | `docs/audits/SLICE_*` reports (except 2_17, whose language rules remain canon); `docs/phase1-*`; `docs/strategy/FULL_VISIBLE_OS_ORGANISM_2_21A.md` |
| **Operational checklist** | `docs/internal/deploy-readiness-checklist.md` |

## 7. Freshness contract

- **Last reconciled: 2026-07-06** — founder carte-blanche reconciliation (`GRAND_RECONCILIATION_AND_CARTE_BLANCHE_UNBLOCK_2026-07-06.md`) lifts the *process* gates (report-first, per-slice approval, "no implementation authorized", read-only-foundation) as a standing authorization for Phases 1–10, while keeping every *truth/safety* invariant in section 3 intact. Prior baseline: 2026-07-03 first-clean-schema-publish checkpoint (still the source-of-record for live production/DB/auth state).
- When a canon doc is added, renamed, retired, or superseded, **update this compass in the same slice**.
- When a new handoff is written, repoint section 2/4/6 to it in the same slice.
- **A stale compass is a bug** — fix the pointer, never the canon.

## 8. Next consumer

`docs/architecture/HOLDER_INDEX_READ_MODEL_DESIGN.md` exists (design-only, written 2026-07-03
with this compass as its first-read router). The next consumer is the founder-gated
implementation sequence in that document's §14 — starting with founder/Dave review, then a
separately-approved internal schema slice. No implementation is authorized yet.
