// components/admin/AdminShell.tsx
//
// Phase 2 slice 1 — the AAA admin shell: a persistent sectioned layout
// (sidebar + top bar) that replaces the former single flat /admin page.
// Console-graph only: this module is statically imported ONLY by
// operator/OperatorConsole.tsx, so the entire admin surface lives in the
// console's separate lazy chunk — never the public entry bundle — and is
// requested only after App.tsx's neutral wall confirms the operator role
// server-side (Ruling ②; authority is enforced at the API, never by hiding).
//
// TRUTH-FIRST chrome rules:
//   • the notification bell carries NO badge/count — no notification system
//     exists, and the popover says so honestly;
//   • the account menu shows the live OperatorBadge (fail-closed readback of
//     GET /api/auth/operator-context) — never a fabricated identity;
//   • sign-out calls the real logoutSession() through the flag-conditional
//     dynamic wallet import (rule 15: only App.tsx reaches @/wallet/
//     statically) and then returns to /member;
//   • the ⌘K palette only jumps between the ten mounted sections — it
//     searches no data and fabricates no results.

import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WALLET_SESSION_PREVIEW_ENABLED } from "@/config/walletSessionGate";
import {
  AdminDashboardSection,
  AdminMembersSection,
  AdminSourcesSection,
  AdminOperatorsSection,
  AdminContentSection,
  AdminModulesSection,
  AdminBroadcastSection,
  AdminAuditSection,
  AdminSupportSection,
  AdminSettingsSection,
} from "@/pages/admin/sections";
import {
  LayoutDashboard,
  Users,
  Link2,
  ShieldCheck,
  PanelsTopLeft,
  Boxes,
  Megaphone,
  ScrollText,
  LifeBuoy,
  Settings,
  Bell,
  HelpCircle,
  Search,
  LogOut,
  ArrowLeft,
  UserRound,
} from "lucide-react";

// The single source of truth for the admin sections. guard-route-nav-drift
// reconciles these paths against App.tsx mounted routes and the SEO route
// registry — adding or removing a section here without mounting and
// classifying it fails the guard.
export const ADMIN_SECTIONS = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, render: AdminDashboardSection },
  { path: "/admin/members", label: "Members", icon: Users, render: AdminMembersSection },
  { path: "/admin/sources", label: "Sources & referrals", icon: Link2, render: AdminSourcesSection },
  { path: "/admin/operators", label: "Operators", icon: ShieldCheck, render: AdminOperatorsSection },
  { path: "/admin/content", label: "Content", icon: PanelsTopLeft, render: AdminContentSection },
  { path: "/admin/modules", label: "Modules", icon: Boxes, render: AdminModulesSection },
  { path: "/admin/broadcast", label: "Broadcast", icon: Megaphone, render: AdminBroadcastSection },
  { path: "/admin/audit", label: "Audit log", icon: ScrollText, render: AdminAuditSection },
  { path: "/admin/support", label: "Support", icon: LifeBuoy, render: AdminSupportSection },
  { path: "/admin/settings", label: "Settings", icon: Settings, render: AdminSettingsSection },
] as const;

// Operator identity badge lives in the build-time-gated wallet module: loaded
// ONLY via the flag-conditional dynamic import, excluded from default builds.
const OperatorBadge = WALLET_SESSION_PREVIEW_ENABLED
  ? React.lazy(() => import("@/wallet/OperatorBadge"))
  : null;

// "Sign in as operator" menu action (Phase 3 slice 2): opens the RainbowKit
// connect + SIWE sign flow directly from the admin shell — no /member detour.
// Same rule-15 loading discipline: flag-conditional dynamic import only.
const OperatorSignInAction = WALLET_SESSION_PREVIEW_ENABLED
  ? React.lazy(() => import("@/wallet/OperatorSignInAction"))
  : null;

