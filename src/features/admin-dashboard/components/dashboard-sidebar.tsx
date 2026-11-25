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
  Star,
  Activity,
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
  const adminName = [admin?.firstName, admin?.lastName].filter(Boolean).join(" ") || admin?.email || (isArabic ? "\u0627\u0644\u0645\u0633\u0624\u0648\u0644" : "Administrator");
  const nameInitials = adminName.split(/[\s@._-]+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase();
  const adminRole = admin?.role === AdminRoleEnum.SUPER_ADMIN ? (isArabic ? "\u0645\u062f\u064a\u0631 \u0627\u0644\u0646\u0638\u0627\u0645" : "Super Admin") : (isArabic ? "\u0645\u062f\u064a\u0631" : "Admin");
  const roleInitials = admin?.role === AdminRoleEnum.SUPER_ADMIN ? "SA" : "A";

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
      label: isArabic ? "تقييمات المنتجات" : "Product Reviews",
      href: `/${locale}/reviews`,
      icon: Star,
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
    {
      label: isArabic ? "سجلات النظام" : "System Logs",
      href: `/${locale}/system-logs`,
      icon: Activity,
      superAdminOnly: true,
    },
  ];

  const visibleNavigation = navigation.filter(
    (item) => !item.superAdminOnly || admin?.role === AdminRoleEnum.SUPER_ADMIN,
  );

  const navigationGroups = [
    { label: isArabic ? "\u0646\u0638\u0631\u0629 \u0639\u0627\u0645\u0629" : "Overview", items: visibleNavigation.filter(item => item.href === `/${locale}`) },
    { label: isArabic ? "\u0627\u0644\u062a\u062c\u0627\u0631\u0629" : "Commerce", items: visibleNavigation.filter(item => ["orders", "payments", "customers"].some(path => item.href.endsWith(`/${path}`))) },
    { label: isArabic ? "\u0627\u0644\u0643\u062a\u0627\u0644\u0648\u062c \u0648\u0627\u0644\u0645\u062d\u062a\u0648\u0649" : "Catalog & content", items: visibleNavigation.filter(item => ["products", "categories", "reviews", "banners", "homepage"].some(path => item.href.endsWith(`/${path}`))) },
    { label: isArabic ? "\u0627\u0644\u0625\u062f\u0627\u0631\u0629" : "Administration", items: visibleNavigation.filter(item => ["admins", "system-logs"].some(path => item.href.endsWith(`/${path}`))) },
  ].filter(group => group.items.length > 0);
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
      <nav aria-label={isArabic ? "Main navigation" : "Main navigation"} className="sidebar-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.label} className={groupIndex > 0 ? "border-t border-border/70 pt-4" : ""}>
            {!collapsed && <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">{group.label}</p>}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.href.endsWith(`/${locale}`) ? pathname === "/" : pathname === item.href.slice(locale.length + 1);
                return <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} onClick={onNavigate} aria-current={active ? "page" : undefined}
                  className={["group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active ? "bg-primary/10 text-primary shadow-sm before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:rounded-full before:bg-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"].join(" ")}>
                  <Icon className="size-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>;
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-border p-3">
        <div className="flex min-w-0 items-center gap-3 rounded-xl bg-muted/50 p-2.5" title={`${adminName} · ${adminRole}`}>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary" aria-hidden="true">{nameInitials || "A"}</div>
          {!collapsed && <>
            <div className="hidden min-w-0 flex-1 sm:block">
              <p className="truncate text-sm font-semibold text-foreground">{adminName}</p>
              <p className="truncate text-xs text-muted-foreground">{adminRole}</p>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:hidden" aria-label={`${adminName}, ${adminRole}`}>
              <span className="truncate text-xs font-semibold text-foreground">{nameInitials || "A"}</span>
              <span className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{roleInitials}</span>
            </div>
          </>}
        </div>
      </div>

    </aside>
  );
}
