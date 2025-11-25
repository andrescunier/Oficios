#!/bin/bash

# Test del endpoint de registro B2B - Simple Gestión API v1.1.1
# Ejecuta esto para probar si el API funciona

echo "🧪 Probando endpoint de registro B2B..."

# Configuración
API_URL="http://localhost:8000/registration/register-customer"
ACCOUNT_ID="bed2df35-717f-4900-a4b1-7c3a7fb59b7c"

# Datos de prueba
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Account-ID: $ACCOUNT_ID" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "email": "juan.perez@empresa.com",
    "company_name": "Mi Empresa S.A.",
    "password": "MiPassword123!",
    "phone": "+1234567890",
    "title": "Gerente General",
    "tax_id": "12345678-9",
    "currency": "USD",
    "industry": "Tecnología",
    "username": "jperez",
    "role": "customer",
    "person_metadata": {
      "departamento": "Ventas",
      "experiencia": "5 años"
    },
    "company_metadata": {
      "sector": "Software",
      "tamaño": "Mediana empresa"
    }
  }'

echo ""
echo "✅ Si el API está disponible, deberías ver una respuesta JSON arriba."
echo "📱 Ahora puedes probar el formulario en: http://localhost:5173/registro"