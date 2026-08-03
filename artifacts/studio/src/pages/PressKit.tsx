// pages/PressKit.tsx — E · THE PUBLIC PRESS & BRAND KIT (/press).
//
// The engraved sequence's item E (founder «go décide pour moi», 2026-08-03).
// The origin's press.tsx was the QUARRY (8 sections); the MIRROR RULE the
// sieve: only what is TRUE and SERVED today ships — the real mark files, the
// site's own socialLinks authority, the imported legal verbatim, facts that
// each carry their internal verify door. WORK-FIRST: the page opens on the
// writer's work — the descriptions with copy buttons. No press email exists
// in canon, so none is invented: inquiries go through the official channels.
// guard-press-kit freezes the content authority and these import laws.

import { useRef, useState } from "react";
import { Link } from "wouter";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { PublicPage } from "@/components/PublicPage";
import { brandAssets, socialLinks } from "@/config/brand";
import { safetyCopy } from "@/config/sharedCopy";
import {
  pressDescriptions,
  pressApprovedLanguage,
  pressBannedLanguage,
  pressProtocolFacts,
  pressMediaUsage,
  pressAssets,
} from "@/config/pressKit";

function CopyBlock({ label, text, testid }: { label: string; text: string; testid: string }) {
  const [copied, setCopied] = useState(false);
  // Deduplicated timer (a rapid re-copy let the FIRST timer clip the second
  // «Copied» at 0.1s — review-2 logic hat) + the sr-only announcement the
  // best house instance pairs with the label swap (ReferralLinkPanel).
  const timer = useRef<number | null>(null);
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="type-eyebrow text-muted-foreground">{label}</p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              ?.writeText(text)
              .then(() => {
                setCopied(true);
                if (timer.current !== null) window.clearTimeout(timer.current);
                timer.current = window.setTimeout(() => setCopied(false), 1400);
              })
              .catch(() => {});
          }}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-testid={testid}
        >
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
          <span className="sr-only" role="status">
            {copied ? `${label} description copied` : ""}
          </span>
        </button>
      </div>
      <p className="text-sm leading-relaxed text-foreground measure">{text}</p>
    </div>
  );
}

function SectionTitle({ title, why }: { title: string; why: string }) {
  return (
    <div className="mt-10 mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <h2 className="text-base font-medium text-foreground">{title}</h2>
      <span className="text-sm text-muted-foreground">{why}</span>
    </div>
  );
}

