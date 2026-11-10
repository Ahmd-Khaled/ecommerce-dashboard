import type { ReactNode } from "react";

import { AdminSessionGuard } from "@/features/admin-auth/components/admin-session-guard";
import { DashboardShell } from "@/features/admin-dashboard/components/dashboard-shell";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AdminSessionGuard>
      <DashboardShell>{children}</DashboardShell>
    </AdminSessionGuard>
  );
}
