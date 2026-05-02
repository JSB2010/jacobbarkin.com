"use client";

import { UserProfile } from "@clerk/nextjs";
import { ShieldCheck } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminAccountPage() {
  return (
    <AdminShell
      title="Account Security"
      description="Manage your Clerk profile, sign-in methods, passkeys, and active sessions"
      icon={ShieldCheck}
    >
      <div className="mx-auto w-full max-w-5xl">
        <UserProfile
          routing="path"
          path="/admin/account"
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "w-full shadow-none border border-border bg-card",
              navbar: "bg-card",
              pageScrollBox: "bg-card",
            },
            variables: {
              colorPrimary: "hsl(var(--primary))",
              colorText: "hsl(var(--foreground))",
              colorTextSecondary: "hsl(var(--muted-foreground))",
              colorBackground: "hsl(var(--card))",
              colorInputBackground: "hsl(var(--background))",
              colorInputText: "hsl(var(--foreground))",
              borderRadius: "0.5rem",
            },
          }}
        />
      </div>
    </AdminShell>
  );
}
