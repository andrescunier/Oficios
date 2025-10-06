#!/bin/bash

# =========================================
# SCRIPT DE DESPLIEGUE PARA KUBERNETES
# Uso: ./k8s-deploy-env.sh [production|staging|development]
# =========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
ENVIRONMENT=${1:-production}
NAMESPACE="iamerican"
APP_NAME="iamerican-ecommerce"

echo -e "${BLUE}==========================================="
echo -e "🚀 DESPLEGANDO iAMERICAN EN KUBERNETES"
echo -e "===========================================${NC}"
echo -e "${YELLOW}Entorno: ${ENVIRONMENT}${NC}"
echo -e "${YELLOW}Namespace: ${NAMESPACE}${NC}"
echo ""

# Validar entorno
case $ENVIRONMENT in
    production|staging|development)
        echo -e "${GREEN}✅ Entorno válido: ${ENVIRONMENT}${NC}"
        ;;
    *)
        echo -e "${RED}❌ Entorno inválido. Usar: production, staging, o development${NC}"
        exit 1
        ;;
esac

# Función para aplicar recursos
apply_resource() {
    local resource=$1
    local description=$2
    
    echo -e "${BLUE}📦 Aplicando ${description}...${NC}"
    if kubectl apply -f "$resource" -n "$NAMESPACE"; then
        echo -e "${GREEN}✅ ${description} aplicado correctamente${NC}"
    else
        echo -e "${RED}❌ Error aplicando ${description}${NC}"
        exit 1
    fi
    echo ""
}

# Crear namespace si no existe
echo -e "${BLUE}🏗️  Verificando namespace...${NC}"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
echo -e "${GREEN}✅ Namespace verificado${NC}"
echo ""

# Aplicar ConfigMap según entorno
echo -e "${BLUE}⚙️  Aplicando configuración para ${ENVIRONMENT}...${NC}"
case $ENVIRONMENT in
    production)
        apply_resource "k8s/configmap.yaml" "ConfigMap de Producción"
        CONFIGMAP_NAME="iamerican-config"
        REPLICAS=3
        ;;
    staging)
        apply_resource "k8s/configmap-environments.yaml" "ConfigMaps de Entornos"
        CONFIGMAP_NAME="iamerican-config-staging"
        REPLICAS=2
        ;;
    development)
        apply_resource "k8s/configmap-environments.yaml" "ConfigMaps de Entornos"
        CONFIGMAP_NAME="iamerican-config-dev"
        REPLICAS=1
        ;;
esac

# Crear deployment temporal con el ConfigMap correcto
echo -e "${BLUE}🔧 Creando deployment para ${ENVIRONMENT}...${NC}"
cat k8s/deployment-with-env.yaml | \
    sed "s/name: iamerican-config/name: ${CONFIGMAP_NAME}/g" | \
    sed "s/replicas: 3/replicas: ${REPLICAS}/g" | \
    sed "s/environment: production/environment: ${ENVIRONMENT}/g" | \
    kubectl apply -f - -n "$NAMESPACE"

echo -e "${GREEN}✅ Deployment aplicado con ConfigMap: ${CONFIGMAP_NAME}${NC}"
echo ""

# Aplicar otros recursos
apply_resource "k8s/service.yaml" "Service"
apply_resource "k8s/ingress.yaml" "Ingress"

# Si es producción, aplicar HPA
if [ "$ENVIRONMENT" == "production" ]; then
    apply_resource "k8s/hpa.yaml" "HPA (Auto-scaling)"
fi

# Verificar estado del deployment
echo -e "${BLUE}🔍 Verificando estado del deployment...${NC}"
kubectl rollout status deployment/"${APP_NAME}" -n "$NAMESPACE" --timeout=300s

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment completado exitosamente${NC}"
else
    echo -e "${RED}❌ Error en el deployment${NC}"
    exit 1
fi

# Mostrar información del despliegue
echo ""
echo -e "${BLUE}📊 INFORMACIÓN DEL DESPLIEGUE${NC}"
echo -e "${BLUE}================================${NC}"
echo -e "${YELLOW}Pods:${NC}"
kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME"
echo ""
echo -e "${YELLOW}Services:${NC}"
kubectl get svc -n "$NAMESPACE"
echo ""
echo -e "${YELLOW}ConfigMaps:${NC}"
kubectl get configmap -n "$NAMESPACE"
echo ""

# Mostrar variables de entorno cargadas
echo -e "${BLUE}🔧 Variables de entorno cargadas desde ConfigMap:${NC}"
POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$POD_NAME" ]; then
    echo -e "${YELLOW}Pod: ${POD_NAME}${NC}"
    kubectl exec -n "$NAMESPACE" "$POD_NAME" -- env | grep VITE_ | head -10
    echo "..."
else
    echo -e "${YELLOW}⚠️  No hay pods disponibles aún${NC}"
fi

echo ""
echo -e "${GREEN}🎉 DESPLIEGUE COMPLETADO PARA ENTORNO: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}==========================================${NC}"

# Comandos útiles
echo -e "${YELLOW}📝 Comandos útiles:${NC}"
echo -e "Ver logs:           ${BLUE}kubectl logs -f deployment/${APP_NAME} -n ${NAMESPACE}${NC}"
echo -e "Ver pods:           ${BLUE}kubectl get pods -n ${NAMESPACE}${NC}"
echo -e "Describir pod:      ${BLUE}kubectl describe pod <pod-name> -n ${NAMESPACE}${NC}"
echo -e "Ver variables:      ${BLUE}kubectl exec -n ${NAMESPACE} <pod-name> -- env | grep VITE_${NC}"
echo -e "Port forward:       ${BLUE}kubectl port-forward svc/${APP_NAME} 8080:80 -n ${NAMESPACE}${NC}"
echo ""