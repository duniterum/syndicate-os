import { useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusPill } from "@/components/status-pill/StatusPill";
import type { FaqCategory } from "@/content/faq-content";

// FaqAccordion — the one new interactive primitive for /faq (slice 2.3).
// STRUCTURE harvested from the Supa FAQ chrome (search + category filter + count
// badge + accordion + empty state), rebuilt clean on OUR design tokens and atoms
// (no raw color; gold = identity/active, cyan = live). It renders CONTENT only —
// the number-free doctrine-perfect corpus in content/faq-content.ts — and holds
// no chain figures itself.
//
// The active-category filter is LIFTED to the page (so the sticky SectionIndex
// TOC can drive it too); the free-text search stays local. "all" shows every
// category; a category id isolates that section.

export const FAQ_ALL = "all";

interface FaqAccordionProps {
  categories: FaqCategory[];
  /** "all" or a category id — owned by the page, shared with the SectionIndex. */
  activeCat: string;
  onActiveCatChange: (id: string) => void;
}

export function FaqAccordion({ categories, activeCat, onActiveCatChange }: FaqAccordionProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const total = useMemo(
    () => categories.reduce((n, c) => n + c.entries.length, 0),
    [categories],
  );

  // Search matches question OR answer OR category name; the category filter
  // narrows to one section. A category with zero matches drops out entirely.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .filter((c) => activeCat === FAQ_ALL || c.id === activeCat)
      .map((c) => ({
        ...c,
        entries: c.entries.filter((e) => {
          if (!q) return true;
          return (
            e.q.toLowerCase().includes(q) ||
            e.a.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q)
          );
        }),
      }))
      .filter((c) => c.entries.length > 0);
  }, [categories, activeCat, query]);

  const shownCount = useMemo(
    () => visible.reduce((n, c) => n + c.entries.length, 0),
    [visible],
  );

  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const chips: { id: string; label: string; count: number }[] = [
    { id: FAQ_ALL, label: "All", count: total },
    ...categories.map((c) => ({ id: c.id, label: c.name, count: c.entries.length })),
  ];

  return (
    <div className="min-w-0">
      {/* Search */}
      <label className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2.5 focus-within:ring-2 focus-within:ring-ring">
        <Search aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — token, seat, routing, liquidity, ranks, risk…"
          aria-label="Search the FAQ"
          className="w-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        )}
      </label>

      {/* Category chips */}
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter by category">
        {chips.map((chip) => {
          const selected = activeCat === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onActiveCatChange(chip.id)}
              aria-pressed={selected}
              className={cn(
                "rounded-md border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selected
                  ? "border-identity/40 bg-identity/10 text-identity"
                  : "border-border/60 text-muted-foreground hover:border-identity/30 hover:text-foreground",
              )}
            >
              {chip.label} <span className="opacity-60">· {chip.count}</span>
            </button>
          );
        })}
      </div>

      {/* Count badge */}
      <div className="mt-4 flex items-center gap-2">
        <StatusPill tone="neutral" size="xs">
          {shownCount} {shownCount === 1 ? "question" : "questions"}
          {query.trim() ? " matching" : ` · ${categories.length} categories`}
        </StatusPill>
      </div>

      {/* Results */}
      {visible.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
          No questions match “{query}”. Try a shorter term, or clear the filter.
        </div>
      ) : (
        <div className="mt-5 space-y-10">
          {visible.map((cat) => (
            <section key={cat.id} id={cat.id} aria-labelledby={`${cat.id}-heading`} className="scroll-mt-24">
              <h2
                id={`${cat.id}-heading`}
                className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                {cat.name}
              </h2>
              <div className="space-y-2">
                {cat.entries.map((e, i) => {
                  const key = `${cat.id}-${i}`;
                  const isOpen = open.has(key);
                  const panelId = `${key}-panel`;
                  return (
                    <article key={key} className="overflow-hidden rounded-lg border border-border/60 bg-card/40">
                      <h3>
                        <button
                          type="button"
                          onClick={() => toggle(key)}
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          className="flex w-full items-start justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          <span className="text-sm font-medium text-foreground">{e.q}</span>
                          <Plus
                            aria-hidden
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                              isOpen && "rotate-45 text-primary",
                            )}
                          />
                        </button>
                      </h3>
                      {isOpen && (
                        <div
                          id={panelId}
                          role="region"
                          aria-labelledby={`${key}-panel`}
                          className="border-t border-border/40 px-4 pb-4 pt-3 type-body text-foreground/90"
                        >
                          {e.a}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
