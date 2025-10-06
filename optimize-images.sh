#!/bin/bash

# =========================================
# SCRIPT DE OPTIMIZACIÓN DE IMÁGENES
# Uso: ./optimize-images.sh [directorio]
# =========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio por defecto
IMAGE_DIR=${1:-"public/images"}

echo -e "${BLUE}==========================================="
echo -e "🖼️  OPTIMIZADOR DE IMÁGENES iAMERICAN"
echo -e "===========================================${NC}"
echo -e "${YELLOW}Directorio: ${IMAGE_DIR}${NC}"
echo ""

# Verificar que existe el directorio
if [ ! -d "$IMAGE_DIR" ]; then
    echo -e "${RED}❌ Error: El directorio $IMAGE_DIR no existe${NC}"
    exit 1
fi

# Verificar herramientas necesarias
check_tool() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 está instalado${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  $1 no está instalado${NC}"
        return 1
    fi
}

echo -e "${BLUE}🔍 Verificando herramientas...${NC}"

# Lista de herramientas opcionales para optimización
IMAGEMAGICK_AVAILABLE=false
JPEGOPTIM_AVAILABLE=false
PNGQUANT_AVAILABLE=false
WEBP_AVAILABLE=false

if check_tool "convert"; then
    IMAGEMAGICK_AVAILABLE=true
fi

if check_tool "jpegoptim"; then
    JPEGOPTIM_AVAILABLE=true
fi

if check_tool "pngquant"; then
    PNGQUANT_AVAILABLE=true
fi

if check_tool "cwebp"; then
    WEBP_AVAILABLE=true
fi

echo ""

# Función para optimizar JPG
optimize_jpg() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo -e "${BLUE}📸 Optimizando JPG: $filename${NC}"
    
    if [ "$JPEGOPTIM_AVAILABLE" = true ]; then
        jpegoptim --size=500k "$file"
        echo -e "${GREEN}✅ Optimizado con jpegoptim${NC}"
    elif [ "$IMAGEMAGICK_AVAILABLE" = true ]; then
        convert "$file" -quality 85 -strip "$file.tmp" && mv "$file.tmp" "$file"
        echo -e "${GREEN}✅ Optimizado con ImageMagick${NC}"
    else
        echo -e "${YELLOW}⚠️  Sin herramientas de optimización JPG${NC}"
    fi
}

# Función para optimizar PNG
optimize_png() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo -e "${BLUE}📸 Optimizando PNG: $filename${NC}"
    
    if [ "$PNGQUANT_AVAILABLE" = true ]; then
        pngquant --quality=65-80 --ext .png --force "$file"
        echo -e "${GREEN}✅ Optimizado con pngquant${NC}"
    elif [ "$IMAGEMAGICK_AVAILABLE" = true ]; then
        convert "$file" -strip "$file.tmp" && mv "$file.tmp" "$file"
        echo -e "${GREEN}✅ Optimizado con ImageMagick${NC}"
    else
        echo -e "${YELLOW}⚠️  Sin herramientas de optimización PNG${NC}"
    fi
}

# Función para crear WebP
create_webp() {
    local file="$1"
    local filename=$(basename "$file")
    local webp_file="${file%.*}.webp"
    
    if [ "$WEBP_AVAILABLE" = true ] && [ ! -f "$webp_file" ]; then
        echo -e "${BLUE}🔄 Creando WebP: $filename${NC}"
        cwebp -q 80 "$file" -o "$webp_file"
        echo -e "${GREEN}✅ WebP creado: $(basename "$webp_file")${NC}"
    fi
}

# Función para redimensionar si es muy grande
resize_if_large() {
    local file="$1"
    local filename=$(basename "$file")
    local max_width=1920
    local max_height=1080
    
    if [ "$IMAGEMAGICK_AVAILABLE" = true ]; then
        # Obtener dimensiones
        local dimensions=$(identify -format "%wx%h" "$file" 2>/dev/null || echo "0x0")
        local width=$(echo $dimensions | cut -d'x' -f1)
        local height=$(echo $dimensions | cut -d'x' -f2)
        
        if [ "$width" -gt "$max_width" ] || [ "$height" -gt "$max_height" ]; then
            echo -e "${BLUE}📏 Redimensionando: $filename (${width}x${height})${NC}"
            convert "$file" -resize "${max_width}x${max_height}>" "$file.tmp" && mv "$file.tmp" "$file"
            echo -e "${GREEN}✅ Redimensionado${NC}"
        fi
    fi
}

# Contadores
jpg_count=0
png_count=0
webp_count=0
total_size_before=0
total_size_after=0

echo -e "${BLUE}🚀 Iniciando optimización...${NC}"
echo ""

