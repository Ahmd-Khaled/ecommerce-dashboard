import { Badge } from "@/components/ui/badge";
import type { PaymentStatus } from "../types/payment.types";

const styles: Record<PaymentStatus, string> = {
  paid: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
  pending: "border-amber-500/20 bg-amber-500/10 text-amber-600",
  expired: "border-slate-500/20 bg-slate-500/10 text-slate-600",
  unpaid: "border-muted bg-muted text-muted-foreground",
};
const names: Record<PaymentStatus, { en: string; ar: string }> = {
  paid: { en: "Paid", ar: "مدفوع" }, pending: { en: "Pending", ar: "قيد الانتظار" },
  expired: { en: "Expired", ar: "منتهي" }, unpaid: { en: "Unpaid", ar: "غير مدفوع" },
};

export function PaymentStatusBadge({ status, isArabic }: { status: PaymentStatus; isArabic: boolean }) {
  return <Badge variant="outline" className={styles[status]}>{names[status][isArabic ? "ar" : "en"]}</Badge>;
}
