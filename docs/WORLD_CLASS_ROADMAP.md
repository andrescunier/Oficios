# World-Class Roadmap

## Objetivo

Llevar el storefront desde un estado `production-grade` a un estado `world-class`, con foco en:

- contrato backend/frontend estricto
- límites de dominio claros
- runtime y sesión con un solo dueño
- catálogo escalable
- calidad automática más dura
- observabilidad operativa real
- disciplina para que el proyecto no vuelva a degradarse

Este documento no es una lista de ideas. Es un backlog ejecutable con prioridades, dependencias y criterios de aceptación.

## Estado actual

La base actual ya es sólida:

- arquitectura API-first
- runtime config validado
- auth/registro alineado con contrato
- checkout sin aprobación de pagos en frontend
- tests unitarios y E2E
- CI de calidad
- observabilidad local y remota preparada

Lo que todavía impide llamarlo `world-class`:

- la superficie API del storefront sigue mezclada con endpoints de backoffice
- bootstrap, sesión y store todavía tienen responsabilidades duplicadas
- catálogo/categorías siguen apoyados en heurísticas y filtros cliente
- hay bypasses del router y del runtime tipado
- la validación contractual no es suficientemente estricta en todos los servicios
- la calidad automática todavía no cubre tipos, accesibilidad, contratos ni budgets por ruta

## Principios de implementación

1. El backend define el contrato; el frontend no lo adivina ni lo corrige silenciosamente.
2. El storefront sólo consume capacidades aprobadas para storefront.
3. Cada responsabilidad debe tener un único dueño técnico.
4. Si un flujo crítico falla, debe fallar rápido, observable y de forma consistente.
5. Ninguna mejora visual vale más que confiabilidad, trazabilidad y mantenibilidad.

## Definición de terminado global

El proyecto se considerará en estado `world-class` cuando cumpla simultáneamente:

- ningún endpoint fuera del contrato storefront esté expuesto o consumido por `src/`
- auth, sesión, bootstrap y runtime tengan una sola ruta de inicialización y recuperación
- catálogo, filtros y búsqueda operen con queries tipadas y criterios contractuales
- no existan redirecciones internas vía `window.location.*` fuera de casos excepcionales documentados
- `pnpm lint`, `pnpm typecheck`, `pnpm test:run`, `pnpm test:e2e` y budgets de build sean obligatorios
- exista trazabilidad operativa por tenant, sesión, checkout y orden
- cambios por tenant no requieran tocar código fuente

## Fase 1: Frontera Contractual

### WC-001 Reducir la superficie API del storefront

Prioridad: crítica  
Owner sugerido: frontend  
Dependencias: ninguna

Trabajo:

- recortar `src/config/api.ts` a endpoints aprobados para storefront
- mover o eliminar helpers de `people`, `users`, `business-partners`, `deliveries`, `invoices`, `inventory` y otros fuera de contrato
- documentar explícitamente qué endpoints sí puede usar el storefront

Criterios de aceptación:

- `src/config/api.ts` no expone endpoints fuera del contrato storefront
- un `rg "API_ENDPOINTS\\." src` no devuelve referencias a endpoints prohibidos
- la documentación local queda alineada con backend

### WC-002 Eliminar drift de servicios fuera de contrato

Prioridad: crítica  
Owner sugerido: frontend  
Dependencias: `WC-001`

Trabajo:

- quitar de `productService` métodos de CRUD o inventario que no pertenezcan al storefront
- sacar de `orderService` capacidades no aprobadas, especialmente creación de business partner o cualquier acceso residual a dominios administrativos
- dejar cada servicio alineado con un subdominio contractual concreto

Criterios de aceptación:

- `productService` sólo contiene lectura storefront
- `orderService` sólo contiene operaciones storefront aprobadas
- no quedan imports muertos ni llamadas a endpoints legacy

## Fase 2: Bootstrap, Runtime y Sesión

### WC-003 Crear un bootstrap pipeline único

Prioridad: crítica  
Owner sugerido: frontend  
Dependencias: `WC-001`

Trabajo:

- consolidar bootstrap de tenant config, theme, observability y auth en una sola secuencia
- eliminar duplicación entre `main.jsx`, `App.jsx` y `useStore.ts`
- modelar estados de arranque: `ok`, `fallback`, `invalid_contract`, `session_invalid`, `fatal`

