# Slice 2.20A — Whole-System Organism Audit & Harmonization Review

> READ-ONLY / REPORT-ONLY. This document is a senior whole-system audit of
> `duniterum/syndicate-os` after the foundation (2.18L), README (2.19B), Source
> Boundary Manifest (2.19C), Prior-Art Reconciliation (2.19D), and TypeScript OS
> contract types (2.19E). It implements **nothing**: no source/UI/API/route/canon
> change, no package/lockfile change, no dependency, no live data, no adapter, no
> indexer, no auth, no admin/member behavior, no 2.19F binding, no live chain read,
> no transaction, no deploy, no repo-visibility change. The only file added by this
> slice is this report (plus, optionally, one short README pointer to it).

| Field | Value |
|---|---|
| Slice | 2.20A — Whole-System Organism Audit & Harmonization Review |
| Mode | READ-ONLY / REPORT-ONLY (docs-only) |
| Repo (authority) | `https://github.com/duniterum/syndicate-os` (private) |
| Branch | `main` |
| HEAD audited | `79cc49659414c155e0830cbea9cba6b1f45a9290` |
| Working copy | fresh clone into `/tmp` (verified remote, branch, HEAD, visibility) |
| Tracked files surveyed | 165 |

---

## 1. Executive Verdict

- **Overall status:** The foundation is healthy, coherent, and safe. Every
  verification gate passes, the security/privacy scan is clean, no fake protocol
  data exists anywhere, and the radical-honesty / truth-label discipline holds
  across the whole app. The one material weakness is **status-vocabulary
  fragmentation**: the repo now runs three+ unreconciled posture/status vocabularies
  at runtime while the new canonical contract (`@workspace/os-contracts`) is
  imported by **no runtime code**. This is documented and deliberately deferred to
  the (not-yet-authorized) 2.19F slice, not an accidental break.
- **Readiness classification:** **`READY_FOR_TARGETED_REPAIRS`**
  - Not `READY_FOR_NEXT_IMPLEMENTATION`: the canonical posture contract is unused
    and 3+ posture vocabularies diverge; binding them is the right next move before
    new feature/source work.
  - Not `NEEDS_ARCHITECTURE_REPAIR_FIRST`: nothing is broken or blocking; the
    divergence is contained and documented.
  - Not `NEEDS_SECURITY_REPAIR_FIRST`: sensitive scan is clean; runtime guards are
    strong and fail-closed.
  - Not `BLOCKED`: the gate is green.
- **One-paragraph senior summary:** Syndicate OS is a disciplined, proof-first
  read-only foundation built exactly to its own doctrine — a public visitor surface,
  a console ("Studio OS / Proof OS"), a strongly-guarded static `/api/source-status`
  posture spine, server-side-only vendored canon with recorded provenance, and a
  type-only OS contract library. It is safe and internally honest. Its main debt is
  **convergence**: four status vocabularies (studio `truthStatus`, studio
  `PostureBadge`, API `sourceStatus`, and `os-contracts` `SourcePosture`) coexist
  without a runtime binding, and the single dynamic endpoint (`/api/source-status`)
  is consumed outside the OpenAPI contract-first pipeline. The highest-leverage next
  work is to make `os-contracts` the single runtime posture canon (2.19F + API
  convergence) and to bring `/source-status` into the generated contract — both are
  type/label-level, no-data-wiring, founder-gated repairs.

---

## 2. Repo Identity & Scope

- **Repo URL:** `https://github.com/duniterum/syndicate-os`
- **Branch:** `main`
- **HEAD:** `79cc49659414c155e0830cbea9cba6b1f45a9290` (matches the approved starting HEAD; no unapproved advance)
- **Visibility:** **private** (verified against the GitHub API on the fresh clone)
- **Files inspected (summary):** 165 tracked files surveyed. Read in full or via
  read-only explorer: all authority docs (`README.md`, `replit.md`,
  `docs/architecture/SOURCE_BOUNDARY_MANIFEST.md`,
  `docs/architecture/PRIOR_ART_RECONCILIATION_2_19D.md`); the type contract
  (`lib/os-contracts/src/source-boundary.ts`, `index.ts`); studio config
  (`truthStatus.ts`, `modules.ts`, `navigation.ts`, `syndicateFacts.ts`, `brand.ts`,
  `featureFlags.ts`); all studio pages, layouts, and components
  (`PublicHome`, `Home`, `ProofDashboard`, `ProofStudio`, `MemberAccess`,
  `PlaceholderPage`, `not-found`, `SystemStatus`, `PublicLayout`, `Shell`,
  `TruthLabel`, `PostureBadge`, `SeoHeadManager`, `RouteContextBar`,
  `RouteScrollManager`, `ThemeProvider`/`ThemeToggle`); the SEO layer
  (`seo-route-registry.ts`, `check-seo-registry.ts`, `index.html`, `sitemap.xml`,
  `robots.txt`); the API (`app.ts`, `routes/sourceStatus.ts`, `data/sourceStatus.ts`,
  `build.mjs`, package scripts); server-side canon + `PROVENANCE.md`; OpenAPI spec
  (`lib/api-spec/openapi.yaml`); `lib/db`; root `tsconfig`/workspace/package config;
  and `scripts/post-merge.sh`.
