# 🚀 Despliegue Rápido en VPS - Guía de 5 Minutos

## ⚡ **Opción 1: Deploy Automático (Recomendado)**

### **📋 Paso a Paso:**

**1. 🔗 Conectar al VPS**
```bash
ssh usuario@tu-vps-ip
```

**2. 📥 Descargar el proyecto**
```bash
git clone https://github.com/andrescunier/IAMERICANS.git
cd IAMERICANS
```

**3. 🔧 Configuración inicial del VPS**
```bash
chmod +x vps-deploy.sh
./vps-deploy.sh setup
```
*Esto instala Docker, Docker Compose, configura firewall, etc.*

**4. 🚀 Desplegar aplicación**
```bash
# Reiniciar sesión SSH para aplicar permisos Docker
exit
ssh usuario@tu-vps-ip
cd IAMERICANS

# Desplegar
./vps-deploy.sh deploy
```

**5. 🌐 ¡Listo!**
Tu aplicación estará disponible en: `http://tu-vps-ip`

---

## 🔒 **Agregar SSL (Opcional)**

```bash
# Si tienes un dominio
./vps-deploy.sh ssl tu-dominio.com tu-email@ejemplo.com
```

---

## 🛠️ **Comandos Útiles**

```bash
# Ver estado
./vps-deploy.sh status

# Ver logs
./vps-deploy.sh logs

# Actualizar aplicación
./vps-deploy.sh update

# Crear backup
./vps-deploy.sh backup

# Ver ayuda
./vps-deploy.sh help
```

---

## ⚡ **Opción 2: Deploy Manual Rápido**

```bash
# 1. Clonar repositorio
git clone https://github.com/andrescunier/IAMERICANS.git
cd IAMERICANS

# 2. Configurar variables
cp .env.example .env
nano .env  # Editar para producción

# 3. Desplegar con Docker
docker-compose up -d --build
```

---

## 📊 **Verificar Despliegue**

```bash
# Estado de contenedores
docker-compose ps

# Logs en tiempo real
docker-compose logs -f

# Uso de recursos
docker stats

# Verificar conectividad
curl http://localhost
```

---

## 🔧 **Configuración de Producción**

**Variables importantes en `.env`:**
```bash
VITE_APP_ENV=production
VITE_DEBUG_MODE=false
VITE_FEATURE_DEMO_MODE=false
VITE_FEATURE_REAL_PAYMENTS=true
VITE_APP_URL=https://tu-dominio.com
```

---

## 🚨 **Solución de Problemas**

**Error de permisos Docker:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

**Puerto ocupado:**
```bash
sudo lsof -i :80
sudo systemctl stop apache2  # Si Apache está corriendo
```

**Sin espacio en disco:**
```bash
docker system prune -a
```

**Ver logs detallados:**
```bash
docker-compose logs -f iamerican-app
```

---

## 📈 **Monitoreo Básico**

```bash
# CPU y memoria
htop

# Espacio en disco
df -h

# Logs del sistema
journalctl -u docker -f

# Logs de Nginx (si usas SSL)
sudo tail -f /var/log/nginx/access.log
```

---

## 🎯 **Resultado Final**

✅ **Aplicación corriendo en Docker**  
✅ **Variables de entorno configuradas**  
✅ **Firewall configurado**  
✅ **SSL opcional disponible**  
✅ **Logs y monitoreo configurados**  
✅ **Scripts de mantenimiento listos**  

**¡Tu aplicación iAmerican está lista para producción!**

---

## 📞 **Soporte Rápido**

**Comandos de emergencia:**
```bash
# Reiniciar todo
./vps-deploy.sh deploy

# Ver qué está usando recursos
docker stats --no-stream

# Liberar espacio
docker system prune -a

# Backup de emergencia
./vps-deploy.sh backup
```