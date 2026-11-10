"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Baby,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Settings,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/lib/role";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/staff", label: "Overview", icon: LayoutDashboard },
  { href: "/staff/children", label: "Children", icon: Baby },
  { href: "/staff/registrations", label: "Registrations", icon: ClipboardList },
  { href: "/staff/settings", label: "Settings", icon: Settings },
];

export function StaffShell({ children }: { children: React.ReactNode }) {
  const { role, ready, setRole } = useRole();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (ready && !role) router.replace("/staff/login");
  }, [ready, role, router]);

  if (!ready || !role) {
    return (
      <div className="flex flex-1 items-center justify-center p-10 text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const isActive = (href: string) =>
    href === "/staff" || href === "/staff/children"
      ? pathname === href
      : pathname.startsWith(href);
  const signOut = () => {
    setRole(null);
    router.push("/staff/login");
  };
  const close = () => setMenuOpen(false);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/*
        Phones (< md): logo + menu button, nav opens as a panel.
        Tablets (md–lg): logo + role switch, nav as one wrapping row.
        Laptops and up (lg+): sticky sidebar.
      */}
      <aside className="no-print flex shrink-0 flex-col gap-3 border-b border-border bg-white px-4 py-3 lg:sticky lg:top-7 lg:h-[calc(100vh-1.75rem)] lg:w-60 lg:gap-4 lg:border-r lg:border-b-0 lg:py-6">
        <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-start">
          <Link
            href="/staff"
            aria-label="Dashboard home"
            className="text-[0.7rem] sm:text-[0.75rem]"
            onClick={close}
          >
            <Logo />
          </Link>
          <div className="hidden items-center gap-2 md:flex lg:hidden">
            <RoleSwitch />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sign out"
              onClick={signOut}
            >
              <LogOut aria-hidden />
            </Button>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            aria-expanded={menuOpen}
            aria-controls="staff-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
          </Button>
        </div>
        <nav
          id="staff-menu"
          aria-label="Staff"
          className={cn(
            "flex-col gap-1 md:flex md:flex-row md:flex-wrap lg:flex-col",
            menuOpen ? "flex" : "hidden",
          )}
        >
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={close}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors md:py-2",
                isActive(href)
                  ? "bg-green-soft text-green-ink"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden /> {label}
            </Link>
          ))}
          <Link
            href="/register"
            onClick={close}
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground md:py-2"
          >
            <Plus className="size-4" aria-hidden /> Parent form
          </Link>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 md:hidden">
            <RoleSwitch />
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut aria-hidden /> Sign out
            </Button>
          </div>
        </nav>
        <div className="mt-auto hidden flex-col gap-3 lg:flex">
          <RoleSwitch />
          <Button
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={signOut}
          >
            <LogOut aria-hidden /> Sign out
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Cap line length on very wide screens. */}
        <div className="mx-auto flex w-full max-w-[90rem] flex-1 flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Lets the presenter flip between Admin and Staff views to show the permissions. */
function RoleSwitch() {
  const { role, setRole } = useRole();
  return (
    <div className="flex flex-col gap-1.5">
      <span className="hidden text-xs text-muted-foreground lg:block">
        Viewing as
      </span>
      <div
        role="group"
        aria-label="Demo role"
        className="inline-flex rounded-full bg-muted p-1 text-xs"
      >
        {(["admin", "staff"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            aria-pressed={role === r}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 font-medium capitalize",
              role === r ? "bg-white shadow-sm" : "text-muted-foreground",
            )}
          >
            {r === "admin" ? (
              <ShieldCheck className="size-3.5" aria-hidden />
            ) : (
              <UserRound className="size-3.5" aria-hidden />
            )}
            {r}
          </button>
        ))}
      </div>
      <Badge
        tone={role === "admin" ? "green" : "blue"}
        className="hidden self-start lg:inline-flex"
      >
        {role === "admin" ? "Full access" : "Contact + emergency only"}
      </Badge>
    </div>
  );
}
