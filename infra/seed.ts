import { postgres, vpc } from "./database";
import {
  jwtSecret,
  seedAdminEmail,
  seedAdminFirstName,
  seedAdminLastName,
  seedAdminPassword,
} from "./secrets";

const backendDependencies = [
  "@nestjs/common",
  "@nestjs/config",
  "@nestjs/core",
  "@nestjs/jwt",
  "@nestjs/mapped-types",
  "@nestjs/passport",
  "@nestjs/platform-express",
  "@nestjs/swagger",
  "@nestjs/typeorm",
  "bcryptjs",
  "class-transformer",
  "class-validator",
  "express",
  "nodemailer",
  "passport",
  "passport-jwt",
  "pg",
  "reflect-metadata",
  "rxjs",
  "swagger-ui-express",
  "typeorm",
];

export const seed = new sst.aws.Function("Seed", {
  handler: "backend/src/seed.lambda.handler",
  timeout: "2 minutes",
  memory: "1024 MB",
  vpc,
  link: [postgres],
  environment: {
    NODE_ENV: "production",
    JWT_SECRET: jwtSecret.value,
    POSTGRES_HOST: postgres.host,
    POSTGRES_PORT: postgres.port.apply((port) => String(port)),
    POSTGRES_USER: postgres.username,
    POSTGRES_PASSWORD: postgres.password,
    POSTGRES_DB: postgres.database,
    POSTGRES_SSL: "true",
    SEED_ADMIN_EMAIL: seedAdminEmail.value,
    SEED_ADMIN_PASSWORD: seedAdminPassword.value,
    SEED_ADMIN_FIRST_NAME: seedAdminFirstName.value,
    SEED_ADMIN_LAST_NAME: seedAdminLastName.value,
  },
  nodejs: {
    format: "cjs" as const,
    install: backendDependencies,
    esbuild: {
      external: ["@nestjs/microservices", "@nestjs/websockets"],
    },
  },
});
