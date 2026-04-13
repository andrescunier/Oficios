#!/bin/sh
set -e

CONFIG_PATH="/usr/share/nginx/html/config.js"

cat > "$CONFIG_PATH" <<EOF
window.__APP_CONFIG__ = {
  api: {
    url: "${API_URL:-https://api.cumar.com.ar}",
    accountId: "${ACCOUNT_ID:-}",
    accountSlug: "${ACCOUNT_SLUG:-}",
    channel: "${API_CHANNEL:-ecommerce}"
  },
  app: {
    url: "${APP_URL:-}"
  }
};
EOF

echo "config.js generated for account ${ACCOUNT_ID:-<not set>}"

exec "$@"
