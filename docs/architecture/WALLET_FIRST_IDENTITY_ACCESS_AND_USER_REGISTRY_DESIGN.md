# Wallet-First Identity, Access States & User Registry Architecture

- **Status:** DESIGN ONLY — founder-approved corrective design pass, 2026-07-02. NO IMPLEMENTATION AUTHORIZED.
- **Authorizes nothing:** no route, no API endpoint, no database migration, no wallet library, no package install, no session code, no UI build, no deploy, no publish. Every implementation step sits behind its own future founder gate.
- **Companion to:** `OPERATOR_WALLET_AUTH_AND_ROLES_DESIGN.md` (the privileged-track authority foundation — unchanged and binding). This document does not repeat that design; it **extends it into the full identity/access organism**: user-facing states, surface matrix, users/member registry, binding UX, recovery UX, and Protocol-Organism invariants. Where the operator doc already covers a topic deeply (SIWE mechanics §B, operator registry §C, roles matrix §D, recovery workflows §E/§F, audit log §G, workers §H, providers §J, threats §K), this document cross-references it.
- **Foundations:** `WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` (canonical identity doctrine incl. §11 privacy matrix) · `CORRECTED_DOCTRINE_REHARVEST_2_20G.md` · `CAPABILITY_HARVEST_AND_REUSE_MAP.md` · the four TheSyndicate identity docs (historical oracle) · the operator-auth doc above.
- **Vocabulary rule:** no new taxonomy; posture/domain terms from `lib/os-contracts`; truth-label doctrine applies to every status chip. "Settlement wallet" replaces the banned origin term. Source/referral = verified introduction. No financial-upside framing anywhere.

---

## 0. Corrective position — identity/access is an organ, not a login box

The operator-auth doc, alone, risks reading as "admin login design." This corrective pass fixes the frame:

1. **Identity/access is one organ of the Protocol Organism** with members, visitors, operators, workers, and future Web2 users as first-class states — not an admin bolt-on.
2. **Every human-visible state must be explicit.** No surface may behave differently for an undefined state; unknown state = weakest state (fail closed to visitor posture).
3. **The read-only foundation stays read-only.** All states below describe *future* gated capability. Today the only served reality is public read-only proof; nothing in this document turns anything on.
4. **Truth labels extend to identity:** every auth/membership status shown in the UI is a truth-labelled state chip, never an implied capability. "Wallet connected" must never look like "member."

## 1. Three tracks, modelled separately

| Track | Ladder | Authority source |
|---|---|---|
| **User-facing** | Visitor → Connected Wallet → Authenticated User → Verified Member → Member Cockpit | Membership truth (receipt/holder truth per identity doctrine) |
| **Privileged** | Operator → Protocol Admin → Founder/Root | Operator registry ACTIVE row (operator doc §C) |
| **Machine** | Worker/Agent → proposal-only scoped identity | Registry scope + expiry (operator doc §H) |

**Binding rules:**
- The tracks are **not one ladder**. Progress on one track never grants standing on another. Verified member ≠ operator; operator ≠ member; worker ≠ either.
- **A human may exist on multiple tracks, but permissions never merge.** The founder may be both member and founder/root — the member wallet and the root operator wallet are different registry facts, different sessions, different modes. A single session carries exactly one track's authority.
- **Mode is explicit.** The UI always shows which mode (member mode / operator mode) a session is in; the backend scopes every request to the session's track. Cross-mode action requires a fresh login on the other track (never an in-session toggle that silently merges scopes).

## 2. The fourteen access states

Legend for each state: **FE** what the frontend shows · **BE** what the backend allows · **Routes** accessible surfaces · **Blocked** explicitly denied · **Label** status chip wording (truth-labelled) · **Confusion risks** · **Audit** events generated.

### S1 — Anonymous visitor
- **FE:** public pages with truth labels; no wallet prompt, no tracking of wallets; "Connect" affordance visible but inert until invoked.
- **BE:** public read-only endpoints only (`/api/protocol/reality`, `/api/source-status`, health).
- **Routes:** homepage, public proof/status pages, learn/docs, read-only membership/purchase-path explainer.
- **Blocked:** every authenticated, member, and operator surface; any write.
- **Label:** none (public posture chips only).
- **Confusion risks:** none — nothing implies identity.
- **Audit:** none. Visitors are never wallet-tracked.

