"use client";

import { useLocale } from "next-intl";
import { useState } from "react";

import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      <DashboardSidebar className="hidden lg:flex" onCollapsedChange={setSidebarCollapsed} />

      <div
        className={[
          "min-h-screen transition-[margin] duration-200",
          isArabic
            ? sidebarCollapsed ? "lg:mr-[76px]" : "lg:mr-64"
            : sidebarCollapsed ? "lg:ml-[76px]" : "lg:ml-64",
        ].join(" ")}
      >
        <DashboardHeader
          onMenuClick={() => setMobileMenuOpen((current) => !current)}
        />

        <main className="p-4 md:p-6">{children}</main>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={isArabic ? "إغلاق القائمة" : "Close navigation"}
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/40"
          />

          <div
            className={[
              "absolute inset-y-0",
              isArabic ? "right-0" : "left-0",
            ].join(" ")}
          >
            <DashboardSidebar className="flex lg:hidden" onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