function AccountMenu() {
  const [, navigate] = useLocation();

  async function handleSignOut() {
    if (!WALLET_SESSION_PREVIEW_ENABLED) return;
    const { logoutSession } = await import("@/wallet/walletSession");
    await logoutSession();
    navigate("/member");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback>
              <UserRound className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="text-xs text-muted-foreground mb-1.5">
            Operator identity (live, fail-closed)
          </div>
          {OperatorBadge ? (
            <React.Suspense
              fallback={
                <span className="text-xs font-mono text-muted-foreground">
                  Checking operator status…
                </span>
              }
            >
              <OperatorBadge />
            </React.Suspense>
          ) : (
            <span className="text-xs font-mono text-muted-foreground">
              Wallet session UI excluded from this build
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OperatorSignInAction ? (
          <React.Suspense fallback={null}>
            <OperatorSignInAction />
          </React.Suspense>
        ) : null}
        <DropdownMenuItem asChild>
          <Link href="/member" className="cursor-pointer">
            <UserRound className="h-4 w-4 mr-2" />
            Membership
          </Link>
        </DropdownMenuItem>
        {WALLET_SESSION_PREVIEW_ENABLED ? (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => void handleSignOut()}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out (end wallet session)
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SectionJump() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 text-muted-foreground font-normal"
        onClick={() => setOpen(true)}
      >
        <Search className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Jump to section…</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to an admin section…" />
        <CommandList>
          <CommandEmpty>No matching section.</CommandEmpty>
          <CommandGroup heading="Admin sections">
            {ADMIN_SECTIONS.map((s) => (
              <CommandItem
                key={s.path}
                value={`${s.label} ${s.path}`}
                onSelect={() => {
                  setOpen(false);
                  navigate(s.path);
                }}
              >
                <s.icon className="h-4 w-4 mr-2" />
                {s.label}
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {s.path}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

export default function AdminShell() {
  const [location] = useLocation();

  const active = useMemo(
    () =>
      ADMIN_SECTIONS.find((s) => s.path === location) ?? ADMIN_SECTIONS[0],
    [location],
  );
  const ActiveSection = active.render;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-[11px] font-semibold text-primary">
              SY
            </span>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <div className="text-sm font-semibold text-foreground truncate">
                Syndicate Admin
              </div>
              <div className="font-mono text-[10px] text-muted-foreground truncate">
                internal · operator-gated
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Sections</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {ADMIN_SECTIONS.map((s) => (
                  <SidebarMenuItem key={s.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === s.path}
                      tooltip={s.label}
                    >
                      <Link href={s.path}>
                        <s.icon />
                        <span>{s.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Back to Studio OS">
                <Link href="/studio">
                  <ArrowLeft />
                  <span>Back to Studio OS</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <SidebarTrigger aria-label="Toggle sidebar" />
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-semibold text-foreground truncate">
              {active.label}
            </h1>
            {/* Truth-sweep completeness (2026-07-18, the founder's own screenshot
                caught the survivor): the BLANKET section chip died — the shell
                is live and operator-gated; honesty lives per panel (live panels
                say live, preview panels say preview). */}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <SectionJump />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 text-sm">
                <div className="font-medium text-foreground mb-1">
                  Notifications
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No notification system exists yet — nothing is wired, so
                  there is no count and no feed. This bell becomes real only
                  after a founder-approved slice.
                </p>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Help"
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 text-sm">
                <div className="font-medium text-foreground mb-1">
                  About this console
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Internal operator console. Every panel is read-only over the
                  module registry and the posture APIs; write controls are
                  previews owned by the founder-gated operator write zone. The
                  console reveals only after the server confirms an ACTIVE
                  operator role — a non-operator at this URL sees the standard
                  not-found page, and every privileged action is enforced
                  server-side.
                </p>
              </PopoverContent>
            </Popover>
            <ThemeToggle />
            <AccountMenu />
          </div>
        </header>
        <main className="flex-1 min-w-0 p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <ActiveSection />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
