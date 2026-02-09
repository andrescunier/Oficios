# Simple Gestión API — Referencia Técnica Completa

> **Versión**: `1.2.1` | **Última actualización**: 2026-02-08  
> **Base URL**: `https://{host}/api`  
> **Formato**: JSON (Content-Type: `application/json`)  
> **Compresión**: GZip automático para respuestas > 500 bytes

---

## Tabla de Contenidos

1. [Arquitectura General](#1-arquitectura-general)
2. [Autenticación y Autorización](#2-autenticación-y-autorización)
3. [Formato de Respuestas](#3-formato-de-respuestas)
4. [Códigos de Error](#4-códigos-de-error)
5. [Rate Limiting](#5-rate-limiting)
6. [Headers Requeridos](#6-headers-requeridos)
7. [Endpoints del Sistema](#7-endpoints-del-sistema)
8. [Auth](#8-auth)
9. [Accounts y Memberships](#9-accounts-y-memberships)
10. [Users](#10-users)
11. [People](#11-people)
12. [Person Documents](#12-person-documents)
13. [Business Partners](#13-business-partners)
14. [Partner Users](#14-partner-users)
15. [Addresses](#15-addresses)
16. [Products](#16-products)
17. [Inventory](#17-inventory)
18. [Sales Orders](#18-sales-orders)
19. [Deliveries](#19-deliveries)
20. [Invoices](#20-invoices)
21. [Payments](#21-payments)
22. [Cash Registers](#22-cash-registers)
23. [Bank Accounts](#23-bank-accounts)
24. [Transactions](#24-transactions)
25. [Logistics](#25-logistics)
26. [Integrations](#26-integrations)
27. [Simple Registration](#27-simple-registration)
28. [Flujo de Implementación E-Commerce](#28-flujo-de-implementación-e-commerce)
29. [Resumen de Endpoints](#29-resumen-de-endpoints)

---

## 1. Arquitectura General

### Stack Tecnológico

| Componente | Tecnología |
|---|---|
| Framework | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.x con mapped_column |
| Base de datos | PostgreSQL 15+ |
| Migraciones | Alembic |
| Autenticación | JWT (HS256) via PyJWT + bcrypt |
| Cache / Sessions | Redis (opcional) |
| Rate Limiting | SlowAPI (distribuido con Redis) |
| Validación | Pydantic v2 |
| Métricas | Prometheus (endpoint `/metrics`) |
| Compresión | GZip Middleware (> 500 bytes) |

### Multi-Tenancy

La API implementa **multi-tenancy a nivel de cuenta (Account)**. Cada recurso pertenece a una cuenta específica y el aislamiento se garantiza a través del `account_id` en cada request.

**Modelo de acceso**:
- Un **User** pertenece a una cuenta primaria (`account_id` directo)
- Un **User** puede tener **Memberships** a cuentas adicionales con roles específicos
- Se soporta **estructura de holding** (cuentas padre-hijo, máximo 3 niveles)

### Roles disponibles

| Rol | Permisos |
|---|---|
| `sysadmin` | Acceso total al sistema |
| `admin` | Administración completa de la cuenta |
| `operator` | Operaciones CRUD estándar |
| `viewer` | Solo lectura |

---

## 2. Autenticación y Autorización

### Flujo de Autenticación

```
┌─────────────┐       ┌─────────────┐       ┌──────────────┐
│   Frontend   │──────▶│  POST /auth │──────▶│  JWT Token   │
│              │       │  /login     │       │  + user_id   │
└─────────────┘       └─────────────┘       └──────┬───────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │ Authorization│
                                            │ Bearer {jwt} │
                                            └──────────────┘
```

### Headers de Autenticación

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Payload del JWT

```json
{
  "sub": "<user_id>",
  "exp": 1738800000,
  "account_id": "<account_id>",
  "role": "admin"
}
```

### Configuración de Token

| Parámetro | Valor por defecto | Variable de entorno |
|---|---|---|
| Algoritmo | HS256 | `TOKEN_ALGORITHM` |
| Expiración | 60 minutos | `ACCESS_TOKEN_EXPIRE_MINUTES` |
| Secret Key | (obligatorio) | `SECRET_KEY` |

### Revocación de Tokens

Los tokens se revocan agregándolos a una **blacklist en Redis**. Si Redis no está disponible, la revocación no es posible (el token expirará por TTL).

---

## 3. Formato de Respuestas

### Respuesta Exitosa Estándar

```json
{
  "success": true,
  "message": "Operación realizada exitosamente",
  "data": { ... },
  "timestamp": "2026-02-08T12:00:00Z"
}
```

### Respuesta de Operación CRUD

```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": { ... },
  "operation": "create",
  "entity_type": "product",
  "entity_id": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-08T12:00:00Z"
}
```

### Respuesta Paginada

```json
{
  "success": true,
  "message": "Datos obtenidos exitosamente",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "per_page": 50,
    "total": 120,
    "total_pages": 3
  },
  "timestamp": "2026-02-08T12:00:00Z"
}
```

### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "E3400",
    "message": "Producto no encontrado",
    "details": { "product_id": "..." },
    "timestamp": "2026-02-08T12:00:00Z"
  }
}
```

### Respuesta de Acción

```json
{
  "id": "550e8400-...",
  "status": "delivered",
  "detail": "Entrega marcada como delivered"
}
```

---

## 4. Códigos de Error

### Errores Generales (E1000-E1999)

| Código | Descripción | HTTP Status |
|---|---|---|
| `E1000` | Error inesperado del sistema | 500 |
| `E1001` | Error de validación en los datos enviados | 422 |
| `E1002` | Error en la base de datos | 500 |
| `E1003` | Error de configuración del sistema | 500 |
| `E1004` | Error en servicio externo | 502 |
| `E1005` | Límite de peticiones excedido | 429 |

### Errores de Autenticación (E2000-E2999)

| Código | Descripción | HTTP Status |
|---|---|---|
| `E2000` | No autorizado | 401 |
| `E2001` | Acceso denegado | 403 |
| `E2002` | Token expirado | 401 |
| `E2003` | Token inválido | 401 |
| `E2004` | Permisos insuficientes | 403 |

### Errores de Entidades (E3000-E3999)

| Rango | Entidad |
|---|---|
| `E3000-E3099` | Accounts |
| `E3100-E3199` | Users |
| `E3200-E3299` | People |
| `E3300-E3399` | Business Partners |
| `E3400-E3499` | Products |
| `E3500-E3599` | Sales Orders |
| `E3600-E3699` | Invoices |
| `E3700-E3799` | Payments |
| `E3800-E3899` | Deliveries |
| `E3900-E3999` | Addresses |
| `E3950-E3999` | Integridad Referencial |

### Errores de Registro (E4000-E4099)

| Código | Descripción |
|---|---|
| `E4000` | El email ya está registrado |
| `E4001` | Error de validación en el registro |
| `E4006` | Formato de email inválido |
| `E4007` | La contraseña no cumple con los requisitos |

### Errores de Memberships (E4100-E4199)

| Código | Descripción |
|---|---|
| `E4100` | Membresía no encontrada |
| `E4101` | El usuario ya tiene membresía en esta cuenta |

---

## 5. Rate Limiting

El rate limiting es **configurable y deshabilitado por defecto** (se recomienda usar Cloudflare en producción).

| Tipo | Límite por defecto | Variable de entorno |
|---|---|---|
| Auth (login) | 5/minuto | `RATE_LIMIT_AUTH` |
| Endpoints públicos | 60/minuto | `RATE_LIMIT_PUBLIC` |
| Endpoints autenticados | 120/minuto | `RATE_LIMIT_DEFAULT` |
| Habilitar/Deshabilitar | `false` | `RATE_LIMIT_ENABLED` |

### Respuesta al exceder el límite

```
HTTP 429 Too Many Requests
```
```json
{
  "success": false,
  "error": {
    "code": "E1005",
    "message": "Demasiadas solicitudes. Por favor, espera antes de intentar de nuevo.",
    "details": { "retry_after": "1 per 1 minute" }
  }
}
```

### IP del cliente

La IP se resuelve en este orden de prioridad:
1. `CF-Connecting-IP` (Cloudflare)
2. `X-Forwarded-For` (primer IP)
3. `X-Real-IP`
4. IP directa del socket

---

## 6. Headers Requeridos

| Header | Requerido | Descripción |
|---|---|---|
| `Authorization` | En endpoints autenticados | `Bearer {jwt_token}` |
| `Content-Type` | En POST/PATCH/PUT | `application/json` |
| `X-Account-ID` | En algunos endpoints | UUID de la cuenta activa |
| `X-Account-Slug` | Alternativo a X-Account-ID | Slug de la cuenta activa |
| `X-External-Access-Token` | En integraciones | Token de servicio externo |

### Respuesta Headers

| Header | Descripción |
|---|---|
| `X-Request-ID` | UUID único para tracking/debugging |

---

## 7. Endpoints del Sistema

Estos endpoints **no requieren autenticación** y son utilizados para health checks y observabilidad.

### `GET /`
Información básica de la API.

**Response:**
```json
{ "message": "Simple Gestion API", "version": "1.2.1" }
```

### `GET /version`
Información detallada de versión.

### `GET /health`
Health check básico (Kubernetes liveness probe).
```json
{ "status": "ok" }
```

### `GET /health/live`
Liveness probe — el pod está corriendo.
```json
{ "status": "alive", "version": "1.2.1" }
```

### `GET /health/ready`
Readiness probe — verifica DB y Redis.
```json
{
  "status": "ready",
  "checks": {
    "database": { "status": "ok" },
    "redis": { "status": "ok", "version": "7.0.0" }
  },
  "version": "1.2.1"
}
```
> Retorna **503** si la base de datos no está disponible.

### `GET /metrics`
Métricas en formato Prometheus para scraping.

---

## 8. Auth

**Prefijo**: `/api/auth`  
**Tags**: `auth`

### 8.1 `POST /api/auth/token`

Login OAuth2 estándar. Retorna JWT.

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `username` | Body (form) | string | Sí | Email del usuario |
| `password` | Body (form) | string | Sí | Contraseña |
| `scopes` | Body (form) | string | No | Scopes OAuth2 (ej: `"account:{account_id}"`) |

**Content-Type**: `application/x-www-form-urlencoded`

**Response** (`200`):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user_id": "550e8400-..."
}
```

**Ejemplo cURL:**
```bash
curl -X POST https://api.example.com/api/auth/token \
  -d "username=admin@empresa.com&password=secreto123"
```

---

### 8.2 `POST /api/auth/login`

Login JSON alternativo con datos ampliados.

**Request Body:**
```json
{
  "email": "admin@empresa.com",
  "password": "secreto123"
}
```

**Response** (`200`):
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user_id": "550e8400-...",
    "user": {
      "id": "550e8400-...",
      "email": "admin@empresa.com",
      "role": "admin"
    },
    "accounts": [
      {
        "id": "660e8400-...",
        "name": "Mi Empresa",
        "slug": "mi-empresa",
        "role": "admin",
        "is_default": true
      }
    ]
  }
}
```

---

### 8.3 `POST /api/auth/switch-account` 🔐

Cambia la cuenta activa del usuario y genera un nuevo JWT con el contexto de la cuenta seleccionada.

**Request Body:**
```json
{
  "account_id": "770e8400-..."
}
```

**Response** (`200`):
```json
{
  "success": true,
  "message": "Cuenta cambiada exitosamente",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...(nuevo)...",
    "account": { "id": "770e8400-...", "name": "Otra Cuenta" }
  }
}
```

---

### 8.4 `GET /api/auth/my-accounts` 🔐

Lista todas las cuentas accesibles para el usuario autenticado (cuenta propia + memberships).

**Response** (`200`):
```json
{
  "success": true,
  "message": "Cuentas accesibles",
  "data": [
    {
      "id": "660e8400-...",
      "name": "Mi Empresa",
      "slug": "mi-empresa",
      "role": "admin",
      "is_default": true,
      "country_code": "AR",
      "default_currency": "ARS"
    }
  ]
}
```

---

### 8.5 `POST /api/auth/logout` 🔐

Cierra sesión y revoca el token (requiere Redis).

**Response** (`200`):
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

### 8.6 `GET /api/auth/me` 🔐

Perfil completo del usuario actual con datos de persona, direcciones de facturación y envío.

**Response** (`200`):
```json
{
  "success": true,
  "message": "Perfil obtenido",
  "data": {
    "user": {
      "id": "550e8400-...",
      "email": "admin@empresa.com",
      "role": "admin"
    },
    "person": {
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "admin@empresa.com",
      "phone": "+5491155667788"
    },
    "billing_address": { ... },
    "shipping_address": { ... }
  }
}
```

---

## 9. Accounts y Memberships

**Prefijo**: `/api/accounts`  
**Tags**: `accounts`

### 9.1 `POST /api/accounts`

Crea una nueva cuenta (tenant).

**Request Body:**
```json
{
  "name": "Mi Empresa SRL",
  "slug": "mi-empresa-srl",
  "default_currency": "ARS",
  "timezone": "America/Argentina/Buenos_Aires",
  "country_code": "AR",
  "parent_account_id": null,
  "status": "active",
  "metadata": { "industry": "retail" }
}
```

**Response** (`201`): `AccountRead`

---

### 9.2 `GET /api/accounts`

Lista cuentas accesibles. Requiere `X-Account-ID` o `X-Account-Slug` en headers.

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `status` | Query | string | No | Filtrar por estado |
| `X-Account-ID` | Header | UUID | Condicional | ID de cuenta |
| `X-Account-Slug` | Header | string | Condicional | Slug de cuenta |

**Response** (`200`): `List[AccountRead]`

---

### 9.3 `GET /api/accounts/{account_id}` 🔐

Detalle de una cuenta específica.

---

### 9.4 `PATCH /api/accounts/{account_id}` 🔐

Actualiza una cuenta.

**Request Body** (todos los campos son opcionales):
```json
{
  "name": "Nuevo Nombre",
  "default_currency": "USD",
  "timezone": "UTC",
  "status": "active"
}
```

---

### 9.5 `DELETE /api/accounts/{account_id}` 🔐 (admin/sysadmin)

Soft-delete de la cuenta (cambia status a `deleted`).

**Response**: `204 No Content`

---

### 9.6 `GET /api/accounts/{account_id}/children` 🔐

Lista cuentas hijas directas (modelo holding).

---

### 9.7 `GET /api/accounts/{account_id}/tree` 🔐

Árbol jerárquico de cuentas con hasta 3 niveles de profundidad.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Holding Corp",
    "children": [
      {
        "id": "...",
        "name": "Subsidiaria A",
        "children": [
          { "id": "...", "name": "Sucursal 1" }
        ]
      }
    ]
  }
}
```

---

### 9.8 `GET /api/accounts/{account_id}/memberships` 🔐 (admin/sysadmin)

Lista membresías de usuarios en la cuenta.

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `status` | Query | string | No | Filtrar por estado de membresía |

---

### 9.9 `POST /api/accounts/{account_id}/memberships` 🔐 (admin/sysadmin)

Crea o reactiva una membresía de usuario en la cuenta.

**Request Body:**
```json
{
  "user_id": "550e8400-...",
  "account_id": "660e8400-...",
  "role": "operator",
  "is_default": false
}
```

---

### 9.10 `PATCH /api/accounts/{account_id}/memberships/{membership_id}` 🔐 (admin/sysadmin)

Actualiza rol o estado de una membresía.

**Request Body:**
```json
{
  "role": "admin",
  "is_default": true,
  "status": "active"
}
```

---

### 9.11 `DELETE /api/accounts/{account_id}/memberships/{membership_id}` 🔐 (admin/sysadmin)

Revoca membresía (soft-delete → status `revoked`).

---

## 10. Users

**Prefijo**: `/api/accounts/{account_id}/users`  
**Tags**: `users`

### 10.1 `POST /api/accounts/{account_id}/users` 🔐 (admin/sysadmin)

Crea un usuario en la cuenta. La contraseña se hashea automáticamente con bcrypt.

**Request Body:**
```json
{
  "person_id": "550e8400-...",
  "email": "nuevo@empresa.com",
  "username": "nuevo_user",
  "password": "SecurePass123!",
  "role": "operator",
  "status": "active"
}
```

**Response** (`201`):
```json
{
  "id": "880e8400-...",
  "account_id": "660e8400-...",
  "person_id": "550e8400-...",
  "email": "nuevo@empresa.com",
  "username": "nuevo_user",
  "role": "operator",
  "status": "active",
  "last_login_at": null
}
```

---

### 10.2 `GET /api/accounts/{account_id}/users` 🔐

Lista usuarios con filtros opcionales.

| Parámetro | Ubicación | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|---|
| `role` | Query | string | No | — | Filtrar por rol |
| `status` | Query | string | No | — | Filtrar por estado |
| `limit` | Query | int | No | 50 | Máximo: 200 |
| `offset` | Query | int | No | 0 | Desplazamiento |

---

### 10.3 `GET /api/accounts/{account_id}/users/{user_id}` 🔐

Obtiene un usuario por ID.

---

### 10.4 `PATCH /api/accounts/{account_id}/users/{user_id}` 🔐

Actualiza datos del usuario.

**Request Body:**
```json
{
  "email": "actualizado@empresa.com",
  "username": "nombre_nuevo",
  "password": "NuevaPass456!"
}
```

---

### 10.5 `DELETE /api/accounts/{account_id}/users/{user_id}` 🔐

Soft-delete (cambia status a `inactive`).

**Response**: `204 No Content`

---

## 11. People

**Prefijo**: `/api/accounts/{account_id}/people`  
**Tags**: `people`

### 11.1 `POST /api/accounts/{account_id}/people` 🔐

Crea una persona física.

**Request Body:**
```json
{
  "first_name": "Juan",
  "last_name": "Pérez",
  "email": "juan@email.com",
  "phone": "+5491155667788",
  "birth_date": "1990-05-15",
  "metadata": { "source": "web" }
}
```

**Response** (`201`): `PersonRead`

---

### 11.2 `GET /api/accounts/{account_id}/people` 🔐

Lista personas vinculadas a la cuenta.

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `q` | Query | string | No | Búsqueda en nombre, apellido y email |

---

### 11.3 `GET /api/accounts/{account_id}/people/{person_id}` 🔐

Obtiene una persona por ID.

---

### 11.4 `PATCH /api/accounts/{account_id}/people/{person_id}` 🔐

Actualiza datos de la persona.

---

### 11.5 `DELETE /api/accounts/{account_id}/people/{person_id}` 🔐

Elimina persona. **Falla si tiene vínculos con usuarios u otras entidades.**

**Response**: `204 No Content`

---

## 12. Person Documents

**Prefijo**: `/api/accounts/{account_id}/people/{person_id}/documents`  
**Tags**: `person-documents`

### 12.1 `POST .../documents` 🔐

Crea un documento de identidad para una persona.

**Request Body:**
```json
{
  "country_code": "AR",
  "document_type": "DNI",
  "document_number": "34567890",
  "status": "verified",
  "verified_at": "2026-01-15T10:00:00Z",
  "extra": { "issuer": "RENAPER" }
}
```

**Response** (`201`): `PersonDocumentRead`

---

### 12.2 `GET .../documents` 🔐

Lista todos los documentos de una persona.

---

### 12.3 `PATCH .../documents/{document_id}` 🔐

Actualiza estado o datos de un documento.

---

### 12.4 `DELETE .../documents/{document_id}` 🔐

Elimina un documento.

**Response**: `204 No Content`

---

## 13. Business Partners

**Prefijo**: `/api/accounts/{account_id}/business-partners`  
**Tags**: `partners`

### 13.1 `POST .../business-partners` 🔐

Crea un socio comercial (cliente, proveedor, o ambos).

**Request Body:**
```json
{
  "name": "Distribuidora ABC",
  "partner_type": "supplier",
  "person_id": "550e8400-...",
  "tax_id": "30-71234567-9",
  "default_currency": "ARS",
  "status": "active",
  "billing_address_id": "...",
  "shipping_address_id": "...",
  "metadata": { "credit_limit": 100000 }
}
```

**`partner_type`** valores válidos: `"customer"` | `"supplier"` | `"both"`

**Response** (`201`): `OperationResponse`

---

### 13.2 `GET .../business-partners` 🔐

Lista socios comerciales con paginación y filtros.

| Parámetro | Ubicación | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|---|
| `partner_type` | Query | string | No | — | `customer`, `supplier`, `both` |
| `status` | Query | string | No | — | Filtrar por estado |
| `q` | Query | string | No | — | Búsqueda por nombre |
| `page` | Query | int | No | 1 | Página |
| `per_page` | Query | int | No | 50 | Por página (máx 100) |

**Response**: `PaginatedResponse`

---

### 13.3 `GET .../business-partners/{partner_id}` 🔐

Obtiene un socio por ID.

---

### 13.4 `PATCH .../business-partners/{partner_id}` 🔐

Actualiza un socio.

---

### 13.5 `DELETE .../business-partners/{partner_id}` 🔐

Elimina un socio (hard delete).

**Response**: `204 No Content`

---

## 14. Partner Users

**Prefijo**: `/api/accounts/{account_id}/business-partners/{partner_id}/users`  
**Tags**: `partner-users`

### 14.1 `POST .../users` 🔐

Vincula un usuario del sistema con un socio comercial.

**Request Body:**
```json
{
  "business_partner_id": "770e8400-...",
  "user_id": "550e8400-...",
  "partner_role": "primary"
}
```

---

### 14.2 `GET .../users` 🔐

Lista vínculos usuario ↔ socio comercial.

---

### 14.3 `PATCH .../users/{link_id}` 🔐

Actualiza el rol del vínculo.

---

### 14.4 `DELETE .../users/{link_id}` 🔐

Elimina el vínculo.

**Response**: `204 No Content`

---

## 15. Addresses

**Prefijo**: `/api/accounts/{account_id}/addresses`  
**Tags**: `addresses`

### Sistema de Direcciones Polimórficas

Las direcciones son **polimórficas** y pueden vincularse a distintas entidades a través de `addressable_type` y `addressable_id`.

**Valores válidos de `addressable_type`:**
- `account`
- `business_partner`
- `sales_order`
- `invoice`
- `person`
- `delivery`

### 15.1 `POST .../addresses` 🔐

**Request Body:**
```json
{
  "addressable_type": "business_partner",
  "addressable_id": "770e8400-...",
  "line1": "Av. Corrientes 1234",
  "line2": "Piso 5, Oficina A",
  "city": "Buenos Aires",
  "state": "CABA",
  "postal_code": "C1043AAZ",
  "country_code": "AR",
  "is_primary": true
}
```

**Response** (`201`): `AddressRead`

---

### 15.2 `GET .../addresses` 🔐
### 15.3 `GET .../addresses/{address_id}` 🔐
### 15.4 `PATCH .../addresses/{address_id}` 🔐
### 15.5 `DELETE .../addresses/{address_id}` 🔐

CRUD estándar. Delete retorna `204`.

---

## 16. Products

**Prefijo**: `/api/accounts/{account_id}/products`  
**Tags**: `products`

### 16.1 `POST .../products` 🔐

Crea un producto con inventario integrado.

**Request Body:**
```json
{
  "sku": "PROD-001",
  "name": "Camiseta Básica",
  "description": "Camiseta de algodón 100%",
  "unit_price": 29.99,
  "currency": "USD",
  "tax_rate": 0.21,
  "status": "active",
  "stock_quantity": 100.0,
  "stock_unit": "unit",
  "stock_min": 10.0,
  "stock_max": 500.0,
  "track_inventory": true,
  "allow_backorders": false,
  "image_url": "https://cdn.example.com/images/prod-001.jpg",
  "thumbnail_url": "https://cdn.example.com/thumbs/prod-001.jpg",
  "gallery_urls": [
    "https://cdn.example.com/gallery/prod-001-1.jpg",
    "https://cdn.example.com/gallery/prod-001-2.jpg"
  ],
  "metadata": { "category": "ropa", "brand": "BasicWear" }
}
```

**Response** (`201`): `OperationResponse`

> **Nota**: El SKU debe ser **único por cuenta**.

---

### 16.2 `GET .../products` 🔐 / 🔓

Lista productos con filtros avanzados. **Un usuario autenticado ve precios y stock; un usuario anónimo NO.**

| Parámetro | Ubicación | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|---|
| `status` | Query | string | No | — | Estado del producto |
| `sku` | Query | string | No | — | SKU exacto |
| `name` | Query | string | No | — | Nombre exacto |
| `search` | Query | string | No | — | Búsqueda en nombre y SKU |
| `category` | Query | string | No | — | Filtrar por categoría (metadata) |
| `min_price` | Query | float | No | — | Precio mínimo |
| `max_price` | Query | float | No | — | Precio máximo |
| `in_stock` | Query | bool | No | — | Solo productos con stock > 0 |
| `is_active` | Query | bool | No | — | Solo productos activos |
| `is_featured` | Query | bool | No | — | Solo productos destacados |
| `sort_by` | Query | string | No | `name` | `name`, `price`, `stock`, `sku` |
| `sort_order` | Query | string | No | `asc` | `asc`, `desc` |
| `page` | Query | int | No | 1 | Página |
| `per_page` | Query | int | No | 50 | Por página |

---

### 16.3 `GET .../products/low-stock` 🔐

Productos con stock por debajo del mínimo configurado.

---

### 16.4 `GET .../products/public` 🔓

Vista pública de productos (sin precios, sin stock, solo activos).

---

### 16.5 `GET .../products/{product_id}` 🔐 / 🔓

Obtiene un producto. Sin auth solo se ven productos activos y sin precios.

---

### 16.6 `PATCH .../products/{product_id}` 🔐
### 16.7 `DELETE .../products/{product_id}` 🔐

Actualización y eliminación estándar.

---

### 16.8 `PATCH .../products/{product_id}/stock` 🔐

**Ajuste de stock atómico** con `SELECT FOR UPDATE` para prevenir race conditions.

**Request Body:**
```json
{
  "quantity": 50,
  "operation": "add",
  "reason": "Reposición de stock",
  "reference": "PO-2026-001"
}
```

**`operation`** valores válidos:
- `"set"` — Establece la cantidad exacta
- `"add"` — Suma a la cantidad actual
- `"subtract"` — Resta de la cantidad actual

**Response**: `OperationResponse` (con stock anterior y nuevo en `data`)

---

## 17. Inventory

**Prefijo**: `/api/accounts/{account_id}/inventory`  
**Tags**: `inventory`

### 17.1 `POST .../inventory/movements` 🔐

Registra un movimiento de stock **atómico** con `SELECT FOR UPDATE`.

**Request Body:**
```json
{
  "product_id": "550e8400-...",
  "quantity": 25.0,
  "movement_type": "in",
  "reason": "Compra a proveedor",
  "reference": "COMP-2026-0042"
}
```

**`movement_type`**: `"in"` | `"out"`

**Response**: `OperationResponse`
```json
{
  "success": true,
  "data": {
    "id": "...",
    "stock_before": 75.0,
    "stock_after": 100.0,
    "quantity": 25.0,
    "movement_type": "in",
    "reason": "Compra a proveedor"
  }
}
```

---

### 17.2 `GET .../inventory/movements` 🔐

Historial de movimientos de stock.

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `product_id` | Query | UUID | No | Filtrar por producto |

---

## 18. Sales Orders

**Prefijo**: `/api/accounts/{account_id}/sales-orders`  
**Tags**: `orders`

> **Este módulo implementa una máquina de estados completa para el ciclo de vida de pedidos e-commerce.**

### Diagrama de Estados

```
                    ┌──────────┐
                    │  DRAFT   │
                    └────┬─────┘
                         │ submit
                    ┌────▼──────────┐
                    │PENDING_PAYMENT│
                    └────┬──────────┘
                         │ confirm-payment
                    ┌────▼──────┐
                    │ CONFIRMED │
                    └────┬──────┘
                         │ (auto)
                    ┌────▼──────┐
                    │ PREPARING │
                    └────┬──────┘
                         │ ship
               ┌─────────▼──────────┐
               │      SHIPPED       │
               └─────────┬──────────┘
                         │ deliver
               ┌─────────▼──────────┐
               │     DELIVERED      │
               └─────────┬──────────┘
                         │ complete
               ┌─────────▼──────────┐
               │     COMPLETED      │
               └────────────────────┘

  Cualquier estado pre-envío ──▶ CANCELLED
  Post-entrega ──▶ RETURN_REQUESTED ──▶ RETURNED ──▶ REFUNDED
```

---

### 18.1 `POST .../sales-orders` 🔐

Crea una orden en estado `draft`.

**Request Body:**
```json
{
  "order_number": "ORD-2026-0001",
  "customer_id": "770e8400-...",
  "currency": "ARS",
  "issued_at": "2026-02-08T10:00:00Z",
  "due_at": "2026-03-08T10:00:00Z",
  "notes": "Entregar en horario comercial",
  "shipping_address_id": "...",
  "billing_address_id": "...",
  "validate_stock": true,
  "items": [
    {
      "product_id": "550e8400-...",
      "description": "Camiseta Básica Talle M",
      "quantity": 3,
      "unit_price": 29.99,
      "tax_rate": 0.21
    },
    {
      "product_id": "660e8400-...",
      "description": "Pantalón Cargo",
      "quantity": 1,
      "unit_price": 59.99,
      "tax_rate": 0.21
    }
  ],
  "metadata": { "source": "web", "coupon": "SUMMER2026" }
}
```

> **`customer_id`**: puede ser un `User.id` o un `BusinessPartner.id` — la API los resuelve automáticamente.

**Response** (`201`): `SuccessResponse` con la orden completa incluyendo `subtotal`, `tax_total`, `total`.

---

### 18.2 `GET .../sales-orders` 🔐

Lista órdenes con paginación y filtros.

| Parámetro | Ubicación | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|---|
| `status` | Query | string | No | — | Filtrar por estado |
| `customer_id` | Query | UUID | No | — | Filtrar por cliente |
| `page` | Query | int | No | 1 | Página |
| `per_page` | Query | int | No | 50 | Máximo: 100 |
| `order_by` | Query | string | No | `created_at` | `created_at`, `order_number`, `total`, `status` |
| `direction` | Query | string | No | `desc` | `asc`, `desc` |

**Response**: `SalesOrderListResponse`
```json
{
  "success": true,
  "data": [ ... ],
  "page": 1,
  "per_page": 50,
  "total": 120,
  "total_pages": 3
}
```

---

### 18.3 `GET .../sales-orders/{order_id}` 🔐

Orden con datos del cliente expandidos (nombre, email, tax_id) y direcciones.

---

### 18.4 `PATCH .../sales-orders/{order_id}` 🔐

Actualiza la orden. **Solo permitido en estado `draft`**.

---

### 18.5 `DELETE .../sales-orders/{order_id}` 🔐

Elimina la orden. **Solo permitido en estado `draft`**.

**Response**: `204 No Content`

---

### 18.6 `POST .../sales-orders/{order_id}/items` 🔐

Reemplaza **todos** los items de la orden (solo en estado `draft`).

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `validate_stock` | Query | bool | No | Validar stock al reemplazar |

**Request Body**: `List[SalesOrderItemCreate]`
```json
[
  {
    "product_id": "550e8400-...",
    "description": "Producto Actualizado",
    "quantity": 5,
    "unit_price": 19.99,
    "tax_rate": 0.21
  }
]
```

---

### 18.7 `POST .../sales-orders/{order_id}/confirm` 🔐

Confirma una orden (cambia de `draft` a `confirmed`). **Deduce stock atómicamente.**

| Parámetro | Ubicación | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|---|
| `deduct_stock` | Query | bool | No | `true` | Si debe deducir stock |

---

### 18.8 `POST .../sales-orders/{order_id}/cancel` 🔐

Cancela una orden.

| Parámetro | Ubicación | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|---|
| `reason` | Query | string | No | — | Motivo de cancelación |
| `restore_stock` | Query | bool | No | `true` | Si debe restaurar stock |

---

### 18.9 `POST .../sales-orders/{order_id}/complete` 🔐

Completa una orden (solo desde estado `delivered`).

---

### 18.10 `POST .../sales-orders/{order_id}/invoice` 🔐

Genera factura a partir de la orden.

**Request Body:**
```json
{
  "invoice_number": "FAC-2026-0001",
  "due_at": "2026-03-08T10:00:00Z",
  "status": "draft"
}
```

**Response** (`201`): `SuccessResponse` con la factura generada.

---

### 18.11 `POST .../sales-orders/{order_id}/generate-invoice` 🔐

Alias de endpoint `/invoice` (misma funcionalidad).

---

### 18.12 `POST .../sales-orders/validate-stock` 🔐

Valida disponibilidad de stock **sin crear una orden**.

**Request Body**: `List[SalesOrderItemCreate]`

**Response**: Disponibilidad por item.

---

### Endpoints de State Machine (flujo avanzado)

### 18.13 `POST .../sales-orders/{order_id}/submit` 🔐

**Transición**: `draft` → `pending_payment`  
**Efecto**: Reserva stock por tiempo configurado.

**Request Body:**
```json
{
  "validate_stock": true,
  "reservation_ttl_hours": 48,
  "event_id": "evt-unique-123",
  "notes": "Cliente confirmó por teléfono"
}
```

> **`event_id`** permite **idempotencia**: si se envía dos veces el mismo event_id, la segunda invocación retorna el resultado de la primera.

---

### 18.14 `POST .../sales-orders/{order_id}/confirm-payment` 🔐

**Transición**: `pending_payment` → `confirmed`  
**Efecto**: Convierte reservas de stock en deducciones reales.

**Request Body:**
```json
{
  "payment_reference": "PAY-STRIPE-abc123",
  "event_id": "evt-confirm-456"
}
```

---

### 18.15 `POST .../sales-orders/{order_id}/ship` 🔐

**Transición**: `preparing` → `shipped`

**Request Body:**
```json
{
  "tracking_number": "AR123456789",
  "carrier": "OCA",
  "estimated_delivery": "2026-02-15T18:00:00Z",
  "event_id": "evt-ship-789"
}
```

---

### 18.16 `POST .../sales-orders/{order_id}/deliver` 🔐

**Transición**: `shipped` → `delivered`

---

### 18.17 `POST .../sales-orders/{order_id}/cancel-v2` 🔐

Cancelación avanzada con soporte de state machine e idempotencia.

**Request Body:**
```json
{
  "reason": "Cliente solicitó cancelación",
  "event_id": "evt-cancel-abc",
  "restore_stock": true
}
```

---

### 18.18 `POST .../sales-orders/{order_id}/return` 🔐

Procesa devolución de items con distintas condiciones.

**Request Body:**
```json
{
  "items": [
    {
      "order_item_id": "item-uuid-...",
      "quantity": 2,
      "condition": "sellable",
      "reason": "No era el talle correcto"
    },
    {
      "order_item_id": "item-uuid-...",
      "quantity": 1,
      "condition": "damaged",
      "reason": "Llegó roto"
    }
  ],
  "refund_amount": 89.97,
  "event_id": "evt-return-xyz"
}
```

**`condition`** valores:
- `"sellable"` — Se devuelve al stock
- `"damaged"` — No se devuelve al stock
- `"defective"` — No se devuelve al stock

---

### 18.19 `GET .../sales-orders/{order_id}/status-history` 🔐

Historial completo de transiciones de estado.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "from_status": "draft",
      "to_status": "pending_payment",
      "reason": null,
      "event_id": "evt-submit-123",
      "user_id": "550e8400-...",
      "created_at": "2026-02-08T10:30:00Z"
    },
    {
      "id": "...",
      "from_status": "pending_payment",
      "to_status": "confirmed",
      "reason": null,
      "event_id": "evt-confirm-456",
      "user_id": "550e8400-...",
      "created_at": "2026-02-08T11:00:00Z"
    }
  ]
}
```

---

### 18.20 `GET .../sales-orders/{order_id}/valid-transitions` 🔐

Transiciones válidas desde el estado actual.

**Response:**
```json
{
  "success": true,
  "data": {
    "current_status": "confirmed",
    "valid_transitions": ["preparing", "cancelled"],
    "can_cancel": true,
    "can_return": false
  }
}
```

---

### 18.21 `POST .../sales-orders/{order_id}/transition` 🔐

Transición genérica de estado (útil para estados intermedios).

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `to_status` | Query | string | **Sí** | Estado destino |

**Request Body** (opcional): `OrderStateTransitionRequest`

---

## 19. Deliveries

**Prefijo**: `/api/accounts/{account_id}/deliveries`  
**Tags**: `deliveries`

### 19.1 `POST .../deliveries` 🔐

Crea una entrega vinculada a una orden.

**Request Body:**
```json
{
  "sales_order_id": "550e8400-...",
  "delivery_number": "DEL-2026-0001",
  "status": "pending",
  "shipping_address_id": "...",
  "carrier_name": "OCA",
  "tracking_reference": "AR123456789",
  "tracking_url": "https://www.oca.com.ar/seguimiento/AR123456789",
  "estimated_arrival": "2026-02-15T18:00:00Z",
  "metadata": { "weight_kg": 2.5 }
}
```

**Efecto lateral**: Si la orden asociada está en `confirmed`, pasa automáticamente a `fulfilled`.

---

### 19.2 `GET .../deliveries` 🔐

| Parámetro | Ubicación | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|---|
| `status` | Query | string | No | — | `pending`, `in_transit`, `delivered`, `cancelled` |
| `limit` | Query | int | No | 50 | Máximo: 200 |
| `offset` | Query | int | No | 0 | Desplazamiento |

---

### 19.3 `GET .../deliveries/{delivery_id}` 🔐
### 19.4 `PATCH .../deliveries/{delivery_id}` 🔐
### 19.5 `DELETE .../deliveries/{delivery_id}` 🔐

Delete solo permitido en estado `pending` o `in_transit`.

---

### 19.6 `POST .../deliveries/{delivery_id}/complete` 🔐

Marca como `delivered`. Actualiza la orden asociada.

---

### 19.7 `POST .../deliveries/{delivery_id}/ship` 🔐

Marca como `in_transit` (solo desde `pending` o `preparing`).

---

### 19.8 `POST .../deliveries/{delivery_id}/deliver` 🔐

Marca como `delivered`. Actualiza la orden asociada.

---

### 19.9 `POST .../deliveries/{delivery_id}/cancel` 🔐

Cancela la entrega. **No permitido si ya está `delivered` o `cancelled`.**

---

## 20. Invoices

**Prefijo**: `/api/accounts/{account_id}/invoices`  
**Tags**: `invoices`

### 20.1 `POST .../invoices` 🔐

Crea una factura (manual o desde orden).

**Request Body:**
```json
{
  "invoice_number": "FAC-2026-0001",
  "sales_order_id": "550e8400-...",
  "customer_id": "770e8400-...",
  "currency": "ARS",
  "status": "draft",
  "issued_at": "2026-02-08T10:00:00Z",
  "due_at": "2026-03-08T10:00:00Z",
  "items": [
    {
      "description": "Camiseta Básica x3",
      "quantity": 3,
      "unit_price": 29.99,
      "tax_rate": 0.21
    }
  ],
  "metadata": { "fiscal_type": "A" }
}
```

---

### 20.2 `GET .../invoices` 🔐

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `status` | Query | string | No | `draft`, `sent`, `approved`, `void` |
| `customer_id` | Query | UUID | No | Filtrar por cliente |
| `limit` | Query | int | No | Máximo: 200 |
| `offset` | Query | int | No | Desplazamiento |

---

### 20.3 `GET .../invoices/{invoice_id}` 🔐

Obtiene factura con items detallados (`subtotal`, `tax_total`, `total`).

---

### 20.4 `PATCH .../invoices/{invoice_id}` 🔐

Solo permitido en estado `draft`.

---

### 20.5 `POST .../invoices/{invoice_id}/items` 🔐

Reemplaza **todos** los items de la factura (solo `draft`).

**Request Body**: `List[InvoiceItemCreate]`

---

### 20.6 `DELETE .../invoices/{invoice_id}` 🔐

Solo permitido en estado `draft`.

---

### 20.7 `POST .../invoices/{invoice_id}/send` 🔐

Envía la factura (`draft`/`approved` → `sent`).

---

### 20.8 `POST .../invoices/{invoice_id}/void` 🔐

Anula la factura. **Falla si tiene pagos aplicados.**

---

## 21. Payments

**Prefijo**: `/api/accounts/{account_id}/payments`  
**Tags**: `payments`

### 21.1 `POST .../payments` 🔐

Registra un pago recibido.

**Request Body:**
```json
{
  "payment_number": "PAY-2026-0001",
  "source_type": "customer",
  "partner_id": "770e8400-...",
  "currency": "ARS",
  "amount": 108.87,
  "method": "transfer",
  "reference": "TRF-BNA-12345",
  "received_at": "2026-02-08T14:00:00Z",
  "status": "received",
  "metadata": { "bank": "Banco Nación" }
}
```

**`method`** sugeridos: `"cash"`, `"transfer"`, `"credit_card"`, `"debit_card"`, `"check"`, `"mercadopago"`, `"stripe"`

---

### 21.2 `GET .../payments` 🔐

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `partner_id` | Query | UUID | No | Filtrar por socio |
| `status_filter` | Query | string | No | Filtrar por estado |

---

### 21.3 `GET .../payments/{payment_id}` 🔐
### 21.4 `PATCH .../payments/{payment_id}` 🔐

Actualización. **Falla si el pago tiene aplicaciones.**

### 21.5 `DELETE .../payments/{payment_id}` 🔐

**Falla si el pago tiene aplicaciones.**

---

### 21.6 `GET .../payments/{payment_id}/applications` 🔐

Lista a qué facturas/órdenes se aplicó este pago.

---

### 21.7 `POST .../payments/{payment_id}/applications` 🔐

Aplica un pago a una factura o una orden de venta. Usa `SELECT FOR UPDATE` para prevenir double-spending.

**Request Body:**
```json
{
  "invoice_id": "880e8400-...",
  "sales_order_id": null,
  "amount_applied": 108.87
}
```

> Debe proveer **`invoice_id`** o **`sales_order_id`** (o ambos).

---

### 21.8 `DELETE .../payments/{payment_id}/applications/{application_id}` 🔐

Elimina una aplicación de pago.

**Response**: `204 No Content`

---

## 22. Cash Registers

**Prefijo**: `/api/accounts/{account_id}/cash-registers`  
**Tags**: `cash-registers`

### 22.1 `POST .../cash-registers` 🔐

Crea una caja registradora (estado inicial: `closed`).

**Request Body:**
```json
{
  "name": "Caja Principal",
  "initial_balance": 5000.00
}
```

---

### 22.2 `POST .../cash-registers/{register_id}/open` 🔐

Abre la caja para el turno.

| Parámetro | Ubicación | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|---|
| `initial_amount` | Query | float | No | 0 | Monto inicial del turno |

---

### 22.3 `POST .../cash-registers/{register_id}/close` 🔐

Cierra la caja y registra el arqueo.

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `final_amount` | Query | float | **Sí** | Monto final declarado |

---

### 22.4 `POST .../cash-registers/{register_id}/movements` 🔐

Registra entrada o salida de efectivo **atómicamente**.

**Request Body:**
```json
{
  "amount": 1500.00,
  "movement_type": "income",
  "description": "Venta en efectivo - ORD-2026-0001",
  "metadata": { "order_id": "..." }
}
```

**`movement_type`**: `"income"` | `"expense"`

---

### 22.5 `GET .../cash-registers/{register_id}` 🔐

Estado actual y saldo de la caja.

---

### 22.6 `GET .../cash-registers` 🔐

Lista todas las cajas de la cuenta.

---

## 23. Bank Accounts

**Prefijo**: `/api/accounts/{account_id}/bank-accounts`  
**Tags**: `bank-accounts`

### 23.1 `POST .../bank-accounts` 🔐

**Request Body:**
```json
{
  "bank_name": "Banco Nación Argentina",
  "account_number": "0011-0000-00001234567-8",
  "currency": "ARS",
  "balance": 250000.00,
  "metadata": { "CBU": "0110000000012345678900" }
}
```

---

### 23.2 `GET .../bank-accounts` 🔐

Lista cuentas bancarias de la cuenta.

---

### 23.3 `POST .../bank-accounts/{bank_id}/transactions` 🔐

Registra una transacción bancaria **atómica**.

**Request Body:**
```json
{
  "amount": 50000.00,
  "transaction_type": "deposit",
  "description": "Depósito por transferencia",
  "reference": "TRF-20260208-001",
  "transaction_date": "2026-02-08T14:00:00Z"
}
```

**`transaction_type`**: `"deposit"` | `"withdrawal"`

---

## 24. Transactions

**Prefijo**: `/api/accounts/{account_id}/transactions`  
**Tags**: `transactions`

### 24.1 `POST .../transactions` 🔐

Registra un ingreso o egreso genérico.

**Request Body:**
```json
{
  "category": "ventas",
  "amount": 150000.00,
  "transaction_type": "income",
  "description": "Ventas del día 08/02/2026",
  "date": "2026-02-08T23:59:00Z",
  "metadata": { "source": "POS" }
}
```

**`transaction_type`**: `"income"` | `"expense"`

---

### 24.2 `GET .../transactions` 🔐

| Parámetro | Ubicación | Tipo | Requerido | Default | Descripción |
|---|---|---|---|---|---|
| `limit` | Query | int | No | 50 | Máximo: 200 |
| `offset` | Query | int | No | 0 | Desplazamiento |

---

## 25. Logistics

**Prefijo**: `/api` (sin prefijo adicional de módulo)  
**Tags**: `logistics`

### Warehouses (Almacenes)

### 25.1 `POST /api/warehouses` 🔐

**Request Body:**
```json
{
  "name": "Depósito Central",
  "code": "DEP-001",
  "address_id": "550e8400-...",
  "is_active": true,
  "metadata": { "capacity_m3": 500 }
}
```

---

### 25.2 `GET /api/warehouses` 🔐
### 25.3 `GET /api/warehouses/{warehouse_id}` 🔐
### 25.4 `PATCH /api/warehouses/{warehouse_id}` 🔐

CRUD estándar de almacenes.

---

### Inventory Levels (Niveles de inventario por almacén)

### 25.5 `POST /api/inventory-levels` 🔐

**Request Body:**
```json
{
  "warehouse_id": "550e8400-...",
  "product_id": "660e8400-...",
  "quantity": 100.0,
  "reserved_quantity": 5.0,
  "location_in_warehouse": "Pasillo A, Estante 3",
  "batch_number": "LOTE-2026-001",
  "expiration_date": "2027-02-08"
}
```

---

### 25.6 `GET /api/inventory-levels` 🔐

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `warehouse_id` | Query | UUID | No | Filtrar por almacén |
| `product_id` | Query | UUID | No | Filtrar por producto |

---

### 25.7 `PATCH /api/inventory-levels/{inventory_id}` 🔐

---

### Product Aliases (Alias de producto)

Permite múltiples identificadores para un mismo producto (EAN13, UPC, SKU de proveedor, etc.)

### 25.8 `POST /api/product-aliases` 🔐

**Request Body:**
```json
{
  "product_id": "550e8400-...",
  "alias": "7790001234567",
  "alias_type": "ean13",
  "partner_id": "770e8400-...",
  "is_primary": true
}
```

**`alias_type`** sugeridos: `"ean13"`, `"upc"`, `"supplier_sku"`, `"customer_sku"`

---

### 25.9 `GET /api/product-aliases` 🔐

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `product_id` | Query | UUID | No | Filtrar por producto |

---

### 25.10 `DELETE /api/product-aliases/{alias_id}` 🔐

---

### 25.11 `PATCH /api/deliveries/{delivery_id}/carrier` 🔐

Actualiza datos de carrier de una entrega.

**Request Body:**
```json
{
  "carrier_name": "Andreani",
  "tracking_reference": "ANDR-987654",
  "tracking_url": "https://www.andreani.com/seguimiento/ANDR-987654"
}
```

---

## 26. Integrations

**Prefijo**: `/api/integrations`  
**Tags**: `integrations`

> Todos los endpoints de integraciones requieren autenticación + `X-External-Access-Token` con el token del servicio externo.

### 26.1 `GET /api/integrations/mercadolibre/publications/{item_id}` 🔐

Obtiene una publicación de MercadoLibre.

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `item_id` | Path | string | Sí | ID de publicación MeLi (ej: `MLA123456`) |
| `X-External-Access-Token` | Header | string | Sí | Access token de MeLi |
| `client_id` | Query | string | No | Override de config |
| `client_secret` | Query | string | No | Override de config |

---

### 26.2 `GET /api/integrations/amazon/orders/{order_id}` 🔐

Obtiene una orden de Amazon SP-API.

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `order_id` | Path | string | Sí | ID de orden Amazon |
| `X-External-Access-Token` | Header | string | Sí | Access token Amazon |
| `client_id` | Query | string | No | Override de config |
| `client_secret` | Query | string | No | Override de config |
| `refresh_token` | Query | string | No | Refresh token Amazon |

---

### 26.3 `POST /api/integrations/bitrix24/crm/leads` 🔐

Crea un lead en Bitrix24 CRM.

**Request Body:**
```json
{
  "title": "Lead desde Web",
  "first_name": "María",
  "last_name": "García",
  "email": "maria@email.com",
  "phone": "+5491144556677",
  "additional_fields": { "SOURCE_ID": "WEB" }
}
```

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `webhook_url` | Query | string | No | Override de webhook Bitrix |
| `X-External-Access-Token` | Header | string | Condicional | Access token Bitrix |

---

### 26.4 `GET /api/integrations/bitrix24/inventory/{store_id}` 🔐

Obtiene inventario de un almacén en Bitrix24.

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `store_id` | Path | int | Sí | ID del almacén Bitrix |
| `webhook_url` | Query | string | No | Override de webhook |

---

## 27. Simple Registration

**Prefijo**: `/api/simple`  
**Tags**: `simple-registration`

> Endpoints de registro simplificado que crean múltiples entidades en una sola llamada. **No requieren autenticación** (solo `X-Account-ID` en header).

### 27.1 `GET /api/simple/health`

Health check del módulo de registro.

---

### 27.2 `POST /api/simple/register-customer`

Registro completo en una sola llamada: crea Person + BusinessPartner + User + vínculo PartnerUser.

**Headers requeridos**: `X-Account-ID`

**Request Body:**
```json
{
  "first_name": "Carlos",
  "last_name": "López",
  "email": "carlos@email.com",
  "company_name": "López Importaciones",
  "password": "SecurePass123!",
  "phone": "+5491133445566",
  "title": "Gerente"
}
```

**Response** (`201`): `OperationResponse`
```json
{
  "success": true,
  "message": "Cliente registrado exitosamente",
  "data": {
    "person_id": "...",
    "partner_id": "...",
    "user_id": "...",
    "link_id": "..."
  },
  "operation": "register_customer",
  "entity_type": "customer"
}
```

---

### 27.3 `POST /api/simple/quick-register`

Registro rápido vía query parameters (útil para formularios simples).

**Headers requeridos**: `X-Account-ID`

| Parámetro | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `email` | Query | string | Sí | Email del usuario |
| `password` | Query | string | Sí | Contraseña |
| `first_name` | Query | string | Sí | Nombre |
| `last_name` | Query | string | Sí | Apellido |
| `company_name` | Query | string | Sí | Nombre de empresa |
| `phone` | Query | string | No | Teléfono |
| `title` | Query | string | No | Cargo |

---

### 27.4 `GET /api/simple/check-email/{email}`

Verifica si un email está disponible para registro.

**Response:**
```json
{
  "success": true,
  "message": "Email disponible",
  "data": { "available": true }
}
```

---

### 27.5 `GET /api/simple/registration-stats`

**Headers requeridos**: `X-Account-ID`

Estadísticas de registros de la cuenta.

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 1250,
    "last_7_days": 45,
    "today": 8
  }
}
```

---

## 28. Flujo de Implementación E-Commerce

### Flujo Completo: Del Registro al Cobro

```
1. SETUP INICIAL
   ├── POST /api/accounts                    → Crear cuenta (tenant)
   ├── POST /api/accounts/{id}/people        → Crear persona (admin)
   └── POST /api/accounts/{id}/users         → Crear usuario admin

2. CATÁLOGO
   ├── POST .../products                     → Crear productos
   ├── PATCH .../products/{id}/stock         → Configurar stock inicial
   └── POST /api/warehouses                  → Crear almacenes (opcional)

3. REGISTRO DE CLIENTE
   └── POST /api/simple/register-customer    → Registro en una llamada

4. FLUJO DE COMPRA (frontend)
   ├── GET .../products/public               → Mostrar catálogo
   ├── POST /api/auth/login                  → Login del cliente
   ├── GET /api/auth/me                      → Datos para checkout
   ├── POST .../sales-orders                 → Crear orden (draft)
   ├── POST .../sales-orders/{id}/items      → Ajustar items
   └── POST .../sales-orders/validate-stock  → Validar stock pre-compra

5. PROCESAMIENTO DE PEDIDO
   ├── POST .../sales-orders/{id}/submit           → Reservar stock
   ├── POST .../sales-orders/{id}/confirm-payment  → Confirmar pago
   ├── POST .../sales-orders/{id}/ship             → Marcar enviado
   ├── POST .../sales-orders/{id}/deliver          → Marcar entregado
   └── POST .../sales-orders/{id}/complete         → Completar

6. FACTURACIÓN Y COBRO
   ├── POST .../sales-orders/{id}/invoice    → Generar factura
   ├── POST .../payments                     → Registrar pago
   └── POST .../payments/{id}/applications   → Aplicar pago a factura

7. DEVOLUCIONES (si aplica)
   ├── POST .../sales-orders/{id}/return     → Procesar devolución
   └── GET .../sales-orders/{id}/status-history → Auditoría
```

### Flujo POS (Punto de Venta)

```
1. POST .../cash-registers/{id}/open         → Abrir caja
2. POST .../sales-orders                     → Crear orden
3. POST .../sales-orders/{id}/confirm        → Confirmar (deduce stock)
4. POST .../payments                         → Registrar pago
5. POST .../cash-registers/{id}/movements    → Registrar en caja
6. POST .../sales-orders/{id}/invoice        → Facturar
7. POST .../cash-registers/{id}/close        → Cerrar caja
```

---

## 29. Resumen de Endpoints

| Módulo | Endpoints | Auth |
|---|---|---|
| System (health, version, metrics) | 5 | No |
| Auth | 6 | Mixto |
| Accounts + Memberships | 11 | Mixto |
| Users | 5 | Sí |
| People | 5 | Sí |
| Person Documents | 4 | Sí |
| Business Partners | 5 | Sí |
| Partner Users | 4 | Sí |
| Addresses | 5 | Sí |
| Products + Stock | 8 | Mixto (público/autenticado) |
| Inventory Movements | 2 | Sí |
| Sales Orders (State Machine) | 21 | Sí |
| Deliveries | 9 | Sí |
| Invoices | 8 | Sí |
| Payments + Applications | 8 | Sí |
| Cash Registers | 6 | Sí |
| Bank Accounts | 3 | Sí |
| Transactions | 2 | Sí |
| Logistics (Warehouses, Levels, Aliases) | 11 | Sí |
| Integrations (MeLi, Amazon, Bitrix) | 4 | Sí |
| Simple Registration | 5 | No (solo X-Account-ID) |
| **TOTAL** | **137** | — |

### Leyenda

| Símbolo | Significado |
|---|---|
| 🔐 | Requiere autenticación (`Authorization: Bearer {token}`) |
| 🔓 | Acceso público (sin autenticación) |
| (admin/sysadmin) | Requiere rol admin o sysadmin |

---

## Variables de Entorno

| Variable | Requerida | Default | Descripción |
|---|---|---|---|
| `DATABASE_URL` | **Sí** | — | URL de conexión PostgreSQL |
| `SECRET_KEY` | **Sí** | `change-me` | Clave secreta para JWT |
| `TOKEN_ALGORITHM` | No | `HS256` | Algoritmo de firma JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `60` | Expiración de tokens |
| `CORS_ORIGINS` | No | `*` | Origins CORS separados por coma |
| `CORS_ALLOW_CREDENTIALS` | No | `true` | Permitir credenciales CORS |
| `RATE_LIMIT_ENABLED` | No | `false` | Habilitar rate limiting |
| `RATE_LIMIT_AUTH` | No | `5/minute` | Límite para login |
| `RATE_LIMIT_PUBLIC` | No | `60/minute` | Límite para endpoints públicos |
| `RATE_LIMIT_DEFAULT` | No | `120/minute` | Límite para endpoints autenticados |
| `REDIS_URL` | No | — | URL de Redis (cache, sessions, rate limiting) |
| `REDIS_PREFIX` | No | `simple_gestion:` | Prefijo para claves Redis |
| `CACHE_DEFAULT_TTL` | No | `300` | TTL de cache (segundos) |
| `DB_POOL_SIZE` | No | `5` | Tamaño del pool de conexiones |
| `DB_MAX_OVERFLOW` | No | `10` | Overflow máximo del pool |
| `DB_POOL_TIMEOUT` | No | `30` | Timeout del pool (segundos) |
| `DB_POOL_RECYCLE` | No | `1800` | Reciclaje de conexiones (segundos) |
| `BITRIX_WEBHOOK_URL` | No | — | Webhook URL de Bitrix24 |
| `BITRIX_API_KEY` | No | — | API Key de Bitrix24 |
| `MERCADOLIBRE_CLIENT_ID` | No | — | Client ID de MercadoLibre |
| `MERCADOLIBRE_CLIENT_SECRET` | No | — | Client Secret de MercadoLibre |
| `AMAZON_CLIENT_ID` | No | — | Client ID de Amazon SP-API |
| `AMAZON_CLIENT_SECRET` | No | — | Client Secret de Amazon SP-API |
| `AMAZON_REFRESH_TOKEN` | No | — | Refresh Token de Amazon |
| `LOG_LEVEL` | No | `INFO` | Nivel de log |

---

> **Documento generado**: 2026-02-08  
> **Versión de API**: 1.2.1  
> **Autor**: Technical Lead — Simple Gestión Engineering Team
