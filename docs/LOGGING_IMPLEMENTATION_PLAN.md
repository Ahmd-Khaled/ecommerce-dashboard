# Dashboard logging integration plan

Status: proposed; documentation only. This plan is not authorization to implement it. Implementation starts only after the dashboard owner approves this plan.

Prepared on 2026-11-25 against the dashboard's current API/auth/navigation patterns and the backend logging documents linked below.

## 1. Scope and outcome

Integrate the dashboard with the backend logging system in two separate capabilities:

1. Correlate dashboard API calls with backend request logs using the backend-generated `X-Request-Id`, and surface that reference safely when useful to support.
2. Add a super-admin audit log viewer only after the backend has implemented and documented durable audit storage and reader endpoints.

The backend log is authoritative for server-observed events. Browser UI events are not a substitute for backend audit records. This dashboard has no customer storefront, so customer-side telemetry work is out of scope.

## 2. Backend review and current contract

Sources reviewed:

- [Backend frontend logging integration plan](https://github.com/Ahmd-Khaled/ecommerce-backend/blob/main/docs/FRONTEND_LOGGING_IMPLEMENTATION_PLAN.md)
- [Backend logging implementation status](https://github.com/Ahmd-Khaled/ecommerce-backend/blob/main/docs/LOGGING_IMPLEMENTATION.md)
- [Backend logging system plan](https://github.com/Ahmd-Khaled/ecommerce-backend/blob/main/docs/LOGGING_IMPLEMENTATION_PLAN.md)

Current backend behavior and constraints described by those documents:

- The backend generates an `X-Request-Id` for each HTTP request and emits a structured request completion or abort event. A client-provided ID is not trusted.
- Request logging currently captures a restricted set of fields and intentionally omits request/response bodies, headers, cookies, tokens, query values, raw URLs, and personal data.
- The initial route field is router-relative and is not a complete operation inventory. Request completion/abort does not prove whether a business mutation committed.
- There is no durable audit collection or audit reader API yet. `/api/v1/admin/audit-logs` is proposed future backend work, not a currently usable endpoint.
- Backend implementation status says request logging is an initial foundation; complete route/action coverage, durable audit/outbox, and reader API remain outstanding.
- The backend must expose `X-Request-Id` through CORS for the deployed dashboard origins before browser JavaScript can reliably read it.

## 3. Dashboard baseline

- Shared Axios clients and response/auth-refresh behavior live in `src/lib/api/axios.ts`.
- Current error display is centralized through `apiErrorMessage`, used by auth, mutation toasts, and selected query error states.
- Admin identity and role are available through `useAdminAuth`; roles are `admin` and `super-admin`.
- The dashboard shell is locale-aware and supports English and Arabic; navigation and route protection are in the admin dashboard/auth feature.
- Admin management is currently the super-admin-only route. The audit page must have a matching client route guard and hidden navigation for ordinary admins, while the backend remains the actual authorization boundary.

## 4. Phase A — request ID correlation

### Implementation steps

1. Confirm backend CORS exposes `X-Request-Id` to every dashboard origin in development, staging, and production. Record any missing deployment configuration as a backend prerequisite.
2. Extend the shared Axios response handling to read the case-insensitive response header on both successful and failed HTTP responses. Missing/inaccessible IDs must not change the request result.
3. Add a small typed helper for extracting the request ID from an Axios response/error without changing the existing auth refresh, retry, multipart upload, timeout, or error-message behavior.
4. Keep the ID associated with the specific response attempt. If a 401 refresh retry occurs, do not combine the first and retried request IDs or claim they form one backend event.
5. For errors with an HTTP response, make the associated ID available to UI error rendering. For network errors without a response, leave the ID absent and describe the condition as a connection/request failure, not a confirmed backend failure.
6. Add a concise localized “Reference: {requestId}” detail to support-facing error UI where useful. Keep routine successes quiet; do not expose stack traces, raw URL/query values, arbitrary server exception text, request bodies, tokens, or headers.
7. Do not add browser telemetry or a new logging SDK in this phase. If separately proposed later, first inventory existing approved tooling and define a minimal allowlist and privacy/retention policy.

### Acceptance criteria

- Browser code can read the backend ID when it is present and CORS exposes it, for both successful and HTTP-error responses.
- Missing/inaccessible IDs and transport failures never break or misclassify the original API result.
- Existing error display, refresh/retry, cancellation, and multipart flows remain intact.
- No credentials, form fields, response/request bodies, raw query values, personal data, payment information, or unredacted URLs are emitted for logging.
- The request ID shown to a user is the backend response ID for the corresponding attempt; no client-generated ID is presented as backend correlation.

## 5. Phase B — audit log viewer (backend-gated)

Do not begin this phase until the backend has shipped and documented the reader API and its authorization/data policy. The backend plan proposes `GET /api/v1/admin/audit-logs` and `GET /api/v1/admin/audit-logs/:eventId`, but these are not currently available contracts.

### Backend contract required before implementation

Confirm endpoint paths, event schema/version, response envelope, cursor pagination and maximum page size, filter allowlist, date/time boundaries, retention behavior, no-store semantics, error response shape, rate limits, super-admin policy, and how audit-reader access is itself recorded. Verify CORS and request-ID exposure for audit query responses.

### Dashboard implementation steps

1. Add a feature module following the existing `api`, `types`, `hooks`, and `components` organization, with typed API contracts matching the shipped backend schema exactly.
2. Add an audit page route and navigation entry visible only to super-admins. Extend `AdminSessionGuard` for the route, but rely on backend authorization for actual access control.
3. Implement only backend-allowlisted filters (for example time range, action, outcome, actor, target, and request ID) and cursor pagination. Never fetch all events or construct arbitrary database filters.
4. Display event time, actor type/role, action, outcome, target, request ID, and only safe metadata the backend contract explicitly permits. Render metadata as text, never HTML.
5. Provide loading, empty, invalid-filter, expired-cursor, forbidden, and service-error states. Include the failing query's backend request ID when present.
6. Enforce no persistent client storage: do not persist audit data to local storage, browser history, analytics, or a persistent query cache. Clear in-memory results on logout, identity change, or loss of super-admin permission. Ensure server responses use `Cache-Control: no-store`.
7. Exclude edit/delete, bulk export, and unrelated customer-facing audit access unless separately approved and supported by backend policy.

### Acceptance criteria

- Ordinary admins and unauthenticated users cannot access the viewer through navigation or routes; backend authorization independently denies them.
- Queries are bounded and use documented filters/cursors; expired cursors and forbidden responses have clear states.
- No credentials, stacks, raw transport data, or sensitive values are displayed or persisted.
- Audit data is cleared on logout/identity/permission changes and is not stored persistently by the dashboard.
- Viewer reads are correlated by backend request ID and the backend remains responsible for recording those accesses.

## 6. Delivery order and dependencies

1. Approve this plan before implementation.
2. Confirm the backend logging release and CORS header exposure against the deployed dashboard origins.
3. Implement Phase A request-ID propagation and safe support-facing error references.
4. Verify Phase A in staging with successful responses, HTTP errors, expired sessions/refresh retry, missing header, and network failure.
5. Wait for backend durable audit storage and the finalized reader API/policy; do not call the proposed routes before they exist.
6. Implement Phase B against the documented versioned contract, then verify role boundaries, bounded pagination, error states, cache behavior, and logout/identity clearing.
7. Release the viewer only after backend and dashboard security review and staging verification.

## 7. Explicit exclusions and limitations

- No dashboard implementation is performed by this document.
- No browser-generated request IDs are treated as backend IDs.
- No audit viewer is planned against a speculative endpoint/schema.
- No client-side telemetry is introduced or represented as a security audit trail.
- Backend route coverage, durable mutation auditing, retention, operational recovery, and audit API authorization remain backend-owned.

