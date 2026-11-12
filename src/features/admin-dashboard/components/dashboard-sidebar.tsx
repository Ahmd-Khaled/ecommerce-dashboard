"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  CreditCard,
  Users,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  ImageIcon,
  PanelsTopLeft,
} from "lucide-react";

import { useAdminAuth } from "@/features/admin-auth/hooks/use-admin-auth";
import { AdminRoleEnum } from "@/features/admin-management/types/admin.types";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  superAdminOnly?: boolean;
};

type DashboardSidebarProps = {
  className?: string;
  onNavigate?: () => void;
  onCollapsedChange?: (collapsed: boolean) => void;
};

export function DashboardSidebar({ className, onNavigate, onCollapsedChange }: DashboardSidebarProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const pathname = usePathname();
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
      label: isArabic ? "البنرات" : "Banners",
      href: `/${locale}/banners`,
      icon: ImageIcon,
    },
    {
      label: isArabic ? "معاينة الصفحة الرئيسية" : "Homepage Preview",
      href: `/${locale}/homepage`,
      icon: PanelsTopLeft,
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
        className ?? "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => setCollapsed((current) => {
          const next = !current;
          onCollapsedChange?.(next);
          return next;
        })}
        className={`absolute top-4 z-50 hidden size-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground lg:flex ${isArabic ? "-left-4" : "-right-4"}`}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-4" />
        ) : (
          <PanelLeftClose className="size-4" />
        )}
      </button>
      {/* Brand */}
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

      {/* Navigation */}
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
              onClick={onNavigate}
              aria-current={(item.href.endsWith(`/${locale}`) ? pathname === "/" : pathname === item.href.slice(locale.length + 1)) ? "page" : undefined}
              className={[
                "group flex items-center gap-3 rounded-xl px-3 py-2.5",
                "text-sm font-medium transition-colors",
                (item.href.endsWith(`/${locale}`) ? pathname === "/" : pathname === item.href.slice(locale.length + 1))
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="size-[18px] shrink-0" />

              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
