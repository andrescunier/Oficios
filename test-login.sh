#!/bin/bash

echo "🔐 Probando login con credenciales específicas..."

# Probar con el endpoint actual de token
echo "📡 Probando endpoint /api/auth/token..."
curl -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=acunier@openpass.com.ar&password=Hola12345.&scope=" \
  https://api.cumar.com.ar/api/auth/token \
  2>/dev/null | jq . || echo "No se pudo conectar o respuesta no es JSON"

echo ""
echo "📱 También puedes probar manualmente en: http://localhost:5173/login"
echo "📧 Email: acunier@openpass.com.ar"
echo "🔑 Password: Hola12345."