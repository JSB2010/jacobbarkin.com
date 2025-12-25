"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/admin/auth-context";
import { ProtectedRoute } from "@/components/admin/protected-route";
import { SubmissionsDashboard } from "@/components/admin/submissions-dashboard";
import { PageHero } from "@/components/ui/page-hero";
import { Button } from "@/components/ui/button";
import { LogOut, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { signOut } = useAdminAuth();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const success = await signOut();
      if (success) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageHero
        title="Admin Dashboard"
        description="Manage contact form submissions"
        backgroundImage="/images/code-bg.jpg"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/embed-analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Embed Analytics
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        }
      />

      <div className="container py-8">
        <SubmissionsDashboard />
      </div>
    </ProtectedRoute>
  );
}
