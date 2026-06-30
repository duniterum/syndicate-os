import React from "react";
import { Link } from "wouter";
import { useGetSourceStatus, type SourceStatusItem } from "@workspace/api-client-react";
import { DataStatusNote } from "@/components/layout/Shell";
import { PostureBadge } from "@/components/PostureBadge";
import { TruthLabel } from "@/components/TruthLabel";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Activity, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  surfaceClassification,
  surfaceAudienceText,
  type SurfaceAudience,
} from "@/config/surfaceClassification";
import { getModuleById } from "@/config/modules";

export default function SystemStatus() {
  const { data, isLoading, isError } = useGetSourceStatus();

  const items: SourceStatusItem[] = data ? Object.values(data.categories) : [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-3">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-light text-foreground tracking-tight">System Status</h1>
          <p className="text-muted-foreground mt-2">
            Honesty hub detailing exactly what is real versus not wired.
          </p>
        </div>
      </div>

      <DataStatusNote description="Posture-only source registry. No live chain reads, no balances, no member data, no RPC — every value is null by design. Verified static canon reference, not a live RPC read." />

      {data && (
        <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
          <span>
            Mode <span className="text-foreground/80">{data.mode}</span>
          </span>
          <span className="text-border">·</span>
          <span>
            Source <span className="text-foreground/80">{data.generatedBy}</span>
          </span>
          <span className="text-border">·</span>
          <span>
            Expected chain <span className="text-foreground/80">{data.expectedChainId}</span>
          </span>
          <span className="text-border">·</span>
          <span>
            As of <span className="text-foreground/80">{new Date(data.asOf).toISOString().slice(0, 10)}</span>
          </span>
          <span className="text-border">·</span>
          <span className="text-foreground/80">{items.length} categories</span>
        </div>
      )}

      {isLoading && (
        <Card className="bg-card/40 border-border/50 p-12">
          <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Spinner className="h-6 w-6 text-primary" />
            <p className="text-sm">Loading source posture…</p>
          </div>
        </Card>
      )}

      {isError && (
        <Card className="bg-card/40 border-border/50 p-8">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-amber-500/10 rounded-md text-amber-500 shrink-0 mt-0.5">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Source registry unavailable</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                The posture registry could not be reached. No fallback or placeholder values are
                shown — this surface only renders verified posture data from the source-status
                endpoint.
              </p>
            </div>
          </div>
        </Card>
      )}

      {data && (
        <Card className="bg-card/40 border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/30">
                <TableHead className="w-[230px] font-medium text-foreground">Category</TableHead>
                <TableHead className="font-medium text-foreground">Note</TableHead>
                <TableHead className="w-[200px] font-medium text-foreground">Class</TableHead>
                <TableHead className="w-[120px] font-medium text-foreground">Value</TableHead>
                <TableHead className="text-right font-medium text-foreground">Posture</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.key} className="border-border/30 hover:bg-muted/10 transition-colors align-top">
                  <TableCell className="font-medium text-foreground/90">
                    <div>{item.label}</div>
                    <div className="font-mono text-[10px] text-muted-foreground mt-1">{item.sourceRef}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    <div className="leading-relaxed">{item.note}</div>
                    <div className="font-mono text-[10px] text-muted-foreground/70 mt-1">
                      Surface · {item.surface}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-mono text-[10px] text-foreground/70">{item.publicClass}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 capitalize">
                      Confidence · {item.confidence}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-[11px] text-muted-foreground">null</div>
                    <div className="text-[10px] text-muted-foreground/70 mt-0.5">posture-only</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <PostureBadge posture={item.posture} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <div className="mt-12">
        <h2 className="text-xl font-light tracking-tight text-foreground mb-2">Surface map</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-2xl">
          Every surface in the foundation, its audience, and its honest lifecycle — projected
          from the surface-classification registry, not a hand-maintained list.
        </p>
        <div className="space-y-8">
          {(["PUBLIC", "MEMBER_PREVIEW", "OPERATOR_PREVIEW"] as SurfaceAudience[]).map((aud) => {
            const rows = surfaceClassification.filter((s) => s.audience === aud);
            if (rows.length === 0) return null;
            return (
              <div key={aud}>
                <h3 className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-3">
                  {surfaceAudienceText[aud]}
                </h3>
                <Card className="bg-card/30 border-border/50 divide-y divide-border/40">
                  {rows.map((s) => {
                    const module = s.moduleId ? getModuleById(s.moduleId) : undefined;
                    return (
                      <div
                        key={s.routePath}
                        className="flex items-center justify-between gap-4 px-5 py-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground">
                            {module?.label ?? s.routePath}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">{s.summary}</div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {module?.truthStatus && <TruthLabel variant={module.truthStatus} />}
                          <Link
                            href={s.routePath}
                            className="font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
                          >
                            {s.routePath}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
