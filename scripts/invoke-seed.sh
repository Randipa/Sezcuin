#!/usr/bin/env bash
set -euo pipefail

STAGE="${1:-saliya}"
OUT_FILE="${2:-/tmp/sezcuin-seed-out.json}"

FUNCTION_NAME="$(
  aws lambda list-functions \
    --query "Functions[?contains(FunctionName,'sezcuin-${STAGE}-Seed')].FunctionName | [0]" \
    --output text
)"

if [ -z "$FUNCTION_NAME" ] || [ "$FUNCTION_NAME" = "None" ]; then
  echo "Seed Lambda not found for stage: $STAGE" >&2
  exit 1
fi

echo "Invoking $FUNCTION_NAME ..."

if aws --version 2>&1 | grep -q 'aws-cli/2'; then
  aws lambda invoke \
    --function-name "$FUNCTION_NAME" \
    --payload '{}' \
    --cli-binary-format raw-in-base64-out \
    "$OUT_FILE"
else
  aws lambda invoke \
    --function-name "$FUNCTION_NAME" \
    --payload '{}' \
    "$OUT_FILE"
fi

cat "$OUT_FILE"
echo
