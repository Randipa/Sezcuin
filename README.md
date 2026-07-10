# Sezcuin Admin

A full-stack admin console for managing users and roles with JWT authentication and permission-based access control.

| Part | Stack |
|------|-------|
| Backend | NestJS, TypeORM, PostgreSQL |
| Frontend | Next.js, TypeScript, Ant Design |

## Quick start

1. Set up and run the **backend** (API + database + seed).
2. Set up and run the **frontend** (admin UI).

Detailed instructions live in each package's README:

- **[Backend setup →](./backend/README.md)** — API, PostgreSQL, `.env`, and first admin seed
- **[Frontend setup →](./frontend/README.md)** — Next.js app, login, and local dev
- **[AWS deploy (ECS + ECR) →](./infra/README.md)** — auto deploy on git push

## Local URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3002 |
| Backend API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |
