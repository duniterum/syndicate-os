import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

// Prose — the long-form content atom for the public content suite (Whitepaper,
// Tokenomics, Docs, FAQ, Risk, …). A container that styles plain semantic
// children with the `.type-*` scale + design tokens, so a page author writes
// ordinary markup (<p>, <ul>, <a>, <strong>…) and interleaves LIVE figures
// inline — drop an <Amount/>, <StatusPill/> or <VerifyOnChain/> straight into a
// paragraph and it inherits the reading rhythm. Never hardcode a number in prose;
// read it live (that is a page concern, not this atom's).
//
// Tokens only — no raw color; light ("editorial museum") + dark ("command-room")
// both come from the token layer. Readable measure (~68ch), serif headings,
// focus-visible links. Headings are owned by <ProseSection> (below) so the
// container does not double-style an <h2>; the container styles h3/h4 for
// sub-headings inside a section.

const proseContainer = cn(
  "max-w-[68ch] text-pretty",
  // body copy
  "[&_p]:type-body [&_p]:text-foreground/90 [&_p]:my-4",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_em]:italic",
  // sub-headings within a section
  "[&_h3]:type-h3 [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-3",
  "[&_h4]:font-sans [&_h4]:font-semibold [&_h4]:text-foreground [&_h4]:mt-6 [&_h4]:mb-2",
  // links — proof/cyan axis + visible focus ring
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-primary/40",
  "hover:[&_a]:decoration-primary",
  "[&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-ring [&_a:focus-visible]:ring-offset-2 [&_a:focus-visible]:ring-offset-background [&_a:focus-visible]:rounded-sm",
  // lists
  "[&_ul]:my-4 [&_ul]:pl-5 [&_ul]:list-disc [&_ul]:marker:text-muted-foreground",
  "[&_ol]:my-4 [&_ol]:pl-5 [&_ol]:list-decimal [&_ol]:marker:text-muted-foreground",
  "[&_li]:type-body [&_li]:text-foreground/90 [&_li]:my-1.5 [&_li]:pl-1",
  "[&_li>ul]:my-1.5 [&_li>ol]:my-1.5",
  // inline code + horizontal rule
  "[&_code]:font-mono [&_code]:text-[0.9em] [&_code]:text-foreground [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded",
  "[&_hr]:my-10 [&_hr]:border-border",
  // pull-quote
  "[&_blockquote]:my-6 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
);

/** Long-form reading container. Wrap a page's content once; compose sections inside. */
export function Prose({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={cn(proseContainer, className)}>
      {children}
    </div>
  );
}

/**
 * A numbered/labelled content section with its own serif <h2> and an anchorable
 * id (deep links + a table of contents). `eyebrow` holds the section index and/or
 * a <StatusPill> (VERIFIED / PENDING / FUTURE …) — kept OUTSIDE the prose body so
 * it never inherits paragraph styling. Renders a real <section> labelled by its
 * heading for assistive tech.
 */
export function ProseSection({
  id,
  title,
  eyebrow,
  children,
  className,
}: {
  id: string;
  title: string;
  eyebrow?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const headingId = `${id}-title`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn("scroll-mt-24 mt-14 first:mt-0", className)}
    >
      {eyebrow ? (
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2">{eyebrow}</div>
      ) : null}
      <h2 id={headingId} className="type-h2 text-foreground mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Monospace section index label ("§ 01"), for the eyebrow slot of <ProseSection>. */
export function ProseIndex({ n }: { n: number }) {
  return (
    <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
      § {String(n).padStart(2, "0")}
    </span>
  );
}

type CalloutTone = "note" | "identity" | "proof" | "risk";

const CALLOUT_TONE: Record<CalloutTone, string> = {
  note: "border-border bg-muted/30",
  identity: "border-identity/40 bg-identity/5",
  proof: "border-proof/40 bg-proof/5",
  risk: "border-destructive/40 bg-destructive/5",
};

const CALLOUT_LABEL_TONE: Record<CalloutTone, string> = {
  note: "text-muted-foreground",
  identity: "text-identity",
  proof: "text-proof",
  risk: "text-destructive",
};

/**
 * A bordered aside for framing that must stand apart from the flow — the legal
 * boundary that appears wherever SYN is described (tone "risk"), a recognition
 * note (tone "identity"), a proof/verify note (tone "proof"), or a neutral note.
 * `role="note"` + an optional labelled title for assistive tech.
 */
export function ProseCallout({
  tone = "note",
  title,
  children,
  className,
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      role="note"
      aria-label={title}
      className={cn(
        "my-6 rounded-lg border border-l-4 p-4",
        CALLOUT_TONE[tone],
        className,
      )}
    >
      {title ? (
        <p
          className={cn(
            "mb-1.5 font-mono text-xs font-semibold uppercase tracking-widest",
            CALLOUT_LABEL_TONE[tone],
          )}
        >
          {title}
        </p>
      ) : null}
      <div className="type-body text-foreground/90 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  );
}
