# 🚀 Guía de Despliegue DIAP B2B en VPS (Kubernetes Pod)

## 📋 Requisitos Previos

- ✅ Kubernetes cluster configurado en tu VPS
- ✅ `kubectl` instalado y configurado
- ✅ Docker registry accesible (local o remoto)
- ✅ Acceso SSH a tu VPS

## 🔧 Configuración Inicial

### 1. Variables de Entorno Críticas

Las siguientes variables están configuradas en el deployment y son **críticas para B2B**:

```bash
VITE_HIDE_PRICES_FOR_GUESTS=true          # Ocultar precios sin login
VITE_REQUIRE_AUTH_FOR_CART=true           # Bloquear carrito sin login
VITE_APP_NAME=DIAP                        # Nombre de la app
VITE_COMPANY_NAME=DIAP                    # Nombre de la empresa
VITE_LOGO_PATH=/diap-logo.png            # Ruta del logo
```

### 2. Configurar Docker Registry

Si usas un registry local en tu VPS:

```bash
# En tu VPS
docker run -d -p 5000:5000 --restart=always --name registry registry:2

# Configurar en el script
export REGISTRY=tu-vps-ip:5000
```

Si usas Docker Hub u otro registry:

```bash
export REGISTRY=docker.io/tu-usuario
# o
export REGISTRY=ghcr.io/andrescunier
```

## 🚀 Despliegue Rápido

### Opción 1: Usando el script automatizado

```bash
# Desde tu máquina local
cd /home/andis/DIAP

# Desplegar con tag 'latest'
./diap-vps-deploy.sh

# O desplegar con tag específico
./diap-vps-deploy.sh v1.0.0
```

### Opción 2: Despliegue manual paso a paso

#### Paso 1: Construir la imagen

```bash
docker build -t diap-ecommerce:latest .
```

#### Paso 2: Subir al registry

```bash
# Taggear
docker tag diap-ecommerce:latest $REGISTRY/diap-ecommerce:latest

# Pushear
docker push $REGISTRY/diap-ecommerce:latest
```

#### Paso 3: Aplicar configuración Kubernetes

```bash
# Crear namespace
kubectl apply -f k8s/diap-namespace.yaml

# Desplegar aplicación
kubectl apply -f k8s/diap-deployment.yaml
```

#### Paso 4: Verificar deployment

```bash
# Ver estado de pods
kubectl get pods -n diap

# Ver logs en tiempo real
kubectl logs -f deployment/diap-ecommerce -n diap

# Ver servicios
kubectl get svc -n diap
```

## 🔍 Verificación Post-Despliegue

### 1. Verificar que los pods están corriendo

```bash
kubectl get pods -n diap -l app=diap-ecommerce
```

Deberías ver algo como:

```
NAME                              READY   STATUS    RESTARTS   AGE
diap-ecommerce-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
diap-ecommerce-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
```

### 2. Probar acceso local (Port Forward)

```bash
kubectl port-forward -n diap service/diap-ecommerce 8080:80
```

Luego abre: http://localhost:8080

### 3. Verificar logs

```bash
# Logs de todos los pods
kubectl logs -n diap -l app=diap-ecommerce --tail=100

# Logs de un pod específico
kubectl logs -n diap diap-ecommerce-xxxxxxxxxx-xxxxx
```

## 🌐 Exponer al Exterior

### Opción A: NodePort (Simple)

Edita `k8s/diap-deployment.yaml` y cambia el Service:

```yaml
spec:
  type: NodePort
  ports:
  - name: http
    port: 80
    targetPort: 80
    nodePort: 30080  # Puerto externo
```

Luego accede: `http://tu-vps-ip:30080`

### Opción B: Ingress (Recomendado)

Crea un Ingress para usar un dominio:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: diap-ingress
  namespace: diap
spec:
  rules:
  - host: diap.tudominio.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: diap-ecommerce
            port:
              number: 80
