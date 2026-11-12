"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  CalendarDays,
  CreditCard,
  ExternalLink,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Users,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useDashboardOverview,
  useDashboardSales,
  useDashboardTopProducts,
} from "@/features/admin-dashboard/hooks/use-dashboard";
import type { DashboardOrderStatus } from "@/features/admin-dashboard/types/dashboard.types";
import {
  formatCount,
  formatDate,
  formatMajorCurrency,
  formatMinorCurrency,
} from "@/features/admin-dashboard/utils/dashboard-formatters";

const STATUS_COLORS: Record<DashboardOrderStatus, string> = {
  placed: "#64748b",
  processing: "#d97706",
  shipped: "#2563eb",
  delivered: "#16a34a",
  cancelled: "#dc2626",
};

type RangeKey = "7d" | "30d" | "90d" | "12m";

function getPeriod(range: RangeKey) {
  const to = new Date();
  const from = new Date(to);
  if (range === "7d") from.setDate(from.getDate() - 6);
  if (range === "30d") from.setDate(from.getDate() - 29);
  if (range === "90d") from.setDate(from.getDate() - 89);
  if (range === "12m") {
    from.setMonth(from.getMonth() - 11);
    from.setDate(1);
  }
  from.setHours(0, 0, 0, 0);
  to.setHours(23, 59, 59, 999);
  return { from: from.toISOString(), to: to.toISOString() };
}

