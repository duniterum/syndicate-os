// pages/admin/panels.tsx
//
// Phase 2 slice 1 — the read-only Admin Control Tower panels, REHOMED from the
// former flat pages/AdminControlTower.tsx into per-section components (moved,
// not rewritten; nothing lost or hidden). Every panel remains a READ surface
// over existing truth sources: the module registry overlay
// (config/moduleRegistry.ts), GET /api/source-status and
// GET /api/protocol/reality. There are NO write controls anywhere in this
// file — buttons that would write do not exist, not even disabled ones.
// Posture is derived at render time and fails closed: a missing category,
// failed fetch, or unknown key renders "unavailable (fail-closed)", never an
// invented value. These routes are excluded from default production builds by
// the operator preview gate (visibility gate, not authentication).

import React from "react";
import { Link } from "wouter";
import {
  useGetSourceStatus,
  useGetProtocolReality,
  type SourceStatusItem,
  type SourceStatusResponse,
} from "@workspace/api-client-react";
import { TruthLabel } from "@/components/TruthLabel";
import { PostureBadge } from "@/components/PostureBadge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { moduleRegistry } from "@/config/moduleRegistry";
import { OPERATOR_PREVIEW_ENABLED } from "@/config/operatorPreviewGate";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";
import {
  lookupCategory,
  realityGroupSummary,
  PostureUnavailable,
  RegistryPostureChip,
} from "@/components/registry/registryPosture";
import {
  LayoutDashboard,
  Boxes,
  Users,
  Link2,
  Megaphone,
  Tags,
  PanelsTopLeft,
  ScrollText,
  ToggleLeft,
  HeartPulse,
  ShieldAlert,
  Info,
} from "lucide-react";

type SourceStatusData = SourceStatusResponse | undefined;

const Unavailable = PostureUnavailable;
const EntryPostureCell = RegistryPostureChip;

interface PanelDef {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Self-documenting admin: what this panel is and where its data comes from. */
  tooltip: string;
}

function CategoryPostureRow({
  label,
  category,
  data,
  isLoading,
  isError,
}: {
  label: string;
  category: string;
  data: SourceStatusData;
  isLoading: boolean;
  isError: boolean;
}) {
  const item = lookupCategory(data, category);
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <div className="text-sm text-foreground">{label}</div>
        <div className="font-mono text-[10px] text-muted-foreground truncate">
          source-status:{category}
        </div>
      </div>
      <div className="shrink-0">
        {isLoading ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : isError || !item ? (
          <Unavailable />
        ) : (
          <PostureBadge posture={item.posture} />
        )}
      </div>
    </div>
  );
}

function PanelCard({
  def,
  chip,
  children,
}: {
  def: PanelDef;
  chip?: React.ReactNode;
  children: React.ReactNode;
}) {
  const Icon = def.icon;
  return (
    <Card id={def.id} className="p-6 scroll-mt-24">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Icon className="h-4.5 w-4.5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">{def.title}</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`What is “${def.title}”?`}
                className="text-muted-foreground/70 hover:text-muted-foreground"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs leading-relaxed">
              {def.tooltip}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">{chip}</div>
      </div>
      {children}
    </Card>
  );
}

function FutureNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
  );
}

// ── Panel definitions (rehomed from the flat tower page) ────────────────────

