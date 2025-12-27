"use client";

import { LayoutDashboard } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { SubmissionsDashboard } from "@/components/admin/submissions-dashboard";

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="Admin Dashboard"
      description="Manage contact form submissions"
      icon={LayoutDashboard}
    >
      <SubmissionsDashboard />
    </AdminShell>
  );
}
