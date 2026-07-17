# Backend Contract

Contrato operativo para este frontend contra `simpleFastApi`.

## Bootstrap permitido

El frontend solo debe depender de estas variables de entorno:

```env
VITE_API_BASE_URL=https://api.ejemplo.com
VITE_ACCOUNT_ID=uuid-del-tenant
```

Todo el resto debe venir por API.

## Endpoints aprobados para storefront

### Bootstrap de tenant

```http
GET /api/accounts/{account_id}/ecommerce-config
```

Notas:
- público
- devuelve contrato canónico versionado
- es la única fuente de configuración visual y operativa del storefront
- expone categorías estructuradas y anidadas en `images.categories[]`, con `searchTerms`, `productCategories` y `subcategories`
- expone `shipping` para textos de envío y cargos flat-rate trazables dentro del checkout
- expone `newsletter` para endpoint, headers y textos configurables del bloque de suscripción
- expone `registration` para campos/textos de registro configurables por tenant
- expone `loan` para habilitar préstamo como medio de pago y mostrar cuotas estimadas
- expone `ui` para textos transversales de navegación, auth, producto, carrito, checkout y footer

### Observabilidad frontend

```http
POST /api/accounts/{account_id}/frontend-events
```

Notas:
- público y controlado por tenant
- usar solo cuando `observability.enabled=true` en `ecommerce-config`

### Auth y registro

```http
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me
POST /api/simple/register-customer
POST /api/simple/register-supplier
```

Reglas operativas:
- `POST /api/auth/login` y `POST /api/simple/register-customer` resuelven el tenant por `X-Account-ID` o `X-Account-Slug`
- `POST /api/simple/register-supplier` usa el mismo body que `register-customer`; crea `business_partner` con `partner_type=supplier` y usuario con rol `customer`
- `GET /api/auth/me` y `POST /api/auth/logout` resuelven la sesión por `Authorization: Bearer <token>` y validan que, si se envía `X-Account-ID` o `X-Account-Slug`, coincidan con el tenant activo del token
- el token JWT es la fuente de verdad de la cuenta activa autenticada
- `business_partner_id` debe leerse directamente de `data.business_partner_id`
- `data.customer.business_partner_id` se expone además como redundancia explícita para storefront
- `POST /api/simple/register-customer` es storefront-only: siempre crea usuario con rol `customer`

Shape resumido:
- `POST /api/auth/login`
  - request: `{ "email": "<email-o-username>", "password": "<password>" }`
  - response: `access_token`, `token_type`, `user`, `account`, `accessible_accounts`, `customer`, `business_partner_id`
- `GET /api/auth/me`
  - response: `account`, `accessible_accounts`, `user`, `person`, `billing`, `shipping`, `customer`, `business_partner_id`
- `POST /api/auth/logout`
  - response: `logged_out_at`, `token_revoked`, `account_id`
  - es idempotente a nivel cliente; si no puede blacklistar server-side, igualmente devuelve éxito operativo
- `POST /api/simple/register-customer`
  - request mínimo: `first_name`, `last_name`, `email`, `company_name`, `password`
  - response: `person_id`, `partner_id`, `business_partner_id`, `user_id`, `link_id`, `email`, `username`, `company_name`, `role`, `account_id`

Errores esperados:
- `401` `E3105`: credenciales inválidas
- `401` `E3106`: usuario inactivo
- `401`: token inválido o expirado
- `403` `E3002`: tenant/header no coincide con la sesión o el usuario no pertenece al tenant solicitado
- `404` `E3000`: tenant no encontrado o inactivo
- `409` `E4000`: email ya registrado
- `429` `E1005`: rate limit excedido en login o registro
- `422`: request inválido por schema

### Productos

```http
GET /api/accounts/{account_id}/products
GET /api/accounts/{account_id}/products/public
GET /api/accounts/{account_id}/products/{product_id}
```

Notas:
- `GET /products/public` debe usarse para storefront anónimo
- `GET /products` debe usarse cuando existe token y el backend puede devolver información enriquecida
- no existe endpoint dedicado `products/{id}/variants`; las variantes se leen embebidas en `GET /products/{id}`

