# Slice 2.18K — New Repo / Source-of-Truth Foundation Plan

**Status:** READ-ONLY / REPORT-ONLY. No GitHub repository created; nothing
pushed, committed, or published; no code implemented; no homepage rewrite; no
changes to routes, UI, API, SEO, contracts, assets, domain, deployment, config,
feature flags, package files, memory files, or internal index files. This slice
is the **final source-boundary and clean-repo foundation plan** that must precede
repo creation (2.18L) — it is **not** the repo creation.

**Operating rule:** *"Create an inspectable OS repo, not a landfill."*
**Doctrine preserved:** homepage stays clear; public/private boundary respected;
truth labels preserved; no fake-live modules; no yield/passive-income/reward/
speculation language; no private/control-tower leakage; no addresses/tx hashes/
PII unless explicitly approved and necessary. Contracts/wallets referred to **by
name only** throughout this report.

**Inputs synthesized:** 2.18J (Product Intelligence / Content Placement / Action
Map), 2.18I + 2.18I-B + 2.18I-C (the three harvests), and the live workspace tree
+ `package.json` / `pnpm-workspace.yaml` / `.gitignore` / `.replitignore` / route
+ module + truth-status config + vendored-canon layout.

> **Ground-truth reality check performed for this plan (no values printed):**
> the workspace currently contains real `0x` contract addresses inside
> **server-side canon** (`contracts/syndicate-config.ts`, `contracts/contract-registry.ts`,
> `contracts/abi/archive-nft-abi.ts`) and the api-server guard scripts; long-hex
> strings inside the ABI / event-registry files are **keccak event-topic hashes
> and function selectors** (legitimate ABI artifacts, not secrets); there are
> **no `.env` files, no API keys, no private keys, and no emails/PII** in tracked
> source; the member roster / origin freeze was deliberately never vendored; the
> only git remote is `gitsafe-backup` (not the old TheSyndicate). `.agents/`,
> `attached_assets/`, `.local/`, and `.cache/` are already git-ignored.

---

## 1. Executive Verdict

- **Ready to plan the new repository?** **Yes.** The source universe is complete
  (2.18I/I-B/I-C) and the product map is decided (2.18J); the workspace tree,
  config, and sensitive-pattern reality are now known. This document is that plan.
- **Ready to create/push it now?** **No.** Three things must be decided/verified
  first (see below). Creation/push is **2.18L only, after founder approval**.
- **What must be decided before 2.18L:**
  1. **Repo identity + visibility** (name; **private vs public initially**).
  2. **The address posture** — the single biggest boundary call: server-side
     canon currently contains real `0x` addresses. *Private repo:* addresses stay
     as server-side canon (consistent with doctrine) — approved exception.
     *Public repo:* addresses become publicly visible in source → **FOUNDER
     DECISION REQUIRED** (scrub to env/server-only, or accept that on-chain
     addresses are inherently public, before any public push).
  3. **The audit/strategy inclusion call** — whether internal harvest/audit
     reports and the master operating map ship (in a *private* repo) or stay out
     entirely. Default: **out**.
- **Clean repo's purpose (one paragraph).** A single, inspectable, source-of-truth
  candidate for **The Syndicate OS**: the proof-first, read-only foundation (public
  front door + operator console), the truth/status spine, the posture-only API,
  and the name-only canon — clean enough that a reviewer can trust *exactly* what
  is real, what is `NOT_WIRED`, and what is future, with **no** fake-live surfaces,
  no forbidden financial framing, no private/control-tower material, and no
  secrets/PII. It is the aligned baseline future build slices branch from — not a
  dump of every audit, prompt, reference clone, or idea.

---

## 2. Recommended Repo Identity

