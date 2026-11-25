export interface SystemLog {
  logId: string; schemaVersion: number; occurredAt: string; requestId: string;
  service: string; environment: string; kind: string; action: string;
  level: "info" | "warn" | "error";
  outcome: "success" | "failure" | "denied" | "aborted";
  actor: { type: string; id?: string; identityModel?: string; role?: string };
  error?: { code: string };
  http: { method: string; route: string; statusCode: number; durationMs: number; completed: boolean };
}
export interface LogFilters {
  from?: string; to?: string; requestId?: string; method?: string; statusCode?: string;
  statusGroup?: string; route?: string; outcome?: string; minDurationMs?: string; limit: number;
}
export interface LogPage { items: SystemLog[]; pageInfo: { hasNextPage: boolean; nextCursor: string | null } }
export interface LogStatistics {
  from: string; to: string; slowThresholdMs: number; totalRequests: number;
  successfulRequests: number; failedRequests: number; completedRequests: number;
  abortedRequests: number; deniedRequests: number; slowRequests: number;
  clientErrorRequests: number; serverErrorRequests: number; averageDurationMs: number;
  maxDurationMs: number; p50DurationMs: number; p95DurationMs: number; p99DurationMs: number;
}
