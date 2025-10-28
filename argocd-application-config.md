# Configuración para ArgoCD Application - iAmerican E-commerce

## 📋 Datos para completar en la UI de ArgoCD:

### **GENERAL:**
- **Application Name:** `iamerican-ecommerce`
- **Project:** `default`
- **Sync Policy:** `Manual` (o `Automatic` si prefieres)

### **SOURCE:**
- **Repository URL:** `https://github.com/andrescunier/DIAP.git`
- **Revision:** `HEAD` (o `main`)
- **Path:** `k8s`

### **DESTINATION:**
- **Cluster URL:** `https://kubernetes.default.svc`
- **Namespace:** `iamerican`

### **DIRECTORY (si aparece):**
- **Path:** `k8s`

---

## 🔧 Configuración Avanzada (si es necesaria):

### **HELM (No aplica - usar Directory)**
- Dejar vacío, usaremos Kustomize

### **KUSTOMIZE:**
- ArgoCD detectará automáticamente el `kustomization.yaml`

### **SYNC OPTIONS (recomendado):**
- ✅ `Create Namespace` - Para crear automáticamente el namespace
- ✅ `Auto-Prune Resources` - Para limpiar recursos huérfanos
- ✅ `Self Heal` - Para auto-reparar cambios manuales

---

## 📄 Alternativa: YAML completo para pegar

Si prefieres usar YAML directo, aquí está la configuración completa:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: iamerican-ecommerce
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  
  source:
    repoURL: https://github.com/andrescunier/DIAP.git
    targetRevision: HEAD
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
      - ApplyOutOfSyncOnly=true
    retry:
      limit: 3
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  
  revisionHistoryLimit: 10
```