const overviewDef: PanelDef = {
  id: "overview",
  title: "Overview",
  icon: LayoutDashboard,
  tooltip:
    "Counts over the module registry (config file in this bundle) and the live posture ledger (GET /api/source-status) and reality spine (GET /api/protocol/reality). Fails closed to “—” when a read fails.",
};
const modulesDef: PanelDef = {
  id: "modules",
  title: "Modules",
  icon: Boxes,
  tooltip:
    "Module Registry v0 — a governance overlay over the module canon. Posture derives at render time from each entry's declared proof source; nothing is hardcoded.",
};
const membersDef: PanelDef = {
  id: "members",
  title: "Members & Continuity",
  icon: Users,
  tooltip:
    "Continuity/membership/wallet-session postures from GET /api/source-status. Member PII is server-only; no directory or lookup of other wallets exists anywhere.",
};
const sourcesDef: PanelDef = {
  id: "sources",
  title: "Sources & Introductions",
  icon: Link2,
  tooltip:
    "Source-registry and link-generation postures from GET /api/source-status, plus the live reality spine's read-only source group.",
};
const packagesDef: PanelDef = {
  id: "packages",
  title: "Packages & Advertising",
  icon: Megaphone,
  tooltip:
    "Future module — nothing exists in the protocol or this app. The panel reserves the operator surface only.",
};
const addressLabelsDef: PanelDef = {
  id: "address-labels",
  title: "Address Labels",
  icon: Tags,
  tooltip:
    "Future operator tool — not designed and not built. Full addresses never reach a client today.",
};
const contentDef: PanelDef = {
  id: "content",
  title: "Content & Homepage",
  icon: PanelsTopLeft,
  tooltip:
    "Homepage-zone assignments read from Module Registry v0 (this bundle's config). Editing controls do not exist; nothing here writes.",
};
const activityDef: PanelDef = {
  id: "activity",
  title: "Activity & Chronicle",
  icon: ScrollText,
  tooltip:
    "Chronicle and archive postures from GET /api/source-status. No moderation or publication queue exists yet.",
};
const flagsDef: PanelDef = {
  id: "flags",
  title: "Feature Flags",
  icon: ToggleLeft,
  tooltip:
    "Read-only view of this bundle's own build constants plus the server-side exposure flag (not readable here — shown fail-closed). These gates are visibility, not authentication.",
};
const healthDef: PanelDef = {
  id: "health",
  title: "System Health",
  icon: HeartPulse,
  tooltip:
    "Whether this page's own reads of GET /api/source-status and GET /api/protocol/reality succeeded. No separate monitor, uptime probe, or alerting exists.",
};

// ── 1 · Overview ─────────────────────────────────────────────────────────────

export function AdminOverviewPanel() {
  const {
    data: sourceStatus,
    isLoading: sourceLoading,
    isError: sourceError,
  } = useGetSourceStatus();
  const {
    data: reality,
    isLoading: realityLoading,
    isError: realityError,
  } = useGetProtocolReality();

  const ledgerItems: SourceStatusItem[] = sourceStatus
    ? Object.values(sourceStatus.categories)
    : [];
  const postureCounts = ledgerItems.reduce<Record<string, number>>((acc, i) => {
    acc[i.posture] = (acc[i.posture] ?? 0) + 1;
    return acc;
  }, {});
  const routedCount = moduleRegistry.filter((e) => e.route !== null).length;

  return (
    <PanelCard def={overviewDef}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="rounded-lg border border-border p-3">
          <div className="text-2xl font-semibold text-foreground">
            {moduleRegistry.length}
          </div>
          <div className="text-xs text-muted-foreground">
            Registry modules (v0)
          </div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-2xl font-semibold text-foreground">
            {routedCount}
            <span className="text-sm text-muted-foreground">
              {" "}
              / {moduleRegistry.length}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Modules with a mounted route
          </div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-2xl font-semibold text-foreground">
            {sourceLoading ? "…" : sourceError ? "—" : ledgerItems.length}
          </div>
          <div className="text-xs text-muted-foreground">
            Posture ledger categories
          </div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="text-2xl font-semibold text-foreground">
            {realityLoading
              ? "…"
              : realityError || !reality
                ? "—"
                : Object.values(reality.groups).reduce(
                    (n, items) => n + items.length,
                    0,
                  )}
          </div>
          <div className="text-xs text-muted-foreground">
            Reality spine signals
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {sourceLoading ? (
          <Spinner className="h-3.5 w-3.5" />
        ) : sourceError ? (
          <Unavailable text="Posture ledger unavailable (fail-closed)" />
        ) : (
          Object.entries(postureCounts).map(([posture, count]) => (
            <span
              key={posture}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <PostureBadge posture={posture as SourceStatusItem["posture"]} />
              <span className="font-mono">×{count}</span>
            </span>
          ))
        )}
      </div>
    </PanelCard>
  );
}

