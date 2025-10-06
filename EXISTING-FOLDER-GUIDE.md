# 📁 Trabajando con tu Carpeta iAmerican Existente

## 🎯 **Si Ya Tienes una Carpeta iamericans**

El script `vps-deploy.sh` ahora detecta automáticamente carpetas existentes de iAmerican y las usa en lugar de crear nuevas.

---

## 🔍 **Encontrar tu Instalación Actual**

```bash
# Buscar todas las instalaciones existentes
./vps-deploy.sh find
```

**Esto buscará en:**
- `~/iamericans`
- `~/IAMERICANS` 
- `~/apps/iamerican`
- `~/iamerican`
- `~/projects/iamerican`
- `~/www/iamerican`
- Directorio actual

---

## 📊 **Ver Estado de tu Instalación**

```bash
# Ver estado actual (encuentra automáticamente tu carpeta)
./vps-deploy.sh status
```

**Esto te mostrará:**
- ✅ Ubicación de tu carpeta
- ✅ Estado de contenedores Docker
- ✅ Uso de recursos
- ✅ URLs disponibles
- ✅ Configuración de dominio

---

## 🔄 **Actualizar tu Instalación Existente**

```bash
# Actualizar desde tu carpeta existente
./vps-deploy.sh update
```

**El script automáticamente:**
- ✅ Encuentra tu carpeta iamericans
- ✅ Crea un backup antes de actualizar
- ✅ Actualiza el código desde Git
- ✅ Preserva tu archivo `.env`
- ✅ Reconstruye los contenedores

---

## 🚀 **Desplegar desde tu Carpeta Existente**

```bash
# Si tu carpeta ya tiene los archivos del proyecto
./vps-deploy.sh deploy
```

**El script detectará:**
- ✅ Si ya tienes `package.json` → Usa archivos existentes
- ✅ Si ya tienes `docker-compose.yml` → Usa configuración existente
- ✅ Si ya tienes `.env` → Preserva tu configuración
- ✅ Si es un repo Git → Actualiza desde remote

---

## 📁 **Estructuras de Carpeta Soportadas**

### **Opción 1: Carpeta con Proyecto Completo**
```bash
~/iamericans/
├── package.json          ✅ Detectado como proyecto válido
├── docker-compose.yml    ✅ Listo para deploy
├── .env                  ✅ Configuración preservada
├── src/
└── public/
```

### **Opción 2: Carpeta Vacía o Parcial**
```bash
~/iamericans/
├── (archivos existentes)  💾 Se respaldan automáticamente
└── (se descarga proyecto completo)
```

### **Opción 3: Repo Git Existente**
```bash
~/iamericans/
├── .git/                 🔄 Se actualiza con git pull
├── package.json
└── ...
```

---

## 🔧 **Comandos Específicos para tu Caso**

### **Si tu carpeta está en `~/iamericans`:**

```bash
# 1. Verificar qué tienes
./vps-deploy.sh find

# 2. Ver estado actual  
./vps-deploy.sh status

# 3. Si quieres actualizar
./vps-deploy.sh update

# 4. Si quieres desplegar por primera vez
./vps-deploy.sh deploy
```

### **Si tu carpeta está en otra ubicación:**

```bash
# Opción 1: Ir a tu carpeta y ejecutar desde ahí
cd /ruta/a/tu/carpeta/iamericans
/ruta/al/script/vps-deploy.sh deploy

# Opción 2: Crear symlink en ubicación estándar
ln -s /ruta/a/tu/carpeta/iamericans ~/iamericans
./vps-deploy.sh deploy
```

---

## 🛠️ **Solución de Problemas**

### **Error: "No se encontró instalación"**
```bash
# Verificar ubicaciones
ls -la ~/
ls -la ~/iamericans/
ls -la ~/IAMERICANS/

# Usar comando find
./vps-deploy.sh find
```

### **Backup de Seguridad**
```bash
# Crear backup manual antes de cualquier cambio
./vps-deploy.sh backup

# O backup manual
cd ~/iamericans
tar -czf ~/backup_iamericans_$(date +%Y%m%d).tar.gz .
```

### **Verificar Archivos del Proyecto**
```bash
cd ~/iamericans
ls -la

# Debe tener al menos uno de estos:
# - package.json (proyecto React)
# - docker-compose.yml (configuración Docker)
# - Dockerfile (imagen personalizada)
```

---

## 🎯 **Recomendaciones**

### **Para Máximo Control:**
1. **Backup primero**: `./vps-deploy.sh backup`
2. **Verificar estado**: `./vps-deploy.sh status` 
3. **Actualizar gradualmente**: `./vps-deploy.sh update`

### **Para Deploy Rápido:**
1. **Encontrar carpeta**: `./vps-deploy.sh find`
2. **Deploy directo**: `./vps-deploy.sh deploy`

### **Para Desarrollo:**
1. **Mantener Git actualizado** en tu carpeta
2. **Usar `.env` personalizado**
3. **Backups regulares** con cron

---

## 📋 **Checklist Rápido**

**Antes de usar tu carpeta existente:**
- [ ] ✅ Backup de archivos importantes
- [ ] ✅ Verificar que Docker está instalado
- [ ] ✅ Verificar permisos de usuario en Docker
- [ ] ✅ Comprobar espacio en disco

**Después del deploy:**
- [ ] ✅ Verificar que la aplicación carga
- [ ] ✅ Comprobar logs: `./vps-deploy.sh logs`
- [ ] ✅ Verificar estado: `./vps-deploy.sh status`
- [ ] ✅ Configurar SSL si tienes dominio

---

## 💡 **Tip Pro**

**El script es inteligente y detecta automáticamente:**
- 🔍 Dónde está tu carpeta iamericans
- 📦 Qué tipo de instalación tienes
- 🔄 Si necesita actualizar o instalar
- 💾 Qué archivos preservar

**¡Solo ejecuta `./vps-deploy.sh find` para ver todo lo que detecta!**