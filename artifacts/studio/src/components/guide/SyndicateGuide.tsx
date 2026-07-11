import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { X, Minus, Search, ArrowUpRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { FAQ_ENTRIES_FLAT } from "@/content/faq-content";
import {
  GUIDE_QUICK_ROUTES,
  GUIDE_SUGGESTED,
  guideGreeting,
  GUIDE_GREETING_DELAY_MS,
  GUIDE_PROMPTED_KEY,
} from "@/content/guide-content";

// SyndicateGuide — the global floating help assistant (Support slice).
//
// DETERMINISTIC ONLY (this slice): a router + FAQ-corpus finder. It "consults,
// never invents" — it surfaces the vetted, number-free FAQ answers and routes to
// the proof surfaces; it states NO figure itself. NO LLM, NO wallet/member-level
// awareness, NO backend (those are later slices in THE ONE ORDERED SEQUENCE).
// Named "Guide," never "AI" — it is NOT the PENDING AI Layer.
//
// Prerender-safe: all window/localStorage access is inside effects and typeof-
// guarded, so SSG/prerender never touches it. No fake-live: the header carries no
// decorative always-on "online" dot and the launcher has no fake unread badge.

// --- Mascot: line-art on currentColor + tokens (gold frame = identity, cyan face
// = live/verification). No raw hex → passes the no-raw-color guard. Blink/pulse
// animation self-disables under prefers-reduced-motion. -------------------------
function GuideMascot({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
      className={cn("text-gold", className)}
    >
      <style>{`
        @keyframes guideBlink { 0%,92%,100%{transform:scaleY(1);} 96%{transform:scaleY(0.15);} }
        @keyframes guidePulse { 0%,100%{opacity:0.55;} 50%{opacity:1;} }
        .guide-eyes { transform-origin: center 30px; animation: guideBlink 5s ease-in-out infinite; }
        .guide-antenna-dot { animation: guidePulse 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .guide-eyes, .guide-antenna-dot { animation: none; }
        }
      `}</style>
      {/* antenna (identity/gold) */}
      <line x1="32" y1="8" x2="32" y2="15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* head frame (identity/gold) */}
      <rect x="13" y="15" width="38" height="34" rx="11" stroke="currentColor" strokeWidth="2.5" />
      <line x1="9" y1="28" x2="9" y2="36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="55" y1="28" x2="55" y2="36" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* face (live/verification cyan) */}
      <g className="text-proof">
        <circle className="guide-antenna-dot" cx="32" cy="5" r="3" fill="currentColor" />
        <g className="guide-eyes">
          <circle cx="24" cy="30" r="3.2" fill="currentColor" />
          <circle cx="40" cy="30" r="3.2" fill="currentColor" />
        </g>
        <path d="M23 38 Q32 45 41 38" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}

interface SurfacedAnswer {
  q: string;
  a: string;
}

export function SyndicateGuide() {
  const [location] = useLocation();
  const reduceMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(null);

  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const locationRef = useRef(location);
  locationRef.current = location;

  // One-time, page-aware greeting bubble. Browser-only (typeof-guarded), fired
  // from an effect — never evaluated during prerender/SSG.
  useEffect(() => {
    if (typeof window === "undefined") return;
    let prompted = false;
    try {
      prompted = window.localStorage.getItem(GUIDE_PROMPTED_KEY) === "true";
    } catch {
      prompted = false;
    }
    if (prompted) return;
    const timer = window.setTimeout(() => {
      if (isOpen) return;
      setGreeting(guideGreeting(locationRef.current));
      setShowGreeting(true);
      try {
        window.localStorage.setItem(GUIDE_PROMPTED_KEY, "true");
      } catch {
        /* private mode — greeting simply shows this session only */
      }
    }, GUIDE_GREETING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  // Focus the search when the panel opens.
  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const open = () => {
    setShowGreeting(false);
    setIsMinimized(false);
    setIsOpen(true);
  };
  const close = () => {
    setIsOpen(false);
    launcherRef.current?.focus();
  };

  // Deterministic search over the shared, vetted FAQ corpus (number-free answers).
  const results: SurfacedAnswer[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return FAQ_ENTRIES_FLAT.filter(
      (e) => e.q.toLowerCase().includes(q) || e.a.toLowerCase().includes(q),
    ).slice(0, 6);
  }, [query]);

  // Esc closes; Tab is trapped within the open panel (lightweight focus trap).
  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = panelRef.current.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex="-1"])',
    );
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  // --- Launcher (closed) -------------------------------------------------------
  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-[60] print:hidden sm:bottom-6 sm:right-6">
        <div className="relative flex flex-col items-end">
          {showGreeting && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              className="mb-3 max-w-[260px] rounded-2xl border border-border/70 bg-popover/95 p-3.5 shadow-xl backdrop-blur-md"
              data-testid="guide-greeting"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGreeting(false);
                }}
                aria-label="Dismiss"
                className="absolute right-2 top-2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={open}
                className="block pr-4 text-left focus-visible:outline-none"
              >
                <p className="text-sm font-medium text-foreground">{greeting}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-primary">
                  Open the Guide →
                </p>
              </button>
            </motion.div>
          )}

          <motion.button
            ref={launcherRef}
            type="button"
            onClick={open}
            aria-label="Open the Guide — help & wayfinding"
            data-testid="guide-open"
            className="group grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-card/90 shadow-lg backdrop-blur transition-colors hover:border-gold/60 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
            transition={reduceMotion ? undefined : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <GuideMascot size={44} />
          </motion.button>
        </div>
      </div>
    );
  }

  // --- Panel (open) ------------------------------------------------------------
  return (
    <div
      className="fixed bottom-4 right-4 z-[60] print:hidden sm:bottom-6 sm:right-6"
      role="dialog"
      aria-label="The Guide — help and wayfinding"
      ref={panelRef}
      onKeyDown={onPanelKeyDown}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        className={cn(
          "flex w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border/70 bg-popover/97 shadow-2xl backdrop-blur-md sm:w-[380px]",
          isMinimized ? "h-14" : "h-[68dvh] max-h-[560px]",
        )}
      >
        {/* Header — agent identity (avatar · role · honest capability). No fake live dot. */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3.5 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/5">
              <GuideMascot size={26} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-foreground">Guide</p>
              <p className="text-[11px] text-muted-foreground">Points you to the proof</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={() => setIsMinimized((m) => !m)}
              aria-label={isMinimized ? "Expand the Guide" : "Minimize the Guide"}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Close the Guide"
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Search over the FAQ corpus */}
            <div className="border-b border-border/60 p-3">
              <label className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-2.5 py-2 focus-within:ring-2 focus-within:ring-ring">
                <Search aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setOpenKey(null);
                  }}
                  placeholder="Ask about seats, routing, risk…"
                  aria-label="Search the FAQ"
                  className="w-full flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
              </label>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {query.trim() ? (
                results.length > 0 ? (
                  <ul className="space-y-2">
                    {results.map((e, i) => {
                      const key = `r-${i}`;
                      const isRowOpen = openKey === key;
                      return (
                        <li key={key} className="rounded-lg border border-border/60 bg-card/40">
                          <button
                            type="button"
                            onClick={() => setOpenKey(isRowOpen ? null : key)}
                            aria-expanded={isRowOpen}
                            className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                          >
                            <span className="text-sm font-medium text-foreground">{e.q}</span>
                            <ChevronRight
                              aria-hidden
                              className={cn(
                                "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                                isRowOpen && "rotate-90 text-primary",
                              )}
                            />
                          </button>
                          {isRowOpen && (
                            <div className="border-t border-border/40 px-3 pb-3 pt-2">
                              <p className="text-sm text-foreground/90">{e.a}</p>
                              <Link
                                href="/faq"
                                onClick={close}
                                className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
                              >
                                Open in FAQ <ArrowUpRight className="h-3 w-3" />
                              </Link>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                    No match. Browse the full{" "}
                    <Link href="/faq" onClick={close} className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">
                      FAQ
                    </Link>
                    , or reach a human through{" "}
                    <Link href="/support" onClick={close} className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">
                      Support
                    </Link>
                    .
                  </div>
                )
              ) : (
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Popular questions
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {GUIDE_SUGGESTED.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => {
                            setQuery(q);
                            setOpenKey("r-0");
                          }}
                          className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-left text-sm text-foreground transition-colors hover:border-primary/30 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span>{q}</span>
                          <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Jump to the proof page
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {GUIDE_QUICK_ROUTES.map((route) => (
                        <Link
                          key={route.href}
                          href={route.href}
                          onClick={close}
                          className="group flex items-start gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 transition-colors hover:border-gold/30 hover:bg-card/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <div className="min-w-0">
                            <span className="flex items-center gap-1 text-sm font-medium text-foreground">
                              {route.label}
                              <ArrowUpRight aria-hidden className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold" />
                            </span>
                            <span className="block text-xs text-muted-foreground">{route.blurb}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Honest footer — not the AI Layer; consults, never invents. */}
            <div className="border-t border-border/60 px-3.5 py-2.5">
              <p className="text-[11px] leading-snug text-muted-foreground">
                A deterministic guide — not the protocol's AI. I point to on-chain proof and never invent a
                figure. Verify everything on{" "}
                <Link href="/status" onClick={close} className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary">
                  Status
                </Link>
                .
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
