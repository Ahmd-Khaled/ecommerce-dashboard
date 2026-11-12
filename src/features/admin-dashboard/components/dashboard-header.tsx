"use client";

import { useLocale } from "next-intl";
import { LogOut, Menu, Globe, ShieldCheck } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";

import { useAdminAuth } from "@/features/admin-auth/hooks/use-admin-auth";
import { AdminRoleEnum } from "@/features/admin-management/types/admin.types";

type DashboardHeaderProps = {
  onMenuClick?: () => void;
};

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const locale = useLocale();
  const isArabic = locale === "ar";
  const pathname = usePathname();
  const router = useRouter();

  const { admin, logout } = useAdminAuth();

  const fullName =
    [admin?.firstName, admin?.lastName].filter(Boolean).join(" ") ||
    admin?.email ||
    (isArabic ? "المسؤول" : "Administrator");

  const roleLabel =
    admin?.role === AdminRoleEnum.SUPER_ADMIN
      ? isArabic
        ? "مدير النظام"
        : "Super Admin"
      : isArabic
        ? "مدير"
        : "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label={isArabic ? "فتح القائمة" : "Open navigation"}
        >
          <Menu className="size-5" />
        </button>

        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <ShieldCheck className="size-4" />
          <span>{isArabic ? "لوحة الإدارة" : "Admin Dashboard"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() =>
            router.replace(pathname, { locale: isArabic ? "en" : "ar" })
          }
          className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-foreground transition-colors hover:bg-muted"
          aria-label={
            isArabic
              ? "Switch language to English"
              : "التبديل إلى اللغة العربية"
          }
          title={
            isArabic
              ? "Switch language to English"
              : "التبديل إلى اللغة العربية"
          }
        >
          <Globe className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">
            {isArabic ? "English" : "عربي"}
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="hidden text-end sm:block">
            <p className="max-w-44 truncate text-sm font-semibold">
              {fullName}
            </p>
            <p className="text-xs text-muted-foreground">{roleLabel}</p>
          </div>

          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {(admin?.firstName?.[0] || admin?.email?.[0] || "A").toUpperCase()}
          </div>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        <button
          type="button"
          onClick={() => void logout()}
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          title={isArabic ? "تسجيل الخروج" : "Sign out"}
        >
          <LogOut className="size-4" />
          <span className="hidden md:inline">
            {isArabic ? "خروج" : "Sign out"}
          </span>
        </button>
      </div>
    </header>
  );
}
