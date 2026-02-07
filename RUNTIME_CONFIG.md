# DIAP Ecommerce - Configuración Runtime Multi-Tenant

## Descripción

Este documento describe cómo configurar DIAP Ecommerce para diferentes clientes/ambientes sin necesidad de recompilar la aplicación.

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Container                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │ docker-entrypoint│───▶│   config.js     │                     │
│  │      .sh        │    │  (generated)    │                     │
│  └─────────────────┘    └────────┬────────┘                     │
│          ▲                       │                               │
│          │                       ▼                               │
│  ┌───────┴───────┐    ┌─────────────────┐    ┌───────────────┐  │
│  │ Environment   │    │    index.html   │───▶│  React App    │  │
│  │   Variables   │    │ <script src=    │    │ (uses config) │  │
│  └───────────────┘    │  "/config.js">  │    └───────────────┘  │
│                       └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Configuración

1. **Build time**: Se construye una sola imagen Docker con la aplicación
2. **Runtime**: Al iniciar el container, `docker-entrypoint.sh` lee las variables de entorno
3. **Generación**: Se genera `/usr/share/nginx/html/config.js` con la configuración
4. **Carga**: La aplicación carga `config.js` antes del bundle de React
5. **Uso**: Los componentes React acceden a `window.__APP_CONFIG__`

## Variables de Entorno Disponibles

### API Configuration

| Variable | Default | Descripción |
|----------|---------|-------------|
| `API_URL` | `https://api.cumar.com.ar` | URL base de la API |
| `ACCOUNT_ID` | `bed2df35-...` | UUID de la cuenta multi-tenant |
| `ACCOUNT_SLUG` | `diap` | Slug identificador de la cuenta |

### App Configuration

| Variable | Default | Descripción |
|----------|---------|-------------|
| `APP_NAME` | `DIAP` | Nombre de la aplicación |
| `COMPANY_NAME` | `DIAP` | Nombre de la empresa |
| `APP_SLOGAN` | `Tecnología profesional...` | Slogan/tagline |
| `APP_DESCRIPTION` | `DIAP - Distribuidora...` | Descripción para SEO |
| `APP_URL` | `https://diap.com` | URL del sitio |

### B2B Features

| Variable | Default | Descripción |
|----------|---------|-------------|
| `HIDE_PRICES_FOR_GUESTS` | `true` | Ocultar precios sin login |
| `REQUIRE_AUTH_FOR_CART` | `true` | Requerir login para carrito |
| `LOGIN_TO_VIEW_PRICES_MESSAGE` | `Inicia sesión...` | Mensaje de login |
| `LOGIN_FOR_PRICES_CTA` | `Iniciar Sesión` | Texto del botón |

### Branding - Images

| Variable | Default | Descripción |
|----------|---------|-------------|
| `LOGO_URL` | `/diap-logo.png` | Logo principal |
| `LOGO_DARK_URL` | `` | Logo para modo oscuro |
| `FAVICON_URL` | `/favicon.ico` | Favicon |
| `BANNER_URL` | `` | Banner principal |
| `OG_IMAGE_URL` | `/diap-logo.png` | Imagen Open Graph |

### Theme - Colors

| Variable | Default | Descripción |
|----------|---------|-------------|
| `COLOR_PRIMARY` | `#2563eb` | Color principal |
| `COLOR_PRIMARY_HOVER` | `#1d4ed8` | Hover del primario |
| `COLOR_PRIMARY_FOREGROUND` | `#ffffff` | Texto sobre primario |
| `COLOR_SECONDARY` | `#f1f5f9` | Color secundario |
| `COLOR_BACKGROUND` | `#ffffff` | Fondo principal |
| `COLOR_FOREGROUND` | `#0f172a` | Texto principal |
| `COLOR_MUTED` | `#f1f5f9` | Fondo muted |
| `COLOR_MUTED_FOREGROUND` | `#64748b` | Texto muted |
| `COLOR_BORDER` | `#e2e8f0` | Color de bordes |
| `COLOR_SUCCESS` | `#22c55e` | Color de éxito |
| `COLOR_WARNING` | `#f59e0b` | Color de advertencia |
| `COLOR_ERROR` | `#ef4444` | Color de error |

