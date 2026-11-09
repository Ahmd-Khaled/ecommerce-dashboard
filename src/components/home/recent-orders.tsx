"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  Filter,
  MoreHorizontal,
  Search,
} from "lucide-react";

import { orders } from "./data";
import type { OrderStatus } from "./types";
import { SectionTitle } from "./section-title";
import { formatCurrency } from "@/utils/formatCurrency";

interface RecentOrdersProps {
  locale: string;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations("Home");

  const styles: Record<OrderStatus, string> = {
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    processing: "bg-indigo-50 text-indigo-700 ring-indigo-600/15",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/15",
    cancelled: "bg-rose-50 text-rose-700 ring-rose-600/15",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {t(status)}
    </span>
  );
}

export function RecentOrders({ locale }: RecentOrdersProps) {
  const t = useTranslations("Home");
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return orders;

    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.customer.toLowerCase().includes(query) ||
        order.product.toLowerCase().includes(query),
    );
  }, [search]);

  const headings = [
    t("customer"),
    t("product"),
    t("date"),
    t("amount"),
    t("status"),
    t("action"),
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/30">
      <div className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <SectionTitle
          title={t("recentOrders")}
          subtitle={t("recentOrdersSubtitle")}
        />

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 sm:w-64 sm:flex-none">
            <Search size={15} className="shrink-0 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("searchOrders")}
              className="w-full min-w-0 bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Filter size={15} />
            <span className="hidden sm:inline">{t("all")}</span>
            <ChevronDown size={13} />
          </button>

          <Link
            href={`/${locale}/orders`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
          >
            {t("viewAll")}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-start">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/70">
              {headings.map((heading) => (
                <th
                  key={heading}
                  className="px-6 py-3.5 text-start text-[10px] font-bold uppercase tracking-wider text-slate-400"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map((order) => (
              <tr
                key={order.id}
                className="group transition hover:bg-slate-50/70"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${order.color}`}
                    >
                      {order.initials}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {order.customer}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {order.id}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-slate-600">
                    {order.product}
                  </span>
                </td>

                <td className="px-6 py-4 text-xs text-slate-500">
                  {order.date}
                </td>

                <td className="px-6 py-4 text-xs font-bold text-slate-800">
                  {formatCurrency(order.amount, locale)}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-6 py-4">
                  <Link
                    href={`/${locale}/orders/${encodeURIComponent(order.id)}`}
                    aria-label={`View ${order.id}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <Eye size={16} />
                  </Link>
                </td>
              </tr>
            ))}

            {filteredOrders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-slate-400"
                >
                  {t("noOrders")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
        <p className="text-[11px] text-slate-400">
          {t("showingOrders", {
            count: filteredOrders.length,
            total: orders.length,
          })}
        </p>

        <Link
          href={`/${locale}/orders`}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
        >
          {t("viewAll")} →
        </Link>
      </div>
    </section>
  );
}
