// wallet/MemberHeaderAffordance.tsx (build-time-gated wallet module)
//
// Public header member IDENTITY MENU — Q25. Elevates the former dead-end
// signed-in LINK into a real dropdown that closes the missing session control:
// a signed-in member can now DISCONNECT from the header (reuses logoutSession,
// which announces the session change so this menu re-resolves in place), copy
// their own address, open Member Home, and verify their seat on-chain — all
// resolved from the server self-readback, never fabricated.
//
// Same discipline as before: reached ONLY via the runtime dynamic import from
// PublicLayout, auth-gated on useAuthAvailability()==="live"; ONE MODAL covers
// connect+SIWE (openConnectModal); the server is the sole source of identity
// (anything not exactly S4 collapses to signed-out). Honest states only — no
// invented seat, no "simulated" mode, no photo upload (the mark is a fixed
// glyph, not a profile). NO operator/Founder-Console entry: the operator
// console is preview-gated OUT of default production builds, so a public link
// to it would be a dead end — members see member things only.

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import {
  Wallet,
  LogOut,
  Copy,
  Check,
  LayoutDashboard,
  ChevronDown,
  Hexagon,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VerifyOnChain } from "@/components/VerifyOnChain";
import {
  fetchMemberStanding,
  logoutSession,
  shortAddress,
  type MemberStandingReadback,
} from "./walletSession";
import { SESSION_CHANGED_EVENT } from "./sessionEvents";

type Status =
  | { kind: "checking" }
  | { kind: "signedOut" }
  | { kind: "member"; seat: string; era: string | null }
  | { kind: "noSeat" }
  | { kind: "signedIn" }; // S4 but standing unreadable/unresolved — never a fake seat

function classify(r: MemberStandingReadback | null): Status {
  if (r === null || r.state !== "S4") return { kind: "signedOut" };
  if (r.chainVerified && r.recognized === true && r.memberNumber !== null) {
    return { kind: "member", seat: r.memberNumber, era: r.era };
  }
  if (r.chainVerified && r.recognized === false) return { kind: "noSeat" };
  return { kind: "signedIn" };
}

// Human label for the on-chain era enums — the raw authority strings
// (V3_EMITTED / PART_B_FREEZE_ROOT) are never shown to members. Only Genesis
// (#1–#8, the founding freeze) earns a badge; V3-era members are simply members,
// so their pill stays clean (just the seat).
function eraLabel(era: string | null): string | null {
  return era === "PART_B_FREEZE_ROOT" ? "Genesis" : null;
}

