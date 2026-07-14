#!/usr/bin/env bash
set -euo pipefail

STAGE="${1:-production}"
SST="./node_modules/.bin/sst"

require() {
  if [ -z "${!1:-}" ]; then
    echo "Missing required environment variable: $1" >&2
    exit 1
  fi
}

require POSTGRES_PASSWORD
require JWT_SECRET
require SES_SENDER_EMAIL
require SEED_ADMIN_EMAIL
require SEED_ADMIN_PASSWORD
require SEED_ADMIN_FIRST_NAME
require SEED_ADMIN_LAST_NAME

"$SST" secret set PostgresPassword "$POSTGRES_PASSWORD" --stage "$STAGE"
"$SST" secret set JwtSecret "$JWT_SECRET" --stage "$STAGE"
"$SST" secret set SesSenderEmail "$SES_SENDER_EMAIL" --stage "$STAGE"
"$SST" secret set SeedAdminEmail "$SEED_ADMIN_EMAIL" --stage "$STAGE"
"$SST" secret set SeedAdminPassword "$SEED_ADMIN_PASSWORD" --stage "$STAGE"
"$SST" secret set SeedAdminFirstName "$SEED_ADMIN_FIRST_NAME" --stage "$STAGE"
"$SST" secret set SeedAdminLastName "$SEED_ADMIN_LAST_NAME" --stage "$STAGE"

echo "SST secrets synced for stage: $STAGE"
