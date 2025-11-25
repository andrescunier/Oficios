# 🚀 Guía de Integración Frontend - Simple Gestión API

> **Base URL:** `https://api.cumar.com.ar/api`  
> **Cuenta DIAPSTORE:** `bed2df35-717f-4900-a4b1-7c3a7fb59b7c`

---

## 📋 Índice

1. [Configuración Inicial](#configuración-inicial)
2. [Autenticación](#autenticación)
3. [Registro de Usuarios](#registro-de-usuarios)
4. [Productos (Catálogo)](#productos-catálogo)
5. [Órdenes de Venta](#órdenes-de-venta)
6. [Manejo de Errores](#manejo-de-errores)
7. [Ejemplos Completos](#ejemplos-completos)

---

## 🔧 Configuración Inicial

### Headers Requeridos

```javascript
// Headers base para todas las peticiones
const baseHeaders = {
  'Content-Type': 'application/json',
  'X-Account-ID': 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c'  // ID de cuenta DIAPSTORE
};

// Headers para peticiones autenticadas
const authHeaders = {
  ...baseHeaders,
  'Authorization': `Bearer ${accessToken}`
};
```

### Configuración de Axios (Recomendado)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.cumar.com.ar/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Account-ID': 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c'
  }
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🔐 Autenticación

### Login

```javascript
// POST /api/auth/login
const login = async (email, password) => {
  const response = await api.post('/auth/login', {
    email: email,      // o username
    password: password
  });
  
  // Respuesta exitosa
  // {
  //   "success": true,
  //   "message": "Autenticación exitosa",
  //   "data": {
  //     "access_token": "eyJhbGciOiJIUzI1NiIs...",
  //     "token_type": "bearer",
  //     "user": {
  //       "id": "uuid-del-usuario",
  //       "username": "usuario",
  //       "email": "usuario@email.com",
  //       "role": "customer"
  //     },
  //     "account": {
  //       "id": "bed2df35-717f-4900-a4b1-7c3a7fb59b7c",
  //       "name": "DIAPSTORE",
  //       "slug": "diapstore"
  //     }
  //   }
  // }
  
  // Guardar token
  localStorage.setItem('accessToken', response.data.data.access_token);
  localStorage.setItem('user', JSON.stringify(response.data.data.user));
  
  return response.data;
};
```

### Login alternativo (OAuth2 estándar)

```javascript
// POST /api/auth/token
// Content-Type: application/x-www-form-urlencoded
const loginOAuth = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await axios.post('/api/auth/token', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  // Respuesta: { access_token, token_type, user_id }
  return response.data;
};
```

### Verificar sesión

```javascript
const isAuthenticated = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return false;
  
  // Opcional: verificar expiración del token
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
```

### Logout

```javascript
const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};
```

---

## 👤 Registro de Usuarios

### Registro de Cliente (Público)

```javascript
// POST /api/simple/register-customer
// ⚠️ IMPORTANTE: La ruta es /simple/register-customer, NO /registration/register-customer

const registerCustomer = async (customerData) => {
  const response = await api.post('/simple/register-customer', {
    // Datos requeridos
    first_name: customerData.firstName,
    last_name: customerData.lastName,
    email: customerData.email,
    company_name: customerData.companyName,  // Nombre de empresa/cliente
    password: customerData.password,
    
    // Datos opcionales
    phone: customerData.phone || null,
    tax_id: customerData.taxId || null,       // CUIT/DNI
    currency: 'ARS',                          // Moneda por defecto
    
    // Metadata opcional
    person_metadata: {
      source: 'web',
      registered_at: new Date().toISOString()
    },
    company_metadata: {
      industry: customerData.industry || null
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'X-Account-ID': 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c'
    }
  });
  
  // Respuesta exitosa incluye:
  // - person: datos de la persona creada
  // - business_partner: datos del cliente/empresa
  // - user: datos del usuario con credenciales
  // - access_token: token para login automático
  
  return response.data;
};
```

### Ejemplo de formulario de registro

```javascript
// React example
const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await registerCustomer(formData);
      
      // Auto-login después del registro
      if (result.data?.access_token) {
        localStorage.setItem('accessToken', result.data.access_token);
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Error en el registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... campos del formulario ... */}
    </form>
  );
};
```

---

## 📦 Productos (Catálogo)

### Listar productos (Público - sin autenticación)

```javascript
// GET /api/accounts/{account_id}/products
const ACCOUNT_ID = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';

const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  
  // Filtros disponibles
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('min_price', filters.minPrice);
  if (filters.maxPrice) params.append('max_price', filters.maxPrice);
  if (filters.inStock !== undefined) params.append('in_stock', filters.inStock);
  if (filters.isFeatured !== undefined) params.append('is_featured', filters.isFeatured);
  if (filters.sortBy) params.append('sort_by', filters.sortBy);  // name, price, stock
  if (filters.sortOrder) params.append('sort_order', filters.sortOrder);  // asc, desc
  
  // Paginación
  params.append('page', filters.page || 1);
  params.append('per_page', filters.perPage || 50);
  
  const response = await axios.get(
    `https://api.cumar.com.ar/api/accounts/${ACCOUNT_ID}/products?${params}`,
    {
      headers: { 'X-Account-ID': ACCOUNT_ID }
    }
  );
  
  // Respuesta pública (sin autenticación):
  // {
  //   "success": true,
  //   "data": [
  //     {
  //       "id": "uuid",
  //       "sku": "PROD-001",
  //       "name": "Producto",
  //       "description": "...",
  //       "status": "active",
  //       "image_url": "https://...",
  //       "thumbnail_url": "https://...",
  //       "gallery_urls": ["https://..."],
  //       "metadata": { "category": "..." }
  //       // ⚠️ SIN PRECIOS - requiere autenticación
  //     }
  //   ],
  //   "pagination": {
  //     "page": 1,
  //     "per_page": 50,
  //     "total": 100,
  //     "total_pages": 2
  //   }
  // }
  
  return response.data;
};
```

### Listar productos (Autenticado - con precios)

```javascript
// GET /api/accounts/{account_id}/products
// Con Authorization header

const getProductsWithPrices = async (filters = {}) => {
  const params = new URLSearchParams();
  // ... mismos filtros ...
  
  const response = await api.get(`/accounts/${ACCOUNT_ID}/products?${params}`);
  
  // Respuesta autenticada INCLUYE:
  // {
  //   ...
  //   "unit_price": 15000.00,
  //   "currency": "ARS",
  //   "tax_rate": 21.0,
  //   "stock_quantity": 50,
  //   "stock_unit": "unit",
  //   ...
  // }
  
  return response.data;
};
```

### Obtener un producto

```javascript
// GET /api/accounts/{account_id}/products/{product_id}
const getProduct = async (productId) => {
  const response = await api.get(`/accounts/${ACCOUNT_ID}/products/${productId}`);
  return response.data;
};
```

### Filtros disponibles

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `search` | string | Búsqueda en nombre, SKU y descripción |
| `sku` | string | Filtrar por SKU (parcial) |
| `name` | string | Filtrar por nombre (parcial) |
| `category` | string | Filtrar por metadata.category |
| `min_price` | number | Precio mínimo |
| `max_price` | number | Precio máximo |
| `in_stock` | boolean | Solo con stock disponible |
| `is_featured` | boolean | Solo productos destacados |
| `is_active` | boolean | Solo productos activos |
| `sort_by` | string | `name`, `price`, `stock`, `sku` |
| `sort_order` | string | `asc`, `desc` |
| `page` | number | Página (desde 1) |
| `per_page` | number | Items por página (1-100) |

---

## 🛒 Órdenes de Venta

### Crear orden (Requiere autenticación)

```javascript
// POST /api/accounts/{account_id}/sales-orders

const createOrder = async (orderData) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const response = await api.post(`/accounts/${ACCOUNT_ID}/sales-orders`, {
    order_number: `SO-${Date.now()}`,  // Número único de orden
    customer_id: user.id,               // ID del usuario logueado
    currency: 'ARS',
    status: 'pending',
    
    items: orderData.items.map(item => ({
      product_id: item.productId,
      description: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      tax_rate: 21.0  // IVA
    })),
    
    notes: orderData.notes || null,
    
    metadata: {
      channel: 'online',
      shipping_address: orderData.shippingAddress,
      payment_method: orderData.paymentMethod
    }
  });
  
  return response.data;
};
```

### ⚠️ IMPORTANTE: customer_id

El `customer_id` puede ser:
1. **El ID del BusinessPartner** (cliente/empresa) - Directo
2. **El ID del User** (usuario logueado) - Se resuelve automáticamente

La API busca automáticamente el BusinessPartner vinculado al User.

```javascript
// Obtener el ID correcto del usuario logueado
const user = JSON.parse(localStorage.getItem('user'));
const customerId = user.id;  // Usar el ID del usuario
```

### Listar órdenes del usuario

```javascript
// GET /api/accounts/{account_id}/sales-orders?customer_id={user_id}
const getMyOrders = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  const response = await api.get(
    `/accounts/${ACCOUNT_ID}/sales-orders?customer_id=${user.id}`
  );
  
  return response.data;
};
```

### Obtener una orden

```javascript
// GET /api/accounts/{account_id}/sales-orders/{order_id}
const getOrder = async (orderId) => {
  const response = await api.get(`/accounts/${ACCOUNT_ID}/sales-orders/${orderId}`);
  return response.data;
};
```

---

## ⚠️ Manejo de Errores

### Estructura de errores

```javascript
// Todas las respuestas de error siguen este formato:
{
  "success": false,
  "detail": "Mensaje legible para el usuario",
  "error": {
    "code": "E3100",           // Código único de error
    "message": "Mensaje detallado",
    "details": {               // Información adicional (opcional)
      "field": "email",
      "reason": "already_exists"
    },
    "timestamp": "2025-11-25T19:00:00.000Z"
  }
}
```

### Códigos de error comunes

| Código | Significado | Acción sugerida |
|--------|-------------|-----------------|
| `E1001` | Error de validación | Revisar campos enviados |
| `E1002` | Error de base de datos | Reintentar o contactar soporte |
| `E2000` | No autorizado | Redirigir a login |
| `E2002` | Token expirado | Refresh token o re-login |
| `E3100` | Usuario no encontrado | Verificar credenciales |
| `E3105` | Credenciales inválidas | Mostrar error de login |
| `E3300` | Cliente no encontrado | El customer_id no existe |
| `E3400` | Producto no encontrado | Producto eliminado o no existe |
| `E3950` | Referencia inválida | ID de entidad relacionada no existe |
| `E4000` | Email ya registrado | Sugerir login o recuperar contraseña |

### Implementación de manejo de errores

```javascript
// utils/errorHandler.js
export const handleApiError = (error) => {
  const apiError = error.response?.data?.error;
  
  if (!apiError) {
    return {
      message: 'Error de conexión. Verifica tu internet.',
      code: 'NETWORK_ERROR'
    };
  }
  
  // Mapeo de códigos a mensajes amigables
  const errorMessages = {
    'E1001': 'Por favor verifica los datos ingresados.',
    'E2000': 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
    'E2002': 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
    'E3105': 'Email o contraseña incorrectos.',
    'E4000': 'Este email ya está registrado. ¿Querés iniciar sesión?',
    'E3950': 'Hubo un problema con tu cuenta. Contacta a soporte.'
  };
  
  return {
    message: errorMessages[apiError.code] || apiError.message,
    code: apiError.code,
    details: apiError.details
  };
};

// Uso en componentes
try {
  await createOrder(orderData);
} catch (error) {
  const { message, code } = handleApiError(error);
  
  if (code === 'E2000' || code === 'E2002') {
    logout();
    return;
  }
  
  showToast({ type: 'error', message });
}
```

---

## 📝 Ejemplos Completos

### Flujo de Registro + Login + Crear Orden

```javascript
// 1. Registro
const registerAndLogin = async (userData) => {
  try {
    // Registrar usuario
    const registerResult = await api.post('/simple/register-customer', {
      first_name: userData.firstName,
      last_name: userData.lastName,
      email: userData.email,
      company_name: `${userData.firstName} ${userData.lastName}`,
      password: userData.password,
      phone: userData.phone
    }, {
      headers: { 'X-Account-ID': ACCOUNT_ID }
    });
    
    // Guardar token del registro (auto-login)
    const token = registerResult.data.data.access_token;
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(registerResult.data.data.user));
    
    return { success: true, user: registerResult.data.data.user };
    
  } catch (error) {
    const apiError = error.response?.data?.error;
    
    if (apiError?.code === 'E4000') {
      // Email ya existe, intentar login
      return { success: false, shouldLogin: true };
    }
    
    throw error;
  }
};

// 2. Crear orden después de login
const checkout = async (cart) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    throw new Error('Debes iniciar sesión para comprar');
  }
  
  const order = await api.post(`/accounts/${ACCOUNT_ID}/sales-orders`, {
    order_number: `SO-${Date.now()}`,
    customer_id: user.id,
    currency: 'ARS',
    status: 'pending',
    items: cart.items.map(item => ({
      product_id: item.id,
      description: item.name,
      quantity: item.quantity,
      unit_price: item.price,
      tax_rate: 21.0
    })),
    notes: cart.notes,
    metadata: {
      channel: 'web',
      shipping_address: cart.shippingAddress
    }
  });
  
  return order.data;
};
```

### Hook de React para productos

```javascript
// hooks/useProducts.js
import { useState, useEffect } from 'react';
import api from '../utils/api';

