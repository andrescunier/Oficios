#!/bin/bash

#####################################
# Script para configurar CDN con jsDelivr + GitHub
# Sube las imágenes a GitHub y configura el CDN
#####################################

set -e

echo "🚀 Configurando CDN para DIAP con jsDelivr + GitHub..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuración
REPO_OWNER="andrescunier"
REPO_NAME="DIAP"
BRANCH="main"

echo -e "${BLUE}📦 Paso 1: Verificando que las imágenes existan...${NC}"

if [ ! -d "public/images/heroes" ]; then
    echo -e "${YELLOW}⚠️  Carpeta public/images/heroes no encontrada${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Imágenes encontradas${NC}"

echo -e "${BLUE}📤 Paso 2: Subiendo imágenes a GitHub...${NC}"

# Agregar imágenes a Git
git add public/images/
git add public/diap-logo.png
git commit -m "chore: Agregar imágenes para CDN" || echo "No hay cambios para commitear"
git push origin ${BRANCH}

echo -e "${GREEN}✅ Imágenes subidas a GitHub${NC}"

echo -e "${BLUE}🔧 Paso 3: Configurando URLs del CDN...${NC}"

# Construir URLs del CDN
CDN_BASE="https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${BRANCH}/public"

echo ""
echo -e "${GREEN}🎉 ¡CDN Configurado!${NC}"
echo ""
echo "Agrega estas líneas a tu archivo .env:"
echo ""
echo -e "${YELLOW}# CDN Configuration${NC}"
echo "VITE_CDN_BASE_URL=${CDN_BASE}"
echo ""
echo "O si prefieres URLs individuales:"
echo ""
echo "VITE_CDN_HERO_SLIDE_1=${CDN_BASE}/images/heroes/slide-1.jpg"
echo "VITE_CDN_HERO_SLIDE_2=${CDN_BASE}/images/heroes/slide-2.jpg"
echo "VITE_CDN_HERO_SLIDE_3=${CDN_BASE}/images/heroes/slide-3.jpg"
echo "VITE_CDN_LOGO=${CDN_BASE}/diap-logo.png"
echo ""
echo -e "${BLUE}📝 Nota: Las imágenes pueden tardar 1-2 minutos en estar disponibles en el CDN${NC}"
echo ""
echo -e "${GREEN}URLs de tus imágenes:${NC}"
echo "- Slide 1: ${CDN_BASE}/images/heroes/slide-1.jpg"
echo "- Slide 2: ${CDN_BASE}/images/heroes/slide-2.jpg"
echo "- Slide 3: ${CDN_BASE}/images/heroes/slide-3.jpg"
echo "- Logo: ${CDN_BASE}/diap-logo.png"
echo ""
echo -e "${BLUE}🧪 Probar una imagen:${NC}"
echo "curl -I ${CDN_BASE}/images/heroes/slide-1.jpg"