- **No-touch confirmation:** No source, UI, API, route, canon, package, lockfile,
  dependency, schema, or workflow file was modified. This slice adds only
  `docs/audits/SLICE_2_20A_WHOLE_SYSTEM_ORGANISM_AUDIT.md` (and, if applied, a single
  one-line README pointer to it). No live chain read, transaction, deploy, or
  visibility change was performed.

---

## 3. Verification Health

| # | Command | Result | Notes / blocker class |
|---|---|---|---|
| A1 | `pnpm install --frozen-lockfile` | **PASS** | Lockfile honored; no drift. Includes the 2.19E empty importer entry for `lib/os-contracts`. |
| A2 | `pnpm run typecheck` | **PASS** (exit 0) | Full workspace typecheck (libs built, then leaf packages). No errors. |
| A3 | `pnpm --filter @workspace/api-server run build` | **PASS** (exit 0) | `node ./build.mjs` (esbuild bundle); canon dir excluded from program & bundle. |
| A4 | `pnpm --filter @workspace/api-server run verify:canon` | **PASS** (33/33 checks) | Posture distribution across the 20 categories: `READ_ONLY_PROOF`=5, `NOT_WIRED`=7, `FUTURE`=7, `NOT_LIVE`=1. |
| A5 | `pnpm --filter @workspace/api-server run live-read:check` | **SKIPPED** | Requires live Avalanche RPC network access; doctrine forbids live chain reads in this slice. Script is read-only (never signs) but is fenced outside the program/bundle and must not run here. |
| A6 | `token-metadata:check` / `archive-posture:check` | **SKIPPED** | Same reason as A5 (live RPC). |

**Package-script / boundary inspection:**
- **Unsafe side effects:** none in the build/typecheck/verify path. The three
  `avalanche-*-check.ts` scripts are the only network-touching scripts; they are
  `tsx`-run, read-only (`eth_chainId` / `eth_getCode` / `eth_call` only — no
  signing, no writes), excluded from the TS program (`tsconfig` `exclude: src/canon`)
  and from the deployed bundle. They are not part of any gate.
- **Workspace boundaries:** clean. Artifacts (`studio`, `api-server`,
  `mockup-sandbox`) do not import each other; sharing is via `lib/*`. `lib/os-contracts`
  is a well-formed type-only package.
- **tsconfig references:** root solution file references the composite libs only;
  `os-contracts` is wired as a project reference. Leaf artifacts are `--noEmit`.
- **pnpm-lock importer state (post-2.19E):** the `lib/os-contracts` importer entry
  is present and empty (type-only, no runtime deps) — correct, no drift.
- **os-contracts inclusion:** correctly included at the type/build level with **zero
  runtime importers** — structurally clean, but see §4/§8 (the contract is not yet
  *used* by runtime code).

**Verdict:** Verification health is **green**. Safe to proceed with docs-only commit.

---

## 4. Architecture Harmony

**What agrees (harmonized):**
- `README.md`, `replit.md`, the Source Boundary Manifest, and the Prior-Art
  Reconciliation tell one consistent story: read-only proof-first foundation, phased
  founder-gated graduation, no fake data, no financial/yield framing, server-side
  canon never exposed raw.
- The studio route table (`App.tsx`), `modules.ts`, and the SEO route registry are
  **mutually exact** (10 routes: `/`, `/studio`, `/proof`, `/proof-studio`,
  `/member`, `/founder`, `/source`, `/recognition`, `/learning`, `/status`, plus a
  `*` catch-all). No orphan or missing route.
- Server-side canon ↔ `PROVENANCE.md` ↔ `/api/source-status` `sourceRef` strings are
  consistent and pin to a single recorded upstream commit.

