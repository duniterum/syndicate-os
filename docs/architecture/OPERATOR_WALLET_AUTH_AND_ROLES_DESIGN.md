# Operator Wallet-First Authentication + Roles/Permissions Design

- **Status:** DESIGN ONLY — founder-approved design slice, 2026-07-02. NO IMPLEMENTATION AUTHORIZED.
- **Authorizes nothing:** no route, no API endpoint, no database migration, no wallet library, no package install, no session code, no admin UI, no deploy, no publish. Every implementation step below sits behind its own future founder gate.
- **Foundations:** `CORRECTED_DOCTRINE_REHARVEST_2_20G.md` · `CAPABILITY_HARVEST_AND_REUSE_MAP.md` · `WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` (canonical identity doctrine) · the four found TheSyndicate identity docs (read in depth 2026-07-02 as historical oracle: `IDENTITY_ATTRIBUTION_CONSTITUTION.md` [canonical in origin repo], `HOLDER_INDEX_ARCHITECTURE.md` [REFERENCE_PATTERN_ONLY], `NFT_ARCHIVE_METADATA_PHILOSOPHY.md` [HISTORICAL in origin repo], `DOCUMENTATION_AUTHORITY_MAP.md` [origin-repo precedence system]) · Supa admin-shell patterns (2.20G, design inspiration only).
- **Vocabulary rule:** no new taxonomy. Domain/posture terms come from `lib/os-contracts`. The origin-canon word "payout wallet" is banned in product copy; this design uses **settlement wallet**.

---

## 0. Doctrinal position

1. **Privileged authority is wallet-first.** For founder, admins, operators, reviewers, and privileged workers, a wallet signature verified server-side against a server-side registry is the root of authority. No Google/email/Privy/Dynamic/thirdweb/Web3Auth account, frontend state, or merely-connected wallet ever grants privilege.
2. **A wallet connecting is not enough.** An operator exists only because a server-side registry row says so. (Inherited from the identity constitution: connected wallet ≠ protocol truth.)
3. **Backend enforcement only.** Frontend hiding (including the existing `VITE_OPERATOR_PREVIEW` build-time gate) is presentation/visibility, never authorization. Every privileged action is enforced at the API layer.
4. **The read-only spine stays read-only.** Auth introduces the OS's first write-capable zone (sessions, registry, audit log). That zone must be architecturally separate from the Protocol Reality Spine, which never gains write endpoints. Standing up any write-capable auth zone is itself a founder gate.
5. **Fail closed.** Unknown wallet, expired session, ambiguous role, unverifiable signature, registry unavailable → deny and log. Never a permissive default.

## A. Wallet taxonomy

| Type | Definition | May hold privilege? |
|---|---|---|
| **Login wallet** | The wallet that signed the current session challenge. Proves key control *now*, nothing else. | Only via registry lookup |
| **Operator wallet** | A wallet listed ACTIVE in the operator registry with a role. | Yes — scope = registry role |
| **Member wallet** | A wallet tied to membership truth (seat/receipt/historical identity per the identity doctrine). | No operator privilege by itself |
| **Payment wallet** | The wallet a buyer pays from during acquisition. A payment fact, not an identity. | Never |
| **Settlement wallet** | Where a verified-introduction source receives settlement (origin canon: "payout wallet" — banned copy). Changeable only by visible policy action; historical receipts keep the original. | Never |
| **Embedded wallet** | Provider-created wallet (Privy-style) for Web2 onboarding. | Never for operators |
| **External wallet** | User-controlled wallet (hardware, MetaMask, WalletConnect). | Eligible for registry listing |
| **Future smart wallet** | Contract account (Safe/AA). Reserved; per-wallet-type policy required before any registry listing. | Future gate |
| **Founder/root wallet** | The apex authority wallet(s). Registry changes at admin tier require its approval. | Yes — apex |
| **Worker/agent identity** | Scoped non-human identity (AI/automation). Not necessarily a wallet; if a wallet, still registry-scoped. | Proposal-only scopes |
| **Web2 login account** | Email/social login (future members). | Never |
| **Provider account** | Privy/Dynamic/thirdweb/Web3Auth user record. | Never |

**Non-confusion rules (binding):**
- Login account ≠ member identity. Embedded wallet ≠ member wallet (explicit primary-wallet binding required). Connected wallet ≠ protocol truth. Provider user ID ≠ Syndicate membership.
- Operator wallet ≠ member wallet unless explicitly allowed in the registry row — and even then every action is permission-scoped; membership grants no operator power and operator role grants no membership.
- Payment wallet ≠ member wallet unless explicitly selected by the member at purchase time.
- Settlement wallet ≠ source identity (identity constitution §16): settlement address may change by visible policy action; source identity and historical receipts never rewrite.
- Worker/agent identity can never approve recovery or change identities.

