import { Link } from "wouter";
import { MemberAppPage } from "@/components/member/MemberAppPage";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type DisplayLifecycle } from "@/config/truthStatus";
import { ctas } from "@/config/sharedCopy";

interface Dimension {
  title: string;
  body: string;
  lifecycle: DisplayLifecycle;
}

// TRUTH REFRAME (founder, 2026-07-25 — DONE-IS-DONE): recognition is LIVE.
// The /season board ranks contribution in public and member quests credit
// real acts today; only the long-term STANDING model is still to come. The
// three live dimensions read live; "coming later" is scoped strictly to the
// standing figure (its FUTURE badge is the ONLY future badge on this page).
const dimensions: Dimension[] = [
  {
    title: "The season board",
    body: "Contribution is ranked in public on the live season board — each standing read from verified on-chain acts, never self-claimed.",
    lifecycle: "READ_ONLY_PROOF",
  },
  {
    title: "Member quests",
    body: "Quests credit real acts as they happen, own-row on your member dashboard — recognition you can see today.",
    lifecycle: "READ_ONLY_PROOF",
  },
  {
    title: "Source attribution",
    body: "Who opened the door is acknowledged as a growth contribution — the referral registry is live and paying today.",
    lifecycle: "READ_ONLY_PROOF",
  },
  {
    title: "Standing over time",
    body: "A single long-term standing figure — recognition accrued structurally across seasons — is not computed yet. It stays a design concept until its model is built.",
    lifecycle: "FUTURE",
  },
];

export default function Recognition() {
  return (
    <MemberAppPage
      eyebrow="Recognition"
      title="Recognition, not a financial benefit."
      lead="Recognition is structural: it acknowledges verified participation and contribution to The Syndicate — never a financial benefit, a security, or a promise of gain. It is live today: the season board ranks contribution in public and member quests credit real acts. What is still to come is the long-term standing figure — a single record of contribution over time, not computed yet."
    >
      <div className="auto-grid gap-5 mb-14">
        {dimensions.map((d) => (
          <Card key={d.title} className="bg-card/40 border-border/50 p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-base font-medium text-foreground">{d.title}</h3>
              <LifecycleBadge lifecycle={d.lifecycle} />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{d.body}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/season">
          <Button>See the season board</Button>
        </Link>
        <Link href={ctas.exploreSource.href}>
          <Button variant="outline">{ctas.exploreSource.label}</Button>
        </Link>
        <Link href={ctas.learn.href}>
          <Button variant="outline">{ctas.learn.label}</Button>
        </Link>
      </div>
    </MemberAppPage>
  );
}
