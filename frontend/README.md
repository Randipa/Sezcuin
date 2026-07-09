# Sezcuin Admin Frontend

A responsive admin console for user and role management, built with Next.js (App Router), TypeScript, Ant Design, and Tailwind CSS against the NestJS API.

**Backend setup:** [../backend/README.md](../backend/README.md)

## Features

- Email/password login backed by the backend's JWT-based `/auth/login` endpoint.
- User management: search, view, create, edit, activate/deactivate, and delete accounts.
- Role management: search, view, create, edit, and delete roles, with a grouped permission picker.
- Permission-driven UI: navigation, buttons, and actions are shown or hidden based on the signed-in user's permissions (`user:*`, `role:*`). The backend's guards remain the actual authorization boundary.
- Fully responsive: the sidebar collapses into an off-canvas drawer, and drawers go full-width, below the `lg` breakpoint.

## Prerequisites

- Node.js 20+
- The backend API running locally (see `../backend/README.md`), by default on `http://localhost:3000`.

## Getting started

```bash
npm install
npm run dev
```

The app runs on **http://localhost:3002** (the backend's CORS configuration only allows this origin).

Copy `.env.local` (already present for local dev) and adjust if your API runs elsewhere:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## Signing in

The backend has no public sign-up route by design (all user/role management is admin-only). Bootstrap an admin account by running the seed script in `../backend`:

```bash
cd ../backend
npm run seed
```

This creates an `ADMIN` role with full permissions and an admin account (`admin@sezcuin.com` by default - see the backend README for how to override the email/password via environment variables).

## Available scripts

- `npm run dev` - start the dev server on port 3002.
- `npm run build` - production build.
- `npm run start` - run the production build on port 3002.
- `npm run lint` - ESLint (includes Prettier formatting rules).
- `npm run format` - format the codebase with Prettier.

## Project structure

```
src/
  app/                 Routes (App Router). (dashboard) is a route group for authenticated pages.
  components/
    common/            Reusable CRUD building blocks: DataTable, FormDrawer, DetailDrawer, Can.
    layout/            App shell: sidebar, header, responsive navigation.
  features/
    auth/              Auth store (Zustand), login API call, session types.
    users/, roles/      Per-feature API calls, React Query hooks, and drawer components.
  lib/                 Axios client, permission catalog, JWT decoding, shared constants.
  proxy.ts             Optimistic, cookie-presence-only route protection (Next.js 16's proxy/middleware file).
```