### S2 — Logged-out visitor (previously authenticated, session ended)
- **FE:** identical to S1 plus a neutral "Session ended — sign in again" notice where a gated surface was bookmarked. No cached member data may render.
- **BE:** identical to S1. Expired/revoked session token = no session (fail closed).
- **Routes/Blocked:** as S1.
- **Label:** "SIGNED OUT".
- **Confusion risks:** stale UI implying still-signed-in; residual localStorage (design bans auth tokens in localStorage — operator doc §B).
- **Audit:** session-expiry/logout event (server-side, from the ended session).

### S3 — Wallet connected, unsigned
- **FE:** wallet address (truncated) + chip; explicit copy: connection proves nothing yet. Sign-in CTA.
- **BE:** nothing beyond S1 — a connection is a frontend fact; the backend has no session.
- **Routes:** as S1 + the connect/sign-in component.
- **Blocked:** all gated surfaces; any endpoint requiring a session.
- **Label:** "WALLET CONNECTED — NOT SIGNED IN".
- **Confusion risks:** the core one — *user thinks connected = member*. Copy must state: "Connecting shows an address. It does not sign you in and does not verify membership."
- **Audit:** none (no server interaction yet).

### S4 — Wallet signed/authenticated, membership not verified
- **FE:** signed-in banner with the exact signing wallet; membership panel shows verification state honestly.
- **BE:** SIWE-style session (member-scoped, operator doc §B mechanics reused); allows own-session endpoints (profile stub, binding screen); membership verification runs server-side against membership truth.
- **Routes:** S1 + account/wallet binding screen + membership status view + recovery request intake (an identity claim may start a case from S4 — the lost-wallet claimant path) + own support tickets.
- **Blocked:** member cockpit, receipts, standing, share-card, source status; all operator surfaces.
- **Label:** "SIGNED IN — MEMBERSHIP NOT VERIFIED".
- **Confusion risks:** signed-in ≠ member (authenticated user may hold zero membership facts); wrong wallet signed (user meant their member wallet).
- **Audit:** login challenge issued/verified; failed verifications; membership-check outcome.

### S5 — Future Web2 logged-in account (reserved)
- **FE:** provider-login session with an explicit "convenience account" frame; wallet-binding prompt; nothing implies membership.
- **BE:** provider session accepted only as a *convenience shell*: read-only personalization at most. Membership/privilege require the bound wallet path (S4→S7). Provider account is never authority (identity constitution §5; operator doc §J).
- **Routes:** S1 + binding screen.
- **Blocked:** everything membership/operator; any action whose authority would derive from the provider account.
- **Label:** "ACCOUNT SIGNED IN — NO WALLET BOUND".
- **Confusion risks:** provider account mistaken for membership; social-account compromise attempting authority (threat T11, §11).
- **Audit:** provider-session events kept separate from wallet-auth events (different event class).

### S6 — Embedded-wallet user (reserved)
- **FE:** embedded wallet shown with an explicit "convenience wallet" badge, visually distinct from external wallets; binding screen offers explicit primary-member-wallet selection.
- **BE:** embedded wallet treated as any other address for signatures, but **flagged embedded** in the account record; never eligible for operator registry (operator doc §A).
- **Routes:** as S4/S5 depending on signature state.
- **Blocked:** operator surfaces always; member surfaces until verified membership on the *bound primary* wallet.
- **Label:** "EMBEDDED WALLET (CONVENIENCE)".
- **Confusion risks:** member signs with embedded wallet believing it is the member wallet (threat T3, §11); embedded wallet accidentally becoming de-facto identity — banned: primary binding is an explicit recorded act.
- **Audit:** binding proposals/changes; embedded-wallet signature use on gated actions.

