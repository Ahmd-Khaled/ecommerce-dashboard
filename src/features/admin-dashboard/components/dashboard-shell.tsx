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

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-muted/30">
      <DashboardSidebar />

      <div
        className={[
          "min-h-screen transition-[margin] duration-200",
          isArabic ? "mr-64" : "ml-64",
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
            <DashboardSidebar />
          </div>
        </div>
      )}
    </div>
  );
}
