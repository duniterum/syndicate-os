// config/learningModules.ts
//
// Plain-language education for the public /learning surface. This content is
// REAL and present today — it explains the protocol and how to read this
// foundation honestly. It describes systems that are mostly not wired yet, so
// the page links to /status for the authoritative wiring ledger.
//
// Dependency-free (data only) → Node-loadable.

export interface LearningModule {
  id: string;
  title: string;
  summary: string;
  /** Short, plain-language points. Education, not protocol data. */
  topics: string[];
}

export const learningIntro =
  "Plain-language education about The Syndicate and how to read this foundation. The lessons are real and available now; the protocol surfaces they describe are mostly not wired yet — the Status ledger always shows what is real today.";

export const learningModules: LearningModule[] = [
  {
    id: "what-is-the-syndicate",
    title: "What The Syndicate is",
    summary: "An attribution and recognition protocol — not an investment.",
    topics: [
      "The Syndicate records verifiable membership, attribution, and recognition.",
      "Membership is not a security or financial instrument and promises no financial gain.",
      "This site is a read-only foundation: it shows the shape of the protocol, honestly labelled.",
    ],
  },
  {
    id: "reading-this-foundation",
    title: "How to read this foundation",
    summary: "Every unwired value is truth-labelled, never faked.",
    topics: [
      "Lifecycle labels tell you the honest status of each surface (read-only proof, paused, pending, future).",
      "Nothing invents numbers, members, or balances — if it is not wired, it says so.",
      "The Status page is the authoritative ledger of what is real versus awaiting a source.",
    ],
  },
  {
    id: "wallets-and-keys",
    title: "Wallets & keys",
    summary: "The basics of self-custody and why they matter.",
    topics: [
      "A wallet is a key pair you control; it is your identity on-chain.",
      "Never share your seed phrase or private key — no one legitimate will ask for it.",
      "On-chain actions are public and permanent; verify before you act.",
    ],
  },
  {
    id: "transactions-and-proof",
    title: "Transactions & proof",
    summary: "Why on-chain reality is the source of truth.",
    topics: [
      "Public claims do not outrank code, canon, or live proof — source wins.",
      "Proof means anyone can independently verify a fact against the chain.",
      "This foundation does not read the chain yet, so proof surfaces stay labelled as pending.",
    ],
  },
  {
    id: "membership-and-recognition",
    title: "Membership & recognition",
    summary: "What a seat means, and how contribution is recognised.",
    topics: [
      "A seat is a verifiable membership record, founder-gated and not live yet.",
      "Recognition acknowledges verified participation — it is structural, not a financial benefit.",
      "Source attribution records who introduced a member, as recognition, never as compensation.",
    ],
  },
  {
    id: "staying-safe",
    title: "Staying safe & honest",
    summary: "Verify everything; trust nothing that promises financial gain.",
    topics: [
      "Treat any promise of financial gain as a red flag — The Syndicate makes none.",
      "Verify contract and canon details yourself before interacting with anything on-chain.",
      "When copy and source disagree, believe the source and report the discrepancy.",
    ],
  },
];

export const getLearningModuleById = (id: string): LearningModule | undefined =>
  learningModules.find((m) => m.id === id);
