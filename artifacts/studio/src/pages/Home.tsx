import { Link } from "wouter";
import { TerminalSquare, ArrowUpRight } from "lucide-react";
import { DataStatusNote } from "@/components/DataStatusNote";
import { ProtocolRealitySummary } from "@/components/ProtocolReality";
import { TruthLabel } from "@/components/TruthLabel";
import { Card } from "@/components/ui/card";
import { getModuleById } from "@/config/modules";
import {
  consoleSurfaces,
  publicSurfaces,
  surfaceAudienceText,
} from "@/config/surfaceClassification";

export default function Home() {
  const operator = consoleSurfaces().filter((s) => s.routePath !== "/studio");
  const publics = publicSurfaces();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-foreground tracking-tight flex items-center gap-3">
          <TerminalSquare className="h-8 w-8 text-primary" />
          Studio OS
        </h1>
        <p className="text-muted-foreground mt-2">
          Operator console for the read-only proof foundation.
        </p>
      </div>

      <DataStatusNote description="This console is a read-only foundation. The only live read is a strictly read-only protocol reality feed (public Avalanche C-Chain facts — no balances, amounts, wallets, transactions, or writes). Every operator surface below is a preview, and nothing here acts." />

      <div className="mb-12">
        <ProtocolRealitySummary />
      </div>

      <h2 className="text-sm font-medium text-foreground mb-4">Operator surfaces</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {operator.map((s) => {
          const module = s.moduleId ? getModuleById(s.moduleId) : undefined;
          if (!module) return null;
          const Icon = module.icon;
          return (
            <Link key={s.routePath} href={s.routePath}>
              <Card className="bg-card/50 border-border/50 backdrop-blur-sm p-5 h-full hover:border-primary/40 transition-colors cursor-pointer">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-2 rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  {module.truthStatus && <TruthLabel variant={module.truthStatus} />}
                </div>
                <h3 className="text-base font-medium text-foreground mb-1">{module.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.summary}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <h2 className="text-sm font-medium text-foreground mb-4">Public surfaces</h2>
      <Card className="bg-card/30 border-border/50 divide-y divide-border/40">
        {publics.map((s) => {
          const module = s.moduleId ? getModuleById(s.moduleId) : undefined;
          return (
            <Link key={s.routePath} href={s.routePath}>
              <div className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-muted/20 transition-colors cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {module?.label ?? s.routePath}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.summary}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">
                    {surfaceAudienceText[s.audience]}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </Link>
          );
        })}
      </Card>
    </div>
  );
}