| Field | Recommendation |
| --- | --- |
| **Repository name options** | `syndicate-os` · `thesyndicate-os` · `TheSyndicateOS` · `The-Syndicate-OS` |
| **Preferred repo name** | **`syndicate-os`** |
| **Public title** | **The Syndicate OS** |
| **Short description** | "Proof-first, read-only foundation for The Syndicate — a membership/recognition protocol. Every value is verifiable or truth-labelled; no fake data." |
| **Visibility (initial)** | **Private** |
| **Owner** | `duniterum` (new repo → `duniterum/syndicate-os`) — **separate from** `duniterum/TheSyndicate` |

**Reason.** `syndicate-os` is short, lowercase (GitHub-conventional, avoids
case-sensitivity friction), product-accurate, and leaves room to grow beyond
"Studio". **Private initially** is strongly recommended because (a) it cleanly
resolves the address posture — server-side canon addresses in a *private* repo are
consistent with the existing doctrine, deferring the public-scrub decision until
truly needed; (b) it lets the founder and reviewers inspect and align the clean-room
candidate *before* any public exposure; (c) a name-only public posture can be
adopted later as a deliberate, verified step. Flip to public only after the address
decision is made and the pre-push scan gate (§6) passes for a public posture.

---

## 3. New Repo Scope Boundary

### INCLUDE — the clean source of truth

| Material | Notes |
| --- | --- |
| `artifacts/studio/` | The web app: public front door + operator console foundation. Core product. |
| `artifacts/api-server/` | Posture-only Express API (`/api`, `/api/healthz`, `/api/source-status`). |
| `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`, `lib/db` | Shared workspace libs (contract-first codegen, zod, db schema). |
| `scripts/` (`post-merge.sh`, `src/`, `package.json`, `tsconfig.json`) | Shared utility scripts (verification home — see §6). Exclude `tsconfig.tsbuildinfo`. |
| Name-only canon **structure** under `artifacts/api-server/src/canon/the-syndicate/` (ABIs, registries, event taxonomy, archive ID registry, `PROVENANCE.md`) | Real pinned canon. **Address posture is a §5/§6 founder decision** for public repos. |
| Root config: `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.npmrc`, `tsconfig.base.json`, `tsconfig.json` | Reproducible monorepo build. |
| `.gitignore` (augmented per §6), a new top-level `README.md` (authored in 2.18L) | Repo hygiene + entry doc (no secrets/addresses/PII). |
| `replit.md` | Project overview + doctrine + homepage governance + forbidden-copy list. Public-safe (no secrets); founder may redact the "User preferences" section if desired. |

### EXCLUDE — must not enter the repo

| Material | Why |
| --- | --- |
| `node_modules/`, `dist/`, `out-tsc/`, `*.tsbuildinfo`, `.cache/`, `/tmp`, build artifacts | Dependencies/build output — already git-ignored; never source. |
| `.env*`, any secret/key/token files | Secrets live in the Replit env store (e.g. `SESSION_SECRET`), never in source. |
| `.agents/` (agent memory + topic files) | Internal session memory — already git-ignored. Not product. |
| `attached_assets/` (founder prompt pastes, pasted text, screenshots) | Internal founder/session context — already git-ignored. Not product. |
| `.local/` (Replit skills/state) | Replit internal tooling — already git-ignored. |
| `/tmp` reference clones (Supa-Exchange, entity-chain, auditclaw-site, navi-portfolio-agent, external TheSyndicate) | Reference/pattern sources only — **never** vendored or pushed. |
| `artifacts/mockup-sandbox/` | Explicitly **non-product** design sandbox (`replit.md`). Keep the repo product-only (see §5 — founder may override). |
| Contract addresses / tx hashes (in any public-repo scenario) | Name-only public doctrine — see §5/§6 founder decision. |
| Member/user PII, member roster, origin freeze | Privacy/legal class; deliberately never vendored — keep it that way. |
| Private strategy / legal / CFO / LP / economic strategy | Confidential business material — none currently in source; keep out. |
| Replit/Hermes/control-tower/Dave/Paperclip/internal-workflow references | Private control-plane material — must not leak into a clean OS repo. |
| Logs / cache / scratch / `*.log` | Ephemeral; not source. |

