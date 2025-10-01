#!/bin/bash

# 🚀 Script de Deploy para iAmerican E-commerce
# Uso: ./deploy.sh [produccion|desarrollo]

set -e

AMBIENTE=${1:-produccion}
PUERTO_HTTP=${2:-80}
PUERTO_HTTPS=${3:-443}

echo "🚀 Iniciando deploy de iAmerican E-commerce..."
echo "📦 Ambiente: $AMBIENTE"
echo "🌐 Puerto HTTP: $PUERTO_HTTP"
echo "🔒 Puerto HTTPS: $PUERTO_HTTPS"

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado. Reinicia la sesión para aplicar permisos."
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado."
fi

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose down 2>/dev/null || true

# Limpiar imágenes antiguas
echo "🧹 Limpiando imágenes antiguas..."
docker system prune -f

# Construir nueva imagen
echo "🔨 Construyendo nueva imagen..."
docker-compose build --no-cache

# Iniciar servicios
echo "🚀 Iniciando servicios..."
if [ "$AMBIENTE" = "desarrollo" ]; then
    docker-compose up -d
else
    # Producción con reinicio automático
    docker-compose up -d --restart unless-stopped
fi

# Verificar que los servicios estén funcionando
echo "🔍 Verificando servicios..."
sleep 5

if docker-compose ps | grep -q "Up"; then
    echo "✅ Deploy exitoso!"
    echo "🌐 Aplicación disponible en:"
    echo "   - HTTP:  http://$(hostname -I | awk '{print $1}'):$PUERTO_HTTP"
    echo "   - Local: http://localhost:$PUERTO_HTTP"
    
    # Mostrar logs en tiempo real (opcional)
    read -p "📊 ¿Deseas ver los logs en tiempo real? (y/n): " mostrar_logs
    if [ "$mostrar_logs" = "y" ] || [ "$mostrar_logs" = "Y" ]; then
        docker-compose logs -f
    fi
else
    echo "❌ Error en el deploy. Verificando logs..."
    docker-compose logs
    exit 1
fi