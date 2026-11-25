import { api } from "@/lib/api/axios";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { logPageSchema, logStatisticsSchema, systemLogSchema } from "../schemas/system-log.schema";
import type { LogFilters, LogPage, LogStatistics, SystemLog } from "../types/system-log.types";

// All reader endpoints share a budget. Keep only the deadline, never log payloads.
let cooldownUntil = 0;
export const getLogCooldown = () => Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));

async function read<T>(path: string, params: object, signal: AbortSignal, schema: z.ZodType<T>): Promise<T> {
  if (signal.aborted) throw new axios.CanceledError();
  if (getLogCooldown()) throw new AxiosError("System Logs cooldown", "RATE_LIMITED");
  try {
    const response = await api.get<{ success: boolean; data: T }>(`/admin/system-logs${path}`, {
      params: new URLSearchParams(Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .map(([key, value]) => [key, String(value)])),
      signal, headers: { "Cache-Control": "no-store" },
    });
    const parsed = z.object({ success: z.literal(true), data: schema }).safeParse(response.data);
    if (!parsed.success) {
      throw new AxiosError("Unreadable System Logs response", "INVALID_RESPONSE", response.config, response.request, response);
    }
    return parsed.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 403 && !signal.aborted && typeof window !== "undefined") {
      window.dispatchEvent(new Event("system-logs-forbidden"));
    }
    if (axios.isAxiosError(error) && error.response?.status === 429) {
      const raw = error.response.headers?.["retry-after"];
      const seconds = typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : NaN;
      const date = typeof raw === "string" ? Date.parse(raw) : NaN;
      const delay = Number.isFinite(seconds) ? seconds * 1000 : Number.isFinite(date) ? Math.max(0, date - Date.now()) : 60000;
      cooldownUntil = Math.max(cooldownUntil, Date.now() + delay);
    }
    throw error;
  }
}
export const systemLogsApi = {
  list: (filters: LogFilters, after: string | undefined, signal: AbortSignal) => read<LogPage>("", { ...filters, after }, signal, logPageSchema),
  statistics: ({ from, to, method, route }: LogFilters, signal: AbortSignal) =>
    read<LogStatistics>("/statistics", { from, to, method, route, slowThresholdMs: 1000 }, signal, logStatisticsSchema),
  detail: (id: string, signal: AbortSignal) => read<SystemLog>(`/${encodeURIComponent(id)}`, {}, signal, systemLogSchema),
};
