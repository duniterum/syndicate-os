// components/address/AddressText.tsx — THE ONE ADDRESS VOICE (Founder ruling at
// the /activity preview, 2026-07-26: "les adresses bleues comme dans le mockup
// et cliquable chaque adresse!! et chaque adresse sur tout le protocole devient
// bleue aussi!!").
// ---------------------------------------------------------------------------
// THE LAW IT SERVES — the settled address model (2026-07-24/25, with the legal
// research behind it). A wallet address is PUBLIC and pseudonymous: it is shown,
// ranked and celebrated, never hidden and never masked-as-security. The grade-AAA
// pattern every serious chain surface uses (Etherscan · Hyperliquid · DeBank ·
// Optimism gov) is exactly two things at once:
//     READABILITY  — the short form `0x205…f464`, so a row stays scannable, and
//     VERIFIABILITY — an explorer anchor on that same short form, so the reader
//                     can check the full value themselves, without asking us.
// Before this atom the protocol had the first half and not the second: short
// forms rendered as dead grey text. Blue + clickable is not decoration; it is
// the affordance that makes the readable form honest.
//
// THE COLOUR IS LOAD-BEARING: `text-proof` is the same cyan every verify anchor
// on the site already uses, so "blue" reads site-wide as "this is checkable on
// chain". Which is why an address WITHOUT a resolvable full value does NOT get
// it — blue always means clickable here, and a blue dead end would teach the
// reader that our affordances lie.

import { ExternalLink } from "lucide-react";

/** The served short form's exact shape (`0x` + 3 hex + `…` + 4 hex). */
export const SHORT_FORM_PATTERN = /0x[0-9a-f]{3}…[0-9a-f]{4}/g;

/**
 * A short form → its full public address. Built per line by the feed clients;
 * a missing entry is an honest gap, never a reason to invent a link.
 */
export type AddressBook = Readonly<Record<string, string>>;

/**
 * Served-URL variant of the SAME anchor voice (added 2026-08-02, the
 * pre-masked-family slice) — for rows whose explorer link arrives FROM the
 * api (the register/season serve shape: the server is the one URL authority,
 * "no client ever guesses a URL scheme"). AddressLink delegates here, so the
 * visual affordance lives exactly ONCE.
 */
export function AddressUrl({
  short,
  full,
  url,
}: {
  short: string;
  full: string | null | undefined;
  url: string | null | undefined;
}) {
  // Fail-closed: no full value or no destination means no link. The address
  // still renders — hiding it would be the bug the address law names — but in
  // the plain data voice, because blue promises a destination.
  if (!full || !url) {
    return <span className="font-mono">{short}</span>;
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      // `break-all` so a wrapped sentence can never push the row sideways — the
      // 375px escape probe caught that class of defect once already today.
      className="font-mono text-proof underline decoration-proof/30 underline-offset-2 transition-colors hover:text-proof-hover hover:decoration-proof-hover focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold break-all"
      title={`${full} — open on the explorer`}
    >
      {short}
      <ExternalLink
        className="ml-0.5 inline h-2.5 w-2.5 align-baseline"
        aria-hidden="true"
      />
    </a>
  );
}

export function AddressLink({
  short,
  full,
  explorerBase,
}: {
  short: string;
  full: string | null | undefined;
  explorerBase: string | null;
}) {
  return (
    <AddressUrl
      short={short}
      full={full}
      url={full && explorerBase ? `${explorerBase}/address/${full}` : null}
    />
  );
}

/**
 * Render a receipt sentence with every address in it turned into a live anchor.
 *
 * WHY A SPLITTER AND NOT A TEMPLATE: the §8 lexicon builds each sentence as ONE
 * canonical string — that is deliberate, because the wording is doctrine and must
 * never be reassembled differently by two surfaces. So the addresses are lifted
 * out at RENDER time by shape, leaving the sentence itself untouched, word for
 * word. A new sentence that mentions an address becomes clickable for free, with
 * no second place to keep in sync.
 */
export function SentenceWithAddresses({
  sentence,
  book,
  explorerBase,
}: {
  sentence: string;
  book: AddressBook | undefined;
  explorerBase: string | null;
}) {
  if (!book || Object.keys(book).length === 0) return <>{sentence}</>;
  const parts = sentence.split(SHORT_FORM_PATTERN);
  const hits = sentence.match(SHORT_FORM_PATTERN);
  if (!hits) return <>{sentence}</>;
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < hits.length ? (
            <AddressLink
              short={hits[i]!}
              full={book[hits[i]!]}
              explorerBase={explorerBase}
            />
          ) : null}
        </span>
      ))}
    </>
  );
}
