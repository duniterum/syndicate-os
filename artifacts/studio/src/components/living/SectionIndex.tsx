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
  activeId,
  onSelect,
}: {
  entries: readonly IndexEntry[];
  className?: string;
  heading?: string;
  /** Highlight the entry whose id matches (e.g. the active category filter). */
  activeId?: string;
  /**
   * When provided, the TOC drives selection instead of a raw anchor jump: the
   * default anchor navigation is suppressed and `onSelect(id)` is called, so a
   * page can filter/isolate content reliably (no async hash-vs-render race).
   * When omitted the entries behave exactly as before — plain `#id` anchors.
   */
  onSelect?: (id: string) => void;
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
          {entries.map((e, i) => {
            const isActive = activeId === e.id;
            return (
              <li key={e.id}>
                <a
                  href={`#${e.id}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={
                    onSelect
                      ? (ev) => {
                          ev.preventDefault();
                          onSelect(e.id);
                        }
                      : undefined
                  }
                  className={cn(
                    "group flex items-baseline gap-2 rounded-sm px-1 py-1 text-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-[10px] group-hover:text-primary",
                      isActive ? "text-primary" : "text-muted-foreground/70",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{e.label}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
