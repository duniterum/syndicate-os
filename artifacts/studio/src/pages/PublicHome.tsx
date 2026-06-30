import React from "react";
import { Link } from "wouter";
import { ShieldCheck, TerminalSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TruthLabel } from "@/components/TruthLabel";
import { surfaceStatus } from "@/config/truthStatus";
import {
  heroContent,
  protocolSurfaces,
  howItWorks,
  operationalReality,
  awaitingWiring,
  studioPreview,
  expectations,
} from "@/config/syndicateFacts";

export default function PublicHome() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50 bg-background pt-24 pb-32 md:pt-32 md:pb-40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <TruthLabel variant={heroContent.badge} className="mb-6" />
          <h1 className="text-4xl md:text-6xl font-light tracking-tight text-foreground max-w-4xl mb-6 leading-tight">
            {heroContent.headlineLead} <br className="hidden md:block" />
            <span className="font-medium">{heroContent.headlineEmphasis}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
            {heroContent.subheadline}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link href={heroContent.primaryCta.href}>
              <Button size="lg" className="h-12 px-8 text-base font-medium">{heroContent.primaryCta.label}</Button>
            </Link>
            <Link href={heroContent.secondaryCta.href}>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm">{heroContent.secondaryCta.label}</Button>
            </Link>
          </div>

          {/* Premium Visual Object - CSS/SVG Vault/Ring */}
          <div className="mt-20 relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-4 border border-primary/40 rounded-full border-dashed animate-[spin_40s_linear_infinite_reverse]" />
            <div className="absolute inset-8 border border-border rounded-full" />
            <div className="absolute inset-12 bg-card border border-border shadow-2xl rounded-full flex flex-col items-center justify-center">
              <ShieldCheck className="w-12 h-12 text-primary mb-2 opacity-80" />
              <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">{heroContent.coreLabel}</span>
            </div>
            <div className="absolute bottom-0 translate-y-1/2 bg-background px-3 py-1 border border-border rounded-full shadow-sm">
              <TruthLabel variant={heroContent.coreStatus} />
            </div>
          </div>
        </div>
      </section>

      {/* Proof Strip */}
      <section className="py-20 bg-muted/10 border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {protocolSurfaces.map((surface) => {
              const Icon = surface.icon;
              return (
                <Card key={surface.id} className="bg-card/60 backdrop-blur-sm border-border/50 p-6 flex flex-col h-full hover:border-primary/30 transition-colors">
                  <Icon className={`w-6 h-6 mb-4 ${surface.iconClass}`} />
                  <h3 className="text-base font-medium text-foreground mb-2">{surface.homeLabel}</h3>
                  <p className="text-sm text-muted-foreground flex-1 mb-4">{surface.homeBlurb}</p>
                  <TruthLabel variant={surface.truthStatus} />
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background border-b border-border/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-tight text-foreground mb-4">{howItWorks.title}</h2>
            <p className="text-muted-foreground">{howItWorks.subtitle}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-[1px] bg-border border-dashed z-0" />
            
            {howItWorks.steps.map((step) => (
              <div key={step.step} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-primary font-mono font-medium mb-6">{step.step}</div>
                <h3 className="text-lg font-medium text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Real / What's Pending */}
      <section className="py-24 bg-muted/10 border-b border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-light tracking-tight text-foreground mb-4">{operationalReality.title}</h2>
              <p className="text-muted-foreground">{operationalReality.subtitle}</p>
            </div>
            <Link href={operationalReality.statusCta.href}>
              <Button variant="outline">{operationalReality.statusCta.label}</Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-border/50 p-8 bg-card shadow-sm">
              <h3 className="font-mono text-xs tracking-widest uppercase text-foreground mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                {operationalReality.liveHeading}
              </h3>
              <ul className="space-y-6">
                {operationalReality.live.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} className="flex items-start gap-4">
                      <div className="p-2 rounded-md bg-muted text-foreground"><Icon className="w-4 h-4" /></div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground mb-1">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>

            <Card className="border-border/50 p-8 bg-card/50 shadow-sm border-dashed">
              <h3 className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500/80" />
                {operationalReality.pendingHeading}
              </h3>
              <ul className="space-y-6">
                {awaitingWiring.map((item) => (
                  <li key={item.surfaceId} className="flex items-start gap-4">
                    <div className="mt-0.5"><TruthLabel variant={surfaceStatus[item.surfaceId]} /></div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Studio OS Preview */}
      <section className="py-24 bg-background border-b border-border/50">
        <div className="container mx-auto px-4 max-w-5xl">
          <Card className="border-border/50 overflow-hidden bg-card shadow-lg">
            <div className="flex flex-col md:flex-row">
              <div className="p-8 md:p-12 md:w-1/2 flex flex-col justify-center">
                <TerminalSquare className="w-8 h-8 text-primary mb-6" />
                <h2 className="text-2xl font-light tracking-tight text-foreground mb-4">{studioPreview.title}</h2>
                <p className="text-muted-foreground mb-8 leading-relaxed text-sm">
                  {studioPreview.description}
                </p>
                <div>
                  <Link href={studioPreview.cta.href}>
                    <Button>{studioPreview.cta.label}</Button>
                  </Link>
                </div>
              </div>
              <div className="bg-muted/30 md:w-1/2 p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-border/50">
                <div className="w-full max-w-sm rounded-lg border border-border/50 bg-background shadow-sm overflow-hidden flex flex-col">
                  <div className="h-8 border-b border-border/50 bg-muted/50 flex items-center px-3 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="h-4 w-1/3 bg-muted rounded-md mb-4" />
                    <div className="space-y-2 mb-6">
                      <div className="h-3 w-full bg-muted/50 rounded-md" />
                      <div className="h-3 w-5/6 bg-muted/50 rounded-md" />
                      <div className="h-3 w-4/6 bg-muted/50 rounded-md" />
                    </div>
                    <TruthLabel variant={studioPreview.mockStatus} />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Read Before Participating */}
      <section className="py-24 bg-muted/10">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <ShieldCheck className="w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-light tracking-tight text-foreground mb-4">{expectations.title}</h2>
          </div>
          
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            <p className="text-center">
              {expectations.body}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
