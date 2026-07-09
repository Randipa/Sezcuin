# Sezcuin AWS Infrastructure (CloudFormation)

Infrastructure-as-Code for running Sezcuin on AWS with ECS Fargate, ECR, an
Application Load Balancer, private subnets, and security-group firewalling.

## Architecture

```
Internet
   │  HTTP :80
[ Application Load Balancer ]  (public subnets, 2 AZs)
   ├── /api, /api/*  → backend  target group  → NestJS  (Fargate, private subnet)
   └── default (/*)  → frontend target group  → Next.js (Fargate, private subnet)
                                                    │
                                     postgres.sezcuin.local (Cloud Map)
                                                    │
                                       PostgreSQL (Fargate, private subnet)
                                                    │
                                        EFS (encrypted, durable storage)

Secrets Manager: DB password + JWT signing key   ·   CloudWatch Logs per service
Security groups: ALB ← internet · app ← ALB only · postgres ← app only · EFS ← postgres only
```

## Stacks

| Stack | File | Purpose |
|-------|------|---------|
| `sezcuin-cicd` | `00-cicd.yaml` | GitHub OIDC provider + keyless deploy role |
| `sezcuin-network` | `01-network.yaml` | VPC, subnets, NAT, ECS cluster, Cloud Map |
| `sezcuin-ecr` | `02-ecr.yaml` | ECR repositories |
| `sezcuin-data` | `03-data.yaml` | Secrets, EFS, PostgreSQL Fargate service |
| `sezcuin-service` | `04-service.yaml` | ALB, security groups, backend/frontend services |

## First-time bootstrap

Requires the AWS CLI (authenticated) and Docker locally.

```bash
cd infra/cloudformation
AWS_REGION=us-east-1 GITHUB_ORG=Randipa GITHUB_REPO=Sezcuin ./deploy.sh
```

The script deploys every stack in order, builds and pushes the first images, and
prints the public application URL plus the deploy-role ARN.

## Wire up continuous deployment

1. In **GitHub → Settings → Secrets and variables → Actions → Variables**, add:
   - `AWS_DEPLOY_ROLE_ARN` — the `DeployRoleArn` output from the `sezcuin-cicd` stack.
   - `AWS_REGION` — e.g. `us-east-1` (optional; defaults to `us-east-1`).
2. (Optional, for seeding) add repository **Secrets**:
   - `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`.

After that, every push to `main` that passes **CI** triggers the **CD** workflow,
which builds SHA-tagged images, reconciles the infra stacks, and redeploys the
service stack with the new images.

## Seed the first admin account

CloudFormation cannot create the initial admin (there is no public sign-up). Run
the one-off seed task once after the first deploy — either from the **CD**
workflow (`Run workflow` → enable *run_seed*) or locally:

```bash
CLUSTER=$(aws cloudformation describe-stacks --stack-name sezcuin-network \
  --query "Stacks[0].Outputs[?OutputKey=='ClusterName'].OutputValue" --output text)
# ...supply private subnets + the app security group, then:
aws ecs run-task --cluster "$CLUSTER" --launch-type FARGATE \
  --task-definition sezcuin-backend \
  --network-configuration 'awsvpcConfiguration={subnets=[SUBNET1,SUBNET2],securityGroups=[APP_SG],assignPublicIp=DISABLED}' \
  --overrides '{"containerOverrides":[{"name":"backend","command":["node","dist/seed.js"],"environment":[{"name":"SEED_ADMIN_EMAIL","value":"admin@sezcuin.com"},{"name":"SEED_ADMIN_PASSWORD","value":"<strong-password>"}]}]}'
```

## Notes & trade-offs

- **PostgreSQL runs as a Fargate container on EFS** (chosen for cost). It is
  durable across restarts but single-instance. For production-grade durability,
  failover, and backups, migrate to Amazon RDS (swap the `03-data.yaml` data
  service for an `AWS::RDS::DBInstance`; the backend env contract stays the same).
- **TypeORM `synchronize: true`** auto-manages the schema. It is convenient for a
  first deploy but risky long-term (it can alter/drop columns). Switch to
  explicit migrations before real production traffic.
- **HTTP only.** Add an ACM certificate and a `:443` HTTPS listener (redirect
  `:80` → `:443`) once a domain is available.
- **Single NAT gateway** keeps cost down; add one NAT per AZ for high availability.
