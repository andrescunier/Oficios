#!/bin/bash

# DIAP Technology - Script de Despliegue
echo "🚀 Iniciando despliegue de DIAP Technology..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado. Ejecuta este script desde el directorio raíz del proyecto DIAP."
    exit 1
fi

# Verificar que el proyecto es DIAP
if ! grep -q '"name": "diap"' package.json; then
    echo "❌ Error: Este no parece ser el proyecto DIAP."
    exit 1
fi

echo "📦 Construyendo la aplicación..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error en la construcción"
    exit 1
fi

echo "🐳 Construyendo imagen Docker..."
docker build -t diap-frontend .

if [ $? -ne 0 ]; then
    echo "❌ Error construyendo imagen Docker"
    exit 1
fi

echo "🛑 Deteniendo contenedores existentes..."
docker-compose down

echo "🚀 Iniciando nuevos contenedores..."
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ ¡Despliegue de DIAP completado exitosamente!"
    echo "🌐 La aplicación está corriendo en: http://localhost"
    echo "📱 Para B2B: Los precios solo son visibles para usuarios autenticados"
else
    echo "❌ Error en el despliegue"
    exit 1
fi
