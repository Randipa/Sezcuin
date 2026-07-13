import express from 'express';
import { ConfigService } from '@nestjs/config';
import { createNestApp } from './app.factory';

async function bootstrap() {
  const expressApp = express();
  const app = await createNestApp(expressApp);
  const configService = app.get(ConfigService);

  await app.listen(configService.get<number>('PORT') ?? 3000);
}

bootstrap().catch((err) => {
  console.error('Error starting the application:', err);
});
