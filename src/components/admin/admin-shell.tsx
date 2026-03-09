"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useClerk, useUser } from "@clerk/nextjs";
import type { LucideIcon } from "lucide-react";
import { Code2, LogOut, MessageSquare } from "lucide-react";

import { Button } from "@/components/ui/button";

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
    label: "Embed Analytics",
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
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Administrator";

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Sign out failed:", error);
      router.push("/sign-in");
    } finally {
      setIsSigningOut(false);
    }
  };

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

            <div className="flex flex-wrap items-center gap-3 justify-between lg:justify-end">
              {actions}

              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9",
                    },
                  }}
                />
                <div className="text-sm">
                  <p className="font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>

              <div className="sm:hidden">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
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
