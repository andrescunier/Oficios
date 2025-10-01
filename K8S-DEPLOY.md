# ☸️ Guía de Deploy en Kubernetes

## 🏗️ Arquitectura de Kubernetes

```
🌐 Internet
    ↓
🔀 Load Balancer / Ingress
    ↓
🎯 Service (ClusterIP)
    ↓
🚀 Deployment (3 réplicas)
    ↓
📦 Pods (iamerican-ecommerce)
```

## 📋 Prerequisitos

### Kubernetes Cluster
- **Kubernetes**: v1.20+ 
- **kubectl**: Configurado y conectado al cluster
- **Ingress Controller**: nginx-ingress-controller (recomendado)
- **Cert-Manager**: Para SSL automático (opcional)

### Recursos Mínimos del Cluster
- **Nodes**: 2+ nodes (para alta disponibilidad)
- **CPU**: 4+ vCores totales
- **RAM**: 8GB+ total
- **Storage**: 50GB+ persistente

## 🚀 Deploy Rápido

### 1. Preparar imagen Docker
```bash
# Construir imagen
docker build -t iamerican-ecommerce:latest .

# Subir a registry (Docker Hub, ACR, ECR, etc.)
docker tag iamerican-ecommerce:latest tu-registry/iamerican-ecommerce:latest
docker push tu-registry/iamerican-ecommerce:latest
```

### 2. Deploy en Kubernetes
```bash
# Deploy completo
./k8s-deploy.sh apply

# O aplicar manualmente
kubectl apply -f k8s/
```

### 3. Verificar deploy
```bash
# Ver estado
./k8s-deploy.sh status

# Ver logs
./k8s-deploy.sh logs
```

## 🔧 Configuración Detallada

### Editar ConfigMap
```bash
# Editar configuración
kubectl edit configmap iamerican-config -n iamerican

# Actualizar dominio en Ingress
kubectl edit ingress iamerican-ingress -n iamerican
```

### Escalar aplicación
```bash
# Escalar manualmente
kubectl scale deployment iamerican-ecommerce --replicas=5 -n iamerican

# El HPA escalará automáticamente según CPU/memoria
kubectl get hpa -n iamerican
```

## 🌐 Configuración de Dominio

### Con Ingress (Recomendado)
1. **Instalar nginx-ingress-controller**:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

2. **Configurar DNS**:
```
# Obtener IP externa del LoadBalancer
kubectl get service ingress-nginx-controller -n ingress-nginx

# Configurar DNS
tu-dominio.com → A → IP-EXTERNA
```

3. **SSL automático con cert-manager**:
```bash
# Instalar cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Crear ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: tu-email@dominio.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Con LoadBalancer (Cloud Providers)
```bash
# Obtener IP externa
kubectl get service iamerican-loadbalancer -n iamerican

# Configurar DNS
tu-dominio.com → A → IP-EXTERNA
```

## 📊 Monitoreo y Troubleshooting

### Ver estado de recursos
```bash
# Pods
kubectl get pods -n iamerican -o wide

# Services
kubectl get services -n iamerican

# Ingress
kubectl get ingress -n iamerican

# HPA
kubectl get hpa -n iamerican
```

### Debugging
```bash
# Logs de un pod específico
kubectl logs -f pod/iamerican-ecommerce-xxx-yyy -n iamerican

# Describir pod con problemas
kubectl describe pod iamerican-ecommerce-xxx-yyy -n iamerican

# Shell dentro del pod
kubectl exec -it pod/iamerican-ecommerce-xxx-yyy -n iamerican -- /bin/sh

# Port forward para testing local
kubectl port-forward service/iamerican-service 8080:80 -n iamerican
# Luego acceder a http://localhost:8080
```

### Métricas y monitoreo
```bash
# CPU y memoria de pods
kubectl top pods -n iamerican

# Eventos del namespace
kubectl get events -n iamerican --sort-by='.lastTimestamp'

# Estado del HPA
kubectl describe hpa iamerican-hpa -n iamerican
```

## 🔄 Actualizaciones

### Rolling Update
```bash
# Con nueva imagen
./k8s-deploy.sh update "" tu-registry/iamerican-ecommerce:v1.1.0

# O manualmente
kubectl set image deployment/iamerican-ecommerce iamerican-app=tu-registry/iamerican-ecommerce:v1.1.0 -n iamerican

# Ver progreso
kubectl rollout status deployment/iamerican-ecommerce -n iamerican
```

### Rollback
```bash
# Ver historial
kubectl rollout history deployment/iamerican-ecommerce -n iamerican

# Rollback a versión anterior
kubectl rollout undo deployment/iamerican-ecommerce -n iamerican

# Rollback a versión específica
kubectl rollout undo deployment/iamerican-ecommerce --to-revision=2 -n iamerican
```

## 🏗️ Entornos Múltiples

### Con Kustomize
```bash
# Deploy con kustomize
kubectl apply -k k8s/

# Deploy en diferentes entornos
kubectl apply -k k8s/overlays/staging/
kubectl apply -k k8s/overlays/production/
```

### Namespaces separados
```bash
# Staging
kubectl apply -f k8s/ --namespace=iamerican-staging

# Production
kubectl apply -f k8s/ --namespace=iamerican-production
```

## 🔒 Seguridad

### Network Policies
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: iamerican-network-policy
  namespace: iamerican
spec:
  podSelector:
    matchLabels:
      app: iamerican-ecommerce
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 443  # HTTPS para APIs externas
```

### Resource Quotas
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: iamerican-quota
  namespace: iamerican
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    pods: "10"
```

## 📈 Optimizaciones

### Configuración de recursos
- **Requests**: CPU 250m, Memory 256Mi (mínimo garantizado)
- **Limits**: CPU 500m, Memory 512Mi (máximo permitido)
- **HPA**: Escala de 2 a 10 pods según carga

### Cache y performance
- **Nginx cache**: Configurado para assets estáticos
- **Gzip compression**: Habilitado para reducir bandwidth
- **Keep-alive**: Configurado para conexiones persistentes

## 🎯 URLs y Acceso

### Después del deploy:
- **Ingress**: `https://tu-dominio.com`
- **LoadBalancer**: `http://EXTERNAL-IP`
- **Port Forward**: `http://localhost:8080`
- **Dashboard**: Si tienes k8s dashboard instalado

### Comandos de acceso rápido:
```bash
# Obtener URL del LoadBalancer
kubectl get service iamerican-loadbalancer -n iamerican

# Port forward temporal
kubectl port-forward service/iamerican-service 8080:80 -n iamerican

# Proxy a través de kubectl
kubectl proxy
# Luego: http://localhost:8001/api/v1/namespaces/iamerican/services/iamerican-service:80/proxy/
```