const ACCOUNT_ID = 'bed2df35-717f-4900-a4b1-7c3a7fb59b7c';

export const useProducts = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
          }
        });
        
        const response = await api.get(
          `/accounts/${ACCOUNT_ID}/products?${params}`
        );
        
        setProducts(response.data.data);
        setPagination(response.data.pagination);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Error cargando productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [JSON.stringify(filters)]);

  return { products, loading, error, pagination };
};

// Uso
const ProductList = () => {
  const { products, loading, error, pagination } = useProducts({
    category: 'memorias',
    in_stock: true,
    sort_by: 'price',
    sort_order: 'asc',
    page: 1,
    per_page: 20
  });

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
      <Pagination {...pagination} />
    </div>
  );
};
```

---

## 🔗 Resumen de Endpoints

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | ❌ | Login con email/password |
| `POST` | `/auth/token` | ❌ | Login OAuth2 (form-data) |
| `POST` | `/simple/register-customer` | ❌ | Registro de cliente |
| `GET` | `/accounts/{id}/products` | ⚡ | Listar productos |
| `GET` | `/accounts/{id}/products/{id}` | ⚡ | Obtener producto |
| `POST` | `/accounts/{id}/sales-orders` | ✅ | Crear orden |
| `GET` | `/accounts/{id}/sales-orders` | ✅ | Listar órdenes |
| `GET` | `/accounts/{id}/sales-orders/{id}` | ✅ | Obtener orden |

**Leyenda:**
- ❌ No requiere autenticación
- ✅ Requiere autenticación
- ⚡ Opcional (con auth muestra precios, sin auth solo info pública)

---

## 📞 Soporte

Si tenés problemas con la integración:
1. Verificá que estés usando las rutas correctas
2. Revisá los headers requeridos (`X-Account-ID`, `Authorization`)
3. Consultá los códigos de error en esta documentación
4. Revisá la documentación completa en `/docs` (Swagger UI)

**Swagger UI:** `https://api.cumar.com.ar/docs`