### FOUNDER DECISION REQUIRED — only after explicit approval

| Material | Default | Decision needed |
| --- | --- | --- |
| **Contract addresses in server-side canon** (`syndicate-config.ts`, `contract-registry.ts`, `archive-nft-abi.ts`) + guard scripts | Keep server-side **iff repo private**; **scrub/relocate before any public push** | Private repo: accept as-is. Public repo: scrub to env/server-only OR explicitly accept on-chain addresses as public. |
| `docs/audits/*` (incl. `SLICE_2_18I/I-B/I-C/J/K`, SEO/wayfinding audits) | **Exclude** | Founder may include in a **private** repo as an `architecture/` reference; never in a public repo by default. |
| `docs/phase1-*` ledgers + `the-syndicate-master-operating-map.md` (root) | **Exclude** | Internal reconciliation/strategy — private-repo-only if included at all. |
| `replit.md` "User preferences" / "Gotchas" sections | Include | Founder may redact founder-specific preferences before public exposure. |
| Replit platform files (`.replit`, `.replitignore`) | Include if repo stays Replit-hosted | Strip if the repo is meant as a platform-neutral pure source-of-truth. |
| `artifacts/mockup-sandbox/` | Exclude | Include only if the founder wants the design sandbox in the same repo. |

---

## 4. Proposed Folder Structure

> **Honesty / low-drift recommendation:** the current monorepo already uses a
> proven `artifacts/* + lib/* + scripts` layout wired into `pnpm-workspace.yaml`,
> `tsconfig.*`, and the artifact/proxy system. **Renaming to `apps/` + `packages/`
> is a restructure** (config + path churn) and is therefore **out of scope for the
> read-only plan and for 2.18L** — it would risk implementation drift and break the
> workflow/proxy wiring. **Recommendation: push the first commit with the existing
> structure**, and treat any `apps/`+`packages/` rename as a *separate future
> refactor slice*. The table maps the prompt's idealized names to the real paths.

| Idealized name (prompt) | Recommended actual path (first push) | Purpose | Belongs there | Must NOT be there |
| --- | --- | --- | --- | --- |
| `apps/web` (studio) | `artifacts/studio/` | Public front door + operator console foundation | React/Vite app, pages, components, config spine (`truthStatus`, `surfaceStatus`, `modules`, `navigation`, `brand`, `syndicateFacts`) | Live chain reads, fake data, addresses, PII |
| `apps/api` | `artifacts/api-server/` | Posture-only API + server-side canon + guard scripts | Express routes, `/api/healthz`, `/api/source-status` (posture-only), name-only canon | Secrets, write paths, exposed addresses (public-repo) |
| `packages/shared` | `lib/api-client-react`, `lib/api-spec`, `lib/api-zod`, `lib/db` | Contract-first shared libs | OpenAPI spec, generated hooks, zod schemas, db schema | App-specific code, secrets |
| `packages/canon` | `artifacts/api-server/src/canon/the-syndicate/` *(stays here for first push)* | Pinned name-only canon | ABIs, registries, event taxonomy, archive IDs, `PROVENANCE.md` | Addresses in public repo (founder decision), tx, PII |
| `docs/public` | `docs/` (curated public subset) | Public-safe explanation (canon-derived / whitepaper / doctrine) | Product overview, truth doctrine, homepage governance | Internal audits, strategy, addresses |
| `docs/architecture` | `docs/architecture/` *(new, optional)* | Architecture references for reviewers | Surface ownership, adapter-seam interfaces (from 2.18J) | Private strategy, secrets |
| `docs/audits` (public-safe?) | **Excluded by default** | Internal planning ledger | *(nothing in public repo)* — private-repo-only if founder approves | Any public exposure without approval |
| `scripts/verification` | `scripts/` | Verification + post-merge utilities | Pre-push scan gate (§6), canon-integrity checks | Secrets, destructive ops |
| `config` | root (`tsconfig.*`, `pnpm-workspace.yaml`, `.npmrc`) | Build/workspace config | Workspace + TS config | Secrets |
| `tests` | *(none yet)* | Future automated tests | Unit/e2e once added | — |
| `.github/workflows` | `.github/workflows/` *(optional, 2.18L or later)* | CI home for the scan gate | A single pre-push/secret-scan workflow | Secrets in workflow YAML (use GitHub secrets) |

