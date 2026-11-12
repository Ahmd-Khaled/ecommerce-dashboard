"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import type { DashboardFilters } from "../types/dashboard.types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: (from: string, to: string) => ["dashboard", "overview", from, to] as const,
  sales: (filters: DashboardFilters) => ["dashboard", "sales", filters] as const,
  topProducts: (from: string, to: string, currency?: string) =>
    ["dashboard", "top-products", from, to, currency] as const,
};

export function useDashboardOverview(period: Pick<DashboardFilters, "from" | "to">) {
  return useQuery({
    queryKey: dashboardKeys.overview(period.from, period.to),
    queryFn: () => dashboardApi.overview(period),
  });
}

export function useDashboardSales(filters: DashboardFilters) {
  return useQuery({
    queryKey: dashboardKeys.sales(filters),
    queryFn: () => dashboardApi.sales(filters),
  });
}

export function useDashboardTopProducts(
  period: Pick<DashboardFilters, "from" | "to"> & { currency?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: dashboardKeys.topProducts(period.from, period.to, period.currency),
    queryFn: () => dashboardApi.topProducts(period),
    enabled,
  });
}
