# Sezcuin 

A full-stack admin console for managing users and roles with JWT authentication and permission-based access control.

## SYESTEM DESIGN

## High Level Architecture

<img width="1257" height="641" alt="High Level Architecture drawio" src="https://github.com/user-attachments/assets/37f4ad98-3732-49bf-8643-e973c849dbdb" />


## Back-end Architecture

<img width="1201" height="961" alt="Backend Architecture drawio" src="https://github.com/user-attachments/assets/cd061edd-817b-4f8c-a9d8-f0e273dbbc78" />



## Front-end Architecture


<img width="942" height="961" alt="Frontend Architecture drawio" src="https://github.com/user-attachments/assets/d63e6921-a6b5-4a68-a029-ae0567c3a8a4" />


## Database Architecture

https://dbdiagram.io/d/6a543c314ac62e474c8ab452




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

## Local URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3002 |
| Backend API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |

