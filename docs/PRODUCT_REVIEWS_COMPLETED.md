# Product reviews dashboard — completed work

## Implemented

- Added a dedicated Product Reviews dashboard route at `/[locale]/reviews`.
- Added an admin review API client for listing reviews, reading/updating approval settings, moderation state changes, and SUPER_ADMIN restoration.
- Added React Query hooks with shared review query keys and cache invalidation after successful mutations.
- Added a moderation interface with cursor-based pagination, product ID and state filters, and a pending/new queue filter.
- Added the persisted automatic-approval setting. The UI reflects the backend setting and sends updates to the settings endpoint.
- Added review cards showing customer identity fields supplied by the admin API, product name/ID, rating, review text, state, submission date, and moderation audit history.
- Added publish, hide, and remove actions with an optional moderation reason.
- Added restore action for SUPER_ADMIN only. Restoration returns removed reviews to hidden; publishing remains a separate action.
- Added English and Arabic UI labels and a Product Reviews sidebar entry.

## Backend API integration

Uses the existing endpoints without changing backend behavior:

- `GET /api/v1/admin/reviews`
- `PATCH /api/v1/admin/reviews/:reviewId/state`
- `PATCH /api/v1/admin/reviews/:reviewId/restore` (SUPER_ADMIN)
- `GET /api/v1/admin/reviews/settings`
- `PATCH /api/v1/admin/reviews/settings`

Review list cursors are passed through unchanged as the backend's opaque `after` value. The dashboard does not calculate or modify rating counters; the backend transactionally maintains published-review summaries.

## Important behavior

- Manual approval remains the backend default; this dashboard only changes it when an administrator explicitly updates the setting.
- Removed reviews cannot be moderated by ordinary admins. SUPER_ADMIN can restore a removed review to hidden.
- Moderation actions never edit customer rating or review text.
- The optional reason is submitted to the backend and retained in moderation history.
- Product ID filtering expects a MongoDB ObjectId.

## Files added or updated

Added:
- `src/features/reviews/types/review.types.ts`
- `src/features/reviews/api/reviews.api.ts`
- `src/features/reviews/hooks/use-reviews.ts`
- `src/features/reviews/components/reviews-page.tsx`
- `src/app/[locale]/(dashboard)/reviews/page.tsx`

Updated:
- `src/features/admin-dashboard/components/dashboard-sidebar.tsx`

## Verification

- Backend endpoint paths, payloads, review states, settings contract, cursor format usage, and moderation permissions were checked against the backend API documentation and review service/controller.
- Automated lint, TypeScript, and production build have **not** been run in this environment. Run locally:

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
```

- Verify the restore action with a SUPER_ADMIN account and confirm that a restored review appears as hidden.
- Verify normal ADMIN accounts cannot restore removed reviews.
- Verify manual/automatic approval setting persistence against a transaction-capable backend deployment.
