# DIAP Ecommerce

Frontend ecommerce B2B construido con React, Vite y Zustand. El proyecto quedó preparado para operar por tenant, cuenta activa y canal visible sin depender de valores hardcodeados.

## Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Zustand
- React Router 7
- Axios
- Docker + Nginx

## Desarrollo

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Build de producción:

```bash
pnpm build
pnpm preview
```

## Configuración

La app soporta dos capas de configuración:

1. Variables `VITE_*` para desarrollo local.
2. `window.__APP_CONFIG__` para runtime en Docker/Nginx generado desde `config.js.template`.

Variables clave:

```env
VITE_API_BASE_URL=https://api.cumar.com.ar
VITE_ACCOUNT_ID=bed2df35-717f-4900-a4b1-7c3a7fb59b7c
VITE_ACCOUNT_SLUG=diap
VITE_CHANNEL=ecommerce
VITE_APP_NAME=DIAP
VITE_COMPANY_NAME=DIAP
VITE_HIDE_PRICES_FOR_GUESTS=true
VITE_REQUIRE_AUTH_FOR_CART=true
```

En runtime Docker las equivalentes son:

```env
API_URL=https://api.cumar.com.ar
ACCOUNT_ID=bed2df35-717f-4900-a4b1-7c3a7fb59b7c
ACCOUNT_SLUG=diap
API_CHANNEL=ecommerce
APP_NAME=DIAP
COMPANY_NAME=DIAP
```

Documentación ampliada:

- [RUNTIME_CONFIG.md](/home/andis/simpleEcommerce/RUNTIME_CONFIG.md)

## Multi-tenant y canal

- El frontend usa la cuenta activa real de sesión si existe.
- Si no hay sesión, usa la cuenta configurada en runtime.
- El catálogo consulta productos con `channels=<canal activo>`.
- Checkout guarda el canal en metadata de orden y pago.
- Mis pedidos enriquece órdenes con pagos e historial de estados.

## Scripts útiles

```bash
pnpm dev
pnpm build
pnpm lint
bash ./test-api.sh
bash ./test-all-apis.sh
```

Los scripts de prueba ya no dependen de valores fijos. Usan variables de entorno:

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

Ejemplo:

```bash
API_BASE_URL=https://api.cumar.com.ar \
API_ACCOUNT_ID=bed2df35-717f-4900-a4b1-7c3a7fb59b7c \
API_CHANNEL=ecommerce \
API_TEST_EMAIL=usuario@test.com \
API_TEST_PASSWORD=secreto \
bash ./test-all-apis.sh
```

## Estado de calidad

- `pnpm build` debe pasar para validar bundle.
- `pnpm lint` valida frontend y archivos JS del proyecto.
- `test-all-apis.sh` cubre login, `/auth/me`, productos, órdenes, pagos y creación de orden de prueba.
