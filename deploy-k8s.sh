#!/bin/bash

# Script para deployar DIAP Store en Kubernetes
# Usa la imagen desde GitHub Container Registry

set -e

echo "🚀 Deployment de DIAP Store en Kubernetes"
echo "=========================================="

NAMESPACE="diap"
IMAGE="ghcr.io/andrescunier/diap-ecommerce:latest"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl no está instalado${NC}"
    exit 1
fi

# Crear namespace si no existe
echo -e "\n${YELLOW}📦 Verificando namespace...${NC}"
if kubectl get namespace $NAMESPACE &> /dev/null; then
    echo -e "${GREEN}✓ Namespace '$NAMESPACE' existe${NC}"
else
    echo -e "${YELLOW}Creando namespace '$NAMESPACE'...${NC}"
    kubectl create namespace $NAMESPACE
    echo -e "${GREEN}✓ Namespace creado${NC}"
fi

# Crear secret para pull de imagen desde GHCR
echo -e "\n${YELLOW}🔐 Configurando acceso a GitHub Container Registry...${NC}"
read -p "¿Tienes un Personal Access Token de GitHub con permisos de packages? (y/n): " has_token

if [ "$has_token" = "y" ]; then
    read -p "Ingresa tu username de GitHub: " GITHUB_USER
    read -sp "Ingresa tu Personal Access Token: " GITHUB_TOKEN
    echo
    
    # Crear secret si no existe
    kubectl delete secret ghcr-secret -n $NAMESPACE --ignore-not-found=true
    kubectl create secret docker-registry ghcr-secret \
        --docker-server=ghcr.io \
        --docker-username=$GITHUB_USER \
        --docker-password=$GITHUB_TOKEN \
        --docker-email=$GITHUB_USER@users.noreply.github.com \
        -n $NAMESPACE
    
    echo -e "${GREEN}✓ Secret creado${NC}"
else
    echo -e "${YELLOW}⚠️  Si la imagen es privada, el pull fallará. Asegúrate de que sea pública.${NC}"
    echo -e "${YELLOW}   O crea el secret manualmente después.${NC}"
fi

# Aplicar deployment
echo -e "\n${YELLOW}📦 Aplicando deployment...${NC}"
kubectl apply -f k8s/deployment-ghcr.yaml

# Esperar a que el deployment esté listo
echo -e "\n${YELLOW}⏳ Esperando a que el deployment esté listo...${NC}"
kubectl rollout status deployment/diap-ecommerce -n $NAMESPACE --timeout=300s

# Mostrar status
echo -e "\n${GREEN}✅ Deployment completado!${NC}"
echo -e "\n${YELLOW}📊 Estado de los pods:${NC}"
kubectl get pods -n $NAMESPACE -l app=diap-ecommerce

echo -e "\n${YELLOW}🌐 Servicios:${NC}"
kubectl get svc -n $NAMESPACE

echo -e "\n${GREEN}=========================================="
echo -e "✅ Deployment exitoso!"
echo -e "=========================================${NC}"
echo
echo "Comandos útiles:"
echo "  Ver logs:        kubectl logs -f deployment/diap-ecommerce -n $NAMESPACE"
echo "  Ver pods:        kubectl get pods -n $NAMESPACE"
echo "  Port forward:    kubectl port-forward svc/diap-ecommerce 8080:80 -n $NAMESPACE"
echo "  Escalar:         kubectl scale deployment diap-ecommerce --replicas=5 -n $NAMESPACE"
echo "  Actualizar img:  kubectl set image deployment/diap-ecommerce diap-app=$IMAGE -n $NAMESPACE"
echo
