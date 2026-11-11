import { Badge } from "@/components/ui/badge";

import type { PaymentStatus } from "../types/payment.types";

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
  legacy?: boolean;
  labels: {
    unpaid: string;
    pending: string;
    paid: string;
    expired: string;
    legacy: string;
  };
};

const statusStyles: Record<PaymentStatus, string> = {
  unpaid:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  pending:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300",
  expired:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
};

export function PaymentStatusBadge({
  status,
  legacy = false,
  labels,
}: PaymentStatusBadgeProps) {
  if (legacy) {
    return (
      <Badge
        variant="outline"
        className="border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/40 dark:text-orange-300"
      >
        {labels.legacy}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={statusStyles[status]}>
      {labels[status]}
    </Badge>
  );
}