## B. Operator wallet-first authentication (SIWE-style, Avalanche/EVM)

**Login challenge (server-issued):**
- Server-generated single-use nonce (cryptographically random, stored server-side, consumed on first verification attempt — replay protection).
- Domain-bound (`domain` + `uri` fields must match the operator console origin; mismatch → reject).
- `chainId` must equal the canonical Avalanche C-Chain id from server-side canon; address field must equal the recovering address.
- Expiration: challenge valid ≤ 5 minutes (`issuedAt` / `expirationTime`).
- Statement (human-readable, in the signed message): *"Signing proves control of this wallet to log in. This is a signature, not a transaction. It moves no funds and approves nothing on-chain."*
- Backend verification: signature recovery server-side (EOA `ecrecover`-equivalent; ERC-1271 path reserved for future smart wallets, off by default).
- Then **registry lookup**: recovered address must be an ACTIVE registry row → role/permissions attach to the session. PENDING/SUSPENDED/ROTATING/REVOKED/EXPIRED → deny, log attempt. (ROTATING never grants a new login; see §C.)
- Challenge/verify endpoints are rate-limited with lockout-on-abuse (reserved design control; parameters set at implementation gate).

**Sessions:**
- Short-lived: ≤ 60 minutes absolute for operator roles (founder/root shorter, e.g. ≤ 30), server-side session store, `HttpOnly`/`Secure`/`SameSite=Strict` cookie, no token in localStorage.
- Rotation on privilege use; idle timeout (e.g. 15 min); explicit logout revokes server-side immediately.
- Revocation: registry status change (suspend/revoke) kills all live sessions for that wallet at once.
- Session binds `(wallet, role-at-login, registry-row-version)`; a registry change invalidates the session rather than silently upgrading/downgrading it.

**Step-up signatures** (fresh wallet signature over a server-issued action-specific challenge — nonce + action + target + expiry ≤ 2 min — required even inside a valid session) for:
- registry changes (add/suspend/revoke/rotate operator wallets)
- role or permission changes
- wallet rebinding approvals (member recovery finalization)
- broadcast
- exports
- feature-flag changes
- support overrides
- source/referral approvals
- future marketplace/provider-risk actions

The step-up signature (message + signature reference) is stored in the audit entry for the action it authorized.

## C. Operator wallet registry / allowlist (server-side model)

One row per operator wallet. Design-level fields:

| Field | Notes |
|---|---|
| `walletAddress` | checksummed; unique among non-revoked rows |
| `operatorLabel` | human label (person/function) — private, never public |
| `role` | exactly one role from §D |
| `permissions` | role-derived; explicit per-row narrowing allowed (never widening beyond role) |
| `status` | see lifecycle below |
| `addedBy` / `addedAt` | actor wallet + timestamp; creation is itself an audited, step-up-signed action |
| `lastLoginAt` / `lastActionAt` | operational telemetry |
| `riskFlags` | e.g. anomalous-login, pending-review |
| `expiresAt` (optional) | auto-transition to EXPIRED; renewal is a new approval |
| `notesEvidence` | private evidence references — server-only, never in any UI payload |
| `revocationHistory` | append-only prior status transitions with actor + reason |

**Status lifecycle:** `PENDING → ACTIVE → (SUSPENDED ⇄ ACTIVE) → REVOKED`, plus `ROTATING` (rotation in progress: new wallet pending finalization) and `EXPIRED`. Only ACTIVE authenticates — fail-closed: **ROTATING denies all new logins for both old and new wallet**; any existing session of the old wallet is immediately downgraded to read-only scope until finalization (then terminated). All transitions are audited, step-up-signed, and (for admin-tier rows) founder/root-approved. Revocation is memory, not deletion — rows are never physically removed.

**Critical rules:** no self-service registration; no single low-level admin can add/modify admin-tier rows; registry mutations happen only through the audited approval workflow (§F); the registry table itself lives in the future write-capable auth zone, never readable via public API.

## D. Roles and permissions

Role hierarchy (one role per registry row; least privilege; separation of duties):

