"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { DashboardHeader } from "./dashboard-header";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardTopbar } from "./dashboard-topbar";
import { OverviewSection } from "./overview-section";
import { RecentOrders } from "./recent-orders";
import { StoreInsights } from "./store-insights";

export default function HomeDashboard() {
  const locale = useLocale();
  const t = useTranslations("Home");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isArabic = locale === "ar";
  const currentYear = new Date().getFullYear();

  return (
    <div
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f7f8fc] text-slate-900"
    >
      <div className="flex min-h-screen">
        <DashboardSidebar
          locale={locale}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        <main className="min-w-0 flex-1">
          <DashboardTopbar
            locale={locale}
            onMenuClick={() => setMobileMenuOpen(true)}
          />

          <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-6 xl:p-9">
            <DashboardHeader locale={locale} />

            <OverviewSection locale={locale} />

            <RecentOrders locale={locale} />

            <StoreInsights locale={locale} />

            <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200/80 py-5 text-[10px] text-slate-400 sm:flex-row">
              <p>
                © {currentYear} StoreFlow. {t("allRightsReserved")}
              </p>

              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t("systemsOperational")}
                </span>

                <span>v1.0.0</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