**What is inconsistent (the central finding) — multiple unreconciled status enums:**
1. **`os-contracts` `SourcePosture` (7 states)** — the *intended* canon
   (`NOT_WIRED`, `READ_ONLY_PROOF`, `VERIFIED_SOURCE_PENDING_ADAPTER`,
   `AUTH_REQUIRED`, `ADMIN_ONLY`, `LIVE_ACTION`, `FUTURE`) — is **imported by no
   runtime code**. It is a contract nothing currently conforms to.
   *Evidence:* `lib/os-contracts/src/source-boundary.ts` (type-only; zero importers).
2. **API `sourceStatus.ts` `Posture` (6 states)** uses the *older* vocabulary:
   `READ_ONLY_PROOF`, `ADAPTER_REQUIRED`, `NOT_WIRED`, `NOT_LIVE`, `FUTURE`,
   `EXTERNAL`. *Evidence:* `artifacts/api-server/src/data/sourceStatus.ts:14–21`.
3. **Studio `PostureBadge.tsx` `Posture` (6 states)** independently re-declares the
   same older 6-value set as #2 — a duplicate enum in a second package.
   *Evidence:* `artifacts/studio/src/components/PostureBadge.tsx`.
4. **Studio `truthStatus.ts` (10 reason codes)** is a finer "why-not-live" display
   axis keyed by `SurfaceId`, separate from any posture enum.
   *Evidence:* `artifacts/studio/src/config/truthStatus.ts`.
5. **`README` posture list** still mentions bare `LIVE`, which the manifest and
   2.19D explicitly retired (old `LIVE`/`LIVE_READ` → `READ_ONLY_PROOF`; writes →
   `LIVE_ACTION`). Minor doc-drift. *Evidence:* `README.md` (posture-vocabulary section).

**Residual mapping gaps to resolve before convergence:**
- `ADAPTER_REQUIRED` (API/Badge) is the deprecated alias of
  `VERIFIED_SOURCE_PENDING_ADAPTER`.
- `NOT_LIVE` (API/Badge; used by the `sale` category) has **no** member in
  `SourcePosture`; it should map to `NOT_WIRED` (no adapter) per the 2.19D MERGE rule.
- `EXTERNAL` (API/Badge) has **no home at all** in `os-contracts` `SourcePosture` —
  a genuine contract gap: either add an explicit third-party/external posture (or
  authority-axis value) or retire `EXTERNAL`.
- Confidence axis casing differs: API/studio use lowercase `high|medium|low`;
  `os-contracts` defines its own `SourceConfidence`/`SourceAuthority` axes — confirm
  casing/values align when binding.

**Other harmony notes:**
- **Ownership** between studio / API / lib / canon is otherwise clear: canon &
  posture spine live server-side; the studio renders labels; `os-contracts` is the
  intended type canon.
- **Dependency direction** is safe (no artifact↔artifact imports; `os-contracts` has
  no runtime deps), so there is no cycle risk in adopting it.
- **Is 2.19F the right next slice, or do repairs come first?** 2.19F (studio
  `TruthStatus`→`Posture` binding) is the correct *direction* and should be next, but
  it only fixes the **studio** axis. It must be paired with (or immediately followed
  by) **API/Badge posture convergence onto `SourcePosture`**, or the fragmentation
  simply moves rather than closes. See §14.

**Verdict:** Architecturally **coherent with known, documented divergence**. No
conflict is a safety breach; the work is convergence, not repair-of-breakage.

---

## 5. Living Organism Coherence

**Classification: `coherent with minor repairs`.**

The repo reads as one OS, not disconnected artifacts:
- **Naming** is consistent ("Studio OS / Proof OS", "posture", "truth label",
  "source boundary", "canon/provenance") across docs, config, and UI.
- **Domain model** is clearly articulated (manifest's 14 data/proof domains, 6
  surfaces, 9 adapter types) and the runtime spine (`/api/source-status` 20
  categories) is a faithful, narrower projection of it.
- **Surface ownership** (public visitor / authenticated member / private operator)
  is explicitly designed and the public surface honestly labels member/admin areas
  as future.
- **Truth-label usage** is pervasive and disciplined — every value, metric, and
  claim on every page carries a `TruthLabel`/`PostureBadge`, and inputs that would
  imply live capability are `disabled`.
- **Future adapter path** is specified (manifest §6/§14) without being prematurely
  built.

