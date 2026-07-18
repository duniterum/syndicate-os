# THE CHRONICLE AS A LIVING NEWSROOM — indicative reference

> **Provenance:** Claude-advisor reference dossier, 2026-07-18. Saved to the repo
> on the founder's instruction so future sessions consult it at the relevant
> slice. **Not a spec. A picture of the destination**, for the founder to react to
> and for Claude Code to harvest from. Everything here bends to the founder's
> word, the live repo, and the settled canon. The origin repo already contains
> much of the engine described in Part 3 — harvest, adapt, never rebuild.

---

## 0. The one-line reframe

The Chronicle is not a blog. It is **the institution telling its own story over
time** — and at the beginning, the founder is at the center because everything
depends on him. It must therefore hold TWO kinds of memory:

- **On-chain moments** — firsts, burns, seats, milestones (already engineered).
- **Off-chain moments** — the Swiss company registration, a partnership, a
  legal document, a founder announcement, a press mention — things that have no
  transaction hash but are still real, and still part of the story.

The design job: make both read like a **world-class newsroom** (Stripe / Kraken
press-room quality), while the truth job keeps each entry **provably what it
claims to be** — on-chain entries verifiable on the explorer, off-chain entries
backed by a real document or source, never an unbacked claim.

---

## PART 1 — THE DESIGN (world-class blog/news, grade AAA)

### 1.1 What the best actually do (researched)

- **Stripe newsroom / blog**: one clear featured story, then clean typographic
  cards with a short excerpt and a "Read more" — restraint, not decoration.
  Institutional trust comes from *calm*, not noise.
- **Kraken press room**: a "Featured articles / press mentions" band up top,
  then a chronological feed — exactly the founder-at-center shape (the big
  story leads, the record follows).
- **2026 blog best practice**: hero featured post + card grid below; single
  featured image drives each card; mobile is 63%+ of traffic so mobile-first
  is non-negotiable; touch targets ≥48px; body text ≥16px; CSS Grid/Flexbox
  responsive; minimalism to reduce cognitive load; "read more" per card.

### 1.2 The home surface (the Chronicle teaser on the homepage)

**Recommended count: 3 or 6, never a random number.** Reasoning:

- **3** = one featured hero + 2 cards → cleanest above-the-fold, strongest for a
  young Chronicle with few entries (never show empty slots).
- **6** = one featured hero + a 5-card grid (or 2×3) → for when the record is
  richer. Grid of 3 columns on desktop, 1 on mobile.
- Avoid 4/8 as fixed: they force awkward grids and tempt filler. Better rule:
  **featured + (N−1) cards, where N adapts to how many real entries exist** —
  the surface never invents an entry to fill a slot (anti-scarcity doctrine).

**Shape:**

```
┌─────────────────────────────────────────────┐
│  THE CHRONICLE            [ See the record → ]│   ← section header + link
│                                               │
│  ┌───────────────────────────────────────┐   │
│  │   [ featured image ]                   │   │   ← FEATURED entry (the latest
│  │   Chapter I · Genesis                  │   │      founder-promoted moment):
│  │   The protocol wrote its first seat    │   │      big image, title, dek,
│  │   ~dek: one honest sentence~           │   │      date, "Read more"
│  │   2026-06-04 · verifiable   Read more →│   │
│  └───────────────────────────────────────┘   │
│                                               │
│  ┌────────┐ ┌────────┐ ┌────────┐             │
│  │ [img]  │ │ [img]  │ │ [img]  │             │   ← 2–5 cards: image, kind
│  │ title  │ │ title  │ │ title  │             │      chip, title, date,
│  │ date   │ │ date   │ │ date   │             │      Read more
│  └────────┘ └────────┘ └────────┘             │
└─────────────────────────────────────────────┘
```

### 1.3 The dedicated `/chronicle` page (the full newsroom)