export default function PressKit() {
  return (
    <PublicPage
      eyebrow="Press"
      title="Press & brand kit"
      lead="Everything needed to write about, cite or promote The Syndicate — the official words, the real mark, the only official channels, and the facts with their verify paths. Nothing here goes beyond what the chain itself publishes."
      badge={<LifecycleBadge lifecycle="READ_ONLY_PROOF" />}
      variant="app"
    >
      {/* §1 — THE DESCRIPTIONS: the writer's work, first. */}
      <div className="space-y-4" data-testid="press-descriptions">
        <CopyBlock label="One line" text={pressDescriptions.oneLine} testid="button-press-copy-oneline" />
        <CopyBlock label="Short" text={pressDescriptions.short} testid="button-press-copy-short" />
        <CopyBlock label="Long" text={pressDescriptions.long} testid="button-press-copy-long" />
      </div>

      {/* §2 — THE MARK: only files we actually serve. */}
      <SectionTitle title="The mark" why="use it as provided — the files below are the served originals" />
      <Card className="border-border/50 bg-card/40 p-5" data-testid="press-brand">
        {/* The LOCKUP leads (founder, 2026-08-03: the mark alone «n'est pas
            suffisant» for a press kit) — generated vector, glyphs as paths. */}
        <img
          src="/brand/syn-lockup-gold.svg"
          alt="The Syndicate lockup — interlock mark with wordmark"
          className="mb-5 h-16 w-auto max-w-full"
          data-testid="press-lockup"
        />
        <div className="flex flex-wrap items-center gap-6">
          <img
            src={brandAssets["syn-mark-gold"]}
            alt="The Syndicate interlock mark, gold"
            className="h-16 w-auto"
          />
          <div className="min-w-[220px] flex-1">
            <ul className="space-y-1.5">
              {pressAssets.map((a) => (
                <li key={a.href}>
                  <a
                    href={a.href}
                    download
                    className="inline-flex min-h-11 items-center rounded-sm font-mono text-xs text-proof transition-colors hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    data-testid={`link-press-asset-${a.href.replace(/[^a-z0-9]+/gi, "-")}`}
                  >
                    {a.label} · {a.note}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 border-t border-border/40 pt-4 text-sm leading-relaxed text-muted-foreground measure">
          Colour meaning is fixed: gold marks identity and membership; cyan
          marks live verification. Type is Instrument Serif for display, Work
          Sans for text, monospace for on-chain data.
        </p>
      </Card>

      {/* §3 — OFFICIAL CHANNELS: the ONE authority, imported. */}
      <SectionTitle title="Official channels" why="the only official ones — treat any other account as unofficial" />
      <Card className="border-border/50 bg-card/40 p-5" data-testid="press-channels">
        <ul className="space-y-1.5">
          {socialLinks.map((s) => (
            <li key={s.id}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-sm text-sm text-proof transition-colors hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid={`link-press-channel-${s.id}`}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground measure">
          Press inquiries reach the protocol through these channels.
        </p>
      </Card>

      {/* §4 — PROTOCOL FACTS: every fact carries its door. */}
      <SectionTitle title="Protocol facts" why="each one links the surface that proves it live" />
      <Card className="border-border/50 bg-card/40 p-5" data-testid="press-facts">
        {/* The verify door sits as a BLOCK sibling under its fact — the /join
            twin's shape: a 44px inline box inside the sentence inflated line
            boxes unevenly across the seven facts (review-2 design hat). */}
        <ul className="space-y-2.5">
          {pressProtocolFacts.map((f) => (
            <li key={f.href + f.door}>
              <p className="text-sm leading-relaxed text-foreground measure">{f.text}</p>
              <Link
                href={f.href}
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-sm font-mono text-xs text-proof transition-colors hover:text-proof-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-testid={`link-press-fact-${f.door.toLowerCase()}`}
              >
                Verify — {f.door}
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      {/* §5 — LANGUAGE: what to say, what never to say. */}
      <SectionTitle title="Approved & banned language" why="one word, one verdict — for us and for anyone promoting the protocol" />
      <div className="grid gap-4 sm:grid-cols-2" data-testid="press-language">
        <Card className="border-border/50 bg-card/40 p-5">
          <p className="type-eyebrow mb-3 text-muted-foreground">Approved</p>
          <ul className="space-y-1">
            {pressApprovedLanguage.map((w) => (
              <li key={w} className="text-sm text-foreground">
                {w}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="border-destructive/30 bg-destructive/5 p-5">
          <p className="type-eyebrow mb-3 text-destructive">The red lines</p>
          <ul className="space-y-1">
            {pressBannedLanguage.map((w) => (
              <li key={w} className="text-sm text-foreground">
                {w}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* §6 — MEDIA USAGE + the imported legal verbatim. */}
      <SectionTitle title="Media usage" why="the rules that keep every mention honest" />
      <Card className="mb-12 border-border/50 bg-card/40 p-5" data-testid="press-usage">
        <ul className="space-y-2">
          {pressMediaUsage.map((rule) => (
            <li key={rule} className="text-sm leading-relaxed text-muted-foreground measure">
              {rule}
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-border/40 pt-4 text-sm leading-relaxed text-foreground measure" data-testid="press-not-investment">
          {safetyCopy.notInvestment}
        </p>
      </Card>
    </PublicPage>
  );
}