The single thing keeping it from "coherent now" is that the **nervous system has
two spines that don't yet talk to each other**: the type canon (`os-contracts`) and
the runtime posture/label vocabularies (studio + API). The OS can absolutely grow
without chaos **once** those are bound — but until then, every new surface risks
picking whichever of the 3–4 vocabularies is nearest.

---

## 6. Code Quality / Bug Findings

| # | Severity | Finding | Evidence |
|---|---|---|---|
| Q1 | HIGH (maintainability) | `/api/source-status` is consumed via raw `fetch()` plus **hand-duplicated** TypeScript interfaces on the client, bypassing the OpenAPI contract-first pipeline. The server's Zod-derived types are re-typed by hand on the client → silent drift risk; no client-side runtime validation of the payload. | `artifacts/studio/src/pages/SystemStatus.tsx` (inline `SourceStatusItem`/`Confidence`/`SourceStatusResponse` + `fetch`); `lib/api-spec/openapi.yaml` defines only `/healthz`. |
| Q2 | MEDIUM | Two identical 6-value `Posture` enums declared in two packages (API + studio) — duplicated constant set that must be kept in lockstep by hand. | `artifacts/api-server/src/data/sourceStatus.ts:14–21`; `artifacts/studio/src/components/PostureBadge.tsx`. |
| Q3 | MEDIUM | Type-contract vs runtime drift: `os-contracts` `SourcePosture` (7) is the canon, but runtime code uses the older 6-value set incl. `ADAPTER_REQUIRED`/`NOT_LIVE`/`EXTERNAL`. | §4 items 1–3. |
| Q4 | LOW | `README` posture list still includes bare `LIVE`, contradicting the manifest's retirement of `LIVE` in favor of `READ_ONLY_PROOF`/`LIVE_ACTION`. | `README.md` posture section. |
| Q5 | LOW (operational) | `scripts/post-merge.sh` runs `pnpm --filter db push` on every merge; `lib/db` schema is empty, so this is a near no-op but couples merges to a reachable database (`DATABASE_URL`). | `scripts/post-merge.sh`; `lib/db/src/schema/index.ts` (empty). |
| Q6 | INFO (positive) | Strong **fail-closed** discipline on the public payload: `assertPayloadDiscipline` throws at module load on any forbidden posture literal, financial/casino wording, `supa`, a full `0x[40-hex]` address, a non-null `value`, or a category/key mismatch; the registry also asserts an exact 20-key set. This is exemplary; no fail-open paths found. | `artifacts/api-server/src/data/sourceStatus.ts:316–427`. |

No broken imports, no dead routes, no unguarded fake data, and no obvious runtime
bugs were found in served code. Per slice rules, **nothing was fixed**.

---

## 7. Security / Privacy / Boundary Findings

**Result: CLEAN.** Reported by path/category/count only; **no values reproduced.**

- **Secrets / tokens / PEM keys / passwords:** none found in tracked files.
- **Mnemonics / "private key" strings:** present only as **defensive negations** —
  README safety rules and the read-only avalanche scripts that explicitly *never*
  sign (i.e., "no private key / no mnemonic" guard text). No actual key material.
- **Member PII / emails / phone numbers:** none. The upstream member list was
  deliberately **not** vendored (`PROVENANCE.md` "Deliberately NOT vendored").
- **EVM addresses / hex constants:** confined to **server-side canon** —
  `artifacts/api-server/src/canon/the-syndicate/contracts/syndicate-config.ts`
  (contract/protocol/founder addresses), `.../abi/archive-nft-abi.ts`,
  `.../contracts/contract-registry.ts` — and to the internal `*.guard.ts` /
  `avalanche-*-check.ts` CLI scripts. All of these are **excluded from the TS
  program and the deployed bundle**, and are permitted private-repo material per
  doctrine. **Zero** addresses/hashes appear in studio/UI or in any public doc.
- **Public payload exposure:** the `/api/source-status` payload carries posture
  labels only — every `value` is `null`, and the runtime guard hard-rejects any
  `0x[40-hex]`, `roi`/`yield`/`profit`, `supa`, and financial/casino framing. The
  only chain identifier in the payload is `expectedChainId: 43114` (Avalanche
  C-Chain), a public network id — acceptable, not an address.
- **Client-side private-key generation:** none.
- **Admin/member capability without auth:** none exposed — member/operator surfaces
  are placeholders labeled `FUTURE`/`AWAITING_FOUNDER_APPROVAL`; no real controls.
- **Accidental live-chain/write reachability:** none from served code. The only
  network code is the fenced read-only `avalanche-*-check.ts` CLI (never signs,
  never in the bundle, not on any gate).

