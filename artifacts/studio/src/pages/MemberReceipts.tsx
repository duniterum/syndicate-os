// pages/MemberReceipts.tsx — /receipts (R-BIND, founder order 2026-07-19;
// the engraved A1 placement ③: the locked "Receipts" door opens).
// The member's receipt binder: every confirmed purchase of the signed
// wallet, each row reopening in place as its full protocol ticket — the
// same paper the checkout prints, one spine, one rendering path. FLAT route
// deliberately (the MemberWallet infra note: a member/ directory would
// resurrect the 2.0 trailing-slash redirect class).
// The paper itself lives in the build-time-gated wallet module; this page
// only opens the door (the lazy member-door pattern, /wallet verbatim).

import { lazy, Suspense } from "react";
import { MemberAppPage } from "@/components/member/MemberAppPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";

const ReceiptsBinderPanel = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/ReceiptsBinderPanel"))
  : null;

export default function MemberReceipts() {
  return (
    <MemberAppPage
      kind="account"
      eyebrow="Receipts"
      title="Your receipts, in one binder."
      lead="Every confirmed purchase on your wallet, each one reopening as its full ticket — dated, exact, and anchored to its own transaction. Your own record only, read live; nothing here is a promise, everything is a proof."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      {ReceiptsBinderPanel ? (
        <Suspense fallback={null}>
          <ReceiptsBinderPanel />
        </Suspense>
      ) : null}
    </MemberAppPage>
  );
}
