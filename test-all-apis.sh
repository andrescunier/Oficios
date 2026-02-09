#!/bin/bash
# ===================================================================
# Test completo de TODAS las APIs usadas en el frontend
# Muestra respuestas CRUDAS para verificar la estructura
# ===================================================================

BASE="https://api.cumar.com.ar"
ACCOUNT_ID="bed2df35-717f-4900-a4b1-7c3a7fb59b7c"
EMAIL="qatest@gmail.com"
PASSWORD="Hola12345."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

section() {
  echo ""
  echo "=================================================================="
  echo -e "${CYAN}${BOLD}$1${NC}"
  echo "=================================================================="
}

test_api() {
  local method="$1"
  local url="$2"
  local desc="$3"
  local data="$4"
  local auth="$5"
  
  echo ""
  echo -e "${YELLOW}▶ ${desc}${NC}"
  echo -e "  ${method} ${url}"
  
  local headers="-H 'Content-Type: application/json' -H 'Accept: application/json' -H 'X-Account-ID: ${ACCOUNT_ID}'"
  
  if [ -n "$auth" ]; then
    headers="${headers} -H 'Authorization: Bearer ${auth}'"
  fi
  
  local cmd="curl -s -w '\n__HTTP_CODE__%{http_code}' -X ${method} '${url}' ${headers}"
  
  if [ -n "$data" ]; then
    cmd="${cmd} -d '${data}'"
  fi
  
  local raw_response
  raw_response=$(eval $cmd)
  
  # Separar body y HTTP code
  local http_code=$(echo "$raw_response" | grep -o '__HTTP_CODE__[0-9]*' | sed 's/__HTTP_CODE__//')
  local body=$(echo "$raw_response" | sed 's/__HTTP_CODE__[0-9]*$//')
  
  # Color del status
  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    echo -e "  Status: ${GREEN}${http_code}${NC}"
  elif [ "$http_code" -ge 400 ]; then
    echo -e "  Status: ${RED}${http_code}${NC}"
  else
    echo -e "  Status: ${YELLOW}${http_code}${NC}"
  fi
  
  # Mostrar estructura de la respuesta (primeros 500 chars)
  echo -e "  ${BOLD}Respuesta cruda (estructura):${NC}"
  echo "$body" | python3 -m json.tool 2>/dev/null | head -40 || echo "$body" | head -5
  
  # Analizar si tiene wrapper { success, data }
  local has_success=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print('YES' if 'success' in d else 'NO')" 2>/dev/null)
  local has_data=$(echo "$body" | python3 -c "import sys,json; d=json.load(sys.stdin); print('YES' if 'data' in d else 'NO')" 2>/dev/null)
  
  if [ "$has_success" = "YES" ]; then
    echo -e "  ${GREEN}✓ Tiene 'success' en root${NC}"
  fi
  if [ "$has_data" = "YES" ]; then
    echo -e "  ${GREEN}✓ Tiene 'data' en root${NC}"
    # Mostrar las keys dentro de data
    local data_keys=$(echo "$body" | python3 -c "
import sys,json
d=json.load(sys.stdin)
if isinstance(d.get('data'), dict):
    print('  Keys en data:', list(d['data'].keys()))
elif isinstance(d.get('data'), list):
    print('  data es ARRAY, len:', len(d['data']))
    if d['data']:
        print('  Keys del primer item:', list(d['data'][0].keys()) if isinstance(d['data'][0], dict) else 'no-dict')
" 2>/dev/null)
    echo -e "  ${CYAN}${data_keys}${NC}"
  fi
  
  # Retornar el body para uso posterior
  echo "$body"
}

# ===================================================================
section "1. HEALTH CHECK"
# ===================================================================
test_api "GET" "${BASE}/health" "Health Check" "" "" > /dev/null
test_api "GET" "${BASE}/health" "Health Check"

# ===================================================================
section "2. AUTENTICACIÓN - LOGIN"
# ===================================================================
LOGIN_BODY=$(test_api "POST" "${BASE}/api/auth/login" \
  "POST /api/auth/login" \
  "{\"email\":\"${EMAIL}\",\"password\":\"${PASSWORD}\",\"account_id\":\"${ACCOUNT_ID}\"}")

# Extraer token
TOKEN=$(echo "$LOGIN_BODY" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    # Intentar extraer token de diferentes ubicaciones
    if 'data' in d and isinstance(d['data'], dict):
        t = d['data'].get('access_token') or d['data'].get('token')
        if t: print(t)
    elif 'access_token' in d:
        print(d['access_token'])
    elif 'token' in d:
        print(d['token'])
except:
    pass
" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ NO SE PUDO OBTENER TOKEN - abortando${NC}"
  exit 1
fi

echo ""
echo -e "${GREEN}✓ Token obtenido: ${TOKEN:0:30}...${NC}"

# ===================================================================
section "3. AUTH/ME - Perfil del usuario"
# ===================================================================
test_api "GET" "${BASE}/api/auth/me" \
  "GET /api/auth/me" "" "$TOKEN" > /dev/null
ME_BODY=$(test_api "GET" "${BASE}/api/auth/me" \
  "GET /api/auth/me" "" "$TOKEN")

# Extraer business_partner_id
BP_ID=$(echo "$ME_BODY" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    data = d.get('data', d)
    bp = None
    if isinstance(data, dict):
        bp = data.get('billing', {}).get('business_partner_id') if isinstance(data.get('billing'), dict) else None
        bp = bp or data.get('business_partner_id') or data.get('partner_id')
    if bp: print(bp)
except:
    pass
" 2>/dev/null)

echo ""
echo -e "${GREEN}Business Partner ID: ${BP_ID:-'NO ENCONTRADO'}${NC}"

# ===================================================================
section "4. PRODUCTOS - Listado (público)"
# ===================================================================
test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/products?page=1&per_page=3" \
  "GET /products (público, sin auth, 3 items)" > /dev/null

PROD_BODY=$(test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/products?page=1&per_page=3" \
  "GET /products (público, sin auth, 3 items)")

# ===================================================================
section "5. PRODUCTOS - Listado (con auth = con precios)"
# ===================================================================
PROD_AUTH_BODY=$(test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/products?page=1&per_page=3" \
  "GET /products (con auth, debería incluir precios)" "" "$TOKEN")

# Extraer un product_id para tests posteriores
PRODUCT_ID=$(echo "$PROD_AUTH_BODY" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    items = d.get('data', d)
    if isinstance(items, list) and items:
        print(items[0].get('id',''))
    elif isinstance(items, dict) and 'data' in items:
        arr = items['data']
        if isinstance(arr, list) and arr:
            print(arr[0].get('id',''))
except:
    pass
" 2>/dev/null)

echo ""
echo -e "${GREEN}Product ID para tests: ${PRODUCT_ID:-'NO ENCONTRADO'}${NC}"

# ===================================================================
section "6. PRODUCTO INDIVIDUAL"
# ===================================================================
if [ -n "$PRODUCT_ID" ]; then
  test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/products/${PRODUCT_ID}" \
    "GET /products/{id} (detalle)" "" "$TOKEN"
fi

# ===================================================================
section "7. BUSINESS PARTNERS"
# ===================================================================
test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/business-partners?per_page=2" \
  "GET /business-partners (listar)" "" "$TOKEN"

# ===================================================================
section "8. CREAR ORDEN DE VENTA (draft)"
# ===================================================================
ORDER_NUM="SO-TEST-$(date +%s)"

if [ -n "$PRODUCT_ID" ] && [ -n "$BP_ID" ]; then
  ORDER_BODY=$(test_api "POST" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders" \
    "POST /sales-orders (crear draft)" \
    "{\"order_number\":\"${ORDER_NUM}\",\"customer_id\":\"${BP_ID}\",\"currency\":\"ARS\",\"items\":[{\"product_id\":\"${PRODUCT_ID}\",\"description\":\"Test Product\",\"quantity\":1,\"unit_price\":100.00,\"tax_rate\":0.21}],\"notes\":\"Test desde script\",\"metadata\":{\"channel\":\"test\"}}" \
    "$TOKEN")
  
  # Extraer ORDER_ID
  ORDER_ID=$(echo "$ORDER_BODY" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    # Puede estar en d['data']['id'] o d['id']
    oid = None
    if isinstance(d.get('data'), dict):
        oid = d['data'].get('id')
    if not oid:
        oid = d.get('id')
    if oid: print(oid)
except:
    pass
" 2>/dev/null)
  
  echo ""
  echo -e "${GREEN}Order ID: ${ORDER_ID:-'NO ENCONTRADO'}${NC}"
else
  echo -e "${RED}Saltando - falta PRODUCT_ID o BP_ID${NC}"
fi

# ===================================================================
section "9. OBTENER ORDEN CREADA"
# ===================================================================
if [ -n "$ORDER_ID" ]; then
  test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders/${ORDER_ID}" \
    "GET /sales-orders/{id} (detalle)" "" "$TOKEN"
fi

# ===================================================================
section "10. SUBMIT ORDEN (draft → pending_payment)"
# ===================================================================
if [ -n "$ORDER_ID" ]; then
  SUBMIT_BODY=$(test_api "POST" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders/${ORDER_ID}/submit" \
    "POST /sales-orders/{id}/submit" \
    "{\"validate_stock\":true,\"reservation_ttl_hours\":48,\"event_id\":\"submit-test-$(date +%s)\"}" \
    "$TOKEN")
  
  echo ""
  echo -e "${YELLOW}Estructura de respuesta del submit:${NC}"
  echo "$SUBMIT_BODY" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    print('Root keys:', list(d.keys()))
    if 'data' in d and isinstance(d['data'], dict):
        print('data keys:', list(d['data'].keys()))
except:
    pass
" 2>/dev/null
fi

# ===================================================================
section "11. CREAR PAGO"
# ===================================================================
if [ -n "$ORDER_ID" ] && [ -n "$BP_ID" ]; then
  PAY_NUM="RCPT-TEST-$(date +%s)"
  
  PAYMENT_BODY=$(test_api "POST" "${BASE}/api/accounts/${ACCOUNT_ID}/payments" \
    "POST /payments (crear pago)" \
    "{\"payment_number\":\"${PAY_NUM}\",\"source_type\":\"customer\",\"partner_id\":\"${BP_ID}\",\"currency\":\"ARS\",\"amount\":121.00,\"method\":\"credit_card\",\"reference\":\"TRX-TEST\",\"status\":\"received\",\"metadata\":{\"test\":true}}" \
    "$TOKEN")
  
  PAYMENT_ID=$(echo "$PAYMENT_BODY" | python3 -c "
import sys,json
try:
    d=json.load(sys.stdin)
    pid = None
    if isinstance(d.get('data'), dict):
        pid = d['data'].get('id')
    if not pid:
        pid = d.get('id')
    if pid: print(pid)
except:
    pass
" 2>/dev/null)
  
  echo ""
  echo -e "${GREEN}Payment ID: ${PAYMENT_ID:-'NO ENCONTRADO'}${NC}"
fi

# ===================================================================
section "12. CONFIRM-PAYMENT (pending_payment → confirmed)"
# ===================================================================
if [ -n "$ORDER_ID" ]; then
  test_api "POST" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders/${ORDER_ID}/confirm-payment" \
    "POST /sales-orders/{id}/confirm-payment" \
    "{\"payment_reference\":\"${PAY_NUM:-test}\",\"event_id\":\"confirm-test-$(date +%s)\",\"notes\":\"Test confirm\"}" \
    "$TOKEN"
fi

# ===================================================================
section "13. LISTAR ÓRDENES"
# ===================================================================
test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders?per_page=3&order_by=created_at&direction=desc" \
  "GET /sales-orders (listar, 3 más recientes)" "" "$TOKEN"

# ===================================================================
section "14. VALID TRANSITIONS"
# ===================================================================
if [ -n "$ORDER_ID" ]; then
  test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders/${ORDER_ID}/valid-transitions" \
    "GET /sales-orders/{id}/valid-transitions" "" "$TOKEN"
fi

# ===================================================================
section "15. STATUS HISTORY"
# ===================================================================
if [ -n "$ORDER_ID" ]; then
  test_api "GET" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders/${ORDER_ID}/status-history" \
    "GET /sales-orders/{id}/status-history" "" "$TOKEN"
fi

# ===================================================================
section "16. CANCELAR ORDEN (cleanup)"
# ===================================================================
if [ -n "$ORDER_ID" ]; then
  test_api "POST" "${BASE}/api/accounts/${ACCOUNT_ID}/sales-orders/${ORDER_ID}/cancel-v2" \
    "POST /sales-orders/{id}/cancel-v2 (limpiar orden de test)" \
    "{\"reason\":\"Test cleanup\",\"event_id\":\"cancel-test-$(date +%s)\",\"restore_stock\":true}" \
    "$TOKEN"
fi

# ===================================================================
section "RESUMEN"
# ===================================================================
echo ""
echo -e "${BOLD}Variables obtenidas:${NC}"
echo -e "  Token:     ${TOKEN:0:40}..."
echo -e "  BP ID:     ${BP_ID:-N/A}"
echo -e "  Product:   ${PRODUCT_ID:-N/A}"
echo -e "  Order:     ${ORDER_ID:-N/A}"
echo -e "  Payment:   ${PAYMENT_ID:-N/A}"
echo ""
echo -e "${GREEN}${BOLD}Test completo finalizado${NC}"
