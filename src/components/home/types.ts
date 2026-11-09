
import type { LucideIcon } from "lucide-react";

export type RangeKey = "7d" | "30d" | "90d" | "12m";

export type OrderStatus =
  | "completed"
  | "processing"
  | "pending"
  | "cancelled";

export interface Order {
  id: string;
  customer: string;
  email: string;
  product: string;
  date: string;
  amount: number;
  status: OrderStatus;
  initials: string;
  color: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  sold: number;
  revenue: number;
  stock: number;
  color: string;
  icon: string;
}

export interface ChartItem {
  label: string;
  revenue: number;
  orders: number;
}

export interface ActivityItem {
  title: "newOrder" | "paymentReceived" | "newCustomer" | "orderShipped";
  description: string;
  time: "justNow" | "minutesAgo" | "hoursAgo";
  icon: LucideIcon;
  color: string;
}

export interface Metric {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}
