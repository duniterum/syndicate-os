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

// ---------------------------------------------------------------------------
// Knowledge OS map — a wayfinding guide from reading to verifying. Every step
// points at a REAL, read-only public surface that exists today. This is about
// understanding and inspection — learn, verify, understand, inspect, follow
// status — never a task you complete to unlock anything. (Not "learn and
// earn": there is no reward, no unlock, no benefit for following it.)
// ---------------------------------------------------------------------------

export interface KnowledgeOsStep {
  id: string;
  /** The action verb: Learn / Verify / Understand / Inspect / Follow status. */
  verb: string;
  title: string;
  detail: string;
  /** A real, existing read-only route this step points at (omitted for the
   * "learn" step, which refers to the lessons on this same page). */
  href?: string;
}

export const knowledgeOsMap = {
  heading: "The Knowledge OS map",
  intro:
    "How to move from reading to verifying. Each step points at a real, read-only surface that exists today — this is understanding and inspection, not a task you complete to unlock anything.",
  steps: [
    {
      id: "learn",
      verb: "Learn",
      title: "Read the plain-language basics",
      detail:
        "Start with the lessons above: what the protocol is, and how to read this foundation honestly.",
    },
    {
      id: "verify",
      verb: "Verify",
      title: "Check figures against live chain reads",
      detail:
        "The public Protocol Map reconciles every live figure against vendored canon, and fails closed on a mismatch.",
      href: "/map",
    },
    {
      id: "understand",
      verb: "Understand",
      title: "See what is real versus pending",
      detail:
        "The Status hub is the authoritative ledger of each surface's honest wiring state.",
      href: "/status",
    },
    {
      id: "inspect",
      verb: "Inspect",
      title: "Validate a referral link, read-only",
      detail:
        "Validate a referral code against the on-chain registry, or build a shareable referral link — read-only, no transaction.",
      href: "/source",
    },
    {
      id: "follow",
      verb: "Follow status",
      title: "Track the protocol's honest state",
      detail:
        "Public proof surfaces stay truth-labelled; nothing implies wiring that does not exist.",
      href: "/proof",
    },
  ] as KnowledgeOsStep[],
};
