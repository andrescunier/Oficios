# 🐳 Configuración Multi-Repositorio: Código vs Imágenes Docker

## 🎯 **Arquitectura Típica:**
- **📂 Código fuente:** GitHub/GitLab (manifiestos K8s)
- **🐳 Imágenes Docker:** Docker Registry separado

---

## 🚀 **Opciones de Registry para Imágenes:**

### **Opción 1: Docker Hub (Gratis para públicos)**
```yaml
# En k8s/kustomization.yaml
images:
- name: iamerican-ecommerce
  newName: andrescunier/iamerican-ecommerce  # Docker Hub
  newTag: v1.1.0
```

### **Opción 2: GitHub Container Registry (ghcr.io)**
```yaml
images:
- name: iamerican-ecommerce
  newName: ghcr.io/andrescunier/iamerican-ecommerce
  newTag: v1.1.0
```

### **Opción 3: Google Container Registry**
```yaml
images:
- name: iamerican-ecommerce
  newName: gcr.io/tu-proyecto/iamerican-ecommerce
  newTag: v1.1.0
```

### **Opción 4: Registry Privado**
```yaml
images:
- name: iamerican-ecommerce
  newName: tu-registry.com/iamerican-ecommerce
  newTag: v1.1.0
```

---

## 🔧 **Configuración en el Deployment:**

```yaml
# k8s/deployment.yaml
spec:
  template:
    spec:
      containers:
      - name: iamerican-app
        image: iamerican-ecommerce:latest  # Nombre base
        # Kustomize reemplazará esto con la imagen real
```

**Kustomize automáticamente reemplaza el nombre base con el registry completo.**

---

## 🎯 **Flujo Recomendado:**

### **1. Desarrollo Local:**
```bash
# Construir imagen
docker build -t iamerican-ecommerce:v1.1.0 .

# Tagear para registry
docker tag iamerican-ecommerce:v1.1.0 andrescunier/iamerican-ecommerce:v1.1.0

# Subir imagen
docker push andrescunier/iamerican-ecommerce:v1.1.0
```

### **2. Actualizar Manifiestos:**
```bash
# Actualizar k8s/kustomization.yaml
images:
- name: iamerican-ecommerce
  newName: andrescunier/iamerican-ecommerce
  newTag: v1.1.0

# Commit y push
git add .
git commit -m "update: imagen v1.1.0"
git push origin main
```

### **3. ArgoCD hace el resto:**
- Detecta cambios en GitHub
- Aplica nuevos manifiestos
- Kubernetes descarga imagen del registry
- ✅ Deployment actualizado

---

## 🔐 **Si el Registry es Privado:**

### **Crear ImagePullSecret:**
```bash
kubectl create secret docker-registry regcred \
  --docker-server=tu-registry.com \
  --docker-username=tu-usuario \
  --docker-password=tu-password \
  --docker-email=tu-email@example.com \
  -n iamerican
```

### **Referenciar en Deployment:**
```yaml
spec:
  template:
    spec:
      imagePullSecrets:
      - name: regcred
      containers:
      - name: iamerican-app
        image: iamerican-ecommerce:latest
```

---

## 📋 **Resumen del Flujo:**

1. **📝 Código:** GitHub (`https://github.com/andrescunier/DIAP.git`)
2. **🐳 Imagen:** Docker Hub (`andrescunier/iamerican-ecommerce:v1.1.0`)
3. **⚡ ArgoCD:** Lee manifiestos de GitHub, aplica a K8s
4. **🎯 Kubernetes:** Descarga imagen de Docker Hub

**¡Todo funciona perfectamente con repositorios separados!**