---

## 5. Public / Private / Founder-Only Classification

> Rule applied: **if uncertain → FOUNDER DECISION REQUIRED or PRIVATE ONLY.**

| Material | Public-safe? | Private-only? | Founder decision? | Reason | Action before push |
| --- | --- | --- | --- | --- | --- |
| `SLICE_2_18I` / `I-B` / `I-C` harvest reports | No | Yes | Yes | Name reference repos + internal strategy | Exclude (or private-repo-only if approved) |
| `SLICE_2_18J` Product Intelligence map | No (default) | Yes | Yes | Full internal product/IA strategy | Exclude; founder may keep in private repo |
| This `SLICE_2_18K` report | No (default) | Yes | Yes | Repo boundary/strategy | Exclude; founder may keep in private repo |
| Earlier SEO/wayfinding audits (`2_18A/B/C/E/G`, `2_17`, `2_18 Discovery`) | Partly | Partly | Yes | Mostly technical; some internal | Default exclude; founder may include curated |
| Harvest reports / source-universe findings | No | Yes | Yes | Reference-repo + strategy detail | Exclude |
| Private operator cockpit ideas | No | Yes | Yes | Control plane | Never public; exclude |
| AI / control-layer references | No | Yes | Yes | Control plane | Never public; exclude |
| Replit/Hermes/internal-workflow references | No | Yes | Yes | Internal tooling | Exclude / scrub |
| Legal / CFO / LP / economic strategy | No | Yes | Yes | Confidential | Never public; exclude |
| Member PII / roster / origin freeze | No | Yes | Yes (privacy policy) | Privacy/legal | Never include |
| Contract addresses / tx hashes | No (public repo) | Server-side (private repo) | **Yes** | Name-only public doctrine | Private: keep server-side. Public: scrub/accept decision |
| Name-only contract registry (names/roles/status) | Yes | — | — | No secrets; doctrine-aligned | Include |
| Public docs / whitepaper / canon (curated) | Yes | — | Partly | Explanatory backbone | Include curated subset |
| `replit.md` doctrine / homepage governance | Yes | — | Partly | No secrets | Include (optionally redact preferences) |
| App source (`artifacts/studio`, `api-server`), `lib/*`, scripts, config | Yes | — | — | The product itself | Include |
| `artifacts/mockup-sandbox` | Partly | — | Yes | Non-product sandbox | Default exclude |
| `the-syndicate-master-operating-map.md` | No | Yes | Yes | Internal master strategy | Exclude (private-only if approved) |

---

## 6. Secret / PII / Address / Risk Scan Gate

