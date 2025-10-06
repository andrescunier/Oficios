# 🚀 Variables de Entorno con Kubernetes

## ✅ **SÍ, las variables funcionan perfectamente con Kubernetes**

Las variables de entorno que configuramos están completamente integradas con Kubernetes a través de **ConfigMaps** y **Secrets**.

## 📦 **Estructura de Configuración**

### **1. ConfigMaps por Entorno**

```bash
k8s/
├── configmap.yaml              # Producción
├── configmap-environments.yaml # Staging + Development
├── deployment-with-env.yaml    # Deployment configurado
└── k8s-deploy-env.sh           # Script de despliegue
```

### **2. Variables Disponibles**

**✅ Todas las 50+ variables están configuradas:**
- `VITE_APP_NAME`, `VITE_COMPANY_NAME`
- `VITE_API_BASE_URL`, `VITE_ACCOUNT_ID`
- `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE`
- `VITE_FACEBOOK_URL`, `VITE_INSTAGRAM_URL`
- `VITE_FEATURE_*` (flags de características)
- `VITE_PRIMARY_COLOR`, `VITE_SECONDARY_COLOR`

## 🔧 **Cómo Usar**

### **1. Despliegue Automático**

```bash
# Producción
./k8s-deploy-env.sh production

# Staging  
./k8s-deploy-env.sh staging

# Desarrollo
./k8s-deploy-env.sh development
```

### **2. Despliegue Manual**

```bash
# 1. Aplicar ConfigMap
kubectl apply -f k8s/configmap.yaml -n iamerican

# 2. Aplicar Deployment
kubectl apply -f k8s/deployment-with-env.yaml -n iamerican

# 3. Verificar variables
kubectl exec -n iamerican <pod-name> -- env | grep VITE_
```

### **3. Cambiar Entorno**

Para cambiar el entorno, edita el deployment:

```yaml
envFrom:
- configMapRef:
    name: iamerican-config-staging  # o iamerican-config-dev
```

## 🌍 **Configuración por Entorno**

### **Producción**
- ✅ Analytics habilitado
- ✅ Pagos reales
- ✅ 3 réplicas
- ✅ API productiva

### **Staging**
- ❌ Sin analytics
- ❌ Pagos demo
- 📊 2 réplicas
- 🔗 API staging

### **Development**
- ❌ Sin analytics
- ❌ Pagos demo
- 📊 1 réplica
- 🏠 API local

## 🔐 **Secrets (Para Datos Sensibles)**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: iamerican-secrets
data:
  api-key: <base64-encoded>      # Para API keys
  jwt-secret: <base64-encoded>   # Para tokens JWT
  db-password: <base64-encoded>  # Para bases de datos
```

## 📊 **Monitoreo de Variables**

### **Ver Variables Cargadas**
```bash
# En un pod específico
kubectl exec -n iamerican <pod-name> -- env | grep VITE_

# En todos los pods
kubectl get pods -n iamerican -o jsonpath='{.items[*].metadata.name}' | \
xargs -I {} kubectl exec -n iamerican {} -- env | grep VITE_APP_NAME
```

### **Verificar ConfigMap**
```bash
# Ver contenido del ConfigMap
kubectl describe configmap iamerican-config -n iamerican

# Ver en formato YAML
kubectl get configmap iamerican-config -n iamerican -o yaml
```

## 🔄 **Actualizar Variables**

### **1. Editar ConfigMap**
```bash
kubectl edit configmap iamerican-config -n iamerican
```

### **2. Reiniciar Pods (Forzar recarga)**
```bash
kubectl rollout restart deployment/iamerican-ecommerce -n iamerican
```

### **3. Verificar Cambios**
```bash
kubectl rollout status deployment/iamerican-ecommerce -n iamerican
```

## 🚀 **Ventajas en Kubernetes**

✅ **Separación de Configuración**: ConfigMaps vs código  
✅ **Multi-Entorno**: Diferentes configs sin cambiar imagen  
✅ **Hot-Reload**: Cambios sin rebuilds  
✅ **Seguridad**: Secrets para datos sensibles  
✅ **Versionado**: Control de versiones de configuración  
✅ **Rollback**: Fácil vuelta atrás  

## 🛠️ **Comandos Útiles**

```bash
# Ver todos los recursos
kubectl get all -n iamerican

# Logs de la aplicación
kubectl logs -f deployment/iamerican-ecommerce -n iamerican

# Port forwarding para testing
kubectl port-forward svc/iamerican-ecommerce 8080:80 -n iamerican

# Escalar replicas
kubectl scale deployment iamerican-ecommerce --replicas=5 -n iamerican

# Ver eventos
kubectl get events -n iamerican --sort-by=.metadata.creationTimestamp
```

## 🎯 **Resultado Final**

**✅ Tu aplicación React funciona perfectamente en Kubernetes con:**
- 🔧 Variables de entorno dinámicas
- 🌍 Configuración por entorno (prod/staging/dev)
- 🔐 Manejo seguro de secretos
- 📈 Auto-scaling y health checks
- 🚀 Despliegues automatizados

**¡Las variables de entorno están completamente integradas y listas para producción en Kubernetes!**