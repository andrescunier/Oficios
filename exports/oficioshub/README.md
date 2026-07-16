# OficiosHub — marketplace de servicios

Account: `cccedb72-8267-4513-9b9f-48c2d1fae78d`  
Slug: `oficioshub`  
API: `https://api.cumar.com.ar`  
Storefront: **https://oficioshub.cumar.com.ar**  
Admin: `oficioshub@cumar.com.ar` / `Hola4751..`

## Modelo

- **Producto** = servicio ofrecido
- **Proveedor** = persona que brinda el servicio (`partner_type=supplier`, dashboard `/proveedor`)
- **Cliente** = contrata y rankea (1–5 + dimensiones: atención, limpieza, puntualidad, calidad)

### Flujos storefront

| Quién | Ruta | Acción |
|--------|------|--------|
| Proveedor | `/registro-proveedor` | Alta vía `POST /api/simple/register-supplier` |
| Proveedor | `/proveedor` | CRUD de servicios propios (`mine=true`) |
| Cliente | `/registro` | Alta normal |
| Cliente | ficha producto | Ranking 1–5 + dimensiones |

### Backend (simpleFastApi)

Hot-patch en prod + SQL `sql/2026-07-16_product_reviews.sql`.  
Front live: imagen local `oficioshub-storefront:local`.

## Seed

Desde WSL:

```bash
python3 /mnt/c/simpleOficioshub/exports/oficioshub/_exec_seed.py
```

## Deploy

Scripts en repo `simple`:

```bash
python3 /mnt/c/simple/setup_cf_oficioshub.py
# sync nginx + compose + cloudflared (normalizar CRLF si hace falta)
python3 - <<'PY'
from pathlib import Path
import subprocess
p = Path('/mnt/c/simple/deploy_oficioshub.sh')
Path('/tmp/deploy_oficioshub.sh').write_bytes(p.read_bytes().replace(b'\r\n', b'\n'))
subprocess.check_call(['bash', '/tmp/deploy_oficioshub.sh'])
PY
# si nginx no toma el server_name nuevo:
cd /mnt/c/simple && docker compose up -d --force-recreate --no-deps nginx
docker restart cloudflared-main
```

## Identidad

- Tinta `#14213D` + ámbar `#FCA311` + fondo `#EEF2F6`
- Tipografía Outfit / Bricolage Grotesque
- Idioma `es-AR`, moneda `ARS`, IVA 21%
- Branding en `public/branding/oficioshub/`
