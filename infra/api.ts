import { postgres, vpc } from "./database";
import { sesPermissions } from "./email";
import { jwtSecret, sesSenderEmail } from "./secrets";

const backendDependencies = [
  "@aws-sdk/client-sesv2",
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

export const api = new sst.aws.ApiGatewayV2("Api", {
  cors: {
    allowOrigins: ["*"],
    allowMethods: ["*"],
    allowHeaders: ["*"],
  },
});

export function attachApiRoutes(frontendUrl: $util.Input<string>) {
  api.route("$default", {
    handler: "backend/src/lambda.handler",
    timeout: "30 seconds",
    memory: "1024 MB",
    vpc,
    link: [postgres],
    permissions: sesPermissions,
    environment: {
      NODE_ENV: "production",
      JWT_SECRET: jwtSecret.value,
      FRONTEND_URL: frontendUrl,
      POSTGRES_HOST: postgres.host,
      POSTGRES_PORT: postgres.port.apply((port) => String(port)),
      POSTGRES_USER: postgres.username,
      POSTGRES_PASSWORD: postgres.password,
      POSTGRES_DB: postgres.database,
      POSTGRES_SSL: "true",
      MAIL_PROVIDER: "ses",
      MAIL_FROM: sesSenderEmail.value,
    },
    nodejs: {
      format: "cjs" as const,
      install: backendDependencies,
      esbuild: {
        external: ["@nestjs/microservices", "@nestjs/websockets"],
      },
    },
  });
}
