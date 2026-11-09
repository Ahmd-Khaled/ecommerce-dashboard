
import {
  CreditCard,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";

import type {
  ActivityItem,
  ChartItem,
  Order,
  Product,
  RangeKey,
} from "./types";

export const chartData: Record<RangeKey, ChartItem[]> = {
  "7d": [
    { label: "Mon", revenue: 4200, orders: 28 },
    { label: "Tue", revenue: 5800, orders: 39 },
    { label: "Wed", revenue: 4600, orders: 31 },
    { label: "Thu", revenue: 7200, orders: 48 },
    { label: "Fri", revenue: 6100, orders: 42 },
    { label: "Sat", revenue: 8900, orders: 61 },
    { label: "Sun", revenue: 7800, orders: 53 },
  ],
  "30d": [
    { label: "Week 1", revenue: 18500, orders: 125 },
    { label: "Week 2", revenue: 24300, orders: 167 },
    { label: "Week 3", revenue: 21600, orders: 149 },
    { label: "Week 4", revenue: 32400, orders: 218 },
  ],
  "90d": [
    { label: "Jan", revenue: 52000, orders: 352 },
    { label: "Feb", revenue: 68000, orders: 463 },
    { label: "Mar", revenue: 81000, orders: 547 },
  ],
  "12m": [
    { label: "Jan", revenue: 42000, orders: 285 },
    { label: "Feb", revenue: 51000, orders: 347 },
    { label: "Mar", revenue: 48000, orders: 328 },
    { label: "Apr", revenue: 63000, orders: 429 },
    { label: "May", revenue: 58000, orders: 395 },
    { label: "Jun", revenue: 74000, orders: 503 },
    { label: "Jul", revenue: 69000, orders: 469 },
    { label: "Aug", revenue: 85000, orders: 578 },
    { label: "Sep", revenue: 79000, orders: 537 },
    { label: "Oct", revenue: 96000, orders: 653 },
    { label: "Nov", revenue: 91000, orders: 619 },
    { label: "Dec", revenue: 112000, orders: 762 },
  ],
};

export const orders: Order[] = [
  {
    id: "#ORD-7841",
    customer: "Ahmed Mohamed",
    email: "ahmed@example.com",
    product: "Premium Wireless Headphones",
    date: "Nov 09, 2026",
    amount: 2450,
    status: "completed",
    initials: "AM",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: "#ORD-7840",
    customer: "Sarah Johnson",
    email: "sarah@example.com",
    product: "Smart Watch Pro",
    date: "Nov 09, 2026",
    amount: 3890,
    status: "processing",
    initials: "SJ",
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: "#ORD-7839",
    customer: "Omar Hassan",
    email: "omar@example.com",
    product: "Mechanical Keyboard",
    date: "Nov 08, 2026",
    amount: 1750,
    status: "pending",
    initials: "OH",
    color: "bg-amber-100 text-amber-700",
  },
  {
    id: "#ORD-7838",
    customer: "Mariam Ali",
    email: "mariam@example.com",
    product: "Wireless Mouse",
    date: "Nov 08, 2026",
    amount: 890,
    status: "completed",
    initials: "MA",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "#ORD-7837",
    customer: "Youssef Khaled",
    email: "youssef@example.com",
    product: "USB-C Monitor",
    date: "Nov 07, 2026",
    amount: 6250,
    status: "cancelled",
    initials: "YK",
    color: "bg-sky-100 text-sky-700",
  },
];

export const products: Product[] = [
  {
    id: 1,
    name: "Premium Headphones",
    category: "Electronics",
    sold: 248,
    revenue: 607600,
    stock: 85,
    color: "bg-violet-100",
    icon: "🎧",
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    category: "Wearables",
    sold: 186,
    revenue: 722540,
    stock: 12,
    color: "bg-sky-100",
    icon: "⌚",
  },
  {
    id: 3,
    name: "Mechanical Keyboard",
    category: "Accessories",
    sold: 154,
    revenue: 269500,
    stock: 42,
    color: "bg-amber-100",
    icon: "⌨️",
  },
  {
    id: 4,
    name: "Wireless Mouse",
    category: "Accessories",
    sold: 132,
    revenue: 117480,
    stock: 0,
    color: "bg-emerald-100",
    icon: "🖱️",
  },
];

export const orderDistribution = [
  { name: "Completed", value: 64, color: "#10b981" },
  { name: "Processing", value: 20, color: "#6366f1" },
  { name: "Pending", value: 11, color: "#f59e0b" },
  { name: "Cancelled", value: 5, color: "#f43f5e" },
];

export const activities: ActivityItem[] = [
  {
    title: "newOrder",
    description: "Order #ORD-7841 · EGP 2,450",
    time: "justNow",
    icon: ShoppingCart,
    color: "bg-violet-100 text-violet-600",
  },
  {
    title: "paymentReceived",
    description: "Payment for #ORD-7838",
    time: "minutesAgo",
    icon: CreditCard,
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "newCustomer",
    description: "New account · Sarah Johnson",
    time: "hoursAgo",
    icon: Users,
    color: "bg-sky-100 text-sky-600",
  },
  {
    title: "orderShipped",
    description: "Order #ORD-7835 is on its way",
    time: "hoursAgo",
    icon: Truck,
    color: "bg-amber-100 text-amber-600",
  },
];