---

## 8. Truth / Canon / Posture Alignment

- **`truthStatus.ts` vs `SourcePosture`:** the studio reason codes (10) are a *finer
  display axis*, correctly separate from the *capability/security axis*
  (`SourcePosture`). 2.19D mandates mapping each reason code to a posture **without
  merging the two enums**; that runtime map (`TruthStatusPostureMap`) exists as a
  **type** in `os-contracts` but has **no runtime implementation** yet — this is
  exactly the deferred 2.19F work.
- **Reason codes vs posture lifecycle:** consistent in intent; no reason code
  implies a capability the posture lifecycle forbids.
- **Canon / provenance alignment:** strong. `PROVENANCE.md` pins one upstream commit,
  lists every vendored file with address/PII counts and conversion notes, and the
  `sourceRef` strings in the payload match the vendored layout.
- **Public payload contract:** posture-only, deterministic (fixed `asOf`),
  fail-closed, exact 20-key set — fully aligned with manifest §7 API boundary rules.
- **`READ_ONLY_PROOF` vs `LIVE_ACTION`:** correctly distinguished everywhere; **no**
  surface claims `LIVE_ACTION` or any executed write. Old `LIVE`/`LIVE_READ` is
  treated as read-only proof (except the stale README mention, Q4).
- **`NOT_WIRED` vs `VERIFIED_SOURCE_PENDING_ADAPTER`:** the manifest uses both
  correctly; however the **runtime** API/Badge enums do **not** carry
  `VERIFIED_SOURCE_PENDING_ADAPTER` at all (they use `ADAPTER_REQUIRED`/`NOT_LIVE`),
  so this distinction is not yet expressible at runtime (closes with convergence).
- **Authority vs posture vs confidence separation:** the contract keeps
  `SourceAuthority`, `SourcePosture`, and `SourceConfidence` as separate axes — good;
  the runtime carries posture + lowercase confidence but **no** authority axis yet.
- **Overclaim check:** no public UI/copy overclaims live capability; no doc implies
  data exists without an adapter/source. Old unsafe prior-art postures
  (`SIMULATED`/`PROTOTYPE`/`DEMO`) are **not** reintroduced anywhere.

---

## 9. Product / UX / Surface Alignment

- **Homepage:** governed by explicit Homepage Governance rules (fixed section model,
  4-card promoted strip cap, "summarize and link out"). `PublicHome.tsx` respects
  them; **no module-dumping risk** as written.
- **Visitor path:** clear — hero → how-it-works → real-vs-pending summary → studio
  teaser → expectations, all truth-labeled.
- **Membership / seat path:** honest — `MemberAccess.tsx` presents "request a seat"
  with an `AWAITING_FOUNDER_APPROVAL` label; no fake onboarding.
- **Proof / registry path:** `ProofDashboard` (disabled search, labeled placeholder
  events) and `ProofStudio` (every field `disabled` + labeled) communicate intent
  without faking data.
- **Member dashboard future path / admin-operator future path:** designed in the
  manifest, represented only as labeled placeholders in the app — correctly
  underbuilt, not overclaimed.
- **"Studio OS / Proof OS" naming:** coherent and used consistently.
- **Public / member / admin distinctness:** maintained — two layouts (`PublicLayout`
  for `/`, `Shell` for console) and honest "Offline"/"Pending" affordances.
- **Operational-completeness vs WordPress-clutter:** the governance rules + module
  routing give a credible path to operational completeness (role-gated admin, member
  surface, verified read-models) without the homepage becoming a dumping ground.
- **Minor:** `PublicLayout` footer "Resources" links are intentionally inert
  (`cursor-not-allowed`, "Pending") — honest, but a candidate for real targets or
  removal as modules graduate.

---

## 10. SEO / Shareability Findings

- **Strong, complete static SEO scaffolding:** a per-route registry
  (`seo-route-registry.ts`) with title/description/canonical/index-status/OG per
  route; `SeoHeadManager` updates `<title>`/meta/canonical on navigation;
  `sitemap.xml`, `robots.txt`, OG + Twitter tags in `index.html`; and an enforcement
  script (`check-seo-registry.ts`). The registry **exactly matches** the app routes
  and modules. Public routes are `INDEX`, internal/pending routes `NOINDEX`, unknown
  routes `noindex,nofollow` via the `*` entry.
- **Copy truthfulness:** no fake-live / yield / speculation copy in any public
  metadata or page; titles/descriptions are accurate to the read-only posture.
