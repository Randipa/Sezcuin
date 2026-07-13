import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Express } from 'express';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './core/filters/http-exception.filter';

export async function createNestApp(
  expressApp: Express,
): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sezcuin API')
    .setDescription('The Sezcuin API description')
    .setVersion('1.0')
    .addTag('sezcuin')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const frontendUrl =
    configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3002';

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.init();
  return app;
}
