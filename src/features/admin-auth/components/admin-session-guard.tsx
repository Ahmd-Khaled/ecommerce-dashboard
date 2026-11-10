"use client";

import { useEffect, type ReactNode } from "react";
import { LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";

import { useAdminAuth } from "../hooks/use-admin-auth";
import { usePathname, useRouter } from "@/i18n/navigation";

export function AdminSessionGuard({ children }: { children: ReactNode }) {
  const { status, isSuperAdmin } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requiresSuperAdmin =
    pathname === "/admins" || pathname.startsWith("/admins/");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && requiresSuperAdmin && !isSuperAdmin) {
      router.replace("/access-denied");
    }
  }, [status, requiresSuperAdmin, isSuperAdmin, router]);

  if (status !== "authenticated" || (requiresSuperAdmin && !isSuperAdmin)) {
    return (
      <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-12">
        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 size-72 rounded-full bg-primary/[0.07] blur-[100px]" />
          <div className="absolute -bottom-32 -right-24 size-80 rounded-full bg-violet-500/[0.07] blur-[110px]" />

          <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--foreground)/0.06)_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {/* Loading card */}
        <div className="relative w-full max-w-md">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-8 shadow-2xl shadow-black/[0.04] backdrop-blur-2xl sm:p-10">
            {/* Top accent */}
            <div className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-muted">
              <div className="h-full w-1/3 animate-[loading-progress_1.8s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-primary/40 via-primary to-violet-500" />
            </div>

            <div className="flex flex-col items-center text-center">
              {/* Animated icon */}
              <div className="relative mb-7 flex size-24 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/10 [animation-duration:2.5s]" />

                <div className="absolute inset-1 rounded-full border border-primary/15" />

                <div className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full border-2 border-transparent border-t-primary/70" />

                <div className="relative flex size-16 items-center justify-center rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/15 via-primary/5 to-violet-500/10 shadow-lg shadow-primary/10">
                  <ShieldCheck
                    className="size-8 text-primary"
                    strokeWidth={1.7}
                  />

                  <div className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md">
                    <Sparkles className="size-3" />
                  </div>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                    Secure authentication
                  </span>
                </div>

                <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Restoring your session
                </h2>

                <p className="mx-auto max-w-[280px] text-sm leading-6 text-muted-foreground">
                  Please wait while we securely verify your administrator
                  credentials and prepare your workspace.
                </p>
              </div>

              {/* Loading indicator */}
              <div className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <LoaderCircle className="size-[18px] animate-spin text-primary" />
                </div>

                <div className="min-w-0 flex-1 text-left">
                  <p className="text-xs font-semibold text-foreground">
                    Authenticating administrator
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Establishing a secure connection...
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                  <span className="size-1 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                  <span className="size-1 animate-bounce rounded-full bg-primary" />
                </div>
              </div>

              {/* Security footer */}
              <div className="mt-7 flex items-center justify-center gap-2 text-[10px] font-medium text-muted-foreground/70">
                <ShieldCheck className="size-3.5" />
                <span>Protected administrator environment</span>
              </div>
            </div>
          </div>

          {/* Bottom caption */}
          <p className="mt-5 text-center text-[10px] font-medium tracking-wide text-muted-foreground/50">
            YOUR WORKSPACE IS BEING PREPARED
          </p>
        </div>

        <style jsx>{`
          @keyframes loading-progress {
            0% {
              transform: translateX(-120%);
            }
            100% {
              transform: translateX(400%);
            }
          }
        `}</style>
      </div>
    );
  }

  return children;
}
