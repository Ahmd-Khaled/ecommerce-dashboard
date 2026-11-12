# Dashboard implementation – next milestone

## Included

### Phase 1: Dashboard Home
- Replaced the placeholder home page with real React Query integrations.
- Uses `GET /api/v1/dashboard/overview`, `/sales`, and `/top-products`.
- Added period filters (7, 30, 90 days, 12 months), daily/monthly sales chart, order-status chart, recent orders, top-selling products, low-stock alerts, latest products, and multi-currency paid-sales summaries.
- Monetary values respect the currency exponent returned by the backend. Different currencies are never summed together.
- Legacy orders have no stored currency in the backend response; their amount is shown without attaching an assumed currency.
- Top-product item totals are labelled with the backend's limitation (before order discounts, tax, and shipping).

### Phase 2: Banner Management
- Added `/[locale]/banners` with paginated listing and filters for language, view, and active status.
- Added create/edit dialog, image preview/upload (maximum 5 MB), scheduling, sort order, status, and delete confirmation.
- Uses the existing `/api/v1/banners` routes only.
- Create and image replacement use multipart form data. Updates without image replacement use JSON. Empty nullable URL/date values are sent as `null`.
- The text search is intentionally limited to the currently loaded page because the backend banner-list endpoint does not expose a search parameter.

### Phase 3: Homepage Preview (read-only)
- Added `/[locale]/homepage` to preview the real `/api/v1/home` response for desktop or mobile.
- Shows the banners, categories, latest products, offers, best deal, and best sellers returned by the backend.
- This is explicitly a preview, not a CMS. The backend currently calculates these sections automatically and has no configuration API/model for manual product selection, section visibility, title overrides, or ordering. No unsupported edit controls or fake persistence were added.

### Navigation and shell
- Added Banners and Homepage Preview navigation entries.
- Added active-route highlighting.
- Corrected desktop collapsed-sidebar content offset and mobile sidebar visibility/close-on-navigation behavior.

## Backend changes

No backend source changes were required for the included phases. Existing dashboard, banner, and homepage endpoints are used as implemented in the supplied backend archive.

## Verification

- All 133 TypeScript/TSX source files passed TypeScript transpile parsing with zero syntax diagnostics.
- Both locale JSON files were checked and are valid JSON.
- Full TypeScript semantic check, ESLint, and Next production build could not be completed in this environment because dependencies could not be installed (`npm ci` timed out; offline install reported an uncached package). Run the commands below after installing dependencies locally.

## Local verification

```bash
npm ci
npm run lint
npx tsc --noEmit
npm run build
```

## Important API/reporting notes

- Dashboard sales are paid sales based on payment date and exclude cancelled orders; the backend does not track refunds, so this is not net accounting revenue.
- Period order counts and recent orders are based on order creation date.
- Currency amounts from different currencies are never combined.
- Recent-order API responses contain a user ID, not a populated customer profile; the dashboard therefore displays a shortened customer ID instead of inventing a name.
- Homepage content configuration remains a backend feature to design and implement before a true editable CMS can be added.
