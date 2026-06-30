import React from "react";
import { Link, useLocation } from "wouter";
import { Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { RouteContextBar } from "@/components/RouteContextBar";
import { sidebarNav, navLabel } from "@/config/navigation";
import { brand } from "@/config/brand";

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 h-full border-r border-border bg-card/30 backdrop-blur-md flex flex-col hidden md:flex">
      <Link href="/">
        <div className="p-6 border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer block">
          <h1 className="text-sm font-mono tracking-widest text-primary uppercase">{brand.name}</h1>
          <p className="text-xs text-muted-foreground mt-1">{brand.product}</p>
        </div>
      </Link>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {sidebarNav.map((item) => {
            const isActive = location === item.path || (location === "/" && item.path === "/studio");
            const Icon = item.icon;
            return (
              <Link key={item.id} href={item.path}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <Icon className="h-4 w-4" />
                  {navLabel(item, "sidebar")}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
      
      <div className="p-4 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-muted-foreground bg-muted/30 rounded-md">
          <div className="h-2 w-2 rounded-full bg-red-500/80 animate-pulse" />
          Offline
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden selection:bg-primary/30">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        <RouteContextBar />
        <div className="flex-1 overflow-y-auto z-10 relative" data-scroll-root>
          {children}
        </div>
      </div>
    </div>
  );
}

export function DataStatusNote({ description }: { description: string }) {
  return (
    <div className="mb-8 p-3 border border-border/50 bg-muted/20 rounded-lg flex items-start gap-3">
      <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0 mt-0.5">
        <Activity className="h-4 w-4" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-foreground">Data Status</h4>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
