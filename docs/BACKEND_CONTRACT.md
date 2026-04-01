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
```

Reglas operativas:
- `POST /api/auth/login` y `POST /api/simple/register-customer` resuelven el tenant por `X-Account-ID` o `X-Account-Slug`
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
- no existe contrato activo para `products/{id}/variants`

### Checkout / órdenes

```http
POST /api/accounts/{account_id}/sales-orders
POST /api/accounts/{account_id}/sales-orders/validate-stock
POST /api/accounts/{account_id}/sales-orders/{order_id}/submit
POST /api/accounts/{account_id}/sales-orders/{order_id}/ship
POST /api/accounts/{account_id}/sales-orders/{order_id}/deliver
POST /api/accounts/{account_id}/sales-orders/{order_id}/complete
POST /api/accounts/{account_id}/sales-orders/{order_id}/cancel-v2
POST /api/accounts/{account_id}/sales-orders/{order_id}/return
POST /api/accounts/{account_id}/sales-orders/{order_id}/transition
GET /api/accounts/{account_id}/sales-orders/{order_id}/status-history
GET /api/accounts/{account_id}/sales-orders/{order_id}/valid-transitions
POST /api/accounts/{account_id}/sales-orders/{order_id}/invoice
```

Notas:
- el storefront crea y envía órdenes, pero no crea pagos ni aprueba pagos
- el frontend solo informa el método/intención de pago en la metadata de la orden
- la validación y confirmación del pago quedan del lado backend
- `/{order_id}/confirm-payment` puede existir para procesos backend o backoffice, pero no debe invocarse desde este frontend
- `generate-invoice` ya no forma parte del contrato activo

## Fuera de contrato

No depender de:

- `/api/integrations/*`
- `/api/integrations/bitrix24/*`
- rutas legacy no documentadas
- endpoints de variantes dedicadas

## Regla práctica

Si un endpoint no está en este archivo, no se considera aprobado para este storefront.