| Role | Scope summary |
|---|---|
| **Founder/root** | Everything below + registry admin-tier changes + recovery final approvals + emergency suspension. Out-of-band recovery only (§F). |
| **Protocol admin** | Operational administration: flags, exports, broadcast approval, support overrides, non-admin registry proposals. Cannot touch admin-tier registry rows. |
| **Operator** | Day-to-day console operation: reports, support queue handling, content ops, read dashboards. |
| **Source/referral reviewer** | Reviews source attributions and verified-introduction requests; approves within policy; cannot change registry/flags. |
| **Member support** | Member-facing queue: view member-scoped context (least data necessary), respond, escalate. Cannot approve recovery (only process/escalate). |
| **Content/docs operator** | Public copy/docs surfaces; no member data access. |
| **Auditor/read-only** | Read audit log, registry (redacted evidence), reports. Zero mutations. |
| **Worker/agent** | §H — proposal-only defaults. |
| **Member** | Own-record surfaces only (§I). Not an operator role. |
| **Visitor** | Public read-only proof surfaces. No auth. |

**Permission matrix over the 2.20G-inherited surfaces** (✅ allowed · S = allowed with step-up · P = propose-only · R = read-only · — = none). Backend-enforced per action; frontend visibility is never the gate.

| Surface | Founder/root | Protocol admin | Operator | Source reviewer | Member support | Content/docs | Auditor | Worker/agent | Member | Visitor |
|---|---|---|---|---|---|---|---|---|---|---|
| Broadcast | S | S | P | — | — | P | R | P | — | — |
| Audit log | R (full) | R | R (own actions) | R (own domain) | R (own domain) | — | R (full) | — | — | — |
| Exports | S | S | P | — | — | — | R (metadata) | P | — | — |
| Feature flags | S | S | R | — | — | — | R | — | — | — |
| Reports | ✅ | ✅ | ✅ | R (domain) | R (domain) | — | R | R | — | — |
| Support queue | ✅ | ✅ (overrides S) | ✅ | — | ✅ | — | R | P (draft replies) | own tickets | — |
| Ambassador/introducer mgmt | S | S | P | ✅ (within policy) | — | — | R | — | — | — |
| Source/referral review | S (final) | S | — | ✅ (approve in-policy, S) | — | — | R | P | own attributions | — |
| Member cockpit (future) | R (support view, least-data) | R (support view) | — | — | R (scoped) | — | — | — | ✅ own record | — |
| Member standing | R | R | R | — | R (scoped) | — | R | — | own standing | aggregate-safe only |
| Share-card issuance (future) | S (policy) | S (policy) | — | — | — | — | R | — | ✅ own card (gated §I) | — |
| Receipt/proof views | R (admin view) | R | R (aggregate) | R (attribution context) | R (scoped) | — | R | — | own receipts | — |
| Public proof views | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

Privacy overlay: the §11 posture matrix of `WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` binds *on top of* this matrix — no role except founder/root and explicitly scoped member-support flows may see wallet↔memberNumber pairings, and no surface ever makes them public.

## E. Member wallet recovery / rebinding

**Shape: request + proof + review + approval + cooldown + audit.** Never automatic. Inherits the identity constitution's honesty rule: recovery adds visible identity history; it never rewrites chain history, and no recovery UI may imply guaranteed restoration of tokens or attributions.

Workflow:
1. **Request:** member submits old wallet, new wallet, reason/evidence. Captured into a review queue (server-only).
2. **Proof:** new wallet signature **always** required (challenge-signed). Old wallet signature required **when possible**. Supporting proof: receipt/holder-index proof, transaction/block proof, source-settlement proof if attribution is affected (per identity constitution §4).
3. **Review:** member-support processes; risk scoring (wallet age, activity mismatch, prior attempts, evidence quality); support **cannot approve** — approval requires protocol admin (standard risk) or founder/root (high risk / lost-old-wallet cases).
4. **Approval:** step-up signature by the approver; two-person rule optional at standard tier, required at high tier.
5. **Cooldown:** mandatory delay before finalization (design default: 72h standard; 7 days for lost-old-wallet), with notification/alerting to known channels and the old wallet's visible history where possible — a challenge window in which the original owner can contest.
6. **Finalization:** new wallet becomes ACTIVE for the identity **link**; old wallet becomes HISTORICAL/REPLACED — never deleted, never erased. Entry history remains with the entry wallet forever (three-layer doctrine: recovery links identity; it does not move historical identity or force token movement — SYN the protocol cannot claw back, and the design never pretends otherwise).
7. **Audit:** every step in the immutable log (§G).

