import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { getAdminAuth } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin Dashboard | Jacob Barkin",
  description: "Admin dashboard for managing contact form submissions",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getAdminAuth();

  // Redirect to sign-in if not authenticated
  if (!admin.userId) {
    redirect("/sign-in");
  }

  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