### S7 — Verified member
- **FE:** member cockpit (§7): own membership status, seat/receipt/proof, standing, wallet-binding state — all truth-labelled; historical continuity where applicable.
- **BE:** own-record reads; own-scoped actions as they are gated on (share-card request, recovery request, source status view). No cross-member reads. Writes remain disabled until their own gates open.
- **Routes:** S4 + member cockpit, receipt/proof view, member standing, share-card (if enabled), source/referral status (if enabled), recovery intake.
- **Blocked:** other members' records; all operator surfaces; any wallet↔memberNumber public exposure.
- **Label:** "VERIFIED MEMBER".
- **Confusion risks:** member wallet vs payment wallet on receipts (both recorded, never conflated); operator-wallet holder browsing member area in the wrong mode (§8).
- **Audit:** membership verification events; own-record sensitive views (receipt/proof access), member-initiated requests.

### S8 — Verified member with pending recovery
- **FE:** recovery status page (§6) with the case's honest state; cockpit in **restricted read-only**: status visible, sensitive actions frozen.
- **BE:** freezes binding changes, share-card issuance, source-settlement changes, and any wallet-mutation-adjacent action for this identity until the case closes; reads of own status allowed.
- **Routes:** S7 reads + recovery status page.
- **Blocked:** all identity-mutating actions; new binding; anything the recovery could be trying to hijack.
- **Label:** "RECOVERY PENDING — ACCOUNT RESTRICTED".
- **Confusion risks:** pending-recovery user expecting full access (threat T8); attacker using a filed recovery to freeze a victim — mitigations: old-wallet contest window + notification (operator doc §E.5).
- **Audit:** every recovery-state transition; every access attempt against a frozen action.

### S9 — Suspended / revoked / restricted user
- **FE:** an honest restriction notice with reason class (not private evidence) and an appeal/contact path; public surfaces still render.
- **BE:** sessions killed at status change (operator doc §C); new logins denied for gated scopes; public reads only.
- **Routes:** S1 only, plus the restriction notice.
- **Blocked:** all gated surfaces, member and operator alike.
- **Label:** "ACCESS RESTRICTED".
- **Confusion risks:** revoked user with a still-live session (threat T9) — registry/status change must kill sessions instantly.
- **Audit:** suspension/revocation, denied-login attempts, appeal submissions.

### S10 — Member with source/referral (verified-introduction) privileges
- **FE:** S7 + own attribution status: introductions recorded, settlement wallet on file, status of each attribution — own records only, truth-labelled; no compensation promises, no projections.
- **BE:** own-attribution reads; settlement-wallet change only via visible policy action (identity constitution §16); everything double-gated (auth AND source safety — separate founder gate).
- **Routes:** S7 + source/referral status surface.
- **Blocked:** other members' attributions; any aggregate source data; any operator review queue.
- **Label:** "VERIFIED MEMBER · INTRODUCER".
- **Confusion risks:** settlement wallet vs member wallet (taxonomy rule, operator doc §A); introducer status implying operator review power — it does not.
- **Audit:** attribution views; settlement-wallet change requests (policy actions, step-up where enabled).

### S11 — Operator / admin
- **FE:** operator shell (§8) — never the member skin. Shows operator wallet, role, permission scope, session expiry, step-up markers, mode warning.
- **BE:** operator doc §B–§D verbatim: ACTIVE registry row, role-scoped permissions, step-up for sensitive actions, short sessions.
- **Routes:** operator shell, users/member registry tab, wallet registry tab, recovery review queue, audit log, exports, flags, broadcast/support — each per the §D matrix.
- **Blocked:** everything above their role; admin-tier registry rows below founder/root; member-mode actions from an operator session.
- **Label:** "OPERATOR — {role}" + session expiry countdown.
- **Confusion risks:** operator acting in member mode / on member records without the mode banner (threat T4); operator wallet used as a member wallet — the shell warns when the connected wallet is a registry wallet but the surface is member-facing.
- **Audit:** every privileged action (operator doc §G) — plus mode-warning acknowledgements on member-record access.

