"use client";

import Link from "next/link";
import { Bell, Globe, LayoutDashboard, Menu, Search } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardTopbarProps {
  locale: string;
  onMenuClick: () => void;
}

export function DashboardTopbar({ locale, onMenuClick }: DashboardTopbarProps) {
  const t = useTranslations("Home");
  const isArabic = locale === "ar";

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6 xl:px-9">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50 lg:hidden"
        >
          <Menu size={19} />
        </button>

        <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
          <LayoutDashboard size={15} />
          <span>/</span>
          <span className="font-semibold text-slate-700">{t("overview")}</span>
        </div>

        <h1 className="truncate text-sm font-bold text-slate-800 sm:hidden">
          {t("dashboard")}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden w-56 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 md:flex xl:w-72">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input
            type="search"
            placeholder={t("search")}
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-400">
            /
          </kbd>
        </div>

        <Link
          href={isArabic ? "/en" : "/ar"}
          aria-label="Switch language"
          className="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          <Globe size={16} />
          <span>{isArabic ? "EN" : "AR"}</span>
        </Link>

        <button
          type="button"
          aria-label={t("notifications")}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
        </button>

        <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white ring-4 ring-indigo-50 sm:flex">
          AD
        </div>
      </div>
    </header>
  );
}
