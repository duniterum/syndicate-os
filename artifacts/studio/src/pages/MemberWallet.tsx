// pages/MemberWallet.tsx — /wallet (ARC SLICE D, §11 point 7).
// The member's wallet door: own balances + the approvals panel + the external
// pool pointer. FLAT route deliberately (/member/wallet would create a member/
// directory in the built output and resurrect the 2.0 trailing-slash redirect
// on /member — infra truth wins; the door label stays "Wallet").
// The page badge is READ_ONLY_PROOF: every FIGURE here is a read; the one
// write (revoke) is the member's OWN wallet act that this page only BUILDS —
// the signature happens in their wallet, never here, never on a server.

import { lazy, Suspense } from "react";
import { PublicPage } from "@/components/PublicPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { MemberShell } from "@/components/member/MemberShell";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";

const MemberWalletPanel = WALLET_SESSION_PREVIEW_ENABLED
  ? lazy(() => import("@/wallet/MemberWalletPanel"))
  : null;

export default function MemberWallet() {
  return (
    <PublicPage
      eyebrow="Wallet"
      title="Your wallet, read honestly."
      lead="Your own balances and your own approvals toward the protocol's known contracts — read live, own-row only, never a directory. The one action here (revoking an approval) is a transaction you sign in your own wallet."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
    >
      <MemberShell>
        {MemberWalletPanel ? (
          <Suspense fallback={null}>
            <MemberWalletPanel />
          </Suspense>
        ) : null}
      </MemberShell>
    </PublicPage>
  );
}