### S12 — Founder / root
- **FE:** operator shell at apex scope with additional friction markers (shorter session, mandatory step-up chips on more actions).
- **BE:** operator doc §D apex row; out-of-band recovery only (§F); no online root-replacement workflow exists.
- **Routes:** all operator surfaces + admin-tier registry actions + recovery final approvals + future provider/marketplace settings (reserved, read-only until their gates).
- **Blocked:** nothing within design scope *except* unaudited action — every root act is still step-up-signed and logged; root recovery is never a dashboard action.
- **Label:** "FOUNDER / ROOT — ELEVATED SESSION".
- **Confusion risks:** the founder's member wallet vs root wallet (§1 example) — different wallets, different sessions, never merged.
- **Audit:** everything, at the highest verbosity; root logins are individually alertable events.

### S13 — Auditor / read-only
- **FE:** operator shell in read-only skin: audit log (full), registry views with evidence redacted, reports, export *metadata*.
- **BE:** zero mutations (operator doc §D); privacy matrix still binds (no wallet↔member pairings beyond what audit entries legitimately contain).
- **Routes:** audit log, reports, registry (redacted), export metadata.
- **Blocked:** every mutation; raw evidence; exports of member data.
- **Label:** "AUDITOR — READ ONLY".
- **Confusion risks:** minimal; auditor session must never be upgradable in place.
- **Audit:** auditor reads of sensitive views are themselves logged (watch-the-watcher).

### S14 — Worker / agent identity
- **FE:** none of its own; worker output appears inside operator surfaces tagged "WORKER PROPOSAL — awaiting human approval".
- **BE:** operator doc §H verbatim: proposal-only, scoped, expiring, hard prohibitions (no recovery approval, no identity changes, no registry mutation).
- **Routes:** API-level proposal endpoints only (future); no interactive shell.
- **Blocked:** all approvals, all identity/registry mutations, all export *execution* (export-request proposals only, per operator doc §D), everything outside scope.
- **Label:** on artifacts it produces: "WORKER-GENERATED — UNAPPROVED" until a human approves.
- **Confusion risks:** worker output mistaken for approved operator action — the tag + approval chain prevent this.
- **Audit:** every proposal, tagged worker-initiated with supervising approval chain.

## 3. Route/surface access matrix

✅ full (within own scope) · R read-only · O own-record only · G additionally gated (surface has its own founder gate and may not exist yet) · — blocked. Operator-column entries are further scoped by the operator doc §D role matrix; this matrix adds the user-facing dimension.

| Surface | S1/S2 visitor | S3 connected | S4 signed-in | S5 Web2 | S6 embedded | S7 member | S8 recovery-pending | S9 restricted | S10 introducer | S11 operator | S12 root | S13 auditor | S14 worker |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Homepage / public pages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Public proof/status pages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | R |
| Learn / docs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| Purchase path (read-only explainer; writes disabled) | R | R | R | R | R | R | R | R | R | R | R | R | — |
| Wallet connect / sign-in component | ✅ | ✅ | n/a | ✅ | ✅ | n/a | n/a | denied w/ notice | n/a | n/a | n/a | n/a | — |
| Account / wallet binding screen | — | — | ✅ | ✅ | ✅ | ✅ | frozen | — | ✅ | — | — | — | — |
| Member cockpit / My Syndicate | — | — | — | — | — | O·G | O (read-only) | — | O·G | R (support view, least-data) | R | — | — |
| Receipt / proof view | — | — | — | — | — | O·G | O (read) | — | O·G | R (scoped, §D) | R | R | — |
| Member standing / recognition | aggregate-safe only | agg. | agg. | agg. | agg. | O·G | O (read) | — | O·G | R | R | R | — |
| Share-card | — | — | — | — | — | O·G | frozen | — | O·G | policy (S) | policy (S) | R | — |
| Source/referral status | — | — | — | — | — | — | — | — | O·G | reviewer per §D | S (final) | R | P |
| Recovery request intake | — | — | ✅ (identity claim starts case) | — | — | ✅ | case open | contact path only | ✅ | — | — | — | — |
| Recovery status page | — | — | O | — | — | O | O | O (case view) | O | queue view | queue + approve | R | — |
| Operator shell | — | — | — | — | — | — | — | — | — | ✅ | ✅ | R skin | — |
| Users / member registry tab | — | — | — | — | — | — | — | — | — | per §D + §4 | ✅ | R (redacted) | — |
| Wallet registry tab (operator registry) | — | — | — | — | — | — | — | — | — | R (own row) / admin per §D | ✅ | R (redacted) | — |
| Recovery review queue | — | — | — | — | — | — | — | — | — | process (support never approves; protocol admin approves standard-risk per operator doc §E.3) | approve (incl. high-risk/final) | R | P (risk notes) |
| Audit log | — | — | — | — | — | — | — | — | — | R (scoped §D) | R (full) | R (full) | — |
| Exports | — | — | — | — | — | — | — | — | — | S per §D | S | R (metadata) | P |
| Feature flags | — | — | — | — | — | — | — | — | — | per §D | S | R | — |
| Broadcast / support tools | — | — | own tickets | — | — | own tickets | own tickets | — | own tickets | per §D | S | R | P (drafts) |
| Provider/marketplace settings (reserved) | — | — | — | — | — | — | — | — | — | — | R (reserved) | — | — |

