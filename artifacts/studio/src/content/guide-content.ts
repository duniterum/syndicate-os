// Guide content — the deterministic copy for the floating Guide (Support slice).
//
// The Guide is a HELP ASSISTANT, not the protocol's AI Layer (which stays
// PENDING). It "consults, never invents": it routes to proof surfaces and
// surfaces the vetted, number-free FAQ answers — it states NO figure itself.
// Tone exception granted (warm/lively) — it is a helper, not a truth surface.
//
// Dependency-free + lives under src/**, so BOTH the forbidden-copy guard AND the
// no-raw-color guard scan it automatically (recursive walk). Every route below is
// a real registry route; every figure a visitor might want lives on the linked
// the proof page, never here.

export interface GuideQuickRoute {
  label: string;
  href: string;
  blurb: string;
}

/** Quick routes to the proof surfaces — where the live figures actually live. */
export const GUIDE_QUICK_ROUTES: GuideQuickRoute[] = [
  { label: "Status", href: "/status", blurb: "The authoritative ledger — what's live vs pending." },
  { label: "Tokenomics", href: "/tokenomics", blurb: "Supply, distribution, the two prices, burn — all live." },
  { label: "Whitepaper", href: "/whitepaper", blurb: "What the protocol is — every claim verifiable." },
  { label: "FAQ", href: "/faq", blurb: "Honest answers across eight topics." },
  { label: "Join", href: "/join", blurb: "Your exact live quote — and the join itself, two signatures from your own wallet." },
  { label: "Contracts", href: "/contracts", blurb: "Open every contract in the block explorer." },
];

/**
 * Page-aware greeting (deterministic — derived ONLY from the pathname, never from
 * a wallet or any private state). Warm tone; states no figure.
 */
export function guideGreeting(pathname: string): string {
  const p = (pathname || "/").toLowerCase();
  if (p.startsWith("/faq")) return "Looking for a specific answer? I can help you find it.";
  if (p.startsWith("/whitepaper")) return "Reading the whitepaper? I can point you to the proof behind any claim.";
  if (p.startsWith("/tokenomics")) return "Every figure here is read live on-chain — want to see where to verify it?";
  if (p.startsWith("/join")) return "Considering a seat? I can walk you to an exact read-only quote.";
  if (p.startsWith("/status")) return "This is the ledger of what's live vs pending. Questions? I'm here.";
  if (p.startsWith("/map") || p.startsWith("/contracts")) return "Want to check a contract yourself? I'll point the way.";
  if (p === "/" || p === "") return "New here? I can help you observe the protocol — no signup, nothing asked.";
  return "Need a hand finding something? I point you to the proof.";
}

/**
 * Suggested prompts — each is a REAL FAQ question (verbatim), so clicking one
 * surfaces its vetted, number-free answer from the shared corpus. No invention.
 */
export const GUIDE_SUGGESTED: string[] = [
  "What is The Syndicate?",
  "What can I verify today?",
  "How do I become a member?",
  "Is a seat a financial product?",
  "Where does my USDC go?",
];

/** How long after landing before the one-time greeting bubble appears (ms). */
export const GUIDE_GREETING_DELAY_MS = 20000;

/** localStorage key — the greeting is shown at most once per browser. */
export const GUIDE_PROMPTED_KEY = "syndicate_guide_prompted";
