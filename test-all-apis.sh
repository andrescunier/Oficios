#!/usr/bin/env bash
set -euo pipefail

# ===================================================================
# Test completo de APIs usadas por el frontend.
# Todo configurable por variables de entorno.
# ===================================================================

BASE="${API_BASE_URL:-https://api.cumar.com.ar}"
ACCOUNT_ID="${API_ACCOUNT_ID:-bed2df35-717f-4900-a4b1-7c3a7fb59b7c}"
ACCOUNT_SLUG="${API_ACCOUNT_SLUG:-}"
CHANNEL="${API_CHANNEL:-ecommerce}"
EMAIL="${API_TEST_EMAIL:-qatest@gmail.com}"
PASSWORD="${API_TEST_PASSWORD:-Hola12345.}"
ORDER_CURRENCY="${API_TEST_CURRENCY:-ARS}"
ORDER_QTY="${API_TEST_ORDER_QTY:-1}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

section() {
  >&2 echo ""
  >&2 echo "=================================================================="
  >&2 echo -e "${CYAN}${BOLD}$1${NC}"
  >&2 echo "=================================================================="
}

account_headers() {
  if [ -n "${ACCOUNT_ID}" ]; then
    printf -- "-H X-Account-ID:%s" "${ACCOUNT_ID}"
  elif [ -n "${ACCOUNT_SLUG}" ]; then
    printf -- "-H X-Account-Slug:%s" "${ACCOUNT_SLUG}"
  else
    return 1
  fi
}

test_api() {
  local method="$1"
  local url="$2"
  local desc="$3"
  local data="${4:-}"
  local auth="${5:-}"

  >&2 echo ""
  >&2 echo -e "${YELLOW}▶ ${desc}${NC}"
  >&2 echo -e "  ${method} ${url}"

  local -a curl_args=(
    -sS
    -w '\n__HTTP_CODE__%{http_code}'
    -X "${method}"
    "${url}"
    -H "Content-Type: application/json"
    -H "Accept: application/json"
  )

  if [ -n "${ACCOUNT_ID}" ]; then
    curl_args+=(-H "X-Account-ID: ${ACCOUNT_ID}")
  elif [ -n "${ACCOUNT_SLUG}" ]; then
    curl_args+=(-H "X-Account-Slug: ${ACCOUNT_SLUG}")
  fi

  if [ -n "${auth}" ]; then
    curl_args+=(-H "Authorization: Bearer ${auth}")
  fi

  if [ -n "${data}" ]; then
    curl_args+=(-d "${data}")
  fi

  local raw_response
  raw_response=$(curl "${curl_args[@]}")

  local http_code
  http_code=$(echo "${raw_response}" | grep -o '__HTTP_CODE__[0-9]*' | sed 's/__HTTP_CODE__//')
  local body
  body=$(echo "${raw_response}" | sed 's/__HTTP_CODE__[0-9]*$//')

  if [ "${http_code}" -ge 200 ] && [ "${http_code}" -lt 300 ]; then
    >&2 echo -e "  Status: ${GREEN}${http_code}${NC}"
  elif [ "${http_code}" -ge 400 ]; then
    >&2 echo -e "  Status: ${RED}${http_code}${NC}"
  else
    >&2 echo -e "  Status: ${YELLOW}${http_code}${NC}"
  fi

  >&2 echo -e "  ${BOLD}Respuesta cruda (estructura):${NC}"
  >&2 bash -lc 'echo "$1" | python3 -m json.tool 2>/dev/null | head -40 || echo "$1" | head -5' _ "${body}"

  local has_success
  has_success=$(echo "${body}" | python3 -c "import sys,json; d=json.load(sys.stdin); print('YES' if isinstance(d, dict) and 'success' in d else 'NO')" 2>/dev/null || true)
  local has_data
  has_data=$(echo "${body}" | python3 -c "import sys,json; d=json.load(sys.stdin); print('YES' if isinstance(d, dict) and 'data' in d else 'NO')" 2>/dev/null || true)

  if [ "${has_success}" = "YES" ]; then
    >&2 echo -e "  ${GREEN}✓ Tiene 'success' en root${NC}"
  fi
  if [ "${has_data}" = "YES" ]; then
    >&2 echo -e "  ${GREEN}✓ Tiene 'data' en root${NC}"
    >&2 echo "${body}" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if isinstance(d.get('data'), dict):
    print('  Keys en data:', list(d['data'].keys()))
elif isinstance(d.get('data'), list):
    print('  data es ARRAY, len:', len(d['data']))
    if d['data']:
        print('  Keys del primer item:', list(d['data'][0].keys()) if isinstance(d['data'][0], dict) else 'no-dict')
" 2>/dev/null || true
  fi

  printf '%s' "${body}"
}

extract_json() {
  local expr="$1"
  python3 -c "import sys, json; data=json.load(sys.stdin); value=${expr}; print(value if value is not None else '')" 2>/dev/null || true
}

section "1. HEALTH CHECK"
test_api "GET" "${BASE}/health" "Health Check" "" "" >/dev/null
test_api "GET" "${BASE}/health" "Health Check" "" "" >/dev/null

section "2. AUTENTICACION - LOGIN"
LOGIN_BODY=$(test_api "POST" "${BASE}/api/auth/login" \
  "POST /api/auth/login" \
  "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"account_id\":\"${ACCOUNT_ID}\"}")