### Servicios de proveedor (marketplace)

```http
GET    /api/accounts/{account_id}/products?mine=true
POST   /api/accounts/{account_id}/products
PATCH  /api/accounts/{account_id}/products/{product_id}
```

Notas:
- requiere `Authorization: Bearer <token>`
- `mine=true` lista sólo productos del proveedor autenticado
- la propiedad se valida vía `metadata.provider.business_partner_id`
- el storefront usa estos endpoints desde `providerProductService` y `ProviderDashboard`

### Reseñas de producto

```http
GET  /api/accounts/{account_id}/products/{product_id}/reviews
GET  /api/accounts/{account_id}/products/{product_id}/reviews/summary
POST /api/accounts/{account_id}/products/{product_id}/reviews?business_partner_id={business_partner_id}
```

Body de `POST`:
```json
{
  "overall_rating": 1,
  "dimensions": {
    "service": 1,
    "cleanliness": 1,
    "punctuality": 1,
    "quality": 1
  },
  "comment": "opcional",
  "sales_order_id": "opcional"
}
```

Notas:
- `overall_rating` y cada dimensión van de 1 a 5
- el storefront consume summary + list desde `reviewService` y muestra el panel en detalle de producto

### Business partner (lectura propia)

```http
GET /api/accounts/{account_id}/business-partners/{business_partner_id}
```

Notas:
- el storefront usa `partner_type in ['supplier', 'both']` para habilitar `/proveedor`

### Checkout / órdenes

```http
POST /api/accounts/{account_id}/sales-orders
GET /api/accounts/{account_id}/sales-orders
GET /api/accounts/{account_id}/sales-orders/{order_id}
POST /api/accounts/{account_id}/sales-orders/validate-stock
POST /api/accounts/{account_id}/sales-orders/{order_id}/submit
POST /api/accounts/{account_id}/sales-orders/{order_id}/cancel-v2
POST /api/accounts/{account_id}/sales-orders/{order_id}/return
GET /api/accounts/{account_id}/sales-orders/{order_id}/storefront-status
POST /api/accounts/{account_id}/sales-orders/{order_id}/supplier-respond
POST /api/accounts/{account_id}/sales-orders/{order_id}/quality-ok
GET /api/accounts/{account_id}/sales-orders/{order_id}/status-history
GET /api/accounts/{account_id}/sales-orders/{order_id}/valid-transitions
POST /api/accounts/{account_id}/loans
GET /api/accounts/{account_id}/loans
GET /api/accounts/{account_id}/loans/{loan_id}
POST /api/accounts/{account_id}/loans/{loan_id}/payments
```

Notas:
- el storefront crea y envía órdenes, pero no crea pagos ni aprueba pagos
- si el método informado es `prestamo`, el storefront debe crear un préstamo en `/loans` luego de enviar la orden; `borrower_id` es el `business_partner_id`, `principal_amount` es el total de la orden y la metadata debe incluir `sales_order_id`, `sales_order_number` y plan estimado
- para mostrar estado de pago de préstamos, el storefront lista `/loans?borrower_id={business_partner_id}` y cruza por metadata de orden; en el detalle usa `/loans/{loan_id}/payments` para mostrar pagos y saldo pendiente
- el storefront lista/detalla sólo órdenes propias usando el `customer_id` del cliente autenticado
- el frontend solo informa el método/intención de pago en la metadata de la orden
- si `paymentMethods.prestamo=true` y `loan.enabled=true`, el storefront muestra préstamo como método de pago y calcula cuotas estimadas desde `loan.terms`
- la validación y confirmación del pago quedan del lado backend
- `/{order_id}/storefront-status` es la lectura aprobada para mostrar estado real de pago/envío sin invocar acciones backoffice
- `/{order_id}/confirm-payment` puede existir para procesos backend o backoffice, pero no debe invocarse desde este frontend
- `/{order_id}/ship`, `/{order_id}/deliver`, `/{order_id}/complete`, `/{order_id}/transition` e `/{order_id}/invoice` son backoffice/API interna, no storefront

