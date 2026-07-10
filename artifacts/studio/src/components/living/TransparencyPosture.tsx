import { Unlock, Globe, ShieldCheck, DoorOpen, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// TransparencyPosture — the four-point manifesto that IS the product's difference:
// we ask nothing · everything is here · don't trust, verify · observe → join.
// The soul of the living protocol, carried on every content hero. Tokens only.
interface Point {
  icon: LucideIcon;
  title: string;
  body: string;
}

const POINTS: readonly Point[] = [
  {
    icon: Unlock,
    title: "We ask for nothing",
    body: "No email, no signup, no KYC to read. No gated sections, no “connect wallet to continue.” Everything is already open.",
  },
  {
    icon: Globe,
    title: "Everything is here",
    body: "Contracts, wallets, balances, routing — the whole protocol, end to end, in public. Not a fundraising pitch.",
  },
  {
    icon: ShieldCheck,
    title: "Don’t trust — verify",
    body: "Every figure is read live from the chain and links to its on-chain proof. Never take our word — check it yourself.",
  },
  {
    icon: DoorOpen,
    title: "Observe → join when ready",
    body: "No pressure, no price FOMO. Watch a living protocol prove itself. Take a seat if it suits you; if not, keep watching.",
  },
];

export function TransparencyPosture({ className }: { className?: string }) {
  return (
    <ul
      className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", className)}
      aria-label="How The Syndicate is different"
    >
      {POINTS.map((p) => {
        const Icon = p.icon;
        return (
          <li
            key={p.title}
            className="rounded-lg border border-border/60 bg-card/40 p-4"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span className="inline-flex shrink-0 text-proof [&_svg]:size-4">
                <Icon aria-hidden />
              </span>
              <span className="font-sans text-sm font-semibold text-foreground">{p.title}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{p.body}</p>
          </li>
        );
      })}
    </ul>
  );
}
