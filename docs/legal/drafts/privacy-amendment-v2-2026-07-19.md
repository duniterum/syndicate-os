# Privacy Policy — Version 2 amendment (draft of 2026-07-19)

*Amends `privacy-draft-2026-07-16.md` (Version 1). The served page
(`artifacts/studio/src/pages/Privacy.tsx`) carries the full Version 2 text;
this file records exactly WHAT changed and WHY, for counsel and the record.*

**Why:** SPEC R3 (the `&via=` referral channel log, founder GO 2026-07-19)
introduces the site's ONE first-party aggregate record: daily click counts
per referral code + channel tag, and purchase conversions paired to a tag
only after the server verifies the purchase's public on-chain receipt. No
visitor identity exists in these rows — no IP, no user agent, no cookie, no
identifier, no per-click event, no time grain finer than the day.

## Changed section — "The short version"

> There are no accounts, no email addresses, no passwords, no identity
> checks, and no member directory. You connect a wallet; the wallet — and
> the ordinary technical traces any web server sees — is all we see. We run
> no third-party analytics and no advertising trackers. We sell no data. The
> one counting we do ourselves: when a referral link carries a channel tag,
> the landing adds one to a daily counter for that referral code and tag — a
> number, never a person; who clicked is not recorded, anywhere. Nothing
> else leaves except what a connection itself requires.

## Changed section — "What our database holds" (two paragraphs added)

> Messages the operator sends to members (the in-app notification center)
> are stored with each member's own read state — served only to that
> member's signed session, never published.

*(Records the notification tables that went live 2026-07-18 — a Version-1
omission corrected here, not a new collection.)*

> The referral channel counter: when a referral link carries a channel tag
> (for example `&via=twitter`), the landing adds one to a daily count for
> that referral code and tag, and a completed purchase is paired to its tag
> only after the server verifies the purchase's public on-chain receipt.
> These rows hold a referral code, a tag, a day, and a count — no IP
> address, no browser fingerprint, no cookie, no identifier of who clicked,
> ever. The breakdown is served only to the referral code's own signed
> owner.

## Unchanged truths, re-verified for Version 2

- One session cookie, strictly functional — the channel counter uses no
  cookie and no client-side identifier of any kind.
- Two browser preferences (theme, guide greeting) — the channel beacons add
  no localStorage key.
- Server logs stay operational-only — the channel endpoints log nothing
  (no code, no tag, no hash reaches a log line).
- Terms §7 was corrected in the same slice (the backend keeps the
  operational records this policy lists; it still signs nothing, holds
  nothing, and issues no state-changing chain calls).
