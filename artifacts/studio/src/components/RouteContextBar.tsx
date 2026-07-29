import { useLocation } from "wouter";
import { RouteBreadcrumbTrail } from "@/components/layout/RouteBreadcrumbTrail";
import { StatusPill, type StatusTone } from "@/components/status-pill/StatusPill";
import { Tag } from "@/components/tag/Tag";
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
// Posture → tokenized status tone. Public reads on the proof (cyan) axis; a
// pending route is caution (amber); internal/utility are inert → neutral.
const POSTURE_TONE: Record<RoutePosture, StatusTone> = {
  Public: "proof",
  Pending: "caution",
  Internal: "neutral",
  Utility: "neutral",
};

export function RouteContextBar() {
  const [location] = useLocation();
  const crumb = getRouteBreadcrumb(location);

  return (
    <div className="relative z-10 shrink-0 border-b border-border/60 bg-card/30 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 md:px-8 py-2.5">
        {/* The trail moved to RouteBreadcrumbTrail (2026-07-28) so the console
            and the public chrome render ONE breadcrumb, not two that drift. The
            chips below stay here: they are operator vocabulary. */}
        <RouteBreadcrumbTrail trail={crumb.trail} />

        <div className="flex items-center gap-2">
          <StatusPill tone={POSTURE_TONE[crumb.posture]}>
            {crumb.posture}
          </StatusPill>
          {/* Index chip only when it adds signal beyond the posture (e.g. a
              public route that is "Indexed"). For Internal/Pending/Utility the
              index status mirrors the posture, so a second chip would just be
              a duplicate label. It is metadata, not a state → Tag, not StatusPill. */}
          {crumb.indexLabel !== crumb.posture && (
            <Tag className="hidden sm:inline-flex">{crumb.indexLabel}</Tag>
          )}
        </div>
      </div>
    </div>
  );
}
