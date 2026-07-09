# Sezcuin Admin API

A NestJS + TypeORM + PostgreSQL backend providing JWT authentication, role-based access control, and user/role management for the Sezcuin Admin frontend.

**Frontend setup:** [../frontend/README.md](../frontend/README.md)

## Features

- Email/password login issuing a 1-hour JWT that carries the user's role and permissions.
- User management (list/create/update/delete), guarded by role (`ADMIN`) and granular permissions (`user:read|create|update|delete`).
- Role management (list/create/update/delete), guarded the same way (`role:read|create|update|delete`), where a role owns an array of permission strings.
- A global exception filter that normalizes all error responses to a consistent JSON shape.

## Prerequisites

- Node.js 20+
- PostgreSQL (a `docker-compose.yml` is provided for local development)

## Getting started

```bash
npm install
docker compose up -d   # starts Postgres
npm run start:dev      # http://localhost:3000
```

Configure `.env` (see `.env.example`-equivalent below) before starting:

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=sezcuin
JWT_SECRET=change-me
```

CORS is restricted to `http://localhost:3002` (the frontend's dev port) in `src/main.ts`.

## Bootstrapping the first admin account

User and role management endpoints are intentionally **admin-only** - there is no public sign-up route, so the very first `ADMIN` role and account can't be created through the API. Run the idempotent seed script instead:

```bash
npm run seed
```



The script is safe to re-run - it only creates what's missing and never overwrites an existing user's password.

## Available scripts

```bash
npm run start:dev    # watch mode
npm run start:prod    # run the compiled build
npm run build         # compile to dist/
npm run seed          # bootstrap ADMIN role + account
npm run lint          # ESLint (includes Prettier formatting rules)
npm run test          # unit tests
npm run test:e2e      # e2e tests
```

## Project structure

```
src/
  auth/       Login endpoint, JWT strategy/signing, auth service
  users/      User entity, DTOs, controller, service
  roles/      Role entity, DTOs, controller, service
  core/       Guards (JWT/Roles/Permissions), decorators, global exception filter, DB module
  seed.ts     One-off script 
```
