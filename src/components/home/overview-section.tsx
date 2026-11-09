"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Activity,
  MoreHorizontal,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { chartData, orderDistribution } from "./data";
import type { RangeKey } from "./types";
import { MetricCard } from "./metric-card";
import { SectionTitle } from "./section-title";
import { formatCurrency } from "@/utils/formatCurrency";

interface OverviewSectionProps {
  locale: string;
}

export function OverviewSection({ locale }: OverviewSectionProps) {
  const t = useTranslations("Home");
  const [range, setRange] = useState<RangeKey>("7d");

  const isArabic = locale === "ar";
  const chart = chartData[range];

  const rangeOptions: { label: string; value: RangeKey }[] = [
    { label: t("last7Days"), value: "7d" },
    { label: t("last30Days"), value: "30d" },
    { label: t("last90Days"), value: "90d" },
    { label: t("last12Months"), value: "12m" },
  ];

  const stats = [
    {
      title: t("totalRevenue"),
      value: formatCurrency(284500, locale),
      change: "+12.8%",
      positive: true,
      icon: Wallet,
      iconColor: "text-violet-600",
      iconBg: "bg-violet-50",
    },
    {
      title: t("totalOrders"),
      value: "1,284",
      change: "+8.2%",
      positive: true,
      icon: ShoppingCart,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: t("totalCustomers"),
      value: "8,549",
      change: "+18.4%",
      positive: true,
      icon: Users,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
    },
    {
      title: t("conversionRate"),
      value: "3.62%",
      change: "-0.4%",
      positive: false,
      icon: TrendingUp,
      iconColor: "text-orange-600",
      iconBg: "bg-orange-50",
    },
  ];

  const labels = [
    t("completed"),
    t("processing"),
    t("pending"),
    t("cancelled"),
  ];

  return (
    <>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <MetricCard
            key={stat.title}
            {...stat}
            description={t("vsLastMonth")}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6 xl:col-span-2">
          <SectionTitle
            title={t("revenueOverview")}
            subtitle={t("revenueSubtitle")}
            action={
              <button
                type="button"
                aria-label="More revenue options"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <MoreHorizontal size={20} />
              </button>
            }
          />

          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-3xl font-extrabold tracking-tight text-slate-900">
                {formatCurrency(
                  chart.reduce((sum, item) => sum + item.revenue, 0),
                  locale,
                )}
              </div>

              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <TrendingUp size={15} />
                +12.8%
                <span className="font-normal text-slate-400">
                  {t("comparedTo")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
              {rangeOptions.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setRange(option.value)}
                  className={`rounded-lg px-2.5 py-2 text-[10px] font-semibold transition sm:text-[11px] ${
                    range === option.value
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chart}
                margin={{
                  top: 12,
                  right: 8,
                  left: isArabic ? 8 : -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#f1f3f9"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  dy={10}
                />

                <YAxis
                  orientation={isArabic ? "right" : "left"}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  tickFormatter={(value: number) =>
                    value >= 1000 ? `${value / 1000}k` : `${value}`
                  }
                />

                <Tooltip
                  contentStyle={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 8px 30px rgba(15,23,42,0.08)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [
                    formatCurrency(Number(value), locale),
                    t("totalSales"),
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  activeDot={{
                    r: 5,
                    fill: "#6366f1",
                    stroke: "#fff",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 sm:p-6">
          <SectionTitle
            title={t("ordersOverview")}
            subtitle={t("ordersSubtitle")}
            action={
              <button
                type="button"
                aria-label="More order options"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
              >
                <MoreHorizontal size={20} />
              </button>
            }
          />

          <div className="relative mx-auto h-[210px] max-w-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={88}
                  paddingAngle={4}
                  stroke="none"
                  cornerRadius={5}
                >
                  {orderDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                1,284
              </span>
              <span className="mt-1 text-[11px] text-slate-400">
                {t("totalOrders")}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {orderDistribution.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs font-medium text-slate-500">
                    {labels[index]}
                  </span>
                </div>

                <span className="text-xs font-bold text-slate-800">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