A **mandatory, fail-closed pre-push gate**. If any rule matches and is not on the
explicit founder-approved allowlist, **the push is blocked** — no partial pushes.
*(This section is a plan; no scripts are written here. An existing
`artifacts/api-server/scripts/verify-canon-integrity.ts` can be extended later as
the gate's home — do not modify it in this slice.)*

### Tier A — ALWAYS FAIL (true secrets; no exceptions ever)

| Risk | Pattern (ripgrep, illustrative) |
| --- | --- |
| `.env` / secret files staged | path match `(^|/)\.env(\.|$)`, `secrets?\.(json|ya?ml|txt)$` |
| Private keys | `-----BEGIN [A-Z ]*PRIVATE KEY-----` |
| Mnemonic / seed phrase | `\b(?:[a-z]{3,8}\s+){11,23}[a-z]{3,8}\b` near `mnemonic`/`seed`; literal `mnemonic`/`seedPhrase` assignments |
| Generic API keys / tokens | `sk-[A-Za-z0-9]{20,}`, `AKIA[0-9A-Z]{16}`, `ghp_[A-Za-z0-9]{36}`, `xox[baprs]-[A-Za-z0-9-]+`, `AIza[0-9A-Za-z_\-]{35}` |
| Telegram bot token | `\b\d{8,10}:[A-Za-z0-9_-]{35}\b` |
| OpenAI/Anthropic/etc keys | `sk-ant-`, `sk-proj-`, bearer-style secrets |
| Hardcoded password assignment | `(?i)(password|passwd|secret|api[_-]?key)\s*[:=]\s*["'][^"']+["']` |
| Wallet private-key generation in client | `generateWallet\(`, `Wallet\.createRandom\(`, `new ethers\.Wallet\(` exposing keys client-side |

### Tier B — FAIL UNLESS FOUNDER-APPROVED (visibility-conditional)

| Risk | Pattern | Disposition |
| --- | --- | --- |
| `0x` contract/wallet address | `0x[a-fA-F0-9]{40}\b` | **Private repo:** approved exception (server-side canon). **Public repo:** blocks until founder scrubs or explicitly approves. |
| Transaction hash | `0x[a-fA-F0-9]{64}\b` **outside** ABI/event files | Blocks (public + private) — tx hashes are not part of name-only canon. |
| Email PII | `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}` | Blocks (allow only intentional contact addresses if founder-approved). |
| Phone PII | `\+?\d[\d \-()]{7,}\d` near `phone`/`tel` | Blocks pending review. |
| Internal refs (public repo) | `(?i)(hermes|control[- ]?tower|paperclip|\breplit[- ]?secret)` | Blocks for public repo; review for private. |
| `/tmp` clone reference | `/tmp/(thesyndicate|supa|entity-chain|auditclaw|navi)` | Blocks — reference clones must not be referenced. |

### Allowed exceptions (explicit, scoped, documented)

- **Keccak event-topic hashes & function selectors** (`0x[a-fA-F0-9]{64}` and 4-byte
  selectors) **inside** `…/canon/the-syndicate/contracts/abi/**` and
  `…/canon/the-syndicate/proof/protocol-event-registry.ts` — these are legitimate
  ABI artifacts, **not** secrets/tx. Allowlisted by path + context.
- **Server-side `0x` addresses in a private repo** — approved while visibility is
  private; this exception is **revoked automatically** the moment the repo is
  proposed for public.
- Every exception lives in a checked-in `scan-allowlist` with a one-line reason;
  **adding/removing an exception is a founder-only action.**

### On failure / approval authority

- **On failure:** the gate exits non-zero, prints **offending file paths + rule
  IDs only (never the matched secret value)**, and blocks the push. Remediation =
  scrub the value, move it to the env store, or (Tier B only) obtain a
  founder-approved allowlist entry. Re-run until green.
- **Who approves exceptions:** the **founder only**. No Tier-A exception is ever
  permitted.

---

## 7. Canon / Truth Status Preservation

The repo must carry the honesty engine forward **unchanged in spirit** — no fork,
no new status literals, no fake-live:

- **`surfaceStatus`** — remains the single cross-page status map; one source of
  truth, not duplicated per page.
- **`TruthStatus` enum** — preserved verbatim (`NOT_LIVE`, `DESIGN_PREVIEW`,
  `FUTURE_MODULE`, `EVENT_ADAPTER_NOT_WIRED`, `SOURCE_INDEXER_NOT_WIRED`,
  `ARCHIVE_READS_NOT_WIRED`, `AWAITING_CHAIN_INDEX`, `SYNDICATE_INDEXER_NOT_WIRED`,
  `AWAITING_FOUNDER_APPROVAL`, `LIVE_SOURCE_MISSING`).
- **`NOT_WIRED` labels** — every chain/receipt/economy/member surface stays
  `NOT_WIRED`/`FUTURE` with a `TruthLabel`; nothing is upgraded to LIVE by the act
  of moving repos.
- **Name-only contract registry** — names/roles/status preserved; addresses governed
  by §5/§6 (server-side/private or scrubbed/public).
- **Source-of-truth hierarchy** — **code > vendored canon > docs**; `PROVENANCE.md`
  (pinned commit) travels with the canon so provenance is auditable.
- **No fake-live posture** — `/api/source-status` stays posture-only; no simulated
  values, no placeholder addresses, pending entries keep `null`.
- **Product Intelligence surface ownership (2.18J)** — surfaces map to their owners
  exactly as decided; future surfaces remain clearly future.
- **Homepage governance** — the fixed `/` section model (Hero · Promoted Strip ≤4 ·
  How-It-Works · Real-vs-Pending · Studio Teaser · Expectations), single primary
  CTA, labels bound to `surfaceStatus`; carried in `replit.md`.
- **Public/private boundary** — excluding the audits/strategy from the repo is what
  *keeps* the boundary intact; the repo shows the product, not the war room.

---

## 8. Branch / Commit / Push Protocol

| Decision | Recommendation |
| --- | --- |
| **Create repo** | New empty `duniterum/syndicate-os` (no auto-README that would conflict); **private**. |
| **Initial branch** | `main` (single clean history). |
| **Staging branch?** | Optional `chore/initial-foundation` → open a PR into `main` for reviewability if the founder wants a review gate; otherwise push `main` directly (acceptable for a brand-new private repo). |
| **Push main directly vs staging** | Private repo: direct `main` is fine. If/when public: use the staging-branch + PR review path. |
| **Private first, public later** | **Yes** — start private; flip to public only after the address decision + a public-posture scan pass. |
| **CLI vs Replit integration** | Use the **Replit GitHub integration** (managed auth) at 2.18L, or `gh` CLI — either is fine; connect GitHub via the integrations skill first. |
| **Commit message pattern** | Conventional, e.g. `chore: initial clean source-of-truth foundation (read-only, truth-labelled, name-only)`; subsequent slices `feat:`/`fix:`/`docs:` scoped. |
| **Tag initial snapshot** | Yes — tag `v0.1.0-foundation` on the first clean commit. |
| **Avoid overwriting old TheSyndicate** | Create a **new** repo; **never** add `duniterum/TheSyndicate` as a remote; never `push --force` anywhere. |
| **Prove remote is the new repo** | Before push, run `git remote -v` and confirm `origin` → `…/duniterum/syndicate-os(.git)` and **not** `…/TheSyndicate`; the current sole remote is `gitsafe-backup` (leave intact), add `origin` explicitly and verify the URL string. |

---

## 9. GitHub Creation Readiness Checklist (for 2.18L)

- [ ] Repo **name** approved (`syndicate-os`).
- [ ] **Visibility** approved (private initially).
- [ ] **INCLUDE / EXCLUDE** list (§3) approved.
- [ ] **Folder structure** (§4) approved (existing layout; no rename in 2.18L).
- [ ] **Private/public audit-inclusion** decision (§5) approved.
- [ ] **Address posture** decision (§1/§5/§6) made for the chosen visibility.
- [ ] **Pre-push scan gate** (§6) ready and dry-run green (Tier A clean; Tier B
      resolved or allowlisted).
- [ ] **`.gitignore`** augmented (already excludes `.agents/`, `attached_assets/`,
      `.local/`, `.cache/`, `dist`, `*.tsbuildinfo`); add `/tmp` clone paths +
      `scan-allowlist` policy if needed.
- [ ] **Git remote target verified** (`origin` = new repo, not TheSyndicate).
- [ ] **Clean working tree verified** (`git status` clean; no stray artifacts).
- [ ] **No secrets/PII/address leak** verified by the gate.
- [ ] **No implementation drift** (no code/UI/route/config changes snuck in).
- [ ] **`pnpm run typecheck`** passes on the to-be-pushed tree.
- [ ] **Founder final approval** to create + push.

---

## 10. 2.18L Allowed Action Envelope

**Allowed (only if founder-approved and the §9 checklist is green):**
- Create the new GitHub repo under `duniterum` (private; name `syndicate-os`).
- Initialize the clean source tree per §3/§4 (existing structure).
- Run the §6 pre-push verification gate (fail-closed).
- Push the initial clean commit to `main`; tag `v0.1.0-foundation`.
- Report back the **remote URL** and the **commit SHA**.

**Not allowed in 2.18L:**
- Implement new features or change behavior.
- Change the homepage, routes, UI, API, or config.
- Wire live data / chain reads / contracts / payments.
- Import or vendor any reference repo (`/tmp` clones).
- Expose private reports/strategy/addresses/PII without explicit approval.
- Push to `duniterum/TheSyndicate` (or any existing repo) / force-push.
- Publish or deploy.
- Include secrets/PII/addresses/tx hashes unless explicitly approved for the
  chosen visibility.

---

## 11. Risks If We Skip 2.18K

- **Private leakage.** Without the boundary + gate, `.agents/` memory,
  `attached_assets/` founder prompts, harvest/audit strategy, or server-side
  addresses could be pushed — especially to a *public* repo. (Several are
  git-ignored today, but an ad-hoc `git add -A` or a public flip could still expose
  addresses and audits.)
- **Wrong repo target.** Pushing to `duniterum/TheSyndicate` instead of a new repo
  could overwrite or pollute the authority repo — irreversible damage.
- **Audit dump (landfill).** Shipping every audit/ledger/prompt turns the
  "source-of-truth candidate" into noise a reviewer can't trust — the exact
  failure this slice prevents.
- **Future-as-live confusion.** Without preserving truth labels + excluding
  strategy docs, a reviewer could read aspirational/future surfaces as live —
  breaking the radical-honesty doctrine and creating legal/trust risk.
- **Stale reference contamination.** Reference-repo patterns (Supa/entity-chain/
  etc.) or `/tmp` clone references leaking in would imply yield/gamification/
  simulated-chain posture the protocol forbids.
- **Public/private boundary failure.** One unscoped commit can cross the boundary
  permanently (git history is durable); a planned gate makes the boundary explicit
  and enforceable.
- **Reviewer cannot trust the repo.** If the first impression mixes product with
  war-room material, the repo loses its entire purpose — being the clean, aligned,
  inspectable baseline.

---

## 12. Final Recommendation

- **Should 2.18L be next after founder approval?** **Yes** — once the §9 checklist
  is green and the address/visibility decision is made, 2.18L (create private repo +
  gated clean push) is the correct next step.
- **Recommended repo name:** **`syndicate-os`** (`duniterum/syndicate-os`).
- **Start public or private?** **Private** — flip to public later only after the
  address decision and a public-posture scan pass.
- **What must be approved before creation:** repo name + visibility; INCLUDE/
  EXCLUDE list; folder structure (existing layout, no rename); audit-inclusion
  decision; the **address posture**; and a green pre-push scan gate.
- **Single highest-leverage next action:** **finalize the address posture +
  visibility decision** (private repo + addresses stay server-side is the clean,
  low-risk path). That one decision unblocks the gate configuration and the entire
  2.18L envelope.

---

*End of report. No further action taken: no repository created, no remote added,
no push, no commit, no publish, no implementation, and no edits to product, config,
memory, or index files. All contracts/wallets referred to by name only; the actual
address/secret reality was scanned by count/location only (no values surfaced).*
