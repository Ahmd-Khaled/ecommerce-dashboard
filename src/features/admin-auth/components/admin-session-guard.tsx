"use client";

import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";

import { useAdminAuth } from "../hooks/use-admin-auth";
import { useRouter } from "@/i18n/navigation";

export function AdminSessionGuard({ children }: { children: ReactNode }) {
  const { status } = useAdminAuth();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-5 animate-spin" />
          Restoring admin session...
        </div>
      </div>
    );
  }

  return children;
}
