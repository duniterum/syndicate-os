import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ThemeToggle";
import { headerNav, footerGroups, navLabel } from "@/config/navigation";
import { brand } from "@/config/brand";
import { seatCta } from "@/config/syndicateFacts";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/30">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-mono text-sm tracking-widest uppercase font-bold text-foreground hover:text-primary transition-colors">
              {brand.name}
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {headerNav.map((item) => (
                <Link 
                  key={item.id} 
                  href={item.path}
                  className={`text-sm font-medium transition-colors hover:text-primary ${location === item.path ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {navLabel(item, "header")}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href={seatCta.href} className="hidden md:inline-flex">
              <Button size="sm" className="font-medium">{seatCta.label}</Button>
            </Link>
            
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left font-mono text-sm tracking-widest uppercase">{brand.name}</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 mt-8">
                  {headerNav.map((item) => (
                    <Link 
                      key={item.id} 
                      href={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`text-lg font-medium transition-colors hover:text-primary ${location === item.path ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {navLabel(item, "header")}
                    </Link>
                  ))}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Link href={seatCta.href} onClick={() => setMobileOpen(false)}>
                      <Button className="w-full justify-center">{seatCta.label}</Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border/50 bg-muted/20 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {footerGroups.map((group) => (
              <div key={group.heading}>
                <h3 className="font-mono text-xs tracking-widest uppercase text-muted-foreground mb-4">
                  {group.heading}
                </h3>
                <ul className="space-y-3">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.path}
                        className="text-sm text-foreground hover:text-primary transition-colors"
                      >
                        {navLabel(item, "footer")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {brand.name}. {brand.rightsNote}</p>
            <p className="text-xs text-muted-foreground font-mono">{brand.foundationNote}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
