# 🔑 Configuración de Acceso al Repositorio Privado en ArgoCD

## Si el repositorio es PRIVADO, necesitas configurar credenciales:

### 🎯 **Paso 1: Crear Personal Access Token en GitHub**

1. Ve a GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Configura:
   - **Note:** `ArgoCD Access - DIAP`
   - **Expiration:** `90 days` (o el tiempo que prefieras)
   - **Scopes:** Marca ✅ `repo` (Full control of private repositories)
4. Click **"Generate token"**
5. **¡COPIA EL TOKEN!** (solo se muestra una vez)

### 🎯 **Paso 2: Configurar en ArgoCD**

#### **Opción A: Desde la UI de ArgoCD**
1. Ve a **Settings** → **Repositories**
2. Click **"+ CONNECT REPO USING HTTPS"**
3. Completa:
   ```
   Repository URL: https://github.com/andrescunier/DIAP.git
   Username: andrescunier
   Password: [TU_PERSONAL_ACCESS_TOKEN]
   ```
4. Click **"CONNECT"**

#### **Opción B: Usando kubectl (YAML)**
```bash
kubectl create secret generic repo-secret \
  --from-literal=username=andrescunier \
  --from-literal=password=TU_TOKEN_AQUI \
  -n argocd

kubectl label secret repo-secret argocd.argoproj.io/secret-type=repository -n argocd
```

### 🎯 **Paso 3: Crear la Application de Nuevo**

Después de configurar el acceso al repo:
1. Vuelve a crear la application en ArgoCD
2. Usa la misma configuración que tenías
3. Ahora debería funcionar sin errores

---

## 🚀 **Opción MÁS SIMPLE: Hacer el repo público**

Si no necesitas que el repo sea privado:
1. Ve a `https://github.com/andrescunier/DIAP`
2. **Settings** → **General** → **Danger Zone**
3. **"Change repository visibility"** → **"Make public"**
4. Confirma el cambio
5. Vuelve a ArgoCD y reintenta crear la application

---

## 📝 **Configuración Correcta para la Application:**

Una vez resuelto el acceso al repo, usa esta configuración:

```yaml
Application Name: iamerican-ecommerce
Project Name: default
Sync Policy: Manual

SOURCE:
Repository URL: https://github.com/andrescunier/DIAP.git
Revision: HEAD
Path: k8s

DESTINATION:
Cluster URL: https://kubernetes.default.svc
Namespace: iamerican

SYNC OPTIONS: (recomendado)
☑️ AUTO-CREATE NAMESPACE
☑️ APPLY OUT OF SYNC ONLY
```