TOKEN=$(echo "${LOGIN_BODY}" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    payload = d.get('data', d)
    print(payload.get('access_token') or payload.get('token') or '')
except Exception:
    print('')
" 2>/dev/null)

if [ -z "${TOKEN}" ]; then
  >&2 echo -e "${RED}✗ No se pudo obtener token - abortando${NC}"
  exit 1
fi

>&2 echo ""
>&2 echo -e "${GREEN}✓ Token obtenido: ${TOKEN:0:30}...${NC}"

section "3. AUTH/ME - PERFIL DEL USUARIO"
ME_BODY=$(test_api "GET" "${BASE}/api/auth/me" "GET /api/auth/me" "" "${TOKEN}")
BP_ID=$(echo "${ME_BODY}" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    data = d.get('data', d)
    billing = data.get('billing') if isinstance(data, dict) else {}
    print((billing or {}).get('business_partner_id') or data.get('business_partner_id') or data.get('partner_id') or '')
except Exception:
    print('')
" 2>/dev/null)

>&2 echo ""
>&2 echo -e "${GREEN}Business Partner ID: ${BP_ID:-NO_ENCONTRADO}${NC}"

section "4. PRODUCTOS - LISTADO PUBLICO"
PROD_BODY=$(test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/products?page=1&per_page=3&channels=${CHANNEL}" \
  "GET /products (publico, canal=${CHANNEL})")

section "5. PRODUCTOS - LISTADO CON AUTH"
PROD_AUTH_BODY=$(test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/products?page=1&per_page=3&channels=${CHANNEL}" \
  "GET /products (con auth, canal=${CHANNEL})" "" "${TOKEN}")

PRODUCT_ID=$(echo "${PROD_AUTH_BODY}" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    items = d.get('data', d)
    if isinstance(items, list) and items:
        print(items[0].get('id', ''))
    elif isinstance(items, dict) and isinstance(items.get('data'), list) and items['data']:
        print(items['data'][0].get('id', ''))
    else:
        print('')
except Exception:
    print('')
" 2>/dev/null)

>&2 echo ""
>&2 echo -e "${GREEN}Product ID para tests: ${PRODUCT_ID:-NO_ENCONTRADO}${NC}"

section "6. PRODUCTO INDIVIDUAL"
if [ -n "${PRODUCT_ID}" ]; then
  test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/products/${PRODUCT_ID}" \
    "GET /products/{id} (detalle)" "" "${TOKEN}" >/dev/null
fi

section "7. BUSINESS PARTNERS"
test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/business-partners?per_page=2" \
  "GET /business-partners (listar)" "" "${TOKEN}" >/dev/null

section "8. PEDIDOS DEL USUARIO"
if [ -n "${BP_ID}" ]; then
  test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders?customer_id=${BP_ID}&per_page=3&order_by=created_at&direction=desc" \
    "GET /sales-orders (usuario actual)" "" "${TOKEN}" >/dev/null
fi

section "9. PAGOS DEL USUARIO"
if [ -n "${BP_ID}" ]; then
  PAYMENTS_BODY=$(test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/payments?partner_id=${BP_ID}" \
    "GET /payments (usuario actual)" "" "${TOKEN}")
  PAYMENT_ID=$(echo "${PAYMENTS_BODY}" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list) and data:
        print(data[0].get('id', ''))
    else:
        print('')
except Exception:
    print('')
" 2>/dev/null)

  if [ -n "${PAYMENT_ID}" ]; then
    test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/payments/${PAYMENT_ID}/applications" \
      "GET /payments/{id}/applications" "" "${TOKEN}" >/dev/null
  fi
fi

section "10. CREAR ORDEN DE PRUEBA"
ORDER_NUM="SO-TEST-$(date +%s)"
ORDER_ID=""

if [ -n "${PRODUCT_ID}" ] && [ -n "${BP_ID}" ]; then
  ORDER_BODY=$(test_api "POST" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders" \
    "POST /sales-orders (crear draft)" \
    "{\"order_number\":\"${ORDER_NUM}\",\"customer_id\":\"${BP_ID}\",\"currency\":\"${ORDER_CURRENCY}\",\"items\":[{\"product_id\":\"${PRODUCT_ID}\",\"description\":\"Test Product\",\"quantity\":${ORDER_QTY},\"unit_price\":100.00,\"tax_rate\":0.21}],\"notes\":\"Test desde script\",\"metadata\":{\"channel\":\"${CHANNEL}\"}}" \
    "${TOKEN}")

  ORDER_ID=$(echo "${ORDER_BODY}" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    payload = d.get('data', d)
    print(payload.get('id', ''))
except Exception:
    print('')
" 2>/dev/null)
fi

>&2 echo ""
>&2 echo -e "${GREEN}Order ID: ${ORDER_ID:-NO_ENCONTRADO}${NC}"

if [ -n "${ORDER_ID}" ]; then
  section "11. OBTENER ORDEN CREADA"
  test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders/${ORDER_ID}" \
    "GET /sales-orders/{id}" "" "${TOKEN}" >/dev/null

  section "12. SUBMIT ORDEN"
  test_api "POST" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders/${ORDER_ID}/submit" \
    "POST /sales-orders/{id}/submit" \
    "{\"validate_stock\":true,\"reservation_ttl_hours\":48,\"event_id\":\"submit-test-$(date +%s)\"}" \
    "${TOKEN}" >/dev/null
fi

>&2 echo ""
>&2 echo -e "${GREEN}Prueba finalizada.${NC}"
