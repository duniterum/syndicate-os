import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Compass, Home, Activity, ShieldCheck, ArrowRight } from "lucide-react";

const recoveryLinks = [
  { href: "/", label: "Back to home", icon: Home, primary: true },
  { href: "/status", label: "View status", icon: Activity, primary: false },
  { href: "/proof", label: "Verify proof", icon: ShieldCheck, primary: false },
  { href: "/member", label: "Take your seat", icon: ArrowRight, primary: false },
];

export default function NotFound() {
  return (
    <div className="h-full w-full flex items-center justify-center p-6 sm:p-8 bg-background">
      <Card className="w-full max-w-lg">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                Page not found
              </p>
              <h1 className="type-h2 text-foreground mt-0.5">
                This route isn't part of the foundation
              </h1>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you were looking for doesn't exist here. Nothing is broken —
            pick a live surface below to get back on track.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recoveryLinks.map(({ href, label, icon: Icon, primary }) => (
              <Button
                key={href}
                asChild
                variant={primary ? "default" : "outline"}
                className="w-full justify-start gap-2"
              >
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
