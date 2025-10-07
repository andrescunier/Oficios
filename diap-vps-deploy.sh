#!/bin/bash

# =========================================
# SCRIPT DE DESPLIEGUE AUTOMÁTICO EN VPS
# iAmerican E-commerce - Deploy to VPS
# Uso: ./vps-deploy.sh [setup|deploy|update]
# =========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ACTION=${1:-deploy}
DOMAIN=${2:-""}
EMAIL=${3:-""}

echo -e "${BLUE}==========================================="
echo -e "🚀 iAMERICAN VPS DEPLOYMENT SCRIPT"
echo -e "===========================================${NC}"
echo -e "${YELLOW}Acción: ${ACTION}${NC}"
echo ""

# Función para mostrar ayuda
show_help() {
    echo -e "${YELLOW}Uso: ./vps-deploy.sh [comando] [opciones]${NC}"
    echo ""
    echo -e "${BLUE}Comandos disponibles:${NC}"
    echo -e "  ${GREEN}setup${NC}     - Configuración inicial del VPS (Docker, nginx, etc.)"
    echo -e "  ${GREEN}deploy${NC}    - Desplegar aplicación con Docker Compose"
    echo -e "  ${GREEN}update${NC}    - Actualizar aplicación existente"
    echo -e "  ${GREEN}ssl${NC}       - Configurar SSL con Let's Encrypt"
    echo -e "  ${GREEN}backup${NC}    - Crear backup de la aplicación"
    echo -e "  ${GREEN}logs${NC}      - Ver logs de la aplicación"
    echo -e "  ${GREEN}status${NC}    - Ver estado de los servicios"
    echo -e "  ${GREEN}find${NC}      - Encontrar instalaciones existentes de iAmerican"
    echo ""
    echo -e "${BLUE}Ejemplos:${NC}"
    echo -e "  ./vps-deploy.sh setup"
    echo -e "  ./vps-deploy.sh find"
    echo -e "  ./vps-deploy.sh deploy"
    echo -e "  ./vps-deploy.sh ssl tu-dominio.com tu-email@ejemplo.com"
    echo -e "  ./vps-deploy.sh update"
    echo ""
}

# Función para encontrar instalaciones existentes
find_installations() {
    echo -e "${BLUE}🔍 Buscando instalaciones existentes de iAmerican...${NC}"
    echo ""
    
    POSSIBLE_DIRS=(
        "$HOME/iamericans"
        "$HOME/IAMERICANS" 
        "$HOME/apps/iamerican"
        "$HOME/iamerican"
        "$HOME/iAmerican"
        "$HOME/projects/iamerican"
        "$HOME/www/iamerican"
        "/var/www/iamerican"
        "$(pwd)"
    )
    
    FOUND=false
    
    for dir in "${POSSIBLE_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            echo -e "${YELLOW}📂 Carpeta encontrada: $dir${NC}"
            
            # Verificar si contiene archivos de iAmerican
            if [ -f "$dir/package.json" ]; then
                if grep -q "iamerican\|iAmerican" "$dir/package.json" 2>/dev/null; then
                    echo -e "${GREEN}   ✅ Contiene proyecto iAmerican (package.json)${NC}"
                    FOUND=true
                elif grep -q "react\|vite" "$dir/package.json" 2>/dev/null; then
                    echo -e "${BLUE}   🔵 Contiene proyecto React/Vite${NC}"
                    FOUND=true
                fi
            fi
            
            if [ -f "$dir/docker-compose.yml" ]; then
                echo -e "${GREEN}   ✅ Contiene Docker Compose${NC}"
                FOUND=true
            fi
            
            if [ -f "$dir/Dockerfile" ]; then
                echo -e "${GREEN}   ✅ Contiene Dockerfile${NC}"
                FOUND=true
            fi
            
            if [ -d "$dir/.git" ]; then
                echo -e "${BLUE}   🔵 Es un repositorio Git${NC}"
                REMOTE=$(cd "$dir" && git remote get-url origin 2>/dev/null || echo "Sin remote")
                echo -e "${BLUE}   📡 Remote: $REMOTE${NC}"
            fi
            
            # Verificar si hay contenedores Docker corriendo
            if [ -f "$dir/docker-compose.yml" ]; then
                cd "$dir"
                if docker-compose ps 2>/dev/null | grep -q "Up"; then
                    echo -e "${GREEN}   🚀 Aplicación corriendo${NC}"
                else
                    echo -e "${YELLOW}   ⏸️  Aplicación detenida${NC}"
                fi
            fi
            
            echo ""
        fi
    done
    
    if [ "$FOUND" = false ]; then
        echo -e "${YELLOW}⚠️  No se encontraron instalaciones de iAmerican${NC}"
        echo -e "${BLUE}💡 Usa './vps-deploy.sh deploy' para crear una nueva instalación${NC}"
    else
        echo -e "${GREEN}✅ Se encontraron instalaciones existentes${NC}"
        echo -e "${BLUE}💡 Usa './vps-deploy.sh status' para ver el estado actual${NC}"
        echo -e "${BLUE}💡 Usa './vps-deploy.sh update' para actualizar una instalación existente${NC}"
    fi
}