**If old wallet is lost:** stronger human verification, higher approval tier (founder/root), longer cooldown, explicit risk acceptance recorded. **No automatic rebinding exists anywhere in the design.**

## F. Admin/operator wallet recovery (separate from member recovery)

- **No single low-level admin can change admin wallets.** Admin-tier registry mutations require founder/root approval + step-up signature + cooldown; two-person approval strongly recommended as default-on.
- **Operator rotation:** operator requests rotation → row enters ROTATING (new logins denied for both wallets; any live old-wallet session downgraded to read-only per §C) → founder/root approves with step-up → cooldown → new wallet ACTIVE, old wallet's history preserved in `revocationHistory`.
- **Emergency path:** founder/root (or protocol admin for non-admin tiers) can immediately SUSPEND/REVOKE any operator wallet — suspension is deliberately cheaper than addition (fail-safe asymmetry). Suspension kills live sessions instantly.
- **Founder/root recovery:** manual, high-security, out-of-band — never a dashboard action, never a support-queue item. The design deliberately does not create any online workflow capable of replacing the root wallet; a documented offline ceremony (multi-factor human verification, pre-committed secondary proof, mandatory delay) is a future founder-defined procedure. Optional hardening reserved: multiple root wallets with quorum (future smart-wallet/Safe path, §J).

## G. Audit log (immutable)

Every privileged action writes an append-only entry:

| Field | Content |
|---|---|
| `actorWallet` | the acting registry wallet (or worker identity) |
| `roleAtTime` | role snapshot when the action happened |
| `action` / `target` | verb + object (registry row, flag, broadcast id, recovery case, export id) |
| `beforeAfterSummary` | redacted-safe state delta |
| `timestamp` | server time (+ block anchoring reserved as a future integrity option) |
| `ipDeviceMeta` | if appropriate — private, server-only, never surfaced publicly |
| `reason` / `evidenceRef` | actor-entered reason; private evidence pointer |
| `approvalChain` | who proposed / reviewed / approved (each with role) |
| `stepUpSigRef` | reference to the stored step-up challenge + signature |
| `cooldownFinalizedAt` | for cooldown-gated actions |

Rules: append-only storage posture (no UPDATE/DELETE path in the design); hash-chaining reserved as an integrity upgrade; auditor role reads full log; log is server-only (never a public API); log entries themselves contain no secrets, no full member PII beyond what the action required, and follow the privacy matrix. Aligned with the Supa admin-shell inheritance (2.20G): broadcast authorship vs notification fan-out separated; feature-gated progressive exposure; every operator action audited — adopted as patterns, not copied as code.

## H. Worker / AI agent identities

- Registry-scoped identities with explicit `scope` and `expiresAt` — expiry mandatory, renewal is a new approval.
- Default posture: **read-only or proposal-only.** A worker may draft (broadcast drafts, report drafts, export requests, support reply drafts, source-review recommendations); a human role with the matching permission must approve with step-up.
- Hard prohibitions (non-configurable): no recovery approval; no wallet rebinding; no registry/role changes; no root/admin changes; no unsupervised broadcast; no deploy/publish authority; no permission self-extension.
- Full audit logging of every worker action, tagged as worker-initiated with the supervising approval chain.

## I. Member and visitor identity model

- **Visitor:** public proof surfaces only; no auth, no wallet prompt, no tracking of wallets.
- **Crypto-native member:** wallet signature (same SIWE-style challenge, member-scoped) + protocol verification against membership truth (receipt/holder truth per the identity doctrine). Login proves key control; membership facts come from the server-side truth model — never from the session itself.
- **Web2 future member (reserved):** Web2 login + provider embedded wallet + **explicit primary member-wallet binding** (a visible, recorded act — never automatic). Provider account is convenience; the bound wallet + protocol truth remain the identity. The crypto-native path must never be degraded to force provider onboarding (identity constitution §5).
- **Member cockpit (future):** gated by verified membership (receipt/holder truth), scoped strictly to the member's own record; must never blur "you are seated" (live balance) with "this entry history is yours" (historical identity).
- **Share-card (future):** gated by identity doctrine + member status; card contents follow the privacy matrix (no wallet↔memberNumber public pairing).
- **Source/referral tooling (future):** double-gated — auth (this design) AND source safety (separate founder gate); attribution surfaces show only the member's own attributions.

## J. Future provider compatibility (design reservations only)

