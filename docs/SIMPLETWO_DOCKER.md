# Proyecto SimpleTwo Docker — Documentación Completa

> **Fecha de implementación:** 28 de marzo de 2026
> **Última actualización:** 7 de abril de 2026
> **Servidor:** SimpleTwo (WIN-C6PEGFUN4I9)
> **Responsable:** andrescunier

---

## 1. Hardware del Servidor

| Componente | Detalle |
|------------|---------|
| **OS Host** | Windows Server 2025 Standard Evaluation (Build 26100) |
| **Hostname** | WIN-C6PEGFUN4I9 |
| **CPU** | Intel Core Ultra 7 265K — 20 procesadores lógicos |
| **RAM** | 31.27 GB total (15.26 GB asignados a WSL2) |
| **IP LAN** | 192.168.0.178 |
| **Tailscale IP** | 100.85.149.61 |
| **RDP** | Habilitado |

---

## 2. Stack Tecnológico

| Componente | Versión |
|------------|---------|
| **WSL2** | Ubuntu 24.04.4 LTS (kernel 6.6.87.2-microsoft-standard-WSL2) |
| **Docker Engine** | v29.3.1 (Linux, dentro de WSL2) — API v1.54 |
| **Docker Compose** | v5.1.1 |
| **Tailscale** | Activo en Windows host (100.85.149.61) |
| **cloudflared CLI** | v2026.3.0 (instalado en WSL2 para gestión de túneles) |

---

## 3. Arquitectura General

```
Internet
    │
    ├── Cloudflare Tunnel (cumar.com.ar)  ──┐
    │                                        ├──► Nginx (reverse proxy) ──► Servicios
    └── Cloudflare Tunnel (diapstore.com) ──┘
                                                     │
                             ┌───────────┬───────────┼───────────┬────────────┐
                             │           │           │           │            │
                         Backends    Frontends   Herramientas  WhatsApp    DevOps
                             │           │           │           │            │
                       FastAPI(x2)   diap-store     n8n      Evolution   Watchtower
                       Redis(x2)     cumar-qa     Superset      API      Dozzle
                                     simpledash
                                     warpla
                                                     │
                                          ┌──────────┘
                                          │
                                    PostgreSQL (remoto)
                                    simpleone-1 (100.105.218.66:5432)
                                    via Tailscale VPN
```

---

## 4. Servicios Desplegados (16 contenedores)

### 4.1 Bases de datos / Cache

| Servicio | Imagen | Puerto interno | Función |
|----------|--------|----------------|---------|
| **redis-fastapi** | redis:7-alpine | 6379 | Cache para FastAPI prod/qa con password |
| **redis-superset** | redis:7-alpine | 6379 | Cache para Apache Superset |

**PostgreSQL** se encuentra en el servidor remoto **simpleone-1** (100.105.218.66:5432), accesible via Tailscale VPN.
- Base de datos: `simpledb`
- Usuario: `simpleuser`
- Connection string: `postgresql://simpleuser:simplepass@100.105.218.66:5432/simpledb`

### 4.2 Backends (API)

| Servicio | Imagen | Puerto | Dominio |
|----------|--------|--------|---------|
| **fastapi-prod** | ghcr.io/andrescunier/sigp-fastapi:latest | 8000 | api.cumar.com.ar |
| **fastapi-qa** | ghcr.io/andrescunier/sigp-fastapi:developer | 8000 | apiqa.cumar.com.ar |

- **fastapi-prod**: Simple Gestion API v1.2.1, 4 workers, conecta a Redis DB 0
- **fastapi-qa**: Mismo imagen, modo DEBUG, 2 workers, conecta a Redis DB 1
- Ambos incluyen integración FTP (c1370141.ferozo.com) para CDN en www.cumar.com.ar/CDN

### 4.3 Frontends (E-commerce)

| Servicio | Imagen | Puerto | Dominio |
|----------|--------|--------|---------|
| **diap-store** | diap-ecommerce-local:5ef52c2-fix | 80 | diapstore.com / www.diapstore.com |
| **cumar-qa** | diap-ecommerce-qa-local:5ef52c2 → re-tagged fix | 80 | qa.cumar.com.ar |
| **simpledash** | ghcr.io/andrescunier/simpledash:latest | 80 | dash.cumar.com.ar |
| **warpla** | warpla-frontend:1.2.19-5ef52c2 → re-tagged fix | 80 | warpla.cumar.com.ar |

