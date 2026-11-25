import { z } from "zod";

const method = z.enum(["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "OTHER"]);
const outcome = z.enum(["success", "failure", "denied", "aborted"]);
const duration = z.number().nonnegative();
const count = duration.int();
const timestamp = z.iso.datetime({ offset: true });
const integer = (min: number, max: number) => z.string().regex(/^\d+$/)
  .refine(value => Number(value) >= min && Number(value) <= max);

// Keep the reader contract aligned with the backend's explicit DTO projection.
export const systemLogSchema = z.object({
  logId: z.uuid(), schemaVersion: z.literal(1), occurredAt: timestamp, requestId: z.uuid(),
  service: z.string(), environment: z.string(), kind: z.literal("request"), action: z.literal("http.request"),
  level: z.enum(["info", "warn", "error"]), outcome,
  actor: z.union([
    z.object({ type: z.enum(["anonymous", "system"]) }),
    z.object({ type: z.enum(["user", "admin"]), id: z.string().regex(/^[a-f\d]{24}$/i),
      identityModel: z.enum(["User", "Admin"]), role: z.enum(["user", "guest", "admin", "super-admin", "unknown"]) }),
  ]),
  error: z.object({ code: z.string() }).optional(),
  http: z.object({ method, route: z.string().max(256), statusCode: z.number().int().min(100).max(599),
    durationMs: count, completed: z.boolean() }),
});

export const logPageSchema = z.object({
  items: z.array(systemLogSchema),
  pageInfo: z.object({ hasNextPage: z.boolean(), nextCursor: z.string().min(1).max(4096).nullable() })
    .refine(info => info.hasNextPage === (info.nextCursor !== null)),
});

export const logStatisticsSchema = z.object({
  from: timestamp, to: timestamp, slowThresholdMs: count.min(1),
  totalRequests: count, successfulRequests: count, failedRequests: count,
  completedRequests: count, abortedRequests: count, deniedRequests: count, slowRequests: count,
  clientErrorRequests: count, serverErrorRequests: count,
  averageDurationMs: duration, maxDurationMs: duration,
  p50DurationMs: duration, p95DurationMs: duration, p99DurationMs: duration,
});

export const logFiltersSchema = z.strictObject({
  from: timestamp.optional(), to: timestamp.optional(), requestId: z.uuid().optional(),
  method: method.optional(), statusCode: integer(100, 599).optional(),
  statusGroup: z.enum(["1xx", "2xx", "3xx", "4xx", "5xx"]).optional(),
  route: z.string().min(1).max(256).optional(), outcome: outcome.optional(),
  minDurationMs: integer(0, 2147483647).optional(), limit: z.number().int().min(1).max(100),
}).refine(value => !(value.statusCode && value.statusGroup));
