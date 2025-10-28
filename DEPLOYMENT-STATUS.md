# 🔍 Verificación del Pipeline CI/CD

## ✅ **Estado Actual del Pipeline:**

### **1. GitHub Actions Status**
Para verificar el build en tiempo real:
- Ve a: `https://github.com/andrescunier/DIAP/actions`
- Busca el workflow: **"Build and Push Docker Image"**
- Estado esperado: 🟡 Running → 🟢 Completed

### **2. Verificar Imagen en GHCR**
Una vez completado, la imagen estará en:
- **Registry:** `ghcr.io/andrescunier/diap-ecommerce`
- **Tags disponibles:** `latest`, `main`, `sha-xxxxxxx`
- **URL:** `https://github.com/andrescunier/DIAP/pkgs/container/diap-ecommerce`

---

## 🚀 **Siguiente Paso: Configurar ArgoCD**

### **Opción A: UI de ArgoCD (Recomendado)**

1. **Configurar Repositorio (si no está hecho):**
   - ArgoCD → Settings → Repositories
   - Connect Repo: `https://github.com/andrescunier/DIAP.git`
   - Username: `andrescunier`
   - Password: `tu_github_token`

2. **Crear Application:**
   ```
   Application Name: iamerican-ecommerce
   Project: default
   Sync Policy: Manual
   
   SOURCE:
   Repository URL: https://github.com/andrescunier/DIAP.git
   Revision: HEAD
   Path: k8s
   
   DESTINATION:
   Cluster URL: https://kubernetes.default.svc
   Namespace: iamerican
   
   SYNC OPTIONS:
   ☑️ AUTO-CREATE NAMESPACE
   ☑️ PRUNE RESOURCES
   ```

### **Opción B: Aplicar con kubectl**

Si prefieres aplicar directamente:
```bash
kubectl apply -k k8s/
```

---

## 📊 **Verificación Post-Deploy**

### **Comandos de Verificación:**
```bash
# Ver pods
kubectl get pods -n iamerican

# Ver deployment
kubectl get deployment -n iamerican

# Ver service
kubectl get svc -n iamerican

# Ver logs
kubectl logs -f deployment/iamerican-ecommerce -n iamerican

# Port forward para testing
kubectl port-forward svc/iamerican-ecommerce 8080:80 -n iamerican
```

### **Estado Esperado:**
```
NAME                                   READY   STATUS    RESTARTS
iamerican-ecommerce-xxxxxxxxx-xxxxx    1/1     Running   0
iamerican-ecommerce-xxxxxxxxx-xxxxx    1/1     Running   0
iamerican-ecommerce-xxxxxxxxx-xxxxx    1/1     Running   0
```

---

## 🎯 **Checklist de Deployment:**

- [ ] ✅ GitHub Actions completado exitosamente
- [ ] ✅ Imagen disponible en ghcr.io
- [ ] ✅ ArgoCD repositorio configurado
- [ ] ✅ Application creada en ArgoCD
- [ ] ✅ Sync ejecutado exitosamente
- [ ] ✅ Pods corriendo (3/3)
- [ ] ✅ Service expuesto
- [ ] ✅ Aplicación accesible

---

## 🚨 **Troubleshooting Rápido:**

### **Si GitHub Actions falla:**
- Revisar logs en GitHub Actions tab
- Verificar permisos de packages
- Comprobar Dockerfile

### **Si ArgoCD no sincroniza:**
- Verificar credenciales del repo
- Comprobar path `k8s/`
- Revisar permisos de namespace

### **Si pods no inician:**
- Verificar imagen en GHCR
- Comprobar ImagePullSecrets si es privado
- Revisar logs: `kubectl describe pod <pod-name> -n iamerican`

---

**🎉 ¡Listo para el siguiente paso!**