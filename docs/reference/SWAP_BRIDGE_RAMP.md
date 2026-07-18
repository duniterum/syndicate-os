# THE SWAP/BRIDGE RAMP — indicative reference (living, admin ↔ backend ↔ frontend)

> **Provenance:** Claude-advisor reference dossier, 2026-07-18. Saved to the repo
> on the founder's instruction so future sessions consult it at the relevant
> slice. **Indicative reference, NOT a spec** — bends to the founder's word, the
> live repo, and the settled canon. Companion to the Chronicle newsroom doc and
> the SWAP·GAMIFICATION·LEGAL dossier. The jumper-lifi dossier already read the
> widget code line-by-line — this doc turns that + the market benchmark into the
> living, wired picture.

---

## 0. The one-line reframe

The ramp is **a door, not a market.** Someone arrives with the wrong asset on the
wrong chain (ETH on Base) and today they simply cannot enter — a seat needs USDC
on Avalanche. The ramp gives them exactly what they need to cross the door, then
hands them to `/join`. It is NOT a trading desk, NOT a "Swap" tab inviting
speculation. **market-buy ≠ member** stays absolute: swapping makes no one a
member; the seat comes only from the purchase receipt on the sale contract.

---

## PART 1 — THE ENGINE DECISION (benchmarked, settled enough to build on)

**LI.FI (the engine under Jumper) is the 2026 best choice for this use case.**
Verified against the market, not just Jumper's code:

- Cost/speed: LI.FI ~$0.94 / 22s vs Socket $1.10 / 31s on the standard $1,000
  benchmark — cheaper AND faster. 30+ chains (EVM, Solana, Bitcoin).
- Alternatives and why they lose here: Socket/Bungee = breadth not cost; Squid =
  great cross-VM but deposit-before-fill (worse for "see quote, then sign");
  deBridge/Eco = narrower coverage. LI.FI's edge is orchestration, and it's built
  forward (Composer, intents, OpenAPI, llms.txt, MCP).
- The engine `@lifi/widget` is an npm package (Apache-2.0) — installed, not
  copied. The Jumper app is just the bodywork; we build our own bodywork.

**⚠️ Security law (from the benchmark, engrave in the slice):** LI.FI's 2024
exploit hit wallets with **infinite approvals**. NEVER default to infinite
approval in the widget config — bounded/exact approvals only. And the standing
law: a successful swap makes no one a member.

---

## PART 2 — THE 7 HARVEST PATTERNS (from the jumper code read — adapt, never copy)

1. **The wallet hook** ⭐ — `walletConfig.onConnect` makes the widget open OUR
   modal; `hiddenUI: { walletMenu, poweredBy }` hides its menu and its logo;
   `isExternalContext`. Result: ONE connect button, one session, one identity —
   the widget consumes our RainbowKit/wagmi/SIWE. Never a second wallet system.
2. **The destination lock** — `toChain = Avalanche`, `toToken = USDC`,
   `fromAmount` = the live entry price, destination pinned. The user arrives with
   what they have, leaves with exactly what a seat needs. A door, not a market.
3. **The client-only mount + skeleton** — `<ClientOnly>` with a config-shaped
   skeleton (never a white hole), matching our SSG (`wagmi ssr:false`). Zero
   layout shift.
4. **Theme injection** — pass OUR tokens into the widget (gold = identity/seat,
   cyan = live/verify, house serif, house radius). Nobody sees "a pasted widget";
   they see The Syndicate.
5. **⚠️ The `no-raw-color` collision** — the widget BREAKS with CSS variables
   ("do NOT use theme.vars"); it needs literal colors. Our `no-raw-color` guard is
   BLOCKING. Requires a documented exception BEFORE the slice (one module,
   `widget-theme.ts`, resolves our tokens to literals — one exception point, not
   scattered colors). Plan it up front, not mid-broken-build.
6. **Referrer capture** — capture `?ref=0x…` once, validate it's a real address,
   first-writer-wins, mounted once at the layout root. This is our `sourceId` in
   the V3 buy + `CommissionRouterV1` (DEPLOYED, not yet parametrized). Our version
   is superior: theirs lives in sessionStorage, ours is on-chain.
7. **The event vocabulary** — `routeExecutionCompleted` is the "funds arrived"
   signal = the exact hook to chain the ramp INTO `/join` checkout. The ramp
   closes onto the door.

---

## PART 3 — THE LIVING INTERCONNECTION (admin ↔ backend ↔ frontend)

This is the founder's new ask: how the ramp lives — not a static embed, but wired
into the protocol the way everything else is (live reads, one reality spine, admin
control, honest surfaces).

### 3.1 The reality spine feeds the widget (backend → frontend)

- **The entry price is LIVE.** The widget's `fromAmount` / destination quote comes
  from the same live join-quote the reality spine already serves — never a
  hardcoded number. Price moves → the ramp's target moves, in the same slice
  (LIVE-PRODUCTION law: readable now = rendered now).
- **RPC through our QuickNode** (`sdkConfig.rpcUrls`) — the widget uses our nodes,
  not public ones. Consistent, rate-safe, ours.
- **Price-impact guardrail** (`maxPriceImpact`) set as a real protection, surfaced
  honestly to the user, not hidden.

### 3.2 The admin controls it (admin → everything)

The ramp is an OPERATOR-governed surface, like the packages module the founder
activates from admin. What the admin governs (proposed — founder decides the set):

- **On/off + placement** — the ramp is a module the operator enables; where it
  renders (on `/join` only, vs wider) is an operator setting, not hardcoded.
- **The service fee** (if Option A) — the integrator `fee` value (e.g. 0.01–0.02)
  is an admin-set parameter, forwarded to the fee wallet at execution. Adjustable,
  discretionary (company money), never touching the 70/20/10 membership routing.
