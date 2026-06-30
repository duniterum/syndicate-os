import { Link, useLocation } from "wouter";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import {
  getRouteBreadcrumb,
  type RoutePosture,
} from "@/lib/seo-route-registry";

/**
 * RouteContextBar — Slice 2.18G wayfinding strip for the operator console.
 *
 * Pinned at the top of every Shell route (above the scroll container, so it does
 * not interfere with per-route scroll resets). It answers "where am I, and what
 * is this surface?" using ONLY the SEO route registry as truth: a shallow Home →
 * current breadcrumb plus calm posture/index chips. It renders no live values.
 *
 * The public front door (`/`, PublicLayout) intentionally has no bar — a single
 * top-level page does not need a Home → Home breadcrumb.
 */
const POSTURE_STYLES: Record<RoutePosture, string> = {
  Public:
    "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900/50",
  Pending:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50",
  Internal:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
  Utility:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800",
};

export function RouteContextBar() {
  const [location] = useLocation();
  const crumb = getRouteBreadcrumb(location);

  return (
    <div className="relative z-10 shrink-0 border-b border-border/60 bg-card/30 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 md:px-8 py-2.5">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              {crumb.isHome ? (
                <BreadcrumbPage>{crumb.home.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.home.path}>{crumb.home.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {crumb.current && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium">
                    {crumb.current.label}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={`font-mono text-[10px] font-medium px-2 py-0.5 ${POSTURE_STYLES[crumb.posture]}`}
          >
            {crumb.posture}
          </Badge>
          {/* Index chip only when it adds signal beyond the posture (e.g. a
              public route that is "Indexed"). For Internal/Pending/Utility the
              index status mirrors the posture, so a second chip would just be
              a duplicate label. */}
          {crumb.indexLabel !== crumb.posture && (
            <Badge
              variant="outline"
              className="hidden sm:inline-flex font-mono text-[10px] font-medium px-2 py-0.5 text-muted-foreground bg-muted/40 border-border/60"
            >
              {crumb.indexLabel}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
