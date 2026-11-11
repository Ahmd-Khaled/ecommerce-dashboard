
export type PaymentStatus = "unpaid" | "pending" | "paid" | "expired";

export type OrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentOrderItem = {
  product: string;
  name: string | null;
  sku: string | null;
  quantity: number;
  unitPriceMinor?: number;
  lineTotalMinor?: number;
  unitPrice?: number;
};

export type PaymentOrder = {
  _id: string;
  user: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  schemaVersion: 1 | 2;
  legacy?: boolean;
  currency: string | null;
  currencyExponent?: number | null;
  total?: number;
  subtotalMinor?: number;
  shippingMinor?: number;
  discountMinor?: number;
  taxMinor?: number;
  grandTotalMinor?: number;
  items: PaymentOrderItem[];
  shippingAddress?: {
    fullName: string;
    phone: string;
    country: string;
    city: string;
    street: string;
    building?: string;
    apartment?: string;
  } | null;
  statusHistory?: Array<{
    status: OrderStatus;
    actor: string;
    at: string;
    reason?: string;
  }>;
};

export type PaymentOrdersParams = {
  page: number;
  limit: number;
  from?: string;
  to?: string;
};

export type PaymentOrdersPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaymentOrdersResponse = {
  orders: PaymentOrder[];
  pagination: PaymentOrdersPagination;
};
