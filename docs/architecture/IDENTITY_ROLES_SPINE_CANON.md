# Identity, Roles & Permissions — the Spine (canonical map)

**Purpose.** One readable map that ties together (a) the founder's WordPress/Shopify-style
proposal, (b) the two design docs that already specify this spine in depth, and (c) what is
actually built in code today. It is an INDEX, not a new architecture — the authority stays with
the design docs cited below.

**Authority docs (do not duplicate — extend):**
- `OPERATOR_WALLET_AUTH_AND_ROLES_DESIGN.md` — SIWE auth (§B), operator registry (§C), roles +
  per-surface permission matrix (§D), member & admin recovery (§E/§F), audit log (§G),
  worker/agent (§H), threat model (§K).
- `WALLET_FIRST_IDENTITY_ACCESS_AND_USER_REGISTRY_DESIGN.md` — the 14 access states (S1–S14),
  the route/surface access matrix (§3), the users/registry tab (§4), recovery UX (§6).
- `WALLET_IDENTITY_AND_HOLDER_INDEX_DESIGN.md` — the privacy posture overlay (wallet↔member).

## The canon (one sentence)

The Syndicate has **one identity + permission spine**. `/admin` is the control tower, `/studio`
is the creation atelier, `/member` is the member cockpit. Founder, administrator, operator,
worker, and auditor are **roles inside one authority system, not separate products**. Founder
access is rooted in **whitelisted EVM wallets** (registry rows), recovering through secondary
founder wallets; worker recovery is **request-based, manually verified, audit-logged**.

## The four layers (the mental model)

1. **Identity** — *who are you?* Wallet (SIWE) today; email/passkey (S5) reserved for future staff.
2. **Role** — *what are you?* Exactly one role per registry row (the 8-role ladder, §D).
3. **Permission** — *what may you do?* Role-derived, backend-enforced per action; per-row
   narrowing via `permissions` (never widening). Frontend visibility is never the gate.
4. **Surface** — *where do you see it?* `/admin`, `/studio`, `/member`, `/status`, `/os`.

The ladder (least privilege): **Founder/root → Protocol admin → Operator → Source reviewer →
Member support → Content/docs → Auditor → Worker/agent** — plus Member and Visitor (not operator
roles). Full role×surface matrix: operator doc §D.

## What is BUILT vs DESIGNED vs FUTURE (status — the honest part)

| Capability | State | Where |
|---|---|---|
| Wallet SIWE auth (challenge → sign → verify → session) | **BUILT** | `src/auth/` (dark in prod until `SYNDICATE_AUTH_ENABLED`) |
| Operator registry (wallet, label, role, status, permissions) | **BUILT (core fields)** | `lib/db` `operator`; §C adds richer fields (addedBy, riskFlags, expiresAt, revocationHistory) → later |
| Status lifecycle `PENDING→ACTIVE→SUSPENDED→REVOKED` | **BUILT (subset)** | schema CHECK; `ROTATING`/`EXPIRED` transitions → later |
| Identity→authority bridge (ACTIVE wallet → role) | **BUILT** | `src/auth/operatorContext.ts` (read-only, fail-closed) |
| Write zone gated by role + audit | **BUILT (2 actions)** | `src/operator/` — referral-terms (admin-tier), invite/suspend (founder-only) |
| Live operator role badge in `/admin` | **BUILT (A1)** | `src/wallet/OperatorBadge.tsx` |
| Full per-surface permission enforcement (§D matrix) | **DESIGNED** | only referral-terms + invite/suspend enforced today |
| Recovery flows (member §E, admin/worker §F) | **DESIGNED** | request → notify → manual approve → audit; no auto-reset |
| Workers / AI agents (§H), Users/registry tab (§4) | **DESIGNED** | not started |
| Multisig/Safe founder authority, email/passkey staff, granular permission strings | **FUTURE** | design reservations only (§J) |

## The founder's 8 questions — answered

1. **`/founder` a route or a role/view?** A **role/view inside `/admin`** (agreed). *Reality check:*
   today separate operator routes exist (`/studio`, `/founder`, `/os-source`, `/os-map`, `/admin`).
   Target: one **role-scoped `/admin` shell** (panels rendered by role) + `/studio` as atelier.
   **Converge incrementally — do not big-bang the routing.**
2. **`/admin` vs `/studio`?** Different **surfaces, same spine**. `/admin` = manage + publish;
   `/studio` = draft/preview/design. Permissions come from the one registry (WALLET_FIRST §3, operator §8).
3. **Model identity/roles/permissions/surfaces?** The four-layer spine above — already the design.
4. **Founder/admin via wallet signature?** **Yes** — built (SIWE), rooted in registry `founder_root` rows.
5. **Workers: wallet or email/passkey?** **Wallet first** (the built spine). Email/passkey (S5) is a
   **future second identity track** feeding the *same* registry — not a second auth system.
6. **Worker recovery?** **Request-based, manually verified, audit-logged, never auto-reset**, neutral
   non-enumerating response, throttled + CAPTCHA (§E/§F, WALLET_FIRST §6). Future build.
7. **MVP path (no over-engineering)?** Finish **A** (wire the admin to the real writes + controlled
   activation) on the existing spine. Then phase: **founder bootstrap seed → role-scoped panels →
   recovery/workers/users-tab**. Never build a layer before its feature is needed.
8. **Schema needed?** Have `operator`, `operator_session`, `audit_log`, `referral_term`. Add
   `recovery_request`, `notification`, richer registry fields, `worker_invitation`, and a `users`
   view **when** those features are built — not before.

## Where I (independently) refine the founder's proposal

- **DB registry > env whitelist for founders.** Keep the auditable `operator` table as source of
  truth (suspendable, status-tracked) rather than a static `FOUNDER_WALLETS` env array. The one
  exception is a **bootstrap seed** (`FOUNDER_BOOTSTRAP_WALLET`) that creates the *first*
  `founder_root` row — after that the registry governs, and "2–3 founder wallets" = multiple
  `founder_root` rows (his recovery property, kept auditable).
- **Roles now, granular permission strings later.** Ship role-based enforcement (each role = a set
  per §D). The `permissions` jsonb is the **extension point** for per-operator narrowing — don't
  build the full `members.edit`/`sources.edit` string matrix for the MVP.
- **Multisig/Safe** = production target, not MVP (§J).

## Guardrails (do not violate while implementing)

Backend enforces every action (frontend visibility is never the gate) · one role per row · least
privilege · no self-service operator registration · admin-tier registry changes are founder-gated
+ audited · recovery is never automatic for privileged roles · the privacy overlay
(wallet↔member never public) binds on top of every role.
