# THE LIVING NOTIFICATION LAYER — indicative reference

> **Provenance:** Claude-advisor reference dossier, 2026-07-18. Saved to the repo
> on the founder's instruction so future sessions consult it at the relevant
> slice. **Not a spec. The destination picture**, companion to the Chronicle
> newsroom doc and the Swap/Bridge ramp doc. Bends to the founder's word, the live
> repo, and the settled canon. **NOTIF-1 (the Notification Center) is ALREADY
> SEALED IN PROD (`a45d8b8`)** — this doc is what NOTIF-1 grows INTO, harvested at
> the right slice, never a rebuild. Grounded in live web research (notification
> architecture + GDPR/ePrivacy), 2026-07-18, not memory.
> **Baseline update 2026-07-19:** NOTIF-2/2b + polish also sealed through
> `51e68de` (operator icon + deep-link pickers, no-dead-clicks, audited delete,
> read-path revalidation) — the v2 that remains is the auto generator +
> preferences.

## 0. The one-line reframe

The notification layer is the protocol speaking to its members inside a space they chose to enter. It is NOT outbound reach. The member opens the inbox the way you open a mailbox — the protocol deposits, the member reads when they want. That single fact resolves the whole design: in-app is a consented reading space, not cold outreach, so the protocol may speak first HERE, governed by per-category preference, never by silence.

## PART 1 — THE DOCTRINE CLARIFICATIONS (engrave these; they prevent re-blocks)

Three settled-canon lines could, if read literally by a future session, BREAK this layer. Each is clarified here so NOTIF-1 is never re-blocked.

### 1.1 "NEVER-MESSAGE-FIRST" = EXTERNAL CHANNELS ONLY

The AUD-T "never-message-first" rule protects against COLD OUTREACH on external channels — email, SMS, social media, DMs — where contacting someone who didn't ask is spam (ePrivacy / CAN-SPAM territory). It does NOT apply in-app.

* External (email/SMS/social/DM): never-message-first stands, strict. And the no-email canon already settles this harder: in-app is the protocol's ONLY channel — the protocol sends NOTHING externally. So the rule is moot by architecture, not just by discipline.
* In-app (the protocol inbox): the protocol deposits freely — broadcasts, service notices, activity — because the member CHOSE to be here and comes to READ. A "never-message-first" reading in-app would empty the inbox of its purpose and make broadcasting impossible (absurd). Member control here runs through per-category preferences, not through silence.

Engrave: never-message-first governs external reach; in-app is a consented reading space the protocol fills, bounded by preferences, quiet hours, and rate limits — not by a first-message ban.

### 1.2 THE SEASON-POT DOCTRINE CHANGE (already engraved elsewhere; carried here)

Season/recognition notifications may announce a real distribution — the founder's 2026-07-18 decision (marketing budget → members for merit-measured activity, never chance). So a "your season recognition is ready" notification is legitimate. The legal line (merit never chance, act never holding, company-funded loyalty framing, no required stake, per-jurisdiction, AML) governs the PAYOUT, and the banned-vocabulary law governs the notification COPY (no yield/APY/return).

### 1.3 AMOUNTS VISIBLE + NO MEMBER ADDRESS

Notifications obey the Visibility Law — a "commission paid" notice shows the real figure (nothing theatrically hidden), and the server never emits a MEMBER address in any notification payload. Own-row only: a member's notification is about THEIR standing, never a directory of others.

## PART 2 — THE CATEGORY ARCHITECTURE (from live research, not invented)

Verified 2026 best practice: 5–10 categories grouped into 2–4 sections. Fewer than five gives too little control; more than twenty without grouping creates decision fatigue. Defaults follow the law: transactional opted-IN by default, marketing opted-OUT by default.

Proposed sections & categories (founder decides the final set):

**SECTION A — Essentials / account (ON by default, toggle DISABLED, always shown)**

* Security & account (sign-in, wallet, critical) — mandatory, cannot be turned off
* Your purchase & receipt (seat written, receipt ready) — the service itself

Research rule: transactional/security notices serve critical functions users need regardless of preference — shown in the preference center with disabled toggles, so the member SEES them but cannot turn them off. This is the honest answer to "can a member mute everything?": no for essentials, but they're visible, never hidden.

**SECTION B — Activity about YOU (ON by default, individually mutable)**

* Referral success (someone you introduced took a seat)
* Commission paid to your wallet (amount shown — Visibility Law)
* Recognition / rung rise (a footprint milestone reached)
* Season recognition ready (the merit distribution — doctrine 1.2)

**SECTION C — Protocol / institutional (ON by default, mutable)**

* Founder broadcast (your first message lives here — NOT marketing)
* Protocol milestones (a burn, a treasury act, a chapter crossing)
* Chronicle moments made public (a promoted entry)

**SECTION D — Marketing / promotional (OFF by default, explicit opt-in)**

* Reserved for any future promotional messaging — separate toggle, easy opt-out, never bundled with A/B/C (research: consent must be granular, not all-or-nothing)

Legal note: the founder broadcast is INSTITUTIONAL (Section C), not marketing — it's the protocol's own signal to its members, service-basis under contract, not a promotional send requiring opt-in. Keep it out of Section D.

## PART 3 — THE PREFERENCE ENGINE (backend, from research)

