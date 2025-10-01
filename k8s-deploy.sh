#!/bin/bash

# 🚀 Script de Deploy para Kubernetes - iAmerican E-commerce
# Uso: ./k8s-deploy.sh [apply|delete|update] [namespace]

set -e

ACCION=${1:-apply}
NAMESPACE=${2:-iamerican}
REGISTRY=${3:-""}  # Registry de imágenes (Docker Hub, ACR, ECR, etc.)
TAG=${4:-latest}

echo "☸️  Iniciando deploy de iAmerican E-commerce en Kubernetes..."
echo "🎯 Acción: $ACCION"
echo "📦 Namespace: $NAMESPACE"
echo "🏷️  Tag: $TAG"

# Verificar que kubectl esté instalado y configurado
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl no está instalado. Instalando..."
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/
    echo "✅ kubectl instalado."
fi

# Verificar conexión al cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ No hay conexión al cluster de Kubernetes."
    echo "💡 Configura kubectl con: kubectl config set-context"
    exit 1
fi

echo "✅ Conectado al cluster: $(kubectl config current-context)"

# Función para aplicar manifiestos
apply_manifests() {
    echo "🚀 Aplicando manifiestos de Kubernetes..."
    
    # Aplicar en orden
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/deployment.yaml
    kubectl apply -f k8s/service.yaml
    kubectl apply -f k8s/hpa.yaml
    
    # Ingress (opcional si tienes nginx-ingress-controller)
    if kubectl get ingressclass nginx &> /dev/null; then
        kubectl apply -f k8s/ingress.yaml
        echo "✅ Ingress aplicado (nginx-ingress-controller detectado)"
    else
        echo "⚠️  Ingress omitido (nginx-ingress-controller no encontrado)"
        echo "💡 Para instalar: kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml"
    fi
    
    echo "✅ Manifiestos aplicados correctamente."
}

# Función para eliminar recursos
delete_manifests() {
    echo "🗑️  Eliminando recursos de Kubernetes..."
    kubectl delete -f k8s/ --ignore-not-found=true
    echo "✅ Recursos eliminados."
}

# Función para actualizar deployment
update_deployment() {
    echo "🔄 Actualizando deployment..."
    
    if [ -n "$REGISTRY" ]; then
        # Actualizar imagen si se especifica registry
        kubectl set image deployment/iamerican-ecommerce iamerican-app=$REGISTRY/iamerican-ecommerce:$TAG -n $NAMESPACE
    else
        # Restart deployment para usar la imagen local
        kubectl rollout restart deployment/iamerican-ecommerce -n $NAMESPACE
    fi
    
    # Esperar a que el rollout termine
    kubectl rollout status deployment/iamerican-ecommerce -n $NAMESPACE --timeout=300s
    echo "✅ Deployment actualizado."
}

# Función para verificar el estado
check_status() {
    echo "🔍 Verificando estado del deployment..."
    
    echo "📦 Pods:"
    kubectl get pods -n $NAMESPACE -l app=iamerican-ecommerce
    
    echo ""
    echo "🌐 Services:"
    kubectl get services -n $NAMESPACE
    
    echo ""
    echo "🔗 Ingress:"
    kubectl get ingress -n $NAMESPACE 2>/dev/null || echo "No hay ingress configurado"
    
    echo ""
    echo "📊 HPA:"
    kubectl get hpa -n $NAMESPACE
    
    # Obtener URL externa si está disponible
    EXTERNAL_IP=$(kubectl get service iamerican-loadbalancer -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    if [ -n "$EXTERNAL_IP" ]; then
        echo ""
        echo "🌐 Aplicación disponible en: http://$EXTERNAL_IP"
    fi
}

# Función para mostrar logs
show_logs() {
    echo "📋 Mostrando logs..."
    kubectl logs -f deployment/iamerican-ecommerce -n $NAMESPACE
}

# Ejecutar acción
case $ACCION in
    "apply")
        apply_manifests
        sleep 10
        check_status
        ;;
    "delete")
        delete_manifests
        ;;
    "update")
        update_deployment
        check_status
        ;;
    "status")
        check_status
        ;;
    "logs")
        show_logs
        ;;
    *)
        echo "❌ Acción no válida. Uso: $0 [apply|delete|update|status|logs]"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deploy completado!"
echo ""
echo "📚 Comandos útiles:"
echo "  Ver pods:     kubectl get pods -n $NAMESPACE"
echo "  Ver logs:     kubectl logs -f deployment/iamerican-ecommerce -n $NAMESPACE"
echo "  Escalar:      kubectl scale deployment iamerican-ecommerce --replicas=5 -n $NAMESPACE"
echo "  Port forward: kubectl port-forward service/iamerican-service 8080:80 -n $NAMESPACE"