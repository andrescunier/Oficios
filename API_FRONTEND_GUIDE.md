# Guía de Integración Frontend - SimpleGestion API

## Configuración Base

```javascript
const API_BASE_URL = 'https://api.cumar.com.ar/api';
const ACCOUNT_ID = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';

// Headers comunes para todas las requests
const getHeaders = (token) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'X-Account-Id': ACCOUNT_ID
});
```

---

## 1. Autenticación

### POST `/auth/login`
Login de usuario. Retorna token JWT.

**Request:**
```javascript
const response = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    identifier: 'usuario@email.com',  // username o email
    password: 'contraseña'
  })
});
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "user": {
      "id": "uuid",
      "username": "usuario",
      "email": "usuario@email.com",
      "role": "customer",
      "account_id": "uuid",
      "account_slug": "diapstore"
    }
  }
}
```

### GET `/auth/me`
Obtener datos del usuario actual (útil para pre-llenar checkout).

**Request:**
```javascript
const response = await fetch(`${API_BASE_URL}/auth/me`, {
  headers: getHeaders(token)
});
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "usuario",
    "email": "usuario@email.com",
    "full_name": "Nombre Completo",
    "role": "customer",
    "account_id": "uuid",
    "business_partner_id": "uuid",  // ID del cliente para órdenes
    "person": {
      "first_name": "Nombre",
      "last_name": "Apellido",
      "phone": "1234567890"
    },
    "addresses": [
      {
        "id": "uuid",
        "line1": "Calle 123",
        "city": "Buenos Aires",
        "state": "CABA",
        "postal_code": "1234",
        "country_code": "AR",
        "is_primary": true
      }
    ]
  }
}
```

---

## 2. Business Partners (Clientes)

### POST `/accounts/{account_id}/business-partners`
Crear un nuevo cliente. **IMPORTANTE:** Usar antes de crear órdenes si el cliente no existe.

**Request:**
```javascript
const response = await fetch(`${API_BASE_URL}/accounts/${ACCOUNT_ID}/business-partners`, {
  method: 'POST',
  headers: getHeaders(token),
  body: JSON.stringify({
    name: 'Nombre del Cliente',           // REQUERIDO
    partner_type: 'customer',             // REQUERIDO: 'customer' | 'supplier'
    email: 'cliente@email.com',           // opcional
    phone: '1170303709',                  // opcional
    tax_id: '20-12345678-9',              // opcional (CUIT/DNI)
    default_currency: 'USD',              // opcional: 'USD' | 'ARS'
    metadata: {                           // opcional
      shipping_address: {
        address: 'Av de Mayo 625',
        city: 'Buenos Aires',
        state: 'Buenos Aires',
        zip_code: '7600',
        country: 'Argentina'
      },
      source: 'web_checkout'
    }
  })
});
```

**⚠️ ERROR COMÚN:**
```diff
- "type": "customer"        ❌ INCORRECTO
+ "partner_type": "customer" ✅ CORRECTO
```

**Response (201):**
```json
{
  "success": true,
  "operation": "create",
  "entity_type": "business_partner",
  "message": "Business Partner creado exitosamente",
  "data": {
    "id": "38c5461b-54c7-4069-a578-7a485e3e1aca",  // ← Usar este ID en sales-orders
    "name": "Nombre del Cliente",
    "partner_type": "customer",
    "account_id": "uuid"
  }
}
```

### GET `/accounts/{account_id}/business-partners`
Listar clientes con paginación.

**Query params:**
- `page` (default: 1)
- `per_page` (default: 20, max: 100)
- `partner_type`: filtrar por tipo ('customer', 'supplier')
- `search`: buscar por nombre o email

---

## 3. Productos

### GET `/accounts/{account_id}/products`
Listar productos con paginación.

**Request:**
```javascript
const response = await fetch(
  `${API_BASE_URL}/accounts/${ACCOUNT_ID}/products?page=1&per_page=20&is_active=true`,
  { headers: getHeaders(token) }
);
```

