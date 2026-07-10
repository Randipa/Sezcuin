# AWS Deploy — ECS + ECR (no EC2)

**ECS Fargate** runs containers. **ECR** stores Docker images. **Git push = auto deploy.**

```
GitHub → build → ECR → ECS Fargate
                         ├── backend (NestJS)
                         ├── frontend (Next.js)
                         └── RDS PostgreSQL
              ALB routes /api* → backend, /* → frontend
```

**Cost:** ~$45/month (ECS + ALB + RDS)

---

## No local AWS CLI? (browser only)

You do **not** need AWS CLI on your laptop. Two options:

### Option A — GitHub Actions only (easiest)

1. AWS Console (browser) → IAM → create user → access key
2. GitHub repo → **Settings → Secrets → Actions** → add:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` = `ap-south-1`
3. GitHub → **Actions → Bootstrap AWS (ECS + ECR) → Run workflow**
   - Enter DB password, JWT secret, admin password when prompted
4. GitHub → **Actions → Deploy to AWS ECS → Run workflow** (or push to `main`)

Done — everything runs in the cloud / GitHub. No local CLI.

### Option B — AWS CloudShell (browser terminal)

1. AWS Console → click **CloudShell** icon (top bar)
2. CloudShell has AWS CLI pre-installed
3. Clone repo and run `./infra/bootstrap.sh`

---

## Setup with local AWS CLI (optional)

### Step 1 — Bootstrap AWS infrastructure

```bash
aws configure
chmod +x infra/bootstrap.sh
./infra/bootstrap.sh
```

Creates: VPC, ECS cluster, ECR repos, ALB, RDS PostgreSQL, Secrets Manager.

Save the **App URL** and admin password from the script output.

### Step 2 — GitHub Secrets

| Secret | Value |
|--------|-------|
| `AWS_ACCESS_KEY_ID` | IAM user key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret |
| `AWS_REGION` | `ap-south-1` |

IAM policy: `infra/iam/deploy-user-policy.json`

---

## Auto deploy

Push to `main` → GitHub Actions:
1. Build Docker images → push **ECR**
2. Update **ECS** services (rolling deploy)
3. Run admin seed task

Manual: **Actions → Deploy to AWS ECS → Run workflow**

---

## Login

- **URL:** `AppUrl` from bootstrap (e.g. `http://sezcuin-test-alb-xxx.elb.amazonaws.com`)
- **Email:** `admin@sezcuin.com`
- **Password:** from bootstrap output

---

## Tear down

```bash
aws cloudformation delete-stack --stack-name sezcuin-test --region ap-south-1
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| ECS tasks not starting | Push to main to trigger deploy (images must be in ECR first) |
| Target group unhealthy | Check CloudWatch logs: `/ecs/sezcuin-test/backend` |
| Login fails | Re-run GitHub Action (seed runs each deploy) |
