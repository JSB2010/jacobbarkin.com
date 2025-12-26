import { redirect } from 'next/navigation';

/**
 * Admin page that redirects to the dashboard
 * Authentication is handled by the layout (Clerk)
 */
export default function AdminRedirectPage() {
  // Redirect to dashboard - auth is handled by Clerk in layout
  redirect('/admin/dashboard');
}