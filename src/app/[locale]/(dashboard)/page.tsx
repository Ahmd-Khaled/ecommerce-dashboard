"use client";

import { useLocale } from "next-intl";
import {
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";

const stats = [
  {
    key: "revenue",
    title: { en: "Total Revenue", ar: "إجمالي الإيرادات" },
    value: "$24,560",
    change: "+12.5%",
    positive: true,
    icon: CreditCard,
  },
  {
    key: "orders",
    title: { en: "Total Orders", ar: "إجمالي الطلبات" },
    value: "1,248",
    change: "+8.2%",
    positive: true,
    icon: ShoppingCart,
  },
  {
    key: "products",
    title: { en: "Total Products", ar: "إجمالي المنتجات" },
    value: "356",
    change: "+4.3%",
    positive: true,
    icon: Package,
  },
  {
    key: "customers",
    title: { en: "Total Customers", ar: "إجمالي العملاء" },
    value: "2,845",
    change: "-2.4%",
    positive: false,
    icon: Users,
  },
];

export default function DashboardPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isArabic ? "لوحة التحكم" : "Dashboard"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {isArabic
            ? "نظرة عامة على أداء متجرك."
            : "Here is an overview of your store performance."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.key}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>

                <div
                  className={[
                    "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold",
                    stat.positive
                      ? "bg-emerald-500/10 text-emerald-600"
                      : "bg-red-500/10 text-red-600",
                  ].join(" ")}
                >
                  {stat.positive ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}

                  {stat.change}
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                {stat.title[isArabic ? "ar" : "en"]}
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-base font-semibold">
          {isArabic ? "مرحبًا بك في لوحة الإدارة" : "Welcome to your dashboard"}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {isArabic
            ? "سيتم عرض تقارير المبيعات والطلبات والمنتجات هنا بعد ربط لوحة التحكم بواجهات API."
            : "Sales, orders, and product reports will appear here once the dashboard is connected to your API."}
        </p>
      </section>
    </div>
  );
}