```
┌─────────────────────────────────────────────┐
│  THE CHRONICLE                                │   ← page header: title +
│  The institutional record, in order.          │      one honest line + filter
│  [ All ] [ On-chain ] [ Off-chain ] [ Chapter]│      chips (kind/register)
│                                               │
│  ┌───────────────────────────────────────┐   │
│  │   [ LARGE featured image ]             │   │   ← the lead article: full
│  │   Chapter · kind chip                  │   │      width, large image,
│  │   Big title                            │   │      title, dek, meta,
│  │   Dek paragraph.                       │   │      Read / Verify
│  │   date · verifiable ↗   Read the entry→│   │
│  └───────────────────────────────────────┘   │
│                                               │
│  ── Then the record below ──                  │
│  ┌────────┐ ┌────────┐ ┌────────┐             │   ← responsive card grid
│  │ card   │ │ card   │ │ card   │             │      (3-col desktop / 1 mobile)
│  ├────────┤ ├────────┤ ├────────┤             │      newest first, paginated
│  │ card   │ │ card   │ │ card   │             │      / "Show more"
│  └────────┘ └────────┘ └────────┘             │
│              [ Show more ]                     │
└─────────────────────────────────────────────┘
```

### 1.4 The single entry page `/chronicle/{slug}`

A real article page, editorial grade:

- Large hero image, kind chip + chapter, title, dek, date, reading context.
- Body prose (the founder's or the machine's promoted narrative).
- **The proof block** — this is our signature, what no blog has:
  - on-chain entry → the tx hash, block, and a **Verify on-chain ↗** button to
    Avascan (via the existing verify-links endpoint, infra only).
  - off-chain entry → the **backing artifact** (a linked PDF of the registration
    certificate, the partnership announcement, the press URL) with a plain
    "what backs this" line. Honest absence if a field doesn't apply.
- Prev / next entry nav; "back to the record"; share card (reuse the 1200×630
  share engine already built for receipts).

### 1.5 Visual language (fits the existing skin)

- Reuse the studio's tokens (gold accent, serif for titles if legible, mono for
  data lines) — the Chronicle should feel like the same institution as the
  receipt, not a bolted-on WordPress theme.
- Readability first (a settled law this session): upright, contrast, ≥16px body,
  ≥48px touch. No italic-serif-muted decorative traps.

---

## PART 2 — THE IMAGE PER ARTICLE (the founder's question)

You asked: images generated, or supplied by you from admin/Replit? Both are
viable; here is the honest tradeoff so you decide (no assumption made):

| | **You supply (admin dashboard)** | **Generated (AI, per entry)** |
|---|---|---|
| Control | Total — you pick the exact image | The system proposes; you approve |
| Consistency | Depends on your discipline | A locked style = a coherent feed |
| Effort per entry | You source/make each one | Near-zero, on promotion |
| Risk | Slower; you're the bottleneck | Off-brand drift if unguided |

**Grade-AAA pattern that fits your doctrine (CHR-1: machine detects, founder
promotes):**

- On promotion, the system **generates a candidate image** in a **locked house
  style** (a defined prompt template → same palette, same motif, gold-on-dark,
  abstract not literal — never a stock photo, never a fake screenshot).
- The founder can **accept the generated image OR override it** with one he
  supplies from the admin dashboard. Same gate as the entry text itself.
- The image is stored as a static asset (like the brand marks), referenced by
  the entry — so it's cacheable, shareable (the 1200×630 card), and never a
  live external fetch.

This keeps the feed visually coherent (generated default) while preserving the
founder's total authority (override) — the exact balance the whole protocol runs
on. **Decision held for the founder**, not pre-decided here.

---

## PART 3 — ON-CHAIN + OFF-CHAIN (the founder's expansion)

### 3.1 The origin repo ALREADY has the bones — harvest it

The `TheSyndicate` origin repo contains a built **Chronicle admission layer**
and a **two-register classification**. Key facts (from its own memory docs):

- **Two registers** already modelled: `protocol-institutional` and
  `member-living`. Register is **derived from category**, never hand-set.
- An **admission layer** decides which durable **institutional register entries**
  are eligible to LATER become Chronicle entries — a candidate layer, never a
  publisher. Promotion into the Chronicle is **always a separate human act**
  (this IS CHR-1, already engineered).
- Its **admit buckets** already include non-purchase, arguably off-chain-shaped
  facts: *liquidity seeding, treasury acquisition, artifact issuance, protocol
  milestone, chapter completion, genesis-seed*.
- A hard rule: **admission reads STRUCTURE, never amount or identity** — "money
  may never by itself admit a fact" (canon §4.5 Rule E). Founder/system-wallet
  subjects require **institutional significance** and may only enter the
  institutional register — they never masquerade as organic member history.

