# 🔑 Configuración de Token GitHub en ArgoCD

## 🎯 **Método 1: Desde la UI de ArgoCD (Recomendado)**

### **Paso 1: Crear Personal Access Token en GitHub**
1. Ve a GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Click **"Generate new token (classic)"**
3. Configura:
   - **Note:** `ArgoCD-DIAP-Access`
   - **Expiration:** `90 days`
   - **Scopes:** Marca ✅ `repo` (Full control of private repositories)
4. **COPIA EL TOKEN** (solo se muestra una vez)

### **Paso 2: Configurar en ArgoCD UI**
1. En ArgoCD, ve al menú lateral: **Settings** ⚙️
2. Click en **"Repositories"**
3. Click **"+ CONNECT REPO USING HTTPS"**
4. Completa el formulario:
   ```
   Type: git
   Repository URL: https://github.com/andrescunier/DIAP.git
   Username: andrescunier
   Password: ghp_xxxxxxxxxxxxxxxxxxxx  (tu token)
   ```
5. Click **"CONNECT"**
6. Debería aparecer como ✅ "Successful"

---

## 🎯 **Método 2: Usando kubectl (Avanzado)**

```bash
# Crear secret con credenciales
kubectl create secret generic diap-repo-secret \
  --from-literal=type=git \
  --from-literal=url=https://github.com/andrescunier/DIAP.git \
  --from-literal=username=andrescunier \
  --from-literal=password=TU_TOKEN_AQUI \
  -n argocd

# Etiquetar el secret para ArgoCD
kubectl label secret diap-repo-secret \
  argocd.argoproj.io/secret-type=repository \
  -n argocd
```

---

## 🎯 **Método 3: YAML Completo para kubectl**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: diap-repo-secret
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: repository
type: Opaque
stringData:
  type: git
  url: https://github.com/andrescunier/DIAP.git
  username: andrescunier
  password: TU_GITHUB_TOKEN_AQUI
```

Aplicar con: `kubectl apply -f repo-secret.yaml`

---

## ✅ **Verificación:**
Después de configurar, deberías ver el repo en:
**ArgoCD UI** → **Settings** → **Repositories** → ✅ `https://github.com/andrescunier/DIAP.git`