- **diap-store**: Tienda DIAP (account: diap-arg, API: api.cumar.com.ar)
- **cumar-qa**: Entorno QA de CUMAR (account: simple-qa, API: apiqa.cumar.com.ar)
- **simpledash**: Dashboard administrativo
- **warpla**: Warpla Skate Shop (account: warpla, API: apiqa.cumar.com.ar)

> **IMPORTANTE (7/abr/2026):** diap-store, cumar-qa y warpla usan imágenes **locales** buildeadas desde el repo DIAP (commit `5ef52c2` + patch bootstrap.ts). Watchtower NO las actualiza. Si se pushea un fix al repo DIAP y se publica nueva imagen en GHCR, hay que volver a cambiar las imágenes en docker-compose.yml a las de GHCR.

#### Mecanismo de configuración runtime (frontends)

Los frontends usan un sistema de **configuración runtime** en dos capas:

1. **Build-time (VITE_*):** Variables bakeadas en el bundle JS por Vite. Definidas en `warpla-deploy/Dockerfile`. Valores actuales: `VITE_API_BASE_URL=https://apiqa.cumar.com.ar`, `VITE_ACCOUNT_ID=15ef15b2-...` (warpla).
2. **Runtime (config.js):** El `docker-entrypoint.sh` genera `/usr/share/nginx/html/config.js` con `window.__APP_CONFIG__` usando env vars del container (`API_URL`, `ACCOUNT_ID`, `ACCOUNT_SLUG`, `API_CHANNEL`, `APP_URL`).
3. **Resolución:** `src/config/runtime.ts` lee `window.__APP_CONFIG__` primero, fallback a `import.meta.env.VITE_*`.
4. **Bootstrap:** `src/app/bootstrap.ts` (parcheado) lee `window.__APP_CONFIG__` primero para `apiBaseUrl` y `accountId`.

Env vars runtime por servicio:
```
diap-store:  API_URL=https://api.cumar.com.ar  ACCOUNT_ID=bed2df35-...  ACCOUNT_SLUG=diap-arg   API_CHANNEL=ecommerce  APP_URL=https://diapstore.com
cumar-qa:    API_URL=https://apiqa.cumar.com.ar ACCOUNT_ID=b7de2251-...  ACCOUNT_SLUG=simple-qa  API_CHANNEL=ecommerce  APP_URL=https://qa.cumar.com.ar
warpla:      API_URL=https://apiqa.cumar.com.ar ACCOUNT_ID=15ef15b2-...  ACCOUNT_SLUG=warpla     API_CHANNEL=ecommerce  APP_URL=https://warpla.cumar.com.ar
```

### 4.4 Herramientas

| Servicio | Imagen | Puerto | Dominio |
|----------|--------|--------|---------|
| **n8n** | n8nio/n8n:2.14.0 | 5678 | n8n.cumar.com.ar |
| **superset** | apache/superset:3.1.0 | 8088 | superset.cumar.com.ar |

### 4.5 WhatsApp API

| Servicio | Imagen | Puerto | Dominio |
|----------|--------|--------|---------|
| **evolution-api** | evoapicloud/evolution-api:latest | 8080 | evolution.cumar.com.ar |

### 4.6 DevOps (reemplazo de ArgoCD)

| Servicio | Imagen | Puerto | Función |
|----------|--------|--------|---------|
| **watchtower** | containrrr/watchtower:latest | — | Auto-deploy de nuevas imágenes desde GHCR |
| **dozzle** | amir20/dozzle:latest | 8080 | Visor web de logs en logs.cumar.com.ar |

### 4.7 Infraestructura

| Servicio | Imagen | Puerto | Función |
|----------|--------|--------|---------|
| **nginx** | nginx:alpine | 80 | Reverse proxy (10 server blocks) |
| **cloudflared-main** | cloudflare/cloudflared:2024.12.2 | metrics:2000 | Tunnel cumar.com.ar (9 subdominios) |
| **cloudflared-diap** | cloudflare/cloudflared:2024.12.2 | metrics:2001 | Tunnel diapstore.com (2 dominios) |

---

## 5. Dominios y Ruteo

### Tunnel Principal (cumar.com.ar) — ID: 9ff4256a-b328-4982-8e00-77c076f033b9

