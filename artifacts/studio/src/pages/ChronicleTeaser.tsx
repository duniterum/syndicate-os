// pages/ChronicleTeaser.tsx — /chronicle designed teaser (§11 slot 2c).
// The solemn record. Promotion into it is a HUMAN act — founder-promoted
// turning points only; the first true chapters are already lived.

import { TeaserSurface, type TeaserSpec } from "@/components/TeaserSurface";

const spec: TeaserSpec = {
  eyebrow: "Chronicle",
  title: "The institutional story.",
  what:
    "The Chronicle is the protocol's solemn record — not a feed, a memory. Turning points only, each promoted by a human decision and anchored to its on-chain proof. The first chapters are already lived and waiting to be written: the duplicate seat that was owned in public instead of hidden, the first seat bought with real money, the first member source signed under the convention, the day the ladder was decided.",
  lifecycle: "FUTURE",
  previewRows: [
    { label: "The duplicate seat", hint: "owned, never hidden · tx-linked" },
    { label: "The first real seat", hint: "a purchase, not a promise · tx-linked" },
    { label: "The first member source", hint: "founder-signed · tx-linked" },
    { label: "The ladder decision", hint: "the day rates got rules" },
  ],
  unlocks:
    "A founder act, page by page: the chronicle surface plus the first hand-written true chapters. No pipeline is required to tell the truth — the entries exist as lived history; writing them is the work.",
  returnHook:
    "Anyone can claim transparency when everything is clean. The Chronicle exists to prove it when it isn't — and the seats that witness these chapters are part of the story they tell.",
};

export default function ChronicleTeaser() {
  return <TeaserSurface spec={spec} />;
}