Criterios de aceptación:

- sólo existe un módulo responsable de bootstrap
- no hay validaciones de sesión repetidas en más de un lugar
- los errores de arranque quedan tipados y observables

### WC-004 Sacar la sesión del store monolítico

Prioridad: crítica  
Owner sugerido: frontend  
Dependencias: `WC-003`

Trabajo:

- separar `auth/session` de `cart`, `favorites` y `ui`
- mover side effects de login/logout/hidratación a módulos de dominio
- dejar Zustand como contenedor de estado, no como orquestador de red y storage

Criterios de aceptación:

- `useStore.ts` deja de contener bootstrap de sesión y `getMe` post-login
- auth tiene un módulo de sesión explícito con API clara
- cart/favorites/ui quedan desacoplados del ciclo de auth

### WC-005 Endurecer runtime como única fuente de config

Prioridad: alta  
Owner sugerido: frontend  
Dependencias: `WC-003`

Trabajo:

- reducir lecturas directas de `localStorage` fuera de módulos dueños
- encapsular acceso a config en una sola fachada inmutable
- revisar `branding.ts`, `runtime.ts`, `theme.ts` y `api.ts` para eliminar duplicaciones

Criterios de aceptación:

- `window.__APP_CONFIG__` sólo se usa en bootstrap/runtime
- headers de account/channel salen de una única fuente
- theme y metadata no usan `console.*` en runtime crítico

## Fase 3: Catálogo, Categorías y Búsqueda

### WC-006 Reescribir filtros y categorías sobre contrato backend

Prioridad: crítica  
Owner sugerido: frontend + backend  
Dependencias: `WC-001`

Trabajo:

- reemplazar heurísticas cliente de `CategoryPage` por queries tipadas
- definir filtros canónicos por categoría, stock, precio y atributos relevantes
- paginar desde backend en lugar de traer 100 productos y filtrar en memoria

Criterios de aceptación:

- `CategoryPage` no usa `any`
- categorías y filtros no dependen de texto libre en nombre/descripción
- el catálogo soporta escalamiento sin regresión de performance

### WC-007 Definir una capa de query options por dominio

Prioridad: alta  
Owner sugerido: frontend  
Dependencias: `WC-006`

Trabajo:

- consolidar `products`, `productDetail`, `categoryListing`, `search` y `featured` bajo `features/catalog`
- evitar fetch manual o mapping ad hoc dentro de páginas

Criterios de aceptación:

- las páginas de catálogo sólo componen hooks y componentes
- React Query concentra cache, retry y errores del dominio

## Fase 4: Navegación, UX y Estructura de UI

### WC-008 Unificar navegación interna y auth guards

Prioridad: alta  
Owner sugerido: frontend  
Dependencias: `WC-004`

Trabajo:

- eliminar redirecciones internas vía `window.location.href` y `window.location.replace` donde no sean estrictamente necesarias
- corregir uso de `location` global en componentes
- estandarizar guard de login, return path y logout

Criterios de aceptación:

- navegación interna usa router
- no quedan componentes que mezclen browser globals con estado de navegación
- login/logout/favoritos/carrito tienen comportamiento consistente

### WC-009 Limpiar páginas para que sean composición pura

Prioridad: media  
Owner sugerido: frontend  
Dependencias: `WC-007`, `WC-008`

Trabajo:

- quitar lógica de negocio de `Home`, `CategoryPage`, `ProductDetailPage`, `CheckoutPage`, `OrdersPage`
- dejar mappers, reglas y side effects en `features/*`

Criterios de aceptación:

- páginas sin acceso directo a storage
- páginas sin parsing de responses
- páginas con menos branching de infraestructura

## Fase 5: Contrato Tipado y Calidad Automática

### WC-010 Tipar fuerte los servicios críticos

Prioridad: crítica  
Owner sugerido: frontend  
Dependencias: `WC-001`, `WC-003`

Trabajo:

- eliminar `any` en `authService`, `productService`, `orderService`
- centralizar normalización de envelopes backend
- validar responses críticas con schemas

Criterios de aceptación:

- cero `any` en servicios críticos
- una ruptura de contrato falla en tests y en runtime con error observable

### WC-011 Agregar typecheck y contract tests al CI