| Dominio | Servicio final |
|---------|----------------|
| api.cumar.com.ar | fastapi-prod:8000 |
| apiqa.cumar.com.ar | fastapi-qa:8000 |
| n8n.cumar.com.ar | n8n:5678 |
| superset.cumar.com.ar | superset:8088 |
| qa.cumar.com.ar | cumar-qa:80 |
| dash.cumar.com.ar | simpledash:80 |
| warpla.cumar.com.ar | warpla:80 |
| evolution.cumar.com.ar | evolution-api:8080 |
| logs.cumar.com.ar | dozzle:8080 |

### Tunnel DIAP (diapstore.com) — ID: 79448c62-3ab3-41cc-9f38-bb0d0a9622fa

| Dominio | Servicio final |
|---------|----------------|
| diapstore.com | diap-store:80 |
| www.diapstore.com | diap-store:80 |

---

## 6. Estructura de Archivos

```
/opt/docker/                              # Directorio principal del proyecto
├── docker-compose.yml                    # Orquestación de 16 servicios
├── config/
│   ├── nginx.conf                        # Reverse proxy (10 server blocks)
│   ├── redis-fastapi.conf                # Redis: 1GB maxmem, allkeys-lru, AOF
│   └── dozzle-users.yml                  # Credenciales Dozzle (bcrypt)
└── cloudflared/
    ├── config-main.yml                   # Config local tunnel cumar.com.ar
    ├── config-diap.yml                   # Config local tunnel diapstore.com
    ├── 9ff4256a-...json                  # Credenciales tunnel principal
    └── 79448c62-...json                  # Credenciales tunnel DIAP

/data/                                    # Datos persistentes (volúmenes)
├── redis-fastapi/
├── redis-superset/
├── n8n/
├── superset/
├── evolution/
├── dozzle/
└── backups/

/etc/docker/daemon.json                   # Config del daemon Docker (log rotation)
/root/.docker/config.json                 # Credenciales GHCR (PAT de andrescunier)
```

---

## 7. Healthchecks

| Servicio | Método | Endpoint | Intervalo |
|----------|--------|----------|-----------|
| redis-fastapi | redis-cli -a [password] ping | — | 10s |
| redis-superset | redis-cli ping | — | 10s |
| fastapi-prod | python urllib | /health | 30s |
| fastapi-qa | python urllib | /health | 30s |
| n8n | wget --spider | /healthz | 30s |
| superset | python urllib | /health | 30s (start: 60s) |

---

## 8. Red

Todos los servicios están en una única red Docker bridge llamada `cumar`.

| Conexión | Detalle |
|----------|---------|
| **Servicios internos** | Red bridge `cumar` — se comunican por nombre de contenedor |
| **Internet → Servicios** | Cloudflare Tunnel → nginx:80 → servicio |
| **Servicios → PostgreSQL** | Via Tailscale VPN: 100.105.218.66:5432 |

---

## 9. Registro de Imágenes (GHCR)

| Imagen | Tag actual | Servicio | Watchtower |
|--------|-----------|----------|------------|
| sigp-fastapi | latest | fastapi-prod | ✅ auto-update desde main |
| sigp-fastapi | developer | fastapi-qa | ✅ auto-update desde developer |
| diap-ecommerce-local | 5ef52c2-fix | diap-store | ❌ build local |
| diap-ecommerce-qa-local | 5ef52c2 (re-tagged fix) | cumar-qa | ❌ build local |
| warpla-frontend | 1.2.19-5ef52c2 (re-tagged fix) | warpla | ❌ build local |
| simpledash | latest | simpledash | ✅ auto-update desde main |

---

## 10. Comandos Útiles

### Gestión de servicios
```bash
docker compose ps
docker compose up -d
docker compose down
docker compose restart fastapi-prod
docker compose up -d --force-recreate nginx
docker stats --no-stream
```

### Logs
```bash
docker compose logs -f --tail=50 fastapi-prod
docker compose logs -f --tail=20
# Web: https://logs.cumar.com.ar (admin / Cumar2026!Logs)
```

---

## 11. Pendientes / Notas

- [ ] Configurar `SECRET_KEY` en fastapi-prod (valor por defecto inseguro)
- [ ] `SUPERSET_SECRET_KEY` debería ser un valor más seguro en producción
- [ ] Configurar backups automáticos de PostgreSQL desde n8n
- [x] ~~Auto-start de dockerd en WSL2~~ — Resuelto
- [ ] Tabla `simple_users` está vacía — crear usuarios o migrar datos
- [ ] Buffer UDP de cloudflared-diap (warning no crítico)
