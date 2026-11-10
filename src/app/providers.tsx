"use client";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AdminAuthProvider } from "@/features/admin-auth/hooks/use-admin-auth";
import { useLocale } from "next-intl";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const locale = useLocale();

  return (
    <ThemeProvider>
      <QueryProvider>
        <AdminAuthProvider>
          {children}
          <Toaster
            position={locale === "ar" ? "top-left" : "top-right"}
            dir={locale === "ar" ? "rtl" : "ltr"}
            theme="system"
            closeButton
            richColors
            duration={4000}
            visibleToasts={4}
            gap={12}
            offset={24}
            toastOptions={{
              classNames: {
                toast:
                  "!rounded-xl !border !border-border/80 !bg-popover !font-sans !text-popover-foreground !shadow-lg !shadow-slate-950/10 dark:!shadow-black/30",
                title: "!text-sm !font-semibold !tracking-tight",
                description: "!text-xs !leading-relaxed !text-muted-foreground",
                actionButton: "!rounded-lg !bg-primary !text-primary-foreground",
                cancelButton: "!rounded-lg !bg-muted !text-muted-foreground",
                closeButton:
                  "!border-border !bg-background !text-muted-foreground hover:!bg-muted hover:!text-foreground",
                success: "!border-emerald-500/20",
                error: "!border-destructive/20",
                warning: "!border-amber-500/20",
                info: "!border-primary/20",
              },
            }}
          />
        </AdminAuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