# Función para verificar si es root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        echo -e "${RED}❌ No ejecutes este script como root${NC}"
        echo -e "${YELLOW}💡 Ejecuta: sudo usermod -aG docker \$USER && newgrp docker${NC}"
        exit 1
    fi
}

# Función para configurar el VPS inicial
setup_vps() {
    echo -e "${BLUE}🔧 Configurando VPS inicial...${NC}"
    
    # Actualizar sistema
    echo -e "${YELLOW}📦 Actualizando sistema...${NC}"
    sudo apt update && sudo apt upgrade -y
    
    # Instalar dependencias básicas
    echo -e "${YELLOW}📦 Instalando dependencias básicas...${NC}"
    sudo apt install -y curl wget git unzip htop nano ufw
    
    # Instalar Docker
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}🐳 Instalando Docker...${NC}"
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
        echo -e "${GREEN}✅ Docker instalado${NC}"
    else
        echo -e "${GREEN}✅ Docker ya está instalado${NC}"
    fi
    
    # Instalar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${YELLOW}📦 Instalando Docker Compose...${NC}"
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
        echo -e "${GREEN}✅ Docker Compose instalado${NC}"
    else
        echo -e "${GREEN}✅ Docker Compose ya está instalado${NC}"
    fi
    
    # Configurar Firewall
    echo -e "${YELLOW}🛡️ Configurando firewall...${NC}"
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    echo -e "${GREEN}✅ Firewall configurado${NC}"
    
    # Crear directorios necesarios
    echo -e "${YELLOW}📁 Creando directorios...${NC}"
    mkdir -p ~/apps/iamerican
    mkdir -p ~/backups
    mkdir -p ~/logs
    
    echo -e "${GREEN}🎉 Configuración inicial completada${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANTE: Reinicia la sesión SSH para aplicar permisos de Docker${NC}"
    echo -e "${BLUE}Comando: exit && ssh usuario@tu-vps${NC}"
}

