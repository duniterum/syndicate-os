// pages/ActivityTeaser.tsx — /activity designed teaser (§11 slot 2c).
// Goes live with the event backbone (M4/M5) — until then this page says so.

import { TeaserSurface, type TeaserSpec } from "@/components/TeaserSurface";

const spec: TeaserSpec = {
  eyebrow: "Activity",
  title: "The public heartbeat.",
  what:
    "The protocol learned to speak through verified receipts. Activity will render every on-chain event as a plain sentence — a seat written, supply retired, terms updated — each line receipt-backed with its own verify link, aggregate and address-safe, never a claim. It is the page that proves the protocol is alive without asking you to trust anyone.",
  lifecycle: "PENDING_ADAPTER",
  previewRows: [
    { label: "A seat was written", hint: "block · verify" },
    { label: "Supply was retired", hint: "block · verify" },
    { label: "Source terms updated", hint: "public event · verify" },
    { label: "A referral was paid", hint: "inside the buyer's tx · verify" },
  ],
  unlocks:
    "The event backbone — the indexer that turns raw chain events into receipt-backed lines. The scan machinery already runs for the referral counters; Activity arrives when it runs unattended and serves the feed.",
  returnHook:
    "Every purchase, every burn, every public act of the protocol will be readable here — including yours. The story is already being written on-chain; this page will simply read it aloud.",
};

export default function ActivityTeaser() {
  return <TeaserSurface spec={spec} />;
}