```

## 🔄 Actualizar Deployment

### Actualizar con nueva versión

```bash
# Construir nueva versión
docker build -t diap-ecommerce:v1.0.1 .
docker tag diap-ecommerce:v1.0.1 $REGISTRY/diap-ecommerce:v1.0.1
docker push $REGISTRY/diap-ecommerce:v1.0.1

# Actualizar deployment
kubectl set image deployment/diap-ecommerce -n diap \
  diap-app=$REGISTRY/diap-ecommerce:v1.0.1

# Ver progreso
kubectl rollout status deployment/diap-ecommerce -n diap
```

### Rollback si algo sale mal

```bash
# Ver historial
kubectl rollout history deployment/diap-ecommerce -n diap

# Volver a versión anterior
kubectl rollout undo deployment/diap-ecommerce -n diap

# Volver a versión específica
kubectl rollout undo deployment/diap-ecommerce -n diap --to-revision=2
```

## 📊 Monitoreo

### Ver recursos

```bash
# CPU y memoria de los pods
kubectl top pods -n diap

# Estado general
kubectl get all -n diap
```

### Ver eventos

```bash
kubectl get events -n diap --sort-by='.lastTimestamp'
```

## 🛠️ Troubleshooting

### Pod no inicia

```bash
# Ver detalles del pod
kubectl describe pod -n diap <pod-name>

# Ver logs
kubectl logs -n diap <pod-name>
```

### Problemas con imagen

```bash
# Verificar que la imagen existe
docker images | grep diap-ecommerce

# Verificar en registry
curl http://$REGISTRY/v2/diap-ecommerce/tags/list
```

### Restart de pods

```bash
# Reiniciar todos los pods
kubectl rollout restart deployment/diap-ecommerce -n diap

# Eliminar un pod específico (se recreará automáticamente)
kubectl delete pod -n diap <pod-name>
```

## 🔐 Seguridad

### Agregar Secrets (API keys, etc.)

```bash
kubectl create secret generic diap-secrets -n diap \
  --from-literal=VITE_API_KEY=tu-api-key \
  --from-literal=VITE_API_URL=https://api.tudominio.com
```

### Agregar ConfigMap

```bash
kubectl create configmap diap-config -n diap \
  --from-file=.env.production
```

## 📝 Comandos Útiles

```bash
# Ver todos los recursos en namespace diap
kubectl get all -n diap

# Ejecutar comando en pod
kubectl exec -it -n diap <pod-name> -- sh

# Copiar archivo desde pod
kubectl cp -n diap <pod-name>:/path/to/file ./local-file

# Ver configuración completa del deployment
kubectl get deployment diap-ecommerce -n diap -o yaml

# Escalar réplicas
kubectl scale deployment diap-ecommerce -n diap --replicas=3

# Ver métricas
kubectl top nodes
kubectl top pods -n diap
```

## ✅ Checklist de Despliegue

- [ ] Código pusheado a GitHub
- [ ] Variables de entorno configuradas
- [ ] Docker registry configurado
- [ ] Namespace creado
- [ ] Imagen construida y pusheada
- [ ] Deployment aplicado
- [ ] Pods corriendo (2/2 READY)
- [ ] Service creado
- [ ] Port-forward funciona
- [ ] Ingress/NodePort configurado
- [ ] Dominio apunta al VPS
- [ ] Funcionalidad B2B verificada:
  - [ ] Precios ocultos sin login
  - [ ] Carrito bloqueado sin login
  - [ ] Slider muestra imágenes correctas
  - [ ] Logo DIAP visible

## 🆘 Soporte

Si tienes problemas:

1. Revisa los logs: `kubectl logs -n diap -l app=diap-ecommerce`
2. Verifica eventos: `kubectl get events -n diap`
3. Describe el deployment: `kubectl describe deployment diap-ecommerce -n diap`
4. Verifica la imagen: `docker images | grep diap`

---

**¡Deployment exitoso! 🎉**

Tu aplicación DIAP B2B debería estar corriendo en tu VPS.