# Función para desplegar la aplicación
deploy_app() {
    echo -e "${BLUE}🚀 Desplegando iAmerican...${NC}"
    
    # Verificar que Docker esté funcionando
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Docker no está funcionando. Ejecuta 'newgrp docker' o reinicia la sesión SSH${NC}"
        exit 1
    fi
    
    # Detectar carpeta existente de iamerican
    POSSIBLE_DIRS=(
        "$HOME/iamericans"
        "$HOME/IAMERICANS" 
        "$HOME/apps/iamerican"
        "$HOME/iamerican"
        "$(pwd)"
    )
    
    APP_DIR=""
    for dir in "${POSSIBLE_DIRS[@]}"; do
        if [ -d "$dir" ] && ([ -f "$dir/package.json" ] || [ -f "$dir/docker-compose.yml" ]); then
            echo -e "${GREEN}✅ Encontrada carpeta iAmerican existente: $dir${NC}"
            APP_DIR="$dir"
            break
        fi
    done
    
    # Si no se encuentra, crear nueva
    if [ -z "$APP_DIR" ]; then
        echo -e "${YELLOW}📁 No se encontró carpeta existente, creando nueva...${NC}"
        APP_DIR="$HOME/apps/iamerican"
        mkdir -p "$APP_DIR"
    fi
    
    cd "$APP_DIR"
    echo -e "${BLUE}📂 Trabajando en: $APP_DIR${NC}"
    
    # Si hay archivos del proyecto, actualizar; si no, clonar
    if [ -f "package.json" ] && [ -f "docker-compose.yml" ]; then
        echo -e "${YELLOW}🔄 Actualizando proyecto existente...${NC}"
        
        # Crear backup si hay cambios locales
        if [ -d ".git" ]; then
            if ! git diff --quiet 2>/dev/null; then
                echo -e "${YELLOW}� Creando backup de cambios locales...${NC}"
                DATE=$(date +%Y%m%d_%H%M%S)
                git stash push -m "backup_before_deploy_$DATE" 2>/dev/null || true
            fi
            git pull origin main 2>/dev/null || echo -e "${YELLOW}⚠️  No se pudo actualizar desde Git${NC}"
        else
            echo -e "${YELLOW}⚠️  Usando archivos locales (no es un repositorio Git)${NC}"
        fi
    else
        echo -e "${YELLOW}📥 Descargando proyecto...${NC}"
        # Si la carpeta existe pero está vacía o sin los archivos correctos
        if [ "$(ls -A . 2>/dev/null)" ]; then
            echo -e "${YELLOW}💾 Respaldando contenido existente...${NC}"
            mkdir -p ../backup_$(date +%Y%m%d_%H%M%S)
            mv * ../backup_$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true
        fi
        
        git clone https://github.com/andrescunier/IAMERICANS.git . 2>/dev/null || {
            echo -e "${RED}❌ Error clonando repositorio${NC}"
            echo -e "${YELLOW}💡 Asegúrate de tener acceso a internet y Git instalado${NC}"
            exit 1
        }
    fi
    
    # Configurar variables de entorno
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚙️ Configurando variables de entorno...${NC}"
        cp .env.example .env
        
        echo -e "${BLUE}📝 Editando .env para producción...${NC}"
        sed -i 's/VITE_APP_ENV=development/VITE_APP_ENV=production/' .env
        sed -i 's/VITE_DEBUG_MODE=true/VITE_DEBUG_MODE=false/' .env
        sed -i 's/VITE_FEATURE_DEMO_MODE=true/VITE_FEATURE_DEMO_MODE=false/' .env
        sed -i 's/VITE_FEATURE_REAL_PAYMENTS=false/VITE_FEATURE_REAL_PAYMENTS=true/' .env
        
        echo -e "${YELLOW}⚠️  Revisa y edita el archivo .env según tus necesidades:${NC}"
        echo -e "${BLUE}nano .env${NC}"
        read -p "Presiona Enter cuando hayas terminado de editar .env..."
    fi
    
    # Detener contenedores existentes
    echo -e "${YELLOW}🛑 Deteniendo servicios existentes...${NC}"
    docker-compose down 2>/dev/null || true
    
    # Limpiar imágenes antiguas
    echo -e "${YELLOW}🧹 Limpiando imágenes antiguas...${NC}"
    docker system prune -f
    
    # Construir y ejecutar
    echo -e "${YELLOW}🔨 Construyendo aplicación...${NC}"
    docker-compose build --no-cache
    
    echo -e "${YELLOW}🚀 Iniciando servicios...${NC}"
    docker-compose up -d
    
    # Verificar estado
    sleep 10
    if docker-compose ps | grep -q "Up"; then
        echo -e "${GREEN}✅ Despliegue exitoso!${NC}"
        echo -e "${BLUE}🌐 Aplicación disponible en:${NC}"
        
        # Obtener IP del servidor
        SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
        echo -e "   - HTTP:  http://${SERVER_IP}"
        echo -e "   - Local: http://localhost"
        
        if [ -n "$DOMAIN" ]; then
            echo -e "   - Dominio: http://${DOMAIN}"
        fi
        
        show_status
    else
        echo -e "${RED}❌ Error en el despliegue${NC}"
        docker-compose logs
        exit 1
    fi
}

