# Reporte de Revisión: React Error #185 en `diapstore.com`

Fecha: 2026-03-26
Proyecto: `simpleEcommerce`
Sitio afectado: `https://diapstore.com/`

## Resumen Ejecutivo

Se investigó el error en producción `Minified React error #185` reportado en `diapstore.com`.

El error `#185` de React corresponde a:

- `Maximum update depth exceeded`

Esto indica un loop de actualizaciones de estado/render.

La revisión concluyó que el problema principal no estaba en el slider ni en el render visual aislado, sino en el flujo de sesión persistida e hidratación del frontend, combinado con lógica destructiva distribuida en varios puntos de la aplicación.

## Conclusión Principal

El frontend publicado en producción seguía ejecutando lógica duplicada y agresiva de saneamiento de sesión:

- limpieza de storage en múltiples capas
- redirects disparados desde varios lugares
- `reload()` automáticos dentro del flujo de sesión
- validaciones de estado inconsistente ejecutadas desde componentes visuales

Ese patrón es consistente con el error `React #185` y con la pantalla en blanco observada.

## Evidencia Relevante

### 1. Significado del error

React documenta el error `#185` como:

- `Maximum update depth exceeded`

Referencia oficial:

- https://react.dev/errors/185

### 2. Desalineación entre repo y producción

Durante la revisión se confirmó que el deploy online no coincidía con el build local de este repo.

Producción servía:

- `index-J0xYPmGM.js`

Build local generado tras la corrección:

- `index-CG2GNCp8.js`

Esto implica que el sitio en producción no estaba reflejando todavía el estado corregido del repositorio local.

### 3. Patrón riesgoso detectado en el bundle publicado

En el bundle online se observó:

- limpieza de sesión en hidratación
- limpieza de sesión en `Header`
- `window.location.reload()` en el flujo de saneamiento
- redirects a login desde varios lugares distintos

El punto más problemático era el `Header`, que tomaba decisiones destructivas sobre auth desde un `useEffect`.

## Causa Técnica

La causa técnica más probable del `React #185` fue la combinación de estos factores:

1. Estado persistido inconsistente en Zustand.
2. Rehidratación del store con validaciones correctivas.
3. Lógica de cleanup y redirect ejecutada desde más de un lugar.
4. Un componente de layout (`Header`) interviniendo activamente sobre el estado global.
5. Uso de `reload()` como parte del flujo normal de recuperación.

Ese diseño aumenta mucho la probabilidad de loops de actualización o de navegación/reactivación encadenada.

## Cambios Realizados

### 1. Centralización del manejo de sesión

Se creó una utilidad única de sesión en:

- `src/lib/session.ts`

Responsabilidades:

- limpiar storage relevante
- limpiar `sessionStorage`
- registrar redirect diferido con `diap-redirect`
- opcionalmente remover token del cliente HTTP

### 2. Store: hidratación controlada

Archivo:

- `src/store/useStore.ts`

Cambios:

- se agregó `hasHydrated`
- `onRehydrateStorage` ahora marca el final de hidratación
- el saneamiento de sesión usa la utilidad central
- `initializeAuth()` también usa la misma ruta única

### 3. App: redirects sólo después de hidratar

Archivo:

- `src/App.jsx`

Cambios:

- la app no procesa `diap-redirect` antes de que termine la hidratación
- la validación de sesión inválida quedó post-hidratación
- se evita disparar saneamiento prematuro durante el arranque

### 4. Header: eliminación de autocorrección destructiva

Archivo:

- `src/components/layout/Header.tsx`

Cambios:

- se eliminó la validación reactiva de estado inconsistente desde `useEffect`
- se eliminó `window.location.reload()` del flujo del header
- se eliminó `localStorage.clear()` como respuesta automática del layout
- el logout quedó explícito y controlado

### 5. Login: limpieza manual controlada

Archivo:

- `src/pages/Login.tsx`

Cambios:

- el botón de limpiar sesión ahora usa la utilidad común
- se reemplazó `reload()` por navegación controlada a `/login`

### 6. ErrorBoundary: escape hatch explícito

Archivo:

- `src/components/ErrorBoundary.jsx`

Cambios:

- la limpieza se apoya en la utilidad central
- el `reload()` quedó sólo como acción manual del usuario, no como parte del flujo normal de auth

### 7. HTTP client: respuesta 401 unificada

Archivo:

- `src/services/httpClient.ts`

Cambios:

- los `401` fuera de endpoints auth usan la misma utilidad central
- se eliminó otra implementación parcial de limpieza de sesión

## Verificación Realizada

Se ejecutó:

```bash
pnpm build
```

Resultado:

- build exitoso
- bundle local generado correctamente

Bundle local resultante:

- `dist/assets/index-CG2GNCp8.js`

## Estado de la Documentación Interna

Además de este reporte, se dejó registro en:

- `SESSION_MEMORY.md`

La bitácora incluye:

- diagnóstico
- cambios realizados
- verificación
- pendientes

## Riesgos Pendientes

### 1. Falta deploy

La corrección está en el repo local, pero el sitio online seguía sirviendo el bundle anterior durante esta revisión.

### 2. Caché/CDN

Aunque se deploye el fix, hay que verificar que CDN/cache deje de servir `index-J0xYPmGM.js`.

### 3. Flujo auxiliar fuera del SPA

Archivo a revisar más adelante:

- `public/force-logout.html`

Ese archivo todavía usa limpieza agresiva y no fue parte central del flujo principal del SPA durante esta corrección.

## Archivos Afectados

- `src/lib/session.ts`
- `src/store/useStore.ts`
- `src/App.jsx`
- `src/components/layout/Header.tsx`
- `src/pages/Login.tsx`
- `src/components/ErrorBoundary.jsx`
- `src/services/httpClient.ts`
- `SESSION_MEMORY.md`

## Recomendación para Auditoría

Para revisar esta corrección, conviene validar en este orden:

1. `src/lib/session.ts`
2. `src/store/useStore.ts`
3. `src/App.jsx`
4. `src/components/layout/Header.tsx`
5. `src/services/httpClient.ts`
6. `SESSION_MEMORY.md`

## Próximos Pasos Recomendados

1. Deployar este build.
2. Verificar que producción deje de servir `index-J0xYPmGM.js`.
3. Limpiar/purgar caché si corresponde.
4. Probar con:
   - storage limpio
   - sesión expirada
   - storage corrupto
   - navegación anónima
5. Revisar `public/force-logout.html` si ese flujo sigue vigente.
