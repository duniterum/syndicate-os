# Phase 2 — Admin shell spec (slice 1: the shell)

Goal: replace the flat `/admin` wall with an AAA control tower — a sidebar of
sections, a home dashboard, `/admin/*` routing, role-scoping, tooltips, and a
real status chip. Build with the EXISTING primitives (`ui/sidebar`,
`ui/command`, `ui/tooltip`, `card`, `badge`, `avatar`, `dropdown-menu`). No new
UI library. No big-bang: existing panels stay reachable — rehome them into
sections (a later slice splits them further).

## Sections (sidebar) → existing content mapping

| Section (route) | Icon | Content (reuse existing) |
|---|---|---|
| Dashboard (`/admin`) | layout-dashboard | `AdminHome` (new, provided) |
| Members (`/admin/members`) | users | existing Members & Continuity panel |
| Sources & referrals (`/admin/sources`) | link | `AdminReferralPanel` + Sources & Introductions + source review queue |
| Operators (`/admin/operators`) | shield | existing operators/roles/registry panel |
| Content (`/admin/content`) | file-text | Content & Homepage + Packages & Advertising + Address Labels + Recognition |
| Modules (`/admin/modules`) | puzzle | existing Module registry panel |
| Broadcast (`/admin/broadcast`) | megaphone | existing Broadcast panel |
| Audit log (`/admin/audit`) | history | existing Audit log panel |
| Support (`/admin/support`) | life-buoy | existing Support queue panel |
| Settings (`/admin/settings`) | settings | Feature flags + System health |

For slice 1 it's acceptable for a section to render the current
`AdminControlTower` sub-panel as-is (moved, not rewritten). Nothing may be lost
or hidden. `AdminHome` gets the live `ProtocolRealityPanel` in its `realitySlot`.

## Shell layout

- Left `Sidebar` (from `ui/sidebar`): the 10 sections; active state on the
  current route; the sections are **role-scoped** — founder_root sees all; for
  now non-founder roles may see the full list (finer scoping is a later slice).
- Top header: a `⌘K` command trigger (from `ui/command`) as a search/jump box;
  a notifications bell (static placeholder, no fake counts); a help icon; an
  account menu (`dropdown-menu` + `avatar`) showing the operator role with a
  sign-out item. Reuse the existing `OperatorBadge` for the role.
- Content area renders the active section.

## Real status chip (kill the fake "Offline")

`components/layout/Shell.tsx` hardcodes a red pulsing `Offline` chip wired to
nothing. Replace it with an honest status derived from real signal: green
"Live" when `GET /api/protocol/reality` last read succeeded, amber/neutral
"Checking…" while loading, red "Unreachable" only on a real fetch error. No
hardcoded state. If deriving live status is non-trivial in this slice, REMOVE
the chip entirely rather than leave a fake one — never ship a decorative status.

## Truth-first (non-negotiable)

- No fabricated numbers anywhere. Business KPIs stay as `AdminHome`'s honest
  "live reads coming" preview cards until wired. Real reads (reality, module
  registry, source status) may be shown because they're real.
- Keep existing honesty copy and "preview" labels on panels that are still
  preview.

## Tooltips (self-documenting admin)

Every KPI and every section/panel gets a `ui/tooltip`: what it is, what the
value means, where the number comes from. `AdminHome` already does this for its
KPIs; extend the pattern to section headers as you rehome.

## Routing

Mount an `AdminShell` layout at `/admin` with nested `/admin/*` routes (wouter).
Keep the operator-preview gate exactly as-is (visibility gate). The shell is
inside the gate. Deep links to each section work.

## Guards

Re-fit `guard-route-nav-drift` and `guard-surface-coverage` to the new
`/admin/*` routes + sidebar nav (nav references must match mounted routes).
Keep `guard-access-state` intact. Make guards stricter where the new structure
allows; never weaken. Paste the guard diff.
