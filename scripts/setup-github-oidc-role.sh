#!/usr/bin/env bash
set -euo pipefail

# One-time setup: GitHub Actions OIDC role for SST production deploys.
# Usage: ./scripts/setup-github-oidc-role.sh
# Then:  gh secret set AWS_DEPLOY_ROLE_ARN --body "<role-arn>"

REPO="${GITHUB_REPO:-Randipa/Sezcuin}"
ROLE_NAME="${AWS_DEPLOY_ROLE_NAME:-SezcuinGitHubDeploy}"
POLICY_ARN="${AWS_DEPLOY_POLICY_ARN:-arn:aws:iam::aws:policy/PowerUserAccess}"
REGION="${AWS_REGION:-us-east-1}"

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
OIDC_PROVIDER_ARN="arn:aws:iam::${ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

echo "AWS Account: ${ACCOUNT_ID}"
echo "GitHub Repo: ${REPO}"

if ! aws iam get-open-id-connect-provider --open-id-connect-provider-arn "${OIDC_PROVIDER_ARN}" >/dev/null 2>&1; then
  echo "Creating GitHub OIDC provider..."
  aws iam create-open-id-connect-provider \
    --url "https://token.actions.githubusercontent.com" \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list "6938fd4d98bab03fa7537a3d9e0516d0f0242a58"
else
  echo "GitHub OIDC provider already exists."
fi

TRUST_POLICY="$(cat <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "${OIDC_PROVIDER_ARN}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${REPO}:*"
        }
      }
    }
  ]
}
EOF
)"

if aws iam get-role --role-name "${ROLE_NAME}" >/dev/null 2>&1; then
  echo "Updating trust policy on existing role ${ROLE_NAME}..."
  aws iam update-assume-role-policy \
    --role-name "${ROLE_NAME}" \
    --policy-document "${TRUST_POLICY}"
else
  echo "Creating IAM role ${ROLE_NAME}..."
  aws iam create-role \
    --role-name "${ROLE_NAME}" \
    --assume-role-policy-document "${TRUST_POLICY}" \
    --description "GitHub Actions deploy role for Sezcuin SST (production)"
fi

aws iam attach-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-arn "${POLICY_ARN}" 2>/dev/null || true

# SST needs IAM role management for Lambda execution roles.
aws iam attach-role-policy \
  --role-name "${ROLE_NAME}" \
  --policy-arn "arn:aws:iam::aws:policy/IAMFullAccess" 2>/dev/null || true

echo ""
echo "Done. Add this secret to GitHub (Settings → Secrets → Actions):"
echo "  AWS_DEPLOY_ROLE_ARN=${ROLE_ARN}"
echo ""
echo "Or run:"
echo "  gh secret set AWS_DEPLOY_ROLE_ARN --body \"${ROLE_ARN}\""
echo ""
echo "Create a GitHub Environment named 'production' (Settings → Environments)."
echo "Add these GitHub Actions secrets (Settings → Secrets → Actions):"
echo "  AWS_DEPLOY_ROLE_ARN=${ROLE_ARN}"
echo "  POSTGRES_PASSWORD=<rds password>"
echo "  JWT_SECRET=<random secret>"
echo "  SES_SENDER_EMAIL=<verified ses email>"
echo "  SEED_ADMIN_EMAIL=<admin login email>"
echo "  SEED_ADMIN_PASSWORD=<admin login password>"
echo "  SEED_ADMIN_FIRST_NAME=Admin"
echo "  SEED_ADMIN_LAST_NAME=User"
echo ""
echo "CD syncs these into SST before each deploy (scripts/sync-sst-secrets.sh)."