// ── 2 · Modules (registry table) ─────────────────────────────────────────────

export function AdminModulesRegistryPanel() {
  const {
    data: sourceStatus,
    isLoading: sourceLoading,
    isError: sourceError,
  } = useGetSourceStatus();
  const {
    data: reality,
    isLoading: realityLoading,
    isError: realityError,
  } = useGetProtocolReality();

  const cellProps = {
    sourceStatus,
    sourceLoading,
    sourceError,
    reality,
    realityLoading,
    realityError,
  };

  return (
    <PanelCard def={modulesDef}>
      <p className="text-xs text-muted-foreground mb-3">
        Module Registry v0 — a governance overlay over the module canon.
        Posture is derived at render time from the declared proof source;
        nothing below is hardcoded.
      </p>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Surface</TableHead>
              <TableHead>Risk class</TableHead>
              <TableHead>Homepage zone</TableHead>
              <TableHead>Gates</TableHead>
              <TableHead className="text-right">Posture</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {moduleRegistry.map((entry) => (
              <TableRow key={entry.registryId}>
                <TableCell>
                  <div className="text-sm text-foreground">{entry.title}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {entry.registryId}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {entry.route ? (
                    <Link
                      href={entry.route}
                      className="text-cyan-700 dark:text-cyan-400 hover:underline"
                    >
                      {entry.route}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">— none —</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">
                  {entry.surface}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">
                  {entry.riskClass}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground">
                  {entry.homepageZone}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                  {entry.requiresAuth ? "session " : ""}
                  {entry.requiresApproval ? "founder-approval" : ""}
                  {!entry.requiresAuth && !entry.requiresApproval ? "—" : ""}
                </TableCell>
                <TableCell className="text-right">
                  <EntryPostureCell entry={entry} {...cellProps} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </PanelCard>
  );
}

// ── 3 · Members & Continuity ─────────────────────────────────────────────────

export function AdminMembersPanel() {
  const {
    data: sourceStatus,
    isLoading: sourceLoading,
    isError: sourceError,
  } = useGetSourceStatus();

  return (
    <PanelCard
      def={membersDef}
      chip={
        <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 font-mono text-[10px] text-rose-700 dark:text-rose-400">
          <ShieldAlert className="h-3 w-3" />
          SERVER-ONLY PII BOUNDARY
        </span>
      }
    >
      <CategoryPostureRow
        label="Member continuity (freeze & root)"
        category="continuity"
        data={sourceStatus}
        isLoading={sourceLoading}
        isError={sourceError}
      />
      <CategoryPostureRow
        label="Membership"
        category="membership"
        data={sourceStatus}
        isLoading={sourceLoading}
        isError={sourceError}
      />
      <CategoryPostureRow
        label="Wallet session (SIWE self-readback)"
        category="walletSession"
        data={sourceStatus}
        isLoading={sourceLoading}
        isError={sourceError}
      />
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Historical member data (wallets, first transactions, proofs) is
        server-only. This console never displays wallet PII, a member
        directory, or any lookup of another wallet — a signed wallet may
        read only its own standing, on{" "}
        <Link href="/member" className="text-cyan-700 dark:text-cyan-400 hover:underline">
          /member
        </Link>
        . Member management tooling is a future founder-gated slice.
      </p>
    </PanelCard>
  );
}

// ── 4 · Sources & Introductions ──────────────────────────────────────────────

export function AdminSourcesPanel() {
  const {
    data: sourceStatus,
    isLoading: sourceLoading,
    isError: sourceError,
  } = useGetSourceStatus();
  const {
    data: reality,
    isLoading: realityLoading,
    isError: realityError,
  } = useGetProtocolReality();

  return (
    <PanelCard def={sourcesDef}>
      <CategoryPostureRow
        label="Source registry"
        category="source"
        data={sourceStatus}
        isLoading={sourceLoading}
        isError={sourceError}
      />
      <CategoryPostureRow
        label="Attribution link generation"
        category="linkGeneration"
        data={sourceStatus}
        isLoading={sourceLoading}
        isError={sourceError}
      />
      <div className="flex items-center justify-between gap-3 py-2">
        <div>
          <div className="text-sm text-foreground">
            Reality spine — source group
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">
            GET /api/protocol/reality · groups.source
          </div>
        </div>
        <div className="shrink-0">
          {realityLoading ? (
            <Spinner className="h-3.5 w-3.5" />
          ) : realityError ? (
            <Unavailable text="Proof unavailable (fail-closed)" />
          ) : (
            (() => {
              const s = realityGroupSummary(reality, "source");
              return s ? (
                <span className="font-mono text-[11px] text-cyan-700 dark:text-cyan-400">
                  {s.readable}/{s.total} read-only signals reconciled
                </span>
              ) : (
                <Unavailable text="Proof unavailable (fail-closed)" />
              );
            })()
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
        Source ids validate read-only on{" "}
        <Link href="/source" className="text-cyan-700 dark:text-cyan-400 hover:underline">
          /source
        </Link>
        ; registry addresses stay server-side. Source creation and
        activation remain owner-side on-chain acts — no panel here will
        ever execute them.
      </p>
    </PanelCard>
  );
}

// ── 5 · Packages & Advertising ───────────────────────────────────────────────

export function AdminPackagesPanel() {
  return (
    <PanelCard def={packagesDef} chip={<TruthLabel variant="FUTURE_MODULE" />}>
      <FutureNote>
        No packages, placements, pricing, or checkout exist anywhere in the
        protocol or this app. This panel reserves the operator surface for
        a future concept that would require explicit founder approval
        before any design or wiring. Any future copy must stay
        recognition-safe.
      </FutureNote>
    </PanelCard>
  );
}

// ── 6 · Address Labels ───────────────────────────────────────────────────────

export function AdminAddressLabelsPanel() {
  return (
    <PanelCard def={addressLabelsDef} chip={<TruthLabel variant="FUTURE_MODULE" />}>
      <FutureNote>
        A future operator tool for labelling server-side protocol
        addresses. Not designed and not built. Full addresses never reach a
        client today, and labels would resolve server-side only — this
        boundary does not change with the tool.
      </FutureNote>
    </PanelCard>
  );
}

// ── 7 · Content & Homepage ───────────────────────────────────────────────────

export function AdminContentPanel() {
  return (
    <PanelCard def={contentDef} chip={<TruthLabel variant="DESIGN_PREVIEW" />}>
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
        The public homepage is governed by a fixed section model — Hero ·
        Promoted Strip (capped at 4 cards) · How-It-Works · Real-vs-Pending
        · Studio Teaser · Expectations. Registry assignments below are the
        v0 input for a future homepage recomposition; editing controls do
        not exist and nothing here writes.
      </p>
      <div className="space-y-1">
        {moduleRegistry
          .filter((e) => e.homepageZone !== "NONE")
          .map((e) => (
            <div
              key={e.registryId}
              className="flex items-center justify-between gap-3 py-1.5 border-b border-border/50 last:border-0"
            >
              <span className="text-sm text-foreground">{e.title}</span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {e.homepageZone}
              </span>
            </div>
          ))}
      </div>
    </PanelCard>
  );
}

// ── 8 · Activity & Chronicle ─────────────────────────────────────────────────

export function AdminActivityPanel() {
  const {
    data: sourceStatus,
    isLoading: sourceLoading,
    isError: sourceError,
  } = useGetSourceStatus();

  return (
    <PanelCard def={activityDef}>
      <CategoryPostureRow
        label="Chronicle"
        category="chronicle"
        data={sourceStatus}
        isLoading={sourceLoading}
        isError={sourceError}
      />
      <CategoryPostureRow
        label="Archive"
        category="archive"
        data={sourceStatus}
        isLoading={sourceLoading}
        isError={sourceError}
      />
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        No moderation or publication queue exists — there is nothing to
        approve and nothing records from this console. The activity
        read-model remains script-only and unwired; archive reads are not
        wired. This panel becomes a real queue only after a founder-approved
        chronicle slice.
      </p>
    </PanelCard>
  );
}

// ── 9 · Feature Flags (real build constants) ─────────────────────────────────

export function AdminFlagsPanel() {
  return (
    <PanelCard def={flagsDef}>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flag</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead className="text-right">State (read-only)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="text-sm">Operator preview gate</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  OPERATOR_PREVIEW_ENABLED
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                Build-time (this bundle)
              </TableCell>
              <TableCell className="text-right font-mono text-[11px]">
                {OPERATOR_PREVIEW_ENABLED
                  ? "enabled in this build"
                  : "excluded from this build"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="text-sm">Wallet session UI</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  WALLET_SESSION_PREVIEW_ENABLED
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                Build-time (all builds)
              </TableCell>
              <TableCell className="text-right font-mono text-[11px]">
                {WALLET_SESSION_PREVIEW_ENABLED
                  ? "enabled in this build"
                  : "excluded from this build"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <div className="text-sm">Auth API exposure</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  server-side exposure flag (name withheld)
                </div>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                Server-side environment
              </TableCell>
              <TableCell className="text-right font-mono text-[11px] text-muted-foreground">
                server-side — not readable here (fail-closed)
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        These gates control visibility and build inclusion — they are not
        authentication. Flag editing from this console does not exist; the
        values above are read from this bundle's own build constants.
      </p>
    </PanelCard>
  );
}

// ── 10 · System Health ───────────────────────────────────────────────────────

export function AdminHealthPanel() {
  const {
    data: sourceStatus,
    isLoading: sourceLoading,
    isError: sourceError,
  } = useGetSourceStatus();
  const {
    data: reality,
    isLoading: realityLoading,
    isError: realityError,
  } = useGetProtocolReality();

  const ledgerItems: SourceStatusItem[] = sourceStatus
    ? Object.values(sourceStatus.categories)
    : [];

  return (
    <PanelCard def={healthDef}>
      <div className="space-y-3">
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="font-mono text-xs text-foreground">
              GET /api/source-status
            </div>
            {sourceLoading ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : sourceError ? (
              <Unavailable text="Unreachable (fail-closed)" />
            ) : (
              <span className="font-mono text-[11px] text-cyan-700 dark:text-cyan-400">
                responding
              </span>
            )}
          </div>
          {sourceStatus ? (
            <div className="font-mono text-[10px] text-muted-foreground mt-1.5">
              mode {sourceStatus.mode} · {ledgerItems.length} categories ·
              canon as-of {sourceStatus.asOf} · expected chain{" "}
              {sourceStatus.expectedChainId}
            </div>
          ) : null}
        </div>
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="font-mono text-xs text-foreground">
              GET /api/protocol/reality
            </div>
            {realityLoading ? (
              <Spinner className="h-3.5 w-3.5" />
            ) : realityError ? (
              <Unavailable text="Unreachable (fail-closed)" />
            ) : (
              <span className="font-mono text-[11px] text-cyan-700 dark:text-cyan-400">
                responding
              </span>
            )}
          </div>
          {reality ? (
            <div className="font-mono text-[10px] text-muted-foreground mt-1.5">
              mode {reality.mode} · as-of {reality.asOf} ·{" "}
              {reality.cached ? "served from cache" : "fresh read"} · ttl{" "}
              {reality.cacheTtlMs}ms · expected chain {reality.expectedChainId}
            </div>
          ) : null}
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Health here means "this page's own data fetches succeeded" — no
        separate monitor, uptime probe, or alerting exists. Deeper checks
        (e.g. GET /api/healthz) are not polled from this panel.
      </p>
    </PanelCard>
  );
}
