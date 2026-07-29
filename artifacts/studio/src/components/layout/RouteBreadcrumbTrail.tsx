// RouteBreadcrumbTrail — the trail itself, rendered once, used twice.
//
// FOUNDER, 2026-07-28: Option A ("show it on the public pages") + "M1" (the full
// trail on mobile too, not a back-to-parent chevron) + "oui Q2 pour tout" (the
// third level wherever a route nests).
//
// WHY IT EXISTS AS ITS OWN COMPONENT: the operator console's `RouteContextBar`
// already rendered a trail, and the public chrome now needs the same one. Two
// renderings of one trail is exactly how the admin and the public would drift
// apart, so the crumbs live here and each caller supplies only its own frame.
// What the console adds — the posture and index chips — stays in the console:
// "Public"/"Indexed" is operator vocabulary and WORK-FIRST §3 says information
// that serves nobody on a surface is not shown there.
//
// M1, and what it costs, stated: at 375px "Home › Contracts & Holdings" can wrap
// to a second line. `flex-wrap` is deliberate — the alternative was truncation,
// and a breadcrumb whose whole job is to say where you are should not hide the
// name of where you are.

import { Fragment } from "react";
import { Link } from "wouter";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { RouteCrumb } from "@/lib/seo-route-registry";

export function RouteBreadcrumbTrail({ trail }: { trail: RouteCrumb[] }) {
  return (
    <Breadcrumb>
      {/* type-label (13px) — the site's own label token, above the 12px floor. */}
      <BreadcrumbList className="type-label flex-wrap gap-x-1.5 gap-y-0.5">
        {trail.map((crumb, i) => {
          const isLast = i === trail.length - 1;
          return (
            // The separator is a SIBLING of the item, never a child. Both render
            // <li> (ui/breadcrumb.tsx:34 and :80), so nesting it produced <li>
            // inside <li> on every public page and every console screen — invalid
            // list markup, and a regression against what PROD renders. Found by
            // the 2026-07-28 review; the first probe of this component had already
            // reported "2 rows, separators 1px lower" and I read that as a
            // measurement artefact instead of the symptom it was.
            <Fragment key={`${crumb.path}-${i}`}>
              <BreadcrumbItem>
                {isLast ? (
                  // The page you are ON is never a link (aria-current="page" comes
                  // from BreadcrumbPage) — the one rule every breadcrumb spec agrees on.
                  <BreadcrumbPage className="font-medium text-foreground">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    {/* The house focus ring — caught by guard-focus-visible on the
                        first run of this file, which is the point of having it:
                        a crumb a keyboard user cannot see themselves land on is
                        a navigation control that only works with a mouse
                        (WCAG 2.4.7, AA).
                        AND THE TOUCH BOX, at the level that actually applies
                        (corrected 2026-07-29). This link first shipped with NO
                        height — a ~17px standalone control on every public page,
                        which `rounded-*` pushed out of the guard's inline-link
                        exception and into its blind spot. The first fix reached
                        for the house 44px class, and that was an OVER-application:
                        it grew this strip from ~38px to ~65px on every phone and
                        every console screen, i.e. a composition change to a
                        surface the founder approved as M1 — and the wireframe he
                        chose drew this bar WITHOUT a 44px target (that was M2, the
                        option he did not pick).
                        THE LEVELS, stated: WCAG 2.5.5 (44×44) is level AAA and is
                        what the house floor encodes for PRIMARY controls. WCAG
                        2.5.8, the AA requirement, is 24×24 — and that is the right
                        bar for a secondary wayfinding link. `py-1.5` gives a 29px
                        tap box (17px line + 12px), clearing AA with room, while
                        the strip's own padding drops to `py-1` so the bar stays
                        the height he approved. Bigger is not better when it
                        silently redesigns a page. */}
                    <Link
                      href={crumb.path}
                      className="inline-flex items-center rounded-sm px-1 py-1.5 text-muted-foreground hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
