const jwtSecret = new sst.Secret("JwtSecret", "change-me-dev-only");
const postgresHost = new sst.Secret("PostgresHost", "127.0.0.1");
const postgresUser = new sst.Secret("PostgresUser", "postgres");
const postgresPassword = new sst.Secret("PostgresPassword", "");
const postgresDb = new sst.Secret("PostgresDb", "sezcuin");

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
  "@vendia/serverless-express",
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

const apiHandler = {
  handler: "backend/src/lambda.handler",
  timeout: "30 seconds" as const,
  memory: "1024 MB" as const,
  environment: {
    NODE_ENV: "production",
    JWT_SECRET: jwtSecret.value,
    FRONTEND_URL: "http://localhost:3002",
    POSTGRES_HOST: postgresHost.value,
    POSTGRES_PORT: "5432",
    POSTGRES_USER: postgresUser.value,
    POSTGRES_PASSWORD: postgresPassword.value,
    POSTGRES_DB: postgresDb.value,
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "587",
    SMTP_USER: "",
    SMTP_PASS: "",
    MAIL_FROM: "Sezcuin <noreply@example.com>",
  },
  nodejs: {
    install: backendDependencies,
    esbuild: {
      external: ["@nestjs/microservices", "@nestjs/websockets"],
    },
  },
};

export const api = new sst.aws.ApiGatewayV2("Api", {
  cors: {
    allowOrigins: ["*"],
    allowMethods: ["*"],
    allowHeaders: ["*"],
  },
});

api.route("$default", apiHandler);