- **Posture note (LOW / DEFER):** the canonical origin is hardwired to
  `https://thesyndicate.money` across `index.html`, `sitemap.xml`, `robots.txt`, and
  `seo-route-registry.ts` (`CANONICAL_ORIGIN`), and `index.html` declares
  `robots: index, follow`. For a **private, not-yet-deployed** foundation this
  "publish posture" is **latent and ahead of deploy posture** — harmless while
  unpushed, but before any public deploy confirm (a) the domain is controlled and
  intended, and (b) indexability/sitemap are desired at launch. The `.money` TLD also
  reads faintly financial (cosmetic only).
- **Responsive basics:** standard Tailwind responsive utilities and a single
  viewport meta — adequate for a static audit; no obvious mobile breakage statically.

---

## 11. Performance / Maintainability Readiness

- **Bundle/build risk:** low. The studio is a static Vite SPA; the API is a tiny
  Express app serving one static JSON route plus health. No heavy client libraries,
  no client-side RPC, no large data in the bundle.
- **Repeated constants:** the duplicated `Posture` enums (Q2) and the hand-copied
  client payload types (Q1) are the main DRY issues; converging on `os-contracts`
  removes both.
- **Lazy boundaries:** not needed at current size; revisit if the console grows.
- **Package organization:** clean monorepo boundaries; `os-contracts` is a good home
  for shared contracts. It will scale; if it grows, consider splitting
  postures/axes vs domains vs adapter contracts into submodules — not needed yet.
- **Future testability / ease of adding adapters/member/admin safely:** good — the
  fail-closed guard pattern, the exact-key registry, and the manifest's upgrade gate
  give clear seams. The biggest enabler of safe growth is finishing the posture
  convergence so new adapters target one vocabulary.

---

## 12. Discrepancy Matrix

| Area | Docs say | Code/canon says | UI says | API says | Discrepancy |
|---|---|---|---|---|---|
| Posture canon | Manifest/2.19D/os-contracts: 7-state `SourcePosture`; `VERIFIED_SOURCE_PENDING_ADAPTER`; no bare `LIVE` | `os-contracts` 7-state (unused); API+Badge older 6-state (`ADAPTER_REQUIRED`/`NOT_LIVE`/`EXTERNAL`) | `PostureBadge` older 6-state | `sourceStatus` older 6-state | **Yes** — 7-state canon not adopted at runtime; runtime still on older vocabulary (§4). |
| `LIVE` term | Manifest/2.19D: retired (→ `READ_ONLY_PROOF`/`LIVE_ACTION`) | n/a | n/a | n/a | **Minor** — `README` still lists bare `LIVE` (Q4). |
| `EXTERNAL` posture | Not defined in `os-contracts` | Used in API + Badge enums | Shown via Badge | Emitted-capable (enum member) | **Yes** — runtime term with no contract home (§4). |
| Confidence axis | `os-contracts` `SourceConfidence` (separate axis) | API/studio lowercase `high\|medium\|low`; no authority axis at runtime | lowercase | lowercase | **Minor** — casing/axis mismatch to confirm on binding. |
| `/source-status` contract | pnpm-workspace doctrine: contract-first via OpenAPI | `openapi.yaml` defines only `/healthz` | `SystemStatus` raw `fetch` + hand-typed interfaces | route returns Zod-validated payload (server only) | **Yes** — endpoint outside the generated contract (Q1). |
| DB | Schema empty; not used yet | `lib/db` empty schema | n/a | n/a | **Minor** — `post-merge.sh` still runs `db push` (Q5). |
| SEO origin | Foundation is private/not deployed | `CANONICAL_ORIGIN`/sitemap/robots pinned to `thesyndicate.money`, `index,follow` | OG/canonical emitted | n/a | **Minor** — publish posture ahead of deploy posture (§10). |

---

## 13. Risk Register

