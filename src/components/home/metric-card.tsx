import { ArrowDownRight, ArrowUpRight, MoreHorizontal } from "lucide-react";

import type { Metric } from "./types";

interface MetricCardProps extends Metric {
  description: string;
}

export function MetricCard({
  title,
  value,
  change,
  positive,
  icon: Icon,
  iconColor,
  iconBg,
  description,
}: MetricCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
        >
          <Icon size={21} strokeWidth={1.8} />
        </div>

        <button
          type="button"
          aria-label="More metric options"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
        >
          <MoreHorizontal size={19} />
        </button>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>

      <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold ${
            positive ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </span>

        <span className="text-xs text-slate-400">{description}</span>
      </div>
    </div>
  );
}
