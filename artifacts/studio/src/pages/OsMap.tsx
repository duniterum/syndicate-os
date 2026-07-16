import { Network, ServerOff } from "lucide-react";
import { DataStatusNote } from "@/components/DataStatusNote";
import { SurfaceMapSection } from "@/components/SurfaceMapSection";
import { TruthLabel } from "@/components/TruthLabel";
import { LifecycleBadge } from "@/components/LifecycleBadge";
import { Card } from "@/components/ui/card";
import {
  protocolOsMap,
  OS_MAP_PAGE,
  type OsMapNode,
} from "@/config/protocolOsMap";
import { surfaceStatus } from "@/config/truthStatus";
import { getModuleById } from "@/config/modules";
import { getSurfaceByRoute, surfaceAudienceText } from "@/config/surfaceClassification";
import { LiveEvidencePanel, SpineDomainMeta } from "@/operator/LiveEvidencePanel";
import {
  evidenceClassText,
  osMapNodeClass,
  spineNodeGroup,
} from "@/operator/protocolRealityEvidence";

function NodeStatus({ node }: { node: OsMapNode }) {
  if (node.binding.kind === "surface") {
    return <TruthLabel variant={surfaceStatus[node.binding.surfaceId]} />;
  }
  return <LifecycleBadge lifecycle={node.binding.lifecycle} />;
}

function ClassificationChip({ nodeId }: { nodeId: string }) {
  const cls = osMapNodeClass[nodeId];
  if (!cls) return null;
  return (
    <span
      className="inline-flex items-center font-mono text-[10px] px-2 py-0.5 rounded-sm border border-border/60 text-muted-foreground mb-2 mr-2"
      data-testid={`chip-class-${nodeId}`}
    >
      {evidenceClassText[cls]}
    </span>
  );
}

export default function OsMap() {
  const module = getModuleById("os-map");
  const surface = getSurfaceByRoute("/os-map");

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div
        className="mb-6 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 font-mono text-[11px] sm:text-xs tracking-wide text-warning"
        data-testid="banner-os-map-internal"
      >
        {OS_MAP_PAGE.banner}
      </div>

      <div className="mb-6">
        <h1 className="type-h1 text-foreground flex items-center gap-3">
          <Network className="h-8 w-8 text-primary" />
          Protocol OS Map
        </h1>
        <p className="text-muted-foreground mt-2">{OS_MAP_PAGE.intro}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-8">
        {module?.truthStatus && <TruthLabel variant={module.truthStatus} />}
        <span className="font-mono text-[10px] sm:text-xs px-2 py-0.5 rounded-sm border border-border/60 text-muted-foreground">
          {surfaceAudienceText[surface?.audience ?? "OPERATOR_PREVIEW"]}
        </span>
      </div>

      {module && <DataStatusNote description={module.description} />}

      <div className="space-y-10">
        {protocolOsMap.map((domain) => {
          const hasLiveNodes = domain.nodes.some((n) => n.id in spineNodeGroup);
          return (
            <section key={domain.id} data-testid={`section-os-map-${domain.id}`}>
              <h2 className="text-sm font-medium text-foreground mb-1">{domain.label}</h2>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                {domain.description}
              </p>
              {hasLiveNodes && <SpineDomainMeta />}
              <div className={hasLiveNodes ? "grid gap-3" : "grid gap-3 sm:grid-cols-2"}>
                {domain.nodes.map((node) => (
                  <Card
                    key={node.id}
                    className="bg-card/40 border-border/50 p-4"
                    data-testid={`card-os-map-${node.id}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-sm font-medium text-foreground leading-snug">
                        {node.label}
                      </h3>
                      <NodeStatus node={node} />
                    </div>
                    <ClassificationChip nodeId={node.id} />
                    {node.notPublic && (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] px-2 py-0.5 rounded-sm border border-destructive/40 text-destructive mb-2">
                        <ServerOff className="h-3 w-3" />
                        SERVER-ONLY — NO PUBLIC SURFACE
                      </span>
                    )}
                    <p className="text-xs text-foreground/90 leading-relaxed mb-1.5">
                      {node.summary}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{node.reality}</p>
                    {node.asOf && (
                      <p className="font-mono text-[10px] text-muted-foreground/80 mt-2">
                        As of: {node.asOf}
                      </p>
                    )}
                    {node.id in spineNodeGroup && <LiveEvidencePanel nodeId={node.id} />}
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* AUD-TRUTH-2 (founder Ruling ②, 2026-07-16): the COMPLETE surface map
          lives HERE, on the operator side — moved from the public /status,
          never deleted. All three audiences, one shared projection. */}
      <div className="mt-12">
        <h2 className="type-h2 text-foreground mb-2">Surface map — all audiences</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-2xl">
          Every surface in the foundation, its audience, and its honest lifecycle —
          projected from the surface-classification registry. The public /status
          shows visitors the PUBLIC and MEMBER sections only; the operator view
          here carries the whole organism.
        </p>
        <SurfaceMapSection
          audiences={["PUBLIC", "MEMBER_PREVIEW", "OPERATOR_PREVIEW"]}
        />
      </div>
    </div>
  );
}