| ID | Category | Finding | Severity | Evidence | Why it matters | Recommended action | Suggested slice |
|---|---|---|---|---|---|---|---|
| R1 | Architecture / Truth | `os-contracts` `SourcePosture` is the canon but is imported by no runtime code; 3+ posture vocabularies diverge | HIGH (DEFER — authorized in 2.19F) | `lib/os-contracts/src/source-boundary.ts`; §4 | A canon nothing conforms to lets new surfaces pick any vocabulary → drift compounds | Bind studio `truthStatus`→`SourcePosture`; then converge API/Badge enums onto the contract | 2.19F + S2 |
| R2 | Architecture / Code | `/source-status` consumed via raw `fetch` + hand-duplicated client types; only `/healthz` is in OpenAPI | HIGH | `SystemStatus.tsx`; `lib/api-spec/openapi.yaml`; Q1 | Manual type drift + no client-side validation; violates contract-first doctrine | Add `/source-status` to OpenAPI, regenerate, consume generated hook + zod | S3 |
| R3 | Truth / Contract | `EXTERNAL` (runtime) has no `SourcePosture` home; `NOT_LIVE`→`NOT_WIRED`, `ADAPTER_REQUIRED`→`VERIFIED_SOURCE_PENDING_ADAPTER` mappings unencoded | MEDIUM | §4; `sourceStatus.ts:14–21` | Convergence cannot complete until each runtime term has a canonical target | Decide `EXTERNAL` (add to contract or retire) and encode the alias map | S2 |
| R4 | Code / DRY | Duplicate 6-value `Posture` enum in API and studio | MEDIUM | `sourceStatus.ts`; `PostureBadge.tsx` | Two copies must move in lockstep by hand | Replace both with the single `os-contracts` source | S2 |
| R5 | Docs | `README` still lists bare `LIVE` posture | LOW | `README.md` | Stale term contradicts retired-`LIVE` doctrine | One-line README precision patch | S4 |
| R6 | SEO / Posture | Canonical origin + sitemap/robots + `index,follow` pinned to `thesyndicate.money` while repo is private/undeployed | LOW (DEFER) | `index.html`, `sitemap.xml`, `robots.txt`, `seo-route-registry.ts` | Latent indexability/origin assumptions could surprise at first deploy | Confirm domain ownership + intended index posture before any public deploy | pre-deploy |
| R7 | Ops | `post-merge.sh` runs `db push` against an empty schema on every merge | LOW | `scripts/post-merge.sh` | Couples merges to a reachable DB for no current benefit | Gate `db push` on a non-empty schema, or document the `DATABASE_URL` expectation | S4/ops |
| R8 | Confidence axis | Runtime confidence is lowercase + no authority axis vs `os-contracts` separate axes | LOW | `sourceStatus.ts:35`; `os-contracts` | Minor mismatch to resolve when binding | Align casing / add authority axis during convergence | S2 |

No `BLOCKER`-severity findings.

---

## 14. Recommended Repair / Implementation Sequence

> Order chosen to make `os-contracts` the single runtime canon first, then close the
> contract-pipeline gap, then tidy docs/ops, then resume the manifest's build order.
> All early slices are type/label-level with **no data wiring** and remain
> founder-gated.

**S1 — 2.19F: Studio `TruthStatus`→`SourcePosture` runtime binding** *(the proposed, not-yet-authorized slice)*
- **Goal:** make `os-contracts` actually used; implement the runtime
  `TruthStatusPostureMap` so each studio reason code resolves to a `SourcePosture`.
- **Allowed changes:** `artifacts/studio/src/config/*` (binding), import from
  `@workspace/os-contracts`, type-level only.
- **No-touch:** no API behavior, no canon values, no payload shape, no new runtime
  deps beyond the workspace reference, no data wiring.
- **Acceptance:** `typecheck` + `verify:canon` pass; `/api/source-status` unchanged;
  rendered `TruthLabel` meaning unchanged; no new vocabulary introduced.

**S2 — API/Badge posture convergence onto `SourcePosture`**
- **Goal:** retire the duplicate older 6-value enums; map `ADAPTER_REQUIRED`→
  `VERIFIED_SOURCE_PENDING_ADAPTER`, `NOT_LIVE`→`NOT_WIRED`, and resolve `EXTERNAL`
  (add a contract value or retire it); align the confidence/authority axes.
- **Allowed changes:** `artifacts/api-server/src/data/sourceStatus.ts` (enum/types
  only), `artifacts/studio/src/components/PostureBadge.tsx`, `lib/os-contracts`.
- **No-touch:** payload `value`s stay `null`; the exact 20-category set is unchanged;
  no live data.
- **Acceptance:** `verify:canon` still reports 20 categories; `build` + full
  `typecheck` pass; payload posture labels map 1:1 to the prior set (or a documented,
  founder-approved relabel).

**S3 — Bring `/source-status` into the OpenAPI contract**
- **Goal:** end the raw-`fetch`/hand-typed-interface bypass.
- **Allowed changes:** `lib/api-spec/openapi.yaml` (+ regenerated client/zod
  outputs), `artifacts/studio/src/pages/SystemStatus.tsx` (use generated hook + zod),
  `artifacts/api-server` route wired to the shared schema (response unchanged).
