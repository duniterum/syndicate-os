// components/member/MemberQuickActions.tsx — quick actions from THE registry.
// ---------------------------------------------------------------------------
// Member Home §4.3: renders config/memberActions.ts — locked actions stay
// VISIBLE with their plain reason (the visitor sees what a seat unlocks);
// operator actions do not exist in the registry at all. Wallet material is
// reached ONLY via the sanctioned runtime dynamic import of walletSession
// (rule 15) + wagmi hooks; every figure/handler is own-row and fail-closed.

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAccount } from "wagmi";
import { ArrowRight, Check, Copy, Lock, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import { MEMBER_ACTIONS, type MemberAction } from "@/config/memberActions";
import { deriveSourceId } from "@/lib/sourceIdentity";

type OwnState = {
  signedIn: boolean;
  seated: boolean;
  receiptUrl: string | null;
};

/** Own-row session facts via the sanctioned dynamic wallet import.
 * Re-reads on session changes (S7): the member connects on the door band
 * and the locked actions unlock in place — no reload needed. */
function useOwnState(): OwnState {
  const [state, setState] = useState<OwnState>({ signedIn: false, seated: false, receiptUrl: null });
  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;
    void Promise.all([
      import("@/wallet/walletSession"),
      import("@/wallet/sessionEvents"),
    ]).then(([ws, ev]) => {
      if (!active) return;
      const read = () => {
        void ws.fetchMemberStanding().then((r) => {
          if (!active) return;
          setState({
            signedIn: r?.state === "S4",
            seated: r?.recognized === true,
            receiptUrl: r?.receipt?.explorerUrl ?? null,
          });
        });
      };
      read();
      window.addEventListener(ev.SESSION_CHANGED_EVENT, read);
      cleanup = () => window.removeEventListener(ev.SESSION_CHANGED_EVENT, read);
    });
    return () => {
      active = false;
      cleanup?.();
    };
  }, []);
  return state;
}

function ActionCard({ action, own, address }: { action: MemberAction; own: OwnState; address: string | undefined }) {
  const [copied, setCopied] = useState<string | null>(null);
  const locked =
    (action.lock === "session" && !own.signedIn) ||
    (action.lock === "seat" && !own.seated);

  const copy = (text: string) => {
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(action.id);
      setTimeout(() => setCopied(null), 1500);
    });
  };

  return (
    <Card className={`p-4 border-border/50 ${locked ? "bg-card/20" : "bg-card/40"}`}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className={`text-sm font-medium ${locked ? "text-muted-foreground" : "text-foreground"}`}>
          {action.label}
        </span>
        {locked ? <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" /> : null}
      </div>
      <p className="text-[11px] text-muted-foreground leading-snug mb-2.5">{action.note}</p>
      {locked ? (
        <p className="text-[11px] text-warning" data-testid={`action-locked-${action.id}`}>
          {action.lockReason}
        </p>
      ) : action.kind === "route" && action.href ? (
        <Link href={action.href}>
          <Button size="sm" variant="outline">
            {action.label} <ArrowRight className="h-3.5 w-3.5 ml-1.5" aria-hidden="true" />
          </Button>
        </Link>
      ) : action.kind === "copy-referral-link" && address ? (
        <Button
          size="sm"
          variant="outline"
          data-testid="action-copy-referral-link"
          onClick={() => {
            const id = deriveSourceId(address);
            if (id) copy(`https://thesyndicate.money/join?source=${id}`);
          }}
        >
          {copied === action.id ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
          {copied === action.id ? "Copied" : "Copy link"}
        </Button>
      ) : action.kind === "share-proof" && own.receiptUrl ? (
        <Button
          size="sm"
          variant="outline"
          data-testid="action-share-proof"
          onClick={() => copy(own.receiptUrl!)}
        >
          {copied === action.id ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Share2 className="h-3.5 w-3.5 mr-1.5" />}
          {copied === action.id ? "Copied" : "Copy proof link"}
        </Button>
      ) : action.kind === "verify-seat" ? (
        <VerifyOnChain ids={["membershipSaleV3"]} />
      ) : (
        // Unlocked but its own-row material has not resolved yet — honest wait,
        // never a dead button.
        <p className="text-[11px] text-muted-foreground">Reading your own row…</p>
      )}
    </Card>
  );
}

export function MemberQuickActions() {
  const own = useOwnState();
  const { address } = useAccount();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {MEMBER_ACTIONS.map((a) => (
        <ActionCard key={a.id} action={a} own={own} address={address} />
      ))}
    </div>
  );
}
