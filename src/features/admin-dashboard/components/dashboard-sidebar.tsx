"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  CreditCard,
  Users,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { useAdminAuth } from "@/features/admin-auth/hooks/use-admin-auth";
import { AdminRoleEnum } from "@/features/admin-management/types/admin.types";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
};

export function DashboardSidebar() {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const [collapsed, setCollapsed] = useState(false);

  const { admin } = useAdminAuth();

  const navigation: NavigationItem[] = [
    {
      label: isArabic ? "لوحة التحكم" : "Dashboard",
      href: `/${locale}`,
      icon: LayoutDashboard,
    },
    {
      label: isArabic ? "المنتجات" : "Products",
      href: `/${locale}/products`,
      icon: Package,
    },
    {
      label: isArabic ? "التصنيفات" : "Categories",
      href: `/${locale}/categories`,
      icon: Tags,
    },
    {
      label: isArabic ? "الطلبات" : "Orders",
      href: `/${locale}/orders`,
      icon: ShoppingCart,
    },
    {
      label: isArabic ? "المدفوعات" : "Payments",
      href: `/${locale}/payments`,
      icon: CreditCard,
    },
    {
      label: isArabic ? "العملاء" : "Customers",
      href: `/${locale}/customers`,
      icon: Users,
    },
    {
      label: isArabic ? "إدارة المسؤولين" : "Admin Management",
      href: `/${locale}/admins`,
      icon: ShieldCheck,
      superAdminOnly: true,
    },
  ];

  const visibleNavigation = navigation.filter(
    (item) => !item.superAdminOnly || admin?.role === AdminRoleEnum.SUPER_ADMIN,
  );

  return (
    <aside
      className={[
        "fixed inset-y-0 z-40 flex flex-col border-border bg-card",
        "transition-[width] duration-200",
        isArabic ? "right-0 border-l" : "left-0 border-r",
        collapsed ? "w-[76px]" : "w-64",
      ].join(" ")}
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Package className="size-5" />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Commerce</p>
            <p className="truncate text-xs text-muted-foreground">
              {isArabic ? "لوحة الإدارة" : "Admin Dashboard"}
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {!collapsed && (
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {isArabic ? "القائمة الرئيسية" : "Main Menu"}
          </p>
        )}

        {visibleNavigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-2.5",
                "text-sm font-medium text-muted-foreground",
                "transition-colors hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-[18px] shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={
            collapsed
              ? isArabic
                ? "توسيع القائمة"
                : "Expand sidebar"
              : isArabic
                ? "تصغير القائمة"
                : "Collapse sidebar"
          }
        >
          {collapsed ? (
            isArabic ? (
              <ChevronLeft className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )
          ) : (
            <>
              {isArabic ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}

              <span>{isArabic ? "تصغير القائمة" : "Collapse sidebar"}</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
