# Configuración Runtime

La aplicación se puede desplegar una sola vez y parametrizarse por ambiente, tenant y canal al arrancar el contenedor.

## Flujo

1. `docker-entrypoint.sh` lee variables de entorno.
2. Genera `config.js` desde `config.js.template`.
3. El navegador carga `window.__APP_CONFIG__`.
4. El frontend usa runtime config y, si existe, la cuenta activa guardada en sesión.

## Variables runtime principales

### API

| Variable | Default | Uso |
|---|---|---|
| `API_URL` | `https://api.cumar.com.ar` | Base URL del backend |
| `ACCOUNT_ID` | `bed2df35-717f-4900-a4b1-7c3a7fb59b7c` | Cuenta por defecto |
| `ACCOUNT_SLUG` | `diap` | Slug por defecto |
| `API_CHANNEL` | `ecommerce` | Canal visible del catálogo y metadata de checkout |

### App

| Variable | Default | Uso |
|---|---|---|
| `APP_NAME` | `Mi Tienda` | Nombre visible |
| `COMPANY_NAME` | `Mi Empresa` | Marca/empresa |
| `APP_SLOGAN` | `Tu tienda online` | Slogan |
| `APP_DESCRIPTION` | `Tienda online de productos` | SEO y metadata |
| `APP_URL` | vacío | URL pública |

### Reglas de negocio

| Variable | Default | Uso |
|---|---|---|
| `HIDE_PRICES_FOR_GUESTS` | `true` | Ocultar precios a invitados |
| `REQUIRE_AUTH_FOR_CART` | `true` | Requerir login para carrito |
| `DEFAULT_TAX_RATE` | `0.21` | IVA default |
| `MAX_QUANTITY_PER_PRODUCT` | `5` | Tope por producto |
| `DEFAULT_CURRENCY` | `ARS` | Moneda default |
| `DEFAULT_COUNTRY` | `Argentina` | País default |
| `PRODUCTS_PER_PAGE` | `50` | Paginación catálogo |
| `FEATURED_PRODUCTS_COUNT` | `8` | Destacados home |
| `LOCALE` | `es-AR` | Formato de fechas y moneda |

### Contacto, legal, branding y theme

Se mantienen parametrizados por entorno con las variables ya definidas en `config.js.template`. Si cambiás tenant o branding, no hace falta rebuild.

## Variables de desarrollo (`VITE_*`)

El frontend usa los mismos conceptos para desarrollo local:

```env
VITE_API_BASE_URL=https://api.cumar.com.ar
VITE_ACCOUNT_ID=bed2df35-717f-4900-a4b1-7c3a7fb59b7c
VITE_ACCOUNT_SLUG=diap
VITE_CHANNEL=ecommerce
```

## Variables de scripts QA

Los scripts locales quedaron parametrizados:

```env
API_BASE_URL=https://api.cumar.com.ar
API_ACCOUNT_ID=bed2df35-717f-4900-a4b1-7c3a7fb59b7c
API_ACCOUNT_SLUG=diap
API_CHANNEL=ecommerce
API_TEST_EMAIL=qatest@gmail.com
API_TEST_PASSWORD=Hola12345.
API_TEST_CURRENCY=ARS
API_TEST_ORDER_QTY=1
```

## Ejemplo Docker

```yaml
services:
  ecommerce:
    image: diap-ecommerce:latest
    environment:
      API_URL: https://api.cliente.com
      ACCOUNT_ID: uuid-del-cliente
      ACCOUNT_SLUG: cliente
      API_CHANNEL: ecommerce
      APP_NAME: Cliente Store
      COMPANY_NAME: Cliente SA
      COLOR_PRIMARY: "#0f766e"
      LOGO_URL: https://cdn.cliente.com/logo.png
```

## Ejemplo Kubernetes

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ecommerce-config
data:
  API_URL: "https://api.cliente.com"
  ACCOUNT_ID: "uuid-del-cliente"
  ACCOUNT_SLUG: "cliente"
  API_CHANNEL: "ecommerce"
  APP_NAME: "Cliente Store"
  COMPANY_NAME: "Cliente SA"
```

## Notas operativas

- Si el usuario inicia sesión en una cuenta concreta, el frontend prioriza esa cuenta activa sobre la configurada en runtime.
- Si el canal cambia, el catálogo pasa a consultar productos con `channels=<canal>`.
- Las órdenes nuevas guardan `metadata.channel`.
- Los pagos nuevos guardan `metadata.channel`, `sales_order_id` y `order_number`.
