# SimpleTwo — QA con rama `developer`

## Objetivo

| Dominio | Servicio compose | Imagen GHCR | API |
|---------|------------------|-------------|-----|
| `apiqa.cumar.com.ar` | `fastapi-qa` | `ghcr.io/andrescunier/sigp-fastapi:developer` | PostgreSQL QA/prod compartido |
| `qa.cumar.com.ar` | `cumar-qa` | `ghcr.io/andrescunier/diap-ecommerce:developer` | `https://apiqa.cumar.com.ar` |

La tienda QA usa la **cuenta DIAP** (`bed2df35-717f-4900-a4b1-7c3a7fb59b7c`, slug `diap-arg`). El branding sale de `GET /api/accounts/{id}/ecommerce-config` en la API QA.

## 1. Publicar imágenes

Push a rama `developer` en cada repo dispara CI:

- `simpleFastApi` → `ghcr.io/andrescunier/sigp-fastapi:developer`
- `simpleEcommerce` → `ghcr.io/andrescunier/diap-ecommerce:developer`

## 2. Actualizar `/opt/docker/docker-compose.yml` en SimpleTwo

### fastapi-qa

```yaml
  fastapi-qa:
    image: ghcr.io/andrescunier/sigp-fastapi:developer
    pull_policy: always
```

### cumar-qa

```yaml
  cumar-qa:
    image: ghcr.io/andrescunier/diap-ecommerce:developer
    pull_policy: always
    env_file:
      - ./deploy/simpletwo/cumar-qa-diapstore.env
```

O copiar variables de `cumar-qa-diapstore.env` en `environment:` del servicio.

## 3. Desplegar en el servidor

```bash
cd /opt/docker
docker compose pull fastapi-qa cumar-qa
docker compose up -d fastapi-qa cumar-qa
```

Post-deploy (login sysadmin o admin):

```bash
curl -X POST "https://apiqa.cumar.com.ar/api/accounts/bed2df35-717f-4900-a4b1-7c3a7fb59b7c/api-permissions/sync" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Account-Id: bed2df35-717f-4900-a4b1-7c3a7fb59b7c"
```

## 4. Verificación

- `https://apiqa.cumar.com.ar/health` → 200
- Login ecommerce user → `permissions.orders` ≠ `none`
- `https://qa.cumar.com.ar` → branding DIAP, precios vía API QA
- `https://dash.cumar.com.ar` (SimpleDash `:developer`) → apunta a `apiqa` si se actualiza imagen
