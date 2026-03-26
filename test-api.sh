#!/usr/bin/env bash
set -euo pipefail

# Test del endpoint de registro B2B usando variables de entorno.

API_BASE_URL="${API_BASE_URL:-http://localhost:8000}"
API_ACCOUNT_ID="${API_ACCOUNT_ID:-bed2df35-717f-4900-a4b1-7c3a7fb59b7c}"
REGISTER_ENDPOINT="${REGISTER_ENDPOINT:-/api/simple/register-customer}"

TEST_FIRST_NAME="${TEST_FIRST_NAME:-Juan}"
TEST_LAST_NAME="${TEST_LAST_NAME:-Perez}"
TEST_EMAIL="${TEST_EMAIL:-juan.perez@empresa.com}"
TEST_COMPANY_NAME="${TEST_COMPANY_NAME:-Mi Empresa S.A.}"
TEST_PASSWORD="${TEST_PASSWORD:-MiPassword123!}"
TEST_PHONE="${TEST_PHONE:-+1234567890}"
TEST_TITLE="${TEST_TITLE:-Gerente General}"
TEST_TAX_ID="${TEST_TAX_ID:-12345678-9}"
TEST_CURRENCY="${TEST_CURRENCY:-USD}"
TEST_INDUSTRY="${TEST_INDUSTRY:-Tecnologia}"
TEST_USERNAME="${TEST_USERNAME:-jperez}"
TEST_ROLE="${TEST_ROLE:-customer}"

echo "Probando endpoint de registro B2B..."
echo "Base URL: ${API_BASE_URL}"
echo "Account ID: ${API_ACCOUNT_ID}"

curl -sS -X POST "${API_BASE_URL}${REGISTER_ENDPOINT}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-Account-ID: ${API_ACCOUNT_ID}" \
  -d "{
    \"first_name\": \"${TEST_FIRST_NAME}\",
    \"last_name\": \"${TEST_LAST_NAME}\",
    \"email\": \"${TEST_EMAIL}\",
    \"company_name\": \"${TEST_COMPANY_NAME}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"phone\": \"${TEST_PHONE}\",
    \"title\": \"${TEST_TITLE}\",
    \"tax_id\": \"${TEST_TAX_ID}\",
    \"currency\": \"${TEST_CURRENCY}\",
    \"industry\": \"${TEST_INDUSTRY}\",
    \"username\": \"${TEST_USERNAME}\",
    \"role\": \"${TEST_ROLE}\",
    \"person_metadata\": {
      \"departamento\": \"Ventas\",
      \"experiencia\": \"5 anos\"
    },
    \"company_metadata\": {
      \"sector\": \"Software\",
      \"tamano\": \"Mediana empresa\"
    }
  }" | python3 -m json.tool

echo
echo "Si el API esta disponible, arriba deberias ver la respuesta JSON."
