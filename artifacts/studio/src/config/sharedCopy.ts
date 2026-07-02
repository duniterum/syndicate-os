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
  requestSeat: { label: "Take your seat", href: "/member" },
  verifyProof: { label: "Verify proof", href: "/proof" },
  viewStatus: { label: "View status", href: "/status" },
  learn: { label: "Learn how it works", href: "/learning" },
  exploreSource: { label: "How attribution works", href: "/source-attribution" },
  getSupport: { label: "Get support", href: "/support" },
  openConsole: { label: "Open Studio OS", href: "/studio" },
  viewContracts: { label: "Contract & economy memory", href: "/contracts" },
  viewArchive: { label: "Archive & chronicle", href: "/archive" },
  viewRecognition: { label: "The recognition model", href: "/recognition" },
};

/** Reusable, non-negotiable honesty statements. */
export const safetyCopy = {
  notInvestment:
    "The Syndicate is an attribution and recognition protocol. Membership is not an investment, security, or financial instrument, and carries no promise of financial gain.",
  sourceWins:
    "No public claim outranks code, canon, or live proof. If copy and source disagree, source wins and the copy is corrected.",
  noFakeData:
    "Nothing here invents numbers, members, balances, or activity. Every unwired value stays truth-labelled.",
  readOnly:
    "This is a read-only foundation: no transactions, no live chain reads, and no backend writes.",
};