export default function MemberHeaderAffordance({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  const [status, setStatus] = useState<Status>({ kind: "checking" });
  const [copied, setCopied] = useState(false);
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();

  useEffect(() => {
    let active = true;
    const read = () => {
      void fetchMemberStanding().then((r) => {
        if (active) setStatus(classify(r));
      });
    };
    read();
    window.addEventListener(SESSION_CHANGED_EVENT, read);
    return () => {
      active = false;
      window.removeEventListener(SESSION_CHANGED_EVENT, read);
    };
  }, []);

  const mobile = variant === "mobile";
  const triggerBase = mobile
    ? "min-h-12 w-full justify-center rounded-xl border-gold/35 bg-transparent font-semibold text-foreground hover:bg-gold/10"
    : "min-h-9 rounded-xl border-gold/35 bg-transparent px-3 font-semibold text-foreground hover:border-gold/55 hover:bg-gold/10";

  if (status.kind === "checking") return null;

  // ── Signed out: one modal = connect + SIWE sign (the admin pattern). If
  // RainbowKit no longer offers the modal (already connected+authed edge),
  // fall back to the /member panel rather than a no-op. ────────────────────
  if (status.kind === "signedOut") {
    if (openConnectModal) {
      return (
        <Button
          variant="outline"
          size={mobile ? "default" : "sm"}
          onClick={() => openConnectModal()}
          title="Already a member? Connect + sign to read your standing (read-only — proves wallet control only)."
          className={triggerBase}
        >
          <Wallet className={mobile ? "mr-2 h-4 w-4 text-gold" : "mr-1.5 h-4 w-4 text-gold"} aria-hidden="true" />
          Member sign-in
        </Button>
      );
    }
    return (
      <Link href="/member" className={mobile ? "w-full" : "inline-flex"}>
        <Button variant="outline" size={mobile ? "default" : "sm"} className={triggerBase}>
          <Wallet className={mobile ? "mr-2 h-4 w-4 text-gold" : "mr-1.5 h-4 w-4 text-gold"} aria-hidden="true" />
          Member
        </Button>
      </Link>
    );
  }

  // ── Signed in: a real identity menu. Trigger reflects the state at a glance;
  // the content resolves entirely from the server self-readback. ────────────
  const seated = status.kind === "member";
  const triggerLabel =
    status.kind === "member"
      ? `Seat #${status.seat}`
      : status.kind === "noSeat"
        ? "Signed in · no seat yet"
        : "Signed in";

  async function handleCopy() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard denied (permissions / insecure context) — stay honest: no
      // fake "copied" confirmation.
    }
  }

  async function handleDisconnect() {
    await logoutSession(); // announces SESSION_CHANGED_EVENT → menu re-resolves
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size={mobile ? "default" : "sm"}
          className={`${triggerBase} gap-2`}
        >
          {seated ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-gold/15 text-gold" aria-hidden="true">
              <Hexagon className="h-3 w-3" />
            </span>
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-proof" aria-hidden="true" />
          )}
          <span className={seated ? "font-mono text-xs" : "text-xs font-normal"}>
            {triggerLabel}
          </span>
          {seated && eraLabel(status.era) ? (
            <>
              <span className="h-3 w-px bg-border" aria-hidden="true" />
              <span className="hidden text-xs font-normal text-gold sm:inline">
                {eraLabel(status.era)}
              </span>
            </>
          ) : null}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex items-center gap-3">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg border ${
                seated ? "border-gold/30 bg-gold/12 text-gold" : "border-border bg-muted text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              <Hexagon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                {seated ? `Member #${status.seat}` : "Signed in"}
              </div>
              {address ? (
                <div className="font-mono text-xs text-muted-foreground">
                  {shortAddress(address)}
                </div>
              ) : null}
            </div>
          </div>

          {seated ? (
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {eraLabel(status.era) ? `${eraLabel(status.era)} member` : "Member"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-proof/40 bg-proof/10 px-2 py-0.5 text-[11px] font-medium text-proof">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                Verified on chain
              </span>
            </div>
          ) : null}

          {seated ? (
            <div className="mt-2">
              <VerifyOnChain ids={["membershipSaleV3"]} />
            </div>
          ) : null}

          <p className="mt-3 rounded-md border border-border bg-muted/40 px-2.5 py-2 text-[11px] leading-relaxed text-muted-foreground">
            {status.kind === "member" ? (
              <>
                Your <span className="text-gold">seat</span> is your membership. Signing in with
                your wallet is a <span className="text-foreground">separate session</span> that
                only proves you control this address.
              </>
            ) : status.kind === "noSeat" ? (
              <>
                You’re signed in — this proves you control this wallet. It holds{" "}
                <span className="text-foreground">no seat yet</span>.
              </>
            ) : (
              <>
                Signed in. Your standing couldn’t be read right now —{" "}
                <span className="text-foreground">nothing is assumed</span>.
              </>
            )}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/member" className="cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
            Open Member Home
          </Link>
        </DropdownMenuItem>

        {address ? (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={(e) => {
              e.preventDefault(); // keep the menu open to show the "Copied" tick
              void handleCopy();
            }}
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-proof" aria-hidden="true" />
            ) : (
              <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy address"}
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={() => void handleDisconnect()}
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Disconnect · end wallet session
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