Unknown/undefined state → the S1 column. Every "G" surface additionally requires its own founder gate to exist at all.

## 4. Users / member registry (the future admin "Users" tab) — not naive CRUD

### 4.1 Record model (three linked layers, mirroring the identity doctrine)

| Layer | Record | Contents |
|---|---|---|
| Account | **User/account record** | Auth-level facts: login wallet(s), Web2 account ref (if any), embedded-wallet flag, session/security posture, risk flags |
| Identity | **Member identity record** | Membership truth linkage: seat/receipt/proof references, memberNumber (server-only), historical continuity refs, standing, privacy tier |
| Wallets | **Wallet linkage set** | Active primary member wallet · historical wallets (append-only) · payment wallet(s) (payment facts) · embedded wallet (flagged) · settlement wallet (if introducer) · operator-wallet cross-reference (if the person also holds a registry row — link only, authority stays in the operator registry) |

Plus per-record: recovery status (case ref), source/referral status, support notes/evidence **references** (server-only pointers, never inline in UI payloads), risk flags, full audit trail ref, **privacy tier**, and **export restrictions** (default: member records are non-exportable; any export is a step-up, logged, minimum-field event).

### 4.2 Banned operations (explicit, non-configurable)

- No "edit wallet address" field — wallets change only through the recovery/rotation workflows.
- No deleting identity history; no overwriting old wallets (append-only, ever).
- No direct admin wallet replacement (operator doc §F only).
- No bulk wallet mutation of any kind.
- No role mutation without step-up; no export without step-up.
- No support operator self-approving recovery (separation of duties).
- No AI/worker approving identity changes (hard prohibition).
- No frontend-only permission checks — every action above is backend-enforced.

### 4.3 Permitted workflow actions (the only verbs the tab exposes)

suspend · archive (status change, not deletion) · request recovery (on behalf, opens the normal case — never completes it) · approve pending recovery (approval tier only) · reject recovery · escalate to founder/root · rotate operator wallet through ROTATING (operator doc §F) · add audit note · request proof from member · mark/clear risk flag · issue read-only proposal (worker/operator drafting) · finalize after cooldown (step-up).

Every verb = audited event with actor, role, reason, approval chain, step-up reference where applicable (operator doc §G schema).

## 5. Wallet binding UX (screens/states)

1. **Connect wallet** — provider-agnostic connect; after connect the UI shows address + wallet class chip (external / embedded / registry-listed) + "connection ≠ sign-in ≠ membership" copy.
2. **Sign in** — SIWE-style prompt showing the exact signing address, the human-readable statement ("signature, not a transaction"), domain, and chain. Wrong chain → blocking warning, signature not requested (backend would reject anyway — operator doc §B).
3. **Choose primary member wallet** — explicit, recorded act; lists candidate wallets with class chips; embedded wallets carry "convenience only" copy; confirmation restates consequences.
4. **Payment vs member wallet** — purchase-path (future) shows both distinctly: "paying from" vs "member wallet"; receipts record both without conflation.
5. **Operator vs member mode** — if the connected wallet has an ACTIVE registry row and the user is on a member surface: persistent banner "This is an operator wallet. You are in the member area — operator powers are inactive here." And inversely in the shell (§8).
6. **Pre-signature warning** — every signature prompt shows: active wallet, wallet class, what the signature does, what it does not do (no funds moved). If the connected wallet ≠ the expected wallet for the action (e.g. binding action expects the primary member wallet), block with an explicit mismatch screen rather than letting the wrong wallet sign.
7. **Wrong-chain / wrong-wallet guards** — chainId mismatch and address mismatch are both frontend-warned *and* backend-rejected (frontend warning is UX; the backend check is the control).

