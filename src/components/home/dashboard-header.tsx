"use client";

import Link from "next/link";
import { CalendarDays, ChevronDown, Download, Plus } from "lucide-react";
import { useTranslations } from "next-intl";

interface DashboardHeaderProps {
  locale: string;
}

export function DashboardHeader({ locale }: DashboardHeaderProps) {
  const t = useTranslations("Home");

  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[28px]">
            {t("welcome")} 👋
          </h1>

          <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 sm:inline-flex">
            <span className="me-1.5 mt-0.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t("live")}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500">{t("subtitle")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <CalendarDays size={16} className="text-slate-400" />
          {t("today")}
          <ChevronDown size={14} />
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <Download size={16} />
          <span className="hidden sm:inline">{t("downloadReport")}</span>
          <span className="sm:hidden">{t("export")}</span>
        </button>

        <Link
          href={`/${locale}/products/new`}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
        >
          <Plus size={17} />
          {t("addProduct")}
        </Link>
      </div>
    </section>
  );
}
