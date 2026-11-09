"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  MoreHorizontal,
  Package,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { activities, products } from "./data";
import { SectionTitle } from "./section-title";
import { formatCurrency } from "@/utils/formatCurrency";

interface StoreInsightsProps {
  locale: string;
}

export function StoreInsights({ locale }: StoreInsightsProps) {
  const t = useTranslations("Home");

  const quickActions = [
    {
      label: t("manageOrders"),
      icon: ShoppingBag,
      href: `/${locale}/orders`,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: t("manageProducts"),
      icon: Package,
      href: `/${locale}/products`,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: t("manageCustomers"),
      icon: Users,
      href: `/${locale}/customers`,
      color: "bg-sky-50 text-sky-600",
    },
  ];

  return (
    <>
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Top products */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6 xl:col-span-2">
          <SectionTitle
            title={t("topProducts")}
            subtitle={t("topProductsSubtitle")}
            action={
              <Link
                href={`/${locale}/products`}
                className="text-xs font-bold text-indigo-600 transition hover:text-indigo-800"
              >
                {t("viewAll")}
              </Link>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-start">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-3 text-start text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("product")}
                  </th>
                  <th className="pb-3 text-start text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("sold")}
                  </th>
                  <th className="pb-3 text-start text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("revenue")}
                  </th>
                  <th className="pb-3 text-start text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {t("stock")}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="py-4 pe-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${product.color}`}
                        >
                          {product.icon}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {product.name}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-xs font-semibold text-slate-600">
                      {product.sold}
                    </td>

                    <td className="py-4 text-xs font-bold text-slate-800">
                      {formatCurrency(product.revenue, locale)}
                    </td>

                    <td className="py-4">
                      <span
                        className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold ${
                          product.stock === 0
                            ? "bg-rose-50 text-rose-600"
                            : product.stock < 20
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-600"
                        }`}
                      >
                        {product.stock === 0
                          ? t("outOfStock")
                          : product.stock < 20
                            ? t("lowStock")
                            : t("inStock")}

                        {product.stock > 0 && ` · ${product.stock}`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6">
          <SectionTitle
            title={t("salesActivity")}
            subtitle={t("activitySubtitle")}
            action={
              <button
                type="button"
                aria-label="More activity options"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
              >
                <MoreHorizontal size={20} />
              </button>
            }
          />

          <div className="relative space-y-5">
            <div className="absolute bottom-4 left-[17px] top-4 w-px bg-slate-100 rtl:left-auto rtl:right-[17px]" />

            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div key={activity.title} className="relative flex gap-3">
                  <div
                    className={`relative z-10 flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-xl ${activity.color}`}
                  >
                    <Icon size={16} />
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-xs font-bold text-slate-800">
                      {t(activity.title)}
                    </p>

                    <p className="mt-1 truncate text-[10px] text-slate-400">
                      {activity.description}
                    </p>

                    <p className="mt-2 text-[10px] text-slate-400">
                      {activity.time === "justNow"
                        ? t("justNow")
                        : activity.time === "minutesAgo"
                          ? `5 ${t("minutesAgo")}`
                          : `2 ${t("hoursAgo")}`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href={`/${locale}/activity`}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-bold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            {t("viewAll")}
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Quick actions and performance */}
      <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6">
          <SectionTitle title={t("quickActions")} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-indigo-100 hover:bg-slate-50"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${action.color}`}
                  >
                    <Icon size={19} />
                  </div>

                  <span className="flex-1 text-xs font-bold text-slate-700">
                    {action.label}
                  </span>

                  <ArrowRight
                    size={14}
                    className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-600 rtl:rotate-180"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-lg shadow-indigo-200/60">
          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[35px] border-white/[0.06]" />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-white/[0.04]" />

          <div className="relative flex h-full flex-col justify-between gap-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold">{t("storePerformance")}</p>
                <p className="mt-1 text-xs text-indigo-200">{t("activeNow")}</p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Activity size={22} />
              </div>
            </div>

            <div>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-extrabold tracking-tight">
                  94.8
                </span>

                <span className="mb-1 text-sm font-semibold text-indigo-200">
                  / 100
                </span>

                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2 py-1 text-[10px] font-bold text-emerald-100">
                  <ArrowUpRight size={12} />
                  +5.2%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[94.8%] rounded-full bg-white" />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-100">
                <CheckCircle2 size={15} />
                {t("excellent")}
              </span>

              <span className="text-[10px] text-indigo-200">
                {t("storeHealthScore")}
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