## 6. Recovery UX — frontend states over the operator doc §E/§F backend

Member-visible case states (each a truth-labelled chip on the recovery status page):

`REQUEST SUBMITTED` → `PROOF NEEDED` (with the two proof paths shown honestly: old-wallet-signature path · old-wallet-lost path, the latter labelled as slower + higher review) → `ADMIN REVIEW PENDING` → `COOLDOWN ACTIVE` (shows the window and the contest mechanism) → `APPROVED — PENDING FINALIZATION` → `FINALIZED`, with branches `REJECTED` (reason class + re-request policy) and `ESCALATED` (founder/root review).

Throughout an open case, the account is S8: restricted read-only, identity-mutating actions frozen, every attempt against a frozen action logged. Backend boundaries stay exactly as the operator doc defines: support processes but never approves; approval tiers + step-up + cooldown + old-wallet contest window; admin/root recovery is a separate, non-support, out-of-band track — no online root-replacement workflow exists.

## 7. Member cockpit gates (what a verified member sees)

Membership status (truth-labelled) · seat/receipt/proof (own) · historical continuity where applicable ("this entry history is yours" kept distinct from "you are seated" — never blurred) · member standing/recognition (own) · share-card (if its gate is open) · source/introduction state (if its gate is open) · wallet-binding state (§5) · recovery status (§6) · protocol read-only truth (same public spine data everyone sees).

Hard constraints: no public memberNumber↔wallet mapping ever; no fake/live-looking data (truth labels on everything unwired); no financial-upside framing of membership, standing, or introductions; no settlement projections; no public proof surface beyond approved doctrine.

## 8. Operator shell — separation requirements (cross-ref operator doc)

The shell (S11–S13) always displays: current operator wallet (truncated) · role · permission scope summary · session expiry countdown · step-up-required markers on gated actions (before click, not after failure) · audit visibility notice ("all actions are logged") · **mode warning banner whenever acting on member records** ("You are viewing member data as {role}. Least-data view enforced. This access is logged.").

Mode separation: operator sessions never render member-cockpit ownership views; member sessions never render shell verbs. The same human switches modes only by a fresh login on the other track (§1).

## 9. Protocol Organism — the Identity Access organ

### 9.1 Module manifest shape (proposed, design-level)

```
organ: identity-access
version: design-1
depends-on: [protocol-reality-spine (read-only), membership-truth (holder/receipt), operator-registry, audit-log]
provides: [access-states S1–S14, session issuance, permission enforcement, recovery workflows, users-registry views]
write-zone: auth-zone only (sessions, registries, audit) — architecturally separate from the read-only spine
gates: every capability behind its own founder gate (operator doc §L + §12 below)
invariants: see 9.2 — enforced by guards, not convention
```

### 9.2 Invariants (binding on any future implementation)

1. Wallet control is not historical identity.
2. Provider account is not membership truth.
3. Connected wallet is not verified membership.
4. No memberNumber↔wallet public mapping, ever.
5. Old wallet history is append-only; nothing deletes or overwrites it.
6. No direct wallet replacement outside the recovery/rotation workflows.
7. Operator wallet authority requires an ACTIVE registry row — no row, no power.
8. Frontend hiding is never permission control.
9. Worker/agent can never approve recovery or change identities.
10. Root recovery has no normal online workflow.
11. Tracks never merge: one session, one track, one authority scope.
12. Unknown/ambiguous state resolves to the weakest state (fail closed).
13. Every status chip is truth-labelled; no state may imply an unwired capability.

