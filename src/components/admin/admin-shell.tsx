"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import type { LucideIcon } from "lucide-react";
import { Code2, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";

const ACCOUNT_PORTAL_USER_URL =
  "https://accounts.jacobbarkin.com/user?redirect_url=https%3A%2F%2Fjacobbarkin.com%2Fadmin%2Fdashboard";

type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  isActive?: (pathname: string) => boolean;
};

const adminNavItems: AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Contact Inbox",
    icon: MessageSquare,
    isActive: (pathname) =>
      pathname === "/admin/dashboard" || pathname.startsWith("/admin/submissions"),
  },
  {
    href: "/admin/embed-analytics",
    label: "Embed Intelligence",
    icon: Code2,
    isActive: (pathname) => pathname.startsWith("/admin/embed-analytics"),
  },
];

type AdminShellProps = {
  title: string;
  description?: string;
  icon: LucideIcon;
  actions?: ReactNode;
  children: ReactNode;
};

export function AdminShell({ title, description, icon: Icon, actions, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="container py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">{title}</h1>
                {description ? (
                  <p className="text-sm text-muted-foreground">{description}</p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 justify-between lg:ml-auto lg:justify-end">
              {actions}

              <div className="ml-auto rounded-md border bg-background px-3 py-2 shadow-xs">
                <UserButton
                  showName
                  userProfileMode="navigation"
                  userProfileUrl={ACCOUNT_PORTAL_USER_URL}
                  appearance={{
                    elements: {
                      userButtonBox: "gap-3",
                      userButtonAvatarBox: "h-7 w-7",
                      userButtonOuterIdentifier: "font-medium text-foreground max-w-48 truncate",
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t">
          <div className="container py-2">
            <nav className="flex flex-wrap gap-2" aria-label="Admin pages">
              {adminNavItems.map((item) => {
                const active = pathname
                  ? item.isActive
                    ? item.isActive(pathname)
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
                  : false;
                return (
                  <Button
                    key={item.href}
                    variant={active ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    asChild
                  >
                    <Link href={item.href} aria-current={active ? "page" : undefined}>
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="container py-8">{children}</div>
    </div>
  );
}
