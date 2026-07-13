# Sezcuin 

A NestJS + TypeORM + PostgreSQL backend providing JWT authentication, permission-based access control, and user/role management for the Sezcuin Admin frontend. New users are onboarded through email invitations rather than public sign-up.

**Frontend setup:** [../frontend/README.md](../frontend/README.md)

## Features

- Email/password login issuing a 1-hour JWT that carries the user's role and permissions.
- Invite-based onboarding: an admin creates a user, who receives an email invite, accepts it, and is forced to set a password on first sign-in.
- User management (list/create/update/delete) protected by granular permissions (`user:read | create | update | delete`).
- Role management (list/create/update/delete) protected the same way (`role:read | create | update | delete`), where a role owns an array of permission strings.
- A global exception filter that normalizes all error responses to a consistent JSON shape.

> Authorization is **permission-based**, not role-name-based. Roles are simply named collections of permission strings, and every protected route declares the exact permissions it requires.

## Prerequisites

- Node.js 20+
- PostgreSQL (a `docker-compose.yml` is provided for local development)
- A Gmail account with an App Password if you want invitation emails to be delivered (see [Gmail SMTP setup](#gmail-smtp-setup))

## Getting started

```bash
npm install
cp .env.example .env    # then fill in the values (see below)
docker compose up -d    # starts Postgres
npm run seed            # create the ADMIN/USER roles + first admin account
npm run start:dev       # http://localhost:3000
```

All REST routes are served under the `/api` prefix (e.g. `/api/auth/login`). Interactive Swagger docs live at [`/docs`](http://localhost:3000/docs).

CORS is restricted to the frontend origin defined by `FRONTEND_URL` (defaults to `http://localhost:3002`). The HTTP port can be overridden with `PORT` (defaults to `3000`).

## Environment variables

Copy `.env.example` to `.env` and fill in the values.

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
POSTGRES_DB=sezcuin

# Auth
JWT_SECRET=change-me

# Seed admin (npm run seed)
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_FIRST_NAME=
SEED_ADMIN_LAST_NAME=

# Frontend URL (CORS origin + base for invitation links)
FRONTEND_URL=http://localhost:3002

# Gmail SMTP (invitation emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=Sezcuin <your-email@gmail.com>
```

| Variable | Required | Description |
| --- | --- | --- |
| `POSTGRES_HOST` / `POSTGRES_PORT` / `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Yes | PostgreSQL connection settings. |
| `JWT_SECRET` | Yes | Secret used to sign and verify JWTs. Use a long, random value. |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Yes (for `npm run seed`) | Credentials for the bootstrap admin account. |
| `SEED_ADMIN_FIRST_NAME` / `SEED_ADMIN_LAST_NAME` | No | Optional display name for the seeded admin (defaults to `System` / `Administrator`). |
| `FRONTEND_URL` | Yes | Allowed CORS origin and the base URL used to build invitation links. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | No | SMTP transport for invitation emails. If unset, the invite link is logged to the console instead of being emailed. |
| `MAIL_FROM` | No | The `From` header for invitation emails. Falls back to `SMTP_USER`. |
| `PORT` | No | HTTP port to listen on (defaults to `3000`). |

## Gmail SMTP setup

Invitation emails are sent through Gmail's SMTP server. Gmail does **not** accept your normal account password over SMTP — you must generate a dedicated **App Password**.

1. Enable 2-Step Verification on the Google account: <https://myaccount.google.com/security>.
2. Create an App Password: <https://myaccount.google.com/apppasswords> (select "Mail" as the app). Google returns a 16-character password.
3. Put the values in `.env`:

   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587                 # 587 = STARTTLS, 465 = implicit SSL
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   MAIL_FROM=Sezcuin <your-email@gmail.com>
   ```

Notes:

- The transporter uses TLS automatically: port `465` connects over SSL, any other port (e.g. `587`) upgrades via STARTTLS.
- **SMTP is optional for local development.** If `SMTP_HOST`, `SMTP_USER`, or `SMTP_PASS` are missing, user creation still succeeds and the invite link is written to the server log so you can open it manually.
- Never commit real App Passwords — keep them in `.env` (which is git-ignored).

## User onboarding & invitations

There is no public sign-up. New users are added by an admin and invited by email:

1. An admin calls `POST /api/users/register` (requires `user:create`).
2. The backend creates the user with a hashed, single-use invite token (valid for **7 days**) and emails a link: `{FRONTEND_URL}/invite?token=...`.
3. The invitee opens the link; the frontend calls `POST /api/auth/accept-invite`, which validates the token and returns a JWT with `mustChangePassword: true`.
4. The user is prompted to set a password via `POST /api/auth/change-password`, which clears the flag.

## Bootstrapping the first admin account

Because user and role management is permission-gated and there is no public sign-up, the very first `ADMIN` role and account can't be created through the API. Run the idempotent seed script instead:

```bash
npm run seed
```

It creates the `ADMIN` role (all permissions) and a `USER` role (no permissions), then creates the admin account from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`. It is safe to re-run — it only creates what's missing and syncs the admin password from the environment.

## API overview

All routes are prefixed with `/api`.

| Method | Path | Access |
| --- | --- | --- |
| `POST` | `/auth/login` | Public |
| `POST` | `/auth/accept-invite` | Public |
| `POST` | `/auth/change-password` | Authenticated |
| `POST` | `/users/register` | `user:create` |
| `GET` | `/users` | `user:read` |
| `GET` | `/users/:id` | `user:read` |
| `PATCH` | `/users/:id` | `user:update` |
| `DELETE` | `/users/:id` | `user:delete` |
| `POST` | `/roles` | `role:create` |
| `GET` | `/roles` | `role:read` |
| `GET` | `/roles/:id` | `role:read` |
| `PATCH` | `/roles/:id` | `role:update` |
| `DELETE` | `/roles/:id` | `role:delete` |

## Available scripts

```bash
npm run start:dev     # watch mode
npm run start:prod    # run the compiled build
npm run build         # compile to dist/
npm run seed          # bootstrap ADMIN/USER roles + admin account
npm run lint          # ESLint (includes Prettier formatting rules)
npm run test          # unit tests
npm run test:e2e      # e2e tests
```

## Project structure

```
src/
  auth/       Login, invite acceptance, password change, JWT strategy/signing
  users/      User & password entities, DTOs, controller, service
  roles/      Role entity, DTOs, controller, service
  mail/       Nodemailer-based invitation email service
  core/       Guards (JWT/Permissions), decorators, global exception filter, DB module
  seed.ts     Idempotent bootstrap script for roles + first admin
```
