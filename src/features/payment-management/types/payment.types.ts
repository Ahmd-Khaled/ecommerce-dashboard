export type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "pending" | "paid" | "expired";

export type PaymentOrder = {
  _id: string;
  user: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  schemaVersion: 1 | 2;
  legacy?: boolean;
  currency: string | null;
  currencyExponent?: number;
  total?: number;
  grandTotalMinor?: number;
  createdAt: string;
  updatedAt: string;
};

export type PaymentOrderDetails = PaymentOrder & {
  items: Array<{
    product: string;
    name: string | null;
    sku: string | null;
    quantity: number;
    unitPriceMinor?: number;
    lineTotalMinor?: number;
    unitPrice?: number;
  }>;
  subtotalMinor?: number;
  shippingMinor?: number;
  discountMinor?: number;
  taxMinor?: number;
  shippingAddress?: {
    fullName: string; phone: string; country: string; city: string; street: string;
    building?: string; apartment?: string;
  } | null;
  statusHistory?: Array<{ status: OrderStatus; actor: string; at: string; reason?: string }>;
  cancelledAt?: string | null;
  cancellationReason?: string;
};

export type PaymentListParams = {
  page: number;
  limit: number;
  status?: OrderStatus;
  from?: string;
  to?: string;
};

export type PaymentListResult = {
  orders: PaymentOrder[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};
