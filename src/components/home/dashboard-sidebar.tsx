"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Globe,
  Headphones,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Users,
  X,
  Sparkles,
  ChartColumn,
} from "lucide-react";

import { useTranslations } from "next-intl";

interface DashboardSidebarProps {
  locale: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DashboardSidebar({
  locale,
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const t = useTranslations("Home");
  const isArabic = locale === "ar";

  const navigation = [
    { label: t("overview"), icon: LayoutDashboard, href: `/${locale}` },
    { label: t("orders"), icon: ShoppingBag, href: `/${locale}/orders` },
    { label: t("products"), icon: Package, href: `/${locale}/products` },
    { label: t("customers"), icon: Users, href: `/${locale}/customers` },
    { label: t("analytics"), icon: ChartColumn, href: `/${locale}/analytics` },
    { label: t("discounts"), icon: Tag, href: `/${locale}/discounts` },
  ];

  const secondaryNavigation = [
    { label: t("settings"), icon: Settings, href: `/${locale}/settings` },
    { label: t("support"), icon: Headphones, href: `/${locale}/support` },
  ];

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 z-50 flex w-[260px] flex-col border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isArabic ? "right-0 border-l" : "left-0 border-r"
        } ${
          isOpen
            ? "translate-x-0"
            : isArabic
              ? "translate-x-full"
              : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <Link
            href={`/${locale}`}
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
              <ShoppingBag size={21} />
            </div>

            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-900">
                Store<span className="text-indigo-600">Flow</span>
              </p>
              <p className="text-[9px] font-bold tracking-[0.2em] text-slate-400">
                {t("adminPanel")}
              </p>
            </div>
          </Link>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        <div className="px-4 pb-5 pt-5">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-start transition hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-indigo-600 shadow-sm">
              <Globe size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">
                {t("onlineStore")}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                store.example.com
              </p>
            </div>

            <ChevronDown size={15} className="text-slate-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t("dashboard")}
          </p>

          <nav className="space-y-1">
            {navigation.map((item, index) => {
              const active = index === 0;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-all ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={19}
                    strokeWidth={active ? 2.2 : 1.8}
                    className={
                      active
                        ? "text-indigo-600"
                        : "text-slate-400 group-hover:text-slate-700"
                    }
                  />

                  <span className="flex-1">{item.label}</span>

                  {active && (
                    <span className="h-5 w-1 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
            {t("settings")}
          </div>

          <nav className="space-y-1">
            {secondaryNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <Icon
                    size={19}
                    className="text-slate-400 group-hover:text-slate-700"
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="relative mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-4 text-white">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full border-[12px] border-white/10" />

            <div className="relative">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Sparkles size={18} />
              </div>

              <p className="text-sm font-bold">{t("support")}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-indigo-100">
                {t("supportDescription")}
              </p>

              <Link
                href={`/${locale}/support`}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-indigo-700 transition hover:bg-indigo-50"
              >
                {t("getSupport")}
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
              AD
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-800">
                {t("profile")}
              </p>
              <p className="truncate text-[10px] text-slate-400">
                admin@store.com
              </p>
            </div>

            <button
              type="button"
              aria-label={t("logout")}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
