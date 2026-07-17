# Backend Alignment

Matriz operativa para mantener `simpleEcommerce` alineado con `simpleFastApi`.

## Fuente de verdad

1. Codigo, tests y OpenAPI de `/home/andis/simpleFastApi`.
2. `/home/andis/simpleFastApi/docs/FRONTEND_STOREFRONT_CONTRACT.md`.
3. `docs/BACKEND_CONTRACT.md` de este repo.
4. Helpers frontend (`src/config/api.ts`, `src/services/*`).

Si un helper contradice el contrato backend real, el helper esta mal.

## Bootstrap

- Variables permitidas: `VITE_API_BASE_URL`, `VITE_ACCOUNT_ID`.
- Endpoint inicial: `GET /api/accounts/{account_id}/ecommerce-config`.
- Consumidores: `src/services/tenantConfigService.ts`, `src/config/runtimeSchema.ts`, `src/config/runtime.ts`.
- El frontend puede usar cache/fallback local para resiliencia, pero la configuracion canonica viene del backend.

## Matriz Storefront

| Dominio | Endpoint | Auth | Headers | Consumidor frontend | Test backend | Test frontend |
|---|---|---|---|---|---|---|
| Tenant config | `GET /api/accounts/{account_id}/ecommerce-config` | Publica | ninguno requerido | `tenantConfigService` | `tests/test_ecommerce_config.py` | `src/config/runtimeSchema.test.ts`, `src/config/runtime.test.ts` |
| Observabilidad | `POST /api/accounts/{account_id}/frontend-events` | Publica si config habilita | payload endpoint-configured | `src/lib/observability.ts` | `tests/test_frontend_events.py` | `src/lib/observability.test.ts` |
| Login | `POST /api/auth/login` | Publica | `X-Account-ID` o slug | `authService.login` | `tests/test_auth.py`, `tests/test_api_contract.py` | `src/services/authService.test.ts` |
| Logout | `POST /api/auth/logout` | Bearer | bearer + tenant opcional coherente | `authService.logout` | `tests/test_auth.py` | `src/features/auth/session.test.ts` |
| Sesion | `GET /api/auth/me` | Bearer | bearer + tenant opcional coherente | `authService.getMe` | `tests/test_auth.py` | `src/services/authService.test.ts` |
| Registro | `POST /api/simple/register-customer` | Publica | `X-Account-ID` o slug | `authService.register` | `tests/test_api_contract.py` | `src/features/auth/registrationPayload.test.ts` |
| Registro proveedor | `POST /api/simple/register-supplier` | Publica | `X-Account-ID` o slug | `authService.registerSupplier` | backend contract | `src/pages/RegisterSupplier.tsx` |
| Catalogo anonimo | `GET /api/accounts/{account_id}/products/public` | Publica | path account | `productService.getProducts` sin token | `tests/test_products.py` | `src/features/catalog/queries.test.ts` |
| Catalogo autenticado | `GET /api/accounts/{account_id}/products` | Bearer | bearer + path account | `productService.getProducts` con token | `tests/test_products.py` | `src/features/catalog/queries.test.ts` |
| Producto + variantes | `GET /api/accounts/{account_id}/products/{product_id}` | Opcional | bearer si existe | `productService.getProductWithVariants` | `tests/test_products.py` | catalog/product tests |
| Servicios del proveedor | `GET/POST/PATCH /api/accounts/{account_id}/products` con `mine=true` | Bearer | bearer + path account | `providerProductService` | backend contract | `src/pages/ProviderDashboard.tsx` |
| Reseñas de producto | `GET/POST /api/accounts/{account_id}/products/{product_id}/reviews` | Bearer en POST | bearer + path account | `reviewService` | backend contract | `src/components/product/ProductRatingPanel.tsx` |
| Resumen reseñas | `GET /api/accounts/{account_id}/products/{product_id}/reviews/summary` | Publica/Opcional | path account | `reviewService.summary` | backend contract | `src/components/product/ProductRatingPanel.tsx` |
| Business partner | `GET /api/accounts/{account_id}/business-partners/{business_partner_id}` | Bearer | bearer + path account | `businessPartnerService.getBusinessPartner` | backend contract | `src/pages/ProviderDashboard.tsx` |
| Ordenes | `POST/GET /api/accounts/{account_id}/sales-orders` | Bearer | bearer + path account | `orderService` | `tests/test_sales_orders.py` | checkout/order tests |
| Ordenes proveedor | `GET /api/accounts/{account_id}/sales-orders` (+ storefront-status, supplier-respond) | Bearer supplier | scoped a productos con `provider_partner_id` | `providerOrderService` | backend contract | `ProviderDashboard` reservas/cobros |
| OK de calidad | `POST /api/accounts/{account_id}/sales-orders/{order_id}/quality-ok` | Bearer customer | cliente dueño de la orden; habilita cobro | `orderService.confirmQualityOk` | backend contract | `OrdersPage` |
| Capacitaciones | `GET/PATCH /api/accounts/{account_id}/tasks/mine` | Bearer supplier | tareas `metadata.project=capacitacion` | `taskService` | backend contract | `ProviderDashboard` capacitaciones |
| Stock | `POST /api/accounts/{account_id}/sales-orders/validate-stock` | Bearer | bearer + path account | `orderService.validateStock` | `tests/test_sales_orders.py` | checkout model tests |
| Submit orden | `POST /api/accounts/{account_id}/sales-orders/{order_id}/submit` | Bearer | bearer + path account | `orderService.submitOrder` | `tests/test_order_state_machine.py` | checkout/order tests |
| Prestamos | `POST/GET /api/accounts/{account_id}/loans` | Bearer | bearer + path account | `orderService.createLoan` | `tests/test_loans.py` | `src/services/orderService.test.ts` |
| Favoritos | `GET/POST/DELETE /api/accounts/{account_id}/customers/{business_partner_id}/favorites` | Bearer | bearer + `X-Account-ID`/slug | `favoritesService` | `tests/test_customer_favorites.py` | store/favorites tests |
| Carrito remoto | `GET/PUT/DELETE /api/accounts/{account_id}/customers/{business_partner_id}/cart` | Bearer | bearer + `X-Account-ID`/slug | `cartSyncService` | `tests/test_customer_carts.py` | `src/store/useStore.test.ts` |
| Newsletter | endpoint configurado en `newsletter.endpoint` | Segun integracion | `newsletter.headers` | `newsletterService` | fuera del core API | tests de servicio si se cambia |

## Decisiones de Contrato

- El storefront crea y envia ordenes, pero no crea pagos ni confirma pagos. Si `checkout.loan.enabled` esta activo y el metodo es `prestamo`, crea el prestamo asociado a la orden luego del submit.
- `confirm-payment`, `ship`, `deliver`, `complete`, `transition` e `invoice` son backoffice/API interna.
- Favoritos y carrito son estado remoto por `business_partner_id`; el backend debe validar ownership por token.
- El carrito es JSON opaco para backend. Stock, precios e inventario se revalidan al cerrar compra.
- `products/{id}/variants` no es contrato activo; las variantes se leen embebidas en `GET /products/{id}` como `variants[]` y `variant_options[]`.

## Errores Esperados

- `401`: token ausente, invalido o expirado.
- `401 E2005`: sesion reemplazada por otro login; redirigir a `/login?session=superseded`.
- `403 E3002`: tenant/header mismatch o `business_partner_id` ajeno al usuario.
- `404 E3000`: tenant no encontrado o inactivo.
- `409 E4000`: email ya registrado.
- `429 E1005`: rate limit de auth/registro.
- `422`: payload invalido por schema.