Prioridad: crítica  
Owner sugerido: frontend  
Dependencias: `WC-010`

Trabajo:

- agregar `pnpm typecheck`
- incorporar tests de contrato para `login`, `me`, `products`, `sales-orders`, `ecommerce-config`
- endurecer workflow de CI con estos checks

Criterios de aceptación:

- CI falla ante drift de tipos o shapes
- el workflow de calidad contempla tipado, tests, build y E2E

### WC-012 Subir cobertura de UI crítica

Prioridad: alta  
Owner sugerido: frontend  
Dependencias: `WC-008`

Trabajo:

- agregar tests de componentes/páginas para login, product card, checkout states, order success y header
- sumar accesibilidad básica con `axe` o equivalente

Criterios de aceptación:

- existen tests de render y comportamiento sobre UI crítica
- accesibilidad básica queda automatizada

### WC-013 Endurecer performance budgets

Prioridad: media  
Owner sugerido: frontend  
Dependencias: ninguna

Trabajo:

- pasar de budget global a budgets por chunk/ruta crítica
- medir catálogo, checkout y vendors principales
- agregar alertas de regresión en CI

Criterios de aceptación:

- build reporta budgets claros por segmento
- una regresión relevante rompe CI

## Fase 6: Observabilidad y Operación

### WC-014 Versionar eventos de observabilidad

Prioridad: alta  
Owner sugerido: frontend + backend  
Dependencias: collector backend disponible

Trabajo:

- definir schema/version de eventos frontend
- tipar `details` por evento crítico
- evitar payloads ambiguos o inconsistentes

Criterios de aceptación:

- los eventos críticos tienen contrato formal
- backend puede consultar eventos por tenant, sesión, checkout y orden

### WC-015 Cerrar trazabilidad operativa

Prioridad: alta  
Owner sugerido: frontend + backend  
Dependencias: `WC-014`

Trabajo:

- asegurar correlation IDs consistentes
- exponer dashboard o query path para incidentes
- documentar runbook mínimo para errores de checkout, sesión y bootstrap

Criterios de aceptación:

- se puede seguir un checkout fallido extremo a extremo
- existe una guía corta de diagnóstico operativo

## Fase 7: Multi-Tenant de Verdadero Producto

### WC-016 Eliminar hardcodes residuales de tenant

Prioridad: alta  
Owner sugerido: frontend  
Dependencias: `WC-005`

Trabajo:

- auditar copies, banners, metadata, promociones y defaults visuales que sigan pegados al tenant actual
- moverlos a runtime config o a fuente de contenido aprobada

Criterios de aceptación:

- cambiar de tenant no requiere editar código
- el storefront no exhibe mensajes o identidad de un tenant ajeno

### WC-017 Cerrar assets y CDN como plataforma

Prioridad: media  
Owner sugerido: frontend + plataforma  
Dependencias: `WC-016`

Trabajo:

- definir convención estable para assets tenant-aware
- eliminar supuestos sobre `APP_URL` como base universal de assets
- validar branding, favicon, og:image y placeholders por contrato

Criterios de aceptación:

- assets resuelven correctamente por tenant/CDN
- branding y SEO quedan consistentes sin hacks locales

## Orden Ejecutivo Recomendado

1. `WC-001` y `WC-002`
2. `WC-003`, `WC-004`, `WC-005`
3. `WC-006` y `WC-007`
4. `WC-008` y `WC-009`
5. `WC-010`, `WC-011`, `WC-012`, `WC-013`
6. `WC-014` y `WC-015`
7. `WC-016` y `WC-017`

## Sprint 1 recomendado

Si hubiera que empezar mañana, el primer sprint debería cerrar sólo esto:

- `WC-001 Reducir la superficie API del storefront`
- `WC-002 Eliminar drift de servicios fuera de contrato`
- `WC-003 Crear un bootstrap pipeline único`
- `WC-008 Unificar navegación interna y auth guards`

Eso ataca lo más riesgoso:

- drift contractual
- dueños duplicados de sesión/runtime
- bugs por navegación inconsistente

## Qué no haría ahora

- rediseño visual grande
- nuevas features de negocio
- analytics de marketing
- optimizaciones prematuras de micro-performance
- meter más complejidad de estado global

Primero hay que cerrar plataforma, contrato y disciplina técnica.
