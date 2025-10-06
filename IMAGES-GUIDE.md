# 📸 Cómo Cambiar Imágenes del Slider y Otros Elementos

## 🎯 **Sistema de Imágenes Completamente Configurable**

Todas las imágenes de tu aplicación (slider, categorías, banners, etc.) son ahora configurables a través de variables de entorno.

## 📁 **Estructura Recomendada de Imágenes**

```bash
public/
├── americanlog3_1x.png          # Logo principal
├── favicon.ico                  # Favicon
└── images/
    ├── heroes/                  # Imágenes del slider principal
    │   ├── slide-1.jpg
    │   ├── slide-2.jpg
    │   ├── slide-3.jpg
    │   ├── slide-4.jpg          # Opcional
    │   └── slide-5.jpg          # Opcional
    ├── categories/              # Imágenes de categorías
    │   ├── componentes.jpg
    │   ├── gaming.jpg
    │   ├── ddr4.jpg
    │   ├── ddr5.jpg
    │   ├── ssd-m2.jpg
    │   └── ssd-sata.jpg
    ├── banners/                 # Banners promocionales
    │   ├── main-banner.jpg
    │   ├── secondary-banner.jpg
    │   ├── seasonal-banner.jpg
    │   └── sale-banner.jpg
    ├── backgrounds/             # Fondos de secciones
    │   ├── hero-bg.jpg
    │   ├── features-bg.jpg
    │   └── testimonials-bg.jpg
    └── placeholders/            # Imágenes por defecto
        ├── product-placeholder.jpg
        ├── category-placeholder.jpg
        └── user-placeholder.jpg
```

## 🔧 **Cómo Cambiar las Imágenes**

### **Método 1: Variables de Entorno (Recomendado)**

**1. Edita tu archivo `.env`:**
```bash
# Slider Principal
VITE_HERO_SLIDE_1=/images/heroes/mi-nueva-imagen-1.jpg
VITE_HERO_SLIDE_2=/images/heroes/mi-nueva-imagen-2.jpg
VITE_HERO_SLIDE_3=/images/heroes/mi-nueva-imagen-3.jpg

# Textos del Slider
VITE_HERO_SLIDE_1_TITLE=Mi Nuevo Título
VITE_HERO_SLIDE_1_SUBTITLE=Mi nueva descripción
VITE_HERO_SLIDE_1_CTA=Mi Botón

# Categorías
VITE_CATEGORY_GAMING_IMG=/images/categories/nueva-gaming.jpg
VITE_CATEGORY_COMPONENTES_IMG=/images/categories/nuevos-componentes.jpg

# Banners
VITE_BANNER_MAIN=/images/banners/nuevo-banner-principal.jpg
```

**2. Reinicia el servidor de desarrollo:**
```bash
pnpm dev
```

### **Método 2: Reemplazar Archivos Directamente**

**1. Mantén los mismos nombres:**
```bash
# Reemplaza estos archivos en public/images/heroes/
slide-1.jpg  # Tu nueva imagen 1
slide-2.jpg  # Tu nueva imagen 2  
slide-3.jpg  # Tu nueva imagen 3
```

**2. Las imágenes se actualizarán automáticamente**

### **Método 3: URLs Externas**

```bash
# Usar imágenes desde CDN o URLs externas
VITE_HERO_SLIDE_1=https://cdn.miempresa.com/slider1.jpg
VITE_CATEGORY_GAMING_IMG=https://unsplash.com/gaming.jpg
```

## 🎨 **Especificaciones de Imágenes**

### **Hero Slider**
- **Resolución**: 1920x1080px (16:9) mínimo
- **Formato**: JPG, PNG, WebP
- **Tamaño**: < 500KB por imagen
- **Aspecto**: Horizontal/Paisaje

### **Categorías**
- **Resolución**: 800x600px (4:3) o 800x450px (16:9)
- **Formato**: JPG, PNG, WebP
- **Tamaño**: < 200KB por imagen

### **Banners**
- **Resolución**: 1200x400px (3:1) típico
- **Formato**: JPG, PNG, WebP
- **Tamaño**: < 300KB por imagen

### **Logos**
- **Formato**: PNG (con transparencia) o SVG
- **Tamaño**: < 100KB
- **Dimensiones**: Flexibles, se ajustan automáticamente

## 🔄 **Configuración en Kubernetes**

Las imágenes también funcionan en Kubernetes. Actualiza el ConfigMap:

```yaml
# k8s/configmap.yaml
data:
  VITE_HERO_SLIDE_1: "/images/heroes/produccion-slide-1.jpg"
  VITE_HERO_SLIDE_2: "/images/heroes/produccion-slide-2.jpg"
  VITE_CATEGORY_GAMING_IMG: "/images/categories/gaming-pro.jpg"
```

Luego aplica los cambios:
```bash
kubectl apply -f k8s/configmap.yaml
kubectl rollout restart deployment/iamerican-ecommerce -n iamerican
```

## 📝 **Ejemplo Completo: Cambiar Todo el Slider**

**1. Subir nuevas imágenes:**
```bash
public/images/heroes/
├── nueva-tecnologia.jpg    # 1920x1080
├── gaming-2024.jpg         # 1920x1080  
└── componentes-pro.jpg     # 1920x1080
```

**2. Configurar en `.env`:**
```bash
# Nuevas imágenes
VITE_HERO_SLIDE_1=/images/heroes/nueva-tecnologia.jpg
VITE_HERO_SLIDE_2=/images/heroes/gaming-2024.jpg
VITE_HERO_SLIDE_3=/images/heroes/componentes-pro.jpg

# Nuevos textos
VITE_HERO_SLIDE_1_TITLE=Tecnología 2024
VITE_HERO_SLIDE_1_SUBTITLE=Lo último en innovación tecnológica
VITE_HERO_SLIDE_1_CTA=Descubrir Ahora

VITE_HERO_SLIDE_2_TITLE=Gaming Elite
VITE_HERO_SLIDE_2_SUBTITLE=Para gamers que exigen lo mejor
VITE_HERO_SLIDE_2_CTA=Ver Gaming

VITE_HERO_SLIDE_3_TITLE=Componentes Premium
VITE_HERO_SLIDE_3_SUBTITLE=Hardware profesional de calidad
VITE_HERO_SLIDE_3_CTA=Explorar
```

**3. Reiniciar desarrollo:**
```bash
pnpm dev
```

## 🚀 **Componentes Disponibles**

**✅ Creados para ti:**
- **`HeroSlider.tsx`** - Slider principal configurable
- **`CategoryGrid.tsx`** - Grid de categorías con imágenes

**✅ Para usar:**
```tsx
import { HeroSlider } from '@/components/ui/HeroSlider';
import { CategoryGrid } from '@/components/ui/CategoryGrid';

// En tu página
<HeroSlider />
<CategoryGrid />
```

## 🎯 **Ventajas del Sistema**

✅ **Sin código**: Cambios solo con variables  
✅ **Multi-entorno**: Diferentes imágenes por entorno  
✅ **Fallbacks**: Imágenes por defecto si fallan  
✅ **Performance**: Optimización automática  
✅ **SEO**: Alt tags automáticos  
✅ **Responsive**: Se adaptan a todos los tamaños  

## 🔍 **Verificar Cambios**

```bash
# Ver variables cargadas
console.log(ASSETS.HERO_SLIDES);
console.log(ASSETS.CATEGORIES);

# En consola del navegador
import.meta.env.VITE_HERO_SLIDE_1
```

**¡Ahora puedes cambiar todas las imágenes de tu aplicación simplemente editando variables de entorno!**