### 9.3 Fitness/guard checks (future implementation gates, pattern-matching existing guards)

- **Route-exposure guard:** assert no auth-zone/registry/audit endpoint appears in any public API allowlist.
- **Serialized-payload leak guard:** extend the existing spine payload scan to auth-zone responses — no addresses-with-memberNumbers, no evidence refs, no session tokens in bodies.
- **State-matrix conformance test:** for each S1–S14 fixture session, assert the §3 matrix row (allowed passes, blocked 401/403s) — the matrix is the spec.
- **Invariant greps:** static scans asserting no "edit wallet" mutation path, no DELETE on identity-history tables, no worker scope containing approval verbs.
- **Session hygiene checks:** cookie flags, no auth token in any client bundle/localStorage write, revocation-kills-session integration test.

## 10. Future provider compatibility (unchanged — cross-ref operator doc §J)

Preserved, not implemented: Privy / Dynamic / thirdweb / Web3Auth (Web2/member convenience) · RainbowKit / WalletConnect-Reown / wagmi / viem (crypto-native UX) · Turnkey / Safe / ZeroDev / Pimlico (future smart-wallet / account abstraction) · QuickNode → thirdweb RPC Edge → Avalanche public RPC (RPC ladder) · LI.FI / Jumper / thirdweb Bridge (future marketplace adapters, out of scope). Providers are convenience/adapters below the identity boundary — never authority. This document adds one clarification: provider *sessions* map at most to S5/S6; no provider event may transition an account into S7+ or any privileged state.

## 11. Threat model additions (frontend/user/admin-registry layer; extends operator doc §K)

| # | Threat | Controls |
|---|---|---|
| T1 | User thinks connected wallet = member | S3 explicit copy + label; membership verification is a distinct server-side step; cockpit unreachable before S7 |
| T2 | User signs with payment wallet expecting member wallet | Pre-signature active-wallet display + expected-wallet mismatch block (§5.6); receipts record both wallets distinctly |
| T3 | Member uses embedded wallet accidentally | Embedded chip on every surface; primary binding is explicit; binding screen warns before an embedded wallet signs a binding-adjacent action |
| T4 | Operator acts in member mode accidentally (or vice versa) | Mode banners both directions (§5.5, §8); tracks never merge (§1); backend scopes by session track regardless of UI |
| T5 | Support edits wallet directly | No wallet-edit field exists (§4.2); wallets change only via workflows; support cannot approve; backend rejects mutation verbs outside workflow endpoints |
| T6 | Admin users tab leaks wallet/member pairing | Least-data views by role; privacy tier per record; evidence as server-only refs; §9.3 leak guard on registry payloads; auditor sees redacted views |
| T7 | Bulk export leaks identity data | No bulk wallet operations (§4.2); exports step-up-gated, minimum-field, logged, restricted by per-record export restrictions; auditor sees metadata only |
| T8 | Pending-recovery user gains too much access | S8 is restricted read-only; frozen-action attempts logged; case state drives backend scope, not UI |
| T9 | Suspended/revoked user still has session | Status change kills all sessions instantly (operator doc §C); session binds registry-row-version; S9 fail-closed |
| T10 | Wrong-chain wallet signature accepted | chainId in the signed message must equal canon; backend rejects mismatch regardless of frontend (operator doc §B) |
| T11 | Future Privy/social account compromise tries to override wallet authority | Providers cap at S5/S6 (§10); no provider event grants S7+/privilege; wallet binding is explicit, audited, and itself signature-gated |

## 12. Implementation gates (additive to operator doc §L — nothing started)

1. Access-state machine + session-track model (S1–S14) as the first auth-zone design artifact.
2. Users/member registry schema (three-layer record model, §4.1) — separate gate from the operator registry.
3. Binding UX + wrong-wallet guard implementation.
4. Recovery UX states over the §E backend.
5. State-matrix conformance + leak guards (§9.3) land **with** the first auth endpoint, not after.
6. Provider adapters (S5/S6) last, and only behind their own gates.