### Typography

| Variable | Default | Descripción |
|----------|---------|-------------|
| `FONT_FAMILY` | `` | Familia de fuentes |
| `FONT_URL` | `` | URL de Google Fonts |

### Social Links

| Variable | Default | Descripción |
|----------|---------|-------------|
| `FACEBOOK_URL` | `` | URL de Facebook |
| `INSTAGRAM_URL` | `` | URL de Instagram |
| `TWITTER_URL` | `` | URL de Twitter |
| `LINKEDIN_URL` | `` | URL de LinkedIn |

### Features

| Variable | Default | Descripción |
|----------|---------|-------------|
| `FEATURE_NOTIFICATIONS` | `false` | Habilitar notificaciones |
| `FEATURE_ANALYTICS` | `false` | Habilitar analytics |
| `FEATURE_REAL_PAYMENTS` | `false` | Habilitar pagos reales |

## Uso con Docker Compose

```yaml
version: '3.8'

services:
  cliente-acme:
    image: diap-ecommerce:latest
    ports:
      - "8080:80"
    environment:
      - API_URL=https://api.acme.com
      - ACCOUNT_ID=uuid-de-acme
      - APP_NAME=ACME Store
      - COMPANY_NAME=ACME Corporation
      - COLOR_PRIMARY=#ff6600
      - LOGO_URL=https://acme.com/logo.png
```

## Uso con Kubernetes

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: diap-config
data:
  API_URL: "https://api.cliente.com"
  ACCOUNT_ID: "uuid-del-cliente"
  APP_NAME: "Cliente Store"
  COLOR_PRIMARY: "#ff6600"
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: diap-ecommerce
spec:
  template:
    spec:
      containers:
      - name: diap
        image: diap-ecommerce:latest
        envFrom:
        - configMapRef:
            name: diap-config
```

## Desarrollo Local

Para desarrollo local, el archivo `public/config.js` contiene valores por defecto.
Las variables de Vite (`VITE_*`) siguen funcionando como fallback.

```bash
# Desarrollo con valores por defecto
pnpm dev

# Desarrollo con variables custom
VITE_API_BASE_URL=http://localhost:3000 pnpm dev
```

## Ejemplos de Configuración por Cliente

### Cliente: Tech Store (colores azules)
```env
APP_NAME=Tech Store
COMPANY_NAME=Tech Store S.A.
COLOR_PRIMARY=#3b82f6
COLOR_PRIMARY_HOVER=#2563eb
LOGO_URL=https://cdn.techstore.com/logo.png
```

### Cliente: Green Market (colores verdes)
```env
APP_NAME=Green Market
COMPANY_NAME=Green Market LLC
COLOR_PRIMARY=#22c55e
COLOR_PRIMARY_HOVER=#16a34a
LOGO_URL=https://cdn.greenmarket.com/logo.png
HIDE_PRICES_FOR_GUESTS=false
```

### Cliente: Premium B2B (modo oscuro)
```env
APP_NAME=Premium B2B
COMPANY_NAME=Premium Corp
COLOR_PRIMARY=#8b5cf6
COLOR_PRIMARY_HOVER=#7c3aed
COLOR_BACKGROUND=#1f2937
COLOR_FOREGROUND=#f9fafb
FONT_FAMILY=Poppins, sans-serif
FONT_URL=https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap
```

## Troubleshooting

### Los cambios no se aplican

1. Verificar que el container se reinició después de cambiar variables
2. Revisar logs del container: `docker logs <container>`
3. Verificar que config.js se generó: `docker exec <container> cat /usr/share/nginx/html/config.js`

### Colores no cambian

1. Los colores usan formato HEX (#ffffff)
2. Asegurarse de incluir el # al inicio
3. Verificar la consola del navegador por errores

### Debug mode

Agregar `DEBUG=true` para ver la configuración generada en los logs:

```bash
docker run -e DEBUG=true -e API_URL=... diap-ecommerce
```
