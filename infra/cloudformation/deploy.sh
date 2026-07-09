#!/usr/bin/env bash
#
# One-shot bootstrap for the Sezcuin AWS environment. Provisions every stack in
# dependency order and pushes the initial container images. After the first run
# the GitHub Actions CD pipeline owns subsequent deployments.
#
# Usage:
#   AWS_REGION=us-east-1 GITHUB_ORG=Randipa GITHUB_REPO=Sezcuin ./deploy.sh
#
set -euo pipefail

PROJECT_NAME="${PROJECT_NAME:-sezcuin}"
AWS_REGION="${AWS_REGION:-us-east-1}"
GITHUB_ORG="${GITHUB_ORG:-Randipa}"
GITHUB_REPO="${GITHUB_REPO:-Sezcuin}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "${REPO_ROOT}" rev-parse --short HEAD)}"

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$1"; }

deploy_stack() {
  local stack_suffix="$1" template="$2"
  shift 2
  log "Deploying ${PROJECT_NAME}-${stack_suffix}"
  aws cloudformation deploy \
    --region "${AWS_REGION}" \
    --stack-name "${PROJECT_NAME}-${stack_suffix}" \
    --template-file "${SCRIPT_DIR}/${template}" \
    --capabilities CAPABILITY_NAMED_IAM \
    --no-fail-on-empty-changeset \
    --parameter-overrides "ProjectName=${PROJECT_NAME}" "$@"
}

stack_output() {
  local stack_suffix="$1" key="$2"
  aws cloudformation describe-stacks \
    --region "${AWS_REGION}" \
    --stack-name "${PROJECT_NAME}-${stack_suffix}" \
    --query "Stacks[0].Outputs[?OutputKey=='${key}'].OutputValue" \
    --output text
}

AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

deploy_stack "cicd" "00-cicd.yaml" \
  "GitHubOrg=${GITHUB_ORG}" "GitHubRepo=${GITHUB_REPO}"

deploy_stack "network" "01-network.yaml"
deploy_stack "ecr" "02-ecr.yaml"

log "Authenticating Docker with ECR"
aws ecr get-login-password --region "${AWS_REGION}" \
  | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

BACKEND_IMAGE="${ECR_REGISTRY}/${PROJECT_NAME}/backend:${IMAGE_TAG}"
FRONTEND_IMAGE="${ECR_REGISTRY}/${PROJECT_NAME}/frontend:${IMAGE_TAG}"

build_and_push() {
  local repo="$1" context="$2" image="$3"
  if aws ecr describe-images --region "${AWS_REGION}" \
      --repository-name "${PROJECT_NAME}/${repo}" \
      --image-ids imageTag="${IMAGE_TAG}" >/dev/null 2>&1; then
    log "Image ${image} already exists, reusing."
    return
  fi
  log "Building and pushing ${repo} image (${IMAGE_TAG})"
  docker build --platform linux/amd64 -t "${image}" "${context}"
  docker push "${image}"
}

build_and_push backend "${REPO_ROOT}/backend" "${BACKEND_IMAGE}"
build_and_push frontend "${REPO_ROOT}/frontend" "${FRONTEND_IMAGE}"

deploy_stack "data" "03-data.yaml"

deploy_stack "service" "04-service.yaml" \
  "BackendImage=${BACKEND_IMAGE}" "FrontendImage=${FRONTEND_IMAGE}"

log "Done. Application URL:"
stack_output "service" "ApplicationUrl"

cat <<EOF

Next steps:
  1. Add the deploy role ARN to GitHub as the AWS_DEPLOY_ROLE_ARN variable:
       $(stack_output "cicd" "DeployRoleArn")
  2. Seed the first admin account (one-off ECS task) - see infra/cloudformation/README.md.
EOF
