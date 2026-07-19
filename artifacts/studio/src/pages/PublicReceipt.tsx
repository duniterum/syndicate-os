// pages/PublicReceipt.tsx — /receipt/{txHash} (Q44 sealed order; the app's
// FIRST param route, founder-approved wireframe 2026-07-20).
// One purchase's permanent public address: whoever holds the link sees the
// full sealed document and can verify it against the chain. This page only
// opens the door — the fetch + honest states live in the panel; the ticket
// itself is born in the wallet module (guard-receipt-ticket pin 10's one
// sanctioned mount). noindex,follow (founder Q44-①): shares unfurl, search
// never accumulates a browsable corpus of purchase pages.

import { useLocation, useParams } from "wouter";
import NotFound from "@/pages/not-found";
import { PublicReceiptPanel } from "@/components/receipt/PublicReceiptPanel";

/** The serving layer's exact admission shape — mirrored here (see below). */
const TX_SHAPE_RE = /^0x[0-9a-fA-F]{64}$/;

export default function PublicReceipt() {
  const params = useParams<{ txHash: string }>();
  const [location] = useLocation();
  const txHash = params.txHash ?? "";

  // THE SERVING LAW, MIRRORED CLIENT-SIDE (review finding, 2026-07-20):
  // serve.mjs admits only the exact-case "/receipt/" prefix + a shape-valid
  // 64-hex tail — every other URL is a real HTTP 404 whose body is the full
  // app shell. wouter's route pattern is wider (case-insensitive, any
  // non-empty tail), so without this mirror a hydrated 404 would dress
  // itself as a receipt surface. Anything the server would 404 renders the
  // same not-found composition here — client and server agree on every URL.
  if (!TX_SHAPE_RE.test(txHash) || !location.startsWith("/receipt/")) {
    return <NotFound />;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
      <PublicReceiptPanel txHash={txHash} />
    </div>
  );
}