function StatusBadge({
  status,
  isArabic,
}: {
  status: DashboardOrderStatus;
  isArabic: boolean;
}) {
  const labels: Record<DashboardOrderStatus, { en: string; ar: string }> = {
    placed: { en: "Placed", ar: "تم الاستلام" },
    processing: { en: "Processing", ar: "قيد التجهيز" },
    shipped: { en: "Shipped", ar: "تم الشحن" },
    delivered: { en: "Delivered", ar: "تم التسليم" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
  };
  const variants: Record<
    DashboardOrderStatus,
    "secondary" | "default" | "destructive" | "outline"
  > = {
    placed: "secondary",
    processing: "outline",
    shipped: "default",
    delivered: "secondary",
    cancelled: "destructive",
  };
  return (
    <Badge variant={variants[status]}>
      {labels[status][isArabic ? "ar" : "en"]}
    </Badge>
  );
}

function SectionHeading({
  title,
  description,
  href,
  action,
}: {
  title: string;
  description?: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link href={href}>
            {action}
            <ExternalLink className="ms-2 size-3.5" />
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [range, setRange] = useState<RangeKey>("30d");
  const [groupBy, setGroupBy] = useState<"day" | "month">("day");
  const period = useMemo(() => getPeriod(range), [range]);
  const overview = useDashboardOverview(period);
  const sales = useDashboardSales({ ...period, groupBy });
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const currencies =
    overview.data?.paidSales.map((item) => item.currency) ?? [];
  const currency =
    selectedCurrency && currencies.includes(selectedCurrency)
      ? selectedCurrency
      : (overview.data?.paidSales[0]?.currency ??
        overview.data?.catalogCurrency.currency ??
        currencies[0] ??
        "EGP");
  const topProducts = useDashboardTopProducts(
    { ...period, currency },
    Boolean(overview.data),
  );

  const salesRows = (sales.data?.series ?? []).filter(
    (item) => item.currency === currency,
  );
  const chartData = salesRows.map((item) => ({
    period: item.period,
    sales: item.paidSalesMinor / 10 ** item.currencyExponent,
    orders: item.paidOrders,
  }));
  const orderStatuses = overview.data?.periodOrders.byStatus;
  const statusData = orderStatuses
    ? (Object.entries(orderStatuses) as [DashboardOrderStatus, number][])
        .filter(([, count]) => count > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const labels = {
    title: isArabic ? "لوحة التحكم" : "Dashboard overview",
    subtitle: isArabic
      ? "ملخص مباشر لأداء المتجر والطلبات والمخزون."
      : "A live overview of store performance, orders, and inventory.",
    refresh: isArabic ? "تحديث" : "Refresh",
    orders: isArabic ? "طلبات الفترة" : "Orders in period",
    customers: isArabic ? "إجمالي العملاء" : "Total customers",
    products: isArabic ? "إجمالي المنتجات" : "Total products",
    categories: isArabic ? "التصنيفات" : "Categories",
    paidSales: isArabic ? "المبيعات المدفوعة" : "Paid sales",
    paidSalesHint: isArabic
      ? "حسب عملة الدفع، دون دمج العملات."
      : "Grouped by payment currency; currencies are not combined.",
    salesOverview: isArabic ? "تحليل المبيعات" : "Sales overview",
    salesDescription: isArabic
      ? "المبيعات والطلبات المدفوعة حسب تاريخ الدفع."
      : "Paid sales and order count grouped by payment date.",
    ordersOverview: isArabic ? "حالة الطلبات" : "Orders by status",
    ordersDescription: isArabic
      ? "توزيع الطلبات المنشأة خلال الفترة المحددة."
      : "Orders created during the selected period.",
    recentOrders: isArabic ? "أحدث الطلبات" : "Recent orders",
    date: isArabic ? "التاريخ" : "Date",
    amount: isArabic ? "المبلغ" : "Amount",
    status: isArabic ? "الحالة" : "Status",
    recentDescription: isArabic
      ? "آخر الطلبات التي تم إنشاؤها خلال الفترة."
      : "Latest orders created in this period.",
    topProducts: isArabic ? "المنتجات الأكثر مبيعاً" : "Top-selling products",
    topDescription: isArabic
      ? "حسب الكمية المباعة في الطلبات المدفوعة."
      : "Ranked by units sold in paid orders.",
    inventory: isArabic ? "تنبيهات المخزون" : "Inventory alerts",
    inventoryDescription: isArabic
      ? "المنتجات التي وصلت إلى حد المخزون المنخفض."
      : "Products at or below the low-stock threshold.",
    latestProducts: isArabic ? "أحدث المنتجات" : "Latest products",
    latestDescription: isArabic
      ? "آخر المنتجات المضافة إلى الكتالوج."
      : "Recently added catalog items.",
    viewAll: isArabic ? "عرض الكل" : "View all",
    noData: isArabic
      ? "لا توجد بيانات لهذه الفترة."
      : "No data for this period.",
    noLowStock: isArabic
      ? "لا توجد منتجات منخفضة المخزون."
      : "No low-stock products.",
    noProducts: isArabic
      ? "لا توجد منتجات مضافة بعد."
      : "No products have been added yet.",
    noOrders: isArabic
      ? "لا توجد طلبات في هذه الفترة."
      : "No orders in this period.",
    stock: isArabic ? "المخزون" : "Stock",
    sold: isArabic ? "الوحدات المباعة" : "Units sold",
    orderCount: isArabic ? "الطلبات" : "Orders",
    loading: isArabic ? "جارٍ تحميل البيانات..." : "Loading dashboard data...",
    error: isArabic
      ? "تعذر تحميل بيانات لوحة التحكم."
      : "Unable to load dashboard data.",
    retry: isArabic ? "إعادة المحاولة" : "Retry",
    currency: isArabic ? "العملة" : "Currency",
    range: isArabic ? "الفترة" : "Period",
    daily: isArabic ? "يومي" : "Daily",
    monthly: isArabic ? "شهري" : "Monthly",
    last7: isArabic ? "آخر 7 أيام" : "Last 7 days",
    last30: isArabic ? "آخر 30 يوماً" : "Last 30 days",
    last90: isArabic ? "آخر 90 يوماً" : "Last 90 days",
    last12: isArabic ? "آخر 12 شهراً" : "Last 12 months",
    active: isArabic ? "نشط" : "Active",
    inactive: isArabic ? "غير نشط" : "Inactive",
    customerId: isArabic ? "معرّف العميل" : "Customer ID",
    reportingNote: isArabic
      ? "تنبيه: لا يسجل النظام عمليات الاسترداد، لذلك تمثل هذه الأرقام المبيعات المدفوعة وليست صافي الإيرادات المحاسبية."
      : "Reporting note: refunds are not tracked, so these figures represent paid sales, not net accounting revenue.",
    lineSalesNote: isArabic
      ? "قيمة المنتجات قبل خصومات الطلب والضرائب والشحن، وليست توزيعاً لإجمالي المدفوعات."
      : "Stored item totals before order-level discounts, tax, and shipping; not allocated payment revenue.",
  };

  const hasError = overview.isError || sales.isError;
  const refresh = () => {
    void overview.refetch();
    void sales.refetch();
    void topProducts.refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{labels.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {labels.subtitle}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={refresh}
          disabled={overview.isFetching || sales.isFetching}
        >
          <RefreshCw
            className={`me-2 size-4 ${overview.isFetching || sales.isFetching ? "animate-spin" : ""}`}
          />
          {labels.refresh}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <CalendarDays className="size-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{labels.range}:</span>
        {(["7d", "30d", "90d", "12m"] as RangeKey[]).map((value) => {
          const text =
            value === "7d"
              ? labels.last7
              : value === "30d"
                ? labels.last30
                : value === "90d"
                  ? labels.last90
                  : labels.last12;
          return (
            <Button
              key={value}
              size="sm"
              variant={range === value ? "default" : "outline"}
              onClick={() => setRange(value)}
            >
              {text}
            </Button>
          );
        })}
      </div>

      {hasError ? (
        <Card className="border-destructive/40">
          <CardContent className="flex flex-col items-start gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-destructive">{labels.error}</p>
            <Button size="sm" variant="outline" onClick={refresh}>
              {labels.retry}
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {overview.isPending ? (
        <p className="text-sm text-muted-foreground">{labels.loading}</p>
      ) : null}

      {overview.data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: labels.orders,
                value: overview.data.periodOrders.total,
                icon: ShoppingCart,
                note: labels.range,
              },
              {
                title: labels.customers,
                value: overview.data.totals.customers,
                icon: Users,
                note: isArabic ? "العملاء المسجلون" : "Registered customers",
              },
              {
                title: labels.products,
                value: overview.data.totals.products.total,
                icon: Package,
                note: `${formatCount(overview.data.totals.products.active, locale)} ${labels.active.toLowerCase()}`,
              },
              {
                title: labels.categories,
                value: overview.data.totals.categories,
                icon: Boxes,
                note: isArabic ? "كل التصنيفات" : "All categories",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="flex items-start justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-2xl font-bold tabular-nums">
                        {formatCount(stat.value, locale)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {stat.note}
                      </p>
                    </div>
                    <div className="rounded-xl bg-primary/10 p-3 text-primary">
                      <Icon className="size-5" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="size-4 text-primary" />
                {labels.paidSales}
              </CardTitle>
              <CardDescription>{labels.paidSalesHint}</CardDescription>
            </CardHeader>
            <CardContent>
              {overview.data.paidSales.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {overview.data.paidSales.map((item) => (
                    <div
                      key={`${item.currency}-${item.currencyExponent}`}
                      className="rounded-xl bg-muted/50 p-4"
                    >
                      <p className="text-xs font-medium text-muted-foreground">
                        {item.currency} · {formatCount(item.paidOrders, locale)}{" "}
                        {isArabic ? "طلب مدفوع" : "paid orders"}
                      </p>
                      <p className="mt-2 text-xl font-bold tabular-nums">
                        {formatMinorCurrency(
                          item.paidSalesMinor,
                          item.currency,
                          item.currencyExponent,
                          locale,
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{labels.noData}</p>
              )}
              <p className="mt-4 text-xs leading-5 text-muted-foreground">
                {labels.reportingNote}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
            <Card className="min-w-0">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{labels.salesOverview}</CardTitle>
                  <CardDescription>{labels.salesDescription}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    aria-label={labels.currency}
                    value={currency}
                    onChange={(event) =>
                      setSelectedCurrency(event.target.value)
                    }
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    {[
                      ...new Set([
                        overview.data.catalogCurrency.currency,
                        ...currencies,
                      ]),
                    ].map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label={labels.range}
                    value={groupBy}
                    onChange={(event) =>
                      setGroupBy(event.target.value as "day" | "month")
                    }
                    className="h-9 rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="day">{labels.daily}</option>
                    <option value="month">{labels.monthly}</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] w-full">
                  {sales.isPending ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      {labels.loading}
                    </div>
                  ) : chartData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 8, right: 12, left: 4, bottom: 4 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="period"
                          tickLine={false}
                          axisLine={false}
                          minTickGap={24}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          width={68}
                          tick={{ fontSize: 11 }}
                          tickFormatter={(value: number) =>
                            new Intl.NumberFormat(locale, {
                              notation: "compact",
                            }).format(value)
                          }
                        />
                        <Tooltip
                          formatter={(value) =>
                            formatMajorCurrency(
                              Number(value ?? 0),
                              currency,
                              locale,
                            )
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          name={labels.paidSales}
                          stroke="var(--color-primary)"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      {labels.noData}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="min-w-0">
              <CardHeader>
                <CardTitle>{labels.ordersOverview}</CardTitle>
                <CardDescription>{labels.ordersDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  {statusData.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={82}
                          paddingAngle={3}
                        >
                          {statusData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={STATUS_COLORS[entry.name]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) =>
                            formatCount(Number(value ?? 0), locale)
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      {labels.noData}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {statusData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span
                          className="size-2 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[item.name] }}
                        />
                        {isArabic
                          ? (
                              {
                                placed: "تم الاستلام",
                                processing: "قيد التجهيز",
                                shipped: "تم الشحن",
                                delivered: "تم التسليم",
                                cancelled: "ملغي",
                              } as const
                            )[item.name]
                          : item.name}
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatCount(item.value, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <SectionHeading
                title={labels.recentOrders}
                description={labels.recentDescription}
                href={`/${locale}/orders`}
                action={labels.viewAll}
              />
            </CardHeader>
            <CardContent>
              {overview.data.recentOrders.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-sm">
                    <thead>
                      <tr className="border-b text-start text-xs text-muted-foreground">
                        <th className="pb-3 font-medium">
                          {isArabic ? "رقم الطلب" : "Order"}
                        </th>
                        <th className="pb-3 font-medium">
                          {labels.customerId}
                        </th>
                        <th className="pb-3 font-medium">{labels.date}</th>
                        <th className="pb-3 font-medium">{labels.amount}</th>
                        <th className="pb-3 font-medium">{labels.status}</th>
                        <th className="pb-3 font-medium">
                          {isArabic ? "الدفع" : "Payment"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.data.recentOrders.map((order) => (
                        <tr key={order._id} className="border-b last:border-0">
                          <td className="py-3 font-medium">
                            #{order._id.slice(-8).toUpperCase()}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {order.user.slice(-8)}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {formatDate(order.createdAt, locale)}
                          </td>
                          <td className="py-3 font-medium">
                            {order.currency &&
                            order.grandTotalMinor !== undefined
                              ? formatMinorCurrency(
                                  order.grandTotalMinor,
                                  order.currency,
                                  order.currencyExponent ?? 2,
                                  locale,
                                )
                              : order.total !== undefined
                                ? new Intl.NumberFormat(
                                    locale === "ar" ? "ar-EG" : "en-EG",
                                    { maximumFractionDigits: 2 },
                                  ).format(order.total)
                                : "—"}
                          </td>

                          <td className="py-3">
                            <StatusBadge
                              status={order.status}
                              isArabic={isArabic}
                            />
                          </td>
                          <td className="py-3">
                            <Badge
                              variant={
                                order.paymentStatus === "paid"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {order.paymentStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {labels.noOrders}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <SectionHeading
                  title={labels.topProducts}
                  description={labels.topDescription}
                  href={`/${locale}/products`}
                  action={labels.viewAll}
                />
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShoppingBag className="size-3.5" />
                  {labels.currency}:{" "}
                  <span className="font-semibold text-foreground">
                    {currency}
                  </span>
                </div>
                {topProducts.isPending ? (
                  <p className="py-5 text-sm text-muted-foreground">
                    {labels.loading}
                  </p>
                ) : topProducts.data?.products.length ? (
                  <div className="space-y-4">
                    {topProducts.data.products.map((product, index) => (
                      <div
                        key={`${product.productId}-${product.currency}`}
                        className="flex items-center gap-3"
                      >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.sku} ·{" "}
                            {formatCount(product.orderCount, locale)}{" "}
                            {labels.orderCount}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className="text-sm font-semibold tabular-nums">
                            {formatCount(product.unitsSold, locale)}{" "}
                            {labels.sold}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatMinorCurrency(
                              product.lineSalesMinor,
                              product.currency,
                              product.currencyExponent,
                              locale,
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-5 text-sm text-muted-foreground">
                    {labels.noData}
                  </p>
                )}
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  {labels.lineSalesNote}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <SectionHeading
                  title={labels.inventory}
                  description={labels.inventoryDescription}
                  href={`/${locale}/products`}
                  action={labels.viewAll}
                />
              </CardHeader>
              <CardContent>
                {overview.data.lowStockProducts.length ? (
                  <div className="space-y-4">
                    {overview.data.lowStockProducts.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-3"
                      >
                        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                          <AlertTriangle className="size-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.sku}
                            {!product.isActive ? ` · ${labels.inactive}` : ""}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {formatCount(product.stock, locale)} {labels.stock}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-5 text-sm text-muted-foreground">
                    <ArrowUpRight className="size-4" />
                    {labels.noLowStock}
                  </div>
                )}
                <p className="mt-4 text-xs text-muted-foreground">
                  {isArabic ? "حد التنبيه:" : "Alert threshold:"}{" "}
                  {formatCount(overview.data.lowStockThreshold, locale)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <SectionHeading
                title={labels.latestProducts}
                description={labels.latestDescription}
                href={`/${locale}/products`}
                action={labels.viewAll}
              />
            </CardHeader>
            <CardContent>
              {overview.data.latestProducts.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                  {overview.data.latestProducts.map((product) => (
                    <div
                      key={product._id}
                      className="min-w-0 rounded-xl border p-3"
                    >
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={320}
                          height={240}
                          unoptimized
                          className="mb-3 aspect-[4/3] w-full rounded-lg bg-muted object-cover"
                        />
                      ) : (
                        <div className="mb-3 flex aspect-[4/3] items-center justify-center rounded-lg bg-muted">
                          <Package className="size-8 text-muted-foreground" />
                        </div>
                      )}
                      <p className="truncate text-sm font-medium">
                        {product.name}
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        {formatMajorCurrency(
                          product.price,
                          overview.data.catalogCurrency.currency,
                          locale,
                          overview.data.catalogCurrency.currencyExponent,
                        )}
                      </p>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatCount(product.stock, locale)} {labels.stock}
                        </span>
                        <Badge
                          variant={product.isActive ? "secondary" : "outline"}
                        >
                          {product.isActive ? labels.active : labels.inactive}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-5 text-sm text-muted-foreground">
                  {labels.noProducts}
                </p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
