// lib/shareTargets.ts
//
// Official share-intent URLs for one-tap sharing to each platform. Pure
// functions, no dependency. The caller opens the returned URL in a new tab.

const enc = encodeURIComponent;

export interface ShareTargetDef {
  id: string;
  label: string;
  build: (url: string, text: string) => string;
}

export const shareTargets: ShareTargetDef[] = [
  {
    id: "x",
    label: "X",
    build: (url, text) => `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(text)}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    build: (url) => `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    build: (url, text) => `https://wa.me/?text=${enc(`${text} ${url}`)}`,
  },
  {
    id: "telegram",
    label: "Telegram",
    build: (url, text) => `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    build: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`,
  },
  {
    id: "email",
    label: "Email",
    build: (url, text) => `mailto:?subject=${enc("The Syndicate")}&body=${enc(`${text} ${url}`)}`,
  },
];

/** THE one ordered-ids resolver (2026-08-03): two sites had each privately
 * rebuilt `ORDER.map(id => shareTargets.find(…)).filter(…)` — a third was on
 * its way. Order is the caller's decision; resolution is this module's. */
export function pickShareTargets(ids: readonly string[]): ShareTargetDef[] {
  return ids
    .map((id) => shareTargets.find((t) => t.id === id))
    .filter((t): t is ShareTargetDef => t !== undefined);
}

/** THE engraved rendering order — R-BIND-2's «crypto-native order»
 * (2026-07-19), re-affirmed by the founder 2026-08-03 («nous avions plus»):
 * every intent surface of the family carries the SAME six, in THIS order.
 * Two surfaces had each pinned this list privately; it is ONE fact here. */
export const orderedShareTargets: ShareTargetDef[] = pickShareTargets([
  "x",
  "whatsapp",
  "telegram",
  "linkedin",
  "facebook",
  "email",
]);
