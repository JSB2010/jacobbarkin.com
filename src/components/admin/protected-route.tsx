"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "./auth-context";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected route component that redirects to login if not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAdminAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-muted-foreground">Verifying authentication...</span>
      </div>
    );
  }

  // If authenticated, render children
  return user ? <>{children}</> : null;
}
