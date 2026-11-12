export type DashboardPeriod = { from: string; to: string };
export type DashboardProductSummary = {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
};
export type DashboardOrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type DashboardMoney = {
  currency: string;
  currencyExponent: number;
  paidOrders: number;
  paidSalesMinor: number;
  averageOrderValueMinor: number;
  period?: string;
};
export type DashboardOverview = {
  totals: {
    customers: number;
    categories: number;
    products: DashboardProductSummary;
  };
  periodOrders: {
    total: number;
    byStatus: Record<DashboardOrderStatus, number>;
  };
  recentOrders: DashboardOrder[];
  latestProducts: DashboardLatestProduct[];
  lowStockProducts: DashboardLowStockProduct[];
  period: DashboardPeriod;
  paidSales: DashboardMoney[];
  lowStockThreshold: number;
  catalogCurrency: { currency: string; currencyExponent: number };
  reporting: {
    basis: string;
    timezone: string;
    refundsTracked: boolean;
    limitation: string;
  };
};
export type DashboardOrder = {
  _id: string;
  user: string;
  status: DashboardOrderStatus;
  paymentStatus: "unpaid" | "pending" | "paid" | "expired";
  schemaVersion: 1 | 2;
  currency: string | null;
  currencyExponent?: number;
  grandTotalMinor?: number;
  total?: number;
  createdAt: string;
};
export type DashboardLatestProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  images: string[];
  createdAt: string;
};
export type DashboardLowStockProduct = {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  isActive: boolean;
};
export type DashboardSalesPoint = DashboardMoney & { period: string };
export type DashboardSalesResponse = {
  period: DashboardPeriod;
  groupBy: "day" | "month";
  series: DashboardSalesPoint[];
  reporting: DashboardOverview["reporting"];
};
export type DashboardTopProduct = {
  productId: string;
  currency: string;
  currencyExponent: number;
  unitsSold: number;
  orderCount: number;
  name: string;
  sku: string;
  lineSalesMinor: number;
};
export type DashboardTopProductsResponse = {
  products: DashboardTopProduct[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  period: DashboardPeriod;
  reporting: DashboardOverview["reporting"];
  lineSalesBasis: string;
};
export type DashboardFilters = DashboardPeriod & { groupBy: "day" | "month" };