# Procesar todas las imágenes
find "$IMAGE_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" \) | while read file; do
    # Obtener tamaño antes
    size_before=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    
    # Redimensionar si es necesario
    resize_if_large "$file"
    
    # Optimizar según tipo
    case "${file,,}" in
        *.jpg|*.jpeg)
            optimize_jpg "$file"
            create_webp "$file"
            ((jpg_count++))
            ;;
        *.png)
            optimize_png "$file"
            create_webp "$file"
            ((png_count++))
            ;;
    esac
    
    # Obtener tamaño después
    size_after=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo 0)
    
    # Mostrar ahorro
    if [ "$size_before" -gt 0 ] && [ "$size_after" -gt 0 ]; then
        savings=$((size_before - size_after))
        percentage=$((savings * 100 / size_before))
        if [ "$savings" -gt 0 ]; then
            echo -e "${GREEN}💾 Ahorrado: $(numfmt --to=iec $savings) (${percentage}%)${NC}"
        fi
    fi
    
    echo ""
done

# Crear estructura de directorios recomendada si no existe
echo -e "${BLUE}📁 Verificando estructura de directorios...${NC}"

directories=(
    "public/images/heroes"
    "public/images/categories" 
    "public/images/banners"
    "public/images/backgrounds"
    "public/images/placeholders"
)

for dir in "${directories[@]}"; do
    if [ ! -d "$dir" ]; then
        echo -e "${YELLOW}📂 Creando directorio: $dir${NC}"
        mkdir -p "$dir"
        
        # Crear archivo README en cada directorio
        cat > "$dir/README.md" << EOF
# $(basename "$dir" | tr '[:lower:]' '[:upper:]') Images

## Especificaciones Recomendadas

### Resolución
- Mínimo: 800x600px
- Recomendado: 1920x1080px (para heroes)
- Máximo: 1920x1080px

### Formato
- JPG para fotografías
- PNG para gráficos con transparencia
- WebP se genera automáticamente

### Tamaño
- Máximo: 500KB por imagen
- Recomendado: < 200KB

### Naming Convention
- Usar kebab-case: mi-imagen.jpg
- Sin espacios ni caracteres especiales
- Descriptivo: gaming-setup.jpg, not img1.jpg
EOF
        echo -e "${GREEN}✅ Directorio creado con documentación${NC}"
    fi
done

echo ""
echo -e "${GREEN}🎉 OPTIMIZACIÓN COMPLETADA${NC}"
echo -e "${BLUE}==========================================${NC}"

# Contar archivos WebP creados
webp_count=$(find "$IMAGE_DIR" -name "*.webp" 2>/dev/null | wc -l)

echo -e "${YELLOW}📊 Estadísticas:${NC}"
echo -e "JPG/JPEG procesados: $jpg_count"
echo -e "PNG procesados: $png_count"  
echo -e "WebP generados: $webp_count"
echo ""

echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo -e "1. Revisa las imágenes optimizadas"
echo -e "2. Actualiza las variables en .env si es necesario"
echo -e "3. Reinicia el servidor: ${BLUE}pnpm dev${NC}"
echo -e "4. Para producción: ${BLUE}./k8s-deploy-env.sh production${NC}"
echo ""

echo -e "${YELLOW}💡 Consejos:${NC}"
echo -e "• Usa WebP cuando sea posible (mejor compresión)"
echo -e "• Mantén imágenes < 500KB para mejor rendimiento"
echo -e "• Usa CDN para imágenes en producción"
echo ""

# Mostrar comandos para instalar herramientas faltantes
if [ "$IMAGEMAGICK_AVAILABLE" = false ] || [ "$JPEGOPTIM_AVAILABLE" = false ] || [ "$PNGQUANT_AVAILABLE" = false ] || [ "$WEBP_AVAILABLE" = false ]; then
    echo -e "${YELLOW}🔧 Para mejor optimización, instala:${NC}"
    
    if [ "$IMAGEMAGICK_AVAILABLE" = false ]; then
        echo -e "${BLUE}brew install imagemagick${NC} (macOS)"
        echo -e "${BLUE}sudo apt install imagemagick${NC} (Ubuntu)"
    fi
    
    if [ "$JPEGOPTIM_AVAILABLE" = false ]; then
        echo -e "${BLUE}brew install jpegoptim${NC} (macOS)"
        echo -e "${BLUE}sudo apt install jpegoptim${NC} (Ubuntu)"
    fi
    
    if [ "$PNGQUANT_AVAILABLE" = false ]; then
        echo -e "${BLUE}brew install pngquant${NC} (macOS)"
        echo -e "${BLUE}sudo apt install pngquant${NC} (Ubuntu)"
    fi
    
    if [ "$WEBP_AVAILABLE" = false ]; then
        echo -e "${BLUE}brew install webp${NC} (macOS)"
        echo -e "${BLUE}sudo apt install webp${NC} (Ubuntu)"
    fi
fi

echo -e "${GREEN}✨ ¡Listo para usar imágenes optimizadas!${NC}"