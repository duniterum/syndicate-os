// components/referral/TermsCommitmentHash.tsx
//
// The expected commitment, computed LIVE from the served terms document
// (never hardcoded — the same discipline as every other figure). Renders
// nothing on any failure; the verify link points at the Source Registry,
// where the same hash is recorded as each member source's metadataHash.
// Extracted verbatim from SourceAttribution.tsx (slice 2 — the tabbed member
// surface's Link tab renders the same on-chain commitment proof).

import { useEffect, useState } from "react";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { fetchTermsHash } from "@/lib/termsDocument";

export function TermsCommitmentHash() {
  const [hash, setHash] = useState<`0x${string}` | null>(null);
  useEffect(() => {
    let active = true;
    void fetchTermsHash().then((read) => {
      if (active) setHash(read?.hash ?? null);
    });
    return () => {
      active = false;
    };
  }, []);
  if (!hash) return null;
  return (
    <span className="block mt-1.5">
      <span className="font-mono text-xs text-foreground/80 break-all">
        keccak256: {hash}
      </span>{" "}
      <VerifyOnChain ids={["sourceRegistry"]} className="ml-1" />
    </span>
  );
}