**Implication:** the pipeline to carry off-chain institutional moments is
*mostly already conceived*. What's missing is (a) an **off-chain entry SOURCE**
(today's admission reads on-chain-derived register entries) and (b) the
**backing-proof model** for entries with no tx hash.

### 3.2 The off-chain entry — how it stays truthful

An off-chain Chronicle entry (Swiss company registration, partnership, press,
founder announcement) must still be **provable**, or it's just marketing. The
truth mechanic:

- Every entry carries a **proof kind**:
  - `on-chain` → tx hash + block + explorer verify link (existing).
  - `document-backed` → a stored artifact (PDF/image of the certificate,
    signed agreement, filing) + optional **document hash committed on-chain**
    (this is your own AUD-T open question Q — "on-chain hash commitment of legal
    docs" — the SAME mechanism serves Chronicle proof). A reader can verify the
    displayed document matches the committed hash.
  - `source-backed` → a citation to a public, authoritative source (a
    government registry URL, a reputable press URL) shown transparently.
  - `founder-attested` → explicitly labelled as the founder's word, dated and
    signed by the founder wallet — honest about being an attestation, never
    dressed as independent proof.
- **No unbacked entries.** An announcement with nothing behind it is
  `founder-attested` and *labelled as such* — the reader always knows the proof
  grade. This is the Chronicle's whole reason to exist: proof-first, even for
  off-chain history.

### 3.2b THE DOCUMENT MUST POINT TO ITS OFFICIAL SOURCE (founder rule, settled)

A provided document is not the end of the proof — it is the **bridge to a truth
verifiable elsewhere**. The founder's rule:

- **If an official external source exists, the entry MUST carry its link** — the
  document and the official-source link **coexist; the link is IN ADDITION to
  the uploaded document, never a replacement for it.**
  - **`.gov` / state registry** (e.g. the Swiss commercial register / Zefix) →
    the strongest link: readers verify on the government's own site, not on the
    founder's word. This is "don't trust — verify" applied to off-chain history.
  - **Official third-party site** (a partner, an institution) → link to their
    own announcement/page.
- **In-text links** for the rest (context, articles, references) → embedded in
  the entry body, transparent, never disguised.
- If a document genuinely has **no** official external source, the entry is
  **honest about that fact** — it does not fake a link.

**Durability ordering (why all layers coexist — external links can die):**

1. **On-chain document hash** — *eternal.* Even if every external page vanishes,
   the committed hash proves the document shown is the exact one, and when.
2. **Stored document** — *permanent.* The uploaded artifact lives with the entry
   (like the brand marks), independent of any external site's uptime.
3. **Official source link** — *living verification, but may move.* A `.gov` URL
   can change; a registry can migrate. So the link is the live re-check, but
   **the document + hash remain the permanent proof if the link ever breaks.**

Grade-AAA consequence: an entry never rests on a single external link that could
rot. The permanent proof (hash + stored doc) stands on its own; the official
link is the bonus that lets anyone re-verify against the outside world today.

### 3.3 "How will people know I opened a Swiss company?" — the concrete flow

1. You register the company; you receive the official certificate/extract.
2. In the admin dashboard you create an **off-chain candidate**: title, dek,
   body, date, an uploaded certificate PDF, proof kind = `document-backed`, **and
   the official registry link** (e.g. the Swiss commercial register / Zefix entry
   for the company) — mandatory because the source exists.
3. (Optional, strongest) the document's hash is **committed on-chain** — so
   anyone can verify the PDF shown is the exact one you committed, and when.
4. The system generates a house-style image (you accept or override).
5. **You promote it** (CHR-1) — one founder-signed act. It becomes a Chronicle
   entry, appears as the featured story, and travels as a share card.
6. The entry page shows the certificate + **the .gov registry link** +
   "verify this document" — the reader sees the real filing AND can re-check it
   on the state's own site, not a claim. **That** is how people know,
   world-class. If the registry URL ever moves, the stored doc + on-chain hash
   still stand as permanent proof.

### 3.4 The register/legend the reader sees

A small, honest legend (like the receipt's proof line):

- **On-chain** ↗ verify on Avalanche
- **Document** ↗ view filing (+ hash-committed badge if committed)
- **Official source** ↗ the state/registry (.gov) or official third-party page —
  shown **alongside** the document whenever one exists, so the reader can
  re-verify on the outside world's own site
- **Attested** — the founder's signed word, dated

The `document-backed` entry therefore typically shows BOTH: the stored filing
(permanent) **and** its official-source link (live re-check) — the document
points to its source, never stands alone when a source exists.

---

## PART 4 — THINGS YOU DIDN'T ASK BUT WILL WANT (found for you)

1. **A `type`/`kind` taxonomy that is OPEN and evolutive** — same principle as
   THE FIRSTS engine: don't hardcode "these are the entry kinds." Kinds are a
   registry that grows (milestone, burn, partnership, filing, press, product,
   season, recognition, …). A new module → its entry kind joins the newsroom
   automatically. (Ties directly to the FIRSTS work already engraved.)
2. **RSS / Atom feed + JSON feed** — a real newsroom is syndicated. A static
   feed file (like sitemap.xml) lets members, aggregators, and AI readers follow
   the Chronicle. Cheap, high-credibility, fits the llms.txt/SEO direction.
3. **Structured data (schema.org `Article` / `NewsArticle` + `Organization`)**
   per entry → Google shows it as news, AI readers parse it. The SEO audit
   already flagged Organization schema present; entries should extend it.
4. **Press / recognition band** — Kraken-style "as seen in" once real press
   exists. Empty until real → never faked. A future kind, armed empty.
5. **The share card per entry** — reuse the receipt's 1200×630 engine so every
   promoted moment is a recruitment/credibility artifact on WhatsApp/X, carrying
   "verifiable ↗". The Chronicle becomes marketing that can't lie.
6. **Chapter/era as the top-level narrative spine** — the newsroom groups by
   Chapter (I · Genesis …) and Era, so the story reads as a series (your Netflix
   framing: people watch it evolve). Chapters are already in the data model.
7. **A stable per-entry permalink + slug** — `/chronicle/genesis-first-seat` —
   so entries are linkable, citable, and never renumber. Museum pieces need
   stable addresses.
8. **"Latest / updated" honesty** — dates are real event dates, not publish
   dates dressed up. An off-chain filing shows the filing date; promotion date
   is separate and shown as such.
9. **Draft → review → promoted** states already exist in the origin pipeline —
   the newsroom should render only `promoted`; drafts live in admin only.
10. **Accessibility + reading time + prev/next** — small editorial touches that
    separate grade-AAA from a template.

---

## PART 4b — MAKING THE INTELLIGENCE EVEN SMARTER (built on what exists)

The detector is already grade-A: a 5-layer pipeline (EVENT → SIGNAL → MEMORY
CANDIDATE → CHRONICLE REVIEW CANDIDATE → PROMOTION DECISION), identity-blind,
amount-blind, copy-regenerated person-free, review-first, with a fixed decision
precedence and a `default = hold-context` so nothing unhandled can auto-approve.
Everything below ADDS to that spine — it never weakens a guard or the human gate.

**Each idea keeps the two laws intact:** the machine still only *recommends*
(never auto-publishes), and it still reads STRUCTURE not identity/amount.

1. **Significance scoring, not just eligibility.** Today a candidate is
   eligible or held. Add a transparent *significance score* (rarity of the
   class, whether it's a genuine first-of-class, chapter-weight, coverage
   completeness) so the founder's review queue is **ranked** — the biggest
   moments surface first instead of a flat list. The score is explainable
   (shows its factors), never a black box, and never auto-promotes.
2. **A rich, explainable "why this matters" per candidate.** The pipeline
   already generates a `significanceReason`. Deepen it: the machine drafts a
   *proposed dek and title* (person-free, banned-vocab-validated) so the
   founder promotes with one glance and one edit — the AI does the writing
   labour, the founder keeps the authorship. (Ties to the FIRSTS gold-witness
   line already engraved.)
3. **First-of-class awareness across the OPEN registry.** Wire the detector to
   the evolutive FIRSTS registry: the moment a new event class exists (a new
   module, a new income stream), its "first" is watched automatically — the
   intelligence extends itself without anyone adding a rule. A candidate that is
   a true first-of-class gets flagged as such and scored higher.
4. **Chained / compound-moment detection.** Beyond single events: detect
   *relationships* — the first chained referral (a member brought by a member
   who was brought), the day three genesis acts landed together, the crossing of
   a chapter threshold. These are higher-order firsts a flat event scan misses.
5. **Proposed chapter/era placement.** The machine suggests which Chapter/Era a
   candidate belongs to (from block/date/threshold), so the newsroom's narrative
   spine is pre-sorted — the founder confirms or moves it.
6. **Candidate image pre-generation.** On reaching the review queue, the system
   pre-renders the house-style candidate image (Part 2), so promotion is truly
   one act — text, dek, image, placement all proposed, founder approves/overrides.
7. **Duplicate / near-duplicate guard.** Detect when a new candidate restates an
   already-promoted moment (or another pending candidate) so the record never
   double-tells the same story — an intelligence check that protects the
   Chronicle's dignity.
8. **Confidence + honest-uncertainty flags.** When verification is `pending` or
   coverage is limited, the candidate says so in plain words (the pipeline
   already flags "awaits verification"). Extend it to a clear confidence badge in
   the review UI, so the founder never promotes something the chain can't yet
   fully back.
9. **Off-chain candidate intelligence (the new source).** When the off-chain
   entry source (Part 3) lands, the same scoring/dek/placement intelligence
   applies to filings/partnerships/press — e.g. auto-suggesting the proof kind
   and prompting for the official source link when a document is uploaded.
10. **A learning loop that respects the human gate.** Record which candidates the
    founder promotes, edits, or rejects (and how he edits the dek) as
    *signal for better future proposals* — the machine's suggestions improve over
    time toward the founder's taste. Strictly proposal-side: it tunes what the
    machine *recommends*, never what gets *published*, and never overrides a
    guard or the banned vocabulary. (Design-level idea; the founder decides if
    and when a learning loop is wanted — it is not a silent behaviour.)

**The guardrail on all of it:** smarter detection, richer proposals, better
ranking — but the founder's single signed promotion stays the ONLY path to a
public entry, and every generated string still passes the banned-vocabulary and
person-free validators. Intelligence serves the founder's judgement; it never
replaces it.

## PART 5 — WHAT THIS IS NOT (guardrails)

- Not a place for hype, price talk, or "moon" language — banned vocabulary
  applies to the newsroom too.
- Not a member directory — off-chain entries about people are institutional
  (founder/partners), never a roster of members.
- **Auto-DETECT, human-PUBLISH — the two coexist, no contradiction.** The
  machine DOES automatically detect and propose the firsts (first sale, first
  referral, first LP, milestones …) — it watches the chain, classifies each
  event, and files a *recommendation* into the candidate queue on its own
  (`reviewer = "deterministic-baseline"`, `timestamp = null`). That auto-
  intelligence is the design and it stays. What is NOT automatic is **going
  public**: the doctrine is literal — *"Baseline = recommendation, promotion =
  human act. Nothing auto-publishes."* The founder promotes, one signed act per
  entry, and only then does an entry appear. So the newsroom renders only what
  the founder promoted — while the detector fills the queue by itself.
- Not scarcity theatre — no "coming soon" countdowns on future entries; a moment
  is witnessed when it happens.
- Not parallel truth — this reuses the origin admission layer and the existing
  chronicle libs; it does not spawn a second Chronicle engine.

---

## PART 6 — THE FOUNDER'S OPEN DECISIONS (nothing pre-decided)

1. **Home count**: featured + 2 (total 3) now, growing to featured + 5 (total 6)
   later — or a different shape?
2. **Images**: generated-house-style-with-override (recommended) vs
   founder-supplied-only vs generated-only?
3. **Off-chain proof floor**: is `founder-attested` (labelled) allowed for some
   entries, or must every off-chain entry be at least `document-backed`?
4. **On-chain document-hash commitment**: ship it as the proof spine for filings
   (ties to AUD-T Q) — now, or after the legal-doc set is decided?
5. **Where the newsroom build sits in the acted order** — it's a large surface;
   does it stay at B1's slot, or does part of it (the design shell) come sooner?
6. **Which intelligence upgrades (Part 4b) you want, and when** — significance
   ranking, machine-drafted deks, first-of-class scoring, compound-moment
   detection, the learning loop, etc. Each is additive and human-gated; you pick
   which ones earn a slot and which wait. The learning loop especially is a
   deliberate choice, never switched on silently.

*These are the founder's calls. This document only lays out the field.*
