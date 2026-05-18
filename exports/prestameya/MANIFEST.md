# Prestameya CDN Assets

Subir el contenido de esta carpeta al CDN en:

```txt
https://www.cumar.com.ar/CDN/prestameya/
```

Rutas esperadas por `exports/prestameya-update-config.sql`:

- `logo.svg`
- `favicon.svg`
- `og-image.svg`
- `heroes/hero-prestamo.svg`
- `heroes/hero-cuotas.svg`
- `categories/productos.svg`
- `categories/tecnologia.svg`
- `categories/hogar.svg`
- `categories/emprender.svg`

Comando sugerido desde el servidor/CDN, ajustando el destino real:

```bash
rsync -av exports/prestameya/ /ruta/del/cdn/prestameya/
```