- **No-touch:** no value wiring; payload shape preserved.
- **Acceptance:** `codegen` clean; `typecheck` passes; client validates the payload
  via generated zod at runtime; no duplicated client interface remains.

**S4 — Docs/ops precision patch**
- **Goal:** remove bare `LIVE` from `README`; align posture list to the 7-state
  canon; note the confidence-axis casing; gate `post-merge` `db push` on a non-empty
  schema (or document the expectation).
- **Allowed changes:** `README.md`, `scripts/post-merge.sh` (guard only).
- **No-touch:** no app/API/canon behavior.
- **Acceptance:** docs match runtime; merge no longer assumes a DB without schema.

**S5 — Adapter interface stubs (NOT_WIRED, no bodies)** *(manifest §14 #3)*
- **Goal:** declare the 9 adapter seams as type-only interfaces, each `NOT_WIRED`.
- **Allowed changes:** `lib/os-contracts` (interfaces/signatures only).
- **No-touch:** no fetch, no compute, no runtime, no data.
- **Acceptance:** `typecheck` passes; nothing imports a live source.

**S6 — (later) Member-surface auth scaffolding** *(manifest §14 #5)* — gated,
source-boundary-safe, **no member data wired**; privacy review required.

**S7 — (later) Admin/operator console shell behind auth** *(manifest §14 #6)* —
`ADMIN_ONLY` shell, **no real controls** until the upgrade gate passes.

**Explicitly NOT yet:** live read-model / indexer, any `LIVE_ACTION`/write, homepage
module expansion, running the `avalanche-*-check` scripts as part of any gate, making
the repo public, or deploying.

---

## 15. Architect's Readback

- **What kind of system is this becoming?** A protocol *operating system* with three
  graduating surfaces (public visitor → authenticated member → private
  operator/admin) sitting on a strict source-boundary spine: server-side canon +
  provenance → posture-only read models → truth-labeled UI, with adapters/indexers
  added only behind a verified-source + approval gate. It is deliberately *not* a
  marketing site and *not* a fake-live demo.
- **What is already strong?** Verification health; fail-closed payload discipline;
  pervasive truth labeling; server-side-only canon with recorded provenance; clean
  monorepo boundaries; a complete, route-accurate SEO layer; and a clear, written
  doctrine that the code actually follows.
- **What is not yet harmonized?** The posture/status vocabularies. The canonical
  contract (`os-contracts`) exists but is unused; the runtime still speaks an older
  6-value posture dialect in two duplicated places; and the one dynamic endpoint sits
  outside the contract-first pipeline.
- **Biggest architectural risk:** vocabulary drift — a canon nothing conforms to,
  plus duplicated enums, will compound every time a new surface is added. (R1/R4)
- **Biggest product/UX risk:** low today thanks to Homepage Governance; the latent
  risk is module sprawl / honesty erosion as member/admin surfaces graduate — keep
  every new value bound to one posture vocabulary and a `TruthLabel`.
- **Biggest safety/privacy risk:** currently well-contained. The standing risk is the
  boundary between server-side canon (addresses/ABIs) and any future public
  read-model — it must stay fail-closed exactly as `assertPayloadDiscipline` enforces
  today. (No active breach.)
- **What should definitely not be built yet?** Live reads/indexers, any write/
  `LIVE_ACTION`, real member/admin behavior, public deploy, or repo-public — all
  remain gated.
- **Next highest-leverage slice:** S1 (2.19F binding) **paired with** S2 (API/Badge
  convergence) — together they make `os-contracts` the single runtime posture canon
  and stop the drift at its source.
- **If I inherited this repo:** I would authorize 2.19F immediately, but scope it (or
  its immediate successor) to converge the **API and `PostureBadge`** onto
  `SourcePosture` too — not just the studio — and fold in the `/source-status`
  OpenAPI adoption (S3). That trio turns four vocabularies into one and closes the
  only structural debt before any further surface or source work.

---

## 16. Final Verdict

The Syndicate OS foundation is **healthy, honest, and safe — `READY_FOR_TARGETED_REPAIRS`**;
the immediate next slice should be **2.19F (studio `TruthStatus`→`SourcePosture`
binding), scoped to also converge the API and `PostureBadge` posture enums onto the
`os-contracts` canon**, so the system speaks a single posture vocabulary before any
new surface or source work begins.