# Función para actualizar la aplicación
update_app() {
    echo -e "${BLUE}🔄 Actualizando iAmerican...${NC}"
    
    # Detectar carpeta existente
    POSSIBLE_DIRS=(
        "$HOME/iamericans"
        "$HOME/IAMERICANS" 
        "$HOME/apps/iamerican"
        "$HOME/iamerican"
        "$(pwd)"
    )
    
    APP_DIR=""
    for dir in "${POSSIBLE_DIRS[@]}"; do
        if [ -d "$dir" ] && ([ -f "$dir/package.json" ] || [ -f "$dir/docker-compose.yml" ]); then
            APP_DIR="$dir"
            break
        fi
    done
    
    if [ -z "$APP_DIR" ]; then
        echo -e "${RED}❌ No se encontró una instalación existente de iAmerican${NC}"
        echo -e "${YELLOW}💡 Usa './vps-deploy.sh deploy' para una instalación nueva${NC}"
        exit 1
    fi
    
    cd "$APP_DIR"
    echo -e "${BLUE}📂 Actualizando en: $APP_DIR${NC}"
    
    # Crear backup antes de actualizar
    echo -e "${YELLOW}💾 Creando backup...${NC}"
    backup_app
    
    # Actualizar código
    if [ -d ".git" ]; then
        echo -e "${YELLOW}📥 Actualizando desde Git...${NC}"
        git pull origin main
    else
        echo -e "${YELLOW}⚠️  No es un repositorio Git, descargando archivos nuevos...${NC}"
        
        # Crear backup de archivos importantes
        [ -f ".env" ] && cp .env .env.backup
        [ -f "docker-compose.override.yml" ] && cp docker-compose.override.yml docker-compose.override.yml.backup
        
        # Descargar archivos nuevos
        curl -sL https://github.com/andrescunier/IAMERICANS/archive/main.zip -o update.zip
        unzip -q update.zip
        cp -r IAMERICANS-main/* .
        rm -rf IAMERICANS-main update.zip
        
        # Restaurar archivos importantes
        [ -f ".env.backup" ] && mv .env.backup .env
        [ -f "docker-compose.override.yml.backup" ] && mv docker-compose.override.yml.backup docker-compose.override.yml
    fi
    
    # Reconstruir y reiniciar
    echo -e "${YELLOW}🔨 Reconstruyendo aplicación...${NC}"
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    
    echo -e "${GREEN}✅ Actualización completada${NC}"
    show_status
}

# Función para configurar SSL
setup_ssl() {
    if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
        echo -e "${RED}❌ Debes proporcionar dominio y email${NC}"
        echo -e "${YELLOW}Uso: ./vps-deploy.sh ssl tu-dominio.com tu-email@ejemplo.com${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔒 Configurando SSL para ${DOMAIN}...${NC}"
    
    # Instalar Certbot
    if ! command -v certbot &> /dev/null; then
        echo -e "${YELLOW}📦 Instalando Certbot...${NC}"
        sudo apt install -y certbot python3-certbot-nginx
    fi
    
    # Instalar Nginx si no está instalado
    if ! command -v nginx &> /dev/null; then
        echo -e "${YELLOW}📦 Instalando Nginx...${NC}"
        sudo apt install -y nginx
        sudo systemctl enable nginx
    fi
    
    # Configurar Nginx como proxy reverso
    echo -e "${YELLOW}⚙️ Configurando Nginx...${NC}"
    sudo tee /etc/nginx/sites-available/iamerican > /dev/null <<EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    sudo ln -sf /etc/nginx/sites-available/iamerican /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    
    # Obtener certificado SSL
    echo -e "${YELLOW}🔒 Obteniendo certificado SSL...${NC}"
    sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --email ${EMAIL} --agree-tos --non-interactive
    
    # Configurar renovación automática
    echo -e "${YELLOW}⏰ Configurando renovación automática...${NC}"
    (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | sudo crontab -
    
    echo -e "${GREEN}✅ SSL configurado correctamente${NC}"
    echo -e "${BLUE}🌐 Sitio disponible en: https://${DOMAIN}${NC}"
}

# Función para encontrar la carpeta de iAmerican
find_app_dir() {
    POSSIBLE_DIRS=(
        "$HOME/iamericans"
        "$HOME/IAMERICANS" 
        "$HOME/apps/iamerican"
        "$HOME/iamerican"
        "$(pwd)"
    )
    
    for dir in "${POSSIBLE_DIRS[@]}"; do
        if [ -d "$dir" ] && ([ -f "$dir/package.json" ] || [ -f "$dir/docker-compose.yml" ]); then
            echo "$dir"
            return 0
        fi
    done
    
    return 1
}

# Función para crear backup
backup_app() {
    echo -e "${BLUE}💾 Creando backup...${NC}"
    
    APP_DIR=$(find_app_dir)
    if [ -z "$APP_DIR" ]; then
        echo -e "${RED}❌ No se encontró instalación de iAmerican${NC}"
        exit 1
    fi
    
    DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR=~/backups
    
    mkdir -p $BACKUP_DIR
    
    cd "$APP_DIR"
    tar -czf $BACKUP_DIR/iamerican_$DATE.tar.gz .
    
    # Mantener solo los últimos 7 backups
    find $BACKUP_DIR -name "iamerican_*.tar.gz" -mtime +7 -delete
    
    echo -e "${GREEN}✅ Backup creado: iamerican_$DATE.tar.gz${NC}"
    echo -e "${BLUE}📂 Ubicación: $BACKUP_DIR/iamerican_$DATE.tar.gz${NC}"
}

# Función para mostrar logs
show_logs() {
    echo -e "${BLUE}📊 Logs de iAmerican:${NC}"
    
    APP_DIR=$(find_app_dir)
    if [ -z "$APP_DIR" ]; then
        echo -e "${RED}❌ No se encontró instalación de iAmerican${NC}"
        exit 1
    fi
    
    cd "$APP_DIR"
    echo -e "${YELLOW}📂 Directorio: $APP_DIR${NC}"
    docker-compose logs -f --tail=100
}

# Función para mostrar estado
show_status() {
    echo -e "${BLUE}📊 Estado de los servicios:${NC}"
    
    APP_DIR=$(find_app_dir)
    if [ -z "$APP_DIR" ]; then
        echo -e "${RED}❌ No se encontró instalación de iAmerican${NC}"
        echo -e "${YELLOW}💡 Usa './vps-deploy.sh deploy' para instalar${NC}"
        return 1
    fi
    
    cd "$APP_DIR"
    echo -e "${YELLOW}📂 Directorio: $APP_DIR${NC}"
    echo ""
    
    docker-compose ps
    
    echo ""
    echo -e "${BLUE}💻 Uso de recursos:${NC}"
    docker stats --no-stream
    
    echo ""
    echo -e "${BLUE}💾 Espacio en disco:${NC}"
    df -h /
    
    echo ""
    echo -e "${BLUE}🌐 URLs disponibles:${NC}"
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
    echo -e "   - Local: http://localhost"
    echo -e "   - VPS IP: http://${SERVER_IP}"
    
    # Verificar si hay configuración de dominio
    if [ -f ".env" ] && grep -q "VITE_APP_URL" .env; then
        DOMAIN=$(grep "VITE_APP_URL" .env | cut -d'=' -f2 | tr -d '"' | sed 's|https\?://||')
        if [ -n "$DOMAIN" ] && [ "$DOMAIN" != "localhost:5173" ]; then
            echo -e "   - Dominio: https://${DOMAIN}"
        fi
    fi
}

# Main script
case $ACTION in
    "setup")
        check_root
        setup_vps
        ;;
    "deploy")
        check_root
        deploy_app
        ;;
    "update")
        check_root
        update_app
        ;;
    "ssl")
        DOMAIN=$2
        EMAIL=$3
        setup_ssl
        ;;
    "backup")
        backup_app
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "find")
        find_installations
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando no reconocido: $ACTION${NC}"
        show_help
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 Operación completada exitosamente${NC}"
echo -e "${BLUE}==========================================${NC}"