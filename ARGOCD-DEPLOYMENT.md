# 🚀 Guía de Deployment con ArgoCD - iAmerican E-commerce

## 📋 Resumen de Cambios Implementados

Esta versión **v1.1.0** incluye:

✅ **Sistema de autenticación completa** con tokens JWT  
✅ **API real integrada** para pedidos y productos  
✅ **Sistema de favoritos** con autenticación requerida  
✅ **Carrito persistente** con sincronización al servidor  
✅ **Manejo automático de tokens** en todas las peticiones  
✅ **Gestión de errores 401** con redirección automática  
✅ **Páginas de usuario completas** (perfil, pedidos, favoritos)  
✅ **Rutas dinámicas** para detalle de productos

---

## 🎯 Proceso de Deployment en ArgoCD

### **Opción 1: Deployment Automático (Recomendado)**

#### 1️⃣ Usando el Script Automatizado

```bash
# Hacer todo el proceso automáticamente
./deploy-to-k8s.sh all

# O paso a paso:
./deploy-to-k8s.sh build     # Solo construir imagen
./deploy-to-k8s.sh push      # Solo subir al registry
./deploy-to-k8s.sh deploy    # Solo deployment
./deploy-to-k8s.sh sync      # Solo sincronizar ArgoCD
```

#### 2️⃣ Verificar el Deployment

```bash
# Ver estado
./deploy-to-k8s.sh status

# Ver logs
kubectl logs -f deployment/iamerican-ecommerce -n iamerican
```

### **Opción 2: Deployment Manual**

#### 1️⃣ Construir y Subir la Imagen

```bash
# Construir la imagen
docker build -t iamerican-ecommerce:v1.1.0 .

# Tagear para tu registry
docker tag iamerican-ecommerce:v1.1.0 tu-registry.com/iamerican-ecommerce:v1.1.0

# Subir al registry
docker push tu-registry.com/iamerican-ecommerce:v1.1.0
```

#### 2️⃣ Actualizar Manifiestos K8s

Los manifiestos ya están actualizados en este commit:
- `k8s/kustomization.yaml` → nueva imagen `v1.1.0`
- `k8s/configmap.yaml` → variables de entorno actualizadas

#### 3️⃣ Aplicar con kubectl (opcional)

```bash
# Aplicar cambios directamente
kubectl apply -k k8s/

# Verificar rollout
kubectl rollout status deployment/iamerican-ecommerce -n iamerican
```

#### 4️⃣ Sincronizar ArgoCD

```bash
# Con ArgoCD CLI
argocd app sync iamerican-ecommerce-app
argocd app wait iamerican-ecommerce-app

# O desde la UI de ArgoCD:
# 1. Ir a https://tu-argocd.com
# 2. Buscar la app "iamerican-ecommerce-app"
# 3. Click en "Sync" → "Synchronize"
```

---

## 🔧 Configuración de ArgoCD Application

### **Si necesitas crear la Application de ArgoCD:**

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: iamerican-ecommerce-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/andrescunier/DIAP.git
    targetRevision: main
    path: k8s
  destination:
    server: https://kubernetes.default.svc
    namespace: iamerican
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
```

### **Aplicar la Application:**

```bash
kubectl apply -f argocd-application.yaml
```

---

## 📊 Verificación del Deployment

### **1. Verificar Pods**

```bash
kubectl get pods -n iamerican -l app=iamerican-ecommerce
```

### **2. Verificar Logs**

```bash
kubectl logs -f deployment/iamerican-ecommerce -n iamerican
```

### **3. Verificar Service**

```bash
kubectl get svc -n iamerican
```

### **4. Verificar Ingress**

```bash
kubectl get ingress -n iamerican
```

### **5. Test de Conectividad**

```bash
# Port forward para testing local
kubectl port-forward svc/iamerican-ecommerce 8080:80 -n iamerican

# Probar en navegador: http://localhost:8080
```

---

## 🔄 Rollback de Emergencia

### **Si algo sale mal:**

```bash
# Rollback automático
./deploy-to-k8s.sh rollback

# O manual
kubectl rollout undo deployment/iamerican-ecommerce -n iamerican
kubectl rollout status deployment/iamerican-ecommerce -n iamerican
```

---

## 🎯 Checklist Post-Deployment

- [ ] ✅ Pods están corriendo (3/3)
- [ ] ✅ Service está expuesto correctamente
- [ ] ✅ Ingress está funcionando
- [ ] ✅ La aplicación responde en la URL
- [ ] ✅ Login funciona correctamente
- [ ] ✅ API de productos funciona
- [ ] ✅ Sistema de favoritos funciona
- [ ] ✅ Carrito persiste correctamente
- [ ] ✅ Rutas de productos funcionan sin 404

---

## 🚨 Troubleshooting

### **Pods no inician:**
```bash
kubectl describe pod <pod-name> -n iamerican
kubectl logs <pod-name> -n iamerican
```

### **Problemas de configuración:**
```bash
kubectl get configmap iamerican-config -n iamerican -o yaml
```

### **Problemas de red:**
```bash
kubectl get svc,endpoints -n iamerican
```

### **Verificar ArgoCD sync:**
```bash
argocd app get iamerican-ecommerce-app
```

---

## 📞 Soporte

Si necesitas ayuda:
1. Revisar logs con `kubectl logs`
2. Verificar eventos con `kubectl get events -n iamerican`
3. Comprobar estado de ArgoCD en la UI
4. Contactar al equipo DevOps

---

**🎉 ¡Deployment exitoso! La versión v1.1.0 con sistema de autenticación completo está lista para producción.**