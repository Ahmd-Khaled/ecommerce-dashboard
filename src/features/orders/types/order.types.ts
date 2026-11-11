export type OrderStatus =
  | "placed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderPaymentStatus =
  | "unpaid"
  | "pending"
  | "paid"
  | "expired";

export type OrderStatusHistoryItem = {
  status: OrderStatus;
  actor: string;
  at: string;
  reason?: string;
};

export type OrderItem = {
  product: string;
  name?: string | null;
  sku?: string | null;
  quantity: number;
  unitPriceMinor?: number;
  lineTotalMinor?: number;
  unitPrice?: number;
};

export type OrderShippingAddress = {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  building?: string;
  apartment?: string;
};

export type Order = {
  _id: string;
  user: string;
  schemaVersion: 1 | 2;
  legacy?: boolean;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  currency: string | null;
  currencyExponent?: number;
  items: OrderItem[];

  subtotalMinor?: number;
  shippingMinor?: number;
  discountMinor?: number;
  taxMinor?: number;
  grandTotalMinor?: number;

  // Legacy order amount, expressed in major currency units.
  total?: number;

  shippingAddress?: OrderShippingAddress | null;
  statusHistory?: OrderStatusHistoryItem[];

  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  stockRestoredAt?: string;

  createdAt: string;
  updatedAt: string;
};

export type OrderPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type OrderListResult = {
  orders: Order[];
  pagination: OrderPagination;
};

export type OrderFilters = {
  page: number;
  limit: number;
  status?: OrderStatus;
  user?: string;
  from?: string;
  to?: string;
};

export type UpdateOrderStatusPayload = {
  expectedStatus: OrderStatus;
  status: OrderStatus;
  reason?: string;
};

/**
 * Returns only transitions supported by the backend.
 */
export function getAvailableOrderTransitions(
  order: Order,
): OrderStatus[] {
  if (order.schemaVersion !== 2 || order.legacy) {
    return [];
  }

  const canCancel =
    order.paymentStatus === "unpaid" ||
    order.paymentStatus === "expired";

  const isPaid = order.paymentStatus === "paid";

  switch (order.status) {
    case "placed":
      return [
        ...(isPaid ? ["processing" as const] : []),
        ...(canCancel ? ["cancelled" as const] : []),
      ];

    case "processing":
      return [
        ...(isPaid ? ["shipped" as const] : []),
        ...(canCancel ? ["cancelled" as const] : []),
      ];

    case "shipped":
      return isPaid ? ["delivered"] : [];

    default:
      return [];
  }
}