# Source folder structure

Current folders and files under `src/`, listed alphabetically with folders first.

```text
src/
|-- app/
|   |-- [locale]/
|   |   |-- (auth)/
|   |   |   \-- login/
|   |   |       \-- page.tsx
|   |   |-- (dashboard)/
|   |   |   |-- access-denied/
|   |   |   |   \-- page.tsx
|   |   |   |-- admins/
|   |   |   |   \-- page.tsx
|   |   |   |-- banners/
|   |   |   |   \-- page.tsx
|   |   |   |-- categories/
|   |   |   |   \-- page.tsx
|   |   |   |-- customers/
|   |   |   |   \-- page.tsx
|   |   |   |-- homepage/
|   |   |   |   \-- page.tsx
|   |   |   |-- orders/
|   |   |   |   \-- page.tsx
|   |   |   |-- payments/
|   |   |   |   \-- page.tsx
|   |   |   |-- products/
|   |   |   |   |-- [productId]/
|   |   |   |   |   \-- edit/
|   |   |   |   |       \-- page.tsx
|   |   |   |   |-- new/
|   |   |   |   |   \-- page.tsx
|   |   |   |   \-- page.tsx
|   |   |   |-- users/
|   |   |   |-- layout.tsx
|   |   |   \-- page.tsx
|   |   \-- layout.tsx
|   |-- favicon.ico
|   |-- globals.css
|   |-- layout.tsx
|   \-- providers.tsx
|-- components/
|   |-- dashboard/
|   |   |-- app-sidebar.tsx
|   |   |-- dashboard-header.tsx
|   |   \-- dashboard-shell.tsx
|   |-- home/
|   |   |-- dashboard.tsx
|   |   |-- dashboard-header.tsx
|   |   |-- dashboard-sidebar.tsx
|   |   |-- dashboard-topbar.tsx
|   |   |-- data.ts
|   |   |-- metric-card.tsx
|   |   |-- overview-section.tsx
|   |   |-- recent-orders.tsx
|   |   |-- section-title.tsx
|   |   |-- store-insights.tsx
|   |   \-- types.ts
|   |-- providers/
|   |   |-- query-provider.tsx
|   |   \-- theme-provider.tsx
|   \-- ui/
|       |-- avatar.tsx
|       |-- badge.tsx
|       |-- button.tsx
|       |-- card.tsx
|       |-- dialog.tsx
|       |-- dropdown-menu.tsx
|       |-- input.tsx
|       |-- label.tsx
|       |-- select.tsx
|       |-- separator.tsx
|       |-- sheet.tsx
|       |-- sidebar.tsx
|       |-- skeleton.tsx
|       |-- table.tsx
|       \-- tooltip.tsx
|-- features/
|   |-- admin-auth/
|   |   |-- api/
|   |   |   \-- admin-auth.api.ts
|   |   |-- components/
|   |   |   |-- admin-session-guard.tsx
|   |   |   \-- login-form.tsx
|   |   |-- hooks/
|   |   |   \-- use-admin-auth.tsx
|   |   |-- schemas/
|   |   |   \-- admin-auth.schema.ts
|   |   \-- types/
|   |       \-- admin-auth.types.ts
|   |-- admin-dashboard/
|   |   |-- api/
|   |   |   \-- dashboard.api.ts
|   |   |-- components/
|   |   |   |-- dashboard-header.tsx
|   |   |   |-- dashboard-shell.tsx
|   |   |   \-- dashboard-sidebar.tsx
|   |   |-- hooks/
|   |   |   \-- use-dashboard.ts
|   |   |-- types/
|   |   |   \-- dashboard.types.ts
|   |   \-- utils/
|   |       \-- dashboard-formatters.ts
|   |-- admin-management/
|   |   |-- api/
|   |   |   \-- admin-management.api.ts
|   |   |-- components/
|   |   |-- hooks/
|   |   |   \-- use-admin-management.ts
|   |   |-- schemas/
|   |   |   \-- admin.schema.ts
|   |   \-- types/
|   |       \-- admin.types.ts
|   |-- banners/
|   |   |-- api/
|   |   |   \-- banners.api.ts
|   |   |-- components/
|   |   |   |-- banner-form-dialog.tsx
|   |   |   \-- banners-page.tsx
|   |   |-- hooks/
|   |   |   \-- use-banners.ts
|   |   |-- schemas/
|   |   |   \-- banner.schema.ts
|   |   \-- types/
|   |       \-- banner.types.ts
|   |-- categories/
|   |   |-- api/
|   |   |   \-- categories.api.ts
|   |   |-- components/
|   |   |   |-- categories-page.tsx
|   |   |   |-- category-delete-dialog.tsx
|   |   |   \-- category-form-dialog.tsx
|   |   |-- hooks/
|   |   |   \-- use-categories.ts
|   |   |-- schemas/
|   |   |   \-- category.schema.ts
|   |   \-- types/
|   |       \-- category.types.ts
|   |-- customer-management/
|   |   |-- api/
|   |   |   \-- customer-management.api.ts
|   |   |-- components/
|   |   |   |-- customer-delete-dialog.tsx
|   |   |   |-- customer-dialog.tsx
|   |   |   |-- customer-filters.tsx
|   |   |   |-- customer-page-header.tsx
|   |   |   |-- customers-page.tsx
|   |   |   \-- customer-table.tsx
|   |   |-- hooks/
|   |   |   \-- use-customer-management.ts
|   |   |-- schemas/
|   |   |   \-- customer.schema.ts
|   |   \-- types/
|   |       \-- customer.types.ts
|   |-- homepage-preview/
|   |   |-- api/
|   |   |   \-- homepage-preview.api.ts
|   |   |-- components/
|   |   |   \-- homepage-preview-page.tsx
|   |   |-- hooks/
|   |   |   \-- use-homepage-preview.ts
|   |   \-- types/
|   |       \-- homepage.types.ts
|   |-- orders/
|   |   |-- api/
|   |   |   \-- orders.api.ts
|   |   |-- components/
|   |   |   |-- order-details-dialog.tsx
|   |   |   |-- orders-page.tsx
|   |   |   \-- order-status-dialog.tsx
|   |   |-- hooks/
|   |   |   \-- use-orders.ts
|   |   \-- types/
|   |       \-- order.types.ts
|   |-- payment-management/
|   |   |-- api/
|   |   |   \-- payment-management.api.ts
|   |   |-- components/
|   |   |   |-- payment-order-details-dialog.tsx
|   |   |   |-- payments-page.tsx
|   |   |   \-- payment-status-badge.tsx
|   |   |-- hooks/
|   |   |   \-- use-payment-management.ts
|   |   \-- types/
|   |       \-- payment.types.ts
|   |-- payments/
|   |   |-- api/
|   |   |   \-- payments.api.ts
|   |   |-- components/
|   |   |   |-- payment-details-dialog.tsx
|   |   |   |-- payments-page.tsx
|   |   |   \-- payment-status-badge.tsx
|   |   |-- hooks/
|   |   |   \-- use-payments.ts
|   |   \-- types/
|   |       \-- payment.types.ts
|   \-- products/
|       |-- api/
|       |   |-- product-categories.api.ts
|       |   \-- products.api.ts
|       |-- components/
|       |   |-- image-preview.tsx
|       |   |-- product-form.tsx
|       |   |-- products-archive-dialog.tsx
|       |   |-- products-filters.tsx
|       |   |-- products-header.tsx
|       |   |-- products-page.tsx
|       |   \-- products-table.tsx
|       |-- hooks/
|       |   |-- use-product-categories.ts
|       |   \-- use-products.ts
|       |-- schemas/
|       |   \-- product.schema.ts
|       \-- types/
|           \-- product.types.ts
|-- hooks/
|   \-- use-mobile.ts
|-- i18n/
|   |-- navigation.ts
|   |-- request.ts
|   \-- routing.ts
|-- lib/
|   |-- api/
|   |   |-- auth-refresh.ts
|   |   |-- axios.ts
|   |   \-- token-store.ts
|   \-- utils.ts
|-- utils/
|   \-- formatCurrency.ts
\-- proxy.ts
```
