"use client";

import { useLocale } from "next-intl";
import { ShieldX } from "lucide-react";

import { Link } from "@/i18n/navigation";

export default function AccessDeniedPage() {
  const isArabic = useLocale() === "ar";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldX className="size-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-bold">
          {isArabic ? "تم رفض الوصول" : "Access denied"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isArabic
            ? "ليس لديك صلاحية لعرض هذه الصفحة. تواصل مع مسؤول النظام إذا كنت تعتقد أن هذا خطأ."
            : "You don’t have permission to view this page. Contact a super administrator if you think this is a mistake."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {isArabic ? "العودة إلى لوحة التحكم" : "Back to dashboard"}
        </Link>
      </section>
    </div>
  );
}
