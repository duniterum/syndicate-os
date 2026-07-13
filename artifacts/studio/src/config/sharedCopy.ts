// config/sharedCopy.ts
//
// Shared calls-to-action and safety statements reused across surfaces, so copy
// lives in one place instead of being re-typed per page. Dependency-free →
// Node-loadable.

export interface Cta {
  label: string;
  href: string;
}

export const ctas: Record<string, Cta> = {
  requestSeat: { label: "Take your seat", href: "/join" },
  buildLink: { label: "Build your referral link", href: "/source" },
  verifyProof: { label: "Verify proof", href: "/proof" },
  viewStatus: { label: "View status", href: "/status" },
  learn: { label: "Learn how it works", href: "/learning" },
  exploreSource: { label: "How the referral program works", href: "/referral" },
  getSupport: { label: "Get support", href: "/support" },
  openConsole: { label: "Open Studio OS", href: "/studio" },
  viewContracts: { label: "Contract & economy memory", href: "/contracts" },
  viewArchive: { label: "Archive & chronicle", href: "/archive" },
  viewRecognition: { label: "The recognition model", href: "/recognition" },
};

/** Reusable, non-negotiable honesty statements. */
export const safetyCopy = {
  notInvestment:
    "The Syndicate is a recognition and attribution protocol — not an investment. Membership isn't a security or financial product, and it promises no money or financial gain.",
  sourceWins:
    "If anything we write disagrees with the real code or on-chain proof, the proof wins and we correct the words.",
  noFakeData:
    "We never make up numbers, members, balances, or activity. Anything we can't yet show live is clearly marked as not live.",
  readOnly:
    "Right now this is view-only: no payments, no live chain reads, and nothing is changed behind the scenes.",
};