### Favoritos del cliente

```http
GET    /api/accounts/{account_id}/customers/{business_partner_id}/favorites
POST   /api/accounts/{account_id}/customers/{business_partner_id}/favorites
DELETE /api/accounts/{account_id}/customers/{business_partner_id}/favorites/{product_id}
```

Reglas operativas:
- requiere `Authorization: Bearer <token>` y `X-Account-ID` (o `X-Account-Slug`)
- el backend DEBE validar que `business_partner_id` corresponde al usuario autenticado del token; si no, responder `403 E3002`
- `POST` es idempotente: si el favorito ya existe, devuelve `200/201` sin error (`UPSERT`)
- `DELETE` es idempotente: si no existe, responde `204` igualmente
- el orden de devolución de `GET` debe ser `created_at DESC`

Storage backend:
- tabla dedicada `customer_favorites(account_id UUID, business_partner_id UUID, product_id UUID, created_at TIMESTAMPTZ)`
- PK compuesta: `(account_id, business_partner_id, product_id)`
- índice secundario: `(account_id, business_partner_id, created_at DESC)` para listado
- elegida sobre `person_metadata.favorites` por escalabilidad, indexabilidad y trazabilidad temporal

Shape:
- `GET` response:
  ```json
  {
    "success": true,
    "data": [
      { "product_id": "uuid", "created_at": "2026-04-26T12:00:00Z" }
    ]
  }
  ```
- `POST` request: `{ "product_id": "uuid" }` → response `{ "success": true, "data": { "product_id": "uuid", "created_at": "..." } }`
- `DELETE` response: `204 No Content`

Errores esperados:
- `401`: token inválido o expirado
- `403` `E3002`: `business_partner_id` no pertenece al usuario del token
- `404` `E3000`: tenant no encontrado
- `404`: `product_id` inexistente en el catálogo del tenant (solo en `POST`)
- `422`: request inválido por schema

### Carrito del cliente

```http
GET    /api/accounts/{account_id}/customers/{business_partner_id}/cart
PUT    /api/accounts/{account_id}/customers/{business_partner_id}/cart
DELETE /api/accounts/{account_id}/customers/{business_partner_id}/cart
```

Reglas operativas:
- requiere `Authorization: Bearer <token>` y `X-Account-ID` (o `X-Account-Slug`)
- el backend DEBE validar que `business_partner_id` corresponde al usuario autenticado del token; si no, responder `403 E3002`
- `PUT` reemplaza el snapshot completo (UPSERT por `(account_id, business_partner_id)`); idempotente
- `DELETE` es idempotente: si no existe, responde `204` igualmente
- el backend **NO interpreta el JSON** del campo `cart`: lo guarda tal cual y se lo devuelve igual al `GET`. Es responsabilidad del storefront definir el shape y validarlo
- el snapshot persistido es referencial: stock, precios e inventario se re-validan en `POST /sales-orders` al cerrar la compra

Storage backend:
- tabla dedicada `simple_customer_carts(account_id UUID, business_partner_id UUID, cart JSONB, updated_at TIMESTAMPTZ)`
- PK compuesta: `(account_id, business_partner_id)` — un único snapshot por cliente
- migración: [`exports/backend-create-customer-carts.sql`](../exports/backend-create-customer-carts.sql)

Shape acordado del JSON `cart` (lo escribe el storefront):
```json
{
  "items": [
    {
      "line_id": "string",
      "product_id": "uuid",
      "variant_id": "uuid|null",
      "quantity": 2,
      "unit_price": 1234.56,
      "selected_options": { "color": "rojo" },
      "snapshot": {
        "name": "...",
        "image_url": "...",
        "sku": "...",
        "currency": "ARS"
      }
    }
  ],
  "currency": "ARS"
}
```

- `GET` response: `{ "success": true, "data": { "cart": { ...shape arriba... } } }` (también se acepta `data` plano)
- `PUT` request: `{ "cart": { ...shape arriba... } }` → response `{ "success": true, "data": { "updated_at": "..." } }`
- `DELETE` response: `204 No Content`

