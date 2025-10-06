#!/bin/bash

# 🎨 Script de cambio de branding para el e-commerce
# Uso: ./rebrand.sh "Tu Marca" "tu-dominio.com" "Tu Slogan"

NEW_BRAND_NAME=${1:-"Tu Marca"}
NEW_DOMAIN=${2:-"tu-dominio.com"}
NEW_SLOGAN=${3:-"Tu Slogan Aquí"}

echo "🎨 Cambiando branding a: $NEW_BRAND_NAME"
echo "🌐 Dominio: $NEW_DOMAIN"
echo "💭 Slogan: $NEW_SLOGAN"

# 1. Cambiar título en index.html
sed -i "s/<title>.*<\/title>/<title>$NEW_BRAND_NAME - $NEW_SLOGAN<\/title>/" index.html
echo "✅ Título actualizado en index.html"

# 2. Cambiar nombre en package.json
sed -i "s/\"name\": \".*\"/\"name\": \"$(echo $NEW_BRAND_NAME | tr '[:upper:]' '[:lower:]' | sed 's/ /-/g')-ecommerce\"/" package.json
echo "✅ Nombre actualizado en package.json"

# 3. Cambiar variables de entorno
sed -i "s/VITE_APP_NAME=.*/VITE_APP_NAME=$NEW_BRAND_NAME/" .env.production
sed -i "s/VITE_APP_URL=.*/VITE_APP_URL=https:\/\/$NEW_DOMAIN/" .env.production
echo "✅ Variables de entorno actualizadas"

# 4. Cambiar configuración K8s
sed -i "s/VITE_APP_NAME: \".*\"/VITE_APP_NAME: \"$NEW_BRAND_NAME\"/" k8s/configmap.yaml
echo "✅ ConfigMap de Kubernetes actualizado"

# 5. Mostrar instrucciones para cambios manuales
echo ""
echo "📋 CAMBIOS MANUALES PENDIENTES:"
echo "1. 🖼️  Reemplazar favicon.ico en public/"
echo "2. 🎨 Reemplazar americanlog3_1x.png con tu logo"
echo "3. 🏢 Cambiar logo en src/components/layout/Header.tsx (línea 82-89)"
echo "4. 📸 Reemplazar imágenes en public/images/categories/"
echo "5. 🎭 Reemplazar slides en public/images/heroes/"
echo ""
echo "🎯 UBICACIONES DE ARCHIVOS:"
echo "   Logo Header: src/components/layout/Header.tsx"
echo "   Favicon: public/favicon.ico" 
echo "   Logo Principal: americanlog3_1x.png"
echo "   Categorías: public/images/categories/*.jpg"
echo "   Heroes: public/images/heroes/*.jpg"
echo ""
echo "✨ Branding básico completado para: $NEW_BRAND_NAME"