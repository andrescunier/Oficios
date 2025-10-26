#!/bin/bash

# Script para deployment automatizado en Kubernetes con ArgoCD
# Versión: 1.1.0 - Sistema de autenticación completo

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
APP_NAME="iamerican-ecommerce"
NEW_VERSION="v1.1.0"
REGISTRY="your-registry.com"  # Cambiar por tu registry
NAMESPACE="iamerican"
ARGOCD_APP="iamerican-ecommerce-app"

echo -e "${BLUE}🚀 Iniciando deployment de $APP_NAME versión $NEW_VERSION${NC}"

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo ""
    echo "Opciones:"
    echo "  build     - Solo construir la imagen Docker"
    echo "  push      - Solo subir imagen al registry"
    echo "  deploy    - Solo hacer deployment en k8s"
    echo "  all       - Hacer todo el proceso completo"
    echo "  sync      - Solo sincronizar ArgoCD"
    echo "  rollback  - Rollback a versión anterior"
    echo "  help      - Mostrar esta ayuda"
    echo ""
}

# Función para construir imagen
build_image() {
    echo -e "${YELLOW}📦 Construyendo imagen Docker...${NC}"
    
    if command -v docker &> /dev/null; then
        docker build -t $APP_NAME:$NEW_VERSION .
        docker tag $APP_NAME:$NEW_VERSION $REGISTRY/$APP_NAME:$NEW_VERSION
        echo -e "${GREEN}✅ Imagen construida exitosamente${NC}"
    else
        echo -e "${RED}❌ Docker no está instalado${NC}"
        echo "Instala Docker con: sudo apt install docker.io"
        exit 1
    fi
}

# Función para subir imagen
push_image() {
    echo -e "${YELLOW}📤 Subiendo imagen al registry...${NC}"
    
    if command -v docker &> /dev/null; then
        # docker login $REGISTRY  # Descomenta si necesitas login
        docker push $REGISTRY/$APP_NAME:$NEW_VERSION
        echo -e "${GREEN}✅ Imagen subida exitosamente${NC}"
    else
        echo -e "${RED}❌ Docker no está disponible para push${NC}"
        exit 1
    fi
}

# Función para hacer deployment
deploy_k8s() {
    echo -e "${YELLOW}🔄 Aplicando manifiestos de Kubernetes...${NC}"
    
    # Verificar que kubectl esté disponible
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}❌ kubectl no está instalado${NC}"
        exit 1
    fi
    
    # Aplicar con kustomize
    echo "Aplicando configuración con kustomize..."
    kubectl apply -k k8s/
    
    echo -e "${GREEN}✅ Manifiestos aplicados exitosamente${NC}"
    
    # Verificar el rollout
    echo -e "${YELLOW}⏳ Esperando rollout del deployment...${NC}"
    kubectl rollout status deployment/$APP_NAME -n $NAMESPACE --timeout=300s
    
    echo -e "${GREEN}✅ Deployment completado exitosamente${NC}"
}

# Función para sincronizar ArgoCD
sync_argocd() {
    echo -e "${YELLOW}🔄 Sincronizando con ArgoCD...${NC}"
    
    if command -v argocd &> /dev/null; then
        # Sincronizar la aplicación
        argocd app sync $ARGOCD_APP
        
        # Esperar a que termine la sincronización
        argocd app wait $ARGOCD_APP --timeout 300
        
        echo -e "${GREEN}✅ ArgoCD sincronizado exitosamente${NC}"
    else
        echo -e "${YELLOW}⚠️  ArgoCD CLI no está instalado${NC}"
        echo "Puedes sincronizar manualmente desde la UI de ArgoCD"
        echo "O instalar el CLI: https://argo-cd.readthedocs.io/en/stable/cli_installation/"
    fi
}

# Función para rollback
rollback() {
    echo -e "${YELLOW}⏪ Haciendo rollback...${NC}"
    
    if command -v kubectl &> /dev/null; then
        kubectl rollout undo deployment/$APP_NAME -n $NAMESPACE
        kubectl rollout status deployment/$APP_NAME -n $NAMESPACE
        echo -e "${GREEN}✅ Rollback completado${NC}"
    else
        echo -e "${RED}❌ kubectl no está disponible${NC}"
        exit 1
    fi
}

# Función para mostrar status
show_status() {
    echo -e "${BLUE}📊 Estado actual del deployment:${NC}"
    
    if command -v kubectl &> /dev/null; then
        echo ""
        echo "Pods:"
        kubectl get pods -n $NAMESPACE -l app=$APP_NAME
        echo ""
        echo "Deployment:"
        kubectl get deployment $APP_NAME -n $NAMESPACE
        echo ""
        echo "Service:"
        kubectl get service $APP_NAME -n $NAMESPACE
    fi
}

# Procesar argumentos
case "${1:-all}" in
    build)
        build_image
        ;;
    push)
        push_image
        ;;
    deploy)
        deploy_k8s
        show_status
        ;;
    sync)
        sync_argocd
        show_status
        ;;
    rollback)
        rollback
        show_status
        ;;
    all)
        build_image
        push_image
        deploy_k8s
        sync_argocd
        show_status
        ;;
    status)
        show_status
        ;;
    help)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Opción no válida: $1${NC}"
        show_help
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Proceso completado exitosamente!${NC}"