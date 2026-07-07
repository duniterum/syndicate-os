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
