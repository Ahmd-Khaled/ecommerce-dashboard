import { api } from "@/lib/api/axios";
import type {
  DashboardFilters,
  DashboardOverview,
  DashboardSalesResponse,
  DashboardTopProductsResponse,
} from "../types/dashboard.types";

type ApiResponse<T> = { success: boolean; message: string; data: T };

export const dashboardApi = {
  async overview(period: Pick<DashboardFilters, "from" | "to">) {
    const { data } = await api.get<ApiResponse<DashboardOverview>>(
      "/dashboard/overview",
      { params: period },
    );
    return data.data;
  },
  async sales(filters: DashboardFilters) {
    const { data } = await api.get<ApiResponse<DashboardSalesResponse>>(
      "/dashboard/sales",
      { params: filters },
    );
    return data.data;
  },
  async topProducts(
    period: Pick<DashboardFilters, "from" | "to"> & { currency?: string },
  ) {
    const { data } = await api.get<ApiResponse<DashboardTopProductsResponse>>(
      "/dashboard/top-products",
      { params: { ...period, page: 1, limit: 5 } },
    );
    return data.data;
  },
};
