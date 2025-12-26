"use client";

import { UserButton, useUser, SignOutButton } from "@clerk/nextjs";
import { SubmissionsDashboard } from "@/components/admin/submissions-dashboard";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, BarChart3, ExternalLink, Code2 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Title */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage contact form submissions</p>
              </div>
            </div>

            {/* Right side - User info & actions */}
            <div className="flex items-center gap-4">
              {/* Embed Analytics link */}
              <Link href="/admin/embed-analytics">
                <Button variant="outline" size="sm" className="gap-2">
                  <Code2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Embed Stats</span>
                </Button>
              </Link>

              {/* Cloudflare Analytics link */}
              <a
                href="https://dash.cloudflare.com/?to=/:account/web-analytics/jacobbarkin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                  <ExternalLink className="w-3 h-3 hidden sm:inline" />
                </Button>
              </a>

              {/* User info */}
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9",
                    },
                  }}
                />
                <div className="text-sm">
                  <p className="font-medium">{user?.fullName || user?.primaryEmailAddress?.emailAddress}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>

              {/* Mobile: Just show avatar */}
              <div className="sm:hidden">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                />
              </div>

              {/* Sign out button */}
              <SignOutButton>
                <Button variant="outline" size="sm" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-8">
        <SubmissionsDashboard />
      </div>
    </div>
  );
}