**Query params:**
- `page` (default: 1)
- `per_page` (default: 20, max: 100)
- `is_active`: true/false
- `category_id`: filtrar por categoría
- `search`: buscar por nombre o SKU
- `min_price`, `max_price`: rango de precios

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sku": "PROD-001",
      "name": "Producto Ejemplo",
      "description": "Descripción",
      "price": 100.00,
      "cost": 50.00,
      "stock_quantity": 25,
      "is_active": true,
      "track_inventory": true,
      "allow_backorders": false,
      "category": { "id": "uuid", "name": "Categoría" },
      "images": ["url1", "url2"]
    }
  ],
  "page": 1,
  "per_page": 20,
  "total": 150,
  "total_pages": 8
}
```

### GET `/accounts/{account_id}/products/{product_id}`
Obtener un producto específico.

---

## 4. Sales Orders (Órdenes de Venta)

### POST `/accounts/{account_id}/sales-orders`
Crear una nueva orden.

**⚠️ IMPORTANTE:** El `customer_id` debe ser un `business_partner_id` existente. Si el cliente es nuevo, crearlo primero con POST a `/business-partners`.

**Request:**
```javascript
const response = await fetch(`${API_BASE_URL}/accounts/${ACCOUNT_ID}/sales-orders`, {
  method: 'POST',
  headers: getHeaders(token),
  body: JSON.stringify({
    order_number: 'SO-' + Date.now(),     // REQUERIDO: único
    customer_id: 'uuid-business-partner',  // REQUERIDO: ID del business_partner
    status: 'pending',                     // opcional: 'draft' | 'pending' | 'confirmed'
    currency: 'USD',                       // opcional: 'USD' | 'ARS'
    notes: 'Notas del pedido',             // opcional
    validate_stock: true,                  // opcional: validar stock antes de crear
    shipping_address_id: 'uuid',           // opcional
    billing_address_id: 'uuid',            // opcional
    items: [                               // REQUERIDO: al menos 1 item
      {
        product_id: 'uuid-producto',
        quantity: 2,
        unit_price: 64.33,
        tax_rate: 10.5,                    // opcional (IVA 10.5%)
        description: 'Descripción item'   // opcional
      }
    ],
    metadata: {                            // opcional
      channel: 'online',
      payment_method: 'transferencia',
      shipping_info: {
        address: 'Av de Mayo 625',
        city: 'Buenos Aires'
      }
    }
  })
});
```

**Response (201):**
```json
{
  "success": true,
  "message": "Orden creada exitosamente",
  "data": {
    "id": "uuid",
    "order_number": "SO-1764544308085602",
    "status": "pending",
    "customer_id": "uuid",
    "subtotal": 128.66,
    "tax_total": 27.02,
    "total": 155.68,
    "items": [...],
    "customer": {
      "id": "uuid",
      "name": "Cliente",
      "email": "cliente@email.com"
    },
    "created_at": "2025-11-30T23:11:48Z"
  }
}
```

### GET `/accounts/{account_id}/sales-orders`
Listar órdenes con paginación y filtros.

**Request:**
```javascript
const response = await fetch(
  `${API_BASE_URL}/accounts/${ACCOUNT_ID}/sales-orders?` + new URLSearchParams({
    page: 1,
    per_page: 20,
    status: 'pending',              // opcional
    customer_id: 'uuid',            // opcional: puede ser user_id o business_partner_id
    order_by: 'created_at',         // opcional
    direction: 'desc'               // opcional: 'asc' | 'desc'
  }),
  { headers: getHeaders(token) }
);
```

**Response (200):**
```json
{
  "success": true,
  "message": "Órdenes obtenidas exitosamente",
  "data": [...],
  "page": 1,
  "per_page": 20,
  "total": 45,
  "total_pages": 3
}
```

### GET `/accounts/{account_id}/sales-orders/{order_id}`
Obtener una orden específica.

### POST `/accounts/{account_id}/sales-orders/{order_id}/confirm`
Confirmar una orden (deduce stock si `track_inventory=true`).

### POST `/accounts/{account_id}/sales-orders/{order_id}/cancel`
Cancelar una orden.

**Request:**
```javascript
const response = await fetch(
  `${API_BASE_URL}/accounts/${ACCOUNT_ID}/sales-orders/${orderId}/cancel`,
  {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      reason: 'Cliente solicitó cancelación'  // opcional
    })
  }
);
```

### POST `/accounts/{account_id}/sales-orders/validate-stock`
Validar disponibilidad de stock antes de crear orden.

**Request:**
```javascript
const response = await fetch(
  `${API_BASE_URL}/accounts/${ACCOUNT_ID}/sales-orders/validate-stock`,
  {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      items: [
        { product_id: 'uuid', quantity: 2 },
        { product_id: 'uuid', quantity: 1 }
      ]
    })
  }
);
```

---

## 5. Flujo de Checkout Recomendado

```javascript
async function checkout(cartItems, customerData, token) {
  // 1. Verificar si el usuario ya tiene business_partner
  const meResponse = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(token)
  });
  const me = await meResponse.json();
  
  let customerId = me.data.business_partner_id;
  
  // 2. Si no tiene business_partner, crear uno
  if (!customerId) {
    const bpResponse = await fetch(`${API_BASE_URL}/accounts/${ACCOUNT_ID}/business-partners`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({
        name: `${customerData.firstName} ${customerData.lastName}`,
        partner_type: 'customer',  // ⚠️ NO usar 'type'
        email: customerData.email,
        phone: customerData.phone,
        metadata: {
          shipping_address: customerData.shippingAddress,
          source: 'web_checkout'
        }
      })
    });
    const bp = await bpResponse.json();
    customerId = bp.data.id;
  }
  
  // 3. (Opcional) Validar stock
  const stockResponse = await fetch(`${API_BASE_URL}/accounts/${ACCOUNT_ID}/sales-orders/validate-stock`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      items: cartItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity
      }))
    })
  });
  const stockResult = await stockResponse.json();
  if (!stockResult.success) {
    throw new Error('Stock insuficiente');
  }
  
  // 4. Crear la orden
  const orderResponse = await fetch(`${API_BASE_URL}/accounts/${ACCOUNT_ID}/sales-orders`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({
      order_number: `SO-${Date.now()}`,
      customer_id: customerId,  // ← ID del business_partner
      currency: 'USD',
      items: cartItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        tax_rate: 10.5  // IVA 10.5%
      })),
      notes: `Pedido web - ${customerData.firstName} ${customerData.lastName}`,
      metadata: {
        channel: 'online',
        payment_method: customerData.paymentMethod,
        shipping_info: customerData.shippingAddress
      }
    })
  });
  
  return await orderResponse.json();
}
```

---

## Códigos de Error Comunes

| Código | HTTP | Mensaje | Solución |
|--------|------|---------|----------|
| `E1001` | 400 | Error de validación | Revisar campos requeridos |
| `E1002` | 500 | Error de base de datos | FK inválida (customer_id no existe) |
| `E2001` | 401 | Token expirado | Re-login |
| `E2002` | 401 | Credenciales inválidas | Verificar usuario/contraseña |
| `E3001` | 404 | Recurso no encontrado | Verificar IDs |

---

## Headers Requeridos

```
Authorization: Bearer <token>
Content-Type: application/json
X-Account-Id: bed2df35-717f-4900-a4b1-7c3a7fb59b7c
```

---

## Notas Importantes

1. **customer_id vs user_id:** En sales-orders, el `customer_id` debe ser un `business_partner_id`, NO un `user_id`. El sistema intenta resolver automáticamente, pero es mejor enviar el ID correcto.

2. **partner_type vs type:** Al crear business_partners, usar `partner_type`, no `type`.

3. **Paginación:** Todos los endpoints de listado usan `page` y `per_page`.

4. **Stock:** Si `track_inventory=true` en el producto, la orden confirma deduce stock automáticamente.
