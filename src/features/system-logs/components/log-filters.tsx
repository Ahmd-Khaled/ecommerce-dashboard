"use client";

import { useId, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { Filter, RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  draft: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onApply: () => void;
  onReset: () => void;
  disabled: boolean;
  validation: string;
};

function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return <div className="min-w-0 space-y-2"><Label htmlFor={id} className="leading-5">{label}</Label>{children(id)}</div>;
}

function Choice({ id, value, onChange, options, ar }: {
  id: string; value: string; onChange: (value: string) => void;
  options: { value: string; label: string }[]; ar: boolean;
}) {
  return (
    <Select dir={ar ? "rtl" : "ltr"} value={value || "all"} onValueChange={value => onChange(value === "all" ? "" : value)}>
      <SelectTrigger id={id} className="w-full min-w-0 gap-2 bg-background px-3 data-[size=default]:h-10">
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="start" className="max-h-72">
        {options.map(option => <SelectItem key={option.value} value={option.value || "all"} className="min-h-9 px-3 pe-9 [&>span.absolute]:end-2 [&>span.absolute]:start-auto">{option.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function LogFilters({ draft, onChange, onApply, onReset, disabled, validation }: Props) {
  const ar = useLocale() === "ar";
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const headingId = useId();
  const errorId = useId();
  const exactStatus = !!draft.status && !draft.status.endsWith("xx");
  const inputClass = "h-10 bg-background px-3";
  const actionClass = "h-10 min-w-32 flex-1 gap-2 px-4 sm:flex-none";

  return (
    <form aria-labelledby={headingId} aria-describedby={validation ? errorId : undefined}
      onSubmit={event => { event.preventDefault(); onApply(); }} className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Filter aria-hidden="true" className="size-4" /></span>
          <h2 id={headingId} className="font-semibold">{t("Filter requests", "تصفية الطلبات")}</h2>
        </div>
        <span className="hidden text-xs text-muted-foreground sm:inline">{t("Refine the request stream", "حدد الطلبات المعروضة")}</span>
      </div>
      <div className="grid items-start gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field label={t("Time range", "الفترة الزمنية")}>{id => <Choice id={id} ar={ar} value={draft.range} onChange={value => onChange("range", value)} options={[
          { value: "1", label: t("Last hour", "آخر ساعة") },
          { value: "6", label: t("Last 6 hours", "آخر 6 ساعات") },
          { value: "24", label: t("Last 24 hours", "آخر 24 ساعة") },
          { value: "168", label: t("Last 7 days", "آخر 7 أيام") },
          { value: "custom", label: t("Custom range", "فترة مخصصة") },
        ]} />}</Field>
        <Field label={t("HTTP method", "طريقة HTTP")}>{id => <Choice id={id} ar={ar} value={draft.method || ""} onChange={value => onChange("method", value)} options={[
          { value: "", label: t("All methods", "كل الطرق") },
          ...["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS", "OTHER"].map(value => ({ value, label: value })),
        ]} />}</Field>
        <Field label={t("HTTP status", "حالة HTTP")}>{id => <Choice id={id} ar={ar} value={exactStatus ? "exact" : draft.status || ""} onChange={value => onChange("status", value === "exact" ? "200" : value)} options={[
          { value: "", label: t("All statuses", "كل الحالات") },
          ...["1xx", "2xx", "3xx", "4xx", "5xx"].map(value => ({ value, label: value })),
          { value: "exact", label: t("Exact status code", "رمز حالة محدد") },
        ]} />}</Field>
        <Field label={t("Outcome", "النتيجة")}>{id => <Choice id={id} ar={ar} value={draft.outcome || ""} onChange={value => onChange("outcome", value)} options={[
          { value: "", label: t("All outcomes", "كل النتائج") },
          { value: "success", label: t("Success", "ناجح") },
          { value: "failure", label: t("Failure", "فشل") },
          { value: "denied", label: t("Denied", "مرفوض") },
          { value: "aborted", label: t("Aborted", "منقطع") },
        ]} />}</Field>
        {exactStatus && <Field label={t("Exact status code (100–599)", "رمز الحالة المحدد (100–599)")}>{id => <Input id={id} className={inputClass} inputMode="numeric" pattern="[1-5][0-9]{2}" required maxLength={3} value={draft.status === "exact" ? "" : draft.status} onChange={event => onChange("status", event.target.value || "exact")} />}</Field>}
        {draft.range === "custom" && <>
          <Field label={t("From (local time)", "من (التوقيت المحلي)")}>{id => <Input id={id} className={inputClass} type="datetime-local" required value={draft.from || ""} onChange={event => onChange("from", event.target.value)} />}</Field>
          <Field label={t("To (exclusive, local time)", "إلى (غير شامل، التوقيت المحلي)")}>{id => <Input id={id} className={inputClass} type="datetime-local" required value={draft.to || ""} onChange={event => onChange("to", event.target.value)} />}</Field>
        </>}
        <Field label={t("Request ID", "معرّف الطلب")}>{id => <Input id={id} className={`${inputClass} font-mono`} dir="ltr" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" maxLength={36} value={draft.requestId || ""} onChange={event => onChange("requestId", event.target.value)} />}</Field>
        <Field label={t("Route template (exact)", "قالب المسار (مطابق)")}>{id => <Input id={id} className={`${inputClass} font-mono`} dir="ltr" placeholder="/:id" maxLength={256} value={draft.route || ""} onChange={event => onChange("route", event.target.value)} />}</Field>
        <Field label={t("Minimum duration (ms)", "أقل مدة (مللي ثانية)")}>{id => <Input id={id} className={inputClass} type="number" min={0} max={2147483647} step={1} placeholder="0" value={draft.minDurationMs || ""} onChange={event => onChange("minDurationMs", event.target.value)} />}</Field>
        <Field label={t("Rows per page", "عدد الصفوف")}>{id => <Choice id={id} ar={ar} value={draft.limit} onChange={value => onChange("limit", value)} options={[25, 50, 100].map(value => ({ value: String(value), label: String(value) }))} />}</Field>
      </div>
      <div className="mt-6 flex flex-col gap-4 border-t pt-4 lg:flex-row lg:items-center lg:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{t("Routes are local templates, not full URLs. Date ranges must fit the backend retention period.", "المسارات قوالب محلية وليست روابط كاملة. يجب أن تكون الفترة ضمن مدة الاحتفاظ بالخادم.")}</p>
        <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto">
          <Button type="button" variant="outline" className={actionClass} disabled={disabled} onClick={onReset}><RotateCcw aria-hidden="true" className="size-4 shrink-0" />{t("Reset", "إعادة ضبط")}</Button>
          <Button type="submit" className={actionClass} disabled={disabled}><Search aria-hidden="true" className="size-4 shrink-0" />{t("Apply filters", "تطبيق التصفية")}</Button>
        </div>
      </div>
      {validation && <p id={errorId} role="alert" className="mt-3 text-sm text-destructive">{validation}</p>}
    </form>
  );
}