A preference store + an evaluation engine that runs BEFORE every dispatch:

* Preference store per member: category subscriptions, quiet hours + timezone, rate limits (max/hour, max/day). (In-app is the only channel — no multi-channel matrix, but the category/quiet-hours/rate-limit logic still applies.)
* The engine evaluates, in order: is this a MANDATORY notice (security/legal)? → override preferences and deliver. Otherwise: is the category muted? → skip. In quiet hours? → queue for later. Rate limit hit? → batch or hold. This is the documented anti-fatigue pattern, and it IS the in-app expression of "never-spam": rate limits + quiet hours, not a first-message ban.
* Consent trail (legal requirement): who, when, what they saw, how they consented/withdrew — stored, so the protocol can prove compliance. The universal test across all jurisdictions: can the member withdraw as easily as they opted in? The preference center IS that withdrawal path.
* Event sources (three, from research): user-driven (immediate), system-driven (batchable), external. The protocol's on-chain events (first detected, commission, rung, burn) are SYSTEM-DRIVEN — they can batch, they don't need millisecond latency.

## PART 4 — THE AUTOMATIC PROTOCOL EVENTS (System-First: the full inventory)

NOTIF-1 must be able to CARRY these without re-design. The founder decides which fire and when; the architecture must anticipate the whole class.

On-chain / reality-spine driven (system events):

* First-of-class detected → notifies the FOUNDER for promotion (CHR-1: machine detects, founder promotes) — an OPERATOR notification, not a member one
* Your referral succeeded / your commission paid (member, Section B)
* Your rung rose / a footprint milestone (member, Section B)
* Season closed, your recognition ready (member, Section B — doctrine 1.2)
* Ramp-to-seat completed (member — ties to the Swap/Bridge doc)
* Burn, treasury act, chapter crossing (institutional, Section C)

Founder-driven (manual, signed acts):

* The founder broadcast (Section C) — one signed act, the first entry in the founder's signal record

Chronicle tie: a first detected is both a notification (to the founder) AND a FIRSTS-engine candidate → a potential Chronicle moment. The same event flows to the inbox and to the newsroom pipeline — one reality spine, many projections.

## PART 5 — THE LIVING INTERCONNECTION (admin ↔ backend ↔ frontend)

### 5.1 Backend → member (the spine drives the inbox)

Notifications are born from real events on the reality spine (a confirmed purchase, an indexed commission), never from mock or arithmetic — the same Mirror/no-recompute discipline as the receipt. A figure in a notification is the event's own field.

### 5.2 Admin → everything (operator governance)

* The founder composes and sends broadcasts from admin (the existing NOTIF-1 broadcast) — a signed act, previewed before send.
* The operator governs which automatic classes are LIVE vs held (System-First: the full class list exists; the operator turns each on deliberately, PENDING until wired).
* Rate-limit / quiet-hours defaults are operator-set, member-overridable.

### 5.3 Frontend → member (the inbox they read)

* The member inbox: read/unread, history, per-category preferences, the mandatory categories shown with disabled toggles (honest, visible, uncuttable).
* Broadcast body renders faithfully (the founder message's line-break ladder must survive — test with a throwaway broadcast before the real first one).
* DON'T TRUST — VERIFY: a notification about an on-chain event LINKS its proof (the tx), it doesn't just assert it.

### 5.4 The broadcast test discipline (learned this session)

Before the real first founder broadcast: send a throwaway test ("test — please ignore") to prove delivery to all members, bell + preview + full body, and the line-break rendering. The real historic first goes ONCE, clean — never a "test 123" as the founder's first recorded signal. *(Honored 2026-07-18; kept as doctrine for any future channel.)*

## PART 6 — WHAT THIS IS NOT (guardrails)

* Not external outreach — in-app is the only channel (no-email canon); external never-message-first is moot by architecture.
* Not spam — governed by quiet hours + rate limits + per-category mute, not by silence.
* Not all-or-nothing consent — categories are granular; marketing is separate and opt-in.
* Not a member directory — own-row only; server never emits a member address.
* Not hidden amounts — Visibility Law applies to notification bodies.
* Not banned vocabulary — no yield/APY/return in season/commission notices.
* Not parallel truth — reuse the reality spine, the NOTIF-1 center already in prod, and the FIRSTS/Chronicle pipeline; don't spawn a second notification engine.

## PART 7 — THE FOUNDER'S OPEN DECISIONS (nothing pre-decided)

1. The final category set & sections — the A/B/C/D above, or a different cut?
2. Which automatic classes fire, and when — each is System-First-inventoried but the founder slots them (some are PENDING until their read is wired).
3. Mandatory set — exactly which categories are uncuttable (security + own purchase proposed) vs mutable.
4. Quiet-hours / rate-limit defaults — the operator defaults, member-overridable.
5. Where the preference-center + automatic-events enrichment sits in the acted order — NOTIF-1's shell is in prod; this is its growth, at which slot?
6. ✅ DONE 2026-07-18 — the first real broadcast was sent ("This message opens the record."), the throwaway tests were deleted, and Q43 is closed on screenshot evidence.

These are the founder's calls. This doc lays the complete field — the doctrine clarifications that keep it unblocked, the researched category/preference architecture, the full automatic-event inventory, and the living admin↔backend↔frontend wiring — so NOTIF-1 grows without a re-design.
