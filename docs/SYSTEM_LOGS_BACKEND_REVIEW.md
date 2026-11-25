# System Logs backend compatibility review

Reviewed on 2026-11-25 against the ecommerce-backend reader routes, query validators, DTO, cursor service, and statistics aggregation.

## Existing integration confirmed

- All three GET endpoints are implemented: list, statistics, and UUID detail.
- The shared Axios client sends `Authorization: admin <access-token>` and uses the existing session refresh flow.
- Navigation and the screen are restricted to Super Admins; a backend 403 clears the log workspace.
- List requests preserve applied filters and limit across cursor navigation. Refresh starts from page one.
- Statistics send only `from`, `to`, `method`, `route`, and `slowThresholdMs=1000`.
- Statistics labels explain their broader scope and that failed requests include denied/aborted events.
- Aborted requests with status 200 remain visibly incomplete.
- Both English and Arabic UI include errors, details, timezone information, and diagnostic limitations.
- Requests are canceled on replacement/unmount, results stay in component memory, and reader endpoints share a cooldown after 429.

## Fixes in this branch

### Validate successful response payloads

Previously, any non-null object was accepted. A list payload such as `{}` could look empty, malformed nested rows could crash rendering, and absent statistics fields could produce invalid numbers. Each endpoint now parses its own Zod schema before returning data. Invalid payloads use the existing `INVALID_RESPONSE` state and retain the Axios response, including its diagnostic request ID.

The validators cover timestamps and UUIDs, actor variants, optional error codes, completed/aborted HTTP events, numeric statistics, and consistent pagination metadata. Unknown response properties are stripped by Zod rather than rendered.

### Match backend filter validation

The form now applies a shared filter schema before requesting data. This catches UUIDs rejected by the backend, route lengths over 256, invalid page sizes, numeric bounds, and conflicting status filters. Zero minimum duration remains valid. The server still decides date-range retention because it does not expose a retention-setting endpoint.

### Isolate results by request identity

The request hook now derives loading state from a serialized request identity. Old results cannot appear beneath changed filters/page controls during the render before effect cleanup. Aborted responses remain ignored. Loading no longer requires a synchronous state update inside the effect.

### Avoid unrelated statistics reloads

Statistics requests depend on their supported time/method/route fields and explicit refresh revision, rather than the entire list filter object. With unchanged time bounds, changing a table-only filter or page size does not spend an extra statistics request. Applying a relative range still resolves new dates and appropriately refreshes statistics.

## Verification

Run:

```sh
npm run test:system-logs
npx tsc --noEmit
npm run lint
npm run build
```

For builds, configure `NEXT_PUBLIC_API_URL` to the backend API base (for example `http://localhost:4000/api/v1`), matching the existing rewrite configuration.

The contract suite uses an Axios adapter and real response schemas. It covers valid empty/populated pages, anonymous and identified actors, aborted status-200 details, zero statistics, malformed nested payloads, cursor forwarding, statistics filter isolation, filter boundaries, cancellation, unavailable storage, and shared cooldowns. The request-ID suite covers existing shared Axios behavior. These tests do not establish live-backend or browser end-to-end correctness.

## Backend constraints retained

- Cursor lifetime is 15 minutes; invalid/expired cursors return the same 400 as invalid filters. Restart from page one.
- All reader endpoints share 30 requests/minute per administrator and 60/minute per IP.
- Cross-origin CORS currently exposes only `X-Request-Id`; the client falls back to a 60-second cooldown when `Retry-After` is unreadable.
- Routes are local templates, not full mounted paths. Multiple modules can share them.
- Statistics require MongoDB 7.0+ and do not share a snapshot with list requests.
- Logging is best effort, retained for a configured duration, and separate from Audit Logs. No export, clear/delete, streaming, or writer-health API exists.
