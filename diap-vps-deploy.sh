#!/bin/bash

#####################################
# Script de Despliegue DIAP en VPS
# Deployment to Kubernetes Pod
#####################################

set -e

echo "🚀 Iniciando despliegue de DIAP B2B Platform..."

# Configuración
PROJECT_NAME="diap-ecommerce"
NAMESPACE="diap"
IMAGE_NAME="diap-ecommerce"
IMAGE_TAG="${1:-latest}"
REGISTRY="${REGISTRY:-localhost:5000}"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Paso 1: Construyendo imagen Docker...${NC}"
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

echo -e "${BLUE}🏷️  Paso 2: Taggeando imagen para registry...${NC}"
docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}

echo -e "${BLUE}📤 Paso 3: Subiendo imagen al registry...${NC}"
docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}

echo -e "${BLUE}🔧 Paso 4: Creando namespace si no existe...${NC}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

echo -e "${BLUE}📝 Paso 5: Aplicando configuración de Kubernetes...${NC}"
kubectl apply -f k8s/diap-namespace.yaml
kubectl apply -f k8s/diap-deployment.yaml

echo -e "${BLUE}⏳ Paso 6: Esperando a que los pods estén listos...${NC}"
kubectl rollout status deployment/${PROJECT_NAME} -n ${NAMESPACE} --timeout=5m

echo -e "${BLUE}📊 Paso 7: Verificando estado del deployment...${NC}"
kubectl get pods -n ${NAMESPACE} -l app=${PROJECT_NAME}
kubectl get svc -n ${NAMESPACE} -l app=${PROJECT_NAME}

echo -e "${GREEN}✅ ¡Despliegue completado exitosamente!${NC}"
echo ""
echo "📋 Información del deployment:"
echo "   Namespace: ${NAMESPACE}"
echo "   Deployment: ${PROJECT_NAME}"
echo "   Image: ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
echo ""
echo "🔍 Comandos útiles:"
echo "   Ver logs:    kubectl logs -f deployment/${PROJECT_NAME} -n ${NAMESPACE}"
echo "   Ver pods:    kubectl get pods -n ${NAMESPACE}"
echo "   Describir:   kubectl describe deployment/${PROJECT_NAME} -n ${NAMESPACE}"
echo "   Port forward: kubectl port-forward -n ${NAMESPACE} service/${PROJECT_NAME} 8080:80"
