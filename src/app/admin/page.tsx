'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAdminAuth } from '@/components/admin/auth-context';

/**
 * Admin page that redirects to the appropriate page based on authentication status
 */
export default function AdminRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAdminAuth();
  const hasRedirected = useRef(false);

  // Redirect based on authentication status (only once)
  useEffect(() => {
    if (!loading && !hasRedirected.current) {
      hasRedirected.current = true;
      if (user) {
        router.push('/admin/dashboard');
      } else {
        router.push('/admin/login');
      }
    }
  }, [router, user, loading]);

  // Show loading spinner while checking auth status
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
      <span className="ml-4 text-muted-foreground">Checking authentication...</span>
    </div>
  );
}