- **Allowed chains/bridges/tokens** — the operator can widen/narrow
  `chains.allow` / `bridges` / `tokens` from config, honestly (e.g. disable a
  bridge if it misbehaves) — an operational lever, surfaced as such.
- **The fee wallet address** — operator-configured, infra address (never a member
  address; the Visibility Law's one structural rule holds).

All of this is READ from config/registry, not scattered in components — the
Jumper dependency-table lesson: one home per kind of thing.

### 3.3 The frontend renders it living (frontend → user)

- **The ramp shows a live quote** (what you pay → what you receive → the fee if
  any → what lands), the same transparent-quote spirit as the join compose panel.
  Every figure live, nothing hidden (Visibility Law).
- **DON'T TRUST — VERIFY** applies: the ramp's outcome is a real tx the user can
  verify; we LINK the proof, we don't just badge it "verified" (Jumper's fault E3
  — they badge, they don't link; we link).
- **The ramp → `/join` handoff** — on `routeExecutionCompleted`, the user now has
  USDC on Avalanche → we carry them to checkout with their referrer intact. One
  continuous path: ramp → door → seat → receipt → My Syndicate.
- **Skeleton, never a hole**; theme is ours; actions honest.

### 3.4 The event stream feeds the living protocol (frontend → backend → chronicle)

- The ramp's completion is an ACTIVITY event (a member crossed the door via the
  ramp) — feeds the Activity feed, and its FIRST (first ramp-assisted seat) is a
  candidate for the FIRSTS engine → a Chronicle moment. The ramp is part of the
  living organism, not a bolted-on tool.

---

## PART 4 — THE MONETIZATION + THE DOCTRINE (with the warnings)

### 4.1 The fee — the founder's choice, framed legally

| Option | What it is | Doctrine |
|---|---|---|
| **A. Announced service fee** | widget `fee` param (e.g. 0.01–0.02), forwarded to the fee wallet at execution on EVM. Zero contract to write. | ✅ Fee for a SERVICE rendered (the ramp) = pay for an ACT = commerce, like the referral commission. **Company money**, never mixed with the 70/20/10 membership routing. Stated openly. |
| **B. Free ramp** | the ramp is free — a service to the future member, an acquisition cost. | ✅ Reinforces "we ask nothing." Revenue comes from the seat, not the trip. |
| ~~C. Tip~~ | Jumper's voluntary tip, renamed | ⚠️ Banned-word risk (contribution/donation) + confusion with membership routing. Avoid. |

**The line that does not move:** earn for an ACT (service fee, verified
introduction) = commerce ✅. Earn for HOLDING = yield ❌ — holding SYN pays
nothing.

### 4.2 ⚠️ DOCTRINE WARNINGS (engrave, don't let a future session regress)

- **Banned vocabulary applies to the ramp too** — no invest/yield/return, no
  "contribution/donation" for the fee (call it a service fee), no "trade to earn".
- **market-buy ≠ member** — the ramp must never imply that swapping = membership;
  it's the path TO the door, the seat is the receipt.
- **Amounts visible** (Visibility Law) — the quote shows real figures; nothing
  theatrically hidden. Server never emits a MEMBER address.
- **Never infinite approval** — the LI.FI 2024 exploit lesson, a security law.
- **The `no-raw-color` exception is planned up front** — one `widget-theme.ts`
  literal-resolver, documented, not a mid-build scramble.
- **Fee money is operator/company money** — never "protocol money" (implies a
  member claim on treasury), never mixed with membership routing.

### 4.3 The SEASON-POT connection (the doctrine change)

The ramp fee (Option A) is company revenue. The season pot (the amended doctrine,
2026-07-18) is company MARKETING money redistributed to members for **merit-measured
activity, never chance** — the Howey + Swiss-gaming shield. The two are consistent:
company money in (service fees, membership), company money out (marketing/season
recognition), all merit-based, none of it a yield on holding. The ramp can even be
one of the *activities* that earns season recognition — but only as a measured
act, never a random reward, never "swap to earn money". See the SWAP·GAMIFICATION·
LEGAL dossier for the full legal line (US + Switzerland + world).

---

## PART 5 — WHAT THIS IS NOT (guardrails)

- Not a trading desk / speculation surface — a door to the seat.
- Not a second wallet system — it consumes our one identity.
- Not a place for banned vocabulary or "earn by trading".
- Not a badge-without-proof — we link verification, we don't just claim it.
- Not infinite-approval — bounded approvals only.
- Not parallel truth — reuse the reality spine, the referrer/sourceId path, and
  `CommissionRouterV1`; don't spawn a second identity or routing system.

---

## PART 6 — THE FOUNDER'S OPEN DECISIONS (nothing pre-decided)

1. **Framing** — ramp-to-the-seat on `/join` only, or a wider surface?
2. **Fee** — Option A (announced service fee, company revenue) or Option B (free
   ramp, acquisition cost)? If A, what percentage, admin-set?
3. **Admin control set** — which levers the operator governs (on/off, placement,
   fee, allowed chains/bridges, fee wallet) — the full list is the founder's.
4. **Chains/tokens scope** — how wide the `from` side opens (all 30+ LI.FI chains,
   or a curated set)?
5. **Where the ramp sits in the acted order** — it's a real surface with the
   `no-raw-color` exception to plan; which slot?
6. **The ramp ↔ season-pot tie** — is "used the ramp" ever a season-recognized
   activity (merit, never chance), or kept purely functional?

*These are the founder's calls. This doc lays out the field — engine, patterns,
the living admin↔backend↔frontend wiring, the fee, and the doctrine warnings.*