### Variantes de producto

```http
GET /api/accounts/{account_id}/products/{product_id}
```

El detalle de producto puede incluir:

- `has_variants: true`
- `variant_options[]` con valores `{ value, label, position }`
- `variants[]` con `id`, `sku`, `name`, `option_values`, `unit_price`, `effective_price`, stock, imagen y estado

El storefront usa `variants[]`/`variant_options[]` para seleccionar combinación y debe enviar `variant_id` en el checkout cuando agrega una variante al carrito.

Errores esperados:
- `401`: token inválido o expirado
- `403` `E3002`: `business_partner_id` no pertenece al usuario del token
- `404` `E3000`: tenant no encontrado
- `422`: request inválido por schema (`cart` ausente o `items` no es array)

## Sesión activa única por usuario (single-active-session)

Política: para un mismo `user_id`, **sólo el último login emitido es válido**. Cualquier token previo queda revocado en el instante en que se emite uno nuevo.

Reglas operativas:
- al ejecutar `POST /api/auth/login` con éxito, el backend UPSERT-ea el `jti` del nuevo `access_token` en la tabla `simple_user_active_sessions(user_id PRIMARY KEY, session_id, issued_at, user_agent, ip)`. Cualquier sesión anterior queda implícitamente revocada.
- en cada request autenticada (middleware), el backend valida que el `jti` del token coincide con el `session_id` vigente para ese `user_id`. Si no coincide, responde `401` con `detail = {"code": "E2005", "message": "..."}` (FastAPI envuelve el dict bajo `detail`).
- `POST /api/auth/logout` también borra el registro vigente del `user_id` (idempotente).
- `GET /api/auth/me` aplica la misma validación.
- `POST /api/auth/switch-account` reemplaza la sesión activa del usuario (genera nuevo `jti` y lo claimea).

Errores esperados:
- `401` `E2005` (alias histórico `E1010` / `SESSION_REVOKED` / `SESSION_SUPERSEDED`): sesión revocada por un login posterior. El storefront redirige a `/login?session=superseded` con cartel específico ("iniciaste sesión en otro dispositivo").
- `401` (cualquier otro motivo, p. ej. token expirado por TTL): el storefront redirige a `/login?session=expired`.

Notas de implementación:
- la tabla `simple_user_active_sessions` se scopea por `user_id` (no por `(account_id, user_id)`): un humano sólo debe estar logueado en un lugar a la vez aún cuando opere varios tenants.
- el `jti` del JWT es el `session_id`. Sin `jti` (tokens legacy) la política no aplica y el request pasa.

## Fuera de contrato

No depender de:

- `/api/integrations/*`
- `/api/integrations/bitrix24/*`
- acciones operativas de fulfillment o facturación de órdenes: `ship`, `deliver`, `complete`, `transition`, `invoice`
- rutas legacy no documentadas
- endpoints de variantes dedicadas

## Regla práctica

Si un endpoint no está en este archivo, no se considera aprobado para este storefront.

## Notas de Contrato para `ecommerce-config`

- `shipping.mode=flat_rate` con `shipping.chargeAmount>0` y `shipping.chargeProductId` habilita un cargo de envío trazable como línea separada dentro del payload de checkout.
- `shipping` y `newsletter` forman parte del contrato canónico del tenant; no deben inferirse desde variables de entorno ni hardcodearse en UI.
- `newsletter.endpoint` puede venir vacío o `null`; el storefront debe manejar esa ausencia sin romper bootstrap.
- `registration.fields` debe incluir al menos `email` y `password` visibles.
- `ui` forma parte del contrato canónico; los textos nuevos deben agregarse al backend antes de consumirse desde componentes.
- `ui.stockSemaforo` define umbrales y labels de stock para el storefront: `outOfStockLabel`, `lowLabel`, `mediumLabel`, `highLabel`, `lowThreshold`, `mediumThreshold` y `showQuantity`.