- **Member-onboarding conveniences (never admin authority):** Privy · Dynamic · thirdweb Wallets · Web3Auth · RainbowKit/wagmi · WalletConnect/Reown · Turnkey. Any later adoption plugs in *below* the identity boundary: provider session ≠ membership truth ≠ operator privilege. Provider outage or compromise must never lock out or elevate privileged access (operators authenticate with raw wallet signatures, no provider dependency).
- **Custody/smart-account rails (future gates):** Safe · ZeroDev · Pimlico · Turnkey — candidate paths for root-wallet quorum hardening and future smart-wallet operator policy (requires ERC-1271 verification design first).
- **RPC posture (reserved):** QuickNode primary → thirdweb RPC Edge fallback → Avalanche public RPC emergency/dev fallback — matches the provider-adapter abstraction reclassified in 2.20G; auth signature verification is chain-read-independent (pure cryptography server-side), so RPC health affects protocol reads, not login safety.
- **Marketplace/swap/bridge adapters (explicitly out of scope):** LI.FI/Jumper · thirdweb Bridge · native viem/wagmi adapter — reserved names only; nothing in this design implements or depends on them.

## K. Threat model

| Threat | Controls |
|---|---|
| Stolen browser session | Short sessions, idle timeout, HttpOnly/SameSite cookies, step-up signature required for anything dangerous, instant revocation via registry status |
| Stolen operator wallet | Registry suspension (instant, kills sessions), step-up + cooldown on registry/recovery actions limits blast radius, risk flags + anomalous-login detection, two-person rule at admin tier |
| Phishing signature | Domain-bound challenges with explicit human-readable statement; login/step-up messages never resemble transactions; expiring nonces are worthless replayed elsewhere |
| Malicious support request | Support cannot approve; approval tier + evidence + risk scoring + cooldown + old-wallet contest window |
| Fake "lost wallet" attacker | Lost-old-wallet path escalates to founder/root, stronger human verification, longer cooldown, notification to known channels; history never erased so contest is possible |
| Compromised low-level admin | Least privilege; admin-tier registry rows untouchable below founder/root; separation of duties (reviewer ≠ approver); full audit |
| Admin adds attacker wallet | Registry additions are step-up-signed, audited, founder/root-approved at admin tier, cooldown before ACTIVE; auditor role independently reviews |
| Provider outage | Operators have zero provider dependency (raw wallet signatures); member Web2 path degrades to read-only, never to a weaker auth bypass |
| Provider account compromise | Provider ≠ authority: no provider session grants privilege or membership truth; explicit wallet binding is the only bridge and is itself audited |
| Replayed signature | Single-use server-stored nonces, consumed on first attempt; domain + chainId + expiry checked; step-up challenges are action+target-specific |
| Frontend bypass | All enforcement at API layer; build-time route exclusion is visibility only; server rejects by default (fail closed) |
| Worker/agent overreach | Hard-coded prohibitions, proposal-only defaults, mandatory expiry, human approval with step-up, worker-tagged audit trail |
| Accidental wrong-wallet transaction | Login/step-up are signatures, never transactions (stated in the signed message); operator console contains no fund-moving surface in this design |
| Embedded wallet selected when member wallet intended | Explicit primary member-wallet binding step; UI must display which wallet class is in use; binding changes are recorded acts |
| Member wallet / payment wallet confusion | Taxonomy rule: payment wallet is a payment fact, member wallet an explicit selection; receipts record both without conflation |
| Public leak of wallet/member pairings | Privacy matrix binds every surface; pairings server-only; leak guards + serialized-payload scans (existing guard pattern) extended to auth-zone payloads |
| Recovery abuse | Cooldown + contest window + approval tiers + immutable history + notification; recovery links identity and never moves tokens or rewrites receipts |
| Registry table exposure | Registry lives in the write-capable auth zone, server-only, never in any public API allowlist; route-exposure guard extended to assert this |

## L. Implementation gates (each requires separate founder approval — nothing here is started)

1. Write-capable auth-zone architecture decision (separate from the read-only spine; storage + session store choice).
2. Operator registry schema + seed ceremony (founder/root wallet enrollment — an offline-verified founding act).
3. SIWE-style challenge/verify + session endpoints (with §K guard tests: replay, domain, expiry, fail-closed).
4. Roles/permission enforcement middleware + audit log.
5. Step-up signature flow.
6. Recovery workflows (member first; admin rotation second; root ceremony documented offline).
7. Only after all above: the deferred 2.20G surfaces (broadcast, flags, exports, support queue, source review, cockpit, share-card) arrive one by one behind their own gates.
