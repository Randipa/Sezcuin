#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EXAMPLE="$ROOT/cloudformation/parameters.example.json"
TARGET="$ROOT/cloudformation/parameters.json"

if [[ -f "$TARGET" ]]; then
  echo "Already exists: $TARGET"
  exit 0
fi

random_secret() {
  openssl rand -base64 48 | tr -dc 'a-zA-Z0-9' | head -c "$1"
}

DB_PASS="$(random_secret 24)"
JWT_SECRET="$(random_secret 32)"
ADMIN_PASS="$(random_secret 16)"

cp "$EXAMPLE" "$TARGET"

update_param() {
  jq --arg key "$1" --arg value "$2" \
    'map(if .ParameterKey == $key then .ParameterValue = $value else . end)' \
    "$TARGET" > "${TARGET}.tmp"
  mv "${TARGET}.tmp" "$TARGET"
}

update_param "DbMasterPassword" "$DB_PASS"
update_param "JwtSecret" "$JWT_SECRET"
update_param "SeedAdminPassword" "$ADMIN_PASS"

chmod 600 "$TARGET"

echo "Created $TARGET"
echo ""
echo "Admin login (save this):"
echo "  Email:    admin@sezcuin.com"
echo "  Password: $ADMIN_PASS"
