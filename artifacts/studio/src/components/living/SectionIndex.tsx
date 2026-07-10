import { cn } from "@/lib/utils";

// SectionIndex — a sticky, anchor-linked table of contents so a multi-section
// living document is navigable in one glance. Pure presentation; the page owns
// the two-column layout that makes it stick. Reused by every content page.
export interface IndexEntry {
  id: string;
  label: string;
}

export function SectionIndex({
  entries,
  className,
  heading = "Contents",
}: {
  entries: readonly IndexEntry[];
  className?: string;
  heading?: string;
}) {
  return (
    <nav
      aria-label="Section index"
      className={cn("lg:sticky lg:top-6", className)}
    >
      <div className="rounded-lg border border-border/60 bg-card/40 p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {heading}
        </p>
        <ol className="space-y-0.5">
          {entries.map((e, i) => (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                className="group flex items-baseline gap-2 rounded-sm px-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="font-mono text-[10px] text-muted-foreground/70 group-hover:text-primary">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{e.label}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
