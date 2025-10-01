# 🚀 Guía de Deploy para VPS

## 📋 Requisitos del VPS

### Especificaciones Mínimas
- **RAM**: 2GB mínimo (4GB recomendado)
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