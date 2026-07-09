import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";

// Honesty label for the hero's illustrative figures. Deliberately SEPARATE from
// TruthLabel (which reports live wiring status). SampleTag never renders "Live":
//   - simulated   → a made-up figure shown to convey shape, not a live read
//   - canonical   → a fixed structural fact (e.g. the 70/20/10 routing ratio)
//   - illustrative→ a non-numeric mock element
export type SampleKind = "simulated" | "canonical" | "illustrative";

const KIND_TEXT: Record<SampleKind, string> = {
  simulated: "Preview",
  canonical: "Canonical",
  illustrative: "Preview",
};

// Kind → tokenized tone. Canonical facts read on the proof (cyan) axis; simulated
// previews are caution (amber); illustrative mocks are inert → neutral.
const KIND_TONE: Record<SampleKind, StatusTone> = {
  simulated: "caution",
  canonical: "proof",
  illustrative: "neutral",
};

interface SampleTagProps {
  kind: SampleKind;
  className?: string;
}

export function SampleTag({ kind, className = "" }: SampleTagProps) {
  return (
    <StatusPill tone={KIND_TONE[kind]} size="xs" className={className}>
      {KIND_TEXT[kind]}
    </StatusPill>
  );
}
