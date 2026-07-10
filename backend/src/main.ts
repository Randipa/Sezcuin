import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './core/filters/http-exception.filter';
import { SwaggerModule } from 'node_modules/@nestjs/swagger/dist/swagger-module';
import { DocumentBuilder } from 'node_modules/@nestjs/swagger/dist/document-builder';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Sezcuin API')
    .setDescription('The Sezcuin API description')
    .setVersion('1.0')
    .addTag('sezcuin')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const frontendUrl =
    configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3002';

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.listen(configService.get<number>('PORT') ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
});
