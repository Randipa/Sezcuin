#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="${AWS_REGION:-ap-south-1}"
STACK_NAME="${STACK_NAME:-sezcuin-test}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> 1/2  Generate secrets (if needed)"
"$ROOT/scripts/setup-parameters.sh"

echo ""
echo "==> 2/2  Create AWS infrastructure (ECS + ECR + ALB + RDS)"
PARAM_OVERRIDES=()
while IFS= read -r line; do
  PARAM_OVERRIDES+=("$line")
done < <(jq -r '.[] | "\(.ParameterKey)=\(.ParameterValue)"' "$ROOT/cloudformation/parameters.json")

aws cloudformation deploy \
  --region "$AWS_REGION" \
  --stack-name "$STACK_NAME" \
  --template-file "$ROOT/cloudformation/template.yaml" \
  --parameter-overrides "${PARAM_OVERRIDES[@]}" \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset

OUTPUTS="$(aws cloudformation describe-stacks \
  --region "$AWS_REGION" \
  --stack-name "$STACK_NAME" \
  --query 'Stacks[0].Outputs' \
  --output json)"

app_url() {
  echo "$OUTPUTS" | jq -r ".[] | select(.OutputKey==\"$1\") | .OutputValue"
}

echo ""
echo "============================================"
echo " AWS infrastructure ready (ECS + ECR)."
echo " App URL: $(app_url AppUrl)"
echo "============================================"
echo ""
echo "Next — GitHub Secrets (Settings → Secrets → Actions):"
echo "  AWS_ACCESS_KEY_ID"
echo "  AWS_SECRET_ACCESS_KEY"
echo "  AWS_REGION = $AWS_REGION"
echo ""
echo "IAM policy: infra/iam/deploy-user-policy.json"
echo "Then push to main — GitHub Actions deploys to ECS automatically."
