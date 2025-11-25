# 🚀 Guía Completa: Despliegue en VPS

## 🎯 **Opciones de Despliegue Disponibles**

1. **🐳 Docker Compose (Recomendado)** - Simple y eficiente
2. **☸️ Kubernetes** - Para alta disponibilidad  
3. **📦 Build Estático + Nginx** - Máximo rendimiento
4. **🔄 CI/CD Automático** - Deploy automático desde Git

---

## 🐳 **OPCIÓN 1: Docker Compose (Recomendado)**

### **🔧 Preparación del VPS**

```bash
# 1. Conectar al VPS
ssh usuario@tu-vps-ip

# 2. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 3. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 4. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Reiniciar sesión para aplicar permisos
exit
ssh usuario@tu-vps-ip
```

### **� Subir Código al VPS**

**Opción A: Git Clone (Recomendado)**
```bash
# En el VPS
git clone https://github.com/andrescunier/IAMERICANS.git
cd IAMERICANS
```

**Opción B: SCP/SFTP**
```bash
# Desde tu máquina local
scp -r /home/andis/IAMERICANS usuario@tu-vps-ip:/home/usuario/
```

**Opción C: Rsync**
```bash
# Desde tu máquina local
rsync -avz --exclude node_modules /home/andis/IAMERICANS/ usuario@tu-vps-ip:/home/usuario/IAMERICANS/
```

### **⚙️ Configuración de Variables**

```bash
# En el VPS, dentro del directorio IAMERICANS
cp .env.example .env

# Editar variables para producción
nano .env
```

**Configuración típica de producción:**
```bash
# API Configuration
VITE_API_BASE_URL=https://api.cumar.com.ar
VITE_ACCOUNT_ID=bed2df35-717f-4900-a4b1-7c3a7fb59b7c

# App Configuration
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_ENABLE_API_LOGGING=false

# Branding
VITE_APP_NAME=DIAP Store
VITE_APP_URL=https://diapstore.com

# Features (producción)
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_REAL_PAYMENTS=true
VITE_FEATURE_DEMO_MODE=false
```

### **🚀 Despliegue**

```bash
# Opción 1: Usar el script automático
chmod +x deploy.sh
./deploy.sh produccion

# Opción 2: Manual con Docker Compose
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Verificar estado
docker-compose ps
docker-compose logs -f
```
- **CPU**: 1 vCore (2 vCores recomendado)
- **Disco**: 20GB mínimo (50GB recomendado)
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### Software Requerido
- Docker 20.10+
- Docker Compose 2.0+
- Git 2.30+
- Puerto 80/443 abiertos

## 🔧 Instalación en VPS

### 1. Conectar al VPS
```bash
ssh root@tu-ip-del-vps
# o
ssh usuario@tu-ip-del-vps
```

### 2. Actualizar sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install git curl wget -y
```

### 3. Instalar Docker (Ubuntu/Debian)
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### 4. Instalar Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 5. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/iamerican-ecommerce.git
cd iamerican-ecommerce
```

### 6. Configurar variables de entorno
```bash
cp .env.production .env
# Editar .env con tu configuración específica
nano .env
```

### 7. Ejecutar deploy
```bash
./deploy.sh produccion
```

## 🌐 Configuración de Dominio

### Con Nginx Proxy Manager (Recomendado)
1. Instalar Nginx Proxy Manager
2. Crear proxy host: `tu-dominio.com` → `localhost:80`
3. Configurar SSL automático con Let's Encrypt

### Con DNS directo
1. Configurar registro A: `tu-dominio.com` → `IP-del-VPS`
2. Configurar SSL con Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

## 🔒 Configuración de Firewall

```bash
# UFW (Ubuntu Firewall)
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# iptables (alternativo)
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

## 📊 Monitoreo y Logs

### Ver logs de la aplicación
```bash
docker-compose logs -f
```

### Ver estado de contenedores
```bash
docker-compose ps
```

### Reiniciar aplicación
```bash
docker-compose restart
```

### Actualizar aplicación
```bash
git pull origin main
./deploy.sh produccion
```

## 🔧 Troubleshooting

### Error: Puerto en uso
```bash
sudo lsof -i :80
sudo kill -9 <PID>
```

### Error: Permisos Docker
```bash
sudo usermod -aG docker $USER
# Cerrar y abrir sesión nueva
```

### Error: Memoria insuficiente
```bash
# Crear swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🚀 Deploy de Actualizaciones

### Deploy automático
```bash
#!/bin/bash
cd /path/to/iamerican-ecommerce
git pull origin main
./deploy.sh produccion
```

### Deploy manual
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📱 URLs Importantes

Después del deploy, tu aplicación estará disponible en:
- **HTTP**: `http://tu-ip-del-vps`
- **HTTPS**: `https://tu-dominio.com` (con SSL)
- **Logs**: `docker-compose logs -f`
- **Status**: `docker-compose ps`

## 🆘 Soporte

Para problemas específicos:
1. Revisar logs: `docker-compose logs`
2. Verificar estado: `docker-compose ps`
3. Revisar recursos: `htop` o `docker stats`
4. Verificar puertos: `sudo netstat -tlnp`